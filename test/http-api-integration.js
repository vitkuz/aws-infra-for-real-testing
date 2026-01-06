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
const STACK_NAME = 'vitkuz-testing-http-api';
const REGION = process.env.AWS_REGION || 'us-east-1';
const getStackResources = async () => {
    const cf = new client_cloudformation_1.CloudFormationClient({ region: REGION });
    // Get Log Group Name from Stack Resources
    const resourcesCmd = new client_cloudformation_1.DescribeStackResourcesCommand({ StackName: STACK_NAME });
    const resourcesResp = await cf.send(resourcesCmd);
    const lambdaResource = resourcesResp.StackResources?.find((r) => r.ResourceType === 'AWS::Lambda::Function' &&
        r.LogicalResourceId?.includes('HttpApiHandler'));
    if (!lambdaResource?.PhysicalResourceId) {
        throw new Error('Could not find HTTP API Handler Lambda in stack resources');
    }
    const logGroupName = `/aws/lambda/${lambdaResource.PhysicalResourceId}`;
    // Get API URL from Stack Outputs
    const stacksCmd = new client_cloudformation_1.DescribeStacksCommand({ StackName: STACK_NAME });
    const stacksResp = await cf.send(stacksCmd);
    const apiUrlOutput = stacksResp.Stacks?.[0].Outputs?.find((o) => o.OutputKey === 'HttpApiUrl');
    if (!apiUrlOutput?.OutputValue) {
        throw new Error('Could not find HttpApiUrl output in stack');
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
        console.log(`\n🚀 Sending HTTP API Request with custom RequestID: ${requestId}...`);
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
            console.log('\n✅ HTTP API Integration Test Passed!');
            process.exit(0);
        }
        else {
            console.error('\n❌ Verification Failed: Log not found within timeout.');
            process.exit(1);
        }
    }
    catch (error) {
        console.error('Integration test failed:', error);
        process.exit(1);
    }
};
run();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaHR0cC1hcGktaW50ZWdyYXRpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJodHRwLWFwaS1pbnRlZ3JhdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDBFQUl3QztBQUN4Qyw0RUFBK0Y7QUFFL0YsK0NBQWlDO0FBRWpDLE1BQU0sVUFBVSxHQUFHLHlCQUF5QixDQUFDO0FBQzdDLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVSxJQUFJLFdBQVcsQ0FBQztBQUVyRCxNQUFNLGlCQUFpQixHQUFHLEtBQUssSUFBSSxFQUFFO0lBQ2pDLE1BQU0sRUFBRSxHQUFHLElBQUksNENBQW9CLENBQUMsRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQztJQUV4RCwwQ0FBMEM7SUFDMUMsTUFBTSxZQUFZLEdBQUcsSUFBSSxxREFBNkIsQ0FBQyxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsQ0FBQyxDQUFDO0lBQ2xGLE1BQU0sYUFBYSxHQUFHLE1BQU0sRUFBRSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUNsRCxNQUFNLGNBQWMsR0FBRyxhQUFhLENBQUMsY0FBYyxFQUFFLElBQUksQ0FDckQsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUNGLENBQUMsQ0FBQyxZQUFZLEtBQUssdUJBQXVCO1FBQzFDLENBQUMsQ0FBQyxpQkFBaUIsRUFBRSxRQUFRLENBQUMsZ0JBQWdCLENBQUMsQ0FDdEQsQ0FBQztJQUVGLElBQUksQ0FBQyxjQUFjLEVBQUUsa0JBQWtCLEVBQUUsQ0FBQztRQUN0QyxNQUFNLElBQUksS0FBSyxDQUFDLDJEQUEyRCxDQUFDLENBQUM7SUFDakYsQ0FBQztJQUNELE1BQU0sWUFBWSxHQUFHLGVBQWUsY0FBYyxDQUFDLGtCQUFrQixFQUFFLENBQUM7SUFFeEUsaUNBQWlDO0lBQ2pDLE1BQU0sU0FBUyxHQUFHLElBQUks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Q0FBQyxLQUFLLENBQUMsd0RBQXdELENBQUMsQ0FBQztZQUN4RSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3BCLENBQUM7SUFDTCxDQUFDO0lBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztRQUNiLE9BQU8sQ0FBQyxLQUFLLENBQUMsMEJBQTBCLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDakQsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNwQixDQUFDO0FBQ0wsQ0FBQyxDQUFDO0FBRUYsR0FBRyxFQUFFLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICAgIENsb3VkRm9ybWF0aW9uQ2xpZW50LFxuICAgIERlc2NyaWJlU3RhY2tSZXNvdXJjZXNDb21tYW5kLFxuICAgIERlc2NyaWJlU3RhY2tzQ29tbWFuZCxcbn0gZnJvbSAnQGF3cy1zZGsvY2xpZW50LWNsb3VkZm9ybWF0aW9uJztcbmltcG9ydCB7IENsb3VkV2F0Y2hMb2dzQ2xpZW50LCBGaWx0ZXJMb2dFdmVudHNDb21tYW5kIH0gZnJvbSAnQGF3cy1zZGsvY2xpZW50LWNsb3Vkd2F0Y2gtbG9ncyc7XG5pbXBvcnQgdHlwZSB7IEZpbHRlckxvZ0V2ZW50c0NvbW1hbmRPdXRwdXQgfSBmcm9tICdAYXdzLXNkay9jbGllbnQtY2xvdWR3YXRjaC1sb2dzJztcbmltcG9ydCAqIGFzIGNyeXB0byBmcm9tICdjcnlwdG8nO1xuXG5jb25zdCBTVEFDS19OQU1FID0gJ3ZpdGt1ei10ZXN0aW5nLWh0dHAtYXBpJztcbmNvbnN0IFJFR0lPTiA9IHByb2Nlc3MuZW52LkFXU19SRUdJT04gfHwgJ3VzLWVhc3QtMSc7XG5cbmNvbnN0IGdldFN0YWNrUmVzb3VyY2VzID0gYXN5bmMgKCkgPT4ge1xuICAgIGNvbnN0IGNmID0gbmV3IENsb3VkRm9ybWF0aW9uQ2xpZW50KHsgcmVnaW9uOiBSRUdJT04gfSk7XG5cbiAgICAvLyBHZXQgTG9nIEdyb3VwIE5hbWUgZnJvbSBTdGFjayBSZXNvdXJjZXNcbiAgICBjb25zdCByZXNvdXJjZXNDbWQgPSBuZXcgRGVzY3JpYmVTdGFja1Jlc291cmNlc0NvbW1hbmQoeyBTdGFja05hbWU6IFNUQUNLX05BTUUgfSk7XG4gICAgY29uc3QgcmVzb3VyY2VzUmVzcCA9IGF3YWl0IGNmLnNlbmQocmVzb3VyY2VzQ21kKTtcbiAgICBjb25zdCBsYW1iZGFSZXNvdXJjZSA9IHJlc291cmNlc1Jlc3AuU3RhY2tSZXNvdXJjZXM/LmZpbmQoXG4gICAgICAgIChyKSA9PlxuICAgICAgICAgICAgci5SZXNvdXJjZVR5cGUgPT09ICdBV1M6OkxhbWJkYTo6RnVuY3Rpb24nICYmXG4gICAgICAgICAgICByLkxvZ2ljYWxSZXNvdXJjZUlkPy5pbmNsdWRlcygnSHR0cEFwaUhhbmRsZXInKSxcbiAgICApO1xuXG4gICAgaWYgKCFsYW1iZGFSZXNvdXJjZT8uUGh5c2ljYWxSZXNvdXJjZUlkKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignQ291bGQgbm90IGZpbmQgSFRUUCBBUEkgSGFuZGxlciBMYW1iZGEgaW4gc3RhY2sgcmVzb3VyY2VzJyk7XG4gICAgfVxuICAgIGNvbnN0IGxvZ0dyb3VwTmFtZSA9IGAvYXdzL2xhbWJkYS8ke2xhbWJkYVJlc291cmNlLlBoeXNpY2FsUmVzb3VyY2VJZH1gO1xuXG4gICAgLy8gR2V0IEFQSSBVUkwgZnJvbSBTdGFjayBPdXRwdXRzXG4gICAgY29uc3Qgc3RhY2tzQ21kID0gbmV3IERlc2NyaWJlU3RhY2tzQ29tbWFuZCh7IFN0YWNrTmFtZTogU1RBQ0tfTkFNRSB9KTtcbiAgICBjb25zdCBzdGFja3NSZXNwID0gYXdhaXQgY2Yuc2VuZChzdGFja3NDbWQpO1xuICAgIGNvbnN0IGFwaVVybE91dHB1dCA9IHN0YWNrc1Jlc3AuU3RhY2tzPy5bMF0uT3V0cHV0cz8uZmluZCgobykgPT4gby5PdXRwdXRLZXkgPT09ICdIdHRwQXBpVXJsJyk7XG5cbiAgICBpZiAoIWFwaVVybE91dHB1dD8uT3V0cHV0VmFsdWUpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDb3VsZCBub3QgZmluZCBIdHRwQXBpVXJsIG91dHB1dCBpbiBzdGFjaycpO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICAgIGFwaVVybDogYXBpVXJsT3V0cHV0Lk91dHB1dFZhbHVlLFxuICAgICAgICBsb2dHcm91cE5hbWUsXG4gICAgfTtcbn07XG5cbmNvbnN0IHdhaXRGb3JMb2dzID0gYXN5bmMgKFxuICAgIGxvZ0dyb3VwTmFtZTogc3RyaW5nLFxuICAgIHNlYXJjaFN0cmluZzogc3RyaW5nLFxuICAgIHRpbWVvdXRNcyA9IDYwMDAwLFxuKTogUHJvbWlzZTxib29sZWFuPiA9PiB7XG4gICAgY29uc3QgbG9ncyA9IG5ldyBDbG91ZFdhdGNoTG9nc0NsaWVudCh7IHJlZ2lvbjogUkVHSU9OIH0pO1xuICAgIGNvbnN0IHN0YXJ0VGltZSA9IERhdGUubm93KCk7XG5cbiAgICBjb25zb2xlLmxvZyhgUG9sbGluZyBsb2dzIGluICR7bG9nR3JvdXBOYW1lfSBmb3IgXCIke3NlYXJjaFN0cmluZ31cIi4uLmApO1xuXG4gICAgd2hpbGUgKERhdGUubm93KCkgLSBzdGFydFRpbWUgPCB0aW1lb3V0TXMpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIFNlYXJjaCBsYXN0IDEgbWludXRlIG9mIGxvZ3NcbiAgICAgICAgICAgIGNvbnN0IGNvbW1hbmQgPSBuZXcgRmlsdGVyTG9nRXZlbnRzQ29tbWFuZCh7XG4gICAgICAgICAgICAgICAgbG9nR3JvdXBOYW1lLFxuICAgICAgICAgICAgICAgIGZpbHRlclBhdHRlcm46IGBcIiR7c2VhcmNoU3RyaW5nfVwiYCxcbiAgICAgICAgICAgICAgICBzdGFydFRpbWU6IERhdGUubm93KCkgLSA2MDAwMCxcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBjb25zdCBldmVudHM6IEZpbHRlckxvZ0V2ZW50c0NvbW1hbmRPdXRwdXQgPSBhd2FpdCBsb2dzLnNlbmQoY29tbWFuZCk7XG5cbiAgICAgICAgICAgIGlmIChldmVudHMuZXZlbnRzICYmIGV2ZW50cy5ldmVudHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCfinIUgRm91bmQgbWF0Y2hpbmcgbG9nIGV2ZW50czonKTtcbiAgICAgICAgICAgICAgICBldmVudHMuZXZlbnRzLmZvckVhY2goKGU6IGFueSkgPT5cbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYCAgWyR7bmV3IERhdGUoZS50aW1lc3RhbXAhKS50b0lTT1N0cmluZygpfV0gJHtlLm1lc3NhZ2V9YCksXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBFcnJvciBwb2xsaW5nIGxvZ3M6ICR7ZXJyb3IubWVzc2FnZX1gKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGF3YWl0IG5ldyBQcm9taXNlKChyKSA9PiBzZXRUaW1lb3V0KHIsIDIwMDApKTtcbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2U7XG59O1xuXG5jb25zdCBydW4gPSBhc3luYyAoKSA9PiB7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc29sZS5sb2coYPCflI0gRGlzY292ZXJpbmcgU3RhY2sgUmVzb3VyY2VzIGZvciBzdGFjazogJHtTVEFDS19OQU1FfS4uLmApO1xuICAgICAgICBjb25zdCB7IGFwaVVybCwgbG9nR3JvdXBOYW1lIH0gPSBhd2FpdCBnZXRTdGFja1Jlc291cmNlcygpO1xuICAgICAgICBjb25zb2xlLmxvZyhgICBBUEkgVVJMOiAke2FwaVVybH1gKTtcbiAgICAgICAgY29uc29sZS5sb2coYCAgTG9nIEdyb3VwOiAke2xvZ0dyb3VwTmFtZX1gKTtcblxuICAgICAgICBjb25zdCByZXF1ZXN0SWQgPSBjcnlwdG8ucmFuZG9tVVVJRCgpO1xuICAgICAgICBjb25zb2xlLmxvZyhgXFxu8J+agCBTZW5kaW5nIEhUVFAgQVBJIFJlcXVlc3Qgd2l0aCBjdXN0b20gUmVxdWVzdElEOiAke3JlcXVlc3RJZH0uLi5gKTtcblxuICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKGFwaVVybCwge1xuICAgICAgICAgICAgbWV0aG9kOiAnR0VUJyxcbiAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICAneC1yZXF1ZXN0LWlkJzogcmVxdWVzdElkLFxuICAgICAgICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcblxuICAgICAgICBpZiAoIXJlc3BvbnNlLm9rKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEFQSSByZXR1cm5lZCBzdGF0dXMgJHtyZXNwb25zZS5zdGF0dXN9YCk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBib2R5OiBhbnkgPSBhd2FpdCByZXNwb25zZS5qc29uKCk7XG4gICAgICAgIGNvbnNvbGUubG9nKCcgIFJlc3BvbnNlOicsIGJvZHkpO1xuXG4gICAgICAgIGlmIChib2R5LnJlcXVlc3RJZCAhPT0gcmVxdWVzdElkKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgICAgYFJlc3BvbnNlIHJlcXVlc3RJZCBtaXNtYXRjaCEgRXhwZWN0ZWQgJHtyZXF1ZXN0SWR9LCBnb3QgJHtib2R5LnJlcXVlc3RJZH1gLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zb2xlLmxvZygnICDinIUgUmVzcG9uc2UgcmVxdWVzdElkIG1hdGNoZXMuJyk7XG5cbiAgICAgICAgY29uc29sZS5sb2coJ1xcbuKPsyBXYWl0aW5nIGZvciBMYW1iZGEgbG9ncy4uLicpO1xuICAgICAgICBjb25zdCBzdWNjZXNzID0gYXdhaXQgd2FpdEZvckxvZ3MobG9nR3JvdXBOYW1lLCByZXF1ZXN0SWQpO1xuXG4gICAgICAgIGlmIChzdWNjZXNzKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnXFxu4pyFIEhUVFAgQVBJIEludGVncmF0aW9uIFRlc3QgUGFzc2VkIScpO1xuICAgICAgICAgICAgcHJvY2Vzcy5leGl0KDApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignXFxu4p2MIFZlcmlmaWNhdGlvbiBGYWlsZWQ6IExvZyBub3QgZm91bmQgd2l0aGluIHRpbWVvdXQuJyk7XG4gICAgICAgICAgICBwcm9jZXNzLmV4aXQoMSk7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdJbnRlZ3JhdGlvbiB0ZXN0IGZhaWxlZDonLCBlcnJvcik7XG4gICAgICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgICB9XG59O1xuXG5ydW4oKTtcbiJdfQ==