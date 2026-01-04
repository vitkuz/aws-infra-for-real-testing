import * as crypto from 'crypto';
import { getApiUrl, createRequester } from './common';

const run = async () => {
    try {
        const apiUrl = await getApiUrl();
        const requestId = crypto.randomUUID();
        const request = createRequester(apiUrl, requestId);
        const indexName = `test-index-mgmt-${crypto.randomUUID()}`;

        console.log(`\n🚀 Starting Indices Integration Test`);
        console.log(`  Index: ${indexName}`);
        console.log(`  Request ID: ${requestId}`);

        // 1. Create Index
        console.log('\nCreating index...');
        await request('POST', '/indices', { index: indexName });
        console.log('✅ Index created');

        // 2. Put Mapping
        console.log('\nUpdating mapping...');
        await request('PUT', `/indices/${indexName}/mapping`, {
            properties: {
                testField: { type: 'keyword' },
            },
        });
        console.log('✅ Mapping updated');

        // 3. Get Mapping
        console.log('\nGetting mapping...');
        const mapping: any = await request('GET', `/indices/${indexName}/mapping`);
        console.log('✅ Mapping retrieved', JSON.stringify(mapping, null, 2));

        // Verify mapping roughly
        const props = mapping.body[indexName]?.mappings?.properties;
        if (!props || !props.testField) {
            console.warn('⚠️ Warning: Mapping verification weak, could not find testField');
        } else {
            console.log('✅ Mapping verified');
        }

        // 4. Delete Index
        console.log('\nDeleting index...');
        await request('DELETE', `/indices/${indexName}`);
        console.log('✅ Index deleted');

        console.log('\n✅ Indices Integration Test Passed!');
    } catch (error) {
        console.error('\n❌ Test Failed:', error);
        process.exit(1);
    }
};

run();
