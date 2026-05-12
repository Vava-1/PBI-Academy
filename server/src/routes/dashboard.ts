import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

router.get('/stats', authenticate, async (req, res) => {
  const userId = req.userId!
  const enrollments = await prisma.enrollment.findMany({
    where: { userId },
    include: { course: true },
  })
  const completedLessons = await prisma.lessonProgress.count({
    where: { userId, completed: true },
  })
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { level: true, points: true, streak: true },
  })

  const coursesInProgress = enrollments.length
  const totalLessons = enrollments.reduce((sum, e) => sum + (e.course?.lessonsCount || 0), 0)
  const averageScore = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

  // Calculate percentile roughly
  const totalUsers = await prisma.user.count()
  const higherRanked = await prisma.user.count({ where: { points: { gt: user?.points || 0 } } })
  const percentile = totalUsers > 0 ? Math.round(((totalUsers - higherRanked) / totalUsers) * 100) : 0

  res.json({
    coursesInProgress,
    completedLessons,
    averageScore,
    studyStreak: user?.streak || 0,
    totalPoints: user?.points || 0,
    currentLevel: user?.level || 1,
    rank: higherRanked + 1,
    percentile,
  })
})

router.get('/enrollments', authenticate, async (req, res) => {
  const enrollments = await prisma.enrollment.findMany({
    where: { userId: req.userId! },
    include: { course: true },
    orderBy: { enrolledAt: 'desc' },
  })
  res.json(enrollments)
})

export default router
