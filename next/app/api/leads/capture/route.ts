import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Allowed origins for CORS - any website can embed the form
const ALLOWED_ORIGINS = [
  'https://sotsvc.com',
  'https://www.sotsvc.com',
  'https://bossofclean.com',
  'https://www.bossofclean.com',
  'https://trustedcleaningexpert.com',
  'https://www.trustedcleaningexpert.com',
  'https://dld-online.com',
  'https://www.dld-online.com',
  'http://localhost:3000',
  'http://localhost:8000',
  'https://ai-command-lab.netlify.app',
]

function getCorsHeaders(origin: string | null) {
  // Allow any origin from the whitelist, or use wildcard for development
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : '*'
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }
}

// Handle CORS preflight
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin')
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(origin),
  })
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin')
  const corsHeaders = getCorsHeaders(origin)

  try {
    const body = await request.json()
    const { _hp, name, company, phone, email, sqft, frequency, notes, brand } = body

    // Honeypot spam check - bots fill hidden fields, humans don't
    if (_hp) {
      return NextResponse.json(
        { success: true, id: 'ok' },
        { status: 200, headers: corsHeaders }
      )
    }

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        { success: false, error: 'Name and email are required' },
        { status: 400, headers: corsHeaders }
      )
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email address' },
        { status: 400, headers: corsHeaders }
      )
    }

    // Create Supabase client with service role key to bypass RLS
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase environment variables')
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500, headers: corsHeaders }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Look up brand by slug (default to 'sotsvc')
    const brandSlug = brand || 'sotsvc'
    const { data: brandData, error: brandError } = await supabase
      .from('brands')
      .select('id, name')
      .eq('slug', brandSlug)
      .single()

    if (brandError) {
      console.error('Brand lookup error:', brandError)
      // Continue with null brand_id if brand not found
    }

    // Build metadata object with additional form data
    const metadata: Record<string, any> = {}
    if (company) metadata.company = company
    if (sqft) metadata.sqft = sqft
    if (frequency) metadata.frequency = frequency

    // Insert lead into database with correct schema
    const { data: lead, error: insertError } = await supabase
      .from('leads')
      .insert({
        brand_id: brandData?.id || null,
        brand_name: brandData?.name || brandSlug,
        name,
        email,
        phone: phone || null,
        message: notes || null,
        source: 'embed',
        status: 'new',
        contacted: false,
        score: 0,
        metadata: Object.keys(metadata).length > 0 ? metadata : null,
      })
      .select('id')
      .single()

    if (insertError) {
      console.error('Lead insert error:', insertError)
      return NextResponse.json(
        { success: false, error: 'Failed to save lead. Please try again.' },
        { status: 500, headers: corsHeaders }
      )
    }

    // Fire-and-forget webhook notification to n8n
    const webhookUrl = process.env.LEAD_NOTIFICATION_WEBHOOK
    if (webhookUrl) {
      fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead_id: lead.id,
          name,
          email,
          phone: phone || null,
          message: notes || null,
          brand_slug: brandData?.name || brandSlug,
          source: 'embed',
          submitted_at: new Date().toISOString(),
        }),
      }).catch((err) => console.error('[Webhook] n8n notify failed:', err))
    }

    return NextResponse.json(
      {
        success: true,
        message: "Thank you! We'll be in touch within 24 hours.",
        id: lead.id,
      },
      { status: 201, headers: corsHeaders }
    )
  } catch (error) {
    console.error('Lead capture API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error. Please try again.' },
      { status: 500, headers: corsHeaders }
    )
  }
}
