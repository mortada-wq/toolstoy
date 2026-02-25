import { defineFunction } from '@aws-amplify/backend'

export const apiBilling = defineFunction({
  name: 'api-billing',
  entry: './handler.ts',
  timeoutSeconds: 15,
  memoryMB: 256,
  environment: {
    DATABASE_URL: process.env.DATABASE_URL || 'postgresql://placeholder',
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
    STRIPE_PRICE_ID_PRO: process.env.STRIPE_PRICE_ID_PRO || '',
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || '',
  },
})
