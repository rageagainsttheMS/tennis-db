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
export function createImagesBucket(scope: Construct, id: string): Bucket {
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
      allowedOrigins: ["http://localhost:3000"], // Your local dev server
      allowedHeaders: ["*"],
    }],
  });
}
