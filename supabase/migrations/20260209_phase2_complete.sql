-- ============================================================================
-- ACL PHASE 2 MIGRATION (COMPLETE & SELF-CONTAINED)
-- Run in Supabase SQL Editor → New Query → Paste → Run
-- Date: 2026-02-09
-- ============================================================================

-- Helper function for updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- BRANDS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,  -- sotsvc, boss-of-clean, etc.
  domain TEXT,
  tagline TEXT,
  active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE brands ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read brands"
  ON brands FOR SELECT TO authenticated USING (true);

CREATE TRIGGER update_brands_updated_at
  BEFORE UPDATE ON brands
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Seed your brands
INSERT INTO brands (name, slug, domain, tagline) VALUES
  ('Sonz of Thunder Services', 'sotsvc', 'sotsvc.com', 'WE BRING THE BOOM TO EVERY ROOM'),
  ('Boss of Clean', 'boss-of-clean', 'bossofclean.com', 'PURRFECTION IS OUR STANDARD'),
  ('Trusted Cleaning Expert', 'trusted-cleaning-expert', 'trustedcleaningexpert.com', 'Your Trusted Source'),
  ('BeatSlave', 'beatslave', 'beatslave.com', 'Production Unleashed'),
  ('DLD Online', 'dld-online', 'dld-online.com', 'Kingdom Commerce'),
  ('Temple Builder', 'temple-builder', NULL, 'Building the Kingdom'),
  ('JM Home Decor', 'jm-home-decor', NULL, 'Designed for Living'),
  ('AllCalculate', 'allcalculate', NULL, 'Calculate Everything')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- PROFILES: Links auth.users to brands
-- ============================================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  role TEXT DEFAULT 'owner',
  brand_ids UUID[] DEFAULT '{}',
  avatar_url TEXT,
  theme TEXT DEFAULT 'dark',  -- dark, light
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

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

-- Drop if exists to avoid conflicts
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- LEADS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES brands(id) ON DELETE SET NULL,
  brand_name TEXT,
  name TEXT NOT NULL DEFAULT '',
  email TEXT,
  phone TEXT,
  source TEXT DEFAULT 'web',
  message TEXT,
  status TEXT DEFAULT 'new',
  contacted BOOLEAN DEFAULT false,
  score INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read leads"
  ON leads FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert leads"
  ON leads FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update leads"
  ON leads FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Anon can insert leads"
  ON leads FOR INSERT TO anon WITH CHECK (true);

CREATE INDEX idx_leads_brand ON leads(brand_id);
CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_created ON leads(created_at DESC);

CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER PUBLICATION supabase_realtime ADD TABLE leads;

-- ============================================================================
-- FEATURE FLAGS
-- ============================================================================
CREATE TABLE IF NOT EXISTS feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  enabled BOOLEAN DEFAULT false,
  brand_ids UUID[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read feature flags"
  ON feature_flags FOR SELECT TO authenticated USING (true);

CREATE TRIGGER update_feature_flags_updated_at
  BEFORE UPDATE ON feature_flags
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

INSERT INTO feature_flags (name, description, enabled) VALUES
  ('lead_dashboard', 'Lead dashboard UI', true),
  ('lead_form_embed', 'Shadow-DOM embeddable lead form', false),
  ('website_analysis', 'Phase 3: Website analysis', false),
  ('content_studio', 'Phase 4: AI content studio', false),
  ('agent_cockpit', 'Phase 5+: Agent approval cockpit', false),
  ('dark_light_theme', 'Theme toggle', true)
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- SEED: Sample leads for dashboard testing
-- ============================================================================
DO $$
DECLARE
  sotsvc_id UUID;
  boc_id UUID;
  tce_id UUID;
BEGIN
  SELECT id INTO sotsvc_id FROM brands WHERE slug = 'sotsvc';
  SELECT id INTO boc_id FROM brands WHERE slug = 'boss-of-clean';
  SELECT id INTO tce_id FROM brands WHERE slug = 'trusted-cleaning-expert';

  INSERT INTO leads (brand_id, brand_name, name, email, phone, source, message, status, contacted, score) VALUES
    (sotsvc_id, 'SOTSVC', 'Marcus Johnson', 'marcus.j@gmail.com', '407-555-0101', 'web', 'Need office cleaning for 5000 sqft space. 3x per week.', 'qualified', true, 82),
    (sotsvc_id, 'SOTSVC', 'Lisa Chen', 'lisa.chen@outlook.com', '321-555-0202', 'form', 'Restaurant deep clean - health inspection prep', 'new', false, 71),
    (sotsvc_id, 'SOTSVC', 'Robert Williams', 'rwilliams@yahoo.com', '407-555-0303', 'n8n', 'Monthly janitorial service for church facility', 'contacted', true, 90),
    (sotsvc_id, 'SOTSVC', 'Amanda Torres', 'atorres@hotmail.com', '689-555-0404', 'web', 'Post-construction cleanup for new building', 'new', false, 65),
    (tce_id, 'Trusted Cleaning Expert', 'David Park', 'dpark@gmail.com', '407-555-0505', 'web', 'Interested in cleaning certification courses', 'new', false, 55),
    (tce_id, 'Trusted Cleaning Expert', 'Sarah Mitchell', 'smitchell@email.com', '321-555-0606', 'form', 'Want to start a cleaning business - need training', 'qualified', true, 78),
    (boc_id, 'Boss of Clean', 'James Cooper', 'jcooper@gmail.com', '407-555-0707', 'web', 'Want to list my cleaning company on directory', 'new', false, 60),
    (sotsvc_id, 'SOTSVC', 'Nicole Adams', 'nadams@outlook.com', '689-555-0808', 'n8n', 'Warehouse floor cleaning and maintenance', 'new', false, 73),
    (tce_id, 'Trusted Cleaning Expert', 'Kevin Brown', 'kbrown@yahoo.com', '321-555-0909', 'form', 'Looking for equipment recommendations', 'contacted', true, 45),
    (sotsvc_id, 'SOTSVC', 'Patricia Gonzalez', 'pgonzalez@gmail.com', '407-555-1010', 'web', 'Need emergency cleanup after water damage', 'new', false, 88),
    (sotsvc_id, 'SOTSVC', 'Michael Wright', 'mwright@email.com', '689-555-1111', 'form', 'Commercial gym daily cleaning service quote', 'qualified', false, 76),
    (boc_id, 'Boss of Clean', 'Jennifer Lee', 'jlee@hotmail.com', '321-555-1212', 'web', 'Searching for residential cleaners in Orlando area', 'new', false, 40);
END $$;

-- ============================================================================
-- DONE: Run this in Supabase SQL Editor
-- Tables: brands, profiles, leads, feature_flags
-- Seed: 8 brands, 12 sample leads, 6 feature flags
-- ============================================================================
