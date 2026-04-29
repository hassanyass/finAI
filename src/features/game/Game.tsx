import { useState, useEffect, type CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useGameStore } from '../../store/gameStore'
import { useFinancialProfileStore } from '../../store/financialProfileStore'
import { DECISION_TREE } from '../../data/decisionTree'
import type { DecisionEffect } from '../../types/game'
import type { FinancialProfile } from '../../types/financial'
import { formatCurrencyFull } from '../../lib/financialCalc'
import { Gamepad2, BarChart2, X, DollarSign, PiggyBank, CreditCard, TrendingUp, ChevronRight } from 'lucide-react'

import { GameCard }       from './components/GameCard'
import { OptionButton }   from './components/OptionButton'
import { FloatingDeltas } from './components/FloatingDeltas'
import { ScoreOverlay }   from './components/ScoreOverlay'
import { GameStatsPanel } from './components/GameStatsPanel'
import { FinBot }         from '../../components/FinBot/FinBot'

// ─── Phase types ─────────────────────────────────────────────────────────────

type GamePhase =
  | 'intro'       // Month splash, auto-advances 1.8s
  | 'card-enter'  // Card animating in (→ decide immediately)
  | 'decide'      // Waiting for choice
  | 'consequence' // Showing reaction + deltas after choice

interface LocalState {
  phase: GamePhase
  cardIndex: number
  selectedOptionId: string | null
  selectedEffect: DecisionEffect | null
  riskWon: boolean | null
  showContinue: boolean
}

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]

type BotMood = 'neutral' | 'happy' | 'worried' | 'excited' | 'thinking'

function moodFrom(phase: GamePhase, riskWon: boolean | null): BotMood {
  if (phase === 'intro' || phase === 'card-enter') return 'neutral'
  if (phase === 'decide') return 'thinking'
  if (phase === 'consequence') {
    if (riskWon === true)  return 'excited'
    if (riskWon === false) return 'worried'
    return 'happy'
  }
  return 'neutral'
}

// ─── Main ────────────────────────────────────────────────────────────────────

export function Game() {
  const navigate   = useNavigate()
  const profile    = useFinancialProfileStore(s => s.profile)
  const store      = useGameStore()
  const [showStats, setShowStats] = useState(false)

  const [local, setLocal] = useState<LocalState>({
    phase: 'intro', cardIndex: 0,
    selectedOptionId: null, selectedEffect: null,
    riskWon: null, showContinue: false,
  })

  // Reset per month
  useEffect(() => {
    setLocal({ phase: 'intro', cardIndex: 0, selectedOptionId: null, selectedEffect: null, riskWon: null, showContinue: false })
  }, [store.currentMonth])

  // intro → card-enter → decide
  useEffect(() => {
    if (local.phase !== 'intro') return
    const t = setTimeout(() => {
      setLocal(p => ({ ...p, phase: 'card-enter' }))
      setTimeout(() => setLocal(p => ({ ...p, phase: 'decide' })), 350)
    }, 1800)
    return () => clearTimeout(t)
  }, [local.phase])

  // consequence → show continue after 1.2s
  useEffect(() => {
    if (local.phase !== 'consequence') return
    const t = setTimeout(() => setLocal(p => ({ ...p, showContinue: true })), 1200)
    return () => clearTimeout(t)
  }, [local.phase])

  if (!profile) { navigate('/onboarding'); return null }

  if (!store.isStarted) {
    return <StartScreen profile={profile} onStart={() => {
      const cf = Math.max(0, profile.income.total - profile.expenses.total - profile.debt.totalMinimumPayments)
      store.initGame({
        startingCash:         cf,
        startingDebt:         profile.debt.total,
        startingSavings:      profile.savings.emergency + profile.savings.other,
        startingInvestments:  profile.savings.investments + profile.savings.retirement,
        monthlyIncome:        profile.income.total,
        monthlyFixedExpenses: profile.expenses.fixed,
      })
    }} />
  }

  if (store.isComplete && !store.showScoreOverlay) {
    navigate('/coach?fromGame=true&score=' + store.score)
    return null
  }

  const monthData = DECISION_TREE.find(m => m.month === store.currentMonth)
  if (!monthData || !store.activeMonthState) return null

  const { phase } = local
  const activeCard      = monthData.decisions[local.cardIndex]
  const resolvedForCard = activeCard ? store.resolvedDecisions[activeCard.id] : undefined
  const isResolved      = !!resolvedForCard
  const botMood         = moodFrom(phase, local.riskWon)
  const totalCards      = monthData.decisions.length
  const isLastCard      = local.cardIndex >= totalCards - 1

  function handleSelect(optionId: string, effect: DecisionEffect) {
    if (!activeCard) return
    const isRisk  = effect.isRisk ?? false
    const riskWon = isRisk ? Math.random() < (effect.riskProbability ?? 0.5) : null
    const resolved = isRisk
      ? (riskWon ? (effect.riskWinEffect ?? effect) : (effect.riskLossEffect ?? effect))
      : effect
    store.applyDecision(activeCard.id, optionId, resolved)
    setLocal(p => ({ ...p, phase: 'consequence', selectedOptionId: optionId, selectedEffect: resolved, riskWon, showContinue: false }))
  }

  function handleContinue() {
    if (!isLastCard) {
      const next = local.cardIndex + 1
      setLocal(p => ({ ...p, phase: 'card-enter' }))
      setTimeout(() => setLocal({ phase: 'decide', cardIndex: next, selectedOptionId: null, selectedEffect: null, riskWon: null, showContinue: false }), 320)
    } else {
      // Last card → end month immediately (no separate end-month phase)
      store.endMonth()
    }
  }

  function handleScoreContinue() {
    if (store.isComplete) {
      navigate('/coach?fromGame=true&score=' + store.score)
    } else {
      store.advanceMonth()
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div style={{ height: '100vh', backgroundColor: 'var(--background)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* ── Minimal game header ── */}
      <div style={{ flexShrink: 0, borderBottom: '2px solid var(--border)', padding: '10px 24px', backgroundColor: 'var(--background)', display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Logo / home */}
        <button
          onClick={() => navigate('/')}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 8px', borderRadius: '7px', border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'Inter' }}
          onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.opacity = '0.7')}
          onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.opacity = '1')}
        >
          <img src="/logo.png" alt="" style={{ height: '22px', width: 'auto' }} onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }} />
          <span style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '-0.01em' }}>
            FinSight<span style={{ color: 'var(--secondary)' }}> AI</span>
          </span>
        </button>

        {/* Month / 12 */}
        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text)', opacity: 0.45 }}>
          Month {store.currentMonth} / 12
        </span>

        {/* Dot progress */}
        <div style={{ display: 'flex', gap: '4px', flex: 1, alignItems: 'center' }}>
          {Array.from({ length: 12 }, (_, i) => {
            const m = i + 1
            const done = store.monthStates.some(s => s.month === m)
            const active = m === store.currentMonth
            return (
              <div key={m} style={{
                width: active ? '9px' : '6px', height: active ? '9px' : '6px', borderRadius: '50%',
                backgroundColor: done ? 'var(--accent)' : active ? 'var(--primary)' : 'var(--surface-md)',
                border: `1.5px solid ${done ? 'var(--accent)' : active ? 'var(--primary)' : 'var(--border)'}`,
                transition: 'all 0.25s', flexShrink: 0,
              }} />
            )
          })}
        </div>

        {/* Score */}
        {store.score > 0 && (
          <span style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--primary)', whiteSpace: 'nowrap' }}>
            {store.score} pts
          </span>
        )}

        {/* Stats toggle */}
        <button
          onClick={() => setShowStats(v => !v)}
          title="View financial stats"
          style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 10px', borderRadius: '8px', border: '1.5px solid var(--border)', background: showStats ? 'var(--surface)' : 'transparent', cursor: 'pointer', color: 'var(--text)', opacity: 0.6, fontSize: '0.75rem', fontWeight: 600, fontFamily: 'Inter', transition: 'all 0.15s' }}
          onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.opacity = '1')}
          onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.opacity = showStats ? '1' : '0.6')}
        >
          <BarChart2 size={14} />
          Stats
        </button>
      </div>

      {/* ── Single centered play area ── */}
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ width: '100%', maxWidth: '580px', padding: '28px 20px 80px' }}>

          <AnimatePresence mode="wait">

            {/* INTRO — month splash */}
            {phase === 'intro' && (
              <motion.div
                key={`intro-${store.currentMonth}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                style={{ textAlign: 'center', paddingTop: '48px' }}
              >
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text)', opacity: 0.4, marginBottom: '8px' }}
                >
                  Month {store.currentMonth} of 12
                </motion.p>
                <motion.h1
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.15, duration: 0.45, ease: 'backOut' }}
                  style={{ fontSize: '3.5rem', fontWeight: 900, color: 'var(--text)', letterSpacing: '-0.04em', lineHeight: 1, marginBottom: '16px' }}
                >
                  {MONTH_NAMES[store.currentMonth - 1]}
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.55 }}
                  transition={{ delay: 0.35 }}
                  style={{ fontSize: '1rem', color: 'var(--text)', lineHeight: 1.6, maxWidth: '400px', margin: '0 auto' }}
                >
                  {monthData.contextNote}
                </motion.p>

                {/* Animated dots — "entering" */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  style={{ marginTop: '32px', display: 'flex', justifyContent: 'center', gap: '6px' }}
                >
                  {[0, 1, 2].map(i => (
                    <motion.div
                      key={i}
                      animate={{ scale: [1, 1.4, 1] }}
                      transition={{ delay: 0.6 + i * 0.15, duration: 0.4, repeat: 2 }}
                      style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: 'var(--primary)', opacity: 0.4 }}
                    />
                  ))}
                </motion.div>
              </motion.div>
            )}

            {/* CARD + CHOICES + REACTION */}
            {(phase === 'card-enter' || phase === 'decide' || phase === 'consequence') && activeCard && (
              <motion.div
                key={`card-${store.currentMonth}-${local.cardIndex}`}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              >
                {/* Tiny counter */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <span style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text)', opacity: 0.35 }}>
                    Decision {local.cardIndex + 1} / {totalCards}
                  </span>
                  {phase === 'consequence' && isLastCard && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em' }}
                    >
                      Final decision this month
                    </motion.span>
                  )}
                </div>

                {/* Scenario card */}
                <GameCard
                  type={activeCard.type}
                  title={activeCard.title}
                  description={activeCard.description}
                  learnMore={activeCard.learnMore}
                />

                {/* Choices */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: activeCard.options.length === 2 ? '1fr 1fr' : '1fr',
                  gap: '10px',
                  marginTop: '14px',
                }}>
                  {activeCard.options.map((opt, i) => {
                    let status: 'idle' | 'selected' | 'dimmed' = 'idle'
                    if (isResolved) status = opt.id === local.selectedOptionId ? 'selected' : 'dimmed'
                    return (
                      <OptionButton
                        key={opt.id}
                        option={opt}
                        status={status}
                        index={i}
                        onSelect={(id) => handleSelect(id, opt.effect)}
                      />
                    )
                  })}
                </div>

                {/* ── Consequence reaction area ── */}
                <AnimatePresence>
                  {phase === 'consequence' && local.selectedEffect && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.35, ease: 'easeOut', delay: 0.1 }}
                      style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}
                    >
                      {/* Character reaction — centered, inline */}
                      <InlineCharacter mood={botMood} />

                      {/* Floating deltas */}
                      <FloatingDeltas effect={local.selectedEffect} riskWon={local.riskWon ?? undefined} />

                      {/* Continue / Next month */}
                      <AnimatePresence>
                        {local.showContinue && (
                          <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.22 }}
                            style={{ width: '100%' }}
                          >
                            <PrimaryButton
                              onClick={handleContinue}
                              label={isLastCard ? 'Next Month' : 'Next Decision'}
                              accent={isLastCard}
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Stats slide-in drawer ── */}
      <AnimatePresence>
        {showStats && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowStats(false)}
              style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.3)', zIndex: 30, backdropFilter: 'blur(2px)' }}
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              style={{ position: 'fixed', right: 0, top: 0, bottom: 0, width: '280px', zIndex: 40, backgroundColor: 'var(--background)', borderLeft: '2px solid var(--border)', overflow: 'hidden' }}
            >
              {/* Drawer header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text)' }}>Financial Stats</span>
                <button
                  onClick={() => setShowStats(false)}
                  style={{ display: 'flex', alignItems: 'center', padding: '4px', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text)', opacity: 0.5, borderRadius: '6px' }}
                >
                  <X size={16} />
                </button>
              </div>
              <div style={{ height: 'calc(100% - 53px)', overflowY: 'auto' }}>
                <GameStatsPanel
                  month={store.currentMonth}
                  state={store.activeMonthState}
                  startingState={store.startingState}
                  completedMonths={store.monthStates}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Score overlay ── */}
      <ScoreOverlay
        isOpen={store.showScoreOverlay}
        month={store.currentMonth}
        score={store.monthStates[store.monthStates.length - 1]?.monthScore ?? 0}
        cumulativeScore={store.score}
        insight={store.insightForMonth}
        newBadges={store.badges.filter(b => b.earnedInMonth === store.currentMonth)}
        isFinal={store.isComplete}
        onContinue={handleScoreContinue}
      />
    </div>
  )
}

// ─── Inline Character ─────────────────────────────────────────────────────────

const BOT_LABEL: Record<BotMood, string> = {
  neutral: 'Steady', thinking: 'Considering...', happy: 'Good call', excited: 'Excellent!', worried: 'Rough one',
}

function InlineCharacter({ mood }: { mood: BotMood }) {
  const floatAnim =
    mood === 'excited' ? { y: [0, -10, 0], transition: { duration: 1.6, repeat: Infinity, ease: 'easeInOut' as const } }
    : mood === 'worried' ? { rotate: [-4, 4, -4, 4, 0], transition: { duration: 0.4, repeat: 2, ease: 'easeInOut' as const } }
    : { y: [0, -4, 0], transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' as const } }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
      <div style={{ position: 'relative' }}>
        {/* Glow */}
        <div style={{
          position: 'absolute', inset: '-14px', borderRadius: '50%',
          background: `radial-gradient(circle, ${
            mood === 'happy' || mood === 'excited' ? 'rgba(74,186,134,0.12)' :
            mood === 'worried' ? 'rgba(140,53,53,0.10)' :
            'rgba(142,180,230,0.10)'} 0%, transparent 70%)`,
          pointerEvents: 'none',
        }} />
        {/* Shadow */}
        <div style={{ position: 'absolute', bottom: '-6px', left: '50%', transform: 'translateX(-50%)', width: '60px', height: '10px', borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.10)', filter: 'blur(5px)' }} />

        <motion.div animate={floatAnim} style={{ position: 'relative', zIndex: 1 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={mood}
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ duration: 0.22, ease: 'backOut' }}
            >
              <FinBot mood={mood} size={90} />
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>

      <motion.span
        key={mood}
        initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
        style={{
          fontSize: '0.75rem', fontWeight: 700,
          padding: '3px 10px', borderRadius: '20px',
          backgroundColor: 'var(--surface)', border: '1px solid var(--border)',
          color: 'var(--text)', opacity: 0.65,
        }}
      >
        {BOT_LABEL[mood]}
      </motion.span>
    </div>
  )
}

// ─── Primary button ───────────────────────────────────────────────────────────

function PrimaryButton({ onClick, label, accent }: { onClick: () => void; label: string; accent?: boolean }) {
  const [pressed, setPressed] = useState(false)
  const bg    = accent ? 'var(--accent)' : 'var(--primary)'
  const shade = accent ? 'color-mix(in srgb, var(--accent) 35%, transparent)' : 'color-mix(in srgb, var(--primary) 35%, transparent)'

  const style: CSSProperties = {
    width: '100%', padding: '16px', borderRadius: '14px',
    border: `2px solid ${bg}`,
    boxShadow: pressed ? 'none' : `0 4px 0 ${shade}`,
    transform: pressed ? 'translateY(4px)' : 'translateY(0)',
    backgroundColor: bg, color: 'var(--background)',
    fontSize: '1rem', fontWeight: 800, letterSpacing: '-0.01em',
    cursor: 'pointer', transition: 'transform 0.1s, box-shadow 0.1s',
    fontFamily: "'Inter', system-ui, sans-serif",
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
  }

  return (
    <button style={style} onClick={onClick}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
    >
      {label} <ChevronRight size={16} />
    </button>
  )
}

// ─── Start screen ─────────────────────────────────────────────────────────────

function StartScreen({ profile, onStart }: { profile: FinancialProfile; onStart: () => void }) {
  const [pressed, setPressed] = useState(false)
  const cashFlow = profile.income.total - profile.expenses.total - profile.debt.totalMinimumPayments

  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', backgroundColor: 'var(--background)', overflow: 'auto' }}>
      <div style={{ maxWidth: '520px', width: '100%' }}>

        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <motion.div
            animate={{ y: [0, -7, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            style={{ display: 'inline-block', marginBottom: '14px' }}
          >
            <FinBot mood="excited" size={86} />
          </motion.div>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text)', letterSpacing: '-0.035em', marginBottom: '8px', lineHeight: 1.1 }}>
            12-Month Simulation
          </h1>
          <p style={{ fontSize: '0.9375rem', color: 'var(--text)', opacity: 0.55, lineHeight: 1.65 }}>
            Make real financial decisions across 12 months.<br />
            Every choice compounds — for better or worse.
          </p>
        </div>

        <div style={{ border: '2px solid var(--border)', borderRadius: '18px', boxShadow: '0 5px 0 var(--border)', padding: '20px', marginBottom: '20px', backgroundColor: 'var(--background)' }}>
          <p style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text)', opacity: 0.35, marginBottom: '14px' }}>
            Starting position
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {[
              { Icon: DollarSign, label: 'Monthly Income', value: profile.income.total,  color: 'var(--accent)'                                          },
              { Icon: TrendingUp, label: 'Cash Flow',      value: cashFlow,              color: cashFlow >= 0 ? 'var(--accent)' : 'var(--negative)'      },
              { Icon: CreditCard, label: 'Total Debt',     value: profile.debt.total,    color: profile.debt.total > 0 ? 'var(--negative)' : 'var(--accent)' },
              { Icon: PiggyBank,  label: 'Total Savings',  value: profile.savings.total, color: 'var(--accent)'                                          },
            ].map(({ Icon, label, value, color }) => (
              <div key={label} style={{ padding: '10px 12px', borderRadius: '10px', backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '3px' }}>
                  <Icon size={10} color={color} />
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text)', opacity: 0.45 }}>{label}</span>
                </div>
                <p style={{ fontSize: '1rem', fontWeight: 800, color, letterSpacing: '-0.01em' }}>
                  {formatCurrencyFull(value)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <button
          style={{
            width: '100%', padding: '17px', borderRadius: '14px',
            border: '2px solid var(--primary)',
            boxShadow: pressed ? 'none' : '0 5px 0 color-mix(in srgb, var(--primary) 35%, transparent)',
            transform: pressed ? 'translateY(5px)' : 'translateY(0)',
            backgroundColor: 'var(--primary)', color: 'var(--background)',
            fontSize: '1rem', fontWeight: 900, cursor: 'pointer', letterSpacing: '-0.01em',
            transition: 'transform 0.1s, box-shadow 0.1s', fontFamily: "'Inter', system-ui, sans-serif",
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          }}
          onClick={onStart}
          onMouseDown={() => setPressed(true)}
          onMouseUp={() => setPressed(false)}
          onMouseLeave={() => setPressed(false)}
        >
          <Gamepad2 size={18} /> Begin Month 1
        </button>
        <p style={{ textAlign: 'center', marginTop: '12px', fontSize: '0.8rem', color: 'var(--text)', opacity: 0.35 }}>
          12 months · {DECISION_TREE.reduce((sum, m) => sum + m.decisions.length, 0)} decisions · compounding consequences
        </p>
      </div>
    </div>
  )
}
