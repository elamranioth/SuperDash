import { LearnLesson } from '../types'

export const RISK_INSURANCE_LESSONS: LearnLesson[] = [
  {
    id: 'ri-what-is-insurance',
    groupId: 'risk-insurance',
    question: 'What is Insurance and how does it work?',
    explanation: 'A financial contract where you pay a small, known, predictable fee (a premium) to an insurance company in exchange for protection against a rare, catastrophic, unpayable loss.',
    example: 'Paying $100 a month for home insurance so you never have to pay $400,000 out of pocket if your house burns down.',
    whyItMatters: 'Insurance is not an investment to make you rich; it is a defensive shield to prevent you from being wiped out.'
  },
  {
    id: 'ri-premium-vs-deductible',
    groupId: 'risk-insurance',
    question: 'What is a Premium vs a Deductible?',
    explanation: 'The Premium is what you pay every month or year just to keep the policy active. The Deductible is what you must pay out of your own pocket first before the insurance company pays the rest of a claim.',
    example: 'You have a $1,000 car accident deductible. A fender bender costs $3,500 to fix; you pay the first $1,000, and the insurer pays the remaining $2,500.',
    whyItMatters: 'Choosing a higher deductible lowers your monthly premium, saving money if you have an emergency fund to cover the deductible.'
  },
  {
    id: 'ri-term-vs-whole-life',
    groupId: 'risk-insurance',
    question: 'What is Term Life vs Whole Life Insurance?',
    explanation: 'Term Life covers you for a set period (like 20 or 30 years) for a very low, fixed cost. Whole Life combines permanent life insurance with a complex, high-fee investment savings account.',
    example: 'A healthy 30-year-old can buy a $500,000 20-year Term policy for $25/month, while Whole Life can cost over $350/month for the same death benefit.',
    whyItMatters: 'Most financial advisors recommend "Buy Term and invest the difference" because Whole Life returns are heavily consumed by insurance commissions.'
  },
  {
    id: 'ri-umbrella-insurance',
    groupId: 'risk-insurance',
    question: 'What is Umbrella Insurance and why is it cheap?',
    explanation: 'Extra personal liability insurance that sits on top of your auto and homeowners policies, kicking in when major legal lawsuits exceed standard limits (e.g. $1M to $5M in coverage).',
    example: 'If an accidental car crash causes $800,000 in medical and legal liability, your auto insurance covers the first $300k and your umbrella policy covers the remaining $500k.',
    whyItMatters: 'Extremely affordable (often $200–$300/year for $1,000,000 of coverage) and protects your accumulated life savings and future wages from devastating lawsuits.'
  },
  {
    id: 'ri-disability-insurance',
    groupId: 'risk-insurance',
    question: 'Why is Disability Insurance more critical than Life Insurance for young workers?',
    explanation: 'Statistically, you are 3 to 4 times more likely to suffer a career-ending injury or illness before age 65 than you are to die. Disability insurance replaces 60–70% of your earned paycheck if you cannot work.',
    example: 'A surgeon injured in a car crash who can no longer operate receives monthly disability benefit checks to pay their mortgage and family living costs.',
    whyItMatters: 'Your ability to earn an income is your single greatest lifetime financial asset; protecting it is essential.'
  },
  {
    id: 'ri-health-insurance-out-of-pocket',
    groupId: 'risk-insurance',
    question: 'What is an Out-of-Pocket Maximum in health insurance?',
    explanation: 'The absolute maximum dollar limit you will have to pay for covered medical services in a calendar year. Once reached, your health insurer pays 100% of all remaining covered costs.',
    example: 'If your plan has a $7,000 out-of-pocket maximum and you undergo a $150,000 emergency surgery, you pay only $7,000.',
    whyItMatters: 'Knowing your out-of-pocket maximum tells you the exact minimum emergency cash reserve you must hold for medical peace of mind.'
  },
  {
    id: 'ri-hsa-triple-tax-advantage',
    groupId: 'risk-insurance',
    question: 'What is an HSA and its "Triple Tax Advantage"?',
    explanation: 'A Health Savings Account paired with a High-Deductible Health Plan. Contributions are tax-deductible, investments grow tax-free, and withdrawals for medical expenses are 100% tax-free.',
    example: 'Investing $4,000 per year into an HSA, letting it compound in index funds over 25 years, and withdrawing it tax-free for healthcare in retirement.',
    whyItMatters: 'The only account in the tax code with three layers of tax exemption, making it one of the ultimate stealth retirement vehicles.'
  },
  {
    id: 'ri-adverse-selection',
    groupId: 'risk-insurance',
    question: 'What is Adverse Selection in insurance markets?',
    explanation: 'The tendency for people with higher underlying risk (e.g., people who know they have chronic illnesses) to buy insurance, while healthy people opt out, driving premiums up.',
    example: 'If dental insurance is optional and only people who need root canals sign up, the insurer must hike prices, making it unaffordable for everyone else.',
    whyItMatters: 'Explains why insurance companies require medical screenings or rely on large employer group pools to keep costs balanced.'
  },
  {
    id: 'ri-moral-hazard',
    groupId: 'risk-insurance',
    question: 'What is Moral Hazard?',
    explanation: 'The psychological tendency for people to take greater, reckless risks once they know they are fully insured and someone else will bear the financial cost of a disaster.',
    example: 'Driving faster and parking carelessly in dangerous areas because you know full collision insurance will replace the car with zero hassle.',
    whyItMatters: 'Insurers use deductibles and co-pays specifically to keep "skin in the game" and prevent reckless moral hazard.'
  },
  {
    id: 'ri-self-insuring',
    groupId: 'risk-insurance',
    question: 'What does it mean to "Self-Insure"?',
    explanation: 'Accumulating enough personal wealth and emergency cash reserves that you no longer need to pay for insurance policies on small, manageable risks.',
    example: 'Declining extended warranties on electronics or dropping collision coverage on an old $2,500 car because you can easily write a check to replace it.',
    whyItMatters: 'Saves thousands of dollars over a lifetime by insuring only truly catastrophic losses that you could not afford to absorb.'
  },
  {
    id: 'ri-extended-warranties-scam',
    groupId: 'risk-insurance',
    question: 'Why are Retail Extended Warranties usually a bad deal?',
    explanation: 'Retailers price warranties with enormous 50% to 70% profit margins because the statistical probability of the product breaking during the covered window is tiny.',
    example: 'Paying $80 for a 2-year warranty on a $300 television when the replacement part or failure rate is under 3%.',
    whyItMatters: 'Instead of buying retail warranties, keep that cash in your emergency fund to replace occasional broken appliances yourself.'
  },
  {
    id: 'ri-title-insurance',
    groupId: 'risk-insurance',
    question: 'What is Title Insurance in real estate?',
    explanation: 'A one-time insurance policy purchased during a home closing that protects the buyer and lender from past legal claims, unpaid tax liens, or ownership disputes against the property.',
    example: 'A distant heir of the previous homeowner appears 3 years later claiming they legally own 50% of the land; title insurance pays the legal defense and settles the claim.',
    whyItMatters: 'Protects you from catastrophic property loss caused by past bureaucratic record errors made decades before you bought the home.'
  },
  {
    id: 'ri-liquidity-risk',
    groupId: 'risk-insurance',
    question: 'What is Liquidity Risk?',
    explanation: 'The risk of being unable to convert an asset into cash quickly enough to prevent an urgent financial loss or pay an overdue bill without taking a severe loss.',
    example: 'Owning $2 million worth of farmland but having $0 in cash when a $10,000 tax bill is due tomorrow, forcing you to fire-sale land at a 30% discount.',
    whyItMatters: 'Solvency and liquidity are different; you can be wealthy on paper and still go bankrupt if your assets are frozen.'
  },
  {
    id: 'ri-counterparty-risk',
    groupId: 'risk-insurance',
    question: 'What is Counterparty Risk?',
    explanation: 'The risk that the other company, bank, or individual on the other side of a financial transaction or contract defaults and fails to fulfill their legal obligations.',
    example: 'An airline buying fuel hedge contracts from an investment bank, but the bank collapses before delivering the agreed payout.',
    whyItMatters: 'Always evaluate the financial soundness and creditworthiness of the institutions holding your money or underwriting your guarantees.'
  },
  {
    id: 'ri-systemic-risk',
    groupId: 'risk-insurance',
    question: 'What is Systemic Risk?',
    explanation: 'The risk that the collapse of a single critical institution or financial market sector triggers a domino effect that threatens the entire global financial system.',
    example: 'The collapse of Lehman Brothers in September 2008 freezing interbank lending across the entire planet within 48 hours.',
    whyItMatters: 'Diversification within a single asset class does not protect against systemic shocks; only broad asset classes and cash reserves survive.'
  },
  {
    id: 'ri-sovereign-political-risk',
    groupId: 'risk-insurance',
    question: 'What is Political and Sovereign Risk?',
    explanation: 'The risk that a government suddenly changes laws, seizes private property, imposes capital controls, or cancels foreign investor rights without compensation.',
    example: 'A government nationalizing private oil refineries or freezing foreign currency withdrawals during a political crisis.',
    whyItMatters: 'Higher political risk is why assets in unstable developing nations trade at massive valuation discounts compared to established rule-of-law jurisdictions.'
  },
  {
    id: 'ri-sequence-of-returns-risk',
    groupId: 'risk-insurance',
    question: 'What is Sequence of Returns Risk for retirees?',
    explanation: 'The risk of experiencing a major stock market crash in the very first few years of retirement while actively selling shares to fund living expenses.',
    example: 'Retiring in 2008 with $1M and selling shares during a 40% crash permanently shrinks your portfolio base, preventing recovery even when the market rebounds.',
    whyItMatters: 'Retirees keep 2 to 3 years of living expenses in safe cash or short-term bonds specifically to avoid selling depressed equities during market dips.'
  },
  {
    id: 'ri-idiosyncratic-risk',
    groupId: 'risk-insurance',
    question: 'What is Idiosyncratic Risk vs Systematic Risk?',
    explanation: 'Idiosyncratic risk is specific to a single individual company (e.g. CEO scandal, product recall) and can be completely eliminated via diversification. Systematic risk affects the entire market (e.g. war, recession) and cannot be diversified away.',
    example: 'A car manufacturer has a battery fire recall (idiosyncratic); the central bank hikes interest rates across the entire country (systematic).',
    whyItMatters: 'You are never compensated by the market for taking idiosyncratic risk that could easily be diversified away.'
  },
  {
    id: 'ri-tail-risk-black-swan',
    groupId: 'risk-insurance',
    question: 'What is a "Black Swan" event and Tail Risk?',
    explanation: 'An extremely rare, unpredictable, high-impact catastrophe that mainstream financial models assume has a near-zero probability of happening.',
    example: 'The 2008 global financial meltdown, the 2020 worldwide pandemic lockdown, or the 1987 Black Monday single-day 22% crash.',
    whyItMatters: 'Portfolios optimized strictly for normal times get annihilated by black swans; robust portfolios build survival redundancy.'
  },
  {
    id: 'ri-co-insurance-clause',
    groupId: 'risk-insurance',
    question: 'What is a Co-Insurance Clause in property policies?',
    explanation: 'A requirement that policyholders insure their building for at least a minimum percentage of its true replacement value (typically 80%), or else face penalty reductions on all future claims.',
    example: 'Insuring an $800,000 building for only $400,000 to save on premiums results in the insurer paying only half of any kitchen fire repair claim.',
    whyItMatters: 'Under-insuring your home or commercial building to cut costs leaves you legally penalized when making partial damage claims.'
  },
  {
    id: 'ri-reinsurance',
    groupId: 'risk-insurance',
    question: 'What is Reinsurance ("Insurance for Insurers")?',
    explanation: 'Specialized global companies (like Munich Re or Swiss Re) that sell insurance policies to primary retail insurance companies to absorb massive hurricane, wildfire, or earthquake payouts.',
    example: 'A Florida home insurer buys reinsurance so it doesn’t go bankrupt if a Category 5 hurricane destroys 50,000 policyholder homes in one afternoon.',
    whyItMatters: 'Stabilizes the global insurance industry and ensures policyholders actually get paid during epic regional natural disasters.'
  },
  {
    id: 'ri-loss-leader-insurance',
    groupId: 'risk-insurance',
    question: 'How do insurance companies invest your premiums ("Float")?',
    explanation: 'The time gap between collecting insurance premiums today and paying out future claims years later creates a massive pool of cash called "the Float." Insurers invest this float in bonds and equities to earn investment income.',
    example: 'Warren Buffett built Berkshire Hathaway by investing the tens of billions of float generated by GEICO into high-performing businesses.',
    whyItMatters: 'Insurers can break even or lose money on basic underwriting and still earn vast profits from investing the float.'
  }
]
