-- ============================================================================
-- AI COMMAND LAB - AGENT INFRASTRUCTURE SCHEMA
-- Phase 0.5: Archon-Inspired Agent System
-- ============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLE: agents
-- Purpose: Reusable AI agents per brand
-- ============================================================================
CREATE TABLE agents (
  id TEXT PRIMARY KEY,                    -- agent_001, agent_002, etc.
  brand_id TEXT NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  name TEXT NOT NULL,                     -- "Code Planner", "Content Creator"
  description TEXT,                       -- What this agent does
  template TEXT,                          -- Reference to agent_templates.id
  config JSONB DEFAULT '{}',              -- Agent-specific configuration
  policy JSONB DEFAULT '{}',              -- Guardrails and restrictions
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'archived')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  CONSTRAINT agents_name_brand_unique UNIQUE (brand_id, name)
);

CREATE INDEX idx_agents_brand_id ON agents(brand_id);
CREATE INDEX idx_agents_status ON agents(status);
CREATE INDEX idx_agents_template ON agents(template);



-- ============================================================================
-- TABLE: mcp_tasks
-- Purpose: Individual agent execution runs
-- ============================================================================
CREATE TABLE mcp_tasks (
  id TEXT PRIMARY KEY,                    -- task_001, task_002, etc.
  brand_id TEXT NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  agent_id TEXT REFERENCES agents(id) ON DELETE SET NULL,
  task_type TEXT NOT NULL,                -- 'code_generation', 'content_creation', etc.
  title TEXT NOT NULL,                    -- Human-readable task name
  payload JSONB DEFAULT '{}',             -- Input data for the task
  dry_run BOOLEAN DEFAULT true,           -- Safety: require approval by default
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending', 'running', 'paused', 'completed', 'failed', 'cancelled', 'awaiting_approval'
  )),
  output JSONB,                           -- Results, artifacts, logs
  error_message TEXT,                     -- If failed, why?
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_mcp_tasks_brand_id ON mcp_tasks(brand_id);
CREATE INDEX idx_mcp_tasks_agent_id ON mcp_tasks(agent_id);
CREATE INDEX idx_mcp_tasks_status ON mcp_tasks(status);
CREATE INDEX idx_mcp_tasks_created_at ON mcp_tasks(created_at DESC);

-- ============================================================================
-- TABLE: agent_tasks
-- Purpose: Kanban-style task board items (Archon-inspired)
-- ============================================================================
CREATE TABLE agent_tasks (
  id TEXT PRIMARY KEY,                    -- atask_001, atask_002, etc.
  brand_id TEXT NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  agent_id TEXT REFERENCES agents(id) ON DELETE CASCADE,
  mcp_task_id TEXT REFERENCES mcp_tasks(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'todo' CHECK (status IN (
    'todo', 'doing', 'review', 'done', 'blocked'
  )),
  assigned_to UUID REFERENCES auth.users(id),  -- Optional human assignment
  order_index INTEGER DEFAULT 0,          -- For drag-and-drop ordering
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  meta JSONB DEFAULT '{}',                -- Tags, labels, custom fields
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_agent_tasks_brand_id ON agent_tasks(brand_id);
CREATE INDEX idx_agent_tasks_agent_id ON agent_tasks(agent_id);
CREATE INDEX idx_agent_tasks_status ON agent_tasks(status);
CREATE INDEX idx_agent_tasks_order_index ON agent_tasks(order_index);
CREATE INDEX idx_agent_tasks_mcp_task_id ON agent_tasks(mcp_task_id);

-- ============================================================================
-- TABLE: approvals
-- Purpose: Human-in-the-loop approval workflow
-- ============================================================================
CREATE TABLE approvals (
  id TEXT PRIMARY KEY,                    -- appr_001, appr_002, etc.
  brand_id TEXT NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  mcp_task_id TEXT NOT NULL REFERENCES mcp_tasks(id) ON DELETE CASCADE,
  requested_by UUID REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending', 'approved', 'rejected', 'expired'
  )),
  notes TEXT,                             -- Approval reason or rejection reason
  expires_at TIMESTAMPTZ,                 -- Optional: auto-reject after time
  created_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  
  CONSTRAINT approvals_mcp_task_unique UNIQUE (mcp_task_id)
);

CREATE INDEX idx_approvals_brand_id ON approvals(brand_id);
CREATE INDEX idx_approvals_status ON approvals(status);
CREATE INDEX idx_approvals_mcp_task_id ON approvals(mcp_task_id);

-- ============================================================================
-- TABLE: knowledge_sources
-- Purpose: Curated documentation for RAG (Archon-inspired)
-- ============================================================================
CREATE TABLE knowledge_sources (
  id TEXT PRIMARY KEY,                    -- ksrc_001, ksrc_002, etc.
  brand_id TEXT NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  name TEXT NOT NULL,                     -- "Supabase Docs", "Next.js API Reference"
  url TEXT NOT NULL,                      -- Source URL
  type TEXT CHECK (type IN ('website', 'sitemap', 'llm_ext', 'manual', 'api_docs')),
  config JSONB DEFAULT '{}',              -- Crawl depth, patterns, etc.
  auto_refresh BOOLEAN DEFAULT false,     -- Auto-update from source?
  refresh_interval TEXT,                  -- 'daily', 'weekly', 'monthly'
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'error')),
  last_crawled_at TIMESTAMPTZ,
  last_error TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  CONSTRAINT knowledge_sources_url_brand_unique UNIQUE (brand_id, url)
);

CREATE INDEX idx_knowledge_sources_brand_id ON knowledge_sources(brand_id);
CREATE INDEX idx_knowledge_sources_status ON knowledge_sources(status);
CREATE INDEX idx_knowledge_sources_auto_refresh ON knowledge_sources(auto_refresh);

-- ============================================================================
-- TABLE: agent_templates
-- Purpose: Reusable workflow templates (Archon-inspired)
-- ============================================================================
CREATE TABLE agent_templates (
  id TEXT PRIMARY KEY,                    -- tpl_001, tpl_002, etc.
  name TEXT NOT NULL,
  description TEXT,
  domain TEXT CHECK (domain IN ('coding', 'content', 'sales', 'support', 'general')),
  workflow_steps JSONB NOT NULL,          -- [{step: 'analyze', prompt: '...', tools: [...]}, ...]
  default_config JSONB DEFAULT '{}',      -- Default agent configuration
  default_policy JSONB DEFAULT '{}',      -- Default guardrails
  is_public BOOLEAN DEFAULT false,        -- Available to all brands?
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  CONSTRAINT agent_templates_name_unique UNIQUE (name)
);

CREATE INDEX idx_agent_templates_domain ON agent_templates(domain);
CREATE INDEX idx_agent_templates_is_public ON agent_templates(is_public);

-- ============================================================================
-- ID GENERATION FUNCTIONS
-- ============================================================================

-- Function to generate next agent ID
CREATE OR REPLACE FUNCTION generate_agent_id()
RETURNS TEXT AS $$
DECLARE
  next_id TEXT;
  max_num INTEGER;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(id FROM 7) AS INTEGER)), 0) + 1
  INTO max_num
  FROM agents;
  
  next_id := 'agent_' || LPAD(max_num::TEXT, 3, '0');
  RETURN next_id;
END;
$$ LANGUAGE plpgsql;

-- Function to generate next mcp_task ID
CREATE OR REPLACE FUNCTION generate_mcp_task_id()
RETURNS TEXT AS $$
DECLARE
  next_id TEXT;
  max_num INTEGER;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(id FROM 6) AS INTEGER)), 0) + 1
  INTO max_num
  FROM mcp_tasks;
  
  next_id := 'task_' || LPAD(max_num::TEXT, 3, '0');
  RETURN next_id;
END;
$$ LANGUAGE plpgsql;

-- Function to generate next agent_task ID
CREATE OR REPLACE FUNCTION generate_agent_task_id()
RETURNS TEXT AS $$
DECLARE
  next_id TEXT;
  max_num INTEGER;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(id FROM 7) AS INTEGER)), 0) + 1
  INTO max_num
  FROM agent_tasks;
  
  next_id := 'atask_' || LPAD(max_num::TEXT, 3, '0');
  RETURN next_id;
END;
$$ LANGUAGE plpgsql;

-- Function to generate next approval ID
CREATE OR REPLACE FUNCTION generate_approval_id()
RETURNS TEXT AS $$
DECLARE
  next_id TEXT;
  max_num INTEGER;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(id FROM 6) AS INTEGER)), 0) + 1
  INTO max_num
  FROM approvals;
  
  next_id := 'appr_' || LPAD(max_num::TEXT, 3, '0');
  RETURN next_id;
END;
$$ LANGUAGE plpgsql;

-- Function to generate next knowledge_source ID
CREATE OR REPLACE FUNCTION generate_knowledge_source_id()
RETURNS TEXT AS $$
DECLARE
  next_id TEXT;
  max_num INTEGER;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(id FROM 6) AS INTEGER)), 0) + 1
  INTO max_num
  FROM knowledge_sources;
  
  next_id := 'ksrc_' || LPAD(max_num::TEXT, 3, '0');
  RETURN next_id;
END;
$$ LANGUAGE plpgsql;

-- Function to generate next agent_template ID
CREATE OR REPLACE FUNCTION generate_agent_template_id()
RETURNS TEXT AS $$
DECLARE
  next_id TEXT;
  max_num INTEGER;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(id FROM 5) AS INTEGER)), 0) + 1
  INTO max_num
  FROM agent_templates;
  
  next_id := 'tpl_' || LPAD(max_num::TEXT, 3, '0');
  RETURN next_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS FOR AUTO-GENERATED IDs
-- ============================================================================

CREATE OR REPLACE FUNCTION set_agent_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.id IS NULL OR NEW.id = '' THEN
    NEW.id := generate_agent_id();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_agent_id
  BEFORE INSERT ON agents
  FOR EACH ROW
  EXECUTE FUNCTION set_agent_id();

CREATE OR REPLACE FUNCTION set_mcp_task_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.id IS NULL OR NEW.id = '' THEN
    NEW.id := generate_mcp_task_id();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_mcp_task_id
  BEFORE INSERT ON mcp_tasks
  FOR EACH ROW
  EXECUTE FUNCTION set_mcp_task_id();

CREATE OR REPLACE FUNCTION set_agent_task_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.id IS NULL OR NEW.id = '' THEN
    NEW.id := generate_agent_task_id();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_agent_task_id
  BEFORE INSERT ON agent_tasks
  FOR EACH ROW
  EXECUTE FUNCTION set_agent_task_id();

CREATE OR REPLACE FUNCTION set_approval_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.id IS NULL OR NEW.id = '' THEN
    NEW.id := generate_approval_id();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_approval_id
  BEFORE INSERT ON approvals
  FOR EACH ROW
  EXECUTE FUNCTION set_approval_id();

CREATE OR REPLACE FUNCTION set_knowledge_source_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.id IS NULL OR NEW.id = '' THEN
    NEW.id := generate_knowledge_source_id();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_knowledge_source_id
  BEFORE INSERT ON knowledge_sources
  FOR EACH ROW
  EXECUTE FUNCTION set_knowledge_source_id();

CREATE OR REPLACE FUNCTION set_agent_template_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.id IS NULL OR NEW.id = '' THEN
    NEW.id := generate_agent_template_id();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_agent_template_id
  BEFORE INSERT ON agent_templates
  FOR EACH ROW
  EXECUTE FUNCTION set_agent_template_id();

-- ============================================================================
-- UPDATED_AT TRIGGERS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_agents_updated_at
  BEFORE UPDATE ON agents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_mcp_tasks_updated_at
  BEFORE UPDATE ON mcp_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_agent_tasks_updated_at
  BEFORE UPDATE ON agent_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_knowledge_sources_updated_at
  BEFORE UPDATE ON knowledge_sources
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_agent_templates_updated_at
  BEFORE UPDATE ON agent_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

