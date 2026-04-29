import { type CSSProperties } from 'react'

export type FinBotMood = 'neutral' | 'happy' | 'worried' | 'excited' | 'thinking'

interface FinBotProps {
  mood?: FinBotMood
  size?: number
  style?: CSSProperties
}

const MOOD_COLORS: Record<FinBotMood, { body: string; eye: string; brow: string }> = {
  neutral:  { body: 'var(--primary)', eye: 'var(--background)', brow: 'var(--background)' },
  happy:    { body: 'var(--accent)',  eye: 'var(--background)', brow: 'var(--background)' },
  worried:  { body: 'var(--risk)',    eye: 'var(--background)', brow: 'var(--background)' },
  excited:  { body: 'var(--gold)',    eye: 'var(--secondary)',  brow: 'var(--secondary)'  },
  thinking: { body: 'var(--secondary)', eye: 'var(--background)', brow: 'var(--background)' },
}

// Eyebrow paths per mood (relative to eye centers)
const BROW_PATHS: Record<FinBotMood, [string, string]> = {
  neutral:  ['M17 10 L23 10', 'M37 10 L43 10'],
  happy:    ['M16 10 Q20 7 24 10', 'M36 10 Q40 7 44 10'],
  worried:  ['M17 10 Q20 13 23 10', 'M37 10 Q40 13 43 10'],
  excited:  ['M15 9 Q20 6 25 9', 'M35 9 Q40 6 45 9'],
  thinking: ['M17 10 L22 8', 'M38 8 L43 10'],
}

// Mouth path per mood
const MOUTH_PATHS: Record<FinBotMood, string> = {
  neutral:  'M24 44 Q30 44 36 44',
  happy:    'M22 42 Q30 50 38 42',
  worried:  'M22 48 Q30 42 38 48',
  excited:  'M21 42 Q30 52 39 42',
  thinking: 'M26 45 Q30 44 35 46',
}

export function FinBot({ mood = 'neutral', size = 64, style }: FinBotProps) {
  const colors = MOOD_COLORS[mood]
  const brows = BROW_PATHS[mood]
  const mouth = MOUTH_PATHS[mood]

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 60 72"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        display: 'block',
        ...style,
      }}
      aria-label={`FinBot — ${mood} mood`}
    >
      {/* Shadow */}
      <ellipse cx="30" cy="70" rx="14" ry="3" fill="rgba(0,0,0,0.10)" />

      {/* Body — rounded rectangle */}
      <rect x="6" y="12" width="48" height="52" rx="12" fill={colors.body} />

      {/* Ear left */}
      <rect x="1" y="24" width="7" height="12" rx="3" fill={colors.body} />

      {/* Ear right */}
      <rect x="52" y="24" width="7" height="12" rx="3" fill={colors.body} />

      {/* Antenna */}
      <line x1="30" y1="12" x2="30" y2="3" stroke={colors.body} strokeWidth="3" strokeLinecap="round" />
      <circle cx="30" cy="2" r="3" fill={colors.body} />

      {/* Visor / face plate */}
      <rect x="10" y="16" width="40" height="34" rx="8" fill="rgba(0,0,0,0.18)" />
      <rect x="12" y="18" width="36" height="30" rx="6" fill={`color-mix(in srgb, ${colors.body} 30%, white)`} opacity="0.15" />

      {/* Eyes */}
      <circle cx="22" cy="32" r="5" fill={colors.eye} />
      <circle cx="38" cy="32" r="5" fill={colors.eye} />
      {/* Pupils */}
      <circle cx="23" cy="33" r="2.5" fill={colors.body} opacity="0.8" />
      <circle cx="39" cy="33" r="2.5" fill={colors.body} opacity="0.8" />
      {/* Eye shine */}
      <circle cx="24" cy="31" r="1" fill="white" opacity="0.9" />
      <circle cx="40" cy="31" r="1" fill="white" opacity="0.9" />

      {/* Eyebrows */}
      <path d={brows[0]} stroke={colors.brow} strokeWidth="2.5" strokeLinecap="round" />
      <path d={brows[1]} stroke={colors.brow} strokeWidth="2.5" strokeLinecap="round" />

      {/* Mouth */}
      <path d={mouth} stroke={colors.brow} strokeWidth="2.5" strokeLinecap="round" fill="none" />

      {/* Chest detail — coin slot */}
      <rect x="24" y="52" width="12" height="5" rx="2.5" fill="rgba(0,0,0,0.20)" />
      <rect x="28" y="53" width="4" height="3" rx="1.5" fill="rgba(255,255,255,0.35)" />
    </svg>
  )
}
