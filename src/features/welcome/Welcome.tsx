import { useNavigate } from 'react-router-dom'
import { useFinancialProfileStore } from '../../store/financialProfileStore'
import { Button, Card } from '../../components'
import { TrendingUp, Shield, Gamepad2, Bot, ArrowRight } from 'lucide-react'

const FEATURES = [
  {
    icon: <TrendingUp size={20} />,
    color: 'var(--accent)',
    title: 'Your Financial Dashboard',
    description: 'See your cash flow, net worth, debt-to-income ratio, and savings rate in one view — built from your actual numbers.',
  },
  {
    icon: <Shield size={20} />,
    color: 'var(--primary)',
    title: 'What-If Simulator',
    description: 'Adjust income, cut expenses, or accelerate debt payments and see exactly how your net worth responds over 12 months.',
  },
  {
    icon: <Gamepad2 size={20} />,
    color: 'var(--secondary)',
    title: '12-Month Decision Game',
    description: 'Make real financial decisions across a full year. Every month introduces new scenarios — and each choice compounds.',
  },
  {
    icon: <Bot size={20} />,
    color: 'var(--risk)',
    title: 'AI Financial Coach',
    description: 'Ask anything about your situation. The coach uses your profile and game results to give specific, grounded guidance.',
  },
]

export function Welcome() {
  const navigate = useNavigate()
  const profile = useFinancialProfileStore(s => s.profile)

  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '56px', paddingTop: '32px', paddingBottom: '64px' }}>
      {/* Hero */}
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 14px', borderRadius: '20px', backgroundColor: 'color-mix(in srgb, var(--primary) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--primary) 25%, transparent)', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--primary)', marginBottom: '8px' }}>
          FinSight AI — Financial Literacy Platform
        </div>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.25rem)', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.04em', lineHeight: 1.1, maxWidth: '640px' }}>
          Understand your money
          <span style={{ color: 'var(--primary)' }}> by making real decisions.</span>
        </h1>
        <p style={{ fontSize: '1.0625rem', color: 'var(--text)', opacity: 0.62, lineHeight: 1.7, maxWidth: '500px' }}>
          Input your real financial situation. Simulate what-if scenarios.
          Play a 12-month decision game. Learn why your choices compound.
        </p>
        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
          {profile ? (
            <>
              <Button variant="primary" size="lg" onClick={() => navigate('/dashboard')}>
                Open Dashboard <ArrowRight size={16} />
              </Button>
              <Button variant="ghost" size="lg" onClick={() => navigate('/game')}>
                Play the Game
              </Button>
            </>
          ) : (
            <Button variant="primary" size="lg" onClick={() => navigate('/onboarding')}>
              Get Started — Free <ArrowRight size={16} />
            </Button>
          )}
        </div>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text)', opacity: 0.4 }}>
          No account required. All data stays on your device.
        </p>
      </div>

      {/* Feature Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
        {FEATURES.map((f, i) => (
          <Card key={i} variant="default" padding="md">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                backgroundColor: `color-mix(in srgb, ${f.color} 12%, transparent)`,
                color: f.color,
              }}>
                {f.icon}
              </div>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text)', margin: 0 }}>{f.title}</h3>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text)', opacity: 0.65, lineHeight: 1.6 }}>{f.description}</p>
          </Card>
        ))}
      </div>

      {/* How it works */}
      <div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)', marginBottom: '20px', letterSpacing: '-0.02em' }}>How it works</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {[
            { n: 1, title: 'Enter your real numbers', desc: 'Income, expenses, debt, savings. Takes 5 minutes. Rough estimates work.' },
            { n: 2, title: 'See your financial position', desc: 'Your dashboard shows cash flow, net worth, and where you stand against key benchmarks.' },
            { n: 3, title: 'Simulate and explore', desc: 'What if you cut dining by 40%? What if you paid $300 extra on debt? The simulator answers instantly.' },
            { n: 4, title: 'Play the 12-month game', desc: 'Make financial decisions across a full simulated year. Each choice has consequences that compound.' },
            { n: 5, title: 'Understand the results', desc: 'Your game score, badges, and insights map to real financial principles. The coach explains what it all means.' },
          ].map((step, i, arr) => (
            <div key={step.n} style={{ display: 'flex', gap: '16px', paddingBottom: i < arr.length - 1 ? '20px' : 0, position: 'relative' }}>
              {i < arr.length - 1 && (
                <div style={{ position: 'absolute', left: '15px', top: '32px', bottom: 0, width: '1px', backgroundColor: 'var(--border)' }} />
              )}
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'var(--background)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', fontWeight: 700, flexShrink: 0, zIndex: 1 }}>
                {step.n}
              </div>
              <div style={{ paddingBottom: '4px' }}>
                <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text)', marginBottom: '3px' }}>{step.title}</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text)', opacity: 0.62, lineHeight: 1.55 }}>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ textAlign: 'center', padding: '40px 32px', borderRadius: '14px', border: '1px solid var(--border)', backgroundColor: 'var(--surface)' }}>
        <h2 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--text)', marginBottom: '10px' }}>
          {profile ? 'Continue where you left off.' : 'Ready to understand your money?'}
        </h2>
        <p style={{ fontSize: '0.9375rem', color: 'var(--text)', opacity: 0.6, marginBottom: '20px' }}>
          {profile ? 'Your profile is saved. Pick up from your dashboard, simulator, or game.' : 'Takes 5 minutes. No account. No payment. Just your numbers.'}
        </p>
        {profile ? (
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <Button variant="primary" onClick={() => navigate('/dashboard')}>Dashboard</Button>
            <Button variant="ghost" onClick={() => navigate('/game')}>Play Game</Button>
            <Button variant="ghost" onClick={() => navigate('/coach')}>Coach</Button>
          </div>
        ) : (
          <Button variant="primary" size="lg" onClick={() => navigate('/onboarding')}>
            Build My Profile <ArrowRight size={16} />
          </Button>
        )}
      </div>
    </div>
  )
}
