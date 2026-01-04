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
exports.SnsStack = void 0;
const cdk = __importStar(require("aws-cdk-lib"));
const sns = __importStar(require("aws-cdk-lib/aws-sns"));
const lambda = __importStar(require("aws-cdk-lib/aws-lambda"));
const logs = __importStar(require("aws-cdk-lib/aws-logs"));
const aws_lambda_nodejs_1 = require("aws-cdk-lib/aws-lambda-nodejs");
const path = __importStar(require("path"));
class SnsStack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        // 1. Create SNS Topic
        const topic = new sns.Topic(this, 'TestTopic', {
            displayName: 'Vitkuz Test Topic'
        });
        // 2. Create Lambda Function
        const handler = new aws_lambda_nodejs_1.NodejsFunction(this, 'SnsHandler', {
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
exports.SnsStack = SnsStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic25zLXN0YWNrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsic25zLXN0YWNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLGlEQUFtQztBQUNuQyx5REFBMkM7QUFDM0MsK0RBQWlEO0FBQ2pELDJEQUE2QztBQUM3QyxxRUFBK0Q7QUFFL0QsMkNBQTZCO0FBRTdCLE1BQWEsUUFBUyxTQUFRLEdBQUcsQ0FBQyxLQUFLO0lBQ25DLFlBQVksS0FBZ0IsRUFBRSxFQUFVLEVBQUUsS0FBc0I7UUFDNUQsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFFeEIsc0JBQXNCO1FBQ3RCLE1BQU0sS0FBSyxHQUFHLElBQUksR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsV0FBVyxFQUFFO1lBQzNDLFdBQVcsRUFBRSxtQkFBbUI7U0FDbkMsQ0FBQyxDQUFDO1FBRUgsNEJBQTRCO1FBQzVCLE1BQU0sT0FBTyxHQUFHLElBQUksa0NBQWMsQ0FBQyxJQUFJLEVBQUUsWUFBWSxFQUFFO1lBQ25ELE9BQU8sRUFBRSxNQUFNLENBQUMsT0FBTyxDQUFDLFdBQVc7WUFDbkMsS0FBSyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLG9CQUFvQixDQUFDO1lBQ2pELE9BQU8sRUFBRSxTQUFTO1lBQ2xCLFlBQVksRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU87WUFDeEMsV0FBVyxFQUFFO2dCQUNULFNBQVMsRUFBRSxLQUFLLENBQUMsUUFBUTtnQkFDekIsU0FBUyxFQUFFLE9BQU87YUFDckI7WUFDRCxRQUFRLEVBQUU7Z0JBQ04sZUFBZSxFQUFFLENBQUMsU0FBUyxDQUFDO2FBQy9CO1NBQ0osQ0FBQyxDQUFDO1FBRUgsMEJBQTBCO1FBQzFCLGlFQUFpRTtRQUNqRSxNQUFNLEVBQUUsY0FBYyxFQUFFLEdBQUcsT0FBTyxDQUFDLHNDQUFzQyxDQUFDLENBQUM7UUFDM0UsT0FBTyxDQUFDLGNBQWMsQ0FBQyxJQUFJLGNBQWMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBRWxELGdDQUFnQztRQUNoQyxJQUFJLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLGFBQWEsRUFBRTtZQUNuQyxLQUFLLEVBQUUsS0FBSyxDQUFDLFFBQVE7WUFDckIsV0FBVyxFQUFFLDBCQUEwQjtZQUN2QyxVQUFVLEVBQUUseUJBQXlCO1NBQ3hDLENBQUMsQ0FBQztRQUVILElBQUksR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsb0JBQW9CLEVBQUU7WUFDMUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxRQUFRLENBQUMsWUFBWTtZQUNwQyxXQUFXLEVBQUUsMkJBQTJCO1NBQzNDLENBQUMsQ0FBQztJQUNQLENBQUM7Q0FDSjtBQXpDRCw0QkF5Q0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBjZGsgZnJvbSAnYXdzLWNkay1saWInO1xuaW1wb3J0ICogYXMgc25zIGZyb20gJ2F3cy1jZGstbGliL2F3cy1zbnMnO1xuaW1wb3J0ICogYXMgbGFtYmRhIGZyb20gJ2F3cy1jZGstbGliL2F3cy1sYW1iZGEnO1xuaW1wb3J0ICogYXMgbG9ncyBmcm9tICdhd3MtY2RrLWxpYi9hd3MtbG9ncyc7XG5pbXBvcnQgeyBOb2RlanNGdW5jdGlvbiB9IGZyb20gJ2F3cy1jZGstbGliL2F3cy1sYW1iZGEtbm9kZWpzJztcbmltcG9ydCB7IENvbnN0cnVjdCB9IGZyb20gJ2NvbnN0cnVjdHMnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcblxuZXhwb3J0IGNsYXNzIFNuc1N0YWNrIGV4dGVuZHMgY2RrLlN0YWNrIHtcbiAgICBjb25zdHJ1Y3RvcihzY29wZTogQ29uc3RydWN0LCBpZDogc3RyaW5nLCBwcm9wcz86IGNkay5TdGFja1Byb3BzKSB7XG4gICAgICAgIHN1cGVyKHNjb3BlLCBpZCwgcHJvcHMpO1xuXG4gICAgICAgIC8vIDEuIENyZWF0ZSBTTlMgVG9waWNcbiAgICAgICAgY29uc3QgdG9waWMgPSBuZXcgc25zLlRvcGljKHRoaXMsICdUZXN0VG9waWMnLCB7XG4gICAgICAgICAgICBkaXNwbGF5TmFtZTogJ1ZpdGt1eiBUZXN0IFRvcGljJ1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyAyLiBDcmVhdGUgTGFtYmRhIEZ1bmN0aW9uXG4gICAgICAgIGNvbnN0IGhhbmRsZXIgPSBuZXcgTm9kZWpzRnVuY3Rpb24odGhpcywgJ1Nuc0hhbmRsZXInLCB7XG4gICAgICAgICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5OT0RFSlNfMjBfWCxcbiAgICAgICAgICAgIGVudHJ5OiBwYXRoLmpvaW4oX19kaXJuYW1lLCAnLi4vaGFuZGxlcnMvc25zLnRzJyksXG4gICAgICAgICAgICBoYW5kbGVyOiAnaGFuZGxlcicsXG4gICAgICAgICAgICBsb2dSZXRlbnRpb246IGxvZ3MuUmV0ZW50aW9uRGF5cy5PTkVfREFZLFxuICAgICAgICAgICAgZW52aXJvbm1lbnQ6IHtcbiAgICAgICAgICAgICAgICBUT1BJQ19BUk46IHRvcGljLnRvcGljQXJuLFxuICAgICAgICAgICAgICAgIExPR19MRVZFTDogJ2RlYnVnJ1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGJ1bmRsaW5nOiB7XG4gICAgICAgICAgICAgICAgZXh0ZXJuYWxNb2R1bGVzOiBbJ2F3cy1zZGsnXSxcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gMy4gQWRkIFNOUyBFdmVudCBTb3VyY2VcbiAgICAgICAgLy8gV2UgbmVlZCB0byBpbXBvcnQgU25zRXZlbnRTb3VyY2UgZnJvbSBhd3MtbGFtYmRhLWV2ZW50LXNvdXJjZXNcbiAgICAgICAgY29uc3QgeyBTbnNFdmVudFNvdXJjZSB9ID0gcmVxdWlyZSgnYXdzLWNkay1saWIvYXdzLWxhbWJkYS1ldmVudC1zb3VyY2VzJyk7XG4gICAgICAgIGhhbmRsZXIuYWRkRXZlbnRTb3VyY2UobmV3IFNuc0V2ZW50U291cmNlKHRvcGljKSk7XG5cbiAgICAgICAgLy8gNC4gT3V0cHV0cyBmb3IgVGVzdCBEaXNjb3ZlcnlcbiAgICAgICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ1Nuc1RvcGljQXJuJywge1xuICAgICAgICAgICAgdmFsdWU6IHRvcGljLnRvcGljQXJuLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246ICdUaGUgQVJOIG9mIHRoZSBTTlMgVG9waWMnLFxuICAgICAgICAgICAgZXhwb3J0TmFtZTogJ0ludGVncmF0aW9uVGVzdFRvcGljQXJuJ1xuICAgICAgICB9KTtcblxuICAgICAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCAnU25zSGFuZGxlckxvZ0dyb3VwJywge1xuICAgICAgICAgICAgdmFsdWU6IGhhbmRsZXIubG9nR3JvdXAubG9nR3JvdXBOYW1lLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246ICdMb2cgR3JvdXAgZm9yIFNOUyBIYW5kbGVyJ1xuICAgICAgICB9KTtcbiAgICB9XG59XG4iXX0=