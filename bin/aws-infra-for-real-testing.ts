#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import * as dotenv from 'dotenv';

dotenv.config();
import { SnsStack } from '../lib/sns-stack';
import { SqsStack } from '../lib/sqs-stack';
import { DynamoStack } from '../lib/dynamo-stack';
import { S3Stack } from '../lib/s3-stack';
import { OpenSearchStack } from '../lib/opensearch-stack';
import { SnsSqsLambdaStack } from '../lib/sns-sqs-lambda-stack';
import { ApiStack } from '../lib/api-stack';
import { HttpApiStack } from '../lib/http-api-stack';
import { SearchSyncStack } from '../lib/search-sync-stack';
import { EventBridgeStack } from '../lib/eventbridge-stack';


const app = new cdk.App();
const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION
};

// Original boilerplate stack might be present, we can ignore or delete it.
// e.g. AwsInfraForRealTestingStack

new SnsStack(app, 'VitkuzTestingSnsStack', { env, stackName: 'vitkuz-testing-sns' });
new SqsStack(app, 'VitkuzTestingSqsStack', { env, stackName: 'vitkuz-testing-sqs' });
new DynamoStack(app, 'VitkuzTestingDynamoStack', { env, stackName: 'vitkuz-testing-dynamo' });
new S3Stack(app, 'VitkuzTestingS3Stack', { env, stackName: 'vitkuz-testing-s3' });
new OpenSearchStack(app, 'VitkuzTestingOpenSearchStack', { env, stackName: 'vitkuz-testing-opensearch' });
new SnsSqsLambdaStack(app, 'VitkuzTestingSnsSqsStack', { env, stackName: 'vitkuz-testing-sns-sqs' });
new ApiStack(app, 'VitkuzTestingApiStack', { env, stackName: 'vitkuz-testing-api' });
new HttpApiStack(app, 'VitkuzTestingHttpApiStack', { env, stackName: 'vitkuz-testing-http-api' });
new SearchSyncStack(app, 'VitkuzTestingSearchSyncStack', { env, stackName: 'vitkuz-testing-search-sync' });
new EventBridgeStack(app, 'VitkuzTestingEventBridgeStack', {
  env,
  stackName: 'vitkuz-testing-eventbridge',
  projectName: 'vitkuz',
  envName: 'test'
});

