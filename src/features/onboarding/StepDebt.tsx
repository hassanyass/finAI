import { Input, Button, Badge } from '../../components'
import type { OnboardingData } from './OnboardingFlow'
import type { DebtEntry, DebtType } from '../../types/financial'
import { formatCurrencyFull, formatPercent, dtiLabel } from '../../lib/financialCalc'
import { Plus, Trash2 } from 'lucide-react'

interface Props { data: OnboardingData; onChange: (p: Partial<OnboardingData>) => void }

const DEBT_TYPES: { value: DebtType; label: string }[] = [
  { value: 'credit-card', label: 'Credit Card' },
  { value: 'student-loan', label: 'Student Loan' },
  { value: 'car-loan', label: 'Car Loan' },
  { value: 'personal-loan', label: 'Personal Loan' },
  { value: 'medical', label: 'Medical' },
  { value: 'other', label: 'Other' },
]

export function StepDebt({ data, onChange }: Props) {
  const totalIncome = data.primaryIncome + data.additionalIncome.reduce((s, i) => s + i.amount, 0)
  const totalDebt = data.debt.reduce((s, d) => s + d.balance, 0)
  const totalMin = data.debt.reduce((s, d) => s + d.minimumPayment, 0)
  const dti = totalIncome > 0 ? (totalMin / totalIncome) * 100 : 0
  const dtiInfo = dtiLabel(dti)

  function addDebt() {
    const newEntry: DebtEntry = { id: `d-${Date.now()}`, type: 'credit-card', balance: 0, minimumPayment: 0 }
    onChange({ debt: [...data.debt, newEntry], hasNoDebt: false })
  }

  function updateDebt(id: string, field: keyof DebtEntry, value: unknown) {
    onChange({ debt: data.debt.map(d => d.id === id ? { ...d, [field]: value } : d) })
  }

  function removeDebt(id: string) {
    onChange({ debt: data.debt.filter(d => d.id !== id) })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>Debt</h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text)', opacity: 0.6 }}>
          List any outstanding balances. Accuracy helps — rough numbers are fine.
        </p>
      </div>

      {/* No debt checkbox */}
      <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
        <input
          type="checkbox"
          checked={data.hasNoDebt}
          onChange={e => onChange({ hasNoDebt: e.target.checked, debt: e.target.checked ? [] : data.debt })}
          style={{ width: '16px', height: '16px', cursor: 'pointer' }}
        />
        <span style={{ fontSize: '0.9375rem', color: 'var(--text)' }}>I have no debt</span>
      </label>

      {!data.hasNoDebt && (
        <>
          {data.debt.map((d, i) => (
            <div key={d.id} style={{ padding: '16px', borderRadius: '8px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text)', opacity: 0.6 }}>Debt {i + 1}</span>
                <button onClick={() => removeDebt(d.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--negative)', display: 'flex', padding: '4px' }}>
                  <Trash2 size={14} />
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text)', opacity: 0.8, display: 'block', marginBottom: '5px' }}>Type</label>
                  <select
                    value={d.type}
                    onChange={e => updateDebt(d.id, 'type', e.target.value as DebtType)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '7px', border: '1px solid var(--border)', backgroundColor: 'var(--background)', color: 'var(--text)', fontFamily: 'Inter', fontSize: '0.9375rem' }}
                  >
                    {DEBT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <Input label="Outstanding balance" type="number" prefix="$"
                  value={d.balance || ''} onChange={e => updateDebt(d.id, 'balance', parseFloat(e.target.value) || 0)} />
                <Input label="Min. monthly payment" type="number" prefix="$"
                  value={d.minimumPayment || ''} onChange={e => updateDebt(d.id, 'minimumPayment', parseFloat(e.target.value) || 0)} />
                <Input label="Interest rate (optional)" type="number" suffix="%"
                  value={d.interestRate ?? ''} onChange={e => updateDebt(d.id, 'interestRate', parseFloat(e.target.value) || undefined)} />
              </div>
            </div>
          ))}

          <Button variant="ghost" size="sm" onClick={addDebt}>
            <Plus size={14} /> Add debt
          </Button>

          {totalDebt > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', borderRadius: '7px', backgroundColor: 'var(--surface)' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--text)', opacity: 0.7 }}>Total debt</span>
                <span style={{ fontWeight: 600, color: 'var(--negative)' }}>{formatCurrencyFull(totalDebt)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', borderRadius: '8px', backgroundColor: `color-mix(in srgb, var(--${dtiInfo.color}) 8%, transparent)`, border: `1px solid color-mix(in srgb, var(--${dtiInfo.color}) 20%, transparent)` }}>
                <div>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text)', opacity: 0.7 }}>Debt-to-income ratio</span>
                  <span style={{ marginLeft: '8px', fontWeight: 700, color: `var(--${dtiInfo.color})` }}>{formatPercent(dti, 1)}</span>
                </div>
                <Badge variant={dtiInfo.color === 'accent' ? 'success' : dtiInfo.color === 'risk' ? 'warning' : 'danger'}>
                  {dtiInfo.label}
                </Badge>
              </div>
            </div>
          )}
        </>
      )}

      {data.hasNoDebt && (
        <p style={{ fontSize: '0.9375rem', color: 'var(--accent)', padding: '14px', borderRadius: '8px', backgroundColor: 'color-mix(in srgb, var(--accent) 8%, transparent)', border: '1px solid color-mix(in srgb, var(--accent) 20%, transparent)' }}>
          No debt — this is a strong financial foundation.
        </p>
      )}
    </div>
  )
}
