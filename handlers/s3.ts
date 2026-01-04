import { Context, S3Event } from 'aws-lambda';
import { withLogger, getLogger, REQUEST_ID_KEY } from '@vitkuz/aws-logger';
import { createS3Client, headObject } from '@vitkuz/aws-s3-adapter';

const client = createS3Client({});

export const handler = withLogger(async (event: S3Event, context: Context) => {
    // const bucketName = process.env.BUCKET_NAME; // Unused
    const logger = getLogger();
    const ctx = { logger, client };

    if (!logger) throw new Error('Logger context missing');

    logger.info('S3 Handler Invoked', { eventType: 'S3 Trigger', recordCount: event.Records.length });

    for (const record of event.Records) {
        const bucket = record.s3.bucket.name;
        const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));

        try {
            // Fetch metadata to look for x-request-id
            const headOutput = await headObject(ctx)({
                Bucket: bucket,
                Key: key
            });

            const requestId = headOutput.Metadata?.[REQUEST_ID_KEY];
            const recordLogger = logger.child(requestId ? { [REQUEST_ID_KEY]: requestId } : {});

            recordLogger.info('Processing S3 Record', {
                bucket,
                key,
                size: record.s3.object.size,
                eventName: record.eventName
            });

        } catch (error) {
            logger.error('Error processing S3 record', error as Error, { bucket, key });
        }
    }

    return { statusCode: 200, body: `Processed ${event.Records.length} records` };
});
