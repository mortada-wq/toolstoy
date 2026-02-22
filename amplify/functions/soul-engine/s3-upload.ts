/**
 * S3 Upload Functionality
 * 
 * Handles uploading images and videos to S3 with proper metadata
 * and returns CDN URLs for asset access.
 */

import {
  S3Client,
  PutObjectCommand,
  type PutObjectCommandInput,
} from '@aws-sdk/client-s3'

// ============================================================================
// Types
// ============================================================================

export interface UploadImageOptions {
  personaId: string
  variationNumber?: number
  imageData: Buffer
  contentType?: string
}

export interface UploadVideoOptions {
  personaId: string
  stateName: string
  videoData: Buffer
  contentType?: string
}

export interface UploadResult {
  s3Key: string
  s3Url: string
  cdnUrl: string
}

// ============================================================================
// Environment Variables
// ============================================================================

const S3_BUCKET = process.env.S3_BUCKET || 'toolstoy-character-images'
const CDN_DOMAIN = process.env.CDN_DOMAIN || 'cdn.toolstoy.app'
const AWS_REGION = 'us-east-1'

// ============================================================================
// S3 Client
// ============================================================================

let s3Client: S3Client | null = null

/**
 * Gets or creates an S3 client instance.
 */
function getS3Client(): S3Client {
  if (!s3Client) {
    s3Client = new S3Client({
      region: AWS_REGION,
    })
  }
  return s3Client
}

// ============================================================================
// Upload Image to S3
// ============================================================================

/**
 * Uploads an image to S3 with path personas/{persona-id}/variations/{n}.png
 * 
 * @param options - Upload options including persona ID and image data
 * @returns Upload result with S3 and CDN URLs
 */
export async function uploadImageToS3(
  options: UploadImageOptions
): Promise<UploadResult> {
  const client = getS3Client()
  
  // Determine S3 key based on whether it's a variation or avatar
  const s3Key = options.variationNumber
    ? `personas/${options.personaId}/variations/${options.variationNumber}.png`
    : `personas/${options.personaId}/avatar.png`
  
  console.log(`Uploading image to S3: ${s3Key}`)
  
  try {
    const input: PutObjectCommandInput = {
      Bucket: S3_BUCKET,
      Key: s3Key,
      Body: options.imageData,
      ContentType: options.contentType || 'image/png',
      CacheControl: 'public, max-age=31536000', // 1 year
      Metadata: {
        'persona-id': options.personaId,
        'variation-number': options.variationNumber?.toString() || 'avatar',
        'uploaded-at': new Date().toISOString(),
      },
    }
    
    const command = new PutObjectCommand(input)
    await client.send(command)
    
    // Construct URLs
    const s3Url = `https://${S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com/${s3Key}`
    const cdnUrl = `https://${CDN_DOMAIN}/${s3Key}`
    
    console.log(`Image uploaded successfully: ${cdnUrl}`)
    
    return {
      s3Key,
      s3Url,
      cdnUrl,
    }
  } catch (error) {
    console.error('Error uploading image to S3:', error)
    throw new Error(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// ============================================================================
// Upload Video to S3
// ============================================================================

/**
 * Uploads a video to S3 with path personas/{persona-id}/states/{state-name}.mp4
 * 
 * @param options - Upload options including persona ID, state name, and video data
 * @returns Upload result with S3 and CDN URLs
 */
export async function uploadVideoToS3(
  options: UploadVideoOptions
): Promise<UploadResult> {
  const client = getS3Client()
  
  const s3Key = `personas/${options.personaId}/states/${options.stateName}.mp4`
  
  console.log(`Uploading video to S3: ${s3Key}`)
  
  try {
    const input: PutObjectCommandInput = {
      Bucket: S3_BUCKET,
      Key: s3Key,
      Body: options.videoData,
      ContentType: options.contentType || 'video/mp4',
      CacheControl: 'public, max-age=31536000', // 1 year
      Metadata: {
        'persona-id': options.personaId,
        'state-name': options.stateName,
        'uploaded-at': new Date().toISOString(),
      },
    }
    
    const command = new PutObjectCommand(input)
    await client.send(command)
    
    // Construct URLs
    const s3Url = `https://${S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com/${s3Key}`
    const cdnUrl = `https://${CDN_DOMAIN}/${s3Key}`
    
    console.log(`Video uploaded successfully: ${cdnUrl}`)
    
    return {
      s3Key,
      s3Url,
      cdnUrl,
    }
  } catch (error) {
    console.error('Error uploading video to S3:', error)
    throw new Error(`Failed to upload video: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Validates S3 bucket name.
 * 
 * @param bucketName - Bucket name to validate
 * @returns True if valid
 */
export function isValidBucketName(bucketName: string): boolean {
  // S3 bucket name rules: 3-63 chars, lowercase, numbers, hyphens
  const regex = /^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/
  return regex.test(bucketName)
}

/**
 * Validates S3 key (object path).
 * 
 * @param key - S3 key to validate
 * @returns True if valid
 */
export function isValidS3Key(key: string): boolean {
  // S3 key can be up to 1024 bytes
  return key.length > 0 && key.length <= 1024
}

/**
 * Constructs CDN URL from S3 key.
 * 
 * @param s3Key - S3 object key
 * @returns CDN URL
 */
export function constructCdnUrl(s3Key: string): string {
  return `https://${CDN_DOMAIN}/${s3Key}`
}

/**
 * Constructs S3 URL from bucket and key.
 * 
 * @param bucket - S3 bucket name
 * @param key - S3 object key
 * @returns S3 URL
 */
export function constructS3Url(bucket: string, key: string): string {
  return `https://${bucket}.s3.${AWS_REGION}.amazonaws.com/${key}`
}

/**
 * Extracts persona ID from S3 key.
 * 
 * @param s3Key - S3 object key
 * @returns Persona ID or null if not found
 */
export function extractPersonaIdFromKey(s3Key: string): string | null {
  const match = s3Key.match(/^personas\/([^/]+)\//)
  return match ? match[1] : null
}
