-- Migration: Create prompt_preview_jobs table
-- Description: Tracks temporary preview video generation jobs

CREATE TABLE IF NOT EXISTS prompt_preview_jobs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id    UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
  emotion         VARCHAR(50) NOT NULL,
  prompt_text     TEXT NOT NULL,
  status          VARCHAR(50) NOT NULL DEFAULT 'pending',
  video_url       VARCHAR(500),
  error           TEXT,
  created_by      VARCHAR(255) NOT NULL,
  created_at      TIMESTAMP DEFAULT NOW(),
  expires_at      TIMESTAMP NOT NULL,
  completed_at    TIMESTAMP,
  
  CONSTRAINT valid_status CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  CONSTRAINT non_empty_prompt CHECK (prompt_text != ''),
  CONSTRAINT valid_expiry CHECK (expires_at > created_at)
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_prompt_preview_jobs_character 
  ON prompt_preview_jobs(character_id);

CREATE INDEX IF NOT EXISTS idx_prompt_preview_jobs_status 
  ON prompt_preview_jobs(status);

CREATE INDEX IF NOT EXISTS idx_prompt_preview_jobs_expires_at 
  ON prompt_preview_jobs(expires_at);

CREATE INDEX IF NOT EXISTS idx_prompt_preview_jobs_created_at 
  ON prompt_preview_jobs(created_at DESC);
