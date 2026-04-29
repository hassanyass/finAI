import { Button, Badge } from '../../components'
import type { OnboardingData, OnboardingStep } from './OnboardingFlow'
import { formatCurrencyFull, formatPercent, dtiLabel, coverageLabel } from '../../lib/financialCalc'
import { Pencil } from 'lucide-react'

interface Props {
  data: OnboardingData
  onEdit: (step: OnboardingStep) => void
  onSubmit: () => void
}

function Row({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid var(--border)' }}>
      <span style={{ fontSize: '0.875rem', color: 'var(--text)', opacity: 0.65 }}>{label}</span>
      <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: color ?? 'var(--text)' }}>{value}</span>
    </div>
  )
}

export function OnboardingSummary({ data, onEdit, onSubmit }: Props) {
  const totalIncome = data.primaryIncome + data.additionalIncome.reduce((s, i) => s + i.amount, 0)
  const totalExpenses = data.fixedExpenses + data.variableExpenses
  const totalDebt = data.hasNoDebt ? 0 : data.debt.reduce((s, d) => s + d.balance, 0)
  const debtMin = data.hasNoDebt ? 0 : data.debt.reduce((s, d) => s + d.minimumPayment, 0)
  const totalSavings = data.emergencySavings + data.otherSavings + data.investments + data.retirement
  const cashFlow = totalIncome - totalExpenses - debtMin
  const netWorth = totalSavings - totalDebt
  const dti = totalIncome > 0 ? (debtMin / totalIncome) * 100 : 0
  const coverage = totalExpenses > 0 ? data.emergencySavings / totalExpenses : 0
  const dtiInfo = dtiLabel(dti)
  const covInfo = coverageLabel(coverage)

  function Section({ title, step, children }: { title: string; step: OnboardingStep; children: React.ReactNode }) {
    return (
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <h3 style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text)', opacity: 0.5, textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>{title}</h3>
          <button onClick={() => onEdit(step)} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--secondary)', fontSize: '0.8125rem' }}>
            <Pencil size={12} /> Edit
          </button>
        </div>
        {children}
      </div>
    )
  }

  return (
    <div>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>Review Your Profile</h2>
      <p style={{ fontSize: '0.875rem', color: 'var(--text)', opacity: 0.6, marginBottom: '28px' }}>
        Confirm your numbers before building your dashboard.
      </p>

      <Section title="Income" step={0}>
        <Row label="Monthly income" value={formatCurrencyFull(totalIncome)} color="var(--accent)" />
      </Section>

      <Section title="Expenses" step={1}>
        <Row label="Fixed expenses" value={formatCurrencyFull(data.fixedExpenses)} color="var(--negative)" />
        <Row label="Variable expenses" value={formatCurrencyFull(data.variableExpenses)} color="var(--negative)" />
        <Row label="Monthly cash flow" value={(cashFlow >= 0 ? '+' : '') + formatCurrencyFull(cashFlow)} color={cashFlow >= 0 ? 'var(--accent)' : 'var(--negative)'} />
      </Section>

      <Section title="Debt" step={2}>
        {data.hasNoDebt
          ? <Row label="Debt status" value="No debt" color="var(--accent)" />
          : <>
              <Row label="Total debt" value={formatCurrencyFull(totalDebt)} color="var(--negative)" />
              <Row label="Monthly minimum payments" value={formatCurrencyFull(debtMin)} color="var(--negative)" />
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', alignItems: 'center' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--text)', opacity: 0.65 }}>Debt-to-income</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: 600, color: `var(--${dtiInfo.color})` }}>{formatPercent(dti, 1)}</span>
                  <Badge variant={dtiInfo.color === 'accent' ? 'success' : dtiInfo.color === 'risk' ? 'warning' : 'danger'}>{dtiInfo.label}</Badge>
                </div>
              </div>
            </>
        }
      </Section>

      <Section title="Savings" step={3}>
        <Row label="Total savings" value={formatCurrencyFull(totalSavings)} color="var(--accent)" />
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
          <span style={{ fontSize: '0.875rem', color: 'var(--text)', opacity: 0.65 }}>Emergency coverage</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: 600, color: `var(--${covInfo.color})` }}>{coverage.toFixed(1)} months</span>
            <Badge variant={covInfo.color === 'accent' ? 'success' : covInfo.color === 'risk' ? 'warning' : 'danger'}>{covInfo.label}</Badge>
          </div>
        </div>
      </Section>

      {/* Net worth highlight */}
      <div style={{ padding: '16px 20px', borderRadius: '10px', backgroundColor: `color-mix(in srgb, ${netWorth >= 0 ? 'var(--accent)' : 'var(--negative)'} 8%, transparent)`, border: `1px solid color-mix(in srgb, ${netWorth >= 0 ? 'var(--accent)' : 'var(--negative)'} 20%, transparent)`, marginBottom: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.9375rem', color: 'var(--text)', opacity: 0.8 }}>Estimated Net Worth</span>
          <span style={{ fontSize: '1.5rem', fontWeight: 700, color: netWorth >= 0 ? 'var(--accent)' : 'var(--negative)' }}>
            {netWorth >= 0 ? '' : '-'}{formatCurrencyFull(Math.abs(netWorth))}
          </span>
        </div>
      </div>

      <Button variant="primary" size="lg" fullWidth onClick={onSubmit}>
        Build My Dashboard
      </Button>
    </div>
  )
}
