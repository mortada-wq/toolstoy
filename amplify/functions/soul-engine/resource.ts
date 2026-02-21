import { defineFunction } from '@aws-amplify/backend'

export const soulEngine = defineFunction({
  name: 'soul-engine',
  entry: './handler.ts',
  timeoutSeconds: 300,
  memoryMB: 512,
})
