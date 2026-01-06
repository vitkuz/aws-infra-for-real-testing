import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { withLogger, getLogger, REQUEST_ID_KEY } from '@vitkuz/aws-logger';
import { Client } from '@opensearch-project/opensearch';
import { createAdapter as createOsAdapter } from '@vitkuz/aws-opensearch-adapter';
import { createAdapter as createDynamoAdapter } from '@vitkuz/aws-dynamo-adapter';
import { defaultProvider } from '@aws-sdk/credential-provider-node';
import { AwsSigv4Signer } from '@opensearch-project/opensearch/aws';

const OPENSEARCH_ENDPOINT = process.env.OPENSEARCH_ENDPOINT;
const TABLE_NAME = process.env.TABLE_NAME;
const REGION = process.env.AWS_REGION;

if (!OPENSEARCH_ENDPOINT || !TABLE_NAME || !REGION) {
    throw new Error('Missing environment variables');
}

const osClient = new Client({
    ...AwsSigv4Signer({
        region: REGION,
        service: 'es',
        getCredentials: () => defaultProvider()(),
    }),
    node: `https://${OPENSEARCH_ENDPOINT}` // Node must come after signer to work correctly with some versions, but standard spread works
});

const dynamoClientConfig = { region: REGION };

export const handler = withLogger(async (event: APIGatewayProxyEvent, context: Context) => {
    const logger = getLogger();
    if (!logger) throw new Error('Logger missing');

    const headers = event.headers || {};
    // Extract request ID using custom key or keys from header
    const requestId = headers['x-request-id'] || headers['X-Request-Id'];

    // Create a child logger with the request ID
    const childLogger = logger.child(requestId ? { [REQUEST_ID_KEY]: requestId } : {});

    // Initialize adapters with the child logger
    const osAdapter = createOsAdapter({ client: osClient, logger: childLogger });
    const dynamoAdapter = createDynamoAdapter(dynamoClientConfig, childLogger);

    const { path, httpMethod, body } = event;
    const jsonBody = body ? JSON.parse(body) : {};

    childLogger.info('Search Sync API Request', { data: { path, httpMethod, requestId } });

    try {
        // --- OpenSearch Routes ---

        // POST /search -> Match Query
        if (path === '/search' && httpMethod === 'POST') {
            const { index, query } = jsonBody;
            // Using raw client for search as adapter likely lacks it (based on previous check)
            // Ideally we'd extend the adapter, but for now we use the client directly but log with our logger
            const result = await osClient.search({
                index,
                body: {
                    query: {
                        match: query
                    }
                }
            });
            return json(200, result.body);
        }

        // POST /indices -> Create Index
        if (path === '/indices' && httpMethod === 'POST') {
            const { index } = jsonBody;
            await osAdapter.createIndex({ index });
            return json(201, { message: `Index ${index} created` });
        }

        // DELETE /indices/{name} -> Delete Index
        if (path.startsWith('/indices/') && httpMethod === 'DELETE') {
            const index = path.split('/')[2];
            await osAdapter.deleteIndex({ index });
            return json(200, { message: `Index ${index} deleted` });
        }

        // PUT /indices/{name}/mapping -> Update Mapping
        if (path.startsWith('/indices/') && path.endsWith('/mapping') && httpMethod === 'PUT') {
            const index = path.split('/')[2];
            const { properties } = jsonBody;
            await osAdapter.updateMapping({
                index,
                body: { properties }
            });
            return json(200, { message: `Mapping updated for ${index}` });
        }


        // GET /indices/{name}/mapping -> Get Mapping
        if (path.startsWith('/indices/') && path.endsWith('/mapping') && httpMethod === 'GET') {
            const index = path.split('/')[2];
            const mapping = await osAdapter.getMapping({ index });
            return json(200, mapping);
        }

        // GET /indices/{name}/documents/{id} -> Get Document
        if (path.startsWith('/indices/') && path.includes('/documents/') && httpMethod === 'GET') {
            const parts = path.split('/');
            // /indices/{index}/documents/{id} -> ['', 'indices', 'indexName', 'documents', 'id']
            const index = parts[2];
            const id = parts[4];

            try {
                const doc = await osAdapter.getDocument({ index, id });
                return json(200, doc);
            } catch (error: any) {
                if (error.meta && error.meta.statusCode === 404) {
                    return json(404, { message: 'Document not found' });
                }
                throw error;
            }
        }


        // --- DynamoDB Routes ---

        // POST /records -> Add Record
        if (path === '/records' && httpMethod === 'POST') {
            const { item } = jsonBody;
            // Adapter requires 'id' and 'pk' (and 'sk').
            // If incoming item implies pk IS the id, ensure id is set.
            // Also, 'createOne' enforces id === pk if both exist.
            if (item.pk && !item.id) {
                item.id = item.pk;
            }
            if (!item.sk) {
                // Fallback if not provided, though test currently provides it
                item.sk = 'metadata';
            }

            await dynamoAdapter.createOne({
                tableName: TABLE_NAME,
                item: item
            });
            return json(201, { message: 'Record created', item });
        }

        // DELETE /records/{id} -> Remove Record
        if (path.startsWith('/records/') && httpMethod === 'DELETE') {
            const id = path.split('/')[2];
            // Adapter 'deleteOne' input: { tableName, item: { pk, sk } }
            await dynamoAdapter.deleteOne({
                tableName: TABLE_NAME,
                item: { pk: id, sk: 'metadata' } // Assuming sk is 'metadata' based on convention/test
            });
            return json(200, { message: `Record ${id} deleted` });
        }

        // PATCH /records/{id} -> Patch Record
        if (path.startsWith('/records/') && httpMethod === 'PATCH') {
            const id = path.split('/')[2];
            const { attributes } = jsonBody;
            // Adapter 'patchOne' input: { tableName, item: { pk, sk, ...attributes } }
            const patchItem = {
                pk: id,
                sk: 'metadata',
                ...attributes
            };

            const result = await dynamoAdapter.patchOne({
                tableName: TABLE_NAME,
                item: patchItem
            });
            return json(200, { message: `Record ${id} patched`, result });
        }


        return json(404, { message: 'Route not found' });

    } catch (error) {
        childLogger.error('API Error', { error: error instanceof Error ? error : String(error) } as any);
        return json(500, { error: error instanceof Error ? error.message : 'Internal Server Error' });
    }
});

const json = (statusCode: number, body: any) => ({
    statusCode,
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' }
});
