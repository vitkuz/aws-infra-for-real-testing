"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const aws_logger_1 = require("@vitkuz/aws-logger");
const aws_opensearch_adapter_1 = require("@vitkuz/aws-opensearch-adapter");
// OpenSearch client needs endpoint.
const node = process.env.OPENSEARCH_ENDPOINT;
// If env var is missing during init (e.g. test context), we might fail or default.
// Lambda ensures env vars are present.
const client = (0, aws_opensearch_adapter_1.createClient)({
    node: `https://${node}`
});
exports.handler = (0, aws_logger_1.withLogger)(async (event, context) => {
    if (!node)
        throw new Error('OPENSEARCH_ENDPOINT is required');
    const logger = (0, aws_logger_1.createLogger)();
    const ctx = { logger, client };
    const index = 'test-index';
    logger.info('Indexing document', { index });
    const result = await (0, aws_opensearch_adapter_1.indexDocument)(ctx)({
        index,
        body: {
            title: 'Test Document',
            timestamp: new Date().toISOString()
        }
    });
    logger.info('Index result', { result });
    return { statusCode: 200, body: 'Success' };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3BlbnNlYXJjaC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIm9wZW5zZWFyY2gudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0EsbURBQThEO0FBQzlELDJFQUF1RztBQUV2RyxvQ0FBb0M7QUFDcEMsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsQ0FBQztBQUM3QyxtRkFBbUY7QUFDbkYsdUNBQXVDO0FBQ3ZDLE1BQU0sTUFBTSxHQUFHLElBQUEscUNBQXNCLEVBQUM7SUFDbEMsSUFBSSxFQUFFLFdBQVcsSUFBSSxFQUFFO0NBQzFCLENBQUMsQ0FBQztBQUVVLFFBQUEsT0FBTyxHQUFHLElBQUEsdUJBQVUsRUFBQyxLQUFLLEVBQUUsS0FBVSxFQUFFLE9BQWdCLEVBQUUsRUFBRTtJQUNyRSxJQUFJLENBQUMsSUFBSTtRQUFFLE1BQU0sSUFBSSxLQUFLLENBQUMsaUNBQWlDLENBQUMsQ0FBQztJQUU5RCxNQUFNLE1BQU0sR0FBRyxJQUFBLHlCQUFZLEdBQUUsQ0FBQztJQUM5QixNQUFNLEdBQUcsR0FBRyxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsQ0FBQztJQUUvQixNQUFNLEtBQUssR0FBRyxZQUFZLENBQUM7SUFDM0IsTUFBTSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7SUFFNUMsTUFBTSxNQUFNLEdBQUcsTUFBTSxJQUFBLHNDQUFhLEVBQUMsR0FBRyxDQUFDLENBQUM7UUFDcEMsS0FBSztRQUNMLElBQUksRUFBRTtZQUNGLEtBQUssRUFBRSxlQUFlO1lBQ3RCLFNBQVMsRUFBRSxJQUFJLElBQUksRUFBRSxDQUFDLFdBQVcsRUFBRTtTQUN0QztLQUNKLENBQUMsQ0FBQztJQUVILE1BQU0sQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQztJQUV4QyxPQUFPLEVBQUUsVUFBVSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLENBQUM7QUFDaEQsQ0FBQyxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb250ZXh0IH0gZnJvbSAnYXdzLWxhbWJkYSc7XG5pbXBvcnQgeyBjcmVhdGVMb2dnZXIsIHdpdGhMb2dnZXIgfSBmcm9tICdAdml0a3V6L2F3cy1sb2dnZXInO1xuaW1wb3J0IHsgY3JlYXRlQ2xpZW50IGFzIGNyZWF0ZU9wZW5TZWFyY2hDbGllbnQsIGluZGV4RG9jdW1lbnQgfSBmcm9tICdAdml0a3V6L2F3cy1vcGVuc2VhcmNoLWFkYXB0ZXInO1xuXG4vLyBPcGVuU2VhcmNoIGNsaWVudCBuZWVkcyBlbmRwb2ludC5cbmNvbnN0IG5vZGUgPSBwcm9jZXNzLmVudi5PUEVOU0VBUkNIX0VORFBPSU5UO1xuLy8gSWYgZW52IHZhciBpcyBtaXNzaW5nIGR1cmluZyBpbml0IChlLmcuIHRlc3QgY29udGV4dCksIHdlIG1pZ2h0IGZhaWwgb3IgZGVmYXVsdC5cbi8vIExhbWJkYSBlbnN1cmVzIGVudiB2YXJzIGFyZSBwcmVzZW50LlxuY29uc3QgY2xpZW50ID0gY3JlYXRlT3BlblNlYXJjaENsaWVudCh7XG4gICAgbm9kZTogYGh0dHBzOi8vJHtub2RlfWBcbn0pO1xuXG5leHBvcnQgY29uc3QgaGFuZGxlciA9IHdpdGhMb2dnZXIoYXN5bmMgKGV2ZW50OiBhbnksIGNvbnRleHQ6IENvbnRleHQpID0+IHtcbiAgICBpZiAoIW5vZGUpIHRocm93IG5ldyBFcnJvcignT1BFTlNFQVJDSF9FTkRQT0lOVCBpcyByZXF1aXJlZCcpO1xuXG4gICAgY29uc3QgbG9nZ2VyID0gY3JlYXRlTG9nZ2VyKCk7XG4gICAgY29uc3QgY3R4ID0geyBsb2dnZXIsIGNsaWVudCB9O1xuXG4gICAgY29uc3QgaW5kZXggPSAndGVzdC1pbmRleCc7XG4gICAgbG9nZ2VyLmluZm8oJ0luZGV4aW5nIGRvY3VtZW50JywgeyBpbmRleCB9KTtcblxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGluZGV4RG9jdW1lbnQoY3R4KSh7XG4gICAgICAgIGluZGV4LFxuICAgICAgICBib2R5OiB7XG4gICAgICAgICAgICB0aXRsZTogJ1Rlc3QgRG9jdW1lbnQnLFxuICAgICAgICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKClcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgbG9nZ2VyLmluZm8oJ0luZGV4IHJlc3VsdCcsIHsgcmVzdWx0IH0pO1xuXG4gICAgcmV0dXJuIHsgc3RhdHVzQ29kZTogMjAwLCBib2R5OiAnU3VjY2VzcycgfTtcbn0pO1xuIl19