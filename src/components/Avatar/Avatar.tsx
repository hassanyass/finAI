import { type CSSProperties } from 'react'

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl'
type AvatarRing = 'accent' | 'negative' | 'risk' | 'secondary' | 'primary' | 'none'

interface AvatarProps {
  initials: string
  src?: string
  size?: AvatarSize
  ring?: AvatarRing
  opacity?: number
  style?: CSSProperties
}

const sizePx: Record<AvatarSize, number> = { sm: 28, md: 36, lg: 48, xl: 64 }
const fontSizes: Record<AvatarSize, string> = { sm: '0.7rem', md: '0.875rem', lg: '1.125rem', xl: '1.5rem' }

const ringColors: Record<AvatarRing, string> = {
  accent:   'var(--accent)',
  negative: 'var(--negative)',
  risk:     'var(--risk)',
  secondary:'var(--secondary)',
  primary:  'var(--primary)',
  none:     'transparent',
}

export function Avatar({ initials, src, size = 'md', ring = 'none', opacity = 1, style }: AvatarProps) {
  const px = sizePx[size]
  const ringColor = ringColors[ring]

  return (
    <div
      style={{
        width: `${px}px`,
        height: `${px}px`,
        borderRadius: '50%',
        border: ring !== 'none' ? `2px solid ${ringColor}` : '2px solid var(--border)',
        backgroundColor: 'color-mix(in srgb, var(--primary) 15%, var(--background))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        flexShrink: 0,
        opacity,
        transition: 'opacity 0.3s ease, border-color 0.3s ease',
        ...style,
      }}
      aria-label={`Avatar: ${initials}`}
    >
      {src ? (
        <img src={src} alt={initials} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <span style={{
          fontSize: fontSizes[size],
          fontWeight: 600,
          color: 'var(--primary)',
          letterSpacing: '0.02em',
          userSelect: 'none',
        }}>
          {initials.slice(0, 2).toUpperCase()}
        </span>
      )}
    </div>
  )
}
