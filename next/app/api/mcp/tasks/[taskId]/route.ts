import { NextRequest, NextResponse } from 'next/server';
import { getMcpTask, updateMcpTask } from '@/lib/db/agents';
import type { UpdateMcpTaskInput } from '@/lib/types/agents';

export async function GET(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
  const result = await getMcpTask(params.taskId);
  if (result.error) {
    return NextResponse.json({ error: result.error.message }, { status: 404 });
  }
  return NextResponse.json(result.data);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
  try {
    const body: UpdateMcpTaskInput = await request.json();
    const result = await updateMcpTask(params.taskId, body);
    if (result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 400 });
    }
    return NextResponse.json(result.data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
