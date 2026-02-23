# Tasks: Media & Assignments

## Phase 1: Database Schema & Infrastructure

### 1.1 Create Database Migrations
- [ ] Create migration for admin_media_assets extensions (conversion_status, gif_url, webm_url, thumbnail_url, user_id, assigned_at, assigned_by)
- [ ] Create migration for asset_assignments table
- [ ] Create migration for assignment_history table
- [ ] Create migration for queue_jobs table
- [ ] Add indexes on user_id, asset_id, conversion_status, assigned_at, performed_at
- [ ] Add foreign key constraints
- [ ] Test migrations on development database
- [ ] Document schema changes

### 1.2 Set Up Queue Infrastructure
- [ ] Configure Redis or SQS connection
- [ ] Create queue job schema
- [ ] Implement queue client wrapper
- [ ] Set up job serialization/deserialization
- [ ] Implement job retry logic with exponential backoff
- [ ] Add queue monitoring and metrics
- [ ] Test queue operations

### 1.3 Configure FFmpeg Integration
- [ ] Verify FFmpeg installation on worker servers
- [ ] Create FFmpeg wrapper service
- [ ] Implement video validation (format, codec, duration)
- [ ] Implement conversion parameters (GIF, WEBM, thumbnail)
- [ ] Add error handling and logging
- [ ] Test FFmpeg conversions with sample videos

## Phase 2: Media Converter Service

### 2.1 Implement Media Converter Service
- [ ] Create MediaConverterService class
- [ ] Implement queueConversion() method
- [ ] Implement getConversionStatus() method
- [ ] Implement handleConversionComplete() method
- [ ] Implement handleConversionFailure() method
- [ ] Add logging and error handling
- [ ] Write unit tests for service methods

### 2.2 Implement Conversion Worker
- [ ] Create worker process for dequeuing jobs
- [ ] Implement job processing loop
- [ ] Implement FFmpeg invocation
- [ ] Implement output file handling
- [ ] Implement status updates to database
- [ ] Implement error handling and retry logic
- [ ] Add worker monitoring and health checks
- [ ] Write integration tests

### 2.3 Implement Notification Service
- [ ] Create NotificationService class
- [ ] Implement subscription management
- [ ] Implement WebSocket or polling mechanism
- [ ] Implement status change publishing
- [ ] Implement subscriber cleanup
- [ ] Add error handling for delivery failures
- [ ] Write unit tests

### 2.4 Create Media Upload Endpoint
- [ ] Create POST /api/admin/assets/upload endpoint
- [ ] Implement file validation
- [ ] Implement asset record creation
- [ ] Implement job queuing
- [ ] Add authorization checks
- [ ] Add error handling
- [ ] Write integration tests

## Phase 3: Assignment Service

### 3.1 Implement Assignment Service
- [ ] Create AssignmentService class
- [ ] Implement assignAsset() method
- [ ] Implement undoAssignment() method
- [ ] Implement getAssignmentHistory() method
- [ ] Implement revertAssignment() method
- [ ] Implement bulkAssignAsset() method
- [ ] Add 30-second undo window enforcement
- [ ] Add transaction support for atomicity
- [ ] Write unit tests

### 3.2 Implement Audit Logger
- [ ] Create AuditLogger class
- [ ] Implement logAssignment() method
- [ ] Implement logConversionStatusChange() method
- [ ] Implement getAuditTrail() method
- [ ] Add filtering and querying capabilities
- [ ] Ensure immutability of audit entries
- [ ] Write unit tests

### 3.3 Create Assignment API Endpoints
- [ ] Create POST /api/admin/assets/:id/assign endpoint
- [ ] Create POST /api/admin/assets/:id/undo-assign endpoint
- [ ] Create GET /api/admin/users/:id/assignment-history endpoint
- [ ] Create POST /api/admin/users/:id/revert-assignment endpoint
- [ ] Create POST /api/admin/assets/bulk-assign endpoint
- [ ] Add authorization checks to all endpoints
- [ ] Add input validation
- [ ] Add error handling
- [ ] Write integration tests

## Phase 4: UI Integration

### 4.1 Update BedrockPlayground Component
- [ ] Add "Assign to User" button to media assets
- [ ] Create assignment modal component
- [ ] Implement user search/selection
- [ ] Implement undo countdown timer
- [ ] Implement assignment confirmation
- [ ] Add loading states
- [ ] Add error handling
- [ ] Write component tests

### 4.2 Update AdminMediaSidebar Component
- [ ] Add conversion status display
- [ ] Implement real-time status updates
- [ ] Add assigned user display
- [ ] Add assignment timestamp display
- [ ] Add admin name display
- [ ] Add error message display
- [ ] Add retry button for failed conversions
- [ ] Write component tests

### 4.3 Update User Profile Component
- [ ] Add current asset display
- [ ] Add assignment history section
- [ ] Implement history list with pagination
- [ ] Add revert button for each history entry
- [ ] Implement revert confirmation modal
- [ ] Add loading states
- [ ] Add error handling
- [ ] Write component tests

### 4.4 Create Real-Time Update Integration
- [ ] Connect UI components to notification service
- [ ] Implement WebSocket or polling subscription
- [ ] Handle connection failures and reconnection
- [ ] Update UI on status changes
- [ ] Clean up subscriptions on unmount
- [ ] Write integration tests

## Phase 5: Testing & Quality Assurance

### 5.1 Property-Based Tests
- [ ] PBT: Undo window enforcement (undo succeeds within 30s, fails after)
- [ ] PBT: Assignment history immutability (audit entries cannot be modified)
- [ ] PBT: Previous asset tracking consistency (each assignment references previous correctly)
- [ ] PBT: Bulk assignment atomicity (all succeed or all fail)
- [ ] PBT: Conversion status transitions (only valid transitions occur)
- [ ] PBT: Soft delete preservation (deleted assignments remain in database)

### 5.2 Integration Tests
- [ ] Test full upload → conversion → assignment flow
- [ ] Test assignment → undo → reassignment flow
- [ ] Test bulk assignment with multiple users
- [ ] Test concurrent operations and race conditions
- [ ] Test notification delivery
- [ ] Test database transaction rollback
- [ ] Test error scenarios and recovery

### 5.3 Performance Tests
- [ ] Test conversion performance with various video sizes
- [ ] Test assignment API response times
- [ ] Test bulk assignment with 1000+ users
- [ ] Test database query performance with indexes
- [ ] Test queue throughput
- [ ] Load test with concurrent operations

### 5.4 Security Tests
- [ ] Test authorization on all endpoints
- [ ] Test input validation
- [ ] Test SQL injection prevention
- [ ] Test audit trail immutability
- [ ] Test rate limiting on bulk operations

## Phase 6: Documentation & Deployment

### 6.1 Create Documentation
- [ ] Document API endpoints with examples
- [ ] Document database schema
- [ ] Document configuration options
- [ ] Document deployment procedures
- [ ] Document troubleshooting guide
- [ ] Document audit trail access procedures

### 6.2 Deployment Preparation
- [ ] Create deployment checklist
- [ ] Set up monitoring and alerting
- [ ] Create rollback procedures
- [ ] Test deployment on staging
- [ ] Prepare runbooks for common issues
- [ ] Brief operations team

### 6.3 Production Deployment
- [ ] Deploy database migrations
- [ ] Deploy backend services
- [ ] Deploy worker processes
- [ ] Deploy UI components
- [ ] Monitor for errors and issues
- [ ] Verify all functionality in production

## Phase 7: Post-Launch

### 7.1 Monitoring & Maintenance
- [ ] Monitor conversion success rates
- [ ] Monitor API response times
- [ ] Monitor queue depth and processing time
- [ ] Monitor database performance
- [ ] Monitor error rates
- [ ] Collect user feedback

### 7.2 Optimization
- [ ] Optimize slow queries based on monitoring
- [ ] Optimize FFmpeg parameters based on results
- [ ] Optimize queue processing based on throughput
- [ ] Optimize UI performance based on user feedback

### 7.3 Bug Fixes & Enhancements
- [ ] Address any reported issues
- [ ] Implement requested enhancements
- [ ] Improve error messages based on user feedback
- [ ] Enhance audit trail reporting
