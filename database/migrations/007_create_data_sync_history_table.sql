-- Migration: Create data_sync_history table
-- Description: Track data sync operations between production and staging

CREATE TABLE IF NOT EXISTS data_sync_history (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sync_id         VARCHAR(255) NOT NULL UNIQUE,
  environment     VARCHAR(100) NOT NULL,
  status          VARCHAR(50) NOT NULL DEFAULT 'pending',
  records_synced  INTEGER DEFAULT 0,
  records_failed  INTEGER DEFAULT 0,
  anonymization_applied BOOLEAN DEFAULT false,
  started_at      TIMESTAMP DEFAULT NOW(),
  completed_at    TIMESTAMP,
  error_message   TEXT,
  initiated_by    VARCHAR(255) NOT NULL,
  
  CONSTRAINT valid_status CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')),
  CONSTRAINT non_negative_records CHECK (records_synced >= 0 AND records_failed >= 0)
);

CREATE INDEX IF NOT EXISTS idx_data_sync_history_sync_id 
  ON data_sync_history(sync_id);

CREATE INDEX IF NOT EXISTS idx_data_sync_history_environment 
  ON data_sync_history(environment);

CREATE INDEX IF NOT EXISTS idx_data_sync_history_status 
  ON data_sync_history(status);

CREATE INDEX IF NOT EXISTS idx_data_sync_history_started_at 
  ON data_sync_history(started_at DESC);
