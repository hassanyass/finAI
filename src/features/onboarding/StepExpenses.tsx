import { Input } from '../../components'
import type { OnboardingData } from './OnboardingFlow'
import { formatCurrencyFull } from '../../lib/financialCalc'

interface Props { data: OnboardingData; onChange: (p: Partial<OnboardingData>) => void }

export function StepExpenses({ data, onChange }: Props) {
  const totalIncome = data.primaryIncome + data.additionalIncome.reduce((s, i) => s + i.amount, 0)
  const total = data.fixedExpenses + data.variableExpenses
  const cashFlow = totalIncome - total
  const isNegative = cashFlow < 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>Monthly Expenses</h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text)', opacity: 0.6 }}>
          Estimate your regular monthly spending.
        </p>
      </div>

      <div>
        <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text)', opacity: 0.7, marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Fixed (recurring, committed)
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Input label="Housing (rent / mortgage)" type="number" prefix="$" placeholder="1,200"
            value={data.fixedExpenses || ''} onChange={e => onChange({ fixedExpenses: parseFloat(e.target.value) || 0 })} />
        </div>
      </div>

      <div>
        <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text)', opacity: 0.7, marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Variable (discretionary, adjustable)
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Input label="Groceries, dining, transport, entertainment" type="number" prefix="$" placeholder="800"
            value={data.variableExpenses || ''} onChange={e => onChange({ variableExpenses: parseFloat(e.target.value) || 0 })} />
        </div>
      </div>

      {/* Summary */}
      {total > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', borderRadius: '7px', backgroundColor: 'var(--surface)' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--text)', opacity: 0.7 }}>Total expenses</span>
            <span style={{ fontWeight: 600, color: 'var(--negative)' }}>{formatCurrencyFull(total)}</span>
          </div>
          <div style={{
            display: 'flex', justifyContent: 'space-between', padding: '12px 14px', borderRadius: '8px',
            backgroundColor: `color-mix(in srgb, ${isNegative ? 'var(--negative)' : 'var(--accent)'} 8%, transparent)`,
            border: `1px solid color-mix(in srgb, ${isNegative ? 'var(--negative)' : 'var(--accent)'} 20%, transparent)`,
          }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--text)', opacity: 0.7 }}>
              {isNegative ? 'Monthly shortfall' : 'Monthly surplus'}
            </span>
            <span style={{ fontWeight: 700, color: isNegative ? 'var(--negative)' : 'var(--accent)' }}>
              {isNegative ? '-' : '+'}{formatCurrencyFull(Math.abs(cashFlow))}
            </span>
          </div>
          {isNegative && (
            <p style={{ fontSize: '0.8125rem', color: 'var(--risk)', padding: '10px 14px', borderRadius: '7px', backgroundColor: 'color-mix(in srgb, var(--risk) 8%, transparent)', border: '1px solid color-mix(in srgb, var(--risk) 20%, transparent)' }}>
              Your expenses exceed your income. FinSight will help you understand and address this.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
