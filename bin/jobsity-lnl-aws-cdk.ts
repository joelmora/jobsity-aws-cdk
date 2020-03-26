#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { JobsityLnlAwsCdkStack } from '../lib/jobsity-lnl-aws-cdk-stack';

const app = new cdk.App();
new JobsityLnlAwsCdkStack(app, 'JobsityLnlAwsCdkStack');
