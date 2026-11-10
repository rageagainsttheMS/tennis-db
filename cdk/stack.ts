import { App, RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { NextjsGlobalFunctions } from "cdk-nextjs";
import { join } from "node:path";
import {
  Bucket,
  BucketAccessControl,
  BucketEncryption,
  BlockPublicAccess,
  HttpMethods,
} from "aws-cdk-lib/aws-s3";

// Since cdk-nextjs 0.7 the server is a zip Lambda with its cache in S3/DynamoDB.
// There is no EFS any more, so the function runs outside a VPC and reaches Neon
// and Google OAuth directly. The VPC and fck-nat NAT instance aren't needed.

class NextjsStack extends Stack {
  //#hostedZoneDomainName = "example.com";
  // #distributionDomainName = blog.${this.#hostedZoneDomainName};

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    const s3Bucket = this.#createS3Bucket();

    //const hostedZone = this.#getHostedZone();
    //const certificate = this.#getCertificate(hostedZone);

    const nextjs = new NextjsGlobalFunctions(this, "Nextjs", {
      buildDirectory: join(__dirname, ".."),
      overrides: {
        nextjsFunctions: {
          functionProps: {
            environment: {
              AWS_S3_BUCKET_NAME: s3Bucket.bucketName,
            },
          },
        },
        // nextjsDistribution: {
        //   distributionProps: {
        //     certificate,
        //     domainNames: [this.#distributionDomainName],
        //     priceClass: PriceClass.PRICE_CLASS_100,
        //   },
        // },
      },
    });

    // Grant the Next.js Lambda function read/write access to the S3 bucket
    s3Bucket.grantReadWrite(nextjs.nextjsFunctions.function);

    //this.#createDnsRecords(nextjs, hostedZone);
  }

  // #getHostedZone() {
  //   return HostedZone.fromLookup(this, "HostedZone", {
  //     domainName: this.#hostedZoneDomainName,
  //   });
  // }

  // #getCertificate(hostedZone: IHostedZone) {
  //   return new Certificate(this, "Certificate", {
  //     domainName: this.#distributionDomainName,
  //     validation: CertificateValidation.fromDns(hostedZone),
  //   });
  // }

  #createS3Bucket() {
    // No fixed bucketName: CloudFormation generates a unique one, so a bucket left behind by an
    // earlier stack can't block a fresh deploy. The app reads it from AWS_S3_BUCKET_NAME.
    const bucket = new Bucket(this, "NextjsS3Bucket", {
      encryption: BucketEncryption.S3_MANAGED,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      accessControl: BucketAccessControl.PRIVATE,
      versioned: true,
      removalPolicy: RemovalPolicy.DESTROY, // Change to RETAIN for production
      autoDeleteObjects: true, // Remove for production
      // Add CORS for local development if needed
      cors: [{
        allowedMethods: [HttpMethods.GET, HttpMethods.PUT, HttpMethods.POST],
        allowedOrigins: ['http://localhost:3000'], // Your local dev server
        allowedHeaders: ['*'],
      }]
    });

    return bucket;
  }

//   #createDnsRecords(nextjs: NextjsGlobalFunctions, hostedZone: IHostedZone) {
//     new ARecord(this, "ARecord", {
//       recordName: this.#distributionDomainName,
//       target: RecordTarget.fromAlias(
//         new CloudFrontTarget(nextjs.nextjsDistribution.distribution),
//       ),
//       zone: hostedZone,
//     });
//     new AaaaRecord(this, "AAAARecord", {
//       recordName: this.#distributionDomainName,
//       target: RecordTarget.fromAlias(
//         new CloudFrontTarget(nextjs.nextjsDistribution.distribution),
//       ),
//       zone: hostedZone,
//     });
//   }
}

const app = new App();
export const stack = new NextjsStack(app, 'nextjs', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION
  }
});
