// ============================================================================
// ON TRIAL CONVERT - Edge Function
// Triggered when a trial converts to a paid subscription
// Notifies Stripe and sends email summary
// ============================================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TrialConvertRequest {
  trial_id: string
  stripe_subscription_id: string
  stripe_customer_id: string
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
    const { trial_id, stripe_subscription_id, stripe_customer_id }: TrialConvertRequest = await req.json()

    // Log the event
    await supabase.rpc('log_infra_event', {
      p_agent_name: 'kingdom_closer',
      p_message: `Processing trial conversion: ${trial_id}`,
      p_severity: 'info',
      p_context: { trial_id, stripe_subscription_id, stripe_customer_id }
    })

    // Fetch trial data
    const { data: trial, error: trialError } = await supabase
      .from('trials')
      .select('*, services(*), brands(*)')
      .eq('id', trial_id)
      .single()

    if (trialError) throw trialError

    // Update trial status
    const { error: updateError } = await supabase
      .from('trials')
      .update({
        status: 'converted',
        stripe_subscription_id,
        stripe_customer_id,
        converted_at: new Date().toISOString()
      })
      .eq('id', trial_id)

    if (updateError) throw updateError

    // Verify subscription with Stripe
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')!
    const subscriptionDetails = await verifyStripeSubscription(
      stripeSecretKey,
      stripe_subscription_id
    )

    // Send conversion email
    await sendConversionEmail({
      to: trial.user_email,
      name: trial.user_name,
      service_name: trial.services.name,
      brand_name: trial.brands.name,
      subscription_details: subscriptionDetails
    })

    // Log success
    await supabase.rpc('log_infra_event', {
      p_agent_name: 'kingdom_closer',
      p_message: `Trial ${trial_id} successfully converted to paid subscription`,
      p_severity: 'info',
      p_context: {
        trial_id,
        user_email: trial.user_email,
        service_name: trial.services.name,
        subscription_id: stripe_subscription_id
      }
    })

    // Trigger ops agent to set up customer infrastructure if needed
    const { error: opsError } = await supabase
      .from('ops_tasks')
      .insert({
        name: `Setup infrastructure for ${trial.user_email}`,
        type: 'customer_onboarding',
        status: 'pending',
        triggered_by: 'trial_conversion',
        config: {
          trial_id,
          customer_id: stripe_customer_id,
          service_id: trial.service_id,
          user_email: trial.user_email
        }
      })

    if (opsError) {
      console.error('Failed to create ops task:', opsError)
      // Don't throw - this is non-critical
    }

    return new Response(
      JSON.stringify({
        success: true,
        trial_id,
        status: 'converted',
        subscription_details: subscriptionDetails
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error in on_trial_convert:', error)
    
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
 * Verify subscription with Stripe API
 */
async function verifyStripeSubscription(
  secretKey: string,
  subscriptionId: string
): Promise<any> {
  const response = await fetch(
    `https://api.stripe.com/v1/subscriptions/${subscriptionId}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }
  )

  if (!response.ok) {
    throw new Error(`Stripe API error: ${response.statusText}`)
  }

  const subscription = await response.json()
  
  return {
    id: subscription.id,
    status: subscription.status,
    current_period_start: subscription.current_period_start,
    current_period_end: subscription.current_period_end,
    plan: subscription.items.data[0]?.price?.nickname || 'Unknown Plan'
  }
}

/**
 * Send conversion confirmation email
 * In production, this would integrate with SendGrid, Resend, or similar
 */
async function sendConversionEmail(params: {
  to: string
  name: string
  service_name: string
  brand_name: string
  subscription_details: any
}): Promise<void> {
  // For now, just log the email content
  // In production, integrate with email service
  
  const emailContent = {
    to: params.to,
    subject: `Welcome to ${params.service_name}! 🎉`,
    body: `
Hi ${params.name},

Congratulations! Your trial has been converted to a full subscription.

Service: ${params.service_name}
Brand: ${params.brand_name}
Subscription Status: ${params.subscription_details.status}

We're excited to have you on board and look forward to delivering exceptional value.

If you have any questions, please don't hesitate to reach out.

Best regards,
The ${params.brand_name} Team
    `.trim()
  }

  console.log('Email to send:', emailContent)
  
  // TODO: Integrate with actual email service
  // Example with Resend:
  // await fetch('https://api.resend.com/emails', {
  //   method: 'POST',
  //   headers: {
  //     'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
  //     'Content-Type': 'application/json'
  //   },
  //   body: JSON.stringify({
  //     from: 'noreply@yourdomain.com',
  //     to: params.to,
  //     subject: emailContent.subject,
  //     text: emailContent.body
  //   })
  // })
}

