# Requirements Document: Media & Assignments

## Feature Overview

Phase 9 implements a comprehensive media conversion and asset assignment system. The system enables administrators to upload background videos, automatically convert them to multiple formats (GIF, WEBM, thumbnail), assign converted assets to users, and maintain complete audit trails with immediate undo capability.

## Functional Requirements

### FR1: Background Media Converter

#### FR1.1: Video Upload and Queuing
- **Requirement**: System shall accept MP4 video uploads and queue them for conversion
- **Acceptance Criteria**:
  - Accept MP4 files up to 500MB
  - Validate file format before queuing
  - Create asset record with status "pending"
  - Return asset ID to uploader
  - Enqueue job to Redis/SQS within 1 second

#### FR1.2: Format Conversion
- **Requirement**: System shall convert MP4 videos to GIF, WEBM, and generate thumbnails
- **Acceptance Criteria**:
  - Convert MP4 to GIF (animated, max 10 seconds)
  - Convert MP4 to WEBM (H.264 codec, max 1080p)
  - Generate JPEG thumbnail (first frame, 1920x1080)
  - Store all outputs to S3 with unique paths
  - Complete conversion within 5 minutes for typical videos

#### FR1.3: Status Tracking
- **Requirement**: System shall track conversion status through complete lifecycle
- **Acceptance Criteria**:
  - Status transitions: pending → processing → completed OR failed
  - Update status in database for each transition
  - Store conversion error message if failed
  - Prevent invalid state transitions
  - Maintain status history for audit

#### FR1.4: FFmpeg Integration
- **Requirement**: System shall use FFmpeg for video processing
- **Acceptance Criteria**:
  - Invoke FFmpeg with appropriate parameters
  - Handle FFmpeg errors gracefully
  - Capture FFmpeg output and logs
  - Support retry on transient failures
  - Timeout conversion after 10 minutes

#### FR1.5: Async Notifications
- **Requirement**: System shall notify UI of conversion status changes in real-time
- **Acceptance Criteria**:
  - Send notification when status changes
  - Deliver notification within 1 second of status update
  - Support WebSocket or polling mechanism
  - Include asset ID and new status in notification
  - Handle subscriber disconnections gracefully

### FR2: Assignment System

#### FR2.1: Asset Assignment
- **Requirement**: Administrators shall assign converted assets to users
- **Acceptance Criteria**:
  - Accept asset ID and user ID
  - Validate both IDs exist and are valid
  - Only allow assignment of completed assets
  - Create assignment record with timestamp and admin ID
  - Update admin_media_assets with user_id and assigned_at
  - Return assignment ID and undo window expiration time

#### FR2.2: Immediate Undo
- **Requirement**: Administrators shall undo assignments within 30-second window
- **Acceptance Criteria**:
  - Accept undo request within 30 seconds of assignment
  - Reject undo requests after 30 seconds
  - Restore previous asset assignment if one existed
  - Clear user_id from admin_media_assets if no previous asset
  - Log undo action with admin ID and timestamp
  - Return success confirmation

#### FR2.3: Assignment History
- **Requirement**: System shall maintain complete assignment history for each user
- **Acceptance Criteria**:
  - Record all assignments (created, reverted, bulk)
  - Include previous asset reference for each assignment
  - Store admin ID who performed action
  - Store timestamp of action
  - Maintain immutable history (no updates, only inserts)
  - Support filtering by user, date range, action type

#### FR2.4: Revert Capability
- **Requirement**: Administrators shall revert assignments after undo window expires
- **Acceptance Criteria**:
  - Accept target assignment ID
  - Revert to previous asset from that assignment
  - Mark assignment as reverted with timestamp
  - Create new history entry for revert action
  - Log revert with reason and admin ID
  - Return success confirmation

#### FR2.5: Soft Delete
- **Requirement**: System shall preserve all assignment data for audit compliance
- **Acceptance Criteria**:
  - Mark reverted assignments with reverted_at timestamp
  - Never permanently delete assignment records
  - Exclude reverted assignments from active queries
  - Include reverted assignments in audit trail queries
  - Maintain referential integrity

### FR3: Bulk Assignment

#### FR3.1: Bulk Assign Multiple Users
- **Requirement**: Administrators shall assign same asset to multiple users in single operation
- **Acceptance Criteria**:
  - Accept asset ID and array of user IDs
  - Validate all user IDs exist
  - Validate asset is completed
  - Assign asset to all users atomically
  - If any user fails validation, reject entire operation
  - Return count of successful assignments
  - Log bulk assignment action once with user count

#### FR3.2: Bulk Assignment Atomicity
- **Requirement**: Bulk assignments shall succeed or fail as complete unit
- **Acceptance Criteria**:
  - Use database transaction for all assignments
  - Rollback all assignments if any fails
  - Return detailed error for first failure
  - Maintain audit trail of attempted bulk operation
  - Support retry of failed bulk operation

### FR4: Audit Logging

#### FR4.1: Comprehensive Audit Trail
- **Requirement**: System shall maintain immutable audit trail of all operations
- **Acceptance Criteria**:
  - Log all assignments with: who (admin ID), what (asset ID, user ID), when (timestamp)
  - Log all undos with: who, what (asset ID, user ID), when
  - Log all reverts with: who, what (assignment ID, reason), when
  - Log all bulk operations with: who, what (asset ID, user count), when
  - Log all conversion status changes with: asset ID, old status, new status, timestamp
  - Store all logs in assignment_history table
  - Prevent modification of audit entries

#### FR4.2: Audit Trail Retrieval
- **Requirement**: System shall provide queryable audit trail
- **Acceptance Criteria**:
  - Filter audit trail by user ID
  - Filter audit trail by asset ID
  - Filter audit trail by date range
  - Filter audit trail by action type
  - Return results in chronological order
  - Support pagination for large result sets

### FR5: UI Integration

#### FR5.1: BedrockPlayground Integration
- **Requirement**: BedrockPlayground shall display "Assign to User" button for media assets
- **Acceptance Criteria**:
  - Show button only for completed assets
  - Button opens assignment modal
  - Modal accepts user ID or user search
  - Modal shows undo window countdown
  - Modal displays assignment confirmation
  - Button disabled during assignment operation

#### FR5.2: AdminMediaSidebar Status Display
- **Requirement**: AdminMediaSidebar shall display conversion status and assignment info
- **Acceptance Criteria**:
  - Show conversion status (pending/processing/completed/failed)
  - Update status in real-time as conversion progresses
  - Show assigned user name if assigned
  - Show assignment timestamp
  - Show admin who assigned
  - Show error message if conversion failed
  - Provide retry button for failed conversions

#### FR5.3: User Profile Asset Display
- **Requirement**: User profile shall display current asset and assignment history
- **Acceptance Criteria**:
  - Display current assigned asset (GIF or WEBM)
  - Show assignment timestamp
  - Show admin who assigned
  - Display assignment history (last 10 assignments)
  - Show revert button for each history entry
  - Confirm revert action before executing

### FR6: Database Schema

#### FR6.1: admin_media_assets Extensions
- **Requirement**: admin_media_assets table shall track conversion and assignment
- **Acceptance Criteria**:
  - Add conversion_status column (enum: pending, processing, completed, failed)
  - Add gif_url column (nullable string)
  - Add webm_url column (nullable string)
  - Add thumbnail_url column (nullable string)
  - Add conversion_error column (nullable string)
  - Add user_id column (nullable, foreign key to users)
  - Add assigned_at column (nullable timestamp)
  - Add assigned_by column (nullable, foreign key to admins)
  - Create index on user_id for fast lookups
  - Create index on conversion_status for filtering

#### FR6.2: asset_assignments Table
- **Requirement**: New table shall track all asset assignments
- **Acceptance Criteria**:
  - Create asset_assignments table with columns:
    - id (UUID primary key)
    - asset_id (foreign key to admin_media_assets)
    - user_id (foreign key to users)
    - previous_asset_id (nullable, foreign key to admin_media_assets)
    - assigned_by (foreign key to admins)
    - assigned_at (timestamp)
    - reverted_at (nullable timestamp)
    - reverted_by (nullable, foreign key to admins)
    - revert_reason (nullable string)
  - Create index on user_id
  - Create index on asset_id
  - Create index on assigned_at

#### FR6.3: assignment_history Table
- **Requirement**: New table shall maintain audit trail
- **Acceptance Criteria**:
  - Create assignment_history table with columns:
    - id (UUID primary key)
    - user_id (foreign key to users)
    - asset_id (foreign key to admin_media_assets)
    - previous_asset_id (nullable, foreign key to admin_media_assets)
    - action (enum: assigned, reverted, bulk_assigned)
    - performed_by (foreign key to admins)
    - performed_at (timestamp)
    - reason (nullable string)
    - metadata (nullable JSON)
  - Create index on user_id
  - Create index on performed_at
  - Create index on action

#### FR6.4: queue_jobs Table
- **Requirement**: New table shall track conversion jobs
- **Acceptance Criteria**:
  - Create queue_jobs table with columns:
    - id (UUID primary key)
    - asset_id (foreign key to admin_media_assets)
    - job_type (enum: convert_media)
    - status (enum: pending, processing, completed, failed)
    - input_path (string)
    - output_paths (nullable JSON)
    - error (nullable string)
    - retry_count (integer, default 0)
    - max_retries (integer, default 3)
    - created_at (timestamp)
    - started_at (nullable timestamp)
    - completed_at (nullable timestamp)
  - Create index on asset_id
  - Create index on status

### FR7: API Endpoints

#### FR7.1: POST /api/admin/assets/:id/assign
- **Requirement**: Endpoint shall assign asset to user
- **Acceptance Criteria**:
  - Accept asset ID in URL path
  - Accept user ID in request body
  - Validate admin authorization
  - Validate asset exists and is completed
  - Validate user exists
  - Create assignment record
  - Update admin_media_assets
  - Log assignment action
  - Return 201 with assignment object including undo_expires_at
  - Return 400 for validation errors
  - Return 403 for authorization errors
  - Return 404 for not found

#### FR7.2: POST /api/admin/assets/:id/undo-assign
- **Requirement**: Endpoint shall undo assignment within 30-second window
- **Acceptance Criteria**:
  - Accept asset ID in URL path
  - Validate admin authorization
  - Check if assignment is within 30-second window
  - Revert to previous asset if exists
  - Clear user_id if no previous asset
  - Log undo action
  - Return 200 with success message
  - Return 400 if window expired
  - Return 403 for authorization errors
  - Return 404 if assignment not found

#### FR7.3: GET /api/admin/users/:id/assignment-history
- **Requirement**: Endpoint shall retrieve assignment history for user
- **Acceptance Criteria**:
  - Accept user ID in URL path
  - Accept optional limit and offset query parameters
  - Validate admin authorization
  - Return array of assignment history entries
  - Include asset details in response
  - Include admin details in response
  - Support pagination (default limit 50, max 500)
  - Return 200 with history array
  - Return 403 for authorization errors
  - Return 404 if user not found

#### FR7.4: POST /api/admin/users/:id/revert-assignment
- **Requirement**: Endpoint shall revert assignment after undo window expires
- **Acceptance Criteria**:
  - Accept user ID in URL path
  - Accept target assignment ID in request body
  - Accept optional reason in request body
  - Validate admin authorization
  - Validate assignment exists and belongs to user
  - Revert to previous asset from target assignment
  - Mark assignment as reverted
  - Create new history entry
  - Log revert action
  - Return 200 with success message
  - Return 400 for validation errors
  - Return 403 for authorization errors
  - Return 404 if assignment not found

#### FR7.5: POST /api/admin/assets/bulk-assign
- **Requirement**: Endpoint shall assign asset to multiple users
- **Acceptance Criteria**:
  - Accept asset ID in request body
  - Accept array of user IDs in request body
  - Validate admin authorization
  - Validate asset exists and is completed
  - Validate all user IDs exist
  - Assign asset to all users atomically
  - Log bulk assignment action
  - Return 201 with result object:
    - successful_count (number)
    - failed_count (number)
    - failures (array of {user_id, error})
  - Return 400 for validation errors
  - Return 403 for authorization errors

## Non-Functional Requirements

### NFR1: Performance
- **Requirement**: System shall meet performance targets
- **Acceptance Criteria**:
  - Video conversion completes within 5 minutes for typical videos
  - Assignment API responds within 500ms
  - Undo API responds within 200ms
  - History retrieval responds within 1 second for 1000 entries
  - Bulk assignment processes 1000 users within 10 seconds
  - Real-time notifications delivered within 1 second

### NFR2: Scalability
- **Requirement**: System shall scale to handle concurrent operations
- **Acceptance Criteria**:
  - Support 100+ concurrent conversion jobs
  - Support 1000+ concurrent assignment operations
  - Support 10,000+ assignment history entries per user
  - Database queries use appropriate indexes
  - Queue system handles 1000+ jobs per minute

### NFR3: Reliability
- **Requirement**: System shall handle failures gracefully
- **Acceptance Criteria**:
  - Retry failed conversions up to 3 times
  - Implement exponential backoff for retries
  - Preserve data on service failures
  - Maintain audit trail through failures
  - Recover from database connection failures

### NFR4: Security
- **Requirement**: System shall enforce security controls
- **Acceptance Criteria**:
  - Require admin authorization for all operations
  - Validate all user inputs
  - Prevent SQL injection through parameterized queries
  - Encrypt sensitive data in transit
  - Maintain immutable audit trail
  - Implement rate limiting on bulk operations

### NFR5: Compliance
- **Requirement**: System shall maintain compliance requirements
- **Acceptance Criteria**:
  - Maintain complete audit trail for 1 year
  - Support data retention policies
  - Implement soft deletes for compliance
  - Provide audit trail export capability
  - Track all administrative actions

## Constraints

- **Technology**: Must use FFmpeg for video conversion
- **Storage**: Converted files stored in S3 or equivalent
- **Queue**: Use Redis or SQS for job queuing
- **Database**: Use PostgreSQL or equivalent with transaction support
- **Undo Window**: Fixed 30-second window, not configurable
- **Soft Deletes**: All deletions must be soft (marked with timestamp)
- **Audit Trail**: Immutable, cannot be modified or deleted

## Dependencies

- FFmpeg library (external process)
- Redis or SQS (job queue)
- PostgreSQL or equivalent (database)
- S3 or equivalent (file storage)
- WebSocket or polling (real-time notifications)
- Admin authentication system
- User management system
