import { SQSEvent } from 'aws-lambda';
export declare const handler: (event: SQSEvent, context: any, callback?: any) => void | Promise<{
    statusCode: number;
    body: string;
}>;
