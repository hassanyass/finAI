import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { ThemeToggle } from '../components/ThemeToggle/ThemeToggle'
import { ToastProvider } from '../components'
import { useFinancialProfileStore } from '../store/financialProfileStore'
import { LogIn, UserPlus, Home, ChevronLeft } from 'lucide-react'

const NAV_LINKS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/simulate',  label: 'Simulate'  },
  { to: '/game',      label: 'Play'      },
  { to: '/coach',     label: 'Coach'     },
]

export function AppLayout() {
  const location  = useLocation()
  const navigate  = useNavigate()
  const profile   = useFinancialProfileStore(s => s.profile)
  const clearProfile = useFinancialProfileStore(s => s.clearProfile)
  const isGameActive   = location.pathname === '/game'
  const isHome         = location.pathname === '/'
  const showBackButton = !isHome && location.pathname !== '/game'

  return (
    <ToastProvider>
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--background)', color: 'var(--text)', fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ── Top Nav ── */}
      {!isGameActive && (
        <header style={{ position: 'sticky', top: 0, zIndex: 50, backgroundColor: 'var(--background)', borderBottom: '1px solid var(--border)' }}>
          <nav style={{ maxWidth: '1152px', margin: '0 auto', padding: '0 20px', height: '58px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>

            {/* Left: back + wordmark */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {showBackButton && (
                <button
                  onClick={() => navigate(-1)}
                  aria-label="Go back"
                  style={{ display: 'flex', alignItems: 'center', padding: '6px', borderRadius: '8px', border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', color: 'var(--text)', opacity: 0.6, transition: 'opacity 0.15s' }}
                  onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.opacity = '1')}
                  onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.opacity = '0.6')}
                >
                  <ChevronLeft size={16} />
                </button>
              )}

              {/* Logo + wordmark */}
              <NavLink to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
                <img
                  src="/logo.png"
                  alt="FinSight AI logo"
                  style={{ height: '38px', width: 'auto', objectFit: 'contain' }}
                  onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                />
                <span style={{ fontWeight: 800, fontSize: '1.0625rem', letterSpacing: '-0.02em', color: 'var(--secondary)', whiteSpace: 'nowrap' }}>
                  FinSight<span style={{ color: 'var(--primary)' }}> AI</span>
                </span>
              </NavLink>
            </div>

            {/* Center: nav links — hidden on small screens */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '2px', flex: 1, justifyContent: 'center' }}>
              {profile && NAV_LINKS.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  style={({ isActive }) => ({
                    padding: '7px 13px',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    borderRadius: '8px',
                    textDecoration: 'none',
                    color: isActive ? 'var(--secondary)' : 'var(--text)',
                    opacity: isActive ? 1 : 0.55,
                    backgroundColor: isActive ? 'color-mix(in srgb, var(--primary) 10%, transparent)' : 'transparent',
                    borderBottom: isActive ? '2px solid var(--primary)' : '2px solid transparent',
                    transition: 'all 0.15s',
                  })}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLAnchorElement
                    if (el.getAttribute('aria-current') !== 'page') { el.style.opacity = '0.85' }
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLAnchorElement
                    if (el.getAttribute('aria-current') !== 'page') { el.style.opacity = '0.55' }
                  }}
                >
                  {label}
                </NavLink>
              ))}
              {!profile && (
                <NavLink to="/" style={({ isActive }) => ({ padding: '7px 13px', fontSize: '0.875rem', fontWeight: 600, borderRadius: '8px', textDecoration: 'none', color: isActive ? 'var(--secondary)' : 'var(--text)', opacity: isActive ? 1 : 0.55, display: 'flex', alignItems: 'center', gap: '5px' })}>
                  <Home size={14} /> Home
                </NavLink>
              )}
            </div>

            {/* Right: auth + theme */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ThemeToggle />

              {/* Auth buttons */}
              <button
                onClick={() => {/* sign-in modal placeholder */}}
                style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', color: 'var(--text)', opacity: 0.7, fontSize: '0.8125rem', fontWeight: 600, fontFamily: 'Inter', transition: 'all 0.15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--primary)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.7'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)' }}
              >
                <LogIn size={14} /> Sign In
              </button>

              <button
                onClick={() => {/* sign-up modal placeholder */}}
                style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 12px', borderRadius: '8px', border: '2px solid var(--primary)', background: 'var(--primary)', cursor: 'pointer', color: 'var(--background)', fontSize: '0.8125rem', fontWeight: 700, fontFamily: 'Inter', transition: 'all 0.15s', boxShadow: '0 2px 0 color-mix(in srgb, var(--primary) 40%, transparent)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.85' }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1' }}
              >
                <UserPlus size={14} /> Sign Up
              </button>

              {/* Profile reset (dev helper) */}
              {profile && (
                <button
                  onClick={() => { clearProfile(); navigate('/') }}
                  title="Reset profile"
                  style={{ padding: '7px 10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', color: 'var(--text)', opacity: 0.4, fontSize: '0.75rem', fontFamily: 'Inter', transition: 'opacity 0.15s' }}
                  onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.opacity = '1')}
                  onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.opacity = '0.4')}
                >
                  Reset
                </button>
              )}
            </div>
          </nav>
        </header>
      )}

      {/* ── Main ── */}
      <main style={{ maxWidth: isGameActive ? '100%' : '1152px', margin: '0 auto', padding: isGameActive ? '0' : '32px 20px' }}>
        <Outlet />
      </main>
    </div>
    </ToastProvider>
  )
}
