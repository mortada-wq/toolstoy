/**
 * Prompt Template Processing
 * 
 * Handles retrieval and processing of prompt templates for character generation.
 * Supports variable substitution and negative prompt appending.
 */

import { queryOne } from './database'

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
] as const

/**
 * Default prompt template used when no active template is found in database.
 */
const DEFAULT_TEMPLATE = `Create a professional AI character that serves as a personal product expert and shopping guide for {PRODUCT_NAME}, a {PRODUCT_TYPE}. This character will interact with customers on e-commerce sites to answer questions and provide advice.

Character Archetype: {CHARACTER_TYPE}
Personality Vibes: {VIBE_TAGS}
Visual Style: Use colors inspired by the product ({PRODUCT_COLORS}), clean and professional design suitable for e-commerce widget embedding.

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
  
  // Replace each variable placeholder with its value
  for (const [key, value] of Object.entries(variables)) {
    if (value !== undefined && value !== null) {
      const placeholder = `{${key}}`
      result = result.replace(new RegExp(placeholder, 'g'), value)
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

// ============================================================================
// Validate Template Variables
// ============================================================================

/**
 * Validates that all required template variables are provided.
 * 
 * @param template - Prompt template
 * @param variables - Variable values to validate
 * @returns True if all required variables are present
 */
export function validateTemplateVariables(
  template: PromptTemplate,
  variables: TemplateVariables
): { valid: boolean; missing: string[] } {
  const requiredVariables = extractVariablePlaceholders(template.template)
  const providedVariables = Object.keys(variables)
  
  const missing = requiredVariables.filter(
    (required) => !providedVariables.includes(required)
  )
  
  return {
    valid: missing.length === 0,
    missing,
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
