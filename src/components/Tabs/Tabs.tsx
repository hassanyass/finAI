import { type ReactNode } from 'react'

interface TabItem {
  id: string
  label: string
}

interface TabsProps {
  items: TabItem[]
  activeTab: string
  onChange: (id: string) => void
  children?: ReactNode
}

export function Tabs({ items, activeTab, onChange }: TabsProps) {
  return (
    <div
      role="tablist"
      style={{
        display: 'flex',
        gap: '2px',
        borderBottom: '1px solid var(--border)',
        padding: '0 0 1px 0',
      }}
    >
      {items.map(item => {
        const isActive = item.id === activeTab
        return (
          <button
            key={item.id}
            role="tab"
            aria-selected={isActive}
            id={`tab-${item.id}`}
            aria-controls={`panel-${item.id}`}
            onClick={() => onChange(item.id)}
            style={{
              padding: '8px 16px',
              fontSize: '0.875rem',
              fontWeight: isActive ? 600 : 400,
              color: isActive ? 'var(--primary)' : 'var(--text)',
              opacity: isActive ? 1 : 0.55,
              background: 'transparent',
              border: 'none',
              borderBottom: isActive ? '2px solid var(--primary)' : '2px solid transparent',
              marginBottom: '-1px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              fontFamily: "'Inter', system-ui, sans-serif",
              letterSpacing: '-0.01em',
            }}
            onMouseEnter={e => {
              if (!isActive) (e.currentTarget as HTMLButtonElement).style.opacity = '0.8'
            }}
            onMouseLeave={e => {
              if (!isActive) (e.currentTarget as HTMLButtonElement).style.opacity = '0.55'
            }}
          >
            {item.label}
          </button>
        )
      })}
    </div>
  )
}
