-- Migration: Admin Playground Basics (Phase 8)
-- Creates tables for admin media folders, assets, test generations, and permissions

-- Admin Media Folders Table
CREATE TABLE IF NOT EXISTS admin_media_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_admin_media_folders_created_by ON admin_media_folders(created_by);

-- Admin Media Assets Table
CREATE TABLE IF NOT EXISTS admin_media_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  folder_id UUID NOT NULL REFERENCES admin_media_folders(id) ON DELETE CASCADE,
  asset_name VARCHAR(255) NOT NULL,
  asset_url TEXT NOT NULL,
  asset_type VARCHAR(50) NOT NULL,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_admin_media_assets_folder_id ON admin_media_assets(folder_id);
CREATE INDEX idx_admin_media_assets_created_by ON admin_media_assets(created_by);

-- Admin Test Generations Table
CREATE TABLE IF NOT EXISTS admin_test_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES users(id),
  environment VARCHAR(50) NOT NULL,
  prompt_template_id UUID REFERENCES prompt_templates(id),
  prompt_used TEXT NOT NULL,
  generation_result JSONB,
  cost DECIMAL(10, 4),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP + INTERVAL '30 days'
);

CREATE INDEX idx_admin_test_generations_admin_id ON admin_test_generations(admin_id);
CREATE INDEX idx_admin_test_generations_environment ON admin_test_generations(environment);
CREATE INDEX idx_admin_test_generations_created_at ON admin_test_generations(created_at);
CREATE INDEX idx_admin_test_generations_expires_at ON admin_test_generations(expires_at);

-- Admin Folder Permissions Table
CREATE TABLE IF NOT EXISTS admin_folder_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  folder_id UUID NOT NULL REFERENCES admin_media_folders(id) ON DELETE CASCADE,
  admin_id UUID NOT NULL REFERENCES users(id),
  permission_level VARCHAR(50) NOT NULL DEFAULT 'view',
  granted_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(folder_id, admin_id)
);

CREATE INDEX idx_admin_folder_permissions_folder_id ON admin_folder_permissions(folder_id);
CREATE INDEX idx_admin_folder_permissions_admin_id ON admin_folder_permissions(admin_id);

-- Audit Log Table
CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(100) NOT NULL,
  resource_id UUID,
  details JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_admin_audit_logs_admin_id ON admin_audit_logs(admin_id);
CREATE INDEX idx_admin_audit_logs_action ON admin_audit_logs(action);
CREATE INDEX idx_admin_audit_logs_created_at ON admin_audit_logs(created_at);
