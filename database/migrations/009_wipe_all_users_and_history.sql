-- Migration: Wipe all users and their history
-- Run this to reset the database to a clean state.
-- Admin access: mortadagzar@gmail.com (configured in UserContext)

-- Disable foreign key checks for tables that reference each other
-- Delete in order to respect foreign keys

-- 1. Messages (references conversations)
TRUNCATE TABLE messages CASCADE;

-- 2. Conversations (references personas)
TRUNCATE TABLE conversations CASCADE;

-- 3. Knowledge gaps (references personas)
TRUNCATE TABLE knowledge_gaps CASCADE;

-- 4. Knowledge base (references personas)
TRUNCATE TABLE knowledge_base CASCADE;

-- 5. Character variations (references personas, generation_jobs)
TRUNCATE TABLE character_variations CASCADE;

-- 6. Generation jobs (references personas, merchants)
TRUNCATE TABLE generation_jobs CASCADE;

-- 7. Personas (references merchants)
TRUNCATE TABLE personas CASCADE;

-- 8. Merchants (users)
TRUNCATE TABLE merchants CASCADE;

-- 9. Admin tables (if they exist and reference users)
-- Note: admin tables may reference users(id) - skip if users table doesn't exist
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'admin_test_generations') THEN
    TRUNCATE TABLE admin_test_generations CASCADE;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'admin_audit_logs') THEN
    TRUNCATE TABLE admin_audit_logs CASCADE;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'admin_folder_permissions') THEN
    TRUNCATE TABLE admin_folder_permissions CASCADE;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'admin_media_assets') THEN
    TRUNCATE TABLE admin_media_assets CASCADE;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'admin_media_folders') THEN
    TRUNCATE TABLE admin_media_folders CASCADE;
  END IF;
END $$;

-- 10. Other tables
TRUNCATE TABLE prompt_preview_jobs CASCADE;
TRUNCATE TABLE data_sync_history CASCADE;
TRUNCATE TABLE staging_config CASCADE;

-- Keep: prompt_templates, emotional_prompts, global_emotional_prompts, prompt_versions
-- (these are system/config data, not user data)
