const path = require('node:path');
const cdk = require('aws-cdk-lib');
const acm = require('aws-cdk-lib/aws-certificatemanager');
const ec2 = require('aws-cdk-lib/aws-ec2');
const ecs = require('aws-cdk-lib/aws-ecs');
const ecsPatterns = require('aws-cdk-lib/aws-ecs-patterns');

const domainName = 'learn-and-play-go.dev';

class BadukWebStack extends cdk.Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    const certificateArn = new cdk.CfnParameter(this, 'CertificateArn', {
      type: 'String',
      description: 'ACM certificate ARN for the website in eu-central-1.',
      default: process.env.ACM_CERTIFICATE_ARN || undefined,
      allowedPattern:
        '^arn:aws:acm:eu-central-1:[0-9]{12}:certificate/[0-9a-fA-F-]+$',
      constraintDescription:
        'Provide an ACM certificate ARN from eu-central-1.',
    });
    const vpc = new ec2.Vpc(this, 'Vpc', {
      availabilityZones: ['eu-central-1a', 'eu-central-1b'],
      natGateways: 0,
    });
    const cluster = new ecs.Cluster(this, 'Cluster', { vpc });
    const certificate = acm.Certificate.fromCertificateArn(
      this,
      'WebsiteCertificate',
      certificateArn.valueAsString,
    );

    const service = new ecsPatterns.ApplicationLoadBalancedFargateService(
      this,
      'WebService',
      {
        cluster,
        cpu: 256,
        memoryLimitMiB: 512,
        desiredCount: 1,
        publicLoadBalancer: true,
        assignPublicIp: true,
        taskSubnets: { subnetType: ec2.SubnetType.PUBLIC },
        taskImageOptions: {
          image: ecs.ContainerImage.fromAsset(path.join(__dirname, '..')),
          containerPort: 3000,
          environment: {
            NODE_ENV: 'production',
            PORT: '3000',
          },
        },
        healthCheckGracePeriod: cdk.Duration.seconds(60),
        minHealthyPercent: 100,
        maxHealthyPercent: 200,
        circuitBreaker: { rollback: true },
        certificate,
        redirectHTTP: true,
      },
    );

    service.targetGroup.configureHealthCheck({ path: '/healthz' });
    service.loadBalancer.setAttribute('idle_timeout.timeout_seconds', '3600');

    new cdk.CfnOutput(this, 'WebsiteUrl', {
      value: `https://${domainName}`,
    });
  }
}

module.exports = { BadukWebStack };
