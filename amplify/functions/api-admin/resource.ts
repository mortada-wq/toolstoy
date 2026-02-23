import { defineFunction } from '@aws-amplify/backend'

export const apiAdmin = defineFunction({
  name: 'api-admin',
  entry: './handler.ts',
  timeoutSeconds: 60,
  memoryMB: 512,
  environment: {
    BEDROCK_TEST_MODEL_ID: process.env.BEDROCK_TEST_MODEL_ID || 'amazon.titan-image-generator-v1',
    BEDROCK_PRODUCTION_MODEL_ID: process.env.BEDROCK_PRODUCTION_MODEL_ID || 'amazon.titan-image-generator-v1',
  },
})
