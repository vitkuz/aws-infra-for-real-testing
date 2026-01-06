import { APIGatewayProxyEvent } from 'aws-lambda';
export declare const handler: (event: APIGatewayProxyEvent, context: any, callback?: any) => void | Promise<{
    statusCode: number;
    body: string;
    headers: {
        'Content-Type': string;
    };
}>;
