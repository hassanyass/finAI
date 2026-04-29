import type { Badge } from '../types/game'

export const BADGES: Badge[] = [
  {
    id: 'first-safety-net',
    label: 'First Safety Net',
    description: 'Emergency fund covers at least 1 month of expenses',
    condition: 'savingsBalance >= 1 month coverage',
  },
  {
    id: 'debt-fighter',
    label: 'Debt Fighter',
    description: 'Made extra debt payments beyond the minimum',
    condition: 'Extra debt payment applied in any month',
  },
  {
    id: 'investor',
    label: 'Investor',
    description: 'Grew your investment balance',
    condition: 'Investment balance increased in any month',
  },
  {
    id: 'steady',
    label: 'Steady',
    description: 'Maintained positive cash flow for all 12 months',
    condition: 'No negative cash flow months',
  },
  {
    id: 'clean-slate',
    label: 'Clean Slate',
    description: 'Paid off all debt during the simulation',
    condition: 'debtBalance reaches 0',
  },
  {
    id: 'perfect-month',
    label: 'Perfect Month',
    description: 'Scored 85 or above in a single month',
    condition: 'monthScore >= 85',
  },
  {
    id: 'long-game',
    label: 'Long Game',
    description: 'Net worth grew every single month for 12 months',
    condition: 'Net worth increased in all 12 months',
  },
  {
    id: 'resilient',
    label: 'Resilient',
    description: 'Survived an adversity month with positive cash flow',
    condition: 'Positive cash flow in months 7-9',
  },
]
