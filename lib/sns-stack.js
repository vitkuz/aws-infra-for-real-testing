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
            entry: path.join(__dirname, '../handlers/sns-handler/index.ts'),
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic25zLXN0YWNrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsic25zLXN0YWNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLGlEQUFtQztBQUNuQyx5REFBMkM7QUFDM0MsK0RBQWlEO0FBQ2pELDJEQUE2QztBQUM3QyxxRUFBK0Q7QUFFL0QsMkNBQTZCO0FBRTdCLE1BQWEsUUFBUyxTQUFRLEdBQUcsQ0FBQyxLQUFLO0lBQ25DLFlBQVksS0FBZ0IsRUFBRSxFQUFVLEVBQUUsS0FBc0I7UUFDNUQsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFFeEIsc0JBQXNCO1FBQ3RCLE1BQU0sS0FBSyxHQUFHLElBQUksR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsV0FBVyxFQUFFO1lBQzNDLFdBQVcsRUFBRSxtQkFBbUI7U0FDbkMsQ0FBQyxDQUFDO1FBRUgsNEJBQTRCO1FBQzVCLE1BQU0sT0FBTyxHQUFHLElBQUksa0NBQWMsQ0FBQyxJQUFJLEVBQUUsWUFBWSxFQUFFO1lBQ25ELE9BQU8sRUFBRSxNQUFNLENBQUMsT0FBTyxDQUFDLFdBQVc7WUFDbkMsS0FBSyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLGtDQUFrQyxDQUFDO1lBQy9ELE9BQU8sRUFBRSxTQUFTO1lBQ2xCLFlBQVksRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU87WUFDeEMsV0FBVyxFQUFFO2dCQUNULFNBQVMsRUFBRSxLQUFLLENBQUMsUUFBUTtnQkFDekIsU0FBUyxFQUFFLE9BQU87YUFDckI7WUFDRCxRQUFRLEVBQUU7Z0JBQ04sZUFBZSxFQUFFLENBQUMsU0FBUyxDQUFDO2FBQy9CO1NBQ0osQ0FBQyxDQUFDO1FBRUgsMEJBQTBCO1FBQzFCLGlFQUFpRTtRQUNqRSxNQUFNLEVBQUUsY0FBYyxFQUFFLEdBQUcsT0FBTyxDQUFDLHNDQUFzQyxDQUFDLENBQUM7UUFDM0UsT0FBTyxDQUFDLGNBQWMsQ0FBQyxJQUFJLGNBQWMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBRWxELGdDQUFnQztRQUNoQyxJQUFJLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLGFBQWEsRUFBRTtZQUNuQyxLQUFLLEVBQUUsS0FBSyxDQUFDLFFBQVE7WUFDckIsV0FBVyxFQUFFLDBCQUEwQjtZQUN2QyxVQUFVLEVBQUUseUJBQXlCO1NBQ3hDLENBQUMsQ0FBQztRQUVILElBQUksR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsb0JBQW9CLEVBQUU7WUFDMUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxRQUFRLENBQUMsWUFBWTtZQUNwQyxXQUFXLEVBQUUsMkJBQTJCO1NBQzNDLENBQUMsQ0FBQztJQUNQLENBQUM7Q0FDSjtBQXpDRCw0QkF5Q0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBjZGsgZnJvbSAnYXdzLWNkay1saWInO1xuaW1wb3J0ICogYXMgc25zIGZyb20gJ2F3cy1jZGstbGliL2F3cy1zbnMnO1xuaW1wb3J0ICogYXMgbGFtYmRhIGZyb20gJ2F3cy1jZGstbGliL2F3cy1sYW1iZGEnO1xuaW1wb3J0ICogYXMgbG9ncyBmcm9tICdhd3MtY2RrLWxpYi9hd3MtbG9ncyc7XG5pbXBvcnQgeyBOb2RlanNGdW5jdGlvbiB9IGZyb20gJ2F3cy1jZGstbGliL2F3cy1sYW1iZGEtbm9kZWpzJztcbmltcG9ydCB7IENvbnN0cnVjdCB9IGZyb20gJ2NvbnN0cnVjdHMnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcblxuZXhwb3J0IGNsYXNzIFNuc1N0YWNrIGV4dGVuZHMgY2RrLlN0YWNrIHtcbiAgICBjb25zdHJ1Y3RvcihzY29wZTogQ29uc3RydWN0LCBpZDogc3RyaW5nLCBwcm9wcz86IGNkay5TdGFja1Byb3BzKSB7XG4gICAgICAgIHN1cGVyKHNjb3BlLCBpZCwgcHJvcHMpO1xuXG4gICAgICAgIC8vIDEuIENyZWF0ZSBTTlMgVG9waWNcbiAgICAgICAgY29uc3QgdG9waWMgPSBuZXcgc25zLlRvcGljKHRoaXMsICdUZXN0VG9waWMnLCB7XG4gICAgICAgICAgICBkaXNwbGF5TmFtZTogJ1ZpdGt1eiBUZXN0IFRvcGljJ1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyAyLiBDcmVhdGUgTGFtYmRhIEZ1bmN0aW9uXG4gICAgICAgIGNvbnN0IGhhbmRsZXIgPSBuZXcgTm9kZWpzRnVuY3Rpb24odGhpcywgJ1Nuc0hhbmRsZXInLCB7XG4gICAgICAgICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5OT0RFSlNfMjBfWCxcbiAgICAgICAgICAgIGVudHJ5OiBwYXRoLmpvaW4oX19kaXJuYW1lLCAnLi4vaGFuZGxlcnMvc25zLWhhbmRsZXIvaW5kZXgudHMnKSxcbiAgICAgICAgICAgIGhhbmRsZXI6ICdoYW5kbGVyJyxcbiAgICAgICAgICAgIGxvZ1JldGVudGlvbjogbG9ncy5SZXRlbnRpb25EYXlzLk9ORV9EQVksXG4gICAgICAgICAgICBlbnZpcm9ubWVudDoge1xuICAgICAgICAgICAgICAgIFRPUElDX0FSTjogdG9waWMudG9waWNBcm4sXG4gICAgICAgICAgICAgICAgTE9HX0xFVkVMOiAnZGVidWcnXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgYnVuZGxpbmc6IHtcbiAgICAgICAgICAgICAgICBleHRlcm5hbE1vZHVsZXM6IFsnYXdzLXNkayddLFxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICAvLyAzLiBBZGQgU05TIEV2ZW50IFNvdXJjZVxuICAgICAgICAvLyBXZSBuZWVkIHRvIGltcG9ydCBTbnNFdmVudFNvdXJjZSBmcm9tIGF3cy1sYW1iZGEtZXZlbnQtc291cmNlc1xuICAgICAgICBjb25zdCB7IFNuc0V2ZW50U291cmNlIH0gPSByZXF1aXJlKCdhd3MtY2RrLWxpYi9hd3MtbGFtYmRhLWV2ZW50LXNvdXJjZXMnKTtcbiAgICAgICAgaGFuZGxlci5hZGRFdmVudFNvdXJjZShuZXcgU25zRXZlbnRTb3VyY2UodG9waWMpKTtcblxuICAgICAgICAvLyA0LiBPdXRwdXRzIGZvciBUZXN0IERpc2NvdmVyeVxuICAgICAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCAnU25zVG9waWNBcm4nLCB7XG4gICAgICAgICAgICB2YWx1ZTogdG9waWMudG9waWNBcm4sXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogJ1RoZSBBUk4gb2YgdGhlIFNOUyBUb3BpYycsXG4gICAgICAgICAgICBleHBvcnROYW1lOiAnSW50ZWdyYXRpb25UZXN0VG9waWNBcm4nXG4gICAgICAgIH0pO1xuXG4gICAgICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsICdTbnNIYW5kbGVyTG9nR3JvdXAnLCB7XG4gICAgICAgICAgICB2YWx1ZTogaGFuZGxlci5sb2dHcm91cC5sb2dHcm91cE5hbWUsXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogJ0xvZyBHcm91cCBmb3IgU05TIEhhbmRsZXInXG4gICAgICAgIH0pO1xuICAgIH1cbn1cbiJdfQ==