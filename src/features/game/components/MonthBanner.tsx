import { motion } from 'framer-motion'

interface MonthBannerProps {
  month: number
  contextNote: string
  monthName: string
}

export function MonthBanner({ month, contextNote, monthName }: MonthBannerProps) {
  const pct = ((month - 1) / 12) * 100

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px',
        textAlign: 'center',
        padding: '40px 0 32px',
      }}
    >
      {/* Month label */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
        <p style={{
          fontSize: '0.75rem',
          fontWeight: 700,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'var(--text)',
          opacity: 0.4,
        }}>
          Month {month} of 12
        </p>
        <h2 style={{
          fontSize: '2.75rem',
          fontWeight: 800,
          letterSpacing: '-0.03em',
          color: 'var(--text)',
          lineHeight: 1,
        }}>
          {monthName}
        </h2>
      </div>

      {/* Progress track */}
      <div style={{ width: '100%', maxWidth: '320px' }}>
        <div style={{
          height: '10px',
          backgroundColor: 'var(--surface-md)',
          borderRadius: '999px',
          overflow: 'hidden',
          border: '2px solid var(--border)',
        }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.15 }}
            style={{
              height: '100%',
              backgroundColor: 'var(--primary)',
              borderRadius: '999px',
            }}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text)', opacity: 0.4 }}>Start</span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text)', opacity: 0.4 }}>Month 12</span>
        </div>
      </div>

      {/* Context note */}
      <motion.p
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.3 }}
        style={{
          fontSize: '1rem',
          color: 'var(--text)',
          opacity: 0.65,
          lineHeight: 1.65,
          maxWidth: '460px',
        }}
      >
        {contextNote}
      </motion.p>
    </motion.div>
  )
}
