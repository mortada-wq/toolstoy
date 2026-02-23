# Design Document: Prompt Library & Error Fixes

## Overview

This feature enhances the Toolstoy Bedrock integration by addressing critical image generation errors and implementing a comprehensive prompt library management system. The system currently has a working Bedrock integration with Soul Engine Lambda, API endpoints, and admin UI, but uses a single default prompt template. This design introduces multi-template management, testing capabilities, usage tracking, and robust error handling.

The design builds upon the existing architecture:
- Soul Engine Lambda (`amplify/functions/soul-engine/`) orchestrates character generation
- API Bedrock handler (`amplify/functions/api-bedrock/handler.ts`) provides REST endpoints
- Admin UI (`src/pages/admin/`) provides management interfaces
- PostgreSQL database stores templates, personas, and generation jobs

Key capabilities:
- Manage multiple prompt templates with CRUD operations
- Test templates before activation in Bedrock Playground
- Track which template was used for each character generation
- Version control for template evolution
- Export/import templates for backup and sharing
- Analytics on template effectiveness
- Comprehensive error logging and validation

## Architecture

### System Components

The Prompt Library feature integrates with existing components:

```
┌─────────────────────────────────────────────────────────────────┐
│                         Admin UI Layer                          │
├─────────────────────────────────────────────────────────────────┤
│  PromptTemplateManager.tsx  │  BedrockPlayground.tsx           │
│  - List templates           │  - Test templates                 │
│  - Create/Edit/Delete       │  - Preview results                │
│  - Set active template      │  - Activate tested templates      │
│  - View analytics           │                                   │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  │ HTTPS/REST API
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                    API Gateway + Lambda                         │
├─────────────────────────────────────────────────────────────────┤
│  api-bedrock/handler.ts                                         │
│  - GET    /api/prompt-templates                                 │
│  - GET    /api/prompt-templates/:id                             │
│  - GET    /api/prompt-templates/active                          │
│  - POST   /api/prompt-templates                                 │
│  - PUT    /api/prompt-templates/:id                             │
│  - DELETE /api/prompt-templates/:id                             │
│  - POST   /api/prompt-templates/:id/activate                    │
│  - POST   /api/prompt-templates/:id/test                        │
│  - GET    /api/prompt-templates/:id/analytics                   │
│  - POST   /api/prompt-templates/export                          │
│  - POST   /api/prompt-templates/import                          │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  │ Invokes
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Soul Engine Lambda                         │
├─────────────────────────────────────────────────────────────────┤
│  soul-engine/handler.ts                                         │
│  - handleGenerateCharacterVariations()                          │
│  - handleGenerateStateVideos()                                  │
│                                                                  │
│  soul-engine/prompt-template.ts                                 │
│  - retrieveActivePromptTemplate()                               │
│  - processTemplate()                                            │
│  - validateTemplateVariables()                                  │
│  - replaceTemplateVariables()                                   │
│                                                                  │
│  soul-engine/error-handling.ts                                  │
│  - Enhanced error logging                                       │
│  - Bedrock API error capture                                    │
│  - Validation error reporting                                   │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  │ Reads/Writes
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                      PostgreSQL Database                        │
├─────────────────────────────────────────────────────────────────┤
│  prompt_templates                                               │
│  - id, name, template, description                              │
│  - is_active, variables, version                                │
│  - parent_template_id (for versioning)                          │
│  - created_by, created_at, updated_at                           │
│                                                                  │
│  personas                                                       │
│  - prompt_template_id (NEW - tracks template used)             │
│                                                                  │
│  generation_jobs                                                │
│  - prompt_used (NEW - stores processed prompt text)            │
│  - prompt_template_id (NEW - tracks template used)             │
│                                                                  │
│  character_variations                                           │
│  - Existing table, no changes                                   │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow

1. Template Management Flow:
   - Admin creates/edits template in PromptTemplateManager UI
   - UI calls POST/PUT /api/prompt-templates
   - API validates template (required variables, format)
   - Database stores template with is_active=false
   - UI displays updated template list

2. Template Testing Flow:
   - Admin clicks "Test Prompt" in PromptTemplateManager
   - UI opens BedrockPlayground with template pre-loaded
   - Admin enters test values for variables
   - UI calls POST /api/bedrock/generate-character with template_id
   - Soul Engine retrieves specified template (not active one)
   - Soul Engine processes template and generates images
   - UI displays results with "Set as Default" button

3. Template Activation Flow:
   - Admin clicks "Set as Default" after successful test
   - UI calls POST /api/prompt-templates/:id/activate
   - API updates database in transaction:
     - Set all templates is_active=false
     - Set specified template is_active=true
   - UI updates to show new active template

4. Character Generation Flow (with tracking):
   - User initiates character generation
   - Soul Engine retrieves active template
   - Soul Engine validates template variables
   - Soul Engine processes template (variable substitution)
   - Soul Engine calls Bedrock API with processed prompt
   - Soul Engine stores:
     - prompt_template_id in generation_jobs
     - prompt_used (processed text) in generation_jobs
   - On completion, Soul Engine stores prompt_template_id in personas

5. Error Handling Flow:
   - Bedrock API returns error
   - Soul Engine captures complete error response
   - Soul Engine logs error with context (job_id, persona_id, merchant_id)
   - Soul Engine updates generation_jobs with error_message and error_code
   - Soul Engine returns structured error to API
   - UI displays error with suggested actions

### Integration Points

1. Existing Soul Engine Integration:
   - Extends `prompt-template.ts` with template selection by ID
   - Adds validation before Bedrock API calls
   - Enhances error logging in `error-handling.ts`
   - Updates `handler.ts` to track template usage

2. Existing API Integration:
   - Adds new route handlers to `api-bedrock/handler.ts`
   - Reuses existing authentication (Cognito JWT)
   - Reuses existing database connection utilities
   - Maintains consistent error response format

3. Existing Admin UI Integration:
   - New PromptTemplateManager page (already exists, needs enhancement)
   - Extends BedrockPlayground with template selection
   - Reuses existing UI components and styling
   - Maintains jeans blue (#5B7C99) color scheme

## Components and Interfaces

### API Endpoints

All endpoints require Cognito authentication via Bearer token. Admin role required for all operations.

#### GET /api/prompt-templates

Retrieves all prompt templates.

Request:
```
GET /api/prompt-templates
Authorization: Bearer <token>
```

Query Parameters:
- `search` (optional): Filter by name, description, or template text
- `active` (optional): Filter by active status ("true", "false", "all")
- `sort` (optional): Sort field ("name", "updated_at", "version")
- `order` (optional): Sort order ("asc", "desc")

Response (200):
```json
{
  "templates": [
    {
      "id": "uuid",
      "name": "Product Expert Template",
      "description": "Creates AI product experts",
      "template": "Create a professional AI character...",
      "is_active": true,
      "variables": ["PRODUCT_NAME", "PRODUCT_TYPE", "PRODUCT_COLORS", "CHARACTER_TYPE", "VIBE_TAGS"],
      "version": 1,
      "parent_template_id": null,
      "created_by": "user@example.com",
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z",
      "usage_stats": {
        "total_generations": 150,
        "success_rate": 0.96,
        "avg_cost_usd": 0.008,
        "avg_generation_time_ms": 4500
      }
    }
  ],
  "total": 1,
  "filtered": 1
}
```

#### GET /api/prompt-templates/:id

Retrieves a specific prompt template.

Request:
```
GET /api/prompt-templates/uuid
Authorization: Bearer <token>
```

Response (200):
```json
{
  "id": "uuid",
  "name": "Product Expert Template",
  "description": "Creates AI product experts",
  "template": "Create a professional AI character...",
  "is_active": true,
  "variables": ["PRODUCT_NAME", "PRODUCT_TYPE", "PRODUCT_COLORS", "CHARACTER_TYPE", "VIBE_TAGS"],
  "version": 1,
  "parent_template_id": null,
  "created_by": "user@example.com",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

Response (404):
```json
{
  "error": "Template not found"
}
```

#### GET /api/prompt-templates/active

Retrieves the currently active prompt template.

Request:
```
GET /api/prompt-templates/active
Authorization: Bearer <token>
```

Response (200):
```json
{
  "id": "uuid",
  "name": "Product Expert Template",
  "template": "Create a professional AI character...",
  "is_active": true,
  "variables": ["PRODUCT_NAME", "PRODUCT_TYPE", "PRODUCT_COLORS", "CHARACTER_TYPE", "VIBE_TAGS"]
}
```

Response (404):
```json
{
  "error": "No active template found"
}
```

#### POST /api/prompt-templates

Creates a new prompt template.

Request:
```
POST /api/prompt-templates
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Friendly Mascot Template",
  "description": "Creates friendly mascot characters",
  "template": "Create a friendly mascot for {PRODUCT_NAME}..."
}
```

Validation Rules:
- `name`: Required, 1-255 characters, unique
- `description`: Optional, max 1000 characters
- `template`: Required, min 50 characters
- Template must contain all required variables: PRODUCT_NAME, CHARACTER_TYPE, PRODUCT_COLORS, VIBE_TAGS, PRODUCT_TYPE
- Variable format must be {VARIABLE_NAME}

Response (201):
```json
{
  "id": "uuid",
  "name": "Friendly Mascot Template",
  "description": "Creates friendly mascot characters",
  "template": "Create a friendly mascot for {PRODUCT_NAME}...",
  "is_active": false,
  "variables": ["PRODUCT_NAME"],
  "version": 1,
  "parent_template_id": null,
  "created_by": "user@example.com",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

Response (400):
```json
{
  "error": "Validation failed",
  "details": {
    "missing_variables": ["CHARACTER_TYPE", "PRODUCT_COLORS"],
    "invalid_format": ["{product_name} should be {PRODUCT_NAME}"],
    "template_too_short": "Template must be at least 50 characters"
  }
}
```

#### PUT /api/prompt-templates/:id

Updates an existing prompt template. Creates a new version if template text changes.

Request:
```
PUT /api/prompt-templates/uuid
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Template Name",
  "description": "Updated description",
  "template": "Updated template text..."
}
```

Response (200):
```json
{
  "id": "new-uuid",
  "name": "Updated Template Name",
  "description": "Updated description",
  "template": "Updated template text...",
  "is_active": false,
  "variables": ["PRODUCT_NAME", "CHARACTER_TYPE"],
  "version": 2,
  "parent_template_id": "original-uuid",
  "created_by": "user@example.com",
  "created_at": "2024-01-15T11:00:00Z",
  "updated_at": "2024-01-15T11:00:00Z"
}
```

#### DELETE /api/prompt-templates/:id

Deletes a prompt template. Cannot delete active template.

Request:
```
DELETE /api/prompt-templates/uuid
Authorization: Bearer <token>
```

Response (200):
```json
{
  "success": true,
  "message": "Template deleted successfully"
}
```

Response (403):
```json
{
  "error": "Cannot delete active template"
}
```

#### POST /api/prompt-templates/:id/activate

Sets a template as the active default template.

Request:
```
POST /api/prompt-templates/uuid/activate
Authorization: Bearer <token>
```

Response (200):
```json
{
  "success": true,
  "template_id": "uuid",
  "name": "Product Expert Template",
  "previous_active_id": "old-uuid"
}
```

#### POST /api/prompt-templates/:id/test

Tests a template with sample data without activating it.

Request:
```
POST /api/prompt-templates/uuid/test
Authorization: Bearer <token>
Content-Type: application/json

{
  "variables": {
    "PRODUCT_NAME": "Organic Coffee Beans",
    "PRODUCT_TYPE": "beverage",
    "PRODUCT_COLORS": "#8B4513, #D2691E",
    "CHARACTER_TYPE": "expert",
    "VIBE_TAGS": "knowledgeable, warm, passionate"
  }
}
```

Response (200):
```json
{
  "processed_prompt": "Create a professional AI character that serves as a personal product expert...",
  "negative_prompt": "blurry, low quality, distorted...",
  "validation": {
    "valid": true,
    "missing_variables": []
  }
}
```

Response (400):
```json
{
  "error": "Validation failed",
  "validation": {
    "valid": false,
    "missing_variables": ["PRODUCT_TYPE"]
  }
}
```

#### GET /api/prompt-templates/:id/analytics

Retrieves usage analytics for a specific template.

Request:
```
GET /api/prompt-templates/uuid/analytics
Authorization: Bearer <token>
```

Query Parameters:
- `start_date` (optional): ISO 8601 date
- `end_date` (optional): ISO 8601 date

Response (200):
```json
{
  "template_id": "uuid",
  "template_name": "Product Expert Template",
  "total_generations": 150,
  "successful_generations": 144,
  "failed_generations": 6,
  "success_rate": 0.96,
  "total_cost_usd": 1.20,
  "avg_cost_usd": 0.008,
  "avg_generation_time_ms": 4500,
  "usage_by_date": [
    {
      "date": "2024-01-15",
      "generations": 25,
      "success_rate": 0.96
    }
  ],
  "usage_by_character_type": {
    "mascot": 60,
    "expert": 50,
    "spokesperson": 30,
    "sidekick": 10
  }
}
```

#### POST /api/prompt-templates/export

Exports templates as JSON.

Request:
```
POST /api/prompt-templates/export
Authorization: Bearer <token>
Content-Type: application/json

{
  "template_ids": ["uuid1", "uuid2"]
}
```

If `template_ids` is empty or omitted, exports all templates.

Response (200):
```json
{
  "export_version": "1.0",
  "exported_at": "2024-01-15T10:30:00Z",
  "templates": [
    {
      "name": "Product Expert Template",
      "description": "Creates AI product experts",
      "template": "Create a professional AI character...",
      "variables": ["PRODUCT_NAME", "PRODUCT_TYPE", "PRODUCT_COLORS", "CHARACTER_TYPE", "VIBE_TAGS"]
    }
  ]
}
```

#### POST /api/prompt-templates/import

Imports templates from JSON.

Request:
```
POST /api/prompt-templates/import
Authorization: Bearer <token>
Content-Type: application/json

{
  "templates": [
    {
      "name": "Imported Template",
      "description": "Imported from backup",
      "template": "Create a character for {PRODUCT_NAME}...",
      "variables": ["PRODUCT_NAME"]
    }
  ]
}
```

Response (200):
```json
{
  "success": true,
  "imported": 1,
  "skipped": 0,
  "errors": [],
  "template_ids": ["new-uuid"]
}
```

Response (400):
```json
{
  "success": false,
  "imported": 0,
  "skipped": 1,
  "errors": [
    {
      "template_name": "Imported Template",
      "error": "Template with this name already exists"
    }
  ]
}
```

### Soul Engine Enhancements

#### Enhanced Template Retrieval

Extend `prompt-template.ts` to support retrieving templates by ID:

```typescript
export async function retrievePromptTemplateById(
  templateId: string
): Promise<PromptTemplate> {
  const row = await queryOne<PromptTemplate>(
    `SELECT id, name, template, description, is_active, variables, 
            version, created_by, created_at, updated_at
     FROM prompt_templates
     WHERE id = $1`,
    [templateId]
  )
  
  if (!row) {
    throw new Error(`Template not found: ${templateId}`)
  }
  
  return row
}
```

#### Enhanced Validation

Add comprehensive validation before Bedrock API calls:

```typescript
export function validateBedrockRequest(
  prompt: string,
  dimensions: { width: number; height: number }
): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (!prompt || prompt.trim().length === 0) {
    errors.push('Prompt cannot be empty')
  }
  
  if (prompt.length > 10000) {
    errors.push('Prompt exceeds maximum length of 10000 characters')
  }
  
  if (dimensions.width < 512 || dimensions.width > 2048) {
    errors.push('Width must be between 512 and 2048 pixels')
  }
  
  if (dimensions.height < 512 || dimensions.height > 2048) {
    errors.push('Height must be between 512 and 2048 pixels')
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}
```

#### Enhanced Error Logging

Extend `error-handling.ts` with Bedrock-specific error capture:

```typescript
export interface BedrockError {
  code: string
  message: string
  statusCode: number
  requestId: string
  timestamp: string
}

export function logBedrockError(
  error: BedrockError,
  context: {
    jobId: string
    personaId: string
    merchantId: string
    prompt: string
    templateId: string
  }
): void {
  console.error('Bedrock API Error:', {
    error_code: error.code,
    error_message: error.message,
    status_code: error.statusCode,
    request_id: error.requestId,
    job_id: context.jobId,
    persona_id: context.personaId,
    merchant_id: context.merchantId,
    template_id: context.templateId,
    prompt_length: context.prompt.length,
    timestamp: error.timestamp
  })
}
```

#### Template Usage Tracking

Add tracking functions to record template usage:

```typescript
export async function recordTemplateUsage(
  jobId: string,
  templateId: string,
  processedPrompt: string
): Promise<void> {
  await query(
    `UPDATE generation_jobs
     SET prompt_template_id = $1,
         prompt_used = $2
     WHERE id = $3`,
    [templateId, processedPrompt, jobId]
  )
}

export async function recordPersonaTemplate(
  personaId: string,
  templateId: string
): Promise<void> {
  await query(
    `UPDATE personas
     SET prompt_template_id = $1,
         updated_at = NOW()
     WHERE id = $2`,
    [templateId, personaId]
  )
}
```

### UI Components

#### PromptTemplateManager Component

Main interface for managing prompt templates.

Component Structure:
```typescript
interface PromptTemplateManagerProps {}

interface PromptTemplate {
  id: string
  name: string
  description: string
  template: string
  is_active: boolean
  variables: string[]
  version: number
  parent_template_id: string | null
  created_by: string
  created_at: string
  updated_at: string
  usage_stats?: {
    total_generations: number
    success_rate: number
    avg_cost_usd: number
  }
}

export function PromptTemplateManager() {
  const [templates, setTemplates] = useState<PromptTemplate[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all')
  const [sortBy, setSortBy] = useState<'name' | 'updated_at' | 'version'>('updated_at')
  const [isCreating, setIsCreating] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<PromptTemplate | null>(null)
  
  // ... component implementation
}
```

Features:
- List view with search and filter
- Create/Edit modal with template editor
- Delete confirmation dialog
- "Set as Default" action with confirmation
- "Test Prompt" action (opens Bedrock Playground)
- "View Analytics" action
- "Export" and "Import" actions
- Visual indicator for active template (jeans blue badge)

#### PromptTemplateEditor Component

Modal for creating/editing templates.

Features:
- Name input field
- Description textarea
- Template textarea with syntax highlighting for {VARIABLES}
- Real-time variable extraction display
- Validation error display
- Preview of processed template with sample data
- Save and Cancel buttons

#### BedrockPlayground Enhancements

Extend existing BedrockPlayground component:

Features to Add:
- Template selector dropdown (shows all templates)
- "Use Template" button to load selected template
- Display template name and ID in generation logs
- "Set as Default" button after successful test
- Display which template was used for each variation

## Data Models

### Database Schema Updates

#### prompt_templates Table (Existing, Add Columns)

```sql
ALTER TABLE prompt_templates
ADD COLUMN IF NOT EXISTS parent_template_id UUID REFERENCES prompt_templates(id),
ADD COLUMN IF NOT EXISTS prompt_template_id UUID REFERENCES prompt_templates(id);

CREATE INDEX IF NOT EXISTS idx_prompt_templates_parent 
  ON prompt_templates(parent_template_id);

UPDATE prompt_templates
SET parent_template_id = NULL,
    version = 1
WHERE parent_template_id IS NULL;
```

#### personas Table (Add Column)

```sql
ALTER TABLE personas
ADD COLUMN IF NOT EXISTS prompt_template_id UUID REFERENCES prompt_templates(id);

CREATE INDEX IF NOT EXISTS idx_personas_prompt_template 
  ON personas(prompt_template_id);
```

#### generation_jobs Table (Add Columns)

```sql
ALTER TABLE generation_jobs
ADD COLUMN IF NOT EXISTS prompt_template_id UUID REFERENCES prompt_templates(id),
ADD COLUMN IF NOT EXISTS prompt_used TEXT;

CREATE INDEX IF NOT EXISTS idx_generation_jobs_prompt_template 
  ON generation_jobs(prompt_template_id);
```

### Complete Schema Reference

#### prompt_templates

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique template identifier |
| name | VARCHAR(255) | NOT NULL, UNIQUE | Template display name |
| template | TEXT | NOT NULL | Template text with {VARIABLE} placeholders |
| description | TEXT | | Template description |
| is_active | BOOLEAN | DEFAULT false | Whether this is the active template |
| variables | TEXT[] | DEFAULT '{}' | Array of variable names in template |
| version | INTEGER | DEFAULT 1 | Version number for this template |
| parent_template_id | UUID | REFERENCES prompt_templates(id) | Parent template for versioning |
| created_by | VARCHAR(255) | | User who created the template |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update timestamp |

Constraints:
- UNIQUE INDEX on (is_active) WHERE is_active = true (only one active template)
- INDEX on (parent_template_id) for version queries
- INDEX on (is_active) for active template lookup

#### personas (Updated)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| prompt_template_id | UUID | REFERENCES prompt_templates(id) | Template used for generation |
| ... | ... | ... | (existing columns) |

#### generation_jobs (Updated)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| prompt_template_id | UUID | REFERENCES prompt_templates(id) | Template used for this job |
| prompt_used | TEXT | | Fully processed prompt text sent to Bedrock |
| ... | ... | ... | (existing columns) |

### TypeScript Interfaces

```typescript
// Prompt Template
export interface PromptTemplate {
  id: string
  name: string
  template: string
  description: string
  is_active: boolean
  variables: string[]
  version: number
  parent_template_id: string | null
  created_by: string
  created_at: string
  updated_at: string
}

// Template with usage statistics
export interface PromptTemplateWithStats extends PromptTemplate {
  usage_stats: {
    total_generations: number
    successful_generations: number
    failed_generations: number
    success_rate: number
    total_cost_usd: number
    avg_cost_usd: number
    avg_generation_time_ms: number
  }
}

// Template validation result
export interface TemplateValidation {
  valid: boolean
  missing_variables: string[]
  invalid_format: string[]
  warnings: string[]
}

// Template analytics
export interface TemplateAnalytics {
  template_id: string
  template_name: string
  total_generations: number
  successful_generations: number
  failed_generations: number
  success_rate: number
  total_cost_usd: number
  avg_cost_usd: number
  avg_generation_time_ms: number
  usage_by_date: Array<{
    date: string
    generations: number
    success_rate: number
  }>
  usage_by_character_type: Record<string, number>
}

// Export format
export interface TemplateExport {
  export_version: string
  exported_at: string
  templates: Array<{
    name: string
    description: string
    template: string
    variables: string[]
  }>
}
```


## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property Reflection

After analyzing all acceptance criteria, I identified the following redundancies and consolidations:

- Properties 1.2 and 9.3 both test Bedrock error logging - consolidated into Property 1
- Properties 1.7 and 5.2 both test missing variable error messages - consolidated into Property 2
- Properties 2.2, 2.3, and 8.11 all test single active template constraint - consolidated into Property 3
- Properties 3.1 and 3.2 both test template tracking in generation jobs - consolidated into Property 4
- Properties 5.1, 5.2, and 5.7 all test template validation - consolidated into Property 5
- Properties 7.2 and 7.3 both test versioning behavior - consolidated into Property 6
- Properties 9.1, 9.2, 9.4, 9.5, and 9.6 all test logging completeness - consolidated into Property 7
- Properties 11.2 and 11.7 both test export format - consolidated into Property 8
- Properties 13.1, 13.2, 13.3, and 13.4 all test analytics calculations - consolidated into Property 9

### Property 1: Complete Error Logging

For any Bedrock API error, the Soul Engine SHALL log all error details including error code, message, status code, request ID, job ID, persona ID, merchant ID, and template ID.

**Validates: Requirements 1.2, 9.3**

### Property 2: Missing Variable Error Reporting

For any prompt template with missing required variables, the validation SHALL return an error containing the complete list of missing variable names.

**Validates: Requirements 1.7, 5.2**

### Property 3: Single Active Template Constraint

For any operation that activates a template, the system SHALL ensure exactly one template has is_active=true by automatically deactivating all other templates in a single atomic transaction.

**Validates: Requirements 2.2, 2.3, 7.7, 8.11**

### Property 4: Template Usage Tracking

For any character generation, the system SHALL record both the prompt_template_id and the fully processed prompt text in the generation_jobs table before invoking the Bedrock API.

**Validates: Requirements 3.1, 3.2**

### Property 5: Template Validation Completeness

For any template being saved, the validation SHALL check all requirements (required variables present, correct format, minimum length, unique name) and prevent saving if any validation fails, returning all validation errors.

**Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7**

### Property 6: Template Versioning

For any template edit that changes the template text, the system SHALL create a new template record with version incremented by 1 and parent_template_id set to the original template's ID.

**Validates: Requirements 7.2, 7.3**

### Property 7: Generation Logging Completeness

For any character generation, the Soul Engine SHALL log template retrieval (template ID and name), variable replacement (unreplaced placeholders), execution timing (prompt processing, Bedrock call, S3 upload), and cost information.

**Validates: Requirements 9.1, 9.2, 9.5, 9.6**

### Property 8: Export Format Consistency

For any template export (single or bulk), the system SHALL generate JSON containing export_version, exported_at timestamp, and an array of templates with name, description, template text, and variables fields.

**Validates: Requirements 11.2, 11.7**

### Property 9: Analytics Calculation Accuracy

For any prompt template with generation history, the analytics SHALL accurately calculate total generations, success rate (successful/total), average cost (total_cost/successful), and average generation time from the generation_jobs table.

**Validates: Requirements 13.1, 13.2, 13.3, 13.4**

### Property 10: Generation Failure State Update

For any generation that fails, the Soul Engine SHALL update the generation_jobs status to "failed" and populate the error_message field with a descriptive error.

**Validates: Requirements 1.3**

### Property 11: Parameter Validation Before API Call

For any Bedrock API invocation, the Soul Engine SHALL validate all required parameters (prompt non-empty, dimensions within bounds) and reject the request without calling Bedrock if validation fails.

**Validates: Requirements 1.4**

### Property 12: Retry with Exponential Backoff

For any Bedrock API throttling error, the Soul Engine SHALL retry the request up to 3 times with exponential backoff delays (1s, 2s, 4s).

**Validates: Requirements 1.5**

### Property 13: Template Variable Validation

For any prompt template, the Soul Engine SHALL validate that all required variables (PRODUCT_NAME, CHARACTER_TYPE, PRODUCT_COLORS, VIBE_TAGS, PRODUCT_TYPE) are present before processing.

**Validates: Requirements 1.6**

### Property 14: Historical Template Preservation

For any template deactivation, the system SHALL preserve the template record in the database (not delete it).

**Validates: Requirements 2.7**

### Property 15: Persona Template Recording

For any character approval, the Soul Engine SHALL update the personas table with the prompt_template_id used for generation.

**Validates: Requirements 3.3**

### Property 16: Generation Count Tracking

For any successful character generation, the system SHALL increment the generation count for the associated prompt template.

**Validates: Requirements 3.7**

### Property 17: Template Field Requirements

For any template creation via API, the system SHALL require name, template text, and description fields to be present and non-empty.

**Validates: Requirements 4.3**

### Property 18: Variable Extraction Accuracy

For any template text, the system SHALL extract all variable placeholders matching the pattern {VARIABLE_NAME} and return them as an array.

**Validates: Requirements 4.4**

### Property 19: Active Template Deletion Prevention

For any template with is_active=true, the system SHALL reject deletion requests with an error.

**Validates: Requirements 4.9**

### Property 20: Active Template Sort Priority

For any template list query, the system SHALL return templates sorted with the active template first, followed by others sorted by the requested field.

**Validates: Requirements 4.11**

### Property 21: Variable Format Validation

For any template text, the system SHALL validate that variable placeholders use the format {VARIABLE_NAME} (uppercase letters and underscores only) and reject incorrectly formatted placeholders.

**Validates: Requirements 5.3**

### Property 22: Unrecognized Variable Warning

For any template containing variable placeholders not in the supported list, the system SHALL include warnings in the validation response.

**Validates: Requirements 5.4**

### Property 23: Template Name Uniqueness

For any template creation or update, the system SHALL reject templates with names that already exist in the database.

**Validates: Requirements 5.6**

### Property 24: Untested Template Activation Prevention

For any template that has not been successfully tested, the system SHALL reject activation requests.

**Validates: Requirements 6.7**

### Property 25: Initial Version Assignment

For any newly created template, the system SHALL set version to 1 and parent_template_id to NULL.

**Validates: Requirements 7.1**

### Property 26: Version Revert Creates New Version

For any template revert operation, the system SHALL create a new template record with incremented version number containing the old template content.

**Validates: Requirements 7.6**

### Property 27: Authentication Requirement

For any API endpoint in the prompt template system, requests without valid Cognito authentication SHALL be rejected with 401 Unauthorized.

**Validates: Requirements 8.9**

### Property 28: Input Validation Error Messages

For any API endpoint receiving invalid input, the system SHALL return a 400 error with a descriptive error message explaining the validation failure.

**Validates: Requirements 8.10**

### Property 29: Migration Idempotency

For any execution of the prompt library migration, running it multiple times SHALL produce the same result without errors or duplicate data.

**Validates: Requirements 10.6**

### Property 30: Migration Data Preservation

For any execution of the prompt library migration, existing data in the prompt_templates table SHALL remain unchanged (no modifications or deletions).

**Validates: Requirements 10.7**

### Property 31: Import JSON Validation

For any template import request, the system SHALL validate the JSON structure contains required fields (name, template, description, variables) and reject invalid imports.

**Validates: Requirements 11.4**

### Property 32: Import Duplicate Prevention

For any template import with a name matching an existing template, the system SHALL reject the import and include the duplicate name in the error response.

**Validates: Requirements 11.5**

### Property 33: Import Initial State

For any successfully imported template, the system SHALL set is_active to false and version to 1.

**Validates: Requirements 11.6**

### Property 34: Search Filter Accuracy

For any search query, the system SHALL return only templates where the search term appears in the name, description, or template text (case-insensitive).

**Validates: Requirements 12.2**

### Property 35: Case-Insensitive Search

For any search query, the system SHALL match templates regardless of the case of the search term or template content.

**Validates: Requirements 12.5**

## Error Handling

### Error Categories

The system handles four categories of errors:

1. Validation Errors
   - Missing required fields
   - Invalid data formats
   - Business rule violations (e.g., duplicate names, deleting active template)
   - Response: 400 Bad Request with detailed error message

2. Authentication/Authorization Errors
   - Missing or invalid JWT token
   - Insufficient permissions (non-admin users)
   - Response: 401 Unauthorized or 403 Forbidden

3. External Service Errors
   - Bedrock API failures (throttling, service errors, invalid requests)
   - Database connection failures
   - S3 upload failures
   - Response: 500 Internal Server Error with retry guidance

4. Not Found Errors
   - Template ID doesn't exist
   - Persona ID doesn't exist
   - Response: 404 Not Found

### Error Response Format

All API errors follow a consistent format:

```json
{
  "error": "ERROR_CODE",
  "message": "Human-readable error description",
  "details": {
    "field": "Additional context"
  },
  "suggestedAction": "What the user should do next",
  "retryAfter": 30
}
```

### Bedrock API Error Handling

The Soul Engine implements comprehensive error handling for Bedrock API calls:

1. Pre-flight Validation
   - Validate prompt is non-empty and under 10,000 characters
   - Validate dimensions are within 512-2048 pixel range
   - Validate template contains all required variables
   - If validation fails, return error without calling Bedrock

2. Throttling Errors (429)
   - Implement exponential backoff: 1s, 2s, 4s
   - Retry up to 3 times
   - Log each retry attempt
   - If all retries fail, update job status to "failed"

3. Service Errors (500, 503)
   - Log complete error response
   - Update job status to "failed"
   - Store error code and message in generation_jobs table
   - Return structured error to caller

4. Invalid Request Errors (400)
   - Log error details
   - Update job status to "failed"
   - Do not retry (client error)
   - Return error with suggested fix

### Error Logging Strategy

All errors are logged with sufficient context for debugging:

```typescript
console.error('Bedrock API Error:', {
  error_code: error.code,
  error_message: error.message,
  status_code: error.statusCode,
  request_id: error.requestId,
  job_id: context.jobId,
  persona_id: context.personaId,
  merchant_id: context.merchantId,
  template_id: context.templateId,
  template_name: context.templateName,
  prompt_length: context.prompt.length,
  dimensions: context.dimensions,
  timestamp: new Date().toISOString()
})
```

### Database Error Handling

Database operations implement error handling:

1. Connection Errors
   - Retry connection up to 3 times
   - Log connection failure details
   - Return 503 Service Unavailable

2. Constraint Violations
   - Unique constraint (duplicate name): Return 400 with clear message
   - Foreign key constraint: Return 400 with relationship explanation
   - Check constraint: Return 400 with validation details

3. Transaction Failures
   - Rollback transaction automatically
   - Log failure reason
   - Return 500 with retry guidance

### Validation Error Aggregation

Template validation collects all errors before returning:

```typescript
interface ValidationResult {
  valid: boolean
  errors: {
    missing_variables?: string[]
    invalid_format?: string[]
    template_too_short?: boolean
    name_empty?: boolean
    name_duplicate?: boolean
    unrecognized_variables?: string[]
  }
  warnings: {
    unrecognized_variables?: string[]
  }
}
```

This allows users to fix all issues at once rather than iteratively.

## Testing Strategy

### Dual Testing Approach

The feature requires both unit tests and property-based tests for comprehensive coverage:

- Unit tests verify specific examples, edge cases, and integration points
- Property-based tests verify universal properties across randomized inputs
- Together they provide comprehensive coverage: unit tests catch concrete bugs, property tests verify general correctness

### Unit Testing

Unit tests focus on:

1. Specific Examples
   - Creating a template with valid data succeeds
   - Activating a template deactivates others
   - Exporting a template produces valid JSON
   - Importing a valid template succeeds

2. Edge Cases
   - Empty template text is rejected
   - Template with 49 characters is rejected (minimum 50)
   - Template with 10,001 characters is rejected (maximum 10,000)
   - Deleting active template is rejected
   - Importing template with duplicate name is rejected

3. Integration Points
   - API endpoints require authentication
   - Soul Engine retrieves active template correctly
   - Database constraints are enforced
   - Migration runs successfully

4. Error Conditions
   - Bedrock API throttling triggers retry
   - Invalid JWT token returns 401
   - Missing required field returns 400
   - Non-existent template ID returns 404

### Property-Based Testing

Property-based tests verify universal properties with randomized inputs. Each test runs minimum 100 iterations.

Test Library: Use fast-check for TypeScript/JavaScript property-based testing.

#### Property Test 1: Complete Error Logging

```typescript
// Feature: prompt-library-and-error-fixes, Property 1: Complete Error Logging
fc.assert(
  fc.property(
    fc.record({
      code: fc.string(),
      message: fc.string(),
      statusCode: fc.integer(),
      requestId: fc.uuid(),
    }),
    fc.record({
      jobId: fc.uuid(),
      personaId: fc.uuid(),
      merchantId: fc.uuid(),
      templateId: fc.uuid(),
    }),
    async (error, context) => {
      const logs = captureConsoleLogs()
      logBedrockError(error, context)
      
      // Verify all required fields are in logs
      expect(logs).toContain(error.code)
      expect(logs).toContain(error.message)
      expect(logs).toContain(error.statusCode.toString())
      expect(logs).toContain(error.requestId)
      expect(logs).toContain(context.jobId)
      expect(logs).toContain(context.personaId)
      expect(logs).toContain(context.merchantId)
      expect(logs).toContain(context.templateId)
    }
  ),
  { numRuns: 100 }
)
```

#### Property Test 2: Missing Variable Error Reporting

```typescript
// Feature: prompt-library-and-error-fixes, Property 2: Missing Variable Error Reporting
fc.assert(
  fc.property(
    fc.string(),
    fc.array(fc.constantFrom('PRODUCT_NAME', 'CHARACTER_TYPE', 'PRODUCT_COLORS', 'VIBE_TAGS', 'PRODUCT_TYPE')),
    async (templateText, missingVars) => {
      // Create template without missing variables
      const template = createTemplateWithoutVariables(templateText, missingVars)
      
      const result = validateTemplateVariables(template, {})
      
      expect(result.valid).toBe(false)
      expect(result.missing).toEqual(expect.arrayContaining(missingVars))
      expect(result.missing.length).toBe(missingVars.length)
    }
  ),
  { numRuns: 100 }
)
```

#### Property Test 3: Single Active Template Constraint

```typescript
// Feature: prompt-library-and-error-fixes, Property 3: Single Active Template Constraint
fc.assert(
  fc.property(
    fc.array(fc.uuid(), { minLength: 2, maxLength: 10 }),
    fc.integer({ min: 0, max: 9 }),
    async (templateIds, activateIndex) => {
      // Setup: Create multiple templates
      for (const id of templateIds) {
        await createTemplate(id, { is_active: false })
      }
      
      // Activate one template
      await activateTemplate(templateIds[activateIndex])
      
      // Verify exactly one is active
      const activeTemplates = await query(
        'SELECT id FROM prompt_templates WHERE is_active = true'
      )
      
      expect(activeTemplates.length).toBe(1)
      expect(activeTemplates[0].id).toBe(templateIds[activateIndex])
    }
  ),
  { numRuns: 100 }
)
```

#### Property Test 4: Template Usage Tracking

```typescript
// Feature: prompt-library-and-error-fixes, Property 4: Template Usage Tracking
fc.assert(
  fc.property(
    fc.uuid(),
    fc.uuid(),
    fc.string({ minLength: 50 }),
    async (templateId, jobId, processedPrompt) => {
      await recordTemplateUsage(jobId, templateId, processedPrompt)
      
      const job = await queryOne(
        'SELECT prompt_template_id, prompt_used FROM generation_jobs WHERE id = $1',
        [jobId]
      )
      
      expect(job.prompt_template_id).toBe(templateId)
      expect(job.prompt_used).toBe(processedPrompt)
    }
  ),
  { numRuns: 100 }
)
```

#### Property Test 5: Template Validation Completeness

```typescript
// Feature: prompt-library-and-error-fixes, Property 5: Template Validation Completeness
fc.assert(
  fc.property(
    fc.record({
      name: fc.option(fc.string(), { nil: undefined }),
      template: fc.option(fc.string(), { nil: undefined }),
      description: fc.option(fc.string(), { nil: undefined }),
    }),
    async (invalidTemplate) => {
      const result = await validateTemplate(invalidTemplate)
      
      if (!result.valid) {
        // Verify template is not saved
        const saved = await queryOne(
          'SELECT id FROM prompt_templates WHERE name = $1',
          [invalidTemplate.name]
        )
        expect(saved).toBeNull()
        
        // Verify all errors are returned
        expect(result.errors).toBeDefined()
        expect(Object.keys(result.errors).length).toBeGreaterThan(0)
      }
    }
  ),
  { numRuns: 100 }
)
```

#### Property Test 6: Template Versioning

```typescript
// Feature: prompt-library-and-error-fixes, Property 6: Template Versioning
fc.assert(
  fc.property(
    fc.uuid(),
    fc.string({ minLength: 50 }),
    fc.string({ minLength: 50 }),
    async (originalId, originalText, newText) => {
      // Create original template
      await createTemplate(originalId, {
        template: originalText,
        version: 1,
        parent_template_id: null
      })
      
      // Edit template
      const updated = await updateTemplate(originalId, { template: newText })
      
      // Verify new version created
      expect(updated.id).not.toBe(originalId)
      expect(updated.version).toBe(2)
      expect(updated.parent_template_id).toBe(originalId)
      expect(updated.template).toBe(newText)
      
      // Verify original still exists
      const original = await getTemplate(originalId)
      expect(original.template).toBe(originalText)
    }
  ),
  { numRuns: 100 }
)
```

#### Property Test 7: Generation Logging Completeness

```typescript
// Feature: prompt-library-and-error-fixes, Property 7: Generation Logging Completeness
fc.assert(
  fc.property(
    fc.record({
      templateId: fc.uuid(),
      templateName: fc.string(),
      unreplacedVars: fc.array(fc.string()),
      timings: fc.record({
        promptProcessing: fc.integer({ min: 1, max: 1000 }),
        bedrockCall: fc.integer({ min: 1000, max: 10000 }),
        s3Upload: fc.integer({ min: 100, max: 5000 }),
      }),
      cost: fc.float({ min: 0.001, max: 0.1 }),
    }),
    async (generationData) => {
      const logs = captureConsoleLogs()
      
      await logGeneration(generationData)
      
      // Verify all required information is logged
      expect(logs).toContain(generationData.templateId)
      expect(logs).toContain(generationData.templateName)
      generationData.unreplacedVars.forEach(v => {
        expect(logs).toContain(v)
      })
      expect(logs).toContain(generationData.timings.promptProcessing.toString())
      expect(logs).toContain(generationData.timings.bedrockCall.toString())
      expect(logs).toContain(generationData.timings.s3Upload.toString())
      expect(logs).toContain(generationData.cost.toString())
    }
  ),
  { numRuns: 100 }
)
```

#### Property Test 8: Export Format Consistency

```typescript
// Feature: prompt-library-and-error-fixes, Property 8: Export Format Consistency
fc.assert(
  fc.property(
    fc.array(
      fc.record({
        name: fc.string(),
        description: fc.string(),
        template: fc.string(),
        variables: fc.array(fc.string()),
      }),
      { minLength: 1, maxLength: 10 }
    ),
    async (templates) => {
      const exported = await exportTemplates(templates.map(t => t.id))
      
      // Verify structure
      expect(exported).toHaveProperty('export_version')
      expect(exported).toHaveProperty('exported_at')
      expect(exported).toHaveProperty('templates')
      expect(Array.isArray(exported.templates)).toBe(true)
      
      // Verify each template has required fields
      exported.templates.forEach(t => {
        expect(t).toHaveProperty('name')
        expect(t).toHaveProperty('description')
        expect(t).toHaveProperty('template')
        expect(t).toHaveProperty('variables')
        expect(Array.isArray(t.variables)).toBe(true)
      })
    }
  ),
  { numRuns: 100 }
)
```

#### Property Test 9: Analytics Calculation Accuracy

```typescript
// Feature: prompt-library-and-error-fixes, Property 9: Analytics Calculation Accuracy
fc.assert(
  fc.property(
    fc.uuid(),
    fc.array(
      fc.record({
        status: fc.constantFrom('completed', 'failed'),
        cost_usd: fc.float({ min: 0.001, max: 0.1 }),
        duration_ms: fc.integer({ min: 1000, max: 10000 }),
      }),
      { minLength: 1, maxLength: 100 }
    ),
    async (templateId, generations) => {
      // Setup: Create generation records
      for (const gen of generations) {
        await createGenerationJob(templateId, gen)
      }
      
      // Get analytics
      const analytics = await getTemplateAnalytics(templateId)
      
      // Verify calculations
      const successful = generations.filter(g => g.status === 'completed')
      const totalCost = successful.reduce((sum, g) => sum + g.cost_usd, 0)
      const totalTime = successful.reduce((sum, g) => sum + g.duration_ms, 0)
      
      expect(analytics.total_generations).toBe(generations.length)
      expect(analytics.successful_generations).toBe(successful.length)
      expect(analytics.success_rate).toBeCloseTo(successful.length / generations.length, 2)
      expect(analytics.avg_cost_usd).toBeCloseTo(totalCost / successful.length, 4)
      expect(analytics.avg_generation_time_ms).toBeCloseTo(totalTime / successful.length, 0)
    }
  ),
  { numRuns: 100 }
)
```

### Test Configuration

All property-based tests must:
- Run minimum 100 iterations (configured via `numRuns: 100`)
- Include feature name and property number in test description
- Use appropriate generators for data types (UUID, string, integer, etc.)
- Clean up test data after execution
- Be tagged with: `Feature: prompt-library-and-error-fixes, Property {number}: {property_text}`

### Integration Testing

Integration tests verify end-to-end workflows:

1. Template Creation Workflow
   - Create template via API
   - Verify template appears in list
   - Test template in playground
   - Activate template
   - Verify template is used for generation

2. Template Versioning Workflow
   - Create template v1
   - Edit template (creates v2)
   - Verify both versions exist
   - Activate v2
   - Revert to v1 (creates v3)
   - Verify version history

3. Error Recovery Workflow
   - Trigger Bedrock throttling error
   - Verify retry attempts
   - Verify error logging
   - Verify job status update

4. Analytics Workflow
   - Perform multiple generations with template
   - Verify analytics calculations
   - Export analytics data
   - Verify export format

### Manual Testing Checklist

Before release, manually verify:

- [ ] Prompt Library UI displays all templates correctly
- [ ] Create template form validates input
- [ ] Edit template creates new version
- [ ] Delete template shows confirmation
- [ ] Cannot delete active template
- [ ] Set as Default updates active template
- [ ] Test Prompt opens Bedrock Playground
- [ ] Bedrock Playground shows template name
- [ ] Generated images display correctly
- [ ] Set as Default button works after test
- [ ] Export downloads JSON file
- [ ] Import accepts valid JSON
- [ ] Import rejects invalid JSON
- [ ] Search filters templates correctly
- [ ] Analytics display correct metrics
- [ ] Error messages are clear and actionable

