import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { logger } from '@/lib/utils/logger'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const signature = req.headers.get('stripe-signature')!

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err: any) {
      logger.error('Webhook signature verification failed', { error: err.message })
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    // Handle the event
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        logger.info('Subscription event', { 
          type: event.type, 
          subscriptionId: subscription.id 
        })
        
        // TODO: Update subscriptions table in database
        // This will be implemented in Phase 1
        
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        logger.info('Subscription cancelled', { subscriptionId: subscription.id })
        
        // TODO: Update subscription status to cancelled
        
        break
      }

      default:
        logger.info('Unhandled event type', { type: event.type })
    }

    return NextResponse.json({ received: true })
  } catch (err: any) {
    logger.error('Webhook handler error', { error: err.message })
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}

