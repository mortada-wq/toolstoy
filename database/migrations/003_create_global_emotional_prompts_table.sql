-- Migration: Create global_emotional_prompts table
-- Description: Global default prompts for each emotional state

CREATE TABLE IF NOT EXISTS global_emotional_prompts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  emotion         VARCHAR(50) NOT NULL UNIQUE,
  prompt_text     TEXT NOT NULL,
  version         INTEGER NOT NULL DEFAULT 1,
  created_by      VARCHAR(255) NOT NULL,
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_by      VARCHAR(255) NOT NULL,
  updated_at      TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT valid_emotion CHECK (emotion IN ('idle', 'excited', 'sad', 'angry', 'confused', 'happy', 'surprised', 'neutral')),
  CONSTRAINT non_empty_prompt CHECK (prompt_text != ''),
  CONSTRAINT positive_version CHECK (version > 0)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_global_emotional_prompts_emotion 
  ON global_emotional_prompts(emotion);
