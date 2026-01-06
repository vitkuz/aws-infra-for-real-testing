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
const crypto = __importStar(require("crypto"));
const common_1 = require("./common");
const run = async () => {
    try {
        const apiUrl = await (0, common_1.getApiUrl)();
        const requestId = crypto.randomUUID();
        const request = (0, common_1.createRequester)(apiUrl, requestId);
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
        await (0, common_1.sleep)(10000);
        let searchRes = await request('POST', '/search', {
            index: syncIndex,
            query: { 'pk.keyword': recordId },
        });
        if (searchRes.hits &&
            searchRes.hits.total &&
            (searchRes.hits.total.value > 0 || searchRes.hits.total > 0)) {
            const source = searchRes.hits.hits[0]._source;
            if (source.pk === recordId && source.data === 'test-data') {
                console.log('✅ Found synced record in OpenSearch!');
            }
            else {
                throw new Error(`Record found but data mismatch: ${JSON.stringify(source)}`);
            }
        }
        else {
            throw new Error(`Record not found in OpenSearch after wait. Response: ${JSON.stringify(searchRes)}`);
        }
        // 2.5 Verify Get Document By ID
        console.log('\nVerifying GET document by ID...');
        try {
            const doc = await request('GET', `/indices/${syncIndex}/documents/${recordId}`);
            // The API returns the raw OpenSearch Client response, which has the document in `body`.
            const source = doc.body ? doc.body._source : doc._source;
            if (source && source.pk === recordId && source.data === 'test-data') {
                console.log('✅ Fetched document by ID successfully!');
            }
            else {
                console.error('❌ GET by ID Data Mismatch:', JSON.stringify(doc, null, 2));
                throw new Error(`GET by ID data mismatch.`);
            }
        }
        catch (e) {
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
        await (0, common_1.sleep)(10000);
        searchRes = await request('POST', '/search', {
            index: syncIndex,
            query: { 'pk.keyword': recordId },
        });
        if (searchRes.hits?.hits?.[0]?._source?.data === 'updated-data') {
            console.log('✅ Found updated record in OpenSearch!');
        }
        else {
            throw new Error(`Update not synced. Data: ${searchRes.hits?.hits?.[0]?._source?.data}`);
        }
        // 4. Delete Record
        console.log('\nDeleting record...');
        await request('DELETE', `/records/${recordId}`);
        console.log('✅ Record deleted');
        // Wait for removal
        console.log('Waiting 10s for sync delete...');
        await (0, common_1.sleep)(10000);
        try {
            await request('GET', `/indices/${syncIndex}/documents/${recordId}`);
            throw new Error('Record still exists in OpenSearch after delete (expected 404)');
        }
        catch (error) {
            if (error.message.includes('404')) {
                console.log('✅ Record removed from OpenSearch (404 Not Found)!');
            }
            else {
                throw error;
            }
        }
        console.log('\n✅ Search Sync Integration Test Passed!');
    }
    catch (error) {
        console.error('\n❌ Test Failed:', error);
        process.exit(1);
    }
};
run();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW50ZWdyYXRpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbnRlZ3JhdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLCtDQUFpQztBQUNqQyxxQ0FBNkQ7QUFFN0QsTUFBTSxHQUFHLEdBQUcsS0FBSyxJQUFJLEVBQUU7SUFDbkIsSUFBSSxDQUFDO1FBQ0QsTUFBTSxNQUFNLEdBQUcsTUFBTSxJQUFBLGtCQUFTLEdBQUUsQ0FBQztRQUNqQyxNQUFNLFNBQVMsR0FBRyxNQUFNLENBQUMsVUFBVSxFQUFFLENBQUM7UUFDdEMsTUFBTSxPQUFPLEdBQUcsSUFBQSx3QkFBZSxFQUFDLE1BQU0sRUFBRSxTQUFTLENBQUMsQ0FBQztRQUNuRCxtREFBbUQ7UUFDbkQsTUFBTSxTQUFTLEdBQUcsMEJBQTBCLENBQUM7UUFDN0MsTUFBTSxRQUFRLEdBQUcsVUFBVSxNQUFNLENBQUMsVUFBVSxFQUFFLEVBQUUsQ0FBQztRQUVqRCxPQUFPLENBQUMsR0FBRyxDQUFDLDRDQUE0QyxDQUFDLENBQUM7UUFDMUQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsUUFBUSxFQUFFLENBQUMsQ0FBQztRQUN4QyxPQUFPLENBQUMsR0FBRyxDQUFDLGlCQUFpQixTQUFTLEVBQUUsQ0FBQyxDQUFDO1FBRTFDLHVDQUF1QztRQUN2QyxPQUFPLENBQUMsR0FBRyxDQUFDLGtDQUFrQyxDQUFDLENBQUM7UUFDaEQsTUFBTSxJQUFJLEdBQUc7WUFDVCxFQUFFLEVBQUUsUUFBUTtZQUNaLEVBQUUsRUFBRSxRQUFRLEVBQUUsdUNBQXVDO1lBQ3JELEVBQUUsRUFBRSxVQUFVLEVBQUUsc0JBQXNCO1lBQ3RDLGNBQWMsRUFBRSxTQUFTLEVBQUUsNENBQTRDO1lBQ3ZFLElBQUksRUFBRSxXQUFXO1lBQ2pCLE1BQU0sRUFBRSxHQUFHO1NBQ2QsQ0FBQztRQUNGLE1BQU0sT0FBTyxDQUFDLE1BQU0sRUFBRSxV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LENBQUMsQ0FBQztZQUNwRSxNQUFNLElBQUksS0FBSyxDQUFDLCtEQUErRCxDQUFDLENBQUM7UUFDckYsQ0FBQztRQUFDLE9BQU8sS0FBVSxFQUFFLENBQUM7WUFDbEIsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDO2dCQUNoQyxPQUFPLENBQUMsR0FBRyxDQUFDLG1EQUFtRCxDQUFDLENBQUM7WUFDckUsQ0FBQztpQkFBTSxDQUFDO2dCQUNKLE1BQU0sS0FBSyxDQUFDO1lBQ2hCLENBQUM7UUFDTCxDQUFDO1FBRUQsT0FBTyxDQUFDLEdBQUcsQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDO0lBQzVELENBQUM7SUFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO1FBQ2IsT0FBTyxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUN6QyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3BCLENBQUM7QUFDTCxDQUFDLENBQUM7QUFFRixHQUFHLEVBQUUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGNyeXB0byBmcm9tICdjcnlwdG8nO1xuaW1wb3J0IHsgZ2V0QXBpVXJsLCBjcmVhdGVSZXF1ZXN0ZXIsIHNsZWVwIH0gZnJvbSAnLi9jb21tb24nO1xuXG5jb25zdCBydW4gPSBhc3luYyAoKSA9PiB7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgYXBpVXJsID0gYXdhaXQgZ2V0QXBpVXJsKCk7XG4gICAgICAgIGNvbnN0IHJlcXVlc3RJZCA9IGNyeXB0by5yYW5kb21VVUlEKCk7XG4gICAgICAgIGNvbnN0IHJlcXVlc3QgPSBjcmVhdGVSZXF1ZXN0ZXIoYXBpVXJsLCByZXF1ZXN0SWQpO1xuICAgICAgICAvLyBUaGUgc3RyZWFtIHByb2Nlc3NvciB3cml0ZXMgdG8gYSBoYXJkY29kZWQgaW5kZXhcbiAgICAgICAgY29uc3Qgc3luY0luZGV4ID0gJ3ZpdGt1ei1zZWFyY2gtc3luYy1pbmRleCc7XG4gICAgICAgIGNvbnN0IHJlY29yZElkID0gYHJlY29yZC0ke2NyeXB0by5yYW5kb21VVUlEKCl9YDtcblxuICAgICAgICBjb25zb2xlLmxvZyhgXFxu8J+agCBTdGFydGluZyBTZWFyY2ggU3luYyBJbnRlZ3JhdGlvbiBUZXN0YCk7XG4gICAgICAgIGNvbnNvbGUubG9nKGAgIFJlY29yZCBJRDogJHtyZWNvcmRJZH1gKTtcbiAgICAgICAgY29uc29sZS5sb2coYCAgUmVxdWVzdCBJRDogJHtyZXF1ZXN0SWR9YCk7XG5cbiAgICAgICAgLy8gMS4gQ3JlYXRlIFJlY29yZCAoc2VuZHMgdG8gRHluYW1vREIpXG4gICAgICAgIGNvbnNvbGUubG9nKCdcXG5DcmVhdGluZyByZWNvcmQgaW4gRHluYW1vREIuLi4nKTtcbiAgICAgICAgY29uc3QgaXRlbSA9IHtcbiAgICAgICAgICAgIHBrOiByZWNvcmRJZCxcbiAgICAgICAgICAgIGlkOiByZWNvcmRJZCwgLy8gUmVxdWlyZWQgYnkgYWRhcHRlciBsb2dpYzogaWQgPT09IHBrXG4gICAgICAgICAgICBzazogJ21ldGFkYXRhJywgLy8gUmVxdWlyZWQgYnkgYWRhcHRlclxuICAgICAgICAgICAgJ3gtcmVxdWVzdC1pZCc6IHJlcXVlc3RJZCwgLy8gSW5jbHVkZSBmb3IgbG9nZ2luZyBjb3JyZWxhdGlvbiBpbiBzdHJlYW1cbiAgICAgICAgICAgIGRhdGE6ICd0ZXN0LWRhdGEnLFxuICAgICAgICAgICAgbnVtYmVyOiAxMjMsXG4gICAgICAgIH07XG4gICAgICAgIGF3YWl0IHJlcXVlc3QoJ1BPU1QnLCAnL3JlY29yZHMnLCB7IGl0ZW0gfSk7XG4gICAgICAgIGNvbnNvbGUubG9nKCfinIUgUmVjb3JkIGNyZWF0ZWQnKTtcblxuICAgICAgICAvLyAyLiBWZXJpZnkgU2VhcmNoIFN5bmNcbiAgICAgICAgY29uc29sZS5sb2coJ1xcbldhaXRpbmcgMTBzIGZvciBEeW5hbW9EQiBTdHJlYW0gLT4gT3BlblNlYXJjaCBzeW5jLi4uJyk7XG4gICAgICAgIGF3YWl0IHNsZWVwKDEwMDAwKTtcblxuICAgICAgICBsZXQgc2VhcmNoUmVzOiBhbnkgPSBhd2FpdCByZXF1ZXN0KCdQT1NUJywgJy9zZWFyY2gnLCB7XG4gICAgICAgICAgICBpbmRleDogc3luY0luZGV4LFxuICAgICAgICAgICAgcXVlcnk6IHsgJ3BrLmtleXdvcmQnOiByZWNvcmRJZCB9LFxuICAgICAgICB9KTtcblxuICAgICAgICBpZiAoXG4gICAgICAgICAgICBzZWFyY2hSZXMuaGl0cyAmJlxuICAgICAgICAgICAgc2VhcmNoUmVzLmhpdHMudG90YWwgJiZcbiAgICAgICAgICAgIChzZWFyY2hSZXMuaGl0cy50b3RhbC52YWx1ZSA+IDAgfHwgc2VhcmNoUmVzLmhpdHMudG90YWwgPiAwKVxuICAgICAgICApIHtcbiAgICAgICAgICAgIGNvbnN0IHNvdXJjZSA9IHNlYXJjaFJlcy5oaXRzLmhpdHNbMF0uX3NvdXJjZTtcbiAgICAgICAgICAgIGlmIChzb3VyY2UucGsgPT09IHJlY29yZElkICYmIHNvdXJjZS5kYXRhID09PSAndGVzdC1kYXRhJykge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCfinIUgRm91bmQgc3luY2VkIHJlY29yZCBpbiBPcGVuU2VhcmNoIScpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFJlY29yZCBmb3VuZCBidXQgZGF0YSBtaXNtYXRjaDogJHtKU09OLnN0cmluZ2lmeShzb3VyY2UpfWApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgICAgIGBSZWNvcmQgbm90IGZvdW5kIGluIE9wZW5TZWFyY2ggYWZ0ZXIgd2FpdC4gUmVzcG9uc2U6ICR7SlNPTi5zdHJpbmdpZnkoc2VhcmNoUmVzKX1gLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIDIuNSBWZXJpZnkgR2V0IERvY3VtZW50IEJ5IElEXG4gICAgICAgIGNvbnNvbGUubG9nKCdcXG5WZXJpZnlpbmcgR0VUIGRvY3VtZW50IGJ5IElELi4uJyk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBkb2M6IGFueSA9IGF3YWl0IHJlcXVlc3QoJ0dFVCcsIGAvaW5kaWNlcy8ke3N5bmNJbmRleH0vZG9jdW1lbnRzLyR7cmVjb3JkSWR9YCk7XG4gICAgICAgICAgICAvLyBUaGUgQVBJIHJldHVybnMgdGhlIHJhdyBPcGVuU2VhcmNoIENsaWVudCByZXNwb25zZSwgd2hpY2ggaGFzIHRoZSBkb2N1bWVudCBpbiBgYm9keWAuXG4gICAgICAgICAgICBjb25zdCBzb3VyY2UgPSBkb2MuYm9keSA/IGRvYy5ib2R5Ll9zb3VyY2UgOiBkb2MuX3NvdXJjZTtcblxuICAgICAgICAgICAgaWYgKHNvdXJjZSAmJiBzb3VyY2UucGsgPT09IHJlY29yZElkICYmIHNvdXJjZS5kYXRhID09PSAndGVzdC1kYXRhJykge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCfinIUgRmV0Y2hlZCBkb2N1bWVudCBieSBJRCBzdWNjZXNzZnVsbHkhJyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ+KdjCBHRVQgYnkgSUQgRGF0YSBNaXNtYXRjaDonLCBKU09OLnN0cmluZ2lmeShkb2MsIG51bGwsIDIpKTtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEdFVCBieSBJRCBkYXRhIG1pc21hdGNoLmApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlOiBhbnkpIHtcbiAgICAgICAgICAgIC8vIC4uLiBleGlzdGluZyBlcnJvciBsb2dnaW5nIC4uLlxuICAgICAgICAgICAgY29uc29sZS5lcnJvcign4p2MIEdFVCBieSBJRCBGYWlsZWQgd2l0aCBFcnJvcjonLCBlLm1lc3NhZ2UpO1xuICAgICAgICAgICAgaWYgKGUucmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAvLyAuLi5cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRocm93IGU7XG4gICAgICAgIH1cblxuICAgICAgICAvLyAzLiBVcGRhdGUgUmVjb3JkIChQYXRjaClcbiAgICAgICAgY29uc29sZS5sb2coJ1xcblBhdGNoaW5nIHJlY29yZC4uLicpO1xuICAgICAgICBhd2FpdCByZXF1ZXN0KCdQQVRDSCcsIGAvcmVjb3Jkcy8ke3JlY29yZElkfWAsIHtcbiAgICAgICAgICAgIGF0dHJpYnV0ZXM6IHsgZGF0YTogJ3VwZGF0ZWQtZGF0YScgfSxcbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnNvbGUubG9nKCfinIUgUmVjb3JkIHBhdGNoZWQnKTtcblxuICAgICAgICAvLyBWZXJpZnkgdXBkYXRlIHN5bmNcbiAgICAgICAgY29uc29sZS5sb2coJ1dhaXRpbmcgMTBzIGZvciBzeW5jIHVwZGF0ZS4uLicpO1xuICAgICAgICBhd2FpdCBzbGVlcCgxMDAwMCk7XG5cbiAgICAgICAgc2VhcmNoUmVzID0gYXdhaXQgcmVxdWVzdCgnUE9TVCcsICcvc2VhcmNoJywge1xuICAgICAgICAgICAgaW5kZXg6IHN5bmNJbmRleCxcbiAgICAgICAgICAgIHF1ZXJ5OiB7ICdway5rZXl3b3JkJzogcmVjb3JkSWQgfSxcbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChzZWFyY2hSZXMuaGl0cz8uaGl0cz8uWzBdPy5fc291cmNlPy5kYXRhID09PSAndXBkYXRlZC1kYXRhJykge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ+KchSBGb3VuZCB1cGRhdGVkIHJlY29yZCBpbiBPcGVuU2VhcmNoIScpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVcGRhdGUgbm90IHN5bmNlZC4gRGF0YTogJHtzZWFyY2hSZXMuaGl0cz8uaGl0cz8uWzBdPy5fc291cmNlPy5kYXRhfWApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gNC4gRGVsZXRlIFJlY29yZFxuICAgICAgICBjb25zb2xlLmxvZygnXFxuRGVsZXRpbmcgcmVjb3JkLi4uJyk7XG4gICAgICAgIGF3YWl0IHJlcXVlc3QoJ0RFTEVURScsIGAvcmVjb3Jkcy8ke3JlY29yZElkfWApO1xuICAgICAgICBjb25zb2xlLmxvZygn4pyFIFJlY29yZCBkZWxldGVkJyk7XG5cbiAgICAgICAgLy8gV2FpdCBmb3IgcmVtb3ZhbFxuICAgICAgICBjb25zb2xlLmxvZygnV2FpdGluZyAxMHMgZm9yIHN5bmMgZGVsZXRlLi4uJyk7XG4gICAgICAgIGF3YWl0IHNsZWVwKDEwMDAwKTtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgcmVxdWVzdCgnR0VUJywgYC9pbmRpY2VzLyR7c3luY0luZGV4fS9kb2N1bWVudHMvJHtyZWNvcmRJZH1gKTtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignUmVjb3JkIHN0aWxsIGV4aXN0cyBpbiBPcGVuU2VhcmNoIGFmdGVyIGRlbGV0ZSAoZXhwZWN0ZWQgNDA0KScpO1xuICAgICAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7XG4gICAgICAgICAgICBpZiAoZXJyb3IubWVzc2FnZS5pbmNsdWRlcygnNDA0JykpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygn4pyFIFJlY29yZCByZW1vdmVkIGZyb20gT3BlblNlYXJjaCAoNDA0IE5vdCBGb3VuZCkhJyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRocm93IGVycm9yO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc29sZS5sb2coJ1xcbuKchSBTZWFyY2ggU3luYyBJbnRlZ3JhdGlvbiBUZXN0IFBhc3NlZCEnKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdcXG7inYwgVGVzdCBGYWlsZWQ6JywgZXJyb3IpO1xuICAgICAgICBwcm9jZXNzLmV4aXQoMSk7XG4gICAgfVxufTtcblxucnVuKCk7XG4iXX0=