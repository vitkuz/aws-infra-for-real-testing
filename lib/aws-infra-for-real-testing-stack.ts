import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as subs from 'aws-cdk-lib/aws-sns-subscriptions';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaEventSources from 'aws-cdk-lib/aws-lambda-event-sources';
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as path from 'path';

export class AwsInfraForRealTestingStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // 1. Create SNS Topic
    const topic = new sns.Topic(this, 'SnsTopic', {
      displayName: 'Integration Test Topic'
    });

    // 2. Create Lambda Function
    const handler = new nodejs.NodejsFunction(this, 'SnsHandler', {
      runtime: lambda.Runtime.NODEJS_20_X,
      entry: path.join(__dirname, '../handlers/sns.ts'),
      handler: 'handler',
      environment: {
        TOPIC_ARN: topic.topicArn, // Handlers might find this useful, though not strictly needed for consumer
        LOG_LEVEL: 'debug'
      }
    });

    // 3. Add SNS Event Source
    handler.addEventSource(new lambdaEventSources.SnsEventSource(topic));

    // 4. Outputs for Test Discovery
    new cdk.CfnOutput(this, 'SnsTopicArn', {
      value: topic.topicArn,
      description: 'The ARN of the SNS Topic',
      exportName: 'IntegrationTestTopicArn'
    });

    new cdk.CfnOutput(this, 'SnsHandlerLogGroup', {
      value: handler.logGroup.logGroupName,
      description: 'Log Group for SNS Handler'
    });
  }
}
