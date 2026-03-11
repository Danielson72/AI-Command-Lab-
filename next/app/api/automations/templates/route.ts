import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data: templates, error } = await supabase
      .from('automation_templates')
      .select('id, name, description, category, graph, icon, is_featured')
      .order('is_featured', { ascending: false })
      .order('name', { ascending: true })

    if (error) {
      console.error('Templates fetch error:', error)
      return NextResponse.json(
        { error: 'Failed to load templates' },
        { status: 500 }
      )
    }

    return NextResponse.json({ templates })
  } catch (error) {
    console.error('Templates API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
