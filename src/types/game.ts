export type DecisionType = 'save' | 'invest' | 'spend' | 'risk' | 'protect'
export type CardStatus = 'idle' | 'resolved-positive' | 'resolved-negative' | 'risk-pending'
export type ImpactColor = 'accent' | 'negative' | 'neutral' | 'risk'

export interface MonthlyModifier {
  field: 'cash' | 'savings' | 'debt' | 'investment'
  delta: number
  durationMonths: number
}

export interface DecisionEffect {
  cashDelta: number
  savingsDelta: number
  debtDelta: number
  investmentDelta: number
  scoreModifier: number
  monthlyModifier?: MonthlyModifier
  isRisk?: boolean
  riskProbability?: number
  riskWinEffect?: DecisionEffect
  riskLossEffect?: DecisionEffect
}

export interface DecisionOption {
  id: string
  label: string
  impactSummary: string
  impactColor: ImpactColor
  effect: DecisionEffect
}

export interface DecisionCard {
  id: string
  type: DecisionType
  title: string
  description: string
  options: DecisionOption[]
  learnMore: string
}

export interface AppliedDecision {
  cardId: string
  optionId: string
  resolvedEffect: DecisionEffect
  status: CardStatus
}

export interface MonthState {
  month: number
  cash: number
  savingsBalance: number
  debtBalance: number
  investmentBalance: number
  monthScore: number
  decisions: AppliedDecision[]
}

export interface ScoreBreakdown {
  savingsScore: number
  debtScore: number
  investmentScore: number
  resilienceScore: number
  total: number
}

export interface Badge {
  id: string
  label: string
  description: string
  condition: string
}

export interface EarnedBadge {
  badge: Badge
  earnedInMonth: number
}

export interface GameSeed {
  startingCash: number
  startingDebt: number
  startingSavings: number
  startingInvestments: number
  monthlyIncome: number
  monthlyFixedExpenses: number
}
