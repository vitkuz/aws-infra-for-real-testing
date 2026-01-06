import { Context, DynamoDBStreamEvent } from 'aws-lambda';
import { withLogger, getLogger, REQUEST_ID_KEY } from '@vitkuz/aws-logger';
import { unmarshall } from '@aws-sdk/util-dynamodb';

export const handler = withLogger(async (event: DynamoDBStreamEvent, context: Context) => {
    const logger = getLogger();
    if (!logger) throw new Error('Logger context missing');

    logger.info('DynamoDB Stream Handler Invoked', {
        data: {
            eventType: 'DynamoDB Trigger',
            recordCount: event.Records.length
        }
    });

    for (const record of event.Records) {
        if (record.eventName === 'INSERT' || record.eventName === 'MODIFY') {
            if (record.dynamodb?.NewImage) {
                // @ts-ignore - DynamoDB Stream types vs Client types mismatch for unmarshall
                const item = unmarshall(record.dynamodb.NewImage as any);

                // Extract x-request-id from item if it exists
                const requestId = item[REQUEST_ID_KEY];
                const recordLogger = logger.child(requestId ? { [REQUEST_ID_KEY]: requestId } : {});

                recordLogger.info('Processing DynamoDB Record', {
                    data: {
                        eventName: record.eventName,
                        pk: item.pk,
                        item
                    }
                });
            }
        } else if (record.eventName === 'REMOVE') {
            if (record.dynamodb?.Keys) {
                // @ts-ignore
                const keys = unmarshall(record.dynamodb.Keys as any);
                logger.info('Processing DynamoDB Deletion', { data: { keys } });
            }
        }
    }

    return { statusCode: 200, body: `Processed ${event.Records.length} records` };
});
