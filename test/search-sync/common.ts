import { CloudFormationClient, DescribeStacksCommand } from '@aws-sdk/client-cloudformation';

export const STACK_NAME = 'vitkuz-testing-search-sync';
export const REGION = process.env.AWS_REGION || 'us-east-1';

export const getApiUrl = async (): Promise<string> => {
    console.log(`🔍 Discovering API URL for stack: ${STACK_NAME}...`);
    const cf = new CloudFormationClient({ region: REGION });
    const stacksCmd = new DescribeStacksCommand({ StackName: STACK_NAME });
    const stacksResp = await cf.send(stacksCmd);
    const apiUrlOutput = stacksResp.Stacks?.[0].Outputs?.find((o) => o.OutputKey === 'ApiUrl');

    if (!apiUrlOutput?.OutputValue) {
        throw new Error('Could not find ApiUrl output in stack');
    }
    const apiUrl = apiUrlOutput.OutputValue;
    console.log(`  API URL: ${apiUrl}`);
    return apiUrl;
};

export const createRequester = (apiUrl: string, requestId: string) => {
    return async (method: string, path: string, body?: any) => {
        const res = await fetch(`${apiUrl}${path}`, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'x-request-id': requestId,
            },
            body: body ? JSON.stringify(body) : undefined,
        });
        if (!res.ok) {
            const text = await res.text();
            throw new Error(`${method} ${path} failed: ${res.status} ${text}`);
        }
        return res.json();
    };
};

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
