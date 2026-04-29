import { type CSSProperties, type ReactNode } from 'react'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  disabled?: boolean
  onClick?: () => void
  children: ReactNode
  type?: 'button' | 'submit' | 'reset'
  fullWidth?: boolean
  style?: CSSProperties
}

const variantStyles: Record<ButtonVariant, CSSProperties> = {
  primary: {
    backgroundColor: 'var(--primary)',
    color: 'var(--background)',
    border: '1px solid transparent',
  },
  secondary: {
    backgroundColor: 'color-mix(in srgb, var(--secondary) 12%, transparent)',
    color: 'var(--secondary)',
    border: '1px solid color-mix(in srgb, var(--secondary) 30%, transparent)',
  },
  ghost: {
    backgroundColor: 'transparent',
    color: 'var(--primary)',
    border: '1px solid color-mix(in srgb, var(--primary) 20%, transparent)',
  },
  danger: {
    backgroundColor: 'color-mix(in srgb, var(--negative) 10%, transparent)',
    color: 'var(--negative)',
    border: '1px solid color-mix(in srgb, var(--negative) 30%, transparent)',
  },
}

const sizeStyles: Record<ButtonSize, CSSProperties> = {
  sm: { padding: '5px 10px', fontSize: '0.8125rem', borderRadius: '6px', gap: '5px' },
  md: { padding: '8px 16px', fontSize: '0.875rem', borderRadius: '7px', gap: '6px' },
  lg: { padding: '11px 22px', fontSize: '0.9375rem', borderRadius: '8px', gap: '7px' },
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  onClick,
  children,
  type = 'button',
  fullWidth = false,
  style,
}: ButtonProps) {
  const isDisabled = disabled || loading

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Inter', system-ui, sans-serif",
        fontWeight: 500,
        letterSpacing: '-0.01em',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled ? 0.5 : 1,
        transition: 'opacity 0.15s ease, background-color 0.15s ease',
        width: fullWidth ? '100%' : undefined,
        ...variantStyles[variant],
        ...sizeStyles[size],
        ...style,
      }}
      onMouseEnter={e => {
        if (!isDisabled) (e.currentTarget as HTMLButtonElement).style.opacity = '0.85'
      }}
      onMouseLeave={e => {
        if (!isDisabled) (e.currentTarget as HTMLButtonElement).style.opacity = '1'
      }}
    >
      {loading ? (
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <LoadingDots />
          {children}
        </span>
      ) : children}
    </button>
  )
}

function LoadingDots() {
  return (
    <span style={{ display: 'inline-flex', gap: '3px', alignItems: 'center' }}>
      {[0, 1, 2].map(i => (
        <span
          key={i}
          style={{
            width: '4px',
            height: '4px',
            borderRadius: '50%',
            backgroundColor: 'currentColor',
            opacity: 0.7,
            animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
          }}
        />
      ))}
    </span>
  )
}
