import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../../hooks/useTheme'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '32px',
        height: '32px',
        borderRadius: '6px',
        color: 'var(--primary)',
        border: '1px solid rgba(var(--primary), 0.2)',
        background: 'transparent',
        cursor: 'pointer',
        transition: 'background-color 0.15s ease',
        flexShrink: 0,
      }}
      className="theme-toggle-btn"
    >
      {theme === 'light'
        ? <Moon size={15} strokeWidth={1.75} />
        : <Sun  size={15} strokeWidth={1.75} />
      }
    </button>
  )
}
