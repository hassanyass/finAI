import type { DecisionCard } from '../types/game'

export interface MonthDecisions {
  month: number
  contextNote: string
  decisions: DecisionCard[]
}

export const DECISION_TREE: MonthDecisions[] = [
  {
    month: 1,
    contextNote: "You've just reviewed your finances. January is a clean slate — small choices now build habits.",
    decisions: [
      {
        id: 'm1-d1',
        type: 'save',
        title: 'Emergency Fund',
        description: 'You have no emergency cushion. An unexpected expense right now would force you into debt.',
        options: [
          {
            id: 'm1-d1-a',
            label: 'Set aside $200/mo',
            impactSummary: '-$200 cash, +$200 savings',
            impactColor: 'accent',
            effect: { cashDelta: -200, savingsDelta: 200, debtDelta: 0, investmentDelta: 0, scoreModifier: 18 },
          },
          {
            id: 'm1-d1-b',
            label: 'Skip for now',
            impactSummary: 'No change this month',
            impactColor: 'neutral',
            effect: { cashDelta: 0, savingsDelta: 0, debtDelta: 0, investmentDelta: 0, scoreModifier: -5 },
          },
        ],
        learnMore: 'An emergency fund of 3-6 months of expenses prevents a single crisis from cascading into debt. It is the single most impactful financial move for most people.',
      },
      {
        id: 'm1-d2',
        type: 'spend',
        title: 'Subscription Audit',
        description: 'You notice you pay for 6 streaming services and a gym you rarely use.',
        options: [
          {
            id: 'm1-d2-a',
            label: 'Cancel 3 subscriptions',
            impactSummary: '+$45/mo cash flow',
            impactColor: 'accent',
            effect: { cashDelta: 45, savingsDelta: 0, debtDelta: 0, investmentDelta: 0, scoreModifier: 10,
              monthlyModifier: { field: 'cash', delta: 45, durationMonths: 11 } },
          },
          {
            id: 'm1-d2-b',
            label: 'Keep everything',
            impactSummary: 'No change',
            impactColor: 'neutral',
            effect: { cashDelta: 0, savingsDelta: 0, debtDelta: 0, investmentDelta: 0, scoreModifier: 0 },
          },
        ],
        learnMore: 'Subscription creep is one of the most common ways variable expenses silently grow. A quarterly audit keeps spending aligned with actual usage.',
      },
    ],
  },
  {
    month: 2,
    contextNote: "February arrives. Your habits are forming. The decisions you made last month have consequences.",
    decisions: [
      {
        id: 'm2-d1',
        type: 'spend',
        title: 'Dining Out Habit',
        description: 'You spend $320/mo eating out. A meal prep routine could cut that significantly.',
        options: [
          {
            id: 'm2-d1-a',
            label: 'Meal prep: cut to $150/mo',
            impactSummary: '+$170/mo cash flow',
            impactColor: 'accent',
            effect: { cashDelta: 170, savingsDelta: 0, debtDelta: 0, investmentDelta: 0, scoreModifier: 12,
              monthlyModifier: { field: 'cash', delta: 170, durationMonths: 10 } },
          },
          {
            id: 'm2-d1-b',
            label: 'Keep current habits',
            impactSummary: 'No change',
            impactColor: 'neutral',
            effect: { cashDelta: 0, savingsDelta: 0, debtDelta: 0, investmentDelta: 0, scoreModifier: -3 },
          },
        ],
        learnMore: 'Dining out is one of the largest discretionary expense categories for most households. Even a 30% reduction frees significant cash for saving or debt repayment.',
      },
      {
        id: 'm2-d2',
        type: 'protect',
        title: 'Renters Insurance',
        description: 'You don\'t have renters insurance. A $15/mo policy covers $30,000 in belongings.',
        options: [
          {
            id: 'm2-d2-a',
            label: 'Get covered (-$15/mo)',
            impactSummary: '-$15/mo, risk protected',
            impactColor: 'neutral',
            effect: { cashDelta: -15, savingsDelta: 0, debtDelta: 0, investmentDelta: 0, scoreModifier: 8,
              monthlyModifier: { field: 'cash', delta: -15, durationMonths: 10 } },
          },
          {
            id: 'm2-d2-b',
            label: 'Skip insurance',
            impactSummary: 'Risk unprotected',
            impactColor: 'risk',
            effect: { cashDelta: 0, savingsDelta: 0, debtDelta: 0, investmentDelta: 0, scoreModifier: -2 },
          },
        ],
        learnMore: 'Protection decisions have a negative monthly cost but prevent catastrophic single-event losses. The math is asymmetric: a small consistent cost vs. a large rare one.',
      },
    ],
  },
  {
    month: 3,
    contextNote: "Three months in. The compound effect of your decisions is beginning to show.",
    decisions: [
      {
        id: 'm3-d1',
        type: 'save',
        title: 'Automate Savings',
        description: 'You can set up an automatic transfer to savings each payday, before you can spend it.',
        options: [
          {
            id: 'm3-d1-a',
            label: 'Automate $300/mo',
            impactSummary: '-$300 cash, +$300 savings',
            impactColor: 'accent',
            effect: { cashDelta: -300, savingsDelta: 300, debtDelta: 0, investmentDelta: 0, scoreModifier: 22,
              monthlyModifier: { field: 'cash', delta: -300, durationMonths: 9 } },
          },
          {
            id: 'm3-d1-b',
            label: 'Save manually when possible',
            impactSummary: '-$100 cash, +$100 savings',
            impactColor: 'neutral',
            effect: { cashDelta: -100, savingsDelta: 100, debtDelta: 0, investmentDelta: 0, scoreModifier: 8 },
          },
        ],
        learnMore: 'Automated savings removes willpower from the equation. Studies show people consistently save more when the decision is made once, not monthly.',
      },
      {
        id: 'm3-d2',
        type: 'spend',
        title: 'Transportation Review',
        description: 'Your commute costs $280/mo. Remote work 2 days/week could cut that by $110.',
        options: [
          {
            id: 'm3-d2-a',
            label: 'Negotiate remote days',
            impactSummary: '+$110/mo cash flow',
            impactColor: 'accent',
            effect: { cashDelta: 110, savingsDelta: 0, debtDelta: 0, investmentDelta: 0, scoreModifier: 10,
              monthlyModifier: { field: 'cash', delta: 110, durationMonths: 9 } },
          },
          {
            id: 'm3-d2-b',
            label: 'Keep current arrangement',
            impactSummary: 'No change',
            impactColor: 'neutral',
            effect: { cashDelta: 0, savingsDelta: 0, debtDelta: 0, investmentDelta: 0, scoreModifier: 0 },
          },
        ],
        learnMore: 'Transportation is usually the 2nd or 3rd largest expense after housing. Even a modest reduction in commuting frequency has meaningful compounding effects over a year.',
      },
    ],
  },
  {
    month: 4,
    contextNote: "Growth phase begins. You have some breathing room — now comes the question of what to do with it.",
    decisions: [
      {
        id: 'm4-d1',
        type: 'invest',
        title: '401(k) Match',
        description: 'Your employer matches 50% of contributions up to 6% of your salary. You\'re only contributing 3%.',
        options: [
          {
            id: 'm4-d1-a',
            label: 'Increase to 6% to get full match',
            impactSummary: '-$150/mo cash, +$225/mo invested',
            impactColor: 'accent',
            effect: { cashDelta: -150, savingsDelta: 0, debtDelta: 0, investmentDelta: 225, scoreModifier: 25,
              monthlyModifier: { field: 'cash', delta: -150, durationMonths: 8 } },
          },
          {
            id: 'm4-d1-b',
            label: 'Keep at 3%',
            impactSummary: 'Leave employer match on the table',
            impactColor: 'negative',
            effect: { cashDelta: 0, savingsDelta: 0, debtDelta: 0, investmentDelta: 0, scoreModifier: -8 },
          },
        ],
        learnMore: 'Employer matching is a 50-100% instant return on investment. Not capturing it is the equivalent of leaving part of your salary unclaimed. It is universally the first investment priority.',
      },
      {
        id: 'm4-d2',
        type: 'spend',
        title: 'New Phone Upgrade',
        description: 'Your phone works fine. The new model costs $900 upfront or $35/mo on a payment plan.',
        options: [
          {
            id: 'm4-d2-a',
            label: 'Skip the upgrade',
            impactSummary: 'No impact — keep savings',
            impactColor: 'accent',
            effect: { cashDelta: 0, savingsDelta: 0, debtDelta: 0, investmentDelta: 0, scoreModifier: 12 },
          },
          {
            id: 'm4-d2-b',
            label: 'Take payment plan',
            impactSummary: '-$35/mo cash for 24 months',
            impactColor: 'negative',
            effect: { cashDelta: -35, savingsDelta: 0, debtDelta: 35, investmentDelta: 0, scoreModifier: -6,
              monthlyModifier: { field: 'cash', delta: -35, durationMonths: 8 } },
          },
        ],
        learnMore: 'Payment plans feel cheap but extend your fixed expense base and often include interest. The question to ask: "Does this asset generate returns, or does it depreciate?"',
      },
    ],
  },
  {
    month: 5,
    contextNote: "You\'re nearly halfway through. The decisions you've made are compounding — both for better and worse.",
    decisions: [
      {
        id: 'm5-d1',
        type: 'invest',
        title: 'Index Fund Investment',
        description: 'Your emergency fund is building. You have cash available. The market is accessible.',
        options: [
          {
            id: 'm5-d1-a',
            label: 'Invest $200/mo in index fund',
            impactSummary: '-$200 cash, +$200 invested',
            impactColor: 'accent',
            effect: { cashDelta: -200, savingsDelta: 0, debtDelta: 0, investmentDelta: 200, scoreModifier: 20,
              monthlyModifier: { field: 'cash', delta: -200, durationMonths: 7 } },
          },
          {
            id: 'm5-d1-b',
            label: 'Hold cash instead',
            impactSummary: 'Cash stays liquid',
            impactColor: 'neutral',
            effect: { cashDelta: 0, savingsDelta: 0, debtDelta: 0, investmentDelta: 0, scoreModifier: 2 },
          },
        ],
        learnMore: 'Index funds provide broad market exposure at minimal cost. Time in the market consistently outperforms attempts to time the market. The best time to start is when you have stable cash flow.',
      },
      {
        id: 'm5-d2',
        type: 'save',
        title: 'High-Interest Debt',
        description: 'You carry a $3,200 credit card balance at 22% APR. Extra payments compound in your favor.',
        options: [
          {
            id: 'm5-d2-a',
            label: 'Pay extra $300 this month',
            impactSummary: '-$300 cash, -$300 debt',
            impactColor: 'accent',
            effect: { cashDelta: -300, savingsDelta: 0, debtDelta: -300, investmentDelta: 0, scoreModifier: 22 },
          },
          {
            id: 'm5-d2-b',
            label: 'Pay minimum only',
            impactSummary: 'Interest keeps accumulating',
            impactColor: 'negative',
            effect: { cashDelta: 0, savingsDelta: 0, debtDelta: 0, investmentDelta: 0, scoreModifier: -5 },
          },
        ],
        learnMore: 'Paying extra on a 22% APR card is the same as earning 22% guaranteed — no investment in the market reliably returns that. High-interest debt always takes priority over non-tax-advantaged investing.',
      },
    ],
  },
  {
    month: 6,
    contextNote: "Halfway mark. Assess what\'s working. One key decision this month has lasting implications.",
    decisions: [
      {
        id: 'm6-d1',
        type: 'risk',
        title: 'Freelance Project',
        description: 'A contact offers you a freelance project. It will take 15 hours but the payment is uncertain.',
        options: [
          {
            id: 'm6-d1-a',
            label: 'Take the project',
            impactSummary: '60% chance: +$800, 40% chance: +$0',
            impactColor: 'risk',
            effect: {
              cashDelta: 0, savingsDelta: 0, debtDelta: 0, investmentDelta: 0, scoreModifier: 0,
              isRisk: true, riskProbability: 0.6,
              riskWinEffect: { cashDelta: 800, savingsDelta: 0, debtDelta: 0, investmentDelta: 0, scoreModifier: 20 },
              riskLossEffect: { cashDelta: 0, savingsDelta: 0, debtDelta: 0, investmentDelta: 0, scoreModifier: -3 },
            },
          },
          {
            id: 'm6-d1-b',
            label: 'Decline',
            impactSummary: 'No risk, no reward',
            impactColor: 'neutral',
            effect: { cashDelta: 0, savingsDelta: 0, debtDelta: 0, investmentDelta: 0, scoreModifier: 2 },
          },
        ],
        learnMore: 'Variable income from side work has an expected value (probability × payout). Even if this one pays out, the key question is: can you absorb the loss case without disrupting your plan?',
      },
      {
        id: 'm6-d2',
        type: 'save',
        title: 'Half-Year Review',
        description: 'You\'ve hit 6 months. Redirect some of your freed-up cash to hit your savings targets faster.',
        options: [
          {
            id: 'm6-d2-a',
            label: 'Push savings to $500/mo',
            impactSummary: '-$200 extra cash, +$200 savings',
            impactColor: 'accent',
            effect: { cashDelta: -200, savingsDelta: 200, debtDelta: 0, investmentDelta: 0, scoreModifier: 18 },
          },
          {
            id: 'm6-d2-b',
            label: 'Maintain current rate',
            impactSummary: 'No change',
            impactColor: 'neutral',
            effect: { cashDelta: 0, savingsDelta: 0, debtDelta: 0, investmentDelta: 0, scoreModifier: 5 },
          },
        ],
        learnMore: 'Mid-year reviews matter because you now have 6 months of actual data — not estimates. Adjusting your plan based on reality is more effective than sticking to a plan that no longer fits.',
      },
    ],
  },
  {
    month: 7,
    contextNote: "Adversity month. Your car needs repairs. Real financial resilience is tested when things go wrong.",
    decisions: [
      {
        id: 'm7-d1',
        type: 'risk',
        title: 'Unexpected Car Repair',
        description: 'Your car needs a $1,100 repair. You have options — but each has a cost.',
        options: [
          {
            id: 'm7-d1-a',
            label: 'Pay from emergency fund',
            impactSummary: '-$1,100 savings',
            impactColor: 'negative',
            effect: { cashDelta: 0, savingsDelta: -1100, debtDelta: 0, investmentDelta: 0, scoreModifier: 15 },
          },
          {
            id: 'm7-d1-b',
            label: 'Put it on credit card',
            impactSummary: '-$1,100 immediate, +$1,100 debt',
            impactColor: 'negative',
            effect: { cashDelta: -1100, savingsDelta: 0, debtDelta: 1100, investmentDelta: 0, scoreModifier: -15 },
          },
        ],
        learnMore: 'This is exactly what an emergency fund exists for. Using savings here is the right move — the fund takes a hit, but you don\'t accumulate interest-bearing debt. Now rebuild it.',
      },
      {
        id: 'm7-d2',
        type: 'protect',
        title: 'Health Check: Insurance Gap',
        description: 'Your health insurance has a $2,500 deductible. A supplemental plan fills this gap for $28/mo.',
        options: [
          {
            id: 'm7-d2-a',
            label: 'Add gap coverage',
            impactSummary: '-$28/mo, $2,500 risk covered',
            impactColor: 'neutral',
            effect: { cashDelta: -28, savingsDelta: 0, debtDelta: 0, investmentDelta: 0, scoreModifier: 10,
              monthlyModifier: { field: 'cash', delta: -28, durationMonths: 5 } },
          },
          {
            id: 'm7-d2-b',
            label: 'Accept the risk',
            impactSummary: 'Exposed to $2,500 deductible',
            impactColor: 'risk',
            effect: { cashDelta: 0, savingsDelta: 0, debtDelta: 0, investmentDelta: 0, scoreModifier: -2 },
          },
        ],
        learnMore: 'Insurance decisions are about asymmetric risk management. A known small monthly cost vs. an unknown large single cost. The key question is whether you could absorb the large cost.',
      },
    ],
  },
  {
    month: 8,
    contextNote: "Still in the adversity stretch. A job opportunity arrives — it\'s not without risk.",
    decisions: [
      {
        id: 'm8-d1',
        type: 'risk',
        title: 'Job Offer',
        description: 'A competitor offers you a role. More pay, but a 3-month probation period with uncertainty.',
        options: [
          {
            id: 'm8-d1-a',
            label: 'Accept the offer',
            impactSummary: '70% chance: +$400/mo, 30% chance: -$200/mo',
            impactColor: 'risk',
            effect: {
              cashDelta: 0, savingsDelta: 0, debtDelta: 0, investmentDelta: 0, scoreModifier: 0,
              isRisk: true, riskProbability: 0.7,
              riskWinEffect: { cashDelta: 400, savingsDelta: 0, debtDelta: 0, investmentDelta: 0, scoreModifier: 22,
                monthlyModifier: { field: 'cash', delta: 400, durationMonths: 4 } },
              riskLossEffect: { cashDelta: -200, savingsDelta: 0, debtDelta: 0, investmentDelta: 0, scoreModifier: -12,
                monthlyModifier: { field: 'cash', delta: -200, durationMonths: 4 } },
            },
          },
          {
            id: 'm8-d1-b',
            label: 'Stay in current role',
            impactSummary: 'Stability maintained',
            impactColor: 'neutral',
            effect: { cashDelta: 0, savingsDelta: 0, debtDelta: 0, investmentDelta: 0, scoreModifier: 5 },
          },
        ],
        learnMore: 'Career moves have both upside and downside risk. A well-funded emergency fund makes accepting career risk much safer — it provides runway if the change doesn\'t work out.',
      },
      {
        id: 'm8-d2',
        type: 'spend',
        title: 'Impulse Purchase',
        description: 'A sale on electronics: a $650 TV upgrade at 40% off. You don\'t need it, but it\'s a good deal.',
        options: [
          {
            id: 'm8-d2-a',
            label: 'Skip it — stick to the plan',
            impactSummary: 'No impact',
            impactColor: 'accent',
            effect: { cashDelta: 0, savingsDelta: 0, debtDelta: 0, investmentDelta: 0, scoreModifier: 12 },
          },
          {
            id: 'm8-d2-b',
            label: 'Buy it',
            impactSummary: '-$650 cash',
            impactColor: 'negative',
            effect: { cashDelta: -650, savingsDelta: 0, debtDelta: 0, investmentDelta: 0, scoreModifier: -10 },
          },
        ],
        learnMore: 'A "good deal" is only good if you were already planning to buy it. The 40% discount is irrelevant if the purchase wasn\'t in your plan — you still spend $650 you hadn\'t allocated.',
      },
    ],
  },
  {
    month: 9,
    contextNote: "Last adversity month. Medical bill arrives. How you handle this reveals your financial foundation.",
    decisions: [
      {
        id: 'm9-d1',
        type: 'risk',
        title: 'Medical Bill',
        description: 'You receive an unexpected $800 medical bill. Three ways to handle it.',
        options: [
          {
            id: 'm9-d1-a',
            label: 'Pay in full from savings',
            impactSummary: '-$800 savings',
            impactColor: 'neutral',
            effect: { cashDelta: 0, savingsDelta: -800, debtDelta: 0, investmentDelta: 0, scoreModifier: 14 },
          },
          {
            id: 'm9-d1-b',
            label: 'Set up payment plan (0% interest)',
            impactSummary: '-$100/mo for 8 months',
            impactColor: 'risk',
            effect: { cashDelta: -100, savingsDelta: 0, debtDelta: 700, investmentDelta: 0, scoreModifier: 5,
              monthlyModifier: { field: 'cash', delta: -100, durationMonths: 3 } },
          },
        ],
        learnMore: 'Medical debt with 0% interest is different from credit card debt — it\'s not always the worst choice. However, paying from savings is generally better if you have the buffer. Always ask for a payment plan before using credit.',
      },
      {
        id: 'm9-d2',
        type: 'save',
        title: 'Rebuild the Emergency Fund',
        description: 'Several events have depleted your safety net. Time to replenish it.',
        options: [
          {
            id: 'm9-d2-a',
            label: 'Redirect $400 to rebuild savings',
            impactSummary: '-$400 cash, +$400 savings',
            impactColor: 'accent',
            effect: { cashDelta: -400, savingsDelta: 400, debtDelta: 0, investmentDelta: 0, scoreModifier: 20 },
          },
          {
            id: 'm9-d2-b',
            label: 'Defer until next month',
            impactSummary: 'Safety net stays depleted',
            impactColor: 'risk',
            effect: { cashDelta: 0, savingsDelta: 0, debtDelta: 0, investmentDelta: 0, scoreModifier: -3 },
          },
        ],
        learnMore: 'Rebuilding after a drawdown is the correct next move — before increasing investments. A depleted emergency fund is a debt event waiting to happen.',
      },
    ],
  },
  {
    month: 10,
    contextNote: "Endgame begins. The compound effect of every choice you\'ve made is now visible.",
    decisions: [
      {
        id: 'm10-d1',
        type: 'invest',
        title: 'Roth IRA Contribution',
        description: 'You have surplus cash. A Roth IRA offers tax-free growth on up to $500/mo.',
        options: [
          {
            id: 'm10-d1-a',
            label: 'Contribute $500/mo to Roth IRA',
            impactSummary: '-$500 cash, +$500 invested (tax-advantaged)',
            impactColor: 'accent',
            effect: { cashDelta: -500, savingsDelta: 0, debtDelta: 0, investmentDelta: 500, scoreModifier: 28,
              monthlyModifier: { field: 'cash', delta: -500, durationMonths: 2 } },
          },
          {
            id: 'm10-d1-b',
            label: 'Keep cash liquid',
            impactSummary: 'Lose tax advantage window',
            impactColor: 'neutral',
            effect: { cashDelta: 0, savingsDelta: 0, debtDelta: 0, investmentDelta: 0, scoreModifier: 3 },
          },
        ],
        learnMore: 'A Roth IRA is funded with after-tax dollars — all growth and withdrawals are tax-free in retirement. The contribution window is annual; unused contribution space cannot be carried forward.',
      },
      {
        id: 'm10-d2',
        type: 'spend',
        title: 'Lifestyle Upgrade',
        description: 'A nicer apartment is available, $250/mo more. You can afford it — but should you?',
        options: [
          {
            id: 'm10-d2-a',
            label: 'Stay put — redirect $250 to investments',
            impactSummary: '+$250 invested instead',
            impactColor: 'accent',
            effect: { cashDelta: -250, savingsDelta: 0, debtDelta: 0, investmentDelta: 250, scoreModifier: 18 },
          },
          {
            id: 'm10-d2-b',
            label: 'Upgrade apartment',
            impactSummary: '-$250/mo forever',
            impactColor: 'negative',
            effect: { cashDelta: -250, savingsDelta: 0, debtDelta: 0, investmentDelta: 0, scoreModifier: -8,
              monthlyModifier: { field: 'cash', delta: -250, durationMonths: 2 } },
          },
        ],
        learnMore: 'Lifestyle inflation is when increased income leads to increased spending rather than saving. $250/mo invested from age 30 is worth approximately $200,000 at retirement. The apartment is worth less.',
      },
    ],
  },
  {
    month: 11,
    contextNote: "Final stretch. Year-end decisions. Every percentage point of savings rate matters now.",
    decisions: [
      {
        id: 'm11-d1',
        type: 'save',
        title: 'Year-End Bonus',
        description: 'You receive a $1,500 bonus. Three smart options — how do you deploy it?',
        options: [
          {
            id: 'm11-d1-a',
            label: 'Split: $800 debt, $700 savings',
            impactSummary: '-$800 debt, +$700 savings',
            impactColor: 'accent',
            effect: { cashDelta: 0, savingsDelta: 700, debtDelta: -800, investmentDelta: 0, scoreModifier: 25 },
          },
          {
            id: 'm11-d1-b',
            label: 'Spend the bonus',
            impactSummary: '+$1,500 temporary lifestyle boost',
            impactColor: 'negative',
            effect: { cashDelta: -1500, savingsDelta: 0, debtDelta: 0, investmentDelta: 0, scoreModifier: -12 },
          },
        ],
        learnMore: 'Windfalls (bonuses, tax refunds, gifts) are high-leverage moments. They don\'t feel like income so spending them feels neutral — but treating them as income and splitting them is how wealth is built faster.',
      },
      {
        id: 'm11-d2',
        type: 'invest',
        title: 'Dollar-Cost Averaging',
        description: 'Market dipped 8% this month. Your scheduled investment still runs. Do you pause it?',
        options: [
          {
            id: 'm11-d2-a',
            label: 'Keep investing — buy the dip',
            impactSummary: '-$200, more shares at lower price',
            impactColor: 'accent',
            effect: { cashDelta: -200, savingsDelta: 0, debtDelta: 0, investmentDelta: 240, scoreModifier: 22 },
          },
          {
            id: 'm11-d2-b',
            label: 'Pause this month',
            impactSummary: 'Miss the lower price',
            impactColor: 'negative',
            effect: { cashDelta: 0, savingsDelta: 0, debtDelta: 0, investmentDelta: 0, scoreModifier: -5 },
          },
        ],
        learnMore: 'Dollar-cost averaging means investing a fixed amount regularly regardless of price. Market dips are actually favorable for scheduled investors — you buy more shares per dollar. Pausing is emotional, not rational.',
      },
    ],
  },
  {
    month: 12,
    contextNote: "Final month. The year closes. What you choose here is the last piece of your 12-month picture.",
    decisions: [
      {
        id: 'm12-d1',
        type: 'save',
        title: 'Final Debt Push',
        description: 'You have enough surplus to make a significant dent in your remaining debt. Use it?',
        options: [
          {
            id: 'm12-d1-a',
            label: 'Allocate $600 extra to debt',
            impactSummary: '-$600 debt, compound effect now stopped',
            impactColor: 'accent',
            effect: { cashDelta: -600, savingsDelta: 0, debtDelta: -600, investmentDelta: 0, scoreModifier: 28 },
          },
          {
            id: 'm12-d1-b',
            label: 'Keep as cash reserve',
            impactSummary: '+$600 cash, debt interest continues',
            impactColor: 'neutral',
            effect: { cashDelta: 0, savingsDelta: 600, debtDelta: 0, investmentDelta: 0, scoreModifier: 8 },
          },
        ],
        learnMore: 'The math: cash savings earns 2%. Debt at 18% costs 18%. If you have both, you are paying 16% net to hold cash. Paying off high-interest debt first is almost always optimal.',
      },
      {
        id: 'm12-d2',
        type: 'invest',
        title: 'Year-End Reflection',
        description: 'Your last allocation decision. Where does remaining surplus go?',
        options: [
          {
            id: 'm12-d2-a',
            label: 'Max out tax-advantaged accounts',
            impactSummary: '-$500 cash, +$500 invested',
            impactColor: 'accent',
            effect: { cashDelta: -500, savingsDelta: 0, debtDelta: 0, investmentDelta: 500, scoreModifier: 25 },
          },
          {
            id: 'm12-d2-b',
            label: 'Treat yourself — end of year',
            impactSummary: '-$500 cash, quality of life boost',
            impactColor: 'neutral',
            effect: { cashDelta: -500, savingsDelta: 0, debtDelta: 0, investmentDelta: 0, scoreModifier: -3 },
          },
        ],
        learnMore: 'A year of consistent financial decisions is worth celebrating. The question is whether that celebration costs $500 or earns $500. Both are valid — knowing the difference is financial awareness.',
      },
    ],
  },
]
