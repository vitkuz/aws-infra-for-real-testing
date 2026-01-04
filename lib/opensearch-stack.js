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
exports.OpenSearchStack = void 0;
const cdk = __importStar(require("aws-cdk-lib"));
const opensearch = __importStar(require("aws-cdk-lib/aws-opensearchservice"));
const lambda = __importStar(require("aws-cdk-lib/aws-lambda"));
const logs = __importStar(require("aws-cdk-lib/aws-logs"));
const aws_lambda_nodejs_1 = require("aws-cdk-lib/aws-lambda-nodejs");
const path = __importStar(require("path"));
class OpenSearchStack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        // 1. Domain
        // Use existing domain as requested to save costs
        const domain = opensearch.Domain.fromDomainAttributes(this, 'ImportedDomain', {
            domainArn: 'arn:aws:es:us-east-1:582347504313:domain/minimalopensear-k7nora94w0ks',
            domainEndpoint: 'search-minimalopensear-k7nora94w0ks-gbhgry4ieohgcafodgg6ytegym.us-east-1.es.amazonaws.com'
        });
        // 2. Lambda
        const handler = new aws_lambda_nodejs_1.NodejsFunction(this, 'OsHandler', {
            runtime: lambda.Runtime.NODEJS_20_X,
            entry: path.join(__dirname, '../handlers/opensearch.ts'),
            handler: 'handler',
            logRetention: logs.RetentionDays.ONE_DAY,
            environment: {
                OPENSEARCH_ENDPOINT: domain.domainEndpoint,
                LOG_LEVEL: 'debug'
            },
            timeout: cdk.Duration.seconds(30)
        });
        // 3. Access Policy
        domain.grantWrite(handler);
        domain.grantRead(handler);
    }
}
exports.OpenSearchStack = OpenSearchStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3BlbnNlYXJjaC1zdGFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIm9wZW5zZWFyY2gtc3RhY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsaURBQW1DO0FBQ25DLDhFQUFnRTtBQUNoRSwrREFBaUQ7QUFDakQsMkRBQTZDO0FBRTdDLHFFQUErRDtBQUUvRCwyQ0FBNkI7QUFFN0IsTUFBYSxlQUFnQixTQUFRLEdBQUcsQ0FBQyxLQUFLO0lBQzFDLFlBQVksS0FBZ0IsRUFBRSxFQUFVLEVBQUUsS0FBc0I7UUFDNUQsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFFeEIsWUFBWTtRQUNaLGlEQUFpRDtRQUNqRCxNQUFNLE1BQU0sR0FBRyxVQUFVLENBQUMsTUFBTSxDQUFDLG9CQUFvQixDQUFDLElBQUksRUFBRSxnQkFBZ0IsRUFBRTtZQUMxRSxTQUFTLEVBQUUsdUVBQXVFO1lBQ2xGLGNBQWMsRUFBRSwyRkFBMkY7U0FDOUcsQ0FBQyxDQUFDO1FBRUgsWUFBWTtRQUNaLE1BQU0sT0FBTyxHQUFHLElBQUksa0NBQWMsQ0FBQyxJQUFJLEVBQUUsV0FBVyxFQUFFO1lBQ2xELE9BQU8sRUFBRSxNQUFNLENBQUMsT0FBTyxDQUFDLFdBQVc7WUFDbkMsS0FBSyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLDJCQUEyQixDQUFDO1lBQ3hELE9BQU8sRUFBRSxTQUFTO1lBQ2xCLFlBQVksRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU87WUFDeEMsV0FBVyxFQUFFO2dCQUNULG1CQUFtQixFQUFFLE1BQU0sQ0FBQyxjQUFjO2dCQUMxQyxTQUFTLEVBQUUsT0FBTzthQUNyQjtZQUNELE9BQU8sRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7U0FDcEMsQ0FBQyxDQUFDO1FBRUgsbUJBQW1CO1FBQ25CLE1BQU0sQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDM0IsTUFBTSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUM5QixDQUFDO0NBQ0o7QUE1QkQsMENBNEJDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgY2RrIGZyb20gJ2F3cy1jZGstbGliJztcbmltcG9ydCAqIGFzIG9wZW5zZWFyY2ggZnJvbSAnYXdzLWNkay1saWIvYXdzLW9wZW5zZWFyY2hzZXJ2aWNlJztcbmltcG9ydCAqIGFzIGxhbWJkYSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtbGFtYmRhJztcbmltcG9ydCAqIGFzIGxvZ3MgZnJvbSAnYXdzLWNkay1saWIvYXdzLWxvZ3MnO1xuaW1wb3J0ICogYXMgaWFtIGZyb20gJ2F3cy1jZGstbGliL2F3cy1pYW0nO1xuaW1wb3J0IHsgTm9kZWpzRnVuY3Rpb24gfSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtbGFtYmRhLW5vZGVqcyc7XG5pbXBvcnQgeyBDb25zdHJ1Y3QgfSBmcm9tICdjb25zdHJ1Y3RzJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5cbmV4cG9ydCBjbGFzcyBPcGVuU2VhcmNoU3RhY2sgZXh0ZW5kcyBjZGsuU3RhY2sge1xuICAgIGNvbnN0cnVjdG9yKHNjb3BlOiBDb25zdHJ1Y3QsIGlkOiBzdHJpbmcsIHByb3BzPzogY2RrLlN0YWNrUHJvcHMpIHtcbiAgICAgICAgc3VwZXIoc2NvcGUsIGlkLCBwcm9wcyk7XG5cbiAgICAgICAgLy8gMS4gRG9tYWluXG4gICAgICAgIC8vIFVzZSBleGlzdGluZyBkb21haW4gYXMgcmVxdWVzdGVkIHRvIHNhdmUgY29zdHNcbiAgICAgICAgY29uc3QgZG9tYWluID0gb3BlbnNlYXJjaC5Eb21haW4uZnJvbURvbWFpbkF0dHJpYnV0ZXModGhpcywgJ0ltcG9ydGVkRG9tYWluJywge1xuICAgICAgICAgICAgZG9tYWluQXJuOiAnYXJuOmF3czplczp1cy1lYXN0LTE6NTgyMzQ3NTA0MzEzOmRvbWFpbi9taW5pbWFsb3BlbnNlYXItazdub3JhOTR3MGtzJyxcbiAgICAgICAgICAgIGRvbWFpbkVuZHBvaW50OiAnc2VhcmNoLW1pbmltYWxvcGVuc2Vhci1rN25vcmE5NHcwa3MtZ2JoZ3J5NGllb2hnY2Fmb2RnZzZ5dGVneW0udXMtZWFzdC0xLmVzLmFtYXpvbmF3cy5jb20nXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIDIuIExhbWJkYVxuICAgICAgICBjb25zdCBoYW5kbGVyID0gbmV3IE5vZGVqc0Z1bmN0aW9uKHRoaXMsICdPc0hhbmRsZXInLCB7XG4gICAgICAgICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5OT0RFSlNfMjBfWCxcbiAgICAgICAgICAgIGVudHJ5OiBwYXRoLmpvaW4oX19kaXJuYW1lLCAnLi4vaGFuZGxlcnMvb3BlbnNlYXJjaC50cycpLFxuICAgICAgICAgICAgaGFuZGxlcjogJ2hhbmRsZXInLFxuICAgICAgICAgICAgbG9nUmV0ZW50aW9uOiBsb2dzLlJldGVudGlvbkRheXMuT05FX0RBWSxcbiAgICAgICAgICAgIGVudmlyb25tZW50OiB7XG4gICAgICAgICAgICAgICAgT1BFTlNFQVJDSF9FTkRQT0lOVDogZG9tYWluLmRvbWFpbkVuZHBvaW50LFxuICAgICAgICAgICAgICAgIExPR19MRVZFTDogJ2RlYnVnJ1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHRpbWVvdXQ6IGNkay5EdXJhdGlvbi5zZWNvbmRzKDMwKVxuICAgICAgICB9KTtcblxuICAgICAgICAvLyAzLiBBY2Nlc3MgUG9saWN5XG4gICAgICAgIGRvbWFpbi5ncmFudFdyaXRlKGhhbmRsZXIpO1xuICAgICAgICBkb21haW4uZ3JhbnRSZWFkKGhhbmRsZXIpO1xuICAgIH1cbn1cbiJdfQ==