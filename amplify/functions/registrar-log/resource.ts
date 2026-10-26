import { defineFunction } from '@aws-amplify/backend';

export const registrarLog = defineFunction({
  name: 'registrar-log',
  // Same stack group as the data resources: the function writes the data table,
  // so keeping it outside 'data' would create a circular dependency.
  resourceGroupName: 'data',
});
