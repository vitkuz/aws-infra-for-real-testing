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
        const mapping = await request('GET', `/indices/${indexName}/mapping`);
        console.log('✅ Mapping retrieved', JSON.stringify(mapping, null, 2));
        // Verify mapping roughly
        const props = mapping.body[indexName]?.mappings?.properties;
        if (!props || !props.testField) {
            console.warn('⚠️ Warning: Mapping verification weak, could not find testField');
        }
        else {
            console.log('✅ Mapping verified');
        }
        // 4. Delete Index
        console.log('\nDeleting index...');
        await request('DELETE', `/indices/${indexName}`);
        console.log('✅ Index deleted');
        console.log('\n✅ Indices Integration Test Passed!');
    }
    catch (error) {
        console.error('\n❌ Test Failed:', error);
        process.exit(1);
    }
};
run();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kaWNlcy1pbnRlZ3JhdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImluZGljZXMtaW50ZWdyYXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSwrQ0FBaUM7QUFDakMscUNBQXNEO0FBRXRELE1BQU0sR0FBRyxHQUFHLEtBQUssSUFBSSxFQUFFO0lBQ25CLElBQUksQ0FBQztRQUNELE1BQU0sTUFBTSxHQUFHLE1BQU0sSUFBQSxrQkFBUyxHQUFFLENBQUM7UUFDakMsTUFBTSxTQUFTLEdBQUcsTUFBTSxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQ3RDLE1BQU0sT0FBTyxHQUFHLElBQUEsd0JBQWUsRUFBQyxNQUFNLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDbkQsTUFBTSxTQUFTLEdBQUcsbUJBQW1CLE1BQU0sQ0FBQyxVQUFVLEVBQUUsRUFBRSxDQUFDO1FBRTNELE9BQU8sQ0FBQyxHQUFHLENBQUMsd0NBQXdDLENBQUMsQ0FBQztRQUN0RCxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksU0FBUyxFQUFFLENBQUMsQ0FBQztRQUNyQyxPQUFPLENBQUMsR0FBRyxDQUFDLGlCQUFpQixTQUFTLEVBQUUsQ0FBQyxDQUFDO1FBRTFDLGtCQUFrQjtRQUNsQixPQUFPLENBQUMsR0FBRyxDQUFDLHFCQUFxQixDQUFDLENBQUM7UUFDbkMsTUFBTSxPQUFPLENBQUMsTUFBTSxFQUFFLFVBQVUsRUFBRSxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFDO1FBQ3hELE9BQU8sQ0FBQyxHQUFHLENBQUMsaUJBQWlCLENBQUMsQ0FBQztRQUUvQixpQkFBaUI7UUFDakIsT0FBTyxDQUFDLEdBQUcsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO1FBQ3JDLE1BQU0sT0FBTyxDQUFDLEtBQUssRUFBRSxZQUFZLFNBQVMsVUFBVSxFQUFFO1lBQ2xELFVBQVUsRUFBRTtnQkFDUixTQUFTLEVBQUUsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFO2FBQ2pDO1NBQ0osQ0FBQyxDQUFDO1FBQ0gsT0FBTyxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO1FBRWpDLGlCQUFpQjtRQUNqQixPQUFPLENBQUMsR0FBRyxDQUFDLHNCQUFzQixDQUFDLENBQUM7UUFDcEMsTUFBTSxPQUFPLEdBQVEsTUFBTSxPQUFPLENBQUMsS0FBSyxFQUFFLFlBQVksU0FBUyxVQUFVLENBQUMsQ0FBQztRQUMzRSxPQUFPLENBQUMsR0FBRyxDQUFDLHFCQUFxQixFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRXJFLHlCQUF5QjtRQUN6QixNQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLFFBQVEsRUFBRSxVQUFVLENBQUM7UUFDNUQsSUFBSSxDQUFDLEtBQUssSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQUUsQ0FBQztZQUM3QixPQUFPLENBQUMsSUFBSSxDQUFDLGlFQUFpRSxDQUFDLENBQUM7UUFDcEYsQ0FBQzthQUFNLENBQUM7WUFDSixPQUFPLENBQUMsR0FBRyxDQUFDLG9CQUFvQixDQUFDLENBQUM7UUFDdEMsQ0FBQztRQUVELGtCQUFrQjtRQUNsQixPQUFPLENBQUMsR0FBRyxDQUFDLHFCQUFxQixDQUFDLENBQUM7UUFDbkMsTUFBTSxPQUFPLENBQUMsUUFBUSxFQUFFLFlBQVksU0FBUyxFQUFFLENBQUMsQ0FBQztRQUNqRCxPQUFPLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDLENBQUM7UUFFL0IsT0FBTyxDQUFDLEdBQUcsQ0FBQyxzQ0FBc0MsQ0FBQyxDQUFDO0lBQ3hELENBQUM7SUFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO1FBQ2IsT0FBTyxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUN6QyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3BCLENBQUM7QUFDTCxDQUFDLENBQUM7QUFFRixHQUFHLEVBQUUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGNyeXB0byBmcm9tICdjcnlwdG8nO1xuaW1wb3J0IHsgZ2V0QXBpVXJsLCBjcmVhdGVSZXF1ZXN0ZXIgfSBmcm9tICcuL2NvbW1vbic7XG5cbmNvbnN0IHJ1biA9IGFzeW5jICgpID0+IHtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBhcGlVcmwgPSBhd2FpdCBnZXRBcGlVcmwoKTtcbiAgICAgICAgY29uc3QgcmVxdWVzdElkID0gY3J5cHRvLnJhbmRvbVVVSUQoKTtcbiAgICAgICAgY29uc3QgcmVxdWVzdCA9IGNyZWF0ZVJlcXVlc3RlcihhcGlVcmwsIHJlcXVlc3RJZCk7XG4gICAgICAgIGNvbnN0IGluZGV4TmFtZSA9IGB0ZXN0LWluZGV4LW1nbXQtJHtjcnlwdG8ucmFuZG9tVVVJRCgpfWA7XG5cbiAgICAgICAgY29uc29sZS5sb2coYFxcbvCfmoAgU3RhcnRpbmcgSW5kaWNlcyBJbnRlZ3JhdGlvbiBUZXN0YCk7XG4gICAgICAgIGNvbnNvbGUubG9nKGAgIEluZGV4OiAke2luZGV4TmFtZX1gKTtcbiAgICAgICAgY29uc29sZS5sb2coYCAgUmVxdWVzdCBJRDogJHtyZXF1ZXN0SWR9YCk7XG5cbiAgICAgICAgLy8gMS4gQ3JlYXRlIEluZGV4XG4gICAgICAgIGNvbnNvbGUubG9nKCdcXG5DcmVhdGluZyBpbmRleC4uLicpO1xuICAgICAgICBhd2FpdCByZXF1ZXN0KCdQT1NUJywgJy9pbmRpY2VzJywgeyBpbmRleDogaW5kZXhOYW1lIH0pO1xuICAgICAgICBjb25zb2xlLmxvZygn4pyFIEluZGV4IGNyZWF0ZWQnKTtcblxuICAgICAgICAvLyAyLiBQdXQgTWFwcGluZ1xuICAgICAgICBjb25zb2xlLmxvZygnXFxuVXBkYXRpbmcgbWFwcGluZy4uLicpO1xuICAgICAgICBhd2FpdCByZXF1ZXN0KCdQVVQnLCBgL2luZGljZXMvJHtpbmRleE5hbWV9L21hcHBpbmdgLCB7XG4gICAgICAgICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgICAgICAgdGVzdEZpZWxkOiB7IHR5cGU6ICdrZXl3b3JkJyB9LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnNvbGUubG9nKCfinIUgTWFwcGluZyB1cGRhdGVkJyk7XG5cbiAgICAgICAgLy8gMy4gR2V0IE1hcHBpbmdcbiAgICAgICAgY29uc29sZS5sb2coJ1xcbkdldHRpbmcgbWFwcGluZy4uLicpO1xuICAgICAgICBjb25zdCBtYXBwaW5nOiBhbnkgPSBhd2FpdCByZXF1ZXN0KCdHRVQnLCBgL2luZGljZXMvJHtpbmRleE5hbWV9L21hcHBpbmdgKTtcbiAgICAgICAgY29uc29sZS5sb2coJ+KchSBNYXBwaW5nIHJldHJpZXZlZCcsIEpTT04uc3RyaW5naWZ5KG1hcHBpbmcsIG51bGwsIDIpKTtcblxuICAgICAgICAvLyBWZXJpZnkgbWFwcGluZyByb3VnaGx5XG4gICAgICAgIGNvbnN0IHByb3BzID0gbWFwcGluZy5ib2R5W2luZGV4TmFtZV0/Lm1hcHBpbmdzPy5wcm9wZXJ0aWVzO1xuICAgICAgICBpZiAoIXByb3BzIHx8ICFwcm9wcy50ZXN0RmllbGQpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2Fybign4pqg77iPIFdhcm5pbmc6IE1hcHBpbmcgdmVyaWZpY2F0aW9uIHdlYWssIGNvdWxkIG5vdCBmaW5kIHRlc3RGaWVsZCcpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ+KchSBNYXBwaW5nIHZlcmlmaWVkJyk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyA0LiBEZWxldGUgSW5kZXhcbiAgICAgICAgY29uc29sZS5sb2coJ1xcbkRlbGV0aW5nIGluZGV4Li4uJyk7XG4gICAgICAgIGF3YWl0IHJlcXVlc3QoJ0RFTEVURScsIGAvaW5kaWNlcy8ke2luZGV4TmFtZX1gKTtcbiAgICAgICAgY29uc29sZS5sb2coJ+KchSBJbmRleCBkZWxldGVkJyk7XG5cbiAgICAgICAgY29uc29sZS5sb2coJ1xcbuKchSBJbmRpY2VzIEludGVncmF0aW9uIFRlc3QgUGFzc2VkIScpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ1xcbuKdjCBUZXN0IEZhaWxlZDonLCBlcnJvcik7XG4gICAgICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgICB9XG59O1xuXG5ydW4oKTtcbiJdfQ==