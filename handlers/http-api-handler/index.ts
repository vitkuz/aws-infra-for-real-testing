import { APIGatewayProxyEventV2, Context } from 'aws-lambda';
import { withLogger, getLogger, REQUEST_ID_KEY } from '@vitkuz/aws-logger';

export const handler = withLogger(async (event: APIGatewayProxyEventV2, context: Context) => {
    const logger = getLogger();
    if (!logger) throw new Error('Logger context missing');

    const headers = event.headers || {};
    // API Gateway V2 lowercases headers
    const requestId = headers['x-request-id'];

    const childLogger = logger.child(requestId ? { [REQUEST_ID_KEY]: requestId } : {});

    childLogger.info('HTTP API Handler Invoked', {
        data: {
            path: event.requestContext.http.path,
            method: event.requestContext.http.method,
            queryParams: event.queryStringParameters,
            requestId
        }
    });

    return {
        statusCode: 200,
        body: JSON.stringify({
            message: 'Hello from Vitkuz Testing HTTP API',
            path: event.requestContext.http.path,
            method: event.requestContext.http.method,
            requestId: requestId || context.awsRequestId
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    };
});
