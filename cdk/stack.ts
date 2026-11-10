import { App, CfnOutput, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { NextjsGlobalFunctions } from "cdk-nextjs";
import { join } from "node:path";
import { createImagesBucket } from "./images-bucket";

// Since cdk-nextjs 0.7 the server is a zip Lambda with its cache in S3/DynamoDB.
// There is no EFS any more, so the function runs outside a VPC and reaches Neon
// and Google OAuth directly. The VPC and fck-nat NAT instance aren't needed.

class NextjsStack extends Stack {
  //#hostedZoneDomainName = "example.com";
  // #distributionDomainName = blog.${this.#hostedZoneDomainName};

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    // Keep the "NextjsS3Bucket" ID: changing it would replace the deployed bucket.
    const s3Bucket = createImagesBucket(this, "NextjsS3Bucket");

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

    // Used by the deploy workflow's post-deploy smoke test.
    new CfnOutput(this, "AppUrl", { value: nextjs.url });

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
