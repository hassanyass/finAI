import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFinancialProfileStore } from '../../store/financialProfileStore'
import { Card, Button } from '../../components'
import { projectScenario, baselineProjection, formatCurrencyFull } from '../../lib/financialCalc'
import type { ScenarioInput } from '../../types/financial'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { RotateCcw, TrendingUp, TrendingDown, Minus } from 'lucide-react'

export function Simulator() {
  const profile  = useFinancialProfileStore(s => s.profile)
  const navigate = useNavigate()

  // Safe defaults when no profile
  const safeIncome    = profile?.income.total ?? 0
  const safeFixed     = profile?.expenses.fixed ?? 0
  const safeVariable  = profile?.expenses.variable ?? 0

  const [scenario, setScenario] = useState<ScenarioInput>({
    income:            safeIncome,
    fixedExpenses:     safeFixed,
    variableExpenses:  safeVariable,
    extraDebtPayment:  0,
    monthlySavings:    0,
    monthlyInvestment: 0,
  })

  // Reset when profile changes
  useEffect(() => {
    if (!profile) return
    setScenario({
      income:            profile.income.total,
      fixedExpenses:     profile.expenses.fixed,
      variableExpenses:  profile.expenses.variable,
      extraDebtPayment:  0,
      monthlySavings:    0,
      monthlyInvestment: 0,
    })
  }, [profile?.income.total, profile?.expenses.fixed, profile?.expenses.variable])

  const baselineData = useMemo(
    () => profile ? baselineProjection(profile) : [],
    [profile]
  )
  const scenarioData = useMemo(
    () => profile ? projectScenario(profile, scenario) : [],
    [profile, scenario]
  )

  if (!profile) {
    navigate('/onboarding')
    return null
  }

  const p = profile

  function update(field: keyof ScenarioInput, value: number) {
    setScenario(prev => ({ ...prev, [field]: value }))
  }

  function reset() {
    setScenario({
      income:            p.income.total,
      fixedExpenses:     p.expenses.fixed,
      variableExpenses:  p.expenses.variable,
      extraDebtPayment:  0,
      monthlySavings:    0,
      monthlyInvestment: 0,
    })
  }

  const chartData = Array.from({ length: 12 }, (_, i) => ({
    month: `M${i + 1}`,
    baseline: baselineData[i]?.netWorth ?? 0,
    scenario: scenarioData[i]?.netWorth ?? 0,
  }))

  const final      = scenarioData[11]
  const baseFinal  = baselineData[11]
  const nwDelta    = final ? final.netWorth - (baseFinal?.netWorth ?? 0) : 0
  const isPositive = nwDelta >= 0

  const debtPaidMonth = scenarioData.findIndex(s => s.debtBalance === 0)

  function insight(): string {
    const parts: string[] = []
    if (scenario.income !== p.income.total) parts.push(`${scenario.income > p.income.total ? 'raising' : 'cutting'} income by ${formatCurrencyFull(Math.abs(scenario.income - p.income.total))}/mo`)
    if (scenario.variableExpenses < p.expenses.variable) parts.push(`cutting variable spend by ${formatCurrencyFull(p.expenses.variable - scenario.variableExpenses)}/mo`)
    if (scenario.extraDebtPayment > 0) parts.push(`extra ${formatCurrencyFull(scenario.extraDebtPayment)}/mo on debt`)
    if (scenario.monthlyInvestment > 0) parts.push(`${formatCurrencyFull(scenario.monthlyInvestment)}/mo invested`)
    if (parts.length === 0) return 'Move a slider to model a scenario.'
    return `${parts.join(' + ')} → net worth ${isPositive ? '+' : ''}${formatCurrencyFull(nwDelta)} in 12 months.`
  }

  // Slider bounds — always ensure min < max and step fits
  const incomeMax     = Math.max(p.income.total * 2, 10000)
  const fixedMax      = Math.max(p.expenses.fixed * 2, 3000)
  const varMax        = Math.max(p.expenses.variable * 2, 2000)
  const debtExtra     = Math.max(p.debt.total > 0 ? Math.round(p.debt.total * 0.15) : 0, 500)
  const cashFlow      = Math.max(p.income.total - p.expenses.total - p.debt.totalMinimumPayments, 500)
  const savingsMax    = Math.max(cashFlow * 0.8, 1000)
  const investMax     = Math.max(cashFlow * 0.6, 500)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.03em', marginBottom: '4px' }}>
            What-If Simulator
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text)', opacity: 0.55 }}>
            Non-destructive — your saved profile is unchanged.
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={reset}>
          <RotateCcw size={14} /> Reset
        </Button>
      </div>

      {/* Main grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '24px', alignItems: 'start' }}>

        {/* ── Sliders ── */}
        <Card variant="default" padding="lg">
          <h2 style={{ fontSize: '0.875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text)', opacity: 0.5, marginBottom: '20px' }}>
            Adjust Variables
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
            <SliderField label="Monthly Income"    value={scenario.income}           baseline={p.income.total}       min={0}  max={incomeMax}  step={100}  onChange={v => update('income', v)}            formatFn={formatCurrencyFull} />
            <SliderField label="Fixed Expenses"    value={scenario.fixedExpenses}    baseline={p.expenses.fixed}     min={0}  max={fixedMax}   step={50}   onChange={v => update('fixedExpenses', v)}     formatFn={formatCurrencyFull} inverseColor />
            <SliderField label="Variable Expenses" value={scenario.variableExpenses} baseline={p.expenses.variable}  min={0}  max={varMax}     step={25}   onChange={v => update('variableExpenses', v)}  formatFn={formatCurrencyFull} inverseColor />
            {p.debt.total > 0 && (
              <SliderField label="Extra Debt Payment" value={scenario.extraDebtPayment} baseline={0} min={0} max={debtExtra} step={25} onChange={v => update('extraDebtPayment', v)} formatFn={formatCurrencyFull} />
            )}
            <SliderField label="Monthly Savings"    value={scenario.monthlySavings}    baseline={0} min={0} max={savingsMax} step={25} onChange={v => update('monthlySavings', v)}    formatFn={formatCurrencyFull} />
            <SliderField label="Monthly Investment" value={scenario.monthlyInvestment} baseline={0} min={0} max={investMax}  step={25} onChange={v => update('monthlyInvestment', v)} formatFn={formatCurrencyFull} />
          </div>
        </Card>

        {/* ── Results ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Chart */}
          <Card variant="default" padding="md">
            <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)', opacity: 0.65, marginBottom: '16px' }}>
              12-Month Net Worth Projection
            </h3>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={chartData}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="4 4" />
                <XAxis dataKey="month" tick={{ fill: 'var(--text)', opacity: 0.45, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text)', opacity: 0.45, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => formatCurrencyFull(v as number)} />
                <ReTooltip formatter={(v: unknown) => formatCurrencyFull(v as number)} contentStyle={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', fontSize: '0.875rem' }} />
                <Legend wrapperStyle={{ fontSize: '0.8125rem', opacity: 0.65 }} />
                <Line type="monotone" dataKey="baseline" stroke="var(--secondary)" strokeWidth={1.5} strokeDasharray="5 5" dot={false} name="Baseline" />
                <Line type="monotone" dataKey="scenario" stroke={isPositive ? 'var(--accent)' : 'var(--negative)'} strokeWidth={2.5} dot={false} name="Scenario" />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Impact tiles */}
          {final && baseFinal && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              <ImpactTile label="Net Worth Change"  value={(nwDelta >= 0 ? '+' : '') + formatCurrencyFull(nwDelta)}        positive={isPositive} />
              <ImpactTile label="Savings at M12"    value={formatCurrencyFull(final.savingsBalance)}                        positive />
              <ImpactTile label="Debt at M12"       value={formatCurrencyFull(final.debtBalance)}                           positive={final.debtBalance < p.debt.total} sub={debtPaidMonth >= 0 ? `Paid off in M${debtPaidMonth + 1}` : ''} />
              <ImpactTile label="Cash Flow"         value={formatCurrencyFull(final.cashFlow)}                              positive={final.cashFlow >= 0} />
            </div>
          )}

          {/* Insight */}
          <Card variant="outlined" padding="md" style={{ borderColor: 'color-mix(in srgb, var(--primary) 30%, transparent)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              {nwDelta > 500 ? <TrendingUp size={18} color="var(--accent)" style={{ flexShrink: 0, marginTop: '2px' }} />
                : nwDelta < -500 ? <TrendingDown size={18} color="var(--negative)" style={{ flexShrink: 0, marginTop: '2px' }} />
                : <Minus size={18} color="var(--secondary)" style={{ flexShrink: 0, marginTop: '2px' }} />
              }
              <p style={{ fontSize: '0.9375rem', color: 'var(--text)', lineHeight: 1.6 }}>{insight()}</p>
            </div>
          </Card>

          {/* Comparison table */}
          {final && baseFinal && (
            <Card variant="default" padding="md">
              <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)', opacity: 0.65, marginBottom: '14px' }}>
                Baseline vs. Scenario — Month 12
              </h3>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Metric', 'Baseline', 'Scenario', 'Change'].map(h => (
                      <th key={h} style={{ textAlign: h === 'Metric' ? 'left' : 'right', padding: '6px 10px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text)', opacity: 0.45, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: 'Net Worth', b: baseFinal.netWorth, s: final.netWorth },
                    { label: 'Savings',   b: baseFinal.savingsBalance, s: final.savingsBalance },
                    { label: 'Debt',      b: baseFinal.debtBalance, s: final.debtBalance, invertPositive: true },
                  ].map((row, i) => {
                    const delta = row.s - row.b
                    const pos = row.invertPositive ? delta <= 0 : delta >= 0
                    return (
                      <tr key={row.label} style={{ backgroundColor: i % 2 === 1 ? 'var(--surface)' : 'transparent' }}>
                        <td style={{ padding: '10px', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text)' }}>{row.label}</td>
                        <td style={{ padding: '10px', textAlign: 'right', fontSize: '0.875rem', color: 'var(--text)', opacity: 0.7 }}>{formatCurrencyFull(row.b)}</td>
                        <td style={{ padding: '10px', textAlign: 'right', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)' }}>{formatCurrencyFull(row.s)}</td>
                        <td style={{ padding: '10px', textAlign: 'right', fontSize: '0.875rem', fontWeight: 700, color: pos ? 'var(--accent)' : 'var(--negative)' }}>
                          {(delta >= 0 ? '+' : '')}{formatCurrencyFull(delta)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── SliderField ─────────────────────────────────────────────────────────────

function SliderField({ label, value, baseline, min, max, step, onChange, formatFn, inverseColor }: {
  label: string; value: number; baseline: number; min: number; max: number; step: number;
  onChange: (v: number) => void; formatFn: (v: number) => string; inverseColor?: boolean
}) {
  const safeMax = Math.max(max, min + step)
  const delta   = value - baseline
  const pos     = inverseColor ? delta <= 0 : delta >= 0
  const deltaColor = delta === 0 ? 'var(--secondary)' : pos ? 'var(--accent)' : 'var(--negative)'
  const pct = safeMax > min ? ((value - min) / (safeMax - min)) * 100 : 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text)', opacity: 0.7 }}>{label}</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text)' }}>{formatFn(value)}</span>
          {delta !== 0 && (
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: deltaColor, padding: '2px 7px', borderRadius: '5px', backgroundColor: `color-mix(in srgb, ${deltaColor} 10%, transparent)` }}>
              {delta > 0 ? '+' : ''}{formatFn(delta)}
            </span>
          )}
        </div>
      </div>

      {/* Custom styled track */}
      <div style={{ position: 'relative', height: '20px', display: 'flex', alignItems: 'center' }}>
        <div style={{ position: 'absolute', width: '100%', height: '6px', borderRadius: '3px', backgroundColor: 'var(--surface-md)', border: '1px solid var(--border)' }}>
          <div style={{ height: '100%', width: `${pct}%`, backgroundColor: 'var(--primary)', borderRadius: '3px', transition: 'width 0.05s' }} />
        </div>
        <input
          type="range"
          min={min}
          max={safeMax}
          step={step}
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          style={{
            position: 'absolute', width: '100%', height: '100%',
            opacity: 0, cursor: 'pointer', margin: 0, padding: 0,
          }}
          aria-label={label}
          aria-valuemin={min}
          aria-valuemax={safeMax}
          aria-valuenow={value}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.7rem', color: 'var(--text)', opacity: 0.35 }}>{formatFn(min)}</span>
        {baseline !== min && baseline !== safeMax && (
          <span style={{ fontSize: '0.7rem', color: 'var(--text)', opacity: 0.45 }}>Base: {formatFn(baseline)}</span>
        )}
        <span style={{ fontSize: '0.7rem', color: 'var(--text)', opacity: 0.35 }}>{formatFn(safeMax)}</span>
      </div>
    </div>
  )
}

function ImpactTile({ label, value, positive, sub }: { label: string; value: string; positive: boolean; sub?: string }) {
  return (
    <div style={{ padding: '14px 16px', borderRadius: '10px', backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
      <p style={{ fontSize: '0.75rem', color: 'var(--text)', opacity: 0.5, marginBottom: '4px', fontWeight: 500 }}>{label}</p>
      <p style={{ fontSize: '1.125rem', fontWeight: 800, color: positive ? 'var(--accent)' : 'var(--negative)', letterSpacing: '-0.01em' }}>{value}</p>
      {sub && <p style={{ fontSize: '0.75rem', color: 'var(--accent)', marginTop: '3px' }}>{sub}</p>}
    </div>
  )
}
