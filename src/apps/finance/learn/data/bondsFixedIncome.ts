import { LearnLesson } from '../types'

export const BONDS_FIXED_INCOME_LESSONS: LearnLesson[] = [
  {
    id: 'bf-what-is-a-bond',
    groupId: 'bonds-fixed-income',
    question: 'What is a Bond?',
    explanation: 'A bond is an IOU loan you make to a government or corporation. In exchange for your loan, the borrower promises to pay you regular interest and return your full principal on an agreed date.',
    example: 'You lend $1,000 to the government for 10 years at 4% annual interest. You receive $40 every year and get your original $1,000 back in year 10.',
    whyItMatters: 'Unlike stocks which offer ownership and variable dividends, bonds offer contractual, predictable fixed income.'
  },
  {
    id: 'bf-treasury-bond',
    groupId: 'bonds-fixed-income',
    question: 'What is a Treasury Bond?',
    explanation: 'A long-term government debt security issued by a national government (such as the US Department of the Treasury) backed by the full faith and taxing power of the nation.',
    example: 'Buying a 30-year US Treasury bond paying 4.2% annual interest backed by the United States government.',
    whyItMatters: 'Widely considered the global risk-free benchmark because the federal government has never defaulted on its sovereign debt.'
  },
  {
    id: 'bf-bond-yield',
    groupId: 'bonds-fixed-income',
    question: 'What is Bond Yield?',
    explanation: 'The annualized rate of return you actually earn on a bond based on its current market purchase price, rather than just its original printed face value.',
    example: 'A bond paying $50 annual coupon bought at a discounted market price of $900 has a current yield of 5.55% ($50 ÷ $900).',
    whyItMatters: 'Yield tells you what an investment in bonds actually pays you right now in today’s real market conditions.'
  },
  {
    id: 'bf-maturity-date',
    groupId: 'bonds-fixed-income',
    question: 'What is Maturity Date?',
    explanation: 'The specific date on which the bond’s term ends and the borrower is legally obligated to return the full original principal (par value) to the bondholder.',
    example: 'A 5-year bond issued on October 1, 2026 reaches its maturity date on October 1, 2031, at which point your $1,000 principal is refunded.',
    whyItMatters: 'Helps investors match their capital needs with specific future dates, like a child starting college in 10 years.'
  },
  {
    id: 'bf-coupon-rate',
    groupId: 'bonds-fixed-income',
    question: 'What is a Coupon Rate?',
    explanation: 'The fixed annual interest rate stated on the bond when it is first issued, expressed as a percentage of the bond’s face value.',
    example: 'A $1,000 bond with a 5% coupon rate pays exactly $50 every year ($25 every six months) regardless of what happens to market prices.',
    whyItMatters: 'Called "coupons" because bondholders historically clipped physical paper tickets off bonds to collect cash interest at banks.'
  },
  {
    id: 'bf-credit-risk',
    groupId: 'bonds-fixed-income',
    question: 'What is Credit Risk in bonds?',
    explanation: 'The risk that the issuing company or municipality runs into financial trouble and fails to make interest payments or repay your principal (defaults).',
    example: 'Lending money to a struggling retail company that enters bankruptcy, paying bondholders only 30 cents on the dollar.',
    whyItMatters: 'Higher credit risk forces borrowers to pay much higher interest rates (junk bonds) to convince investors to lend.'
  },
  {
    id: 'bf-government-bonds',
    groupId: 'bonds-fixed-income',
    question: 'What is a Government Bond?',
    explanation: 'Debt issued by a sovereign national government to fund infrastructure, public services, military spending, and national deficits.',
    example: 'German Bunds, UK Gilts, Japanese JGBs, or US Treasuries.',
    whyItMatters: 'Forms the safest foundation of global financial markets and serves as a shelter during worldwide economic crises.'
  },
  {
    id: 'bf-corporate-bonds',
    groupId: 'bonds-fixed-income',
    question: 'What is a Corporate Bond?',
    explanation: 'Debt issued by private and public companies to fund expansion, mergers, or refinancing instead of issuing dilutive stock or taking bank loans.',
    example: 'Microsoft or Coca-Cola issuing $5 billion in 10-year bonds to build modern artificial intelligence data centers.',
    whyItMatters: 'Typically pays higher interest yields than government bonds to compensate for the slight risk of corporate failure.'
  },
  {
    id: 'bf-why-bond-prices-fall',
    groupId: 'bonds-fixed-income',
    question: 'Why do Bond Prices Fall when Interest Rates Rise?',
    explanation: 'Bond prices and interest rates move in opposite directions like a seesaw. When new bonds offer higher rates, existing older bonds with lower rates become less desirable, so their market price drops.',
    example: 'You own a bond paying 3%. The central bank raises rates, and new bonds pay 5%. Nobody will pay full price for your 3% bond unless you discount it.',
    whyItMatters: 'Understanding this seesaw relationship is the single most important rule in fixed-income investing.'
  },
  {
    id: 'bf-what-is-a-bond-etf',
    groupId: 'bonds-fixed-income',
    question: 'What is a Bond ETF?',
    explanation: 'An exchange-traded fund that pools thousands of bonds together, pays regular monthly interest distributions, and trades on a stock exchange like ordinary stock.',
    example: 'Buying an aggregate bond ETF gives you instant diversified exposure to 10,000 corporate and government bonds for less than $100.',
    whyItMatters: 'Unlike individual bonds that mature and return principal, bond ETFs never mature; they continuously roll and replace maturing bonds.'
  },
  {
    id: 'bf-par-value',
    groupId: 'bonds-fixed-income',
    question: 'What is Par Value (Face Value)?',
    explanation: 'The stated dollar amount printed on the bond that the issuer promises to return at maturity, traditionally $1,000 per bond.',
    example: 'A bond trades on the secondary market at $950 (discount) or $1,050 (premium), but its par value remains $1,000.',
    whyItMatters: 'Regardless of daily market fluctuations, holding a sound bond to maturity returns its exact original par value.'
  },
  {
    id: 'bf-credit-ratings',
    groupId: 'bonds-fixed-income',
    question: 'What are Credit Ratings (AAA to D)?',
    explanation: 'Grades assigned by independent agencies (like Moody’s and S&P) evaluating how likely an issuer is to repay its debt obligations on time.',
    example: 'AAA represents virtually flawless credit safety; BBB is the lowest investment grade; BB and below are speculative "junk bonds".',
    whyItMatters: 'Institutional pension funds are legally forbidden from holding bonds that fall below investment grade.'
  },
  {
    id: 'bf-junk-high-yield-bonds',
    groupId: 'bonds-fixed-income',
    question: 'What are "Junk Bonds" (High-Yield Bonds)?',
    explanation: 'Bonds issued by companies with lower credit ratings (below BBB) that pay unusually high interest rates to attract risk-tolerant investors.',
    example: 'A distressed airline paying 9.5% annual interest on its bonds while solid tech companies pay 4.5%.',
    whyItMatters: 'Offers generous regular income, but carries real risk of default during deep economic recessions.'
  },
  {
    id: 'bf-municipal-bonds',
    groupId: 'bonds-fixed-income',
    question: 'What are Municipal Bonds ("Munis")?',
    explanation: 'Bonds issued by state, city, or local governments to finance public projects like highways, bridges, public schools, and sewer systems.',
    example: 'Your city issues $50 million in municipal bonds to build a new bridge, paying 3.8% interest that is completely exempt from federal taxes.',
    whyItMatters: 'Their tax-exempt status makes municipal bonds especially attractive for high-earning individuals in top tax brackets.'
  },
  {
    id: 'bf-zero-coupon-bonds',
    groupId: 'bonds-fixed-income',
    question: 'What is a Zero-Coupon Bond?',
    explanation: 'A bond that pays zero regular periodic interest. Instead, it is sold at a steep discount to face value and pays its full par value upon maturity.',
    example: 'Buying a bond for $600 today that pays zero coupons but hands you $1,000 cash in 10 years.',
    whyItMatters: 'Eliminates reinvestment risk—you lock in an exact total dollar return without having to reinvest periodic coupon checks.'
  },
  {
    id: 'bf-duration',
    groupId: 'bonds-fixed-income',
    question: 'What is Bond Duration and why does it measure risk?',
    explanation: 'A mathematical measure of a bond’s price sensitivity to interest rate changes, expressed in years. The longer the duration, the harder its price swings when rates change.',
    example: 'A bond with a duration of 8 years drops in market value by roughly 8% if market interest rates increase by 1%.',
    whyItMatters: 'Tells you exactly how much price volatility to expect in your bond portfolio when central banks adjust interest rates.'
  },
  {
    id: 'bf-yield-to-maturity',
    groupId: 'bonds-fixed-income',
    question: 'What is Yield to Maturity (YTM)?',
    explanation: 'The total anticipated annualized return on a bond if you hold it all the way from today’s market purchase price until its final maturity date.',
    example: 'Takes into account all remaining coupon payments, current purchase price, and the final return of principal.',
    whyItMatters: 'YTM is the gold-standard metric for comparing bonds of different coupon rates, prices, and maturities.'
  },
  {
    id: 'bf-tips-inflation-protected',
    groupId: 'bonds-fixed-income',
    question: 'What are TIPS (Treasury Inflation-Protected Securities)?',
    explanation: 'Government bonds whose principal value is automatically adjusted upward to match the official Consumer Price Index (CPI) inflation rate.',
    example: 'If inflation runs at 6%, the principal of your $1,000 TIPS increases to $1,060, and your interest payments rise accordingly.',
    whyItMatters: 'Guarantees that rising inflation will never destroy the real purchasing power of your invested capital.'
  },
  {
    id: 'bf-sovereign-default',
    groupId: 'bonds-fixed-income',
    question: 'Can Governments Default on their Bonds?',
    explanation: 'Yes. While rare for nations borrowing in their own sovereign currency, countries borrowing in foreign currencies (like US dollars) frequently default during debt crises.',
    example: 'Argentina, Greece, and Russia have historically defaulted on sovereign government bond debts, wiping out foreign lenders.',
    whyItMatters: 'International government bonds carry currency and political default risks that domestic bonds do not.'
  },
  {
    id: 'bf-callable-bonds',
    groupId: 'bonds-fixed-income',
    question: 'What is a Callable Bond?',
    explanation: 'A bond containing a clause allowing the issuing company to pay off and cancel the debt early before the scheduled maturity date.',
    example: 'A company issues bonds at 7%. If interest rates plunge to 3%, they "call" the 7% bonds back and issue new cheaper ones, similar to refinancing a home mortgage.',
    whyItMatters: 'Caps your upside as an investor—you get paid back early right when high-paying bonds are most valuable.'
  },
  {
    id: 'bf-convertible-bonds',
    groupId: 'bonds-fixed-income',
    question: 'What is a Convertible Bond?',
    explanation: 'A hybrid corporate bond that pays fixed interest but gives the holder the option to convert the debt into shares of common stock at a predetermined price.',
    example: 'You receive 4% bond interest, but if the company’s stock surges 200%, you can convert your bond into stock and capture the windfall.',
    whyItMatters: 'Combines the downside protection of fixed debt with the explosive upside of equity participation.'
  },
  {
    id: 'bf-reinvestment-risk',
    groupId: 'bonds-fixed-income',
    question: 'What is Reinvestment Risk?',
    explanation: 'The danger that when your high-yielding bonds mature, interest rates in the economy will be much lower, forcing you to reinvest your principal at lower yields.',
    example: 'Your 6% bond matures in 2026. The only new bonds available pay 2%, cutting your annual retirement interest income by two-thirds.',
    whyItMatters: 'Locking in longer maturities protects retirees from being forced into lower income yields when rates collapse.'
  },
  {
    id: 'bf-bond-ladder',
    groupId: 'bonds-fixed-income',
    question: 'What is a Bond Ladder strategy?',
    explanation: 'Building a portfolio of individual bonds with staggered maturity dates (e.g., 1-year, 2-year, 3-year, 4-year, and 5-year bonds).',
    example: 'Each year, one bond matures, giving you fresh cash that you can either spend or reinvest into a new 5-year bond at prevailing rates.',
    whyItMatters: 'Provides predictable liquidity every year while smoothing out the impact of interest rate swings.'
  },
  {
    id: 'bf-t-bills-vs-notes-vs-bonds',
    groupId: 'bonds-fixed-income',
    question: 'What is the difference between T-Bills, T-Notes, and T-Bonds?',
    explanation: 'Treasury Bills mature in 1 year or less; Treasury Notes mature between 2 and 10 years; Treasury Bonds mature in 20 to 30 years.',
    example: 'Buying a 3-month T-Bill for cash management vs a 10-year T-Note for a balanced investment portfolio.',
    whyItMatters: 'Shorter maturities carry minimal price fluctuation risk; longer maturities lock in interest rates for decades.'
  },
  {
    id: 'bf-yield-spread',
    groupId: 'bonds-fixed-income',
    question: 'What is a Credit Yield Spread?',
    explanation: 'The difference in yield between a risky corporate bond and a risk-free government Treasury of the same maturity.',
    example: 'If Treasuries yield 4% and corporate bonds yield 6.5%, the credit spread is 2.5% (250 basis points).',
    whyItMatters: 'When spreads widen dramatically, it signals that Wall Street expects an imminent wave of corporate bankruptcies.'
  }
]
