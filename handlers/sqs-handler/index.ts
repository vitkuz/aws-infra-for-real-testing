import { Context, SQSEvent } from 'aws-lambda';
import { withLogger, getLogger, REQUEST_ID_KEY } from '@vitkuz/aws-logger';

export const handler = withLogger(async (event: SQSEvent, context: Context) => {
    const logger = getLogger();
    if (!logger) throw new Error('Logger context missing');

    logger.info('SQS Handler Invoked', { data: { eventType: 'SQS Trigger' } });

    // Only process Records (Consumer Logic)
    if (event.Records) {
        for (const record of event.Records) {
            const requestId = record.messageAttributes?.[REQUEST_ID_KEY]?.stringValue;
            const recordLogger = logger.child(requestId ? { [REQUEST_ID_KEY]: requestId } : {});

            recordLogger.info('Processing SQS Record', { data: { messageId: record.messageId, body: record.body } });
        }
        return { statusCode: 200, body: `Processed ${event.Records.length} records` };
    }

    logger.warn('Invoked without Records', { data: { event } });
    return { statusCode: 200, body: 'No records processed' };
});
