import type { FinancialProfile, ScenarioInput, MonthlyProjection } from '../types/financial'

// ─── Profile-level calculations ────────────────────────────────────────────

export function calcMonthlyCashFlow(p: FinancialProfile): number {
  return p.income.total - p.expenses.total - p.debt.totalMinimumPayments
}

export function calcDTI(p: FinancialProfile): number {
  if (p.income.total === 0) return 0
  return (p.debt.totalMinimumPayments / p.income.total) * 100
}

export function calcNetWorth(p: FinancialProfile): number {
  return p.savings.total - p.debt.total
}

export function calcEmergencyCoverage(p: FinancialProfile): number {
  if (p.expenses.total === 0) return 0
  return p.savings.emergency / p.expenses.total
}

export function calcSavingsRate(p: FinancialProfile): number {
  if (p.income.total === 0) return 0
  const retained = p.income.total - p.expenses.total - p.debt.totalMinimumPayments
  return Math.max(0, (retained / p.income.total) * 100)
}

export function calcDebtShare(balance: number, total: number): number {
  if (total === 0) return 0
  return (balance / total) * 100
}

// ─── DTI threshold label ────────────────────────────────────────────────────

export function dtiLabel(dti: number): { label: string; color: 'accent' | 'risk' | 'negative' } {
  if (dti < 20) return { label: 'Healthy', color: 'accent' }
  if (dti < 35) return { label: 'Caution', color: 'risk' }
  return { label: 'High', color: 'negative' }
}

export function coverageLabel(months: number): { label: string; color: 'accent' | 'risk' | 'negative' } {
  if (months >= 3)  return { label: 'Secure',   color: 'accent' }
  if (months >= 1)  return { label: 'Building', color: 'risk' }
  return { label: 'Critical', color: 'negative' }
}

export function savingsRateLabel(rate: number): { label: string; color: 'accent' | 'risk' | 'negative' } {
  if (rate >= 20) return { label: 'Strong', color: 'accent' }
  if (rate >= 10) return { label: 'Fair',   color: 'risk' }
  return { label: 'Low', color: 'negative' }
}

// ─── Scenario projection ────────────────────────────────────────────────────

const INVESTMENT_ANNUAL_RATE = 0.07
const SAVINGS_ANNUAL_RATE    = 0.02
const MONTHLY_INVESTMENT_RATE = INVESTMENT_ANNUAL_RATE / 12
const MONTHLY_SAVINGS_RATE    = SAVINGS_ANNUAL_RATE / 12

export function projectScenario(
  baseline: FinancialProfile,
  scenario: ScenarioInput
): MonthlyProjection[] {
  let savingsBalance  = baseline.savings.emergency + baseline.savings.other
  let debtBalance     = baseline.debt.total
  let investBalance   = baseline.savings.investments + baseline.savings.retirement
  const minPayments   = baseline.debt.totalMinimumPayments

  const projections: MonthlyProjection[] = []

  for (let month = 1; month <= 12; month++) {
    // Income and fixed costs
    const income   = scenario.income
    const fixed    = scenario.fixedExpenses
    const variable = scenario.variableExpenses
    const minPay   = debtBalance > 0 ? Math.min(minPayments, debtBalance) : 0
    const extra    = debtBalance > 0 ? Math.min(scenario.extraDebtPayment, debtBalance - minPay) : 0

    // Apply debt payments
    debtBalance = Math.max(0, debtBalance - minPay - extra)

    // Redirect freed debt payment to savings if debt is gone
    const freedCash = debtBalance === 0 && minPay > 0 ? minPay + extra : 0

    // Apply savings and investment contributions
    const savingsContrib = scenario.monthlySavings + freedCash
    const investContrib  = scenario.monthlyInvestment

    savingsBalance  = savingsBalance * (1 + MONTHLY_SAVINGS_RATE) + savingsContrib
    investBalance   = investBalance  * (1 + MONTHLY_INVESTMENT_RATE) + investContrib

    // Net monthly cash flow
    const cashFlow = income - fixed - variable - minPay - extra - savingsContrib - investContrib

    const netWorth = savingsBalance + investBalance - debtBalance

    projections.push({
      month,
      cashFlow: Math.round(cashFlow),
      netWorth: Math.round(netWorth),
      savingsBalance: Math.round(savingsBalance),
      debtBalance: Math.round(debtBalance),
      investmentBalance: Math.round(investBalance),
    })
  }

  return projections
}

export function baselineProjection(profile: FinancialProfile): MonthlyProjection[] {
  return projectScenario(profile, {
    income:            profile.income.total,
    fixedExpenses:     profile.expenses.fixed,
    variableExpenses:  profile.expenses.variable,
    extraDebtPayment:  0,
    monthlySavings:    0,
    monthlyInvestment: 0,
  })
}

// ─── Formatting helpers ─────────────────────────────────────────────────────

export function formatCurrency(n: number): string {
  const abs = Math.abs(n)
  const sign = n < 0 ? '-' : ''
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(1)}M`
  if (abs >= 1_000)     return `${sign}$${(abs / 1_000).toFixed(1)}K`
  return `${sign}$${abs.toFixed(0)}`
}

export function formatCurrencyFull(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

export function formatPercent(n: number, decimals = 1): string {
  return `${n.toFixed(decimals)}%`
}
