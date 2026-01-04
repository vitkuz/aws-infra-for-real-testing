import * as crypto from 'crypto';
import { getApiUrl, createRequester, sleep } from './common';

const run = async () => {
    try {
        const apiUrl = await getApiUrl();
        const requestId = crypto.randomUUID();
        const request = createRequester(apiUrl, requestId);
        // The stream processor writes to a hardcoded index
        const syncIndex = 'vitkuz-search-sync-index';
        const recordId = `record-${crypto.randomUUID()}`;

        console.log(`\n🚀 Starting Search Sync Integration Test`);
        console.log(`  Record ID: ${recordId}`);
        console.log(`  Request ID: ${requestId}`);

        // 1. Create Record (sends to DynamoDB)
        console.log('\nCreating record in DynamoDB...');
        const item = {
            pk: recordId,
            id: recordId, // Required by adapter logic: id === pk
            sk: 'metadata', // Required by adapter
            'x-request-id': requestId, // Include for logging correlation in stream
            data: 'test-data',
            number: 123,
        };
        await request('POST', '/records', { item });
        console.log('✅ Record created');

        // 2. Verify Search Sync
        console.log('\nWaiting 10s for DynamoDB Stream -> OpenSearch sync...');
        await sleep(10000);

        let searchRes: any = await request('POST', '/search', {
            index: syncIndex,
            query: { 'pk.keyword': recordId },
        });

        if (
            searchRes.hits &&
            searchRes.hits.total &&
            (searchRes.hits.total.value > 0 || searchRes.hits.total > 0)
        ) {
            const source = searchRes.hits.hits[0]._source;
            if (source.pk === recordId && source.data === 'test-data') {
                console.log('✅ Found synced record in OpenSearch!');
            } else {
                throw new Error(`Record found but data mismatch: ${JSON.stringify(source)}`);
            }
        } else {
            throw new Error(
                `Record not found in OpenSearch after wait. Response: ${JSON.stringify(searchRes)}`,
            );
        }

        // 2.5 Verify Get Document By ID
        console.log('\nVerifying GET document by ID...');
        try {
            const doc: any = await request('GET', `/indices/${syncIndex}/documents/${recordId}`);
            // The API returns the raw OpenSearch Client response, which has the document in `body`.
            const source = doc.body ? doc.body._source : doc._source;

            if (source && source.pk === recordId && source.data === 'test-data') {
                console.log('✅ Fetched document by ID successfully!');
            } else {
                console.error('❌ GET by ID Data Mismatch:', JSON.stringify(doc, null, 2));
                throw new Error(`GET by ID data mismatch.`);
            }
        } catch (e: any) {
            // ... existing error logging ...
            console.error('❌ GET by ID Failed with Error:', e.message);
            if (e.response) {
                // ...
            }
            throw e;
        }

        // 3. Update Record (Patch)
        console.log('\nPatching record...');
        await request('PATCH', `/records/${recordId}`, {
            attributes: { data: 'updated-data' },
        });
        console.log('✅ Record patched');

        // Verify update sync
        console.log('Waiting 10s for sync update...');
        await sleep(10000);

        searchRes = await request('POST', '/search', {
            index: syncIndex,
            query: { 'pk.keyword': recordId },
        });
        if (searchRes.hits?.hits?.[0]?._source?.data === 'updated-data') {
            console.log('✅ Found updated record in OpenSearch!');
        } else {
            throw new Error(`Update not synced. Data: ${searchRes.hits?.hits?.[0]?._source?.data}`);
        }

        // 4. Delete Record
        console.log('\nDeleting record...');
        await request('DELETE', `/records/${recordId}`);
        console.log('✅ Record deleted');

        // Wait for removal
        console.log('Waiting 10s for sync delete...');
        await sleep(10000);

        try {
            await request('GET', `/indices/${syncIndex}/documents/${recordId}`);
            throw new Error('Record still exists in OpenSearch after delete (expected 404)');
        } catch (error: any) {
            if (error.message.includes('404')) {
                console.log('✅ Record removed from OpenSearch (404 Not Found)!');
            } else {
                throw error;
            }
        }

        console.log('\n✅ Search Sync Integration Test Passed!');
    } catch (error) {
        console.error('\n❌ Test Failed:', error);
        process.exit(1);
    }
};

run();
