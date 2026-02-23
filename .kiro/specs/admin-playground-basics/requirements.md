# Requirements Document: Admin Playground Basics (Phase 8)

## Introduction

Admin Playground Basics enhances the existing Bedrock Playground with dual-mode testing capabilities (Test/Production), admin media folder management, and production-ready controls. This feature enables administrators to safely test character generation workflows before deploying to production, manage reusable media assets, and maintain a complete audit trail of all generations.

## Glossary

- **Test_Mode**: A sandbox environment using test Bedrock models with lower costs
- **Production_Mode**: The live environment using production Bedrock models with full cost tracking
- **Admin_Media_Folder**: A container for organizing reusable media assets (images, videos, prompts)
- **Admin_Media_Asset**: A reusable media file stored in an admin folder (product images, reference videos, etc.)
- **Generation_History**: Complete audit trail of all test and production generations with metadata
- **Environment_Toggle**: UI control to switch between Test and Production modes
- **Approval_Workflow**: Process for confirming production generation before execution

## Requirements

### Requirement 1: Environment Toggle UI

**User Story:** As an admin, I want to toggle between Test and Production modes, so that I can safely test before deploying to production.

#### Acceptance Criteria

1. THE Bedrock_Playground SHALL display a prominent environment toggle at the top of the interface
2. THE Toggle SHALL show current mode (Test or Production) with clear visual distinction
3. WHEN in Test mode, THE Interface SHALL display a gray indicator
4. WHEN in Production mode, THE Interface SHALL display a red warning indicator
5. WHEN switching to Production mode, THE System SHALL show a confirmation dialog
6. THE Confirmation dialog SHALL warn about cost implications and data persistence
7. WHEN the user confirms, THE System SHALL switch to Production mode
8. WHEN the user cancels, THE System SHALL remain in the current mode
9. THE Toggle state SHALL persist across page refreshes using localStorage

### Requirement 2: Test Mode Generation

**User Story:** As an admin, I want to test character generation in a sandbox environment, so that I can iterate quickly without affecting production.

#### Acceptance Criteria

1. WHEN in Test mode, THE System SHALL use test Bedrock models instead of production models
2. WHEN generating in Test mode, THE System SHALL NOT save results to the production database
3. WHEN generating in Test mode, THE System SHALL display results in a temporary preview panel
4. WHEN generating in Test mode, THE System SHALL track costs but mark them as "test costs"
5. TEST mode generations SHALL expire and be deleted after 30 days
6. WHEN a Test generation completes, THE System SHALL display the full prompt used
7. WHEN a Test generation completes, THE System SHALL display generation cost and time
8. THE Test mode interface SHALL allow rapid iteration (quick re-generation with different prompts)

### Requirement 3: Production Mode Generation

**User Story:** As an admin, I want to generate characters in production with full audit trail, so that I can track all production changes.

#### Acceptance Criteria

1. WHEN in Production mode, THE System SHALL use production Bedrock models
2. WHEN generating in Production mode, THE System SHALL save results to the production database
3. WHEN generating in Production mode, THE System SHALL require explicit confirmation before execution
4. THE Confirmation dialog SHALL display estimated cost and execution time
5. WHEN a Production generation completes, THE System SHALL save the result with full metadata
6. WHEN a Production generation completes, THE System SHALL log the admin ID, timestamp, and prompt used
7. WHEN a Production generation completes, THE System SHALL update the generation_history table
8. Production generations SHALL be retained indefinitely for audit purposes
9. WHEN viewing a Production generation result, THE System SHALL display the admin who created it and when

### Requirement 4: Admin Media Folder Management

**User Story:** As an admin, I want to organize reusable media assets in folders, so that I can quickly access product images and reference materials.

#### Acceptance Criteria

1. THE Bedrock_Playground SHALL display an "Admin Media" sidebar panel
2. THE Sidebar SHALL show a hierarchical list of admin media folders
3. THE Sidebar SHALL provide a "Create Folder" button
4. WHEN creating a folder, THE System SHALL prompt for folder name and description
5. WHEN a folder is created, THE System SHALL store it in the admin_media_folders table
6. THE Sidebar SHALL provide a "Delete Folder" action with confirmation
7. WHEN a folder is deleted, THE System SHALL delete all assets in that folder
8. WHEN clicking a folder, THE System SHALL display all assets in that folder
9. THE Sidebar SHALL show the number of assets in each folder
10. THE Sidebar SHALL sort folders alphabetically

### Requirement 5: Admin Media Asset Upload

**User Story:** As an admin, I want to upload product images and reference materials to media folders, so that I can reuse them for testing.

#### Acceptance Criteria

1. WHEN viewing a folder, THE System SHALL display an "Upload Asset" button
2. WHEN clicking "Upload Asset", THE System SHALL open a file upload dialog
3. THE Upload dialog SHALL accept image files (PNG, JPG, WebP) and video files (MP4, WebM)
4. WHEN a file is selected, THE System SHALL validate file size (max 50MB)
5. WHEN a file is selected, THE System SHALL validate file type
6. WHEN validation passes, THE System SHALL upload the file to S3
7. WHEN upload completes, THE System SHALL store asset metadata in admin_media_assets table
8. WHEN upload completes, THE System SHALL display the asset in the folder view
9. THE System SHALL display upload progress during file transfer
10. IF upload fails, THE System SHALL display an error message with retry option

### Requirement 6: Admin Media Asset Preview and Management

**User Story:** As an admin, I want to preview and manage media assets, so that I can verify content before using it for generation.

#### Acceptance Criteria

1. WHEN viewing a folder, THE System SHALL display all assets as thumbnails
2. WHEN clicking an asset thumbnail, THE System SHALL display a preview panel
3. FOR image assets, THE Preview panel SHALL display the full image
4. FOR video assets, THE Preview panel SHALL display a video player
5. THE Preview panel SHALL display asset name, upload date, and file size
6. THE Preview panel SHALL provide a "Copy URL" button to copy the S3 URL
7. THE Preview panel SHALL provide a "Delete Asset" action with confirmation
8. WHEN an asset is deleted, THE System SHALL remove it from S3 and the database
9. THE Preview panel SHALL provide a "Use in Generation" button
10. WHEN "Use in Generation" is clicked, THE System SHALL pre-fill the product image field with the asset

### Requirement 7: Generation History

**User Story:** As an admin, I want to view a complete history of all test and production generations, so that I can audit and analyze generation patterns.

#### Acceptance Criteria

1. THE Bedrock_Playground SHALL display a "Generation History" panel
2. THE History panel SHALL show all generations (test and production) in reverse chronological order
3. FOR each generation, THE System SHALL display: timestamp, mode (test/production), admin, prompt template used, result status
4. THE History panel SHALL provide filtering by mode (test only, production only, all)
5. THE History panel SHALL provide filtering by date range
6. THE History panel SHALL provide filtering by admin user
7. WHEN clicking a history entry, THE System SHALL display full generation details
8. THE Full details view SHALL display the complete prompt used, generation cost, and result images
9. THE History panel SHALL display the total cost for test and production generations separately
10. THE History panel SHALL be searchable by prompt template name or admin name

### Requirement 8: Admin Media Folder API

**User Story:** As a developer, I want REST API endpoints for admin media folder management, so that I can integrate folder management into the admin interface.

#### Acceptance Criteria

1. THE System SHALL provide GET /api/admin/media-folders to list all folders
2. THE System SHALL provide POST /api/admin/media-folders to create a folder
3. THE System SHALL provide DELETE /api/admin/media-folders/:id to delete a folder
4. THE System SHALL provide GET /api/admin/media-folders/:id/assets to list assets in a folder
5. THE System SHALL provide POST /api/admin/media-folders/:id/assets to upload an asset
6. THE System SHALL provide DELETE /api/admin/media-folders/:id/assets/:assetId to delete an asset
7. ALL endpoints SHALL require Cognito authentication and admin role authorization
8. ALL endpoints SHALL validate request data and return appropriate error messages
9. THE upload endpoint SHALL validate file type and size before accepting
10. THE upload endpoint SHALL return the S3 URL of the uploaded asset

### Requirement 9: Test vs Production Generation API

**User Story:** As a developer, I want separate API endpoints for test and production generation, so that I can route requests to the appropriate environment.

#### Acceptance Criteria

1. THE System SHALL provide POST /api/admin/test-generation for test mode generation
2. THE System SHALL provide POST /api/admin/production-generation for production mode generation
3. BOTH endpoints SHALL accept the same request parameters (prompt, product image, etc.)
4. THE test endpoint SHALL use test Bedrock models and NOT save results to production
5. THE production endpoint SHALL use production Bedrock models and save results to production
6. THE production endpoint SHALL require explicit confirmation parameter
7. BOTH endpoints SHALL return generation job ID and estimated time
8. BOTH endpoints SHALL track and return cost information
9. ALL endpoints SHALL require Cognito authentication and admin role authorization
10. ALL endpoints SHALL log the admin ID and timestamp for audit purposes

### Requirement 10: Cost Tracking per Environment

**User Story:** As an admin, I want to track costs separately for test and production generations, so that I can understand testing expenses vs production expenses.

#### Acceptance Criteria

1. WHEN a Test generation completes, THE System SHALL record the cost in admin_test_generations table
2. WHEN a Production generation completes, THE System SHALL record the cost in generation_jobs table
3. THE Generation History panel SHALL display total test costs and total production costs separately
4. THE Generation History panel SHALL display average cost per generation for each environment
5. THE System SHALL provide a cost breakdown by prompt template
6. THE System SHALL provide a cost breakdown by date range
7. THE System SHALL provide a cost breakdown by admin user
8. THE Cost tracking SHALL be accurate to 4 decimal places
9. THE System SHALL display cost estimates before generation in both modes
10. THE System SHALL display actual cost after generation completes

### Requirement 11: Audit Trail and Logging

**User Story:** As an admin, I want a complete audit trail of all admin actions, so that I can track who did what and when.

#### Acceptance Criteria

1. WHEN an admin creates a media folder, THE System SHALL log: admin ID, timestamp, folder name
2. WHEN an admin uploads an asset, THE System SHALL log: admin ID, timestamp, asset name, folder ID
3. WHEN an admin deletes a folder or asset, THE System SHALL log: admin ID, timestamp, item ID, item name
4. WHEN an admin generates in Test mode, THE System SHALL log: admin ID, timestamp, prompt, result status
5. WHEN an admin generates in Production mode, THE System SHALL log: admin ID, timestamp, prompt, result status, cost
6. ALL audit logs SHALL be immutable and retained indefinitely
7. THE System SHALL provide an audit log viewer for admins to review actions
8. THE Audit log viewer SHALL be filterable by admin, action type, and date range
9. THE Audit log viewer SHALL display all details for each logged action
10. THE Audit logs SHALL include IP address and user agent for security purposes

### Requirement 12: Environment-Specific Bedrock Configuration

**User Story:** As a developer, I want to configure separate Bedrock models for test and production, so that I can control costs and quality independently.

#### Acceptance Criteria

1. THE Soul Engine SHALL support a "mode" parameter (test or production)
2. WHEN mode is "test", THE Soul Engine SHALL use test Bedrock model IDs from environment variables
3. WHEN mode is "production", THE Soul Engine SHALL use production Bedrock model IDs from environment variables
4. THE Test mode models SHALL have lower cost than production models
5. THE Test mode models SHALL be suitable for quick iteration
6. THE Production mode models SHALL be the highest quality available
7. THE Environment variables SHALL be configurable per deployment environment
8. THE Soul Engine SHALL log which model was used for each generation
9. THE System SHALL validate that required model IDs are configured before allowing generation
10. IF a model ID is not configured, THE System SHALL display a helpful error message

### Requirement 13: Media Folder Permissions

**User Story:** As an admin, I want to control who can access media folders, so that I can manage sensitive product images.

#### Acceptance Criteria

1. WHEN a media folder is created, THE System SHALL set the creator as the owner
2. THE Folder owner SHALL be able to view, edit, and delete the folder
3. THE Folder owner SHALL be able to grant access to other admins
4. WHEN access is granted, THE System SHALL store the permission in the database
5. WHEN an admin views media folders, THE System SHALL only show folders they have access to
6. THE System SHALL provide a "Share Folder" action for the folder owner
7. THE Share dialog SHALL allow selecting other admins to grant access
8. THE Share dialog SHALL allow revoking access from previously granted admins
9. THE System SHALL log all permission changes for audit purposes
10. THE System SHALL prevent non-owners from modifying folder permissions
