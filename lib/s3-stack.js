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
exports.S3Stack = void 0;
const cdk = __importStar(require("aws-cdk-lib"));
const s3 = __importStar(require("aws-cdk-lib/aws-s3"));
const lambda = __importStar(require("aws-cdk-lib/aws-lambda"));
const logs = __importStar(require("aws-cdk-lib/aws-logs"));
const aws_lambda_nodejs_1 = require("aws-cdk-lib/aws-lambda-nodejs");
const path = __importStar(require("path"));
class S3Stack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        const bucket = new s3.Bucket(this, 'TestBucket', {
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            autoDeleteObjects: true
        });
        const handler = new aws_lambda_nodejs_1.NodejsFunction(this, 'S3Handler', {
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
exports.S3Stack = S3Stack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiczMtc3RhY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJzMy1zdGFjay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxpREFBbUM7QUFDbkMsdURBQXlDO0FBQ3pDLCtEQUFpRDtBQUNqRCwyREFBNkM7QUFDN0MscUVBQStEO0FBRS9ELDJDQUE2QjtBQUU3QixNQUFhLE9BQVEsU0FBUSxHQUFHLENBQUMsS0FBSztJQUNsQyxZQUFZLEtBQWdCLEVBQUUsRUFBVSxFQUFFLEtBQXNCO1FBQzVELEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRXhCLE1BQU0sTUFBTSxHQUFHLElBQUksRUFBRSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsWUFBWSxFQUFFO1lBQzdDLGFBQWEsRUFBRSxHQUFHLENBQUMsYUFBYSxDQUFDLE9BQU87WUFDeEMsaUJBQWlCLEVBQUUsSUFBSTtTQUMxQixDQUFDLENBQUM7UUFFSCxNQUFNLE9BQU8sR0FBRyxJQUFJLGtDQUFjLENBQUMsSUFBSSxFQUFFLFdBQVcsRUFBRTtZQUNsRCxPQUFPLEVBQUUsTUFBTSxDQUFDLE9BQU8sQ0FBQyxXQUFXO1lBQ25DLEtBQUssRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxtQkFBbUIsQ0FBQztZQUNoRCxPQUFPLEVBQUUsU0FBUztZQUNsQixZQUFZLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPO1lBQ3hDLFdBQVcsRUFBRTtnQkFDVCxXQUFXLEVBQUUsTUFBTSxDQUFDLFVBQVU7Z0JBQzlCLFNBQVMsRUFBRSxPQUFPO2FBQ3JCO1NBQ0osQ0FBQyxDQUFDO1FBRUgsTUFBTSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUUvQix5QkFBeUI7UUFDekIsbUVBQW1FO1FBQ25FLE1BQU0sRUFBRSxhQUFhLEVBQUUsR0FBRyxPQUFPLENBQUMsc0NBQXNDLENBQUMsQ0FBQztRQUMxRSxPQUFPLENBQUMsY0FBYyxDQUFDLElBQUksYUFBYSxDQUFDLE1BQU0sRUFBRTtZQUM3QyxNQUFNLEVBQUUsQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQztTQUN4QyxDQUFDLENBQUMsQ0FBQztRQUVKLGdDQUFnQztRQUNoQyxJQUFJLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLFlBQVksRUFBRTtZQUNsQyxLQUFLLEVBQUUsTUFBTSxDQUFDLFVBQVU7WUFDeEIsV0FBVyxFQUFFLDJCQUEyQjtZQUN4QyxVQUFVLEVBQUUsMkJBQTJCO1NBQzFDLENBQUMsQ0FBQztRQUVILElBQUksR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsbUJBQW1CLEVBQUU7WUFDekMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxRQUFRLENBQUMsWUFBWTtZQUNwQyxXQUFXLEVBQUUsMEJBQTBCO1NBQzFDLENBQUMsQ0FBQztJQUNQLENBQUM7Q0FDSjtBQXpDRCwwQkF5Q0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBjZGsgZnJvbSAnYXdzLWNkay1saWInO1xuaW1wb3J0ICogYXMgczMgZnJvbSAnYXdzLWNkay1saWIvYXdzLXMzJztcbmltcG9ydCAqIGFzIGxhbWJkYSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtbGFtYmRhJztcbmltcG9ydCAqIGFzIGxvZ3MgZnJvbSAnYXdzLWNkay1saWIvYXdzLWxvZ3MnO1xuaW1wb3J0IHsgTm9kZWpzRnVuY3Rpb24gfSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtbGFtYmRhLW5vZGVqcyc7XG5pbXBvcnQgeyBDb25zdHJ1Y3QgfSBmcm9tICdjb25zdHJ1Y3RzJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5cbmV4cG9ydCBjbGFzcyBTM1N0YWNrIGV4dGVuZHMgY2RrLlN0YWNrIHtcbiAgICBjb25zdHJ1Y3RvcihzY29wZTogQ29uc3RydWN0LCBpZDogc3RyaW5nLCBwcm9wcz86IGNkay5TdGFja1Byb3BzKSB7XG4gICAgICAgIHN1cGVyKHNjb3BlLCBpZCwgcHJvcHMpO1xuXG4gICAgICAgIGNvbnN0IGJ1Y2tldCA9IG5ldyBzMy5CdWNrZXQodGhpcywgJ1Rlc3RCdWNrZXQnLCB7XG4gICAgICAgICAgICByZW1vdmFsUG9saWN5OiBjZGsuUmVtb3ZhbFBvbGljeS5ERVNUUk9ZLFxuICAgICAgICAgICAgYXV0b0RlbGV0ZU9iamVjdHM6IHRydWVcbiAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc3QgaGFuZGxlciA9IG5ldyBOb2RlanNGdW5jdGlvbih0aGlzLCAnUzNIYW5kbGVyJywge1xuICAgICAgICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuTk9ERUpTXzIwX1gsXG4gICAgICAgICAgICBlbnRyeTogcGF0aC5qb2luKF9fZGlybmFtZSwgJy4uL2hhbmRsZXJzL3MzLnRzJyksXG4gICAgICAgICAgICBoYW5kbGVyOiAnaGFuZGxlcicsXG4gICAgICAgICAgICBsb2dSZXRlbnRpb246IGxvZ3MuUmV0ZW50aW9uRGF5cy5PTkVfREFZLFxuICAgICAgICAgICAgZW52aXJvbm1lbnQ6IHtcbiAgICAgICAgICAgICAgICBCVUNLRVRfTkFNRTogYnVja2V0LmJ1Y2tldE5hbWUsXG4gICAgICAgICAgICAgICAgTE9HX0xFVkVMOiAnZGVidWcnXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGJ1Y2tldC5ncmFudFJlYWRXcml0ZShoYW5kbGVyKTtcblxuICAgICAgICAvLyAzLiBBZGQgUzMgRXZlbnQgU291cmNlXG4gICAgICAgIC8vIEltcG9ydCBTM0V2ZW50U291cmNlIGZyb20gJ2F3cy1jZGstbGliL2F3cy1sYW1iZGEtZXZlbnQtc291cmNlcydcbiAgICAgICAgY29uc3QgeyBTM0V2ZW50U291cmNlIH0gPSByZXF1aXJlKCdhd3MtY2RrLWxpYi9hd3MtbGFtYmRhLWV2ZW50LXNvdXJjZXMnKTtcbiAgICAgICAgaGFuZGxlci5hZGRFdmVudFNvdXJjZShuZXcgUzNFdmVudFNvdXJjZShidWNrZXQsIHtcbiAgICAgICAgICAgIGV2ZW50czogW3MzLkV2ZW50VHlwZS5PQkpFQ1RfQ1JFQVRFRF1cbiAgICAgICAgfSkpO1xuXG4gICAgICAgIC8vIDQuIE91dHB1dHMgZm9yIFRlc3QgRGlzY292ZXJ5XG4gICAgICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsICdCdWNrZXROYW1lJywge1xuICAgICAgICAgICAgdmFsdWU6IGJ1Y2tldC5idWNrZXROYW1lLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246ICdUaGUgTmFtZSBvZiB0aGUgUzMgQnVja2V0JyxcbiAgICAgICAgICAgIGV4cG9ydE5hbWU6ICdJbnRlZ3JhdGlvblRlc3RCdWNrZXROYW1lJ1xuICAgICAgICB9KTtcblxuICAgICAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCAnUzNIYW5kbGVyTG9nR3JvdXAnLCB7XG4gICAgICAgICAgICB2YWx1ZTogaGFuZGxlci5sb2dHcm91cC5sb2dHcm91cE5hbWUsXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogJ0xvZyBHcm91cCBmb3IgUzMgSGFuZGxlcidcbiAgICAgICAgfSk7XG4gICAgfVxufVxuIl19