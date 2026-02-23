# Tasks: Admin Playground Basics (Phase 8)

## Phase 8 Implementation Tasks

### Task 1: Database Schema for Admin Features
**Requirement:** Req 4, 8, 11
**Description:** Create database tables for admin media folders, assets, and test generations

- [ ] 1.1 Create migration file for admin_media_folders table
- [ ] 1.2 Create migration file for admin_media_assets table
- [ ] 1.3 Create migration file for admin_test_generations table
- [ ] 1.4 Add indexes on folder_id and admin_id for query performance
- [ ] 1.5 Add foreign key constraints with CASCADE delete
- [ ] 1.6 Run migrations and verify schema

### Task 2: Environment Toggle UI Component
**Requirement:** Req 1
**Description:** Build the environment toggle UI with Test/Production modes

- [ ] 2.1 Create EnvironmentToggle.tsx component
- [ ] 2.2 Add toggle state management (Test/Production)
- [ ] 2.3 Add visual indicators (gray for test, red for production)
- [ ] 2.4 Add confirmation dialog for production mode switch
- [ ] 2.5 Persist toggle state to localStorage
- [ ] 2.6 Add keyboard shortcut for mode switching
- [ ] 2.7 Test toggle functionality and persistence

### Task 3: Admin Media Folder Sidebar
**Requirement:** Req 4, 5
**Description:** Build the admin media folder browser sidebar

- [ ] 3.1 Create AdminMediaSidebar.tsx component
- [ ] 3.2 Add folder list display with hierarchy
- [ ] 3.3 Add "Create Folder" button and form
- [ ] 3.4 Add folder deletion with confirmation
- [ ] 3.5 Add asset count display per folder
- [ ] 3.6 Add folder selection and highlighting
- [ ] 3.7 Add alphabetical sorting
- [ ] 3.8 Test folder management functionality

### Task 4: Admin Media Asset Upload
**Requirement:** Req 5
**Description:** Implement file upload for media assets

- [ ] 4.1 Create AssetUploadPanel.tsx component
- [ ] 4.2 Add file input with drag-and-drop support
- [ ] 4.3 Add file type validation (images, videos)
- [ ] 4.4 Add file size validation (max 50MB)
- [ ] 4.5 Add upload progress display
- [ ] 4.6 Integrate with S3 upload service
- [ ] 4.7 Store asset metadata in database
- [ ] 4.8 Add error handling and retry logic
- [ ] 4.9 Test upload with various file types

### Task 5: Admin Media Asset Preview
**Requirement:** Req 6
**Description:** Build asset preview and management interface

- [ ] 5.1 Create AssetPreviewPanel.tsx component
- [ ] 5.2 Add image preview display
- [ ] 5.3 Add video player for video assets
- [ ] 5.4 Add asset metadata display (name, date, size)
- [ ] 5.5 Add "Copy URL" button
- [ ] 5.6 Add "Delete Asset" action with confirmation
- [ ] 5.7 Add "Use in Generation" button
- [ ] 5.8 Test preview functionality with different asset types

### Task 6: Test Mode Generation Endpoint
**Requirement:** Req 2, 9, 12
**Description:** Create API endpoint for test mode generation

- [ ] 6.1 Add POST /api/admin/test-generation endpoint
- [ ] 6.2 Add test mode parameter to Soul Engine invocation
- [ ] 6.3 Configure test Bedrock model IDs
- [ ] 6.4 Implement test generation without production database save
- [ ] 6.5 Add cost tracking for test generations
- [ ] 6.6 Store test generation in admin_test_generations table
- [ ] 6.7 Add 30-day expiration for test generations
- [ ] 6.8 Add comprehensive error handling
- [ ] 6.9 Test endpoint with various prompts

### Task 7: Production Mode Generation Endpoint
**Requirement:** Req 3, 9, 12
**Description:** Create API endpoint for production mode generation

- [ ] 7.1 Add POST /api/admin/production-generation endpoint
- [ ] 7.2 Add confirmation parameter requirement
- [ ] 7.3 Add production Bedrock model configuration
- [ ] 7.4 Implement production database save
- [ ] 7.5 Add cost tracking for production generations
- [ ] 7.6 Add admin ID and timestamp logging
- [ ] 7.7 Add comprehensive error handling
- [ ] 7.8 Test endpoint with confirmation workflow

### Task 8: Admin Media Folder API Endpoints
**Requirement:** Req 8
**Description:** Implement REST API for media folder management

- [ ] 8.1 Add GET /api/admin/media-folders endpoint
- [ ] 8.2 Add POST /api/admin/media-folders endpoint
- [ ] 8.3 Add DELETE /api/admin/media-folders/:id endpoint
- [ ] 8.4 Add GET /api/admin/media-folders/:id/assets endpoint
- [ ] 8.5 Add POST /api/admin/media-folders/:id/assets endpoint
- [ ] 8.6 Add DELETE /api/admin/media-folders/:id/assets/:assetId endpoint
- [ ] 8.7 Add admin authorization checks to all endpoints
- [ ] 8.8 Add request validation and error handling
- [ ] 8.9 Test all endpoints with various scenarios

### Task 9: Generation History Panel
**Requirement:** Req 7
**Description:** Build generation history viewer with filtering

- [ ] 9.1 Create GenerationHistoryPanel.tsx component
- [ ] 9.2 Add generation list display (reverse chronological)
- [ ] 9.3 Add mode filter (test, production, all)
- [ ] 9.4 Add date range filter
- [ ] 9.5 Add admin user filter
- [ ] 9.6 Add search functionality
- [ ] 9.7 Add generation detail view
- [ ] 9.8 Add cost summary display (test vs production)
- [ ] 9.9 Test filtering and search functionality

### Task 10: Cost Tracking and Display
**Requirement:** Req 10
**Description:** Implement cost tracking per environment

- [ ] 10.1 Add cost calculation for test generations
- [ ] 10.2 Add cost calculation for production generations
- [ ] 10.3 Add cost display in generation history
- [ ] 10.4 Add cost breakdown by template
- [ ] 10.5 Add cost breakdown by date range
- [ ] 10.6 Add cost breakdown by admin user
- [ ] 10.7 Add cost estimates before generation
- [ ] 10.8 Add actual cost display after generation
- [ ] 10.9 Test cost calculations accuracy

### Task 11: Audit Trail Implementation
**Requirement:** Req 11
**Description:** Implement comprehensive audit logging

- [ ] 11.1 Create audit logging service
- [ ] 11.2 Add logging for folder creation
- [ ] 11.3 Add logging for asset upload
- [ ] 11.4 Add logging for folder/asset deletion
- [ ] 11.5 Add logging for test generation
- [ ] 11.6 Add logging for production generation
- [ ] 11.7 Add IP address and user agent capture
- [ ] 11.8 Create audit log viewer component
- [ ] 11.9 Add filtering by admin, action type, date
- [ ] 11.10 Test audit logging completeness

### Task 12: Environment-Specific Bedrock Configuration
**Requirement:** Req 12
**Description:** Configure separate Bedrock models for test and production

- [ ] 12.1 Add test mode model IDs to environment variables
- [ ] 12.2 Add production mode model IDs to environment variables
- [ ] 12.3 Update Soul Engine to accept mode parameter
- [ ] 12.4 Add model ID validation before generation
- [ ] 12.5 Add model selection logic based on mode
- [ ] 12.6 Add model ID logging for each generation
- [ ] 12.7 Add error handling for missing model IDs
- [ ] 12.8 Test model switching between modes

### Task 13: Media Folder Permissions
**Requirement:** Req 13
**Description:** Implement folder access control

- [ ] 13.1 Create admin_folder_permissions table
- [ ] 13.2 Add folder owner tracking
- [ ] 13.3 Add permission grant/revoke functionality
- [ ] 13.4 Add permission check in folder access
- [ ] 13.5 Create ShareFolderDialog.tsx component
- [ ] 13.6 Add permission change logging
- [ ] 13.7 Add permission viewer in folder details
- [ ] 13.8 Test permission enforcement

### Task 14: Integration with Existing BedrockPlayground
**Requirement:** Req 1-13
**Description:** Integrate all new features into BedrockPlayground component

- [ ] 14.1 Add environment toggle to BedrockPlayground header
- [ ] 14.2 Add admin media sidebar to BedrockPlayground
- [ ] 14.3 Add generation history panel to BedrockPlayground
- [ ] 14.4 Update generation flow to use environment-specific endpoints
- [ ] 14.5 Add cost display to generation results
- [ ] 14.6 Add prompt template selection to generation form
- [ ] 14.7 Add "Use in Generation" flow from media assets
- [ ] 14.8 Test full integration workflow

### Task 15: Testing and QA
**Requirement:** All
**Description:** Comprehensive testing of all Phase 8 features

- [ ] 15.1 Test environment toggle functionality
- [ ] 15.2 Test test mode generation (no production save)
- [ ] 15.3 Test production mode generation (with save)
- [ ] 15.4 Test media folder CRUD operations
- [ ] 15.5 Test asset upload with various file types
- [ ] 15.6 Test asset preview and management
- [ ] 15.7 Test generation history filtering and search
- [ ] 15.8 Test cost tracking accuracy
- [ ] 15.9 Test audit logging completeness
- [ ] 15.10 Test permission enforcement
- [ ] 15.11 Test error handling and edge cases
- [ ] 15.12 Performance testing with large asset libraries

### Task 16: Documentation
**Requirement:** All
**Description:** Create documentation for Phase 8 features

- [ ] 16.1 Document admin media folder workflow
- [ ] 16.2 Document test vs production generation
- [ ] 16.3 Document cost tracking and analytics
- [ ] 16.4 Document audit trail access
- [ ] 16.5 Document permission management
- [ ] 16.6 Create API documentation for new endpoints
- [ ] 16.7 Create user guide for admin playground
- [ ] 16.8 Create troubleshooting guide

## Task Dependencies

- Task 1 (Database) must complete before Tasks 6, 7, 8, 11, 13
- Task 2 (Environment Toggle) must complete before Task 14
- Task 3 (Sidebar) must complete before Task 14
- Task 4 (Upload) must complete before Task 5
- Task 5 (Preview) must complete before Task 14
- Tasks 6, 7, 8, 9, 10, 11, 12, 13 can run in parallel
- Task 14 (Integration) requires Tasks 2, 3, 5, 6, 7, 8, 9, 10, 12, 13
- Task 15 (Testing) requires Task 14
- Task 16 (Documentation) can run in parallel with other tasks

## Estimated Effort

- Database Schema: 2-3 hours
- UI Components: 8-10 hours
- API Endpoints: 6-8 hours
- Integration: 4-6 hours
- Testing: 6-8 hours
- Documentation: 3-4 hours

**Total Estimated Effort: 29-39 hours**
