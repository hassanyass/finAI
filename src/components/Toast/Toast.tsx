import { type CSSProperties, useEffect, useState, createContext, useContext, useCallback, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'info'

interface ToastItem {
  id: string
  type: ToastType
  message: string
  duration?: number
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType, duration?: number) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const toast = useCallback((message: string, type: ToastType = 'info', duration = 3500) => {
    const id = Math.random().toString(36).slice(2)
    setToasts(prev => [...prev, { id, type, message, duration }])
    setTimeout(() => dismiss(id), duration)
  }, [dismiss])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {createPortal(
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 200,
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            pointerEvents: 'none',
          }}
        >
          {toasts.map(t => (
            <ToastItem key={t.id} item={t} onDismiss={dismiss} />
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

const toastConfig: Record<ToastType, { icon: ReactNode; color: string }> = {
  success: { icon: <CheckCircle size={15} />, color: 'var(--accent)' },
  error: { icon: <AlertCircle size={15} />, color: 'var(--negative)' },
  info: { icon: <Info size={15} />, color: 'var(--secondary)' },
}

function ToastItem({ item, onDismiss }: { item: ToastItem; onDismiss: (id: string) => void }) {
  const [visible, setVisible] = useState(false)
  const config = toastConfig[item.type]

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10)
    return () => clearTimeout(t)
  }, [])

  const itemStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '11px 14px',
    backgroundColor: 'var(--background)',
    border: '1px solid var(--border)',
    borderLeft: `3px solid ${config.color}`,
    borderRadius: '8px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
    fontSize: '0.875rem',
    color: 'var(--text)',
    maxWidth: '340px',
    pointerEvents: 'all',
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : 'translateY(8px)',
    transition: 'opacity 0.2s ease, transform 0.2s ease',
  }

  return (
    <div style={itemStyle}>
      <span style={{ color: config.color, flexShrink: 0, display: 'flex' }}>{config.icon}</span>
      <span style={{ flex: 1, lineHeight: 1.4 }}>{item.message}</span>
      <button
        onClick={() => onDismiss(item.id)}
        style={{
          display: 'flex', alignItems: 'center', border: 'none', background: 'transparent',
          cursor: 'pointer', color: 'var(--text)', opacity: 0.4, padding: '2px', borderRadius: '4px',
          transition: 'opacity 0.15s',
        }}
        onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.opacity = '0.8')}
        onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.opacity = '0.4')}
        aria-label="Dismiss notification"
      >
        <X size={13} />
      </button>
    </div>
  )
}
