import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

router.get('/', async (_req, res) => {
  const classes = await prisma.liveClass.findMany({
    orderBy: { scheduledAt: 'asc' },
    include: { course: { select: { title: true, slug: true } } },
  })
  res.json(classes)
})

router.post('/:id/register', authenticate, async (req, res) => {
  const liveClass = await prisma.liveClass.findUnique({
    where: { id: req.params.id as string },
  })
  if (!liveClass) {
    res.status(404).json({ error: 'Live class not found' })
    return
  }
  if (liveClass.registeredCount >= liveClass.maxStudents) {
    res.status(400).json({ error: 'Class is full' })
    return
  }
  await prisma.liveClass.update({
    where: { id: req.params.id as string },
    data: { registeredCount: { increment: 1 } },
  })
  res.json({ success: true, roomUrl: liveClass.roomUrl || null })
})

export default router
