import { motion, AnimatePresence } from 'framer-motion'
import { FinBot } from '../../../components/FinBot/FinBot'
import type { FinBotMood } from '../../../components/FinBot/FinBot'
import { Trophy } from 'lucide-react'

interface GameCharacterPanelProps {
  month: number
  mood: FinBotMood
  phase: 'intro' | 'card-enter' | 'decide' | 'consequence' | 'advance' | 'end-month'
  riskWon: boolean | null
  score: number
}

const MOOD_SPEECH: Record<FinBotMood, string[]> = {
  neutral: [
    'A new month begins. Think before you commit.',
    'Every decision has a ripple. Choose with intent.',
    'Your financial story is being written right now.',
  ],
  thinking: [
    'Weigh the long-term impact, not just today.',
    'What would your future self thank you for?',
    'Consider the trade-off, not just the upside.',
    'Think before you tap.',
  ],
  happy: [
    'Good move! That builds momentum.',
    'Smart choice. Future you approves.',
    'Positive outcome locked in.',
    'That compounds over time!',
  ],
  excited: [
    "Outstanding! That's how wealth is built.",
    "You're crushing it this month!",
    'Exceptional discipline!',
    "That's the kind of move that changes outcomes.",
  ],
  worried: [
    'Tough break. Stay focused.',
    'This hurts now but teaches later.',
    'Resilience is built in moments like this.',
    "Don't panic — adjust and move forward.",
  ],
}

const MOOD_BG: Record<FinBotMood, string> = {
  neutral:  'rgba(28, 45, 63, 0.07)',
  thinking: 'rgba(142, 180, 230, 0.12)',
  happy:    'rgba(74, 186, 134, 0.12)',
  excited:  'rgba(230, 168, 23, 0.15)',
  worried:  'rgba(140, 53, 53, 0.10)',
}

const MOOD_LABEL: Record<FinBotMood, string> = {
  neutral:  'Steady',
  thinking: 'Thinking...',
  happy:    'Good call',
  excited:  'On fire!',
  worried:  'Under pressure',
}

function getSpeech(mood: FinBotMood, month: number): string {
  const lines = MOOD_SPEECH[mood]
  return lines[month % lines.length]
}

export function GameCharacterPanel({ month, mood, phase, riskWon, score }: GameCharacterPanelProps) {
  const speech = getSpeech(mood, month)

  const floatAnim =
    mood === 'excited'
      ? { y: [0, -10, 0], transition: { duration: 1.8, repeat: Infinity, ease: 'easeInOut' as const } }
      : mood === 'worried'
      ? { rotate: [-3, 3, -3, 3, 0], transition: { duration: 0.4, repeat: 2, ease: 'easeInOut' as const } }
      : { y: [0, -5, 0], transition: { duration: 3.2, repeat: Infinity, ease: 'easeInOut' as const } }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      height: '100%',
      padding: '28px 14px 20px',
      gap: '0',
    }}>

      {/* Score badge */}
      <AnimatePresence>
        {score > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '5px 14px',
              borderRadius: '20px',
              backgroundColor: 'color-mix(in srgb, var(--gold) 10%, transparent)',
              border: '1.5px solid color-mix(in srgb, var(--gold) 35%, transparent)',
              boxShadow: '0 2px 0 color-mix(in srgb, var(--gold) 20%, transparent)',
            }}
          >
            <Trophy size={12} color="var(--gold)" />
            <span style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--gold)' }}>
              {score} pts
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Character with glow background */}
      <div style={{ position: 'relative', marginBottom: '20px' }}>
        {/* Glow circle */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`glow-${mood}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.35 }}
            style={{
              position: 'absolute',
              inset: '-16px',
              borderRadius: '50%',
              background: `radial-gradient(circle, ${MOOD_BG[mood]} 0%, transparent 70%)`,
              pointerEvents: 'none',
            }}
          />
        </AnimatePresence>

        {/* Hard shadow blob */}
        <div style={{
          position: 'absolute',
          bottom: '-8px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '80px',
          height: '14px',
          borderRadius: '50%',
          backgroundColor: 'rgba(0,0,0,0.12)',
          filter: 'blur(6px)',
        }} />

        {/* FinBot character — 120px */}
        <motion.div animate={floatAnim} style={{ position: 'relative', zIndex: 1 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={mood}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'backOut' }}
            >
              <FinBot mood={mood} size={120} />
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Mood label pill */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`mood-${mood}`}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          style={{
            marginBottom: '14px',
            padding: '3px 12px',
            borderRadius: '20px',
            backgroundColor: MOOD_BG[mood],
            border: '1px solid color-mix(in srgb, var(--primary) 15%, transparent)',
          }}
        >
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', opacity: 0.75 }}>
            {MOOD_LABEL[mood]}
          </span>
        </motion.div>
      </AnimatePresence>

      {/* Speech bubble */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`speech-${mood}-${phase}`}
          initial={{ opacity: 0, y: 8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4, scale: 0.96 }}
          transition={{ duration: 0.22 }}
          style={{ width: '100%', position: 'relative' }}
        >
          {/* Arrow pointing up to character */}
          <div style={{
            position: 'absolute', top: '-7px', left: '50%',
            transform: 'translateX(-50%)',
            width: 0, height: 0,
            borderLeft: '7px solid transparent',
            borderRight: '7px solid transparent',
            borderBottom: '7px solid var(--border)',
          }} />
          <div style={{
            position: 'absolute', top: '-5.5px', left: '50%',
            transform: 'translateX(-50%)',
            width: 0, height: 0,
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderBottom: '6px solid var(--background)',
          }} />

          <div style={{
            backgroundColor: 'var(--background)',
            border: '2px solid var(--border)',
            borderRadius: '14px',
            padding: '12px 14px',
            boxShadow: '0 3px 0 var(--border)',
          }}>
            <p style={{
              fontSize: '0.8125rem',
              color: 'var(--text)',
              opacity: 0.75,
              lineHeight: 1.55,
              textAlign: 'center',
              fontWeight: 500,
            }}>
              {speech}
            </p>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Risk outcome */}
      <AnimatePresence>
        {phase === 'consequence' && riskWon !== null && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              marginTop: '10px',
              padding: '8px 12px',
              borderRadius: '10px',
              width: '100%',
              backgroundColor: `color-mix(in srgb, ${riskWon ? 'var(--accent)' : 'var(--negative)'} 8%, transparent)`,
              border: `1.5px solid color-mix(in srgb, ${riskWon ? 'var(--accent)' : 'var(--negative)'} 28%, transparent)`,
              boxShadow: `0 2px 0 color-mix(in srgb, ${riskWon ? 'var(--accent)' : 'var(--negative)'} 15%, transparent)`,
            }}
          >
            <p style={{ fontSize: '0.75rem', fontWeight: 800, color: riskWon ? 'var(--accent)' : 'var(--negative)', textAlign: 'center' }}>
              {riskWon ? 'Risk paid off!' : 'Risk backfired'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Month watermark */}
      <div style={{ marginTop: 'auto', textAlign: 'center', paddingTop: '12px' }}>
        <p style={{ fontSize: '0.5625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text)', opacity: 0.25, marginBottom: '2px' }}>
          Month
        </p>
        <p style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--primary)', letterSpacing: '-0.05em', lineHeight: 1, opacity: 0.15 }}>
          {month}
        </p>
      </div>
    </div>
  )
}
