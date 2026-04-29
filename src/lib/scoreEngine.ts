import type { MonthState, ScoreBreakdown, EarnedBadge } from '../types/game'
import type { FinancialProfile } from '../types/financial'
import { BADGES } from '../data/badges'
import { formatCurrencyFull } from './financialCalc'

// ─── Month score calculation ─────────────────────────────────────────────────

export function calculateMonthScore(start: MonthState, end: MonthState): ScoreBreakdown {
  const savingsDelta     = end.savingsBalance - start.savingsBalance
  const debtDelta        = start.debtBalance  - end.debtBalance   // positive = debt reduced
  const investmentDelta  = end.investmentBalance - start.investmentBalance
  const cashFlowPositive = end.cash >= 0

  // Normalize deltas to 0–1 scale based on reasonable thresholds
  const savingsScore     = Math.min(1, Math.max(0, savingsDelta  / 500))  * 0.30
  const debtScore        = Math.min(1, Math.max(0, debtDelta     / 500))  * 0.30
  const investmentScore  = Math.min(1, Math.max(0, investmentDelta / 300)) * 0.20
  const resilienceScore  = cashFlowPositive ? 0.20 : 0

  const total = Math.round((savingsScore + debtScore + investmentScore + resilienceScore) * 100)

  return {
    savingsScore:    Math.round(savingsScore * 100),
    debtScore:       Math.round(debtScore * 100),
    investmentScore: Math.round(investmentScore * 100),
    resilienceScore: Math.round(resilienceScore * 100),
    total,
  }
}

// ─── Final score normalization ────────────────────────────────────────────────

export function calculateFinalScore(monthScores: number[], monthStates: MonthState[]): number {
  if (monthScores.length === 0) return 0
  const avg = monthScores.reduce((a, b) => a + b, 0) / monthScores.length

  // Consistency bonus: +10 if no month had negative cash flow
  const allPositive = monthStates.every(s => s.cash >= 0)
  const consistencyBonus = allPositive ? 10 : 0

  return Math.min(100, Math.round(avg + consistencyBonus))
}

// ─── Badge evaluation ────────────────────────────────────────────────────────

export function evaluateBadges(
  monthStates: MonthState[],
  startingState: MonthState
): EarnedBadge[] {
  const earned: EarnedBadge[] = []

  for (let i = 0; i < monthStates.length; i++) {
    const state = monthStates[i]
    const month = i + 1

    // First Safety Net: emergency fund covers >= 1 month of starting expenses
    if (state.savingsBalance >= startingState.cash * 1 && !earned.find(e => e.badge.id === 'first-safety-net')) {
      earned.push({ badge: BADGES.find(b => b.id === 'first-safety-net')!, earnedInMonth: month })
    }

    // Debt Fighter: extra debt payment applied (signalled by debtBalance decreasing faster)
    const prevDebt = i === 0 ? startingState.debtBalance : monthStates[i - 1].debtBalance
    if (prevDebt - state.debtBalance > 100 && !earned.find(e => e.badge.id === 'debt-fighter')) {
      earned.push({ badge: BADGES.find(b => b.id === 'debt-fighter')!, earnedInMonth: month })
    }

    // Investor: investment balance growing
    const prevInvest = i === 0 ? startingState.investmentBalance : monthStates[i - 1].investmentBalance
    if (state.investmentBalance > prevInvest + 100 && !earned.find(e => e.badge.id === 'investor')) {
      earned.push({ badge: BADGES.find(b => b.id === 'investor')!, earnedInMonth: month })
    }

    // Clean Slate: debt reaches 0
    if (state.debtBalance === 0 && startingState.debtBalance > 0 && !earned.find(e => e.badge.id === 'clean-slate')) {
      earned.push({ badge: BADGES.find(b => b.id === 'clean-slate')!, earnedInMonth: month })
    }

    // Perfect Month: score >= 85
    if (state.monthScore >= 85 && !earned.find(e => e.badge.id === 'perfect-month')) {
      earned.push({ badge: BADGES.find(b => b.id === 'perfect-month')!, earnedInMonth: month })
    }
  }

  // Steady: all months positive cash flow
  if (monthStates.length === 12 && monthStates.every(s => s.cash >= 0)) {
    earned.push({ badge: BADGES.find(b => b.id === 'steady')!, earnedInMonth: 12 })
  }

  // Long Game: net worth grew every month
  let grewEveryMonth = true
  for (let i = 1; i < monthStates.length; i++) {
    const curNW  = monthStates[i].savingsBalance + monthStates[i].investmentBalance - monthStates[i].debtBalance
    const prevNW = monthStates[i - 1].savingsBalance + monthStates[i - 1].investmentBalance - monthStates[i - 1].debtBalance
    if (curNW <= prevNW) { grewEveryMonth = false; break }
  }
  if (grewEveryMonth && monthStates.length === 12) {
    earned.push({ badge: BADGES.find(b => b.id === 'long-game')!, earnedInMonth: 12 })
  }

  return earned.filter(e => e.badge !== undefined)
}

// ─── Result headline generation ───────────────────────────────────────────────

export function generateResultsHeadline(
  score: number,
  final: MonthState,
  start: MonthState
): string {
  const netWorthChange = (final.savingsBalance + final.investmentBalance - final.debtBalance)
                       - (start.savingsBalance  + start.investmentBalance  - start.debtBalance)
  const savingsGrowth  = final.savingsBalance   - start.savingsBalance
  const debtReduction  = start.debtBalance      - final.debtBalance

  if (score >= 80) {
    if (debtReduction > 0 && savingsGrowth > 0) {
      return `You built ${formatCurrencyFull(savingsGrowth)} in savings and reduced debt by ${formatCurrencyFull(debtReduction)}. Strong execution.`
    }
    return `Your net worth grew by ${formatCurrencyFull(netWorthChange)}. That's the result of consistent, deliberate decisions.`
  }
  if (score >= 60) {
    return `Solid foundation. Your net worth ${netWorthChange >= 0 ? 'grew' : 'dropped'} by ${formatCurrencyFull(Math.abs(netWorthChange))} — there's clear room to accelerate.`
  }
  if (score >= 40) {
    return `Some months worked, some didn't. The pattern shows where your financial leverage points are.`
  }
  return `This game revealed some important gaps. Your coach can help you understand what happened and what to change.`
}

// ─── Insight generation ────────────────────────────────────────────────────────

interface Insight {
  concept: string
  gameFact: string
  realWorldMeaning: string
  borderColor: 'accent' | 'risk' | 'negative'
}

export function generateInsights(
  monthStates: MonthState[],
  start: MonthState,
  _profile: FinancialProfile | null
): Insight[] {
  const insights: Insight[] = []

  const totalInvested = monthStates.reduce((sum, s, i) => {
    const prev = i === 0 ? start.investmentBalance : monthStates[i - 1].investmentBalance
    return sum + Math.max(0, s.investmentBalance - prev * 1.007)
  }, 0)

  if (totalInvested > 100) {
    const finalInvest = monthStates[monthStates.length - 1].investmentBalance
    insights.push({
      concept: 'Compound Growth',
      gameFact: `You invested roughly ${formatCurrencyFull(totalInvested)} across 12 months.`,
      realWorldMeaning: `At a 7% annual return, ${formatCurrencyFull(finalInvest)} continues growing to ${formatCurrencyFull(finalInvest * 1.07)} by next year — without you doing anything.`,
      borderColor: 'accent',
    })
  }

  const debtReduction = start.debtBalance - monthStates[monthStates.length - 1].debtBalance
  if (debtReduction > 200) {
    insights.push({
      concept: 'Debt Reduction',
      gameFact: `You reduced your debt by ${formatCurrencyFull(debtReduction)} over 12 months.`,
      realWorldMeaning: `Every dollar of debt paid down is the same as earning your interest rate risk-free. Paying off a 19% credit card is like a guaranteed 19% return.`,
      borderColor: 'accent',
    })
  }

  const negativeCashMonths = monthStates.filter(s => s.cash < 0).length
  if (negativeCashMonths > 0) {
    insights.push({
      concept: 'Cash Flow Resilience',
      gameFact: `You had ${negativeCashMonths} month${negativeCashMonths > 1 ? 's' : ''} with negative cash flow.`,
      realWorldMeaning: `Negative cash flow means spending more than you earn. Even one month without a buffer forces debt or dipping into savings — the emergency fund exists to absorb these shocks.`,
      borderColor: 'risk',
    })
  }

  const savingsGrowth = monthStates[monthStates.length - 1].savingsBalance - start.savingsBalance
  if (savingsGrowth > 0) {
    insights.push({
      concept: 'Savings Momentum',
      gameFact: `Your savings balance grew by ${formatCurrencyFull(savingsGrowth)}.`,
      realWorldMeaning: `Automating savings removes the decision from your monthly routine. You spend what's left, not what you remember to save.`,
      borderColor: 'accent',
    })
  }

  if (insights.length < 2) {
    insights.push({
      concept: 'Financial Awareness',
      gameFact: `You completed 12 months of financial decisions.`,
      realWorldMeaning: `Most people never model their finances this concretely. Seeing the numbers react to your choices is the first step toward changing them.`,
      borderColor: 'accent',
    })
  }

  return insights.slice(0, 4)
}

// ─── Suggested action ─────────────────────────────────────────────────────────

export function generateSuggestedAction(
  monthStates: MonthState[],
  profile: FinancialProfile | null
): string {
  if (!profile) return 'Complete your onboarding to get a personalized action.'

  const finalState = monthStates[monthStates.length - 1]
  if (!finalState) return 'Play the game to get a suggested action.'

  const debtReduction = monthStates.reduce((sum, s, i) => {
    const prev = i === 0 ? (profile.debt.total) : monthStates[i - 1].debtBalance
    return sum + Math.max(0, prev - s.debtBalance)
  }, 0)

  if (debtReduction > 0 && profile.debt.total > 0) {
    const extraPerMonth = Math.round(debtReduction / 12)
    return `If you made an extra ${formatCurrencyFull(extraPerMonth)} debt payment each month, you could replicate your game progress in real life.`
  }

  if (finalState.savingsBalance > profile.savings.total * 1.2) {
    const extraSavings = Math.round((finalState.savingsBalance - profile.savings.total) / 12)
    return `Setting aside an extra ${formatCurrencyFull(extraSavings)}/mo in savings would mirror your best game outcome.`
  }

  return 'Open the Simulator to explore the most impactful change for your specific numbers.'
}
