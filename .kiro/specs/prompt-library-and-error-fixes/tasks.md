# Implementation Plan: Prompt Library & Error Fixes

## Overview

This implementation plan breaks down the Prompt Library & Error Fixes feature into discrete coding tasks. The feature enhances the Toolstoy Bedrock integration by fixing critical image generation errors and implementing a comprehensive prompt library management system.

The implementation follows this sequence:
1. Database migration for prompt tracking columns
2. Soul Engine enhancements for template validation, error logging, and usage tracking
3. API endpoints for prompt template CRUD operations
4. Admin UI components for template management and testing
5. Property-based tests for correctness validation

## Tasks

- [ ] 1. Database Migration for Prompt Tracking
  - [ ] 1.1 Create migration script to add prompt tracking columns
    - Add `prompt_template_id` column to `personas` table (UUID, nullable, foreign key to prompt_templates)
    - Add `prompt_used` column to `generation_jobs` table (TEXT, stores processed prompt)
    - Add `prompt_template_id` column to `generation_jobs` table (UUID, nullable, foreign key to prompt_templates)
    - Add `parent_template_id` column to `prompt_templates` table (UUID, nullable, foreign key to prompt_templates)
    - Create indexes on `personas(prompt_template_id)`, `generation_jobs(prompt_template_id)`, and `prompt_templates(parent_template_id)`
    - Update existing default template with `parent_template_id = NULL` and `version = 1`
    - Ensure migration is idempotent (use IF NOT EXISTS)
    - _Requirements: 2.1, 2.4, 2.5, 2.6, 7.3, 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7_
  
  - [ ]* 1.2 Write property test for migration idempotency
    - **Property 29: Migration Idempotency**
    - **Validates: Requirements 10.6**

- [ ] 2. Soul Engine Template Validation and Error Handling
  - [ ] 2.1 Implement template variable validation in prompt-template.ts
    - Create `validateTemplateVariables()` function that checks for all required variables (PRODUCT_NAME, CHARACTER_TYPE, PRODUCT_COLORS, VIBE_TAGS, PRODUCT_TYPE)
    - Return validation result with `valid` boolean and `missing_variables` array
    - Validate variable format matches `{VARIABLE_NAME}` pattern
    - Extract and return list of unrecognized variables as warnings
    - _Requirements: 1.6, 1.7, 5.1, 5.2, 5.3, 5.4_
  
  - [ ]* 2.2 Write property test for missing variable error reporting
    - **Property 2: Missing Variable Error Reporting**
    - **Validates: Requirements 1.7, 5.2**
  
  - [ ]* 2.3 Write property test for template variable validation
    - **Property 13: Template Variable Validation**
    - **Validates: Requirements 1.6**
  
  - [ ] 2.4 Implement Bedrock request validation in error-handling.ts
    - Create `validateBedrockRequest()` function that validates prompt (non-empty, max 10000 chars) and dimensions (512-2048 pixels)
    - Return validation result with `valid` boolean and `errors` array
    - _Requirements: 1.4_
  
  - [ ]* 2.5 Write property test for parameter validation before API call
    - **Property 11: Parameter Validation Before API Call**
    - **Validates: Requirements 1.4**
  
  - [ ] 2.6 Enhance Bedrock error logging in error-handling.ts
    - Create `BedrockError` interface with code, message, statusCode, requestId, timestamp
    - Create `logBedrockError()` function that logs all error details plus context (jobId, personaId, merchantId, templateId)
    - Ensure all required fields are logged for debugging
    - _Requirements: 1.2, 9.3_
  
  - [ ]* 2.7 Write property test for complete error logging
    - **Property 1: Complete Error Logging**
    - **Validates: Requirements 1.2, 9.3**
  
  - [ ] 2.8 Implement retry logic with exponential backoff in bedrock-titan.ts
    - Add retry logic for Bedrock API throttling errors (429)
    - Implement exponential backoff: 1s, 2s, 4s delays
    - Retry up to 3 times before failing
    - Log each retry attempt
    - _Requirements: 1.5_
  
  - [ ]* 2.9 Write property test for retry with exponential backoff
    - **Property 12: Retry with Exponential Backoff**
    - **Validates: Requirements 1.5**

- [ ] 3. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 4. Soul Engine Template Usage Tracking
  - [ ] 4.1 Implement template usage tracking functions in prompt-template.ts
    - Create `recordTemplateUsage()` function that updates generation_jobs with prompt_template_id and prompt_used
    - Create `recordPersonaTemplate()` function that updates personas with prompt_template_id
    - Create `retrievePromptTemplateById()` function for retrieving templates by ID (not just active)
    - _Requirements: 3.1, 3.2, 3.3_
  
  - [ ]* 4.2 Write property test for template usage tracking
    - **Property 4: Template Usage Tracking**
    - **Validates: Requirements 3.1, 3.2**
  
  - [ ]* 4.3 Write property test for persona template recording
    - **Property 15: Persona Template Recording**
    - **Validates: Requirements 3.3**
  
  - [ ] 4.4 Integrate usage tracking into handler.ts
    - Update `handleGenerateCharacterVariations()` to call `recordTemplateUsage()` after template processing
    - Update `handleGenerateCharacterVariations()` to call `recordPersonaTemplate()` on successful completion
    - Add template ID and name to generation logs
    - _Requirements: 3.1, 3.2, 3.3, 9.1_
  
  - [ ] 4.5 Implement generation logging in handler.ts
    - Log template retrieval (template ID and name)
    - Log unreplaced placeholders after variable substitution
    - Log execution timing for each step (prompt processing, Bedrock call, S3 upload)
    - Log cost information for successful generations
    - _Requirements: 9.1, 9.2, 9.5, 9.6_
  
  - [ ]* 4.6 Write property test for generation logging completeness
    - **Property 7: Generation Logging Completeness**
    - **Validates: Requirements 9.1, 9.2, 9.5, 9.6**

- [ ] 5. API Endpoints for Prompt Template Management
  - [ ] 5.1 Create prompt template CRUD handlers in api-bedrock/handler.ts
    - Implement GET /api/prompt-templates (list all templates with search, filter, sort)
    - Implement GET /api/prompt-templates/:id (get specific template)
    - Implement GET /api/prompt-templates/active (get active template)
    - Implement POST /api/prompt-templates (create new template)
    - Implement PUT /api/prompt-templates/:id (update template, creates new version if template text changes)
    - Implement DELETE /api/prompt-templates/:id (delete template, prevent if active)
    - All endpoints require Cognito authentication and admin role
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.9_
  
  - [ ]* 5.2 Write property test for authentication requirement
    - **Property 27: Authentication Requirement**
    - **Validates: Requirements 8.9**
  
  - [ ]* 5.3 Write property test for active template deletion prevention
    - **Property 19: Active Template Deletion Prevention**
    - **Validates: Requirements 4.9**
  
  - [ ] 5.4 Implement template activation endpoint
    - Implement POST /api/prompt-templates/:id/activate (set template as active)
    - Ensure atomic transaction: deactivate all templates, activate specified template
    - Return previous active template ID in response
    - _Requirements: 8.7, 8.11_
  
  - [ ]* 5.5 Write property test for single active template constraint
    - **Property 3: Single Active Template Constraint**
    - **Validates: Requirements 2.2, 2.3, 7.7, 8.11**
  
  - [ ] 5.6 Implement template testing endpoint
    - Implement POST /api/prompt-templates/:id/test (test template with sample data)
    - Process template with provided variable values
    - Return processed prompt and validation result
    - Do not invoke Bedrock API (just validate and process)
    - _Requirements: 8.8_
  
  - [ ] 5.7 Implement template validation in API handlers
    - Validate required fields (name, template, description) on create/update
    - Validate template contains all required variables
    - Validate variable format {VARIABLE_NAME}
    - Validate template length (min 50 chars, max 10000 chars)
    - Validate name uniqueness
    - Return all validation errors in response
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_
  
  - [ ]* 5.8 Write property test for template validation completeness
    - **Property 5: Template Validation Completeness**
    - **Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7**
  
  - [ ]* 5.9 Write property test for template name uniqueness
    - **Property 23: Template Name Uniqueness**
    - **Validates: Requirements 5.6**
  
  - [ ]* 5.10 Write property test for input validation error messages
    - **Property 28: Input Validation Error Messages**
    - **Validates: Requirements 8.10**

- [ ] 6. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. API Endpoints for Template Versioning
  - [ ] 7.1 Implement template versioning logic in PUT handler
    - When template text changes, create new template record with incremented version
    - Set parent_template_id to original template ID
    - Set is_active to false for new version
    - Preserve original template record unchanged
    - _Requirements: 7.1, 7.2, 7.3_
  
  - [ ]* 7.2 Write property test for template versioning
    - **Property 6: Template Versioning**
    - **Validates: Requirements 7.2, 7.3**
  
  - [ ]* 7.3 Write property test for initial version assignment
    - **Property 25: Initial Version Assignment**
    - **Validates: Requirements 7.1**
  
  - [ ]* 7.4 Write property test for historical template preservation
    - **Property 14: Historical Template Preservation**
    - **Validates: Requirements 2.7**

- [ ] 8. API Endpoints for Template Analytics
  - [ ] 8.1 Implement template analytics endpoint
    - Implement GET /api/prompt-templates/:id/analytics (get usage statistics)
    - Calculate total_generations, successful_generations, failed_generations from generation_jobs
    - Calculate success_rate (successful / total)
    - Calculate avg_cost_usd (sum of cost_usd / successful)
    - Calculate avg_generation_time_ms from generation_jobs
    - Support date range filtering via query parameters
    - _Requirements: 13.1, 13.2, 13.3, 13.4_
  
  - [ ]* 8.2 Write property test for analytics calculation accuracy
    - **Property 9: Analytics Calculation Accuracy**
    - **Validates: Requirements 13.1, 13.2, 13.3, 13.4**
  
  - [ ]* 8.3 Write property test for generation count tracking
    - **Property 16: Generation Count Tracking**
    - **Validates: Requirements 3.7**

- [ ] 9. API Endpoints for Template Export and Import
  - [ ] 9.1 Implement template export endpoint
    - Implement POST /api/prompt-templates/export (export templates as JSON)
    - Accept array of template IDs (empty = export all)
    - Generate JSON with export_version, exported_at, and templates array
    - Each template includes name, description, template, variables
    - _Requirements: 11.1, 11.2, 11.7_
  
  - [ ]* 9.2 Write property test for export format consistency
    - **Property 8: Export Format Consistency**
    - **Validates: Requirements 11.2, 11.7**
  
  - [ ] 9.3 Implement template import endpoint
    - Implement POST /api/prompt-templates/import (import templates from JSON)
    - Validate JSON structure (required fields: name, template, description, variables)
    - Prevent importing templates with duplicate names
    - Set is_active to false and version to 1 for imported templates
    - Return success/error summary with imported template IDs
    - _Requirements: 11.3, 11.4, 11.5, 11.6_
  
  - [ ]* 9.4 Write property test for import JSON validation
    - **Property 31: Import JSON Validation**
    - **Validates: Requirements 11.4**
  
  - [ ]* 9.5 Write property test for import duplicate prevention
    - **Property 32: Import Duplicate Prevention**
    - **Validates: Requirements 11.5**
  
  - [ ]* 9.6 Write property test for import initial state
    - **Property 33: Import Initial State**
    - **Validates: Requirements 11.6**

- [ ] 10. Register API Routes in backend.ts
  - [ ] 10.1 Add prompt template API routes to backend.ts
    - Add routes for /api/prompt-templates (GET, POST)
    - Add routes for /api/prompt-templates/:id (GET, PUT, DELETE)
    - Add routes for /api/prompt-templates/active (GET)
    - Add routes for /api/prompt-templates/:id/activate (POST)
    - Add routes for /api/prompt-templates/:id/test (POST)
    - Add routes for /api/prompt-templates/:id/analytics (GET)
    - Add routes for /api/prompt-templates/export (POST)
    - Add routes for /api/prompt-templates/import (POST)
    - All routes use bedrockIntegration and userPoolAuthorizer
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8_

- [ ] 11. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 12. Admin UI - PromptTemplateManager Component
  - [ ] 12.1 Create PromptTemplateManager component
    - Create `src/pages/admin/PromptTemplateManager.tsx`
    - Display list of all prompt templates with name, description, active status, version, last updated
    - Implement search input field (filters by name, description, template text)
    - Implement filter dropdown (All, Active Only, Inactive Only)
    - Implement sort dropdown (Name, Last Updated, Version)
    - Display active template with jeans blue badge (#5B7C99)
    - Display usage statistics for each template (total generations, success rate, avg cost)
    - _Requirements: 4.1, 4.2, 4.10, 4.11, 4.12, 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 13.5_
  
  - [ ]* 12.2 Write property test for active template sort priority
    - **Property 20: Active Template Sort Priority**
    - **Validates: Requirements 4.11**
  
  - [ ]* 12.3 Write property test for search filter accuracy
    - **Property 34: Search Filter Accuracy**
    - **Validates: Requirements 12.2**
  
  - [ ]* 12.4 Write property test for case-insensitive search
    - **Property 35: Case-Insensitive Search**
    - **Validates: Requirements 12.5**
  
  - [ ] 12.5 Implement template actions in PromptTemplateManager
    - Add "Create New Template" button that opens template editor modal
    - Add "Edit" action for each template (opens editor with current values)
    - Add "Delete" action with confirmation dialog (disabled for active template)
    - Add "Set as Default" action with confirmation (only for inactive templates)
    - Add "Test Prompt" action (opens BedrockPlayground with template pre-loaded)
    - Add "Export" action for each template
    - Add "Import Template" button with file upload
    - _Requirements: 4.2, 4.5, 4.6, 4.7, 4.8, 4.9, 6.1, 6.2, 11.1, 11.3_

- [ ] 13. Admin UI - PromptTemplateEditor Component
  - [ ] 13.1 Create PromptTemplateEditor modal component
    - Create modal component with name input, description textarea, template textarea
    - Implement real-time variable extraction (display list of {VARIABLES} found in template)
    - Display validation errors inline (missing variables, invalid format, length issues)
    - Show preview of processed template with sample data
    - Implement Save and Cancel buttons
    - Call POST /api/prompt-templates for create, PUT for update
    - Display all validation errors returned from API
    - _Requirements: 4.3, 4.4, 5.7_
  
  - [ ]* 13.2 Write property test for variable extraction accuracy
    - **Property 18: Variable Extraction Accuracy**
    - **Validates: Requirements 4.4**
  
  - [ ]* 13.3 Write property test for template field requirements
    - **Property 17: Template Field Requirements**
    - **Validates: Requirements 4.3**

- [ ] 14. Admin UI - BedrockPlayground Enhancements
  - [ ] 14.1 Enhance BedrockPlayground component
    - Add template selector dropdown showing all templates (name and version)
    - Add "Use Template" button to load selected template into form
    - Display template name and ID in generation logs
    - Display fully processed prompt text after generation
    - Add "Set as Default" button after successful test (calls POST /api/prompt-templates/:id/activate)
    - Show which template was used for each variation in results
    - _Requirements: 6.2, 6.3, 6.4, 6.5, 6.6, 3.5_

- [ ] 15. Admin UI - Template Analytics View
  - [ ] 15.1 Create TemplateAnalytics component
    - Create analytics view showing comparative metrics across all templates
    - Display table with columns: template name, total generations, success rate, avg cost, avg time
    - Display chart showing generation volume per template over time
    - Support date range filtering
    - Call GET /api/prompt-templates/:id/analytics for each template
    - _Requirements: 13.5, 13.6, 13.7_

- [ ] 16. Integration and Error Handling
  - [ ] 16.1 Update handler.ts to use validation before Bedrock calls
    - Call `validateBedrockRequest()` before invoking Bedrock API
    - If validation fails, update job status to "failed" with validation errors
    - Do not call Bedrock API if validation fails
    - _Requirements: 1.4_
  
  - [ ] 16.2 Update handler.ts to handle Bedrock errors
    - Wrap Bedrock API calls in try-catch
    - Call `logBedrockError()` for all Bedrock errors
    - Update generation_jobs with error_message and error_code
    - Return structured error response
    - _Requirements: 1.2, 1.3, 9.3, 9.4_
  
  - [ ]* 16.3 Write property test for generation failure state update
    - **Property 10: Generation Failure State Update**
    - **Validates: Requirements 1.3**

- [ ] 17. Final Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional property-based tests and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at key milestones
- Property tests validate universal correctness properties with randomized inputs
- Unit tests (not listed) should be written alongside implementation for specific examples and edge cases
- The implementation uses TypeScript with AWS Amplify, Lambda, API Gateway, and PostgreSQL
- All API endpoints require Cognito authentication with admin role authorization
- The UI uses React with the existing jeans blue (#5B7C99) color scheme for consistency
