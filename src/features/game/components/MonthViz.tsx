import { motion, AnimatePresence } from 'framer-motion'
import { FinBot } from '../../../components/FinBot/FinBot'
import type { FinBotMood } from '../../../components/FinBot/FinBot'
import type { MonthState } from '../../../types/game'
import { formatCurrencyFull } from '../../../lib/financialCalc'
import { TrendingUp, TrendingDown, Shield, AlertTriangle, Zap } from 'lucide-react'

interface MonthVizProps {
  month: number
  state: MonthState | null
  startingState: MonthState | null
  completedMonths: MonthState[]
  currentMood: FinBotMood
}

export type { FinBotMood }

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December']

function getMoodFromState(state: MonthState | null, start: MonthState | null): FinBotMood {
  if (!state || !start) return 'neutral'
  const netWorth = state.savingsBalance + state.investmentBalance - state.debtBalance
  const startNW  = start.savingsBalance  + start.investmentBalance  - start.debtBalance
  if (state.cash < 0) return 'worried'
  if (netWorth > startNW * 1.05) return 'excited'
  if (state.debtBalance < start.debtBalance * 0.8) return 'happy'
  if (state.savingsBalance < start.savingsBalance * 0.5) return 'worried'
  if (state.investmentBalance > start.investmentBalance) return 'happy'
  return 'neutral'
}

// Narrative line per month
const MONTH_SITUATION: Record<number, string> = {
  1:  'A new year, a blank ledger. Small decisions in January echo through December.',
  2:  'February creep — variable expenses quietly grow if unchecked.',
  3:  'Quarter one closes. Are you ahead of where you started?',
  4:  'Employer match season. Free money is waiting to be claimed or left behind.',
  5:  'Mid-year. Your emergency fund is either a cushion or a hole by now.',
  6:  'Halfway. The compound effect of January\'s decisions is now visible.',
  7:  'Car trouble. Roof leak. Medical bill. Adversity doesn\'t schedule itself.',
  8:  'A career move creates risk — and the potential for breakout growth.',
  9:  'Recovery phase. Rebuild before you resume growth.',
  10: 'Tax-advantaged windows close at year end. Act before they do.',
  11: 'Bonus season. The windfall test: will it compound or evaporate?',
  12: 'Final month. Every decision now is the difference between a good year and a great one.',
}

interface HealthBar { label: string; value: number; max: number; color: string; icon: React.ReactNode }

export function MonthViz({ month, state, startingState, completedMonths }: MonthVizProps) {
  const mood = getMoodFromState(state, startingState)
  const netWorth = state ? state.savingsBalance + state.investmentBalance - state.debtBalance : 0
  const startNW  = startingState ? startingState.savingsBalance + startingState.investmentBalance - startingState.debtBalance : 0
  const nwDelta  = netWorth - startNW

  const healthBars: HealthBar[] = [
    { label: 'Cash', value: Math.max(state?.cash ?? 0, 0), max: Math.max(startingState?.cash ?? 1, (state?.cash ?? 0) * 1.5, 1), color: 'var(--accent)', icon: <Zap size={12} /> },
    { label: 'Savings', value: state?.savingsBalance ?? 0, max: Math.max(startingState?.savingsBalance ?? 1, (state?.savingsBalance ?? 0) * 1.3, 100), color: 'var(--primary)', icon: <Shield size={12} /> },
    { label: 'Investments', value: state?.investmentBalance ?? 0, max: Math.max(startingState?.investmentBalance ?? 1, (state?.investmentBalance ?? 0) * 1.5, 100), color: 'var(--gold)', icon: <TrendingUp size={12} /> },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%' }}>

      {/* Character */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', padding: '20px 12px 16px' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={mood}
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.85, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'backOut' }}
          >
            <FinBot mood={mood} size={72} />
          </motion.div>
        </AnimatePresence>

        {/* Mood label */}
        <motion.div
          key={`mood-${mood}`}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
        >
          <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '3px 10px', borderRadius: '12px', backgroundColor: 'color-mix(in srgb, var(--primary) 10%, transparent)', color: 'var(--primary)', border: '1px solid color-mix(in srgb, var(--primary) 25%, transparent)' }}>
            {mood === 'happy' ? 'On track' : mood === 'excited' ? 'Crushing it' : mood === 'worried' ? 'Under pressure' : mood === 'thinking' ? 'Considering' : 'Steady'}
          </span>
        </motion.div>
      </div>

      {/* Month & Situation */}
      <div style={{ padding: '0 12px' }}>
        <div style={{ padding: '14px', borderRadius: '12px', border: '2px solid var(--border)', boxShadow: '0 3px 0 var(--border)', backgroundColor: 'var(--background)' }}>
          <p style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--primary)', opacity: 0.8, marginBottom: '6px' }}>
            {MONTH_NAMES[month - 1]}
          </p>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text)', opacity: 0.7, lineHeight: 1.55 }}>
            {MONTH_SITUATION[month] ?? ''}
          </p>
        </div>
      </div>

      {/* Health bars */}
      <div style={{ padding: '0 12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <p style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text)', opacity: 0.4 }}>
          Financial Health
        </p>
        {healthBars.map(bar => {
          const pct = Math.min(100, Math.max(0, bar.max > 0 ? (bar.value / bar.max) * 100 : 0))
          return (
            <div key={bar.label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: bar.color, opacity: 0.9 }}>
                  {bar.icon}
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text)', opacity: 0.65 }}>{bar.label}</span>
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: bar.color }}>{formatCurrencyFull(bar.value)}</span>
              </div>
              <div style={{ height: '7px', backgroundColor: 'var(--surface-md)', borderRadius: '999px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                <motion.div
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  style={{ height: '100%', backgroundColor: bar.color, borderRadius: '999px' }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Net worth delta */}
      <div style={{ padding: '0 12px' }}>
        <div style={{
          padding: '12px 14px',
          borderRadius: '10px',
          backgroundColor: `color-mix(in srgb, ${nwDelta >= 0 ? 'var(--accent)' : 'var(--negative)'} 6%, transparent)`,
          border: `1px solid color-mix(in srgb, ${nwDelta >= 0 ? 'var(--accent)' : 'var(--negative)'} 25%, transparent)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text)', opacity: 0.6 }}>Net worth change</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: nwDelta >= 0 ? 'var(--accent)' : 'var(--negative)' }}>
            {nwDelta >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            <span style={{ fontWeight: 800, fontSize: '0.9375rem' }}>{nwDelta >= 0 ? '+' : ''}{formatCurrencyFull(nwDelta)}</span>
          </div>
        </div>
      </div>

      {/* Completed months mini timeline */}
      {completedMonths.length > 0 && (
        <div style={{ padding: '0 12px', marginTop: 'auto' }}>
          <p style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text)', opacity: 0.4, marginBottom: '8px' }}>
            Score History
          </p>
          <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap' }}>
            {completedMonths.map((m, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                title={`Month ${m.month}: ${m.monthScore} pts`}
                style={{
                  width: '20px', height: '20px', borderRadius: '5px',
                  backgroundColor: m.monthScore >= 70 ? 'var(--accent)' : m.monthScore >= 40 ? 'var(--risk)' : 'var(--negative)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.5625rem', fontWeight: 700, color: 'var(--background)',
                }}
              >
                {m.monthScore}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Debt alert */}
      {(state?.debtBalance ?? 0) > 0 && (
        <div style={{ padding: '0 12px 12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '8px 12px', borderRadius: '8px', backgroundColor: 'color-mix(in srgb, var(--negative) 6%, transparent)', border: '1px solid color-mix(in srgb, var(--negative) 20%, transparent)' }}>
            <AlertTriangle size={13} color="var(--negative)" />
            <span style={{ fontSize: '0.75rem', color: 'var(--negative)', fontWeight: 600 }}>
              {formatCurrencyFull(state!.debtBalance)} debt accumulating interest
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
