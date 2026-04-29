import { useState, useRef, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useCoachStore } from '../../store/coachStore'
import { useFinancialProfileStore } from '../../store/financialProfileStore'
import { useGameStore } from '../../store/gameStore'
import { coachRespond, buildWelcomeMessage } from '../../lib/coachService'
import { Card, Avatar, Button } from '../../components'
import type { CoachContext, Message } from '../../types/coach'
import { Send, Trophy } from 'lucide-react'
import {
  calcMonthlyCashFlow, calcDTI, calcEmergencyCoverage, calcSavingsRate
} from '../../lib/financialCalc'

const QUICK_PROMPTS = [
  'How should I handle my debt?',
  'What\'s my emergency fund situation?',
  'How do I start investing?',
  'Explain my budget gaps',
  'What does my game score mean?',
  'How do I improve my cash flow?',
]

export function Coach() {
  const coachStore = useCoachStore()
  const profile = useFinancialProfileStore(s => s.profile)
  const gameStore = useGameStore()
  const [searchParams] = useSearchParams()
  const fromGame = searchParams.get('fromGame') === 'true'
  const urlScore = parseInt(searchParams.get('score') ?? '0', 10)

  const [input, setInput] = useState('')
  const [booted, setBooted] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function buildContext(): CoachContext {
    const p = profile
    if (!p) return { financialProfile: null, gameHistory: gameStore.isComplete ? { score: gameStore.score, netWorthChange: 0, completed: true } : null }

    const cashFlow = calcMonthlyCashFlow(p)
    const dti = calcDTI(p)
    const emergencyCoverage = calcEmergencyCoverage(p)
    const savingsRate = calcSavingsRate(p)

    const final = gameStore.monthStates[gameStore.monthStates.length - 1]
    const start = gameStore.startingState
    const netWorthChange = gameStore.isComplete && final && start
      ? (final.savingsBalance + final.investmentBalance - final.debtBalance) - (start.savingsBalance + start.investmentBalance - start.debtBalance)
      : 0

    return {
      financialProfile: {
        monthlyIncome: p.income.total,
        monthlyCashFlow: cashFlow,
        totalDebt: p.debt.total,
        totalSavings: p.savings.total,
        debtToIncome: dti,
        emergencyCoverage,
        savingsRate,
      },
      gameHistory: gameStore.isComplete ? { score: gameStore.score, netWorthChange, completed: true } : null,
    }
  }

  // Boot with welcome message (or post-game debrief)
  useEffect(() => {
    if (!booted) {
      setBooted(true)
      const ctx = buildContext()
      let welcome = buildWelcomeMessage(ctx)

      if (fromGame) {
        const score = urlScore || gameStore.score
        const grade = score >= 80 ? 'excellent' : score >= 60 ? 'solid' : score >= 40 ? 'decent' : 'challenging'
        const tip = score >= 80
          ? 'You made strong financial decisions throughout. Let\'s talk about how to sustain this momentum.'
          : score >= 60
          ? 'You showed good instincts in several areas. A few adjustments could push your score significantly higher.'
          : score >= 40
          ? 'There were some tough decisions this run — that\'s expected. Let\'s break down what happened and where to focus.'
          : 'This was a tough simulation. The good news: understanding the patterns is the first step to improving. Let\'s review.'
        welcome = `Great run! You scored **${score}/100** — that\'s a ${grade} result.\n\n${tip}\n\nI\'ve reviewed your 12-month simulation. Ask me anything — or I can start with a full debrief of your decisions.`
      }

      coachStore.addMessage({ id: Date.now().toString(), role: 'coach', content: welcome, timestamp: Date.now() })

      if (fromGame) {
        setTimeout(() => {
          coachStore.addMessage({
            id: (Date.now() + 1).toString(),
            role: 'coach',
            content: 'Want a full breakdown of your game? Just say "debrief" or pick a topic below.',
            timestamp: Date.now() + 100,
          })
        }, 800)
      }
    }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [coachStore.messages, coachStore.isTyping])

  async function sendMessage(text: string) {
    if (!text.trim() || coachStore.isTyping) return
    const msg: Message = { id: Date.now().toString(), role: 'user', content: text.trim(), timestamp: Date.now() }
    coachStore.addMessage(msg)
    setInput('')
    coachStore.setTyping(true)
    inputRef.current?.focus()

    try {
      const ctx = buildContext()
      const response = await coachRespond(ctx, coachStore.messages, text.trim())
      coachStore.addMessage({ id: (Date.now() + 1).toString(), role: 'coach', content: response, timestamp: Date.now() })
    } finally {
      coachStore.setTyping(false)
    }
  }

  const activePrompts = fromGame
    ? ['Give me a full debrief', 'What decisions hurt my score?', 'Where should I improve?', 'How do I handle debt faster?', 'Explain my game results', 'What would a perfect score look like?']
    : QUICK_PROMPTS

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '0', height: 'calc(100vh - 120px)' }}>
      {/* Post-game banner */}
      {fromGame && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', marginBottom: '12px', borderRadius: '12px', backgroundColor: 'color-mix(in srgb, var(--gold) 8%, transparent)', border: '1px solid color-mix(in srgb, var(--gold) 25%, transparent)' }}>
          <Trophy size={16} color="var(--gold)" />
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)' }}>
            Game complete — your AI coach is ready to debrief your session
          </span>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 0 16px 0', borderBottom: '1px solid var(--border)' }}>
        <Avatar initials="AI" ring="primary" size="md" />
        <div>
          <h1 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text)', margin: 0 }}>FinSight AI Coach</h1>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text)', opacity: 0.55 }}>
            {profile ? (fromGame ? 'Post-game analysis ready' : 'Using your financial profile') : 'No profile — complete onboarding for personalized guidance'}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {coachStore.messages.map(msg => (
          <MessageBubble key={msg.id} msg={msg} />
        ))}

        {/* Typing indicator */}
        {coachStore.isTyping && (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
            <Avatar initials="AI" ring="primary" size="sm" />
            <div style={{ padding: '10px 14px', borderRadius: '12px 12px 12px 2px', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', display: 'flex', gap: '4px', alignItems: 'center' }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--text)', opacity: 0.4, animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick prompts */}
      {coachStore.messages.length <= 2 && (
        <div style={{ padding: '12px 0', display: 'flex', gap: '6px', flexWrap: 'wrap', borderTop: '1px solid var(--border)' }}>
          {activePrompts.map(p => (
            <button
              key={p}
              onClick={() => sendMessage(p)}
              disabled={coachStore.isTyping}
              style={{
                padding: '6px 12px', borderRadius: '20px', fontSize: '0.8125rem', cursor: 'pointer',
                backgroundColor: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)',
                opacity: coachStore.isTyping ? 0.5 : 0.8, transition: 'all 0.15s', fontFamily: 'Inter',
              }}
              onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.opacity = '1')}
              onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.opacity = '0.8')}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{ padding: '14px 0 0 0', borderTop: '1px solid var(--border)' }}>
        <form onSubmit={e => { e.preventDefault(); sendMessage(input) }} style={{ display: 'flex', gap: '10px' }}>
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask about your finances, debt, savings, or game results..."
            disabled={coachStore.isTyping}
            style={{
              flex: 1, padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)',
              backgroundColor: 'var(--background)', color: 'var(--text)', fontSize: '0.9375rem',
              fontFamily: 'Inter', outline: 'none',
            }}
            onFocus={e => (e.currentTarget.style.borderColor = 'var(--primary)')}
            onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
            aria-label="Message to coach"
          />
          <Button
            type="submit"
            variant="primary"
            disabled={!input.trim() || coachStore.isTyping}
            style={{ padding: '10px 16px' }}
          >
            <Send size={16} />
          </Button>
        </form>
      </div>
    </div>
  )
}

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === 'user'

  if (isUser) {
    return (
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <div style={{
          maxWidth: '75%', padding: '10px 14px', borderRadius: '12px 12px 2px 12px',
          backgroundColor: 'var(--primary)', color: 'var(--background)',
          fontSize: '0.9375rem', lineHeight: 1.55,
        }}>
          {msg.content}
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
      <Avatar initials="AI" ring="primary" size="sm" style={{ flexShrink: 0, marginTop: '2px' }} />
      <Card variant="default" padding="none" style={{ maxWidth: '85%', overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px' }}>
          <FormattedMessage content={msg.content} />
        </div>
      </Card>
    </div>
  )
}

function FormattedMessage({ content }: { content: string }) {
  const lines = content.split('\n')

  return (
    <div style={{ fontSize: '0.9375rem', lineHeight: 1.6, color: 'var(--text)' }}>
      {lines.map((line, i) => {
        if (line.trim() === '') return <div key={i} style={{ height: '8px' }} />
        if (line.startsWith('•') || line.startsWith('*')) {
          return (
            <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '2px' }}>
              <span style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '1px' }}>•</span>
              <span>{line.replace(/^[•*]\s*/, '')}</span>
            </div>
          )
        }
        if (line.match(/^\d\./)) {
          const [num, ...rest] = line.split('.')
          return (
            <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '2px' }}>
              <span style={{ color: 'var(--secondary)', fontWeight: 600, flexShrink: 0 }}>{num}.</span>
              <span>{rest.join('.').trim()}</span>
            </div>
          )
        }
        return <p key={i} style={{ margin: '0 0 2px 0' }}>{line}</p>
      })}
    </div>
  )
}
