import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown, ChevronUp, BookOpen } from 'lucide-react'
import type { DecisionType } from '../../../types/game'

const TYPE_PILL: Record<DecisionType, { label: string; color: string; bg: string }> = {
  save:    { label: 'Save',    color: 'var(--secondary)',  bg: 'color-mix(in srgb, var(--secondary) 10%, transparent)'  },
  invest:  { label: 'Invest',  color: 'var(--accent)',     bg: 'color-mix(in srgb, var(--accent) 10%, transparent)'     },
  spend:   { label: 'Spend',   color: 'var(--text)',       bg: 'var(--surface-md)'                                       },
  risk:    { label: 'Risk',    color: 'var(--risk)',       bg: 'color-mix(in srgb, var(--risk) 10%, transparent)'       },
  protect: { label: 'Protect', color: 'var(--primary)',    bg: 'color-mix(in srgb, var(--primary) 10%, transparent)'    },
}

interface GameCardProps {
  type: DecisionType
  title: string
  description: string
  learnMore: string
}

function splitSentences(text: string): string[] {
  const raw = text.match(/[^.!?]*[.!?]+/g) ?? [text]
  return raw.map(s => s.trim()).filter(Boolean)
}

export function GameCard({ type, title, description, learnMore }: GameCardProps) {
  const [expanded, setExpanded] = useState(false)
  const pill = TYPE_PILL[type]
  const sentences = useMemo(() => splitSentences(description), [description])

  return (
    <div style={{
      backgroundColor: 'var(--background)',
      border: '2px solid var(--border)',
      borderRadius: '20px',
      boxShadow: '0 5px 0 var(--border)',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{ padding: '24px 24px 20px' }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center',
          padding: '3px 10px', borderRadius: '20px', marginBottom: '14px',
          fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.06em',
          textTransform: 'uppercase', color: pill.color, backgroundColor: pill.bg,
          border: `1px solid ${pill.color}25`,
        }}>
          {pill.label}
        </span>

        <motion.h2
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: 'easeOut' }}
          style={{
            fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)',
            letterSpacing: '-0.025em', lineHeight: 1.15, marginBottom: '12px',
          }}
        >
          {title}
        </motion.h2>

        {/* Progressive sentence reveal */}
        <p style={{ fontSize: '0.9375rem', color: 'var(--text)', opacity: 0.7, lineHeight: 1.65 }}>
          {sentences.map((sentence, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.18, duration: 0.3, ease: 'easeOut' }}
              style={{ display: 'inline' }}
            >
              {sentence}{i < sentences.length - 1 ? ' ' : ''}
            </motion.span>
          ))}
        </p>
      </div>

      {/* Learn More */}
      <div style={{ borderTop: '1px solid var(--border)' }}>
        <button
          onClick={() => setExpanded(v => !v)}
          style={{
            width: '100%', padding: '10px 24px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: expanded ? 'var(--surface)' : 'transparent',
            border: 'none', cursor: 'pointer', color: 'var(--text)', opacity: 0.55,
            fontSize: '0.8125rem', fontWeight: 600, transition: 'all 0.15s',
            fontFamily: 'Inter',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.85' }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = expanded ? '0.85' : '0.55' }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <BookOpen size={12} /> Why this matters
          </span>
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            transition={{ duration: 0.2 }} style={{ overflow: 'hidden' }}
          >
            <p style={{ padding: '10px 24px 16px', fontSize: '0.875rem', color: 'var(--text)', opacity: 0.68, lineHeight: 1.7, borderTop: '1px solid var(--border)' }}>
              {learnMore}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
