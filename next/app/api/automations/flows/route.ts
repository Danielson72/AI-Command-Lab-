import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, description, graph, trigger_type, trigger_config, brand_id } = body

    if (!name || !brand_id) {
      return NextResponse.json(
        { error: 'name and brand_id are required' },
        { status: 400 }
      )
    }

    const { data: flow, error: insertError } = await supabase
      .from('automation_flows')
      .insert({
        name,
        description: description || null,
        graph: graph || { nodes: [], edges: [] },
        trigger_type: trigger_type || 'manual',
        trigger_config: trigger_config || {},
        brand_id,
        status: 'draft',
        created_by: user.id,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Automation flow insert error:', insertError)
      return NextResponse.json(
        { error: 'Failed to create flow' },
        { status: 500 }
      )
    }

    return NextResponse.json({ flow }, { status: 201 })
  } catch (error) {
    console.error('Automation flows API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { id, name, description, graph, trigger_type, trigger_config, status } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Flow id is required' },
        { status: 400 }
      )
    }

    // Build update payload with only provided fields
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (name !== undefined) updates.name = name
    if (description !== undefined) updates.description = description
    if (graph !== undefined) updates.graph = graph
    if (trigger_type !== undefined) updates.trigger_type = trigger_type
    if (trigger_config !== undefined) updates.trigger_config = trigger_config
    if (status !== undefined) updates.status = status

    const { data: flow, error: updateError } = await supabase
      .from('automation_flows')
      .update(updates)
      .eq('id', id)
      .eq('created_by', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('Automation flow update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update flow' },
        { status: 500 }
      )
    }

    return NextResponse.json({ flow })
  } catch (error) {
    console.error('Automation flows PATCH error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
