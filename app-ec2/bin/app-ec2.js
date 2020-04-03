#!/usr/bin/env node

const cdk = require("@aws-cdk/core");
const { AppEc2Stack } = require("../lib/app-ec2-stack");

const app = new cdk.App();
new AppEc2Stack(app, "AppEc2Stack", {
  env: {
    account: process.env.ACCOUNT_ID,
    region: process.env.REGION
  }
});
