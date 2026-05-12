import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

// Get comprehensive user analytics
router.get('/overview', authenticate, async (req, res) => {
  const userId = req.userId!
  
  // Get user basic info
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      loyaltyTier: true,
      points: true,
      totalSpent: true,
      lifetimeValue: true,
      streak: true,
      level: true,
      createdAt: true,
      lastActiveAt: true
    }
  })

  if (!user) {
    res.status(404).json({ error: 'User not found' })
    return
  }

  // Calculate engagement metrics
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const engagementMetrics = await prisma.engagementMetric.findMany({
    where: { 
      userId,
      createdAt: { gte: thirtyDaysAgo }
    }
  })

  // Get learning progress
  const enrollments = await prisma.enrollment.findMany({
    where: { userId },
    include: {
      course: {
        select: { title: true, category: true, price: true }
      }
    }
  })

  const lessonProgress = await prisma.lessonProgress.findMany({
    where: { userId },
    include: {
      lesson: {
        select: { courseId: true, title: true }
      }
    }
  })

  // Get payment history
  const payments = await prisma.payment.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  })

  // Get loyalty points history
  const loyaltyPoints = await prisma.loyaltyPoint.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 50
  })

  // Calculate analytics components first
  const userAnalytics = {
    ...user,
    daysSinceJoin: Math.floor((Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)),
    daysSinceLastActive: user.lastActiveAt ? 
      Math.floor((Date.now() - new Date(user.lastActiveAt).getTime()) / (1000 * 60 * 60 * 24)) : 0
  }

  const engagementAnalytics = {
    totalSessions: engagementMetrics.length,
    averageSessionLength: engagementMetrics.reduce((sum, m) => 
      m.metricType === 'TIME_SPENT' ? sum + m.value : sum, 0) / 
      Math.max(engagementMetrics.filter(m => m.metricType === 'TIME_SPENT').length, 1),
    lessonsCompleted: engagementMetrics.filter(m => m.metricType === 'LESSON_COMPLETED').length,
    averageQuizScore: engagementMetrics
      .filter(m => m.metricType === 'QUIZ_SCORE')
      .reduce((sum, m) => sum + m.value, 0) / 
      Math.max(engagementMetrics.filter(m => m.metricType === 'QUIZ_SCORE').length, 1),
    engagementScore: engagementMetrics.reduce((score, metric) => {
      switch (metric.metricType) {
        case 'LOGIN': return score + 1
        case 'LESSON_COMPLETED': return score + 5
        case 'QUIZ_SCORE': return score + (metric.value / 20)
        case 'TIME_SPENT': return score + (metric.value / 60)
        case 'SOCIAL_SHARE': return score + 3
        case 'REFERRAL_CLICK': return score + 2
        default: return score
      }
    }, 0)
  }

  const learningAnalytics = {
    coursesEnrolled: enrollments.length,
    coursesCompleted: enrollments.filter(e => e.progress === 100).length,
    averageProgress: enrollments.reduce((sum, e) => sum + e.progress, 0) / Math.max(enrollments.length, 1),
    lessonsCompleted: lessonProgress.filter(lp => lp.completed).length,
    totalLessons: lessonProgress.length,
    completionRate: (lessonProgress.filter(lp => lp.completed).length / Math.max(lessonProgress.length, 1)) * 100,
    categoriesStudied: [...new Set(enrollments.map(e => e.course.category))].length
  }

  const financialAnalytics = {
    totalSpent: user.totalSpent,
    lifetimeValue: user.lifetimeValue,
    averageOrderValue: payments.length > 0 ? 
      payments.reduce((sum, p) => sum + p.amount, 0) / payments.length : 0,
    paymentsCount: payments.length,
    lastPaymentDate: payments.length > 0 ? payments[0].createdAt : null,
    monthlySpending: payments
      .filter(p => {
        const paymentDate = new Date(p.createdAt)
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        return paymentDate >= thirtyDaysAgo
      })
      .reduce((sum, p) => sum + p.amount, 0) / 100
  }

  const loyaltyAnalytics = {
    currentPoints: user.points,
    pointsEarned: loyaltyPoints.filter(p => p.points > 0).reduce((sum, p) => sum + p.points, 0),
    pointsSpent: Math.abs(loyaltyPoints.filter(p => p.points < 0).reduce((sum, p) => sum + p.points, 0)),
    pointsBreakdown: loyaltyPoints.reduce((acc, point) => {
      acc[point.source] = (acc[point.source] || 0) + point.points
      return acc
    }, {} as Record<string, number>)
  }

  // Combine all analytics
  const analytics = {
    user: userAnalytics,
    engagement: engagementAnalytics,
    learning: learningAnalytics,
    financial: financialAnalytics,
    loyalty: loyaltyAnalytics,
    retention: {
      riskLevel: calculateRetentionRisk(user, engagementMetrics, enrollments),
      predictedLifetimeValue: predictLifetimeValue(user, { user: userAnalytics, engagement: engagementAnalytics, learning: learningAnalytics, financial: financialAnalytics, loyalty: loyaltyAnalytics }),
      churnProbability: calculateChurnProbability(user, engagementMetrics, enrollments)
    }
  }

  res.json(analytics)
})

// Get learning patterns and recommendations
router.get('/learning-patterns', authenticate, async (req, res) => {
  const userId = req.userId!
  
  const enrollments = await prisma.enrollment.findMany({
    where: { userId },
    include: {
      course: {
        select: { category: true, level: true, language: true, testType: true }
      }
    }
  })

  const lessonProgress = await prisma.lessonProgress.findMany({
    where: { userId },
    include: {
      lesson: {
        select: { courseId: true, order: true, durationMin: true }
      }
    }
  })

  const engagementMetrics = await prisma.engagementMetric.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 100
  })

  // Analyze learning patterns
  const patterns = {
    preferredCategories: analyzeCategoryPreferences(enrollments),
    optimalStudyTime: analyzeOptimalStudyTime(engagementMetrics),
    learningSpeed: analyzeLearningSpeed(enrollments, lessonProgress),
    difficultyProgression: analyzeDifficultyProgression(enrollments),
    engagementTrends: analyzeEngagementTrends(engagementMetrics),
    recommendations: generateLearningRecommendations(enrollments, lessonProgress, engagementMetrics)
  }

  res.json(patterns)
})

// Get cohort analysis for business insights
router.get('/cohort-analysis', authenticate, async (req, res) => {
  // This would typically be admin-only, but for demo purposes we'll show user's cohort
  const userId = req.userId!
  
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { createdAt: true }
  })

  if (!user) {
    res.status(404).json({ error: 'User not found' })
    return
  }

  // Find users from the same month (cohort)
  const userMonth = user.createdAt.toISOString().slice(0, 7) // YYYY-MM
  const cohortStart = new Date(userMonth + '-01')
  const cohortEnd = new Date(cohortStart)
  cohortEnd.setMonth(cohortEnd.getMonth() + 1)

  const cohortUsers = await prisma.user.findMany({
    where: {
      createdAt: {
        gte: cohortStart,
        lt: cohortEnd
      }
    },
    select: {
      id: true,
      createdAt: true,
      totalSpent: true,
      loyaltyTier: true,
      points: true,
      lifetimeValue: true
    }
  })

  // Calculate cohort metrics
  const cohortAnalysis = {
    cohortSize: cohortUsers.length,
    cohortMonth: userMonth,
    averageLifetimeValue: cohortUsers.reduce((sum, u) => sum + (u.lifetimeValue || 0), 0) / cohortUsers.length,
    averageSpent: cohortUsers.reduce((sum, u) => sum + u.totalSpent, 0) / cohortUsers.length,
    tierDistribution: cohortUsers.reduce((acc, u) => {
      acc[u.loyaltyTier] = (acc[u.loyaltyTier] || 0) + 1
      return acc
    }, {} as Record<string, number>),
    retentionRates: await calculateCohortRetentionRates(cohortUsers.map(u => u.id))
  }

  res.json(cohortAnalysis)
})

// Helper functions
function calculateRetentionRisk(user: any, engagementMetrics: any[], enrollments: any[]): 'LOW' | 'MEDIUM' | 'HIGH' {
  const daysSinceLastActive = user.lastActiveAt ? 
    Math.floor((Date.now() - new Date(user.lastActiveAt).getTime()) / (1000 * 60 * 60 * 24)) : 999
  
  const recentEngagement = engagementMetrics.filter(m => {
    const daysSince = (Date.now() - m.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    return daysSince <= 7
  }).length

  const completionRate = enrollments.length > 0 ? 
    enrollments.filter(e => e.progress > 50).length / enrollments.length : 0

  if (daysSinceLastActive > 30 || recentEngagement === 0 || completionRate < 0.2) {
    return 'HIGH'
  } else if (daysSinceLastActive > 14 || recentEngagement < 3 || completionRate < 0.5) {
    return 'MEDIUM'
  } else {
    return 'LOW'
  }
}

function predictLifetimeValue(user: any, analytics: any): number {
  const monthlyValue = analytics.financial.monthlySpending
  const baseLifetime = 24 // 24 months base lifetime
  const loyaltyMultiplier = {
    BRONZE: 1,
    SILVER: 1.2,
    GOLD: 1.5,
    PLATINUM: 2,
    DIAMOND: 2.5
  }
  
  const engagementMultiplier = analytics.engagement.engagementScore > 100 ? 1.5 : 
                               analytics.engagement.engagementScore > 50 ? 1.2 : 1
  
  return monthlyValue * baseLifetime * 
         (loyaltyMultiplier[user.loyaltyTier as keyof typeof loyaltyMultiplier] || 1) * 
         engagementMultiplier
}

function calculateChurnProbability(user: any, engagementMetrics: any[], enrollments: any[]): number {
  const daysSinceLastActive = user.lastActiveAt ? 
    Math.floor((Date.now() - new Date(user.lastActiveAt).getTime()) / (1000 * 60 * 60 * 24)) : 999
  
  const recentEngagement = engagementMetrics.filter(m => {
    const daysSince = (Date.now() - m.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    return daysSince <= 7
  }).length

  const completionRate = enrollments.length > 0 ? 
    enrollments.filter(e => e.progress > 50).length / enrollments.length : 0

  let churnProbability = 0.1 // Base 10% churn rate
  
  if (daysSinceLastActive > 30) churnProbability += 0.4
  else if (daysSinceLastActive > 14) churnProbability += 0.2
  
  if (recentEngagement === 0) churnProbability += 0.3
  else if (recentEngagement < 3) churnProbability += 0.1
  
  if (completionRate < 0.2) churnProbability += 0.2
  else if (completionRate < 0.5) churnProbability += 0.1
  
  return Math.min(churnProbability, 0.9) // Cap at 90%
}

function analyzeCategoryPreferences(enrollments: any[]) {
  const categoryCount = enrollments.reduce((acc, e) => {
    acc[e.course.category] = (acc[e.course.category] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  return Object.entries(categoryCount)
    .sort(([,a], [,b]) => (b as number) - (a as number))
    .map(([category, count]) => ({ category, count: count as number, percentage: ((count as number) / enrollments.length) * 100 }))
}

function analyzeOptimalStudyTime(engagementMetrics: any[]) {
  const timeMetrics = engagementMetrics.filter(m => m.metricType === 'TIME_SPENT')
  const hourlyActivity = new Array(24).fill(0)
  
  timeMetrics.forEach(metric => {
    const hour = new Date(metric.createdAt).getHours()
    hourlyActivity[hour] += metric.value
  })
  
  const maxHour = hourlyActivity.indexOf(Math.max(...hourlyActivity))
  return {
    optimalHour: maxHour,
    optimalTimeRange: `${maxHour}:00 - ${maxHour + 1}:00`,
    hourlyDistribution: hourlyActivity.map((activity, hour) => ({
      hour,
      activity,
      percentage: hourlyActivity.length > 0 ? (activity / Math.max(...hourlyActivity)) * 100 : 0
    }))
  }
}

function analyzeLearningSpeed(enrollments: any[], lessonProgress: any[]) {
  const speeds = enrollments.map(enrollment => {
    const courseLessons = lessonProgress.filter(lp => 
      lp.lesson.courseId === enrollment.courseId
    )
    const completedLessons = courseLessons.filter(lp => lp.completed)
    const daysSinceEnrollment = Math.floor(
      (Date.now() - enrollment.enrolledAt.getTime()) / (1000 * 60 * 60 * 24)
    )
    
    return {
      courseId: enrollment.courseId,
      lessonsPerDay: daysSinceEnrollment > 0 ? completedLessons.length / daysSinceEnrollment : 0,
      completionRate: courseLessons.length > 0 ? completedLessons.length / courseLessons.length : 0
    }
  })
  
  const avgSpeed = speeds.reduce((sum, s) => sum + s.lessonsPerDay, 0) / Math.max(speeds.length, 1)
  const avgCompletion = speeds.reduce((sum, s) => sum + s.completionRate, 0) / Math.max(speeds.length, 1)
  
  return {
    averageLessonsPerDay: avgSpeed,
    averageCompletionRate: avgCompletion,
    courseSpeeds: speeds
  }
}

function analyzeDifficultyProgression(enrollments: any[]) {
  const levels = enrollments.map(e => e.course.level)
  const levelProgression = levels.map((level, index) => ({
    enrollmentOrder: index + 1,
    level,
    difficulty: ['beginner', 'intermediate', 'advanced'].indexOf(level.toLowerCase())
  }))
  
  return {
    progression: levelProgression,
    trend: levelProgression.length > 1 ? 
      levelProgression[levelProgression.length - 1].difficulty > levelProgression[0].difficulty ? 'improving' : 'stable'
      : 'insufficient_data'
  }
}

function analyzeEngagementTrends(engagementMetrics: any[]) {
  const dailyEngagement = engagementMetrics.reduce((acc, metric) => {
    const date = metric.createdAt.toISOString().slice(0, 10)
    if (!acc[date]) acc[date] = { count: 0, totalScore: 0 }
    acc[date].count += 1
    acc[date].totalScore += getEngagementScore(metric.metricType)
    return acc
  }, {} as Record<string, { count: number, totalScore: number }>)
  
  const trends = Object.entries(dailyEngagement).map(([date, data]) => ({
    date,
    engagementScore: (data as any).totalScore / (data as any).count,
    activityCount: (data as any).count
  })).sort((a, b) => a.date.localeCompare(b.date))
  
  return {
    dailyTrends: trends,
    weeklyAverage: trends.length > 0 ? 
      trends.reduce((sum, t) => sum + t.engagementScore, 0) / trends.length : 0
  }
}

function generateLearningRecommendations(enrollments: any[], lessonProgress: any[], engagementMetrics: any[]) {
  const recommendations = []
  
  // Based on completion rates
  const incompleteCourses = enrollments.filter(e => e.progress < 100)
  if (incompleteCourses.length > 0) {
    recommendations.push({
      type: 'completion',
      priority: 'high',
      message: `You have ${incompleteCourses.length} incomplete courses. Focus on finishing one before starting new ones.`,
      action: 'resume_learning'
    })
  }
  
  // Based on study patterns
  const recentActivity = engagementMetrics.filter(m => {
    const daysSince = (Date.now() - m.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    return daysSince <= 7
  })
  
  if (recentActivity.length < 3) {
    recommendations.push({
      type: 'engagement',
      priority: 'medium',
      message: 'Your recent activity has been low. Try to study for at least 15 minutes daily.',
      action: 'increase_engagement'
    })
  }
  
  // Based on learning speed
  const avgCompletionRate = enrollments.length > 0 ? 
    enrollments.reduce((sum, e) => sum + e.progress, 0) / (enrollments.length * 100) : 0
  
  if (avgCompletionRate < 0.5) {
    recommendations.push({
      type: 'pace',
      priority: 'medium',
      message: 'Consider slowing down and focusing on understanding rather than speed.',
      action: 'adjust_pace'
    })
  }
  
  return recommendations
}

function getEngagementScore(metricType: string): number {
  switch (metricType) {
    case 'LOGIN': return 1
    case 'LESSON_COMPLETED': return 5
    case 'QUIZ_SCORE': return 3
    case 'TIME_SPENT': return 2
    case 'SOCIAL_SHARE': return 4
    case 'REFERRAL_CLICK': return 2
    default: return 1
  }
}

async function calculateCohortRetentionRates(userIds: string[]) {
  // This is a simplified version - in production you'd track monthly retention
  const retentionRates = []
  const now = new Date()
  
  for (let month = 1; month <= 12; month++) {
    const monthAgo = new Date(now)
    monthAgo.setMonth(monthAgo.getMonth() - month)
    
    const activeUsers = await prisma.user.count({
      where: {
        id: { in: userIds },
        lastActiveAt: { gte: monthAgo }
      }
    })
    
    retentionRates.push({
      month,
      retentionRate: (activeUsers / userIds.length) * 100
    })
  }
  
  return retentionRates
}

export default router
