import { NextRequest, NextResponse } from 'next/server';
import { getAgentTasks, createAgentTask } from '@/lib/db/agents';
import type { CreateAgentTaskInput } from '@/lib/types/agents';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const brandId = searchParams.get('brand_id');
  const agentId = searchParams.get('agent_id') || undefined;
  const status = searchParams.get('status') || undefined;

  if (!brandId) {
    return NextResponse.json({ error: 'brand_id is required' }, { status: 400 });
  }

  try {
    const result = await getAgentTasks(brandId, agentId, status);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateAgentTaskInput = await request.json();
    const result = await createAgentTask(body);
    if (result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 400 });
    }
    return NextResponse.json(result.data, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
