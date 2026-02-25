/**
 * Prompt Template Processing
 * 
 * Handles retrieval and processing of prompt templates for character generation.
 * Supports variable substitution and negative prompt appending.
 */

import { query, queryOne } from './database'

// ============================================================================
// Types
// ============================================================================

export interface PromptTemplate {
  id: string
  name: string
  template: string
  description: string
  is_active: boolean
  variables: string[]
  created_by: string
  created_at: string
  updated_at: string
}

export interface TemplateVariables {
  PRODUCT_NAME?: string
  PRODUCT_TYPE?: string
  PRODUCT_COLORS?: string
  CHARACTER_TYPE?: string
  VIBE_TAGS?: string
  /** Living Product: from anatomy analysis */
  object_name?: string
  shape_category?: string
  face_placement?: string
  arm_placement?: string
}

export interface ProcessedPrompt {
  prompt: string
  negativePrompt: string
  variables: TemplateVariables
}

// ============================================================================
// Constants
// ============================================================================

/**
 * Default negative prompt to append to all generation requests.
 * Helps ensure high-quality, clean character images suitable for e-commerce.
 */
const DEFAULT_NEGATIVE_PROMPT = 'blurry, low quality, distorted, deformed, text, watermark, logo, signature, multiple characters, cropped, out of frame, amateur, pixelated, grainy'

/**
 * Supported template variable placeholders.
 */
const SUPPORTED_VARIABLES = [
  'PRODUCT_NAME',
  'PRODUCT_TYPE',
  'PRODUCT_COLORS',
  'CHARACTER_TYPE',
  'VIBE_TAGS',
  'object_name',
  'shape_category',
  'face_placement',
  'arm_placement',
] as const

/**
 * Default prompt template used when no active template is found in database.
 */
const DEFAULT_TEMPLATE = `Create a professional AI character that serves as a personal product expert and shopping guide for {CHARACTER_TYPE}. This character will interact with customers on e-commerce sites to answer questions and provide advice.

Character Archetype: {CHARACTER_TYPE}
Personality Vibes: {VIBE_TAGS}
Visual Style: Use colors inspired by the product {CHARACTER_TYPE} color, clean and professional design suitable for e-commerce widget embedding.

The character should appear trustworthy, approachable, and knowledgeable - designed to assist customers in making informed purchase decisions. Style should be modern, clean, and optimized for web display at various sizes.`

// ============================================================================
// Retrieve Active Prompt Template
// ============================================================================

/**
 * Retrieves the active prompt template from the database.
 * 
 * @returns Active prompt template or default template if none found
 */
export async function retrieveActivePromptTemplate(): Promise<PromptTemplate> {
  try {
    console.log('Retrieving active prompt template from database...')
    
    // Query the prompt_templates table for the active template
    const row = await queryOne<{
      id: string
      name: string
      template: string
      description: string
      is_active: boolean
      variables: string[]
      version: number
      created_by: string
      created_at: string
      updated_at: string
    }>(
      `SELECT id, name, template, description, is_active, variables, 
              version, created_by, created_at, updated_at
       FROM prompt_templates
       WHERE is_active = true
       LIMIT 1`
    )
    
    if (row) {
      console.log('Using template:', row.name)
      return {
        id: row.id,
        name: row.name,
        template: row.template,
        description: row.description,
        is_active: row.is_active,
        variables: row.variables,
        created_by: row.created_by,
        created_at: row.created_at,
        updated_at: row.updated_at,
      }
    }
    
    // Fallback to default template if no active template found
    console.warn('No active template found, using default')
    return {
      id: 'default-template',
      name: 'Default Character Generation Template',
      template: DEFAULT_TEMPLATE,
      description: 'Default template for character generation',
      is_active: true,
      variables: [...SUPPORTED_VARIABLES],
      created_by: 'system',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  } catch (error) {
    console.error('Error retrieving prompt template:', error)
    // Return default template on error
    return {
      id: 'fallback-template',
      name: 'Fallback Template',
      template: DEFAULT_TEMPLATE,
      description: 'Fallback template used on error',
      is_active: true,
      variables: [...SUPPORTED_VARIABLES],
      created_by: 'system',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  }
}

// ============================================================================
// Extract Variable Placeholders
// ============================================================================

/**
 * Extracts variable placeholders from a template string.
 * 
 * @param template - Template string with {VARIABLE} placeholders
 * @returns Array of variable names found in template
 */
export function extractVariablePlaceholders(template: string): string[] {
  const regex = /\{([A-Z_]+)\}/g
  const matches = template.matchAll(regex)
  const variables = new Set<string>()
  
  for (const match of matches) {
    if (match[1]) {
      variables.add(match[1])
    }
  }
  
  return Array.from(variables)
}

// ============================================================================
// Replace Template Variables
// ============================================================================

/**
 * Replaces template variable placeholders with actual values.
 * 
 * @param template - Template string with {VARIABLE} placeholders
 * @param variables - Object containing variable values
 * @returns Template string with variables replaced
 */
export function replaceTemplateVariables(
  template: string,
  variables: TemplateVariables
): string {
  let result = template
  
  // Replace each variable placeholder with its value (use split/join to avoid regex escaping)
  for (const [key, value] of Object.entries(variables)) {
    if (value !== undefined && value !== null) {
      const placeholder = `{${key}}`
      result = result.split(placeholder).join(String(value))
    }
  }
  
  // Log warning for any remaining unreplaced placeholders
  const remainingPlaceholders = extractVariablePlaceholders(result)
  if (remainingPlaceholders.length > 0) {
    console.warn('Unreplaced template variables:', remainingPlaceholders)
  }
  
  return result
}

// ============================================================================
// Process Template
// ============================================================================

/**
 * Processes a prompt template with variable substitution and negative prompt.
 * 
 * @param template - Prompt template to process
 * @param variables - Variable values for substitution
 * @returns Processed prompt with variables replaced and negative prompt appended
 */
export function processTemplate(
  template: PromptTemplate,
  variables: TemplateVariables
): ProcessedPrompt {
  console.log('Processing template:', template.name)
  
  // Replace variables in template
  const prompt = replaceTemplateVariables(template.template, variables)
  
  // Use default negative prompt
  const negativePrompt = DEFAULT_NEGATIVE_PROMPT
  
  const result: ProcessedPrompt = {
    prompt,
    negativePrompt,
    variables,
  }
  
  console.log('Template processed successfully')
  return result
}

/**
 * Required template variable names that must appear in every prompt template.
 */
export const REQUIRED_TEMPLATE_VARIABLES = [
  'PRODUCT_NAME',
  'CHARACTER_TYPE',
  'PRODUCT_COLORS',
  'VIBE_TAGS',
  'PRODUCT_TYPE',
] as const

// ============================================================================
// Validate Template (checks template ITSELF for required variables)
// ============================================================================

/**
 * Validates that a prompt template contains all required variable placeholders
 * and that all variable placeholders use the correct format {VARIABLE_NAME}.
 *
 * @param templateText - The template text to validate
 * @returns Validation result with missing variables and unrecognized variable warnings
 */
export function validateTemplate(templateText: string): {
  valid: boolean
  missingVariables: string[]
  unrecognizedVariables: string[]
} {
  const foundVariables = extractVariablePlaceholders(templateText)
  const requiredSet = new Set<string>(REQUIRED_TEMPLATE_VARIABLES)
  const supportedSet = new Set<string>(SUPPORTED_VARIABLES)

  const missingVariables = REQUIRED_TEMPLATE_VARIABLES.filter(
    (v) => !foundVariables.includes(v)
  )
  const unrecognizedVariables = foundVariables.filter((v) => !supportedSet.has(v))

  return {
    valid: missingVariables.length === 0,
    missingVariables,
    unrecognizedVariables,
  }
}

// ============================================================================
// Retrieve Template by ID
// ============================================================================

/**
 * Retrieves a prompt template by its ID.
 *
 * @param id - Template UUID
 * @returns Prompt template or null if not found
 */
export async function retrievePromptTemplateById(id: string): Promise<PromptTemplate | null> {
  try {
    const row = await queryOne<{
      id: string
      name: string
      template: string
      description: string
      is_active: boolean
      variables: string[]
      version: number
      created_by: string
      created_at: string
      updated_at: string
    }>(
      `SELECT id, name, template, description, is_active, variables,
              version, created_by, created_at, updated_at
       FROM prompt_templates
       WHERE id = $1`,
      [id]
    )

    if (!row) return null

    return {
      id: row.id,
      name: row.name,
      template: row.template,
      description: row.description,
      is_active: row.is_active,
      variables: row.variables,
      created_by: row.created_by,
      created_at: row.created_at,
      updated_at: row.updated_at,
    }
  } catch (error) {
    console.error('Error retrieving prompt template by ID:', error)
    return null
  }
}

// ============================================================================
// Template Usage Tracking
// ============================================================================

/**
 * Records which prompt template was used for a generation job.
 *
 * @param jobId - Generation job ID
 * @param templateId - Prompt template ID
 * @param promptUsed - The fully processed prompt text
 */
export async function recordTemplateUsage(
  jobId: string,
  templateId: string,
  promptUsed: string
): Promise<void> {
  try {
    await query(
      `UPDATE generation_jobs
       SET prompt_template_id = $1,
           prompt_used = $2
       WHERE id = $3`,
      [templateId, promptUsed, jobId]
    )
    console.log(`Recorded template usage: job=${jobId} template=${templateId}`)
  } catch (error) {
    console.error('Error recording template usage:', error)
  }
}

/**
 * Records which prompt template was used to generate a persona's character.
 *
 * @param personaId - Persona ID
 * @param templateId - Prompt template ID
 */
export async function recordPersonaTemplate(
  personaId: string,
  templateId: string
): Promise<void> {
  try {
    await query(
      `UPDATE personas
       SET prompt_template_id = $1
       WHERE id = $2`,
      [templateId, personaId]
    )
    console.log(`Recorded persona template: persona=${personaId} template=${templateId}`)
  } catch (error) {
    console.error('Error recording persona template:', error)
  }
}



// ============================================================================
// Format Helper Functions
// ============================================================================

/**
 * Formats an array of colors into a comma-separated string.
 * 
 * @param colors - Array of hex color values
 * @returns Formatted color string
 */
export function formatColors(colors: string[]): string {
  return colors.join(', ')
}

/**
 * Formats an array of vibe tags into a comma-separated string.
 * 
 * @param tags - Array of vibe tag strings
 * @returns Formatted tag string
 */
export function formatVibeTags(tags: string[]): string {
  return tags.join(', ')
}

/**
 * Formats a character type into a human-readable string.
 * 
 * @param type - Character type
 * @returns Formatted character type
 */
export function formatCharacterType(type: string): string {
  return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()
}

// ============================================================================
// Living Product Dynamic Prompt
// ============================================================================

/** Static negative prompt for Living Product (from report). */
export const LIVING_PRODUCT_NEGATIVE_PROMPT =
  'angry, mean, stern, aggressive, flat, 2D sticker, human skin, organic limbs, realistic human hands, thin lines, blurry, asymmetrical face'

/** Living Product prompt template with anatomy placeholders. */
const LIVING_PRODUCT_TEMPLATE = `Reference: Maintain the exact materials and industrial finish of the {object_name}. Render in centered, symmetrical front-view.
The Face: Locate the {face_placement} of the {object_name}. Protrude facial features with high-relief 3D depth. Sculpt large eyes and an exaggeratedly happy smile.
The Arms: Emerge two thick, expressive arms seamlessly from the {arm_placement}. Match surrounding materials, posed in a wide, joyful gesture.
Personality: Radiant, incredibly happy, friendly. Technical: High-end PBR textures, strong studio lighting, transparent background, 8k resolution.`

/**
 * Builds the Living Product dynamic prompt from anatomy analysis.
 */
export function buildLivingProductPrompt(anatomy: {
  object_name: string
  shape_category: string
  face_placement: string
  arm_placement: string
}): string {
  return replaceTemplateVariables(LIVING_PRODUCT_TEMPLATE, anatomy)
}

/**
 * Avatar config shape for custom avatar generation.
 */
export interface AvatarConfig {
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

const SKIN_TONE_NAMES: Record<string, string> = {
  '#FDBCB4': 'light',
  '#F1C27D': 'medium-light',
  '#E0AC69': 'medium',
  '#C68642': 'medium-dark',
  '#8D5524': 'dark',
}

const EYE_COLOR_NAMES: Record<string, string> = {
  '#8B4513': 'brown',
  '#1E90FF': 'blue',
  '#228B22': 'green',
  '#8B7355': 'hazel',
  '#808080': 'gray',
}

const HAIR_COLOR_NAMES: Record<string, string> = {
  '#000000': 'black',
  '#4B3621': 'brown',
  '#F5DEB3': 'blonde',
  '#8B4513': 'red',
  '#708090': 'gray',
  '#F5F5F5': 'white',
}

const FACE_SHAPE_LABELS: Record<string, string> = {
  round: 'balanced round face',
  oval: 'classic oval face',
  square: 'strong angular face',
  heart: 'refined heart-shaped face',
}

const MOUTH_LABELS: Record<string, string> = {
  smile: 'warm approachable smile',
  neutral: 'composed neutral expression',
  laugh: 'friendly cheerful expression',
  serious: 'confident professional expression',
}

/**
 * Formats avatar config into a natural-language description for image generation.
 * Uses professional design terminology for premium, brand-ready output.
 *
 * @param config - Avatar configuration from the customizer
 * @returns Human-readable avatar description for prompt
 */
export function formatAvatarConfig(config: AvatarConfig): string {
  const skin = SKIN_TONE_NAMES[config.skinTone] || 'neutral'
  const faceShape = FACE_SHAPE_LABELS[config.faceShape] || config.faceShape
  const hairStyle = config.hairStyle === 'bald' ? 'clean-shaven bald' : `${config.hairStyle} hair`
  const hairColor = HAIR_COLOR_NAMES[config.hairColor] || config.hairColor
  const eyes = `${config.eyeType} ${EYE_COLOR_NAMES[config.eyeColor] || config.eyeColor} eyes`
  const eyebrows = `${config.eyebrowType} eyebrows`
  const nose = `${config.noseType} nose`
  const mouth = MOUTH_LABELS[config.mouthType] || config.mouthType
  const accessory = config.accessory !== 'none' ? `subtle ${config.accessory}` : 'minimal accessories'

  const parts = [
    faceShape,
    `${skin} skin tone`,
    hairStyle === 'clean-shaven bald' ? hairStyle : `${hairStyle} in ${hairColor}`,
    eyes,
    eyebrows,
    nose,
    mouth,
    accessory,
  ]

  return parts.join(', ')
}
