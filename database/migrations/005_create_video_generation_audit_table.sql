-- Migration: Create video_generation_audit table
-- Description: Audit trail for video generation with prompt version tracking

CREATE TABLE IF NOT EXISTS video_generation_audit (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id        VARCHAR(255) NOT NULL UNIQUE,
  character_id    UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
  emotion         VARCHAR(50) NOT NULL,
  prompt_id       UUID REFERENCES emotional_prompts(id) ON DELETE SET NULL,
  prompt_version  INTEGER NOT NULL,
  is_character_specific BOOLEAN NOT NULL,
  generation_timestamp TIMESTAMP DEFAULT NOW(),
  created_at      TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT positive_version CHECK (prompt_version > 0)
);

-- Indexes for audit trail queries
CREATE INDEX IF NOT EXISTS idx_video_generation_audit_video_id 
  ON video_generation_audit(video_id);

CREATE INDEX IF NOT EXISTS idx_video_generation_audit_character_emotion 
  ON video_generation_audit(character_id, emotion);

CREATE INDEX IF NOT EXISTS idx_video_generation_audit_prompt_version 
  ON video_generation_audit(prompt_id, prompt_version);

CREATE INDEX IF NOT EXISTS idx_video_generation_audit_timestamp 
  ON video_generation_audit(generation_timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_video_generation_audit_character 
  ON video_generation_audit(character_id);
