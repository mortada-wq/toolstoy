import type { APIGatewayProxyHandlerV2 } from 'aws-lambda'
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda'
import { query, queryOne } from '../soul-engine/database'

// ============================================================================
// TypeScript Interfaces
// ============================================================================

interface AvatarConfig {
  faceShape: string
  skinTone: string
  eyeType: string
  eyeColor: string
  eyebrowType: string
  noseType: string
  mouthType: string
  hairStyle: string
  hairColor: string
  accessory: string
  backgroundColor: string
}

interface GenerateCharacterRequest {
  productImage: string // Base64 or URL
  productName: string
  characterType: 'mascot' | 'spokesperson' | 'sidekick' | 'expert' | 'avatar'
  characterStyleType?: 'product-morphing' | 'head-only' | 'avatar'
  generationType?: 'tools' | 'genius-avatar' | 'head-only'
  avatarConfig?: AvatarConfig
  vibeTags: string[]
  merchantId: string
}

interface GenerateStatesRequest {
  personaId: string
  approvedImageUrl: string
  subscriptionTier: 'free' | 'pro' | 'enterprise'
}

interface ApproveVariationRequest {
  personaId: string
  variationId: string
}

interface JobStatusResponse {
  jobId: string
  status: 'processing' | 'completed' | 'failed'
  currentStep?: string
  statesGenerated?: string[]
  totalStates?: number
  errorMessage?: string
}

// ============================================================================
// Utility Functions
// ============================================================================

function decodeJwtPayload(token: string): Record<string, unknown> {
  const part = token.split('.')[1]
  if (!part) throw new Error('Invalid token')
  const base64 = part.replace(/-/g, '+').replace(/_/g, '/')
  return JSON.parse(Buffer.from(base64, 'base64').toString('utf8'))
}

function corsHeaders() {
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }
}

function parseBody(ev: { body?: string }): Record<string, unknown> {
  if (!ev?.body) return {}
  try {
    return JSON.parse(ev.body) as Record<string, unknown>
  } catch {
    return {}
  }
}

function requireAuth(headers: Record<string, string | undefined>): string | null {
  const auth = headers?.authorization ?? headers?.Authorization ?? ''
  if (!auth.startsWith('Bearer ')) return null
  try {
    const payload = decodeJwtPayload(auth.slice(7)) as Record<string, string>
    return payload.sub ?? null
  } catch {
    return null
  }
}

function validateGenerateCharacterRequest(body: Record<string, unknown>): string | null {
  if (!body.productImage || typeof body.productImage !== 'string') {
    return 'productImage is required and must be a string'
  }
  if (!body.productName || typeof body.productName !== 'string') {
    return 'productName is required and must be a string'
  }
  if (!body.characterType || typeof body.characterType !== 'string') {
    return 'characterType is required and must be a string'
  }
  const validTypes = ['mascot', 'spokesperson', 'sidekick', 'expert', 'avatar']
  if (!validTypes.includes(body.characterType as string)) {
    return `characterType must be one of: ${validTypes.join(', ')}`
  }
  if (body.characterType === 'avatar') {
    if (!body.avatarConfig || typeof body.avatarConfig !== 'object') {
      return 'avatarConfig is required when characterType is avatar'
    }
  }
  if (!Array.isArray(body.vibeTags)) {
    return 'vibeTags is required and must be an array'
  }
  return null
}

function validateGenerateStatesRequest(body: Record<string, unknown>): string | null {
  if (!body.personaId || typeof body.personaId !== 'string') {
    return 'personaId is required and must be a string'
  }
  if (!body.approvedImageUrl || typeof body.approvedImageUrl !== 'string') {
    return 'approvedImageUrl is required and must be a string'
  }
  if (!body.subscriptionTier || typeof body.subscriptionTier !== 'string') {
    return 'subscriptionTier is required and must be a string'
  }
  const validTiers = ['free', 'pro', 'enterprise']
  if (!validTiers.includes(body.subscriptionTier as string)) {
    return `subscriptionTier must be one of: ${validTiers.join(', ')}`
  }
  return null
}

function validateApproveVariationRequest(body: Record<string, unknown>): string | null {
  if (!body.personaId || typeof body.personaId !== 'string') {
    return 'personaId is required and must be a string'
  }
  if (!body.variationId || typeof body.variationId !== 'string') {
    return 'variationId is required and must be a string'
  }
  return null
}

// ============================================================================
// Lambda Invocation Helper
// ============================================================================

const lambdaClient = new LambdaClient({})

async function invokeSoulEngine(action: string, payload: unknown): Promise<unknown> {
  const functionName = process.env.SOUL_ENGINE_FUNCTION_NAME || 'soul-engine'
  
  const command = new InvokeCommand({
    FunctionName: functionName,
    InvocationType: 'RequestResponse',
    Payload: JSON.stringify({
      Records: [{
        body: JSON.stringify({
          action,
          payload,
        }),
      }],
    }),
  })
  
  const response = await lambdaClient.send(command)
  
  if (response.FunctionError) {
    throw new Error(`Soul Engine invocation failed: ${response.FunctionError}`)
  }
  
  if (!response.Payload) {
    throw new Error('Soul Engine returned no payload')
  }
  
  const payloadStr = Buffer.from(response.Payload).toString('utf8')
  return JSON.parse(payloadStr)
}

// ============================================================================
// Main Handler
// ============================================================================

const handler: APIGatewayProxyHandlerV2 = async (event) => {
  const rawPath = event.rawPath ?? ''
  const httpMethod = event.requestContext?.http?.method ?? 'GET'
  const headers = event.headers ?? {}
  const pathMatch = rawPath.match(/^\/api\/bedrock\/?(.*)$/)
  const pathSuffix = pathMatch ? (pathMatch[1] || '').replace(/\/$/, '') : ''
  const parts = pathSuffix ? pathSuffix.split('/') : []

  // Handle CORS preflight
  if (httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders(), body: '' }
  }

  // Require authentication for all endpoints
  const sub = requireAuth(headers as Record<string, string | undefined>)
  if (!sub) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Unauthorized' }),
      headers: corsHeaders(),
    }
  }

  try {
    // ========================================================================
    // Task 4.1: POST /api/bedrock/generate-character
    // ========================================================================
    if (httpMethod === 'POST' && parts[0] === 'generate-character') {
      const body = parseBody(event as { body?: string })
      
      // Validate request body
      const validationError = validateGenerateCharacterRequest(body)
      if (validationError) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: validationError }),
          headers: corsHeaders(),
        }
      }
      
      // Build request payload
      const request: GenerateCharacterRequest = {
        productImage: body.productImage as string,
        productName: body.productName as string,
        characterType: body.characterType as GenerateCharacterRequest['characterType'],
        characterStyleType: body.characterStyleType as GenerateCharacterRequest['characterStyleType'],
        generationType: body.generationType as GenerateCharacterRequest['generationType'],
        avatarConfig: body.avatarConfig as GenerateCharacterRequest['avatarConfig'],
        vibeTags: body.vibeTags as string[],
        merchantId: sub,
      }
      
      // Invoke Soul Engine Lambda
      console.log('Invoking Soul Engine for character generation:', request.productName)
      const response = await invokeSoulEngine('generateCharacterVariations', request)
      
      return {
        statusCode: 200,
        body: JSON.stringify(response),
        headers: corsHeaders(),
      }
    }

    // ========================================================================
    // Task 4.2: POST /api/bedrock/generate-states
    // ========================================================================
    if (httpMethod === 'POST' && parts[0] === 'generate-states') {
      const body = parseBody(event as { body?: string })
      
      // Validate request body
      const validationError = validateGenerateStatesRequest(body)
      if (validationError) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: validationError }),
          headers: corsHeaders(),
        }
      }
      
      // Build request payload
      const request: GenerateStatesRequest = {
        personaId: body.personaId as string,
        approvedImageUrl: body.approvedImageUrl as string,
        subscriptionTier: body.subscriptionTier as 'free' | 'pro' | 'enterprise',
      }
      
      // Invoke Soul Engine Lambda
      console.log('Invoking Soul Engine for state generation:', request.personaId)
      const response = await invokeSoulEngine('generateStateVideos', request)
      
      return {
        statusCode: 200,
        body: JSON.stringify(response),
        headers: corsHeaders(),
      }
    }

    // ========================================================================
    // Task 4.3: GET /api/bedrock/job-status/:jobId
    // ========================================================================
    if (httpMethod === 'GET' && parts[0] === 'job-status' && parts[1]) {
      const jobId = parts[1]
      
      // Query generation_jobs table
      const job = await queryOne<{
        id: string
        status: string
        current_step: string
        states_generated: string[]
        total_states: number
        error_message: string | null
        error_code: string | null
      }>(
        `SELECT id, status, current_step, states_generated, total_states, 
                error_message, error_code
         FROM generation_jobs
         WHERE id = $1`,
        [jobId]
      )
      
      if (!job) {
        return {
          statusCode: 404,
          body: JSON.stringify({ error: 'Job not found' }),
          headers: corsHeaders(),
        }
      }
      
      const jobStatus: JobStatusResponse = {
        jobId: job.id,
        status: job.status as 'processing' | 'completed' | 'failed',
        currentStep: job.current_step,
        statesGenerated: job.states_generated || [],
        totalStates: job.total_states,
        errorMessage: job.error_message || undefined,
      }
      
      console.log(`Job status query for ${jobId}`)
      
      return {
        statusCode: 200,
        body: JSON.stringify(jobStatus),
        headers: corsHeaders(),
      }
    }

    // ========================================================================
    // Task 4.4: POST /api/bedrock/approve-variation
    // ========================================================================
    if (httpMethod === 'POST' && parts[0] === 'approve-variation') {
      const body = parseBody(event as { body?: string })
      
      // Validate request body
      const validationError = validateApproveVariationRequest(body)
      if (validationError) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: validationError }),
          headers: corsHeaders(),
        }
      }
      
      const request: ApproveVariationRequest = {
        personaId: body.personaId as string,
        variationId: body.variationId as string,
      }
      
      // 1. Get variation image URL from character_variations table
      const variation = await queryOne<{
        image_url: string
        persona_id: string
      }>(
        `SELECT image_url, persona_id
         FROM character_variations
         WHERE id = $1`,
        [request.variationId]
      )
      
      if (!variation) {
        return {
          statusCode: 404,
          body: JSON.stringify({ error: 'Variation not found' }),
          headers: corsHeaders(),
        }
      }
      
      // Verify the variation belongs to the persona
      if (variation.persona_id !== request.personaId) {
        return {
          statusCode: 403,
          body: JSON.stringify({ error: 'Variation does not belong to this persona' }),
          headers: corsHeaders(),
        }
      }
      
      // 2. Update persona record with approved image URL
      await query(
        `UPDATE personas
         SET approved_variation_id = $1,
             image_url = $2,
             status = $3,
             updated_at = NOW()
         WHERE id = $4`,
        [request.variationId, variation.image_url, 'active', request.personaId]
      )
      
      // 3. Update character_variations.is_approved to true
      await query(
        `UPDATE character_variations
         SET is_approved = true
         WHERE id = $1`,
        [request.variationId]
      )
      
      console.log(`Approved variation ${request.variationId} for persona ${request.personaId}`)
      
      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          personaId: request.personaId,
          variationId: request.variationId,
          imageUrl: variation.image_url,
          status: 'active',
        }),
        headers: corsHeaders(),
      }
    }

    // No matching route
    return {
      statusCode: 404,
      body: JSON.stringify({ error: 'Not found' }),
      headers: corsHeaders(),
    }
  } catch (error) {
    console.error('API error:', error)
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      headers: corsHeaders(),
    }
  }
}

export { handler }
