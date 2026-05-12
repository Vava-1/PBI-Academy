import { Router } from 'express'
import { prisma } from '../lib/prisma.js'

const router = Router()

router.get('/', async (_req, res) => {
  const users = await prisma.user.findMany({
    orderBy: [{ points: 'desc' }, { level: 'desc' }],
    take: 50,
    select: {
      id: true,
      name: true,
      avatar: true,
      level: true,
      points: true,
      streak: true,
      _count: { select: { enrollments: true } },
    },
  })
  const leaderboard = users.map((u, i) => ({
    rank: i + 1,
    name: u.name,
    avatar: u.avatar,
    level: u.level,
    points: u.points,
    courses: u._count.enrollments,
    streak: u.streak,
  }))
  res.json(leaderboard)
})

export default router
