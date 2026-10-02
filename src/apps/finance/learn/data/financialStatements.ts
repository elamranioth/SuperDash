import { LearnLesson } from '../types'

export const FINANCIAL_STATEMENTS_LESSONS: LearnLesson[] = [
  {
    id: 'fs-three-financial-statements',
    groupId: 'financial-statements',
    question: 'What are the Three Core Financial Statements?',
    explanation: 'The Income Statement (profitability over time), the Balance Sheet (financial health at a single snapshot in time), and the Cash Flow Statement (actual cash moving in and out).',
    example: 'Think of the Balance Sheet as a still photograph, the Income Statement as a film reel of sales and costs, and the Cash Flow Statement as the fuel gauge of real cash.',
    whyItMatters: 'Together, they tell the complete objective financial story of any company, from a local bakery to Apple.'
  },
  {
    id: 'fs-balance-sheet-equation',
    groupId: 'financial-statements',
    question: 'What is the Fundamental Accounting Equation?',
    explanation: 'Assets = Liabilities + Shareholders’ Equity. Everything a company owns (Assets) was paid for either by borrowing money from creditors (Liabilities) or invested by owners and retained earnings (Equity).',
    example: 'A business owns $500,000 in equipment and cash (Assets). It owes $200,000 in bank debt (Liabilities). Therefore, Owner Equity is exactly $300,000.',
    whyItMatters: 'A balance sheet must always balance to the penny; if it does not, there is an accounting error or fraud.'
  },
  {
    id: 'fs-income-statement-structure',
    groupId: 'financial-statements',
    question: 'How is an Income Statement structured?',
    explanation: 'Top-to-bottom: Revenue (sales) at the top, minus Cost of Goods Sold (COGS) equals Gross Profit; minus Operating Expenses (OpEx) equals Operating Income; minus Interest & Taxes equals Net Income (the bottom line).',
    example: 'Start with $1M in sales. Subtract $400k direct costs = $600k Gross Profit. Subtract $350k salaries = $250k Operating Profit. Subtract $50k taxes = $200k Net Income.',
    whyItMatters: 'Shows exactly where revenue leaks away as it travels down to the bottom line.'
  },
  {
    id: 'fs-cash-flow-statement',
    groupId: 'financial-statements',
    question: 'Why is the Cash Flow Statement the most honest statement?',
    explanation: 'Accounting rules allow companies to record revenue before receiving cash and spread out expenses. The Cash Flow Statement ignores accounting tricks and tracks pure physical cash arriving and departing.',
    example: 'A company can report a $5 million accounting profit on paper while running out of actual cash in the bank because clients haven’t paid their invoices yet.',
    whyItMatters: 'Cash flow never lies; it is the ultimate indicator of whether a company will survive or fail.'
  },
  {
    id: 'fs-cash-flow-three-sections',
    groupId: 'financial-statements',
    question: 'What are the Three Sections of the Cash Flow Statement?',
    explanation: 'Operating Cash Flow (daily core business activities), Investing Cash Flow (buying or selling equipment, factories, and securities), and Financing Cash Flow (issuing stock, paying dividends, taking loans).',
    example: 'Selling shoes (+Operating), buying a delivery truck (-Investing), and paying a cash dividend to shareholders (-Financing).',
    whyItMatters: 'High-quality companies consistently generate massive positive cash flow from Operations, rather than relying on borrowing or selling stock to survive.'
  },
  {
    id: 'fs-current-vs-non-current-assets',
    groupId: 'financial-statements',
    question: 'What are Current vs Non-Current Assets?',
    explanation: 'Current Assets are expected to be converted into cash within one year (cash, inventory, accounts receivable). Non-Current (long-term) assets are held for years (factories, patents, land).',
    example: 'Cash in checking is a current asset; an office building owned by the company is a non-current asset.',
    whyItMatters: 'Current assets show immediate liquidity to pay off short-term debts and weather unexpected economic shocks.'
  },
  {
    id: 'fs-goodwill-intangible-assets',
    groupId: 'financial-statements',
    question: 'What is Goodwill on a Balance Sheet?',
    explanation: 'An intangible accounting asset recorded when a company acquires another business for a price higher than the fair market value of its tangible net physical assets.',
    example: 'Buying a software company with $10 million in physical servers for $50 million records $40 million as "Goodwill" for brand, team, and technology.',
    whyItMatters: 'If the acquired business underperforms, the company must write down ("impair") goodwill, recording massive paper losses.'
  },
  {
    id: 'fs-current-ratio',
    groupId: 'financial-statements',
    question: 'What is the Current Ratio and what does it measure?',
    explanation: 'A fundamental liquidity ratio: Current Assets divided by Current Liabilities. Measures whether a company has enough short-term resources to pay its short-term debts.',
    example: 'Holding $200,000 in current assets and $100,000 in current liabilities produces a Current Ratio of 2.0.',
    whyItMatters: 'A current ratio below 1.0 indicates severe liquidity distress, meaning the company may fail to pay bills due this year.'
  },
  {
    id: 'fs-quick-ratio-acid-test',
    groupId: 'financial-statements',
    question: 'What is the Quick Ratio (Acid-Test)?',
    explanation: 'A stricter liquidity test: (Cash + Short-Term Investments + Accounts Receivable) divided by Current Liabilities, completely excluding illiquid inventory.',
    example: 'A car dealer may have millions in unsold cars, but the Quick Ratio only counts actual cash and receivables to ensure immediate solvency.',
    whyItMatters: 'In a sudden crisis, inventory cannot always be liquidated quickly without steep discounts, making the Quick Ratio a truer safety test.'
  },
  {
    id: 'fs-accrual-vs-cash-accounting',
    groupId: 'financial-statements',
    question: 'What is Accrual Accounting vs Cash Accounting?',
    explanation: 'Cash accounting records revenue and expenses only when cash physically changes hands. Accrual accounting records revenue when it is earned (goods delivered) and expenses when incurred, regardless of payment timing.',
    example: 'Under accrual accounting, completing a consulting project on June 30 records the revenue in June, even if the client doesn’t pay until August.',
    whyItMatters: 'All public companies are required to use accrual accounting to match revenues with the expenses that generated them.'
  },
  {
    id: 'fs-free-cash-flow-fcf',
    groupId: 'financial-statements',
    question: 'What is Free Cash Flow (FCF)?',
    explanation: 'Operating Cash Flow minus Capital Expenditures (CapEx). It represents the pure, unencumbered surplus cash a company can freely spend on dividends, buybacks, or acquisitions without hurting operations.',
    example: 'Generating $100 million from operations and spending $30 million maintaining factories leaves $70 million in Free Cash Flow.',
    whyItMatters: 'Free Cash Flow is the true lifeblood of intrinsic business valuation; it is the exact cash owners could put in their pockets.'
  },
  {
    id: 'fs-gross-vs-operating-vs-net-profit',
    groupId: 'financial-statements',
    question: 'What is Gross Profit vs Operating Profit vs Net Income?',
    explanation: 'Gross Profit reflects product profitability (Revenue - direct costs). Operating Profit (EBIT) reflects company running efficiency. Net Income reflects bottom-line profit after debt interest and government taxes.',
    example: 'A car sells for $40k and costs $30k to build ($10k Gross). After dealership rent ($4k), Operating Profit is $6k. After loan interest and taxes ($2k), Net Income is $4k.',
    whyItMatters: 'A company can have great gross margins but awful net income if administrative salaries and debt interest are bloated.'
  },
  {
    id: 'fs-debt-to-equity-ratio',
    groupId: 'financial-statements',
    question: 'What is the Debt-to-Equity (D/E) Ratio?',
    explanation: 'Total Liabilities divided by Shareholders’ Equity, measuring how much a company’s operations are financed through borrowed debt versus owner capital.',
    example: 'A business with $2 million in bank debt and $1 million in shareholder equity has a D/E ratio of 2.0.',
    whyItMatters: 'High D/E ratios magnify profits during economic booms, but make companies fragile and vulnerable to bankruptcy during recessions.'
  },
  {
    id: 'fs-operating-margin',
    groupId: 'financial-statements',
    question: 'What is Operating Margin and what does it reveal?',
    explanation: 'Operating Income divided by Total Revenue, expressed as a percentage: (Operating Profit ÷ Revenue) × 100.',
    example: 'An enterprise software company bringing in $100 million in revenue with $25 million in operating income has a 25% Operating Margin.',
    whyItMatters: 'Reveals the core profitability of day-to-day business operations before accounting distortions from debt structure or one-time tax credits.'
  },
  {
    id: 'fs-deferred-revenue',
    groupId: 'financial-statements',
    question: 'What is Deferred Revenue on a Balance Sheet?',
    explanation: 'Cash received from customers for goods or services that have not yet been delivered or performed, recorded as a liability until the service is fulfilled.',
    example: 'An annual software subscription where the customer pays $1,200 upfront; each month, $100 moves from Deferred Revenue into real Revenue.',
    whyItMatters: 'It is a "good liability" because it represents cash already collected in the bank before doing the work.'
  },
  {
    id: 'fs-inventory-valuation-methods',
    groupId: 'financial-statements',
    question: 'What is FIFO vs LIFO in inventory accounting?',
    explanation: 'FIFO (First-In, First-Out) assumes the oldest inventory items purchased are sold first. LIFO (Last-In, First-Out) assumes the newest, most recently purchased items are sold first.',
    example: 'During inflation, FIFO reports lower costs and higher reported profits, while LIFO reports higher costs and lowers income taxes.',
    whyItMatters: 'Different inventory accounting choices significantly change reported profits on corporate tax returns.'
  },
  {
    id: 'fs-return-on-assets-roa',
    groupId: 'financial-statements',
    question: 'What is Return on Assets (ROA)?',
    explanation: 'Net Income divided by Total Assets, measuring how efficiently management uses all the company’s economic resources to generate profits.',
    example: 'A company generating $10 million in profit using $50 million in assets has an ROA of 20%.',
    whyItMatters: 'Asset-light companies (like software and digital platforms) boast high ROAs, while heavy industries (steel, airlines) require massive assets for modest profits.'
  },
  {
    id: 'fs-off-balance-sheet-liabilities',
    groupId: 'financial-statements',
    question: 'What are Off-Balance-Sheet Liabilities?',
    explanation: 'Significant financial commitments, lease contracts, or partnership debt guarantees that are not directly recorded on the primary balance sheet face.',
    example: 'Long-term operating aircraft leases or joint venture debt that Enron notoriously concealed before its collapse in 2001.',
    whyItMatters: 'Astute investors read the footnotes of financial reports to uncover hidden debt commitments.'
  },
  {
    id: 'fs-diluted-shares-eps',
    groupId: 'financial-statements',
    question: 'What is Basic vs Diluted Earnings Per Share (EPS)?',
    explanation: 'Basic EPS divides net profit strictly by current shares. Diluted EPS calculates per-share profit assuming all employee stock options, warrants, and convertible bonds are exercised.',
    example: 'A company has a Basic EPS of $4.00, but stock options given to executives dilute future per-share earnings to $3.40.',
    whyItMatters: 'Always use Diluted EPS when valuing stocks; it accounts for the inevitable share dilution paid out to corporate executives.'
  },
  {
    id: 'fs-auditor-opinions',
    groupId: 'financial-statements',
    question: 'What is an Auditor’s "Unqualified" vs "Qualified" Opinion?',
    explanation: 'An independent CPA audit report. "Unqualified" (Clean) means financial records are accurate and follow standards. "Qualified" or "Adverse" means auditors found red flags, missing records, or suspect numbers.',
    example: 'Reading the audit letter at the front of an annual report to ensure certified accountants found zero accounting irregularities.',
    whyItMatters: 'If an auditor refuses to issue a clean unqualified opinion, walk away from the company immediately.'
  },
  {
    id: 'fs-restatement-of-earnings',
    groupId: 'financial-statements',
    question: 'What is an Earnings Restatement and why is it a major red flag?',
    explanation: 'When a company admits that past published financial statements contained significant errors, aggressive accounting, or fraud, and retroactively revises past numbers downward.',
    example: 'A company announcing that revenues reported over the past two years were overstated by $40 million due to premature booking.',
    whyItMatters: 'Restatements shatter Wall Street credibility, trigger class-action lawsuits, and frequently cause share prices to collapse.'
  },
  {
    id: 'fs-the-10k-and-10q',
    groupId: 'financial-statements',
    question: 'What is a Form 10-K vs 10-Q filed with the SEC?',
    explanation: 'A 10-K is a comprehensive, audited annual report filed at the end of each fiscal year. A 10-Q is a smaller, unaudited quarterly update filed three times per year.',
    example: 'A 10-K contains over 100 pages detailing audited statements, executive compensation, legal risks, and competitive threats.',
    whyItMatters: 'The single most authoritative source of unfiltered truth about a public company, free from media spin or PR buzzwords.'
  }
]
