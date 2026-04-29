import { motion } from 'framer-motion'
import type { DecisionEffect } from '../../../types/game'
import { formatCurrencyFull } from '../../../lib/financialCalc'

interface DeltaRow {
  label: string
  value: number
  positive: boolean
}

function buildRows(effect: DecisionEffect): DeltaRow[] {
  const rows: DeltaRow[] = []

  const resolvedEffect = effect.isRisk
    ? (effect.riskWinEffect ?? effect) 
    : effect

  if (resolvedEffect.cashDelta !== 0) {
    rows.push({ label: 'Cash', value: resolvedEffect.cashDelta, positive: resolvedEffect.cashDelta > 0 })
  }
  if (resolvedEffect.savingsDelta !== 0) {
    rows.push({ label: 'Savings', value: resolvedEffect.savingsDelta, positive: resolvedEffect.savingsDelta > 0 })
  }
  if (resolvedEffect.debtDelta !== 0) {
    rows.push({ label: 'Debt', value: -resolvedEffect.debtDelta, positive: resolvedEffect.debtDelta < 0 })
  }
  if (resolvedEffect.investmentDelta !== 0) {
    rows.push({ label: 'Investments', value: resolvedEffect.investmentDelta, positive: resolvedEffect.investmentDelta > 0 })
  }
  if (resolvedEffect.scoreModifier !== 0) {
    rows.push({ label: 'Score', value: resolvedEffect.scoreModifier, positive: resolvedEffect.scoreModifier > 0 })
  }
  return rows
}

interface ConsequenceBoxProps {
  effect: DecisionEffect
  isRiskResolved?: boolean
  riskWon?: boolean
}

export function ConsequenceBox({ effect, riskWon }: ConsequenceBoxProps) {
  const rows = buildRows(effect)
  const hasChanges = rows.length > 0

  const isRisk = effect.isRisk
  const borderColor = isRisk
    ? (riskWon ? 'color-mix(in srgb, var(--accent) 35%, transparent)' : 'color-mix(in srgb, var(--negative) 25%, transparent)')
    : 'color-mix(in srgb, var(--primary) 20%, transparent)'

  const bgColor = isRisk
    ? (riskWon ? 'color-mix(in srgb, var(--accent) 5%, transparent)' : 'color-mix(in srgb, var(--negative) 5%, transparent)')
    : 'color-mix(in srgb, var(--primary) 4%, transparent)'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scaleY: 0.95 }}
      animate={{ opacity: 1, y: 0, scaleY: 1 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      style={{
        borderRadius: '14px',
        border: `2px solid ${borderColor}`,
        backgroundColor: bgColor,
        padding: '14px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
      }}
    >
      {/* Risk outcome label */}
      {isRisk && (
        <p style={{
          fontSize: '0.8125rem',
          fontWeight: 700,
          color: riskWon ? 'var(--accent)' : 'var(--negative)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}>
          {riskWon ? '🎲 Paid off!' : '🎲 Didn\'t work out'}
        </p>
      )}

      {/* Delta rows */}
      {hasChanges ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {rows.map((row, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.08, duration: 0.2 }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 10px',
                borderRadius: '8px',
                fontSize: '0.8125rem',
                fontWeight: 700,
                backgroundColor: row.positive
                  ? 'color-mix(in srgb, var(--accent) 10%, var(--background))'
                  : 'color-mix(in srgb, var(--negative) 10%, var(--background))',
                color: row.positive ? 'var(--accent)' : 'var(--negative)',
                border: `1px solid ${row.positive ? 'color-mix(in srgb, var(--accent) 25%, transparent)' : 'color-mix(in srgb, var(--negative) 25%, transparent)'}`,
              }}
            >
              {row.label === 'Score'
                ? `${row.positive ? '+' : ''}${row.value} pts`
                : `${row.positive ? '+' : ''}${formatCurrencyFull(row.value)} ${row.label}`
              }
            </motion.div>
          ))}
        </div>
      ) : (
        <p style={{ fontSize: '0.875rem', color: 'var(--text)', opacity: 0.65 }}>No immediate financial change.</p>
      )}
    </motion.div>
  )
}
