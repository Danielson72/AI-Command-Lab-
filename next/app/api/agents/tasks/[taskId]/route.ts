import { NextRequest, NextResponse } from 'next/server';
import { updateAgentTask, deleteAgentTask } from '@/lib/db/agents';
import type { UpdateAgentTaskInput } from '@/lib/types/agents';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
  try {
    const body: UpdateAgentTaskInput = await request.json();
    const result = await updateAgentTask(params.taskId, body);
    if (result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 400 });
    }
    return NextResponse.json(result.data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
  const result = await deleteAgentTask(params.taskId);
  if (result.error) {
    return NextResponse.json({ error: result.error.message }, { status: 400 });
  }
  return NextResponse.json({ success: true });
}
