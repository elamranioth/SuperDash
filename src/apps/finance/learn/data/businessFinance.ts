import { LearnLesson } from '../types'

export const BUSINESS_FINANCE_LESSONS: LearnLesson[] = [
  {
    id: 'bf-revenue-vs-profit',
    groupId: 'business-finance',
    question: 'What is Revenue vs Profit?',
    explanation: 'Revenue is the total top-line gross dollar amount brought in from sales before any deductions. Profit (net income) is the bottom-line money that remains after paying all expenses, taxes, and debts.',
    example: 'A coffee shop sells $500,000 worth of lattes (Revenue). After paying coffee beans, milk, rent, barista wages, and taxes of $420,000, its Profit is $80,000.',
    whyItMatters: '"Revenue is vanity, profit is sanity, and cash is reality." A company with $10 million in revenue can still go bankrupt if expenses are $11 million.'
  },
  {
    id: 'bf-gross-margin',
    groupId: 'business-finance',
    question: 'What is Gross Profit and Gross Margin?',
    explanation: 'Gross Profit is Revenue minus Cost of Goods Sold (COGS). Gross Margin is Gross Profit expressed as a percentage of Revenue, measuring how efficiently a company produces its core goods.',
    example: 'Selling a software subscription for $100 that costs $15 to host on servers produces an $85 Gross Profit and an 85% Gross Margin.',
    whyItMatters: 'High gross margins provide companies with abundant cash to invest into marketing, engineering, and surviving price wars.'
  },
  {
    id: 'bf-operating-expenses-opex',
    groupId: 'business-finance',
    question: 'What are Operating Expenses (OpEx)?',
    explanation: 'The ongoing daily overhead expenses necessary to keep a business running, excluding direct manufacturing costs (COGS). Includes office rent, sales salaries, software tools, and marketing.',
    example: 'Paying $12,000 a month for office rent and accounting services is OpEx.',
    whyItMatters: 'Managing OpEx discipline during revenue downturns determines whether a startup survives or burns through all its cash.'
  },
  {
    id: 'bf-break-even-point',
    groupId: 'business-finance',
    question: 'What is the Break-Even Point?',
    explanation: 'The exact sales volume where total business revenue matches total expenses, generating neither profit nor loss.',
    example: 'A bakery with $6,000 monthly fixed rent and $2 profit per loaf breaks even at exactly 3,000 loaves sold each month ($6,000 ÷ $2).',
    whyItMatters: 'Every business owner must know their break-even target to set pricing and calculate survival thresholds.'
  },
  {
    id: 'bf-working-capital',
    groupId: 'business-finance',
    question: 'What is Working Capital and why does it matter?',
    explanation: 'The money available for daily business operations: Current Assets (cash, inventory, unpaid invoices) minus Current Liabilities (bills due within 1 year).',
    example: 'Holding $100,000 in cash and inventory while owing $40,000 to suppliers gives you $60,000 in positive working capital.',
    whyItMatters: 'Negative working capital means a company cannot pay its immediate bills, leading to supplier halts and sudden insolvency.'
  },
  {
    id: 'bf-cash-burn-rate',
    groupId: 'business-finance',
    question: 'What is Cash Burn Rate?',
    explanation: 'The net speed at which an unprofitable company is spending down its cash balance each month before achieving self-sustaining profitability.',
    example: 'A startup with $600,000 in the bank that spends $50,000 more than it brings in each month has a burn rate of $50,000/month and 12 months of runway.',
    whyItMatters: 'Knowing your burn rate tells you precisely how many months you have to either turn profitable or raise more financing.'
  },
  {
    id: 'bf-accounts-receivable-vs-payable',
    groupId: 'business-finance',
    question: 'What is Accounts Receivable (AR) vs Accounts Payable (AP)?',
    explanation: 'Accounts Receivable is money customers owe you for goods already delivered on credit. Accounts Payable is money you owe to your suppliers for supplies already received.',
    example: 'You invoice a client $5,000 due in 30 days (AR). Your packaging supplier bills you $1,200 due in 15 days (AP).',
    whyItMatters: 'Slow-paying customers in AR can starve a growing company of the cash it urgently needs to pay AP suppliers on time.'
  },
  {
    id: 'bf-customer-acquisition-cost-cac',
    groupId: 'business-finance',
    question: 'What is CAC (Customer Acquisition Cost)?',
    explanation: 'The total sales and marketing expenditure required to win a single new paying customer: Total Marketing Spend divided by Number of New Customers Acquired.',
    example: 'Spending $10,000 on digital ads to acquire 200 new paying subscribers yields a CAC of $50 per customer ($10,000 ÷ 200).',
    whyItMatters: 'If CAC exceeds what customers pay you over their lifetime, your business model is fundamentally broken.'
  },
  {
    id: 'bf-lifetime-value-ltv',
    groupId: 'business-finance',
    question: 'What is LTV (Customer Lifetime Value)?',
    explanation: 'The average total profit a single customer generates for your company across the entire duration of their relationship with you.',
    example: 'A customer who spends $40 every month for 3 years before cancelling generates an LTV of $1,440 ($40 × 36).',
    whyItMatters: 'A healthy business model typically requires an LTV:CAC ratio of at least 3:1 (customer brings in 3x what it cost to acquire them).'
  },
  {
    id: 'bf-ebitda',
    groupId: 'business-finance',
    question: 'What is EBITDA?',
    explanation: 'Earnings Before Interest, Taxes, Depreciation, and Amortization—a proxy metric for measuring pure operating cashflow independent of financing choices and tax structures.',
    example: 'Allows investors to compare the operating strength of a factory in Texas with one in Germany without distorted tax differences.',
    whyItMatters: 'Widely used by private equity buyers and lenders to evaluate corporate acquisition prices and debt capacity.'
  },
  {
    id: 'bf-debt-vs-equity-financing',
    groupId: 'business-finance',
    question: 'What is Debt Financing vs Equity Financing for businesses?',
    explanation: 'Debt financing involves borrowing money (bank loan, bond) that must be repaid with interest, retaining 100% ownership. Equity financing sells shares of ownership to investors, taking no debt but giving away future profit forever.',
    example: 'Borrowing $50,000 at 7% from a bank vs selling 20% of your company to a venture investor for $50,000.',
    whyItMatters: 'Debt creates fixed monthly repayment pressure; equity permanently shares control and financial upside.'
  },
  {
    id: 'bf-bootstrapping-vs-venture-capital',
    groupId: 'business-finance',
    question: 'What is Bootstrapping vs Venture Capital?',
    explanation: 'Bootstrapping means growing a business strictly using customer revenue and founder savings. Venture Capital involves taking millions from institutional funds to chase blitzscale growth.',
    example: 'A design agency funding its own software product vs a tech startup raising $5M from Silicon Valley funds.',
    whyItMatters: 'Bootstrappers retain complete freedom and control; VC-funded companies face intense pressure to exit via IPO or acquisition.'
  },
  {
    id: 'bf-net-profit-margin',
    groupId: 'business-finance',
    question: 'What is Net Profit Margin?',
    explanation: 'The percentage of total sales revenue that remains as pure bottom-line profit after every single operational expense, tax, and interest payment: (Net Income ÷ Revenue) × 100.',
    example: 'Earning $120,000 profit on $1,000,000 in annual revenue equals a 12% Net Profit Margin.',
    whyItMatters: 'Grocery stores operate at razor-thin 2% net margins, while premium software companies often enjoy fat 25%+ margins.'
  },
  {
    id: 'bf-capex-capital-expenditures',
    groupId: 'business-finance',
    question: 'What is CapEx (Capital Expenditures)?',
    explanation: 'Money spent by a business to purchase, upgrade, or maintain major physical long-term assets such as factory machinery, vehicles, and real estate.',
    example: 'A delivery company buying 10 new commercial cargo vans for $450,000.',
    whyItMatters: 'Unlike OpEx, CapEx cannot be deducted immediately on taxes in one year; it is depreciated gradually over the asset’s useful life.'
  },
  {
    id: 'bf-depreciation-in-business',
    groupId: 'business-finance',
    question: 'Why is Depreciation an accounting expense but not a cash outflow?',
    explanation: 'When you buy a $50,000 machine, cash leaves your account on day one. Accounting rules spread that $50,000 expense across 5 years ($10,000/yr), reducing taxable profit without spending new cash.',
    example: 'A company reports $10,000 depreciation on its income statement, lowering its tax bill, even though zero cash was spent that year.',
    whyItMatters: 'Explains why a business can report an accounting loss on paper while actually generating positive cash in the bank.'
  },
  {
    id: 'bf-unit-economics',
    groupId: 'business-finance',
    question: 'What are Unit Economics?',
    explanation: 'The direct revenues and variable costs associated with producing and selling a single basic unit of a product or service.',
    example: 'If a sandwich costs $3.50 in ingredients and packaging and sells for $9.00, the unit contribution margin is $5.50.',
    whyItMatters: 'If unit economics are negative (losing $1 on every item sold), increasing sales volume just speeds up your bankruptcy.'
  },
  {
    id: 'bf-retained-earnings',
    groupId: 'business-finance',
    question: 'What are Retained Earnings?',
    explanation: 'The cumulative net profits a business has generated throughout its history that were reinvested into operations rather than distributed as dividends to owners.',
    example: 'A company earns $200,000, pays out $50,000 in owner dividends, and keeps $150,000 in retained earnings to fund next year’s store expansion.',
    whyItMatters: 'Building robust retained earnings self-funds organic growth without needing dilutive investors or expensive bank debt.'
  },
  {
    id: 'bf-churn-rate',
    groupId: 'business-finance',
    question: 'What is Customer Churn Rate?',
    explanation: 'The percentage of existing customers or subscribers who cancel or stop paying for your service within a given time period.',
    example: 'Starting the month with 1,000 subscribers and losing 50 by the end of the month equals a 5% monthly churn rate.',
    whyItMatters: 'High churn is like pouring water into a leaky bucket; you have to spend huge sums on new marketing just to keep revenue flat.'
  },
  {
    id: 'bf-inventory-turnover',
    groupId: 'business-finance',
    question: 'What is Inventory Turnover?',
    explanation: 'A ratio showing how many times a business sells and replaces its entire stock of goods over a year: Cost of Goods Sold divided by Average Inventory.',
    example: 'A shoe retailer that sells through its complete warehouse stock 6 times a year has an inventory turnover of 6.',
    whyItMatters: 'Higher turnover means cash is moving rapidly rather than sitting trapped in dusty boxes on warehouse shelves.'
  },
  {
    id: 'bf-cash-conversion-cycle',
    groupId: 'business-finance',
    question: 'What is the Cash Conversion Cycle (CCC)?',
    explanation: 'The time (in days) it takes for a business to convert cash invested in raw materials back into cash collected from customer sales.',
    example: 'Paying a supplier for fabric on Day 1, manufacturing a shirt by Day 20, selling it on Day 35, and receiving customer payment on Day 45 (CCC = 45 days).',
    whyItMatters: 'Shorter or negative cash conversion cycles (like Amazon or Dell) allow businesses to fund their own growth using supplier money.'
  },
  {
    id: 'bf-pricing-power',
    groupId: 'business-finance',
    question: 'What is Pricing Power and why did Warren Buffett call it essential?',
    explanation: 'The ability of a business to raise prices on its products without losing market share or customers to competing alternatives.',
    example: 'A luxury brand or essential software tool raising subscription prices by 15% and seeing customer retention stay at 98%.',
    whyItMatters: 'Pricing power is the single greatest defense against high inflation and proves the existence of a true competitive moat.'
  },
  {
    id: 'bf-zombie-companies',
    groupId: 'business-finance',
    question: 'What is a "Zombie Company"?',
    explanation: 'A heavily indebted business that generates barely enough cashflow to pay the interest on its debts, but not enough to pay off principal or invest in future growth.',
    example: 'An obsolete department store chain surviving only because interest rates were near zero, facing collapse as soon as interest rates rise.',
    whyItMatters: 'Zombie companies tie up productive labor and capital, usually unraveling when refinancing conditions tighten.'
  },
  {
    id: 'bf-invoice-factoring',
    groupId: 'business-finance',
    question: 'What is Invoice Factoring in business finance?',
    explanation: 'Selling your unpaid client invoices to a third-party financing firm at an immediate discount (e.g. 95 cents on the dollar) to receive cash instantly rather than waiting 60 days.',
    example: 'Selling a $50,000 invoice due in two months to a factor for $47,500 cash today to meet Friday’s payroll.',
    whyItMatters: 'Provides fast emergency working capital for fast-growing businesses, but chips away at profit margins.'
  },
  {
    id: 'bf-covenant-loans',
    groupId: 'business-finance',
    question: 'What is a Debt Covenant?',
    explanation: 'Legally binding conditions set by commercial bank lenders that require the borrowing business to maintain specific financial ratios (like maintaining minimum cash balances).',
    example: 'A bank requiring a company to keep at least $250,000 in liquid cash and maintain a debt-to-equity ratio below 2.0 at all times.',
    whyItMatters: 'Violating a loan covenant allows the bank to immediately call the entire loan due in full, triggering sudden restructuring.'
  },
  {
    id: 'bf-shareholder-value',
    groupId: 'business-finance',
    question: 'What is Return on Equity (ROE)?',
    explanation: 'A measure of financial efficiency showing how many dollars of net income a business produces for every dollar of shareholder equity invested: (Net Income ÷ Shareholder Equity) × 100.',
    example: 'Generating $25 million in net profit on $100 million of shareholder equity yields a strong 25% ROE.',
    whyItMatters: 'Reveals whether corporate executives are skilled capital allocators or simply hoarding idle investor cash.'
  }
]
