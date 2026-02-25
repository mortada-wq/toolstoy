import type { APIGatewayProxyHandlerV2 } from 'aws-lambda'
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda'
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime'
import { query, queryOne, queryMany } from '../soul-engine/database'
import {
  extractVariablePlaceholders,
  validateTemplate,
} from '../soul-engine/prompt-template'

// ============================================================================
// TypeScript Interfaces
// ============================================================================

interface PromptTemplateRow {
  id: string
  name: string
  template: string
  description: string
  is_active: boolean
  variables: string[]
  version: number
  parent_template_id: string | null
  created_by: string
  created_at: string
  updated_at: string
}

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
  objectType?: string // For Living Product: e.g. "blender", "chair"
  characterType: 'mascot' | 'spokesperson' | 'sidekick' | 'expert' | 'avatar'
  characterStyleType?: 'product-morphing' | 'head-only' | 'avatar'
  generationType?: 'tools' | 'genius-avatar' | 'head-only'
  avatarConfig?: AvatarConfig
  vibeTags: string[]
  merchantId: string
  headOnlyStylePreset?: 'robot' | 'cartoon-3d' | 'mascot' | 'default'
  avatarStylePreset?: 'professional' | 'cartoon-3d' | 'mascot' | 'casual'
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
  const isLivingProduct = body.characterStyleType === 'product-morphing'
  if (!isLivingProduct) {
    const nameOrType = body.productName ?? body.objectType
    if (!nameOrType || typeof nameOrType !== 'string') {
      return 'productName or objectType is required and must be a string'
    }
  }
  if (!body.characterType || typeof body.characterType !== 'string') {
    return 'characterType is required and must be a string'
  }
  const validTypes = ['mascot', 'spokesperson', 'sidekick', 'expert', 'avatar']
  if (!validTypes.includes(body.characterType as string)) {
    return `characterType must be one of: ${validTypes.join(', ')}`
  }
  // avatarConfig is optional for avatar (used as hints; productImage is required for IMAGE_VARIATION)
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

const bedrockRuntime = new BedrockRuntimeClient({})

const CLAUDE_VISION_MODEL = 'anthropic.claude-3-haiku-20240307-v1:0'

/** Parse base64 image from data URL (data:image/jpeg;base64,...) or raw base64 */
function parseImageData(imageData: string): { base64: string; mediaType: string } {
  if (imageData.startsWith('data:')) {
    const match = imageData.match(/^data:(image\/[a-z]+);base64,(.+)$/i)
    if (match) return { base64: match[2], mediaType: match[1] }
  }
  return { base64: imageData, mediaType: 'image/jpeg' }
}

async function detectObjectTypeFromImage(imageData: string): Promise<string> {
  const { base64, mediaType } = parseImageData(imageData)
  const body = JSON.stringify({
    anthropic_version: 'bedrock-2023-05-31',
    max_tokens: 100,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: mediaType, data: base64 },
          },
          {
            type: 'text',
            text: 'What is this product or object? Reply with ONLY a single short noun or noun phrase (e.g. "blender", "office chair", "vacuum cleaner", "water bottle"). No punctuation, no explanation.',
          },
        ],
      },
    ],
  })
  const command = new InvokeModelCommand({
    modelId: CLAUDE_VISION_MODEL,
    contentType: 'application/json',
    accept: 'application/json',
    body,
  })
  const response = await bedrockRuntime.send(command)
  const result = JSON.parse(Buffer.from(response.body).toString('utf8'))
  const text = result.content?.[0]?.text?.trim() ?? ''
  return text || 'product'
}

// ============================================================================
// Prompt Template Validation
// ============================================================================

function validatePromptTemplateInput(body: Record<string, unknown>): string[] {
  const errors: string[] = []
  const name = body.name
  const templateText = body.template
  const description = body.description

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    errors.push('name is required and must be a non-empty string')
  }

  if (!description || typeof description !== 'string' || description.trim().length === 0) {
    errors.push('description is required and must be a non-empty string')
  }

  if (!templateText || typeof templateText !== 'string') {
    errors.push('template is required and must be a string')
  } else {
    if (templateText.trim().length < 50) {
      errors.push('template must be at least 50 characters long')
    }
    if (templateText.length > 10000) {
      errors.push('template must not exceed 10000 characters')
    }
    const validation = validateTemplate(templateText)
    if (!validation.valid) {
      errors.push(
        `template is missing required variables: ${validation.missingVariables.map((v) => `{${v}}`).join(', ')}`
      )
    }
  }

  return errors
}

// ============================================================================
// Main Handler
// ============================================================================

const handler: APIGatewayProxyHandlerV2 = async (event) => {
  const rawPath = event.rawPath ?? ''
  const httpMethod = event.requestContext?.http?.method ?? 'GET'
  const headers = event.headers ?? {}

  // Route /api/prompt-templates/... or /api/bedrock/...
  const isPromptTemplatesPath = rawPath.startsWith('/api/prompt-templates')
  const pathMatch = isPromptTemplatesPath
    ? rawPath.match(/^\/api\/prompt-templates\/?(.*)$/)
    : rawPath.match(/^\/api\/bedrock\/?(.*)$/)
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
    // POST /api/bedrock/detect-object-type — AI object type from product image
    // ========================================================================
    if (httpMethod === 'POST' && parts[0] === 'detect-object-type') {
      const body = parseBody(event as { body?: string })
      const productImage = body.productImage as string
      if (!productImage || typeof productImage !== 'string') {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'productImage is required (base64 or data URL)' }),
          headers: corsHeaders(),
        }
      }
      try {
        const objectType = await detectObjectTypeFromImage(productImage)
        return {
          statusCode: 200,
          body: JSON.stringify({ objectType }),
          headers: corsHeaders(),
        }
      } catch (err) {
        console.error('detect-object-type error:', err)
        return {
          statusCode: 500,
          body: JSON.stringify({
            error: 'OBJECT_DETECTION_FAILED',
            message: err instanceof Error ? err.message : 'Failed to detect object type',
          }),
          headers: corsHeaders(),
        }
      }
    }

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
        productName: (body.productName as string) || (body.objectType as string) || 'product',
        objectType: body.objectType as string | undefined,
        characterType: body.characterType as GenerateCharacterRequest['characterType'],
        characterStyleType: body.characterStyleType as GenerateCharacterRequest['characterStyleType'],
        generationType: body.generationType as GenerateCharacterRequest['generationType'],
        avatarConfig: body.avatarConfig as GenerateCharacterRequest['avatarConfig'],
        vibeTags: body.vibeTags as string[],
        merchantId: sub,
        headOnlyStylePreset: body.headOnlyStylePreset as GenerateCharacterRequest['headOnlyStylePreset'],
        avatarStylePreset: body.avatarStylePreset as GenerateCharacterRequest['avatarStylePreset'],
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

    // ========================================================================
    // Prompt Template CRUD Endpoints: /api/prompt-templates/...
    // ========================================================================

    if (isPromptTemplatesPath) {
      // GET /api/prompt-templates - list all templates
      if (httpMethod === 'GET' && parts.length === 0) {
        const searchQuery = (event.queryStringParameters?.search ?? '').toLowerCase()
        const filter = event.queryStringParameters?.filter ?? 'all'
        const sortBy = event.queryStringParameters?.sort ?? 'updated_at'

        let whereClause = ''
        if (filter === 'active') whereClause = "WHERE is_active = true"
        else if (filter === 'inactive') whereClause = "WHERE is_active = false"

        const allowedSort: Record<string, string> = {
          name: 'name',
          updated_at: 'updated_at',
          version: 'version',
        }
        const orderCol = allowedSort[sortBy] ?? 'updated_at'

        const rows = await queryMany<PromptTemplateRow>(
          `SELECT id, name, template, description, is_active, variables,
                  version, parent_template_id, created_by, created_at, updated_at
           FROM prompt_templates
           ${whereClause}
           ORDER BY is_active DESC, ${orderCol} DESC`
        )

        const filtered = searchQuery
          ? rows.filter(
              (r) =>
                r.name.toLowerCase().includes(searchQuery) ||
                r.description.toLowerCase().includes(searchQuery) ||
                r.template.toLowerCase().includes(searchQuery)
            )
          : rows

        return {
          statusCode: 200,
          body: JSON.stringify(filtered),
          headers: corsHeaders(),
        }
      }

      // GET /api/prompt-templates/active - get active template
      if (httpMethod === 'GET' && parts[0] === 'active' && parts.length === 1) {
        const row = await queryOne<PromptTemplateRow>(
          `SELECT id, name, template, description, is_active, variables,
                  version, parent_template_id, created_by, created_at, updated_at
           FROM prompt_templates
           WHERE is_active = true
           LIMIT 1`
        )

        if (!row) {
          return {
            statusCode: 404,
            body: JSON.stringify({ error: 'No active template found' }),
            headers: corsHeaders(),
          }
        }

        return { statusCode: 200, body: JSON.stringify(row), headers: corsHeaders() }
      }

      // POST /api/prompt-templates/export - export templates as JSON
      if (httpMethod === 'POST' && parts[0] === 'export' && parts.length === 1) {
        const body = parseBody(event as { body?: string })
        const ids = Array.isArray(body.ids) ? (body.ids as string[]) : []

        const whereClause = ids.length > 0
          ? `WHERE id = ANY($1::uuid[])`
          : ''
        const params = ids.length > 0 ? [ids] : []

        const rows = await queryMany<PromptTemplateRow>(
          `SELECT id, name, template, description, is_active, variables,
                  version, parent_template_id, created_by, created_at, updated_at
           FROM prompt_templates
           ${whereClause}
           ORDER BY is_active DESC, updated_at DESC`,
          params
        )

        return {
          statusCode: 200,
          body: JSON.stringify({
            export_version: '1',
            exported_at: new Date().toISOString(),
            templates: rows.map((r) => ({
              name: r.name,
              description: r.description,
              template: r.template,
              variables: r.variables,
            })),
          }),
          headers: corsHeaders(),
        }
      }

      // POST /api/prompt-templates/import - import templates from JSON
      if (httpMethod === 'POST' && parts[0] === 'import' && parts.length === 1) {
        const body = parseBody(event as { body?: string })
        const templates = Array.isArray(body.templates) ? body.templates as Array<Record<string, unknown>> : []

        if (templates.length === 0) {
          return {
            statusCode: 400,
            body: JSON.stringify({ error: 'templates array is required and must not be empty' }),
            headers: corsHeaders(),
          }
        }

        const importedIds: string[] = []
        const errors: string[] = []

        for (const t of templates) {
          const hasName = t.name && typeof t.name === 'string'
          const hasTemplate = t.template && typeof t.template === 'string'
          const hasDescription = t.description && typeof t.description === 'string'
          if (!hasName || !hasTemplate || !hasDescription) {
            errors.push('Template missing required fields: name, template, description')
            continue
          }

          // Check for duplicate name
          const existing = await queryOne<{ id: string }>(
            `SELECT id FROM prompt_templates WHERE name = $1`,
            [t.name]
          )
          if (existing) {
            errors.push(`Template with name "${t.name}" already exists`)
            continue
          }

          const variables = extractVariablePlaceholders(t.template as string)
          const result = await queryOne<{ id: string }>(
            `INSERT INTO prompt_templates (name, template, description, is_active, variables, version, created_by)
             VALUES ($1, $2, $3, false, $4, 1, $5)
             RETURNING id`,
            [t.name, t.template, t.description, variables, sub]
          )
          if (result) importedIds.push(result.id)
        }

        return {
          statusCode: 200,
          body: JSON.stringify({
            imported: importedIds.length,
            errors,
            importedIds,
          }),
          headers: corsHeaders(),
        }
      }

      // POST /api/prompt-templates - create new template
      if (httpMethod === 'POST' && parts.length === 0) {
        const body = parseBody(event as { body?: string })
        const validationErrors = validatePromptTemplateInput(body)
        if (validationErrors.length > 0) {
          return {
            statusCode: 400,
            body: JSON.stringify({ errors: validationErrors }),
            headers: corsHeaders(),
          }
        }

        // Check name uniqueness
        const existing = await queryOne<{ id: string }>(
          `SELECT id FROM prompt_templates WHERE name = $1`,
          [body.name]
        )
        if (existing) {
          return {
            statusCode: 409,
            body: JSON.stringify({ errors: ['A template with this name already exists'] }),
            headers: corsHeaders(),
          }
        }

        const variables = extractVariablePlaceholders(body.template as string)
        const row = await queryOne<PromptTemplateRow>(
          `INSERT INTO prompt_templates (name, template, description, is_active, variables, version, created_by)
           VALUES ($1, $2, $3, false, $4, 1, $5)
           RETURNING id, name, template, description, is_active, variables,
                     version, parent_template_id, created_by, created_at, updated_at`,
          [body.name, body.template, body.description, variables, sub]
        )

        return { statusCode: 201, body: JSON.stringify(row), headers: corsHeaders() }
      }

      // Routes that require a template ID: /api/prompt-templates/:id/...
      const templateId = parts[0]
      const subAction = parts[1] ?? ''

      if (!templateId) {
        return {
          statusCode: 404,
          body: JSON.stringify({ error: 'Not found' }),
          headers: corsHeaders(),
        }
      }

      // GET /api/prompt-templates/:id - get specific template
      if (httpMethod === 'GET' && !subAction) {
        const row = await queryOne<PromptTemplateRow>(
          `SELECT id, name, template, description, is_active, variables,
                  version, parent_template_id, created_by, created_at, updated_at
           FROM prompt_templates WHERE id = $1`,
          [templateId]
        )
        if (!row) {
          return {
            statusCode: 404,
            body: JSON.stringify({ error: 'Template not found' }),
            headers: corsHeaders(),
          }
        }
        return { statusCode: 200, body: JSON.stringify(row), headers: corsHeaders() }
      }

      // PUT /api/prompt-templates/:id - update template (creates new version if text changes)
      if (httpMethod === 'PUT' && !subAction) {
        const body = parseBody(event as { body?: string })
        const validationErrors = validatePromptTemplateInput(body)
        if (validationErrors.length > 0) {
          return {
            statusCode: 400,
            body: JSON.stringify({ errors: validationErrors }),
            headers: corsHeaders(),
          }
        }

        const existing = await queryOne<PromptTemplateRow>(
          `SELECT id, name, template, version, is_active, parent_template_id
           FROM prompt_templates WHERE id = $1`,
          [templateId]
        )
        if (!existing) {
          return {
            statusCode: 404,
            body: JSON.stringify({ error: 'Template not found' }),
            headers: corsHeaders(),
          }
        }

        // If template text has changed, create a new version record
        if (body.template !== existing.template) {
          const variables = extractVariablePlaceholders(body.template as string)
          const rootId = existing.parent_template_id ?? existing.id
          const newVersion = existing.version + 1
          const newRow = await queryOne<PromptTemplateRow>(
            `INSERT INTO prompt_templates (name, template, description, is_active, variables, version, parent_template_id, created_by)
             VALUES ($1, $2, $3, false, $4, $5, $6, $7)
             RETURNING id, name, template, description, is_active, variables,
                       version, parent_template_id, created_by, created_at, updated_at`,
            [body.name ?? existing.name, body.template, body.description ?? '', variables, newVersion, rootId, sub]
          )
          return { statusCode: 200, body: JSON.stringify(newRow), headers: corsHeaders() }
        }

        // Only name/description changed — update in place
        const variables = extractVariablePlaceholders(existing.template)
        const updatedRow = await queryOne<PromptTemplateRow>(
          `UPDATE prompt_templates
           SET name = $1, description = $2, variables = $3, updated_at = NOW()
           WHERE id = $4
           RETURNING id, name, template, description, is_active, variables,
                     version, parent_template_id, created_by, created_at, updated_at`,
          [body.name ?? existing.name, body.description ?? '', variables, templateId]
        )
        return { statusCode: 200, body: JSON.stringify(updatedRow), headers: corsHeaders() }
      }

      // DELETE /api/prompt-templates/:id - delete template (prevent if active)
      if (httpMethod === 'DELETE' && !subAction) {
        const existing = await queryOne<{ id: string; is_active: boolean }>(
          `SELECT id, is_active FROM prompt_templates WHERE id = $1`,
          [templateId]
        )
        if (!existing) {
          return {
            statusCode: 404,
            body: JSON.stringify({ error: 'Template not found' }),
            headers: corsHeaders(),
          }
        }
        if (existing.is_active) {
          return {
            statusCode: 409,
            body: JSON.stringify({ error: 'Cannot delete the currently active template' }),
            headers: corsHeaders(),
          }
        }
        await query(`DELETE FROM prompt_templates WHERE id = $1`, [templateId])
        return { statusCode: 200, body: JSON.stringify({ success: true }), headers: corsHeaders() }
      }

      // POST /api/prompt-templates/:id/activate - set as active
      if (httpMethod === 'POST' && subAction === 'activate') {
        const existing = await queryOne<{ id: string }>(
          `SELECT id FROM prompt_templates WHERE id = $1`,
          [templateId]
        )
        if (!existing) {
          return {
            statusCode: 404,
            body: JSON.stringify({ error: 'Template not found' }),
            headers: corsHeaders(),
          }
        }

        // Atomic: deactivate all, then activate the target
        await query(`UPDATE prompt_templates SET is_active = false`)
        await query(
          `UPDATE prompt_templates SET is_active = true, updated_at = NOW() WHERE id = $1`,
          [templateId]
        )

        const activated = await queryOne<PromptTemplateRow>(
          `SELECT id, name, template, description, is_active, variables,
                  version, parent_template_id, created_by, created_at, updated_at
           FROM prompt_templates WHERE id = $1`,
          [templateId]
        )
        return { statusCode: 200, body: JSON.stringify(activated), headers: corsHeaders() }
      }

      // POST /api/prompt-templates/:id/test - test template with sample data
      if (httpMethod === 'POST' && subAction === 'test') {
        const row = await queryOne<PromptTemplateRow>(
          `SELECT id, name, template, description, is_active, variables,
                  version, parent_template_id, created_by, created_at, updated_at
           FROM prompt_templates WHERE id = $1`,
          [templateId]
        )
        if (!row) {
          return {
            statusCode: 404,
            body: JSON.stringify({ error: 'Template not found' }),
            headers: corsHeaders(),
          }
        }

        const body = parseBody(event as { body?: string })
        const vars: Record<string, string> = {
          PRODUCT_NAME: (body.PRODUCT_NAME as string) ?? 'Sample Product',
          PRODUCT_TYPE: (body.PRODUCT_TYPE as string) ?? 'Electronics',
          PRODUCT_COLORS: (body.PRODUCT_COLORS as string) ?? 'Blue, Silver',
          CHARACTER_TYPE: (body.CHARACTER_TYPE as string) ?? 'Expert',
          VIBE_TAGS: (body.VIBE_TAGS as string) ?? 'Friendly, Professional',
        }

        let processed = row.template
        for (const [key, value] of Object.entries(vars)) {
          processed = processed.replace(new RegExp(`\\{${key}\\}`, 'g'), value)
        }

        const validation = validateTemplate(row.template)
        const remaining = extractVariablePlaceholders(processed)

        return {
          statusCode: 200,
          body: JSON.stringify({
            templateId: row.id,
            templateName: row.name,
            processedPrompt: processed,
            valid: validation.valid,
            missingInTemplate: validation.missingVariables,
            unreplacedInOutput: remaining,
          }),
          headers: corsHeaders(),
        }
      }

      // GET /api/prompt-templates/:id/analytics - get usage statistics
      if (httpMethod === 'GET' && subAction === 'analytics') {
        const existing = await queryOne<{ id: string; name: string }>(
          `SELECT id, name FROM prompt_templates WHERE id = $1`,
          [templateId]
        )
        if (!existing) {
          return {
            statusCode: 404,
            body: JSON.stringify({ error: 'Template not found' }),
            headers: corsHeaders(),
          }
        }

        const stats = await queryOne<{
          total_generations: string
          successful_generations: string
          failed_generations: string
          avg_cost_usd: string | null
          avg_generation_time_ms: string | null
        }>(
          `SELECT
             COUNT(*) AS total_generations,
             COUNT(*) FILTER (WHERE status = 'completed') AS successful_generations,
             COUNT(*) FILTER (WHERE status = 'failed') AS failed_generations,
             AVG(cost_usd) FILTER (WHERE status = 'completed') AS avg_cost_usd,
             AVG(EXTRACT(EPOCH FROM (completed_at - created_at)) * 1000) FILTER (WHERE completed_at IS NOT NULL) AS avg_generation_time_ms
           FROM generation_jobs
           WHERE prompt_template_id = $1`,
          [templateId]
        )

        const total = parseInt(stats?.total_generations ?? '0', 10)
        const successful = parseInt(stats?.successful_generations ?? '0', 10)

        return {
          statusCode: 200,
          body: JSON.stringify({
            templateId: existing.id,
            templateName: existing.name,
            totalGenerations: total,
            successfulGenerations: successful,
            failedGenerations: parseInt(stats?.failed_generations ?? '0', 10),
            successRate: total > 0 ? successful / total : 0,
            avgCostUsd: stats?.avg_cost_usd ? parseFloat(stats.avg_cost_usd) : null,
            avgGenerationTimeMs: stats?.avg_generation_time_ms
              ? parseFloat(stats.avg_generation_time_ms)
              : null,
          }),
          headers: corsHeaders(),
        }
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
