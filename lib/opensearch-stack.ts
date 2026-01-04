import * as cdk from 'aws-cdk-lib';
import * as opensearch from 'aws-cdk-lib/aws-opensearchservice';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as iam from 'aws-cdk-lib/aws-iam';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import * as path from 'path';

export class OpenSearchStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // 1. Domain
        // Use existing domain as requested to save costs
        const domain = opensearch.Domain.fromDomainAttributes(this, 'ImportedDomain', {
            domainArn: 'arn:aws:es:us-east-1:582347504313:domain/minimalopensear-k7nora94w0ks',
            domainEndpoint: 'search-minimalopensear-k7nora94w0ks-gbhgry4ieohgcafodgg6ytegym.us-east-1.es.amazonaws.com'
        });

        // 2. Lambda (Removed as we are testing directly via local client)

        // 3. Access Policy (Removed)
    }
}
