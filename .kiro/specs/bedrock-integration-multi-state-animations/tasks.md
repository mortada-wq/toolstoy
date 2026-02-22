# Implementation Plan: Bedrock Integration & Multi-State Animations

## Overview

This implementation plan breaks down the Bedrock integration and multi-state animations feature into actionable coding tasks. The plan follows a 6-phase approach: Infrastructure Setup, Soul Engine Lambda, API Endpoints, Admin Interfaces, Widget Implementation, and Testing. Each task builds incrementally on previous work, with checkpoints to ensure quality and integration.

The implementation uses TypeScript for both backend (Node.js Lambda) and frontend (React) components. Tasks marked with `*` are optional and can be skipped for faster MVP delivery.

## Tasks

- [x] 1. Phase 1: Infrastructure Setup
  - [x] 1.1 Create database migration for multi-state video support
    - Add `video_states` JSONB column to `personas` table with default `{}`
    - Add `approved_variation_id` VARCHAR(255) column to `personas` table
    - Add `generation_metadata` JSONB column to `personas` table with default `{}`
    - Create `generation_jobs` table with columns: id, persona_id, merchant_id, job_type, status, current_step, states_generated, total_states, cost_usd, error_message, error_code, retry_count, metadata, started_at, completed_at, created_at
    - Create `prompt_templates` table with columns: id, name, template, description, is_active, variables, created_by, created_at, updated_at
    - Create `character_variations` table with columns: id, persona_id, generation_job_id, variation_number, image_url, seed, is_approved, created_at
    - Add indexes for performance optimization
    - Add unique constraint on `prompt_templates(is_active)` where `is_active = true`
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6, 13.7_

  - [x] 1.2 Configure AWS S3 bucket for character media storage
    - Create S3 bucket named `toolstoy-character-images` in us-east-1 region
    - Enable versioning for asset recovery
    - Configure CORS policy to allow GET, HEAD, OPTIONS from all origins
    - Set up folder structure: `personas/{persona-id}/avatar.png`, `personas/{persona-id}/variations/{1-3}.png`, `personas/{persona-id}/states/{state-name}.mp4`
    - Configure object metadata defaults (ContentType, CacheControl)
    - _Requirements: 5.1, 5.2_

  - [x] 1.3 Set up CloudFront CDN distribution
    - Create CloudFront distribution with S3 bucket as origin
    - Configure custom domain `cdn.toolstoy.app` with SSL certificate
    - Set cache behavior: redirect HTTP to HTTPS, allow GET/HEAD/OPTIONS, enable compression
    - Configure cache policy with 1 year TTL (31536000 seconds)
    - Set up CORS configuration for cross-origin requests
    - _Requirements: 5.3, 5.7_

  - [x] 1.4 Create IAM policies for Soul Engine Lambda
    - Create execution role for Soul Engine Lambda
    - Attach policy allowing `bedrock:InvokeModel` on Titan Image Generator and Nova Canvas model ARNs
    - Attach policy allowing `s3:PutObject` and `s3:GetObject` on Media_Bucket with path `personas/*`
    - Attach policy allowing `dynamodb:PutItem`, `dynamodb:GetItem`, `dynamodb:UpdateItem` on generation_jobs table
    - Attach policy allowing CloudWatch Logs permissions
    - Ensure no permissions for s3:DeleteObject or IAM modifications
    - _Requirements: 10.1, 10.2, 10.3, 10.5, 10.6, 10.7, 5.4_

  - [x] 1.5 Document AWS Bedrock model access prerequisites
    - Create deployment documentation with step-by-step instructions for enabling Bedrock models
    - Document how to enable Titan Image Generator (amazon.titan-image-generator-v1) in AWS Console
    - Document how to enable Nova Canvas (amazon.nova-canvas-v1:0) in AWS Console
    - Add verification steps to confirm model access in us-east-1 region
    - _Requirements: 14.1, 14.2, 14.5_

- [x] 2. Phase 2: Soul Engine Lambda Implementation
  - [x] 2.1 Create Soul Engine Lambda function with configuration
    - Create Lambda function with Node.js 20.x runtime
    - Configure 3008 MB memory allocation for video processing
    - Set 300 seconds (5 minutes) timeout
    - Set 3072 MB ephemeral storage
    - Add environment variables: VIDEO_MODEL, VIDEO_DURATION, VIDEO_FPS, S3_BUCKET, CDN_DOMAIN, DATABASE_URL
    - Set up handler entry point
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6_

  - [x] 2.2 Implement image analysis utilities
    - Create function to extract dominant colors from product image (return top 3 hex values)
    - Create function to detect product category (electronics, beauty, sports, food, fashion, other)
    - Use image analysis library (sharp or jimp) for processing
    - Return structured data: { colors: string[], category: string }
    - _Requirements: 7.4, 7.5_

  - [x] 2.3 Implement prompt template processing
    - Create function to retrieve active prompt template from database
    - Create function to extract variable placeholders from template
    - Create function to replace template variables with actual values
    - Support variables: {PRODUCT_NAME}, {PRODUCT_TYPE}, {PRODUCT_COLORS}, {CHARACTER_TYPE}, {VIBE_TAGS}
    - Append negative prompt: "blurry, low quality, distorted, deformed, text, watermark"
    - _Requirements: 7.2, 7.3, 7.6_

  - [x] 2.4 Implement Bedrock Titan Image Generator integration
    - Create function to invoke Titan Image Generator with text-to-image task
    - Configure request: resolution 1024x1024, quality "premium", cfgScale 8.0
    - Generate 3 variations with different random seeds
    - Decode base64 image data from response
    - Handle Bedrock API errors (ThrottlingException, ValidationException, ServiceUnavailableException)
    - _Requirements: 1.1, 1.2_

  - [x] 2.5 Implement S3 upload functionality
    - Create function to upload image to S3 with path `personas/{persona-id}/variations/{n}.png`
    - Create function to upload video to S3 with path `personas/{persona-id}/states/{state-name}.mp4`
    - Set ContentType metadata (image/png or video/mp4)
    - Set CacheControl metadata (public, max-age=31536000)
    - Return CDN URL for uploaded asset
    - _Requirements: 1.3, 3.8, 5.2, 5.6_

  - [x] 2.6 Implement generateCharacterVariations handler
    - Accept GenerateCharacterRequest with product image, name, character type, vibe tags
    - Create generation_jobs record with status "processing"
    - Retrieve and process active prompt template
    - Analyze product image for colors and category
    - Generate 3 image variations with unique seeds
    - Upload variations to S3
    - Store variation metadata in character_variations table
    - Update generation_jobs with variation URLs
    - Return GenerateCharacterResponse with jobId and variations
    - _Requirements: 1.1, 1.2, 1.3, 1.6_

  - [ ]* 2.7 Write property test for three variations with unique seeds
    - **Property 1: Three Variations with Unique Seeds**
    - **Validates: Requirements 1.1**
    - Generate random character requests and verify exactly 3 variations with unique seeds

  - [x] 2.8 Implement Bedrock Nova Canvas integration
    - Create function to invoke Nova Canvas with image-to-video task
    - Configure request: duration 6 seconds, fps 24, dimension 1280x720
    - Use approved base image as first frame
    - Apply state-specific motion prompts
    - Decode base64 video data from response
    - _Requirements: 3.1, 3.6, 3.7_

  - [x] 2.9 Implement animation state configuration
    - Define ANIMATION_STATES array with all 12 states
    - Include state metadata: id, name, motionPrompt, tier, triggerConditions
    - Create function to get states for subscription tier (Free: 4, Pro: 8, Enterprise: 12)
    - _Requirements: 3.3, 3.4, 3.5, 3.6_

  - [x] 2.10 Implement generateStateVideos handler
    - Accept GenerateStatesRequest with personaId, approvedImageUrl, subscriptionTier
    - Determine state count based on subscription tier
    - Generate all state videos in parallel using Promise.all
    - Upload videos to S3 with state-specific paths
    - Update persona.video_states JSONB with state name -> CDN URL mappings
    - Update generation_jobs with states_generated array and total_states count
    - Calculate and store total cost
    - Return GenerateStatesResponse with jobId, states, totalCost
    - _Requirements: 3.1, 3.2, 3.8, 3.9, 3.10, 4.1_

  - [ ]* 2.11 Write property test for tier-based state count
    - **Property 9: Tier-Based State Count**
    - **Validates: Requirements 3.3, 3.4, 3.5**
    - Verify correct number of states generated for each subscription tier

  - [ ]* 2.12 Write property test for consistent base image
    - **Property 8: Consistent Base Image for All States**
    - **Validates: Requirements 3.1, 3.2**
    - Verify all state videos use the same approved base image

  - [x] 2.13 Implement retry logic with exponential backoff
    - Create retryWithBackoff utility function
    - Support configurable max retries (default 3) and base delay (default 2000ms)
    - Implement exponential backoff: 2s, 4s, 8s
    - Handle ThrottlingException with automatic retry
    - _Requirements: 1.5, 9.1_

  - [ ]* 2.14 Write property test for retry logic
    - **Property 4: Retry Logic with Exponential Backoff**
    - **Validates: Requirements 1.5, 9.1**
    - Verify retry attempts with correct backoff delays

  - [x] 2.15 Implement cost tracking and rate limiting
    - Create function to calculate generation costs (Titan: $0.008/image, Nova: $0.05/video)
    - Store cost in generation_jobs.cost_usd field
    - Implement rate limiter: 10 generations per merchant per hour
    - Implement regeneration cooldown: 24 hours per character
    - Return 429 status with retry-after when limits exceeded
    - Log costs to CloudWatch for monthly tracking
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.6, 8.7_

  - [ ]* 2.16 Write property test for cost calculation
    - **Property 23: Cost Calculation and Storage**
    - **Validates: Requirements 8.1, 8.2**
    - Verify cost calculation formula for different tier combinations

  - [x] 2.17 Implement error handling and fallback strategies
    - Handle ValidationException: log prompt details, return user-friendly error
    - Handle ServiceUnavailableException: mark job as failed, notify user
    - Handle image generation failure: use default placeholder image after 3 retries
    - Handle partial video generation failure: continue with successful states
    - Store error_message and error_code in generation_jobs
    - _Requirements: 9.2, 9.3, 9.4, 9.5, 9.6_

  - [ ]* 2.18 Write property test for error details storage
    - **Property 33: Error Details Storage**
    - **Validates: Requirements 9.6**
    - Verify error_message and error_code are populated on failures

  - [x] 2.19 Implement progress tracking updates
    - Update generation_jobs.current_step after each major operation
    - Update states_generated array incrementally as states complete
    - Set status to "completed" when all operations succeed
    - Set status to "failed" when critical operations fail
    - _Requirements: 3.10, 4.6, 11.1, 11.2, 11.3_

  - [ ]* 2.20 Write property test for progress tracking
    - **Property 16: Incremental Progress Updates**
    - **Validates: Requirements 4.6, 11.2**
    - Verify current_step updates after each operation

- [ ] 3. Checkpoint - Verify Soul Engine Lambda functionality
  - Run unit tests for Soul Engine functions
  - Test image generation with mock Bedrock responses
  - Test video generation with mock Bedrock responses
  - Verify S3 uploads work correctly
  - Verify database operations complete successfully
  - Ensure all tests pass, ask the user if questions arise

- [x] 4. Phase 3: API Endpoints Implementation
  - [x] 4.1 Create POST /api/bedrock/generate-character endpoint
    - Define route in API Gateway configuration
    - Add Cognito authorization
    - Validate request body (productImage, productName, characterType, vibeTags, merchantId)
    - Invoke Soul Engine Lambda generateCharacterVariations
    - Return response with jobId and variations
    - Add error handling middleware
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [x] 4.2 Create POST /api/bedrock/generate-states endpoint
    - Define route in API Gateway configuration
    - Add Cognito authorization
    - Validate request body (personaId, approvedImageUrl, subscriptionTier)
    - Invoke Soul Engine Lambda generateStateVideos
    - Return response with jobId, states, totalCost, estimatedTime
    - Add error handling middleware
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 4.3 Create GET /api/bedrock/job-status/:jobId endpoint
    - Define route in API Gateway configuration
    - Add Cognito authorization
    - Query generation_jobs table by jobId
    - Return job status, currentStep, statesGenerated, totalStates, errorMessage
    - Handle job not found error
    - _Requirements: 11.1, 11.2, 11.3, 11.7, 11.8_

  - [x] 4.4 Create POST /api/bedrock/approve-variation endpoint
    - Define route in API Gateway configuration
    - Add Cognito authorization
    - Validate request body (personaId, variationId)
    - Update persona record with approved image URL
    - Update character_variations.is_approved to true
    - Set persona status to "active"
    - Return success response with imageUrl
    - _Requirements: 2.3, 2.4_

  - [x] 4.5 Configure CORS and request validation
    - Add CORS configuration to all endpoints
    - Add request body validation schemas
    - Add authentication middleware
    - Add request logging
    - _Requirements: 10.7_

  - [ ]* 4.6 Write integration tests for API endpoints
    - Test generate-character endpoint with valid and invalid requests
    - Test generate-states endpoint with different subscription tiers
    - Test job-status polling
    - Test approve-variation workflow
    - Verify authentication and authorization

- [ ] 5. Phase 4: Admin Interfaces Implementation
  - [ ] 5.1 Update Bedrock Playground for real API integration
    - Connect "Generate 3 Character Variations" button to POST /api/bedrock/generate-character
    - Display loading state during generation
    - Display 3 variations in grid layout with variation number, seed, timestamp
    - Implement variation selection with visual indicator
    - Enable "Make This Character Live" button only when variation is approved
    - Connect "Make This Character Live" to POST /api/bedrock/approve-variation
    - Implement "Regenerate 3 New Variations" with same prompt parameters
    - Display real-time logs from generation process
    - _Requirements: 1.1, 1.4, 2.1, 2.2, 2.3, 2.4, 2.5_

  - [ ] 5.2 Add state video generation to Bedrock Playground
    - Add "Generate Animation States" button after variation approval
    - Connect button to POST /api/bedrock/generate-states
    - Display estimated completion time based on subscription tier
    - Poll GET /api/bedrock/job-status/:jobId every 3 seconds
    - Display progress bar showing states_generated / total_states
    - Display current_step text below progress bar
    - Show success message with state video previews when complete
    - Display error message with retry option on failure
    - _Requirements: 3.1, 3.2, 11.4, 11.5, 11.6, 11.7, 11.8_

  - [ ] 5.3 Implement error display in Bedrock Playground
    - Display user-friendly error messages for all error types
    - Show suggested actions for each error type
    - Display retry-after timestamp for rate limit errors
    - Show remaining cooldown time for regeneration attempts
    - Log technical error details to console
    - _Requirements: 8.4, 9.7_

  - [ ]* 5.4 Write unit tests for Bedrock Playground
    - Test variation display and selection
    - Test approval workflow
    - Test regeneration with parameter preservation
    - Test progress polling
    - Test error display

  - [x] 5.5 Create Prompt Template Manager interface
    - Create page at /admin/prompt-templates
    - Implement template list view with name, description, is_active status
    - Implement template create/edit form with variable placeholder UI
    - Add template preview with sample data substitution
    - Implement active template toggle (deactivates all others)
    - Add validation for template format and variables
    - Display available variables: {PRODUCT_NAME}, {PRODUCT_TYPE}, {PRODUCT_COLORS}, {CHARACTER_TYPE}, {VIBE_TAGS}
    - _Requirements: 7.1, 7.7, 7.8_

  - [ ]* 5.6 Write property test for single active template enforcement
    - **Property 22: Single Active Template Enforcement**
    - **Validates: Requirements 7.7, 7.8**
    - Verify only one template can be active at a time

  - [x] 5.7 Update Character Studio for generation workflow
    - Add product image upload with preview
    - Add product name and brand name input fields
    - Add character type selector (mascot, spokesperson, sidekick, expert)
    - Add vibe tags multi-select
    - Connect "Generate Character" button to POST /api/bedrock/generate-character
    - Display "Toolstizer is cooking your character" message with animated progress
    - Show estimated completion time based on subscription tier
    - Poll job status and display progress
    - Show success message with character preview and available states
    - Provide "View Widget Code" button after completion
    - Display error with "Try Again" and "Upload Custom Image" options on failure
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6, 15.7_

  - [ ]* 5.8 Write unit tests for Character Studio
    - Test image upload and preview
    - Test generation request
    - Test progress polling
    - Test success and error states
    - Test widget code display

- [ ] 6. Checkpoint - Verify admin interfaces
  - Test complete character generation workflow in Bedrock Playground
  - Test prompt template creation and activation
  - Test Character Studio generation flow
  - Verify progress tracking displays correctly
  - Verify error handling works as expected
  - Ensure all tests pass, ask the user if questions arise

- [x] 7. Phase 5: Widget Implementation
  - [x] 7.1 Create widget core structure and character loading
    - Create Widget component with TypeScript interfaces
    - Implement character configuration loading (CharacterConfig interface)
    - Load character image, video states, dominant color, capabilities, subscription tier
    - Initialize widget state (WidgetState interface)
    - Set default dimensions: 480px width × 640px height
    - Support CSS custom properties --chat-width and --chat-height
    - _Requirements: 25.1, 25.2_

  - [x] 7.2 Implement video preloading system
    - Preload all available state videos for current subscription tier on initialization
    - Create video element pool for instant state transitions
    - Handle preload errors gracefully
    - Display loading indicator during preload
    - _Requirements: 6.9_

  - [ ]* 7.3 Write property test for video preloading
    - **Property 39: Video Preloading**
    - **Validates: Requirements 6.9**
    - Verify all tier-appropriate videos are preloaded

  - [x] 7.4 Implement animation state management
    - Create state machine for animation transitions
    - Implement idle state as default with continuous loop
    - Implement state transition logic based on triggers
    - Support one-time animations (greeting, farewell) that return to idle
    - Implement fallback to idle when requested state is unavailable
    - _Requirements: 6.1, 6.2, 6.10_

  - [x] 7.5 Implement state triggers for conversation context
    - Trigger thinking state when AI is generating response
    - Trigger talking state when AI is streaming response
    - Trigger listening state when user is typing (if available)
    - Trigger greeting state on first message (play once, return to idle)
    - Trigger farewell state on conversation end (play once, if available)
    - _Requirements: 6.2, 6.3, 6.4, 6.5, 6.8_

  - [x] 7.6 Implement sentiment-based state transitions
    - Trigger happy state for positive sentiment score > 0.7 (if available)
    - Trigger confused state for confidence score < 0.5 (if available)
    - Implement state priority system (higher priority overrides lower)
    - _Requirements: 6.6, 6.7_

  - [ ]* 7.7 Write property test for state transitions
    - **Property 35: State Transition Based on AI Activity**
    - **Validates: Requirements 6.2, 6.3**
    - Verify correct state transitions for AI activity

  - [ ]* 7.8 Write property test for conditional state availability
    - **Property 36: Conditional State Availability**
    - **Validates: Requirements 6.4, 6.10**
    - Verify fallback to idle for unavailable states

  - [x] 7.9 Implement character color extraction and theming
    - Extract dominant color from character image or metadata
    - Store color in CSS custom property --character-primary
    - Generate UI colors using color-mix() with 3-15% character color
    - Apply character color to: background (3%), borders (8-10%), message bubbles (10%), hover states (15%)
    - Support radial gradient background with 5% character color
    - Implement smooth color transitions (400ms) when character changes
    - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5_

  - [ ]* 7.10 Write property test for character color extraction
    - **Property 40: Character Color Extraction**
    - **Validates: Requirements 16.1, 16.4**
    - Verify color extraction and CSS property storage

  - [ ]* 7.11 Write property test for color mix percentages
    - **Property 41: Color Mix Percentage Range**
    - **Validates: Requirements 16.2**
    - Verify color-mix() uses correct percentage ranges

  - [x] 7.12 Implement minimalist chat container design
    - Use 90% negative space around character content
    - Apply pure white or 98% gray background
    - Add 32px border radius with subtle shadow and backdrop blur
    - Add 1px border using 10% character color mixed with transparent
    - Use smooth cubic-bezier transitions (0.2, 0.9, 0.3, 1)
    - Display controls at 30% opacity, increase to 80% on hover
    - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.5, 17.6, 17.7_

  - [x] 7.13 Implement three position states system
    - Implement intimate state: 100% character scale, 70% chat width
    - Implement balanced state: 80% character scale, 50% chat width (default)
    - Implement ambient state: 40% character scale, 30% chat width
    - Add position control button in character's visual territory
    - Animate position transitions smoothly over 400ms
    - Persist user's position preference in localStorage
    - _Requirements: 18.2, 18.3, 18.4, 18.5, 18.6, 18.7_

  - [ ]* 7.14 Write property test for position state configuration
    - **Property 43: Position State Configuration**
    - **Validates: Requirements 18.2, 18.3, 18.4**
    - Verify correct scale and width for each position state

  - [ ]* 7.15 Write property test for position preference persistence
    - **Property 45: Position Preference Persistence**
    - **Validates: Requirements 18.7**
    - Verify localStorage save and restore

  - [x] 7.16 Implement gallery-quality message bubbles
    - Style user messages: 8% character color background, 24px border radius, no border
    - Style character messages: white background, 1px border (8% character color), 24px border radius
    - Apply subtle box-shadow (2px blur, 2% opacity)
    - Add hover effect: increase border to 30% character color, add 16px shadow with 20% character color
    - Limit message width to 80% of container
    - Use font-weight 400, line-height 1.6, padding 16px 20px
    - Align user messages right, character messages left
    - _Requirements: 19.1, 19.2, 19.3, 19.4, 19.5, 19.6, 19.7_

  - [x] 7.17 Implement capability manifest system
    - Parse character.capabilities manifest on load
    - Validate manifest structure (visual, audio, spatial properties)
    - Support visual capabilities: rotate3D, showImage, playVideo, animation
    - Support audio capabilities: voiceControl, soundEffects, ambientMusic
    - Support spatial capabilities: positionControl, resizeControl, minimizeOption
    - Hide controls for unavailable capabilities
    - Log capability manifest to console for debugging
    - _Requirements: 20.1, 20.6, 23.1, 23.2, 23.3, 23.4, 23.5, 23.6_

  - [ ]* 7.18 Write property test for capability manifest validation
    - **Property 49: Capability Manifest Validation**
    - **Validates: Requirements 23.5**
    - Verify handling of malformed manifests

  - [x] 7.19 Implement dynamic Special Needs Dock
    - Display dock only when character has special capabilities
    - Generate dock with grid layout (auto-fill, minmax 80px, 1fr), 8px gap
    - Display capability controls with icon, label, transparent background
    - Add hover effect: 5% character color background, full-color icon
    - Support capability types: rotate3D, showImage, playVideo, animation, audioClip, arMode
    - Animate dock appearance with dock-rise animation (0.5s ease, translateY 20px to 0)
    - Position dock at bottom with 16px margin, 48px border radius
    - _Requirements: 20.2, 20.3, 20.4, 20.5, 20.6, 20.7, 20.8_

  - [ ]* 7.20 Write property test for conditional dock display
    - **Property 47: Conditional Dock Display**
    - **Validates: Requirements 20.2**
    - Verify dock only appears when capabilities exist

  - [x] 7.21 Implement minimized state with breathing animation
    - Reduce character to 40% of original size when minimized
    - Desaturate character by 50% in minimized state
    - Apply breathing animation: 0.5% scale pulse every 4 seconds
    - Show last message preview in minimized state
    - Display only expand and voice controls as dots until hover
    - Maintain character color theme in minimized state
    - Animate minimize/expand transition over 400ms
    - _Requirements: 21.1, 21.2, 21.3, 21.4, 21.5, 21.6, 21.7_

  - [ ]* 7.22 Write property test for minimized state scale
    - **Property 51: Minimized State Scale**
    - **Validates: Requirements 21.1, 21.2, 21.3**
    - Verify 40% scale, 50% desaturation, breathing animation

  - [x] 7.23 Implement invisible-until-hover controls
    - Display all controls with 1px stroke, line-only icons
    - Show controls at 30% opacity by default
    - Increase opacity to 80% on hover with character color accent
    - Position controls in character's visual territory (top and bottom edges)
    - Provide controls: voice toggle, position adjustment, minimize/expand, close
    - Show voice indicator with waveform animation using character color
    - Hide control labels until hover, show only icons
    - _Requirements: 22.1, 22.2, 22.3, 22.4, 22.5, 22.6, 22.7_

  - [x] 7.24 Implement smooth transitions and animations
    - Use 400ms duration for major state changes (position, minimize, color theme)
    - Use 200ms duration for micro-interactions (hover, control activation)
    - Use 300ms duration for message bubble hover effects
    - Apply cubic-bezier(0.2, 0.9, 0.3, 1) easing for smooth presence
    - Use ease timing for simple animations (dock-rise, breathing)
    - Use CSS transforms (scale, translate) for performance
    - _Requirements: 24.1, 24.2, 24.3, 24.4, 24.5, 24.7_

  - [ ]* 7.25 Write property test for animation timing consistency
    - **Property 52: Animation Timing Consistency**
    - **Validates: Requirements 24.1, 24.2, 24.3**
    - Verify correct durations for different animation types

  - [x] 7.26 Implement responsive design
    - Adapt position states for mobile: intimate (90%), balanced (80%), ambient (60%)
    - Reduce border radius to 24px on screens < 768px
    - Stack controls vertically on screens < 480px
    - Maintain aspect ratio when resizing
    - Support fullscreen mode on mobile devices
    - _Requirements: 25.3, 25.4, 25.5, 25.6, 25.7_

  - [ ]* 7.27 Write property test for responsive position adaptation
    - **Property 55: Responsive Position State Adaptation**
    - **Validates: Requirements 25.3**
    - Verify mobile position state widths

  - [ ]* 7.28 Write unit tests for widget components
    - Test character loading and initialization
    - Test state transitions
    - Test color theming
    - Test position state changes
    - Test capability manifest parsing
    - Test Special Needs Dock rendering
    - Test localStorage persistence
    - Test responsive behavior

- [ ] 8. Checkpoint - Verify widget functionality
  - Test widget loads with character configuration
  - Test all animation state transitions
  - Test color theming with different characters
  - Test position states and persistence
  - Test Special Needs Dock with various capability manifests
  - Test minimized state and breathing animation
  - Test responsive design on different screen sizes
  - Ensure all tests pass, ask the user if questions arise

- [ ] 9. Phase 6: Testing and Integration
  - [ ] 9.1 Write remaining backend property tests
    - [ ]* 9.1.1 Property 2: Image Resolution and Quality
      - **Validates: Requirements 1.2**
      - Verify 1024x1024 resolution and premium quality
    
    - [ ]* 9.1.2 Property 3: S3 Path Structure Consistency
      - **Validates: Requirements 1.3, 3.8, 5.2**
      - Verify correct S3 paths for all asset types
    
    - [ ]* 9.1.3 Property 5: Generation Metadata Completeness
      - **Validates: Requirements 1.6**
      - Verify all metadata fields are populated
    
    - [ ]* 9.1.4 Property 10: State-Specific Motion Prompts
      - **Validates: Requirements 3.6**
      - Verify unique motion prompts for each state
    
    - [ ]* 9.1.5 Property 11: Video Configuration Parameters
      - **Validates: Requirements 3.7**
      - Verify 6 seconds, 24 fps, 1280x720 resolution
    
    - [ ]* 9.1.6 Property 12: Video States JSONB Structure
      - **Validates: Requirements 3.9, 13.2**
      - Verify JSONB structure with state name -> CDN URL
    
    - [ ]* 9.1.7 Property 17: S3 Content-Type Metadata
      - **Validates: Requirements 5.6**
      - Verify ContentType metadata for images and videos
    
    - [ ]* 9.1.8 Property 19: Complete Variable Substitution
      - **Validates: Requirements 7.3, 7.6**
      - Verify all template variables are replaced
    
    - [ ]* 9.1.9 Property 24: Rate Limit Enforcement
      - **Validates: Requirements 8.3, 8.4**
      - Verify 11th request is rejected with 429
    
    - [ ]* 9.1.10 Property 26: Regeneration Cooldown
      - **Validates: Requirements 8.6**
      - Verify 24-hour cooldown enforcement

  - [ ] 9.2 Write remaining frontend property tests
    - [ ]* 9.2.1 Property 37: One-Time Animation Sequence
      - **Validates: Requirements 6.5, 6.8**
      - Verify greeting/farewell play once then return to idle
    
    - [ ]* 9.2.2 Property 38: Sentiment-Based State Transition
      - **Validates: Requirements 6.6, 6.7**
      - Verify happy/confused states based on sentiment
    
    - [ ]* 9.2.3 Property 42: Color Application to UI Elements
      - **Validates: Requirements 16.3, 16.5**
      - Verify all UI elements update with character color
    
    - [ ]* 9.2.4 Property 44: Position State Transition Timing
      - **Validates: Requirements 18.6**
      - Verify 400ms transition timing
    
    - [ ]* 9.2.5 Property 48: Capability Type Support
      - **Validates: Requirements 20.6, 23.2, 23.3, 23.4**
      - Verify all capability types are recognized
    
    - [ ]* 9.2.6 Property 54: CSS Custom Property Support
      - **Validates: Requirements 25.2**
      - Verify --chat-width and --chat-height override defaults
    
    - [ ]* 9.2.7 Property 56: Responsive Border Radius
      - **Validates: Requirements 25.4**
      - Verify border radius reduces on mobile

  - [ ] 9.3 Write end-to-end integration tests
    - [ ]* 9.3.1 Test complete character generation flow
      - Upload product image → Generate variations → Approve variation → Generate states → Verify assets
    
    - [ ]* 9.3.2 Test widget state transition flow
      - Load widget → Send message → Verify thinking → Verify talking → Verify idle
    
    - [ ]* 9.3.3 Test error recovery flow
      - Trigger Bedrock throttling → Verify retry → Verify success or proper failure
    
    - [ ]* 9.3.4 Test rate limiting flow
      - Generate 10 characters → Verify 11th rejected → Wait → Verify success

  - [ ] 9.4 Write unit tests for error handling
    - Test ThrottlingException handling with retry
    - Test ValidationException handling with logging
    - Test ServiceUnavailableException handling
    - Test placeholder image fallback
    - Test partial video generation success
    - Test error message display in UI

  - [ ] 9.5 Perform manual testing
    - Test complete user workflows in Bedrock Playground
    - Test Character Studio generation with real product images
    - Test widget with different characters and subscription tiers
    - Test error scenarios (rate limits, invalid inputs, service errors)
    - Test responsive design on mobile devices
    - Test cross-browser compatibility (Chrome, Firefox, Safari, Edge)

  - [ ] 9.6 Set up monitoring and logging
    - Configure CloudWatch metrics for generation success rate
    - Set up CloudWatch alarms for failure rate > 10%
    - Set up cost tracking alerts for daily cost > $100
    - Configure CDN cache hit rate monitoring
    - Add widget load time metrics
    - Set up error rate monitoring by type

- [ ] 10. Final checkpoint and deployment preparation
  - Verify all unit tests pass (> 80% backend coverage, > 75% frontend coverage)
  - Verify all property tests pass (100 iterations each)
  - Verify all integration tests pass
  - Run TypeScript compiler and fix any errors
  - Run linter and fix any issues
  - Verify performance benchmarks are met
  - Review deployment checklist
  - Update documentation
  - Ensure all tests pass, ask the user if questions arise

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP delivery
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties across all inputs
- Unit tests validate specific examples, edge cases, and error conditions
- Integration tests validate complete user workflows
- Checkpoints ensure incremental validation and quality
- All code examples use TypeScript for type safety
- The implementation follows a 6-phase approach for organized development
- Cost tracking and rate limiting are built-in to prevent runaway expenses
- Error handling includes retry logic, fallbacks, and user-friendly messages
- The widget design emphasizes minimalism, character focus, and smooth animations

## Estimated Timeline

- Phase 1 (Infrastructure): 1-2 days
- Phase 2 (Soul Engine): 3-5 days
- Phase 3 (API Endpoints): 1-2 days
- Phase 4 (Admin Interfaces): 2-3 days
- Phase 5 (Widget): 3-4 days
- Phase 6 (Testing): 2-3 days

Total: 12-19 days for complete implementation

## Cost Estimates

- Free tier: $0.208 per character (3 images + 4 videos)
- Pro tier: $0.408 per character (3 images + 8 videos)
- Enterprise tier: $0.608 per character (3 images + 12 videos)

With 10 generations/hour limit per merchant and 1000 merchants:
- Maximum hourly cost: $6,080 (all Enterprise tier)
- Maximum daily cost: $145,920 (24 hours × $6,080)
- Typical daily cost: ~$5,000-$10,000 (mixed tiers, not all merchants at max)

S3 storage and CloudFront bandwidth costs are additional but minimal compared to generation costs.
