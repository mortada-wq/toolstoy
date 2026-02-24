import { defineFunction } from '@aws-amplify/backend'

export const soulEngine = defineFunction({
  name: 'soul-engine',
  entry: './handler.ts',
  timeoutSeconds: 300,
  memoryMB: 3008,
  environment: {
    VIDEO_MODEL: 'amazon.nova-canvas-v1:0',
    VIDEO_DURATION: '6',
    VIDEO_FPS: '24',
    S3_BUCKET: 'toolstoy-character-images',
    CDN_DOMAIN: 'cdn.toolstoy.app',
    DATABASE_URL: process.env.DATABASE_URL || 'postgresql://placeholder',
  },
  ephemeralStorageSizeMB: 3072,
})
