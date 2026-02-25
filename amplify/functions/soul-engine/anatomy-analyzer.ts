/**
 * Anatomy Analyzer — Vision-to-Prompt preprocessing for Living Product
 *
 * Uses Claude Vision to analyze product image structure and output JSON
 * for dynamic prompt building. Handles solid, skeletal, and complex objects.
 */

import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from '@aws-sdk/client-bedrock-runtime'

const CLAUDE_MODEL = 'anthropic.claude-3-haiku-20240307-v1:0'

let bedrockClient: BedrockRuntimeClient | null = null

function getClient(): BedrockRuntimeClient {
  if (!bedrockClient) {
    bedrockClient = new BedrockRuntimeClient({ region: 'us-east-1' })
  }
  return bedrockClient
}

/** Parse base64 from data URL or return as-is */
function parseImageBase64(imageData: string): { base64: string; mediaType: string } {
  if (imageData.startsWith('data:')) {
    const match = imageData.match(/^data:(image\/[a-z]+);base64,(.+)$/i)
    if (match) return { base64: match[2], mediaType: match[1] }
  }
  return { base64: imageData, mediaType: 'image/jpeg' }
}

export interface ProductAnatomy {
  object_name: string
  shape_category: string
  face_placement: string
  arm_placement: string
}

const ANATOMY_PROMPT = `Analyze the attached product image. Categorize its overall shape (Solid, Skeletal, Cylindrical, Complex). Identify the best physical, solid part of the object where a face could be naturally sculpted (e.g., the main canister, the front casing, the screen). Identify existing structural elements that could be naturally extended into arms (e.g., handles, side panels, exhaust pipes, handlebars).

Output strictly as JSON only, no other text:
{"object_name": "", "shape_category": "", "face_placement": "", "arm_placement": ""}`

/**
 * Analyzes product image anatomy for Living Product character generation.
 * Returns structured JSON for dynamic prompt building.
 */
export async function analyzeProductAnatomy(imageData: string): Promise<ProductAnatomy> {
  const { base64, mediaType } = parseImageBase64(imageData)

  const body = JSON.stringify({
    anthropic_version: 'bedrock-2023-05-31',
    max_tokens: 512,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: mediaType, data: base64 },
          },
          { type: 'text', text: ANATOMY_PROMPT },
        ],
      },
    ],
  })

  const command = new InvokeModelCommand({
    modelId: CLAUDE_MODEL,
    contentType: 'application/json',
    accept: 'application/json',
    body,
  })

  const response = await getClient().send(command)
  const result = JSON.parse(Buffer.from(response.body).toString('utf8'))
  const text = result.content?.[0]?.text?.trim() ?? ''

  // Parse JSON from response (handle markdown code blocks)
  let jsonStr = text
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (jsonMatch) jsonStr = jsonMatch[0]

  const parsed = JSON.parse(jsonStr) as ProductAnatomy

  return {
    object_name: parsed.object_name || 'product',
    shape_category: parsed.shape_category || 'Solid',
    face_placement: parsed.face_placement || 'front center',
    arm_placement: parsed.arm_placement || 'sides',
  }
}
