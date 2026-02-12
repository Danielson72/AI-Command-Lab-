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
    const { name, company, phone, email, sqft, frequency, notes, brand } = body

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

    // Build metadata object with all form data
    const metadata: Record<string, any> = {
      brand: brand || 'sotsvc',
      company: company || null,
    }
    if (sqft) metadata.sqft = sqft
    if (frequency) metadata.frequency = frequency
    if (notes) metadata.notes = notes

    // Insert lead into database (BossOfClean schema)
    const { data: lead, error: insertError } = await supabase
      .from('leads')
      .insert({
        cleaner_id: null, // Will be assigned later when lead is distributed
        customer_id: null, // Anonymous lead - no user account yet
        lead_type: 'commercial_cleaning',
        source: 'embed_form',
        customer_name: name,
        customer_phone: phone || null,
        customer_email: email,
        metadata,
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
