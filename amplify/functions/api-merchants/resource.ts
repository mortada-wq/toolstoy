import { defineFunction } from '@aws-amplify/backend'

export const apiMerchants = defineFunction({
  name: 'api-merchants',
  entry: './handler.ts',
  timeoutSeconds: 15,
  memoryMB: 256,
  environment: {
    DATABASE_URL: process.env.DATABASE_URL || 'postgresql://placeholder',
  },
})
