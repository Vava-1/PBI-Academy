import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

router.get('/', async (req, res) => {
  const { language, level, category, search } = req.query
  const where: any = { isPublished: true }
  if (language) where.language = String(language).toLowerCase()
  if (level) where.level = String(level).toLowerCase()
  if (category) where.category = String(category)
  if (search) {
    where.OR = [
      { title: { contains: String(search), mode: 'insensitive' } },
      { description: { contains: String(search), mode: 'insensitive' } },
    ]
  }
  const courses = await prisma.course.findMany({ where, orderBy: { createdAt: 'desc' } })
  res.json(courses)
})

router.get('/:slug', async (req, res) => {
  const course = await prisma.course.findUnique({ where: { slug: req.params.slug } })
  if (!course) {
    res.status(404).json({ error: 'Course not found' })
    return
  }
  const lessons = await prisma.lesson.findMany({
    where: { courseId: course.id },
    orderBy: { order: 'asc' },
  })
  res.json({ ...course, lessons })
})

router.post('/:id/enroll', authenticate, async (req, res) => {
  const courseId = req.params.id
  const userId = req.userId!
  try {
    const enrollment = await prisma.enrollment.create({
      data: { userId, courseId: req.params.id as string, progress: 0 },
    })
    await prisma.course.update({
      where: { id: req.params.id as string },
      data: { studentsCount: { increment: 1 } },
    })
    res.status(201).json(enrollment)
  } catch (err: any) {
    if (err.code === 'P2002') {
      res.status(409).json({ error: 'Already enrolled' })
      return
    }
    console.error('Enroll error:', err)
    res.status(500).json({ error: 'Enrollment failed' })
  }
})

router.get('/:id/progress', authenticate, async (req, res) => {
  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: req.userId!, courseId: req.params.id as string } },
  })
  const progress = await prisma.lessonProgress.findMany({
    where: { userId: req.userId!, lesson: { courseId: req.params.id as string } },
  })
  res.json({ enrollment, lessonProgress: progress })
})

export default router
