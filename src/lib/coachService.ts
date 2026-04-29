import type { CoachContext, Message } from '../types/coach'
import { formatCurrencyFull, formatPercent } from './financialCalc'

function delay(ms: number) {
  return new Promise(r => setTimeout(r, ms))
}

// ─── Intent matching ──────────────────────────────────────────────────────────

function matchIntent(message: string): string {
  const lower = message.toLowerCase()
  if (/debt|owe|credit card|loan|pay off/.test(lower))     return 'debt'
  if (/sav|emergency fund|buffer|cushion/.test(lower))     return 'savings'
  if (/invest|stock|market|401k|ira|roth|portfolio/.test(lower)) return 'invest'
  if (/budget|spend|expense|cut|reduce|dining/.test(lower)) return 'budget'
  if (/score|game|month|result|performance/.test(lower))   return 'game'
  if (/cash flow|income|earn|salary|wage/.test(lower))     return 'cashflow'
  if (/net worth|wealth|rich|progress/.test(lower))        return 'networth'
  return 'general'
}

// ─── Response generators ──────────────────────────────────────────────────────

function respondDebt(ctx: CoachContext): string {
  const p = ctx.financialProfile
  if (!p) return "To give you debt-specific advice, I'll need your financial profile. Complete your onboarding first."

  const { totalDebt, debtToIncome } = p
  if (totalDebt === 0) return "Your profile shows no debt. That's a strong position — the next move is directing that freed cash flow toward investments and savings."

  const lines = [
    `Your total debt is ${formatCurrencyFull(totalDebt)} with a debt-to-income ratio of ${formatPercent(debtToIncome, 1)}.`,
    '',
    debtToIncome < 20
      ? 'Your DTI is in a healthy range. You have room to accelerate debt reduction or redirect to investments.'
      : debtToIncome < 35
      ? 'Your DTI is in a caution zone. Prioritizing extra debt payments before new investments is the right call.'
      : 'Your DTI is elevated. Aggressive debt reduction should be the primary focus before any discretionary investing.',
    '',
    'The most effective approach depends on interest rates:',
    '• High-interest debt (>7%): pay off before investing outside tax-advantaged accounts.',
    '• Low-interest debt (<4%): minimum payments only — invest the surplus.',
    '• Between 4–7%: split your surplus 50/50.',
  ]
  return lines.join('\n')
}

function respondSavings(ctx: CoachContext): string {
  const p = ctx.financialProfile
  if (!p) return "Complete your financial profile to get savings advice specific to your situation."

  const { emergencyCoverage, savingsRate, totalSavings } = p
  const lines = [
    `Your emergency fund covers ${emergencyCoverage.toFixed(1)} months of expenses. Target: 3 months minimum, 6 months for stability.`,
    '',
    emergencyCoverage < 1
      ? 'Your immediate priority is building emergency savings before anything else. Even $50/mo makes a difference.'
      : emergencyCoverage < 3
      ? 'You\'re building — keep going. Once you hit 3 months, you can start diverting surplus to investments.'
      : 'Your emergency fund is solid. You\'re ready to prioritize investing while maintaining this buffer.',
    '',
    `Your current savings rate is approximately ${formatPercent(savingsRate, 1)}. `,
    savingsRate < 10
      ? 'Below 10% is a warning sign. Small cuts to variable expenses often unlock meaningful savings capacity.'
      : savingsRate < 20
      ? 'You\'re saving, but there\'s room to grow. The 20% savings rate is the benchmark most financial planners use.'
      : `Strong savings rate. At this pace, your ${formatCurrencyFull(totalSavings)} total savings will compound meaningfully.`,
  ]
  return lines.join('\n')
}

function respondInvest(ctx: CoachContext): string {
  const p = ctx.financialProfile
  if (!p) return "Your investment guidance depends on your debt and savings position. Complete your profile to get specific advice."

  const { totalDebt, emergencyCoverage, debtToIncome } = p
  const lines: string[] = []

  lines.push('Investment priority order for your situation:')
  lines.push('')
  lines.push('1. Emergency fund first (currently ' + (emergencyCoverage >= 3 ? 'secure' : emergencyCoverage >= 1 ? 'building' : 'critical') + ')')
  lines.push('2. Capture any employer 401(k) match — that\'s a guaranteed 50-100% return')
  if (totalDebt > 0 && debtToIncome > 20) {
    lines.push('3. Pay down high-interest debt (your DTI suggests this should come before taxable investing)')
  }
  lines.push('3. Max Roth IRA: $7,000/year limit, tax-free growth')
  lines.push('4. Max 401(k): $23,000/year limit, tax-deferred growth')
  lines.push('5. Taxable brokerage account: no limit, full flexibility')
  lines.push('')
  lines.push('For the actual investments: a 3-fund portfolio (US total market + international + bonds) or a target-date fund are both well-documented approaches with low fees and broad diversification.')

  return lines.join('\n')
}

function respondBudget(ctx: CoachContext): string {
  const p = ctx.financialProfile
  if (!p) return "Budget advice becomes specific with your actual numbers. Complete your profile first."

  const { monthlyCashFlow, totalDebt } = p
  const lines = [
    `Your current monthly cash flow is ${formatCurrencyFull(monthlyCashFlow)}.`,
    '',
    monthlyCashFlow < 0
      ? 'You\'re spending more than you earn. This is the first thing to fix — every other financial goal is blocked by negative cash flow.'
      : monthlyCashFlow < 200
      ? 'Tight margins. Look at variable expenses first — they\'re the most adjustable. Dining, entertainment, and subscriptions are typically the fastest wins.'
      : 'You have positive cash flow. The question is whether that surplus is being directed intentionally or absorbed by lifestyle spending.',
    '',
    'The 50/30/20 framework as a starting benchmark:',
    '• 50% of take-home to needs (housing, utilities, food, minimum debt payments)',
    '• 30% to wants (dining, entertainment, subscriptions)',
    '• 20% to savings and extra debt payments',
    '',
    totalDebt > 0
      ? `With ${formatCurrencyFull(totalDebt)} in debt, I'd suggest targeting 25-30% for savings + debt rather than 20%.`
      : 'With no debt, the 20% savings target gives you full flexibility for investing.',
  ]
  return lines.join('\n')
}

function respondGame(ctx: CoachContext): string {
  const g = ctx.gameHistory
  if (!g || !g.completed) return "Complete the 12-month game first and I'll give you a full debrief of your decisions."

  const lines = [
    `Your final game score was ${g.score}/100.`,
    '',
    g.score >= 80
      ? 'Excellent execution. The decisions that drove your score were likely consistent savings, debt reduction, and avoiding impulse spending.'
      : g.score >= 60
      ? 'Solid performance. A few months likely pulled your average down — these are worth reviewing in the Journey tab.'
      : g.score >= 40
      ? 'Mixed results. The adversity months (7-9) are often where scores drop — unexpected expenses reveal whether earlier decisions built a buffer or left you exposed.'
      : 'Challenging run. The good news: you now know exactly which patterns cost you. The game is designed to make these visible.',
    '',
    `Your net worth changed by ${formatCurrencyFull(g.netWorthChange)} over the 12 months.`,
    '',
    'The most valuable part of the game isn\'t the score — it\'s seeing how compounding works in both directions. Ask me about any specific month or decision you want to understand.',
  ]
  return lines.join('\n')
}

function respondCashFlow(ctx: CoachContext): string {
  const p = ctx.financialProfile
  if (!p) return "Complete your profile to discuss your cash flow specifics."

  const { monthlyIncome, monthlyCashFlow } = p
  const retentionRate = (monthlyCashFlow / monthlyIncome) * 100

  const lines = [
    `Monthly income: ${formatCurrencyFull(monthlyIncome)}`,
    `Monthly cash flow after expenses and debt: ${formatCurrencyFull(monthlyCashFlow)}`,
    `Retention rate: ${formatPercent(retentionRate, 1)} of income`,
    '',
    retentionRate < 5
      ? 'Very tight. There\'s little room for unexpected costs without going negative. Building even a $500 buffer should be the immediate focus.'
      : retentionRate < 15
      ? 'Functional but constrained. A single unexpected expense at this level puts pressure on the system.'
      : retentionRate < 25
      ? 'Reasonable. The question is whether the retained income is being directed or drifting into untracked spending.'
      : 'Strong retention rate. Focus on directing this surplus intentionally — unmanaged surpluses have a way of disappearing into lifestyle inflation.',
  ]
  return lines.join('\n')
}

function respondNetWorth(ctx: CoachContext): string {
  const p = ctx.financialProfile
  if (!p) return "Complete your profile to discuss your net worth position."

  const netWorth = p.totalSavings - p.totalDebt
  const lines = [
    `Estimated net worth: ${formatCurrencyFull(netWorth)}`,
    '',
    netWorth < 0
      ? 'You\'re net-negative — your liabilities exceed your assets. This is normal early in a career but becomes a constraint over time. The path forward is simultaneous: reduce liabilities (debt payments) and grow assets (savings + investments).'
      : netWorth < 10000
      ? 'You\'re net-positive but in early stages. Every month of positive cash flow directed to savings or debt reduction compresses the timeline significantly.'
      : `${formatCurrencyFull(netWorth)} is a meaningful base. The growth rate from here depends on your savings rate and investment returns.`,
    '',
    'Net worth is the single number that matters most over time. Income is a flow; net worth is a stock. Building it requires consistently directing the flow.',
  ]
  return lines.join('\n')
}

function respondGeneral(ctx: CoachContext): string {
  const p = ctx.financialProfile
  if (!p) return "I\'m FinSight AI Coach. Complete your financial profile and I can give you specific, personalized guidance. For now, feel free to ask me about budgeting, debt, savings, investing, or your game results."

  return [
    "Happy to help with that.",
    "",
    "Based on your profile, the three areas most worth attention right now are:",
    p.emergencyCoverage < 3 ? "• Building your emergency fund to 3 months of coverage" : "• Your emergency fund is solid — maintain it",
    p.debtToIncome > 20 ? "• Reducing your debt-to-income ratio below 20%" : "• Your DTI is healthy — focus on investing the surplus",
    p.savingsRate < 15 ? "• Increasing your savings rate toward 20%" : "• Maintaining your strong savings rate",
    "",
    "Ask me about any of these specifically and I'll give you the numbers behind the recommendation.",
  ].join('\n')
}

// ─── Context builder ──────────────────────────────────────────────────────────

export function buildWelcomeMessage(ctx: CoachContext): string {
  const p = ctx.financialProfile
  const g = ctx.gameHistory

  const lines = ['Welcome to FinSight AI Coach.', '']

  if (p) {
    lines.push('I have access to your financial profile:')
    lines.push(`• Monthly income: ${formatCurrencyFull(p.monthlyIncome)}`)
    lines.push(`• Monthly cash flow: ${formatCurrencyFull(p.monthlyCashFlow)} ${p.monthlyCashFlow >= 0 ? '(surplus)' : '(shortfall)'}`)
    lines.push(`• Total debt: ${formatCurrencyFull(p.totalDebt)}`)
    lines.push(`• Total savings: ${formatCurrencyFull(p.totalSavings)}`)
  } else {
    lines.push('I don\'t have your financial profile yet.')
    lines.push('Complete your onboarding to get personalized guidance.')
  }

  if (g?.completed) {
    lines.push('')
    lines.push(`I\'ve also reviewed your 12-month game results. Your score was ${g.score}/100.`)
  }

  lines.push('')
  lines.push('What would you like to understand or work through today?')

  return lines.join('\n')
}

// ─── Main service function ────────────────────────────────────────────────────

export async function coachRespond(
  context: CoachContext,
  _history: Message[],
  userMessage: string
): Promise<string> {
  const delayMs = 800 + Math.random() * 1000
  await delay(delayMs)

  const intent = matchIntent(userMessage)

  switch (intent) {
    case 'debt':      return respondDebt(context)
    case 'savings':   return respondSavings(context)
    case 'invest':    return respondInvest(context)
    case 'budget':    return respondBudget(context)
    case 'game':      return respondGame(context)
    case 'cashflow':  return respondCashFlow(context)
    case 'networth':  return respondNetWorth(context)
    default:          return respondGeneral(context)
  }
}
