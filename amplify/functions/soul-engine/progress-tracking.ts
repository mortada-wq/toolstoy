/**
 * Progress Tracking Updates
 * 
 * Handles updating generation job progress, status, and state tracking
 * in the database throughout the generation lifecycle.
 */

import { query, queryOne } from './database'

// ============================================================================
// Types
// ============================================================================

export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed'

export type GenerationStep =
  | 'initializing'
  | 'analyzing_image'
  | 'processing_template'
  | 'generating_variations'
  | 'uploading_images'
  | 'generating_videos'
  | 'uploading_videos'
  | 'finalizing'
  | 'completed'

export interface ProgressUpdate {
  jobId: string
  currentStep: GenerationStep
  statesGenerated?: string[]
  totalStates?: number
  status?: JobStatus
  errorMessage?: string
  errorCode?: string
  metadata?: Record<string, unknown>
}

export interface JobProgress {
  jobId: string
  status: JobStatus
  currentStep: GenerationStep
  statesGenerated: string[]
  totalStates: number
  progress: number // 0-100
  startedAt: Date
  completedAt?: Date
}

// ============================================================================
// Constants
// ============================================================================

/**
 * Step weights for progress calculation.
 * Total should equal 100.
 */
const STEP_WEIGHTS: Record<GenerationStep, number> = {
  initializing: 5,
  analyzing_image: 10,
  processing_template: 5,
  generating_variations: 30,
  uploading_images: 10,
  generating_videos: 30,
  uploading_videos: 5,
  finalizing: 5,
  completed: 0,
}

// ============================================================================
// Update Current Step
// ============================================================================

/**
 * Updates the current step of a generation job.
 * 
 * NOTE: This is a placeholder implementation. In production, this should
 * update the database with the current step.
 * 
 * @param jobId - Generation job ID
 * @param currentStep - Current step in the generation process
 * 
 * @example
 * ```typescript
 * await updateCurrentStep(jobId, 'generating_variations')
 * ```
 */
export async function updateCurrentStep(
  jobId: string,
  currentStep: GenerationStep
): Promise<void> {
  await query(
    `UPDATE generation_jobs
     SET current_step = $1,
         updated_at = NOW()
     WHERE id = $2`,
    [currentStep, jobId]
  )
  
  console.log('Updated current step', {
    jobId,
    currentStep,
    timestamp: new Date().toISOString(),
  })
  
  // Log to CloudWatch for tracking
  console.log('PROGRESS_UPDATE', {
    jobId,
    currentStep,
    timestamp: new Date().toISOString(),
  })
}

// ============================================================================
// Update States Generated
// ============================================================================

/**
 * Updates the states_generated array incrementally as states complete.
 * 
 * NOTE: This is a placeholder implementation. In production, this should
 * append to the states_generated JSONB array in the database.
 * 
 * @param jobId - Generation job ID
 * @param stateName - Name of the completed state
 * 
 * @example
 * ```typescript
 * await addGeneratedState(jobId, 'idle')
 * await addGeneratedState(jobId, 'thinking')
 * ```
 */
export async function addGeneratedState(
  jobId: string,
  stateName: string
): Promise<void> {
  await query(
    `UPDATE generation_jobs
     SET states_generated = array_append(states_generated, $1),
         updated_at = NOW()
     WHERE id = $2`,
    [stateName, jobId]
  )
  
  console.log('Added generated state', {
    jobId,
    stateName,
    timestamp: new Date().toISOString(),
  })
  
  // Log to CloudWatch for tracking
  console.log('STATE_COMPLETED', {
    jobId,
    stateName,
    timestamp: new Date().toISOString(),
  })
}

/**
 * Updates the states_generated array with multiple states at once.
 * 
 * @param jobId - Generation job ID
 * @param stateNames - Array of completed state names
 */
export async function updateStatesGenerated(
  jobId: string,
  stateNames: string[]
): Promise<void> {
  await query(
    `UPDATE generation_jobs
     SET states_generated = $1,
         updated_at = NOW()
     WHERE id = $2`,
    [stateNames, jobId]
  )
  
  console.log('Updated states generated', {
    jobId,
    stateNames,
    count: stateNames.length,
    timestamp: new Date().toISOString(),
  })
}

// ============================================================================
// Update Job Status
// ============================================================================

/**
 * Sets job status to "completed" when all operations succeed.
 * 
 * NOTE: Placeholder implementation. Should update database in production.
 * 
 * @param jobId - Generation job ID
 * @param metadata - Optional metadata to store with completion
 * 
 * @example
 * ```typescript
 * await markJobAsCompleted(jobId, { totalCost: 0.224 })
 * ```
 */
export async function markJobAsCompleted(
  jobId: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  await query(
    `UPDATE generation_jobs
     SET status = $1,
         current_step = $2,
         metadata = $3,
         completed_at = NOW(),
         updated_at = NOW()
     WHERE id = $4`,
    ['completed', 'completed', metadata ? JSON.stringify(metadata) : null, jobId]
  )
  
  console.log('Marked job as completed', {
    jobId,
    metadata,
    timestamp: new Date().toISOString(),
  })
  
  // Log to CloudWatch for tracking
  console.log('JOB_COMPLETED', {
    jobId,
    metadata,
    timestamp: new Date().toISOString(),
  })
}

/**
 * Sets job status to "failed" when critical operations fail.
 * 
 * NOTE: Placeholder implementation. Should update database in production.
 * 
 * @param jobId - Generation job ID
 * @param errorCode - Error code
 * @param errorMessage - Error message
 * 
 * @example
 * ```typescript
 * await markJobAsFailed(jobId, 'VALIDATION_ERROR', 'Invalid prompt')
 * ```
 */
export async function markJobAsFailed(
  jobId: string,
  errorCode: string,
  errorMessage: string
): Promise<void> {
  await query(
    `UPDATE generation_jobs
     SET status = $1,
         error_code = $2,
         error_message = $3,
         completed_at = NOW(),
         updated_at = NOW()
     WHERE id = $4`,
    ['failed', errorCode, errorMessage, jobId]
  )
  
  console.log('Marked job as failed', {
    jobId,
    errorCode,
    errorMessage,
    timestamp: new Date().toISOString(),
  })
  
  // Log to CloudWatch for tracking
  console.error('JOB_FAILED', {
    jobId,
    errorCode,
    errorMessage,
    timestamp: new Date().toISOString(),
  })
}

/**
 * Updates job status.
 * 
 * @param jobId - Generation job ID
 * @param status - New status
 */
export async function updateJobStatus(
  jobId: string,
  status: JobStatus
): Promise<void> {
  await query(
    `UPDATE generation_jobs
     SET status = $1,
         updated_at = NOW()
     WHERE id = $2`,
    [status, jobId]
  )
  
  console.log('Updated job status', {
    jobId,
    status,
    timestamp: new Date().toISOString(),
  })
}

// ============================================================================
// Comprehensive Progress Update
// ============================================================================

/**
 * Updates multiple progress fields at once.
 * 
 * @param update - Progress update data
 * 
 * @example
 * ```typescript
 * await updateProgress({
 *   jobId: 'job-123',
 *   currentStep: 'generating_videos',
 *   statesGenerated: ['idle', 'thinking'],
 *   totalStates: 4,
 * })
 * ```
 */
export async function updateProgress(update: ProgressUpdate): Promise<void> {
  const setClauses: string[] = []
  const values: unknown[] = []
  let paramIndex = 1
  
  if (update.currentStep !== undefined) {
    setClauses.push(`current_step = $${paramIndex++}`)
    values.push(update.currentStep)
  }
  
  if (update.statesGenerated !== undefined) {
    setClauses.push(`states_generated = $${paramIndex++}`)
    values.push(update.statesGenerated)
  }
  
  if (update.totalStates !== undefined) {
    setClauses.push(`total_states = $${paramIndex++}`)
    values.push(update.totalStates)
  }
  
  if (update.status !== undefined) {
    setClauses.push(`status = $${paramIndex++}`)
    values.push(update.status)
  }
  
  if (update.errorCode !== undefined) {
    setClauses.push(`error_code = $${paramIndex++}`)
    values.push(update.errorCode)
  }
  
  if (update.errorMessage !== undefined) {
    setClauses.push(`error_message = $${paramIndex++}`)
    values.push(update.errorMessage)
  }
  
  if (update.metadata !== undefined) {
    setClauses.push(`metadata = $${paramIndex++}`)
    values.push(JSON.stringify(update.metadata))
  }
  
  setClauses.push('updated_at = NOW()')
  values.push(update.jobId)
  
  await query(
    `UPDATE generation_jobs
     SET ${setClauses.join(', ')}
     WHERE id = $${paramIndex}`,
    values
  )
  
  console.log('Updated progress', {
    ...update,
    timestamp: new Date().toISOString(),
  })
  
  // Log to CloudWatch for tracking
  console.log('PROGRESS_UPDATE', {
    ...update,
    timestamp: new Date().toISOString(),
  })
}

// ============================================================================
// Progress Calculation
// ============================================================================

/**
 * Calculates overall progress percentage based on current step and states.
 * 
 * @param currentStep - Current generation step
 * @param statesGenerated - Number of states generated
 * @param totalStates - Total number of states to generate
 * @returns Progress percentage (0-100)
 */
export function calculateProgress(
  currentStep: GenerationStep,
  statesGenerated: number = 0,
  totalStates: number = 0
): number {
  // Get base progress from step weights
  let progress = 0
  
  // Add weights for all completed steps
  const stepOrder: GenerationStep[] = [
    'initializing',
    'analyzing_image',
    'processing_template',
    'generating_variations',
    'uploading_images',
    'generating_videos',
    'uploading_videos',
    'finalizing',
    'completed',
  ]
  
  const currentStepIndex = stepOrder.indexOf(currentStep)
  
  for (let i = 0; i < currentStepIndex; i++) {
    progress += STEP_WEIGHTS[stepOrder[i]]
  }
  
  // Add partial progress for current step
  if (currentStep === 'generating_videos' && totalStates > 0) {
    // Calculate progress within video generation step
    const videoStepProgress = (statesGenerated / totalStates) * STEP_WEIGHTS.generating_videos
    progress += videoStepProgress
  } else {
    // Add full weight of current step
    progress += STEP_WEIGHTS[currentStep]
  }
  
  return Math.min(Math.round(progress), 100)
}

/**
 * Gets estimated time remaining based on current progress.
 * 
 * @param currentStep - Current generation step
 * @param statesGenerated - Number of states generated
 * @param totalStates - Total number of states to generate
 * @returns Estimated seconds remaining
 */
export function estimateTimeRemaining(
  currentStep: GenerationStep,
  statesGenerated: number = 0,
  totalStates: number = 0
): number {
  // Rough estimates based on typical generation times
  const stepTimes: Record<GenerationStep, number> = {
    initializing: 2,
    analyzing_image: 5,
    processing_template: 2,
    generating_variations: 45, // ~15s per variation × 3
    uploading_images: 5,
    generating_videos: 120, // ~10-15s per video, varies by tier
    uploading_videos: 10,
    finalizing: 2,
    completed: 0,
  }
  
  const stepOrder: GenerationStep[] = [
    'initializing',
    'analyzing_image',
    'processing_template',
    'generating_variations',
    'uploading_images',
    'generating_videos',
    'uploading_videos',
    'finalizing',
    'completed',
  ]
  
  const currentStepIndex = stepOrder.indexOf(currentStep)
  let remainingTime = 0
  
  // Add time for remaining steps
  for (let i = currentStepIndex + 1; i < stepOrder.length; i++) {
    remainingTime += stepTimes[stepOrder[i]]
  }
  
  // Add remaining time for current step
  if (currentStep === 'generating_videos' && totalStates > 0) {
    const remainingStates = totalStates - statesGenerated
    const timePerState = stepTimes.generating_videos / totalStates
    remainingTime += remainingStates * timePerState
  } else {
    remainingTime += stepTimes[currentStep]
  }
  
  return Math.round(remainingTime)
}

// ============================================================================
// Progress Retrieval (Placeholder)
// ============================================================================

/**
 * Gets current progress for a job.
 * 
 * NOTE: Placeholder implementation. Should query database in production.
 * 
 * @param jobId - Generation job ID
 * @returns Job progress information
 */
export async function getJobProgress(jobId: string): Promise<JobProgress | null> {
  const row = await queryOne<{
    id: string
    status: JobStatus
    current_step: GenerationStep
    states_generated: string[]
    total_states: number
    started_at: Date
    completed_at: Date | null
  }>(
    `SELECT id, status, current_step, states_generated, total_states,
            started_at, completed_at
     FROM generation_jobs
     WHERE id = $1`,
    [jobId]
  )
  
  if (!row) {
    console.log('Job not found', { jobId })
    return null
  }
  
  const progress = calculateProgress(
    row.current_step,
    row.states_generated?.length || 0,
    row.total_states
  )
  
  return {
    jobId: row.id,
    status: row.status,
    currentStep: row.current_step,
    statesGenerated: row.states_generated || [],
    totalStates: row.total_states,
    progress,
    startedAt: row.started_at,
    completedAt: row.completed_at || undefined,
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Formats progress for display.
 * 
 * @param progress - Progress percentage (0-100)
 * @returns Formatted progress string
 */
export function formatProgress(progress: number): string {
  return `${progress}%`
}

/**
 * Formats current step for display.
 * 
 * @param step - Current generation step
 * @returns Human-readable step description
 */
export function formatStep(step: GenerationStep): string {
  const stepLabels: Record<GenerationStep, string> = {
    initializing: 'Initializing generation...',
    analyzing_image: 'Analyzing product image...',
    processing_template: 'Processing prompt template...',
    generating_variations: 'Generating character variations...',
    uploading_images: 'Uploading images...',
    generating_videos: 'Generating animation states...',
    uploading_videos: 'Uploading videos...',
    finalizing: 'Finalizing...',
    completed: 'Completed!',
  }
  
  return stepLabels[step]
}

/**
 * Checks if a step is a critical step that should fail the job on error.
 * 
 * @param step - Generation step
 * @returns True if step is critical
 */
export function isCriticalStep(step: GenerationStep): boolean {
  const criticalSteps: GenerationStep[] = [
    'generating_variations',
    'generating_videos',
  ]
  
  return criticalSteps.includes(step)
}

/**
 * Gets the next step in the generation process.
 * 
 * @param currentStep - Current step
 * @returns Next step or undefined if completed
 */
export function getNextStep(currentStep: GenerationStep): GenerationStep | undefined {
  const stepOrder: GenerationStep[] = [
    'initializing',
    'analyzing_image',
    'processing_template',
    'generating_variations',
    'uploading_images',
    'generating_videos',
    'uploading_videos',
    'finalizing',
    'completed',
  ]
  
  const currentIndex = stepOrder.indexOf(currentStep)
  
  if (currentIndex === -1 || currentIndex === stepOrder.length - 1) {
    return undefined
  }
  
  return stepOrder[currentIndex + 1]
}
