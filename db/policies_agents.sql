-- ============================================================================
-- AI COMMAND LAB - AGENT INFRASTRUCTURE RLS POLICIES
-- Phase 0.5: Row-Level Security for Agent Tables
-- ============================================================================

-- Enable RLS on all agent tables
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE mcp_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_templates ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- AGENTS TABLE POLICIES
-- ============================================================================

-- Users can view agents for brands they're members of
CREATE POLICY "Users can view their brand agents"
  ON agents FOR SELECT
  USING (brand_id IN (SELECT brand_id FROM user_brands(auth.uid())));

-- Owners and admins can create agents
CREATE POLICY "Owners and admins can create agents"
  ON agents FOR INSERT
  WITH CHECK (
    brand_id IN (SELECT brand_id FROM user_brands(auth.uid()))
    AND can_access_brand_with_role(brand_id, ARRAY['owner', 'admin'])
  );

-- Owners and admins can update agents
CREATE POLICY "Owners and admins can update agents"
  ON agents FOR UPDATE
  USING (
    brand_id IN (SELECT brand_id FROM user_brands(auth.uid()))
    AND can_access_brand_with_role(brand_id, ARRAY['owner', 'admin'])
  );

-- Only owners can delete agents
CREATE POLICY "Only owners can delete agents"
  ON agents FOR DELETE
  USING (
    brand_id IN (SELECT brand_id FROM user_brands(auth.uid()))
    AND can_access_brand_with_role(brand_id, ARRAY['owner'])
  );

-- ============================================================================
-- MCP_TASKS TABLE POLICIES
-- ============================================================================

-- Users can view MCP tasks for their brands
CREATE POLICY "Users can view their brand MCP tasks"
  ON mcp_tasks FOR SELECT
  USING (brand_id IN (SELECT brand_id FROM user_brands(auth.uid())));

-- All members can create MCP tasks
CREATE POLICY "Members can create MCP tasks"
  ON mcp_tasks FOR INSERT
  WITH CHECK (brand_id IN (SELECT brand_id FROM user_brands(auth.uid())));

-- Task creators and admins can update tasks
CREATE POLICY "Task creators and admins can update MCP tasks"
  ON mcp_tasks FOR UPDATE
  USING (
    brand_id IN (SELECT brand_id FROM user_brands(auth.uid()))
    AND (
      created_by = auth.uid()
      OR can_access_brand_with_role(brand_id, ARRAY['owner', 'admin'])
    )
  );

-- Only owners can delete MCP tasks
CREATE POLICY "Only owners can delete MCP tasks"
  ON mcp_tasks FOR DELETE
  USING (
    brand_id IN (SELECT brand_id FROM user_brands(auth.uid()))
    AND can_access_brand_with_role(brand_id, ARRAY['owner'])
  );

-- ============================================================================
-- AGENT_TASKS TABLE POLICIES
-- ============================================================================

-- Users can view agent tasks for their brands
CREATE POLICY "Users can view their brand agent tasks"
  ON agent_tasks FOR SELECT
  USING (brand_id IN (SELECT brand_id FROM user_brands(auth.uid())));

-- All members can create agent tasks
CREATE POLICY "Members can create agent tasks"
  ON agent_tasks FOR INSERT
  WITH CHECK (brand_id IN (SELECT brand_id FROM user_brands(auth.uid())));

-- Users can update tasks they created or are assigned to, or admins
CREATE POLICY "Users can update their agent tasks"
  ON agent_tasks FOR UPDATE
  USING (
    brand_id IN (SELECT brand_id FROM user_brands(auth.uid()))
    AND (
      created_by = auth.uid()
      OR assigned_to = auth.uid()
      OR can_access_brand_with_role(brand_id, ARRAY['owner', 'admin'])
    )
  );

-- Users can delete tasks they created, or admins
CREATE POLICY "Users can delete their agent tasks"
  ON agent_tasks FOR DELETE
  USING (
    brand_id IN (SELECT brand_id FROM user_brands(auth.uid()))
    AND (
      created_by = auth.uid()
      OR can_access_brand_with_role(brand_id, ARRAY['owner', 'admin'])
    )
  );

-- ============================================================================
-- APPROVALS TABLE POLICIES
-- ============================================================================

-- Users can view approvals for their brands
CREATE POLICY "Users can view their brand approvals"
  ON approvals FOR SELECT
  USING (brand_id IN (SELECT brand_id FROM user_brands(auth.uid())));

-- System can create approvals (typically auto-created by MCP task creation)
CREATE POLICY "System can create approvals"
  ON approvals FOR INSERT
  WITH CHECK (brand_id IN (SELECT brand_id FROM user_brands(auth.uid())));

-- Owners and admins can approve/reject
CREATE POLICY "Owners and admins can update approvals"
  ON approvals FOR UPDATE
  USING (
    brand_id IN (SELECT brand_id FROM user_brands(auth.uid()))
    AND can_access_brand_with_role(brand_id, ARRAY['owner', 'admin'])
  );

-- No deletion of approvals (audit trail)
-- CREATE POLICY intentionally omitted for DELETE

-- ============================================================================
-- KNOWLEDGE_SOURCES TABLE POLICIES
-- ============================================================================

-- Users can view knowledge sources for their brands
CREATE POLICY "Users can view their brand knowledge sources"
  ON knowledge_sources FOR SELECT
  USING (brand_id IN (SELECT brand_id FROM user_brands(auth.uid())));

-- Editors and above can create knowledge sources
CREATE POLICY "Editors and above can create knowledge sources"
  ON knowledge_sources FOR INSERT
  WITH CHECK (
    brand_id IN (SELECT brand_id FROM user_brands(auth.uid()))
    AND can_access_brand_with_role(brand_id, ARRAY['owner', 'admin', 'editor'])
  );

-- Editors and above can update knowledge sources
CREATE POLICY "Editors and above can update knowledge sources"
  ON knowledge_sources FOR UPDATE
  USING (
    brand_id IN (SELECT brand_id FROM user_brands(auth.uid()))
    AND can_access_brand_with_role(brand_id, ARRAY['owner', 'admin', 'editor'])
  );

-- Owners and admins can delete knowledge sources
CREATE POLICY "Owners and admins can delete knowledge sources"
  ON knowledge_sources FOR DELETE
  USING (
    brand_id IN (SELECT brand_id FROM user_brands(auth.uid()))
    AND can_access_brand_with_role(brand_id, ARRAY['owner', 'admin'])
  );

-- ============================================================================
-- AGENT_TEMPLATES TABLE POLICIES
-- ============================================================================

-- All authenticated users can view public templates
CREATE POLICY "Users can view public agent templates"
  ON agent_templates FOR SELECT
  USING (
    is_public = true
    OR created_by = auth.uid()
  );

-- Authenticated users can create private templates
CREATE POLICY "Users can create agent templates"
  ON agent_templates FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Users can update their own templates
CREATE POLICY "Users can update their own agent templates"
  ON agent_templates FOR UPDATE
  USING (created_by = auth.uid());

-- Users can delete their own templates
CREATE POLICY "Users can delete their own agent templates"
  ON agent_templates FOR DELETE
  USING (created_by = auth.uid());

-- ============================================================================
-- SERVICE ROLE BYPASS
-- ============================================================================

-- Service role can do anything (for system operations)
CREATE POLICY "Service role bypass for agents"
  ON agents FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role bypass for mcp_tasks"
  ON mcp_tasks FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role bypass for agent_tasks"
  ON agent_tasks FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role bypass for approvals"
  ON approvals FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role bypass for knowledge_sources"
  ON knowledge_sources FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role bypass for agent_templates"
  ON agent_templates FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

