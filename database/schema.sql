-- Toolstoy Phase 4 — RDS PostgreSQL Schema
-- Run this against your RDS PostgreSQL database after provisioning.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS merchants (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cognito_id      VARCHAR(255) UNIQUE NOT NULL,
  email           VARCHAR(255) UNIQUE NOT NULL,
  name            VARCHAR(255) NOT NULL,
  store_url       VARCHAR(500),
  plan            VARCHAR(50) DEFAULT 'free',
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS personas (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id     UUID REFERENCES merchants(id),
  name            VARCHAR(255),
  product_name    VARCHAR(255),
  product_url     VARCHAR(500),
  character_type  VARCHAR(100),
  vibe_tags       TEXT[],
  catchphrase     TEXT,
  greeting        TEXT,
  personality     JSONB,
  character_bible JSONB,
  status          VARCHAR(50) DEFAULT 'draft',
  image_url       VARCHAR(500),
  widget_layout   VARCHAR(100) DEFAULT 'side-by-side',
  widget_position VARCHAR(50) DEFAULT 'bottom-right',
  widget_trigger  VARCHAR(100) DEFAULT '45-seconds',
  embed_token     VARCHAR(255) UNIQUE,
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS knowledge_base (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  persona_id      UUID REFERENCES personas(id),
  question        TEXT NOT NULL,
  answer          TEXT NOT NULL,
  source          VARCHAR(100),
  approved        BOOLEAN DEFAULT true,
  created_at      TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS generation_jobs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  persona_id      UUID REFERENCES personas(id),
  merchant_id     UUID REFERENCES merchants(id),
  status          VARCHAR(50) DEFAULT 'queued',
  current_step    VARCHAR(100),
  error_message   TEXT,
  started_at      TIMESTAMP,
  completed_at    TIMESTAMP,
  created_at      TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS conversations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  persona_id      UUID REFERENCES personas(id),
  session_id      VARCHAR(255) NOT NULL,
  page_url        VARCHAR(500),
  page_type       VARCHAR(100),
  started_at      TIMESTAMP DEFAULT NOW(),
  last_message_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id),
  role            VARCHAR(50),
  content         TEXT NOT NULL,
  confidence      FLOAT,
  animation_state VARCHAR(50),
  created_at      TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS knowledge_gaps (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  persona_id      UUID REFERENCES personas(id),
  question        TEXT NOT NULL,
  asked_count     INTEGER DEFAULT 1,
  suggested_answer TEXT,
  status          VARCHAR(50) DEFAULT 'pending',
  created_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_personas_merchant ON personas(merchant_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_persona ON knowledge_base(persona_id);
CREATE INDEX IF NOT EXISTS idx_generation_jobs_persona ON generation_jobs(persona_id);
CREATE INDEX IF NOT EXISTS idx_conversations_persona ON conversations(persona_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_gaps_persona ON knowledge_gaps(persona_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_personas_embed_token ON personas(embed_token) WHERE embed_token IS NOT NULL;
