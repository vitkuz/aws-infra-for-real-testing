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
    const lambdaResource = resourcesResp.StackResources?.find(r => r.ResourceType === 'AWS::Lambda::Function' && r.LogicalResourceId?.includes('HttpApiHandler'));
    if (!lambdaResource?.PhysicalResourceId) {
        throw new Error('Could not find HTTP API Handler Lambda in stack resources');
    }
    const logGroupName = `/aws/lambda/${lambdaResource.PhysicalResourceId}`;
    // Get API URL from Stack Outputs
    const stacksCmd = new client_cloudformation_1.DescribeStacksCommand({ StackName: STACK_NAME });
    const stacksResp = await cf.send(stacksCmd);
    const apiUrlOutput = stacksResp.Stacks?.[0].Outputs?.find(o => o.OutputKey === 'HttpApiUrl');
    if (!apiUrlOutput?.OutputValue) {
        throw new Error('Could not find HttpApiUrl output in stack');
    }
    return {
        apiUrl: apiUrlOutput.OutputValue,
        logGroupName
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
                startTime: Date.now() - 60000
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
        await new Promise(r => setTimeout(r, 2000));
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
                'Content-Type': 'application/json'
            }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaHR0cC1hcGktaW50ZWdyYXRpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJodHRwLWFwaS1pbnRlZ3JhdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDBFQUE0SDtBQUM1SCw0RUFBK0Y7QUFFL0YsK0NBQWlDO0FBRWpDLE1BQU0sVUFBVSxHQUFHLHlCQUF5QixDQUFDO0FBQzdDLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVSxJQUFJLFdBQVcsQ0FBQztBQUVyRCxNQUFNLGlCQUFpQixHQUFHLEtBQUssSUFBSSxFQUFFO0lBQ2pDLE1BQU0sRUFBRSxHQUFHLElBQUksNENBQW9CLENBQUMsRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQztJQUV4RCwwQ0FBMEM7SUFDMUMsTUFBTSxZQUFZLEdBQUcsSUFBSSxxREFBNkIsQ0FBQyxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsQ0FBQyxDQUFDO0lBQ2xGLE1BQU0sYUFBYSxHQUFHLE1BQU0sRUFBRSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUNsRCxNQUFNLGNBQWMsR0FBRyxhQUFhLENBQUMsY0FBYyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUMxRCxDQUFDLENBQUMsWUFBWSxLQUFLLHVCQUF1QixJQUFJLENBQUMsQ0FBQyxpQkFBaUIsRUFBRSxRQUFRLENBQUMsZ0JBQWdCLENBQUMsQ0FDaEcsQ0FBQztJQUVGLElBQUksQ0FBQyxjQUFjLEVBQUUsa0JBQWtCLEVBQUUsQ0FBQztRQUN0QyxNQUFNLElBQUksS0FBSyxDQUFDLDJEQUEyRCxDQUFDLENBQUM7SUFDakYsQ0FBQztJQUNELE1BQU0sWUFBWSxHQUFHLGVBQWUsY0FBYyxDQUFDLGtCQUFrQixFQUFFLENBQUM7SUFFeEUsaUNBQWlDO0lBQ2pDLE1BQU0sU0FBUyxHQUFHLElBQUksNkNBQXFC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d0QsQ0FBQyxDQUFDO1lBQ3hFLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDcEIsQ0FBQztJQUVMLENBQUM7SUFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO1FBQ2IsT0FBTyxDQUFDLEtBQUssQ0FBQywwQkFBMEIsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNqRCxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3BCLENBQUM7QUFDTCxDQUFDLENBQUM7QUFFRixHQUFHLEVBQUUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENsb3VkRm9ybWF0aW9uQ2xpZW50LCBEZXNjcmliZVN0YWNrUmVzb3VyY2VzQ29tbWFuZCwgRGVzY3JpYmVTdGFja3NDb21tYW5kIH0gZnJvbSAnQGF3cy1zZGsvY2xpZW50LWNsb3VkZm9ybWF0aW9uJztcbmltcG9ydCB7IENsb3VkV2F0Y2hMb2dzQ2xpZW50LCBGaWx0ZXJMb2dFdmVudHNDb21tYW5kIH0gZnJvbSAnQGF3cy1zZGsvY2xpZW50LWNsb3Vkd2F0Y2gtbG9ncyc7XG5pbXBvcnQgdHlwZSB7IEZpbHRlckxvZ0V2ZW50c0NvbW1hbmRPdXRwdXQgfSBmcm9tICdAYXdzLXNkay9jbGllbnQtY2xvdWR3YXRjaC1sb2dzJztcbmltcG9ydCAqIGFzIGNyeXB0byBmcm9tICdjcnlwdG8nO1xuXG5jb25zdCBTVEFDS19OQU1FID0gJ3ZpdGt1ei10ZXN0aW5nLWh0dHAtYXBpJztcbmNvbnN0IFJFR0lPTiA9IHByb2Nlc3MuZW52LkFXU19SRUdJT04gfHwgJ3VzLWVhc3QtMSc7XG5cbmNvbnN0IGdldFN0YWNrUmVzb3VyY2VzID0gYXN5bmMgKCkgPT4ge1xuICAgIGNvbnN0IGNmID0gbmV3IENsb3VkRm9ybWF0aW9uQ2xpZW50KHsgcmVnaW9uOiBSRUdJT04gfSk7XG5cbiAgICAvLyBHZXQgTG9nIEdyb3VwIE5hbWUgZnJvbSBTdGFjayBSZXNvdXJjZXNcbiAgICBjb25zdCByZXNvdXJjZXNDbWQgPSBuZXcgRGVzY3JpYmVTdGFja1Jlc291cmNlc0NvbW1hbmQoeyBTdGFja05hbWU6IFNUQUNLX05BTUUgfSk7XG4gICAgY29uc3QgcmVzb3VyY2VzUmVzcCA9IGF3YWl0IGNmLnNlbmQocmVzb3VyY2VzQ21kKTtcbiAgICBjb25zdCBsYW1iZGFSZXNvdXJjZSA9IHJlc291cmNlc1Jlc3AuU3RhY2tSZXNvdXJjZXM/LmZpbmQociA9PlxuICAgICAgICByLlJlc291cmNlVHlwZSA9PT0gJ0FXUzo6TGFtYmRhOjpGdW5jdGlvbicgJiYgci5Mb2dpY2FsUmVzb3VyY2VJZD8uaW5jbHVkZXMoJ0h0dHBBcGlIYW5kbGVyJylcbiAgICApO1xuXG4gICAgaWYgKCFsYW1iZGFSZXNvdXJjZT8uUGh5c2ljYWxSZXNvdXJjZUlkKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignQ291bGQgbm90IGZpbmQgSFRUUCBBUEkgSGFuZGxlciBMYW1iZGEgaW4gc3RhY2sgcmVzb3VyY2VzJyk7XG4gICAgfVxuICAgIGNvbnN0IGxvZ0dyb3VwTmFtZSA9IGAvYXdzL2xhbWJkYS8ke2xhbWJkYVJlc291cmNlLlBoeXNpY2FsUmVzb3VyY2VJZH1gO1xuXG4gICAgLy8gR2V0IEFQSSBVUkwgZnJvbSBTdGFjayBPdXRwdXRzXG4gICAgY29uc3Qgc3RhY2tzQ21kID0gbmV3IERlc2NyaWJlU3RhY2tzQ29tbWFuZCh7IFN0YWNrTmFtZTogU1RBQ0tfTkFNRSB9KTtcbiAgICBjb25zdCBzdGFja3NSZXNwID0gYXdhaXQgY2Yuc2VuZChzdGFja3NDbWQpO1xuICAgIGNvbnN0IGFwaVVybE91dHB1dCA9IHN0YWNrc1Jlc3AuU3RhY2tzPy5bMF0uT3V0cHV0cz8uZmluZChvID0+IG8uT3V0cHV0S2V5ID09PSAnSHR0cEFwaVVybCcpO1xuXG4gICAgaWYgKCFhcGlVcmxPdXRwdXQ/Lk91dHB1dFZhbHVlKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignQ291bGQgbm90IGZpbmQgSHR0cEFwaVVybCBvdXRwdXQgaW4gc3RhY2snKTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBhcGlVcmw6IGFwaVVybE91dHB1dC5PdXRwdXRWYWx1ZSxcbiAgICAgICAgbG9nR3JvdXBOYW1lXG4gICAgfTtcbn07XG5cbmNvbnN0IHdhaXRGb3JMb2dzID0gYXN5bmMgKGxvZ0dyb3VwTmFtZTogc3RyaW5nLCBzZWFyY2hTdHJpbmc6IHN0cmluZywgdGltZW91dE1zID0gNjAwMDApOiBQcm9taXNlPGJvb2xlYW4+ID0+IHtcbiAgICBjb25zdCBsb2dzID0gbmV3IENsb3VkV2F0Y2hMb2dzQ2xpZW50KHsgcmVnaW9uOiBSRUdJT04gfSk7XG4gICAgY29uc3Qgc3RhcnRUaW1lID0gRGF0ZS5ub3coKTtcblxuICAgIGNvbnNvbGUubG9nKGBQb2xsaW5nIGxvZ3MgaW4gJHtsb2dHcm91cE5hbWV9IGZvciBcIiR7c2VhcmNoU3RyaW5nfVwiLi4uYCk7XG5cbiAgICB3aGlsZSAoRGF0ZS5ub3coKSAtIHN0YXJ0VGltZSA8IHRpbWVvdXRNcykge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gU2VhcmNoIGxhc3QgMSBtaW51dGUgb2YgbG9nc1xuICAgICAgICAgICAgY29uc3QgY29tbWFuZCA9IG5ldyBGaWx0ZXJMb2dFdmVudHNDb21tYW5kKHtcbiAgICAgICAgICAgICAgICBsb2dHcm91cE5hbWUsXG4gICAgICAgICAgICAgICAgZmlsdGVyUGF0dGVybjogYFwiJHtzZWFyY2hTdHJpbmd9XCJgLFxuICAgICAgICAgICAgICAgIHN0YXJ0VGltZTogRGF0ZS5ub3coKSAtIDYwMDAwXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgY29uc3QgZXZlbnRzOiBGaWx0ZXJMb2dFdmVudHNDb21tYW5kT3V0cHV0ID0gYXdhaXQgbG9ncy5zZW5kKGNvbW1hbmQpO1xuXG4gICAgICAgICAgICBpZiAoZXZlbnRzLmV2ZW50cyAmJiBldmVudHMuZXZlbnRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygn4pyFIEZvdW5kIG1hdGNoaW5nIGxvZyBldmVudHM6Jyk7XG4gICAgICAgICAgICAgICAgZXZlbnRzLmV2ZW50cy5mb3JFYWNoKChlOiBhbnkpID0+IGNvbnNvbGUubG9nKGAgIFske25ldyBEYXRlKGUudGltZXN0YW1wISkudG9JU09TdHJpbmcoKX1dICR7ZS5tZXNzYWdlfWApKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBFcnJvciBwb2xsaW5nIGxvZ3M6ICR7ZXJyb3IubWVzc2FnZX1gKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGF3YWl0IG5ldyBQcm9taXNlKHIgPT4gc2V0VGltZW91dChyLCAyMDAwKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlO1xufTtcblxuY29uc3QgcnVuID0gYXN5bmMgKCkgPT4ge1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGDwn5SNIERpc2NvdmVyaW5nIFN0YWNrIFJlc291cmNlcyBmb3Igc3RhY2s6ICR7U1RBQ0tfTkFNRX0uLi5gKTtcbiAgICAgICAgY29uc3QgeyBhcGlVcmwsIGxvZ0dyb3VwTmFtZSB9ID0gYXdhaXQgZ2V0U3RhY2tSZXNvdXJjZXMoKTtcbiAgICAgICAgY29uc29sZS5sb2coYCAgQVBJIFVSTDogJHthcGlVcmx9YCk7XG4gICAgICAgIGNvbnNvbGUubG9nKGAgIExvZyBHcm91cDogJHtsb2dHcm91cE5hbWV9YCk7XG5cbiAgICAgICAgY29uc3QgcmVxdWVzdElkID0gY3J5cHRvLnJhbmRvbVVVSUQoKTtcbiAgICAgICAgY29uc29sZS5sb2coYFxcbvCfmoAgU2VuZGluZyBIVFRQIEFQSSBSZXF1ZXN0IHdpdGggY3VzdG9tIFJlcXVlc3RJRDogJHtyZXF1ZXN0SWR9Li4uYCk7XG5cbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaChhcGlVcmwsIHtcbiAgICAgICAgICAgIG1ldGhvZDogJ0dFVCcsXG4gICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgJ3gtcmVxdWVzdC1pZCc6IHJlcXVlc3RJZCxcbiAgICAgICAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmICghcmVzcG9uc2Uub2spIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgQVBJIHJldHVybmVkIHN0YXR1cyAke3Jlc3BvbnNlLnN0YXR1c31gKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGJvZHk6IGFueSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKTtcbiAgICAgICAgY29uc29sZS5sb2coJyAgUmVzcG9uc2U6JywgYm9keSk7XG5cbiAgICAgICAgaWYgKGJvZHkucmVxdWVzdElkICE9PSByZXF1ZXN0SWQpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgUmVzcG9uc2UgcmVxdWVzdElkIG1pc21hdGNoISBFeHBlY3RlZCAke3JlcXVlc3RJZH0sIGdvdCAke2JvZHkucmVxdWVzdElkfWApO1xuICAgICAgICB9XG4gICAgICAgIGNvbnNvbGUubG9nKCcgIOKchSBSZXNwb25zZSByZXF1ZXN0SWQgbWF0Y2hlcy4nKTtcblxuXG4gICAgICAgIGNvbnNvbGUubG9nKCdcXG7ij7MgV2FpdGluZyBmb3IgTGFtYmRhIGxvZ3MuLi4nKTtcbiAgICAgICAgY29uc3Qgc3VjY2VzcyA9IGF3YWl0IHdhaXRGb3JMb2dzKGxvZ0dyb3VwTmFtZSwgcmVxdWVzdElkKTtcblxuICAgICAgICBpZiAoc3VjY2Vzcykge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1xcbuKchSBIVFRQIEFQSSBJbnRlZ3JhdGlvbiBUZXN0IFBhc3NlZCEnKTtcbiAgICAgICAgICAgIHByb2Nlc3MuZXhpdCgwKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1xcbuKdjCBWZXJpZmljYXRpb24gRmFpbGVkOiBMb2cgbm90IGZvdW5kIHdpdGhpbiB0aW1lb3V0LicpO1xuICAgICAgICAgICAgcHJvY2Vzcy5leGl0KDEpO1xuICAgICAgICB9XG5cbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdJbnRlZ3JhdGlvbiB0ZXN0IGZhaWxlZDonLCBlcnJvcik7XG4gICAgICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgICB9XG59O1xuXG5ydW4oKTtcbiJdfQ==