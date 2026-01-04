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
exports.SnsSqsLambdaStack = void 0;
const cdk = __importStar(require("aws-cdk-lib"));
const sns = __importStar(require("aws-cdk-lib/aws-sns"));
const subs = __importStar(require("aws-cdk-lib/aws-sns-subscriptions"));
const sqs = __importStar(require("aws-cdk-lib/aws-sqs"));
const lambda = __importStar(require("aws-cdk-lib/aws-lambda"));
const lambdaEventSources = __importStar(require("aws-cdk-lib/aws-lambda-event-sources"));
const nodejs = __importStar(require("aws-cdk-lib/aws-lambda-nodejs"));
const path = __importStar(require("path"));
class SnsSqsLambdaStack extends cdk.Stack {
    constructor(scope, id, props) {
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
            entry: path.join(__dirname, '../handlers/sqs-processor.ts'),
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
exports.SnsSqsLambdaStack = SnsSqsLambdaStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic25zLXNxcy1sYW1iZGEtc3RhY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJzbnMtc3FzLWxhbWJkYS1zdGFjay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxpREFBbUM7QUFFbkMseURBQTJDO0FBQzNDLHdFQUEwRDtBQUMxRCx5REFBMkM7QUFDM0MsK0RBQWlEO0FBQ2pELHlGQUEyRTtBQUMzRSxzRUFBd0Q7QUFDeEQsMkNBQTZCO0FBRTdCLE1BQWEsaUJBQWtCLFNBQVEsR0FBRyxDQUFDLEtBQUs7SUFDNUMsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxLQUFzQjtRQUM1RCxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUV4QixzQkFBc0I7UUFDdEIsTUFBTSxLQUFLLEdBQUcsSUFBSSxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxTQUFTLEVBQUU7WUFDekMsV0FBVyxFQUFFLDJCQUEyQjtTQUMzQyxDQUFDLENBQUM7UUFFSCxzQkFBc0I7UUFDdEIsTUFBTSxLQUFLLEdBQUcsSUFBSSxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxTQUFTLEVBQUU7WUFDekMsaUJBQWlCLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDO1NBQy9DLENBQUMsQ0FBQztRQUVILDhCQUE4QjtRQUM5QixLQUFLLENBQUMsZUFBZSxDQUFDLElBQUksSUFBSSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBRXZELDRCQUE0QjtRQUM1QixNQUFNLFNBQVMsR0FBRyxJQUFJLE1BQU0sQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLGNBQWMsRUFBRTtZQUM5RCxPQUFPLEVBQUUsTUFBTSxDQUFDLE9BQU8sQ0FBQyxXQUFXO1lBQ25DLEtBQUssRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSw4QkFBOEIsQ0FBQztZQUMzRCxPQUFPLEVBQUUsU0FBUztZQUNsQixXQUFXLEVBQUU7Z0JBQ1QsU0FBUyxFQUFFLEtBQUssQ0FBQyxRQUFRO2dCQUN6QixTQUFTLEVBQUUsT0FBTzthQUNyQjtTQUNKLENBQUMsQ0FBQztRQUVILHdDQUF3QztRQUN4QyxTQUFTLENBQUMsY0FBYyxDQUFDLElBQUksa0JBQWtCLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFFdkUsYUFBYTtRQUNiLElBQUksR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsVUFBVSxFQUFFO1lBQ2hDLEtBQUssRUFBRSxLQUFLLENBQUMsUUFBUTtZQUNyQixXQUFXLEVBQUUsc0JBQXNCO1NBQ3RDLENBQUMsQ0FBQztRQUVILElBQUksR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsVUFBVSxFQUFFO1lBQ2hDLEtBQUssRUFBRSxLQUFLLENBQUMsUUFBUTtZQUNyQixXQUFXLEVBQUUsc0JBQXNCO1NBQ3RDLENBQUMsQ0FBQztRQUVILElBQUksR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsbUJBQW1CLEVBQUU7WUFDekMsS0FBSyxFQUFFLFNBQVMsQ0FBQyxRQUFRLENBQUMsWUFBWTtZQUN0QyxXQUFXLEVBQUUsNkJBQTZCO1NBQzdDLENBQUMsQ0FBQztJQUNQLENBQUM7Q0FDSjtBQS9DRCw4Q0ErQ0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBjZGsgZnJvbSAnYXdzLWNkay1saWInO1xuaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSAnY29uc3RydWN0cyc7XG5pbXBvcnQgKiBhcyBzbnMgZnJvbSAnYXdzLWNkay1saWIvYXdzLXNucyc7XG5pbXBvcnQgKiBhcyBzdWJzIGZyb20gJ2F3cy1jZGstbGliL2F3cy1zbnMtc3Vic2NyaXB0aW9ucyc7XG5pbXBvcnQgKiBhcyBzcXMgZnJvbSAnYXdzLWNkay1saWIvYXdzLXNxcyc7XG5pbXBvcnQgKiBhcyBsYW1iZGEgZnJvbSAnYXdzLWNkay1saWIvYXdzLWxhbWJkYSc7XG5pbXBvcnQgKiBhcyBsYW1iZGFFdmVudFNvdXJjZXMgZnJvbSAnYXdzLWNkay1saWIvYXdzLWxhbWJkYS1ldmVudC1zb3VyY2VzJztcbmltcG9ydCAqIGFzIG5vZGVqcyBmcm9tICdhd3MtY2RrLWxpYi9hd3MtbGFtYmRhLW5vZGVqcyc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuXG5leHBvcnQgY2xhc3MgU25zU3FzTGFtYmRhU3RhY2sgZXh0ZW5kcyBjZGsuU3RhY2sge1xuICAgIGNvbnN0cnVjdG9yKHNjb3BlOiBDb25zdHJ1Y3QsIGlkOiBzdHJpbmcsIHByb3BzPzogY2RrLlN0YWNrUHJvcHMpIHtcbiAgICAgICAgc3VwZXIoc2NvcGUsIGlkLCBwcm9wcyk7XG5cbiAgICAgICAgLy8gMS4gQ3JlYXRlIFNOUyBUb3BpY1xuICAgICAgICBjb25zdCB0b3BpYyA9IG5ldyBzbnMuVG9waWModGhpcywgJ015VG9waWMnLCB7XG4gICAgICAgICAgICBkaXNwbGF5TmFtZTogJ015IEludGVncmF0aW9uIFRlc3QgVG9waWMnXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIDIuIENyZWF0ZSBTUVMgUXVldWVcbiAgICAgICAgY29uc3QgcXVldWUgPSBuZXcgc3FzLlF1ZXVlKHRoaXMsICdNeVF1ZXVlJywge1xuICAgICAgICAgICAgdmlzaWJpbGl0eVRpbWVvdXQ6IGNkay5EdXJhdGlvbi5zZWNvbmRzKDMwMClcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gMy4gU3Vic2NyaWJlIFF1ZXVlIHRvIFRvcGljXG4gICAgICAgIHRvcGljLmFkZFN1YnNjcmlwdGlvbihuZXcgc3Vicy5TcXNTdWJzY3JpcHRpb24ocXVldWUpKTtcblxuICAgICAgICAvLyA0LiBDcmVhdGUgTGFtYmRhIEZ1bmN0aW9uXG4gICAgICAgIGNvbnN0IHByb2Nlc3NvciA9IG5ldyBub2RlanMuTm9kZWpzRnVuY3Rpb24odGhpcywgJ1Nxc1Byb2Nlc3NvcicsIHtcbiAgICAgICAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLk5PREVKU18yMF9YLFxuICAgICAgICAgICAgZW50cnk6IHBhdGguam9pbihfX2Rpcm5hbWUsICcuLi9oYW5kbGVycy9zcXMtcHJvY2Vzc29yLnRzJyksXG4gICAgICAgICAgICBoYW5kbGVyOiAnaGFuZGxlcicsXG4gICAgICAgICAgICBlbnZpcm9ubWVudDoge1xuICAgICAgICAgICAgICAgIFFVRVVFX1VSTDogcXVldWUucXVldWVVcmwsXG4gICAgICAgICAgICAgICAgTE9HX0xFVkVMOiAnZGVidWcnXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIDUuIEFkZCBTUVMgYXMgRXZlbnQgU291cmNlIGZvciBMYW1iZGFcbiAgICAgICAgcHJvY2Vzc29yLmFkZEV2ZW50U291cmNlKG5ldyBsYW1iZGFFdmVudFNvdXJjZXMuU3FzRXZlbnRTb3VyY2UocXVldWUpKTtcblxuICAgICAgICAvLyA2LiBPdXRwdXRzXG4gICAgICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsICdUb3BpY0FybicsIHtcbiAgICAgICAgICAgIHZhbHVlOiB0b3BpYy50b3BpY0FybixcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnQVJOIG9mIHRoZSBTTlMgVG9waWMnXG4gICAgICAgIH0pO1xuXG4gICAgICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsICdRdWV1ZVVybCcsIHtcbiAgICAgICAgICAgIHZhbHVlOiBxdWV1ZS5xdWV1ZVVybCxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnVVJMIG9mIHRoZSBTUVMgUXVldWUnXG4gICAgICAgIH0pO1xuXG4gICAgICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsICdQcm9jZXNzb3JMb2dHcm91cCcsIHtcbiAgICAgICAgICAgIHZhbHVlOiBwcm9jZXNzb3IubG9nR3JvdXAubG9nR3JvdXBOYW1lLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246ICdMb2cgR3JvdXAgZm9yIFNRUyBQcm9jZXNzb3InXG4gICAgICAgIH0pO1xuICAgIH1cbn1cbiJdfQ==