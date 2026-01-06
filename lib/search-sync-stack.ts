import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamo from 'aws-cdk-lib/aws-dynamodb';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as opensearch from 'aws-cdk-lib/aws-opensearchservice';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { DynamoEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import { Construct } from 'constructs';
import * as path from 'path';

export class SearchSyncStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // 1. DynamoDB Table
        const table = new dynamo.Table(this, 'SearchSyncTable', {
            partitionKey: { name: 'pk', type: dynamo.AttributeType.STRING },
            sortKey: { name: 'sk', type: dynamo.AttributeType.STRING }, // Added SK to match adapter requirements
            billingMode: dynamo.BillingMode.PAY_PER_REQUEST,
            stream: dynamo.StreamViewType.NEW_AND_OLD_IMAGES,
            removalPolicy: cdk.RemovalPolicy.DESTROY, // For testing, easy cleanup
        });

        // 2. OpenSearch Domain (Imported)
        // Hardcoded as requested
        const domain = opensearch.Domain.fromDomainAttributes(this, 'ImportedDomain', {
            domainArn: 'arn:aws:es:us-east-1:582347504313:domain/minimalopensear-k7nora94w0ks',
            domainEndpoint: 'search-minimalopensear-k7nora94w0ks-gbhgry4ieohgcafodgg6ytegym.us-east-1.es.amazonaws.com'
        });


        // 3. Stream Processor Lambda
        const streamProcessor = new NodejsFunction(this, 'StreamProcessor', {
            runtime: lambda.Runtime.NODEJS_20_X,
            entry: path.join(__dirname, '../handlers/search-sync-stream-processor/index.ts'),
            handler: 'handler',
            logRetention: logs.RetentionDays.ONE_DAY,
            environment: {
                OPENSEARCH_ENDPOINT: domain.domainEndpoint,
                LOG_LEVEL: 'debug'
            },
            timeout: cdk.Duration.seconds(30)
        });

        // Grant access
        domain.grantWrite(streamProcessor);
        table.grantStreamRead(streamProcessor);

        // Add Event Source
        streamProcessor.addEventSource(new DynamoEventSource(table, {
            startingPosition: lambda.StartingPosition.TRIM_HORIZON,
            batchSize: 1, // Process one by one for debugging/simplicity
            retryAttempts: 1
        }));


        // 4. API Handler Lambda
        const apiHandler = new NodejsFunction(this, 'ApiHandler', {
            runtime: lambda.Runtime.NODEJS_20_X,
            entry: path.join(__dirname, '../handlers/search-sync-api/index.ts'),
            handler: 'handler',
            logRetention: logs.RetentionDays.ONE_DAY,
            environment: {
                OPENSEARCH_ENDPOINT: domain.domainEndpoint,
                TABLE_NAME: table.tableName,
                LOG_LEVEL: 'debug'
            },
            timeout: cdk.Duration.seconds(30)
        });

        // Grant Access
        domain.grantRead(apiHandler);
        domain.grantWrite(apiHandler); // Needed for index creation/deletion
        table.grantReadWriteData(apiHandler);


        // 5. API Gateway
        const api = new apigateway.LambdaRestApi(this, 'SearchSyncApi', {
            handler: apiHandler,
            proxy: true
        });


        // Outputs
        new cdk.CfnOutput(this, 'ApiUrl', { value: api.url });
        new cdk.CfnOutput(this, 'ApiHandlerLogGroup', { value: apiHandler.logGroup.logGroupName });
        new cdk.CfnOutput(this, 'StreamProcessorLogGroup', { value: streamProcessor.logGroup.logGroupName });
        new cdk.CfnOutput(this, 'TableName', { value: table.tableName });
    }
}
