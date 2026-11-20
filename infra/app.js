#!/usr/bin/env node

const cdk = require('aws-cdk-lib');
const { BadukWebStack } = require('./baduk-web-stack');

const app = new cdk.App();
new BadukWebStack(app, 'BadukWebStack');
