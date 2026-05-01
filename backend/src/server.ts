import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import OpenAI from 'openai'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 4000

app.use(cors())
app.use(express.json())

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const SYSTEM_PROMPT = `
You are FinSight AI, a professional financial coaching assistant.

Rules:
- Answer only the user question.
- Use the injected user financial profile when relevant.
- Keep replies concise and practical.
- If information is missing, say what is missing instead of guessing.
- Avoid legal/tax claims that require licensed professionals.
`.trim()

function toNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  return null
}

function formatCurrency(value: number | null): string {
  if (value === null) return 'N/A'
  return `$${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
}

function formatPercent(value: number | null): string {
  if (value === null) return 'N/A'
  return `${(value * 100).toFixed(1)}%`
}

function formatProfile(profile: any): string {
  if (!profile) return 'No financial profile is available for this user yet.'

  const incomeTotal = toNumber(profile?.income?.total)
  const expensesTotal = toNumber(profile?.expenses?.total)
  const debtTotal = toNumber(profile?.debt?.total)
  const savingsTotal = toNumber(profile?.savings?.total)
  const monthlyCashFlow =
    incomeTotal !== null && expensesTotal !== null ? incomeTotal - expensesTotal : null
  const savingsRate =
    incomeTotal && monthlyCashFlow !== null ? monthlyCashFlow / incomeTotal : null

  return `
User Financial Profile:
- Monthly income: ${formatCurrency(incomeTotal)}
- Monthly expenses: ${formatCurrency(expensesTotal)}
- Monthly cash flow: ${formatCurrency(monthlyCashFlow)}
- Total debt: ${formatCurrency(debtTotal)}
- Total savings: ${formatCurrency(savingsTotal)}
- Estimated savings rate: ${formatPercent(savingsRate)}
  `.trim()
}

function shouldReturnGreeting(message: string): boolean {
  const normalized = message.trim().toLowerCase()
  return ['hi', 'hello', 'hey', 'yo'].includes(normalized)
}

function createToken(userId: string) {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'dev_secret',
    { expiresIn: '7d' }
  )
}

function authMiddleware(req: any, res: any, next: any) {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const token = authHeader.split(' ')[1]

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'dev_secret'
    ) as any

    req.userId = decoded.userId

    next()
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' })
  }
}

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'finAI backend',
  })
})

app.post('/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Missing email or password' })
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
      },
    })

    res.json({
  message: 'User created',
  token: createToken(user.id),
  user: {
    id: user.id,
    email: user.email,
  },
})
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Missing email or password' })
    }

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' })
    }

    const isValid = await bcrypt.compare(password, user.passwordHash)

    if (!isValid) {
      return res.status(400).json({ error: 'Invalid email or password' })
    }

    res.json({
  message: 'Login successful',
  token: createToken(user.id),
  user: {
    id: user.id,
    email: user.email,
  },
})
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.post('/profiles', authMiddleware, async (req: any, res) => {
  try {
    const { profile } = req.body
const userId = req.userId

    if (!profile) {
      return res.status(400).json({ error: 'Missing userId or profile' })
    }

    const existing = await prisma.financialProfile.findFirst({
      where: { userId },
    })

    let savedProfile

    if (existing) {
      // update
      savedProfile = await prisma.financialProfile.update({
        where: { id: existing.id },
        data: {
          data: profile,
        },
      })
    } else {
      // create
      savedProfile = await prisma.financialProfile.create({
        data: {
          userId,
          data: profile,
        },
      })
    }

    res.json({
      message: 'Profile saved',
      profile: savedProfile,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.get('/profiles/me', authMiddleware, async (req: any, res) => {
  try {
    const userId = req.userId

    const profile = await prisma.financialProfile.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })

    if (!profile) {
      return res.json({ profile: null })
    }

    res.json({ profile })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.post('/chat/message', authMiddleware, async (req: any, res) => {
  try {
    const { message } = req.body
    const userId = req.userId

    if (typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' })
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(503).json({ error: 'OPENAI_API_KEY is not configured on backend' })
    }

    if (shouldReturnGreeting(message)) {
      return res.json({ reply: 'Hi! How can I help with your finances today?' })
    }

    const profile = await prisma.financialProfile.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })

    const profileText = formatProfile(profile?.data)
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.3,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'system', content: profileText },
        { role: 'user', content: message.trim() },
      ],
    })

    const reply = completion.choices[0]?.message?.content?.trim()

    if (!reply) {
      return res.status(502).json({ error: 'AI did not return a response' })
    }

    res.json({ reply })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`)
})

