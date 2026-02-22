/**
 * Animation State Configuration
 * 
 * Defines all animation states and their metadata.
 * Provides functions to get states based on subscription tier.
 */

// ============================================================================
// Types
// ============================================================================

export type SubscriptionTier = 'free' | 'pro' | 'enterprise'

export interface AnimationState {
  id: string
  name: string
  motionPrompt: string
  tier: SubscriptionTier
  triggerConditions: string[]
}

// ============================================================================
// Animation States Configuration
// ============================================================================

/**
 * All 12 animation states with metadata.
 * States are ordered by tier and priority.
 */
export const ANIMATION_STATES: AnimationState[] = [
  // Free tier states (4 states)
  {
    id: 'idle',
    name: 'idle',
    motionPrompt: 'Character standing naturally with subtle breathing motion, gentle eye blinks, and minimal head movement. Calm and welcoming presence.',
    tier: 'free',
    triggerConditions: ['default', 'no_activity', 'waiting'],
  },
  {
    id: 'thinking',
    name: 'thinking',
    motionPrompt: 'Character looking slightly upward with thoughtful expression, subtle head tilt, occasional eye movement as if processing information.',
    tier: 'free',
    triggerConditions: ['ai_generating', 'processing_request'],
  },
  {
    id: 'talking',
    name: 'talking',
    motionPrompt: 'Character with animated facial expressions, subtle mouth movements, natural head gestures, and engaged eye contact as if speaking.',
    tier: 'free',
    triggerConditions: ['ai_responding', 'streaming_response'],
  },
  {
    id: 'greeting',
    name: 'greeting',
    motionPrompt: 'Character with warm welcoming gesture, friendly smile, slight wave or nod, inviting body language.',
    tier: 'free',
    triggerConditions: ['first_message', 'conversation_start'],
  },
  
  // Pro tier states (additional 4 states, total 8)
  {
    id: 'happy',
    name: 'happy',
    motionPrompt: 'Character with bright smile, joyful expression, positive energy, slight bounce or celebratory gesture.',
    tier: 'pro',
    triggerConditions: ['positive_sentiment', 'success', 'celebration'],
  },
  {
    id: 'confused',
    name: 'confused',
    motionPrompt: 'Character with puzzled expression, slight head tilt, furrowed brow, questioning gesture as if seeking clarification.',
    tier: 'pro',
    triggerConditions: ['low_confidence', 'unclear_request', 'ambiguous_input'],
  },
  {
    id: 'listening',
    name: 'listening',
    motionPrompt: 'Character with attentive expression, focused eye contact, slight forward lean, nodding subtly as if actively listening.',
    tier: 'pro',
    triggerConditions: ['user_typing', 'receiving_input'],
  },
  {
    id: 'farewell',
    name: 'farewell',
    motionPrompt: 'Character with friendly goodbye gesture, warm smile, gentle wave, positive closing body language.',
    tier: 'pro',
    triggerConditions: ['conversation_end', 'goodbye_message'],
  },
  
  // Enterprise tier states (additional 4 states, total 12)
  {
    id: 'excited',
    name: 'excited',
    motionPrompt: 'Character with enthusiastic expression, energetic movement, wide smile, animated gestures showing excitement.',
    tier: 'enterprise',
    triggerConditions: ['high_positive_sentiment', 'achievement', 'breakthrough'],
  },
  {
    id: 'sad',
    name: 'sad',
    motionPrompt: 'Character with empathetic expression, gentle demeanor, soft eye contact, comforting presence showing understanding.',
    tier: 'enterprise',
    triggerConditions: ['negative_sentiment', 'user_frustration', 'problem_detected'],
  },
  {
    id: 'surprised',
    name: 'surprised',
    motionPrompt: 'Character with surprised expression, raised eyebrows, slight backward movement, eyes widening in reaction.',
    tier: 'enterprise',
    triggerConditions: ['unexpected_input', 'surprising_information'],
  },
  {
    id: 'error',
    name: 'error',
    motionPrompt: 'Character with apologetic expression, slight head shake, concerned look, reassuring gesture acknowledging the issue.',
    tier: 'enterprise',
    triggerConditions: ['error_occurred', 'system_failure', 'request_failed'],
  },
]

// ============================================================================
// Tier Configuration
// ============================================================================

/**
 * Number of states available per subscription tier.
 */
export const TIER_STATE_COUNTS: Record<SubscriptionTier, number> = {
  free: 4,
  pro: 8,
  enterprise: 12,
}

// ============================================================================
// Get States for Tier
// ============================================================================

/**
 * Gets animation states available for a subscription tier.
 * 
 * @param tier - Subscription tier (free, pro, enterprise)
 * @returns Array of animation states for the tier
 */
export function getStatesForTier(tier: SubscriptionTier): AnimationState[] {
  const stateCount = TIER_STATE_COUNTS[tier]
  
  // Return the first N states based on tier
  // States are ordered: Free (4) -> Pro (8) -> Enterprise (12)
  return ANIMATION_STATES.slice(0, stateCount)
}

/**
 * Gets the number of states for a subscription tier.
 * 
 * @param tier - Subscription tier
 * @returns Number of states available
 */
export function getStateCountForTier(tier: SubscriptionTier): number {
  return TIER_STATE_COUNTS[tier]
}

/**
 * Checks if a state is available for a subscription tier.
 * 
 * @param stateName - Name of the state
 * @param tier - Subscription tier
 * @returns True if state is available for the tier
 */
export function isStateAvailableForTier(
  stateName: string,
  tier: SubscriptionTier
): boolean {
  const availableStates = getStatesForTier(tier)
  return availableStates.some((state) => state.name === stateName)
}

/**
 * Gets a state by name.
 * 
 * @param stateName - Name of the state
 * @returns Animation state or undefined if not found
 */
export function getStateByName(stateName: string): AnimationState | undefined {
  return ANIMATION_STATES.find((state) => state.name === stateName)
}

/**
 * Gets all state names for a subscription tier.
 * 
 * @param tier - Subscription tier
 * @returns Array of state names
 */
export function getStateNamesForTier(tier: SubscriptionTier): string[] {
  return getStatesForTier(tier).map((state) => state.name)
}

/**
 * Validates a subscription tier string.
 * 
 * @param tier - Tier string to validate
 * @returns True if valid tier
 */
export function isValidTier(tier: string): tier is SubscriptionTier {
  return tier === 'free' || tier === 'pro' || tier === 'enterprise'
}

/**
 * Gets the minimum tier required for a state.
 * 
 * @param stateName - Name of the state
 * @returns Minimum tier or undefined if state not found
 */
export function getMinimumTierForState(
  stateName: string
): SubscriptionTier | undefined {
  const state = getStateByName(stateName)
  return state?.tier
}
