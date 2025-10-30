-- CQI System Database Schema
-- Migration: Create all tables for Client Qualification Interview system
-- Created: 2025-10-29
-- Author: Daniel Alvarez

-- =============================================================================
-- SERVICES TABLE
-- Catalog of services offered by each brand
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand TEXT NOT NULL CHECK (brand IN ('sotsvc', 'boss-of-clean', 'beatslave', 'temple-builder')),
    service_name TEXT NOT NULL,
    service_type TEXT NOT NULL,
    description TEXT,
    duration_minutes INTEGER,
    pricing_model TEXT CHECK (pricing_model IN ('fixed', 'per_sqft', 'per_hour', 'custom')),
    base_price_cents INTEGER,
    pricing_data JSONB,  -- Flexible pricing structure
    includes JSONB,  -- Array of what's included
    requirements JSONB,  -- Array of requirements
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_services_brand ON public.services(brand);
CREATE INDEX idx_services_active ON public.services(active);

COMMENT ON TABLE public.services IS 'Service catalog for all brands';

-- =============================================================================
-- CQI TEMPLATES TABLE
-- Question templates and scoring criteria for CQI sessions
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.cqi_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand TEXT NOT NULL CHECK (brand IN ('sotsvc', 'boss-of-clean', 'beatslave', 'temple-builder')),
    template_name TEXT NOT NULL,
    template_type TEXT CHECK (template_type IN ('questions', 'scoring', 'email', 'script')),
    category TEXT,  -- budget, urgency, property, etc.
    content JSONB NOT NULL,  -- The actual template content
    variables JSONB,  -- Variables that can be populated
    version INTEGER DEFAULT 1,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(brand, template_name, version)
);

CREATE INDEX idx_cqi_templates_brand ON public.cqi_templates(brand);
CREATE INDEX idx_cqi_templates_type ON public.cqi_templates(template_type);
CREATE INDEX idx_cqi_templates_active ON public.cqi_templates(active);

COMMENT ON TABLE public.cqi_templates IS 'Templates for CQI questions, scoring, and communications';

-- =============================================================================
-- CQI SESSIONS TABLE
-- Tracks CQI session lifecycle and state
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.cqi_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
    brand TEXT NOT NULL,
    session_state TEXT NOT NULL DEFAULT 'initiated'
        CHECK (session_state IN ('initiated', 'scored', 'actioned', 'documented', 'closed', 'archived')),
    outcome TEXT CHECK (outcome IN ('trial', 'nurture', 'disqualify')),
    qualification_score INTEGER CHECK (qualification_score >= 0 AND qualification_score <= 100),
    score_breakdown JSONB,  -- Detailed scoring by category
    conductor_version TEXT,
    scorer_version TEXT,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    closed_at TIMESTAMPTZ,
    duration_seconds INTEGER,
    data_complete BOOLEAN DEFAULT false,
    errors JSONB,
    closure_checklist JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_cqi_sessions_lead ON public.cqi_sessions(lead_id);
CREATE INDEX idx_cqi_sessions_brand ON public.cqi_sessions(brand);
CREATE INDEX idx_cqi_sessions_state ON public.cqi_sessions(session_state);
CREATE INDEX idx_cqi_sessions_outcome ON public.cqi_sessions(outcome);
CREATE INDEX idx_cqi_sessions_score ON public.cqi_sessions(qualification_score);

COMMENT ON TABLE public.cqi_sessions IS 'CQI session tracking and state management';

-- =============================================================================
-- CQI RESPONSES TABLE
-- Stores questions asked and responses received during CQI
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.cqi_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.cqi_sessions(id) ON DELETE CASCADE,
    lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
    question_category TEXT NOT NULL,  -- budget, urgency, property, etc.
    question_text TEXT NOT NULL,
    response_text TEXT,
    response_data JSONB,  -- Structured response data
    score_contribution INTEGER,  -- How much this response contributed to score
    red_flags JSONB,  -- Array of red flags identified
    green_flags JSONB,  -- Array of green flags identified
    asked_at TIMESTAMPTZ DEFAULT NOW(),
    responded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_cqi_responses_session ON public.cqi_responses(session_id);
CREATE INDEX idx_cqi_responses_lead ON public.cqi_responses(lead_id);
CREATE INDEX idx_cqi_responses_category ON public.cqi_responses(question_category);

COMMENT ON TABLE public.cqi_responses IS 'Questions and answers from CQI sessions';

-- =============================================================================
-- TRIALS TABLE
-- Trial appointments and outcomes
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.trials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
    session_id UUID REFERENCES public.cqi_sessions(id) ON DELETE SET NULL,
    brand TEXT NOT NULL,
    trial_type TEXT NOT NULL,
    scheduled_date DATE NOT NULL,
    scheduled_time TIME NOT NULL,
    duration_minutes INTEGER NOT NULL,
    price_cents INTEGER DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'scheduled'
        CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show', 'rescheduled')),
    confirmation_code TEXT UNIQUE,
    calendar_link TEXT,
    address TEXT NOT NULL,
    notes TEXT,

    -- Payment info
    stripe_checkout_url TEXT,
    payment_status TEXT CHECK (payment_status IN ('pending', 'paid', 'refunded', 'failed')),
    stripe_payment_intent_id TEXT,

    -- Outcome tracking
    outcome TEXT CHECK (outcome IN ('converted', 'nurture', 'declined')),
    feedback JSONB,
    feedback_score INTEGER CHECK (feedback_score >= 1 AND feedback_score <= 10),
    completed_at TIMESTAMPTZ,

    -- Notifications
    confirmation_sent BOOLEAN DEFAULT false,
    reminder_24h_sent BOOLEAN DEFAULT false,
    reminder_2h_sent BOOLEAN DEFAULT false,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_trials_lead ON public.trials(lead_id);
CREATE INDEX idx_trials_session ON public.trials(session_id);
CREATE INDEX idx_trials_brand ON public.trials(brand);
CREATE INDEX idx_trials_status ON public.trials(status);
CREATE INDEX idx_trials_scheduled_date ON public.trials(scheduled_date);
CREATE INDEX idx_trials_outcome ON public.trials(outcome);
CREATE INDEX idx_trials_confirmation_code ON public.trials(confirmation_code);

COMMENT ON TABLE public.trials IS 'Trial appointments, tracking, and outcomes';

-- =============================================================================
-- CLOSER SCRIPTS TABLE
-- AI-generated closing scripts for trial-to-paid conversion
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.closer_scripts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
    trial_id UUID REFERENCES public.trials(id) ON DELETE SET NULL,
    session_id UUID REFERENCES public.cqi_sessions(id) ON DELETE SET NULL,
    brand TEXT NOT NULL,
    agent_name TEXT,

    -- Script content
    script_template TEXT NOT NULL,
    script_content TEXT NOT NULL,  -- Full personalized script
    recommended_package TEXT,
    pricing_options JSONB NOT NULL,
    objection_handlers JSONB,

    -- Usage tracking
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    used_at TIMESTAMPTZ,
    outcome TEXT CHECK (outcome IN ('converted', 'declined', 'rescheduled', 'pending')),
    notes TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_closer_scripts_lead ON public.closer_scripts(lead_id);
CREATE INDEX idx_closer_scripts_trial ON public.closer_scripts(trial_id);
CREATE INDEX idx_closer_scripts_brand ON public.closer_scripts(brand);
CREATE INDEX idx_closer_scripts_outcome ON public.closer_scripts(outcome);

COMMENT ON TABLE public.closer_scripts IS 'AI-generated personalized closing scripts';

-- =============================================================================
-- AUDIT REPORTS TABLE
-- Compliance and session documentation
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.audit_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_type TEXT NOT NULL CHECK (report_type IN ('session', 'trial', 'conversion', 'monthly')),
    brand TEXT,

    -- Related records
    lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
    session_id UUID REFERENCES public.cqi_sessions(id) ON DELETE SET NULL,
    trial_id UUID REFERENCES public.trials(id) ON DELETE SET NULL,
    closer_script_id UUID REFERENCES public.closer_scripts(id) ON DELETE SET NULL,

    -- Report data
    report_data JSONB NOT NULL,  -- Full audit report content
    compliance_status TEXT CHECK (compliance_status IN ('pass', 'warn', 'fail')),

    -- Metadata
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    generated_by TEXT NOT NULL,  -- Agent name

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_reports_type ON public.audit_reports(report_type);
CREATE INDEX idx_audit_reports_brand ON public.audit_reports(brand);
CREATE INDEX idx_audit_reports_lead ON public.audit_reports(lead_id);
CREATE INDEX idx_audit_reports_session ON public.audit_reports(session_id);
CREATE INDEX idx_audit_reports_generated_at ON public.audit_reports(generated_at);

COMMENT ON TABLE public.audit_reports IS 'Audit trails and compliance documentation';

-- =============================================================================
-- FOLLOW UP TASKS TABLE
-- Scheduled follow-up actions
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.follow_up_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
    session_id UUID REFERENCES public.cqi_sessions(id) ON DELETE SET NULL,
    trial_id UUID REFERENCES public.trials(id) ON DELETE SET NULL,

    task_type TEXT NOT NULL CHECK (task_type IN ('email', 'sms', 'call', 'automated')),
    scheduled_for TIMESTAMPTZ NOT NULL,
    executed_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),

    message TEXT,
    template_id UUID REFERENCES public.cqi_templates(id) ON DELETE SET NULL,
    assigned_to TEXT,  -- Human agent name
    metadata JSONB,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_follow_up_tasks_lead ON public.follow_up_tasks(lead_id);
CREATE INDEX idx_follow_up_tasks_status ON public.follow_up_tasks(status);
CREATE INDEX idx_follow_up_tasks_scheduled ON public.follow_up_tasks(scheduled_for);
CREATE INDEX idx_follow_up_tasks_type ON public.follow_up_tasks(task_type);

COMMENT ON TABLE public.follow_up_tasks IS 'Scheduled follow-up tasks and communications';

-- =============================================================================
-- WORKFLOW INSTANCES TABLE
-- Tracks automated workflow execution
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.workflow_instances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_type TEXT NOT NULL CHECK (workflow_type IN ('lead_to_trial', 'trial_to_paid')),
    lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
    trial_id UUID REFERENCES public.trials(id) ON DELETE SET NULL,
    brand TEXT NOT NULL,

    status TEXT NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'completed', 'failed', 'stuck')),
    current_stage TEXT NOT NULL,
    stage_history JSONB NOT NULL DEFAULT '[]',

    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    duration_seconds INTEGER,
    error_log JSONB,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_workflow_instances_lead ON public.workflow_instances(lead_id);
CREATE INDEX idx_workflow_instances_type ON public.workflow_instances(workflow_type);
CREATE INDEX idx_workflow_instances_status ON public.workflow_instances(status);
CREATE INDEX idx_workflow_instances_brand ON public.workflow_instances(brand);
CREATE INDEX idx_workflow_instances_stage ON public.workflow_instances(current_stage);

COMMENT ON TABLE public.workflow_instances IS 'Automated workflow tracking and monitoring';

-- =============================================================================
-- WORKFLOW STAGE TRANSITIONS TABLE
-- Detailed stage transition history
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.workflow_stage_transitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL REFERENCES public.workflow_instances(id) ON DELETE CASCADE,
    from_stage TEXT,
    to_stage TEXT NOT NULL,
    transitioned_at TIMESTAMPTZ DEFAULT NOW(),
    duration_in_stage INTEGER,  -- seconds spent in from_stage
    agent TEXT,  -- Which agent performed the transition
    success BOOLEAN DEFAULT true,
    error TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_workflow_transitions_workflow ON public.workflow_stage_transitions(workflow_id);
CREATE INDEX idx_workflow_transitions_stage ON public.workflow_stage_transitions(to_stage);
CREATE INDEX idx_workflow_transitions_agent ON public.workflow_stage_transitions(agent);

COMMENT ON TABLE public.workflow_stage_transitions IS 'Detailed workflow stage transition log';

-- =============================================================================
-- CQI SESSION STATES TABLE
-- Saves session state for recovery
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.cqi_session_states (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.cqi_sessions(id) ON DELETE CASCADE,
    saved_at TIMESTAMPTZ DEFAULT NOW(),
    state_data JSONB NOT NULL,  -- Full session state snapshot
    resumable BOOLEAN DEFAULT true,
    expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '24 hours',

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_session_states_session ON public.cqi_session_states(session_id);
CREATE INDEX idx_session_states_expires ON public.cqi_session_states(expires_at);

COMMENT ON TABLE public.cqi_session_states IS 'Session state snapshots for recovery';

-- =============================================================================
-- SYSTEM EVENTS TABLE
-- System-wide events logging
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.system_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL CHECK (event_type IN ('shutdown', 'startup', 'maintenance', 'emergency', 'error', 'warning')),
    reason TEXT,
    initiated_by TEXT,
    severity TEXT CHECK (severity IN ('info', 'warning', 'error', 'critical')),
    data JSONB,
    timestamp TIMESTAMPTZ DEFAULT NOW(),

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_system_events_type ON public.system_events(event_type);
CREATE INDEX idx_system_events_severity ON public.system_events(severity);
CREATE INDEX idx_system_events_timestamp ON public.system_events(timestamp);

COMMENT ON TABLE public.system_events IS 'System-wide event logging';

-- =============================================================================
-- DASHBOARD CACHE TABLE
-- Caches dashboard data for performance
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.dashboard_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cache_key TEXT UNIQUE NOT NULL,
    view_type TEXT NOT NULL,
    brand TEXT,
    data JSONB NOT NULL,
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_dashboard_cache_key ON public.dashboard_cache(cache_key);
CREATE INDEX idx_dashboard_cache_expires ON public.dashboard_cache(expires_at);

COMMENT ON TABLE public.dashboard_cache IS 'Dashboard data cache for performance';

-- =============================================================================
-- KPI SNAPSHOTS TABLE
-- Daily KPI snapshots for trend analysis
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.kpi_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    snapshot_date DATE NOT NULL,
    brand TEXT,
    kpi_name TEXT NOT NULL,
    kpi_value DECIMAL(10, 2) NOT NULL,
    target_value DECIMAL(10, 2),
    variance DECIMAL(10, 2),

    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(snapshot_date, brand, kpi_name)
);

CREATE INDEX idx_kpi_snapshots_date ON public.kpi_snapshots(snapshot_date);
CREATE INDEX idx_kpi_snapshots_brand ON public.kpi_snapshots(brand);
CREATE INDEX idx_kpi_snapshots_kpi ON public.kpi_snapshots(kpi_name);

COMMENT ON TABLE public.kpi_snapshots IS 'Daily KPI snapshots for analytics';

-- =============================================================================
-- UPDATED_AT TRIGGERS
-- Automatically update updated_at timestamps
-- =============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at column
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cqi_templates_updated_at BEFORE UPDATE ON public.cqi_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cqi_sessions_updated_at BEFORE UPDATE ON public.cqi_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trials_updated_at BEFORE UPDATE ON public.trials
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_follow_up_tasks_updated_at BEFORE UPDATE ON public.follow_up_tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workflow_instances_updated_at BEFORE UPDATE ON public.workflow_instances
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- GRANT PERMISSIONS (Adjust based on your RLS strategy)
-- =============================================================================

-- Grant access to authenticated users (adjust as needed)
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant read-only access to anon users for specific tables (if needed)
-- GRANT SELECT ON public.services TO anon;

-- =============================================================================
-- MIGRATION COMPLETE
-- =============================================================================

COMMENT ON SCHEMA public IS 'CQI System schema - Migration 20251029000001 applied';
