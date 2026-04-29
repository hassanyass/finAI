import { type CSSProperties } from 'react'

type ProgressColor = 'accent' | 'negative' | 'risk' | 'secondary' | 'primary'

interface ProgressBarProps {
  value: number
  max?: number
  color?: ProgressColor
  label?: string
  showPercent?: boolean
  height?: number
  style?: CSSProperties
}

const colorMap: Record<ProgressColor, string> = {
  accent:   'var(--accent)',
  negative: 'var(--negative)',
  risk:     'var(--risk)',
  secondary:'var(--secondary)',
  primary:  'var(--primary)',
}

export function ProgressBar({
  value,
  max = 100,
  color = 'accent',
  label,
  showPercent = false,
  height = 6,
  style,
}: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  const fillColor = colorMap[color]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', ...style }}>
      {(label || showPercent) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {label && (
            <span style={{ fontSize: '0.8125rem', color: 'var(--text)', opacity: 0.7, fontWeight: 500 }}>
              {label}
            </span>
          )}
          {showPercent && (
            <span style={{ fontSize: '0.8125rem', color: fillColor, fontWeight: 600 }}>
              {Math.round(pct)}%
            </span>
          )}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label}
        style={{
          width: '100%',
          height: `${height}px`,
          backgroundColor: 'var(--surface-md)',
          borderRadius: '999px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${pct}%`,
            backgroundColor: fillColor,
            borderRadius: '999px',
            transition: 'width 0.4s ease',
          }}
        />
      </div>
    </div>
  )
}
