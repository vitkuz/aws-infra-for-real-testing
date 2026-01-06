import { S3Event } from 'aws-lambda';
export declare const handler: (event: S3Event, context: any, callback?: any) => void | Promise<{
    statusCode: number;
    body: string;
}>;
