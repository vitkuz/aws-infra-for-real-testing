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
const crypto = __importStar(require("crypto"));
const STACK_NAME = 'vitkuz-testing-search-sync';
const REGION = process.env.AWS_REGION || 'us-east-1';
// We just interact with the public API
const run = async () => {
    try {
        console.log(`🔍 Discovering API URL for stack: ${STACK_NAME}...`);
        const cf = new client_cloudformation_1.CloudFormationClient({ region: REGION });
        const stacksCmd = new client_cloudformation_1.DescribeStacksCommand({ StackName: STACK_NAME });
        const stacksResp = await cf.send(stacksCmd);
        const apiUrlOutput = stacksResp.Stacks?.[0].Outputs?.find(o => o.OutputKey === 'ApiUrl');
        if (!apiUrlOutput?.OutputValue) {
            throw new Error('Could not find ApiUrl output in stack');
        }
        const apiUrl = apiUrlOutput.OutputValue;
        console.log(`  API URL: ${apiUrl}`);
        const indexName = `test-index-${crypto.randomUUID()}`;
        const recordId = `record-${crypto.randomUUID()}`;
        const requestId = crypto.randomUUID();
        console.log(`\n🚀 Starting Integration Test`);
        console.log(`  Index: ${indexName}`);
        console.log(`  Record ID: ${recordId}`);
        console.log(`  Request ID: ${requestId}`);
        // Helper for requests
        const request = async (method, path, body) => {
            const res = await fetch(`${apiUrl}${path}`, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'x-request-id': requestId // Propagate our ID
                },
                body: body ? JSON.stringify(body) : undefined
            });
            if (!res.ok) {
                const text = await res.text();
                throw new Error(`${method} ${path} failed: ${res.status} ${text}`);
            }
            return res.json();
        };
        // 1. Create Index
        console.log('\nPlease create index...');
        await request('POST', '/indices', { index: indexName });
        console.log('✅ Index created');
        // 2. Create Record (sends to DynamoDB)
        console.log('\nCreating record in DynamoDB...');
        const item = {
            pk: recordId,
            id: recordId, // Required by adapter logic: id === pk
            sk: 'metadata', // Required by adapter
            'x-request-id': requestId, // Include for logging correlation in stream
            data: 'test-data',
            number: 123
        };
        await request('POST', '/records', { item });
        console.log('✅ Record created');
        // 3. Verify Search Sync (Wait and Poll)
        console.log('\nWaiting for DynamoDB Stream -> OpenSearch sync...');
        let found = false;
        // DynamoDB Stream to Lambda to OS is usually fast (< 5s), but give it time
        for (let i = 0; i < 20; i++) {
            // We search in the HARDCODED index that the stream processor uses: 'vitkuz-search-sync-index'
            // Wait, the API allows creating arbitrary indices, but the stream processor writes to a HARDCODED one: 'vitkuz-search-sync-index'
            // My test created a RANDOM index 'test-index-...' but the stream processor writes to 'vitkuz-search-sync-index'.
            // I should verify 'vitkuz-search-sync-index' instead.
            // But my API create index test is valid for the API functionality.
            // Let's check the hardcoded index for the record
            const syncIndex = 'vitkuz-search-sync-index';
            try {
                const searchRes = await request('POST', '/search', {
                    index: syncIndex,
                    query: { pk: recordId } // Simple match on pk
                });
                // Check hits
                if (searchRes.hits && searchRes.hits.total && searchRes.hits.total.value > 0) {
                    // Verify data
                    const source = searchRes.hits.hits[0]._source;
                    if (source.pk === recordId && source.data === 'test-data') {
                        console.log('✅ Found synced record in OpenSearch!');
                        found = true;
                        break;
                    }
                }
            }
            catch (e) {
                // Ignore 404s if index doesn't exist yet (created by stream processor implicitly?)
                // Adapter creates index if missing? No, usually not unless configured.
                // But we have 'vitkuz-search-sync-index' in stream-processor.ts
            }
            await new Promise(r => setTimeout(r, 1000));
            process.stdout.write('.');
        }
        if (!found) {
            throw new Error('Timeout waiting for OpenSearch sync');
        }
        // 4. Update Record (Patch)
        console.log('\nPatching record...');
        await request('PATCH', `/records/${recordId}`, {
            attributes: { data: 'updated-data' }
        });
        console.log('✅ Record patched');
        // Verify update sync
        console.log('Waiting for sync update...');
        found = false;
        for (let i = 0; i < 20; i++) {
            const searchRes = await request('POST', '/search', {
                index: 'vitkuz-search-sync-index',
                query: { pk: recordId }
            });
            if (searchRes.hits?.hits?.[0]?._source?.data === 'updated-data') {
                console.log('✅ Found updated record in OpenSearch!');
                found = true;
                break;
            }
            await new Promise(r => setTimeout(r, 1000));
            process.stdout.write('.');
        }
        if (!found)
            throw new Error('Timeout waiting for update sync');
        // 5. Delete Record
        console.log('\nDeleting record...');
        await request('DELETE', `/records/${recordId}`);
        console.log('✅ Record deleted');
        // Wait for removal
        console.log('Waiting for sync delete...');
        found = false;
        for (let i = 0; i < 20; i++) {
            const searchRes = await request('POST', '/search', {
                index: 'vitkuz-search-sync-index',
                query: { pk: recordId }
            });
            const hits = searchRes.hits?.total?.value ?? searchRes.hits?.total ?? 0;
            // console.log(`Debug: Delete check hits: ${hits}`);
            if (hits === 0) {
                console.log('✅ Record removed from OpenSearch!');
                found = true;
                break;
            }
            await new Promise(r => setTimeout(r, 1000));
            process.stdout.write('.');
        }
        if (!found)
            throw new Error('Timeout waiting for delete sync');
        // 6. Cleanup (Delete the MANUALLY created index test-index-...)
        console.log(`\nDeleting manual index ${indexName}...`);
        await request('DELETE', `/indices/${indexName}`);
        console.log('✅ Index deleted');
        console.log('\n✅ Search Sync Integration Test Passed!');
    }
    catch (error) {
        console.error('\n❌ Test Failed:', error);
        process.exit(1);
    }
};
run();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW50ZWdyYXRpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbnRlZ3JhdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDBFQUE0SDtBQUM1SCwrQ0FBaUM7QUFFakMsTUFBTSxVQUFVLEdBQUcsNEJBQTRCLENBQUM7QUFDaEQsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLElBQUksV0FBVyxDQUFDO0FBRXJELHVDQUF1QztBQUN2QyxNQUFNLEdBQUcsR0FBRyxLQUFLLElBQUksRUFBRTtJQUNuQixJQUFJLENBQUM7UUFDRCxPQUFPLENBQUMsR0FBRyxDQUFDLHFDQUFxQyxVQUFVLEtBQUssQ0FBQyxDQUFDO1FBQ2xFLE1BQU0sRUFBRSxHQUFHLElBQUksNENBQW9CLENBQUMsRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQztRQUN4RCxNQUFNLFNBQVMsR0FBRyxJQUFJLDZDQUFxQixDQUFDLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxDQUFDLENBQUM7UUFDdkUsTUFBTSxVQUFVLEdBQUcsTUFBTSxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQzVDLE1BQU0sWUFBWSxHQUFHLFVBQVUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFNBQVMsS0FBSyxRQUFRLENBQUMsQ0FBQztRQUV6RixJQUFJLENBQUMsWUFBWSxFQUFFLFdBQVcsRUFBRSxDQUFDO1lBQzdCLE1BQU0sSUFBSSxLQUFLLENBQUMsdUNBQXVDLENBQUMsQ0FBQztRQUM3RCxDQUFDO1FBQ0QsTUFBTSxNQUFNLEdBQUcsWUFBWSxDQUFDLFdBQVcsQ0FBQztRQUN4QyxPQUFPLENBQUMsR0FBRyxDQUFDLGNBQWMsTUFBTSxFQUFFLENBQUMs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QztRQUN2RCxNQUFNLE9BQU8sQ0FBQyxRQUFRLEVBQUUsWUFBWSxTQUFTLEVBQUUsQ0FBQyxDQUFDO1FBQ2pELE9BQU8sQ0FBQyxHQUFHLENBQUMsaUJBQWlCLENBQUMsQ0FBQztRQUUvQixPQUFPLENBQUMsR0FBRyxDQUFDLDBDQUEwQyxDQUFDLENBQUM7SUFFNUQsQ0FBQztJQUFDLE9BQU8sS0FBSyxFQUFFLENBQUM7UUFDYixPQUFPLENBQUMsS0FBSyxDQUFDLGtCQUFrQixFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ3pDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDcEIsQ0FBQztBQUNMLENBQUMsQ0FBQztBQUVGLEdBQUcsRUFBRSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ2xvdWRGb3JtYXRpb25DbGllbnQsIERlc2NyaWJlU3RhY2tSZXNvdXJjZXNDb21tYW5kLCBEZXNjcmliZVN0YWNrc0NvbW1hbmQgfSBmcm9tICdAYXdzLXNkay9jbGllbnQtY2xvdWRmb3JtYXRpb24nO1xuaW1wb3J0ICogYXMgY3J5cHRvIGZyb20gJ2NyeXB0byc7XG5cbmNvbnN0IFNUQUNLX05BTUUgPSAndml0a3V6LXRlc3Rpbmctc2VhcmNoLXN5bmMnO1xuY29uc3QgUkVHSU9OID0gcHJvY2Vzcy5lbnYuQVdTX1JFR0lPTiB8fCAndXMtZWFzdC0xJztcblxuLy8gV2UganVzdCBpbnRlcmFjdCB3aXRoIHRoZSBwdWJsaWMgQVBJXG5jb25zdCBydW4gPSBhc3luYyAoKSA9PiB7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc29sZS5sb2coYPCflI0gRGlzY292ZXJpbmcgQVBJIFVSTCBmb3Igc3RhY2s6ICR7U1RBQ0tfTkFNRX0uLi5gKTtcbiAgICAgICAgY29uc3QgY2YgPSBuZXcgQ2xvdWRGb3JtYXRpb25DbGllbnQoeyByZWdpb246IFJFR0lPTiB9KTtcbiAgICAgICAgY29uc3Qgc3RhY2tzQ21kID0gbmV3IERlc2NyaWJlU3RhY2tzQ29tbWFuZCh7IFN0YWNrTmFtZTogU1RBQ0tfTkFNRSB9KTtcbiAgICAgICAgY29uc3Qgc3RhY2tzUmVzcCA9IGF3YWl0IGNmLnNlbmQoc3RhY2tzQ21kKTtcbiAgICAgICAgY29uc3QgYXBpVXJsT3V0cHV0ID0gc3RhY2tzUmVzcC5TdGFja3M/LlswXS5PdXRwdXRzPy5maW5kKG8gPT4gby5PdXRwdXRLZXkgPT09ICdBcGlVcmwnKTtcblxuICAgICAgICBpZiAoIWFwaVVybE91dHB1dD8uT3V0cHV0VmFsdWUpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQ291bGQgbm90IGZpbmQgQXBpVXJsIG91dHB1dCBpbiBzdGFjaycpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGFwaVVybCA9IGFwaVVybE91dHB1dC5PdXRwdXRWYWx1ZTtcbiAgICAgICAgY29uc29sZS5sb2coYCAgQVBJIFVSTDogJHthcGlVcmx9YCk7XG5cbiAgICAgICAgY29uc3QgaW5kZXhOYW1lID0gYHRlc3QtaW5kZXgtJHtjcnlwdG8ucmFuZG9tVVVJRCgpfWA7XG4gICAgICAgIGNvbnN0IHJlY29yZElkID0gYHJlY29yZC0ke2NyeXB0by5yYW5kb21VVUlEKCl9YDtcbiAgICAgICAgY29uc3QgcmVxdWVzdElkID0gY3J5cHRvLnJhbmRvbVVVSUQoKTtcblxuICAgICAgICBjb25zb2xlLmxvZyhgXFxu8J+agCBTdGFydGluZyBJbnRlZ3JhdGlvbiBUZXN0YCk7XG4gICAgICAgIGNvbnNvbGUubG9nKGAgIEluZGV4OiAke2luZGV4TmFtZX1gKTtcbiAgICAgICAgY29uc29sZS5sb2coYCAgUmVjb3JkIElEOiAke3JlY29yZElkfWApO1xuICAgICAgICBjb25zb2xlLmxvZyhgICBSZXF1ZXN0IElEOiAke3JlcXVlc3RJZH1gKTtcblxuICAgICAgICAvLyBIZWxwZXIgZm9yIHJlcXVlc3RzXG4gICAgICAgIGNvbnN0IHJlcXVlc3QgPSBhc3luYyAobWV0aG9kOiBzdHJpbmcsIHBhdGg6IHN0cmluZywgYm9keT86IGFueSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgcmVzID0gYXdhaXQgZmV0Y2goYCR7YXBpVXJsfSR7cGF0aH1gLCB7XG4gICAgICAgICAgICAgICAgbWV0aG9kLFxuICAgICAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICAgICAgICAgICAgICAgJ3gtcmVxdWVzdC1pZCc6IHJlcXVlc3RJZCAvLyBQcm9wYWdhdGUgb3VyIElEXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBib2R5OiBib2R5ID8gSlNPTi5zdHJpbmdpZnkoYm9keSkgOiB1bmRlZmluZWRcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKCFyZXMub2spIHtcbiAgICAgICAgICAgICAgICBjb25zdCB0ZXh0ID0gYXdhaXQgcmVzLnRleHQoKTtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYCR7bWV0aG9kfSAke3BhdGh9IGZhaWxlZDogJHtyZXMuc3RhdHVzfSAke3RleHR9YCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmVzLmpzb24oKTtcbiAgICAgICAgfTtcblxuICAgICAgICAvLyAxLiBDcmVhdGUgSW5kZXhcbiAgICAgICAgY29uc29sZS5sb2coJ1xcblBsZWFzZSBjcmVhdGUgaW5kZXguLi4nKTtcbiAgICAgICAgYXdhaXQgcmVxdWVzdCgnUE9TVCcsICcvaW5kaWNlcycsIHsgaW5kZXg6IGluZGV4TmFtZSB9KTtcbiAgICAgICAgY29uc29sZS5sb2coJ+KchSBJbmRleCBjcmVhdGVkJyk7XG5cbiAgICAgICAgLy8gMi4gQ3JlYXRlIFJlY29yZCAoc2VuZHMgdG8gRHluYW1vREIpXG4gICAgICAgIGNvbnNvbGUubG9nKCdcXG5DcmVhdGluZyByZWNvcmQgaW4gRHluYW1vREIuLi4nKTtcbiAgICAgICAgY29uc3QgaXRlbSA9IHtcbiAgICAgICAgICAgIHBrOiByZWNvcmRJZCxcbiAgICAgICAgICAgIGlkOiByZWNvcmRJZCwgLy8gUmVxdWlyZWQgYnkgYWRhcHRlciBsb2dpYzogaWQgPT09IHBrXG4gICAgICAgICAgICBzazogJ21ldGFkYXRhJywgLy8gUmVxdWlyZWQgYnkgYWRhcHRlclxuICAgICAgICAgICAgJ3gtcmVxdWVzdC1pZCc6IHJlcXVlc3RJZCwgLy8gSW5jbHVkZSBmb3IgbG9nZ2luZyBjb3JyZWxhdGlvbiBpbiBzdHJlYW1cbiAgICAgICAgICAgIGRhdGE6ICd0ZXN0LWRhdGEnLFxuICAgICAgICAgICAgbnVtYmVyOiAxMjNcbiAgICAgICAgfTtcbiAgICAgICAgYXdhaXQgcmVxdWVzdCgnUE9TVCcsICcvcmVjb3JkcycsIHsgaXRlbSB9KTtcbiAgICAgICAgY29uc29sZS5sb2coJ+KchSBSZWNvcmQgY3JlYXRlZCcpO1xuXG4gICAgICAgIC8vIDMuIFZlcmlmeSBTZWFyY2ggU3luYyAoV2FpdCBhbmQgUG9sbClcbiAgICAgICAgY29uc29sZS5sb2coJ1xcbldhaXRpbmcgZm9yIER5bmFtb0RCIFN0cmVhbSAtPiBPcGVuU2VhcmNoIHN5bmMuLi4nKTtcbiAgICAgICAgbGV0IGZvdW5kID0gZmFsc2U7XG4gICAgICAgIC8vIER5bmFtb0RCIFN0cmVhbSB0byBMYW1iZGEgdG8gT1MgaXMgdXN1YWxseSBmYXN0ICg8IDVzKSwgYnV0IGdpdmUgaXQgdGltZVxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDIwOyBpKyspIHtcbiAgICAgICAgICAgIC8vIFdlIHNlYXJjaCBpbiB0aGUgSEFSRENPREVEIGluZGV4IHRoYXQgdGhlIHN0cmVhbSBwcm9jZXNzb3IgdXNlczogJ3ZpdGt1ei1zZWFyY2gtc3luYy1pbmRleCdcbiAgICAgICAgICAgIC8vIFdhaXQsIHRoZSBBUEkgYWxsb3dzIGNyZWF0aW5nIGFyYml0cmFyeSBpbmRpY2VzLCBidXQgdGhlIHN0cmVhbSBwcm9jZXNzb3Igd3JpdGVzIHRvIGEgSEFSRENPREVEIG9uZTogJ3ZpdGt1ei1zZWFyY2gtc3luYy1pbmRleCdcbiAgICAgICAgICAgIC8vIE15IHRlc3QgY3JlYXRlZCBhIFJBTkRPTSBpbmRleCAndGVzdC1pbmRleC0uLi4nIGJ1dCB0aGUgc3RyZWFtIHByb2Nlc3NvciB3cml0ZXMgdG8gJ3ZpdGt1ei1zZWFyY2gtc3luYy1pbmRleCcuXG4gICAgICAgICAgICAvLyBJIHNob3VsZCB2ZXJpZnkgJ3ZpdGt1ei1zZWFyY2gtc3luYy1pbmRleCcgaW5zdGVhZC5cbiAgICAgICAgICAgIC8vIEJ1dCBteSBBUEkgY3JlYXRlIGluZGV4IHRlc3QgaXMgdmFsaWQgZm9yIHRoZSBBUEkgZnVuY3Rpb25hbGl0eS5cblxuICAgICAgICAgICAgLy8gTGV0J3MgY2hlY2sgdGhlIGhhcmRjb2RlZCBpbmRleCBmb3IgdGhlIHJlY29yZFxuICAgICAgICAgICAgY29uc3Qgc3luY0luZGV4ID0gJ3ZpdGt1ei1zZWFyY2gtc3luYy1pbmRleCc7XG5cbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgc2VhcmNoUmVzOiBhbnkgPSBhd2FpdCByZXF1ZXN0KCdQT1NUJywgJy9zZWFyY2gnLCB7XG4gICAgICAgICAgICAgICAgICAgIGluZGV4OiBzeW5jSW5kZXgsXG4gICAgICAgICAgICAgICAgICAgIHF1ZXJ5OiB7IHBrOiByZWNvcmRJZCB9IC8vIFNpbXBsZSBtYXRjaCBvbiBwa1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgLy8gQ2hlY2sgaGl0c1xuICAgICAgICAgICAgICAgIGlmIChzZWFyY2hSZXMuaGl0cyAmJiBzZWFyY2hSZXMuaGl0cy50b3RhbCAmJiBzZWFyY2hSZXMuaGl0cy50b3RhbC52YWx1ZSA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gVmVyaWZ5IGRhdGFcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc291cmNlID0gc2VhcmNoUmVzLmhpdHMuaGl0c1swXS5fc291cmNlO1xuICAgICAgICAgICAgICAgICAgICBpZiAoc291cmNlLnBrID09PSByZWNvcmRJZCAmJiBzb3VyY2UuZGF0YSA9PT0gJ3Rlc3QtZGF0YScpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCfinIUgRm91bmQgc3luY2VkIHJlY29yZCBpbiBPcGVuU2VhcmNoIScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZm91bmQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgLy8gSWdub3JlIDQwNHMgaWYgaW5kZXggZG9lc24ndCBleGlzdCB5ZXQgKGNyZWF0ZWQgYnkgc3RyZWFtIHByb2Nlc3NvciBpbXBsaWNpdGx5PylcbiAgICAgICAgICAgICAgICAvLyBBZGFwdGVyIGNyZWF0ZXMgaW5kZXggaWYgbWlzc2luZz8gTm8sIHVzdWFsbHkgbm90IHVubGVzcyBjb25maWd1cmVkLlxuICAgICAgICAgICAgICAgIC8vIEJ1dCB3ZSBoYXZlICd2aXRrdXotc2VhcmNoLXN5bmMtaW5kZXgnIGluIHN0cmVhbS1wcm9jZXNzb3IudHNcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgYXdhaXQgbmV3IFByb21pc2UociA9PiBzZXRUaW1lb3V0KHIsIDEwMDApKTtcbiAgICAgICAgICAgIHByb2Nlc3Muc3Rkb3V0LndyaXRlKCcuJyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIWZvdW5kKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1RpbWVvdXQgd2FpdGluZyBmb3IgT3BlblNlYXJjaCBzeW5jJyk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyA0LiBVcGRhdGUgUmVjb3JkIChQYXRjaClcbiAgICAgICAgY29uc29sZS5sb2coJ1xcblBhdGNoaW5nIHJlY29yZC4uLicpO1xuICAgICAgICBhd2FpdCByZXF1ZXN0KCdQQVRDSCcsIGAvcmVjb3Jkcy8ke3JlY29yZElkfWAsIHtcbiAgICAgICAgICAgIGF0dHJpYnV0ZXM6IHsgZGF0YTogJ3VwZGF0ZWQtZGF0YScgfVxuICAgICAgICB9KTtcbiAgICAgICAgY29uc29sZS5sb2coJ+KchSBSZWNvcmQgcGF0Y2hlZCcpO1xuXG4gICAgICAgIC8vIFZlcmlmeSB1cGRhdGUgc3luY1xuICAgICAgICBjb25zb2xlLmxvZygnV2FpdGluZyBmb3Igc3luYyB1cGRhdGUuLi4nKTtcbiAgICAgICAgZm91bmQgPSBmYWxzZTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCAyMDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBzZWFyY2hSZXM6IGFueSA9IGF3YWl0IHJlcXVlc3QoJ1BPU1QnLCAnL3NlYXJjaCcsIHtcbiAgICAgICAgICAgICAgICBpbmRleDogJ3ZpdGt1ei1zZWFyY2gtc3luYy1pbmRleCcsXG4gICAgICAgICAgICAgICAgcXVlcnk6IHsgcGs6IHJlY29yZElkIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKHNlYXJjaFJlcy5oaXRzPy5oaXRzPy5bMF0/Ll9zb3VyY2U/LmRhdGEgPT09ICd1cGRhdGVkLWRhdGEnKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ+KchSBGb3VuZCB1cGRhdGVkIHJlY29yZCBpbiBPcGVuU2VhcmNoIScpO1xuICAgICAgICAgICAgICAgIGZvdW5kID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGF3YWl0IG5ldyBQcm9taXNlKHIgPT4gc2V0VGltZW91dChyLCAxMDAwKSk7XG4gICAgICAgICAgICBwcm9jZXNzLnN0ZG91dC53cml0ZSgnLicpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghZm91bmQpIHRocm93IG5ldyBFcnJvcignVGltZW91dCB3YWl0aW5nIGZvciB1cGRhdGUgc3luYycpO1xuXG5cbiAgICAgICAgLy8gNS4gRGVsZXRlIFJlY29yZFxuICAgICAgICBjb25zb2xlLmxvZygnXFxuRGVsZXRpbmcgcmVjb3JkLi4uJyk7XG4gICAgICAgIGF3YWl0IHJlcXVlc3QoJ0RFTEVURScsIGAvcmVjb3Jkcy8ke3JlY29yZElkfWApO1xuICAgICAgICBjb25zb2xlLmxvZygn4pyFIFJlY29yZCBkZWxldGVkJyk7XG5cbiAgICAgICAgLy8gV2FpdCBmb3IgcmVtb3ZhbFxuICAgICAgICBjb25zb2xlLmxvZygnV2FpdGluZyBmb3Igc3luYyBkZWxldGUuLi4nKTtcbiAgICAgICAgZm91bmQgPSBmYWxzZTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCAyMDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBzZWFyY2hSZXM6IGFueSA9IGF3YWl0IHJlcXVlc3QoJ1BPU1QnLCAnL3NlYXJjaCcsIHtcbiAgICAgICAgICAgICAgICBpbmRleDogJ3ZpdGt1ei1zZWFyY2gtc3luYy1pbmRleCcsXG4gICAgICAgICAgICAgICAgcXVlcnk6IHsgcGs6IHJlY29yZElkIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgY29uc3QgaGl0cyA9IHNlYXJjaFJlcy5oaXRzPy50b3RhbD8udmFsdWUgPz8gc2VhcmNoUmVzLmhpdHM/LnRvdGFsID8/IDA7XG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhgRGVidWc6IERlbGV0ZSBjaGVjayBoaXRzOiAke2hpdHN9YCk7XG4gICAgICAgICAgICBpZiAoaGl0cyA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCfinIUgUmVjb3JkIHJlbW92ZWQgZnJvbSBPcGVuU2VhcmNoIScpO1xuICAgICAgICAgICAgICAgIGZvdW5kID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGF3YWl0IG5ldyBQcm9taXNlKHIgPT4gc2V0VGltZW91dChyLCAxMDAwKSk7XG4gICAgICAgICAgICBwcm9jZXNzLnN0ZG91dC53cml0ZSgnLicpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghZm91bmQpIHRocm93IG5ldyBFcnJvcignVGltZW91dCB3YWl0aW5nIGZvciBkZWxldGUgc3luYycpO1xuXG5cbiAgICAgICAgLy8gNi4gQ2xlYW51cCAoRGVsZXRlIHRoZSBNQU5VQUxMWSBjcmVhdGVkIGluZGV4IHRlc3QtaW5kZXgtLi4uKVxuICAgICAgICBjb25zb2xlLmxvZyhgXFxuRGVsZXRpbmcgbWFudWFsIGluZGV4ICR7aW5kZXhOYW1lfS4uLmApO1xuICAgICAgICBhd2FpdCByZXF1ZXN0KCdERUxFVEUnLCBgL2luZGljZXMvJHtpbmRleE5hbWV9YCk7XG4gICAgICAgIGNvbnNvbGUubG9nKCfinIUgSW5kZXggZGVsZXRlZCcpO1xuXG4gICAgICAgIGNvbnNvbGUubG9nKCdcXG7inIUgU2VhcmNoIFN5bmMgSW50ZWdyYXRpb24gVGVzdCBQYXNzZWQhJyk7XG5cbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdcXG7inYwgVGVzdCBGYWlsZWQ6JywgZXJyb3IpO1xuICAgICAgICBwcm9jZXNzLmV4aXQoMSk7XG4gICAgfVxufTtcblxucnVuKCk7XG4iXX0=