-- ============================================================================
-- ACL PHASE 2 MIGRATION: Leads, Profiles, Feature Flags
-- Run in Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- PROFILES: Links auth.users to brands
-- ============================================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  role TEXT DEFAULT 'owner',  -- owner, admin, member
  brand_ids UUID[] DEFAULT '{}',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles RLS: Users can read/update their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================================
-- LEADS: Core lead capture table
-- ============================================================================
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES brands(id) ON DELETE SET NULL,
  brand_name TEXT,
  name TEXT NOT NULL DEFAULT '',
  email TEXT,
  phone TEXT,
  source TEXT DEFAULT 'web',  -- web, form, api, import, n8n
  message TEXT,
  status TEXT DEFAULT 'new',  -- new, qualified, contacted, converted, lost
  contacted BOOLEAN DEFAULT false,
  score INTEGER DEFAULT 0,    -- 0-100 lead quality score
  metadata JSONB DEFAULT '{}',
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Leads RLS: Authenticated users can read all leads (multi-tenant filtering via app logic)
CREATE POLICY "Authenticated users can read leads"
  ON leads FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert leads"
  ON leads FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update leads"
  ON leads FOR UPDATE
  TO authenticated
  USING (true);

-- Anon users can insert leads (for public lead forms)
CREATE POLICY "Anon can insert leads"
  ON leads FOR INSERT
  TO anon
  WITH CHECK (true);

-- Leads indexes
CREATE INDEX idx_leads_brand ON leads(brand_id);
CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_contacted ON leads(contacted);
CREATE INDEX idx_leads_created ON leads(created_at DESC);

-- Leads updated_at trigger
CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable realtime for leads
ALTER PUBLICATION supabase_realtime ADD TABLE leads;

-- ============================================================================
-- FEATURE FLAGS
-- ============================================================================
CREATE TABLE IF NOT EXISTS feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  enabled BOOLEAN DEFAULT false,
  brand_ids UUID[] DEFAULT '{}',  -- empty = all brands, specific = only those
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read feature flags"
  ON feature_flags FOR SELECT
  TO authenticated
  USING (true);

-- Feature flags trigger
CREATE TRIGGER update_feature_flags_updated_at
  BEFORE UPDATE ON feature_flags
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SEED: Default feature flags
-- ============================================================================
INSERT INTO feature_flags (name, description, enabled) VALUES
  ('lead_dashboard', 'Lead dashboard UI in ACL', true),
  ('lead_form_embed', 'Shadow-DOM embeddable lead form', false),
  ('website_analysis', 'Phase 3: Website analysis hub', false),
  ('content_studio', 'Phase 4: AI content studio', false),
  ('agent_cockpit', 'Phase 5+: Agent approval cockpit', false)
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- DONE
-- ============================================================================
