-- Migration: Create prompt_versions table
-- Description: Immutable version history for all prompt changes

CREATE TABLE IF NOT EXISTS prompt_versions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id       UUID NOT NULL REFERENCES emotional_prompts(id) ON DELETE CASCADE,
  character_id    UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
  emotion         VARCHAR(50) NOT NULL,
  prompt_text     TEXT NOT NULL,
  version         INTEGER NOT NULL,
  created_by      VARCHAR(255) NOT NULL,
  created_at      TIMESTAMP DEFAULT NOW(),
  change_reason   TEXT,
  
  CONSTRAINT non_empty_prompt CHECK (prompt_text != ''),
  CONSTRAINT positive_version CHECK (version > 0),
  UNIQUE(prompt_id, version)
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_prompt_versions_prompt 
  ON prompt_versions(prompt_id);

CREATE INDEX IF NOT EXISTS idx_prompt_versions_character_emotion 
  ON prompt_versions(character_id, emotion);

CREATE INDEX IF NOT EXISTS idx_prompt_versions_created_at 
  ON prompt_versions(created_at DESC);

-- Ensure immutability by preventing updates
CREATE TRIGGER prevent_prompt_version_updates
BEFORE UPDATE ON prompt_versions
FOR EACH ROW
EXECUTE FUNCTION raise_immutable_error();

-- Create the function for immutability check
CREATE OR REPLACE FUNCTION raise_immutable_error()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'prompt_versions table is immutable';
END;
$$ LANGUAGE plpgsql;
