import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as logs from 'aws-cdk-lib/aws-logs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import * as path from 'path';
import * as apigwv2 from 'aws-cdk-lib/aws-apigatewayv2';
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';

export class HttpApiStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const handler = new NodejsFunction(this, 'HttpApiHandler', {
            runtime: lambda.Runtime.NODEJS_20_X,
            entry: path.join(__dirname, '../handlers/http-api-handler/index.ts'),
            handler: 'handler',
            logRetention: logs.RetentionDays.ONE_DAY,
            environment: {
                LOG_LEVEL: 'debug'
            }
        });

        const integration = new HttpLambdaIntegration('HttpIntegration', handler);

        const httpApi = new apigwv2.HttpApi(this, 'VitkuzTestHttpApi', {
            defaultIntegration: integration
        });

        new cdk.CfnOutput(this, 'HttpApiUrl', {
            value: httpApi.url ?? 'Something went wrong with the URL',
            description: 'The URL of the HTTP API'
        });

        new cdk.CfnOutput(this, 'HttpApiHandlerLogGroup', {
            value: handler.logGroup.logGroupName,
            description: 'Log Group for HTTP API Handler'
        });
    }
}
