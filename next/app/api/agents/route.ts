import { NextRequest, NextResponse } from 'next/server';
import { getAgents, createAgent } from '@/lib/db/agents';
import type { CreateAgentInput } from '@/lib/types/agents';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const brandId = searchParams.get('brand_id');
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '20');

  if (!brandId) {
    return NextResponse.json(
      { error: 'brand_id is required' },
      { status: 400 }
    );
  }

  try {
    const result = await getAgents(brandId, page, pageSize);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateAgentInput = await request.json();
    const result = await createAgent(body);

    if (result.error) {
      return NextResponse.json(
        { error: result.error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(result.data, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
