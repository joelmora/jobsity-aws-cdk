#!/usr/bin/env node

const cdk = require("@aws-cdk/core");
const { ApiLambdasStack } = require("../lib/api-lambdas-stack");

const app = new cdk.App();
new ApiLambdasStack(app, "ApiLambdasStack", {
  env: {
    account: process.env.ACCOUNT_ID,
    region: process.env.REGION
  }
});
