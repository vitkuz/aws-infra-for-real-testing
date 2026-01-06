#!/usr/bin/env node
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
require("source-map-support/register");
const cdk = __importStar(require("aws-cdk-lib"));
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const sns_stack_1 = require("../lib/sns-stack");
const sqs_stack_1 = require("../lib/sqs-stack");
const dynamo_stack_1 = require("../lib/dynamo-stack");
const s3_stack_1 = require("../lib/s3-stack");
const opensearch_stack_1 = require("../lib/opensearch-stack");
const sns_sqs_lambda_stack_1 = require("../lib/sns-sqs-lambda-stack");
const api_stack_1 = require("../lib/api-stack");
const http_api_stack_1 = require("../lib/http-api-stack");
const search_sync_stack_1 = require("../lib/search-sync-stack");
const app = new cdk.App();
const env = {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION
};
// Original boilerplate stack might be present, we can ignore or delete it.
// e.g. AwsInfraForRealTestingStack
new sns_stack_1.SnsStack(app, 'VitkuzTestingSnsStack', { env, stackName: 'vitkuz-testing-sns' });
new sqs_stack_1.SqsStack(app, 'VitkuzTestingSqsStack', { env, stackName: 'vitkuz-testing-sqs' });
new dynamo_stack_1.DynamoStack(app, 'VitkuzTestingDynamoStack', { env, stackName: 'vitkuz-testing-dynamo' });
new s3_stack_1.S3Stack(app, 'VitkuzTestingS3Stack', { env, stackName: 'vitkuz-testing-s3' });
new opensearch_stack_1.OpenSearchStack(app, 'VitkuzTestingOpenSearchStack', { env, stackName: 'vitkuz-testing-opensearch' });
new sns_sqs_lambda_stack_1.SnsSqsLambdaStack(app, 'VitkuzTestingSnsSqsStack', { env, stackName: 'vitkuz-testing-sns-sqs' });
new api_stack_1.ApiStack(app, 'VitkuzTestingApiStack', { env, stackName: 'vitkuz-testing-api' });
new http_api_stack_1.HttpApiStack(app, 'VitkuzTestingHttpApiStack', { env, stackName: 'vitkuz-testing-http-api' });
new search_sync_stack_1.SearchSyncStack(app, 'VitkuzTestingSearchSyncStack', { env, stackName: 'vitkuz-testing-search-sync' });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXdzLWluZnJhLWZvci1yZWFsLXRlc3RpbmcuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhd3MtaW5mcmEtZm9yLXJlYWwtdGVzdGluZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFDQSx1Q0FBcUM7QUFDckMsaURBQW1DO0FBQ25DLCtDQUFpQztBQUVqQyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUM7QUFDaEIsZ0RBQTRDO0FBQzVDLGdEQUE0QztBQUM1QyxzREFBa0Q7QUFDbEQsOENBQTBDO0FBQzFDLDhEQUEwRDtBQUMxRCxzRUFBZ0U7QUFDaEUsZ0RBQTRDO0FBQzVDLDBEQUFxRDtBQUNyRCxnRUFBMkQ7QUFHM0QsTUFBTSxHQUFHLEdBQUcsSUFBSSxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUM7QUFDMUIsTUFBTSxHQUFHLEdBQUc7SUFDVixPQUFPLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxtQkFBbUI7SUFDeEMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsa0JBQWtCO0NBQ3ZDLENBQUM7QUFFRiwyRUFBMkU7QUFDM0UsbUNBQW1DO0FBRW5DLElBQUksb0JBQVEsQ0FBQyxHQUFHLEVBQUUsdUJBQXVCLEVBQUUsRUFBRSxHQUFHLEVBQUUsU0FBUyxFQUFFLG9CQUFvQixFQUFFLENBQUMsQ0FBQztBQUNyRixJQUFJLG9CQUFRLENBQUMsR0FBRyxFQUFFLHVCQUF1QixFQUFFLEVBQUUsR0FBRyxFQUFFLFNBQVMsRUFBRSxvQkFBb0IsRUFBRSxDQUFDLENBQUM7QUFDckYsSUFBSSwwQkFBVyxDQUFDLEdBQUcsRUFBRSwwQkFBMEIsRUFBRSxFQUFFLEdBQUcsRUFBRSxTQUFTLEVBQUUsdUJBQXVCLEVBQUUsQ0FBQyxDQUFDO0FBQzlGLElBQUksa0JBQU8sQ0FBQyxHQUFHLEVBQUUsc0JBQXNCLEVBQUUsRUFBRSxHQUFHLEVBQUUsU0FBUyxFQUFFLG1CQUFtQixFQUFFLENBQUMsQ0FBQztBQUNsRixJQUFJLGtDQUFlLENBQUMsR0FBRyxFQUFFLDhCQUE4QixFQUFFLEVBQUUsR0FBRyxFQUFFLFNBQVMsRUFBRSwyQkFBMkIsRUFBRSxDQUFDLENBQUM7QUFDMUcsSUFBSSx3Q0FBaUIsQ0FBQyxHQUFHLEVBQUUsMEJBQTBCLEVBQUUsRUFBRSxHQUFHLEVBQUUsU0FBUyxFQUFFLHdCQUF3QixFQUFFLENBQUMsQ0FBQztBQUNyRyxJQUFJLG9CQUFRLENBQUMsR0FBRyxFQUFFLHVCQUF1QixFQUFFLEVBQUUsR0FBRyxFQUFFLFNBQVMsRUFBRSxvQkFBb0IsRUFBRSxDQUFDLENBQUM7QUFDckYsSUFBSSw2QkFBWSxDQUFDLEdBQUcsRUFBRSwyQkFBMkIsRUFBRSxFQUFFLEdBQUcsRUFBRSxTQUFTLEVBQUUseUJBQXlCLEVBQUUsQ0FBQyxDQUFDO0FBQ2xHLElBQUksbUNBQWUsQ0FBQyxHQUFHLEVBQUUsOEJBQThCLEVBQUUsRUFBRSxHQUFHLEVBQUUsU0FBUyxFQUFFLDRCQUE0QixFQUFFLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIiMhL3Vzci9iaW4vZW52IG5vZGVcbmltcG9ydCAnc291cmNlLW1hcC1zdXBwb3J0L3JlZ2lzdGVyJztcbmltcG9ydCAqIGFzIGNkayBmcm9tICdhd3MtY2RrLWxpYic7XG5pbXBvcnQgKiBhcyBkb3RlbnYgZnJvbSAnZG90ZW52JztcblxuZG90ZW52LmNvbmZpZygpO1xuaW1wb3J0IHsgU25zU3RhY2sgfSBmcm9tICcuLi9saWIvc25zLXN0YWNrJztcbmltcG9ydCB7IFNxc1N0YWNrIH0gZnJvbSAnLi4vbGliL3Nxcy1zdGFjayc7XG5pbXBvcnQgeyBEeW5hbW9TdGFjayB9IGZyb20gJy4uL2xpYi9keW5hbW8tc3RhY2snO1xuaW1wb3J0IHsgUzNTdGFjayB9IGZyb20gJy4uL2xpYi9zMy1zdGFjayc7XG5pbXBvcnQgeyBPcGVuU2VhcmNoU3RhY2sgfSBmcm9tICcuLi9saWIvb3BlbnNlYXJjaC1zdGFjayc7XG5pbXBvcnQgeyBTbnNTcXNMYW1iZGFTdGFjayB9IGZyb20gJy4uL2xpYi9zbnMtc3FzLWxhbWJkYS1zdGFjayc7XG5pbXBvcnQgeyBBcGlTdGFjayB9IGZyb20gJy4uL2xpYi9hcGktc3RhY2snO1xuaW1wb3J0IHsgSHR0cEFwaVN0YWNrIH0gZnJvbSAnLi4vbGliL2h0dHAtYXBpLXN0YWNrJztcbmltcG9ydCB7IFNlYXJjaFN5bmNTdGFjayB9IGZyb20gJy4uL2xpYi9zZWFyY2gtc3luYy1zdGFjayc7XG5cblxuY29uc3QgYXBwID0gbmV3IGNkay5BcHAoKTtcbmNvbnN0IGVudiA9IHtcbiAgYWNjb3VudDogcHJvY2Vzcy5lbnYuQ0RLX0RFRkFVTFRfQUNDT1VOVCxcbiAgcmVnaW9uOiBwcm9jZXNzLmVudi5DREtfREVGQVVMVF9SRUdJT05cbn07XG5cbi8vIE9yaWdpbmFsIGJvaWxlcnBsYXRlIHN0YWNrIG1pZ2h0IGJlIHByZXNlbnQsIHdlIGNhbiBpZ25vcmUgb3IgZGVsZXRlIGl0LlxuLy8gZS5nLiBBd3NJbmZyYUZvclJlYWxUZXN0aW5nU3RhY2tcblxubmV3IFNuc1N0YWNrKGFwcCwgJ1ZpdGt1elRlc3RpbmdTbnNTdGFjaycsIHsgZW52LCBzdGFja05hbWU6ICd2aXRrdXotdGVzdGluZy1zbnMnIH0pO1xubmV3IFNxc1N0YWNrKGFwcCwgJ1ZpdGt1elRlc3RpbmdTcXNTdGFjaycsIHsgZW52LCBzdGFja05hbWU6ICd2aXRrdXotdGVzdGluZy1zcXMnIH0pO1xubmV3IER5bmFtb1N0YWNrKGFwcCwgJ1ZpdGt1elRlc3RpbmdEeW5hbW9TdGFjaycsIHsgZW52LCBzdGFja05hbWU6ICd2aXRrdXotdGVzdGluZy1keW5hbW8nIH0pO1xubmV3IFMzU3RhY2soYXBwLCAnVml0a3V6VGVzdGluZ1MzU3RhY2snLCB7IGVudiwgc3RhY2tOYW1lOiAndml0a3V6LXRlc3RpbmctczMnIH0pO1xubmV3IE9wZW5TZWFyY2hTdGFjayhhcHAsICdWaXRrdXpUZXN0aW5nT3BlblNlYXJjaFN0YWNrJywgeyBlbnYsIHN0YWNrTmFtZTogJ3ZpdGt1ei10ZXN0aW5nLW9wZW5zZWFyY2gnIH0pO1xubmV3IFNuc1Nxc0xhbWJkYVN0YWNrKGFwcCwgJ1ZpdGt1elRlc3RpbmdTbnNTcXNTdGFjaycsIHsgZW52LCBzdGFja05hbWU6ICd2aXRrdXotdGVzdGluZy1zbnMtc3FzJyB9KTtcbm5ldyBBcGlTdGFjayhhcHAsICdWaXRrdXpUZXN0aW5nQXBpU3RhY2snLCB7IGVudiwgc3RhY2tOYW1lOiAndml0a3V6LXRlc3RpbmctYXBpJyB9KTtcbm5ldyBIdHRwQXBpU3RhY2soYXBwLCAnVml0a3V6VGVzdGluZ0h0dHBBcGlTdGFjaycsIHsgZW52LCBzdGFja05hbWU6ICd2aXRrdXotdGVzdGluZy1odHRwLWFwaScgfSk7XG5uZXcgU2VhcmNoU3luY1N0YWNrKGFwcCwgJ1ZpdGt1elRlc3RpbmdTZWFyY2hTeW5jU3RhY2snLCB7IGVudiwgc3RhY2tOYW1lOiAndml0a3V6LXRlc3Rpbmctc2VhcmNoLXN5bmMnIH0pO1xuXG4iXX0=