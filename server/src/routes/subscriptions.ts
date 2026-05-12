import { Router } from 'express'
import { z } from 'zod'
import Stripe from 'stripe'
import { prisma } from '../lib/prisma.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-08-27.basil' })
  : null

// Subscription plans configuration
const SUBSCRIPTION_PLANS = {
  BASIC: {
    name: 'Basic Plan',
    price: 999, // $9.99 in cents
    interval: 'month' as const,
    features: ['Access to basic courses', 'Community support', 'Progress tracking'],
    stripePriceId: process.env.STRIPE_BASIC_PRICE_ID
  },
  PREMIUM: {
    name: 'Premium Plan',
    price: 2999, // $29.99 in cents
    interval: 'month' as const,
    features: ['All courses', 'AI tutor', 'Live classes', 'Priority support', 'Certificates'],
    stripePriceId: process.env.STRIPE_PREMIUM_PRICE_ID
  },
  ENTERPRISE: {
    name: 'Enterprise Plan',
    price: 9999, // $99.99 in cents
    interval: 'month' as const,
    features: ['Everything in Premium', 'Unlimited everything', 'Custom content', 'Dedicated support', 'API access'],
    stripePriceId: process.env.STRIPE_ENTERPRISE_PRICE_ID
  }
}

// Get available subscription plans
router.get('/plans', async (_req, res) => {
  res.json(SUBSCRIPTION_PLANS)
})

// Get user's current subscription
router.get('/current', authenticate, async (req, res) => {
  const subscription = await prisma.subscription.findFirst({
    where: { 
      userId: req.userId!,
      status: 'ACTIVE'
    },
    orderBy: { createdAt: 'desc' }
  })

  if (!subscription) {
    res.json({ subscription: null })
    return
  }

  // Get Stripe subscription details if available
  let stripeSub = null
  if (subscription.stripeSubId && stripe) {
    try {
      stripeSub = await stripe.subscriptions.retrieve(subscription.stripeSubId)
    } catch (error) {
      console.error('Failed to fetch Stripe subscription:', error)
    }
  }

  res.json({ 
    subscription,
    stripeSub,
    plan: SUBSCRIPTION_PLANS[subscription.planType]
  })
})

// Create subscription checkout session
router.post('/checkout', authenticate, async (req, res) => {
  const schema = z.object({
    planType: z.enum(['BASIC', 'PREMIUM', 'ENTERPRISE'])
  })

  const { planType } = schema.parse(req.body)
  const plan = SUBSCRIPTION_PLANS[planType]

  if (!stripe || !plan.stripePriceId) {
    res.status(503).json({ error: 'Stripe is not configured for subscriptions' })
    return
  }

  const user = await prisma.user.findUnique({
    where: { id: req.userId! },
    select: { email: true, name: true }
  })

  if (!user) {
    res.status(404).json({ error: 'User not found' })
    return
  }

  try {
    const session = await stripe.checkout.sessions.create({
      customer_email: user.email,
      billing_address_collection: 'auto',
      line_items: [
        {
          price: plan.stripePriceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/subscription/canceled`,
      metadata: {
        userId: req.userId!,
        planType
      }
    })

    res.json({ sessionId: session.id, url: session.url })
  } catch (error) {
    console.error('Stripe checkout session error:', error)
    res.status(500).json({ error: 'Failed to create checkout session' })
  }
})

// Handle successful subscription
router.post('/success', authenticate, async (req, res) => {
  const schema = z.object({
    sessionId: z.string()
  })

  const { sessionId } = schema.parse(req.body)

  if (!stripe) {
    res.status(503).json({ error: 'Stripe is not configured' })
    return
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    
    if (!session.metadata?.userId || session.metadata.userId !== req.userId!) {
      res.status(400).json({ error: 'Invalid session' })
      return
    }

    const subscriptionId = session.subscription as string
    const stripeSub = await stripe.subscriptions.retrieve(subscriptionId)
    
    // Create subscription record
    const subscription = await prisma.subscription.create({
      data: {
        userId: req.userId!,
        planType: session.metadata.planType as any,
        status: 'ACTIVE',
        stripeSubId: subscriptionId,
        currentPeriodStart: new Date((stripeSub as any).current_period_start * 1000),
        currentPeriodEnd: new Date((stripeSub as any).current_period_end * 1000),
      }
    })

    // Update user subscription end date
    await prisma.user.update({
      where: { id: req.userId! },
      data: { subscriptionEnd: new Date((stripeSub as any).current_period_end * 1000) }
    })

    // Award loyalty points for subscription
    await prisma.$transaction([
      prisma.user.update({
        where: { id: req.userId! },
        data: { points: { increment: 100 } }
      }),
      prisma.loyaltyPoint.create({
        data: {
          userId: req.userId!,
          points: 100,
          source: 'PURCHASE',
          description: `Subscription bonus: ${session.metadata.planType}`
        }
      })
    ])

    res.json({ subscription, message: 'Subscription activated successfully' })
  } catch (error) {
    console.error('Subscription activation error:', error)
    res.status(500).json({ error: 'Failed to activate subscription' })
  }
})

// Cancel subscription
router.post('/cancel', authenticate, async (req, res) => {
  const subscription = await prisma.subscription.findFirst({
    where: { 
      userId: req.userId!,
      status: 'ACTIVE'
    }
  })

  if (!subscription) {
    res.status(404).json({ error: 'No active subscription found' })
    return
  }

  try {
    // Cancel in Stripe if available
    if (subscription.stripeSubId && stripe) {
      await stripe.subscriptions.update(subscription.stripeSubId, {
        cancel_at_period_end: true
      })
    }

    // Update database
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { cancelAtPeriodEnd: true }
    })

    res.json({ message: 'Subscription will be canceled at period end' })
  } catch (error) {
    console.error('Subscription cancellation error:', error)
    res.status(500).json({ error: 'Failed to cancel subscription' })
  }
})

// Reactivate subscription
router.post('/reactivate', authenticate, async (req, res) => {
  const subscription = await prisma.subscription.findFirst({
    where: { 
      userId: req.userId!,
      status: 'ACTIVE',
      cancelAtPeriodEnd: true
    }
  })

  if (!subscription) {
    res.status(404).json({ error: 'No cancellable subscription found' })
    return
  }

  try {
    // Reactivate in Stripe if available
    if (subscription.stripeSubId && stripe) {
      await stripe.subscriptions.update(subscription.stripeSubId, {
        cancel_at_period_end: false
      })
    }

    // Update database
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { cancelAtPeriodEnd: false }
    })

    res.json({ message: 'Subscription reactivated successfully' })
  } catch (error) {
    console.error('Subscription reactivation error:', error)
    res.status(500).json({ error: 'Failed to reactivate subscription' })
  }
})

// Update subscription plan
router.post('/update-plan', authenticate, async (req, res) => {
  const schema = z.object({
    newPlanType: z.enum(['BASIC', 'PREMIUM', 'ENTERPRISE'])
  })

  const { newPlanType } = schema.parse(req.body)
  const newPlan = SUBSCRIPTION_PLANS[newPlanType]

  const subscription = await prisma.subscription.findFirst({
    where: { 
      userId: req.userId!,
      status: 'ACTIVE'
    }
  })

  if (!subscription || !subscription.stripeSubId) {
    res.status(404).json({ error: 'No active Stripe subscription found' })
    return
  }

  if (!stripe || !newPlan.stripePriceId) {
    res.status(503).json({ error: 'Stripe is not configured for plan updates' })
    return
  }

  try {
    const stripeSub = await stripe.subscriptions.retrieve(subscription.stripeSubId)
    
    // Find the subscription item
    const subscriptionItem = stripeSub.items.data[0]
    if (!subscriptionItem) {
      res.status(400).json({ error: 'No subscription item found' })
      return
    }

    // Update the subscription
    const updatedSub = await stripe.subscriptions.update(subscription.stripeSubId, {
      items: [{
        id: subscriptionItem.id,
        price: newPlan.stripePriceId,
      }],
      proration_behavior: 'create_prorations'
    })

    // Update database
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { 
        planType: newPlanType,
        currentPeriodStart: new Date((updatedSub as any).current_period_start * 1000),
        currentPeriodEnd: new Date((updatedSub as any).current_period_end * 1000),
      }
    })

    res.json({ 
      message: 'Plan updated successfully',
      newPlan: newPlanType
    })
  } catch (error) {
    console.error('Plan update error:', error)
    res.status(500).json({ error: 'Failed to update plan' })
  }
})

// Get subscription history
router.get('/history', authenticate, async (req, res) => {
  const subscriptions = await prisma.subscription.findMany({
    where: { userId: req.userId! },
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: { name: true, email: true }
      }
    }
  })

  const history = subscriptions.map(sub => ({
    ...sub,
    plan: SUBSCRIPTION_PLANS[sub.planType]
  }))

  res.json({ history })
})

export default router
