import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFinancialProfileStore } from '../../store/financialProfileStore'
import type { FinancialProfile, DebtEntry, IncomeSource } from '../../types/financial'
import { Button, Card, ProgressBar } from '../../components'
import { StepIncome } from './StepIncome'
import { StepExpenses } from './StepExpenses'
import { StepDebt } from './StepDebt'
import { StepSavings } from './StepSavings'
import { OnboardingSummary } from './OnboardingSummary'
import { CheckCircle, Zap } from 'lucide-react'

export type OnboardingStep = 0 | 1 | 2 | 3 | 'summary'

export interface OnboardingData {
  primaryIncome: number
  additionalIncome: IncomeSource[]
  fixedExpenses: number
  variableExpenses: number
  debt: DebtEntry[]
  hasNoDebt: boolean
  emergencySavings: number
  otherSavings: number
  investments: number
  retirement: number
}

const STEPS = [
  { label: 'Income', index: 0 },
  { label: 'Expenses', index: 1 },
  { label: 'Debt', index: 2 },
  { label: 'Savings', index: 3 },
]

const defaultData: OnboardingData = {
  primaryIncome: 0,
  additionalIncome: [],
  fixedExpenses: 0,
  variableExpenses: 0,
  debt: [],
  hasNoDebt: false,
  emergencySavings: 0,
  otherSavings: 0,
  investments: 0,
  retirement: 0,
}

const SAMPLE_DATA: OnboardingData = {
  primaryIncome: 4500,
  additionalIncome: [],
  fixedExpenses: 1450,
  variableExpenses: 750,
  debt: [{
    id: 'sample-cc',
    type: 'credit-card',
    balance: 3200,
    minimumPayment: 95,
    interestRate: 22,
  }],
  hasNoDebt: false,
  emergencySavings: 1200,
  otherSavings: 500,
  investments: 4000,
  retirement: 8000,
}

export function OnboardingFlow() {
  const navigate = useNavigate()
  const setProfile = useFinancialProfileStore(s => s.setProfile)
  const [step, setStep] = useState<OnboardingStep>(0)
  const [data, setData] = useState<OnboardingData>(defaultData)
  const [autoFilled, setAutoFilled] = useState(false)

  function handleAutoFill() {
    setData(SAMPLE_DATA)
    setAutoFilled(true)
    setStep('summary')
  }

  function updateData(partial: Partial<OnboardingData>) {
    setData(prev => ({ ...prev, ...partial }))
  }

  function handleSubmit() {
    const totalIncome = data.primaryIncome + data.additionalIncome.reduce((s, i) => s + i.amount, 0)
    const totalExpenses = data.fixedExpenses + data.variableExpenses
    const debtTotal = data.hasNoDebt ? 0 : data.debt.reduce((s, d) => s + d.balance, 0)
    const debtMinPayments = data.hasNoDebt ? 0 : data.debt.reduce((s, d) => s + d.minimumPayment, 0)
    const totalSavings = data.emergencySavings + data.otherSavings + data.investments + data.retirement

    const profile: FinancialProfile = {
      income: { primary: data.primaryIncome, additional: data.additionalIncome, total: totalIncome },
      expenses: { fixed: data.fixedExpenses, variable: data.variableExpenses, total: totalExpenses },
      debt: {
        entries: data.hasNoDebt ? [] : data.debt,
        total: debtTotal,
        totalMinimumPayments: debtMinPayments,
        hasNoDebt: data.hasNoDebt,
      },
      savings: {
        emergency: data.emergencySavings,
        other: data.otherSavings,
        investments: data.investments,
        retirement: data.retirement,
        total: totalSavings,
      },
      createdAt: Date.now(),
    }
    setProfile(profile)
    navigate('/dashboard')
  }

  const stepIndex = step === 'summary' ? 4 : (step as number)

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em', marginBottom: '6px' }}>
          Build Your Financial Profile
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          <p style={{ fontSize: '0.9375rem', color: 'var(--text)', opacity: 0.6 }}>
            Your data stays on your device. No account needed.
          </p>
          {!autoFilled && (
            <button
              onClick={handleAutoFill}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '7px 14px', borderRadius: '8px',
                border: '1px solid color-mix(in srgb, var(--secondary) 40%, transparent)',
                backgroundColor: 'color-mix(in srgb, var(--secondary) 8%, transparent)',
                color: 'var(--secondary)', fontSize: '0.8125rem', fontWeight: 600,
                cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'Inter',
                transition: 'opacity 0.15s',
              }}
              onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.opacity = '0.75')}
              onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.opacity = '1')}
              title="Fill with a realistic sample profile so you can start playing immediately"
            >
              <Zap size={13} /> Use sample data
            </button>
          )}
        </div>
        {autoFilled && (
          <p style={{ marginTop: '6px', fontSize: '0.8125rem', color: 'var(--accent)' }}>
            Sample profile loaded — review and confirm below.
          </p>
        )}
      </div>

      {/* Step Progress */}
      <div style={{ marginBottom: '32px' }}>
        <ProgressBar value={stepIndex} max={4} color="primary" height={3} />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
          {STEPS.map(s => {
            const isDone = (step === 'summary') || (step as number) > s.index
            const isActive = step === s.index
            return (
              <button
                key={s.index}
                onClick={() => {
                  if (isDone) setStep(s.index as OnboardingStep)
                }}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                  background: 'transparent', border: 'none', cursor: isDone ? 'pointer' : 'default',
                  padding: '0',
                }}
              >
                <div style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  backgroundColor: isDone ? 'var(--accent)' : isActive ? 'var(--primary)' : 'var(--surface-md)',
                  border: isActive ? '2px solid var(--primary)' : '2px solid transparent',
                  transition: 'all 0.2s',
                }}>
                  {isDone
                    ? <CheckCircle size={14} color="var(--background)" />
                    : <span style={{ fontSize: '0.75rem', fontWeight: 600, color: isActive ? 'var(--background)' : 'var(--text)', opacity: isActive ? 1 : 0.4 }}>
                        {s.index + 1}
                      </span>
                  }
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text)', opacity: isActive ? 1 : 0.5, fontWeight: isActive ? 500 : 400 }}>
                  {s.label}
                </span>
              </button>
            )
          })}
          {/* Summary marker */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backgroundColor: step === 'summary' ? 'var(--primary)' : 'var(--surface-md)',
              border: step === 'summary' ? '2px solid var(--primary)' : '2px solid transparent',
            }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: step === 'summary' ? 'var(--background)' : 'var(--text)', opacity: step === 'summary' ? 1 : 0.4 }}>
                5
              </span>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text)', opacity: step === 'summary' ? 1 : 0.5, fontWeight: step === 'summary' ? 500 : 400 }}>
              Review
            </span>
          </div>
        </div>
      </div>

      {/* Step Content */}
      <Card variant="default" padding="lg">
        {step === 0 && <StepIncome data={data} onChange={updateData} />}
        {step === 1 && <StepExpenses data={data} onChange={updateData} />}
        {step === 2 && <StepDebt data={data} onChange={updateData} />}
        {step === 3 && <StepSavings data={data} onChange={updateData} />}
        {step === 'summary' && <OnboardingSummary data={data} onEdit={setStep} onSubmit={handleSubmit} />}

        {/* Navigation */}
        {step !== 'summary' && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '28px', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
            <Button
              variant="ghost"
              onClick={() => step === 0 ? undefined : setStep((step as number - 1) as OnboardingStep)}
              disabled={step === 0}
            >
              Back
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                if (step === 3) setStep('summary')
                else setStep((step as number + 1) as OnboardingStep)
              }}
            >
              {step === 3 ? 'Review' : 'Continue'}
            </Button>
          </div>
        )}
      </Card>
    </div>
  )
}
