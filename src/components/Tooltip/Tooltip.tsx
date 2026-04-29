import { type ReactNode, useState, useRef } from 'react'

interface TooltipProps {
  content: string
  position?: 'top' | 'bottom' | 'left' | 'right'
  children: ReactNode
}

export function Tooltip({ content, position = 'top', children }: TooltipProps) {
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const positionStyles = {
    top:    { bottom: 'calc(100% + 6px)', left: '50%', transform: 'translateX(-50%)' },
    bottom: { top:    'calc(100% + 6px)', left: '50%', transform: 'translateX(-50%)' },
    left:   { right:  'calc(100% + 6px)', top: '50%',  transform: 'translateY(-50%)' },
    right:  { left:   'calc(100% + 6px)', top: '50%',  transform: 'translateY(-50%)' },
  }

  return (
    <div
      ref={ref}
      style={{ position: 'relative', display: 'inline-flex' }}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div
          role="tooltip"
          style={{
            position: 'absolute',
            zIndex: 50,
            ...positionStyles[position],
            backgroundColor: 'var(--primary)',
            color: 'var(--background)',
            padding: '5px 10px',
            borderRadius: '6px',
            fontSize: '0.75rem',
            fontWeight: 500,
            whiteSpace: 'nowrap',
            maxWidth: '220px',
            lineHeight: 1.4,
            pointerEvents: 'none',
          }}
        >
          {content}
        </div>
      )}
    </div>
  )
}
