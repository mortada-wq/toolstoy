/**
 * Cost Tracking and Rate Limiting
 * 
 * Handles cost calculation for Bedrock generations, rate limiting,
 * and regeneration cooldown enforcement.
 */

import { query, queryOne } from './database'

// ============================================================================
// Types
// ============================================================================

export interface GenerationCost {
  imageCount: number
  videoCount: number
  imageCostPerUnit: number
  videoCostPerUnit: number
  totalImageCost: number
  totalVideoCost: number
  totalCost: number
}

export interface RateLimitCheck {
  allowed: boolean
  currentCount: number
  limit: number
  resetTime?: Date
  retryAfterSeconds?: number
}

export interface CooldownCheck {
  allowed: boolean
  lastGenerationTime?: Date
  cooldownEndsAt?: Date
  remainingSeconds?: number
}

export type SubscriptionTier = 'free' | 'pro' | 'enterprise'

// ============================================================================
// Constants
// ============================================================================

/**
 * Cost per image generation (Titan Image Generator).
 */
const COST_PER_IMAGE = 0.008 // $0.008 per image

/**
 * Cost per video generation (Nova Canvas).
 */
const COST_PER_VIDEO = 0.05 // $0.05 per video

/**
 * Rate limit: maximum generations per merchant per hour.
 */
const RATE_LIMIT_PER_HOUR = 10

/**
 * Regeneration cooldown: hours between regenerations for same character.
 */
const REGENERATION_COOLDOWN_HOURS = 24

/**
 * Number of images generated per character (3 variations).
 */
const IMAGES_PER_CHARACTER = 3

/**
 * Number of videos per subscription tier.
 */
const VIDEOS_PER_TIER: Record<SubscriptionTier, number> = {
  free: 4,
  pro: 8,
  enterprise: 12,
}

// ============================================================================
// Cost Calculation
// ============================================================================

/**
 * Calculates the cost for generating a character with images and videos.
 * 
 * @param imageCount - Number of images to generate
 * @param videoCount - Number of videos to generate
 * @returns Detailed cost breakdown
 * 
 * @example
 * ```typescript
 * const cost = calculateGenerationCost(3, 4) // Free tier
 * console.log(cost.totalCost) // $0.224
 * ```
 */
export function calculateGenerationCost(
  imageCount: number,
  videoCount: number
): GenerationCost {
  const totalImageCost = imageCount * COST_PER_IMAGE
  const totalVideoCost = videoCount * COST_PER_VIDEO
  const totalCost = totalImageCost + totalVideoCost
  
  return {
    imageCount,
    videoCount,
    imageCostPerUnit: COST_PER_IMAGE,
    videoCostPerUnit: COST_PER_VIDEO,
    totalImageCost,
    totalVideoCost,
    totalCost,
  }
}

/**
 * Calculates the cost for a complete character generation based on tier.
 * 
 * @param tier - Subscription tier (free, pro, enterprise)
 * @returns Cost breakdown for the tier
 */
export function calculateCostForTier(tier: SubscriptionTier): GenerationCost {
  const videoCount = VIDEOS_PER_TIER[tier]
  return calculateGenerationCost(IMAGES_PER_CHARACTER, videoCount)
}

/**
 * Calculates the cost for image variations only.
 * 
 * @returns Cost for generating 3 image variations
 */
export function calculateImageVariationCost(): GenerationCost {
  return calculateGenerationCost(IMAGES_PER_CHARACTER, 0)
}

/**
 * Calculates the cost for state videos only.
 * 
 * @param tier - Subscription tier
 * @returns Cost for generating state videos
 */
export function calculateStateVideosCost(tier: SubscriptionTier): GenerationCost {
  const videoCount = VIDEOS_PER_TIER[tier]
  return calculateGenerationCost(0, videoCount)
}

// ============================================================================
// Rate Limiting
// ============================================================================

/**
 * Checks if a merchant has exceeded the rate limit.
 * 
 * NOTE: This is a placeholder implementation. In production, this should
 * query the database to count recent generations.
 * 
 * @param merchantId - Merchant ID to check
 * @returns Rate limit check result
 * 
 * @example
 * ```typescript
 * const check = await checkRateLimit('merchant-123')
 * if (!check.allowed) {
 *   return { status: 429, retryAfter: check.retryAfterSeconds }
 * }
 * ```
 */
export async function checkRateLimit(
  merchantId: string
): Promise<RateLimitCheck> {
  console.log(`Checking rate limit for merchant: ${merchantId}`)
  
  // Query database to count generations in the last hour
  const result = await queryOne<{ count: string }>(
    `SELECT COUNT(*) as count
     FROM generation_jobs
     WHERE merchant_id = $1
       AND created_at > NOW() - INTERVAL '1 hour'
       AND status IN ('processing', 'completed')`,
    [merchantId]
  )
  
  const currentCount = parseInt(result?.count || '0', 10)
  const allowed = currentCount < RATE_LIMIT_PER_HOUR
  
  if (!allowed) {
    // Calculate when the rate limit resets (1 hour from now)
    const resetTime = new Date(Date.now() + 60 * 60 * 1000)
    const retryAfterSeconds = 3600 // 1 hour
    
    console.warn(
      `Rate limit exceeded for merchant ${merchantId}: ${currentCount}/${RATE_LIMIT_PER_HOUR}`
    )
    
    return {
      allowed: false,
      currentCount,
      limit: RATE_LIMIT_PER_HOUR,
      resetTime,
      retryAfterSeconds,
    }
  }
  
  return {
    allowed: true,
    currentCount,
    limit: RATE_LIMIT_PER_HOUR,
  }
}

/**
 * Gets the current generation count for a merchant in the last hour.
 * 
 * NOTE: Placeholder implementation. Should query database in production.
 * 
 * @param merchantId - Merchant ID
 * @returns Number of generations in the last hour
 */
export async function getGenerationCountLastHour(
  merchantId: string
): Promise<number> {
  console.log(`Getting generation count for merchant: ${merchantId}`)
  
  const result = await queryOne<{ count: string }>(
    `SELECT COUNT(*) as count
     FROM generation_jobs
     WHERE merchant_id = $1
       AND created_at > NOW() - INTERVAL '1 hour'
       AND status IN ('processing', 'completed')`,
    [merchantId]
  )
  
  return parseInt(result?.count || '0', 10)
}

// ============================================================================
// Regeneration Cooldown
// ============================================================================

/**
 * Checks if a character is within the regeneration cooldown period.
 * 
 * NOTE: This is a placeholder implementation. In production, this should
 * query the database to get the last generation time.
 * 
 * @param personaId - Persona ID to check
 * @returns Cooldown check result
 * 
 * @example
 * ```typescript
 * const check = await checkRegenerationCooldown('persona-123')
 * if (!check.allowed) {
 *   return { status: 429, message: `Cooldown: ${check.remainingSeconds}s` }
 * }
 * ```
 */
export async function checkRegenerationCooldown(
  personaId: string
): Promise<CooldownCheck> {
  console.log(`Checking regeneration cooldown for persona: ${personaId}`)
  
  // Query database to get last generation time
  const result = await queryOne<{ last_generation: Date }>(
    `SELECT MAX(created_at) as last_generation
     FROM generation_jobs
     WHERE persona_id = $1
       AND status = 'completed'`,
    [personaId]
  )
  
  const lastGenerationTime = result?.last_generation
  
  if (!lastGenerationTime) {
    // No previous generation, allow
    return {
      allowed: true,
    }
  }
  
  const cooldownMs = REGENERATION_COOLDOWN_HOURS * 60 * 60 * 1000
  const cooldownEndsAt = new Date(new Date(lastGenerationTime).getTime() + cooldownMs)
  const now = new Date()
  
  if (now < cooldownEndsAt) {
    const remainingMs = cooldownEndsAt.getTime() - now.getTime()
    const remainingSeconds = Math.ceil(remainingMs / 1000)
    
    console.warn(
      `Regeneration cooldown active for persona ${personaId}: ${remainingSeconds}s remaining`
    )
    
    return {
      allowed: false,
      lastGenerationTime,
      cooldownEndsAt,
      remainingSeconds,
    }
  }
  
  return {
    allowed: true,
    lastGenerationTime,
  }
}

/**
 * Gets the last generation time for a persona.
 * 
 * NOTE: Placeholder implementation. Should query database in production.
 * 
 * @param personaId - Persona ID
 * @returns Last generation time or undefined if never generated
 */
export async function getLastGenerationTime(
  personaId: string
): Promise<Date | undefined> {
  console.log(`Getting last generation time for persona: ${personaId}`)
  
  const result = await queryOne<{ last_generation: Date }>(
    `SELECT MAX(created_at) as last_generation
     FROM generation_jobs
     WHERE persona_id = $1
       AND status = 'completed'`,
    [personaId]
  )
  
  return result?.last_generation || undefined
}

// ============================================================================
// CloudWatch Logging
// ============================================================================

/**
 * Logs generation cost to CloudWatch for monthly tracking.
 * 
 * @param merchantId - Merchant ID
 * @param personaId - Persona ID
 * @param cost - Cost breakdown
 * @param jobType - Type of job (character_variations or state_videos)
 */
export function logCostToCloudWatch(
  merchantId: string,
  personaId: string,
  cost: GenerationCost,
  jobType: 'character_variations' | 'state_videos'
): void {
  // CloudWatch Logs automatically captures console.log output
  console.log('COST_TRACKING', {
    timestamp: new Date().toISOString(),
    merchantId,
    personaId,
    jobType,
    imageCount: cost.imageCount,
    videoCount: cost.videoCount,
    totalCost: cost.totalCost,
    totalImageCost: cost.totalImageCost,
    totalVideoCost: cost.totalVideoCost,
  })
}

/**
 * Logs a rate limit event to CloudWatch.
 * 
 * @param merchantId - Merchant ID
 * @param currentCount - Current generation count
 * @param limit - Rate limit threshold
 */
export function logRateLimitEvent(
  merchantId: string,
  currentCount: number,
  limit: number
): void {
  console.warn('RATE_LIMIT_EXCEEDED', {
    timestamp: new Date().toISOString(),
    merchantId,
    currentCount,
    limit,
    resetTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
  })
}

/**
 * Logs a cooldown event to CloudWatch.
 * 
 * @param personaId - Persona ID
 * @param remainingSeconds - Remaining cooldown time in seconds
 */
export function logCooldownEvent(
  personaId: string,
  remainingSeconds: number
): void {
  console.warn('REGENERATION_COOLDOWN', {
    timestamp: new Date().toISOString(),
    personaId,
    remainingSeconds,
    cooldownHours: REGENERATION_COOLDOWN_HOURS,
  })
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Formats cost as USD string.
 * 
 * @param cost - Cost in dollars
 * @returns Formatted cost string (e.g., "$0.224")
 */
export function formatCost(cost: number): string {
  return `$${cost.toFixed(3)}`
}

/**
 * Formats remaining time in human-readable format.
 * 
 * @param seconds - Remaining seconds
 * @returns Formatted time string (e.g., "2h 30m")
 */
export function formatRemainingTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  
  return `${minutes}m`
}

/**
 * Creates a 429 response object for rate limit exceeded.
 * 
 * @param retryAfterSeconds - Seconds until retry is allowed
 * @param message - Error message
 * @returns Response object with status and headers
 */
export function createRateLimitResponse(
  retryAfterSeconds: number,
  message: string
) {
  return {
    statusCode: 429,
    headers: {
      'Retry-After': retryAfterSeconds.toString(),
      'X-RateLimit-Limit': RATE_LIMIT_PER_HOUR.toString(),
      'X-RateLimit-Reset': new Date(
        Date.now() + retryAfterSeconds * 1000
      ).toISOString(),
    },
    body: JSON.stringify({
      error: 'Rate limit exceeded',
      message,
      retryAfter: retryAfterSeconds,
    }),
  }
}
