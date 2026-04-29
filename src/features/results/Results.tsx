import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameStore } from '../../store/gameStore'
import { useFinancialProfileStore } from '../../store/financialProfileStore'
import { Card, Badge, Button, Tabs } from '../../components'
import {
  generateResultsHeadline, generateInsights, generateSuggestedAction
} from '../../lib/scoreEngine'
import { formatCurrencyFull } from '../../lib/financialCalc'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip, ResponsiveContainer, Legend, BarChart, Bar, Cell
} from 'recharts'
import { Award, TrendingUp, TrendingDown, Minus } from 'lucide-react'

export function Results() {
  const navigate = useNavigate()
  const store = useGameStore()
  const profile = useFinancialProfileStore(s => s.profile)
  const [activeTab, setActiveTab] = useState('overview')

  if (!store.isComplete || store.monthStates.length === 0) {
    navigate('/game')
    return null
  }

  const startState = store.startingState!
  const final = store.monthStates[store.monthStates.length - 1]
  const headline = generateResultsHeadline(store.score, final, startState)
  const insights = generateInsights(store.monthStates, startState, profile)
  const suggestedAction = generateSuggestedAction(store.monthStates, profile)

  const netWorthChange = (final.savingsBalance + final.investmentBalance - final.debtBalance)
                       - (startState.savingsBalance + startState.investmentBalance - startState.debtBalance)
  const debtReduction = startState.debtBalance - final.debtBalance
  const savingsGrowth = final.savingsBalance - startState.savingsBalance

  // Journey chart data
  const journeyData = store.monthStates.map((s, i) => ({
    month: `M${i + 1}`,
    netWorth: Math.round(s.savingsBalance + s.investmentBalance - s.debtBalance),
    savings: s.savingsBalance,
    debt: s.debtBalance,
    score: s.monthScore,
  }))

  const scoreColor = store.score >= 80 ? 'var(--accent)' : store.score >= 60 ? 'var(--secondary)' : store.score >= 40 ? 'var(--risk)' : 'var(--negative)'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text)', opacity: 0.5, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
            12-Month Simulation Complete
          </p>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em' }}>
            Your Results
          </h1>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button variant="ghost" size="sm" onClick={() => navigate('/coach')}>Talk to Coach</Button>
          <Button variant="primary" size="sm" onClick={() => { store.clearGame(); navigate('/game') }}>Play Again</Button>
        </div>
      </div>

      {/* Score Hero */}
      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '28px', alignItems: 'center' }}>
        <div style={{ textAlign: 'center', padding: '24px 32px', borderRadius: '12px', backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text)', opacity: 0.55, marginBottom: '4px' }}>Final Score</p>
          <p style={{ fontSize: '4rem', fontWeight: 700, color: scoreColor, letterSpacing: '-0.04em', lineHeight: 1 }}>{store.score}</p>
          <p style={{ fontSize: '0.875rem', color: 'var(--text)', opacity: 0.5, marginTop: '4px' }}>out of 100</p>
        </div>
        <div>
          <p style={{ fontSize: '1.0625rem', color: 'var(--text)', lineHeight: 1.7, marginBottom: '14px' }}>{headline}</p>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <MetricChip label="Net Worth" value={(netWorthChange >= 0 ? '+' : '') + formatCurrencyFull(netWorthChange)} positive={netWorthChange >= 0} />
            {debtReduction > 0 && <MetricChip label="Debt Reduced" value={formatCurrencyFull(debtReduction)} positive />}
            {savingsGrowth > 0 && <MetricChip label="Savings Growth" value={formatCurrencyFull(savingsGrowth)} positive />}
            {store.badges.length > 0 && <MetricChip label="Badges Earned" value={`${store.badges.length}`} positive />}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        items={[{ id: 'overview', label: 'Overview' }, { id: 'journey', label: 'Journey' }, { id: 'badges', label: `Badges (${store.badges.length})` }, { id: 'insights', label: 'Insights' }]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* Overview */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
            {[
              { label: 'Starting Savings', value: formatCurrencyFull(startState.savingsBalance), color: 'var(--text)' },
              { label: 'Final Savings', value: formatCurrencyFull(final.savingsBalance), color: final.savingsBalance > startState.savingsBalance ? 'var(--accent)' : 'var(--negative)' },
              { label: 'Starting Debt', value: formatCurrencyFull(startState.debtBalance), color: 'var(--text)' },
              { label: 'Final Debt', value: formatCurrencyFull(final.debtBalance), color: final.debtBalance < startState.debtBalance ? 'var(--accent)' : 'var(--negative)' },
            ].map(t => (
              <Card key={t.label} variant="default" padding="md">
                <p style={{ fontSize: '0.75rem', color: 'var(--text)', opacity: 0.55, marginBottom: '6px' }}>{t.label}</p>
                <p style={{ fontSize: '1.375rem', fontWeight: 700, color: t.color }}>{t.value}</p>
              </Card>
            ))}
          </div>

          <Card variant="default" padding="md">
            <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)', opacity: 0.7, marginBottom: '16px' }}>Monthly Score Trend</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={journeyData} barSize={22}>
                <XAxis dataKey="month" tick={{ fill: 'var(--text)', opacity: 0.5, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: 'var(--text)', opacity: 0.5, fontSize: 11 }} axisLine={false} tickLine={false} />
                <ReTooltip contentStyle={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', fontSize: '0.875rem' }} />
                <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                  {journeyData.map((entry, i) => (
                    <Cell key={i} fill={entry.score >= 70 ? 'var(--accent)' : entry.score >= 40 ? 'var(--risk)' : 'var(--negative)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Suggested Action */}
          <Card variant="outlined" padding="md" style={{ borderColor: 'color-mix(in srgb, var(--primary) 30%, transparent)' }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>Suggested Next Action</p>
            <p style={{ fontSize: '0.9375rem', color: 'var(--text)', lineHeight: 1.6, marginBottom: '14px' }}>{suggestedAction}</p>
            <Button variant="ghost" size="sm" onClick={() => navigate('/simulate')}>Try in Simulator</Button>
          </Card>
        </div>
      )}

      {/* Journey */}
      {activeTab === 'journey' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Card variant="default" padding="md">
            <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)', opacity: 0.7, marginBottom: '16px' }}>Net Worth Progression</h3>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={journeyData}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="4 4" />
                <XAxis dataKey="month" tick={{ fill: 'var(--text)', opacity: 0.5, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text)', opacity: 0.5, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => formatCurrencyFull(v)} />
                <ReTooltip formatter={(v: unknown, name: unknown) => [formatCurrencyFull(v as number), name === 'netWorth' ? 'Net Worth' : name === 'savings' ? 'Savings' : 'Debt']} contentStyle={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', fontSize: '0.875rem' }} />
                <Legend wrapperStyle={{ fontSize: '0.8125rem', color: 'var(--text)', opacity: 0.7 }} />
                <Line type="monotone" dataKey="netWorth" stroke="var(--primary)" strokeWidth={2} dot={false} name="Net Worth" />
                <Line type="monotone" dataKey="savings" stroke="var(--accent)" strokeWidth={1.5} strokeDasharray="4 3" dot={false} name="Savings" />
                <Line type="monotone" dataKey="debt" stroke="var(--negative)" strokeWidth={1.5} strokeDasharray="4 3" dot={false} name="Debt" />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Month-by-month */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {store.monthStates.map((s, i) => {
              const prev = i === 0 ? startState : store.monthStates[i - 1]
              const nwDelta = (s.savingsBalance + s.investmentBalance - s.debtBalance) - (prev.savingsBalance + prev.investmentBalance - prev.debtBalance)
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', padding: '10px 14px', borderRadius: '8px', backgroundColor: 'var(--surface)', gap: '16px' }}>
                  <div style={{ width: '60px', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text)', opacity: 0.6 }}>M{i + 1}</div>
                  <div style={{ flex: 1, display: 'flex', gap: '20px' }}>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text)', opacity: 0.7 }}>Savings: <strong style={{ color: 'var(--accent)' }}>{formatCurrencyFull(s.savingsBalance)}</strong></span>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text)', opacity: 0.7 }}>Debt: <strong style={{ color: s.debtBalance > 0 ? 'var(--negative)' : 'var(--accent)' }}>{formatCurrencyFull(s.debtBalance)}</strong></span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {nwDelta > 0 ? <TrendingUp size={14} color="var(--accent)" /> : nwDelta < 0 ? <TrendingDown size={14} color="var(--negative)" /> : <Minus size={14} color="var(--text)" />}
                    <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: nwDelta > 0 ? 'var(--accent)' : nwDelta < 0 ? 'var(--negative)' : 'var(--text)' }}>
                      {(nwDelta >= 0 ? '+' : '')}{formatCurrencyFull(nwDelta)}
                    </span>
                  </div>
                  <div style={{ width: '60px', textAlign: 'right' }}>
                    <Badge variant={s.monthScore >= 70 ? 'success' : s.monthScore >= 40 ? 'warning' : 'danger'} style={{ fontSize: '0.6875rem' }}>{s.monthScore}</Badge>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Badges */}
      {activeTab === 'badges' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px' }}>
          {store.badges.map((b, i) => (
            <Card key={i} variant="default" padding="md" style={{ borderLeft: '3px solid var(--accent)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <Award size={18} color="var(--accent)" />
                <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text)' }}>{b.badge.label}</h3>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text)', opacity: 0.65, lineHeight: 1.5, marginBottom: '8px' }}>{b.badge.description}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text)', opacity: 0.45 }}>Earned in Month {b.earnedInMonth}</p>
            </Card>
          ))}
          {store.badges.length === 0 && (
            <p style={{ color: 'var(--text)', opacity: 0.6, fontSize: '0.9375rem', gridColumn: '1 / -1' }}>
              No badges earned this run. Check the game decisions — several are available through consistent positive choices.
            </p>
          )}
        </div>
      )}

      {/* Insights */}
      {activeTab === 'insights' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {insights.map((insight, i) => (
            <Card key={i} variant="default" padding="md" style={{ borderLeft: `3px solid var(--${insight.borderColor})` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.6875rem', fontWeight: 600, padding: '2px 8px', borderRadius: '4px', backgroundColor: `color-mix(in srgb, var(--${insight.borderColor}) 12%, transparent)`, color: `var(--${insight.borderColor})` }}>
                  {insight.concept}
                </span>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text)', opacity: 0.75, lineHeight: 1.5, marginBottom: '8px' }}>
                <strong style={{ color: 'var(--text)' }}>In the game:</strong> {insight.gameFact}
              </p>
              <p style={{ fontSize: '0.9rem', color: 'var(--text)', lineHeight: 1.65 }}>
                <strong style={{ color: `var(--${insight.borderColor})` }}>Why it matters:</strong> {insight.realWorldMeaning}
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

function MetricChip({ label, value, positive }: { label: string; value: string; positive: boolean }) {
  return (
    <div style={{ padding: '5px 12px', borderRadius: '8px', backgroundColor: `color-mix(in srgb, ${positive ? 'var(--accent)' : 'var(--negative)'} 10%, transparent)`, border: `1px solid color-mix(in srgb, ${positive ? 'var(--accent)' : 'var(--negative)'} 25%, transparent)` }}>
      <p style={{ fontSize: '0.6875rem', color: 'var(--text)', opacity: 0.55, marginBottom: '1px' }}>{label}</p>
      <p style={{ fontSize: '0.875rem', fontWeight: 700, color: positive ? 'var(--accent)' : 'var(--negative)' }}>{value}</p>
    </div>
  )
}
