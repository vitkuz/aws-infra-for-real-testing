import { Context, SNSEvent } from 'aws-lambda';
import { withLogger, getLogger, REQUEST_ID_KEY } from '@vitkuz/aws-logger';

export const handler = withLogger(async (event: SNSEvent, context: Context) => {
    const logger = getLogger();
    if (!logger) throw new Error('Logger context missing');

    logger.info('SNS Handler Invoked', { data: { eventType: 'SNS Trigger', recordCount: event.Records.length } });

    for (const record of event.Records) {
        const snsMessage = record.Sns;
        const requestId = snsMessage.MessageAttributes?.[REQUEST_ID_KEY]?.Value;
        const recordLogger = logger.child(requestId ? { [REQUEST_ID_KEY]: requestId } : {});

        recordLogger.info('Processing SNS Message', {
            data: {
                messageId: snsMessage.MessageId,
                subject: snsMessage.Subject,
                message: snsMessage.Message,
                timestamp: snsMessage.Timestamp
            }
        });
    }

    return { statusCode: 200, body: `Processed ${event.Records.length} records` };
});
