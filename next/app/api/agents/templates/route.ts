import { NextRequest, NextResponse } from 'next/server';
import { getAgentTemplates } from '@/lib/db/agents';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const domain = searchParams.get('domain') || undefined;

  try {
    const result = await getAgentTemplates(domain);
    if (result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 400 });
    }
    return NextResponse.json(result.data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
