import type { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../lib/auth.js'
import { prisma } from '../lib/prisma.js'

declare global {
  namespace Express {
    interface Request {
      userId?: string
      user?: { id: string; email: string; name: string; role: string }
    }
  }
}

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid token' })
    return
  }

  const token = authHeader.slice(7)
  const payload = verifyToken(token)
  if (!payload) {
    res.status(401).json({ error: 'Invalid or expired token' })
    return
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, email: true, name: true, role: true },
  })

  if (!user) {
    res.status(401).json({ error: 'User not found' })
    return
  }

  req.userId = user.id
  req.user = user
  next()
}
