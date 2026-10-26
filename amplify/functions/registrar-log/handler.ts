import { randomUUID } from 'node:crypto';
import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import type { APIGatewayProxyHandler } from 'aws-lambda';

const client = new DynamoDBClient({});

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '*',
};

const reply = (statusCode: number, body: unknown) => ({
  statusCode,
  headers,
  body: JSON.stringify(body),
});

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

export const handler: APIGatewayProxyHandler = async (event) => {
  // The user id comes from the verified Cognito token, never from the body,
  // so a client cannot forge logs on behalf of someone else.
  const usuarioId = event.requestContext.authorizer?.claims?.sub;
  if (!isNonEmptyString(usuarioId)) {
    return reply(401, { message: 'Unauthorized' });
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(event.body ?? '');
  } catch {
    return reply(400, { message: 'Invalid JSON body' });
  }

  const { grupoId, accion, entidad, entidadId } = payload ?? {};
  if (
    !isNonEmptyString(grupoId) ||
    !isNonEmptyString(accion) ||
    !isNonEmptyString(entidad) ||
    !isNonEmptyString(entidadId)
  ) {
    return reply(400, {
      message: 'grupoId, accion, entidad and entidadId are required strings',
    });
  }

  try {
    const id = randomUUID();
    const now = new Date();
    await client.send(
      new PutItemCommand({
        TableName: process.env['LOG_TABLE'],
        Item: {
          id: { S: id },
          __typename: { S: 'LogActividad' },
          grupoId: { S: grupoId },
          usuarioId: { S: usuarioId },
          accion: { S: accion },
          entidad: { S: entidad },
          entidadId: { S: entidadId },
          // AWSTimestamp is epoch seconds.
          timestamp: { N: String(Math.floor(now.getTime() / 1000)) },
          createdAt: { S: now.toISOString() },
          updatedAt: { S: now.toISOString() },
        },
      }),
    );
    return reply(201, { id });
  } catch (error) {
    console.error('registrar-log failed', error);
    return reply(500, { message: 'Internal error' });
  }
};
