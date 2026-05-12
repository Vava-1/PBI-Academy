import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

// Get user loyalty profile
router.get('/profile', authenticate, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId! },
    select: {
      id: true,
      name: true,
      email: true,
      loyaltyTier: true,
      points: true,
      totalSpent: true,
      lifetimeValue: true,
      referralCode: true,
      streak: true,
      level: true,
      lastActiveAt: true,
      subscriptionEnd: true,
    }
  })

  if (!user) {
    res.status(404).json({ error: 'User not found' })
    return
  }

  // Get tier benefits
  const tierBenefits = {
    BRONZE: { discount: 0, pointsMultiplier: 1, features: ['Basic courses'] },
    SILVER: { discount: 5, pointsMultiplier: 1.2, features: ['Basic courses', 'AI tutor'] },
    GOLD: { discount: 10, pointsMultiplier: 1.5, features: ['All courses', 'AI tutor', 'Live classes'] },
    PLATINUM: { discount: 15, pointsMultiplier: 2, features: ['All features', 'Priority support'] },
    DIAMOND: { discount: 20, pointsMultiplier: 2.5, features: ['All features', 'VIP support', 'Exclusive content'] }
  }

  // Get user's points history
  const pointsHistory = await prisma.loyaltyPoint.findMany({
    where: { userId: req.userId! },
    orderBy: { createdAt: 'desc' },
    take: 10
  })

  // Calculate next tier progress
  const tierThresholds = { BRONZE: 0, SILVER: 1000, GOLD: 5000, PLATINUM: 15000, DIAMOND: 50000 }
  const currentTier = user.loyaltyTier
  const currentThreshold = tierThresholds[currentTier]
  const nextTier = Object.keys(tierThresholds).find(tier => 
    tierThresholds[tier as keyof typeof tierThresholds] > currentThreshold
  )
  const nextThreshold = nextTier ? tierThresholds[nextTier as keyof typeof tierThresholds] : currentThreshold
  const progress = nextTier ? ((user.points - currentThreshold) / (nextThreshold - currentThreshold)) * 100 : 100

  res.json({
    user,
    tierBenefits: tierBenefits[user.loyaltyTier],
    pointsHistory,
    nextTier,
    progress: Math.min(progress, 100)
  })
})

// Get available rewards
router.get('/rewards', authenticate, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId! },
    select: { loyaltyTier: true, points: true }
  })

  if (!user) {
    res.status(404).json({ error: 'User not found' })
    return
  }

  const rewards = await prisma.reward.findMany({
    where: { 
      isActive: true,
      tier: { in: ['BRONZE', user.loyaltyTier] }
    },
    orderBy: { pointsCost: 'asc' }
  })

  const userRewards = await prisma.userReward.findMany({
    where: { userId: req.userId! },
    include: { reward: true }
  })

  res.json({
    available: rewards,
    claimed: userRewards,
    userPoints: user.points
  })
})

// Claim a reward
router.post('/rewards/:id/claim', authenticate, async (req, res) => {
  const rewardId = req.params.id as string
  
  const [user, reward] = await Promise.all([
    prisma.user.findUnique({ where: { id: req.userId! } }),
    prisma.reward.findUnique({ where: { id: rewardId } })
  ])

  if (!user || !reward) {
    res.status(404).json({ error: 'User or reward not found' })
    return
  }

  if (user.points < reward.pointsCost) {
    res.status(400).json({ error: 'Insufficient points' })
    return
  }

  // Check if already claimed
  const existingClaim = await prisma.userReward.findFirst({
    where: { userId: req.userId!, rewardId, status: 'ACTIVE' }
  })

  if (existingClaim) {
    res.status(400).json({ error: 'Reward already claimed' })
    return
  }

  // Create claim and deduct points
  const [userReward] = await prisma.$transaction([
    prisma.userReward.create({
      data: {
        userId: req.userId!,
        rewardId,
        status: 'CLAIMED',
        claimedAt: new Date()
      }
    }),
    prisma.user.update({
      where: { id: req.userId! },
      data: { points: { decrement: reward.pointsCost } }
    }),
    prisma.loyaltyPoint.create({
      data: {
        userId: req.userId!,
        points: -reward.pointsCost,
        source: 'BONUS',
        description: `Redeemed reward: ${reward.title}`
      }
    })
  ])

  res.json({ 
    message: 'Reward claimed successfully',
    userReward,
    remainingPoints: user.points - reward.pointsCost
  })
})

// Get referral stats
router.get('/referrals', authenticate, async (req, res) => {
  const referrals = await prisma.referral.findMany({
    where: { referrerId: req.userId! },
    include: {
      referrer: { select: { name: true, email: true } }
    },
    orderBy: { createdAt: 'desc' }
  })

  const stats = {
    total: referrals.length,
    pending: referrals.filter(r => r.status === 'PENDING').length,
    completed: referrals.filter(r => r.status === 'COMPLETED').length,
    totalRewards: referrals.reduce((sum, r) => sum + r.rewardAmount, 0)
  }

  res.json({ referrals, stats })
})

// Create referral
router.post('/referrals', authenticate, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId! },
    select: { referralCode: true }
  })

  if (!user?.referralCode) {
    // Generate referral code
    const code = `PBI${Math.random().toString(36).substr(2, 6).toUpperCase()}`
    await prisma.user.update({
      where: { id: req.userId! },
      data: { referralCode: code }
    })
    res.json({ referralCode: code })
    return
  }

  res.json({ referralCode: user.referralCode })
})

// Get engagement metrics
router.get('/engagement', authenticate, async (req, res) => {
  const metrics = await prisma.engagementMetric.findMany({
    where: { userId: req.userId! },
    orderBy: { createdAt: 'desc' },
    take: 50
  })

  // Calculate engagement score
  const recentMetrics = metrics.filter(m => {
    const daysSince = (Date.now() - m.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    return daysSince <= 30
  })

  const engagementScore = recentMetrics.reduce((score, metric) => {
    switch (metric.metricType) {
      case 'LOGIN': return score + 1
      case 'LESSON_COMPLETED': return score + 5
      case 'QUIZ_SCORE': return score + (metric.value / 20) // Max 5 points for 100% score
      case 'TIME_SPENT': return score + (metric.value / 60) // 1 point per minute
      case 'SOCIAL_SHARE': return score + 3
      case 'REFERRAL_CLICK': return score + 2
      default: return score
    }
  }, 0)

  res.json({
    metrics,
    engagementScore: Math.round(engagementScore),
    level: Math.floor(engagementScore / 50) + 1
  })
})

// Track engagement
router.post('/engagement', authenticate, async (req, res) => {
  const schema = z.object({
    metricType: z.enum(['LOGIN', 'LESSON_COMPLETED', 'QUIZ_SCORE', 'TIME_SPENT', 'SOCIAL_SHARE', 'REFERRAL_CLICK']),
    value: z.number(),
    metadata: z.string().optional()
  })

  const validated = schema.parse(req.body)

  const metric = await prisma.engagementMetric.create({
    data: {
      userId: req.userId!,
      ...validated
    }
  })

  // Award points for engagement
  let pointsAwarded = 0
  switch (validated.metricType) {
    case 'LOGIN': pointsAwarded = 5; break
    case 'LESSON_COMPLETED': pointsAwarded = 20; break
    case 'QUIZ_SCORE': pointsAwarded = Math.round(validated.value / 10); break
    case 'TIME_SPENT': pointsAwarded = Math.round(validated.value / 600); // 1 point per 10 minutes
    case 'SOCIAL_SHARE': pointsAwarded = 15; break
    case 'REFERRAL_CLICK': pointsAwarded = 10; break
  }

  if (pointsAwarded > 0) {
    await prisma.$transaction([
      prisma.user.update({
        where: { id: req.userId! },
        data: { 
          points: { increment: pointsAwarded },
          lastActiveAt: new Date()
        }
      }),
      prisma.loyaltyPoint.create({
        data: {
          userId: req.userId!,
          points: pointsAwarded,
          source: 'ENGAGEMENT',
          description: `${validated.metricType} engagement bonus`
        }
      })
    ])
  }

  res.json({ metric, pointsAwarded })
})

export default router
