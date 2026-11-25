import { RemovalPolicy } from "aws-cdk-lib";
import { Construct } from "constructs";
import {
  Bucket,
  BucketAccessControl,
  BucketEncryption,
  BlockPublicAccess,
  HttpMethods,
} from "aws-cdk-lib/aws-s3";

/**
 * Private bucket for player and tournament images. The browser uploads through presigned
 * PUT URLs, and images are shown through presigned GET URLs.
 *
 * This is a plain function, not a construct, so the bucket is created directly in `scope`.
 * Its CloudFormation logical ID stays the same as before the extraction, and the deployed
 * bucket isn't replaced. It's separate from the stack so tests can check it without a
 * Next.js build.
 */
export const DEFAULT_UPLOAD_ORIGINS = ["http://localhost:3000"];

/**
 * The browser PUTs images straight to S3, so every origin the site is served from must be
 * listed here, or the CORS preflight fails and uploads show "Upload failed".
 * Exact origins only: a wildcard would let any site use a leaked presigned URL from a browser.
 */
export function createImagesBucket(scope: Construct, id: string, allowedOrigins: string[] = DEFAULT_UPLOAD_ORIGINS): Bucket {
  for (const origin of allowedOrigins) {
    if (!/^https?:\/\/[^/*\s]+$/.test(origin)) {
      throw new Error(`Invalid image upload origin "${origin}": use a scheme and host with no path or wildcard, e.g. https://example.com`);
    }
  }

  // No fixed bucketName: CloudFormation generates a unique one, so a bucket left behind by an
  // earlier stack can't block a fresh deploy. The app reads it from AWS_S3_BUCKET_NAME.
  return new Bucket(scope, id, {
    encryption: BucketEncryption.S3_MANAGED,
    blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
    accessControl: BucketAccessControl.PRIVATE,
    versioned: true,
    removalPolicy: RemovalPolicy.DESTROY, // Change to RETAIN for production
    autoDeleteObjects: true, // Remove for production
    cors: [{
      allowedMethods: [HttpMethods.GET, HttpMethods.PUT, HttpMethods.POST],
      allowedOrigins,
      allowedHeaders: ["*"],
    }],
  });
}
