import { defineBackend } from '@aws-amplify/backend';
import { Stack } from 'aws-cdk-lib';
import {
  AuthorizationType,
  Cors,
  CognitoUserPoolsAuthorizer,
  LambdaIntegration,
  ResponseType,
  RestApi,
} from 'aws-cdk-lib/aws-apigateway';
import { auth } from './auth/resource.ts';
import { data } from './data/resource.ts';
import { storage } from './storage/resource.ts';
import { registrarLog } from './functions/registrar-log/resource.ts';

const backend = defineBackend({ auth, data, storage, registrarLog });

// The Lambda writes straight to the LogActividad table.
const logTable = backend.data.resources.tables['LogActividad'];
const fn = backend.registrarLog.resources.lambda;
logTable.grantWriteData(fn);
backend.registrarLog.addEnvironment('LOG_TABLE', logTable.tableName);

// REST API: POST /logs, protected by the Cognito user pool.
const apiStack = backend.createStack('api-stack');
const api = new RestApi(apiStack, 'GruplabApi', {
  restApiName: 'gruplabApi',
  deploy: true,
  deployOptions: { stageName: 'dev' },
  defaultCorsPreflightOptions: {
    allowOrigins: Cors.ALL_ORIGINS,
    allowMethods: Cors.ALL_METHODS,
    allowHeaders: Cors.DEFAULT_HEADERS,
  },
});

const authorizer = new CognitoUserPoolsAuthorizer(apiStack, 'CognitoAuthorizer', {
  cognitoUserPools: [backend.auth.resources.userPool],
});

api.root.addResource('logs').addMethod('POST', new LambdaIntegration(fn), {
  authorizationType: AuthorizationType.COGNITO,
  authorizer,
});

// Errors raised by API Gateway itself (expired token, throttling) never reach
// the Lambda, so they need their own CORS headers. Without them the browser
// reports an opaque CORS failure instead of the real 401/429/5xx.
const gatewayErrors = {
  Default4xx: ResponseType.DEFAULT_4XX,
  Default5xx: ResponseType.DEFAULT_5XX,
};
for (const [id, type] of Object.entries(gatewayErrors)) {
  api.addGatewayResponse(id, {
    type,
    responseHeaders: {
      'Access-Control-Allow-Origin': "'*'",
      'Access-Control-Allow-Headers': "'*'",
    },
  });
}

// Exposes the endpoint in amplify_outputs.json for the frontend.
backend.addOutput({
  custom: {
    API: {
      [api.restApiName]: {
        endpoint: api.url,
        region: Stack.of(api).region,
        apiName: api.restApiName,
      },
    },
  },
});
