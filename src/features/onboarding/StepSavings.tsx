import { Input, Badge } from '../../components'
import type { OnboardingData } from './OnboardingFlow'
import { formatCurrencyFull, coverageLabel } from '../../lib/financialCalc'

interface Props { data: OnboardingData; onChange: (p: Partial<OnboardingData>) => void }

export function StepSavings({ data, onChange }: Props) {
  const totalExpenses = data.fixedExpenses + data.variableExpenses
  const totalSavings = data.emergencySavings + data.otherSavings + data.investments + data.retirement
  const coverageMonths = totalExpenses > 0 ? data.emergencySavings / totalExpenses : 0
  const covInfo = coverageLabel(coverageMonths)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>Savings & Investments</h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text)', opacity: 0.6 }}>
          Rough values are fine. This establishes your starting wealth position.
        </p>
      </div>

      <Input label="Emergency savings (liquid, accessible now)"
        type="number" prefix="$" placeholder="2,000"
        value={data.emergencySavings || ''}
        onChange={e => onChange({ emergencySavings: parseFloat(e.target.value) || 0 })}
        hint="Money you could access immediately in a crisis." />

      <Input label="Other savings accounts"
        type="number" prefix="$" placeholder="1,500"
        value={data.otherSavings || ''}
        onChange={e => onChange({ otherSavings: parseFloat(e.target.value) || 0 })} />

      <Input label="Investment accounts (brokerage, ETFs, stocks)"
        type="number" prefix="$" placeholder="5,000"
        value={data.investments || ''}
        onChange={e => onChange({ investments: parseFloat(e.target.value) || 0 })}
        hint="Approximate value is fine." />

      <Input label="Retirement accounts (401k, IRA)"
        type="number" prefix="$" placeholder="12,000"
        value={data.retirement || ''}
        onChange={e => onChange({ retirement: parseFloat(e.target.value) || 0 })} />

      {/* Summary */}
      {totalSavings > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', borderRadius: '7px', backgroundColor: 'var(--surface)' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--text)', opacity: 0.7 }}>Total saved</span>
            <span style={{ fontWeight: 600, color: 'var(--accent)' }}>{formatCurrencyFull(totalSavings)}</span>
          </div>

          {totalExpenses > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', borderRadius: '8px', backgroundColor: `color-mix(in srgb, var(--${covInfo.color}) 8%, transparent)`, border: `1px solid color-mix(in srgb, var(--${covInfo.color}) 20%, transparent)` }}>
              <div>
                <span style={{ fontSize: '0.875rem', color: 'var(--text)', opacity: 0.7 }}>Emergency coverage</span>
                <span style={{ marginLeft: '8px', fontWeight: 700, color: `var(--${covInfo.color})` }}>
                  {coverageMonths.toFixed(1)} months
                </span>
              </div>
              <Badge variant={covInfo.color === 'accent' ? 'success' : covInfo.color === 'risk' ? 'warning' : 'danger'}>
                {covInfo.label}
              </Badge>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
