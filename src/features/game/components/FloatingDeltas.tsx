import { motion } from 'framer-motion'
import type { DecisionEffect } from '../../../types/game'
import { formatCurrencyFull } from '../../../lib/financialCalc'
import { TrendingUp, TrendingDown, Dices } from 'lucide-react'

interface DeltaChip {
  label: string
  value: number
  positive: boolean
  isScore?: boolean
}

function buildChips(effect: DecisionEffect): DeltaChip[] {
  const chips: DeltaChip[] = []
  if (effect.cashDelta       !== 0) chips.push({ label: 'Cash',        value: effect.cashDelta,       positive: effect.cashDelta > 0       })
  if (effect.savingsDelta    !== 0) chips.push({ label: 'Savings',     value: effect.savingsDelta,    positive: effect.savingsDelta > 0     })
  if (effect.debtDelta       !== 0) chips.push({ label: 'Debt',        value: -effect.debtDelta,      positive: effect.debtDelta < 0        })
  if (effect.investmentDelta !== 0) chips.push({ label: 'Investments', value: effect.investmentDelta, positive: effect.investmentDelta > 0  })
  if (effect.scoreModifier   !== 0) chips.push({ label: 'Score',       value: effect.scoreModifier,   positive: effect.scoreModifier > 0, isScore: true })
  return chips
}

interface FloatingDeltasProps {
  effect: DecisionEffect
  riskWon?: boolean
}

export function FloatingDeltas({ effect, riskWon }: FloatingDeltasProps) {
  const chips = buildChips(effect)
  if (chips.length === 0) return null

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px' }}>

      {/* Risk outcome header */}
      {effect.isRisk && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, ease: 'backOut' }}
          style={{
            width: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            padding: '8px 14px', borderRadius: '12px',
            backgroundColor: `color-mix(in srgb, ${riskWon ? 'var(--accent)' : 'var(--negative)'} 8%, transparent)`,
            border: `2px solid color-mix(in srgb, ${riskWon ? 'var(--accent)' : 'var(--negative)'} 25%, transparent)`,
            boxShadow: `0 3px 0 color-mix(in srgb, ${riskWon ? 'var(--accent)' : 'var(--negative)'} 15%, transparent)`,
          }}
        >
          <Dices size={14} color={riskWon ? 'var(--accent)' : 'var(--negative)'} />
          <span style={{ fontSize: '0.875rem', fontWeight: 800, color: riskWon ? 'var(--accent)' : 'var(--negative)' }}>
            {riskWon ? 'Risk paid off!' : 'Risk backfired'}
          </span>
        </motion.div>
      )}

      {/* Delta chips */}
      {chips.map((chip, i) => {
        const color = chip.positive ? 'var(--accent)' : 'var(--negative)'
        const Icon  = chip.isScore ? (chip.positive ? TrendingUp : TrendingDown) : chip.positive ? TrendingUp : TrendingDown

        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 14, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.08 * i, duration: 0.35, ease: 'backOut' }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '5px',
              padding: '6px 12px', borderRadius: '999px',
              backgroundColor: `color-mix(in srgb, ${color} 8%, var(--background))`,
              border: `2px solid color-mix(in srgb, ${color} 25%, transparent)`,
              boxShadow: `0 3px 0 color-mix(in srgb, ${color} 15%, transparent)`,
              fontSize: '0.875rem', fontWeight: 800, color,
              whiteSpace: 'nowrap',
            }}
          >
            <Icon size={13} color={color} />
            {chip.positive ? '+' : ''}
            {chip.isScore
              ? `${chip.value} pts`
              : formatCurrencyFull(chip.value)
            }
            <span style={{ fontWeight: 500, opacity: 0.65 }}>{chip.label}</span>
          </motion.div>
        )
      })}
    </div>
  )
}
