import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button, Card, Input } from '../components'
import { ArrowRight } from 'lucide-react'
import { useFinancialProfileStore } from '../store/financialProfileStore'

export function AuthPage() {
  const navigate = useNavigate()
  const setProfile = useFinancialProfileStore(s => s.setProfile)
  const [searchParams] = useSearchParams()
  const initialMode = searchParams.get('mode') === 'login' ? 'login' : 'signup'
  const [mode, setMode] = useState<'signup' | 'login'>(initialMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const isSignup = mode === 'signup'

  async function handleSubmit(e: React.FormEvent) {
  e.preventDefault()

  const endpoint = isSignup ? '/auth/register' : '/auth/login'

  const response = await fetch(`http://localhost:4000${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  })

  const data = await response.json()

  if (!response.ok) {
    alert(data.error || 'Something went wrong')
    return
  }

  const userData = {
  id: data.user.id,
  email: data.user.email,
  token: data.token,
  loggedInAt: new Date().toISOString(),
}

localStorage.setItem('user', JSON.stringify(userData))

// 👇 نجيب آخر profile
const res = await fetch(`http://localhost:4000/profiles/me`, {
  headers: {
    Authorization: `Bearer ${userData.token}`,
  },
})
const profileData = await res.json()

if (profileData.profile) {
  setProfile(profileData.profile.data)
  navigate('/dashboard')
} else {
  navigate('/onboarding')
}

window.location.reload()
}

  return (
    <div style={{ maxWidth: '460px', margin: '0 auto', paddingTop: '48px' }}>
      <Card variant="default" padding="lg">
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            display: 'inline-flex',
            padding: '6px 14px',
            borderRadius: '999px',
            backgroundColor: 'color-mix(in srgb, var(--primary) 10%, transparent)',
            border: '1px solid color-mix(in srgb, var(--primary) 25%, transparent)',
            color: 'var(--primary)',
            fontSize: '0.8125rem',
            fontWeight: 600,
            marginBottom: '14px',
          }}>
            FinSight AI
          </div>

          <h1 style={{
            fontSize: '1.75rem',
            fontWeight: 800,
            color: 'var(--text)',
            letterSpacing: '-0.03em',
            marginBottom: '8px',
          }}>
            {isSignup ? 'Create your account' : 'Welcome back'}
          </h1>

          <p style={{
            fontSize: '0.9375rem',
            color: 'var(--text)',
            opacity: 0.6,
            lineHeight: 1.6,
          }}>
            {isSignup
              ? 'Save your financial profile and unlock AI-powered coaching.'
              : 'Login to continue your financial journey.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Enter your password"
          />

          <Button
            variant="primary"
            size="lg"
            type="submit"
            disabled={!email || !password}
          >
            {isSignup ? 'Sign up' : 'Login'} <ArrowRight size={16} />
          </Button>
        </form>

        <div style={{
          marginTop: '22px',
          textAlign: 'center',
          fontSize: '0.875rem',
          color: 'var(--text)',
          opacity: 0.7,
        }}>
          {isSignup ? 'Already have an account?' : "Don’t have an account?"}{' '}
          <button
            type="button"
            onClick={() => setMode(isSignup ? 'login' : 'signup')}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--primary)',
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'Inter',
            }}
          >
            {isSignup ? 'Login' : 'Sign up'}
          </button>
        </div>
      </Card>
    </div>
  )
}