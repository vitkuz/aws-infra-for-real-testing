import { SNSEvent } from 'aws-lambda';
export declare const handler: (event: SNSEvent, context: any, callback?: any) => void | Promise<{
    statusCode: number;
    body: string;
}>;
