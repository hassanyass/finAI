import { type CSSProperties, type ReactNode } from 'react'

export type CardVariant = 'default' | 'elevated' | 'outlined' | 'glass'
export type CardPadding = 'none' | 'sm' | 'md' | 'lg'

interface CardProps {
  variant?: CardVariant
  padding?: CardPadding
  children: ReactNode
  onClick?: () => void
  style?: CSSProperties
}

const variantStyles: Record<CardVariant, CSSProperties> = {
  default: {
    backgroundColor: 'var(--surface)',
    border: '1px solid var(--border)',
    boxShadow: 'var(--shadow-sm)',
  },
  elevated: {
    backgroundColor: 'var(--surface)',
    border: '1px solid var(--border)',
    boxShadow: 'var(--shadow)',
  },
  outlined: {
    backgroundColor: 'transparent',
    border: '1px solid var(--border)',
    boxShadow: 'none',
  },
  glass: {
    backgroundColor: 'color-mix(in srgb, var(--background) 80%, transparent)',
    border: '1px solid var(--border)',
    boxShadow: 'var(--shadow-sm)',
    backdropFilter: 'blur(8px)',
  },
}

const paddingStyles: Record<CardPadding, CSSProperties> = {
  none: { padding: 0 },
  sm: { padding: '12px' },
  md: { padding: '20px' },
  lg: { padding: '28px' },
}

export function Card({
  variant = 'default',
  padding = 'md',
  children,
  onClick,
  style,
}: CardProps) {
  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      style={{
        borderRadius: '10px',
        ...variantStyles[variant],
        ...paddingStyles[padding],
        cursor: onClick ? 'pointer' : undefined,
        transition: 'box-shadow 0.15s ease',
        ...style,
      }}
      onMouseEnter={e => {
        if (onClick) (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-md)'
      }}
      onMouseLeave={e => {
        if (onClick) (e.currentTarget as HTMLDivElement).style.boxShadow = variantStyles[variant].boxShadow as string
      }}
    >
      {children}
    </div>
  )
}
