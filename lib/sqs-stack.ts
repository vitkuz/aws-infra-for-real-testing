import * as cdk from 'aws-cdk-lib';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as logs from 'aws-cdk-lib/aws-logs';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import * as path from 'path';

export class SqsStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // 1. Create SQS Queue
        const queue = new sqs.Queue(this, 'TestQueue');

        // 2. Create Lambda Function
        const handler = new NodejsFunction(this, 'SqsHandler', {
            runtime: lambda.Runtime.NODEJS_20_X,
            entry: path.join(__dirname, '../handlers/sqs-handler/index.ts'),
            handler: 'handler',
            logRetention: logs.RetentionDays.ONE_DAY,
            environment: {
                LOG_LEVEL: 'debug'
            },
            bundling: {
                // Dependencies installed in root package.json should be bundled automatically by esbuild
            }
        });

        // 3. Permissions
        queue.grantSendMessages(handler);
        handler.addEventSource(new SqsEventSource(queue));
    }
}
