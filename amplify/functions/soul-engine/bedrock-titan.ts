/**
 * Bedrock Titan Image Generator Integration
 * 
 * Handles image generation using AWS Bedrock Titan Image Generator.
 * Generates character variations with different seeds for variety.
 */

import {
  BedrockRuntimeClient,
  InvokeModelCommand,
  type InvokeModelCommandInput,
} from '@aws-sdk/client-bedrock-runtime'

// ============================================================================
// Types
// ============================================================================

export interface TitanImageRequest {
  prompt: string
  negativePrompt?: string
  /** Base64 image for IMAGE_VARIATION (image + text). When set, uses product image + prompt. */
  sourceImage?: string
  seed?: number
  numberOfImages?: number
}

export interface TitanImageResponse {
  imageData: string // Base64 encoded image
  seed: number
}

export interface ImageVariation {
  imageData: string // Base64 encoded image
  seed: number
  variationNumber: number
}

// ============================================================================
// Constants
// ============================================================================

const TITAN_MODEL_ID = 'amazon.titan-image-generator-v1'
const IMAGE_RESOLUTION = 1024
const IMAGE_QUALITY = 'premium'
const CFG_SCALE = 8.0
const NUMBER_OF_VARIATIONS = 3

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
// Invoke Titan Image Generator
// ============================================================================

/** Extract base64 from data URL or return as-is */
function parseImageBase64(imageData: string): string {
  if (imageData.startsWith('data:')) {
    const match = imageData.match(/^data:image\/[a-z]+;base64,(.+)$/i)
    if (match) return match[1]
  }
  return imageData
}

/**
 * Invokes Titan Image Generator with text-to-image or image+text (IMAGE_VARIATION).
 * When sourceImage is provided, uses IMAGE_VARIATION for Living Product generation.
 */
export async function invokeTitanImageGenerator(
  request: TitanImageRequest
): Promise<TitanImageResponse> {
  const client = getBedrockClient()
  const seed = request.seed ?? Math.floor(Math.random() * 2147483647)

  const imageGenerationConfig = {
    numberOfImages: request.numberOfImages ?? 1,
    quality: IMAGE_QUALITY,
    height: IMAGE_RESOLUTION,
    width: IMAGE_RESOLUTION,
    cfgScale: CFG_SCALE,
    seed,
  }

  let requestBody: Record<string, unknown>
  if (request.sourceImage) {
    const base64Image = parseImageBase64(request.sourceImage)
    requestBody = {
      taskType: 'IMAGE_VARIATION',
      imageVariationParams: {
        image: base64Image,
        text: request.prompt,
        negativeText: request.negativePrompt,
      },
      imageGenerationConfig,
    }
    console.log('Invoking Titan (IMAGE_VARIATION: image + text) with seed:', seed)
  } else {
    requestBody = {
      taskType: 'TEXT_IMAGE',
      textToImageParams: {
        text: request.prompt,
        negativeText: request.negativePrompt,
      },
      imageGenerationConfig,
    }
    console.log('Invoking Titan (TEXT_IMAGE) with seed:', seed)
  }
  
  try {
    const input: InvokeModelCommandInput = {
      modelId: TITAN_MODEL_ID,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify(requestBody as object),
    }
    
    const command = new InvokeModelCommand(input)
    const response = await client.send(command)
    
    // Parse response
    const responseBody = JSON.parse(new TextDecoder().decode(response.body))
    
    // Extract base64 image data from first image
    const imageData = responseBody.images?.[0] as string
    
    if (!imageData) {
      throw new Error('No image data in Bedrock response')
    }
    
    console.log('Image generated successfully with seed:', seed)
    
    return {
      imageData,
      seed,
    }
  } catch (error) {
    console.error('Error invoking Titan Image Generator:', error)
    
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
// Generate Image Variations
// ============================================================================

/**
 * Generates 3 image variations with different random seeds.
 * When sourceImage is provided, uses IMAGE_VARIATION (image + text) for Living Product.
 *
 * @param prompt - Text prompt for image generation
 * @param negativePrompt - Negative prompt to avoid unwanted features
 * @param sourceImage - Optional base64 product image for image-to-image
 */
export async function generateImageVariations(
  prompt: string,
  negativePrompt?: string,
  sourceImage?: string
): Promise<ImageVariation[]> {
  console.log('Generating 3 image variations...', sourceImage ? '(image + text)' : '(text only)')

  const variations: ImageVariation[] = []

  for (let i = 0; i < NUMBER_OF_VARIATIONS; i++) {
    try {
      const seed = Math.floor(Math.random() * 2147483647)

      const response = await invokeTitanImageGenerator({
        prompt,
        negativePrompt,
        sourceImage,
        seed,
        numberOfImages: 1,
      })
      
      variations.push({
        imageData: response.imageData,
        seed: response.seed,
        variationNumber: i + 1,
      })
      
      console.log(`Variation ${i + 1}/3 generated successfully`)
    } catch (error) {
      console.error(`Error generating variation ${i + 1}:`, error)
      throw error
    }
  }
  
  console.log('All 3 variations generated successfully')
  return variations
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Validates a prompt string.
 * 
 * @param prompt - Prompt to validate
 * @returns True if valid
 */
export function isValidPrompt(prompt: string): boolean {
  return prompt.length > 0 && prompt.length <= 1024
}

/**
 * Generates a random seed for image generation.
 * 
 * @returns Random seed value
 */
export function generateRandomSeed(): number {
  return Math.floor(Math.random() * 2147483647)
}

/**
 * Decodes base64 image data to Buffer.
 * 
 * @param base64Data - Base64 encoded image
 * @returns Buffer containing image data
 */
export function decodeBase64Image(base64Data: string): Buffer {
  return Buffer.from(base64Data, 'base64')
}
