import {
    CloudFormationClient,
    DescribeStackResourcesCommand,
    DescribeStacksCommand,
} from '@aws-sdk/client-cloudformation';
import { CloudWatchLogsClient, FilterLogEventsCommand } from '@aws-sdk/client-cloudwatch-logs';
import type { FilterLogEventsCommandOutput } from '@aws-sdk/client-cloudwatch-logs';
import * as crypto from 'crypto';

const STACK_NAME = 'vitkuz-testing-api';
const REGION = process.env.AWS_REGION || 'us-east-1';

const getStackResources = async () => {
    const cf = new CloudFormationClient({ region: REGION });

    // Get Log Group Name from Sack Resources
    const resourcesCmd = new DescribeStackResourcesCommand({ StackName: STACK_NAME });
    const resourcesResp = await cf.send(resourcesCmd);
    const lambdaResource = resourcesResp.StackResources?.find(
        (r) =>
            r.ResourceType === 'AWS::Lambda::Function' &&
            r.LogicalResourceId?.includes('ApiHandler'),
    );

    if (!lambdaResource?.PhysicalResourceId) {
        throw new Error('Could not find API Handler Lambda in stack resources');
    }
    const logGroupName = `/aws/lambda/${lambdaResource.PhysicalResourceId}`;

    // Get API URL from Stack Outputs (cleaner than reconstructing from resources)
    const stacksCmd = new DescribeStacksCommand({ StackName: STACK_NAME });
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

const waitForLogs = async (
    logGroupName: string,
    searchString: string,
    timeoutMs = 60000,
): Promise<boolean> => {
    const logs = new CloudWatchLogsClient({ region: REGION });
    const startTime = Date.now();

    console.log(`Polling logs in ${logGroupName} for "${searchString}"...`);

    while (Date.now() - startTime < timeoutMs) {
        try {
            // Search last 1 minute of logs
            const command = new FilterLogEventsCommand({
                logGroupName,
                filterPattern: `"${searchString}"`,
                startTime: Date.now() - 60000,
            });

            const events: FilterLogEventsCommandOutput = await logs.send(command);

            if (events.events && events.events.length > 0) {
                console.log('✅ Found matching log events:');
                events.events.forEach((e) =>
                    console.log(`  [${new Date(e.timestamp!).toISOString()}] ${e.message}`),
                );
                return true;
            }
        } catch (error: any) {
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

        const body: any = await response.json();
        console.log('  Response:', body);

        if (body.requestId !== requestId) {
            throw new Error(
                `Response requestId mismatch! Expected ${requestId}, got ${body.requestId}`,
            );
        }
        console.log('  ✅ Response requestId matches.');

        console.log('\n⏳ Waiting for Lambda logs...');
        const success = await waitForLogs(logGroupName, requestId);

        if (success) {
            console.log('\n✅ API Integration Test Passed!');
            process.exit(0);
        } else {
            console.error('\n❌ Verified Failed: Log not found within timeout.');
            process.exit(1);
        }
    } catch (error) {
        console.error('Integration test failed:', error);
        process.exit(1);
    }
};

run();
