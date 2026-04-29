import { create } from 'zustand'
import type { MonthState, EarnedBadge, GameSeed, AppliedDecision, DecisionEffect } from '../types/game'
import { calculateMonthScore, calculateFinalScore, evaluateBadges } from '../lib/scoreEngine'

interface GameStore {
  isStarted: boolean
  isComplete: boolean
  showScoreOverlay: boolean
  startingState: MonthState | null
  currentMonth: number
  monthStates: MonthState[]
  activeMonthState: MonthState | null
  resolvedDecisions: Record<string, AppliedDecision>
  score: number
  monthScores: number[]
  badges: EarnedBadge[]
  finalSnapshot: MonthState | null
  insightForMonth: string

  initGame:      (seed: GameSeed) => void
  applyDecision: (cardId: string, optionId: string, effect: DecisionEffect) => void
  endMonth:      () => void
  advanceMonth:  () => void
  dismissOverlay:() => void
  clearGame:     () => void
}

function resolveRisk(effect: DecisionEffect): DecisionEffect {
  if (!effect.isRisk || !effect.riskWinEffect || !effect.riskLossEffect) return effect
  const win = Math.random() < (effect.riskProbability ?? 0.5)
  return win ? effect.riskWinEffect : effect.riskLossEffect
}

const MONTH_INSIGHTS: Record<number, string> = {
  1:  'Small automated decisions compound into large results. The habits you set in month 1 run on autopilot for 11 more months.',
  2:  'Variable expenses are the most controllable lever in your budget. Every reduction here directly increases your financial margin.',
  3:  'Automating savings removes willpower from the equation. You can\'t spend money that was moved before you saw it.',
  4:  'An employer 401(k) match is a guaranteed 50–100% instant return. Not capturing it is the equivalent of leaving salary on the table.',
  5:  'Paying extra on high-interest debt is the same as earning that interest rate, risk-free. No investment reliably beats 22% APR.',
  6:  'Windfalls and variable income opportunities are high-leverage moments. Small decisions here have outsized impact.',
  7:  'This is what an emergency fund exists for. Using it costs you nothing except the time to rebuild it. Debt costs you interest.',
  8:  'Career risk is more manageable with financial runway. A well-funded emergency fund expands your career options.',
  9:  'After an adversity stretch, rebuilding your safety net before resuming growth is the correct priority order.',
  10: 'Tax-advantaged accounts are the highest-return financial decision available to most people. The window is annual.',
  11: 'Windfalls feel like free money — but treating them as income and splitting them between debt and savings is how wealth builds faster.',
  12: 'A year of consistent decisions creates compound effects. The gap between starting position and ending position is entirely your choices.',
}

export const useGameStore = create<GameStore>()((set, get) => ({
  isStarted: false,
  isComplete: false,
  showScoreOverlay: false,
  startingState: null,
  currentMonth: 0,
  monthStates: [],
  activeMonthState: null,
  resolvedDecisions: {},
  score: 0,
  monthScores: [],
  badges: [],
  finalSnapshot: null,
  insightForMonth: '',

  initGame: (seed: GameSeed) => {
    const startingState: MonthState = {
      month: 0,
      cash: seed.startingCash,
      savingsBalance: seed.startingSavings,
      debtBalance: seed.startingDebt,
      investmentBalance: seed.startingInvestments,
      monthScore: 0,
      decisions: [],
    }
    const activeMonthState: MonthState = { ...startingState, month: 1, decisions: [] }
    set({
      isStarted: true,
      isComplete: false,
      showScoreOverlay: false,
      startingState,
      currentMonth: 1,
      monthStates: [],
      activeMonthState,
      resolvedDecisions: {},
      score: 0,
      monthScores: [],
      badges: [],
      finalSnapshot: null,
    })
  },

  applyDecision: (cardId, optionId, rawEffect) => {
    const { activeMonthState, resolvedDecisions } = get()
    if (!activeMonthState) return

    const effect = resolveRisk(rawEffect)
    const resolved: AppliedDecision = { cardId, optionId, resolvedEffect: effect, status: effect.cashDelta >= 0 && effect.savingsDelta >= 0 && effect.debtDelta <= 0 ? 'resolved-positive' : 'resolved-negative' }

    const newState: MonthState = {
      ...activeMonthState,
      cash:              activeMonthState.cash + effect.cashDelta,
      savingsBalance:    activeMonthState.savingsBalance + effect.savingsDelta,
      debtBalance:       Math.max(0, activeMonthState.debtBalance + effect.debtDelta),
      investmentBalance: activeMonthState.investmentBalance + effect.investmentDelta,
      decisions: [...activeMonthState.decisions, resolved],
    }

    set({ activeMonthState: newState, resolvedDecisions: { ...resolvedDecisions, [cardId]: resolved } })
  },

  endMonth: () => {
    const { activeMonthState, startingState, currentMonth, monthStates, monthScores } = get()
    if (!activeMonthState || !startingState) return

    let monthlyModifiers = 0

    // Sum up all monthly modifiers from resolved decisions
    activeMonthState.decisions.forEach(d => {
      if (d.resolvedEffect.monthlyModifier) {
        monthlyModifiers += d.resolvedEffect.monthlyModifier.delta
      }
    })

    const closingState: MonthState = {
      ...activeMonthState,
      monthScore: 0, // calculated below
    }

    const prevMonthState = monthStates.length > 0 ? monthStates[monthStates.length - 1] : startingState
    const scoreBreakdown = calculateMonthScore(prevMonthState, closingState)
    closingState.monthScore = scoreBreakdown.total

    const newMonthStates = [...monthStates, closingState]
    const newMonthScores = [...monthScores, scoreBreakdown.total]
    const newBadges = evaluateBadges(newMonthStates, startingState)
    const isFinal = currentMonth === 12

    const finalScore = isFinal ? calculateFinalScore(newMonthScores, newMonthStates) : get().score

    set({
      monthStates: newMonthStates,
      monthScores: newMonthScores,
      badges: newBadges,
      score: finalScore,
      showScoreOverlay: true,
      insightForMonth: MONTH_INSIGHTS[currentMonth] ?? '',
      finalSnapshot: isFinal ? closingState : null,
      isComplete: isFinal,
    })
  },

  advanceMonth: () => {
    const { currentMonth, activeMonthState } = get()
    if (currentMonth >= 12) return

    const nextMonth = currentMonth + 1
    const nextState: MonthState = {
      ...activeMonthState!,
      month: nextMonth,
      monthScore: 0,
      decisions: [],
    }

    set({
      currentMonth: nextMonth,
      activeMonthState: nextState,
      resolvedDecisions: {},
      showScoreOverlay: false,
    })
  },

  dismissOverlay: () => set({ showScoreOverlay: false }),

  clearGame: () => set({
    isStarted: false,
    isComplete: false,
    showScoreOverlay: false,
    startingState: null,
    currentMonth: 0,
    monthStates: [],
    activeMonthState: null,
    resolvedDecisions: {},
    score: 0,
    monthScores: [],
    badges: [],
    finalSnapshot: null,
    insightForMonth: '',
  }),
}))
