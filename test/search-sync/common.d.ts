export declare const STACK_NAME = "vitkuz-testing-search-sync";
export declare const REGION: string;
export declare const getApiUrl: () => Promise<string>;
export declare const createRequester: (apiUrl: string, requestId: string) => (method: string, path: string, body?: any) => Promise<unknown>;
export declare const sleep: (ms: number) => Promise<unknown>;
