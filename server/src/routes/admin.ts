import { Router, Request, Response } from 'express'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { prisma } from '../lib/prisma.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

// Extend Request type to include adminUser
interface AdminRequest extends Request {
  adminUser?: {
    id: string
    role: string
    userId: string
    user: {
      id: string
      name: string
      email: string
    }
  }
}

// Admin authentication middleware
const adminAuth = async (req: AdminRequest, res: Response, next: any) => {
  try {
    const adminUser = await prisma.adminUser.findUnique({
      where: { userId: req.userId! },
      include: { user: true }
    })

    if (!adminUser || adminUser.isLocked) {
      return res.status(403).json({ error: 'Access denied' })
    }

    req.adminUser = adminUser
    next()
  } catch (error) {
    return res.status(500).json({ error: 'Server error' })
  }
}

// Admin login (separate from user login)
router.post('/login', async (req: Request, res: Response) => {
  const schema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    ipAddress: z.string().optional(),
    userAgent: z.string().optional()
  })

  const validated = schema.parse(req.body)

  try {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: validated.email }
    })

    if (!user) {
      await logAdminActivity(null, 'LOGIN_FAILED', 'user', null, validated.ipAddress || '', validated.userAgent || '')
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Check if user has admin access
    const adminUser = await prisma.adminUser.findUnique({
      where: { userId: user.id }
    })

    if (!adminUser || adminUser.isLocked) {
      return res.status(403).json({ error: 'Access denied' })
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(validated.password, user.passwordHash)
    if (!isValidPassword) {
      await prisma.adminUser.update({
        where: { id: adminUser.id },
        data: { loginAttempts: { increment: 1 } }
      })
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Update admin login info
    await prisma.adminUser.update({
      where: { id: adminUser.id },
      data: { 
        lastLoginAt: new Date(),
        loginAttempts: 0
      }
    })

    // Log activity
    await logAdminActivity(adminUser.id, 'LOGIN_SUCCESS', 'system', null, validated.ipAddress || '', validated.userAgent || '')

    // Create admin token (you could use JWT here)
    const adminToken = Buffer.from(`${adminUser.id}:${new Date().getTime()}`).toString('base64')

    res.json({
      adminUser: {
        id: adminUser.id,
        role: adminUser.role,
        permissions: JSON.parse(adminUser.permissions),
        user: { id: user.id, name: user.name, email: user.email }
      },
      token: adminToken
    })
  } catch (error) {
    res.status(500).json({ error: 'Login failed' })
  }
})

// Dashboard Overview
router.get('/dashboard', adminAuth, async (req: AdminRequest, res: Response) => {
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  // Get key metrics
  const [
    totalUsers,
    newUsers30Days,
    totalRevenue,
    revenue30Days,
    totalCourses,
    activeSubscriptions,
    recentActivity
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.payment.aggregate({ _sum: { amount: true }, where: { status: 'completed' } }),
    prisma.payment.aggregate({ 
      _sum: { amount: true }, 
      where: { status: 'completed', createdAt: { gte: thirtyDaysAgo } }
    }),
    prisma.course.count(),
    prisma.subscription.count({ where: { status: 'ACTIVE' } }),
    prisma.adminActivityLog.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { adminUser: { include: { user: { select: { name: true } } } } }
    })
  ])

  // User growth data
  const userGrowth = await prisma.$queryRaw`
    SELECT 
      DATE(createdAt) as date,
      COUNT(*) as count
    FROM users 
    WHERE createdAt >= ${thirtyDaysAgo.toISOString()}
    GROUP BY DATE(createdAt)
    ORDER BY date ASC
  ` as Array<{ date: string, count: number }>

  // Revenue data
  const revenueData = await prisma.$queryRaw`
    SELECT 
      DATE(createdAt) as date,
      SUM(amount) as revenue
    FROM payments 
    WHERE status = 'completed' AND createdAt >= ${thirtyDaysAgo.toISOString()}
    GROUP BY DATE(createdAt)
    ORDER BY date ASC
  ` as Array<{ date: string, revenue: number }>

  res.json({
    overview: {
      totalUsers,
      newUsers30Days,
      totalRevenue: totalRevenue._sum.amount || 0,
      revenue30Days: revenue30Days._sum.amount || 0,
      totalCourses,
      activeSubscriptions,
      revenueGrowth: calculateGrowthRate(revenue30Days._sum.amount || 0, totalRevenue._sum.amount || 0)
    },
    charts: {
      userGrowth,
      revenueData
    },
    recentActivity: recentActivity.map(activity => ({
      id: activity.id,
      action: activity.action,
      resource: activity.resource,
      adminName: activity.adminUser.user.name,
      createdAt: activity.createdAt
    }))
  })
})

// User Management
router.get('/users', adminAuth, async (req: AdminRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1
  const limit = parseInt(req.query.limit as string) || 20
  const search = req.query.search as string
  const role = req.query.role as string

  const where: any = {}
  
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { email: { contains: search } }
    ]
  }

  if (role) {
    where.role = role
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      include: {
        adminUser: {
          select: { role: true, isLocked: true }
        },
        enrollments: {
          select: { courseId: true, progress: true }
        },
        payments: {
          select: { amount: true, status: true, createdAt: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    }),
    prisma.user.count({ where })
  ])

  res.json({
    users: users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      loyaltyTier: user.loyaltyTier,
      points: user.points,
      totalSpent: user.totalSpent,
      createdAt: user.createdAt,
      lastActiveAt: user.lastActiveAt,
      adminRole: user.adminUser?.role,
      isLocked: user.adminUser?.isLocked,
      enrollmentsCount: user.enrollments.length,
      totalSpentOnCourses: user.payments
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + p.amount, 0)
    })),
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  })
})

// Update user role
router.put('/users/:id/role', adminAuth, async (req: AdminRequest, res: Response) => {
  const schema = z.object({
    role: z.enum(['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'MODERATOR', 'VIEWER']),
    permissions: z.array(z.string())
  })

  const { role, permissions } = schema.parse(req.body)
  const userId = req.params.id as string

  try {
    const adminUser = await prisma.adminUser.findUnique({
      where: { userId }
    })

    if (adminUser) {
      await prisma.adminUser.update({
        where: { id: adminUser.id },
        data: { role, permissions: JSON.stringify(permissions) }
      })
    } else {
      await prisma.adminUser.create({
        data: {
          userId,
          role,
          permissions: JSON.stringify(permissions)
        }
      })
    }

    await logAdminActivity(req.adminUser!.id, 'USER_ROLE_UPDATE', 'user', userId, req.ip || '', req.get('User-Agent') || '')

    res.json({ message: 'User role updated successfully' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user role' })
  }
})

// Lock/Unlock user
router.put('/users/:id/lock', adminAuth, async (req: AdminRequest, res: Response) => {
  const schema = z.object({
    isLocked: z.boolean()
  })

  const { isLocked } = schema.parse(req.body)
  const userId = req.params.id as string

  try {
    await prisma.adminUser.update({
      where: { userId },
      data: { isLocked }
    })

    await logAdminActivity(req.adminUser!.id, isLocked ? 'USER_LOCKED' : 'USER_UNLOCKED', 'user', userId, req.ip || '', req.get('User-Agent') || '')

    res.json({ message: `User ${isLocked ? 'locked' : 'unlocked'} successfully` })
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user status' })
  }
})

// Content Management
router.get('/pages', adminAuth, async (req: AdminRequest, res: Response) => {
  const pages = await prisma.contentPage.findMany({
    orderBy: { updatedAt: 'desc' }
  })

  res.json({ pages })
})

router.post('/pages', adminAuth, async (req: AdminRequest, res: Response) => {
  const schema = z.object({
    title: z.string().min(1),
    slug: z.string().min(1),
    content: z.string(),
    excerpt: z.string().optional(),
    status: z.enum(['DRAFT', 'PUBLISHED', 'SCHEDULED', 'ARCHIVED']),
    featuredImage: z.string().optional(),
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
    canonicalUrl: z.string().optional(),
    ogImage: z.string().optional(),
    publishedAt: z.string().optional()
  })

  const validated = schema.parse(req.body)

  try {
    const page = await prisma.contentPage.create({
      data: {
        ...validated,
        publishedAt: validated.publishedAt ? new Date(validated.publishedAt) : null,
        createdBy: req.adminUser!.userId
      }
    })

    await logAdminActivity(req.adminUser!.id, 'PAGE_CREATED', 'page', page.id, req.ip || '', req.get('User-Agent') || '')

    res.json({ page })
  } catch (error) {
    res.status(500).json({ error: 'Failed to create page' })
  }
})

router.put('/pages/:id', adminAuth, async (req: AdminRequest, res: Response) => {
  const pageId = req.params.id as string
  const schema = z.object({
    title: z.string().min(1),
    slug: z.string().min(1),
    content: z.string(),
    excerpt: z.string().optional(),
    status: z.enum(['DRAFT', 'PUBLISHED', 'SCHEDULED', 'ARCHIVED']),
    featuredImage: z.string().optional(),
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
    canonicalUrl: z.string().optional(),
    ogImage: z.string().optional(),
    publishedAt: z.string().optional()
  })

  const validated = schema.parse(req.body)

  try {
    const page = await prisma.contentPage.update({
      where: { id: pageId },
      data: {
        ...validated,
        publishedAt: validated.publishedAt ? new Date(validated.publishedAt) : null
      }
    })

    await logAdminActivity(req.adminUser!.id, 'PAGE_UPDATED', 'page', pageId, req.ip || '', req.get('User-Agent') || '')

    res.json({ page })
  } catch (error) {
    res.status(500).json({ error: 'Failed to update page' })
  }
})

router.delete('/pages/:id', adminAuth, async (req: AdminRequest, res: Response) => {
  const pageId = req.params.id as string

  try {
    await prisma.contentPage.delete({
      where: { id: pageId }
    })

    await logAdminActivity(req.adminUser!.id, 'PAGE_DELETED', 'page', pageId, req.ip || '', req.get('User-Agent') || '')

    res.json({ message: 'Page deleted successfully' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete page' })
  }
})

// Analytics & Reports
router.get('/analytics', adminAuth, async (req: AdminRequest, res: Response) => {
  const startDate = req.query.startDate ? new Date(req.query.startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const endDate = req.query.endDate ? new Date(req.query.endDate as string) : new Date()

  // Get comprehensive analytics
  const [
    userStats,
    courseStats,
    revenueStats,
    subscriptionStats,
    engagementStats
  ] = await Promise.all([
    // User statistics
    prisma.$queryRaw`
      SELECT 
        COUNT(*) as totalUsers,
        COUNT(CASE WHEN createdAt >= ${startDate.toISOString()} THEN 1 END) as newUsers,
        COUNT(CASE WHEN lastActiveAt >= ${new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()} THEN 1 END) as activeUsers
      FROM users
      WHERE createdAt <= ${endDate.toISOString()}
    `,
    // Course statistics
    prisma.$queryRaw`
      SELECT 
        COUNT(*) as totalCourses,
        COUNT(CASE WHEN isPublished = true THEN 1 END) as publishedCourses,
        AVG(studentsCount) as avgStudents
      FROM courses
    `,
    // Revenue statistics
    prisma.$queryRaw`
      SELECT 
        COUNT(*) as totalOrders,
        SUM(amount) as totalRevenue,
        AVG(amount) as avgOrderValue
      FROM payments 
      WHERE status = 'completed' AND createdAt >= ${startDate.toISOString()} AND createdAt <= ${endDate.toISOString()}
    `,
    // Subscription statistics
    prisma.$queryRaw`
      SELECT 
        planType,
        COUNT(*) as count
      FROM subscriptions
      WHERE status = 'ACTIVE'
      GROUP BY planType
    `,
    // Engagement statistics
    prisma.$queryRaw`
      SELECT 
        metricType,
        COUNT(*) as count,
        AVG(value) as avgValue
      FROM engagementMetrics
      WHERE createdAt >= ${startDate.toISOString()} AND createdAt <= ${endDate.toISOString()}
      GROUP BY metricType
    `
  ])

  res.json({
    userStats: (userStats as any)[0] || {},
    courseStats: (courseStats as any)[0] || {},
    revenueStats: (revenueStats as any)[0] || {},
    subscriptionStats: subscriptionStats || [],
    engagementStats: engagementStats || []
  })
})

// Settings Management
router.get('/settings', adminAuth, async (req: AdminRequest, res: Response) => {
  const category = req.query.category as string
  const where = category ? { category } : {}

  const settings = await prisma.siteSettings.findMany({
    where,
    orderBy: { category: 'asc', key: 'asc' }
  })

  res.json({ settings })
})

router.put('/settings', adminAuth, async (req: AdminRequest, res: Response) => {
  const settings = req.body.settings as Array<{ key: string, value: string, type: string, category: string }>

  try {
    await prisma.$transaction(
      settings.map(setting => 
        prisma.siteSettings.upsert({
          where: { key: setting.key },
          update: { value: setting.value },
          create: {
            key: setting.key,
            value: setting.value,
            type: setting.type as any,
            category: setting.category
          }
        })
      )
    )

    await logAdminActivity(req.adminUser!.id, 'SETTINGS_UPDATED', 'settings', null, req.ip || '', req.get('User-Agent') || '')

    res.json({ message: 'Settings updated successfully' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to update settings' })
  }
})

// Activity Logs
router.get('/activity-logs', adminAuth, async (req: AdminRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1
  const limit = parseInt(req.query.limit as string) || 50

  const [logs, total] = await Promise.all([
    prisma.adminActivityLog.findMany({
      include: {
        adminUser: {
          include: {
            user: { select: { name: true, email: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    }),
    prisma.adminActivityLog.count()
  ])

  res.json({
    logs: logs.map(log => ({
      id: log.id,
      action: log.action,
      resource: log.resource,
      resourceId: log.resourceId,
      adminName: log.adminUser.user.name,
      adminEmail: log.adminUser.user.email,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      createdAt: log.createdAt
    })),
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  })
})

// Helper functions
async function logAdminActivity(adminUserId: string | null, action: string, resource: string, resourceId: string | null, ipAddress: string, userAgent: string) {
  try {
    if (adminUserId) {
      await prisma.adminActivityLog.create({
        data: {
          adminUserId,
          action,
          resource,
          resourceId,
          ipAddress,
          userAgent
        }
      })
    }
  } catch (error) {
    console.error('Failed to log admin activity:', error)
  }
}

function calculateGrowthRate(current: number, previous: number): number {
  if (previous === 0) return 0
  return ((current - previous) / previous) * 100
}

export default router
