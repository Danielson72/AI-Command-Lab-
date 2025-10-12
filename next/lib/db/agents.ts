// ============================================================================
// AI COMMAND LAB - AGENT DATABASE HELPERS
// Phase 0.5: CRUD operations for agent infrastructure
// ============================================================================

import { createClient } from '@/lib/supabase/server';
import type {
  Agent,
  CreateAgentInput,
  UpdateAgentInput,
  McpTask,
  CreateMcpTaskInput,
  UpdateMcpTaskInput,
  AgentTask,
  CreateAgentTaskInput,
  UpdateAgentTaskInput,
  Approval,
  CreateApprovalInput,
  UpdateApprovalInput,
  KnowledgeSource,
  CreateKnowledgeSourceInput,
  UpdateKnowledgeSourceInput,
  AgentTemplate,
  ApiResponse,
  PaginatedResponse,
} from '@/lib/types/agents';

// ============================================================================
// AGENTS
// ============================================================================

export async function getAgents(
  brandId: string,
  page = 1,
  pageSize = 20
): Promise<PaginatedResponse<Agent>> {
  const supabase = createClient();
  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;

  const { data, error, count } = await supabase
    .from('agents')
    .select('*', { count: 'exact' })
    .eq('brand_id', brandId)
    .order('created_at', { ascending: false })
    .range(start, end);

  if (error) throw error;

  return {
    data: data || [],
    total: count || 0,
    page,
    pageSize,
    hasMore: (count || 0) > end + 1,
  };
}

export async function getAgent(agentId: string): Promise<ApiResponse<Agent>> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('agents')
    .select('*')
    .eq('id', agentId)
    .single();

  if (error) {
    return { error: { message: error.message, code: error.code } };
  }

  return { data };
}

export async function createAgent(
  input: CreateAgentInput
): Promise<ApiResponse<Agent>> {
  const supabase = createClient();

  const { data: user } = await supabase.auth.getUser();
  if (!user.user) {
    return { error: { message: 'Unauthorized' } };
  }

  const { data, error } = await supabase
    .from('agents')
    .insert({
      ...input,
      created_by: user.user.id,
    })
    .select()
    .single();

  if (error) {
    return { error: { message: error.message, code: error.code } };
  }

  return { data };
}

export async function updateAgent(
  agentId: string,
  input: UpdateAgentInput
): Promise<ApiResponse<Agent>> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('agents')
    .update(input)
    .eq('id', agentId)
    .select()
    .single();

  if (error) {
    return { error: { message: error.message, code: error.code } };
  }

  return { data };
}

export async function deleteAgent(agentId: string): Promise<ApiResponse<void>> {
  const supabase = createClient();

  const { error } = await supabase.from('agents').delete().eq('id', agentId);

  if (error) {
    return { error: { message: error.message, code: error.code } };
  }

  return {};
}

// ============================================================================
// MCP TASKS
// ============================================================================

export async function getMcpTasks(
  brandId: string,
  agentId?: string,
  page = 1,
  pageSize = 20
): Promise<PaginatedResponse<McpTask>> {
  const supabase = createClient();
  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;

  let query = supabase
    .from('mcp_tasks')
    .select('*', { count: 'exact' })
    .eq('brand_id', brandId);

  if (agentId) {
    query = query.eq('agent_id', agentId);
  }

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(start, end);

  if (error) throw error;

  return {
    data: data || [],
    total: count || 0,
    page,
    pageSize,
    hasMore: (count || 0) > end + 1,
  };
}

export async function getMcpTask(taskId: string): Promise<ApiResponse<McpTask>> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('mcp_tasks')
    .select('*')
    .eq('id', taskId)
    .single();

  if (error) {
    return { error: { message: error.message, code: error.code } };
  }

  return { data };
}

export async function createMcpTask(
  input: CreateMcpTaskInput
): Promise<ApiResponse<McpTask>> {
  const supabase = createClient();

  const { data: user } = await supabase.auth.getUser();
  if (!user.user) {
    return { error: { message: 'Unauthorized' } };
  }

  const { data, error } = await supabase
    .from('mcp_tasks')
    .insert({
      ...input,
      created_by: user.user.id,
    })
    .select()
    .single();

  if (error) {
    return { error: { message: error.message, code: error.code } };
  }

  // If dry_run is true or approvals required, create approval record
  if (input.dry_run !== false) {
    await createApproval({
      brand_id: input.brand_id,
      mcp_task_id: data.id,
    });
  }

  return { data };
}

export async function updateMcpTask(
  taskId: string,
  input: UpdateMcpTaskInput
): Promise<ApiResponse<McpTask>> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('mcp_tasks')
    .update(input)
    .eq('id', taskId)
    .select()
    .single();

  if (error) {
    return { error: { message: error.message, code: error.code } };
  }

  return { data };
}

// ============================================================================
// AGENT TASKS (Kanban)
// ============================================================================

export async function getAgentTasks(
  brandId: string,
  agentId?: string,
  status?: string,
  page = 1,
  pageSize = 50
): Promise<PaginatedResponse<AgentTask>> {
  const supabase = createClient();
  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;

  let query = supabase
    .from('agent_tasks')
    .select('*', { count: 'exact' })
    .eq('brand_id', brandId);

  if (agentId) {
    query = query.eq('agent_id', agentId);
  }

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error, count } = await query
    .order('order_index', { ascending: true })
    .order('created_at', { ascending: false })
    .range(start, end);

  if (error) throw error;

  return {
    data: data || [],
    total: count || 0,
    page,
    pageSize,
    hasMore: (count || 0) > end + 1,
  };
}

export async function createAgentTask(
  input: CreateAgentTaskInput
): Promise<ApiResponse<AgentTask>> {
  const supabase = createClient();

  const { data: user } = await supabase.auth.getUser();
  if (!user.user) {
    return { error: { message: 'Unauthorized' } };
  }

  const { data, error } = await supabase
    .from('agent_tasks')
    .insert({
      ...input,
      created_by: user.user.id,
    })
    .select()
    .single();

  if (error) {
    return { error: { message: error.message, code: error.code } };
  }

  return { data };
}

export async function updateAgentTask(
  taskId: string,
  input: UpdateAgentTaskInput
): Promise<ApiResponse<AgentTask>> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('agent_tasks')
    .update(input)
    .eq('id', taskId)
    .select()
    .single();

  if (error) {
    return { error: { message: error.message, code: error.code } };
  }

  return { data };
}

export async function deleteAgentTask(taskId: string): Promise<ApiResponse<void>> {
  const supabase = createClient();

  const { error } = await supabase.from('agent_tasks').delete().eq('id', taskId);

  if (error) {
    return { error: { message: error.message, code: error.code } };
  }

  return {};
}

// ============================================================================
// APPROVALS
// ============================================================================

export async function getApprovals(
  brandId: string,
  status?: string
): Promise<ApiResponse<Approval[]>> {
  const supabase = createClient();

  let query = supabase
    .from('approvals')
    .select('*')
    .eq('brand_id', brandId);

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    return { error: { message: error.message, code: error.code } };
  }

  return { data: data || [] };
}

export async function createApproval(
  input: CreateApprovalInput
): Promise<ApiResponse<Approval>> {
  const supabase = createClient();

  const { data: user } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('approvals')
    .insert({
      ...input,
      requested_by: user.user?.id,
    })
    .select()
    .single();

  if (error) {
    return { error: { message: error.message, code: error.code } };
  }

  return { data };
}

export async function updateApproval(
  approvalId: string,
  input: UpdateApprovalInput
): Promise<ApiResponse<Approval>> {
  const supabase = createClient();

  const { data: user } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('approvals')
    .update({
      ...input,
      approved_by: input.status === 'approved' ? user.user?.id : undefined,
      resolved_at: input.resolved_at || new Date().toISOString(),
    })
    .eq('id', approvalId)
    .select()
    .single();

  if (error) {
    return { error: { message: error.message, code: error.code } };
  }

  return { data };
}

// ============================================================================
// KNOWLEDGE SOURCES
// ============================================================================

export async function getKnowledgeSources(
  brandId: string
): Promise<ApiResponse<KnowledgeSource[]>> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('knowledge_sources')
    .select('*')
    .eq('brand_id', brandId)
    .order('created_at', { ascending: false });

  if (error) {
    return { error: { message: error.message, code: error.code } };
  }

  return { data: data || [] };
}

export async function createKnowledgeSource(
  input: CreateKnowledgeSourceInput
): Promise<ApiResponse<KnowledgeSource>> {
  const supabase = createClient();

  const { data: user } = await supabase.auth.getUser();
  if (!user.user) {
    return { error: { message: 'Unauthorized' } };
  }

  const { data, error } = await supabase
    .from('knowledge_sources')
    .insert({
      ...input,
      created_by: user.user.id,
    })
    .select()
    .single();

  if (error) {
    return { error: { message: error.message, code: error.code } };
  }

  return { data };
}

export async function deleteKnowledgeSource(
  sourceId: string
): Promise<ApiResponse<void>> {
  const supabase = createClient();

  const { error } = await supabase
    .from('knowledge_sources')
    .delete()
    .eq('id', sourceId);

  if (error) {
    return { error: { message: error.message, code: error.code } };
  }

  return {};
}

// ============================================================================
// AGENT TEMPLATES
// ============================================================================

export async function getAgentTemplates(
  domain?: string
): Promise<ApiResponse<AgentTemplate[]>> {
  const supabase = createClient();

  let query = supabase.from('agent_templates').select('*').eq('is_public', true);

  if (domain) {
    query = query.eq('domain', domain);
  }

  const { data, error } = await query.order('name', { ascending: true });

  if (error) {
    return { error: { message: error.message, code: error.code } };
  }

  return { data: data || [] };
}

