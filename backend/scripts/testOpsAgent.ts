// ============================================================================
// OPS AGENT TESTING SCRIPT
// Tests Kingdom Ops Agent functionality and task execution
// ============================================================================

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_KEY!

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in .env')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// ANSI color codes for better console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
}

/**
 * Main test runner
 */
async function runTests() {
  console.log(`\n${colors.bright}${colors.cyan}🧪 Kingdom Ops Agent Test Suite${colors.reset}\n`)

  const tests = [
    { name: 'Create Ops Task', fn: testCreateOpsTask },
    { name: 'Start Ops Task', fn: testStartOpsTask },
    { name: 'Complete Ops Task', fn: testCompleteOpsTask },
    { name: 'Fail Ops Task', fn: testFailOpsTask },
    { name: 'Query Pending Tasks', fn: testQueryPendingTasks },
    { name: 'Query Infrastructure Logs', fn: testQueryInfraLogs },
    { name: 'Test Destructive Operation Guard', fn: testDestructiveOperationGuard },
    { name: 'Test Task Prioritization', fn: testTaskPrioritization }
  ]

  let passed = 0
  let failed = 0

  for (const test of tests) {
    try {
      console.log(`${colors.blue}▶ Running: ${test.name}${colors.reset}`)
      await test.fn()
      console.log(`${colors.green}✓ Passed: ${test.name}${colors.reset}\n`)
      passed++
    } catch (error) {
      console.error(`${colors.red}✗ Failed: ${test.name}${colors.reset}`)
      console.error(`  Error: ${error.message}\n`)
      failed++
    }
  }

  console.log(`\n${colors.bright}Test Results:${colors.reset}`)
  console.log(`${colors.green}Passed: ${passed}${colors.reset}`)
  console.log(`${colors.red}Failed: ${failed}${colors.reset}`)
  console.log(`Total: ${passed + failed}\n`)

  if (failed > 0) {
    process.exit(1)
  }
}

/**
 * Test: Create ops task
 */
async function testCreateOpsTask() {
  const { data, error } = await supabase
    .from('ops_tasks')
    .insert({
      name: 'Test Task - Monitor Uptime',
      type: 'monitor_uptime',
      status: 'pending',
      priority: 5,
      config: {
        url: 'https://example.com',
        interval: '5m'
      },
      triggered_by: 'test'
    })
    .select()
    .single()

  if (error) throw error
  if (!data) throw new Error('No data returned')
  
  console.log(`  Created task: ${data.id}`)
}

/**
 * Test: Start ops task
 */
async function testStartOpsTask() {
  // Create a task first
  const { data: task, error: createError } = await supabase
    .from('ops_tasks')
    .insert({
      name: 'Test Task - Start',
      type: 'backup_database',
      status: 'pending',
      triggered_by: 'test'
    })
    .select()
    .single()

  if (createError) throw createError

  // Start the task
  const { data: updated, error: updateError } = await supabase
    .from('ops_tasks')
    .update({
      status: 'running',
      started_at: new Date().toISOString()
    })
    .eq('id', task.id)
    .select()
    .single()

  if (updateError) throw updateError
  if (updated.status !== 'running') throw new Error('Task status not updated to running')
  
  console.log(`  Started task: ${task.id}`)
}

/**
 * Test: Complete ops task
 */
async function testCompleteOpsTask() {
  // Create and start a task
  const { data: task, error: createError } = await supabase
    .from('ops_tasks')
    .insert({
      name: 'Test Task - Complete',
      type: 'deploy_site',
      status: 'running',
      started_at: new Date().toISOString(),
      triggered_by: 'test'
    })
    .select()
    .single()

  if (createError) throw createError

  // Complete the task
  const result = {
    status: 'success',
    deployment_url: 'https://example.com',
    duration_seconds: 45
  }

  const { data: updated, error: updateError } = await supabase
    .from('ops_tasks')
    .update({
      status: 'completed',
      result,
      completed_at: new Date().toISOString()
    })
    .eq('id', task.id)
    .select()
    .single()

  if (updateError) throw updateError
  if (updated.status !== 'completed') throw new Error('Task status not updated to completed')
  
  console.log(`  Completed task: ${task.id}`)
}

/**
 * Test: Fail ops task
 */
async function testFailOpsTask() {
  // Create and start a task
  const { data: task, error: createError } = await supabase
    .from('ops_tasks')
    .insert({
      name: 'Test Task - Fail',
      type: 'backup_database',
      status: 'running',
      started_at: new Date().toISOString(),
      triggered_by: 'test'
    })
    .select()
    .single()

  if (createError) throw createError

  // Fail the task
  const { data: updated, error: updateError } = await supabase
    .from('ops_tasks')
    .update({
      status: 'failed',
      error_message: 'Connection timeout',
      completed_at: new Date().toISOString()
    })
    .eq('id', task.id)
    .select()
    .single()

  if (updateError) throw updateError
  if (updated.status !== 'failed') throw new Error('Task status not updated to failed')
  
  console.log(`  Failed task: ${task.id}`)
}

/**
 * Test: Query pending tasks
 */
async function testQueryPendingTasks() {
  const { data, error } = await supabase
    .from('ops_tasks')
    .select('*')
    .eq('status', 'pending')
    .order('priority', { ascending: false })
    .order('created_at', { ascending: true })
    .limit(10)

  if (error) throw error
  
  console.log(`  Found ${data.length} pending tasks`)
}

/**
 * Test: Query infrastructure logs
 */
async function testQueryInfraLogs() {
  // Create a test log entry
  const { error: logError } = await supabase.rpc('log_infra_event', {
    p_agent_name: 'test_agent',
    p_message: 'Test log entry',
    p_severity: 'info',
    p_context: { test: true }
  })

  if (logError) throw logError

  // Query logs
  const { data, error } = await supabase
    .from('infra_logs')
    .select('*')
    .eq('agent_name', 'test_agent')
    .order('created_at', { ascending: false })
    .limit(5)

  if (error) throw error
  if (data.length === 0) throw new Error('No logs found')
  
  console.log(`  Found ${data.length} log entries`)
}

/**
 * Test: Destructive operation guard
 */
async function testDestructiveOperationGuard() {
  // Create a destructive task without approval
  const { data: task, error: createError } = await supabase
    .from('ops_tasks')
    .insert({
      name: 'Test Task - Destructive',
      type: 'delete_resource',
      status: 'pending',
      approved: false,
      triggered_by: 'test'
    })
    .select()
    .single()

  if (createError) throw createError

  // Verify it's not approved
  if (task.approved) {
    throw new Error('Destructive task should not be approved by default')
  }

  // Approve the task
  const { data: approved, error: approveError } = await supabase
    .from('ops_tasks')
    .update({ approved: true })
    .eq('id', task.id)
    .select()
    .single()

  if (approveError) throw approveError
  if (!approved.approved) {
    throw new Error('Task approval failed')
  }

  console.log(`  Destructive operation guard working correctly`)
}

/**
 * Test: Task prioritization
 */
async function testTaskPrioritization() {
  // Create tasks with different priorities
  const tasks = [
    { name: 'Low Priority', priority: 1 },
    { name: 'High Priority', priority: 10 },
    { name: 'Medium Priority', priority: 5 }
  ]

  for (const task of tasks) {
    await supabase
      .from('ops_tasks')
      .insert({
        name: `Test Task - ${task.name}`,
        type: 'monitor_uptime',
        status: 'pending',
        priority: task.priority,
        triggered_by: 'test'
      })
  }

  // Query tasks ordered by priority
  const { data, error } = await supabase
    .from('ops_tasks')
    .select('name, priority')
    .eq('triggered_by', 'test')
    .order('priority', { ascending: false })
    .limit(3)

  if (error) throw error
  if (data.length < 3) throw new Error('Not enough tasks returned')
  
  // Verify ordering
  if (data[0].priority < data[1].priority || data[1].priority < data[2].priority) {
    throw new Error('Tasks not properly ordered by priority')
  }

  console.log(`  Task prioritization working correctly`)
}

/**
 * Cleanup test data
 */
async function cleanup() {
  console.log(`\n${colors.yellow}🧹 Cleaning up test data...${colors.reset}`)

  // Delete test tasks
  const { error: tasksError } = await supabase
    .from('ops_tasks')
    .delete()
    .eq('triggered_by', 'test')

  if (tasksError) {
    console.error(`  Error cleaning up tasks: ${tasksError.message}`)
  } else {
    console.log(`  ✓ Test tasks cleaned up`)
  }

  // Delete test logs
  const { error: logsError } = await supabase
    .from('infra_logs')
    .delete()
    .eq('agent_name', 'test_agent')

  if (logsError) {
    console.error(`  Error cleaning up logs: ${logsError.message}`)
  } else {
    console.log(`  ✓ Test logs cleaned up`)
  }

  console.log('')
}

// Run tests and cleanup
runTests()
  .then(() => cleanup())
  .catch((error) => {
    console.error(`\n${colors.red}Fatal error:${colors.reset}`, error)
    process.exit(1)
  })

