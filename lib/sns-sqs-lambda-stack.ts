import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as subs from 'aws-cdk-lib/aws-sns-subscriptions';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaEventSources from 'aws-cdk-lib/aws-lambda-event-sources';
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as path from 'path';

export class SnsSqsLambdaStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // 1. Create SNS Topic
        const topic = new sns.Topic(this, 'MyTopic', {
            displayName: 'My Integration Test Topic'
        });

        // 2. Create SQS Queue
        const queue = new sqs.Queue(this, 'MyQueue', {
            visibilityTimeout: cdk.Duration.seconds(300)
        });

        // 3. Subscribe Queue to Topic
        topic.addSubscription(new subs.SqsSubscription(queue));

        // 4. Create Lambda Function
        const processor = new nodejs.NodejsFunction(this, 'SqsProcessor', {
            runtime: lambda.Runtime.NODEJS_20_X,
            entry: path.join(__dirname, '../handlers/sqs-processor/index.ts'),
            handler: 'handler',
            environment: {
                QUEUE_URL: queue.queueUrl,
                LOG_LEVEL: 'debug'
            }
        });

        // 5. Add SQS as Event Source for Lambda
        processor.addEventSource(new lambdaEventSources.SqsEventSource(queue));

        // 6. Outputs
        new cdk.CfnOutput(this, 'TopicArn', {
            value: topic.topicArn,
            description: 'ARN of the SNS Topic'
        });

        new cdk.CfnOutput(this, 'QueueUrl', {
            value: queue.queueUrl,
            description: 'URL of the SQS Queue'
        });

        new cdk.CfnOutput(this, 'ProcessorLogGroup', {
            value: processor.logGroup.logGroupName,
            description: 'Log Group for SQS Processor'
        });
    }
}
