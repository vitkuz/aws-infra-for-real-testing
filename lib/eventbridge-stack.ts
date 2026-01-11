import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as path from 'path';

export interface EventBridgeStackProps extends cdk.StackProps {
    projectName: string;
    envName: string;
}

export class EventBridgeStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: EventBridgeStackProps) {
        super(scope, id, props);

        const { projectName, envName } = props;

        // 1. Create Event Bus
        const bus = new events.EventBus(this, 'TestBus', {
            eventBusName: `${projectName}-test-bus-${envName}`,
        });

        // 2. Create Common Lambda Handler (Reused for simplicity, or we can create two)
        // Using the same code but different function instances
        const handlerPath = path.join(__dirname, '../handlers/eventbridge-handler/index.ts');

        const handler1 = new nodejs.NodejsFunction(this, 'Handler1', {
            functionName: `${projectName}-eb-handler-1-${envName}`,
            entry: handlerPath,
            runtime: lambda.Runtime.NODEJS_20_X,
            environment: {
                HANDLER_ID: '1'
            }
        });

        const handler2 = new nodejs.NodejsFunction(this, 'Handler2', {
            functionName: `${projectName}-eb-handler-2-${envName}`,
            entry: handlerPath,
            runtime: lambda.Runtime.NODEJS_20_X,
            environment: {
                HANDLER_ID: '2'
            }
        });

        // 3. Create Rules
        // Rule 1: Matches source "com.vitkuz.test.rule1"
        new events.Rule(this, 'Rule1', {
            eventBus: bus,
            eventPattern: {
                source: ['com.vitkuz.test.rule1'],
            },
            targets: [new targets.LambdaFunction(handler1)],
        });

        // Rule 2: Matches source "com.vitkuz.test.rule2"
        new events.Rule(this, 'Rule2', {
            eventBus: bus,
            eventPattern: {
                source: ['com.vitkuz.test.rule2'],
            },
            targets: [new targets.LambdaFunction(handler2)],
        });


        // Output the Event Bus Name
        new cdk.CfnOutput(this, 'EventBusName', {
            value: bus.eventBusName,
        });
    }
}
