// ============================================================================
// AI COMMAND LAB - AGENT INFRASTRUCTURE TYPES
// Phase 0.5: TypeScript type definitions
// ============================================================================

// ============================================================================
// DATABASE TYPES
// ============================================================================

export type AgentStatus = 'active' | 'paused' | 'archived';
export type McpTaskStatus = 
  | 'pending' 
  | 'running' 
  | 'paused' 
  | 'completed' 
  | 'failed' 
  | 'cancelled' 
  | 'awaiting_approval';
export type AgentTaskStatus = 'todo' | 'doing' | 'review' | 'done' | 'blocked';
export type AgentTaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'expired';
export type KnowledgeSourceType = 'website' | 'sitemap' | 'llm_ext' | 'manual' | 'api_docs';
export type KnowledgeSourceStatus = 'active' | 'paused' | 'error';
export type AgentDomain = 'coding' | 'content' | 'sales' | 'support' | 'general';

// ============================================================================
// AGENT
// ============================================================================

export interface Agent {
  id: string;
  brand_id: string;
  name: string;
  description: string | null;
  template: string | null;
  config: Record<string, any>;
  policy: Record<string, any>;
  status: AgentStatus;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateAgentInput {
  brand_id: string;
  name: string;
  description?: string;
  template?: string;
  config?: Record<string, any>;
  policy?: Record<string, any>;
}

export interface UpdateAgentInput {
  name?: string;
  description?: string;
  config?: Record<string, any>;
  policy?: Record<string, any>;
  status?: AgentStatus;
}

// ============================================================================
// MCP TASK
// ============================================================================

export interface McpTask {
  id: string;
  brand_id: string;
  agent_id: string | null;
  task_type: string;
  title: string;
  payload: Record<string, any>;
  dry_run: boolean;
  status: McpTaskStatus;
  output: Record<string, any> | null;
  error_message: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateMcpTaskInput {
  brand_id: string;
  agent_id?: string;
  task_type: string;
  title: string;
  payload?: Record<string, any>;
  dry_run?: boolean;
}

export interface UpdateMcpTaskInput {
  status?: McpTaskStatus;
  output?: Record<string, any>;
  error_message?: string;
  started_at?: string;
  completed_at?: string;
}

// ============================================================================
// AGENT TASK (Kanban)
// ============================================================================

export interface AgentTask {
  id: string;
  brand_id: string;
  agent_id: string | null;
  mcp_task_id: string | null;
  title: string;
  description: string | null;
  status: AgentTaskStatus;
  assigned_to: string | null;
  order_index: number;
  priority: AgentTaskPriority;
  meta: Record<string, any>;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface CreateAgentTaskInput {
  brand_id: string;
  agent_id?: string;
  mcp_task_id?: string;
  title: string;
  description?: string;
  status?: AgentTaskStatus;
  assigned_to?: string;
  order_index?: number;
  priority?: AgentTaskPriority;
  meta?: Record<string, any>;
}

export interface UpdateAgentTaskInput {
  title?: string;
  description?: string;
  status?: AgentTaskStatus;
  assigned_to?: string;
  order_index?: number;
  priority?: AgentTaskPriority;
  meta?: Record<string, any>;
  completed_at?: string;
}

// ============================================================================
// APPROVAL
// ============================================================================

export interface Approval {
  id: string;
  brand_id: string;
  mcp_task_id: string;
  requested_by: string | null;
  approved_by: string | null;
  status: ApprovalStatus;
  notes: string | null;
  expires_at: string | null;
  created_at: string;
  resolved_at: string | null;
}

export interface CreateApprovalInput {
  brand_id: string;
  mcp_task_id: string;
  notes?: string;
  expires_at?: string;
}

export interface UpdateApprovalInput {
  status: ApprovalStatus;
  notes?: string;
  approved_by?: string;
  resolved_at?: string;
}

// ============================================================================
// KNOWLEDGE SOURCE
// ============================================================================

export interface KnowledgeSource {
  id: string;
  brand_id: string;
  name: string;
  url: string;
  type: KnowledgeSourceType;
  config: Record<string, any>;
  auto_refresh: boolean;
  refresh_interval: string | null;
  status: KnowledgeSourceStatus;
  last_crawled_at: string | null;
  last_error: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateKnowledgeSourceInput {
  brand_id: string;
  name: string;
  url: string;
  type: KnowledgeSourceType;
  config?: Record<string, any>;
  auto_refresh?: boolean;
  refresh_interval?: string;
}

export interface UpdateKnowledgeSourceInput {
  name?: string;
  url?: string;
  type?: KnowledgeSourceType;
  config?: Record<string, any>;
  auto_refresh?: boolean;
  refresh_interval?: string;
  status?: KnowledgeSourceStatus;
  last_crawled_at?: string;
  last_error?: string;
}

// ============================================================================
// AGENT TEMPLATE
// ============================================================================

export interface WorkflowStep {
  step: string;
  description: string;
  prompt_template: string;
  tools: string[];
}

export interface AgentTemplate {
  id: string;
  name: string;
  description: string | null;
  domain: AgentDomain;
  workflow_steps: WorkflowStep[];
  default_config: Record<string, any>;
  default_policy: Record<string, any>;
  is_public: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateAgentTemplateInput {
  name: string;
  description?: string;
  domain: AgentDomain;
  workflow_steps: WorkflowStep[];
  default_config?: Record<string, any>;
  default_policy?: Record<string, any>;
  is_public?: boolean;
}

export interface UpdateAgentTemplateInput {
  name?: string;
  description?: string;
  domain?: AgentDomain;
  workflow_steps?: WorkflowStep[];
  default_config?: Record<string, any>;
  default_policy?: Record<string, any>;
  is_public?: boolean;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T> {
  data?: T;
  error?: {
    message: string;
    code?: string;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ============================================================================
// FEATURE FLAG HELPERS
// ============================================================================

export interface AgentFeatureFlags {
  agent_cockpit: boolean;
  agent_kanban_view: boolean;
  knowledge_source_crawling: boolean;
  workflow_templates: boolean;
  mcp_dry_run_required: boolean;
  agent_approvals_required: boolean;
}

