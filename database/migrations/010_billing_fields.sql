-- Add Stripe and billing fields to merchants table
-- Run against your RDS PostgreSQL database.

ALTER TABLE merchants ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255);
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS stripe_subscription_id VARCHAR(255);
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS plan_started_at TIMESTAMP;
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS plan_expires_at TIMESTAMP;
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS plan_limits JSONB DEFAULT '{"characters":1,"conversations":100,"qa_pairs":10}';
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS conversations_this_month INTEGER DEFAULT 0;
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS conversations_reset_at TIMESTAMP;

-- Index for Stripe webhook lookups
CREATE INDEX IF NOT EXISTS idx_merchants_stripe_customer ON merchants(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_merchants_stripe_subscription ON merchants(stripe_subscription_id) WHERE stripe_subscription_id IS NOT NULL;
