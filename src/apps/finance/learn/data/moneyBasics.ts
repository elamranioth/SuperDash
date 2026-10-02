import { LearnLesson } from '../types'

export const MONEY_BASICS_LESSONS: LearnLesson[] = [
  {
    id: 'mb-what-is-money',
    groupId: 'money-basics',
    question: 'What is Money?',
    explanation: 'Money is a medium of exchange that everyone in a society agrees has value. Instead of trading cows for grain, we trade standard currency to buy whatever goods or services we need.',
    example: 'You hand the baker $4 in cash, and they give you a fresh loaf of bread without asking what you do for a living.',
    whyItMatters: 'Without money, society would freeze up in bartering. Understanding that money is simply a store of traded effort helps you treat it as a tool.'
  },
  {
    id: 'mb-fiat-currency',
    groupId: 'money-basics',
    question: 'What is Fiat Currency?',
    explanation: 'Fiat currency is government-issued money that is not backed by a physical commodity like gold. Its value comes entirely from trust in the government issuing it and its legal status for paying debts.',
    example: 'A US $100 bill is made of cotton-paper, but people accept it for goods because the US government backs it as legal tender.',
    whyItMatters: 'Governments can print fiat currency, which affects inflation and your purchasing power over time.'
  },
  {
    id: 'mb-income-vs-wealth',
    groupId: 'money-basics',
    question: 'What is the difference between Income and Wealth?',
    explanation: 'Income is the flow of money coming in every week or month. Wealth is what you retain and own after expenses—your net accumulated assets.',
    example: 'An executive earning $300,000 who spends $310,000 is high-income but broke. A teacher earning $50,000 who saves $15,000 every year builds real wealth.',
    whyItMatters: 'High income alone does not give you financial security; only preserved wealth protects your future.'
  },
  {
    id: 'mb-cash-flow',
    groupId: 'money-basics',
    question: 'What is Cash Flow?',
    explanation: 'Cash flow is the movement of money in and out of your possession. Positive cash flow means more comes in than goes out; negative cash flow means you are draining savings or taking debt.',
    example: 'If your paycheck is $4,000 and your monthly bills and groceries total $3,200, you have a positive cash flow of $800.',
    whyItMatters: 'Even profitable businesses go bankrupt if timing gaps in cash flow leave them unable to pay suppliers on time.'
  },
  {
    id: 'mb-assets',
    groupId: 'money-basics',
    question: 'What is an Asset?',
    explanation: 'An asset is anything you own that has economic value and could be sold for cash or produces future income.',
    example: 'Cash in the bank, shares in an index fund, a rental apartment, or equipment you use to earn a living.',
    whyItMatters: 'Wealth grows by acquiring assets that appreciate or generate income rather than things that lose value.'
  },
  {
    id: 'mb-liabilities',
    groupId: 'money-basics',
    question: 'What is a Liability?',
    explanation: 'A liability is money you owe to someone else. It represents a legal claim against your future earnings.',
    example: 'A student loan balance of $18,000, credit card debt of $2,500, or a mortgage of $250,000.',
    whyItMatters: 'Too many liabilities restrict your freedom and siphon away your monthly income in interest payments.'
  },
  {
    id: 'mb-net-worth',
    groupId: 'money-basics',
    question: 'What is Net Worth and how is it calculated?',
    explanation: 'Net worth is the single truest measure of your financial balance sheet: Total Assets minus Total Liabilities.',
    example: 'If your savings, car, and investments are worth $80,000 and your total loans are $30,000, your net worth is $50,000.',
    whyItMatters: 'Focusing on growing your net worth prevents you from mistaking outward luxury for true financial stability.'
  },
  {
    id: 'mb-purchasing-power',
    groupId: 'money-basics',
    question: 'What is Purchasing Power?',
    explanation: 'Purchasing power is the quantity of goods or services that one unit of currency can buy at a given moment.',
    example: 'In 1990, $20 could buy a full cart of groceries. Today, that same $20 buys two or three items.',
    whyItMatters: 'Leaving all your money as idle cash guarantees a steady loss of purchasing power due to price inflation.'
  },
  {
    id: 'mb-emergency-fund',
    groupId: 'money-basics',
    question: 'What is an Emergency Fund?',
    explanation: 'An emergency fund is easily accessible cash set aside strictly for unplanned crises, like job loss, medical emergencies, or car breakdowns.',
    example: 'Keeping $10,000 in a high-yield savings account that you never touch for holidays or shopping.',
    whyItMatters: 'It acts as a financial shock absorber, keeping you from turning to high-interest debt when life happens.'
  },
  {
    id: 'mb-opportunity-cost',
    groupId: 'money-basics',
    question: 'What is Opportunity Cost?',
    explanation: 'Opportunity cost is the potential benefit you give up when choosing one option over another.',
    example: 'Spending $5,000 on a vacation means you cannot use that same $5,000 to pay down credit cards or invest in stocks.',
    whyItMatters: 'Every dollar can only be spent once; considering the alternative helps you make smarter long-term decisions.'
  },
  {
    id: 'mb-liquidity',
    groupId: 'money-basics',
    question: 'What is Liquidity in finance?',
    explanation: 'Liquidity is how quickly and easily an asset can be turned into cash without losing significant value.',
    example: 'Money in a checking account is completely liquid. A commercial warehouse is illiquid because selling it can take months.',
    whyItMatters: 'You need liquid money for emergencies, but too much liquidity usually means earning very low returns.'
  },
  {
    id: 'mb-time-value-of-money',
    groupId: 'money-basics',
    question: 'What is the Time Value of Money (TVM)?',
    explanation: 'A dollar in your hand today is worth more than a dollar promised to you in the future because today’s dollar can earn interest right away.',
    example: 'If someone offers you $1,000 today or $1,000 five years from now, taking it today allows you to invest and grow it.',
    whyItMatters: 'It forms the theoretical foundation for interest rates, bond yields, mortgages, and business valuations.'
  },
  {
    id: 'mb-gross-vs-net-income',
    groupId: 'money-basics',
    question: 'What is Gross Income vs Net Income?',
    explanation: 'Gross income is what you earn before any deductions. Net income is what actually reaches your bank account after taxes and fees.',
    example: 'A salary of $60,000 is your gross income; after taxes and social security, your take-home net income might be $46,000.',
    whyItMatters: 'You must always plan budgets around net take-home pay, never your theoretical gross salary.'
  },
  {
    id: 'mb-fixed-vs-variable-expenses',
    groupId: 'money-basics',
    question: 'What are Fixed vs Variable Expenses?',
    explanation: 'Fixed expenses stay identical each month, while variable expenses fluctuate based on consumption, seasonality, and daily choices.',
    example: 'Your apartment rent of $1,200 is fixed. Your electric bill and dining out expenses are variable.',
    whyItMatters: 'When cutting budgets, variable expenses are quickest to reduce, but lowering fixed commitments creates lasting relief.'
  },
  {
    id: 'mb-sunk-cost-fallacy',
    groupId: 'money-basics',
    question: 'What is the Sunk Cost Fallacy?',
    explanation: 'The mistake of continuing to spend time or money on something simply because you have already invested heavily into it.',
    example: 'Pouring another $2,000 into a dying car that is worth $1,000 just because you already spent $3,000 on repairs last month.',
    whyItMatters: 'Past expenses are gone forever; future financial choices should only be based on expected future returns.'
  },
  {
    id: 'mb-depreciation',
    groupId: 'money-basics',
    question: 'What is Depreciation?',
    explanation: 'Depreciation is the reduction in value of a physical asset over time due to wear, tear, age, and obsolescence.',
    example: 'Buying a brand new smartphone for $1,200 that is only worth $400 on the secondhand market three years later.',
    whyItMatters: 'Spending heavily on rapidly depreciating items drains your balance sheet without building wealth.'
  },
  {
    id: 'mb-appreciation',
    groupId: 'money-basics',
    question: 'What is Appreciation?',
    explanation: 'Appreciation is an increase in the market value of an asset over time.',
    example: 'A family home purchased for $200,000 in 2012 that is valued at $380,000 today due to neighborhood growth.',
    whyItMatters: 'Buying appreciating assets lets your money work for you rather than melting away with age.'
  },
  {
    id: 'mb-passive-vs-active-income',
    groupId: 'money-basics',
    question: 'What is Passive Income vs Active Income?',
    explanation: 'Active income requires your direct ongoing time and physical labor. Passive income arrives from capital assets with minimal recurring work.',
    example: 'A monthly salary for 40 hours of engineering is active. Quarterly dividend checks from index funds are passive.',
    whyItMatters: 'Financial independence is achieved when passive income covers your living expenses.'
  },
  {
    id: 'mb-zero-sum-fallacy',
    groupId: 'money-basics',
    question: 'Is Money a Zero-Sum Game?',
    explanation: 'No. In a healthy economy, wealth can be created through innovation, trade, and productivity, not just transferred from one person to another.',
    example: 'When a baker invents a healthier bread and sells it to happy customers, both the baker and the buyers are better off.',
    whyItMatters: 'Believing wealth is finite makes people envious; understanding wealth creation inspires entrepreneurship.'
  },
  {
    id: 'mb-barter-system',
    groupId: 'money-basics',
    question: 'Why did Barter fail and lead to Money?',
    explanation: 'Barter required a "double coincidence of wants"—both parties had to want exactly what the other was offering at the same time and place.',
    example: 'If a shoemaker needed a haircut, the barber had to also need a new pair of shoes of that exact size right then.',
    whyItMatters: 'Money solved trade friction by acting as a universal, universally accepted unit of account.'
  },
  {
    id: 'mb-commodity-money',
    groupId: 'money-basics',
    question: 'What was Commodity Money?',
    explanation: 'Money that had intrinsic value of its own, such as gold coins, silver bars, salt, or cattle.',
    example: 'Ancient traders accepted gold coins because gold itself was scarce, durable, and desirable for jewelry.',
    whyItMatters: 'Helps you understand why precious metals historically retained value during currency collapses.'
  },
  {
    id: 'mb-financial-runway',
    groupId: 'money-basics',
    question: 'What is Financial Runway?',
    explanation: 'The number of months you or your business could survive living strictly off current cash reserves if all incoming revenue stopped today.',
    example: 'If you have $18,000 in savings and spend $3,000 each month, your financial runway is exactly 6 months.',
    whyItMatters: 'Long runways grant you the confidence to negotiate higher salaries, start companies, or switch careers.'
  },
  {
    id: 'mb-debt-to-income',
    groupId: 'money-basics',
    question: 'What is Debt-to-Income (DTI) Ratio?',
    explanation: 'The percentage of your monthly gross income that goes toward paying debts and loan obligations.',
    example: 'If you earn $5,000 monthly and pay $1,500 toward student loans and credit cards, your DTI is 30%.',
    whyItMatters: 'Lenders check your DTI before approving home mortgages; lower DTIs unlock the lowest interest rates.'
  },
  {
    id: 'mb-paycheck-to-paycheck',
    groupId: 'money-basics',
    question: 'What does "Living Paycheck to Paycheck" mean?',
    explanation: 'A situation where virtually all current monthly income is immediately spent on basic obligations with zero margin for savings.',
    example: 'Having $12 in your checking account on Thursday night while anxiously waiting for direct deposit on Friday morning.',
    whyItMatters: 'Escaping this cycle requires creating an intentional gap between what you earn and what you spend.'
  },
  {
    id: 'mb-financial-hygiene',
    groupId: 'money-basics',
    question: 'What is Daily Financial Hygiene?',
    explanation: 'The simple regular habits of reviewing bank statements, tracking bills, avoiding overdrafts, and watching for fraudulent charges.',
    example: 'Spending 5 minutes every Sunday opening your finance app to review last week’s receipts and balances.',
    whyItMatters: 'Consistent awareness catches budget leaks and billing mistakes before they turn into major crises.'
  }
]
