import { defineFunction } from '@aws-amplify/backend'

export const apiMerchants = defineFunction({
  name: 'api-merchants',
  entry: './handler.ts',
  timeoutSeconds: 15,
  memoryMB: 256,
})
