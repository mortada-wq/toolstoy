-- Migration: Create emotional_prompts table
-- Description: Core table for managing character-specific emotional state prompts

CREATE TABLE IF NOT EXISTS emotional_prompts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id    UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
  emotion         VARCHAR(50) NOT NULL,
  prompt_text     TEXT NOT NULL,
  version         INTEGER NOT NULL DEFAULT 1,
  is_global_override BOOLEAN DEFAULT false,
  created_by      VARCHAR(255) NOT NULL,
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_by      VARCHAR(255) NOT NULL,
  updated_at      TIMESTAMP DEFAULT NOW(),
  deleted_at      TIMESTAMP,
  
  CONSTRAINT valid_emotion CHECK (emotion IN ('idle', 'excited', 'sad', 'angry', 'confused', 'happy', 'surprised', 'neutral')),
  CONSTRAINT non_empty_prompt CHECK (prompt_text != ''),
  CONSTRAINT positive_version CHECK (version > 0),
  UNIQUE(character_id, emotion, deleted_at) WHERE deleted_at IS NULL
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_emotional_prompts_character_emotion 
  ON emotional_prompts(character_id, emotion) 
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_emotional_prompts_character 
  ON emotional_prompts(character_id) 
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_emotional_prompts_emotion 
  ON emotional_prompts(emotion) 
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_emotional_prompts_deleted 
  ON emotional_prompts(deleted_at);
