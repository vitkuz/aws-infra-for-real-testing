import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as logs from 'aws-cdk-lib/aws-logs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import * as path from 'path';

import { DynamoEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';

export class DynamoStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const table = new dynamodb.Table(this, 'TestTable', {
            partitionKey: { name: 'pk', type: dynamodb.AttributeType.STRING }, // Updated PK to 'pk' to match adapter default
            sortKey: { name: 'sk', type: dynamodb.AttributeType.STRING },
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            stream: dynamodb.StreamViewType.NEW_AND_OLD_IMAGES,
            tableName: 'vitkuz-test-dynamo-table'
        });

        table.addGlobalSecondaryIndex({
            indexName: 'GSI1',
            partitionKey: { name: 'sk', type: dynamodb.AttributeType.STRING },
            sortKey: { name: 'pk', type: dynamodb.AttributeType.STRING },
            projectionType: dynamodb.ProjectionType.ALL,
        });

        const handler = new NodejsFunction(this, 'DynamoHandler', {
            runtime: lambda.Runtime.NODEJS_20_X,
            entry: path.join(__dirname, '../handlers/dynamo-handler/index.ts'),
            handler: 'handler',
            logRetention: logs.RetentionDays.ONE_DAY,
            environment: {
                TABLE_NAME: table.tableName,
                LOG_LEVEL: 'debug'
            }
        });

        table.grantReadWriteData(handler);
        handler.addEventSource(new DynamoEventSource(table, {
            startingPosition: lambda.StartingPosition.LATEST
        }));

        new cdk.CfnOutput(this, 'TableName', { value: table.tableName });
        new cdk.CfnOutput(this, 'DynamoHandlerLogGroup', { value: handler.logGroup.logGroupName });
    }
}
