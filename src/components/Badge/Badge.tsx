import { type CSSProperties, type ReactNode } from 'react'

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'risk'

interface BadgeProps {
  variant?: BadgeVariant
  children: ReactNode
  style?: CSSProperties
}

const variantStyles: Record<BadgeVariant, CSSProperties> = {
  success: {
    backgroundColor: 'color-mix(in srgb, var(--accent) 12%, transparent)',
    color: 'var(--accent)',
    border: '1px solid color-mix(in srgb, var(--accent) 25%, transparent)',
  },
  warning: {
    backgroundColor: 'color-mix(in srgb, var(--risk) 12%, transparent)',
    color: 'var(--risk)',
    border: '1px solid color-mix(in srgb, var(--risk) 25%, transparent)',
  },
  danger: {
    backgroundColor: 'color-mix(in srgb, var(--negative) 12%, transparent)',
    color: 'var(--negative)',
    border: '1px solid color-mix(in srgb, var(--negative) 25%, transparent)',
  },
  info: {
    backgroundColor: 'color-mix(in srgb, var(--secondary) 12%, transparent)',
    color: 'var(--secondary)',
    border: '1px solid color-mix(in srgb, var(--secondary) 25%, transparent)',
  },
  neutral: {
    backgroundColor: 'var(--surface)',
    color: 'var(--text)',
    border: '1px solid var(--border)',
    opacity: 0.7,
  },
  risk: {
    backgroundColor: 'color-mix(in srgb, var(--risk) 12%, transparent)',
    color: 'var(--risk)',
    border: '1px solid color-mix(in srgb, var(--risk) 25%, transparent)',
  },
}

export function Badge({ variant = 'neutral', children, style }: BadgeProps) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 8px',
        borderRadius: '6px',
        fontSize: '0.75rem',
        fontWeight: 500,
        letterSpacing: '0.01em',
        whiteSpace: 'nowrap',
        ...variantStyles[variant],
        ...style,
      }}
    >
      {children}
    </span>
  )
}
