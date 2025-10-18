// ============================================================================
// ON CQI SUBMIT - Edge Function
// Triggered when a Customer Qualification Interview is submitted
// Calls Claude API to generate service recommendations
// ============================================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CQISubmitRequest {
  cqi_response_id: string
  brand_id: string
}

interface ServiceRecommendation {
  service_id: string
  service_name: string
  confidence_score: number
  reasoning: string
  emotional_pitch_angle: string
  script_or_copy: string
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Parse request
    const { cqi_response_id, brand_id }: CQISubmitRequest = await req.json()

    // Log the event
    await supabase.rpc('log_infra_event', {
      p_agent_name: 'kingdom_closer',
      p_message: `Processing CQI submission: ${cqi_response_id}`,
      p_severity: 'info',
      p_context: { cqi_response_id, brand_id }
    })

    // Fetch CQI response data
    const { data: cqiResponse, error: cqiError } = await supabase
      .from('cqi_responses')
      .select('*, cqi_templates(questions)')
      .eq('id', cqi_response_id)
      .single()

    if (cqiError) throw cqiError

    // Fetch available services for the brand
    const { data: services, error: servicesError } = await supabase
      .from('services')
      .select('*')
      .eq('brand_id', brand_id)
      .eq('is_active', true)

    if (servicesError) throw servicesError

    // Prepare context for Claude
    const context = {
      questions: cqiResponse.cqi_templates.questions,
      responses: cqiResponse.responses,
      user_name: cqiResponse.user_name,
      user_email: cqiResponse.user_email,
      available_services: services,
      metadata: cqiResponse.metadata
    }

    // Call Claude API for service recommendation
    const claudeApiKey = Deno.env.get('CLAUDE_API_KEY')!
    const recommendation = await generateServiceRecommendation(claudeApiKey, context)

    // Create trial record
    const { data: trial, error: trialError } = await supabase
      .from('trials')
      .insert({
        brand_id,
        cqi_response_id,
        service_id: recommendation.service_id,
        user_email: cqiResponse.user_email,
        user_name: cqiResponse.user_name,
        recommended_service: {
          service_id: recommendation.service_id,
          service_name: recommendation.service_name,
          confidence_score: recommendation.confidence_score,
          reasoning: recommendation.reasoning
        },
        emotional_pitch_angle: recommendation.emotional_pitch_angle,
        script_or_copy: recommendation.script_or_copy,
        status: 'pending'
      })
      .select()
      .single()

    if (trialError) throw trialError

    // Update CQI response status
    await supabase
      .from('cqi_responses')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', cqi_response_id)

    // Log success
    await supabase.rpc('log_infra_event', {
      p_agent_name: 'kingdom_closer',
      p_message: `Successfully generated recommendation for CQI ${cqi_response_id}`,
      p_severity: 'info',
      p_context: {
        cqi_response_id,
        trial_id: trial.id,
        recommended_service: recommendation.service_name
      }
    })

    return new Response(
      JSON.stringify({
        success: true,
        trial_id: trial.id,
        recommendation
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error in on_cqi_submit:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})

/**
 * Generate service recommendation using Claude API
 */
async function generateServiceRecommendation(
  apiKey: string,
  context: any
): Promise<ServiceRecommendation> {
  const prompt = `You are the Kingdom Closer AI, an empathetic sales consultant who analyzes customer needs and recommends the perfect service.

Customer Information:
- Name: ${context.user_name || 'Not provided'}
- Email: ${context.user_email}

CQI Questions and Responses:
${JSON.stringify(context.responses, null, 2)}

Available Services:
${JSON.stringify(context.available_services, null, 2)}

Your task:
1. Analyze the customer's responses to understand their needs, pain points, and emotional state
2. Recommend the most suitable service from the available options
3. Provide a confidence score (0-100)
4. Explain your reasoning in a way that demonstrates deep understanding
5. Craft an emotional pitch angle that resonates with their specific situation
6. Write a personalized email script that is empathetic, value-focused, and compelling

Return your response as a JSON object with this structure:
{
  "service_id": "uuid-of-recommended-service",
  "service_name": "Service Name",
  "confidence_score": 85,
  "reasoning": "Detailed explanation of why this service fits their needs",
  "emotional_pitch_angle": "The specific emotional angle to use (e.g., 'peace of mind', 'growth opportunity', 'freedom from stress')",
  "script_or_copy": "Full personalized email or script text"
}`

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2048,
      messages: [{
        role: 'user',
        content: prompt
      }]
    })
  })

  if (!response.ok) {
    throw new Error(`Claude API error: ${response.statusText}`)
  }

  const data = await response.json()
  const content = data.content[0].text
  
  // Extract JSON from the response
  const jsonMatch = content.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error('Failed to parse Claude response as JSON')
  }

  return JSON.parse(jsonMatch[0])
}

