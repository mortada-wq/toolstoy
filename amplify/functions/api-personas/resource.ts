import { defineFunction } from '@aws-amplify/backend'

export const apiPersonas = defineFunction({
  name: 'api-personas',
  entry: './handler.ts',
  timeoutSeconds: 30,
  memoryMB: 256,
})
