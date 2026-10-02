import { LearnLesson } from '../types'

export const INVESTING_LESSONS: LearnLesson[] = [
  {
    id: 'inv-what-is-investing',
    groupId: 'investing',
    question: 'What is Investing?',
    explanation: 'Investing is committing money to assets (like businesses, real estate, or loans) with the expectation that they will generate positive returns or appreciate in value over time.',
    example: 'Instead of buying a $1,000 television, you purchase shares of a growing company that pays you quarterly dividends and expands in value.',
    whyItMatters: 'Working for money has a strict ceiling (your finite hours); investing allows your existing capital to work for you around the clock.'
  },
  {
    id: 'inv-compound-interest',
    groupId: 'investing',
    question: 'What is Compound Interest?',
    explanation: 'Interest earned on your initial principal plus the accumulated interest from all previous periods—interest earning interest in an exponential curve.',
    example: 'Investing $10,000 at 8% annual return yields $800 in year one, but in year 30 that single original deposit grows to over $100,000.',
    whyItMatters: 'Time is the greatest multiplier of wealth; starting five years earlier can literally double your retirement nest egg.'
  },
  {
    id: 'inv-risk-return-tradeoff',
    groupId: 'investing',
    question: 'What is the Risk-Return Tradeoff?',
    explanation: 'The fundamental law of finance stating that the potential return on an investment rises in direct proportion to the risk of losing money.',
    example: 'Government bonds offer low, guaranteed 4% returns with almost zero risk. Early-stage startups offer 1,000% upside but an 80% chance of total loss.',
    whyItMatters: 'Anyone promising "high returns with zero risk" is mathematically lying or running an illegal scam.'
  },
  {
    id: 'inv-diversification',
    groupId: 'investing',
    question: 'What is Diversification and why is it the "only free lunch"?',
    explanation: 'Spreading investments across many different companies, asset classes, and geographies to reduce portfolio risk without sacrificing overall expected return.',
    example: 'Owning shares in 500 major global companies means that even if 5 go completely bankrupt, the remaining 495 can still drive healthy portfolio gains.',
    whyItMatters: 'Concentrating all your money in one company exposes your life savings to catastrophic single-point failure.'
  },
  {
    id: 'inv-asset-allocation',
    groupId: 'investing',
    question: 'What is Asset Allocation?',
    explanation: 'The strategy of dividing your investment portfolio across major asset categories: Equities (stocks), Fixed Income (bonds), Cash, and Real Estate.',
    example: 'A 25-year-old might hold 90% stocks and 10% bonds for growth; a 65-year-old might hold 50% stocks and 50% bonds for capital stability.',
    whyItMatters: 'Academic research shows asset allocation explains over 90% of a portfolio’s long-term performance volatility.'
  },
  {
    id: 'inv-inflation-risk',
    groupId: 'investing',
    question: 'What is Inflation Risk in investing?',
    explanation: 'The danger that the purchasing power of your money declines faster than the return on your safe investments.',
    example: 'Earning 1% in a bank account while consumer prices climb by 4% means you are quietly losing 3% of your real purchasing power every single year.',
    whyItMatters: 'Keeping all your money "safe" in cash is actually a guaranteed long-term loss against inflation.'
  },
  {
    id: 'inv-dollar-cost-averaging',
    groupId: 'investing',
    question: 'What is Dollar-Cost Averaging (DCA)?',
    explanation: 'Investing a fixed dollar amount at regular intervals (such as $500 on the 1st of every month) regardless of whether stock prices are high or low.',
    example: 'When the market is down, your $500 automatically buys more shares at a discount; when the market is up, it buys fewer shares at the peak.',
    whyItMatters: 'Eliminates the emotional stress and proven failure rate of trying to "time the market".'
  },
  {
    id: 'inv-time-in-the-market',
    groupId: 'investing',
    question: 'Why does "Time in the Market" beat "Timing the Market"?',
    explanation: 'Most long-term stock market gains occur during a handful of unpredictable, explosive days each decade. Missing just the 10 best days cuts returns in half.',
    example: 'Staying continuously invested through market ups and downs produces far higher wealth than sitting in cash waiting for the "perfect dip".',
    whyItMatters: 'Patience and consistency are rewarded in financial markets; impatience and frequent trading are taxed heavily.'
  },
  {
    id: 'inv-passive-vs-active',
    groupId: 'investing',
    question: 'What is Passive vs Active Investing?',
    explanation: 'Active investors try to beat the market by researching, picking individual stocks, and trading frequently. Passive investors match market returns by buying broad index funds and holding.',
    example: 'A hedge fund manager picking 10 hot tech stocks is active; buying the S&P 500 index fund and never selling is passive.',
    whyItMatters: 'Over 85% of professional active fund managers fail to beat simple low-cost passive index funds over a 15-year period.'
  },
  {
    id: 'inv-rebalancing',
    groupId: 'investing',
    question: 'What is Portfolio Rebalancing?',
    explanation: 'Periodically resetting your portfolio back to your target asset allocation percentages after market movements have shifted them.',
    example: 'If a massive stock rally pushes your 80/20 target to 90/10, you trim some stocks and buy bonds to return to 80/20.',
    whyItMatters: 'Forces you into a disciplined, emotion-free habit of systematically "selling high" and "buying low".'
  },
  {
    id: 'inv-investment-horizon',
    groupId: 'investing',
    question: 'What is an Investment Time Horizon?',
    explanation: 'The total length of time you plan to hold an investment before you need to liquidate it to spend the cash.',
    example: 'Saving for a house down payment in 2 years is a short horizon (keep in cash/CDs); saving for retirement in 30 years is a long horizon (invest in stocks).',
    whyItMatters: 'Never invest money in volatile equities that you know you will need within the next three to five years.'
  },
  {
    id: 'inv-volatility-vs-risk',
    groupId: 'investing',
    question: 'What is the difference between Volatility and True Risk?',
    explanation: 'Volatility is the normal, temporary daily bouncing of market prices. True risk is the permanent loss of your invested capital.',
    example: 'A high-grade index fund dropping 15% in a recession is volatility; a fraudulent company going into liquidation to $0 is true risk.',
    whyItMatters: 'If you mistake temporary market dips for permanent ruin, you will panic-sell at the worst possible moment.'
  },
  {
    id: 'inv-rule-of-72',
    groupId: 'investing',
    question: 'What is the Rule of 72?',
    explanation: 'A quick mental math shortcut to calculate how many years it takes for your money to double at a given annual rate of return: divide 72 by the interest rate.',
    example: 'At an 8% annual return, your money doubles in approximately 9 years (72 ÷ 8 = 9). At 6%, it doubles in 12 years.',
    whyItMatters: 'Allows you to immediately evaluate the long-term impact of varying return rates on your future net worth.'
  },
  {
    id: 'inv-capital-gains',
    groupId: 'investing',
    question: 'What are Capital Gains and Losses?',
    explanation: 'A capital gain is the profit realized when you sell an asset for a higher price than what you originally paid. A loss is realized when you sell below purchase price.',
    example: 'Buying shares for $1,000 and selling them two years later for $1,600 produces a $600 realized capital gain.',
    whyItMatters: 'In most countries, holding assets for over a year unlocks lower long-term capital gains tax rates compared to short-term trading.'
  },
  {
    id: 'inv-dividends-reinvestment',
    groupId: 'investing',
    question: 'What is a DRIP (Dividend Reinvestment Plan)?',
    explanation: 'An automated feature in your brokerage account that instantly uses cash dividends paid by companies to purchase additional fractional shares.',
    example: 'A company pays you $50 in quarterly dividends; your broker automatically buys 0.25 more shares instead of leaving cash idle.',
    whyItMatters: 'Reinvesting dividends powers a compounding snowball that accounts for a huge portion of historical total market returns.'
  },
  {
    id: 'inv-nominal-vs-real-return',
    groupId: 'investing',
    question: 'What is Nominal Return vs Real Return?',
    explanation: 'Nominal return is the raw percentage gain on paper. Real return is what you actually gained after subtracting the rate of inflation.',
    example: 'If your portfolio grows by 8% (nominal) but inflation was 3%, your real purchasing power gain was 5%.',
    whyItMatters: 'Your lifestyle is bought with purchasing power, so only real after-inflation returns matter.'
  },
  {
    id: 'inv-market-bubbles',
    groupId: 'investing',
    question: 'What causes Financial Market Bubbles?',
    explanation: 'Euphoric speculation where investors buy an asset solely because its price has been rising, detached from underlying cash flows or realistic value.',
    example: 'The Dutch Tulip Mania of 1637, the Dot-Com bubble of 2000, or housing prices leading up to 2008.',
    whyItMatters: 'Every bubble in human history eventually pops, devastating late retail buyers who confused momentum with sustainable value.'
  },
  {
    id: 'inv-fomo-investing',
    groupId: 'investing',
    question: 'Why is FOMO (Fear of Missing Out) the investor’s enemy?',
    explanation: 'An emotional impulse to rush into an asset that has already skyrocketed in price because you see others making quick money.',
    example: 'Hearing coworkers brag about a meme stock that surged 400% and buying in at the exact top right before it crashes.',
    whyItMatters: 'Smart investing feels boring, repetitive, and disciplined; exciting investing usually ends in losses.'
  },
  {
    id: 'inv-liquidity-premium',
    groupId: 'investing',
    question: 'What is the Liquidity Premium?',
    explanation: 'The extra return demanded by investors for locking up their capital in illiquid assets that cannot be sold easily or quickly.',
    example: 'Private equity and timberland investments often target 12% returns to compensate investors for locking cash up for 10 years.',
    whyItMatters: 'If you have patient capital and do not need immediate liquidity, illiquid assets can sometimes deliver superior returns.'
  },
  {
    id: 'inv-value-investing',
    groupId: 'investing',
    question: 'What is Value Investing?',
    explanation: 'The strategy popularized by Benjamin Graham and Warren Buffett of buying solid companies whose shares are trading at a discount to their intrinsic value.',
    example: 'Finding a profitable manufacturing business trading at a price lower than its cash reserves and physical assets on hand.',
    whyItMatters: 'Focuses on the durable economics of real businesses with a "margin of safety" rather than chasing market hype.'
  },
  {
    id: 'inv-growth-investing',
    groupId: 'investing',
    question: 'What is Growth Investing?',
    explanation: 'Investing in fast-expanding companies expected to grow revenues and profits much faster than the broader economy, even if their current stock price looks expensive.',
    example: 'Investing in cloud computing or biotechnology companies that reinvest all earnings into hiring and R&D.',
    whyItMatters: 'High-growth winners can generate astronomical returns, but face brutal selloffs if quarterly growth slows.'
  },
  {
    id: 'inv-target-date-funds',
    groupId: 'investing',
    question: 'What is a Target-Date Retirement Fund?',
    explanation: 'An all-in-one mutual fund that automatically shifts from aggressive stock growth to conservative bond protection as you approach a chosen retirement year.',
    example: 'A "Target Retirement 2055 Fund" holds 90% stocks today, but will automatically shift to 50% bonds by the year 2050.',
    whyItMatters: 'The ultimate hands-off, set-it-and-forget-it vehicle for people who do not want to manage portfolio allocations manually.'
  },
  {
    id: 'inv-margin-borrowing-risk',
    groupId: 'investing',
    question: 'What is Margin Borrowing in a brokerage account?',
    explanation: 'Borrowing money directly from your broker using your existing stock portfolio as collateral to buy more shares.',
    example: 'Depositing $10,000 and borrowing another $10,000 on margin to purchase $20,000 worth of stock.',
    whyItMatters: 'If stock prices drop sharply, the broker issues a "margin call," forcibly liquidating your assets at rock-bottom prices.'
  },
  {
    id: 'inv-tax-loss-harvesting',
    groupId: 'investing',
    question: 'What is Tax-Loss Harvesting?',
    explanation: 'Selling investments that are currently at a loss to offset realized capital gains on other investments and reduce your income tax bill.',
    example: 'Selling a losing fund to record a $2,000 loss, offsetting a $2,000 profit made on another stock, paying $0 in net capital gains taxes.',
    whyItMatters: 'A completely legal strategy that uses temporary market downturns to permanently minimize your annual taxes.'
  },
  {
    id: 'inv-circle-of-competence',
    groupId: 'investing',
    question: 'What is Warren Buffett’s "Circle of Competence"?',
    explanation: 'The principle of only investing in businesses, industries, and business models that you personally understand inside and out.',
    example: 'A software engineer investing in enterprise SaaS companies where they understand product moats, while avoiding biotech drug trials they cannot evaluate.',
    whyItMatters: 'Stepping outside your circle of competence turns investing into uninformed gambling.'
  }
]
