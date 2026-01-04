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
exports.AwsInfraForRealTestingStack = void 0;
const cdk = __importStar(require("aws-cdk-lib"));
const sns = __importStar(require("aws-cdk-lib/aws-sns"));
const lambda = __importStar(require("aws-cdk-lib/aws-lambda"));
const lambdaEventSources = __importStar(require("aws-cdk-lib/aws-lambda-event-sources"));
const nodejs = __importStar(require("aws-cdk-lib/aws-lambda-nodejs"));
const path = __importStar(require("path"));
class AwsInfraForRealTestingStack extends cdk.Stack {
    constructor(scope, id, props) {
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
exports.AwsInfraForRealTestingStack = AwsInfraForRealTestingStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXdzLWluZnJhLWZvci1yZWFsLXRlc3Rpbmctc3RhY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhd3MtaW5mcmEtZm9yLXJlYWwtdGVzdGluZy1zdGFjay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxpREFBbUM7QUFFbkMseURBQTJDO0FBRTNDLCtEQUFpRDtBQUNqRCx5RkFBMkU7QUFDM0Usc0VBQXdEO0FBQ3hELDJDQUE2QjtBQUU3QixNQUFhLDJCQUE0QixTQUFRLEdBQUcsQ0FBQyxLQUFLO0lBQ3hELFlBQVksS0FBZ0IsRUFBRSxFQUFVLEVBQUUsS0FBc0I7UUFDOUQsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFFeEIsc0JBQXNCO1FBQ3RCLE1BQU0sS0FBSyxHQUFHLElBQUksR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsVUFBVSxFQUFFO1lBQzVDLFdBQVcsRUFBRSx3QkFBd0I7U0FDdEMsQ0FBQyxDQUFDO1FBRUgsNEJBQTRCO1FBQzVCLE1BQU0sT0FBTyxHQUFHLElBQUksTUFBTSxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsWUFBWSxFQUFFO1lBQzVELE9BQU8sRUFBRSxNQUFNLENBQUMsT0FBTyxDQUFDLFdBQVc7WUFDbkMsS0FBSyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLG9CQUFvQixDQUFDO1lBQ2pELE9BQU8sRUFBRSxTQUFTO1lBQ2xCLFdBQVcsRUFBRTtnQkFDWCxTQUFTLEVBQUUsS0FBSyxDQUFDLFFBQVEsRUFBRSwyRUFBMkU7Z0JBQ3RHLFNBQVMsRUFBRSxPQUFPO2FBQ25CO1NBQ0YsQ0FBQyxDQUFDO1FBRUgsMEJBQTBCO1FBQzFCLE9BQU8sQ0FBQyxjQUFjLENBQUMsSUFBSSxrQkFBa0IsQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUVyRSxnQ0FBZ0M7UUFDaEMsSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxhQUFhLEVBQUU7WUFDckMsS0FBSyxFQUFFLEtBQUssQ0FBQyxRQUFRO1lBQ3JCLFdBQVcsRUFBRSwwQkFBMEI7WUFDdkMsVUFBVSxFQUFFLHlCQUF5QjtTQUN0QyxDQUFDLENBQUM7UUFFSCxJQUFJLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLG9CQUFvQixFQUFFO1lBQzVDLEtBQUssRUFBRSxPQUFPLENBQUMsUUFBUSxDQUFDLFlBQVk7WUFDcEMsV0FBVyxFQUFFLDJCQUEyQjtTQUN6QyxDQUFDLENBQUM7SUFDTCxDQUFDO0NBQ0Y7QUFuQ0Qsa0VBbUNDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgY2RrIGZyb20gJ2F3cy1jZGstbGliJztcbmltcG9ydCB7IENvbnN0cnVjdCB9IGZyb20gJ2NvbnN0cnVjdHMnO1xuaW1wb3J0ICogYXMgc25zIGZyb20gJ2F3cy1jZGstbGliL2F3cy1zbnMnO1xuaW1wb3J0ICogYXMgc3VicyBmcm9tICdhd3MtY2RrLWxpYi9hd3Mtc25zLXN1YnNjcmlwdGlvbnMnO1xuaW1wb3J0ICogYXMgbGFtYmRhIGZyb20gJ2F3cy1jZGstbGliL2F3cy1sYW1iZGEnO1xuaW1wb3J0ICogYXMgbGFtYmRhRXZlbnRTb3VyY2VzIGZyb20gJ2F3cy1jZGstbGliL2F3cy1sYW1iZGEtZXZlbnQtc291cmNlcyc7XG5pbXBvcnQgKiBhcyBub2RlanMgZnJvbSAnYXdzLWNkay1saWIvYXdzLWxhbWJkYS1ub2RlanMnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcblxuZXhwb3J0IGNsYXNzIEF3c0luZnJhRm9yUmVhbFRlc3RpbmdTdGFjayBleHRlbmRzIGNkay5TdGFjayB7XG4gIGNvbnN0cnVjdG9yKHNjb3BlOiBDb25zdHJ1Y3QsIGlkOiBzdHJpbmcsIHByb3BzPzogY2RrLlN0YWNrUHJvcHMpIHtcbiAgICBzdXBlcihzY29wZSwgaWQsIHByb3BzKTtcblxuICAgIC8vIDEuIENyZWF0ZSBTTlMgVG9waWNcbiAgICBjb25zdCB0b3BpYyA9IG5ldyBzbnMuVG9waWModGhpcywgJ1Nuc1RvcGljJywge1xuICAgICAgZGlzcGxheU5hbWU6ICdJbnRlZ3JhdGlvbiBUZXN0IFRvcGljJ1xuICAgIH0pO1xuXG4gICAgLy8gMi4gQ3JlYXRlIExhbWJkYSBGdW5jdGlvblxuICAgIGNvbnN0IGhhbmRsZXIgPSBuZXcgbm9kZWpzLk5vZGVqc0Z1bmN0aW9uKHRoaXMsICdTbnNIYW5kbGVyJywge1xuICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuTk9ERUpTXzIwX1gsXG4gICAgICBlbnRyeTogcGF0aC5qb2luKF9fZGlybmFtZSwgJy4uL2hhbmRsZXJzL3Nucy50cycpLFxuICAgICAgaGFuZGxlcjogJ2hhbmRsZXInLFxuICAgICAgZW52aXJvbm1lbnQ6IHtcbiAgICAgICAgVE9QSUNfQVJOOiB0b3BpYy50b3BpY0FybiwgLy8gSGFuZGxlcnMgbWlnaHQgZmluZCB0aGlzIHVzZWZ1bCwgdGhvdWdoIG5vdCBzdHJpY3RseSBuZWVkZWQgZm9yIGNvbnN1bWVyXG4gICAgICAgIExPR19MRVZFTDogJ2RlYnVnJ1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gMy4gQWRkIFNOUyBFdmVudCBTb3VyY2VcbiAgICBoYW5kbGVyLmFkZEV2ZW50U291cmNlKG5ldyBsYW1iZGFFdmVudFNvdXJjZXMuU25zRXZlbnRTb3VyY2UodG9waWMpKTtcblxuICAgIC8vIDQuIE91dHB1dHMgZm9yIFRlc3QgRGlzY292ZXJ5XG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ1Nuc1RvcGljQXJuJywge1xuICAgICAgdmFsdWU6IHRvcGljLnRvcGljQXJuLFxuICAgICAgZGVzY3JpcHRpb246ICdUaGUgQVJOIG9mIHRoZSBTTlMgVG9waWMnLFxuICAgICAgZXhwb3J0TmFtZTogJ0ludGVncmF0aW9uVGVzdFRvcGljQXJuJ1xuICAgIH0pO1xuXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ1Nuc0hhbmRsZXJMb2dHcm91cCcsIHtcbiAgICAgIHZhbHVlOiBoYW5kbGVyLmxvZ0dyb3VwLmxvZ0dyb3VwTmFtZSxcbiAgICAgIGRlc2NyaXB0aW9uOiAnTG9nIEdyb3VwIGZvciBTTlMgSGFuZGxlcidcbiAgICB9KTtcbiAgfVxufVxuIl19