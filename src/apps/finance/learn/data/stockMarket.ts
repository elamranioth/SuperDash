import { LearnLesson } from '../types'

export const STOCK_MARKET_LESSONS: LearnLesson[] = [
  {
    id: 'sm-what-is-a-stock',
    groupId: 'stock-market',
    question: 'What is a Stock or Share?',
    explanation: 'A stock represents a tiny slice of fractional ownership in a real corporation. Owning shares entitles you to a portion of the company’s assets and future profits.',
    example: 'If a company has 1,000,000 total shares and you own 1,000 shares, you literally own 0.1% of the entire enterprise.',
    whyItMatters: 'Stocks are not digital casino chips; they are legal deeds of partial ownership in productive businesses.'
  },
  {
    id: 'sm-why-companies-issue-stock',
    groupId: 'stock-market',
    question: 'Why do Companies Issue Stock to the Public?',
    explanation: 'To raise large amounts of non-repayable capital to fund research, build new factories, hire teams, or pay off debt without taking bank loans.',
    example: 'An electric vehicle startup sells 20% of its equity to the public to raise $500 million for building a battery manufacturing plant.',
    whyItMatters: 'Issuing shares avoids interest payments, but permanently dilutes the ownership percentage of founders.'
  },
  {
    id: 'sm-what-is-an-ipo',
    groupId: 'stock-market',
    question: 'What is an IPO (Initial Public Offering)?',
    explanation: 'The very first time a private company lists its shares on a public stock exchange for everyday retail and institutional investors to trade.',
    example: 'When Airbnb transitioned from a private tech startup into a publicly traded company on NASDAQ in 2020.',
    whyItMatters: 'IPOs allow early founders and venture investors to cash out, while letting the public buy shares.'
  },
  {
    id: 'sm-stock-exchanges',
    groupId: 'stock-market',
    question: 'What is a Stock Exchange?',
    explanation: 'A regulated marketplace where buyers and sellers meet to trade shares of publicly listed companies, such as the New York Stock Exchange (NYSE) or NASDAQ.',
    example: 'You place a buy order in an app; the exchange instantly matches you with a seller across the world at an agreed price in milliseconds.',
    whyItMatters: 'Exchanges provide liquidity, standardized transparent pricing, and regulatory enforcement that prevents market fraud.'
  },
  {
    id: 'sm-market-capitalization',
    groupId: 'stock-market',
    question: 'What is Market Capitalization (Market Cap)?',
    explanation: 'The total dollar market value of a company’s outstanding shares, calculated as Share Price multiplied by Total Number of Shares.',
    example: 'A company with 100 million shares trading at $50 per share has a market capitalization of $5 Billion.',
    whyItMatters: 'Categorizes companies into Mega-Cap ($200B+), Large-Cap ($10B+), Mid-Cap, and Small-Cap with different risk and growth profiles.'
  },
  {
    id: 'sm-dividends',
    groupId: 'stock-market',
    question: 'What are Dividends and Dividend Yield?',
    explanation: 'A regular cash distribution paid by profitable companies out of their earnings directly into shareholders’ accounts, usually every quarter.',
    example: 'If a company paying $2 in annual dividends per share trades at $50, its dividend yield is 4% ($2 ÷ $50).',
    whyItMatters: 'Dividends provide steady, predictable income without requiring you to sell your underlying shares.'
  },
  {
    id: 'sm-bull-vs-bear-market',
    groupId: 'stock-market',
    question: 'What is a Bull Market vs a Bear Market?',
    explanation: 'A Bull market is an extended period of rising stock prices and investor optimism. A Bear market is defined as a drop of 20% or more from recent market peaks accompanied by widespread pessimism.',
    example: 'The 2009–2020 historic economic expansion was a major bull market; the rapid sell-off in early 2020 was a sharp bear market.',
    whyItMatters: 'Bear markets are completely normal and healthy parts of economic cycles; they offer the greatest discounts for patient buyers.'
  },
  {
    id: 'sm-pe-ratio',
    groupId: 'stock-market',
    question: 'What is the P/E (Price-to-Earnings) Ratio?',
    explanation: 'A valuation metric comparing a company’s current stock price to its per-share earnings: Price per Share divided by Earnings per Share (EPS).',
    example: 'If a stock trades at $60 and earns $3 per share each year, its P/E ratio is 20, meaning investors pay $20 for every $1 of annual profit.',
    whyItMatters: 'Helps determine whether a stock is relatively expensive or cheap compared to its true earnings power.'
  },
  {
    id: 'sm-earnings-reports',
    groupId: 'stock-market',
    question: 'What are Quarterly Earnings Reports?',
    explanation: 'Mandatory financial scorecards filed every three months where public companies report revenue, net profit, expenses, and future executive guidance.',
    example: 'Apple releasing its Q4 earnings showing record holiday iPhone sales, causing analysts to update their price targets.',
    whyItMatters: 'Stock prices often swing violently after earnings reports if real results miss or exceed Wall Street expectations.'
  },
  {
    id: 'sm-stock-splits',
    groupId: 'stock-market',
    question: 'What is a Stock Split?',
    explanation: 'A corporate action that increases the total number of shares while proportionally reducing the price per share, leaving the company’s total market value unchanged.',
    example: 'In a 2-for-1 split, if you owned 10 shares worth $100 each ($1,000 total), you now own 20 shares worth $50 each ($1,000 total).',
    whyItMatters: 'Like cutting a pizza into 8 slices instead of 4; it does not give you more pizza, but makes individual slices more affordable.'
  },
  {
    id: 'sm-stock-buybacks',
    groupId: 'stock-market',
    question: 'What is a Share Buyback (Share Repurchase)?',
    explanation: 'When a company uses its own spare cash to buy its shares from the open market and retires them, reducing the total shares outstanding.',
    example: 'Buying back 5% of all shares means remaining shareholders now own a larger piece of the company’s future profit without spending a dime.',
    whyItMatters: 'A tax-efficient way for management to return capital to long-term shareholders and boost earnings per share.'
  },
  {
    id: 'sm-market-order-vs-limit-order',
    groupId: 'stock-market',
    question: 'What is a Market Order vs a Limit Order?',
    explanation: 'A Market Order buys or sells immediately at the best available current price. A Limit Order executes only at your specified target price or better.',
    example: 'A limit order to buy at $48 will wait patiently and will not fill if the stock stays above $48.',
    whyItMatters: 'Limit orders protect you from sudden price spikes and unexpected slippage during volatile trading moments.'
  },
  {
    id: 'sm-bid-ask-spread',
    groupId: 'stock-market',
    question: 'What is the Bid-Ask Spread?',
    explanation: 'The difference between the highest price a buyer is willing to pay (the Bid) and the lowest price a seller is willing to accept (the Ask).',
    example: 'Bid is $100.00 and Ask is $100.05; the $0.05 spread is pocketed by market makers providing liquidity.',
    whyItMatters: 'Illiquid, small stocks have wide spreads that immediately eat into your trading returns when entering and exiting positions.'
  },
  {
    id: 'sm-economic-moat',
    groupId: 'stock-market',
    question: 'What is an "Economic Moat" in business?',
    explanation: 'A sustainable competitive advantage that protects a company from competitors, such as powerful brands, network effects, or patents.',
    example: 'Coca-Cola’s global brand or Google’s search network effect prevents rivals from easily stealing their market share and profit margins.',
    whyItMatters: 'Companies with wide economic moats can compound earnings for decades without price erosion.'
  },
  {
    id: 'sm-blue-chip-stocks',
    groupId: 'stock-market',
    question: 'What are "Blue Chip" Stocks?',
    explanation: 'Large, well-established, financially sound companies with national reputations and a history of weathering recessions while paying reliable dividends.',
    example: 'Household names like Johnson & Johnson, Microsoft, Procter & Gamble, and JPMorgan Chase.',
    whyItMatters: 'Form the stable backbone of conservative equity portfolios seeking dependable growth with lower bankruptcy risk.'
  },
  {
    id: 'sm-short-selling',
    groupId: 'stock-market',
    question: 'What is Short Selling and why is it dangerous?',
    explanation: 'Borrowing shares from a broker to sell them immediately, hoping the price plunges so you can buy them back cheaper later and pocket the difference.',
    example: 'Selling borrowed shares at $50 and buying them back at $30 makes a $20 profit per share.',
    whyItMatters: 'When buying a stock, your maximum loss is 100%; when shorting, a stock can rise infinitely, creating unlimited loss potential.'
  },
  {
    id: 'sm-stock-market-index',
    groupId: 'stock-market',
    question: 'What is a Stock Market Index (e.g. S&P 500, Dow)?',
    explanation: 'A statistical basket representing a specific segment of the financial market to track overall economic health and investment performance.',
    example: 'The S&P 500 tracks the market performance of the 500 largest publicly traded corporations in the United States.',
    whyItMatters: 'Acts as the definitive benchmark that all professional fund managers and individual investors measure themselves against.'
  },
  {
    id: 'sm-day-trading-vs-investing',
    groupId: 'stock-market',
    question: 'Why do over 95% of Day Traders lose money?',
    explanation: 'Day trading is high-frequency short-term speculation competing against supercomputers, algorithms, and transaction fees.',
    example: 'Buying a stock at 10:00 AM hoping for a 0.5% move by 11:30 AM is playing a negative-sum game against institutional machines.',
    whyItMatters: 'Real business wealth creation takes quarters and years, not minutes and seconds.'
  },
  {
    id: 'sm-analyst-price-targets',
    groupId: 'stock-market',
    question: 'Should you trust Wall Street Analyst Price Targets?',
    explanation: 'Investment bank analysts frequently revise price targets to match recent momentum and face corporate conflicts of interest with underwriting clients.',
    example: 'An investment bank raising its price target on a stock after it has already gained 80% over the past two months.',
    whyItMatters: 'Analyst forecasts are lagging opinions, not reliable predictions of future share prices.'
  },
  {
    id: 'sm-penny-stocks',
    groupId: 'stock-market',
    question: 'Why are Penny Stocks notoriously risky?',
    explanation: 'Micro-cap stocks trading under $5 per share on unregulated over-the-counter boards, characterized by extreme volatility, tiny liquidity, and pump-and-dump scams.',
    example: 'Promoters hype a $0.05 biotech stock on social media, sell their own shares at $0.20, and leave regular retail investors holding worthless paper.',
    whyItMatters: 'Low dollar share price does not mean "cheap"; penny stocks are hotbeds of manipulation and insolvency.'
  },
  {
    id: 'sm-insider-trading',
    groupId: 'stock-market',
    question: 'What is Illegal Insider Trading?',
    explanation: 'Buying or selling securities based on material, non-public information obtained through a confidential relationship or breach of duty.',
    example: 'A CFO buying shares of their own company days before publicly announcing a massive, secret merger with a competitor.',
    whyItMatters: 'Financial regulations strictly punish insider trading to maintain public trust in fair and open markets.'
  },
  {
    id: 'sm-stock-beta',
    groupId: 'stock-market',
    question: 'What is Stock Beta (β)?',
    explanation: 'A measure of how sensitive an individual stock’s price is compared to the broader market index (which has a benchmark beta of 1.0).',
    example: 'A utility stock with a beta of 0.6 barely moves when the market swings; a high-growth tech stock with a beta of 1.8 moves almost twice as violently.',
    whyItMatters: 'Investors use low-beta stocks to dampen overall portfolio volatility during uncertain economic periods.'
  },
  {
    id: 'sm-cyclical-vs-defensive',
    groupId: 'stock-market',
    question: 'What are Cyclical vs Defensive Stocks?',
    explanation: 'Cyclical stocks follow economic boom-and-bust cycles (automakers, luxury travel, construction). Defensive stocks supply necessities that people buy regardless of recessions (groceries, utilities, healthcare).',
    example: 'Airline revenue collapses during a downturn, while toothpaste and electricity revenues stay virtually constant.',
    whyItMatters: 'Balancing both sectors allows your equity portfolio to participate in economic expansions while resisting deep recessions.'
  },
  {
    id: 'sm-stock-screener',
    groupId: 'stock-market',
    question: 'What is a Stock Screener?',
    explanation: 'A software filtering tool that allows investors to sift through thousands of public companies based on financial metrics like P/E ratio, revenue growth, or dividend yield.',
    example: 'Filtering for companies with P/E under 15, debt-to-equity under 0.5, and dividend yield above 3% across the entire NYSE.',
    whyItMatters: 'Saves hundreds of hours by instantly eliminating low-quality companies that fail your core investment criteria.'
  },
  {
    id: 'sm-circuit-breakers',
    groupId: 'stock-market',
    question: 'What are Market Circuit Breakers?',
    explanation: 'Regulatory trading halts automatically triggered when market benchmark indices drop by 7%, 13%, or 20% in a single trading day.',
    example: 'The stock exchange automatically pauses trading for 15 minutes to allow human traders to review orders and prevent algorithm flash crashes.',
    whyItMatters: 'Provides a breathing room pause that stops self-reinforcing panic spirals and algorithmic liquidation cascades.'
  }
]
