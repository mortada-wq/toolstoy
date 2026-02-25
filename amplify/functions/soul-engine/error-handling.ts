/**
 * Error Handling and Fallback Strategies
 * 
 * Provides error handling utilities, user-friendly error messages,
 * and fallback strategies for generation failures.
 */

import { query } from './database'

// ============================================================================
// Types
// ============================================================================

export interface ErrorDetails {
  errorCode: string
  errorMessage: string
  userMessage: string
  suggestedAction: string
  isRetryable: boolean
}

export interface GenerationError {
  type: 'validation' | 'service_unavailable' | 'throttling' | 'unknown'
  originalError: Error
  details: ErrorDetails
}

export interface FallbackResult<T> {
  success: boolean
  data?: T
  usedFallback: boolean
  fallbackReason?: string
}

// ============================================================================
// Bedrock Error Interface
// ============================================================================

/**
 * Structured Bedrock API error with full context for debugging.
 * Requirements: 1.2, 9.3
 */
export interface BedrockError {
  code: string
  message: string
  statusCode: number
  requestId?: string
  timestamp: string
}

// ============================================================================
// Bedrock Request Validation
// ============================================================================

/**
 * Validates Bedrock API request parameters before making the API call.
 * Requirements: 1.4
 *
 * @param prompt - Prompt text to validate
 * @param width - Image width in pixels
 * @param height - Image height in pixels
 * @returns Validation result with errors array
 */
export function validateBedrockRequest(
  prompt: string,
  width: number,
  height: number
): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!prompt || prompt.trim().length === 0) {
    errors.push('Prompt must not be empty')
  }

  if (prompt && prompt.length > 10000) {
    errors.push(`Prompt exceeds maximum length of 10000 characters (got ${prompt.length})`)
  }

  if (width < 512 || width > 2048) {
    errors.push(`Image width must be between 512 and 2048 pixels (got ${width})`)
  }

  if (height < 512 || height > 2048) {
    errors.push(`Image height must be between 512 and 2048 pixels (got ${height})`)
  }

  return { valid: errors.length === 0, errors }
}

// ============================================================================
// Bedrock Error Logging
// ============================================================================

/**
 * Logs a Bedrock API error with full context for debugging.
 * Requirements: 1.2, 9.3, 9.4
 *
 * @param bedrockError - The Bedrock error details
 * @param context - Additional context (jobId, personaId, merchantId, templateId)
 */
export function logBedrockError(
  bedrockError: BedrockError,
  context: {
    jobId?: string
    personaId?: string
    merchantId?: string
    templateId?: string
    [key: string]: unknown
  }
): void {
  console.error('BEDROCK_API_ERROR', {
    timestamp: bedrockError.timestamp,
    code: bedrockError.code,
    message: bedrockError.message,
    statusCode: bedrockError.statusCode,
    requestId: bedrockError.requestId,
    jobId: context.jobId,
    personaId: context.personaId,
    merchantId: context.merchantId,
    templateId: context.templateId,
    ...context,
  })
}

/**
 * AWS SDK error type with metadata for status code and request ID.
 */
type AwsSdkError = Error & { $metadata?: { httpStatusCode?: number; requestId?: string } }

/**
 * Converts a raw AWS SDK error into a BedrockError.
 *
 * @param error - Raw error from AWS SDK
 * @returns Structured BedrockError
 */
export function toBedrockError(error: AwsSdkError): BedrockError {
  return {
    code: error.name || 'UNKNOWN_ERROR',
    message: error.message,
    statusCode: error.$metadata?.httpStatusCode ?? 500,
    requestId: error.$metadata?.requestId,
    timestamp: new Date().toISOString(),
  }
}

// ============================================================================
// Constants
// ============================================================================

/**
 * Default placeholder image URL for fallback.
 */
const DEFAULT_PLACEHOLDER_IMAGE_URL =
  'https://cdn.toolstoy.app/defaults/character-placeholder.png'

/**
 * Maximum retries before using fallback strategies.
 */
const MAX_RETRIES_BEFORE_FALLBACK = 3

// ============================================================================
// Error Classification
// ============================================================================

/**
 * Classifies an error and returns structured error details.
 * 
 * @param error - Error to classify
 * @returns Structured error details with user-friendly message
 */
export function classifyError(error: Error): ErrorDetails {
  const errorName = error.name
  const errorMessage = error.message
  
  // ValidationException: Invalid request parameters
  if (errorName === 'ValidationException') {
    return {
      errorCode: 'VALIDATION_ERROR',
      errorMessage,
      userMessage:
        'The generation request contains invalid parameters. Please check your inputs and try again.',
      suggestedAction: 'Review your product image, name, and character settings.',
      isRetryable: false,
    }
  }
  
  // ServiceUnavailableException: Bedrock service is down
  if (errorName === 'ServiceUnavailableException') {
    return {
      errorCode: 'SERVICE_UNAVAILABLE',
      errorMessage,
      userMessage:
        'The AI generation service is temporarily unavailable. Please try again in a few minutes.',
      suggestedAction: 'Wait a few minutes and retry your request.',
      isRetryable: true,
    }
  }
  
  // ThrottlingException: Rate limited by Bedrock
  if (errorName === 'ThrottlingException' || errorName === 'TooManyRequestsException') {
    return {
      errorCode: 'THROTTLED',
      errorMessage,
      userMessage:
        'Too many generation requests. The system is automatically retrying your request.',
      suggestedAction: 'Please wait while we process your request.',
      isRetryable: true,
    }
  }
  
  // AccessDeniedException: IAM permissions issue
  if (errorName === 'AccessDeniedException') {
    return {
      errorCode: 'ACCESS_DENIED',
      errorMessage,
      userMessage:
        'Unable to access the AI generation service. Please contact support.',
      suggestedAction: 'Contact support with error code: ACCESS_DENIED',
      isRetryable: false,
    }
  }
  
  // ModelNotReadyException: Model not enabled in Bedrock
  if (errorName === 'ModelNotReadyException') {
    return {
      errorCode: 'MODEL_NOT_READY',
      errorMessage,
      userMessage:
        'The AI model is not available. Please contact support to enable it.',
      suggestedAction: 'Contact support with error code: MODEL_NOT_READY',
      isRetryable: false,
    }
  }
  
  // Unknown error
  return {
    errorCode: 'UNKNOWN_ERROR',
    errorMessage,
    userMessage:
      'An unexpected error occurred during generation. Please try again.',
    suggestedAction: 'Try again or contact support if the issue persists.',
    isRetryable: true,
  }
}

/**
 * Creates a GenerationError from a raw error.
 * 
 * @param error - Raw error
 * @returns Structured generation error
 */
export function createGenerationError(error: Error): GenerationError {
  const details = classifyError(error)
  
  let type: GenerationError['type'] = 'unknown'
  
  if (error.name === 'ValidationException') {
    type = 'validation'
  } else if (error.name === 'ServiceUnavailableException') {
    type = 'service_unavailable'
  } else if (error.name === 'ThrottlingException' || error.name === 'TooManyRequestsException') {
    type = 'throttling'
  }
  
  return {
    type,
    originalError: error,
    details,
  }
}

// ============================================================================
// Error Logging
// ============================================================================

/**
 * Logs error details with prompt information for debugging.
 * 
 * @param error - Error to log
 * @param context - Additional context (prompt, persona ID, etc.)
 */
export function logErrorWithContext(
  error: Error,
  context: {
    operation: string
    prompt?: string
    personaId?: string
    merchantId?: string
    jobId?: string
    [key: string]: unknown
  }
): void {
  const errorDetails = classifyError(error)
  
  console.error('GENERATION_ERROR', {
    timestamp: new Date().toISOString(),
    errorCode: errorDetails.errorCode,
    errorName: error.name,
    errorMessage: error.message,
    isRetryable: errorDetails.isRetryable,
    ...context,
  })
  
  // Log prompt details for ValidationException
  if (error.name === 'ValidationException' && context.prompt) {
    console.error('VALIDATION_ERROR_PROMPT', {
      timestamp: new Date().toISOString(),
      prompt: context.prompt,
      promptLength: context.prompt.length,
      personaId: context.personaId,
    })
  }
}

/**
 * Logs a job failure to CloudWatch.
 * 
 * @param jobId - Generation job ID
 * @param error - Error that caused the failure
 * @param context - Additional context
 */
export function logJobFailure(
  jobId: string,
  error: Error,
  context: Record<string, unknown> = {}
): void {
  const errorDetails = classifyError(error)
  
  console.error('JOB_FAILED', {
    timestamp: new Date().toISOString(),
    jobId,
    errorCode: errorDetails.errorCode,
    errorMessage: errorDetails.errorMessage,
    ...context,
  })
}

// ============================================================================
// Fallback Strategies
// ============================================================================

/**
 * Handles image generation failure with fallback to placeholder.
 * 
 * After MAX_RETRIES_BEFORE_FALLBACK failed attempts, returns a default
 * placeholder image instead of failing completely.
 * 
 * @param operation - Image generation operation
 * @param retryCount - Number of retries attempted
 * @returns Result with image data or fallback placeholder
 */
export async function handleImageGenerationWithFallback<T>(
  operation: () => Promise<T>,
  retryCount: number
): Promise<FallbackResult<T>> {
  try {
    const data = await operation()
    return {
      success: true,
      data,
      usedFallback: false,
    }
  } catch (error) {
    console.error('Image generation failed:', error)
    
    // After max retries, use placeholder
    if (retryCount >= MAX_RETRIES_BEFORE_FALLBACK) {
      console.warn(
        `Using placeholder image after ${retryCount} failed attempts`
      )
      
      // TODO: In production, fetch and return actual placeholder image data
      // For now, return the URL as fallback data
      return {
        success: true,
        data: {
          imageUrl: DEFAULT_PLACEHOLDER_IMAGE_URL,
          isPlaceholder: true,
        } as T,
        usedFallback: true,
        fallbackReason: 'Max retries exceeded',
      }
    }
    
    // Re-throw if we haven't reached max retries
    throw error
  }
}

/**
 * Handles partial video generation failure.
 * 
 * Continues with successfully generated states instead of failing completely.
 * 
 * @param stateResults - Array of state generation results
 * @returns Successful states only
 */
export function handlePartialVideoFailure<T extends { stateName: string }>(
  stateResults: Array<{ success: boolean; data?: T; error?: Error }>
): T[] {
  const successfulStates = stateResults
    .filter((result) => result.success && result.data)
    .map((result) => result.data!)
  
  const failedStates = stateResults.filter((result) => !result.success)
  
  if (failedStates.length > 0) {
    console.warn(
      `Partial video generation failure: ${failedStates.length} states failed, ` +
      `${successfulStates.length} states succeeded`
    )
    
    failedStates.forEach((result) => {
      console.error('Failed state:', result.error?.message)
    })
  }
  
  return successfulStates
}

// ============================================================================
// Database Error Storage (Placeholder)
// ============================================================================

/**
 * Stores error details in generation_jobs table.
 * 
 * @param jobId - Generation job ID
 * @param error - Error to store
 */
export async function storeErrorInDatabase(
  jobId: string,
  error: Error
): Promise<void> {
  const errorDetails = classifyError(error)
  
  try {
    await query(
      `UPDATE generation_jobs
       SET status = 'failed',
           error_message = $1,
           error_code = $2,
           completed_at = NOW()
       WHERE id = $3`,
      [errorDetails.errorMessage, errorDetails.errorCode, jobId]
    )
  } catch (dbError) {
    console.error('Failed to store error in database:', dbError)
  }
  
  logJobFailure(jobId, error)
}

/**
 * Marks a job as failed in the database.
 * 
 * @param jobId - Generation job ID
 * @param errorCode - Error code
 * @param errorMessage - Error message
 */
export async function markJobAsFailed(
  jobId: string,
  errorCode: string,
  errorMessage: string
): Promise<void> {
  try {
    await query(
      `UPDATE generation_jobs
       SET status = 'failed',
           error_message = $1,
           error_code = $2,
           completed_at = NOW()
       WHERE id = $3`,
      [errorMessage, errorCode, jobId]
    )
  } catch (dbError) {
    console.error('Failed to mark job as failed in database:', dbError)
  }
}

// ============================================================================
// User Notification (Placeholder)
// ============================================================================

/**
 * Notifies user of generation failure.
 * 
 * NOTE: Placeholder implementation. In production, this should send
 * notifications via email, webhook, or in-app notification.
 * 
 * @param merchantId - Merchant ID
 * @param error - Error details
 * @param jobId - Generation job ID
 */
export async function notifyUserOfFailure(
  merchantId: string,
  error: ErrorDetails,
  jobId: string
): Promise<void> {
  // TODO: Implement user notification system
  console.log('Notifying user of failure (placeholder)', {
    merchantId,
    jobId,
    userMessage: error.userMessage,
    suggestedAction: error.suggestedAction,
  })
}

// ============================================================================
// Error Response Formatting
// ============================================================================

/**
 * Formats error for API response.
 * 
 * @param error - Error to format
 * @returns API response object
 */
export function formatErrorResponse(error: Error) {
  const errorDetails = classifyError(error)
  
  return {
    statusCode: getStatusCodeForError(error),
    body: JSON.stringify({
      error: errorDetails.errorCode,
      message: errorDetails.userMessage,
      suggestedAction: errorDetails.suggestedAction,
      isRetryable: errorDetails.isRetryable,
    }),
  }
}

/**
 * Gets appropriate HTTP status code for an error.
 * 
 * @param error - Error to check
 * @returns HTTP status code
 */
export function getStatusCodeForError(error: Error): number {
  const errorName = error.name
  
  if (errorName === 'ValidationException') {
    return 400 // Bad Request
  }
  
  if (errorName === 'AccessDeniedException') {
    return 403 // Forbidden
  }
  
  if (errorName === 'ThrottlingException' || errorName === 'TooManyRequestsException') {
    return 429 // Too Many Requests
  }
  
  if (errorName === 'ServiceUnavailableException') {
    return 503 // Service Unavailable
  }
  
  return 500 // Internal Server Error
}

/**
 * Creates a user-friendly error message for display in UI.
 * 
 * @param error - Error to format
 * @returns User-friendly error message
 */
export function createUserFriendlyMessage(error: Error): string {
  const errorDetails = classifyError(error)
  return `${errorDetails.userMessage} ${errorDetails.suggestedAction}`
}
