import { LearnLesson } from '../types'

export const ADVANCED_FINANCE_LESSONS: LearnLesson[] = [
  {
    id: 'af-what-is-a-derivative',
    groupId: 'advanced-finance',
    question: 'What is a Financial Derivative?',
    explanation: 'A financial contract whose price is derived from the value of an underlying asset (such as a stock, commodity, currency, or interest rate). You trade the contract rather than the physical asset itself.',
    example: 'An airline buying a crude oil contract whose value fluctuates based on world oil prices, without taking delivery of oil barrels today.',
    whyItMatters: 'Derivatives allow global businesses to transfer unwanted price risks to willing market speculators.'
  },
  {
    id: 'af-call-vs-put-options',
    groupId: 'advanced-finance',
    question: 'What is a Call Option vs a Put Option?',
    explanation: 'A Call gives you the right (not obligation) to BUY a stock at a set strike price before an expiration date. A Put gives you the right to SELL a stock at a set price.',
    example: 'Buying a $100 Call on a $95 stock allows you to buy at $100 even if the stock skyrockets to $150. Buying a Put lets you sell at $100 if the stock crashes to $50.',
    whyItMatters: 'Options can be used defensively as price insurance or aggressively as high-leverage speculative bets.'
  },
  {
    id: 'af-what-is-hedging',
    groupId: 'advanced-finance',
    question: 'What is Hedging in finance?',
    explanation: 'Taking an offsetting position in a financial market to reduce or neutralize the risk of adverse price movements in an existing asset.',
    example: 'A wheat farmer locking in a fixed sale price for their future harvest using futures contracts to protect against bumper-crop price crashes.',
    whyItMatters: 'Hedging sacrifices speculative upside in exchange for business predictability and cashflow certainty.'
  },
  {
    id: 'af-what-is-a-futures-contract',
    groupId: 'advanced-finance',
    question: 'What is a Futures Contract?',
    explanation: 'A standardized legal agreement to buy or sell a specific commodity or financial asset at a predetermined price at a specified future date. Unlike options, both parties are legally obligated to execute.',
    example: 'A coffee roaster agreeing today to buy 10,000 pounds of coffee beans from a farmer in 6 months at $2.20 per pound.',
    whyItMatters: 'Provides farmers and manufacturers price stability months before physical production and shipping occur.'
  },
  {
    id: 'af-yield-curve-inversion',
    groupId: 'advanced-finance',
    question: 'What is the Inverted Yield Curve and why does it predict recessions?',
    explanation: 'Normally, long-term bonds pay higher yields than short-term bonds to compensate for time. When short-term yields become higher than long-term yields, the curve is "inverted," signaling that bond markets expect severe economic slowdown.',
    example: 'A 2-year Treasury paying 5.0% while a 10-year Treasury pays 4.0%.',
    whyItMatters: 'An inverted yield curve has accurately preceded nearly every single modern economic recession over the past 60 years.'
  },
  {
    id: 'af-dcf-discounted-cash-flow',
    groupId: 'advanced-finance',
    question: 'What is Discounted Cash Flow (DCF) Valuation?',
    explanation: 'A valuation method that estimates what a company is worth today by forecasting all its future cash flows and "discounting" them back to present value using a required rate of return.',
    example: 'Calculating that a company expected to produce $10 million in cash annually for 10 years is worth $75 million in today’s dollars after accounting for inflation and risk.',
    whyItMatters: 'The gold standard valuation framework for professional corporate finance, private equity, and fundamental equity analysis.'
  },
  {
    id: 'af-leverage-and-ruin-risk',
    groupId: 'advanced-finance',
    question: 'What is Financial Leverage and the Risk of Ruin?',
    explanation: 'Using borrowed debt to amplify investment returns. If your asset gains 10%, 5x leverage yields 50%. But if your asset drops 20%, 5x leverage wipes out 100% of your equity completely.',
    example: 'Investing $20,000 cash and borrowing $80,000 to buy $100,000 of assets. A 20% decline ($20k loss) reduces your equity to exactly zero.',
    whyItMatters: 'No mathematical edge or intellectual brilliance can survive excessive leverage when a market shock hits.'
  },
  {
    id: 'af-volatility-vix-index',
    groupId: 'advanced-finance',
    question: 'What is the VIX (Volatility Index)?',
    explanation: 'The "Fear Index" calculating the stock market’s expectation of 30-day volatility implied by S&P 500 option prices. Higher numbers indicate deep investor anxiety and turmoil.',
    example: 'VIX typically hovers around 12–18 in calm bull markets, but spikes above 40 during market panics and recessions.',
    whyItMatters: 'Traders use VIX spikes as contrarian indicators: "When the VIX is high, it’s time to buy; when the VIX is low, it’s time to go."'
  },
  {
    id: 'af-alpha-vs-beta',
    groupId: 'advanced-finance',
    question: 'What is Alpha vs Beta in portfolio management?',
    explanation: 'Beta is the return generated simply by riding the broader market waves. Alpha is the excess return generated by an investor’s pure skill above and beyond the benchmark market return.',
    example: 'If the market gains 10% and your fund manager gains 13% with the same risk level, the manager generated 3% of positive Alpha.',
    whyItMatters: 'Most active hedge funds charge massive fees for Alpha while delivering only expensive Beta that you could get for 0.03% in an index fund.'
  },
  {
    id: 'af-arbitrage',
    groupId: 'advanced-finance',
    question: 'What is Financial Arbitrage?',
    explanation: 'The simultaneous purchase and sale of an identical asset in two different markets to exploit a tiny price discrepancy for risk-free profit.',
    example: 'Gold trading for $2,000 an ounce in London and $2,002 in New York. A trader instantly buys in London and sells in New York, pocketing $2.',
    whyItMatters: 'Arbitrageurs act as the market’s invisible hand, rapidly eliminating price discrepancies and keeping global markets efficiently connected.'
  },
  {
    id: 'af-sharpe-ratio',
    groupId: 'advanced-finance',
    question: 'What is the Sharpe Ratio and what does it measure?',
    explanation: 'A metric comparing an investment’s excess return above risk-free cash relative to its price volatility: (Portfolio Return - Risk-Free Rate) divided by Standard Deviation.',
    example: 'A fund returning 12% with wild roller-coaster volatility may have a lower Sharpe ratio than a calm fund returning 10% with rock-steady consistency.',
    whyItMatters: 'Shows whether an investor’s high returns are the result of genuine smart decisions or simply taking reckless volatility risks.'
  },
  {
    id: 'af-efficient-market-hypothesis-emh',
    groupId: 'advanced-finance',
    question: 'What is the Efficient Market Hypothesis (EMH)?',
    explanation: 'The academic theory stating that share prices always incorporate and reflect all relevant public information, making it impossible to consistently beat the market long-term without taking extra risk.',
    example: 'By the time you read news about a company’s new product online, algorithmic traders have already adjusted the stock price within milliseconds.',
    whyItMatters: 'Reminds individual investors why trying to outsmart millions of full-time market participants is usually a fool’s errand.'
  },
  {
    id: 'af-interest-rate-swap',
    groupId: 'advanced-finance',
    question: 'What is an Interest Rate Swap?',
    explanation: 'A contractual agreement between two institutional parties to exchange future interest rate cash flows—typically swapping a variable floating rate for a fixed predictable rate.',
    example: 'A real estate developer with a floating-rate bank loan swaps payments with a bank to lock in a guaranteed 5% fixed payment for 10 years.',
    whyItMatters: 'Allows corporations to customize their debt liabilities and protect themselves against central bank interest rate shocks.'
  },
  {
    id: 'af-wacc-cost-of-capital',
    groupId: 'advanced-finance',
    question: 'What is WACC (Weighted Average Cost of Capital)?',
    explanation: 'The average interest rate a corporation must pay to finance its assets, weighted proportionally between its cost of equity (shareholders) and cost of debt (bondholders).',
    example: 'If a company’s WACC is 8%, any new project, factory, or acquisition must generate a return greater than 8% to create real shareholder value.',
    whyItMatters: 'Acts as the corporate hurdle rate; investments returning less than WACC destroy economic value.'
  },
  {
    id: 'af-liquidity-black-hole',
    groupId: 'advanced-finance',
    question: 'What is a "Liquidity Black Hole"?',
    explanation: 'A catastrophic market panic where all buyers vanish simultaneously from the order book, causing prices to gap downward precipitously as sellers find no bids.',
    example: 'During the 2010 Flash Crash or the 1987 crash, automated selling algorithms overwhelmed bids, causing stock prices to drop 20% in minutes.',
    whyItMatters: 'Demonstrates that liquidity is an illusion that often disappears at the exact moment you need it most.'
  },
  {
    id: 'af-naked-options-risk',
    groupId: 'advanced-finance',
    question: 'Why is Selling "Naked Options" the most dangerous trade in finance?',
    explanation: 'Selling an option without owning the underlying stock or cash collateral. If the market moves violently against you, your potential dollar losses are mathematically infinite.',
    example: 'Selling a naked call on a biotech stock for $100 profit; the company cures cancer and the stock surges 1,000%, leaving the seller with a $500,000 debt.',
    whyItMatters: 'Nicknamed "picking up nickels in front of a steamroller"—you collect small regular profits until one bad day wipes you out completely.'
  },
  {
    id: 'af-carry-trade',
    groupId: 'advanced-finance',
    question: 'What is the Global Currency "Carry Trade"?',
    explanation: 'Borrowing money in a country with near-zero interest rates (like Japan) and converting it to invest in higher-yielding bonds or assets in another country (like the US).',
    example: 'Borrowing Yen at 0.1% interest and investing in US Treasuries paying 5.0%, pocketing the 4.9% spread as pure profit.',
    whyItMatters: 'When the low-rate currency suddenly strengthens, trillions of dollars in carry trades are forcibly unwound, triggering global market crashes.'
  },
  {
    id: 'af-spacs-special-purpose-acquisitions',
    groupId: 'advanced-finance',
    question: 'What is a SPAC (Special Purpose Acquisition Company)?',
    explanation: 'A blank-check shell company with zero actual operations that raises capital from public investors specifically to merge with and take an undisclosed private company public.',
    example: 'Investors put $200 million into a SPAC managed by a famous investor, which later buys an electric truck startup.',
    whyItMatters: 'Historically characterized by massive founder promotion fees that severely diluted and penalized retail public investors.'
  },
  {
    id: 'af-private-equity-lbo',
    groupId: 'advanced-finance',
    question: 'What is a Leveraged Buyout (LBO) in Private Equity?',
    explanation: 'When a private equity firm acquires a mature company using a tiny amount of its own equity and a massive amount of borrowed debt, placing the debt directly onto the acquired company’s balance sheet.',
    example: 'Buying a $100M business using $20M cash and $80M bank loans, using the company’s operating cash flow to pay down the bank loans over 5 years.',
    whyItMatters: 'Generates extraordinary investment returns if successful, but leaves the acquired business burdened with heavy debt loads.'
  },
  {
    id: 'af-hft-high-frequency-trading',
    groupId: 'advanced-finance',
    question: 'What is High-Frequency Trading (HFT)?',
    explanation: 'Algorithmic trading where supercomputers co-located next to stock exchange servers execute thousands of order transactions per second based on microsecond price discrepancies.',
    example: 'A trading firm detecting an institutional buy order in New York and buying the stock in Chicago a few milliseconds ahead to front-run the price move.',
    whyItMatters: 'HFT firms provide massive daily trading liquidity and tight bid-ask spreads, but can exacerbate rapid flash crashes.'
  },
  {
    id: 'af-convertible-arbitrage',
    groupId: 'advanced-finance',
    question: 'What is Convertible Arbitrage?',
    explanation: 'A hedge fund strategy of purchasing a company’s convertible bonds while simultaneously shorting its common stock, capturing interest yield while hedging market direction.',
    example: 'Profiting from the mispricing between a company’s debt and equity without having to guess whether the stock will go up or down.',
    whyItMatters: 'Shows how sophisticated hedge funds generate steady returns uncorrelated with broader stock market direction.'
  },
  {
    id: 'af-mark-to-market-accounting',
    groupId: 'advanced-finance',
    question: 'What is Mark-to-Market Accounting?',
    explanation: 'Recording the value of an asset on the balance sheet at its current live market price rather than its original historical purchase cost.',
    example: 'Writing down a portfolio of mortgage bonds by $20 million because current buyers are only bidding 80 cents on the dollar.',
    whyItMatters: 'Provides transparency in liquid markets, but can force devastating paper write-downs during temporary liquidity freezes (as in 2008).'
  },
  {
    id: 'af-credit-default-swaps-cds',
    groupId: 'advanced-finance',
    question: 'What is a Credit Default Swap (CDS)?',
    explanation: 'A derivative contract acting as insurance against a corporate or sovereign bond default. The buyer pays regular premiums, and the seller pays out if the underlying borrower defaults.',
    example: 'Buying a CDS on a struggling foreign country’s bonds. If the country defaults, the swap seller pays you the full face value of the bonds.',
    whyItMatters: 'Made famous in "The Big Short" when investors used CDS contracts to bet against the collapse of subprime mortgage bonds.'
  },
  {
    id: 'af-minsky-moment',
    groupId: 'advanced-finance',
    question: 'What is a "Minsky Moment" in credit cycles?',
    explanation: 'The sudden collapse of asset values after an extended period of financial stability and prosperity leads investors and borrowers to take on unsustainable speculative leverage.',
    example: '"Stability breeds instability." Years of economic peace convince lenders to relax lending standards until one small shock triggers a sudden debt unwind.',
    whyItMatters: 'Reminds investors that long periods of quiet economic stability are precisely when dangerous speculative bubbles quietly form.'
  },
  {
    id: 'af-risk-parity',
    groupId: 'advanced-finance',
    question: 'What is the Risk Parity Portfolio concept?',
    explanation: 'Allocating portfolio capital so that each asset class (stocks, bonds, commodities, inflation-protected debt) contributes an equal amount of total risk, rather than equal dollar amounts.',
    example: 'Ray Dalio’s "All Weather Portfolio" using levered bonds and commodities to balance volatile stocks, designed to perform smoothly in any economic climate.',
    whyItMatters: 'Traditional 60/40 portfolios derive 90% of their risk from stocks; risk parity creates true balance across all economic seasons.'
  }
]
