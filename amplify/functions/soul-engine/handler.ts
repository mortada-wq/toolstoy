import type { SQSEvent, SQSHandler } from 'aws-lambda'
import { analyzeImage, type ImageAnalysisResult } from './image-analysis'
import { analyzeProductAnatomy } from './anatomy-analyzer'
import {
  formatColors,
  formatVibeTags,
  formatAvatarConfig,
  buildLivingProductPrompt,
  buildHeadOnlyPrompt,
  buildAvatarPrompt,
  LIVING_PRODUCT_NEGATIVE_PROMPT,
  HEAD_ONLY_NEGATIVE_PROMPT,
  AVATAR_NEGATIVE_PROMPT,
  type AvatarConfig,
} from './prompt-template'
import {
  generateImageVariations,
  type ImageVariation,
} from './bedrock-titan'
import {
  uploadImageToS3,
  uploadVideoToS3,
  type UploadResult,
} from './s3-upload'
import {
  generateStateVideo,
  decodeBase64Video,
  type StateVideoResult,
} from './bedrock-nova'
import {
  getStatesForTier,
  getStateCountForTier,
  type AnimationState as AnimationStateConfig,
  type SubscriptionTier,
} from './animation-states'
import { query, queryOne } from './database'

// ============================================================================
// TypeScript Interfaces
// ============================================================================

interface GenerateCharacterRequest {
  productImage: string // Base64 or URL
  productName: string
  objectType?: string // For Living Product: e.g. "blender", "chair" — replaces productName in prompt
  characterType: 'mascot' | 'spokesperson' | 'sidekick' | 'expert' | 'avatar'
  characterStyleType?: 'product-morphing' | 'head-only' | 'avatar'
  generationType?: 'tools' | 'genius-avatar' | 'head-only'
  avatarConfig?: AvatarConfig
  vibeTags: string[]
  merchantId: string
  /** Head Only: style preset for 3D output (robot, cartoon-3d, mascot) */
  headOnlyStylePreset?: 'robot' | 'cartoon-3d' | 'mascot' | 'default'
  /** Avatar: style preset for full-body output */
  avatarStylePreset?: 'professional' | 'cartoon-3d' | 'mascot' | 'casual'
}

interface CharacterVariation {
  variationNumber: number
  imageUrl: string
  seed: number
  timestamp: string
}

interface GenerateCharacterResponse {
  jobId: string
  variations: CharacterVariation[]
  status: 'processing' | 'completed' | 'failed'
}

interface GenerateStatesRequest {
  personaId: string
  approvedImageUrl: string
  subscriptionTier: 'free' | 'pro' | 'enterprise'
}

interface AnimationState {
  id: string
  name: string
  videoUrl: string
}

interface GenerateStatesResponse {
  jobId: string
  states: AnimationState[]
  totalCost: number
  estimatedTime: number
  status: 'processing' | 'completed' | 'failed'
}

interface SQSMessageBody {
  action: 'generateCharacterVariations' | 'generateStateVideos'
  payload: GenerateCharacterRequest | GenerateStatesRequest
}

// ============================================================================
// Environment Variables
// ============================================================================

const VIDEO_MODEL = process.env.VIDEO_MODEL || 'amazon.nova-canvas-v1:0'
const VIDEO_DURATION = parseInt(process.env.VIDEO_DURATION || '6', 10)
const VIDEO_FPS = parseInt(process.env.VIDEO_FPS || '24', 10)
const S3_BUCKET = process.env.S3_BUCKET || 'toolstoy-character-images'
const CDN_DOMAIN = process.env.CDN_DOMAIN || 'cdn.toolstoy.app'
const DATABASE_URL = process.env.DATABASE_URL

// ============================================================================
// Main Handler
// ============================================================================

const handler: SQSHandler = async (event: SQSEvent) => {
  for (const record of event.Records) {
    try {
      const body = JSON.parse(record.body) as SQSMessageBody
      
      console.log(`Soul Engine processing action: ${body.action}`)
      
      switch (body.action) {
        case 'generateCharacterVariations':
          await handleGenerateCharacterVariations(body.payload as GenerateCharacterRequest)
          break
        
        case 'generateStateVideos':
          await handleGenerateStateVideos(body.payload as GenerateStatesRequest)
          break
        
        default:
          console.error(`Unknown action: ${body.action}`)
      }
    } catch (err) {
      console.error('Soul Engine error:', err)
      // Error handling will be enhanced in subsequent tasks
    }
  }
}

// ============================================================================
// Handler: Generate Character Variations
// ============================================================================

async function handleGenerateCharacterVariations(
  request: GenerateCharacterRequest
): Promise<GenerateCharacterResponse> {
  console.log('Generating character variations for:', request.productName)
  
  const jobId = `job-${Date.now()}-${request.merchantId}`
  
  try {
    // Step 1: Create generation_jobs record with status "processing"
    await query(
      `INSERT INTO generation_jobs (
        id, merchant_id, product_name, character_type, job_type, status, current_step, started_at, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())`,
      [jobId, request.merchantId, request.productName, request.characterType, 'character_variations', 'processing', 'initializing']
    )
    console.log(`[${jobId}] Created generation job record`)
    
    // Step 2: Build image generation prompt (avatar config vs template)
    let finalPrompt: string
    let negativePrompt: string

    if (request.characterStyleType === 'avatar') {
      // Avatar: IMAGE_VARIATION with reference + full body, no background
      const imageAnalysis: ImageAnalysisResult = await analyzeImage(request.productImage)
      console.log(`[${jobId}] Avatar image analysis:`, {
        category: imageAnalysis.category,
        colorCount: imageAnalysis.colors.length,
      })
      finalPrompt = buildAvatarPrompt({
        stylePreset: request.avatarStylePreset ?? 'professional',
        productName: request.objectType ?? request.productName,
        vibeTags: request.vibeTags,
        productColors: formatColors(imageAnalysis.colors),
        avatarConfig: request.avatarConfig,
      })
      negativePrompt = AVATAR_NEGATIVE_PROMPT
      console.log(`[${jobId}] Avatar prompt (${finalPrompt.length} chars)`)
    } else {
      const isLivingProduct = request.characterStyleType === 'product-morphing'

      if (isLivingProduct) {
        // Living Product: Vision-to-Prompt flow — anatomy analysis → dynamic prompt → IMAGE_VARIATION
        const anatomy = await analyzeProductAnatomy(request.productImage)
        console.log(`[${jobId}] Anatomy analysis:`, anatomy)
        finalPrompt = buildLivingProductPrompt(anatomy)
        negativePrompt = LIVING_PRODUCT_NEGATIVE_PROMPT
        console.log(`[${jobId}] Living Product prompt (${finalPrompt.length} chars)`)
      } else {
        // Head-only: IMAGE_VARIATION with reference + 3D-style prompt
        const imageAnalysis: ImageAnalysisResult = await analyzeImage(request.productImage)
        console.log(`[${jobId}] Head-only image analysis:`, {
          category: imageAnalysis.category,
          colorCount: imageAnalysis.colors.length,
        })
        finalPrompt = buildHeadOnlyPrompt({
          stylePreset: request.headOnlyStylePreset ?? 'default',
          productName: request.objectType ?? request.productName,
          vibeTags: request.vibeTags,
          productColors: formatColors(imageAnalysis.colors),
        })
        negativePrompt = HEAD_ONLY_NEGATIVE_PROMPT
        console.log(`[${jobId}] Head-only prompt (${finalPrompt.length} chars)`)
      }
    }

    // Step 5: Generate 3 image variations — IMAGE_VARIATION for product-morphing, head-only, avatar
    const useImageVariation =
      request.characterStyleType === 'product-morphing' ||
      request.characterStyleType === 'head-only' ||
      request.characterStyleType === 'avatar'
    console.log(`[${jobId}] Generating 3 image variations...`, useImageVariation ? '(IMAGE_VARIATION)' : '')
    const imageVariations: ImageVariation[] = await generateImageVariations(
      finalPrompt,
      negativePrompt,
      useImageVariation ? request.productImage : undefined
    )
    console.log(`[${jobId}] Generated ${imageVariations.length} variations`)
    
    // Step 6: Upload variations to S3
    console.log(`[${jobId}] Uploading variations to S3...`)
    const uploadPromises = imageVariations.map(async (variation, index) => {
      const s3Key = `characters/${request.merchantId}/${jobId}/variation-${index + 1}.png`
      const uploadResult: UploadResult = await uploadImageToS3({
        personaId: `${request.merchantId}/${jobId}`,
        variationNumber: index + 1,
        imageData: Buffer.from(variation.imageData, 'base64'),
      })
      
      return {
        variationNumber: index + 1,
        imageUrl: `https://${CDN_DOMAIN}/${s3Key}`,
        seed: variation.seed,
        timestamp: new Date().toISOString(),
        s3Key: uploadResult.s3Key,
      }
    })
    
    const uploadedVariations = await Promise.all(uploadPromises)
    console.log(`[${jobId}] Uploaded ${uploadedVariations.length} variations to S3`)
    
    // Step 7: Store variation metadata in character_variations table
    for (const variation of uploadedVariations) {
      await query(
        `INSERT INTO character_variations (
          generation_job_id, variation_number, image_url, s3_key, seed, created_at
        ) VALUES ($1, $2, $3, $4, $5, NOW())`,
        [jobId, variation.variationNumber, variation.imageUrl, variation.s3Key, variation.seed]
      )
    }
    console.log(`[${jobId}] Stored variation metadata`)
    
    // Step 8: Update generation_jobs with variation URLs and status
    const variationUrls = uploadedVariations.map(v => v.imageUrl)
    await query(
      `UPDATE generation_jobs
       SET status = $1,
           variation_urls = $2,
           current_step = $3,
           completed_at = NOW(),
           updated_at = NOW()
       WHERE id = $4`,
      ['completed', variationUrls, 'completed', jobId]
    )
    console.log(`[${jobId}] Updated generation job status to completed`)
    
    // Step 9: Build and return response
    const variations: CharacterVariation[] = uploadedVariations.map((v) => ({
      variationNumber: v.variationNumber,
      imageUrl: v.imageUrl,
      seed: v.seed,
      timestamp: v.timestamp,
    }))
    
    const response: GenerateCharacterResponse = {
      jobId,
      variations,
      status: 'completed',
    }
    
    console.log(`[${jobId}] Character generation completed successfully`)
    return response
  } catch (error) {
    console.error(`[${jobId}] Error generating character variations:`, error)
    
    // Update generation_jobs with error status
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorCode = error instanceof Error ? error.name : 'UNKNOWN_ERROR'
    
    await query(
      `UPDATE generation_jobs
       SET status = $1,
           error_message = $2,
           error_code = $3,
           completed_at = NOW(),
           updated_at = NOW()
       WHERE id = $4`,
      ['failed', errorMessage, errorCode, jobId]
    )
    console.log(`[${jobId}] Updated generation job status to failed`)
    
    // Re-throw error for SQS retry handling
    throw error
  }
}

// ============================================================================
// Handler: Generate State Videos
// ============================================================================

async function handleGenerateStateVideos(
  request: GenerateStatesRequest
): Promise<GenerateStatesResponse> {
  console.log('Generating state videos for persona:', request.personaId)
  
  const jobId = `job-${Date.now()}-${request.personaId}`
  
  try {
    // Step 1: Create generation_jobs record with status "processing"
    const totalStates = getStateCountForTier(request.subscriptionTier)
    
    await query(
      `INSERT INTO generation_jobs (
        id, persona_id, job_type, status, current_step, total_states, started_at, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
      [jobId, request.personaId, 'state_videos', 'processing', 'initializing', totalStates]
    )
    console.log(`[${jobId}] Created generation job record`)
    
    console.log(`[${jobId}] Created generation job record`)
    
    // Step 2: Determine state count based on subscription tier
    const availableStates = getStatesForTier(request.subscriptionTier)
    
    console.log(`[${jobId}] Generating ${totalStates} states for ${request.subscriptionTier} tier`)
    
    // Step 3: Update job status to "generating_videos"
    await query(
      `UPDATE generation_jobs
       SET current_step = $1,
           updated_at = NOW()
       WHERE id = $2`,
      ['generating_videos', jobId]
    )
    console.log(`[${jobId}] Updated job status to generating_videos`)
    
    // Step 4: Generate all state videos in parallel using Promise.all
    console.log(`[${jobId}] Starting parallel video generation...`)
    const videoGenerationPromises = availableStates.map(async (state: AnimationStateConfig) => {
      try {
        console.log(`[${jobId}] Generating video for state: ${state.name}`)
        
        // Generate state video using Nova Canvas
        const videoResult: StateVideoResult = await generateStateVideo(
          request.approvedImageUrl,
          state.name,
          state.motionPrompt
        )
        
        console.log(`[${jobId}] Video generated for state: ${state.name}`)
        
        // Decode base64 video data
        const videoBuffer = decodeBase64Video(videoResult.videoData)
        
        // Upload video to S3
        const uploadResult: UploadResult = await uploadVideoToS3({
          personaId: request.personaId,
          stateName: state.name,
          videoData: videoBuffer,
          contentType: 'video/mp4',
        })
        
        console.log(`[${jobId}] Uploaded video for state: ${state.name} -> ${uploadResult.cdnUrl}`)
        
        // Update generation_jobs.states_generated incrementally
        await query(
          `UPDATE generation_jobs
           SET states_generated = array_append(states_generated, $1),
               updated_at = NOW()
           WHERE id = $2`,
          [state.name, jobId]
        )
        console.log(`[${jobId}] Updated states_generated array`)
        
        return {
          stateName: state.name,
          cdnUrl: uploadResult.cdnUrl,
          s3Key: uploadResult.s3Key,
        }
      } catch (error) {
        console.error(`[${jobId}] Error generating state ${state.name}:`, error)
        // Continue with other states even if one fails
        return null
      }
    })
    
    // Wait for all video generations to complete
    const videoResults = await Promise.all(videoGenerationPromises)
    
    // Filter out failed generations
    const successfulVideos = videoResults.filter((result) => result !== null)
    
    console.log(`[${jobId}] Generated ${successfulVideos.length}/${totalStates} videos successfully`)
    
    // Step 5: Build video_states JSONB mapping (state name -> CDN URL)
    const videoStatesMapping: Record<string, string> = {}
    successfulVideos.forEach((video) => {
      if (video) {
        videoStatesMapping[video.stateName] = video.cdnUrl
      }
    })
    
    // Step 6: Update persona.video_states JSONB with mappings
    await query(
      `UPDATE personas
       SET video_states = $1::jsonb,
           generation_metadata = jsonb_set(
             COALESCE(generation_metadata, '{}'::jsonb),
             '{last_state_generation}',
             to_jsonb(NOW())
           ),
           updated_at = NOW()
       WHERE id = $2`,
      [JSON.stringify(videoStatesMapping), request.personaId]
    )
    console.log(`[${jobId}] Updated persona.video_states`)
    
    // Step 7: Calculate total cost
    // Titan: $0.008/image (already generated in previous step)
    // Nova: $0.05/video
    const titanCost = 0.008 * 3 // 3 image variations
    const novaCost = 0.05 * successfulVideos.length
    const totalCost = titanCost + novaCost
    
    console.log(`[${jobId}] Total cost: $${totalCost.toFixed(3)} (Titan: $${titanCost.toFixed(3)}, Nova: $${novaCost.toFixed(2)})`)
    
    // Step 8: Update generation_jobs with final status
    await query(
      `UPDATE generation_jobs
       SET status = $1,
           current_step = $2,
           cost_usd = $3,
           completed_at = NOW(),
           updated_at = NOW()
       WHERE id = $4`,
      ['completed', 'completed', totalCost, jobId]
    )
    console.log(`[${jobId}] Updated generation job status to completed`)
    
    // Step 9: Build and return response
    const states: AnimationState[] = successfulVideos.map((video) => ({
      id: video!.stateName,
      name: video!.stateName,
      videoUrl: video!.cdnUrl,
    }))
    
    // Calculate estimated time (6 seconds per video + processing overhead)
    const estimatedTime = totalStates * 8 // 8 seconds per video (6s generation + 2s overhead)
    
    const response: GenerateStatesResponse = {
      jobId,
      states,
      totalCost,
      estimatedTime,
      status: 'completed',
    }
    
    console.log(`[${jobId}] State video generation completed successfully`)
    return response
  } catch (error) {
    console.error(`[${jobId}] Error generating state videos:`, error)
    
    // Update generation_jobs with error status
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorCode = error instanceof Error ? error.name : 'UNKNOWN_ERROR'
    
    await query(
      `UPDATE generation_jobs
       SET status = $1,
           error_message = $2,
           error_code = $3,
           completed_at = NOW(),
           updated_at = NOW()
       WHERE id = $4`,
      ['failed', errorMessage, errorCode, jobId]
    )
    console.log(`[${jobId}] Updated generation job status to failed`)
    
    // Re-throw error for SQS retry handling
    throw error
  }
}

// ============================================================================
// Utility Functions (to be implemented in subsequent tasks)
// ============================================================================

// Task 2.2: Image analysis utilities ✓ IMPLEMENTED
// - extractDominantColors() - see image-analysis.ts
// - detectProductCategory() - see image-analysis.ts
// - analyzeImage() - see image-analysis.ts

// Task 2.3: Prompt template processing ✓ IMPLEMENTED
// - retrieveActivePromptTemplate() - see prompt-template.ts
// - replaceTemplateVariables() - see prompt-template.ts
// - processTemplate() - see prompt-template.ts

// Task 2.4: Bedrock Titan Image Generator integration ✓ IMPLEMENTED
// - invokeTitanImageGenerator() - see bedrock-titan.ts
// - generateImageVariations() - see bedrock-titan.ts

// Task 2.5: S3 upload functionality ✓ IMPLEMENTED
// - uploadImageToS3() - see s3-upload.ts
// - uploadVideoToS3() - see s3-upload.ts

// Task 2.8: Bedrock Nova Canvas integration
// - invokeNovaCanvas()
// - generateStateVideo()

// Task 2.9: Animation state configuration
// - getStatesForTier()
// - ANIMATION_STATES array

// Task 2.13: Retry logic with exponential backoff
// - retryWithBackoff()

// Task 2.15: Cost tracking and rate limiting
// - calculateGenerationCost()
// - checkRateLimit()

// Task 2.17: Error handling and fallback strategies
// - handleBedrockError()
// - usePlaceholderImage()

export { handler }
