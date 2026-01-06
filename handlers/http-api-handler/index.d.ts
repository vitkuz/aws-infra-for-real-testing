import { APIGatewayProxyEventV2 } from 'aws-lambda';
export declare const handler: (event: APIGatewayProxyEventV2, context: any, callback?: any) => void | Promise<{
    statusCode: number;
    body: string;
    headers: {
        'Content-Type': string;
    };
}>;
