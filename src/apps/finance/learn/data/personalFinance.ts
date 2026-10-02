import { LearnLesson } from '../types'

export const PERSONAL_FINANCE_LESSONS: LearnLesson[] = [
  {
    id: 'pf-50-30-20-rule',
    groupId: 'personal-finance',
    question: 'What is the 50/30/20 Budgeting Rule?',
    explanation: 'A popular guideline where 50% of your take-home income goes to essential Needs, 30% to personal Wants, and 20% to Savings or Debt repayment.',
    example: 'On a $3,000 monthly take-home salary, you target $1,500 for rent and food, $900 for dining and hobbies, and $600 for investments.',
    whyItMatters: 'It gives you a simple, intuitive framework without requiring you to track every single penny obsessively.'
  },
  {
    id: 'pf-zero-based-budget',
    groupId: 'personal-finance',
    question: 'What is a Zero-Based Budget?',
    explanation: 'A method where every single dollar of monthly income is assigned a specific job before the month starts, so Income minus Expenses equals Zero.',
    example: 'If you earn $4,000, you assign $2,500 to bills, $500 to food, $500 to entertainment, and the remaining $500 into savings.',
    whyItMatters: 'Prevents leftover money from mysteriously evaporating into unremembered impulse purchases.'
  },
  {
    id: 'pf-pay-yourself-first',
    groupId: 'personal-finance',
    question: 'What does "Pay Yourself First" mean?',
    explanation: 'Automatically routing money into savings or investments the very day your paycheck arrives, rather than saving whatever happens to be left at the end of the month.',
    example: 'Setting up an automatic transfer of $400 to your brokerage account on the 1st of every month.',
    whyItMatters: 'If you wait until month-end, lifestyle spending will almost always expand to absorb the remaining cash.'
  },
  {
    id: 'pf-lifestyle-inflation',
    groupId: 'personal-finance',
    question: 'What is Lifestyle Creep (Lifestyle Inflation)?',
    explanation: 'The tendency to increase your spending at the exact same rate your income rises, preventing you from building greater wealth.',
    example: 'Getting a $1,000 raise and immediately upgrading to a luxury apartment that costs $1,000 more in monthly rent.',
    whyItMatters: 'If your expenses always rise with your income, you will feel just as financially stressed at $150k as you did at $50k.'
  },
  {
    id: 'pf-debt-snowball-vs-avalanche',
    groupId: 'personal-finance',
    question: 'Debt Snowball vs Debt Avalanche: What is the difference?',
    explanation: 'The Snowball method pays off the smallest balance first for psychological wins. The Avalanche method targets the highest interest rate first for mathematical efficiency.',
    example: 'Snowball pays off a $400 medical bill first; Avalanche pays off a 24% APR credit card balance first.',
    whyItMatters: 'Both work: Snowball wins on behavioral motivation, while Avalanche saves the most total interest dollars.'
  },
  {
    id: 'pf-good-debt-vs-bad-debt',
    groupId: 'personal-finance',
    question: 'What is Good Debt vs Bad Debt?',
    explanation: 'Good debt finances assets that can grow in value or increase your earning potential at low interest. Bad debt finances depreciating items at high interest.',
    example: 'A modest mortgage on an affordable home is good debt; carrying a 22% balance on designer clothes is bad debt.',
    whyItMatters: 'Borrowing to fund consumption destroys future income, while prudent borrowing can accelerate wealth creation.'
  },
  {
    id: 'pf-financial-independence',
    groupId: 'personal-finance',
    question: 'What is Financial Independence (FIRE)?',
    explanation: 'A state where your investments and passive assets generate enough cashflow to cover all living expenses forever without needing a paycheck.',
    example: 'Needing $40,000 a year to live and holding $1,000,000 in diversified funds yielding $40,000 annually.',
    whyItMatters: 'It changes work from an involuntary necessity for survival into an optional personal choice.'
  },
  {
    id: 'pf-the-4-percent-rule',
    groupId: 'personal-finance',
    question: 'What is the 4% Safe Withdrawal Rule?',
    explanation: 'A historical guideline stating you can withdraw 4% of your diversified retirement portfolio in year one (adjusted for inflation thereafter) with very low risk of running out of money over 30 years.',
    example: 'With a $1,000,000 portfolio, you can safely withdraw $40,000 in the first year of retirement.',
    whyItMatters: 'It provides a concrete formula to calculate how much capital you need to save before retiring.'
  },
  {
    id: 'pf-envelope-budgeting',
    groupId: 'personal-finance',
    question: 'What is the Envelope Budgeting System?',
    explanation: 'Dividing cash (or digital spending categories) into distinct envelopes. Once an envelope is empty, no more spending is allowed in that category until next month.',
    example: 'Putting $300 in an envelope marked "Dining Out". When the envelope is empty, you cook meals at home for the rest of the month.',
    whyItMatters: 'Creates a hard psychological and physical limit that stops overspending in discretionary categories.'
  },
  {
    id: 'pf-sinking-funds',
    groupId: 'personal-finance',
    question: 'What is a Sinking Fund?',
    explanation: 'A targeted savings bucket where you set aside small amounts each month for a known, predictable upcoming future expense.',
    example: 'Saving $100 every month for 12 months so you have $1,200 cash ready when annual car insurance is due.',
    whyItMatters: 'Prevents predictable irregular bills from blindsiding your monthly budget as "unexpected emergencies".'
  },
  {
    id: 'pf-latte-factor-myth',
    groupId: 'personal-finance',
    question: 'What is the "Latte Factor" and its limitation?',
    explanation: 'The idea that cutting small daily treats like coffee will make you wealthy. While small leaks matter, big decisions (housing, cars, career) make 95% of the difference.',
    example: 'Skipping a $5 coffee saves $150 a month, but buying a car that is $15,000 cheaper saves thousands in interest, insurance, and depreciation.',
    whyItMatters: 'Focus on getting the big financial rocks right before stressing over tiny daily pleasures.'
  },
  {
    id: 'pf-retirement-accounts',
    groupId: 'personal-finance',
    question: 'Why do governments offer Tax-Advantaged Retirement Accounts?',
    explanation: 'Governments want citizens to save for their own old age, so they incentivize saving through tax deductions today or tax-free growth in the future (like 401k or IRA).',
    example: 'Contributing $6,000 to a traditional retirement plan lowers your taxable income this year by $6,000.',
    whyItMatters: 'Sheltering your investment compounding from annual taxes dramatically speeds up long-term portfolio growth.'
  },
  {
    id: 'pf-employer-match',
    groupId: 'personal-finance',
    question: 'What is an Employer 401(k) Match?',
    explanation: 'A workplace benefit where your employer contributes extra money to your retirement plan matching your personal contributions up to a specific percentage.',
    example: 'Your company matches 100% of your contributions up to 4% of your salary. Contributing 4% instantly gives you a 100% return.',
    whyItMatters: 'It is literally free compensation; skipping it is leaving a portion of your earned salary on the table.'
  },
  {
    id: 'pf-hedonic-treadmill',
    groupId: 'personal-finance',
    question: 'What is the Hedonic Treadmill?',
    explanation: 'The human psychological tendency to quickly return to a baseline level of happiness despite major positive events or new possessions.',
    example: 'Feeling ecstatic about buying a brand new sports car for two weeks, and then feeling completely ordinary driving it a month later.',
    whyItMatters: 'Understanding this prevents endless cycles of buying expensive items in search of lasting happiness.'
  },
  {
    id: 'pf-stealth-wealth',
    groupId: 'personal-finance',
    question: 'What is "Stealth Wealth"?',
    explanation: 'The practice of living comfortably and modestly below your means without publicly signaling or showing off your financial success.',
    example: 'A multimillionaire driving an eight-year-old reliable Japanese sedan and wearing plain, comfortable clothes.',
    whyItMatters: 'Showing off invites envy, scams, and unnecessary spending; true wealth buys autonomy and peace of mind.'
  },
  {
    id: 'pf-cost-per-use',
    groupId: 'personal-finance',
    question: 'What is Cost-Per-Use?',
    explanation: 'Calculating the true value of a purchase by dividing its price tag by the actual number of times you will wear or use it.',
    example: 'A $300 winter jacket worn 200 days a year costs $1.50 per use; a $60 novelty outfit worn once costs $60 per use.',
    whyItMatters: 'Helps you justify high quality for daily essentials while avoiding cheap items that sit untouched in closets.'
  },
  {
    id: 'pf-impulse-purchase-cooling-off',
    groupId: 'personal-finance',
    question: 'What is the 72-Hour Rule for purchases?',
    explanation: 'A psychological rule of waiting 72 hours before completing any unplanned, non-essential purchase over a set dollar amount.',
    example: 'Putting a $250 pair of sneakers in an online cart and closing the browser. If you still want them after 3 days, you buy them.',
    whyItMatters: 'Most impulse purchases are driven by temporary emotional boredom that fades away within 48 hours.'
  },
  {
    id: 'pf-compound-spending',
    groupId: 'personal-finance',
    question: 'What is the Reverse Compound Effect of recurring subscriptions?',
    explanation: 'Small monthly subscriptions seem harmless in isolation, but combined over decades they represent tens of thousands in lost investment capital.',
    example: 'Paying $60 a month for unused streaming and app subscriptions equals $720 a year, which invested over 20 years at 8% equals ~$35,000.',
    whyItMatters: 'Regular audits of unused software and gym memberships put substantial cash straight back into your savings.'
  },
  {
    id: 'pf-negotiating-bills',
    groupId: 'personal-finance',
    question: 'Can you Negotiate Everyday Recurring Bills?',
    explanation: 'Yes. Telecommunications, car insurance, medical bills, and credit card fees are frequently flexible if you ask professionally.',
    example: 'Calling your internet provider once a year and asking for the retention promo discount can easily save $300 annually.',
    whyItMatters: 'A 15-minute phone call that saves $30 a month gives you an hourly return of over $120 for your time.'
  },
  {
    id: 'pf-money-and-relationships',
    groupId: 'personal-finance',
    question: 'Why is Money the leading cause of relationship friction?',
    explanation: 'Partners often bring different childhood money mindsets (spenders vs savers) and fail to communicate goals openly.',
    example: 'One partner views savings as safety; the other views money as a tool to enjoy experiences right now.',
    whyItMatters: 'Scheduling regular, guilt-free monthly money conversations prevents secret resentment from building up.'
  },
  {
    id: 'pf-financial-frugality-vs-cheapness',
    groupId: 'personal-finance',
    question: 'What is the difference between Frugal and Cheap?',
    explanation: 'Frugal people care about maximizing value and long-term cost. Cheap people care solely about the lowest immediate dollar price tag, often at others’ expense.',
    example: 'Frugal buys durable boots that last 10 years; Cheap buys flimsy boots that tear in 3 months and leaves poor tips for servers.',
    whyItMatters: 'True frugality enriches your life; cheapness damages relationships and often ends up costing more over time.'
  },
  {
    id: 'pf-will-and-estate',
    groupId: 'personal-finance',
    question: 'What is a Will and why do young adults need one?',
    explanation: 'A legal document declaring who receives your assets and who takes care of dependents if you pass away.',
    example: 'Designating that your bank accounts and belongings go directly to your partner or parents without state probate court battles.',
    whyItMatters: 'Without a will, local government intestacy laws determine who gets your money, often causing years of legal family disputes.'
  },
  {
    id: 'pf-beneficiary-designations',
    groupId: 'personal-finance',
    question: 'Why do Beneficiary Designations override a Will?',
    explanation: 'The beneficiary name registered directly with your bank or retirement account takes legal precedence over what is written in your general will.',
    example: 'If your 401(k) still lists an ex-spouse from ten years ago, they legally inherit the money regardless of what your current will states.',
    whyItMatters: 'You should review and update beneficiary designations on all accounts after major life events like marriage or divorce.'
  },
  {
    id: 'pf-automating-finances',
    groupId: 'personal-finance',
    question: 'What is Full Financial Automation?',
    explanation: 'Designing your bank flow so that income automatically splits into bills, savings, and guilt-free spending without requiring willpower.',
    example: 'Paycheck lands on Friday; by Monday morning, rent is set aside, index funds are funded, and the checking balance is safe to spend.',
    whyItMatters: 'Automation removes cognitive friction and makes saving your default behavior.'
  },
  {
    id: 'pf-money-scripts',
    groupId: 'personal-finance',
    question: 'What are Personal "Money Scripts"?',
    explanation: 'Unconscious beliefs about money inherited from our parents or childhood that govern our adult spending and saving patterns.',
    example: 'Believing "money is dirty" because parents fought about it, leading an adult to subconsciously sabotage their own career earnings.',
    whyItMatters: 'Recognizing your internal money scripts helps you overcome irrational fears of poverty or compulsions to overspend.'
  }
]
