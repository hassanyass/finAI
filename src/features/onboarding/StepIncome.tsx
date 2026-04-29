import { type OnboardingData } from './OnboardingFlow'
import { Input, Button } from '../../components'
import { Plus, Trash2 } from 'lucide-react'
import { formatCurrencyFull } from '../../lib/financialCalc'
import type { IncomeSource } from '../../types/financial'

interface Props {
  data: OnboardingData
  onChange: (partial: Partial<OnboardingData>) => void
}

export function StepIncome({ data, onChange }: Props) {
  const total = data.primaryIncome + data.additionalIncome.reduce((s, i) => s + i.amount, 0)

  function addSource() {
    onChange({ additionalIncome: [...data.additionalIncome, { label: '', amount: 0 }] })
  }

  function updateSource(index: number, field: keyof IncomeSource, value: string | number) {
    const updated = data.additionalIncome.map((s, i) =>
      i === index ? { ...s, [field]: value } : s
    )
    onChange({ additionalIncome: updated })
  }

  function removeSource(index: number) {
    onChange({ additionalIncome: data.additionalIncome.filter((_, i) => i !== index) })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>Income</h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text)', opacity: 0.6 }}>
          Enter your monthly take-home pay after taxes.
        </p>
      </div>

      <Input
        label="Monthly take-home pay"
        type="number"
        prefix="$"
        value={data.primaryIncome || ''}
        onChange={e => onChange({ primaryIncome: parseFloat(e.target.value) || 0 })}
        placeholder="3,500"
        hint="After taxes — what actually lands in your bank."
        min={0}
      />

      {/* Additional income sources */}
      {data.additionalIncome.map((source, i) => (
        <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
          <div style={{ flex: 2 }}>
            <Input
              label={i === 0 ? 'Additional income source' : undefined}
              type="text"
              value={source.label}
              onChange={e => updateSource(i, 'label', e.target.value)}
              placeholder="Freelance, rental, etc."
            />
          </div>
          <div style={{ flex: 1 }}>
            <Input
              label={i === 0 ? 'Monthly amount' : undefined}
              type="number"
              prefix="$"
              value={source.amount || ''}
              onChange={e => updateSource(i, 'amount', parseFloat(e.target.value) || 0)}
              placeholder="500"
            />
          </div>
          <button
            onClick={() => removeSource(i)}
            style={{ padding: '9px', background: 'transparent', border: '1px solid var(--border)', borderRadius: '7px', cursor: 'pointer', color: 'var(--negative)', marginBottom: '0' }}
            aria-label="Remove income source"
          >
            <Trash2 size={15} />
          </button>
        </div>
      ))}

      {data.additionalIncome.length < 5 && (
        <Button variant="ghost" size="sm" onClick={addSource}>
          <Plus size={14} /> Add income source
        </Button>
      )}

      {/* Total */}
      {total > 0 && (
        <div style={{ padding: '14px 16px', borderRadius: '8px', backgroundColor: 'color-mix(in srgb, var(--accent) 8%, transparent)', border: '1px solid color-mix(in srgb, var(--accent) 20%, transparent)' }}>
          <span style={{ fontSize: '0.875rem', color: 'var(--text)', opacity: 0.7 }}>Total monthly income: </span>
          <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent)' }}>{formatCurrencyFull(total)}</span>
        </div>
      )}
    </div>
  )
}
