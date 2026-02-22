import { defineFunction } from '@aws-amplify/backend'

export const apiBedrock = defineFunction({
  name: 'api-bedrock',
  entry: './handler.ts',
  timeoutSeconds: 300, // 5 minutes to allow for Soul Engine processing
  memoryMB: 512,
  environment: {
    SOUL_ENGINE_FUNCTION_NAME: 'soul-engine',
  },
})
