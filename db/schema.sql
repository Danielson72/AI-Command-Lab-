-- ============================================
-- AI Command Lab - Phase 0 Schema
-- Hybrid: Best of ChatGPT + Claude
-- ============================================
-- ONLY what Phase 0 needs. Add more in later phases.

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1) BRANDS (Multi-tenant foundation)
-- ============================================
CREATE TABLE brands (
  id TEXT PRIMARY KEY, -- brand_001, brand_002 for readability
  owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  domain TEXT, -- e.g., "sotsvc.com"
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_brands_owner ON brands(owner_user_id);
CREATE INDEX idx_brands_domain ON brands(domain) WHERE domain IS NOT NULL;

-- ============================================
-- 2) BRAND MEMBERS (Multi-user access)
-- ============================================
CREATE TABLE brand_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id TEXT NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'editor', 'viewer')),
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  UNIQUE(brand_id, user_id)
);

CREATE INDEX idx_brand_members_brand ON brand_members(brand_id);
CREATE INDEX idx_brand_members_user ON brand_members(user_id);

-- ============================================
-- 3) PLANS (Stripe product definitions)
-- ============================================
CREATE TABLE plans (
  code TEXT PRIMARY KEY, -- 'free', 'starter', 'pro', 'agency', 'enterprise'
  name TEXT NOT NULL,
  stripe_price_id TEXT, -- Stripe price ID
  limits JSONB NOT NULL DEFAULT '{}', -- {"forms": 3, "content_per_month": 50}
  features JSONB DEFAULT '[]', -- ["lead_engine", "content_studio"]
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4) SUBSCRIPTIONS (Stripe sync)
-- ============================================
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id TEXT NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  plan_code TEXT NOT NULL REFERENCES plans(code),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'trialing', 'incomplete')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(brand_id) -- One active subscription per brand
);

CREATE INDEX idx_subscriptions_brand ON subscriptions(brand_id);
CREATE INDEX idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);

-- ============================================
-- 5) USAGE COUNTERS (Track limits)
-- ============================================
CREATE TABLE usage_counters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id TEXT NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  period TEXT NOT NULL, -- '2025-01' for monthly reset
  key TEXT NOT NULL, -- 'forms_created', 'content_generated', 'site_analyses'
  count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(brand_id, period, key)
);

CREATE INDEX idx_usage_counters_brand_period ON usage_counters(brand_id, period);

-- ============================================
-- 6) FEATURE FLAGS (Toggle features per brand)
-- ============================================
CREATE TABLE feature_flags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id TEXT REFERENCES brands(id) ON DELETE CASCADE, -- NULL = global
  key TEXT NOT NULL, -- 'agent_cockpit', 'visual_workflows'
  enabled BOOLEAN DEFAULT FALSE,
  config JSONB DEFAULT '{}', -- Additional settings
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(brand_id, key)
);

CREATE INDEX idx_feature_flags_brand ON feature_flags(brand_id);
CREATE INDEX idx_feature_flags_key ON feature_flags(key);

-- ============================================
-- 7) AUDIT LOGS (Security trail)
-- ============================================
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id TEXT REFERENCES brands(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL, -- 'brand.created', 'member.invited', 'subscription.updated'
  target TEXT, -- 'brand_001', 'user_uuid'
  meta JSONB DEFAULT '{}', -- Before/after, IP, user agent
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_brand ON audit_logs(brand_id);
CREATE INDEX idx_audit_logs_actor ON audit_logs(actor_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Get all brand IDs user has access to
CREATE OR REPLACE FUNCTION user_brands(user_uuid UUID)
RETURNS TABLE(brand_id TEXT, role TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT bm.brand_id, bm.role
  FROM brand_members bm
  WHERE bm.user_id = user_uuid
    AND bm.accepted_at IS NOT NULL
  UNION
  SELECT b.id, 'owner'::TEXT
  FROM brands b
  WHERE b.owner_user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user can access brand
CREATE OR REPLACE FUNCTION can_access_brand(user_uuid UUID, check_brand_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS(
    SELECT 1 FROM user_brands(user_uuid) WHERE brand_id = check_brand_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- SEED DATA (Optional - insert starter plans)
-- ============================================
INSERT INTO plans (code, name, limits, features, active) VALUES
  ('free', 'Free', 
   '{"forms": 1, "content_per_month": 10, "site_analyses_per_month": 3, "automations": 1, "agent_runs": 0}'::jsonb,
   '["lead_engine"]'::jsonb,
   TRUE),
  ('starter', 'Starter', 
   '{"forms": 3, "content_per_month": 50, "site_analyses_per_month": 10, "automations": 3, "agent_runs": 5}'::jsonb,
   '["lead_engine", "content_studio", "website_analysis"]'::jsonb,
   TRUE),
  ('pro', 'Pro', 
   '{"forms": 10, "content_per_month": 200, "site_analyses_per_month": 50, "automations": 10, "agent_runs": 50}'::jsonb,
   '["lead_engine", "content_studio", "website_analysis", "automations_hub", "ai_agents"]'::jsonb,
   TRUE)
ON CONFLICT (code) DO NOTHING;

