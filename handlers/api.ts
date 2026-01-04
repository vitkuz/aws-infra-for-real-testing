import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { withLogger, getLogger, REQUEST_ID_KEY } from '@vitkuz/aws-logger';

export const handler = withLogger(async (event: APIGatewayProxyEvent, context: Context) => {
    const logger = getLogger();
    if (!logger) throw new Error('Logger context missing');

    const headers = event.headers || {};
    // Case-insensitive header lookup might be needed, but usually exact match or check specific casing
    const requestId = headers['x-request-id'] || headers['X-Request-Id'];

    const childLogger = logger.child(requestId ? { [REQUEST_ID_KEY]: requestId } : {});

    childLogger.info('API Handler Invoked', {
        path: event.path,
        method: event.httpMethod,
        queryParams: event.queryStringParameters
    });

    return {
        statusCode: 200,
        body: JSON.stringify({
            message: 'Hello from Vitkuz Testing API',
            path: event.path,
            method: event.httpMethod,
            requestId: requestId || context.awsRequestId
        })
    };
});
