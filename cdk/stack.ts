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


class NextjsStack extends Stack {
  //#hostedZoneDomainName = "example.com";
  // #distributionDomainName = `blog.${this.#hostedZoneDomainName}`;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    const vpc = this.#createVpc();
    //const hostedZone = this.#getHostedZone();
    //const certificate = this.#getCertificate(hostedZone);
    new NextjsGlobalFunctions(this, "Nextjs", {
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
export const stack =  new NextjsStack(app, 'nextjs', {
   env: {
    account: process.env.CDK_DEFAULT_ACCOUNT, 
    region: process.env.CDK_DEFAULT_REGION
  }
});