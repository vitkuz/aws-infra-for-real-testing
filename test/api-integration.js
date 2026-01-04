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
    const lambdaResource = resourcesResp.StackResources?.find(r => r.ResourceType === 'AWS::Lambda::Function' && r.LogicalResourceId?.includes('ApiHandler'));
    if (!lambdaResource?.PhysicalResourceId) {
        throw new Error('Could not find API Handler Lambda in stack resources');
    }
    const logGroupName = `/aws/lambda/${lambdaResource.PhysicalResourceId}`;
    // Get API URL from Stack Outputs (cleaner than reconstructing from resources)
    const stacksCmd = new client_cloudformation_1.DescribeStacksCommand({ StackName: STACK_NAME });
    const stacksResp = await cf.send(stacksCmd);
    const apiUrlOutput = stacksResp.Stacks?.[0].Outputs?.find(o => o.OutputKey === 'ApiUrl');
    if (!apiUrlOutput?.OutputValue) {
        throw new Error('Could not find ApiUrl output in stack');
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
                events.events.forEach(e => console.log(`  [${new Date(e.timestamp).toISOString()}] ${e.message}`));
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
        console.log(`\n🚀 Sending API Request with custom RequestID: ${requestId}...`);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpLWludGVncmF0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYXBpLWludGVncmF0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsMEVBQTRIO0FBQzVILDRFQUErRjtBQUUvRiwrQ0FBaUM7QUFFakMsTUFBTSxVQUFVLEdBQUcsb0JBQW9CLENBQUM7QUFDeEMsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLElBQUksV0FBVyxDQUFDO0FBRXJELE1BQU0saUJBQWlCLEdBQUcsS0FBSyxJQUFJLEVBQUU7SUFDakMsTUFBTSxFQUFFLEdBQUcsSUFBSSw0Q0FBb0IsQ0FBQyxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDO0lBRXhELHlDQUF5QztJQUN6QyxNQUFNLFlBQVksR0FBRyxJQUFJLHFEQUE2QixDQUFDLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxDQUFDLENBQUM7SUFDbEYsTUFBTSxhQUFhLEdBQUcsTUFBTSxFQUFFLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQ2xELE1BQU0sY0FBYyxHQUFHLGFBQWEsQ0FBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQzFELENBQUMsQ0FBQyxZQUFZLEtBQUssdUJBQXVCLElBQUksQ0FBQyxDQUFDLGlCQUFpQixFQUFFLFFBQVEsQ0FBQyxZQUFZLENBQUMsQ0FDNUYsQ0FBQztJQUVGLElBQUksQ0FBQyxjQUFjLEVBQUUsa0JBQWtCLEVBQUUsQ0FBQztRQUN0QyxNQUFNLElBQUksS0FBSyxDQUFDLHNEQUFzRCxDQUFDLENBQUM7SUFDNUUsQ0FBQztJQUNELE1BQU0sWUFBWSxHQUFHLGVBQWUsY0FBYyxDQUFDLGtCQUFrQixFQUFFLENBQUM7SUFFeEUsOEVBQThFO0lBQzlFLE1BQU0sU0FBUyxHQUFHLElBQUksNkNBQXFCLENBQUMsRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLENBQUMsQ0FBQztJQUN2RSxNQUFNLFVBQVUsR0FBRyxNQUFNLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDNUMsTUFBTSxZQUFZLEdBQUcsVUFBVSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsU0FBUyxLQUFLLFFBQVEsQ0FBQyxDQUFDO0lBRXpGLElBQUksQ0FBQyxZQUFZLEVBQUUsV0FBVyxFQUFFLENBQUM7UUFDN0IsTUFBTSxJQUFJLEtBQUssQ0FBQyx1Q0FBdUMsQ0FBQyxDQUFDO0lBQzdELENBQUM7SUFFRCxPQUFPO1FBQ0gsTUFBTSxFQUFFLFlBQVksQ0FBQyxXQUFXO1FBQ2hDLFlBQVk7S0FDZixDQUFDO0FBQ04sQ0FBQyxDQUFDO0FBRUYsTUFBTSxXQUFXLEdBQUcsS0FBSyxFQUFFLFlBQW9CLEVBQUUsWUFBb0IsRUFBRSxTQUFTLEdBQUcsS0FBSyxFQUFvQixFQUFFO0lBQzFHLE1BQU0sSUFBSSxHQUFHLElBQUksNkNBQW9CLENBQUMsRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQztJQUMxRCxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7SUFFN0IsT0FBTyxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsWUFBWSxTQUFTLFlBQVksTUFBTSxDQUFDLENBQUM7SUFFeEUsT0FBTyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsU0FBUyxHQUFHLFNBQVMsRUFBRSxDQUFDO1FBQ3hDLElBQUksQ0FBQztZQUNELCtCQUErQjtZQUMvQixNQUFNLE9BQU8sR0FBRyxJQUFJLCtDQUFzQixDQUFDO2dCQUN2QyxZQUFZO2dCQUNaLGFBQWEsRUFBRSxJQUFJLFlBQVksR0FBRztnQkFDbEMsU0FBUyxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxLQUFLO2FBQ2hDLENBQUMsQ0FBQztZQUVILE1BQU0sTUFBTSxHQUFpQyxNQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7WUFFdEUsSUFBSSxNQUFNLENBQUMsTUFBTSxJQUFJLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDO2dCQUM1QyxPQUFPLENBQUMsR0FBRyxDQUFDLDhCQUE4QixDQUFDLENBQUM7Z0JBQzVDLE1BQU0sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxTQUFVLENBQUMsQ0FBQyxXQUFXLEVBQUUsS0FBSyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUNwRyxPQUFPLElBQUksQ0FBQztZQUNoQixDQUFDO1FBQ0wsQ0FBQztRQUFDLE9BQU8sS0FBVSxFQUFFLENBQUM7WUFDbEIsT0FBTyxDQUFDLElBQUksQ0FBQyx1QkFBdUIsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7UUFDekQsQ0FBQztRQUVELE1BQU0sSUFBSSxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDaEQsQ0FBQztJQUVELE9BQU8sS0FBSyxDQUFDO0FBQ2pCLENBQUMsQ0FBQztBQUVGLE1BQU0sR0FBRyxHQUFHLEtBQUssSUFBSSxFQUFFO0lBQ25CLElBQUksQ0FBQztRQUNELE9BQU8sQ0FBQyxHQUFHLENBQUMsNkNBQTZDLFVBQVUsS0FBSyxDQUFDLENBQUM7UUFDMUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxZQUFZLEVBQUUsR0FBRyxNQUFNLGlCQUFpQixFQUFFLENBQUM7UUFDM0QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxjQUFjLE1BQU0sRUFBRSxDQUFDLENBQUM7UUFDcEMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsWUFBWSxFQUFFLENBQUMsQ0FBQztRQUU1QyxNQUFNLFNBQVMsR0FBRyxNQUFNLENBQUMsVUFBVSxFQUFFLENBQUM7UUFDdEMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxtREFBbUQsU0FBUyxLQUFLLENBQUMsQ0FBQztRQUUvRSxNQUFNLFFBQVEsR0FBRyxNQUFNLEtBQUssQ0FBQyxNQUFNLEVBQUU7WUFDakMsTUFBTSxFQUFFLEtBQUs7WUFDYixPQUFPLEVBQUU7Z0JBQ0wsY0FBYyxFQUFFLFNBQVM7Z0JBQ3pCLGNBQWMsRUFBRSxrQkFBa0I7YUFDckM7U0FDSixDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQ2YsTUFBTSxJQUFJLEtBQUssQ0FBQyx1QkFBdUIsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7UUFDOUQsQ0FBQztRQUVELE1BQU0sSUFBSSxHQUFRLE1BQU0sUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ3hDLE9BQU8sQ0FBQyxHQUFHLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBRWpDLElBQUksSUFBSSxDQUFDLFNBQVMsS0FBSyxTQUFTLEVBQUUsQ0FBQztZQUMvQixNQUFNLElBQUksS0FBSyxDQUFDLHlDQUF5QyxTQUFTLFNBQVMsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUM7UUFDakcsQ0FBQztRQUNELE9BQU8sQ0FBQyxHQUFHLENBQUMsaUNBQWlDLENBQUMsQ0FBQztRQUcvQyxPQUFPLENBQUMsR0FBRyxDQUFDLGdDQUFnQyxDQUFDLENBQUM7UUFDOUMsTUFBTSxPQUFPLEdBQUcsTUFBTSxXQUFXLENBQUMsWUFBWSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBRTNELElBQUksT0FBTyxFQUFFLENBQUM7WUFDVixPQUFPLENBQUMsR0FBRyxDQUFDLGtDQUFrQyxDQUFDLENBQUM7WUFDaEQsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNwQixDQUFDO2FBQU0sQ0FBQztZQUNKLE9BQU8sQ0FBQyxLQUFLLENBQUMsb0RBQW9ELENBQUMsQ0FBQztZQUNwRSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3BCLENBQUM7SUFFTCxDQUFDO0lBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztRQUNiLE9BQU8sQ0FBQyxLQUFLLENBQUMsMEJBQTBCLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDakQsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNwQixDQUFDO0FBQ0wsQ0FBQyxDQUFDO0FBRUYsR0FBRyxFQUFFLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDbG91ZEZvcm1hdGlvbkNsaWVudCwgRGVzY3JpYmVTdGFja1Jlc291cmNlc0NvbW1hbmQsIERlc2NyaWJlU3RhY2tzQ29tbWFuZCB9IGZyb20gJ0Bhd3Mtc2RrL2NsaWVudC1jbG91ZGZvcm1hdGlvbic7XG5pbXBvcnQgeyBDbG91ZFdhdGNoTG9nc0NsaWVudCwgRmlsdGVyTG9nRXZlbnRzQ29tbWFuZCB9IGZyb20gJ0Bhd3Mtc2RrL2NsaWVudC1jbG91ZHdhdGNoLWxvZ3MnO1xuaW1wb3J0IHR5cGUgeyBGaWx0ZXJMb2dFdmVudHNDb21tYW5kT3V0cHV0IH0gZnJvbSAnQGF3cy1zZGsvY2xpZW50LWNsb3Vkd2F0Y2gtbG9ncyc7XG5pbXBvcnQgKiBhcyBjcnlwdG8gZnJvbSAnY3J5cHRvJztcblxuY29uc3QgU1RBQ0tfTkFNRSA9ICd2aXRrdXotdGVzdGluZy1hcGknO1xuY29uc3QgUkVHSU9OID0gcHJvY2Vzcy5lbnYuQVdTX1JFR0lPTiB8fCAndXMtZWFzdC0xJztcblxuY29uc3QgZ2V0U3RhY2tSZXNvdXJjZXMgPSBhc3luYyAoKSA9PiB7XG4gICAgY29uc3QgY2YgPSBuZXcgQ2xvdWRGb3JtYXRpb25DbGllbnQoeyByZWdpb246IFJFR0lPTiB9KTtcblxuICAgIC8vIEdldCBMb2cgR3JvdXAgTmFtZSBmcm9tIFNhY2sgUmVzb3VyY2VzXG4gICAgY29uc3QgcmVzb3VyY2VzQ21kID0gbmV3IERlc2NyaWJlU3RhY2tSZXNvdXJjZXNDb21tYW5kKHsgU3RhY2tOYW1lOiBTVEFDS19OQU1FIH0pO1xuICAgIGNvbnN0IHJlc291cmNlc1Jlc3AgPSBhd2FpdCBjZi5zZW5kKHJlc291cmNlc0NtZCk7XG4gICAgY29uc3QgbGFtYmRhUmVzb3VyY2UgPSByZXNvdXJjZXNSZXNwLlN0YWNrUmVzb3VyY2VzPy5maW5kKHIgPT5cbiAgICAgICAgci5SZXNvdXJjZVR5cGUgPT09ICdBV1M6OkxhbWJkYTo6RnVuY3Rpb24nICYmIHIuTG9naWNhbFJlc291cmNlSWQ/LmluY2x1ZGVzKCdBcGlIYW5kbGVyJylcbiAgICApO1xuXG4gICAgaWYgKCFsYW1iZGFSZXNvdXJjZT8uUGh5c2ljYWxSZXNvdXJjZUlkKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignQ291bGQgbm90IGZpbmQgQVBJIEhhbmRsZXIgTGFtYmRhIGluIHN0YWNrIHJlc291cmNlcycpO1xuICAgIH1cbiAgICBjb25zdCBsb2dHcm91cE5hbWUgPSBgL2F3cy9sYW1iZGEvJHtsYW1iZGFSZXNvdXJjZS5QaHlzaWNhbFJlc291cmNlSWR9YDtcblxuICAgIC8vIEdldCBBUEkgVVJMIGZyb20gU3RhY2sgT3V0cHV0cyAoY2xlYW5lciB0aGFuIHJlY29uc3RydWN0aW5nIGZyb20gcmVzb3VyY2VzKVxuICAgIGNvbnN0IHN0YWNrc0NtZCA9IG5ldyBEZXNjcmliZVN0YWNrc0NvbW1hbmQoeyBTdGFja05hbWU6IFNUQUNLX05BTUUgfSk7XG4gICAgY29uc3Qgc3RhY2tzUmVzcCA9IGF3YWl0IGNmLnNlbmQoc3RhY2tzQ21kKTtcbiAgICBjb25zdCBhcGlVcmxPdXRwdXQgPSBzdGFja3NSZXNwLlN0YWNrcz8uWzBdLk91dHB1dHM/LmZpbmQobyA9PiBvLk91dHB1dEtleSA9PT0gJ0FwaVVybCcpO1xuXG4gICAgaWYgKCFhcGlVcmxPdXRwdXQ/Lk91dHB1dFZhbHVlKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignQ291bGQgbm90IGZpbmQgQXBpVXJsIG91dHB1dCBpbiBzdGFjaycpO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICAgIGFwaVVybDogYXBpVXJsT3V0cHV0Lk91dHB1dFZhbHVlLFxuICAgICAgICBsb2dHcm91cE5hbWVcbiAgICB9O1xufTtcblxuY29uc3Qgd2FpdEZvckxvZ3MgPSBhc3luYyAobG9nR3JvdXBOYW1lOiBzdHJpbmcsIHNlYXJjaFN0cmluZzogc3RyaW5nLCB0aW1lb3V0TXMgPSA2MDAwMCk6IFByb21pc2U8Ym9vbGVhbj4gPT4ge1xuICAgIGNvbnN0IGxvZ3MgPSBuZXcgQ2xvdWRXYXRjaExvZ3NDbGllbnQoeyByZWdpb246IFJFR0lPTiB9KTtcbiAgICBjb25zdCBzdGFydFRpbWUgPSBEYXRlLm5vdygpO1xuXG4gICAgY29uc29sZS5sb2coYFBvbGxpbmcgbG9ncyBpbiAke2xvZ0dyb3VwTmFtZX0gZm9yIFwiJHtzZWFyY2hTdHJpbmd9XCIuLi5gKTtcblxuICAgIHdoaWxlIChEYXRlLm5vdygpIC0gc3RhcnRUaW1lIDwgdGltZW91dE1zKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBTZWFyY2ggbGFzdCAxIG1pbnV0ZSBvZiBsb2dzXG4gICAgICAgICAgICBjb25zdCBjb21tYW5kID0gbmV3IEZpbHRlckxvZ0V2ZW50c0NvbW1hbmQoe1xuICAgICAgICAgICAgICAgIGxvZ0dyb3VwTmFtZSxcbiAgICAgICAgICAgICAgICBmaWx0ZXJQYXR0ZXJuOiBgXCIke3NlYXJjaFN0cmluZ31cImAsXG4gICAgICAgICAgICAgICAgc3RhcnRUaW1lOiBEYXRlLm5vdygpIC0gNjAwMDBcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBjb25zdCBldmVudHM6IEZpbHRlckxvZ0V2ZW50c0NvbW1hbmRPdXRwdXQgPSBhd2FpdCBsb2dzLnNlbmQoY29tbWFuZCk7XG5cbiAgICAgICAgICAgIGlmIChldmVudHMuZXZlbnRzICYmIGV2ZW50cy5ldmVudHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCfinIUgRm91bmQgbWF0Y2hpbmcgbG9nIGV2ZW50czonKTtcbiAgICAgICAgICAgICAgICBldmVudHMuZXZlbnRzLmZvckVhY2goZSA9PiBjb25zb2xlLmxvZyhgICBbJHtuZXcgRGF0ZShlLnRpbWVzdGFtcCEpLnRvSVNPU3RyaW5nKCl9XSAke2UubWVzc2FnZX1gKSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgRXJyb3IgcG9sbGluZyBsb2dzOiAke2Vycm9yLm1lc3NhZ2V9YCk7XG4gICAgICAgIH1cblxuICAgICAgICBhd2FpdCBuZXcgUHJvbWlzZShyID0+IHNldFRpbWVvdXQociwgMjAwMCkpO1xuICAgIH1cblxuICAgIHJldHVybiBmYWxzZTtcbn07XG5cbmNvbnN0IHJ1biA9IGFzeW5jICgpID0+IHtcbiAgICB0cnkge1xuICAgICAgICBjb25zb2xlLmxvZyhg8J+UjSBEaXNjb3ZlcmluZyBTdGFjayBSZXNvdXJjZXMgZm9yIHN0YWNrOiAke1NUQUNLX05BTUV9Li4uYCk7XG4gICAgICAgIGNvbnN0IHsgYXBpVXJsLCBsb2dHcm91cE5hbWUgfSA9IGF3YWl0IGdldFN0YWNrUmVzb3VyY2VzKCk7XG4gICAgICAgIGNvbnNvbGUubG9nKGAgIEFQSSBVUkw6ICR7YXBpVXJsfWApO1xuICAgICAgICBjb25zb2xlLmxvZyhgICBMb2cgR3JvdXA6ICR7bG9nR3JvdXBOYW1lfWApO1xuXG4gICAgICAgIGNvbnN0IHJlcXVlc3RJZCA9IGNyeXB0by5yYW5kb21VVUlEKCk7XG4gICAgICAgIGNvbnNvbGUubG9nKGBcXG7wn5qAIFNlbmRpbmcgQVBJIFJlcXVlc3Qgd2l0aCBjdXN0b20gUmVxdWVzdElEOiAke3JlcXVlc3RJZH0uLi5gKTtcblxuICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKGFwaVVybCwge1xuICAgICAgICAgICAgbWV0aG9kOiAnR0VUJyxcbiAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICAneC1yZXF1ZXN0LWlkJzogcmVxdWVzdElkLFxuICAgICAgICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbidcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKCFyZXNwb25zZS5vaykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBBUEkgcmV0dXJuZWQgc3RhdHVzICR7cmVzcG9uc2Uuc3RhdHVzfWApO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgYm9keTogYW55ID0gYXdhaXQgcmVzcG9uc2UuanNvbigpO1xuICAgICAgICBjb25zb2xlLmxvZygnICBSZXNwb25zZTonLCBib2R5KTtcblxuICAgICAgICBpZiAoYm9keS5yZXF1ZXN0SWQgIT09IHJlcXVlc3RJZCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBSZXNwb25zZSByZXF1ZXN0SWQgbWlzbWF0Y2ghIEV4cGVjdGVkICR7cmVxdWVzdElkfSwgZ290ICR7Ym9keS5yZXF1ZXN0SWR9YCk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc29sZS5sb2coJyAg4pyFIFJlc3BvbnNlIHJlcXVlc3RJZCBtYXRjaGVzLicpO1xuXG5cbiAgICAgICAgY29uc29sZS5sb2coJ1xcbuKPsyBXYWl0aW5nIGZvciBMYW1iZGEgbG9ncy4uLicpO1xuICAgICAgICBjb25zdCBzdWNjZXNzID0gYXdhaXQgd2FpdEZvckxvZ3MobG9nR3JvdXBOYW1lLCByZXF1ZXN0SWQpO1xuXG4gICAgICAgIGlmIChzdWNjZXNzKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnXFxu4pyFIEFQSSBJbnRlZ3JhdGlvbiBUZXN0IFBhc3NlZCEnKTtcbiAgICAgICAgICAgIHByb2Nlc3MuZXhpdCgwKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1xcbuKdjCBWZXJpZmllZCBGYWlsZWQ6IExvZyBub3QgZm91bmQgd2l0aGluIHRpbWVvdXQuJyk7XG4gICAgICAgICAgICBwcm9jZXNzLmV4aXQoMSk7XG4gICAgICAgIH1cblxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0ludGVncmF0aW9uIHRlc3QgZmFpbGVkOicsIGVycm9yKTtcbiAgICAgICAgcHJvY2Vzcy5leGl0KDEpO1xuICAgIH1cbn07XG5cbnJ1bigpO1xuIl19