import { Context, EventBridgeEvent } from 'aws-lambda';
import { withLogger, getLogger, REQUEST_ID_KEY } from '@vitkuz/aws-logger';
import { EventSchema } from './schema';

export const handler = withLogger(async (event: EventBridgeEvent<string, any>, context: Context) => {
    let logger = getLogger();
    if (!logger) throw new Error('Logger context missing');

    const requestId = event.detail?.requestId || event.detail?.[REQUEST_ID_KEY];
    if (requestId) {
        logger = logger.child({ [REQUEST_ID_KEY]: requestId });
    }

    logger.info('Event received', { event });

    // Validate schema (optional strictness)
    const result = EventSchema.safeParse(event);
    if (!result.success) {
        logger.warn('Event schema mismatch (ignoring)', { error: result.error });
    } else {
        logger.info('Event validated', { type: result.data["detail-type"], source: result.data.source });
    }
});
