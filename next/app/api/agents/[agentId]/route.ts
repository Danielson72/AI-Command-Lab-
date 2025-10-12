import { NextRequest, NextResponse } from 'next/server';
import { getAgent, updateAgent, deleteAgent } from '@/lib/db/agents';
import type { UpdateAgentInput } from '@/lib/types/agents';

export async function GET(
  request: NextRequest,
  { params }: { params: { agentId: string } }
) {
  const result = await getAgent(params.agentId);
  if (result.error) {
    return NextResponse.json({ error: result.error.message }, { status: 404 });
  }
  return NextResponse.json(result.data);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { agentId: string } }
) {
  try {
    const body: UpdateAgentInput = await request.json();
    const result = await updateAgent(params.agentId, body);
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
  { params }: { params: { agentId: string } }
) {
  const result = await deleteAgent(params.agentId);
  if (result.error) {
    return NextResponse.json({ error: result.error.message }, { status: 400 });
  }
  return NextResponse.json({ success: true });
}
