-- Migration: Create staging_config table
-- Description: Configuration for staging environment

CREATE TABLE IF NOT EXISTS staging_config (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  environment_name VARCHAR(100) NOT NULL UNIQUE,
  database_url    VARCHAR(500) NOT NULL,
  storage_bucket  VARCHAR(255) NOT NULL,
  admin_subdomain VARCHAR(255),
  vpn_required    BOOLEAN DEFAULT false,
  data_sync_enabled BOOLEAN DEFAULT true,
  sync_schedule   VARCHAR(100),
  last_sync_at    TIMESTAMP,
  last_sync_status VARCHAR(50) DEFAULT 'pending',
  anonymization_enabled BOOLEAN DEFAULT true,
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT valid_sync_status CHECK (last_sync_status IN ('success', 'failed', 'pending'))
);

CREATE INDEX IF NOT EXISTS idx_staging_config_environment 
  ON staging_config(environment_name);
