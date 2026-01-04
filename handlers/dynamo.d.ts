import { DynamoDBStreamEvent } from 'aws-lambda';
export declare const handler: (event: DynamoDBStreamEvent, context: any, callback?: any) => void | Promise<{
    statusCode: number;
    body: string;
}>;
