import { defineFunction } from '@aws-amplify/backend'

export const apiScraper = defineFunction({
  name: 'api-scraper',
  entry: './handler.ts',
  timeoutSeconds: 30,
  memoryMB: 256,
})
