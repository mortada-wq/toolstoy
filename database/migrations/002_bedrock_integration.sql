-- Migration: Bedrock Integration Multi-State Videos
-- Adds support for character variations, state videos, and generation tracking

-- Add new columns to personas table
ALTER TABLE personas
ADD COLUMN IF NOT EXISTS video_states JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS approved_variation_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS generation_metadata JSONB DEFAULT '{}';

-- Update generation_jobs table with new columns
ALTER TABLE generation_jobs
ADD COLUMN IF NOT EXISTS job_type VARCHAR(50) DEFAULT 'character_variations',
ADD COLUMN IF NOT EXISTS product_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS character_type VARCHAR(100),
ADD COLUMN IF NOT EXISTS states_generated TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS total_states INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS cost_usd DECIMAL(10, 4) DEFAULT 0,
ADD COLUMN IF NOT EXISTS error_code VARCHAR(100),
ADD COLUMN IF NOT EXISTS retry_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS variation_urls TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- Create prompt_templates table
CREATE TABLE IF NOT EXISTS prompt_templates (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR(255) NOT NULL,
  template        TEXT NOT NULL,
  description     TEXT,
  is_active       BOOLEAN DEFAULT false,
  variables       TEXT[] DEFAULT '{}',
  version         INTEGER DEFAULT 1,
  created_by      VARCHAR(255),
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);

-- Create character_variations table
CREATE TABLE IF NOT EXISTS character_variations (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  persona_id          UUID REFERENCES personas(id),
  generation_job_id   UUID REFERENCES generation_jobs(id),
  variation_number    INTEGER NOT NULL,
  image_url           VARCHAR(500) NOT NULL,
  s3_key              VARCHAR(500) NOT NULL,
  seed                INTEGER NOT NULL,
  is_approved         BOOLEAN DEFAULT false,
  created_at          TIMESTAMP DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_generation_jobs_merchant_created 
  ON generation_jobs(merchant_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_generation_jobs_persona 
  ON generation_jobs(persona_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_generation_jobs_status 
  ON generation_jobs(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_character_variations_persona 
  ON character_variations(persona_id);

CREATE INDEX IF NOT EXISTS idx_character_variations_job 
  ON character_variations(generation_job_id);

CREATE INDEX IF NOT EXISTS idx_character_variations_approved 
  ON character_variations(is_approved) WHERE is_approved = true;

CREATE INDEX IF NOT EXISTS idx_prompt_templates_active 
  ON prompt_templates(is_active) WHERE is_active = true;

-- Add unique constraint for single active template
CREATE UNIQUE INDEX IF NOT EXISTS idx_prompt_templates_single_active 
  ON prompt_templates(is_active) WHERE is_active = true;

-- Insert default prompt template
INSERT INTO prompt_templates (
  name,
  template,
  description,
  is_active,
  variables,
  created_by
) VALUES (
  'Toolstoy Character Studio - Product Expert',
  'Create a professional AI character that serves as a personal product expert and shopping guide for {PRODUCT_NAME}, a {PRODUCT_TYPE}. This character will interact with customers on e-commerce sites to answer questions and provide advice.

Character Archetype: {CHARACTER_TYPE}
Personality Vibes: {VIBE_TAGS}
Visual Style: Use colors inspired by the product ({PRODUCT_COLORS}), clean and professional design suitable for e-commerce widget embedding.

The character should appear trustworthy, approachable, and knowledgeable - designed to assist customers in making informed purchase decisions. Style should be modern, clean, and optimized for web display at various sizes.',
  'Production template for Toolstoy Character Studio - creates AI product experts that interact with customers',
  true,
  ARRAY['PRODUCT_NAME', 'PRODUCT_TYPE', 'PRODUCT_COLORS', 'CHARACTER_TYPE', 'VIBE_TAGS'],
  'system'
) ON CONFLICT DO NOTHING;

-- Add comments for documentation
COMMENT ON COLUMN personas.video_states IS 'JSONB mapping of state name to CDN URL for animation videos';
COMMENT ON COLUMN personas.approved_variation_id IS 'ID of the approved character variation';
COMMENT ON COLUMN personas.generation_metadata IS 'Metadata about character generation (costs, timestamps, etc.)';
COMMENT ON COLUMN generation_jobs.job_type IS 'Type of generation job: character_variations or state_videos';
COMMENT ON COLUMN generation_jobs.states_generated IS 'Array of state names that have been generated';
COMMENT ON COLUMN generation_jobs.total_states IS 'Total number of states to generate for this job';
COMMENT ON COLUMN generation_jobs.cost_usd IS 'Total cost in USD for this generation job';
COMMENT ON TABLE prompt_templates IS 'Templates for character generation prompts with variable substitution';
COMMENT ON TABLE character_variations IS 'Stores the 3 variations generated for each character';
