import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as logs from 'aws-cdk-lib/aws-logs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import * as path from 'path';

export class S3Stack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const bucket = new s3.Bucket(this, 'TestBucket', {
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            autoDeleteObjects: true
        });

        const handler = new NodejsFunction(this, 'S3Handler', {
            runtime: lambda.Runtime.NODEJS_20_X,
            entry: path.join(__dirname, '../handlers/s3.ts'),
            handler: 'handler',
            logRetention: logs.RetentionDays.ONE_DAY,
            environment: {
                BUCKET_NAME: bucket.bucketName,
                LOG_LEVEL: 'debug'
            }
        });

        bucket.grantReadWrite(handler);

        // 3. Add S3 Event Source
        // Import S3EventSource from 'aws-cdk-lib/aws-lambda-event-sources'
        const { S3EventSource } = require('aws-cdk-lib/aws-lambda-event-sources');
        handler.addEventSource(new S3EventSource(bucket, {
            events: [s3.EventType.OBJECT_CREATED]
        }));

        // 4. Outputs for Test Discovery
        new cdk.CfnOutput(this, 'BucketName', {
            value: bucket.bucketName,
            description: 'The Name of the S3 Bucket',
            exportName: 'IntegrationTestBucketName'
        });

        new cdk.CfnOutput(this, 'S3HandlerLogGroup', {
            value: handler.logGroup.logGroupName,
            description: 'Log Group for S3 Handler'
        });
    }
}
