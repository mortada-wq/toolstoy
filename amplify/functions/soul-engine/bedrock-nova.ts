/**
 * Bedrock Nova Canvas Integration
 * 
 * Handles video generation using AWS Bedrock Nova Canvas.
 * Generates animation state videos from approved character images.
 */

import {
  BedrockRuntimeClient,
  InvokeModelCommand,
  type InvokeModelCommandInput,
} from '@aws-sdk/client-bedrock-runtime'

// ============================================================================
// Types
// ============================================================================

export interface NovaCanvasRequest {
  baseImageUrl: string
  motionPrompt: string
  duration?: number
  fps?: number
  width?: number
  height?: number
}

export interface NovaCanvasResponse {
  videoData: string // Base64 encoded video
  duration: number
  fps: number
}

export interface StateVideoResult {
  stateName: string
  videoData: string // Base64 encoded video
  duration: number
  fps: number
}

// ============================================================================
// Constants
// ============================================================================

const NOVA_MODEL_ID = 'amazon.nova-canvas-v1:0'
const VIDEO_DURATION = 6 // seconds
const VIDEO_FPS = 24
const VIDEO_WIDTH = 1280
const VIDEO_HEIGHT = 720

// ============================================================================
// Bedrock Client
// ============================================================================

let bedrockClient: BedrockRuntimeClient | null = null

/**
 * Gets or creates a Bedrock Runtime client instance.
 */
function getBedrockClient(): BedrockRuntimeClient {
  if (!bedrockClient) {
    bedrockClient = new BedrockRuntimeClient({
      region: 'us-east-1',
    })
  }
  return bedrockClient
}

// ============================================================================
// Invoke Nova Canvas
// ============================================================================

/**
 * Invokes Nova Canvas with image-to-video task.
 * 
 * @param request - Video generation request parameters
 * @returns Generated video data and metadata
 * @throws Error on Bedrock API errors
 */
export async function invokeNovaCanvas(
  request: NovaCanvasRequest
): Promise<NovaCanvasResponse> {
  const client = getBedrockClient()
  
  // Prepare request body for Nova Canvas
  const requestBody = {
    taskType: 'IMAGE_TO_VIDEO',
    imageToVideoParams: {
      imageUrl: request.baseImageUrl,
      text: request.motionPrompt,
    },
    videoGenerationConfig: {
      durationSeconds: request.duration ?? VIDEO_DURATION,
      fps: request.fps ?? VIDEO_FPS,
      dimension: `${request.width ?? VIDEO_WIDTH}x${request.height ?? VIDEO_HEIGHT}`,
    },
  }
  
  console.log('Invoking Nova Canvas for image-to-video:', {
    imageUrl: request.baseImageUrl,
    motionPrompt: request.motionPrompt,
    duration: requestBody.videoGenerationConfig.durationSeconds,
    fps: requestBody.videoGenerationConfig.fps,
    dimension: requestBody.videoGenerationConfig.dimension,
  })
  
  try {
    const input: InvokeModelCommandInput = {
      modelId: NOVA_MODEL_ID,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify(requestBody),
    }
    
    const command = new InvokeModelCommand(input)
    const response = await client.send(command)
    
    // Parse response
    const responseBody = JSON.parse(new TextDecoder().decode(response.body))
    
    // Extract base64 video data
    const videoData = responseBody.video as string
    
    if (!videoData) {
      throw new Error('No video data in Bedrock Nova Canvas response')
    }
    
    console.log('Video generated successfully')
    
    return {
      videoData,
      duration: requestBody.videoGenerationConfig.durationSeconds,
      fps: requestBody.videoGenerationConfig.fps,
    }
  } catch (error) {
    console.error('Error invoking Nova Canvas:', error)
    
    // Handle specific Bedrock errors
    if (error instanceof Error) {
      const errorName = error.name
      
      if (errorName === 'ThrottlingException') {
        throw new Error('Bedrock API throttled. Please retry.')
      } else if (errorName === 'ValidationException') {
        throw new Error(`Invalid request parameters: ${error.message}`)
      } else if (errorName === 'ServiceUnavailableException') {
        throw new Error('Bedrock service unavailable. Please try again later.')
      }
    }
    
    throw error
  }
}

// ============================================================================
// Generate State Video
// ============================================================================

/**
 * Generates a single animation state video.
 * 
 * @param baseImageUrl - URL of the approved character image
 * @param stateName - Name of the animation state
 * @param motionPrompt - Motion prompt for the state
 * @returns State video result with base64 data
 */
export async function generateStateVideo(
  baseImageUrl: string,
  stateName: string,
  motionPrompt: string
): Promise<StateVideoResult> {
  console.log(`Generating state video: ${stateName}`)
  
  try {
    const response = await invokeNovaCanvas({
      baseImageUrl,
      motionPrompt,
      duration: VIDEO_DURATION,
      fps: VIDEO_FPS,
      width: VIDEO_WIDTH,
      height: VIDEO_HEIGHT,
    })
    
    console.log(`State video generated successfully: ${stateName}`)
    
    return {
      stateName,
      videoData: response.videoData,
      duration: response.duration,
      fps: response.fps,
    }
  } catch (error) {
    console.error(`Error generating state video ${stateName}:`, error)
    throw error
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Validates a motion prompt string.
 * 
 * @param prompt - Motion prompt to validate
 * @returns True if valid
 */
export function isValidMotionPrompt(prompt: string): boolean {
  return prompt.length > 0 && prompt.length <= 512
}

/**
 * Decodes base64 video data to Buffer.
 * 
 * @param base64Data - Base64 encoded video
 * @returns Buffer containing video data
 */
export function decodeBase64Video(base64Data: string): Buffer {
  return Buffer.from(base64Data, 'base64')
}

/**
 * Validates video configuration parameters.
 * 
 * @param duration - Video duration in seconds
 * @param fps - Frames per second
 * @param width - Video width
 * @param height - Video height
 * @returns True if valid
 */
export function isValidVideoConfig(
  duration: number,
  fps: number,
  width: number,
  height: number
): boolean {
  return (
    duration > 0 &&
    duration <= 10 &&
    fps > 0 &&
    fps <= 60 &&
    width > 0 &&
    width <= 1920 &&
    height > 0 &&
    height <= 1080
  )
}
