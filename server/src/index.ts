import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth.js'
import courseRoutes from './routes/courses.js'
import liveClassRoutes from './routes/liveClasses.js'
import aiRoutes from './routes/ai.js'
import paymentRoutes from './routes/payments.js'
import leaderboardRoutes from './routes/leaderboard.js'
import dashboardRoutes from './routes/dashboard.js'
import loyaltyRoutes from './routes/loyalty.js'
import subscriptionRoutes from './routes/subscriptions.js'
import analyticsRoutes from './routes/analytics.js'
import adminRoutes from './routes/admin.js'

const app = express()
const PORT = Number(process.env.PORT) || 4000

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' }))
app.use(express.json())

// Stripe webhook needs raw body
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }))

app.use('/api/auth', authRoutes)
app.use('/api/courses', courseRoutes)
app.use('/api/live-classes', liveClassRoutes)
app.use('/api/ai', aiRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/leaderboard', leaderboardRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/loyalty', loyaltyRoutes)
app.use('/api/subscriptions', subscriptionRoutes)
app.use('/api/analytics', analyticsRoutes)
app.use('/api/admin', adminRoutes)

// Health check for Railway
app.get('/health', (_req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    service: 'PBI Academy API',
    timestamp: new Date().toISOString() 
  })
})

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.listen(PORT, () => {
  console.log(`PBI Academy server running on http://localhost:${PORT}`)
})
