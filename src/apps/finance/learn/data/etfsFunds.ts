import { LearnLesson } from '../types'

export const ETFS_FUNDS_LESSONS: LearnLesson[] = [
  {
    id: 'ef-what-is-an-etf',
    groupId: 'etfs-funds',
    question: 'What is an ETF (Exchange-Traded Fund)?',
    explanation: 'A marketable basket of dozens, hundreds, or thousands of individual stocks or bonds that trades on a regular stock exchange just like a single share of stock.',
    example: 'Buying one single share of an S&P 500 ETF instantly gives you fractional ownership across 500 of the biggest companies in America.',
    whyItMatters: 'Allows anyone to achieve instant, massive diversification with a single click and low minimum capital.'
  },
  {
    id: 'ef-index-fund',
    groupId: 'etfs-funds',
    question: 'What is an Index Fund and who invented it?',
    explanation: 'A mutual fund or ETF designed to mechanically replicate the performance of a specific financial index rather than paying expensive human managers to pick stocks. Pioneered by John Bogle, founder of Vanguard.',
    example: 'A Total Stock Market Index Fund buys every publicly traded company in proportion to its size and never trades based on speculation.',
    whyItMatters: 'Consistently delivers higher net returns than most actively managed funds due to ultra-low operational fees.'
  },
  {
    id: 'ef-mutual-fund-vs-etf',
    groupId: 'etfs-funds',
    question: 'What is the difference between a Mutual Fund and an ETF?',
    explanation: 'ETFs trade continuously throughout the trading day at live market prices with tax advantages. Traditional mutual funds are priced and settled only once per day after the market closes at 4:00 PM.',
    example: 'You can buy an ETF at 11:32 AM at $150.25; buying a mutual fund means submitting an order and finding out the price at 5:00 PM.',
    whyItMatters: 'ETFs offer greater trading flexibility, lower minimum initial investments, and superior capital gains tax efficiency.'
  },
  {
    id: 'ef-expense-ratio',
    groupId: 'etfs-funds',
    question: 'What is an Expense Ratio and why do small percentages matter?',
    explanation: 'The annual management fee charged by a fund, deducted automatically from the fund’s assets as a tiny daily percentage.',
    example: 'A low-cost index ETF charges 0.03% ($3 per year on $10,000), while an active mutual fund charges 1.2% ($120 per year on $10,000).',
    whyItMatters: 'Over a 30-year investing career, a 1% fee difference will consume up to 30% of your total ending retirement nest egg.'
  },
  {
    id: 'ef-passive-vs-active-funds',
    groupId: 'etfs-funds',
    question: 'What is a Passive Fund vs an Active Fund?',
    explanation: 'Active funds employ a team of portfolio managers and analysts trying to outguess the market. Passive funds follow an automated algorithmic index rule.',
    example: 'An active fund team trading stocks based on daily economic news vs an automated S&P 500 tracking fund.',
    whyItMatters: 'After high management fees, over 90% of active funds fail to beat simple passive indexes over a 20-year horizon.'
  },
  {
    id: 'ef-nav-net-asset-value',
    groupId: 'etfs-funds',
    question: 'What is NAV (Net Asset Value)?',
    explanation: 'The total value of all underlying securities held in a fund minus its liabilities, divided by the total number of fund shares outstanding.',
    example: 'If a fund holds $100 million in stocks and has 2 million shares, its NAV is exactly $50 per share.',
    whyItMatters: 'Shows whether an ETF is currently trading at a slight premium or discount to the true value of its underlying holdings.'
  },
  {
    id: 'ef-sector-etfs',
    groupId: 'etfs-funds',
    question: 'What is a Sector ETF?',
    explanation: 'An ETF that concentrates strictly on companies within a specific industry, such as Healthcare, Technology, Energy, or Financials.',
    example: 'An energy sector ETF holds shares of oil producers, pipeline operators, and renewable energy companies.',
    whyItMatters: 'Allows investors to express a specific economic thesis without having to research and select individual companies.'
  },
  {
    id: 'ef-bond-etfs',
    groupId: 'etfs-funds',
    question: 'What is a Bond ETF?',
    explanation: 'An ETF that pools hundreds of government or corporate bonds and pays monthly interest distributions directly to investors.',
    example: 'A Total Bond Market ETF holds US Treasuries and investment-grade corporate notes, paying regular monthly income.',
    whyItMatters: 'Makes bond investing simple and liquid for regular investors who cannot purchase individual institutional bonds in $100,000 lots.'
  },
  {
    id: 'ef-international-etfs',
    groupId: 'etfs-funds',
    question: 'What is an International or Emerging Markets ETF?',
    explanation: 'A fund that provides exposure to publicly traded companies based outside your domestic country, in developed (Europe, Japan) or emerging economies (India, Brazil).',
    example: 'An all-world ex-US ETF invests in thousands of leading companies across 40+ non-US countries.',
    whyItMatters: 'Prevents "home-country bias," protecting your wealth if your domestic economy experiences a lost decade of growth.'
  },
  {
    id: 'ef-total-stock-market-index',
    groupId: 'etfs-funds',
    question: 'What is a Total Stock Market Index Fund?',
    explanation: 'A fund that holds literally every single publicly traded company in an economy, from mega-cap giants down to small local enterprises.',
    example: 'Vanguard Total Stock Market (VTI) holds approximately 3,700 companies in a single ticker.',
    whyItMatters: 'You never have to guess which individual company or market cap tier will be the next decade’s superstar.'
  },
  {
    id: 'ef-reit-etfs',
    groupId: 'etfs-funds',
    question: 'What is a REIT ETF?',
    explanation: 'An ETF that invests in Real Estate Investment Trusts—publicly traded companies that own and operate income-producing commercial and residential real estate.',
    example: 'Holding shares in a REIT ETF that owns shopping centers, apartment complexes, medical clinics, and cell towers.',
    whyItMatters: 'Provides real estate income and inflation hedging without the hassle of property maintenance or managing tenants.'
  },
  {
    id: 'ef-commodity-etfs',
    groupId: 'etfs-funds',
    question: 'What is a Commodity ETF?',
    explanation: 'A fund that tracks physical commodities like physical gold bullion, silver, crude oil, or agricultural grains.',
    example: 'A physical gold ETF stores certified gold bars in London bank vaults corresponding to the number of shares held.',
    whyItMatters: 'Allows investors to hold physical commodities inside regular brokerage accounts without needing home safes.'
  },
  {
    id: 'ef-leveraged-etfs-danger',
    groupId: 'etfs-funds',
    question: 'Why are Leveraged and Inverse ETFs dangerous for long-term holding?',
    explanation: 'Funds designed to double or triple daily index moves (or inverse them) using derivatives. Due to daily compounding math ("volatility decay"), holding them long-term guarantees losses.',
    example: 'If an index drops 10% on Monday and climbs 11.1% on Tuesday, the index is flat, but a 3x leveraged ETF is down permanently.',
    whyItMatters: 'They are strictly short-term trading tools, never buy-and-hold investments for retirement.'
  },
  {
    id: 'ef-turnover-rate',
    groupId: 'etfs-funds',
    question: 'What is Fund Turnover Rate?',
    explanation: 'The percentage of a fund’s total portfolio holdings that are bought and sold by the fund managers within a single calendar year.',
    example: 'A fund with 100% turnover replaces every single stock in its portfolio each year; an index fund typically has under 3% turnover.',
    whyItMatters: 'High turnover creates transaction friction and generates taxable capital gains distributions that reduce your net wealth.'
  },
  {
    id: 'ef-bogleheads-philosophy',
    groupId: 'etfs-funds',
    question: 'What is the "Three-Fund Portfolio" strategy?',
    explanation: 'A minimalist investment strategy using just three broad index funds: a Total Domestic Stock Fund, a Total International Stock Fund, and a Total Bond Fund.',
    example: 'Allocating 60% Total US Stock, 20% Total International Stock, and 20% Total Bond Market across your accounts.',
    whyItMatters: 'Owns virtually every productive asset on planet Earth with minimal fees, zero stress, and outstanding long-term returns.'
  },
  {
    id: 'ef-equal-weight-vs-market-cap',
    groupId: 'etfs-funds',
    question: 'What is a Market-Cap Weighted vs Equal-Weighted ETF?',
    explanation: 'Market-cap weighted funds assign larger weights to larger companies. Equal-weighted funds give identical percentages to every company in the index.',
    example: 'In the S&P 500, the top 10 tech giants make up over 30% of a standard ETF, but only 2% in an equal-weight ETF.',
    whyItMatters: 'Equal-weight funds reduce concentration risk in a handful of mega-cap stocks at the cost of higher rebalancing fees.'
  },
  {
    id: 'ef-synthetic-etfs',
    groupId: 'etfs-funds',
    question: 'What is a Physical vs Synthetic ETF?',
    explanation: 'A physical ETF actually buys and holds the underlying securities. A synthetic ETF uses derivative swap contracts with investment banks to mimic the index return.',
    example: 'Physical fund holds actual Apple shares in a custodian vault; synthetic fund holds a contract with a bank promising the return of Apple.',
    whyItMatters: 'Synthetic ETFs carry counterparty risk—if the contracting bank defaults, fund shareholders face potential losses.'
  },
  {
    id: 'ef-tracking-error',
    groupId: 'etfs-funds',
    question: 'What is Tracking Error in an index fund?',
    explanation: 'The small divergence between the actual performance of the ETF and the official benchmark index it is designed to mimic.',
    example: 'An index gains 10.0%, but the ETF gains 9.94% due to expense fees, cash drag, and trading timing spreads.',
    whyItMatters: 'High tracking error indicates sloppy fund execution; reputable providers maintain near-zero tracking error.'
  },
  {
    id: 'ef-dividend-aristocrats-etfs',
    groupId: 'etfs-funds',
    question: 'What are Dividend Aristocrats ETFs?',
    explanation: 'Funds that exclusively hold established blue-chip companies that have increased their annual dividend payouts for at least 25 consecutive years.',
    example: 'Holding companies that survived 1990, 2000, 2008, and 2020 while increasing cash dividends every single year.',
    whyItMatters: 'Offers reliable cashflow and proven resilience against inflation and deep economic recessions.'
  },
  {
    id: 'ef-thematic-etfs',
    groupId: 'etfs-funds',
    question: 'What is a Thematic ETF and why be skeptical?',
    explanation: 'Niche funds created around trending buzzwords like "Metaverse," "AI," or "Clean Tech." They often launch at the peak of media hype with high expense ratios.',
    example: 'Buying a solar ETF right after it gained 120% in one year, only to watch it lose 60% over the next two years as hype cools.',
    whyItMatters: 'Most thematic funds underperform broad market indexes while charging five to ten times higher fees.'
  },
  {
    id: 'ef-authorized-participants',
    groupId: 'etfs-funds',
    question: 'How do ETFs keep their price aligned with real assets?',
    explanation: 'Through institutional Authorized Participants (APs) who arbitrage any small price difference by creating or redeeming ETF share blocks in the open market.',
    example: 'If an ETF price rises above its real underlying stocks, APs buy the stocks, create new ETF shares, and sell them until the price balances.',
    whyItMatters: 'This unique mechanism ensures you almost always pay fair market value when trading ETF shares.'
  },
  {
    id: 'ef-fund-liquidation',
    groupId: 'etfs-funds',
    question: 'What happens if an ETF Closes or Liquidates?',
    explanation: 'If an ETF fails to attract enough investor capital to remain profitable, the fund provider liquidates all assets and mails cash payouts to shareholders.',
    example: 'A tiny niche drone ETF with only $3 million in assets shuts down; the manager sells the holdings and returns your exact fair cash balance.',
    whyItMatters: 'You do not lose your money, but the forced liquidation can trigger an unplanned taxable capital gains event.'
  }
]
