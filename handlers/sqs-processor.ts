import { SQSEvent, Context } from 'aws-lambda';
import { withLogger, getLogger, REQUEST_ID_KEY } from '@vitkuz/aws-logger';

export const handler = withLogger(async (event: SQSEvent, context: Context) => {
    const logger = getLogger();
    if (!logger) throw new Error('Logger context missing');

    logger.info('SQS Processor Invoked', { recordCount: event.Records.length });

    // We can't log the whole event as JSON easily without it beind huge, 
    // but the logger handles object passed as meta.

    for (const record of event.Records) {
        let requestId: string | undefined;
        let snsMessage: string | undefined;

        try {
            // SQS body is the SNS envelope
            const snsEnvelope = JSON.parse(record.body);
            const messageAttributes = snsEnvelope.MessageAttributes;
            requestId = messageAttributes?.[REQUEST_ID_KEY]?.Value;
            snsMessage = snsEnvelope.Message;
        } catch (error) {
            logger.error('Error parsing SQS body', error instanceof Error ? error : String(error), { body: record.body });
        }

        const childLogger = logger.child(requestId ? { [REQUEST_ID_KEY]: requestId } : {});

        childLogger.info('Processing SQS Record', {
            messageId: record.messageId,
            snsMessage // Logging the inner message content
        });

        if (!requestId) {
            childLogger.warn('No x-request-id found in message attributes');
        }
    }

    return { statusCode: 200, body: `Processed ${event.Records.length} records` };
});
