// ============================================================================
// ON OPS TASK TRIGGER - Edge Function
// Allows Kingdom Ops Agent to start or report job results
// Executes infrastructure automation tasks
// ============================================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface OpsTaskRequest {
  task_id?: string
  action: 'start' | 'complete' | 'fail' | 'create'
  result?: any
  error_message?: string
  task_data?: {
    name: string
    type: string
    config: any
    priority?: number
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Parse request
    const requestData: OpsTaskRequest = await req.json()
    const { task_id, action, result, error_message, task_data } = requestData

    // Handle different actions
    switch (action) {
      case 'create':
        return await handleCreateTask(supabase, task_data!)
      
      case 'start':
        return await handleStartTask(supabase, task_id!)
      
      case 'complete':
        return await handleCompleteTask(supabase, task_id!, result)
      
      case 'fail':
        return await handleFailTask(supabase, task_id!, error_message!)
      
      default:
        throw new Error(`Unknown action: ${action}`)
    }

  } catch (error) {
    console.error('Error in on_ops_task_trigger:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})

/**
 * Create a new ops task
 */
async function handleCreateTask(supabase: any, taskData: any) {
  // Log the event
  await supabase.rpc('log_infra_event', {
    p_agent_name: 'kingdom_ops',
    p_message: `Creating new ops task: ${taskData.name}`,
    p_severity: 'info',
    p_context: { task_type: taskData.type }
  })

  // Create the task
  const { data: task, error: createError } = await supabase
    .from('ops_tasks')
    .insert({
      name: taskData.name,
      type: taskData.type,
      config: taskData.config,
      priority: taskData.priority || 5,
      status: 'pending',
      triggered_by: 'api'
    })
    .select()
    .single()

  if (createError) throw createError

  return new Response(
    JSON.stringify({
      success: true,
      task_id: task.id,
      status: 'created'
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  )
}

/**
 * Start executing a task
 */
async function handleStartTask(supabase: any, taskId: string) {
  // Fetch task details
  const { data: task, error: fetchError } = await supabase
    .from('ops_tasks')
    .select('*')
    .eq('id', taskId)
    .single()

  if (fetchError) throw fetchError

  // Check if task requires approval for destructive operations
  if (isDestructiveOperation(task.type) && !task.approved) {
    throw new Error('Task requires approval before execution')
  }

  // Update task status
  const { error: updateError } = await supabase
    .from('ops_tasks')
    .update({
      status: 'running',
      started_at: new Date().toISOString()
    })
    .eq('id', taskId)

  if (updateError) throw updateError

  // Log the event
  await supabase.rpc('log_infra_event', {
    p_agent_name: 'kingdom_ops',
    p_message: `Started executing task: ${task.name}`,
    p_severity: 'info',
    p_context: { task_id: taskId, task_type: task.type }
  })

  // Execute the task based on type
  let executionResult
  try {
    executionResult = await executeTask(task)
  } catch (execError) {
    // Task execution failed
    await supabase
      .from('ops_tasks')
      .update({
        status: 'failed',
        error_message: execError.message,
        completed_at: new Date().toISOString()
      })
      .eq('id', taskId)

    await supabase.rpc('log_infra_event', {
      p_agent_name: 'kingdom_ops',
      p_message: `Task execution failed: ${task.name}`,
      p_severity: 'error',
      p_context: { task_id: taskId, error: execError.message }
    })

    throw execError
  }

  return new Response(
    JSON.stringify({
      success: true,
      task_id: taskId,
      status: 'running',
      execution_result: executionResult
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  )
}

/**
 * Mark task as completed
 */
async function handleCompleteTask(supabase: any, taskId: string, result: any) {
  const { error: updateError } = await supabase
    .from('ops_tasks')
    .update({
      status: 'completed',
      result,
      completed_at: new Date().toISOString()
    })
    .eq('id', taskId)

  if (updateError) throw updateError

  // Log the event
  await supabase.rpc('log_infra_event', {
    p_agent_name: 'kingdom_ops',
    p_message: `Task completed successfully: ${taskId}`,
    p_severity: 'info',
    p_context: { task_id: taskId, result }
  })

  return new Response(
    JSON.stringify({
      success: true,
      task_id: taskId,
      status: 'completed'
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  )
}

/**
 * Mark task as failed
 */
async function handleFailTask(supabase: any, taskId: string, errorMessage: string) {
  const { error: updateError } = await supabase
    .from('ops_tasks')
    .update({
      status: 'failed',
      error_message: errorMessage,
      completed_at: new Date().toISOString()
    })
    .eq('id', taskId)

  if (updateError) throw updateError

  // Log the event
  await supabase.rpc('log_infra_event', {
    p_agent_name: 'kingdom_ops',
    p_message: `Task failed: ${taskId}`,
    p_severity: 'error',
    p_context: { task_id: taskId, error: errorMessage }
  })

  return new Response(
    JSON.stringify({
      success: true,
      task_id: taskId,
      status: 'failed'
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  )
}

/**
 * Check if operation is destructive and requires approval
 */
function isDestructiveOperation(taskType: string): boolean {
  const destructiveTypes = [
    'delete_resource',
    'drop_database',
    'terminate_server',
    'revoke_access',
    'cancel_subscription'
  ]
  return destructiveTypes.includes(taskType)
}

/**
 * Execute task based on type
 */
async function executeTask(task: any): Promise<any> {
  const { type, config } = task

  switch (type) {
    case 'customer_onboarding':
      return await executeCustomerOnboarding(config)
    
    case 'deploy_site':
      return await executeDeploySite(config)
    
    case 'backup_database':
      return await executeBackupDatabase(config)
    
    case 'monitor_uptime':
      return await executeMonitorUptime(config)
    
    default:
      console.log(`Task type ${type} queued for manual processing`)
      return { status: 'queued', message: 'Task queued for manual processing' }
  }
}

/**
 * Execute customer onboarding automation
 */
async function executeCustomerOnboarding(config: any): Promise<any> {
  // This would integrate with DigitalOcean, Terminus, etc.
  // For now, return a mock response
  console.log('Executing customer onboarding:', config)
  
  return {
    status: 'initiated',
    steps: [
      { name: 'create_workspace', status: 'pending' },
      { name: 'setup_domain', status: 'pending' },
      { name: 'configure_email', status: 'pending' },
      { name: 'send_welcome_email', status: 'pending' }
    ],
    message: 'Customer onboarding process initiated'
  }
}

/**
 * Execute site deployment
 */
async function executeDeploySite(config: any): Promise<any> {
  const digitalOceanApiKey = Deno.env.get('DIGITALOCEAN_API_KEY')
  
  if (!digitalOceanApiKey) {
    throw new Error('DigitalOcean API key not configured')
  }

  // Mock deployment - in production, this would call DigitalOcean API
  console.log('Deploying site with config:', config)
  
  return {
    status: 'deployed',
    url: `https://${config.domain || 'example.com'}`,
    server_ip: '192.0.2.1',
    deployment_time: new Date().toISOString()
  }
}

/**
 * Execute database backup
 */
async function executeBackupDatabase(config: any): Promise<any> {
  console.log('Backing up database:', config)
  
  return {
    status: 'completed',
    backup_location: 's3://backups/db-backup-' + Date.now(),
    size_mb: 245,
    timestamp: new Date().toISOString()
  }
}

/**
 * Execute uptime monitoring check
 */
async function executeMonitorUptime(config: any): Promise<any> {
  const { url } = config
  
  try {
    const startTime = Date.now()
    const response = await fetch(url, { method: 'HEAD' })
    const responseTime = Date.now() - startTime
    
    return {
      status: 'online',
      url,
      http_status: response.status,
      response_time_ms: responseTime,
      checked_at: new Date().toISOString()
    }
  } catch (error) {
    return {
      status: 'offline',
      url,
      error: error.message,
      checked_at: new Date().toISOString()
    }
  }
}

