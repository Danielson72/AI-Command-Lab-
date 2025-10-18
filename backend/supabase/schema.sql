-- ============================================================================
-- AI COMMAND LAB - SUPABASE SCHEMA
-- Kingdom Closer Engine + Kingdom Ops Agent
-- ============================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- KINGDOM CLOSER ENGINE TABLES
-- ============================================================================

-- Brands table: Multi-brand configuration
CREATE TABLE brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  domain TEXT,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#000000',
  secondary_color TEXT DEFAULT '#FFFFFF',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CQI Templates: Customer Qualification Interview templates
CREATE TABLE cqi_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  questions JSONB NOT NULL, -- Array of question objects
  version INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CQI Responses: User responses to CQI questions
CREATE TABLE cqi_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES cqi_templates(id) ON DELETE CASCADE,
  brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  user_email TEXT,
  user_name TEXT,
  responses JSONB NOT NULL, -- Key-value pairs of question_id: answer
  metadata JSONB DEFAULT '{}', -- IP, user agent, referrer, etc.
  status TEXT DEFAULT 'in_progress', -- in_progress, completed, abandoned
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Services: Service catalog and recommendations
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  features JSONB DEFAULT '[]',
  pricing JSONB NOT NULL, -- {amount, currency, billing_period}
  stripe_price_id TEXT,
  category TEXT, -- e.g., 'web_design', 'seo', 'content'
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(brand_id, slug)
);

-- Trials: Trial subscription tracking
CREATE TABLE trials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
  cqi_response_id UUID REFERENCES cqi_responses(id) ON DELETE SET NULL,
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  user_email TEXT NOT NULL,
  user_name TEXT,
  recommended_service JSONB, -- AI recommendation details
  emotional_pitch_angle TEXT, -- Empathy-driven pitch
  script_or_copy TEXT, -- Generated email/script
  status TEXT DEFAULT 'pending', -- pending, active, converted, cancelled, expired
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  trial_start_date TIMESTAMPTZ,
  trial_end_date TIMESTAMPTZ,
  converted_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- KINGDOM OPS AGENT TABLES
-- ============================================================================

-- Ops Tasks: Automated operations task queue
CREATE TABLE ops_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- e.g., 'deploy_site', 'backup_db', 'monitor_uptime'
  status TEXT DEFAULT 'pending', -- pending, running, completed, failed
  priority INTEGER DEFAULT 5, -- 1-10, higher = more urgent
  result JSONB, -- Task execution results
  error_message TEXT,
  triggered_by TEXT, -- 'manual', 'webhook', 'schedule', 'ai_agent'
  approved BOOLEAN DEFAULT false, -- Safety flag for destructive ops
  config JSONB DEFAULT '{}', -- Task-specific configuration
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Infrastructure Logs: Agent activity and system logs
CREATE TABLE infra_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_name TEXT NOT NULL, -- 'kingdom_closer', 'kingdom_ops', 'mind_engine'
  message TEXT NOT NULL,
  severity TEXT DEFAULT 'info', -- debug, info, warning, error, critical
  context JSONB DEFAULT '{}', -- Additional context data
  task_id UUID REFERENCES ops_tasks(id) ON DELETE SET NULL,
  user_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Brands
CREATE INDEX idx_brands_slug ON brands(slug);

-- CQI Templates
CREATE INDEX idx_cqi_templates_brand ON cqi_templates(brand_id);
CREATE INDEX idx_cqi_templates_active ON cqi_templates(is_active);

-- CQI Responses
CREATE INDEX idx_cqi_responses_template ON cqi_responses(template_id);
CREATE INDEX idx_cqi_responses_brand ON cqi_responses(brand_id);
CREATE INDEX idx_cqi_responses_session ON cqi_responses(session_id);
CREATE INDEX idx_cqi_responses_status ON cqi_responses(status);
CREATE INDEX idx_cqi_responses_created ON cqi_responses(created_at DESC);

-- Services
CREATE INDEX idx_services_brand ON services(brand_id);
CREATE INDEX idx_services_active ON services(is_active);
CREATE INDEX idx_services_category ON services(category);

-- Trials
CREATE INDEX idx_trials_brand ON trials(brand_id);
CREATE INDEX idx_trials_cqi_response ON trials(cqi_response_id);
CREATE INDEX idx_trials_service ON trials(service_id);
CREATE INDEX idx_trials_email ON trials(user_email);
CREATE INDEX idx_trials_status ON trials(status);
CREATE INDEX idx_trials_stripe_customer ON trials(stripe_customer_id);

-- Ops Tasks
CREATE INDEX idx_ops_tasks_status ON ops_tasks(status);
CREATE INDEX idx_ops_tasks_type ON ops_tasks(type);
CREATE INDEX idx_ops_tasks_priority ON ops_tasks(priority DESC);
CREATE INDEX idx_ops_tasks_created ON ops_tasks(created_at DESC);

-- Infra Logs
CREATE INDEX idx_infra_logs_agent ON infra_logs(agent_name);
CREATE INDEX idx_infra_logs_severity ON infra_logs(severity);
CREATE INDEX idx_infra_logs_task ON infra_logs(task_id);
CREATE INDEX idx_infra_logs_created ON infra_logs(created_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE cqi_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE cqi_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE trials ENABLE ROW LEVEL SECURITY;
ALTER TABLE ops_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE infra_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- CHATBOT ROLE POLICIES (Read/Write for customer-facing interactions)
-- ============================================================================

-- Brands: Read-only for chatbot
CREATE POLICY "Chatbot can read brands"
  ON brands FOR SELECT
  TO chatbot
  USING (true);

-- CQI Templates: Read-only for chatbot
CREATE POLICY "Chatbot can read active CQI templates"
  ON cqi_templates FOR SELECT
  TO chatbot
  USING (is_active = true);

-- CQI Responses: Chatbot can insert and read own responses
CREATE POLICY "Chatbot can insert CQI responses"
  ON cqi_responses FOR INSERT
  TO chatbot
  WITH CHECK (true);

CREATE POLICY "Chatbot can read CQI responses"
  ON cqi_responses FOR SELECT
  TO chatbot
  USING (true);

CREATE POLICY "Chatbot can update CQI responses"
  ON cqi_responses FOR UPDATE
  TO chatbot
  USING (true);

-- Services: Read-only for chatbot
CREATE POLICY "Chatbot can read active services"
  ON services FOR SELECT
  TO chatbot
  USING (is_active = true);

-- Trials: Chatbot can read trials
CREATE POLICY "Chatbot can read trials"
  ON trials FOR SELECT
  TO chatbot
  USING (true);

-- ============================================================================
-- AI_AGENT ROLE POLICIES (Full access for backend automation)
-- ============================================================================

-- Brands: Full access for AI agent
CREATE POLICY "AI Agent can manage brands"
  ON brands FOR ALL
  TO ai_agent
  USING (true)
  WITH CHECK (true);

-- CQI Templates: Full access for AI agent
CREATE POLICY "AI Agent can manage CQI templates"
  ON cqi_templates FOR ALL
  TO ai_agent
  USING (true)
  WITH CHECK (true);

-- CQI Responses: Full access for AI agent
CREATE POLICY "AI Agent can manage CQI responses"
  ON cqi_responses FOR ALL
  TO ai_agent
  USING (true)
  WITH CHECK (true);

-- Services: Full access for AI agent
CREATE POLICY "AI Agent can manage services"
  ON services FOR ALL
  TO ai_agent
  USING (true)
  WITH CHECK (true);

-- Trials: Full access for AI agent
CREATE POLICY "AI Agent can manage trials"
  ON trials FOR ALL
  TO ai_agent
  USING (true)
  WITH CHECK (true);

-- Ops Tasks: Full access for AI agent
CREATE POLICY "AI Agent can manage ops tasks"
  ON ops_tasks FOR ALL
  TO ai_agent
  USING (true)
  WITH CHECK (true);

-- Infra Logs: AI agent can insert and read logs
CREATE POLICY "AI Agent can insert logs"
  ON infra_logs FOR INSERT
  TO ai_agent
  WITH CHECK (true);

CREATE POLICY "AI Agent can read logs"
  ON infra_logs FOR SELECT
  TO ai_agent
  USING (true);

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT TIMESTAMPS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_brands_updated_at
  BEFORE UPDATE ON brands
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cqi_templates_updated_at
  BEFORE UPDATE ON cqi_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cqi_responses_updated_at
  BEFORE UPDATE ON cqi_responses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON services
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trials_updated_at
  BEFORE UPDATE ON trials
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ops_tasks_updated_at
  BEFORE UPDATE ON ops_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- REALTIME PUBLICATION
-- ============================================================================

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE cqi_responses;
ALTER PUBLICATION supabase_realtime ADD TABLE trials;
ALTER PUBLICATION supabase_realtime ADD TABLE ops_tasks;

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to get active CQI template for a brand
CREATE OR REPLACE FUNCTION get_active_cqi_template(p_brand_id UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  questions JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT cqi_templates.id, cqi_templates.name, cqi_templates.questions
  FROM cqi_templates
  WHERE brand_id = p_brand_id
    AND is_active = true
  ORDER BY version DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log infrastructure events
CREATE OR REPLACE FUNCTION log_infra_event(
  p_agent_name TEXT,
  p_message TEXT,
  p_severity TEXT DEFAULT 'info',
  p_context JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO infra_logs (agent_name, message, severity, context)
  VALUES (p_agent_name, p_message, p_severity, p_context)
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE brands IS 'Multi-brand configuration for AI Command Lab';
COMMENT ON TABLE cqi_templates IS 'Customer Qualification Interview templates';
COMMENT ON TABLE cqi_responses IS 'User responses to CQI questions';
COMMENT ON TABLE services IS 'Service catalog and AI recommendations';
COMMENT ON TABLE trials IS 'Trial subscription tracking with AI-generated pitches';
COMMENT ON TABLE ops_tasks IS 'Automated operations task queue for Kingdom Ops Agent';
COMMENT ON TABLE infra_logs IS 'Infrastructure and agent activity audit logs';

