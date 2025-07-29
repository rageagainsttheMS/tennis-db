import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { NextjsGlobalFunctions } from "cdk-nextjs";
import { App } from "aws-cdk-lib";
import { join } from "node:path";
import { FckNatInstanceProvider } from "cdk-fck-nat";
import {
  InstanceClass,
  InstanceSize,
  InstanceType,
  Peer,
  Port,
  Vpc,
} from "aws-cdk-lib/aws-ec2";
import {
  Bucket,
  BucketAccessControl,
  BucketEncryption,
  BlockPublicAccess,
  HttpMethods,
} from "aws-cdk-lib/aws-s3";
import { RemovalPolicy } from "aws-cdk-lib";

class NextjsStack extends Stack {
  //#hostedZoneDomainName = "example.com";
  // #distributionDomainName = blog.${this.#hostedZoneDomainName};

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    const vpc = this.#createVpc();
    const s3Bucket = this.#createS3Bucket();
    
    //const hostedZone = this.#getHostedZone();
    //const certificate = this.#getCertificate(hostedZone);
    
    const nextjs = new NextjsGlobalFunctions(this, "Nextjs", {
      healthCheckPath: "/api/health",
      buildContext: join(__dirname, ".."),
      overrides: {
        // nextjsDistribution: {
        //   distributionProps: {
        //     certificate,
        //     domainNames: [this.#distributionDomainName],
        //     priceClass: PriceClass.PRICE_CLASS_100,
        //   },
        // },
        nextjsGlobalFunctions: {
          nextjsVpcProps: {
            vpc,
          },
        },
      },
    });

    // Grant the Next.js Lambda functions read/write access to the S3 bucket
    this.#grantS3Access(nextjs, s3Bucket);
    
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

  #createVpc() {
    const natGatewayProvider = new FckNatInstanceProvider({
      instanceType: InstanceType.of(InstanceClass.T4G, InstanceSize.NANO),
    });
    const vpcName = this.stackName + "FckNatVpc";
    const vpc = new Vpc(this, vpcName, {
      natGatewayProvider,
      vpcName,
    });
    natGatewayProvider.securityGroup.addIngressRule(
      Peer.ipv4(vpc.vpcCidrBlock),
      Port.allTraffic(),
    );
    return vpc;
  }

  #createS3Bucket() {
    const bucket = new Bucket(this, "NextjsS3Bucket", {
      bucketName: `${this.stackName.toLowerCase()}-nextjs-bucket-${this.account}`,
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

#grantS3Access(nextjs: NextjsGlobalFunctions, bucket: Bucket) {
  if (nextjs.nextjsFunctions) {
    // Grant access to individual functions
    if (nextjs.nextjsFunctions.function) {
      bucket.grantReadWrite(nextjs.nextjsFunctions.function);
    }
  }
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