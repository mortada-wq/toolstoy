# Requirements Document: Prompt Library & Error Fixes

## Introduction

This feature enhances the Toolstoy Bedrock integration by fixing critical image generation errors and implementing a comprehensive prompt library management system. The system currently has a working Bedrock integration (91% complete) with Soul Engine Lambda, API endpoints, and admin UI, but uses a single default prompt template stored in the database. This feature will enable administrators to manage multiple prompt templates, test them before deployment, track prompt usage for generated assets, and resolve existing image generation issues.

## Glossary

- **Prompt_Template**: A text template with variable placeholders (e.g., {PRODUCT_NAME}) used to generate AI character images via AWS Bedrock
- **Active_Template**: The currently selected prompt template used for all new character generations
- **Template_Variable**: A placeholder in a prompt template that gets replaced with actual values (PRODUCT_NAME, CHARACTER_TYPE, PRODUCT_COLORS, VIBE_TAGS, PRODUCT_TYPE)
- **Character_Generation**: The process of creating AI character images using AWS Bedrock Titan Image Generator
- **Soul_Engine**: The AWS Lambda function that orchestrates character generation, including image analysis, prompt processing, and Bedrock API calls
- **Bedrock_Playground**: An admin interface for testing character generation with different prompts and parameters
- **Generation_Job**: A database record tracking the status and progress of a character generation request
- **Prompt_Library**: The collection of all prompt templates available in the system
- **Default_Prompt**: The prompt template marked as active and used for all new generations
- **Prompt_Validation**: The process of checking that a prompt template contains all required variables and produces valid output

## Requirements

### Requirement 1: Fix Image Generation Errors

**User Story:** As a system administrator, I want to identify and fix the current image generation error, so that the Bedrock integration works reliably before building new features.

#### Acceptance Criteria

1. WHEN the system attempts to generate a character image, THE Soul_Engine SHALL successfully invoke the Bedrock Titan Image Generator without errors
2. IF the Bedrock API returns an error, THEN THE Soul_Engine SHALL log the complete error details including error code, message, and request parameters
3. WHEN a generation fails, THE Soul_Engine SHALL update the Generation_Job status to "failed" with a descriptive error message
4. THE Soul_Engine SHALL validate all required parameters (prompt, image dimensions, quality settings) before calling the Bedrock API
5. WHEN the Bedrock API is throttled, THE Soul_Engine SHALL retry the request with exponential backoff up to 3 attempts
6. THE Soul_Engine SHALL validate that the prompt template contains all required variables before processing
7. IF a required variable is missing from the template, THEN THE Soul_Engine SHALL return a validation error with the list of missing variables

### Requirement 2: Database Schema for Prompt Management

**User Story:** As a system administrator, I want a robust database schema for managing prompt templates, so that I can store multiple versions and track their usage.

#### Acceptance Criteria

1. THE prompt_templates table SHALL store template name, template text, description, is_active flag, variables array, version number, created_by, created_at, and updated_at
2. THE prompt_templates table SHALL enforce a unique constraint ensuring only one template has is_active set to true at any time
3. WHEN a new template is marked as active, THE Database SHALL automatically set all other templates to is_active = false
4. THE personas table SHALL include a prompt_template_id column to track which template was used for generation
5. THE generation_jobs table SHALL include a prompt_used column storing the actual processed prompt text for audit purposes
6. THE Database SHALL maintain indexes on prompt_templates(is_active) and personas(prompt_template_id) for query performance
7. THE Database SHALL preserve historical prompt templates even when they are no longer active

### Requirement 3: Prompt Usage Tracking

**User Story:** As a system administrator, I want to track which prompt template was used for each character generation, so that I can analyze prompt effectiveness and debug issues.

#### Acceptance Criteria

1. WHEN a character generation starts, THE Soul_Engine SHALL record the prompt_template_id in the Generation_Job record
2. WHEN a character generation completes, THE Soul_Engine SHALL store the fully processed prompt text in the Generation_Job record
3. WHEN a character is approved, THE Soul_Engine SHALL update the Persona record with the prompt_template_id used for generation
4. THE System SHALL provide an API endpoint to retrieve generation history including prompt template used for any persona
5. THE Bedrock_Playground SHALL display the prompt template name and ID used for each test generation
6. WHEN viewing a character in the admin UI, THE System SHALL display which prompt template was used to generate it
7. THE System SHALL track the number of successful generations per prompt template for analytics

### Requirement 4: Prompt Library Admin Interface

**User Story:** As a system administrator, I want a user interface to manage prompt templates, so that I can create, edit, and organize prompts without database access.

#### Acceptance Criteria

1. THE Prompt_Library interface SHALL display all prompt templates in a list with name, description, active status, and last updated date
2. THE Prompt_Library interface SHALL provide a "Create New Template" button that opens a template editor form
3. WHEN creating a template, THE Interface SHALL require name, template text, and description fields
4. THE Interface SHALL automatically extract and display variable placeholders found in the template text
5. THE Interface SHALL provide a "Set as Default" action for non-active templates
6. WHEN a template is set as default, THE Interface SHALL confirm the action and update the active template
7. THE Interface SHALL provide an "Edit" action that opens the template in the editor with current values
8. THE Interface SHALL provide a "Delete" action for non-active templates with confirmation dialog
9. THE Interface SHALL prevent deletion of the currently active template
10. THE Interface SHALL display a visual indicator (badge or icon) distinguishing the default template from others
11. THE Interface SHALL sort templates with the active template displayed first
12. THE Interface SHALL use neutral colors (jeans blue for active, gray for inactive) consistent with the existing admin UI

### Requirement 5: Prompt Template Validation

**User Story:** As a system administrator, I want to validate prompt templates before saving them, so that I ensure they contain required variables and will work correctly.

#### Acceptance Criteria

1. WHEN a template is saved, THE System SHALL validate that it contains all required variables: PRODUCT_NAME, CHARACTER_TYPE, PRODUCT_COLORS, VIBE_TAGS, PRODUCT_TYPE
2. IF a required variable is missing, THEN THE System SHALL display an error message listing the missing variables
3. THE System SHALL validate that variable placeholders use the correct format: {VARIABLE_NAME}
4. THE System SHALL warn if the template contains unrecognized variable placeholders
5. THE System SHALL validate that the template text is not empty and contains at least 50 characters
6. THE System SHALL validate that the template name is unique and not empty
7. WHEN validation fails, THE System SHALL prevent saving the template and display all validation errors

### Requirement 6: Prompt Testing Before Activation

**User Story:** As a system administrator, I want to test prompt templates before making them default, so that I can verify they produce acceptable character images.

#### Acceptance Criteria

1. THE Prompt_Library interface SHALL provide a "Test Prompt" action for each template
2. WHEN testing a prompt, THE System SHALL open the Bedrock_Playground with the selected template pre-loaded
3. THE Bedrock_Playground SHALL allow entering test values for all template variables
4. WHEN the test generation completes, THE Bedrock_Playground SHALL display the generated character images
5. THE Bedrock_Playground SHALL display the fully processed prompt text that was sent to Bedrock
6. THE Bedrock_Playground SHALL provide a "Set as Default" button to activate the tested template if results are satisfactory
7. THE System SHALL prevent setting a template as default without first testing it successfully

### Requirement 7: Prompt Template Versioning

**User Story:** As a system administrator, I want to track versions of prompt templates, so that I can understand how prompts have evolved and revert if needed.

#### Acceptance Criteria

1. WHEN a template is created, THE System SHALL set its version to 1
2. WHEN a template is edited, THE System SHALL create a new template record with an incremented version number
3. THE System SHALL maintain a relationship between template versions using a parent_template_id column
4. THE Prompt_Library interface SHALL display the version number for each template
5. THE Interface SHALL provide a "View History" action showing all versions of a template
6. THE Interface SHALL allow reverting to a previous version by creating a new version with the old content
7. WHEN a template version is set as active, THE System SHALL deactivate all other templates including other versions of the same template

### Requirement 8: Prompt Template CRUD API

**User Story:** As a developer, I want REST API endpoints for prompt template management, so that I can integrate prompt management into the admin interface.

#### Acceptance Criteria

1. THE System SHALL provide GET /api/prompt-templates to retrieve all prompt templates
2. THE System SHALL provide GET /api/prompt-templates/:id to retrieve a specific template
3. THE System SHALL provide GET /api/prompt-templates/active to retrieve the currently active template
4. THE System SHALL provide POST /api/prompt-templates to create a new template
5. THE System SHALL provide PUT /api/prompt-templates/:id to update an existing template
6. THE System SHALL provide DELETE /api/prompt-templates/:id to delete a template
7. THE System SHALL provide POST /api/prompt-templates/:id/activate to set a template as active
8. THE System SHALL provide POST /api/prompt-templates/:id/test to test a template with sample data
9. ALL endpoints SHALL require Cognito authentication and admin role authorization
10. ALL endpoints SHALL validate request data and return appropriate error messages for invalid input
11. THE activate endpoint SHALL automatically deactivate all other templates in a single transaction

### Requirement 9: Error Logging and Monitoring

**User Story:** As a system administrator, I want comprehensive error logging for prompt processing and generation, so that I can quickly diagnose and fix issues.

#### Acceptance Criteria

1. WHEN a prompt template is retrieved, THE Soul_Engine SHALL log the template ID and name
2. WHEN template variables are replaced, THE Soul_Engine SHALL log any unreplaced placeholders
3. WHEN a Bedrock API call fails, THE Soul_Engine SHALL log the complete error response including status code and error message
4. WHEN a generation job fails, THE Soul_Engine SHALL log the job ID, persona ID, merchant ID, and error details
5. THE Soul_Engine SHALL log the execution time for each generation step (prompt processing, Bedrock API call, S3 upload)
6. THE Soul_Engine SHALL log cost information for each successful generation
7. ALL error logs SHALL include sufficient context to reproduce the issue without accessing the database

### Requirement 10: Prompt Template Migration

**User Story:** As a developer, I want a database migration to add prompt tracking columns, so that the existing schema supports the new prompt library features.

#### Acceptance Criteria

1. THE Migration SHALL add prompt_template_id column to the personas table as a nullable UUID foreign key
2. THE Migration SHALL add prompt_used column to the generation_jobs table as TEXT to store the processed prompt
3. THE Migration SHALL add parent_template_id column to the prompt_templates table for version tracking
4. THE Migration SHALL create indexes on personas(prompt_template_id) and prompt_templates(parent_template_id)
5. THE Migration SHALL update the existing default template record with parent_template_id = NULL and version = 1
6. THE Migration SHALL be idempotent and safe to run multiple times
7. THE Migration SHALL not modify or delete existing data in the prompt_templates table

### Requirement 11: Prompt Template Export and Import

**User Story:** As a system administrator, I want to export and import prompt templates, so that I can share templates between environments or back them up.

#### Acceptance Criteria

1. THE Prompt_Library interface SHALL provide an "Export" action for each template
2. WHEN exporting a template, THE System SHALL generate a JSON file containing name, template, description, and variables
3. THE Prompt_Library interface SHALL provide an "Import Template" button
4. WHEN importing a template, THE System SHALL validate the JSON structure and required fields
5. THE System SHALL prevent importing a template with a duplicate name
6. WHEN importing a template, THE System SHALL set is_active to false and version to 1
7. THE System SHALL provide a "Bulk Export" action to export all templates as a single JSON file

### Requirement 12: Prompt Template Search and Filter

**User Story:** As a system administrator, I want to search and filter prompt templates, so that I can quickly find specific templates in a large library.

#### Acceptance Criteria

1. THE Prompt_Library interface SHALL provide a search input field
2. WHEN searching, THE Interface SHALL filter templates by name, description, or template text containing the search term
3. THE Interface SHALL provide filter options for "Active Only", "Inactive Only", and "All Templates"
4. THE Interface SHALL provide sorting options for "Name", "Last Updated", and "Version"
5. THE Search SHALL be case-insensitive and update results as the user types
6. THE Interface SHALL display the number of templates matching the current search and filter criteria
7. WHEN no templates match the search, THE Interface SHALL display a helpful message with suggestions

### Requirement 13: Prompt Template Analytics

**User Story:** As a system administrator, I want to see analytics on prompt template usage, so that I can understand which templates are most effective.

#### Acceptance Criteria

1. THE System SHALL track the total number of generations per prompt template
2. THE System SHALL track the success rate (successful generations / total attempts) per template
3. THE System SHALL track the average generation cost per template
4. THE System SHALL track the average generation time per template
5. THE Prompt_Library interface SHALL display usage statistics for each template
6. THE Interface SHALL provide a "Template Analytics" view showing comparative metrics across all templates
7. THE Analytics view SHALL display a chart showing generation volume per template over time
