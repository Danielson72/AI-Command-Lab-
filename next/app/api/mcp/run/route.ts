import { NextRequest, NextResponse } from 'next/server';
import { createMcpTask } from '@/lib/db/agents';
import type { CreateMcpTaskInput } from '@/lib/types/agents';

export async function POST(request: NextRequest) {
  try {
    const body: CreateMcpTaskInput = await request.json();
    const result = await createMcpTask(body);
    if (result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 400 });
    }
    return NextResponse.json(result.data, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
