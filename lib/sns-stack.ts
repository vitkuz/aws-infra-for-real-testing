import * as cdk from 'aws-cdk-lib';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as logs from 'aws-cdk-lib/aws-logs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import * as path from 'path';

export class SnsStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // 1. Create SNS Topic
        const topic = new sns.Topic(this, 'TestTopic', {
            displayName: 'Vitkuz Test Topic'
        });

        // 2. Create Lambda Function
        const handler = new NodejsFunction(this, 'SnsHandler', {
            runtime: lambda.Runtime.NODEJS_20_X,
            entry: path.join(__dirname, '../handlers/sns.ts'),
            handler: 'handler',
            logRetention: logs.RetentionDays.ONE_DAY,
            environment: {
                TOPIC_ARN: topic.topicArn,
                LOG_LEVEL: 'debug'
            },
            bundling: {
                externalModules: ['aws-sdk'],
            }
        });

        // 3. Add SNS Event Source
        // We need to import SnsEventSource from aws-lambda-event-sources
        const { SnsEventSource } = require('aws-cdk-lib/aws-lambda-event-sources');
        handler.addEventSource(new SnsEventSource(topic));

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
