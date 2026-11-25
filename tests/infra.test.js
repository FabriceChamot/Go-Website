const assert = require('node:assert/strict');
const { test } = require('node:test');
const cdk = require('aws-cdk-lib');
const { Template } = require('aws-cdk-lib/assertions');
const { BadukWebStack } = require('../infra/baduk-web-stack');

test('configures HTTPS with the ACM certificate and redirects HTTP', () => {
  const app = new cdk.App();
  const stack = new BadukWebStack(app, 'BadukWebStackTest', {
    env: { region: 'eu-central-1' },
  });
  const template = Template.fromStack(stack);
  const listeners = template.findResources(
    'AWS::ElasticLoadBalancingV2::Listener',
  );
  const listenerProperties = Object.values(listeners).map(
    listener => listener.Properties,
  );

  assert.ok(
    listenerProperties.some(listener =>
      listener.Port === 443
      && listener.Protocol === 'HTTPS'
      && listener.Certificates?.some(certificate =>
        Object.values(certificate.CertificateArn || {}).length > 0,
      ),
    ),
  );
  assert.ok(
    listenerProperties.some(listener =>
      listener.Port === 80
      && listener.Protocol === 'HTTP'
      && listener.DefaultActions?.some(
        action =>
          action.Type === 'redirect'
          && action.RedirectConfig?.Protocol === 'HTTPS'
          && action.RedirectConfig?.Port === '443',
      ),
    ),
  );

  template.hasOutput('WebsiteUrl', {
    Value: 'https://learn-and-play-go.dev',
  });
});
