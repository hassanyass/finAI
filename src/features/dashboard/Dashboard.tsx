import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFinancialProfileStore } from '../../store/financialProfileStore'
import { Card, Badge, Button, ProgressBar, Tabs, Modal } from '../../components'
import {
  calcMonthlyCashFlow, calcDTI, calcNetWorth, calcEmergencyCoverage, calcSavingsRate,
  dtiLabel, coverageLabel, savingsRateLabel, formatCurrencyFull, formatPercent,
} from '../../lib/financialCalc'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip as ReTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid,
} from 'recharts'
import { Zap, Target } from 'lucide-react'

export function Dashboard() {
  const profile = useFinancialProfileStore(s => s.profile)
  const navigate = useNavigate()
  const [modalMetric, setModalMetric] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('overview')

  if (!profile) {
    navigate('/onboarding')
    return null
  }

  const cashFlow = calcMonthlyCashFlow(profile)
  const dti = calcDTI(profile)
  const netWorth = calcNetWorth(profile)
  const coverage = calcEmergencyCoverage(profile)
  const savingsRate = calcSavingsRate(profile)

  const dtiInfo = dtiLabel(dti)
  const covInfo = coverageLabel(coverage)
  const srInfo = savingsRateLabel(savingsRate)

  // Chart data
  const cashFlowData = [
    { name: 'Income', value: profile.income.total },
    { name: 'Fixed', value: profile.expenses.fixed },
    { name: 'Variable', value: profile.expenses.variable },
    { name: 'Debt Pmts', value: profile.debt.totalMinimumPayments },
  ]

  const debtPieData = profile.debt.entries.map(d => ({
    name: d.type.replace('-', ' '),
    value: d.balance,
  }))

  const PIE_COLORS = ['var(--negative)', 'var(--risk)', 'var(--secondary)', 'var(--primary)', 'var(--text)']

  // 12-month projection preview
  const projectionData = Array.from({ length: 12 }, (_, i) => ({
    month: `M${i + 1}`,
    netWorth: Math.round(netWorth + cashFlow * (i + 1) + profile.savings.investments * 0.007 * (i + 1)),
  }))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em', marginBottom: '4px' }}>
            Financial Dashboard
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text)', opacity: 0.55 }}>
            Based on your profile
            <button onClick={() => navigate('/onboarding')} style={{ background: 'none', border: 'none', color: 'var(--secondary)', cursor: 'pointer', fontSize: '0.875rem', marginLeft: '8px', padding: 0 }}>
              · Update numbers →
            </button>
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button variant="ghost" size="sm" onClick={() => navigate('/simulate')}>Simulate</Button>
          <Button variant="primary" size="sm" onClick={() => navigate('/game')}>Play Game</Button>
        </div>
      </div>

      {/* Net Worth Hero */}
      <Card variant="elevated" padding="lg" style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text)', opacity: 0.55, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
          Estimated Net Worth
        </p>
        <p style={{ fontSize: '3rem', fontWeight: 700, letterSpacing: '-0.04em', color: netWorth >= 0 ? 'var(--accent)' : 'var(--negative)', marginBottom: '8px' }}>
          {netWorth >= 0 ? '' : '-'}{formatCurrencyFull(Math.abs(netWorth))}
        </p>
        <p style={{ fontSize: '0.875rem', color: 'var(--text)', opacity: 0.55 }}>
          Assets: <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{formatCurrencyFull(profile.savings.total)}</span>
          &nbsp;·&nbsp;
          Liabilities: <span style={{ color: 'var(--negative)', fontWeight: 600 }}>{formatCurrencyFull(profile.debt.total)}</span>
        </p>
      </Card>

      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
        <KPITile label="Monthly Income" value={formatCurrencyFull(profile.income.total)} color="var(--accent)" onClick={() => setModalMetric('income')} />
        <KPITile label="Monthly Expenses" value={formatCurrencyFull(profile.expenses.total + profile.debt.totalMinimumPayments)} color="var(--negative)" onClick={() => setModalMetric('expenses')} />
        <KPITile
          label="Cash Flow"
          value={(cashFlow >= 0 ? '+' : '') + formatCurrencyFull(cashFlow)}
          color={cashFlow >= 0 ? 'var(--accent)' : 'var(--negative)'}
          badge={<Badge variant={cashFlow >= 0 ? 'success' : 'danger'}>{cashFlow >= 0 ? 'Surplus' : 'Shortfall'}</Badge>}
          onClick={() => setModalMetric('cashflow')}
        />
        <KPITile
          label="Debt-to-Income"
          value={formatPercent(dti, 1)}
          color={`var(--${dtiInfo.color})`}
          badge={<Badge variant={dtiInfo.color === 'accent' ? 'success' : dtiInfo.color === 'risk' ? 'warning' : 'danger'}>{dtiInfo.label}</Badge>}
          onClick={() => setModalMetric('dti')}
        />
      </div>

      {/* Tabs */}
      <Tabs items={[{ id: 'overview', label: 'Overview' }, { id: 'debt', label: 'Debt' }, { id: 'savings', label: 'Savings' }, { id: 'projection', label: 'Projection' }]} activeTab={activeTab} onChange={setActiveTab} />

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <Card variant="default" padding="md">
            <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)', opacity: 0.7, marginBottom: '16px' }}>Monthly Cash Flow</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={cashFlowData} barSize={28}>
                <XAxis dataKey="name" tick={{ fill: 'var(--text)', opacity: 0.6, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <ReTooltip formatter={(v: unknown) => formatCurrencyFull(v as number)} contentStyle={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', fontSize: '0.875rem' }} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {cashFlowData.map((_entry, i) => (
                    <Cell key={i} fill={i === 0 ? 'var(--accent)' : 'var(--negative)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card variant="default" padding="md">
            <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)', opacity: 0.7, marginBottom: '16px' }}>Key Health Indicators</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text)', opacity: 0.7 }}>Savings Rate</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: `var(--${srInfo.color})` }}>{formatPercent(savingsRate, 1)}</span>
                    <Badge variant={srInfo.color === 'accent' ? 'success' : srInfo.color === 'risk' ? 'warning' : 'danger'} style={{ fontSize: '0.6875rem' }}>{srInfo.label}</Badge>
                  </div>
                </div>
                <ProgressBar value={savingsRate} max={30} color={srInfo.color} height={5} />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text)', opacity: 0.7 }}>Emergency Coverage</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: `var(--${covInfo.color})` }}>{coverage.toFixed(1)} mo</span>
                    <Badge variant={covInfo.color === 'accent' ? 'success' : covInfo.color === 'risk' ? 'warning' : 'danger'} style={{ fontSize: '0.6875rem' }}>{covInfo.label}</Badge>
                  </div>
                </div>
                <ProgressBar value={coverage} max={6} color={covInfo.color} height={5} />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text)', opacity: 0.7 }}>Debt-to-Income</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: `var(--${dtiInfo.color})` }}>{formatPercent(dti, 1)}</span>
                </div>
                <ProgressBar value={dti} max={50} color={dtiInfo.color} height={5} />
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Debt Tab */}
      {activeTab === 'debt' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <Card variant="default" padding="md">
            <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)', opacity: 0.7, marginBottom: '16px' }}>Debt Breakdown</h3>
            {profile.debt.hasNoDebt || profile.debt.entries.length === 0 ? (
              <p style={{ color: 'var(--accent)', fontSize: '0.9375rem' }}>No debt recorded — strong position.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {profile.debt.entries.map((d, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderRadius: '8px', backgroundColor: 'var(--surface)' }}>
                    <div>
                      <p style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text)', textTransform: 'capitalize' }}>{d.type.replace('-', ' ')}</p>
                      {d.interestRate && <p style={{ fontSize: '0.75rem', color: d.interestRate > 15 ? 'var(--negative)' : d.interestRate > 5 ? 'var(--risk)' : 'var(--text)', opacity: d.interestRate <= 5 ? 0.6 : 1 }}>{d.interestRate}% APR</p>}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontWeight: 600, color: 'var(--negative)' }}>{formatCurrencyFull(d.balance)}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text)', opacity: 0.55 }}>{formatCurrencyFull(d.minimumPayment)}/mo min</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
          <Card variant="default" padding="md">
            <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)', opacity: 0.7, marginBottom: '16px' }}>Debt Composition</h3>
            {debtPieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={debtPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={80} strokeWidth={0}>
                    {debtPieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <ReTooltip formatter={(v: unknown) => formatCurrencyFull(v as number)} contentStyle={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', fontSize: '0.875rem' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : <p style={{ color: 'var(--text)', opacity: 0.5 }}>No debt data to display.</p>}
          </Card>
        </div>
      )}

      {/* Savings Tab */}
      {activeTab === 'savings' && (
        <Card variant="default" padding="md">
          <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)', opacity: 0.7, marginBottom: '16px' }}>Savings Breakdown</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { label: 'Emergency Fund', value: profile.savings.emergency },
              { label: 'Other Savings', value: profile.savings.other },
              { label: 'Investments', value: profile.savings.investments },
              { label: 'Retirement', value: profile.savings.retirement },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderRadius: '8px', backgroundColor: 'var(--surface)' }}>
                <span style={{ fontSize: '0.9375rem', color: 'var(--text)' }}>{label}</span>
                <span style={{ fontWeight: 600, color: 'var(--accent)' }}>{formatCurrencyFull(value)}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Projection Tab */}
      {activeTab === 'projection' && (
        <Card variant="default" padding="md">
          <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)', opacity: 0.7, marginBottom: '4px' }}>12-Month Net Worth Projection</h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text)', opacity: 0.5, marginBottom: '16px' }}>Based on current income and spending with no changes</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={projectionData}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="4 4" />
              <XAxis dataKey="month" tick={{ fill: 'var(--text)', opacity: 0.5, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text)', opacity: 0.5, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => formatCurrencyFull(v)} />
              <ReTooltip formatter={(v: unknown) => formatCurrencyFull(v as number)} contentStyle={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', fontSize: '0.875rem' }} />
              <Line type="monotone" dataKey="netWorth" stroke={cashFlow >= 0 ? 'var(--accent)' : 'var(--negative)'} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Action Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <Card variant="outlined" padding="md" onClick={() => navigate('/simulate')} style={{ cursor: 'pointer', borderColor: 'color-mix(in srgb, var(--secondary) 30%, transparent)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <Zap size={18} color="var(--secondary)" />
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text)', margin: 0 }}>Run a Simulation</h3>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text)', opacity: 0.6, marginBottom: '14px' }}>
            Adjust income, expenses, or debt and see projected outcomes.
          </p>
          <Button variant="secondary" size="sm">Open Simulator</Button>
        </Card>
        <Card variant="outlined" padding="md" onClick={() => navigate('/game')} style={{ cursor: 'pointer', borderColor: 'color-mix(in srgb, var(--accent) 30%, transparent)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <Target size={18} color="var(--accent)" />
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text)', margin: 0 }}>Play the 12-Month Game</h3>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text)', opacity: 0.6, marginBottom: '14px' }}>
            Make real financial decisions and see what your choices produce.
          </p>
          <Button variant="primary" size="sm">Start Game</Button>
        </Card>
      </div>

      {/* Detail Modals */}
      <Modal isOpen={modalMetric === 'cashflow'} onClose={() => setModalMetric(null)} title="Monthly Cash Flow">
        <p style={{ fontSize: '0.9375rem', color: 'var(--text)', lineHeight: 1.6, marginBottom: '12px' }}>
          Cash flow is what remains after all expenses and minimum debt payments. It represents your actual financial capacity each month.
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', borderRadius: '8px', backgroundColor: 'var(--surface)', marginBottom: '8px' }}>
          <span style={{ color: 'var(--text)', opacity: 0.7 }}>Income</span>
          <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{formatCurrencyFull(profile.income.total)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', borderRadius: '8px', backgroundColor: 'var(--surface)', marginBottom: '8px' }}>
          <span style={{ color: 'var(--text)', opacity: 0.7 }}>Total expenses + debt payments</span>
          <span style={{ color: 'var(--negative)', fontWeight: 600 }}>-{formatCurrencyFull(profile.expenses.total + profile.debt.totalMinimumPayments)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px', borderRadius: '8px', backgroundColor: `color-mix(in srgb, ${cashFlow >= 0 ? 'var(--accent)' : 'var(--negative)'} 10%, transparent)`, border: `1px solid color-mix(in srgb, ${cashFlow >= 0 ? 'var(--accent)' : 'var(--negative)'} 25%, transparent)` }}>
          <span style={{ fontWeight: 600 }}>= Cash flow</span>
          <span style={{ fontWeight: 700, color: cashFlow >= 0 ? 'var(--accent)' : 'var(--negative)', fontSize: '1.125rem' }}>{(cashFlow >= 0 ? '+' : '')}{formatCurrencyFull(cashFlow)}</span>
        </div>
      </Modal>

      <Modal isOpen={modalMetric === 'dti'} onClose={() => setModalMetric(null)} title="Debt-to-Income Ratio">
        <p style={{ fontSize: '0.9375rem', color: 'var(--text)', lineHeight: 1.6 }}>
          DTI measures what percentage of your income goes toward minimum debt payments. Lenders use it to assess risk.
          Below 20% is considered healthy. Above 35% signals stress.
        </p>
        <p style={{ marginTop: '12px', fontSize: '1.25rem', fontWeight: 700, color: `var(--${dtiInfo.color})` }}>
          Your DTI: {formatPercent(dti, 1)} — {dtiInfo.label}
        </p>
      </Modal>
    </div>
  )
}

function KPITile({ label, value, color, badge, onClick }: { label: string; value: string; color: string; badge?: React.ReactNode; onClick?: () => void }) {
  return (
    <Card variant="default" padding="md" onClick={onClick} style={{ cursor: onClick ? 'pointer' : undefined }}>
      <p style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text)', opacity: 0.55, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>{label}</p>
      <p style={{ fontSize: '1.5rem', fontWeight: 700, color, letterSpacing: '-0.02em', marginBottom: badge ? '8px' : 0 }}>{value}</p>
      {badge}
    </Card>
  )
}
