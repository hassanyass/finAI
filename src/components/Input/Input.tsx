import { type CSSProperties, type InputHTMLAttributes, useState } from 'react'

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  label?: string
  prefix?: string
  suffix?: string
  error?: string
  hint?: string
  containerStyle?: CSSProperties
}

export function Input({
  label,
  prefix,
  suffix,
  error,
  hint,
  containerStyle,
  id,
  ...props
}: InputProps) {
  const [focused, setFocused] = useState(false)
  const inputId = id ?? `input-${Math.random().toString(36).slice(2, 7)}`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', ...containerStyle }}>
      {label && (
        <label
          htmlFor={inputId}
          style={{
            fontSize: '0.8125rem',
            fontWeight: 500,
            color: 'var(--text)',
            opacity: 0.8,
          }}
        >
          {label}
        </label>
      )}

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          border: `1px solid ${error ? 'var(--negative)' : focused ? 'var(--primary)' : 'var(--border)'}`,
          borderRadius: '7px',
          backgroundColor: 'var(--background)',
          overflow: 'hidden',
          transition: 'border-color 0.15s ease',
        }}
      >
        {prefix && (
          <span
            style={{
              padding: '0 10px',
              fontSize: '0.875rem',
              color: 'var(--text)',
              opacity: 0.5,
              borderRight: '1px solid var(--border)',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              userSelect: 'none',
              backgroundColor: 'var(--surface)',
            }}
          >
            {prefix}
          </span>
        )}

        <input
          id={inputId}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          aria-invalid={!!error}
          style={{
            flex: 1,
            padding: '9px 12px',
            fontSize: '0.9375rem',
            color: 'var(--text)',
            backgroundColor: 'transparent',
            border: 'none',
            outline: 'none',
            fontFamily: "'Inter', system-ui, sans-serif",
            width: '100%',
          }}
          {...props}
        />

        {suffix && (
          <span
            style={{
              padding: '0 10px',
              fontSize: '0.875rem',
              color: 'var(--text)',
              opacity: 0.5,
              borderLeft: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              userSelect: 'none',
              backgroundColor: 'var(--surface)',
            }}
          >
            {suffix}
          </span>
        )}
      </div>

      {error && (
        <p id={`${inputId}-error`} role="alert" style={{ fontSize: '0.8125rem', color: 'var(--negative)' }}>
          {error}
        </p>
      )}
      {hint && !error && (
        <p id={`${inputId}-hint`} style={{ fontSize: '0.8125rem', color: 'var(--text)', opacity: 0.55 }}>
          {hint}
        </p>
      )}
    </div>
  )
}
