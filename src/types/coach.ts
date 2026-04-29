export interface Message {
  id: string
  role: 'user' | 'coach'
  content: string
  timestamp: number
}

export interface CoachFinancialSummary {
  monthlyIncome: number
  monthlyCashFlow: number
  totalDebt: number
  totalSavings: number
  debtToIncome: number
  emergencyCoverage: number
  savingsRate: number
}

export interface CoachGameHistory {
  score: number
  netWorthChange: number
  completed: boolean
}

export interface CoachContext {
  financialProfile: CoachFinancialSummary | null
  gameHistory: CoachGameHistory | null
}
