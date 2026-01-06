import { DynamoDBStreamEvent, Context } from 'aws-lambda';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import { AttributeValue } from '@aws-sdk/client-dynamodb';
import { withLogger, getLogger, REQUEST_ID_KEY } from '@vitkuz/aws-logger';
import { Client } from '@opensearch-project/opensearch';
import { createAdapter } from '@vitkuz/aws-opensearch-adapter';
import { defaultProvider } from '@aws-sdk/credential-provider-node';
import { AwsSigv4Signer } from '@opensearch-project/opensearch/aws';

// Hardcoded index name as requested
const INDEX_NAME = 'vitkuz-search-sync-index';
const OPENSEARCH_ENDPOINT = process.env.OPENSEARCH_ENDPOINT;
const REGION = process.env.AWS_REGION || 'us-east-1'; // Default backup

if (!OPENSEARCH_ENDPOINT) {
    throw new Error('OPENSEARCH_ENDPOINT env var is missing');
}

const client = new Client({
    ...AwsSigv4Signer({
        region: REGION,
        service: 'es',
        getCredentials: () => defaultProvider()(),
    }),
    node: `https://${OPENSEARCH_ENDPOINT}`
});

export const handler = withLogger(async (event: DynamoDBStreamEvent, context: Context) => {
    const logger = getLogger();
    if (!logger) throw new Error('Logger missing');

    const adapter = createAdapter({ client, logger });

    logger.info('Processing DynamoDB Stream for Search Sync', {
        data: {
            recordCount: event.Records.length,
            indexIs: INDEX_NAME
        }
    });

    for (const record of event.Records) {
        // Attempt to extract request ID if stored in the record (e.g. from the API insert)
        // This is a best-effort correlation
        let requestId: string | undefined;
        if (record.dynamodb?.NewImage) {
            const doc = unmarshall(record.dynamodb.NewImage as { [key: string]: AttributeValue });
            // If the item has a 'requestId' or similar field, we could use it.
            // Assuming standard field naming or just relying on Lambda context ID if not found.
            // If the user meant "extract custom request id key" from the *logger package*, I am using REQUEST_ID_KEY
            // to key it in the logger. I will check if 'x-request-id' exists in the document.
            if (doc['x-request-id']) {
                requestId = doc['x-request-id'];
            }
        }


        const childLogger = logger.child({
            ...(requestId ? { [REQUEST_ID_KEY]: requestId } : {}),
            eventName: record.eventName
        });

        try {
            if (record.eventName === 'INSERT' || record.eventName === 'MODIFY') {
                if (!record.dynamodb?.NewImage) continue;

                // Unmarshall DynamoDB JSON to standard JSON
                const doc = unmarshall(record.dynamodb.NewImage as { [key: string]: AttributeValue });
                const id = doc.pk; // Assuming 'pk' is the ID

                if (!id) {
                    childLogger.warn('Skipping record without pk', { data: { record } });
                    continue;
                }

                await adapter.indexDocument({
                    index: INDEX_NAME,
                    id: id,
                    body: doc,
                    refresh: true // Forcing refresh for immediate consistency in tests, safe for low volume
                });

                childLogger.info('Indexed document', { data: { id, eventName: record.eventName } });

            } else if (record.eventName === 'REMOVE') {
                if (!record.dynamodb?.Keys) continue;

                const keys = unmarshall(record.dynamodb.Keys as { [key: string]: AttributeValue });
                const id = keys.pk;

                if (!id) {
                    childLogger.warn('Skipping delete without pk', { data: { record } });
                    continue;
                }

                await adapter.deleteDocument({
                    index: INDEX_NAME,
                    id: id,
                    refresh: true
                });

                childLogger.info('Deleted document', { data: { id } });
            }
        } catch (error) {
            logger.error('Error processing record', { error: error instanceof Error ? error : String(error), data: { record } } as any);
            // Should we throw to retry? Usually yes for reliability.
            // For this demo/test stack, logging might be sufficient, but rethrowing ensures DLQ/retry behavior.
            throw error;
        }
    }
});
