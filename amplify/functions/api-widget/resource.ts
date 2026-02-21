import { defineFunction } from '@aws-amplify/backend'

export const apiWidget = defineFunction({
  name: 'api-widget',
  entry: './handler.ts',
  timeoutSeconds: 30,
  memoryMB: 256,
})
