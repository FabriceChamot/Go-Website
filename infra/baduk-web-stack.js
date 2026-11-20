const path = require('node:path');
const cdk = require('aws-cdk-lib');
const ec2 = require('aws-cdk-lib/aws-ec2');
const ecs = require('aws-cdk-lib/aws-ecs');
const ecsPatterns = require('aws-cdk-lib/aws-ecs-patterns');

class BadukWebStack extends cdk.Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, 'Vpc', {
      maxAzs: 2,
      natGateways: 0,
    });
    const cluster = new ecs.Cluster(this, 'Cluster', { vpc });

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
      },
    );

    service.targetGroup.configureHealthCheck({ path: '/healthz' });
    service.loadBalancer.setAttribute('idle_timeout.timeout_seconds', '3600');

    new cdk.CfnOutput(this, 'WebsiteUrl', {
      value: `http://${service.loadBalancer.loadBalancerDnsName}`,
    });
  }
}

module.exports = { BadukWebStack };
