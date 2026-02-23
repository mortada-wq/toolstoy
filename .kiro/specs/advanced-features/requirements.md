# Requirements Document: Advanced Features

## Functional Requirements

### 1. Emotional States Prompts Module

#### 1.1 Character-Emotion Matrix Management

**Requirement**: The system shall maintain a character-emotion matrix where each character has prompts for each emotional state.

**Details**:
- Supported emotional states: idle, excited, sad, angry, confused, happy, surprised, neutral
- Each character can have character-specific prompts for any emotion
- Character-specific prompts override global default prompts
- If no character-specific prompt exists, the system shall use the global default prompt for that emotion
- The system shall support adding new emotional states without code changes

**Acceptance Criteria**:
- When retrieving a prompt for a character-emotion pair, if character-specific prompt exists, return it
- When retrieving a prompt for a character-emotion pair, if character-specific prompt does not exist, return global default
- When updating a character-specific prompt, the system shall not affect other characters' prompts
- When updating a global default prompt, the system shall not affect existing character-specific prompts

#### 1.2 Version Control for Prompts

**Requirement**: The system shall maintain complete version history for all prompt changes, enabling revert to any previous version.

**Details**:
- Each prompt edit creates a new version record
- Version numbers increment sequentially (1, 2, 3, ...)
- Version records are immutable (cannot be modified after creation)
- Version records include: prompt text, version number, creator, timestamp, change reason
- Admins can revert to any previous version
- Reverting creates a new version record (not a deletion)

**Acceptance Criteria**:
- When updating a prompt, a new version record is created with incremented version number
- Version records cannot be modified after creation
- When reverting to a previous version, the prompt text is restored and a new version is created
- Version history can be retrieved in chronological order
- All versions are preserved in the database (no deletions)

#### 1.3 Test Button Preview Generation

**Requirement**: The system shall provide a test button that generates preview videos using prompts without saving changes.

**Details**:
- Test button generates preview video using current prompt (or provided prompt text)
- Preview videos are temporary and expire after 24 hours
- Preview generation does not modify the saved prompt
- Preview generation does not create a new version
- Admins can test different prompt variations before saving
- Preview status is tracked (pending, processing, completed, failed)

**Acceptance Criteria**:
- When clicking test button, a preview video is generated without saving the prompt
- Preview videos are stored separately from production videos
- Preview videos expire after 24 hours and are cleaned up
- Multiple preview generations can be performed without affecting saved prompts
- Preview generation errors are reported to the admin

#### 1.4 Two-Level Navigation UI

**Requirement**: The admin UI shall provide two-level navigation for managing emotional prompts.

**Details**:
- Level 1: Character selection (list of all characters)
- Level 2: Emotional states list (for selected character)
- Selecting a character displays all emotional states with current prompts
- Clicking an emotional state opens prompt editor
- Navigation state is maintained (can navigate back to character list)
- UI shows whether prompt is character-specific or using global default

**Acceptance Criteria**:
- Admin can select a character from the character list
- After selecting character, emotional states list is displayed
- Admin can click on an emotional state to edit the prompt
- Admin can navigate back to character list
- UI clearly indicates whether prompt is character-specific or global default

#### 1.5 Video Generation Integration

**Requirement**: The system shall use the correct prompt (character-specific or global) when generating videos.

**Details**:
- Video generation service receives the resolved prompt (character-specific or global)
- Prompt variables are substituted before passing to video generation service
- Video generation service does not need to know about character-specific vs. global prompts
- Video generation service receives: character_id, emotion, resolved_prompt_text
- Video generation service returns: video_url, video_id, generation_timestamp

**Acceptance Criteria**:
- When generating a video, the correct prompt is used (character-specific if exists, global otherwise)
- Prompt variables are substituted correctly before video generation
- Video generation service receives the resolved prompt text
- Video generation errors are handled gracefully

#### 1.6 Logging Prompt Version Usage

**Requirement**: The system shall log which prompt version was used for each generated video.

**Details**:
- Each video generation is logged with: video_id, character_id, emotion, prompt_version, prompt_id, generation_timestamp
- Logging occurs after successful video generation
- Logging includes whether prompt was character-specific or global default
- Audit trail enables tracing which prompt version produced which video
- Logging is immutable (cannot be modified after creation)

**Acceptance Criteria**:
- Each generated video is logged with the correct prompt version
- Audit trail can be queried to find all videos generated with a specific prompt version
- Logging includes metadata about whether prompt was character-specific or global
- Logging errors do not prevent video generation

### 2. Staging Environment

#### 2.1 Separate Staging Instance

**Requirement**: The system shall maintain a separate staging environment that mirrors production.

**Details**:
- Staging environment is a complete copy of production infrastructure
- Staging has separate database, storage, and configuration
- Staging is isolated from production (no shared resources)
- Staging can be accessed via separate subdomain (e.g., admin-staging.example.com)
- Staging can be accessed via VPN for additional security
- Staging environment status can be monitored

**Acceptance Criteria**:
- Staging environment is accessible via separate subdomain
- Staging database is separate from production database
- Staging storage is separate from production storage
- Changes in staging do not affect production
- Staging environment status can be retrieved

#### 2.2 Isolated Database and Storage

**Requirement**: The system shall maintain completely isolated database and storage for staging.

**Details**:
- Staging database is separate PostgreSQL instance
- Staging storage is separate S3 bucket
- No shared connections or resources between staging and production
- Database credentials are different for staging and production
- Storage bucket policies restrict access to staging only

**Acceptance Criteria**:
- Staging database is separate from production database
- Staging storage bucket is separate from production bucket
- Data cannot leak between staging and production
- Staging database and storage can be reset independently

#### 2.3 Data Sync with Anonymization

**Requirement**: The system shall sync data from production to staging with PII anonymization.

**Details**:
- Data sync copies all data from production to staging
- Anonymization replaces PII with fake data: names, emails, phone numbers
- Anonymization is consistent (same original value always maps to same fake value)
- Anonymization mapping is maintained for audit purposes
- Data sync can be triggered manually or scheduled automatically
- Data sync status is tracked (pending, in_progress, completed, failed)
- Data sync is idempotent (running twice produces same result)

**Acceptance Criteria**:
- Data sync copies all production data to staging
- User names are replaced with fake names
- User emails are replaced with fake emails
- User phone numbers are replaced with fake numbers
- Anonymization is consistent across all records
- Data sync can be triggered manually
- Data sync status can be monitored

#### 2.4 Admin-Only Access via VPN/Subdomain

**Requirement**: The system shall restrict staging environment access to admins only.

**Details**:
- Staging environment is accessible only to users with admin role
- Access can be restricted to specific VPN network
- Access can be restricted to specific subdomain
- Access attempts are logged (successful and failed)
- Non-admin access attempts are rejected with 403 Forbidden
- Admin role is verified on every request

**Acceptance Criteria**:
- Non-admin users cannot access staging environment
- Admin users can access staging environment
- Access attempts are logged
- VPN requirement can be enforced
- Subdomain restriction can be enforced

#### 2.5 Safe Testing of Features

**Requirement**: The system shall enable admins to safely test prompts, assignments, and features in staging.

**Details**:
- Admins can test prompt changes without affecting production
- Admins can test assignments without affecting production
- Admins can test new features without affecting production
- Changes in staging can be safely reverted
- Staging data can be reset to production state
- Staging environment is completely isolated from production

**Acceptance Criteria**:
- Admins can create, update, and delete prompts in staging
- Admins can create and manage assignments in staging
- Changes in staging do not affect production
- Staging can be reset to production state
- Admins can test features safely in staging

#### 2.6 Export/Import Prompts

**Requirement**: The system shall enable export and import of prompts between staging and production.

**Details**:
- Prompts can be exported to JSON or CSV file
- Export includes all prompt data: character_id, emotion, prompt_text, versions
- Export includes version history for each prompt
- Prompts can be imported from file
- Import validates file format and data integrity
- Import detects conflicts (prompt already exists)
- Import supports conflict resolution strategies: overwrite, skip, merge versions
- Import preserves version history

**Acceptance Criteria**:
- Prompts can be exported to file
- Export file includes all necessary data
- Prompts can be imported from file
- Import validates file format
- Import detects conflicts
- Import can be previewed before applying
- Version history is preserved during import/export

#### 2.7 Configuration Management

**Requirement**: The system shall manage staging environment configuration.

**Details**:
- Staging configuration includes: database URL, storage bucket, subdomain, VPN requirement, sync schedule
- Configuration can be created, updated, and retrieved
- Configuration changes are applied immediately
- Configuration is isolated from production
- Configuration history is maintained for audit purposes

**Acceptance Criteria**:
- Staging configuration can be created
- Staging configuration can be updated
- Staging configuration can be retrieved
- Configuration changes are applied immediately
- Configuration is isolated from production

### 3. Advanced Prompt Features (Optional)

#### 3.1 Prompt Variables Substitution

**Requirement**: The system shall support prompt variables that are substituted dynamically.

**Details**:
- Supported variables: {character_name}, {emotion}, {timestamp}, {user_id}
- Variables are substituted when generating videos
- Variables are substituted when displaying prompts
- Invalid variables are left as-is or reported as errors
- Variable substitution is case-insensitive

**Acceptance Criteria**:
- {character_name} is replaced with actual character name
- {emotion} is replaced with actual emotion
- {timestamp} is replaced with current timestamp
- {user_id} is replaced with actual user ID
- Invalid variables are handled gracefully

#### 3.2 A/B Testing Framework

**Requirement**: The system shall support A/B testing of different prompts.

**Details**:
- Admins can create A/B tests with two prompt variations
- A/B tests can be assigned to characters
- Admin ratings are collected for each variation
- A/B test results can be analyzed
- Winning variation can be promoted to production

**Acceptance Criteria**:
- A/B tests can be created with two prompt variations
- Admin ratings can be collected
- A/B test results can be analyzed
- Winning variation can be identified

#### 3.3 Prompt Templates

**Requirement**: The system shall support reusable prompt templates.

**Details**:
- Prompt templates are reusable structures for multiple emotions/characters
- Templates can include variables and placeholders
- Templates can be applied to multiple emotions/characters
- Template changes can propagate to all applied instances
- Templates can be versioned

**Acceptance Criteria**:
- Prompt templates can be created
- Templates can be applied to multiple emotions/characters
- Template changes can propagate
- Templates can be versioned

## Non-Functional Requirements

### Performance

- Prompt retrieval shall complete within 100ms (cached)
- Prompt update shall complete within 500ms
- Data sync shall complete within 1 hour for 100k+ records
- Preview generation shall start within 5 seconds
- Export/import shall complete within 5 minutes for 1000+ prompts

### Security

- All admin operations shall require authentication and authorization
- All data sync operations shall use encrypted connections
- PII anonymization shall be consistent and irreversible
- Staging environment shall be completely isolated from production
- All access attempts shall be logged and auditable

### Reliability

- Data sync shall be idempotent (safe to retry)
- Version history shall be immutable and complete
- Preview generation failures shall not affect saved prompts
- Import failures shall not partially apply changes (atomic transactions)

### Scalability

- System shall support 1000+ characters
- System shall support 10+ emotional states per character
- System shall support 100k+ version history records
- System shall support concurrent preview generation (10+ simultaneous)

## API Endpoints

### Emotional Prompts Management

**GET /api/admin/characters/:id/emotional-prompts**
- Retrieve all emotional prompts for a character
- Returns: character-specific prompts + global defaults
- Response: { prompts: [{ emotion, prompt_text, version, is_global_override }] }

**POST /api/admin/characters/:id/emotional-prompts/:emotion**
- Create or update emotional prompt for character
- Request: { prompt_text, change_reason? }
- Response: { id, character_id, emotion, prompt_text, version, created_at }

**PUT /api/admin/characters/:id/emotional-prompts/:emotion**
- Update emotional prompt for character
- Request: { prompt_text, change_reason? }
- Response: { id, character_id, emotion, prompt_text, version, updated_at }

**GET /api/admin/characters/:id/emotional-prompts/:emotion/versions**
- Retrieve version history for prompt
- Query params: limit?, offset?
- Response: { versions: [{ version, prompt_text, created_by, created_at }] }

**POST /api/admin/characters/:id/emotional-prompts/:emotion/revert**
- Revert prompt to specific version
- Request: { version_id }
- Response: { id, character_id, emotion, prompt_text, version, reverted_at }

**POST /api/admin/characters/:id/emotional-prompts/:emotion/test**
- Generate preview video for testing
- Request: { prompt_text? } (optional override)
- Response: { preview_id, status, video_url?, expires_at }

### Global Prompts Management

**GET /api/admin/global-prompts/:emotion**
- Retrieve global default prompt for emotion
- Response: { id, emotion, prompt_text, version }

**PUT /api/admin/global-prompts/:emotion**
- Update global default prompt
- Request: { prompt_text, change_reason? }
- Response: { id, emotion, prompt_text, version, updated_at }

### Export/Import

**POST /api/admin/prompts/export**
- Export all prompts to file
- Query params: format? (json|csv)
- Response: { export_id, file_url, created_at }

**POST /api/admin/prompts/import**
- Import prompts from file
- Request: multipart/form-data with file
- Response: { import_id, status, results: { success_count, conflict_count, error_count } }

**GET /api/admin/prompts/import/:id/preview**
- Preview import results before applying
- Response: { prompts: [{ character_id, emotion, action: 'create|update|conflict' }] }

### Staging Environment

**GET /api/admin/staging/status**
- Get staging environment status
- Response: { environment, status, last_sync_at, database_url, storage_bucket }

**POST /api/admin/staging/sync-data**
- Trigger data sync from production to staging
- Request: { anonymize: true, include_versions: true }
- Response: { sync_id, status, started_at }

**GET /api/admin/staging/sync-status/:id**
- Get data sync status
- Response: { sync_id, status, records_synced, records_failed, completed_at? }

**GET /api/admin/staging/config**
- Get staging configuration
- Response: { environment_name, database_url, storage_bucket, admin_subdomain, vpn_required }

**PUT /api/admin/staging/config**
- Update staging configuration
- Request: { database_url?, storage_bucket?, admin_subdomain?, vpn_required?, sync_schedule? }
- Response: { environment_name, database_url, storage_bucket, admin_subdomain, vpn_required }

## Data Validation Rules

### Emotional Prompts

- `character_id`: Must reference valid character
- `emotion`: Must be one of: idle, excited, sad, angry, confused, happy, surprised, neutral
- `prompt_text`: Must not be empty, max 5000 characters
- `version`: Must be positive integer
- `created_by`: Must reference valid admin user

### Global Prompts

- `emotion`: Must be unique, one of: idle, excited, sad, angry, confused, happy, surprised, neutral
- `prompt_text`: Must not be empty, max 5000 characters
- `version`: Must be positive integer

### Staging Configuration

- `environment_name`: Must be unique, alphanumeric with hyphens
- `database_url`: Must be valid PostgreSQL connection string
- `storage_bucket`: Must reference valid S3 bucket
- `admin_subdomain`: Must be valid domain name
- `sync_schedule`: Must be valid cron expression if provided

## Success Metrics

- Admins can manage emotional prompts for 100+ characters
- Data sync completes successfully for 100k+ records
- Preview generation succeeds 99%+ of the time
- Import/export operations complete without data loss
- Staging environment remains isolated from production
- All admin operations are fully auditable
