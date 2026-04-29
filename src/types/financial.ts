export type DebtType = 'credit-card' | 'student-loan' | 'car-loan' | 'personal-loan' | 'medical' | 'other'

export interface DebtEntry {
  id: string
  type: DebtType
  balance: number
  minimumPayment: number
  interestRate?: number
}

export interface IncomeSource {
  label: string
  amount: number
}

export interface FinancialProfile {
  income: {
    primary: number
    additional: IncomeSource[]
    total: number
  }
  expenses: {
    fixed: number
    variable: number
    total: number
  }
  debt: {
    entries: DebtEntry[]
    total: number
    totalMinimumPayments: number
    hasNoDebt: boolean
  }
  savings: {
    emergency: number
    other: number
    investments: number
    retirement: number
    total: number
  }
  createdAt: number
}

export interface ScenarioInput {
  income: number
  fixedExpenses: number
  variableExpenses: number
  extraDebtPayment: number
  monthlySavings: number
  monthlyInvestment: number
}

export interface MonthlyProjection {
  month: number
  cashFlow: number
  netWorth: number
  savingsBalance: number
  debtBalance: number
  investmentBalance: number
}
