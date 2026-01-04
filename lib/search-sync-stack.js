"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchSyncStack = void 0;
const cdk = __importStar(require("aws-cdk-lib"));
const lambda = __importStar(require("aws-cdk-lib/aws-lambda"));
const dynamo = __importStar(require("aws-cdk-lib/aws-dynamodb"));
const logs = __importStar(require("aws-cdk-lib/aws-logs"));
const opensearch = __importStar(require("aws-cdk-lib/aws-opensearchservice"));
const apigateway = __importStar(require("aws-cdk-lib/aws-apigateway"));
const aws_lambda_nodejs_1 = require("aws-cdk-lib/aws-lambda-nodejs");
const aws_lambda_event_sources_1 = require("aws-cdk-lib/aws-lambda-event-sources");
const path = __importStar(require("path"));
class SearchSyncStack extends cdk.Stack {
    constructor(scope, id, props) {
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
        const streamProcessor = new aws_lambda_nodejs_1.NodejsFunction(this, 'StreamProcessor', {
            runtime: lambda.Runtime.NODEJS_20_X,
            entry: path.join(__dirname, '../handlers/search-sync/stream-processor.ts'),
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
        streamProcessor.addEventSource(new aws_lambda_event_sources_1.DynamoEventSource(table, {
            startingPosition: lambda.StartingPosition.TRIM_HORIZON,
            batchSize: 1, // Process one by one for debugging/simplicity
            retryAttempts: 1
        }));
        // 4. API Handler Lambda
        const apiHandler = new aws_lambda_nodejs_1.NodejsFunction(this, 'ApiHandler', {
            runtime: lambda.Runtime.NODEJS_20_X,
            entry: path.join(__dirname, '../handlers/search-sync/api.ts'),
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
exports.SearchSyncStack = SearchSyncStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VhcmNoLXN5bmMtc3RhY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJzZWFyY2gtc3luYy1zdGFjay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxpREFBbUM7QUFDbkMsK0RBQWlEO0FBQ2pELGlFQUFtRDtBQUNuRCwyREFBNkM7QUFDN0MsOEVBQWdFO0FBQ2hFLHVFQUF5RDtBQUN6RCxxRUFBK0Q7QUFDL0QsbUZBQXlFO0FBRXpFLDJDQUE2QjtBQUU3QixNQUFhLGVBQWdCLFNBQVEsR0FBRyxDQUFDLEtBQUs7SUFDMUMsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxLQUFzQjtRQUM1RCxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUV4QixvQkFBb0I7UUFDcEIsTUFBTSxLQUFLLEdBQUcsSUFBSSxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxpQkFBaUIsRUFBRTtZQUNwRCxZQUFZLEVBQUUsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxNQUFNLENBQUMsYUFBYSxDQUFDLE1BQU0sRUFBRTtZQUMvRCxPQUFPLEVBQUUsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxNQUFNLENBQUMsYUFBYSxDQUFDLE1BQU0sRUFBRSxFQUFFLHlDQUF5QztZQUNyRyxXQUFXLEVBQUUsTUFBTSxDQUFDLFdBQVcsQ0FBQyxlQUFlO1lBQy9DLE1BQU0sRUFBRSxNQUFNLENBQUMsY0FBYyxDQUFDLGtCQUFrQjtZQUNoRCxhQUFhLEVBQUUsR0FBRyxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsNEJBQTRCO1NBQ3pFLENBQUMsQ0FBQztRQUVILGtDQUFrQztRQUNsQyx5QkFBeUI7UUFDekIsTUFBTSxNQUFNLEdBQUcsVUFBVSxDQUFDLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLEVBQUUsZ0JBQWdCLEVBQUU7WUFDMUUsU0FBUyxFQUFFLHVFQUF1RTtZQUNsRixjQUFjLEVBQUUsMkZBQTJGO1NBQzlHLENBQUMsQ0FBQztRQUdILDZCQUE2QjtRQUM3QixNQUFNLGVBQWUsR0FBRyxJQUFJLGtDQUFjLENBQUMsSUFBSSxFQUFFLGlCQUFpQixFQUFFO1lBQ2hFLE9BQU8sRUFBRSxNQUFNLENBQUMsT0FBTyxDQUFDLFdBQVc7WUFDbkMsS0FBSyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLDZDQUE2QyxDQUFDO1lBQzFFLE9BQU8sRUFBRSxTQUFTO1lBQ2xCLFlBQVksRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU87WUFDeEMsV0FBVyxFQUFFO2dCQUNULG1CQUFtQixFQUFFLE1BQU0sQ0FBQyxjQUFjO2dCQUMxQyxTQUFTLEVBQUUsT0FBTzthQUNyQjtZQUNELE9BQU8sRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7U0FDcEMsQ0FBQyxDQUFDO1FBRUgsZUFBZTtRQUNmLE1BQU0sQ0FBQyxVQUFVLENBQUMsZUFBZSxDQUFDLENBQUM7UUFDbkMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUV2QyxtQkFBbUI7UUFDbkIsZUFBZSxDQUFDLGNBQWMsQ0FBQyxJQUFJLDRDQUFpQixDQUFDLEtBQUssRUFBRTtZQUN4RCxnQkFBZ0IsRUFBRSxNQUFNLENBQUMsZ0JBQWdCLENBQUMsWUFBWTtZQUN0RCxTQUFTLEVBQUUsQ0FBQyxFQUFFLDhDQUE4QztZQUM1RCxhQUFhLEVBQUUsQ0FBQztTQUNuQixDQUFDLENBQUMsQ0FBQztRQUdKLHdCQUF3QjtRQUN4QixNQUFNLFVBQVUsR0FBRyxJQUFJLGtDQUFjLENBQUMsSUFBSSxFQUFFLFlBQVksRUFBRTtZQUN0RCxPQUFPLEVBQUUsTUFBTSxDQUFDLE9BQU8sQ0FBQyxXQUFXO1lBQ25DLEtBQUssRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxnQ0FBZ0MsQ0FBQztZQUM3RCxPQUFPLEVBQUUsU0FBUztZQUNsQixZQUFZLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPO1lBQ3hDLFdBQVcsRUFBRTtnQkFDVCxtQkFBbUIsRUFBRSxNQUFNLENBQUMsY0FBYztnQkFDMUMsVUFBVSxFQUFFLEtBQUssQ0FBQyxTQUFTO2dCQUMzQixTQUFTLEVBQUUsT0FBTzthQUNyQjtZQUNELE9BQU8sRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7U0FDcEMsQ0FBQyxDQUFDO1FBRUgsZUFBZTtRQUNmLE1BQU0sQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDN0IsTUFBTSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLHFDQUFxQztRQUNwRSxLQUFLLENBQUMsa0JBQWtCLENBQUMsVUFBVSxDQUFDLENBQUM7UUFHckMsaUJBQWlCO1FBQ2pCLE1BQU0sR0FBRyxHQUFHLElBQUksVUFBVSxDQUFDLGFBQWEsQ0FBQyxJQUFJLEVBQUUsZUFBZSxFQUFFO1lBQzVELE9BQU8sRUFBRSxVQUFVO1lBQ25CLEtBQUssRUFBRSxJQUFJO1NBQ2QsQ0FBQyxDQUFDO1FBR0gsVUFBVTtRQUNWLElBQUksR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLEVBQUUsS0FBSyxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDO1FBQ3RELElBQUksR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsb0JBQW9CLEVBQUUsRUFBRSxLQUFLLEVBQUUsVUFBVSxDQUFDLFFBQVEsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDO1FBQzNGLElBQUksR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUseUJBQXlCLEVBQUUsRUFBRSxLQUFLLEVBQUUsZUFBZSxDQUFDLFFBQVEsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDO1FBQ3JHLElBQUksR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsV0FBVyxFQUFFLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDO0lBQ3JFLENBQUM7Q0FDSjtBQS9FRCwwQ0ErRUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBjZGsgZnJvbSAnYXdzLWNkay1saWInO1xuaW1wb3J0ICogYXMgbGFtYmRhIGZyb20gJ2F3cy1jZGstbGliL2F3cy1sYW1iZGEnO1xuaW1wb3J0ICogYXMgZHluYW1vIGZyb20gJ2F3cy1jZGstbGliL2F3cy1keW5hbW9kYic7XG5pbXBvcnQgKiBhcyBsb2dzIGZyb20gJ2F3cy1jZGstbGliL2F3cy1sb2dzJztcbmltcG9ydCAqIGFzIG9wZW5zZWFyY2ggZnJvbSAnYXdzLWNkay1saWIvYXdzLW9wZW5zZWFyY2hzZXJ2aWNlJztcbmltcG9ydCAqIGFzIGFwaWdhdGV3YXkgZnJvbSAnYXdzLWNkay1saWIvYXdzLWFwaWdhdGV3YXknO1xuaW1wb3J0IHsgTm9kZWpzRnVuY3Rpb24gfSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtbGFtYmRhLW5vZGVqcyc7XG5pbXBvcnQgeyBEeW5hbW9FdmVudFNvdXJjZSB9IGZyb20gJ2F3cy1jZGstbGliL2F3cy1sYW1iZGEtZXZlbnQtc291cmNlcyc7XG5pbXBvcnQgeyBDb25zdHJ1Y3QgfSBmcm9tICdjb25zdHJ1Y3RzJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5cbmV4cG9ydCBjbGFzcyBTZWFyY2hTeW5jU3RhY2sgZXh0ZW5kcyBjZGsuU3RhY2sge1xuICAgIGNvbnN0cnVjdG9yKHNjb3BlOiBDb25zdHJ1Y3QsIGlkOiBzdHJpbmcsIHByb3BzPzogY2RrLlN0YWNrUHJvcHMpIHtcbiAgICAgICAgc3VwZXIoc2NvcGUsIGlkLCBwcm9wcyk7XG5cbiAgICAgICAgLy8gMS4gRHluYW1vREIgVGFibGVcbiAgICAgICAgY29uc3QgdGFibGUgPSBuZXcgZHluYW1vLlRhYmxlKHRoaXMsICdTZWFyY2hTeW5jVGFibGUnLCB7XG4gICAgICAgICAgICBwYXJ0aXRpb25LZXk6IHsgbmFtZTogJ3BrJywgdHlwZTogZHluYW1vLkF0dHJpYnV0ZVR5cGUuU1RSSU5HIH0sXG4gICAgICAgICAgICBzb3J0S2V5OiB7IG5hbWU6ICdzaycsIHR5cGU6IGR5bmFtby5BdHRyaWJ1dGVUeXBlLlNUUklORyB9LCAvLyBBZGRlZCBTSyB0byBtYXRjaCBhZGFwdGVyIHJlcXVpcmVtZW50c1xuICAgICAgICAgICAgYmlsbGluZ01vZGU6IGR5bmFtby5CaWxsaW5nTW9kZS5QQVlfUEVSX1JFUVVFU1QsXG4gICAgICAgICAgICBzdHJlYW06IGR5bmFtby5TdHJlYW1WaWV3VHlwZS5ORVdfQU5EX09MRF9JTUFHRVMsXG4gICAgICAgICAgICByZW1vdmFsUG9saWN5OiBjZGsuUmVtb3ZhbFBvbGljeS5ERVNUUk9ZLCAvLyBGb3IgdGVzdGluZywgZWFzeSBjbGVhbnVwXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIDIuIE9wZW5TZWFyY2ggRG9tYWluIChJbXBvcnRlZClcbiAgICAgICAgLy8gSGFyZGNvZGVkIGFzIHJlcXVlc3RlZFxuICAgICAgICBjb25zdCBkb21haW4gPSBvcGVuc2VhcmNoLkRvbWFpbi5mcm9tRG9tYWluQXR0cmlidXRlcyh0aGlzLCAnSW1wb3J0ZWREb21haW4nLCB7XG4gICAgICAgICAgICBkb21haW5Bcm46ICdhcm46YXdzOmVzOnVzLWVhc3QtMTo1ODIzNDc1MDQzMTM6ZG9tYWluL21pbmltYWxvcGVuc2Vhci1rN25vcmE5NHcwa3MnLFxuICAgICAgICAgICAgZG9tYWluRW5kcG9pbnQ6ICdzZWFyY2gtbWluaW1hbG9wZW5zZWFyLWs3bm9yYTk0dzBrcy1nYmhncnk0aWVvaGdjYWZvZGdnNnl0ZWd5bS51cy1lYXN0LTEuZXMuYW1hem9uYXdzLmNvbSdcbiAgICAgICAgfSk7XG5cblxuICAgICAgICAvLyAzLiBTdHJlYW0gUHJvY2Vzc29yIExhbWJkYVxuICAgICAgICBjb25zdCBzdHJlYW1Qcm9jZXNzb3IgPSBuZXcgTm9kZWpzRnVuY3Rpb24odGhpcywgJ1N0cmVhbVByb2Nlc3NvcicsIHtcbiAgICAgICAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLk5PREVKU18yMF9YLFxuICAgICAgICAgICAgZW50cnk6IHBhdGguam9pbihfX2Rpcm5hbWUsICcuLi9oYW5kbGVycy9zZWFyY2gtc3luYy9zdHJlYW0tcHJvY2Vzc29yLnRzJyksXG4gICAgICAgICAgICBoYW5kbGVyOiAnaGFuZGxlcicsXG4gICAgICAgICAgICBsb2dSZXRlbnRpb246IGxvZ3MuUmV0ZW50aW9uRGF5cy5PTkVfREFZLFxuICAgICAgICAgICAgZW52aXJvbm1lbnQ6IHtcbiAgICAgICAgICAgICAgICBPUEVOU0VBUkNIX0VORFBPSU5UOiBkb21haW4uZG9tYWluRW5kcG9pbnQsXG4gICAgICAgICAgICAgICAgTE9HX0xFVkVMOiAnZGVidWcnXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgdGltZW91dDogY2RrLkR1cmF0aW9uLnNlY29uZHMoMzApXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIEdyYW50IGFjY2Vzc1xuICAgICAgICBkb21haW4uZ3JhbnRXcml0ZShzdHJlYW1Qcm9jZXNzb3IpO1xuICAgICAgICB0YWJsZS5ncmFudFN0cmVhbVJlYWQoc3RyZWFtUHJvY2Vzc29yKTtcblxuICAgICAgICAvLyBBZGQgRXZlbnQgU291cmNlXG4gICAgICAgIHN0cmVhbVByb2Nlc3Nvci5hZGRFdmVudFNvdXJjZShuZXcgRHluYW1vRXZlbnRTb3VyY2UodGFibGUsIHtcbiAgICAgICAgICAgIHN0YXJ0aW5nUG9zaXRpb246IGxhbWJkYS5TdGFydGluZ1Bvc2l0aW9uLlRSSU1fSE9SSVpPTixcbiAgICAgICAgICAgIGJhdGNoU2l6ZTogMSwgLy8gUHJvY2VzcyBvbmUgYnkgb25lIGZvciBkZWJ1Z2dpbmcvc2ltcGxpY2l0eVxuICAgICAgICAgICAgcmV0cnlBdHRlbXB0czogMVxuICAgICAgICB9KSk7XG5cblxuICAgICAgICAvLyA0LiBBUEkgSGFuZGxlciBMYW1iZGFcbiAgICAgICAgY29uc3QgYXBpSGFuZGxlciA9IG5ldyBOb2RlanNGdW5jdGlvbih0aGlzLCAnQXBpSGFuZGxlcicsIHtcbiAgICAgICAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLk5PREVKU18yMF9YLFxuICAgICAgICAgICAgZW50cnk6IHBhdGguam9pbihfX2Rpcm5hbWUsICcuLi9oYW5kbGVycy9zZWFyY2gtc3luYy9hcGkudHMnKSxcbiAgICAgICAgICAgIGhhbmRsZXI6ICdoYW5kbGVyJyxcbiAgICAgICAgICAgIGxvZ1JldGVudGlvbjogbG9ncy5SZXRlbnRpb25EYXlzLk9ORV9EQVksXG4gICAgICAgICAgICBlbnZpcm9ubWVudDoge1xuICAgICAgICAgICAgICAgIE9QRU5TRUFSQ0hfRU5EUE9JTlQ6IGRvbWFpbi5kb21haW5FbmRwb2ludCxcbiAgICAgICAgICAgICAgICBUQUJMRV9OQU1FOiB0YWJsZS50YWJsZU5hbWUsXG4gICAgICAgICAgICAgICAgTE9HX0xFVkVMOiAnZGVidWcnXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgdGltZW91dDogY2RrLkR1cmF0aW9uLnNlY29uZHMoMzApXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIEdyYW50IEFjY2Vzc1xuICAgICAgICBkb21haW4uZ3JhbnRSZWFkKGFwaUhhbmRsZXIpO1xuICAgICAgICBkb21haW4uZ3JhbnRXcml0ZShhcGlIYW5kbGVyKTsgLy8gTmVlZGVkIGZvciBpbmRleCBjcmVhdGlvbi9kZWxldGlvblxuICAgICAgICB0YWJsZS5ncmFudFJlYWRXcml0ZURhdGEoYXBpSGFuZGxlcik7XG5cblxuICAgICAgICAvLyA1LiBBUEkgR2F0ZXdheVxuICAgICAgICBjb25zdCBhcGkgPSBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFSZXN0QXBpKHRoaXMsICdTZWFyY2hTeW5jQXBpJywge1xuICAgICAgICAgICAgaGFuZGxlcjogYXBpSGFuZGxlcixcbiAgICAgICAgICAgIHByb3h5OiB0cnVlXG4gICAgICAgIH0pO1xuXG5cbiAgICAgICAgLy8gT3V0cHV0c1xuICAgICAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCAnQXBpVXJsJywgeyB2YWx1ZTogYXBpLnVybCB9KTtcbiAgICAgICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ0FwaUhhbmRsZXJMb2dHcm91cCcsIHsgdmFsdWU6IGFwaUhhbmRsZXIubG9nR3JvdXAubG9nR3JvdXBOYW1lIH0pO1xuICAgICAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCAnU3RyZWFtUHJvY2Vzc29yTG9nR3JvdXAnLCB7IHZhbHVlOiBzdHJlYW1Qcm9jZXNzb3IubG9nR3JvdXAubG9nR3JvdXBOYW1lIH0pO1xuICAgICAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCAnVGFibGVOYW1lJywgeyB2YWx1ZTogdGFibGUudGFibGVOYW1lIH0pO1xuICAgIH1cbn1cbiJdfQ==