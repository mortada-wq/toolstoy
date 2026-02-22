# Requirements Document

## Introduction

This document specifies the requirements for integrating AWS Bedrock AI services into Toolstoy to enable automated character image generation and multi-state video animation generation. The system transforms e-commerce product images into AI-powered animated characters with multiple emotional and conversational states. This feature connects the existing Bedrock Playground UI and Prompt Template Manager to actual AWS Bedrock APIs, implements the Soul Engine Lambda for orchestrating generation workflows, and establishes the infrastructure for storing and delivering generated media assets.

## Glossary

- **Bedrock_Service**: AWS Bedrock AI service providing foundation models for image and video generation
- **Soul_Engine**: AWS Lambda function that orchestrates character generation workflows including image creation, video generation, and asset storage
- **Toolstizer**: The product-to-character transformation system that converts product images into animated personas
- **Bedrock_Playground**: Admin interface for testing image and video generation with real Bedrock APIs before production use
- **Prompt_Template_Manager**: Admin interface for creating and managing master prompt templates used in character generation
- **Character_Studio**: User interface where customers create characters from their product images
- **Animation_State**: A specific emotional or conversational video animation (idle, talking, thinking, greeting, happy, confused, excited, listening, sad, surprised, confident, farewell)
- **State_Video**: A 4-6 second looping video file representing one animation state
- **Generation_Job**: A database record tracking the progress of character image and video generation
- **Variation**: One of three generated character image options presented for user approval
- **Base_Image**: The approved character image used as the first frame for all state video generations
- **Media_Bucket**: S3 bucket storing generated character images and state videos
- **CDN**: CloudFront distribution for global delivery of character media assets
- **Subscription_Tier**: User plan level determining number of animation states (Free: 4 states, Pro: 8 states, Enterprise: 12 states)
- **Widget**: Embedded chat interface displaying animated character with state-based animations
- **Titan_Image_Generator**: Amazon Bedrock model for text-to-image generation (model ID: amazon.titan-image-generator-v1)
- **Nova_Canvas**: Amazon Bedrock model for image-to-video generation (model ID: amazon.nova-canvas-v1:0)
- **State_Trigger**: Logic that switches animation states based on conversation context, sentiment, or user actions
- **Living_Palette**: Dynamic color system that extracts and applies character's dominant color throughout the chat interface
- **Position_State**: One of three character proximity modes (intimate, balanced, ambient) that adjusts character scale and chat width
- **Special_Needs_Dock**: Dynamic control panel that appears only when character has special capabilities defined in manifest
- **Capability_Registry**: Character manifest object declaring available visual, audio, and spatial capabilities
- **Breathing_Animation**: Subtle 0.5% scale pulse animation applied to minimized character every 4 seconds

## Requirements

### Requirement 1: Bedrock Image Generation Integration

**User Story:** As an admin, I want to generate character images using AWS Bedrock in the playground, so that I can test and approve character designs before they go live.

#### Acceptance Criteria

1. WHEN an admin uploads a product image and clicks "Generate 3 Character Variations" in Bedrock_Playground, THE Soul_Engine SHALL invoke Titan_Image_Generator three times with different random seeds
2. THE Soul_Engine SHALL generate each variation with resolution 1024x1024 pixels and premium quality setting
3. WHEN Titan_Image_Generator returns base64-encoded image data, THE Soul_Engine SHALL decode the image data and upload each variation to Media_Bucket with path personas/{persona-id}/variations/{variation-id}.png
4. THE Soul_Engine SHALL return all three variation URLs to Bedrock_Playground within 30 seconds of request initiation
5. WHEN any generation fails, THE Soul_Engine SHALL retry the failed variation up to 3 times with exponential backoff before marking it as failed
6. THE Soul_Engine SHALL store generation metadata including seed number, timestamp, and model ID for each variation in Generation_Job record

### Requirement 2: Character Variation Approval Workflow

**User Story:** As an admin, I want to review and approve one of three generated character variations, so that I can ensure quality before making characters live.

#### Acceptance Criteria

1. WHEN Bedrock_Playground receives three variation URLs, THE Bedrock_Playground SHALL display all variations in a grid layout with variation number, seed, and timestamp
2. WHEN an admin clicks on a variation, THE Bedrock_Playground SHALL mark that variation as approved with visual indicator
3. THE Bedrock_Playground SHALL enable "Make This Character Live" button only when one variation is approved
4. WHEN an admin clicks "Make This Character Live", THE Bedrock_Playground SHALL update the persona record with the approved image URL and set status to active
5. WHEN an admin clicks "Regenerate 3 New Variations", THE Bedrock_Playground SHALL initiate a new generation request with the same prompt parameters

### Requirement 3: Multi-State Video Generation

**User Story:** As a user, I want my character to have multiple animation states, so that the character appears more lifelike and responsive during conversations.

#### Acceptance Criteria

1. WHEN a character image is approved, THE Soul_Engine SHALL generate animation state videos using Nova_Canvas image-to-video model
2. THE Soul_Engine SHALL use the approved Base_Image as the first frame for all state video generations to ensure visual consistency
3. THE Soul_Engine SHALL generate 4 animation states for Free tier users (idle, talking, thinking, greeting)
4. THE Soul_Engine SHALL generate 8 animation states for Pro tier users (Free states plus happy, confused, excited, listening)
5. THE Soul_Engine SHALL generate 12 animation states for Enterprise tier users (Pro states plus sad, surprised, confident, farewell)
6. WHEN generating each Animation_State, THE Soul_Engine SHALL use state-specific motion prompts (idle: "gentle breathing minimal movement calm", talking: "animated speaking mouth moving expressive", thinking: "pondering looking up hand on chin")
7. THE Soul_Engine SHALL configure each State_Video with 6 seconds duration, 24 fps, and 1280x720 resolution
8. THE Soul_Engine SHALL upload each State_Video to Media_Bucket with path personas/{persona-id}/states/{state-name}.mp4
9. THE Soul_Engine SHALL store all state video URLs in persona record video_states JSONB column as key-value pairs
10. THE Soul_Engine SHALL update Generation_Job record with states_generated array and total_states count for progress tracking

### Requirement 4: Parallel State Video Generation

**User Story:** As a user, I want character generation to complete quickly, so that I can start using my character without long wait times.

#### Acceptance Criteria

1. THE Soul_Engine SHALL generate all animation state videos in parallel using Promise.all pattern
2. WHEN generating 4 states, THE Soul_Engine SHALL complete all video generations within 5 minutes
3. WHEN generating 8 states, THE Soul_Engine SHALL complete all video generations within 8 minutes
4. WHEN generating 12 states, THE Soul_Engine SHALL complete all video generations within 12 minutes
5. WHEN any state video generation fails, THE Soul_Engine SHALL retry that specific state up to 3 times without blocking other state generations
6. THE Soul_Engine SHALL update Generation_Job current_step field after each state completes for real-time progress tracking

### Requirement 5: S3 Storage and CloudFront CDN Infrastructure

**User Story:** As a developer, I want generated images and videos stored in S3 with CDN delivery, so that media assets load quickly for users worldwide.

#### Acceptance Criteria

1. THE Media_Bucket SHALL be created in AWS region us-east-1 with bucket name toolstoy-character-images
2. THE Media_Bucket SHALL have folder structure personas/{persona-id}/avatar.png for static images and personas/{persona-id}/states/{state-name}.mp4 for videos
3. THE CDN SHALL be configured with Media_Bucket as origin and domain cdn.toolstoy.app
4. THE Soul_Engine SHALL have IAM permissions s3:PutObject and s3:GetObject on Media_Bucket
5. THE CDN SHALL have IAM permission s3:GetObject on Media_Bucket for public read access
6. WHEN Soul_Engine uploads media to S3, THE Soul_Engine SHALL set ContentType metadata (image/png for images, video/mp4 for videos)
7. THE CDN SHALL cache media assets with 1 year expiration for optimal performance

### Requirement 6: Widget State Animation Triggering

**User Story:** As an end user, I want the character to change animations based on conversation context, so that interactions feel natural and engaging.

#### Acceptance Criteria

1. THE Widget SHALL display idle state video in continuous loop when no conversation activity occurs
2. WHEN AI is generating a response, THE Widget SHALL switch to thinking state video
3. WHEN AI is streaming a response, THE Widget SHALL switch to talking state video
4. WHEN user is typing a message, THE Widget SHALL switch to listening state video (if available in Subscription_Tier)
5. WHEN first message is sent, THE Widget SHALL play greeting state video once then return to idle
6. WHEN AI response has positive sentiment score above 0.7, THE Widget SHALL switch to happy state video (if available in Subscription_Tier)
7. WHEN AI response has confidence score below 0.5, THE Widget SHALL switch to confused state video (if available in Subscription_Tier)
8. WHEN conversation ends, THE Widget SHALL play farewell state video once (if available in Subscription_Tier) then return to idle
9. THE Widget SHALL preload all available state videos on initialization to enable instant state transitions
10. WHEN a state video is not available for current Subscription_Tier, THE Widget SHALL fall back to idle state video

### Requirement 7: Prompt Template System Integration

**User Story:** As an admin, I want to create master prompt templates that apply to all character generations, so that I can maintain consistent quality and style across all characters.

#### Acceptance Criteria

1. THE Prompt_Template_Manager SHALL allow admins to create prompt templates with variable placeholders {PRODUCT_NAME}, {PRODUCT_TYPE}, {PRODUCT_COLORS}, {CHARACTER_TYPE}, {VIBE_TAGS}
2. WHEN Soul_Engine generates character images, THE Soul_Engine SHALL retrieve the active prompt template from database
3. THE Soul_Engine SHALL replace all template variables with actual values from product analysis and user input
4. THE Soul_Engine SHALL analyze uploaded product image to extract dominant colors using image analysis
5. THE Soul_Engine SHALL detect product category (electronics, beauty, sports, food, fashion) from image features
6. THE Soul_Engine SHALL construct final prompt by combining template with extracted product data
7. THE Prompt_Template_Manager SHALL enforce only one active template at a time using database unique constraint
8. WHEN admin saves a new template as active, THE Prompt_Template_Manager SHALL deactivate all other templates

### Requirement 8: Cost Management and Rate Limiting

**User Story:** As a business owner, I want to control generation costs and prevent abuse, so that the service remains profitable.

#### Acceptance Criteria

1. THE Soul_Engine SHALL track generation costs in Generation_Job record (Titan_Image_Generator: $0.008 per image, Nova_Canvas: $0.05 per video)
2. THE Soul_Engine SHALL calculate total cost per character (Free: $0.208, Pro: $0.408, Enterprise: $0.608) and store in Generation_Job
3. THE Soul_Engine SHALL enforce rate limit of 10 character generations per merchant per hour
4. WHEN rate limit is exceeded, THE Soul_Engine SHALL return error with retry-after timestamp
5. THE Soul_Engine SHALL cache generated images and videos to prevent regeneration on character edits
6. THE Soul_Engine SHALL allow manual regeneration with 24-hour cooldown period per character
7. THE Soul_Engine SHALL log all generation costs to CloudWatch for monthly cost tracking and alerting

### Requirement 9: Error Handling and Fallback Strategies

**User Story:** As a user, I want character generation to handle errors gracefully, so that I receive helpful feedback when issues occur.

#### Acceptance Criteria

1. WHEN Bedrock_Service returns ThrottlingException, THE Soul_Engine SHALL retry request with exponential backoff starting at 2 seconds
2. WHEN Bedrock_Service returns ValidationException, THE Soul_Engine SHALL log prompt details and return user-friendly error message
3. WHEN Bedrock_Service returns ServiceUnavailableException, THE Soul_Engine SHALL mark Generation_Job as failed and notify user to retry later
4. WHEN image generation fails after 3 retries, THE Soul_Engine SHALL use default placeholder image for character type
5. WHEN video generation fails for specific state, THE Soul_Engine SHALL continue generating remaining states and mark failed state in video_states JSONB
6. THE Soul_Engine SHALL store error_message and error_code in Generation_Job for debugging
7. THE Bedrock_Playground SHALL display user-friendly error messages with suggested actions when generation fails
8. THE Character_Studio SHALL allow manual image upload as alternative when automated generation fails

### Requirement 10: IAM Permissions and Security

**User Story:** As a security engineer, I want proper IAM permissions configured, so that services have least-privilege access to AWS resources.

#### Acceptance Criteria

1. THE Soul_Engine SHALL have IAM policy allowing bedrock:InvokeModel action on Titan_Image_Generator and Nova_Canvas model ARNs
2. THE Soul_Engine SHALL have IAM policy allowing s3:PutObject and s3:GetObject actions on Media_Bucket ARN with path personas/*
3. THE Soul_Engine SHALL have IAM policy allowing dynamodb:PutItem, dynamodb:GetItem, dynamodb:UpdateItem on Generation_Job table
4. THE CDN SHALL have IAM policy allowing s3:GetObject action on Media_Bucket for public content delivery
5. THE Soul_Engine SHALL not have permissions to delete objects from Media_Bucket
6. THE Soul_Engine SHALL not have permissions to modify IAM policies or create AWS resources
7. THE Bedrock_Service SHALL be accessed only from Soul_Engine Lambda, not directly from frontend

### Requirement 11: Generation Progress Tracking

**User Story:** As a user, I want to see real-time progress of character generation, so that I know the system is working and how long to wait.

#### Acceptance Criteria

1. THE Soul_Engine SHALL create Generation_Job record with status "processing" when generation starts
2. THE Soul_Engine SHALL update Generation_Job current_step field with descriptive text ("Generating character image", "Generating idle animation", "Generating talking animation")
3. THE Soul_Engine SHALL update Generation_Job states_generated array after each state video completes
4. THE Character_Studio SHALL poll Generation_Job status every 3 seconds while status is "processing"
5. THE Character_Studio SHALL display progress bar showing states_generated count divided by total_states count
6. THE Character_Studio SHALL display current_step text below progress bar
7. WHEN Generation_Job status changes to "completed", THE Character_Studio SHALL stop polling and display success message
8. WHEN Generation_Job status changes to "failed", THE Character_Studio SHALL stop polling and display error_message with retry option

### Requirement 12: Lambda Configuration for Video Processing

**User Story:** As a developer, I want Soul Engine Lambda properly configured for video processing, so that generation operations complete successfully without timeouts or memory errors.

#### Acceptance Criteria

1. THE Soul_Engine SHALL be configured with 3008 MB memory allocation for video processing operations
2. THE Soul_Engine SHALL be configured with 300 seconds (5 minutes) timeout for multi-state generation workflows
3. THE Soul_Engine SHALL be configured with 3072 MB ephemeral storage for temporary video file processing
4. THE Soul_Engine SHALL have environment variable VIDEO_MODEL set to "nova-canvas"
5. THE Soul_Engine SHALL have environment variable VIDEO_DURATION set to "6"
6. THE Soul_Engine SHALL have environment variable VIDEO_FPS set to "24"
7. THE Soul_Engine SHALL log memory usage and execution time to CloudWatch for performance monitoring

### Requirement 13: Database Schema for Multi-State Videos

**User Story:** As a developer, I want proper database schema for storing video state URLs, so that the system can efficiently retrieve and display animations.

#### Acceptance Criteria

1. THE personas table SHALL have video_states column of type JSONB with default value empty JSON object
2. THE video_states column SHALL store key-value pairs where key is state name and value is CDN URL
3. THE Generation_Job table SHALL have states_generated column of type TEXT array with default empty array
4. THE Generation_Job table SHALL have total_states column of type INTEGER with default value 4
5. THE Generation_Job table SHALL have error_message column of type TEXT for storing failure details
6. THE Generation_Job table SHALL have cost_usd column of type DECIMAL for tracking generation costs
7. THE personas table SHALL have image_url column of type VARCHAR(500) for storing approved character image URL

### Requirement 14: Bedrock Model Access Prerequisites

**User Story:** As a developer, I want to ensure Bedrock model access is enabled, so that API calls succeed in production.

#### Acceptance Criteria

1. THE Titan_Image_Generator model SHALL be enabled in AWS Bedrock console for us-east-1 region before deployment
2. THE Nova_Canvas model SHALL be enabled in AWS Bedrock console for us-east-1 region before deployment
3. THE Soul_Engine SHALL verify model access on first invocation and log warning if models are not accessible
4. WHEN model access is not enabled, THE Soul_Engine SHALL return clear error message instructing admin to enable models in AWS console
5. THE deployment documentation SHALL include step-by-step instructions for enabling Bedrock model access

### Requirement 15: Character Studio User Workflow

**User Story:** As a user, I want a simple workflow to create animated characters from my products, so that I can quickly add AI chat to my store.

#### Acceptance Criteria

1. WHEN user uploads product image in Character_Studio, THE Character_Studio SHALL display image preview with product name and brand name input fields
2. WHEN user clicks "Generate Character", THE Character_Studio SHALL send request to Soul_Engine with product image, name, and selected character type
3. THE Character_Studio SHALL display "Toolstizer is cooking your character" message with animated progress indicator
4. THE Character_Studio SHALL show estimated completion time based on Subscription_Tier (Free: 3-5 minutes, Pro: 6-8 minutes, Enterprise: 9-12 minutes)
5. WHEN generation completes, THE Character_Studio SHALL display success message with preview of character and available animation states
6. THE Character_Studio SHALL provide "View Widget Code" button to access embed code for the generated character
7. WHEN generation fails, THE Character_Studio SHALL display error message with "Try Again" and "Upload Custom Image" options

### Requirement 16: Character-Aware Color System

**User Story:** As an end user, I want the chat interface to adapt its colors based on the active character, so that each character feels unique and the interface feels cohesive.

#### Acceptance Criteria

1. THE Widget SHALL extract the character's dominant color from the character image or metadata
2. THE Widget SHALL generate UI colors using color-mix() with 3-15% of character color mixed with white/gray
3. THE Widget SHALL apply character color to: background (3% tint), borders (8-10% tint), message bubbles (10% opacity), hover states (15% tint)
4. THE Widget SHALL store character color in CSS custom property --character-primary
5. WHEN character changes, THE Widget SHALL smoothly transition all color-dependent elements over 400ms
6. THE Widget SHALL support radial gradient background emanating from character position using 5% character color

### Requirement 17: Minimalist Chat Container Design

**User Story:** As an end user, I want a clean, distraction-free chat interface, so that I can focus on the character and conversation.

#### Acceptance Criteria

1. THE Widget SHALL use 90% negative space around character content
2. THE Widget SHALL have no decorative UI elements that don't serve the character or conversation
3. THE Widget SHALL use pure white or 98% gray background as infinite canvas
4. THE Widget SHALL apply 32px border radius with subtle shadow and backdrop blur
5. THE Widget SHALL have 1px border using 10% character color mixed with transparent
6. THE Widget SHALL use smooth cubic-bezier transitions (0.2, 0.9, 0.3, 1) for all state changes
7. THE Widget SHALL display controls at 30% opacity, increasing to 80% on hover

### Requirement 18: Three Position States System

**User Story:** As an end user, I want to adjust how close the character appears, so that I can customize my interaction experience.

#### Acceptance Criteria

1. THE Widget SHALL support three position states: intimate, balanced, ambient
2. WHEN in intimate state, THE Widget SHALL display character at 100% scale with 70% chat width
3. WHEN in balanced state, THE Widget SHALL display character at 80% scale with 50% chat width (default)
4. WHEN in ambient state, THE Widget SHALL display character at 40% scale with 30% chat width
5. THE Widget SHALL provide position control button in character's visual territory
6. THE Widget SHALL animate position transitions smoothly over 400ms
7. THE Widget SHALL persist user's position preference in localStorage

### Requirement 19: Gallery-Quality Message Bubbles

**User Story:** As an end user, I want beautiful message styling, so that conversations feel premium and artistic.

#### Acceptance Criteria

1. THE Widget SHALL style user messages with 8% character color background, 24px border radius, no border
2. THE Widget SHALL style character messages with white background, 1px border using 8% character color, 24px border radius
3. THE Widget SHALL apply subtle box-shadow to messages (2px blur, 2% opacity)
4. WHEN hovering character messages, THE Widget SHALL increase border color to 30% character color and add 16px shadow with 20% character color
5. THE Widget SHALL limit message width to 80% of container
6. THE Widget SHALL use font-weight 400, line-height 1.6, padding 16px 20px for all messages
7. THE Widget SHALL align user messages to right, character messages to left

### Requirement 20: Dynamic Special Needs Dock

**User Story:** As an end user, I want to access character-specific capabilities easily, so that I can use special features when needed.

#### Acceptance Criteria

1. THE Widget SHALL read character.capabilities manifest to determine available features
2. THE Widget SHALL display Special_Needs_Dock only when character has special capabilities
3. THE Widget SHALL generate dock with grid layout (auto-fill, minmax 80px, 1fr) and 8px gap
4. THE Widget SHALL display capability controls with icon, label, and transparent background
5. WHEN hovering capability control, THE Widget SHALL apply 5% character color background and reveal full-color icon
6. THE Widget SHALL support these capability types: rotate3D, showImage, playVideo, animation, audioClip, arMode
7. THE Widget SHALL animate dock appearance with dock-rise animation (0.5s ease, translateY 20px to 0)
8. THE Widget SHALL position dock at bottom of chat with 16px margin and 48px border radius

### Requirement 21: Minimized State with Breathing Animation

**User Story:** As an end user, I want the character to remain present when minimized, so that I know it's still available.

#### Acceptance Criteria

1. THE Widget SHALL reduce to 40% of original size when minimized
2. THE Widget SHALL desaturate character by 50% in minimized state
3. THE Widget SHALL apply Breathing_Animation: 0.5% scale pulse every 4 seconds
4. THE Widget SHALL show last message preview in minimized state
5. THE Widget SHALL display only expand and voice controls in minimized state as dots until hover
6. THE Widget SHALL maintain character color theme in minimized state
7. THE Widget SHALL animate minimize/expand transition over 400ms

### Requirement 22: Invisible-Until-Hover Controls

**User Story:** As an end user, I want controls to stay out of the way, so that the character remains the focus.

#### Acceptance Criteria

1. THE Widget SHALL display all controls with 1px stroke, line-only icons
2. THE Widget SHALL show controls at 30% opacity by default
3. WHEN hovering controls, THE Widget SHALL increase opacity to 80% and apply character color accent
4. THE Widget SHALL position controls in character's visual territory (top and bottom edges)
5. THE Widget SHALL provide these controls: voice toggle, position adjustment, minimize/expand, close
6. THE Widget SHALL show voice indicator with subtle waveform animation using character color at varying opacities
7. THE Widget SHALL hide control labels until hover, showing only icons

### Requirement 23: Character Capability Registry System

**User Story:** As a developer, I want characters to declare their capabilities, so that the chat interface can adapt automatically.

#### Acceptance Criteria

1. THE Widget SHALL accept character.capabilities object with visual, audio, and spatial properties
2. THE Widget SHALL support visual capabilities: rotate3D, showImage, animation with configuration options
3. THE Widget SHALL support audio capabilities: voiceControl, soundEffects, ambientMusic
4. THE Widget SHALL support spatial capabilities: positionControl, resizeControl, minimizeOption
5. THE Widget SHALL validate capability manifest on character load
6. WHEN capability is unavailable, THE Widget SHALL hide corresponding control
7. THE Widget SHALL log capability manifest to console for debugging

### Requirement 24: Smooth State Transitions and Animations

**User Story:** As an end user, I want all interface changes to feel smooth and natural, so that the experience feels polished.

#### Acceptance Criteria

1. THE Widget SHALL use 400ms duration for major state changes (position, minimize, color theme)
2. THE Widget SHALL use 200ms duration for micro-interactions (hover, control activation)
3. THE Widget SHALL use 300ms duration for message bubble hover effects
4. THE Widget SHALL apply cubic-bezier(0.2, 0.9, 0.3, 1) easing for smooth presence
5. THE Widget SHALL use ease timing for simple animations (dock-rise, breathing)
6. THE Widget SHALL preload all animation assets to prevent jank
7. THE Widget SHALL use CSS transforms for performance (scale, translate) instead of width/height

### Requirement 25: Responsive Chat Container Sizing

**User Story:** As an end user, I want the chat to work on different screen sizes, so that I can use it on any device.

#### Acceptance Criteria

1. THE Widget SHALL have default dimensions 480px width × 640px height
2. THE Widget SHALL support CSS custom properties --chat-width and --chat-height for customization
3. THE Widget SHALL adapt position states for mobile: intimate (90% width), balanced (80% width), ambient (60% width)
4. THE Widget SHALL reduce border radius to 24px on screens smaller than 768px
5. THE Widget SHALL stack controls vertically on screens smaller than 480px
6. THE Widget SHALL maintain aspect ratio when resizing
7. THE Widget SHALL support fullscreen mode on mobile devices
