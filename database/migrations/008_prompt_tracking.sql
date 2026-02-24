-- Migration: Prompt Tracking Columns
-- Adds prompt_template_id and prompt_used tracking to support the Prompt Library feature.
-- Requirements: 2.4, 2.5, 2.6, 7.3, 10.1-10.7

-- Add prompt_template_id to personas table
ALTER TABLE personas 
  ADD COLUMN IF NOT EXISTS prompt_template_id UUID REFERENCES prompt_templates(id);

CREATE INDEX IF NOT EXISTS idx_personas_prompt_template_id 
  ON personas(prompt_template_id);

-- Add prompt_used and prompt_template_id to generation_jobs table
ALTER TABLE generation_jobs 
  ADD COLUMN IF NOT EXISTS prompt_used TEXT,
  ADD COLUMN IF NOT EXISTS prompt_template_id UUID REFERENCES prompt_templates(id);

CREATE INDEX IF NOT EXISTS idx_generation_jobs_prompt_template_id 
  ON generation_jobs(prompt_template_id);

-- Add parent_template_id and version to prompt_templates table for versioning
ALTER TABLE prompt_templates 
  ADD COLUMN IF NOT EXISTS parent_template_id UUID REFERENCES prompt_templates(id),
  ADD COLUMN IF NOT EXISTS version INTEGER NOT NULL DEFAULT 1;

CREATE INDEX IF NOT EXISTS idx_prompt_templates_parent_template_id 
  ON prompt_templates(parent_template_id);

-- Set parent_template_id = NULL for existing templates that don't already have it set
UPDATE prompt_templates
SET parent_template_id = NULL
WHERE parent_template_id IS NOT NULL AND id = parent_template_id;
