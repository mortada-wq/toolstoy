/**
 * Retry Logic with Exponential Backoff
 * 
 * Provides retry functionality for Bedrock API calls with exponential backoff.
 * Handles ThrottlingException and other transient errors automatically.
 */

// ============================================================================
// Types
// ============================================================================

export interface RetryOptions {
  maxRetries?: number
  baseDelay?: number
  maxDelay?: number
  retryableErrors?: string[]
}

export interface RetryResult<T> {
  success: boolean
  result?: T
  error?: Error
  attempts: number
}

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_MAX_RETRIES = 3
const DEFAULT_BASE_DELAY = 2000 // 2 seconds
const DEFAULT_MAX_DELAY = 16000 // 16 seconds

/**
 * Error types that should trigger automatic retry.
 */
const RETRYABLE_ERROR_NAMES = [
  'ThrottlingException',
  'TooManyRequestsException',
  'ServiceUnavailableException',
  'InternalServerException',
  'RequestTimeoutException',
]

// ============================================================================
// Retry with Exponential Backoff
// ============================================================================

/**
 * Retries an async operation with exponential backoff.
 * 
 * Implements exponential backoff: 2s, 4s, 8s (default)
 * Automatically retries on ThrottlingException and other transient errors.
 * 
 * @param operation - Async function to retry
 * @param options - Retry configuration options
 * @returns Result of the operation
 * @throws Error if all retries are exhausted
 * 
 * @example
 * ```typescript
 * const result = await retryWithBackoff(
 *   async () => await invokeTitanImageGenerator(request),
 *   { maxRetries: 3, baseDelay: 2000 }
 * )
 * ```
 */
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES
  const baseDelay = options.baseDelay ?? DEFAULT_BASE_DELAY
  const maxDelay = options.maxDelay ?? DEFAULT_MAX_DELAY
  const retryableErrors = options.retryableErrors ?? RETRYABLE_ERROR_NAMES
  
  let lastError: Error | undefined
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Attempt ${attempt + 1}/${maxRetries + 1}`)
      
      const result = await operation()
      
      if (attempt > 0) {
        console.log(`Operation succeeded after ${attempt} retries`)
      }
      
      return result
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      
      // Check if error is retryable
      const isRetryable = isRetryableError(lastError, retryableErrors)
      
      // If this was the last attempt or error is not retryable, throw
      if (attempt === maxRetries || !isRetryable) {
        console.error(
          `Operation failed after ${attempt + 1} attempts:`,
          lastError.message
        )
        throw lastError
      }
      
      // Calculate delay with exponential backoff: baseDelay * 2^attempt
      const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay)
      
      console.warn(
        `Attempt ${attempt + 1} failed with ${lastError.name}: ${lastError.message}. ` +
        `Retrying in ${delay}ms...`
      )
      
      // Wait before retrying
      await sleep(delay)
    }
  }
  
  // This should never be reached, but TypeScript needs it
  throw lastError || new Error('Operation failed with unknown error')
}

// ============================================================================
// Retry with Result
// ============================================================================

/**
 * Retries an operation and returns a result object instead of throwing.
 * Useful when you want to handle failures gracefully without exceptions.
 * 
 * @param operation - Async function to retry
 * @param options - Retry configuration options
 * @returns Result object with success status and data or error
 */
export async function retryWithResult<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<RetryResult<T>> {
  let attempts = 0
  
  try {
    const result = await retryWithBackoff(operation, options)
    attempts = 1 // If successful on first try
    
    return {
      success: true,
      result,
      attempts,
    }
  } catch (error) {
    const maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES
    attempts = maxRetries + 1
    
    return {
      success: false,
      error: error instanceof Error ? error : new Error(String(error)),
      attempts,
    }
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Checks if an error is retryable based on error name.
 * 
 * @param error - Error to check
 * @param retryableErrors - List of retryable error names
 * @returns True if error should be retried
 */
export function isRetryableError(
  error: Error,
  retryableErrors: string[] = RETRYABLE_ERROR_NAMES
): boolean {
  return retryableErrors.includes(error.name)
}

/**
 * Calculates the delay for a given retry attempt.
 * 
 * @param attempt - Retry attempt number (0-indexed)
 * @param baseDelay - Base delay in milliseconds
 * @param maxDelay - Maximum delay in milliseconds
 * @returns Delay in milliseconds
 */
export function calculateBackoffDelay(
  attempt: number,
  baseDelay: number = DEFAULT_BASE_DELAY,
  maxDelay: number = DEFAULT_MAX_DELAY
): number {
  const delay = baseDelay * Math.pow(2, attempt)
  return Math.min(delay, maxDelay)
}

/**
 * Sleeps for a specified duration.
 * 
 * @param ms - Duration in milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Wraps an operation with retry logic and logs detailed information.
 * 
 * @param operationName - Name of the operation for logging
 * @param operation - Async function to retry
 * @param options - Retry configuration options
 * @returns Result of the operation
 */
export async function retryWithLogging<T>(
  operationName: string,
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  console.log(`Starting operation: ${operationName}`)
  
  const startTime = Date.now()
  
  try {
    const result = await retryWithBackoff(operation, options)
    const duration = Date.now() - startTime
    
    console.log(
      `Operation "${operationName}" completed successfully in ${duration}ms`
    )
    
    return result
  } catch (error) {
    const duration = Date.now() - startTime
    
    console.error(
      `Operation "${operationName}" failed after ${duration}ms:`,
      error instanceof Error ? error.message : String(error)
    )
    
    throw error
  }
}
