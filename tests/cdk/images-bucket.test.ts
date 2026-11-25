import { beforeAll, describe, expect, it } from "vitest";
import { App, Stack } from "aws-cdk-lib";
import { Match, Template } from "aws-cdk-lib/assertions";
import { createImagesBucket } from "@/cdk/images-bucket";
import cdkConfig from "@/cdk.json";

// Synthesise once: the first synth loads aws-cdk-lib and takes several seconds.
let template: Template;
beforeAll(() => {
  const stack = new Stack(new App(), "TestStack");
  createImagesBucket(stack, "NextjsS3Bucket");
  template = Template.fromStack(stack);
}, 60_000);

const synth = () => ({ template });

describe("images bucket", () => {
  it("blocks all public access and encrypts objects", () => {
    synth().template.hasResourceProperties("AWS::S3::Bucket", {
      PublicAccessBlockConfiguration: {
        BlockPublicAcls: true,
        BlockPublicPolicy: true,
        IgnorePublicAcls: true,
        RestrictPublicBuckets: true,
      },
      BucketEncryption: {
        ServerSideEncryptionConfiguration: [
          { ServerSideEncryptionByDefault: { SSEAlgorithm: "AES256" } },
        ],
      },
      VersioningConfiguration: { Status: "Enabled" },
    });
  });

  it("has no fixed name, so a leftover bucket can't block a fresh deploy", () => {
    const buckets = synth().template.findResources("AWS::S3::Bucket");
    for (const bucket of Object.values(buckets)) {
      expect(bucket.Properties).not.toHaveProperty("BucketName");
    }
  });

  it("only allows CORS from known origins (no wildcard)", () => {
    synth().template.hasResourceProperties("AWS::S3::Bucket", {
      CorsConfiguration: {
        CorsRules: [Match.objectLike({ AllowedOrigins: Match.arrayEquals(["http://localhost:3000"]) })],
      },
    });
  });

  it("uses the origins it's given, so the deployed site can upload", () => {
    const stack = new Stack(new App(), "OriginsStack");
    createImagesBucket(stack, "NextjsS3Bucket", ["http://localhost:3000", "https://example.cloudfront.net"]);
    Template.fromStack(stack).hasResourceProperties("AWS::S3::Bucket", {
      CorsConfiguration: {
        CorsRules: [Match.objectLike({ AllowedOrigins: Match.arrayEquals(["http://localhost:3000", "https://example.cloudfront.net"]) })],
      },
    });
  });

  it.each(["*", "https://*.cloudfront.net", "https://example.com/path", "example.com"])("rejects the origin %s", (origin) => {
    const stack = new Stack(new App(), "BadOriginStack");
    expect(() => createImagesBucket(stack, "NextjsS3Bucket", [origin])).toThrow(/Invalid image upload origin/);
  });

  it("lists the deployed CloudFront site in cdk.json", () => {
    // Without the live site's origin here, browser uploads fail the S3 CORS preflight.
    const origins: string[] = cdkConfig.context.imageUploadOrigins;
    expect(origins).toContain("http://localhost:3000");
    expect(origins.some((origin) => origin.startsWith("https://") && origin.endsWith(".cloudfront.net"))).toBe(true);
  });

  it("keeps the logical ID of the deployed bucket", () => {
    // Changing this ID makes CloudFormation replace the live bucket (and delete its images).
    const ids = Object.keys(synth().template.findResources("AWS::S3::Bucket"));
    expect(ids).toEqual(["NextjsS3BucketF48AB459"]);
  });
});
