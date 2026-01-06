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
const client_cloudformation_1 = require("@aws-sdk/client-cloudformation");
const client_cloudwatch_logs_1 = require("@aws-sdk/client-cloudwatch-logs");
const crypto = __importStar(require("crypto"));
const STACK_NAME = 'vitkuz-testing-api';
const REGION = process.env.AWS_REGION || 'us-east-1';
const getStackResources = async () => {
    const cf = new client_cloudformation_1.CloudFormationClient({ region: REGION });
    // Get Log Group Name from Sack Resources
    const resourcesCmd = new client_cloudformation_1.DescribeStackResourcesCommand({ StackName: STACK_NAME });
    const resourcesResp = await cf.send(resourcesCmd);
    const lambdaResource = resourcesResp.StackResources?.find((r) => r.ResourceType === 'AWS::Lambda::Function' &&
        r.LogicalResourceId?.includes('ApiHandler'));
    if (!lambdaResource?.PhysicalResourceId) {
        throw new Error('Could not find API Handler Lambda in stack resources');
    }
    const logGroupName = `/aws/lambda/${lambdaResource.PhysicalResourceId}`;
    // Get API URL from Stack Outputs (cleaner than reconstructing from resources)
    const stacksCmd = new client_cloudformation_1.DescribeStacksCommand({ StackName: STACK_NAME });
    const stacksResp = await cf.send(stacksCmd);
    const apiUrlOutput = stacksResp.Stacks?.[0].Outputs?.find((o) => o.OutputKey === 'ApiUrl');
    if (!apiUrlOutput?.OutputValue) {
        throw new Error('Could not find ApiUrl output in stack');
    }
    return {
        apiUrl: apiUrlOutput.OutputValue,
        logGroupName,
    };
};
const waitForLogs = async (logGroupName, searchString, timeoutMs = 60000) => {
    const logs = new client_cloudwatch_logs_1.CloudWatchLogsClient({ region: REGION });
    const startTime = Date.now();
    console.log(`Polling logs in ${logGroupName} for "${searchString}"...`);
    while (Date.now() - startTime < timeoutMs) {
        try {
            // Search last 1 minute of logs
            const command = new client_cloudwatch_logs_1.FilterLogEventsCommand({
                logGroupName,
                filterPattern: `"${searchString}"`,
                startTime: Date.now() - 60000,
            });
            const events = await logs.send(command);
            if (events.events && events.events.length > 0) {
                console.log('✅ Found matching log events:');
                events.events.forEach((e) => console.log(`  [${new Date(e.timestamp).toISOString()}] ${e.message}`));
                return true;
            }
        }
        catch (error) {
            console.warn(`Error polling logs: ${error.message}`);
        }
        await new Promise((r) => setTimeout(r, 2000));
    }
    return false;
};
const run = async () => {
    try {
        console.log(`🔍 Discovering Stack Resources for stack: ${STACK_NAME}...`);
        const { apiUrl, logGroupName } = await getStackResources();
        console.log(`  API URL: ${apiUrl}`);
        console.log(`  Log Group: ${logGroupName}`);
        const requestId = crypto.randomUUID();
        console.log(`\n🚀 Sending API Request with custom RequestID: ${requestId}...`);
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'x-request-id': requestId,
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            throw new Error(`API returned status ${response.status}`);
        }
        const body = await response.json();
        console.log('  Response:', body);
        if (body.requestId !== requestId) {
            throw new Error(`Response requestId mismatch! Expected ${requestId}, got ${body.requestId}`);
        }
        console.log('  ✅ Response requestId matches.');
        console.log('\n⏳ Waiting for Lambda logs...');
        const success = await waitForLogs(logGroupName, requestId);
        if (success) {
            console.log('\n✅ API Integration Test Passed!');
            process.exit(0);
        }
        else {
            console.error('\n❌ Verified Failed: Log not found within timeout.');
            process.exit(1);
        }
    }
    catch (error) {
        console.error('Integration test failed:', error);
        process.exit(1);
    }
};
run();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpLWludGVncmF0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYXBpLWludGVncmF0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsMEVBSXdDO0FBQ3hDLDRFQUErRjtBQUUvRiwrQ0FBaUM7QUFFakMsTUFBTSxVQUFVLEdBQUcsb0JBQW9CLENBQUM7QUFDeEMsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLElBQUksV0FBVyxDQUFDO0FBRXJELE1BQU0saUJBQWlCLEdBQUcsS0FBSyxJQUFJLEVBQUU7SUFDakMsTUFBTSxFQUFFLEdBQUcsSUFBSSw0Q0FBb0IsQ0FBQyxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDO0lBRXhELHlDQUF5QztJQUN6QyxNQUFNLFlBQVksR0FBRyxJQUFJLHFEQUE2QixDQUFDLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxDQUFDLENBQUM7SUFDbEYsTUFBTSxhQUFhLEdBQUcsTUFBTSxFQUFFLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQ2xELE1BQU0sY0FBYyxHQUFHLGFBQWEsQ0FBQyxjQUFjLEVBQUUsSUFBSSxDQUNyRCxDQUFDLENBQUMsRUFBRSxFQUFFLENBQ0YsQ0FBQyxDQUFDLFlBQVksS0FBSyx1QkFBdUI7UUFDMUMsQ0FBQyxDQUFDLGlCQUFpQixFQUFFLFFBQVEsQ0FBQyxZQUFZLENBQUMsQ0FDbEQsQ0FBQztJQUVGLElBQUksQ0FBQyxjQUFjLEVBQUUsa0JBQWtCLEVBQUUsQ0FBQztRQUN0QyxNQUFNLElBQUksS0FBSyxDQUFDLHNEQUFzRCxDQUFDLENBQUM7SUFDNUUsQ0FBQztJQUNELE1BQU0sWUFBWSxHQUFHLGVBQWUsY0FBYyxDQUFDLGtCQUFrQixFQUFFLENBQUM7SUFFeEUsOEVBQThFO0lBQzlFLE1BQU0sU0FBUyxHQUFHLElBQUksNkNBQXFCLENBQUMs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QUMsb0RBQW9ELENBQUMsQ0FBQztZQUNwRSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3BCLENBQUM7SUFDTCxDQUFDO0lBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztRQUNiLE9BQU8sQ0FBQyxLQUFLLENBQUMsMEJBQTBCLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDakQsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNwQixDQUFDO0FBQ0wsQ0FBQyxDQUFDO0FBRUYsR0FBRyxFQUFFLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICAgIENsb3VkRm9ybWF0aW9uQ2xpZW50LFxuICAgIERlc2NyaWJlU3RhY2tSZXNvdXJjZXNDb21tYW5kLFxuICAgIERlc2NyaWJlU3RhY2tzQ29tbWFuZCxcbn0gZnJvbSAnQGF3cy1zZGsvY2xpZW50LWNsb3VkZm9ybWF0aW9uJztcbmltcG9ydCB7IENsb3VkV2F0Y2hMb2dzQ2xpZW50LCBGaWx0ZXJMb2dFdmVudHNDb21tYW5kIH0gZnJvbSAnQGF3cy1zZGsvY2xpZW50LWNsb3Vkd2F0Y2gtbG9ncyc7XG5pbXBvcnQgdHlwZSB7IEZpbHRlckxvZ0V2ZW50c0NvbW1hbmRPdXRwdXQgfSBmcm9tICdAYXdzLXNkay9jbGllbnQtY2xvdWR3YXRjaC1sb2dzJztcbmltcG9ydCAqIGFzIGNyeXB0byBmcm9tICdjcnlwdG8nO1xuXG5jb25zdCBTVEFDS19OQU1FID0gJ3ZpdGt1ei10ZXN0aW5nLWFwaSc7XG5jb25zdCBSRUdJT04gPSBwcm9jZXNzLmVudi5BV1NfUkVHSU9OIHx8ICd1cy1lYXN0LTEnO1xuXG5jb25zdCBnZXRTdGFja1Jlc291cmNlcyA9IGFzeW5jICgpID0+IHtcbiAgICBjb25zdCBjZiA9IG5ldyBDbG91ZEZvcm1hdGlvbkNsaWVudCh7IHJlZ2lvbjogUkVHSU9OIH0pO1xuXG4gICAgLy8gR2V0IExvZyBHcm91cCBOYW1lIGZyb20gU2FjayBSZXNvdXJjZXNcbiAgICBjb25zdCByZXNvdXJjZXNDbWQgPSBuZXcgRGVzY3JpYmVTdGFja1Jlc291cmNlc0NvbW1hbmQoeyBTdGFja05hbWU6IFNUQUNLX05BTUUgfSk7XG4gICAgY29uc3QgcmVzb3VyY2VzUmVzcCA9IGF3YWl0IGNmLnNlbmQocmVzb3VyY2VzQ21kKTtcbiAgICBjb25zdCBsYW1iZGFSZXNvdXJjZSA9IHJlc291cmNlc1Jlc3AuU3RhY2tSZXNvdXJjZXM/LmZpbmQoXG4gICAgICAgIChyKSA9PlxuICAgICAgICAgICAgci5SZXNvdXJjZVR5cGUgPT09ICdBV1M6OkxhbWJkYTo6RnVuY3Rpb24nICYmXG4gICAgICAgICAgICByLkxvZ2ljYWxSZXNvdXJjZUlkPy5pbmNsdWRlcygnQXBpSGFuZGxlcicpLFxuICAgICk7XG5cbiAgICBpZiAoIWxhbWJkYVJlc291cmNlPy5QaHlzaWNhbFJlc291cmNlSWQpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDb3VsZCBub3QgZmluZCBBUEkgSGFuZGxlciBMYW1iZGEgaW4gc3RhY2sgcmVzb3VyY2VzJyk7XG4gICAgfVxuICAgIGNvbnN0IGxvZ0dyb3VwTmFtZSA9IGAvYXdzL2xhbWJkYS8ke2xhbWJkYVJlc291cmNlLlBoeXNpY2FsUmVzb3VyY2VJZH1gO1xuXG4gICAgLy8gR2V0IEFQSSBVUkwgZnJvbSBTdGFjayBPdXRwdXRzIChjbGVhbmVyIHRoYW4gcmVjb25zdHJ1Y3RpbmcgZnJvbSByZXNvdXJjZXMpXG4gICAgY29uc3Qgc3RhY2tzQ21kID0gbmV3IERlc2NyaWJlU3RhY2tzQ29tbWFuZCh7IFN0YWNrTmFtZTogU1RBQ0tfTkFNRSB9KTtcbiAgICBjb25zdCBzdGFja3NSZXNwID0gYXdhaXQgY2Yuc2VuZChzdGFja3NDbWQpO1xuICAgIGNvbnN0IGFwaVVybE91dHB1dCA9IHN0YWNrc1Jlc3AuU3RhY2tzPy5bMF0uT3V0cHV0cz8uZmluZCgobykgPT4gby5PdXRwdXRLZXkgPT09ICdBcGlVcmwnKTtcblxuICAgIGlmICghYXBpVXJsT3V0cHV0Py5PdXRwdXRWYWx1ZSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0NvdWxkIG5vdCBmaW5kIEFwaVVybCBvdXRwdXQgaW4gc3RhY2snKTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBhcGlVcmw6IGFwaVVybE91dHB1dC5PdXRwdXRWYWx1ZSxcbiAgICAgICAgbG9nR3JvdXBOYW1lLFxuICAgIH07XG59O1xuXG5jb25zdCB3YWl0Rm9yTG9ncyA9IGFzeW5jIChcbiAgICBsb2dHcm91cE5hbWU6IHN0cmluZyxcbiAgICBzZWFyY2hTdHJpbmc6IHN0cmluZyxcbiAgICB0aW1lb3V0TXMgPSA2MDAwMCxcbik6IFByb21pc2U8Ym9vbGVhbj4gPT4ge1xuICAgIGNvbnN0IGxvZ3MgPSBuZXcgQ2xvdWRXYXRjaExvZ3NDbGllbnQoeyByZWdpb246IFJFR0lPTiB9KTtcbiAgICBjb25zdCBzdGFydFRpbWUgPSBEYXRlLm5vdygpO1xuXG4gICAgY29uc29sZS5sb2coYFBvbGxpbmcgbG9ncyBpbiAke2xvZ0dyb3VwTmFtZX0gZm9yIFwiJHtzZWFyY2hTdHJpbmd9XCIuLi5gKTtcblxuICAgIHdoaWxlIChEYXRlLm5vdygpIC0gc3RhcnRUaW1lIDwgdGltZW91dE1zKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBTZWFyY2ggbGFzdCAxIG1pbnV0ZSBvZiBsb2dzXG4gICAgICAgICAgICBjb25zdCBjb21tYW5kID0gbmV3IEZpbHRlckxvZ0V2ZW50c0NvbW1hbmQoe1xuICAgICAgICAgICAgICAgIGxvZ0dyb3VwTmFtZSxcbiAgICAgICAgICAgICAgICBmaWx0ZXJQYXR0ZXJuOiBgXCIke3NlYXJjaFN0cmluZ31cImAsXG4gICAgICAgICAgICAgICAgc3RhcnRUaW1lOiBEYXRlLm5vdygpIC0gNjAwMDAsXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgY29uc3QgZXZlbnRzOiBGaWx0ZXJMb2dFdmVudHNDb21tYW5kT3V0cHV0ID0gYXdhaXQgbG9ncy5zZW5kKGNvbW1hbmQpO1xuXG4gICAgICAgICAgICBpZiAoZXZlbnRzLmV2ZW50cyAmJiBldmVudHMuZXZlbnRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygn4pyFIEZvdW5kIG1hdGNoaW5nIGxvZyBldmVudHM6Jyk7XG4gICAgICAgICAgICAgICAgZXZlbnRzLmV2ZW50cy5mb3JFYWNoKChlKSA9PlxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgICBbJHtuZXcgRGF0ZShlLnRpbWVzdGFtcCEpLnRvSVNPU3RyaW5nKCl9XSAke2UubWVzc2FnZX1gKSxcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYEVycm9yIHBvbGxpbmcgbG9nczogJHtlcnJvci5tZXNzYWdlfWApO1xuICAgICAgICB9XG5cbiAgICAgICAgYXdhaXQgbmV3IFByb21pc2UoKHIpID0+IHNldFRpbWVvdXQociwgMjAwMCkpO1xuICAgIH1cblxuICAgIHJldHVybiBmYWxzZTtcbn07XG5cbmNvbnN0IHJ1biA9IGFzeW5jICgpID0+IHtcbiAgICB0cnkge1xuICAgICAgICBjb25zb2xlLmxvZyhg8J+UjSBEaXNjb3ZlcmluZyBTdGFjayBSZXNvdXJjZXMgZm9yIHN0YWNrOiAke1NUQUNLX05BTUV9Li4uYCk7XG4gICAgICAgIGNvbnN0IHsgYXBpVXJsLCBsb2dHcm91cE5hbWUgfSA9IGF3YWl0IGdldFN0YWNrUmVzb3VyY2VzKCk7XG4gICAgICAgIGNvbnNvbGUubG9nKGAgIEFQSSBVUkw6ICR7YXBpVXJsfWApO1xuICAgICAgICBjb25zb2xlLmxvZyhgICBMb2cgR3JvdXA6ICR7bG9nR3JvdXBOYW1lfWApO1xuXG4gICAgICAgIGNvbnN0IHJlcXVlc3RJZCA9IGNyeXB0by5yYW5kb21VVUlEKCk7XG4gICAgICAgIGNvbnNvbGUubG9nKGBcXG7wn5qAIFNlbmRpbmcgQVBJIFJlcXVlc3Qgd2l0aCBjdXN0b20gUmVxdWVzdElEOiAke3JlcXVlc3RJZH0uLi5gKTtcblxuICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKGFwaVVybCwge1xuICAgICAgICAgICAgbWV0aG9kOiAnR0VUJyxcbiAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICAneC1yZXF1ZXN0LWlkJzogcmVxdWVzdElkLFxuICAgICAgICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcblxuICAgICAgICBpZiAoIXJlc3BvbnNlLm9rKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEFQSSByZXR1cm5lZCBzdGF0dXMgJHtyZXNwb25zZS5zdGF0dXN9YCk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBib2R5OiBhbnkgPSBhd2FpdCByZXNwb25zZS5qc29uKCk7XG4gICAgICAgIGNvbnNvbGUubG9nKCcgIFJlc3BvbnNlOicsIGJvZHkpO1xuXG4gICAgICAgIGlmIChib2R5LnJlcXVlc3RJZCAhPT0gcmVxdWVzdElkKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgICAgYFJlc3BvbnNlIHJlcXVlc3RJZCBtaXNtYXRjaCEgRXhwZWN0ZWQgJHtyZXF1ZXN0SWR9LCBnb3QgJHtib2R5LnJlcXVlc3RJZH1gLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zb2xlLmxvZygnICDinIUgUmVzcG9uc2UgcmVxdWVzdElkIG1hdGNoZXMuJyk7XG5cbiAgICAgICAgY29uc29sZS5sb2coJ1xcbuKPsyBXYWl0aW5nIGZvciBMYW1iZGEgbG9ncy4uLicpO1xuICAgICAgICBjb25zdCBzdWNjZXNzID0gYXdhaXQgd2FpdEZvckxvZ3MobG9nR3JvdXBOYW1lLCByZXF1ZXN0SWQpO1xuXG4gICAgICAgIGlmIChzdWNjZXNzKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnXFxu4pyFIEFQSSBJbnRlZ3JhdGlvbiBUZXN0IFBhc3NlZCEnKTtcbiAgICAgICAgICAgIHByb2Nlc3MuZXhpdCgwKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1xcbuKdjCBWZXJpZmllZCBGYWlsZWQ6IExvZyBub3QgZm91bmQgd2l0aGluIHRpbWVvdXQuJyk7XG4gICAgICAgICAgICBwcm9jZXNzLmV4aXQoMSk7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdJbnRlZ3JhdGlvbiB0ZXN0IGZhaWxlZDonLCBlcnJvcik7XG4gICAgICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgICB9XG59O1xuXG5ydW4oKTtcbiJdfQ==