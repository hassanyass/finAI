import { motion } from 'framer-motion'
import type { MonthState } from '../../../types/game'
import { formatCurrencyFull } from '../../../lib/financialCalc'
import { TrendingUp, TrendingDown, Shield, AlertTriangle, Award, Wallet } from 'lucide-react'

interface GameStatsPanelProps {
  month: number
  state: MonthState | null
  startingState: MonthState | null
  completedMonths: MonthState[]
}

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]

const MONTH_SITUATION: Record<number, string> = {
  1:  'A new year, a blank ledger. January decisions echo all year.',
  2:  'February creep — variable costs quietly grow if unchecked.',
  3:  'Quarter one closes. Are you ahead of where you started?',
  4:  "Employer match season. Free money is waiting to be claimed.",
  5:  'Mid-year check. Your emergency fund is a cushion or a hole.',
  6:  "Halfway. January's decisions are now compounding.",
  7:  "Car trouble. Roof leak. Adversity doesn't schedule itself.",
  8:  'A career move creates risk — and breakout potential.',
  9:  'Recovery phase. Rebuild before resuming growth.',
  10: 'Tax-advantaged windows close at year end.',
  11: 'Bonus season. Windfall test: compound or evaporate?',
  12: 'Final month. The gap between good and great is your choices.',
}

export function GameStatsPanel({ month, state, startingState, completedMonths }: GameStatsPanelProps) {
  const netWorth = state ? state.savingsBalance + state.investmentBalance - state.debtBalance : 0
  const startNW  = startingState ? startingState.savingsBalance + startingState.investmentBalance - startingState.debtBalance : 0
  const nwDelta  = netWorth - startNW

  const bars = [
    {
      label: 'Cash',
      value: Math.max(state?.cash ?? 0, 0),
      max: Math.max(startingState?.cash ?? 100, 100),
      color: 'var(--accent)',
      Icon: Wallet,
    },
    {
      label: 'Savings',
      value: state?.savingsBalance ?? 0,
      max: Math.max(startingState?.savingsBalance ?? 100, (state?.savingsBalance ?? 0) * 1.2, 100),
      color: 'var(--secondary)',
      Icon: Shield,
    },
    {
      label: 'Investments',
      value: state?.investmentBalance ?? 0,
      max: Math.max(startingState?.investmentBalance ?? 100, (state?.investmentBalance ?? 0) * 1.3, 100),
      color: 'var(--gold)',
      Icon: TrendingUp,
    },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* ── Month header ── */}
      <div style={{
        padding: '20px 16px 16px',
        borderBottom: '2px solid var(--border)',
      }}>
        <p style={{
          fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase',
          letterSpacing: '0.1em', color: 'var(--primary)', marginBottom: '6px',
        }}>
          {MONTH_NAMES[month - 1]}
        </p>
        <p style={{
          fontSize: '0.8rem', color: 'var(--text)', opacity: 0.6,
          lineHeight: 1.55, margin: 0,
        }}>
          {MONTH_SITUATION[month] ?? ''}
        </p>
      </div>

      {/* ── Net worth delta ── */}
      <div style={{ padding: '14px 16px', borderBottom: '2px solid var(--border)' }}>
        <p style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text)', opacity: 0.4, marginBottom: '8px' }}>
          Net Worth Change
        </p>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '10px 12px', borderRadius: '10px',
          border: `2px solid color-mix(in srgb, ${nwDelta >= 0 ? 'var(--accent)' : 'var(--negative)'} 25%, transparent)`,
          backgroundColor: `color-mix(in srgb, ${nwDelta >= 0 ? 'var(--accent)' : 'var(--negative)'} 5%, transparent)`,
          boxShadow: `0 3px 0 color-mix(in srgb, ${nwDelta >= 0 ? 'var(--accent)' : 'var(--negative)'} 15%, transparent)`,
        }}>
          {nwDelta >= 0
            ? <TrendingUp size={16} color="var(--accent)" style={{ flexShrink: 0 }} />
            : <TrendingDown size={16} color="var(--negative)" style={{ flexShrink: 0 }} />
          }
          <span style={{
            fontWeight: 900, fontSize: '1.125rem',
            color: nwDelta >= 0 ? 'var(--accent)' : 'var(--negative)',
            letterSpacing: '-0.025em',
          }}>
            {nwDelta >= 0 ? '+' : ''}{formatCurrencyFull(nwDelta)}
          </span>
        </div>
      </div>

      {/* ── Health bars ── */}
      <div style={{ padding: '14px 16px', borderBottom: '2px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <p style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text)', opacity: 0.4 }}>
          Financial Health
        </p>
        {bars.map(bar => {
          const pct = Math.min(100, bar.max > 0 ? (bar.value / bar.max) * 100 : 0)
          const { Icon } = bar
          return (
            <div key={bar.label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Icon size={12} color={bar.color} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text)', opacity: 0.65 }}>
                    {bar.label}
                  </span>
                </div>
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: bar.color }}>
                  {formatCurrencyFull(bar.value)}
                </span>
              </div>
              <div style={{
                height: '7px',
                backgroundColor: 'var(--surface-md)',
                borderRadius: '999px',
                overflow: 'hidden',
                border: '1px solid var(--border)',
              }}>
                <motion.div
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.55, ease: 'easeOut' }}
                  style={{ height: '100%', backgroundColor: bar.color, borderRadius: '999px' }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Debt alert ── */}
      {(state?.debtBalance ?? 0) > 0 && (
        <div style={{ padding: '12px 16px', borderBottom: '2px solid var(--border)' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '7px',
            padding: '8px 11px', borderRadius: '9px',
            backgroundColor: 'color-mix(in srgb, var(--negative) 7%, transparent)',
            border: '2px solid color-mix(in srgb, var(--negative) 22%, transparent)',
            boxShadow: '0 2px 0 color-mix(in srgb, var(--negative) 12%, transparent)',
          }}>
            <AlertTriangle size={13} color="var(--negative)" style={{ flexShrink: 0 }} />
            <div>
              <p style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--negative)', lineHeight: 1.2 }}>
                {formatCurrencyFull(state!.debtBalance)}
              </p>
              <p style={{ fontSize: '0.625rem', color: 'var(--negative)', opacity: 0.7 }}>
                accumulating interest
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Score history ── */}
      {completedMonths.length > 0 && (
        <div style={{ padding: '12px 16px', marginTop: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '8px' }}>
            <Award size={12} color="var(--gold)" />
            <p style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text)', opacity: 0.4 }}>
              Score History
            </p>
          </div>
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            {completedMonths.map((m, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.04 }}
                title={`Month ${m.month}: ${m.monthScore} pts`}
                style={{
                  width: '26px', height: '26px', borderRadius: '6px',
                  backgroundColor: m.monthScore >= 70 ? 'var(--accent)' : m.monthScore >= 40 ? 'var(--risk)' : 'var(--negative)',
                  border: '2px solid rgba(255,255,255,0.15)',
                  boxShadow: '0 2px 0 rgba(0,0,0,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.5625rem', fontWeight: 800, color: '#fff',
                  cursor: 'default',
                }}
              >
                {m.monthScore}
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
