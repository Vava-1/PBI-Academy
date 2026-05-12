import { Router } from 'express'
import { z } from 'zod'
import OpenAI from 'openai'
import { prisma } from '../lib/prisma.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null

const SYSTEM_PROMPT = `You are PBI Academy's AI Tutor, an expert language test preparation coach. You help students prepare for TOEFL, IELTS, DELF, TCF, TEF Canada, German, and Kiswahili language exams. Provide concise, encouraging, and actionable feedback. When appropriate, give examples and practice exercises. Keep responses helpful and focused on language test preparation.`

router.get('/sessions', authenticate, async (req, res) => {
  const sessions = await prisma.chatSession.findMany({
    where: { userId: req.userId! },
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { messages: true } } },
  })
  res.json(sessions)
})

router.post('/sessions', authenticate, async (req, res) => {
  const session = await prisma.chatSession.create({
    data: { userId: req.userId!, title: 'New Chat' },
  })
  res.status(201).json(session)
})

router.get('/sessions/:id/messages', authenticate, async (req, res) => {
  const session = await prisma.chatSession.findFirst({
    where: { id: req.params.id as string, userId: req.userId! },
  })
  if (!session) {
    res.status(404).json({ error: 'Session not found' })
    return
  }
  const messages = await prisma.chatMessage.findMany({
    where: { sessionId: req.params.id as string },
    orderBy: { createdAt: 'asc' },
  })
  res.json(messages)
})

const chatSchema = z.object({
  sessionId: z.string(),
  message: z.string().min(1).max(4000),
})

router.post('/chat', authenticate, async (req, res) => {
  try {
    const { sessionId, message } = chatSchema.parse(req.body)
    const session = await prisma.chatSession.findFirst({
      where: { id: sessionId, userId: req.userId! },
    })
    if (!session) {
      res.status(404).json({ error: 'Session not found' })
      return
    }

    // Save user message
    await prisma.chatMessage.create({
      data: { sessionId, role: 'user', content: message },
    })

    let reply = ''
    if (openai) {
      const history = await prisma.chatMessage.findMany({
        where: { sessionId },
        orderBy: { createdAt: 'asc' },
        take: 20,
      })
      const messagesForAI: Array<{role: 'system' | 'user' | 'assistant', content: string}> = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...history.map(m => ({
          role: m.role === 'user' ? 'user' as const : 'assistant' as const,
          content: m.content,
        })),
      ]
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: messagesForAI,
        temperature: 0.7,
        max_tokens: 800,
      })
      reply = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.'
    } else {
      reply = `I'm PBI Academy's AI Tutor. I can help you prepare for language exams like TOEFL, IELTS, DELF, TCF, German, and Kiswahili. However, the OpenAI API key is not configured on the server, so I'm running in demo mode. Ask your administrator to set OPENAI_API_KEY.`
    }

    // Save assistant message
    const assistantMsg = await prisma.chatMessage.create({
      data: { sessionId, role: 'assistant', content: reply },
    })

    res.json(assistantMsg)
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid input', details: err.flatten() })
      return
    }
    console.error('AI chat error:', err)
    res.status(500).json({ error: 'AI request failed' })
  }
})

export default router
