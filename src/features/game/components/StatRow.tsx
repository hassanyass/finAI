import { motion, AnimatePresence } from 'framer-motion'
import { useCountAnimation } from '../../../hooks/useCountAnimation'
import { formatCurrencyFull } from '../../../lib/financialCalc'
import type { MonthState } from '../../../types/game'
import { Wallet, PiggyBank, CreditCard, TrendingUp } from 'lucide-react'

interface StatRowProps {
  state: MonthState
  prevState: MonthState | null
}

interface StatPillProps {
  label: string
  value: number
  prevValue: number
  positive: boolean
  Icon: React.FC<{ size?: number; color?: string }>
  accentColor: string
}

function StatPill({ label, value, prevValue, positive, Icon, accentColor }: StatPillProps) {
  const animated = useCountAnimation(value, 500)
  const delta    = value - prevValue
  const hasDelta = delta !== 0

  return (
    <div style={{
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '4px',
      padding: '10px 8px 8px',
      borderRadius: '12px',
      backgroundColor: 'var(--surface)',
      border: '2px solid var(--border)',
      boxShadow: '0 3px 0 var(--border)',
      overflow: 'visible',
      minWidth: 0,
    }}>
      {/* Label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <Icon size={11} color={accentColor} />
        <span style={{ fontSize: '0.6875rem', color: 'var(--text)', opacity: 0.5, fontWeight: 600, whiteSpace: 'nowrap' }}>
          {label}
        </span>
      </div>

      {/* Value */}
      <span style={{
        fontSize: '1.0625rem',
        fontWeight: 800,
        color: positive ? accentColor : 'var(--negative)',
        letterSpacing: '-0.02em',
        lineHeight: 1,
        whiteSpace: 'nowrap',
      }}>
        {formatCurrencyFull(animated)}
      </span>

      {/* Delta chip — floats above top-right corner */}
      <AnimatePresence>
        {hasDelta && (
          <motion.div
            key={`d-${value}`}
            initial={{ opacity: 0, scale: 0.75, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.75, y: -4 }}
            transition={{ duration: 0.22 }}
            style={{
              position: 'absolute',
              top: '-10px',
              right: '-4px',
              fontSize: '0.625rem',
              fontWeight: 800,
              padding: '2px 6px',
              borderRadius: '20px',
              border: `1px solid ${delta > 0
                ? 'color-mix(in srgb, var(--accent) 30%, transparent)'
                : 'color-mix(in srgb, var(--negative) 30%, transparent)'}`,
              backgroundColor: delta > 0
                ? 'color-mix(in srgb, var(--accent) 12%, var(--background))'
                : 'color-mix(in srgb, var(--negative) 12%, var(--background))',
              color: delta > 0 ? 'var(--accent)' : 'var(--negative)',
              whiteSpace: 'nowrap',
            }}
          >
            {delta > 0 ? '+' : ''}{formatCurrencyFull(delta)}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function StatRow({ state, prevState }: StatRowProps) {
  const prev = prevState ?? state

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '8px',
      padding: '16px 0 20px',
    }}>
      <StatPill label="Cash"     value={state.cash}              prevValue={prev.cash}              positive={state.cash >= 0}            Icon={Wallet}    accentColor="var(--accent)"    />
      <StatPill label="Savings"  value={state.savingsBalance}    prevValue={prev.savingsBalance}    positive                              Icon={PiggyBank} accentColor="var(--secondary)" />
      <StatPill label="Debt"     value={state.debtBalance}       prevValue={prev.debtBalance}       positive={state.debtBalance <= 0}     Icon={CreditCard} accentColor={state.debtBalance > 0 ? 'var(--negative)' : 'var(--accent)'} />
      <StatPill label="Invested" value={state.investmentBalance} prevValue={prev.investmentBalance} positive                              Icon={TrendingUp} accentColor="var(--primary)"   />
    </div>
  )
}
