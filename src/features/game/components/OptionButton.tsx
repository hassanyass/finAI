import { useState, type CSSProperties } from 'react'
import { Check } from 'lucide-react'
import type { DecisionOption, ImpactColor } from '../../../types/game'

export type OptionStatus = 'idle' | 'selected' | 'dimmed'

interface OptionButtonProps {
  option: DecisionOption
  status: OptionStatus
  index: number
  onSelect: (optionId: string) => void
}

const PALETTE: Record<ImpactColor, { border: string; shadow: string; activeBg: string; activeText: string; activeBorder: string }> = {
  accent:   { border: 'var(--border)',  shadow: 'var(--border)',   activeBg: 'color-mix(in srgb, var(--accent) 8%, var(--background))',    activeText: 'var(--accent)',    activeBorder: 'var(--accent)'    },
  negative: { border: 'var(--border)',  shadow: 'var(--border)',   activeBg: 'color-mix(in srgb, var(--negative) 8%, var(--background))',  activeText: 'var(--negative)',  activeBorder: 'var(--negative)'  },
  risk:     { border: 'var(--border)',  shadow: 'var(--border)',   activeBg: 'color-mix(in srgb, var(--risk) 8%, var(--background))',      activeText: 'var(--risk)',      activeBorder: 'var(--risk)'      },
  neutral:  { border: 'var(--border)',  shadow: 'var(--border)',   activeBg: 'color-mix(in srgb, var(--secondary) 8%, var(--background))', activeText: 'var(--secondary)', activeBorder: 'var(--secondary)' },
}

const LABELS = ['A', 'B', 'C']

export function OptionButton({ option, status, index, onSelect }: OptionButtonProps) {
  const [pressed, setPressed] = useState(false)
  const [hovered, setHovered] = useState(false)
  const p = PALETTE[option.impactColor]

  const isIdle     = status === 'idle'
  const isSelected = status === 'selected'
  const isDimmed   = status === 'dimmed'

  const borderColor = isSelected ? p.activeBorder : 'var(--border)'
  const bgColor     = isSelected ? p.activeBg : isDimmed ? 'var(--surface)' : 'var(--background)'
  const shadowDepth = (isSelected || isDimmed || pressed) ? '0px' : hovered ? '6px' : '4px'
  const shadowColor = isSelected ? `color-mix(in srgb, ${p.activeBorder} 30%, transparent)` : 'var(--border)'
  const translateY  = pressed ? '4px' : hovered && isIdle ? '-2px' : isSelected ? '1px' : '0px'

  const style: CSSProperties = {
    width: '100%',
    padding: '18px 16px',
    borderRadius: '16px',
    border: `2px solid ${borderColor}`,
    boxShadow: `0 ${shadowDepth} 0 ${shadowColor}`,
    transform: `translateY(${translateY})`,
    backgroundColor: bgColor,
    opacity: isDimmed ? 0.38 : 1,
    cursor: isIdle ? 'pointer' : 'default',
    textAlign: 'left',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    transition: 'transform 0.1s, box-shadow 0.1s, opacity 0.22s, border-color 0.15s, background-color 0.15s',
    userSelect: 'none',
    WebkitTapHighlightColor: 'transparent',
    fontFamily: "'Inter', system-ui, sans-serif",
  }

  return (
    <button
      style={style}
      disabled={!isIdle}
      onClick={() => isIdle && onSelect(option.id)}
      onMouseDown={() => isIdle && setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onTouchStart={() => isIdle && setPressed(true)}
      onTouchEnd={() => setPressed(false)}
      onMouseEnter={() => { setHovered(true) }}
      onMouseLeave={() => { setPressed(false); setHovered(false) }}
    >
      {/* Letter badge row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{
          width: '26px', height: '26px', borderRadius: '7px', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backgroundColor: isSelected ? p.activeBorder : 'var(--surface-md)',
          border: `1.5px solid ${isSelected ? p.activeBorder : 'var(--border)'}`,
          transition: 'all 0.15s',
        }}>
          {isSelected
            ? <Check size={14} color="var(--background)" strokeWidth={3} />
            : <span style={{ fontSize: '0.75rem', fontWeight: 800, color: isIdle ? 'var(--text)' : 'var(--text)', opacity: 0.65 }}>
                {LABELS[index]}
              </span>
          }
        </div>

        <p style={{
          fontSize: '0.9375rem', fontWeight: 700,
          color: isSelected ? p.activeText : 'var(--text)',
          lineHeight: 1.3, margin: 0,
          transition: 'color 0.15s',
        }}>
          {option.label}
        </p>
      </div>

      {/* Impact summary — hidden until selected or hovered (pre-choice tension) */}
      {(isSelected || (isIdle && hovered)) && (
        <p style={{
          fontSize: '0.8rem',
          color: isSelected ? p.activeText : 'var(--text)',
          opacity: isSelected ? 0.8 : 0.5,
          lineHeight: 1.35,
          margin: '0 0 0 34px',
          transition: 'color 0.15s',
        }}>
          {option.impactSummary}
        </p>
      )}
    </button>
  )
}
