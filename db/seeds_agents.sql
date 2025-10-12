-- ============================================================================
-- AI COMMAND LAB - AGENT INFRASTRUCTURE SEEDS
-- Phase 0.5: Feature Flags and Sample Data
-- ============================================================================

-- ============================================================================
-- FEATURE FLAGS
-- ============================================================================

-- Insert feature flags for agent infrastructure
INSERT INTO feature_flags (brand_id, key, enabled, created_at) VALUES
  (NULL, 'agent_cockpit', false, now()),
  (NULL, 'agent_kanban_view', false, now()),
  (NULL, 'knowledge_source_crawling', false, now()),
  (NULL, 'workflow_templates', false, now()),
  (NULL, 'mcp_dry_run_required', true, now()),  -- Safety: ON by default
  (NULL, 'agent_approvals_required', true, now())
ON CONFLICT (brand_id, key) DO UPDATE
  SET enabled = EXCLUDED.enabled;

-- ============================================================================
-- AGENT TEMPLATES
-- ============================================================================

-- Template 1: Code Planner Agent
INSERT INTO agent_templates (id, name, description, domain, workflow_steps, default_config, is_public) VALUES (
  'tpl_001',
  'Code Planner',
  'Analyzes requirements, researches documentation, creates implementation plan, and breaks it into tasks',
  'coding',
  '[
    {
      "step": "analyze_requirements",
      "description": "Parse user requirements and identify key components",
      "prompt_template": "Analyze the following requirements and break them down into technical components:\\n{requirements}",
      "tools": ["web_search", "knowledge_search"]
    },
    {
      "step": "research_documentation",
      "description": "Search curated knowledge sources for relevant documentation",
      "prompt_template": "Find documentation for: {components}",
      "tools": ["knowledge_search", "web_fetch"]
    },
    {
      "step": "create_implementation_plan",
      "description": "Generate detailed implementation plan with architecture decisions",
      "prompt_template": "Create an implementation plan for: {requirements}\\n\\nBased on research: {research_results}",
      "tools": []
    },
    {
      "step": "break_into_tasks",
      "description": "Convert plan into actionable Kanban tasks",
      "prompt_template": "Break this plan into Kanban tasks:\\n{plan}",
      "tools": ["agent_task_create"]
    }
  ]'::jsonb,
  '{
    "max_research_sources": 10,
    "require_approval": true,
    "output_format": "markdown"
  }'::jsonb,
  true
)
ON CONFLICT (id) DO UPDATE
  SET name = EXCLUDED.name,
      description = EXCLUDED.description,
      workflow_steps = EXCLUDED.workflow_steps,
      default_config = EXCLUDED.default_config;

-- Template 2: Code Executor Agent
INSERT INTO agent_templates (id, name, description, domain, workflow_steps, default_config, is_public) VALUES (
  'tpl_002',
  'Code Executor',
  'Takes Kanban tasks, researches docs, implements code, and marks for review',
  'coding',
  '[
    {
      "step": "fetch_task",
      "description": "Get next task from Kanban board",
      "prompt_template": "Fetch task: {task_id}",
      "tools": ["agent_task_fetch"]
    },
    {
      "step": "research_implementation",
      "description": "Research how to implement the task",
      "prompt_template": "Research implementation approaches for: {task_title}\\n\\nDescription: {task_description}",
      "tools": ["knowledge_search", "web_search"]
    },
    {
      "step": "implement_code",
      "description": "Write the actual code",
      "prompt_template": "Implement: {task_description}\\n\\nBased on research: {research_results}",
      "tools": ["code_generation", "file_create", "file_edit"]
    },
    {
      "step": "mark_for_review",
      "description": "Update task status to review",
      "prompt_template": "Mark task {task_id} as complete and ready for review",
      "tools": ["agent_task_update"]
    }
  ]'::jsonb,
  '{
    "test_before_complete": true,
    "require_approval": true,
    "auto_commit": false
  }'::jsonb,
  true
)
ON CONFLICT (id) DO UPDATE
  SET name = EXCLUDED.name,
      description = EXCLUDED.description,
      workflow_steps = EXCLUDED.workflow_steps,
      default_config = EXCLUDED.default_config;

-- Template 3: Content Creator Agent
INSERT INTO agent_templates (id, name, description, domain, workflow_steps, default_config, is_public) VALUES (
  'tpl_003',
  'Content Creator',
  'Analyzes brand voice, generates content calendar, and creates social/blog posts',
  'content',
  '[
    {
      "step": "analyze_brand_voice",
      "description": "Review brand guidelines and past content",
      "prompt_template": "Analyze brand voice for: {brand_name}\\n\\nGuidelines: {brand_guidelines}",
      "tools": ["knowledge_search", "content_library_search"]
    },
    {
      "step": "research_topics",
      "description": "Find trending topics and competitor content",
      "prompt_template": "Research content topics for: {industry}\\n\\nTarget audience: {audience}",
      "tools": ["web_search", "trend_analysis"]
    },
    {
      "step": "generate_content_calendar",
      "description": "Create monthly content calendar",
      "prompt_template": "Generate content calendar for: {month}\\n\\nBased on research: {topics}",
      "tools": []
    },
    {
      "step": "create_content_tasks",
      "description": "Break calendar into individual content creation tasks",
      "prompt_template": "Create Kanban tasks for calendar: {calendar}",
      "tools": ["agent_task_create"]
    }
  ]'::jsonb,
  '{
    "content_types": ["social", "blog", "email"],
    "posts_per_week": 5,
    "require_approval": true
  }'::jsonb,
  true
)
ON CONFLICT (id) DO UPDATE
  SET name = EXCLUDED.name,
      description = EXCLUDED.description,
      workflow_steps = EXCLUDED.workflow_steps,
      default_config = EXCLUDED.default_config;

-- Template 4: Sales Agent
INSERT INTO agent_templates (id, name, description, domain, workflow_steps, default_config, is_public) VALUES (
  'tpl_004',
  'Sales Agent',
  'Qualifies leads, researches prospects, builds proposals, and schedules follow-ups',
  'sales',
  '[
    {
      "step": "qualify_lead",
      "description": "Analyze lead data and score qualification",
      "prompt_template": "Qualify this lead:\\n{lead_data}\\n\\nIdeal customer profile: {icp}",
      "tools": ["lead_fetch", "scoring"]
    },
    {
      "step": "research_prospect",
      "description": "Research prospect company and decision makers",
      "prompt_template": "Research company: {company_name}\\n\\nWebsite: {website}",
      "tools": ["web_search", "company_research"]
    },
    {
      "step": "build_proposal",
      "description": "Create personalized proposal",
      "prompt_template": "Build proposal for: {company_name}\\n\\nBased on research: {research}\\n\\nOur services: {services}",
      "tools": ["document_generation"]
    },
    {
      "step": "schedule_followup",
      "description": "Create follow-up task",
      "prompt_template": "Schedule follow-up for: {lead_name}\\n\\nSuggested timing: {timing}",
      "tools": ["agent_task_create", "calendar_integration"]
    }
  ]'::jsonb,
  '{
    "qualification_threshold": 7,
    "require_approval": false,
    "auto_followup_days": 3
  }'::jsonb,
  true
)
ON CONFLICT (id) DO UPDATE
  SET name = EXCLUDED.name,
      description = EXCLUDED.description,
      workflow_steps = EXCLUDED.workflow_steps,
      default_config = EXCLUDED.default_config;

