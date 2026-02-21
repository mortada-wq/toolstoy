import { defineFunction } from '@aws-amplify/backend'

export const apiAdmin = defineFunction({
  name: 'api-admin',
  entry: './handler.ts',
  timeoutSeconds: 15,
  memoryMB: 256,
})
