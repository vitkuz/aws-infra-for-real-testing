import { DynamoDBStreamEvent } from 'aws-lambda';
export declare const handler: (event: DynamoDBStreamEvent, context: any, callback?: any) => void | Promise<void>;
