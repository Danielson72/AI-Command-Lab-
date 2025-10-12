'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import type { Agent, AgentTask, McpTask } from '@/lib/types/agents';

export default function AgentCockpitPage() {
  const searchParams = useSearchParams();
  const brandId = searchParams.get('brand_id');
  
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [tasks, setTasks] = useState<AgentTask[]>([]);
  const [mcpTasks, setMcpTasks] = useState<McpTask[]>([]);
  const [view, setView] = useState<'kanban' | 'logs'>('kanban');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (brandId) {
      fetchAgents();
    }
  }, [brandId]);

  useEffect(() => {
    if (selectedAgent) {
      fetchTasks();
      fetchMcpTasks();
    }
  }, [selectedAgent]);

  const fetchAgents = async () => {
    try {
      const response = await fetch(`/api/agents?brand_id=${brandId}`);
      const data = await response.json();
      setAgents(data.data || []);
      if (data.data?.length > 0) {
        setSelectedAgent(data.data[0]);
      }
    } catch (error) {
      console.error('Failed to fetch agents:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async () => {
    if (!selectedAgent) return;
    try {
      const response = await fetch(
        `/api/agents/tasks?brand_id=${brandId}&agent_id=${selectedAgent.id}`
      );
      const data = await response.json();
      setTasks(data.data || []);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    }
  };

  const fetchMcpTasks = async () => {
    if (!selectedAgent) return;
    try {
      const response = await fetch(
        `/api/mcp/tasks?brand_id=${brandId}&agent_id=${selectedAgent.id}`
      );
      const data = await response.json();
      setMcpTasks(data.data || []);
    } catch (error) {
      console.error('Failed to fetch MCP tasks:', error);
    }
  };

  const handleTaskUpdate = async (taskId: string, updates: Partial<AgentTask>) => {
    try {
      const response = await fetch(`/api/agents/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (response.ok) {
        fetchTasks();
      }
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading agents...</div>
      </div>
    );
  }

  if (!brandId) {
    return (
      <div className="p-8">
        <div className="text-red-600">Error: No brand selected</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left sidebar - Agent list */}
      <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold">Agent Cockpit</h1>
          <p className="text-sm text-gray-500 mt-1">
            {agents.length} agent{agents.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        <div className="p-4">
          {agents.map((agent) => (
            <button
              key={agent.id}
              onClick={() => setSelectedAgent(agent)}
              className={`w-full text-left p-3 rounded-lg mb-2 transition-colors ${
                selectedAgent?.id === agent.id
                  ? 'bg-blue-50 border-2 border-blue-500'
                  : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
              }`}
            >
              <div className="font-medium">{agent.name}</div>
              <div className="text-sm text-gray-500 mt-1">{agent.domain}</div>
              <div className="flex items-center gap-2 mt-2">
                <span className={`inline-block w-2 h-2 rounded-full ${
                  agent.status === 'active' ? 'bg-green-500' : 'bg-gray-300'
                }`} />
                <span className="text-xs text-gray-600 capitalize">{agent.status}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">{selectedAgent?.name}</h2>
              <p className="text-gray-600 mt-1">{selectedAgent?.description}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setView('kanban')}
                className={`px-4 py-2 rounded-lg ${
                  view === 'kanban'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                Kanban
              </button>
              <button
                onClick={() => setView('logs')}
                className={`px-4 py-2 rounded-lg ${
                  view === 'logs'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                Logs
              </button>
            </div>
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-auto p-6">
          {view === 'kanban' ? (
            <div className="grid grid-cols-4 gap-4 h-full">
              {['todo', 'in_progress', 'review', 'done'].map((status) => (
                <div key={status} className="bg-white rounded-lg p-4 border border-gray-200">
                  <h3 className="font-semibold mb-4 capitalize">{status.replace('_', ' ')}</h3>
                  <div className="space-y-3">
                    {tasks
                      .filter((task) => task.status === status)
                      .map((task) => (
                        <div
                          key={task.id}
                          className="bg-gray-50 p-3 rounded border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
                        >
                          <div className="font-medium text-sm">{task.title}</div>
                          {task.description && (
                            <div className="text-xs text-gray-600 mt-1 line-clamp-2">
                              {task.description}
                            </div>
                          )}
                          <div className="flex items-center justify-between mt-2">
                            <span className={`text-xs px-2 py-1 rounded ${
                              task.priority === 'high'
                                ? 'bg-red-100 text-red-700'
                                : task.priority === 'medium'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {task.priority}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="font-semibold mb-4">MCP Task Logs</h3>
              <div className="space-y-3">
                {mcpTasks.map((task) => (
                  <div
                    key={task.id}
                    className="border-l-4 border-blue-500 pl-4 py-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{task.tool_name}</div>
                      <span className={`text-xs px-2 py-1 rounded ${
                        task.status === 'completed'
                          ? 'bg-green-100 text-green-700'
                          : task.status === 'failed'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {task.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {new Date(task.created_at).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

