#!/usr/bin/env node

const cdk = require("@aws-cdk/core");
const { StaticWebsiteStack } = require("../lib/static-website-stack");

const app = new cdk.App();
new StaticWebsiteStack(app, "StaticWebsiteStack", {
  env: {
    account: process.env.ACCOUNT_ID,
    region: process.env.REGION
  }
});
