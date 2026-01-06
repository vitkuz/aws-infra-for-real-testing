import { SQSEvent, Context } from 'aws-lambda';
import { withLogger, getLogger, REQUEST_ID_KEY } from '@vitkuz/aws-logger';
import { SnsEnvelopeSchema } from './schema';

export const handler = withLogger(async (event: SQSEvent, context: Context) => {
    const logger = getLogger();
    if (!logger) throw new Error('Logger context missing');

    // Note: 'withLogger' automatically logs execution start with event and context summary.

    logger.info('SQS Processor Invoked', { data: { recordCount: event.Records.length } });

    for (const record of event.Records) {
        let requestId: string | undefined;
        let snsMessage: string | undefined;

        // Parse SNS Envelope using Zod
        let parsedBody: unknown;
        try {
            parsedBody = JSON.parse(record.body);
        } catch (error) {
            logger.error('Failed to parse SQS body as JSON', { error, data: { body: record.body } } as any);
            continue;
        }

        const envelopeResult = SnsEnvelopeSchema.safeParse(parsedBody);

        if (!envelopeResult.success) {
            logger.error('Invalid SNS Envelope structure', { error: envelopeResult.error, data: { body: record.body } } as any);
            continue;
        }

        const snsEnvelope = envelopeResult.data;
        const messageAttributes = snsEnvelope.MessageAttributes;

        // Extract Request ID if present
        if (messageAttributes && messageAttributes[REQUEST_ID_KEY]) {
            requestId = messageAttributes[REQUEST_ID_KEY].Value;
        }

        snsMessage = snsEnvelope.Message;

        const childLogger = logger.child(requestId ? { [REQUEST_ID_KEY]: requestId } : {});

        childLogger.info('Processing SQS Record', {
            data: {
                messageId: record.messageId,
                snsMessage // Logging the inner message content
            }
        });

        if (!requestId) {
            childLogger.warn('No x-request-id found in message attributes');
        }
    }

    return { statusCode: 200, body: `Processed ${event.Records.length} records` };
});
