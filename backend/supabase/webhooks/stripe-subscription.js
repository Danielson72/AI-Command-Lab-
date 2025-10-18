// ============================================================================
// STRIPE SUBSCRIPTION WEBHOOK HANDLER
// Handles Stripe webhook events for subscription lifecycle
// ============================================================================

const { createClient } = require('@supabase/supabase-js')

/**
 * Main webhook handler
 * This should be deployed as a serverless function or Express endpoint
 */
async function handleStripeWebhook(req, res) {
  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET

  let event

  try {
    // Verify webhook signature
    const signature = req.headers['stripe-signature']
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      endpointSecret
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  // Initialize Supabase client
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  )

  // Handle different event types
  try {
    switch (event.type) {
      case 'customer.subscription.created':
        await handleSubscriptionCreated(supabase, event.data.object)
        break

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(supabase, event.data.object)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(supabase, event.data.object)
        break

      case 'customer.subscription.trial_will_end':
        await handleTrialWillEnd(supabase, event.data.object)
        break

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(supabase, event.data.object)
        break

      case 'invoice.payment_failed':
        await handlePaymentFailed(supabase, event.data.object)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    // Log the webhook event
    await supabase.rpc('log_infra_event', {
      p_agent_name: 'stripe_webhook',
      p_message: `Processed webhook event: ${event.type}`,
      p_severity: 'info',
      p_context: {
        event_type: event.type,
        event_id: event.id
      }
    })

    res.json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    
    // Log the error
    await supabase.rpc('log_infra_event', {
      p_agent_name: 'stripe_webhook',
      p_message: `Webhook processing error: ${error.message}`,
      p_severity: 'error',
      p_context: {
        event_type: event.type,
        error: error.message
      }
    })

    res.status(500).json({ error: error.message })
  }
}

/**
 * Handle subscription.created event
 */
async function handleSubscriptionCreated(supabase, subscription) {
  const { customer, id: subscriptionId, metadata } = subscription

  // Find trial by customer email or metadata
  const { data: trial, error } = await supabase
    .from('trials')
    .select('*')
    .eq('stripe_customer_id', customer)
    .eq('status', 'pending')
    .single()

  if (error || !trial) {
    console.error('Trial not found for customer:', customer)
    return
  }

  // Update trial with subscription info
  await supabase
    .from('trials')
    .update({
      stripe_subscription_id: subscriptionId,
      status: 'active',
      trial_start_date: new Date(subscription.current_period_start * 1000).toISOString()
    })
    .eq('id', trial.id)

  console.log(`Subscription created for trial ${trial.id}`)
}

/**
 * Handle subscription.updated event
 */
async function handleSubscriptionUpdated(supabase, subscription) {
  const { id: subscriptionId, status } = subscription

  // Find trial by subscription ID
  const { data: trial } = await supabase
    .from('trials')
    .select('*')
    .eq('stripe_subscription_id', subscriptionId)
    .single()

  if (!trial) {
    console.error('Trial not found for subscription:', subscriptionId)
    return
  }

  // Map Stripe status to our trial status
  let trialStatus = trial.status
  if (status === 'active' && trial.status !== 'converted') {
    trialStatus = 'active'
  } else if (status === 'canceled') {
    trialStatus = 'cancelled'
  }

  // Update trial
  await supabase
    .from('trials')
    .update({
      status: trialStatus,
      metadata: {
        ...trial.metadata,
        stripe_status: status,
        last_updated: new Date().toISOString()
      }
    })
    .eq('id', trial.id)

  console.log(`Subscription updated for trial ${trial.id}: ${status}`)
}

/**
 * Handle subscription.deleted event
 */
async function handleSubscriptionDeleted(supabase, subscription) {
  const { id: subscriptionId } = subscription

  // Find trial by subscription ID
  const { data: trial } = await supabase
    .from('trials')
    .select('*')
    .eq('stripe_subscription_id', subscriptionId)
    .single()

  if (!trial) {
    console.error('Trial not found for subscription:', subscriptionId)
    return
  }

  // Update trial status
  await supabase
    .from('trials')
    .update({
      status: 'cancelled',
      cancelled_at: new Date().toISOString()
    })
    .eq('id', trial.id)

  // Log the cancellation
  await supabase.rpc('log_infra_event', {
    p_agent_name: 'stripe_webhook',
    p_message: `Subscription cancelled for trial ${trial.id}`,
    p_severity: 'warning',
    p_context: {
      trial_id: trial.id,
      user_email: trial.user_email,
      subscription_id: subscriptionId
    }
  })

  console.log(`Subscription cancelled for trial ${trial.id}`)
}

/**
 * Handle trial_will_end event (3 days before trial ends)
 */
async function handleTrialWillEnd(supabase, subscription) {
  const { id: subscriptionId, customer } = subscription

  // Find trial
  const { data: trial } = await supabase
    .from('trials')
    .select('*, services(*)')
    .eq('stripe_subscription_id', subscriptionId)
    .single()

  if (!trial) {
    console.error('Trial not found for subscription:', subscriptionId)
    return
  }

  // TODO: Send reminder email to customer
  console.log(`Trial ending soon for ${trial.user_email}`)

  // Log the event
  await supabase.rpc('log_infra_event', {
    p_agent_name: 'stripe_webhook',
    p_message: `Trial ending soon for ${trial.user_email}`,
    p_severity: 'info',
    p_context: {
      trial_id: trial.id,
      user_email: trial.user_email,
      service_name: trial.services?.name
    }
  })
}

/**
 * Handle payment succeeded event
 */
async function handlePaymentSucceeded(supabase, invoice) {
  const { subscription: subscriptionId, customer } = invoice

  if (!subscriptionId) return

  // Find trial
  const { data: trial } = await supabase
    .from('trials')
    .select('*')
    .eq('stripe_subscription_id', subscriptionId)
    .single()

  if (!trial) return

  // If this is the first payment after trial, mark as converted
  if (trial.status === 'active' && !trial.converted_at) {
    await supabase
      .from('trials')
      .update({
        status: 'converted',
        converted_at: new Date().toISOString()
      })
      .eq('id', trial.id)

    // Log the conversion
    await supabase.rpc('log_infra_event', {
      p_agent_name: 'stripe_webhook',
      p_message: `Trial converted to paid: ${trial.user_email}`,
      p_severity: 'info',
      p_context: {
        trial_id: trial.id,
        user_email: trial.user_email,
        invoice_id: invoice.id
      }
    })

    console.log(`Payment succeeded - trial ${trial.id} converted to paid`)
  }
}

/**
 * Handle payment failed event
 */
async function handlePaymentFailed(supabase, invoice) {
  const { subscription: subscriptionId, customer, attempt_count } = invoice

  if (!subscriptionId) return

  // Find trial
  const { data: trial } = await supabase
    .from('trials')
    .select('*')
    .eq('stripe_subscription_id', subscriptionId)
    .single()

  if (!trial) return

  // Log the failed payment
  await supabase.rpc('log_infra_event', {
    p_agent_name: 'stripe_webhook',
    p_message: `Payment failed for ${trial.user_email} (attempt ${attempt_count})`,
    p_severity: 'warning',
    p_context: {
      trial_id: trial.id,
      user_email: trial.user_email,
      invoice_id: invoice.id,
      attempt_count
    }
  })

  // TODO: Send payment failed notification email

  console.log(`Payment failed for trial ${trial.id} (attempt ${attempt_count})`)
}

module.exports = { handleStripeWebhook }

