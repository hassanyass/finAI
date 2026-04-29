import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '../../../components'
import type { EarnedBadge } from '../../../types/game'
import { Award, Lightbulb, Trophy, BarChart2, TrendingDown, ChevronRight } from 'lucide-react'

interface ScoreOverlayProps {
  isOpen: boolean
  month: number
  score: number
  cumulativeScore: number
  insight: string
  newBadges: EarnedBadge[]
  isFinal: boolean
  onContinue: () => void
}

export function ScoreOverlay({ isOpen, month, score, cumulativeScore, insight, newBadges, isFinal, onContinue }: ScoreOverlayProps) {
  const scoreColor = score >= 70 ? 'var(--accent)' : score >= 40 ? 'var(--risk)' : 'var(--negative)'
  const ScoreIcon = score >= 80 ? Trophy : score >= 60 ? Award : score >= 40 ? BarChart2 : TrendingDown

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.55)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', backdropFilter: 'blur(3px)' }}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            style={{ backgroundColor: 'var(--background)', border: '2px solid var(--border)', boxShadow: '0 8px 0 var(--border)', borderRadius: '24px', padding: '32px', maxWidth: '440px', width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}
          >
            <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text)', opacity: 0.45 }}>
              Month {month} Complete
            </p>

            {/* Score */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px' }}>
              <motion.span
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.35, ease: 'backOut' }}
                style={{ fontSize: '5rem', fontWeight: 800, letterSpacing: '-0.05em', color: scoreColor, lineHeight: 1 }}
              >
                {score}
              </motion.span>
              <div style={{ paddingBottom: '8px' }}>
                <ScoreIcon size={28} color={scoreColor} />
                <p style={{ fontSize: '0.8125rem', color: 'var(--text)', opacity: 0.5, marginTop: '4px' }}>
                  Running avg: <strong style={{ color: 'var(--text)', opacity: 0.8 }}>{cumulativeScore}</strong>
                </p>
              </div>
            </div>

            {/* Score bar */}
            <div style={{ height: '8px', backgroundColor: 'var(--surface-md)', borderRadius: '999px', overflow: 'hidden', border: '1px solid var(--border)' }}>
              <motion.div initial={{ width: 0 }} animate={{ width: `${score}%` }} transition={{ delay: 0.2, duration: 0.6, ease: 'easeOut' }} style={{ height: '100%', backgroundColor: scoreColor, borderRadius: '999px' }} />
            </div>

            {/* Insight */}
            <div style={{ padding: '14px 16px', borderRadius: '14px', border: '2px solid color-mix(in srgb, var(--primary) 20%, transparent)', backgroundColor: 'color-mix(in srgb, var(--primary) 4%, transparent)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <Lightbulb size={13} color="var(--primary)" />
                <p style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--primary)', opacity: 0.8 }}>
                  Financial Insight
                </p>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text)', lineHeight: 1.65, opacity: 0.8 }}>{insight}</p>
            </div>

            {/* Badges */}
            {newBadges.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {newBadges.map((b, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 + i * 0.08 }}
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '12px', backgroundColor: 'color-mix(in srgb, var(--gold) 8%, transparent)', border: '1px solid color-mix(in srgb, var(--gold) 30%, transparent)' }}
                  >
                    <Award size={18} color="var(--gold)" />
                    <div>
                      <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--gold)' }}>{b.badge.label}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text)', opacity: 0.6 }}>{b.badge.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* CTA */}
            <Button variant="primary" size="lg" fullWidth onClick={onContinue} style={{ borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              {isFinal ? (
                <><Trophy size={16} /> View My Results</>
              ) : (
                <>Continue to Month {month + 1} <ChevronRight size={16} /></>
              )}
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
