import { Context } from 'aws-lambda';
import { withLogger, getLogger } from '@vitkuz/aws-logger';
import { createClient as createOpenSearchClient, indexDocument } from '@vitkuz/aws-opensearch-adapter';

// OpenSearch client needs endpoint.
const node = process.env.OPENSEARCH_ENDPOINT;
// If env var is missing during init (e.g. test context), we might fail or default.
// Lambda ensures env vars are present.
const client = createOpenSearchClient({
    node: `https://${node}`
});

export const handler = withLogger(async (event: any, context: Context) => {
    if (!node) throw new Error('OPENSEARCH_ENDPOINT is required');

    const logger = getLogger();
    if (!logger) throw new Error('Logger context missing');

    const ctx = { logger, client };

    const index = 'test-index';
    logger.info('Indexing document', { data: { index } });

    const result = await indexDocument(ctx)({
        index,
        body: {
            title: 'Test Document',
            timestamp: new Date().toISOString()
        }
    });

    logger.info('Index result', { data: { result } });

    return { statusCode: 200, body: 'Success' };
});
