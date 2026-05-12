import { Router } from 'express'
import Stripe from 'stripe'
import { prisma } from '../lib/prisma.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-08-27.basil' })
  : null

router.post('/create-checkout-session', authenticate, async (req, res) => {
  const { courseId } = req.body
  if (!stripe) {
    res.status(503).json({ error: 'Stripe is not configured' })
    return
  }
  const course = await prisma.course.findUnique({ where: { id: courseId } })
  if (!course) {
    res.status(404).json({ error: 'Course not found' })
    return
  }

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: { name: course.title, description: course.description.slice(0, 100) },
          unit_amount: course.price,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${frontendUrl}/courses/${course.slug}?success=1`,
    cancel_url: `${frontendUrl}/courses/${course.slug}?canceled=1`,
    metadata: { userId: req.userId!, courseId: course.id },
  })

  await prisma.payment.create({
    data: {
      userId: req.userId!,
      courseId: course.id,
      stripeSessionId: session.id,
      amount: course.price,
      status: 'pending',
    },
  })

  res.json({ url: session.url })
})

router.post('/webhook', async (req, res) => {
  if (!stripe) {
    res.status(503).json({ error: 'Stripe is not configured' })
    return
  }
  const sig = req.headers['stripe-signature'] as string
  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    )
  } catch (err: any) {
    res.status(400).send(`Webhook Error: ${err.message}`)
    return
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const payment = await prisma.payment.findUnique({
      where: { stripeSessionId: session.id },
    })
    if (payment) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'completed' },
      })
      await prisma.enrollment.create({
        data: { userId: payment.userId, courseId: payment.courseId, progress: 0 },
      }).catch(() => null)
    }
  }

  res.json({ received: true })
})

export default router
