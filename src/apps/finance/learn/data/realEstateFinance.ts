import { LearnLesson } from '../types'

export const REAL_ESTATE_FINANCE_LESSONS: LearnLesson[] = [
  {
    id: 're-what-is-a-mortgage',
    groupId: 'real-estate-finance',
    question: 'What is a Mortgage?',
    explanation: 'A specialized long-term loan used to purchase real estate where the physical property itself serves as collateral for the bank. If you fail to make payments, the bank has the legal right to foreclose and sell the home to recover its loan.',
    example: 'Buying a $400,000 home with $80,000 in personal cash savings and borrowing $320,000 from a mortgage lender over 30 years.',
    whyItMatters: 'A mortgage is the largest financial transaction and liability most households will ever undertake in their entire lives.'
  },
  {
    id: 're-down-payment',
    groupId: 'real-estate-finance',
    question: 'What is a Down Payment and how much do you need?',
    explanation: 'The upfront cash you pay toward the purchase price of a property, with the mortgage covering the rest. While 20% down avoids extra insurance fees, many programs allow 3% to 5% down.',
    example: 'Putting down 20% on a $300,000 home requires $60,000 in cash at the closing table.',
    whyItMatters: 'A larger down payment reduces your monthly loan payment, eliminates extra insurance fees, and provides immediate equity protection against price drops.'
  },
  {
    id: 're-pmi-private-mortgage-insurance',
    groupId: 'real-estate-finance',
    question: 'What is PMI (Private Mortgage Insurance)?',
    explanation: 'An extra monthly fee charged by lenders when a buyer puts down less than 20% cash, protecting the lender (not the buyer) in case of loan default.',
    example: 'Putting down 5% on a home and paying an extra $120 each month in PMI until your equity reaches 20% of the home’s value.',
    whyItMatters: 'PMI is dead money that provides zero benefit to the homeowner, making reaching 20% equity a high financial priority.'
  },
  {
    id: 're-home-equity',
    groupId: 'real-estate-finance',
    question: 'What is Home Equity and how does it grow?',
    explanation: 'The dollar portion of the property that you truly own free and clear: Current Market Value of the Home minus the Remaining Mortgage Balance.',
    example: 'If your home is worth $450,000 and you owe $250,000 on your mortgage, your home equity is $200,000.',
    whyItMatters: 'Equity builds two ways: as you pay down monthly principal over time, and if neighborhood market values appreciate.'
  },
  {
    id: 're-leverage-in-real-estate',
    groupId: 'real-estate-finance',
    question: 'How does Leverage magnify Real Estate returns (and losses)?',
    explanation: 'Using borrowed bank money to control a much larger asset. A small percentage increase in the total property price generates a massive percentage return on your actual invested cash.',
    example: 'You put $20k down on a $100k condo. The condo value rises 10% to $110k. Your $20k cash investment just gained $10k—a 50% cash-on-cash return.',
    whyItMatters: 'Leverage is a double-edged sword; if that same condo drops 10%, you lose 50% of your initial life savings.'
  },
  {
    id: 're-rental-yield',
    groupId: 'real-estate-finance',
    question: 'What is Gross Rental Yield vs Net Rental Yield?',
    explanation: 'Gross Yield is annual rent divided by property purchase price. Net Yield is annual rent minus all expenses (taxes, insurance, maintenance, vacancies) divided by property purchase price.',
    example: 'A $200,000 property renting for $1,500/month produces $18,000 in rent (9% Gross Yield). After $6,000 in expenses, Net Yield is 6% ($12,000 ÷ $200,000).',
    whyItMatters: 'Never evaluate rental properties on gross rent; property taxes, HOA fees, and maintenance eat up 30% to 50% of gross rents.'
  },
  {
    id: 're-cap-rate-capitalization',
    groupId: 'real-estate-finance',
    question: 'What is Cap Rate (Capitalization Rate)?',
    explanation: 'The expected unleveraged annual rate of return on a commercial or rental property: Net Operating Income (NOI) divided by Current Property Market Value.',
    example: 'A small apartment building generating $50,000 in net annual profit that sells for $1,000,000 has a Cap Rate of 5.0%.',
    whyItMatters: 'The standard metric real estate investors use to compare properties in different locations on an all-cash, unleveraged basis.'
  },
  {
    id: 're-ltv-loan-to-value',
    groupId: 'real-estate-finance',
    question: 'What is Loan-to-Value (LTV) Ratio?',
    explanation: 'The percentage of the property’s appraised value that is financed with debt: Mortgage Balance divided by Appraised Property Value.',
    example: 'Borrowing $240,000 against a home appraised at $300,000 results in an 80% LTV.',
    whyItMatters: 'Lenders require lower LTVs on investment properties (e.g. 75% max) to ensure a safe equity cushion against defaults.'
  },
  {
    id: 're-refinancing-cash-out',
    groupId: 'real-estate-finance',
    question: 'What is Mortgage Refinancing and Cash-Out Refinancing?',
    explanation: 'Rate-and-term refinancing replaces your existing loan with a new loan at a lower interest rate. A Cash-Out refinance borrows more than you owe against accumulated equity, pocketing the difference as cash.',
    example: 'Refinancing from a 6.5% rate to 4.5% saves $350 every month. Borrowing $50,000 of home equity gives you cash to remodel the kitchen.',
    whyItMatters: 'Refinancing can unlock major monthly savings, but closing fees ($3k–$6k) require you to stay in the home long enough to break even.'
  },
  {
    id: 're-renting-vs-buying-myth',
    groupId: 'real-estate-finance',
    question: 'Is Renting really "Throwing Money Away"?',
    explanation: 'No. Renting buys immediate housing, mobility, and predictability with zero maintenance liability. Homeownership carries massive unrecoverable costs: property taxes, mortgage interest, insurance, HOA fees, and repairs.',
    example: 'Rent is the maximum amount you will pay for housing this month; a mortgage is the absolute minimum you will pay.',
    whyItMatters: 'Buying makes financial sense only if you plan to stay in the same home for 5 to 7+ years to amortize heavy transaction fees.'
  },
  {
    id: 're-closing-costs',
    groupId: 'real-estate-finance',
    question: 'What are Real Estate Closing Costs?',
    explanation: 'The administrative, legal, and financing fees paid by buyers and sellers to finalize a real estate transaction, typically totaling 2% to 5% of the total purchase price.',
    example: 'Buying a $400,000 home requires your down payment plus an extra $12,000 in closing costs for loan origination, title searches, appraisal, and transfer taxes.',
    whyItMatters: 'Many first-time homebuyers save just enough for the down payment and are shocked when asked for thousands more at the closing table.'
  },
  {
    id: 're-hoa-fees-and-risks',
    groupId: 'real-estate-finance',
    question: 'What is an HOA Fee and what is a Special Assessment?',
    explanation: 'Monthly dues paid to a Homeowners Association to maintain shared amenities (roofs, elevators, pools). A Special Assessment is an unexpected, mandatory one-time charge levied when the HOA’s reserve fund is empty.',
    example: 'Paying $400/month in condo dues, and then receiving a surprise $15,000 bill because the building roof needs emergency replacement.',
    whyItMatters: 'Always audit the financial health and reserve study of an HOA before buying a condominium.'
  },
  {
    id: 're-property-taxes-reassessment',
    groupId: 'real-estate-finance',
    question: 'How do Property Taxes work and why can they jump?',
    explanation: 'Taxes levied by local city and county governments based on the assessed market value of your real estate to fund public schools, police, and roads.',
    example: 'A 1.5% county tax rate on a $300,000 assessed home costs $4,500 every year ($375/month added to your housing payment).',
    whyItMatters: 'When you buy a home for more than the seller paid years ago, the local tax assessor reassesses the property, often causing a sharp tax hike in year two.'
  },
  {
    id: 're-the-1-percent-rule',
    groupId: 'real-estate-finance',
    question: 'What is the "1% Rule" in rental property investing?',
    explanation: 'A quick rule-of-thumb screen stating that a rental property’s monthly gross rent should be approximately 1% of its total purchase price to achieve positive cash flow.',
    example: 'A duplex purchased for $150,000 should ideally generate at least $1,500 in total monthly rent.',
    whyItMatters: 'Helps investors filter through hundreds of real estate listings in seconds before doing deep cashflow spreadsheets.'
  },
  {
    id: 're-depreciation-tax-shield',
    groupId: 'real-estate-finance',
    question: 'Why does Real Estate have powerful Tax Advantages?',
    explanation: 'Tax laws allow property investors to write off the cost of the physical building as a "depreciation expense" over 27.5 years, shielding real cash rental income from income taxes.',
    example: 'Collecting $10,000 in positive cash rental income in your bank, but reporting $0 in taxable net profit due to paper depreciation.',
    whyItMatters: 'One of the primary reasons high-income earners use real estate to build wealth while legally reducing their taxable income.'
  },
  {
    id: 're-1031-exchange',
    groupId: 'real-estate-finance',
    question: 'What is a 1031 Like-Kind Exchange?',
    explanation: 'A section of the tax code allowing real estate investors to sell an investment property and roll 100% of the proceeds into a new, larger property while deferring all capital gains taxes.',
    example: 'Selling a fourplex for a $300,000 profit and immediately buying a 10-unit apartment building without paying a single dollar in capital gains taxes today.',
    whyItMatters: 'Allows real estate moguls to compound and snowball equity tax-free throughout their lifetimes.'
  },
  {
    id: 're-house-hacking',
    groupId: 'real-estate-finance',
    question: 'What is "House Hacking"?',
    explanation: 'Buying a multi-family property (like a duplex or triplex), living in one unit, and renting out the remaining units so tenant rent covers your entire mortgage payment.',
    example: 'Living in Unit A of a duplex and renting Unit B for $1,600, covering your entire $1,500 mortgage and living with zero housing costs.',
    whyItMatters: 'Eliminates your single largest monthly living expense (housing), allowing you to save 60%+ of your paycheck.'
  },
  {
    id: 're-amortization-equity-growth',
    groupId: 'real-estate-finance',
    question: 'Why do 15-Year Mortgages build equity much faster than 30-Year Mortgages?',
    explanation: 'A 15-year mortgage has slightly higher monthly payments, but has a lower interest rate and devotes a massive percentage of each early payment directly to paying down principal.',
    example: 'On a $300,000 loan, a 15-year mortgage saves over $150,000 in total interest and makes you 100% debt-free fifteen years sooner.',
    whyItMatters: 'For homeowners who can comfortably afford the payment, 15-year loans build equity at a rapid rate.'
  },
  {
    id: 're-brrrr-strategy',
    groupId: 'real-estate-finance',
    question: 'What is the BRRRR Method in real estate?',
    explanation: 'Buy, Rehab, Rent, Refinance, Repeat. An investment strategy of purchasing undervalued, distressed properties, fixing them up, renting them, and taking a cash-out refinance to pull out your original capital.',
    example: 'Buying a neglected house for $80k, spending $30k renovating, renting it for $1,400/mo, and refinancing 75% of its new $160k value ($120k) to retrieve all your invested cash.',
    whyItMatters: 'Allows experienced real estate operators to recycle the same pool of down payment cash into multiple properties.'
  },
  {
    id: 're-unrecoverable-costs-of-housing',
    groupId: 'real-estate-finance',
    question: 'What are the "Unrecoverable Costs" of Homeownership?',
    explanation: 'The portions of housing money that never build equity: Property taxes, homeowner insurance, mortgage interest, HOA dues, and the 1% annual maintenance rule.',
    example: 'Out of a $2,400 monthly mortgage payment, only $450 might go to your actual principal equity in year one; the other $1,950 is completely unrecoverable.',
    whyItMatters: 'Comparing real rent against only the unrecoverable costs of buying gives you an honest, mathematically rigorous housing comparison.'
  },
  {
    id: 're-location-economic-drivers',
    groupId: 'real-estate-finance',
    question: 'Why is "Location, Location, Location" a fundamental truth?',
    explanation: 'You can renovate kitchens, add bedrooms, and landscape yards, but you cannot change the municipal school district, local job growth, crime rate, or climate.',
    example: 'A modest home in a thriving tech hub with great schools appreciates 80%, while a luxury mansion in a declining rust-belt town loses value.',
    whyItMatters: 'Real estate value is fundamentally driven by local demographic population growth and high-paying jobs.'
  },
  {
    id: 're-commercial-vs-residential',
    groupId: 'real-estate-finance',
    question: 'What is Residential vs Commercial Real Estate?',
    explanation: 'Residential covers 1-to-4 family homes and is financed based on personal buyer income and credit. Commercial covers 5+ unit apartments, office parks, and retail centers, financed strictly on property cash flows.',
    example: 'A bank qualifies a single-family house on your personal salary, but evaluates a 20-unit apartment building strictly on tenant leases and net operating income.',
    whyItMatters: 'Commercial property values are directly determined by math and net income, not the emotional bidding wars of homebuyers.'
  }
]
