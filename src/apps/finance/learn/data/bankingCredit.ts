import { LearnLesson } from '../types'

export const BANKING_CREDIT_LESSONS: LearnLesson[] = [
  {
    id: 'bc-checking-vs-savings',
    groupId: 'banking-credit',
    question: 'What is a Checking Account vs a Savings Account?',
    explanation: 'A checking account is designed for high-frequency daily spending, debit card swipes, and bill payments. A savings account is meant to hold reserves and earn interest.',
    example: 'Your paycheck deposits into checking to cover weekly groceries; you move excess funds into savings to accumulate an emergency reserve.',
    whyItMatters: 'Keeping all your money in checking risks impulse spending and fraud; keeping it all in savings risks withdrawal limit penalties.'
  },
  {
    id: 'bc-high-yield-savings',
    groupId: 'banking-credit',
    question: 'What is a High-Yield Savings Account (HYSA)?',
    explanation: 'A savings account (often at an online bank) that pays an interest rate 10 to 20 times higher than traditional brick-and-mortar branch banks.',
    example: 'Holding $20,000 in a traditional bank paying 0.01% earns $2 a year. In a 4.5% HYSA, that same cash earns $900 a year with zero extra risk.',
    whyItMatters: 'Using an HYSA ensures your liquid emergency fund works for you rather than being eroded by inflation.'
  },
  {
    id: 'bc-fdic-insurance',
    groupId: 'banking-credit',
    question: 'What is FDIC Insurance and Deposit Protection?',
    explanation: 'A government guarantee protecting depositors’ money if their commercial bank goes bankrupt, usually up to $250,000 per depositor per bank.',
    example: 'If your bank collapses on a Friday afternoon, the government steps in on Monday to ensure your deposits up to $250k are returned in full.',
    whyItMatters: 'It prevents panic bank runs and guarantees that money stored in certified accounts is truly safe from institutional default.'
  },
  {
    id: 'bc-how-banks-make-money',
    groupId: 'banking-credit',
    question: 'How do Commercial Banks make money?',
    explanation: 'Banks take deposits from savers, pay them a low interest rate, and lend that same money out to borrowers at a higher interest rate (the net interest margin).',
    example: 'The bank pays you 3% on your savings account and lends that capital out as a car loan at 7%, keeping the 4% difference as profit.',
    whyItMatters: 'Understanding this reveals why banks love when you keep large deposits and aggressively push credit cards and mortgages.'
  },
  {
    id: 'bc-what-is-credit-score',
    groupId: 'banking-credit',
    question: 'What is a Credit Score?',
    explanation: 'A three-digit numerical score (typically between 300 and 850) that indicates how reliably you repay borrowed money based on your credit history.',
    example: 'A score of 780 marks you as an excellent borrower, while 580 signals past missed payments or high default risk.',
    whyItMatters: 'Higher scores unlock hundreds of thousands in lifetime interest savings on mortgages, auto loans, and insurance.'
  },
  {
    id: 'bc-credit-score-factors',
    groupId: 'banking-credit',
    question: 'What factors determine your Credit Score?',
    explanation: 'Payment history (35%), credit utilization ratio (30%), length of credit history (15%), credit mix (10%), and new credit inquiries (10%).',
    example: 'Missing a single 30-day payment can plunge an excellent credit score by 80 points overnight because payment history is weighted heavily.',
    whyItMatters: 'Knowing the formula tells you exactly what to prioritize: pay on time and keep credit card balances low.'
  },
  {
    id: 'bc-credit-utilization',
    groupId: 'banking-credit',
    question: 'What is Credit Utilization Ratio?',
    explanation: 'The percentage of your total available credit card limits that you are currently borrowing at any given moment.',
    example: 'If your credit card has a $10,000 limit and your statement balance is $2,000, your credit utilization is 20%.',
    whyItMatters: 'Keeping your utilization under 30% (ideally under 10%) gives your credit score an immediate, substantial boost.'
  },
  {
    id: 'bc-debit-vs-credit-card',
    groupId: 'banking-credit',
    question: 'Why is a Credit Card safer than a Debit Card?',
    explanation: 'A debit card pulls money directly out of your real checking account. A credit card spends the bank’s money with 30-day billing cycles and strong legal fraud protection.',
    example: 'If a fraudster steals your card number, a debit card drains your grocery money; with a credit card, you dispute the charge and pay nothing.',
    whyItMatters: 'Credit cards offer superior fraud shields, warranty perks, and rewards—provided you always pay the full balance monthly.'
  },
  {
    id: 'bc-apr-annual-percentage-rate',
    groupId: 'banking-credit',
    question: 'What is APR (Annual Percentage Rate)?',
    explanation: 'The yearly interest rate charged on borrowed money, including both interest and upfront lender finance fees.',
    example: 'A credit card with a 24% APR charges approximately 2% interest per month on any unpaid rolling balance.',
    whyItMatters: 'Credit card APRs are so punishing that carrying rolling balances makes financial progress mathematically impossible.'
  },
  {
    id: 'bc-grace-period',
    groupId: 'banking-credit',
    question: 'What is the Credit Card Grace Period?',
    explanation: 'The window between the end of your billing cycle and the payment due date (typically 21–25 days) where zero interest is charged if you paid your previous balance in full.',
    example: 'You buy a laptop on June 5. The bill arrives June 30 and is due July 25. If paid by July 25, you pay $0 in interest.',
    whyItMatters: 'By paying in full every month, you get a 30-day interest-free loan from the bank while collecting cash back rewards.'
  },
  {
    id: 'bc-minimum-payment-trap',
    groupId: 'banking-credit',
    question: 'What is the "Minimum Payment Trap"?',
    explanation: 'Credit card statements offer a tiny "minimum payment" that barely covers accrued interest, extending a loan for decades and multiplying total costs.',
    example: 'Paying only the $50 minimum on a $3,000 balance at 22% APR can take over 15 years to pay off and cost over $4,000 in pure interest.',
    whyItMatters: 'Never treat the minimum payment as a target; treat it as an emergency floor and always pay the statement balance.'
  },
  {
    id: 'bc-overdraft-protection-trap',
    groupId: 'banking-credit',
    question: 'What are Bank Overdraft Fees?',
    explanation: 'A penalty fee (often $35) charged when a bank processes a transaction that exceeds your checking account balance instead of simply declining it.',
    example: 'Buying a $4 cup of coffee with $2 in your checking account results in a $35 overdraft fee, turning a $4 coffee into a $39 drink.',
    whyItMatters: 'You can opt out of overdraft coverage at your bank so transactions simply decline for free rather than incurring massive fees.'
  },
  {
    id: 'bc-secured-credit-cards',
    groupId: 'banking-credit',
    question: 'What is a Secured Credit Card?',
    explanation: 'A starter credit card backed by a cash security deposit that acts as your credit limit, designed for people rebuilding bad credit or starting from zero.',
    example: 'You deposit $300 into the bank. They give you a card with a $300 limit. You use it for gas, pay it off monthly, and build an on-time record.',
    whyItMatters: 'It is the most reliable, guaranteed pathway to build a respectable credit score without risking dangerous unpayable debt.'
  },
  {
    id: 'bc-certificates-of-deposit',
    groupId: 'banking-credit',
    question: 'What is a Certificate of Deposit (CD)?',
    explanation: 'A time deposit where you agree to lock up your cash for a fixed term (e.g., 6 months to 5 years) in exchange for a guaranteed, fixed interest rate.',
    example: 'Locking $10,000 into a 1-year CD at 5.0% guarantees you exactly $500 in interest when the term matures.',
    whyItMatters: 'CDs lock in high yields when you anticipate interest rates will fall soon, protecting your cash return from drops.'
  },
  {
    id: 'bc-fixed-vs-variable-loans',
    groupId: 'banking-credit',
    question: 'What is a Fixed Rate vs Variable Rate Loan?',
    explanation: 'Fixed rate loans keep the exact same interest rate and monthly payment for the entire life of the loan. Variable rate loans fluctuate based on central bank benchmark rates.',
    example: 'A 30-year fixed mortgage payment is locked for three decades; an adjustable rate mortgage can jump hundreds of dollars if rates climb.',
    whyItMatters: 'Fixed loans provide peace of mind and predictable budgeting, whereas variable loans carry rate-shock risks.'
  },
  {
    id: 'bc-hard-vs-soft-credit-inquiry',
    groupId: 'banking-credit',
    question: 'What is a Hard vs Soft Credit Inquiry?',
    explanation: 'A soft inquiry checks your report for background or rate-shopping purposes and does NOT hurt your score. A hard inquiry happens when you formally apply for credit and temporarily drops your score a few points.',
    example: 'Checking your own score on an app is a soft pull; applying for a new credit card or auto loan triggers a hard pull.',
    whyItMatters: 'Avoid submitting multiple formal credit applications in rapid succession, as it signals financial distress to lenders.'
  },
  {
    id: 'bc-loan-amortization',
    groupId: 'banking-credit',
    question: 'What is Loan Amortization?',
    explanation: 'The schedule of how loan payments are split between paying down interest and paying off principal over time.',
    example: 'In year one of a 30-year mortgage, 80% of each monthly payment goes to bank interest; by year 25, 80% goes toward your real equity.',
    whyItMatters: 'Making small additional principal payments early in a loan saves massive amounts of interest over the life of the loan.'
  },
  {
    id: 'bc-payday-loans',
    groupId: 'banking-credit',
    question: 'Why are Payday Loans considered predatory?',
    explanation: 'Short-term loans that charge astronomical fees equivalent to 400% to 1,000% annualized interest, trapping borrowers in endless debt rollovers.',
    example: 'Borrowing $400 for two weeks with a $60 fee equals an annualized APR of nearly 400%.',
    whyItMatters: 'Payday loans are financial quicksand; an emergency fund exists specifically to ensure you never need one.'
  },
  {
    id: 'bc-cosigning-risks',
    groupId: 'banking-credit',
    question: 'Why should you almost never Co-Sign a loan?',
    explanation: 'Co-signing legally obligates you to pay 100% of the loan balance if the primary borrower fails to pay, and missed payments directly damage your own credit score.',
    example: 'Co-signing a $15,000 car loan for a friend who stops paying leaves you legally on the hook for the entire remaining balance.',
    whyItMatters: 'If a bank whose entire business is evaluating risk refuses to lend to someone alone, you should not take that risk either.'
  },
  {
    id: 'bc-balance-transfers',
    groupId: 'banking-credit',
    question: 'What is a 0% APR Balance Transfer?',
    explanation: 'A promotional feature where you move high-interest credit card debt to a new card offering 0% interest for 12 to 18 months, usually for a small 3–5% transfer fee.',
    example: 'Moving a $6,000 balance from a 24% card to a 0% card allows your entire monthly payment to reduce the actual principal debt.',
    whyItMatters: 'It is a powerful tactical tool to eliminate debt rapidly, provided you do not continue spending on the newly freed card.'
  },
  {
    id: 'bc-credit-freezes',
    groupId: 'banking-credit',
    question: 'What is a Credit Freeze and why should everyone use one?',
    explanation: 'A free legal setting with the credit bureaus that blocks anyone from opening new credit accounts in your name until you temporarily unfreeze it.',
    example: 'Even if identity thieves steal your social security number and address, lenders will automatically decline fraudulent loan applications.',
    whyItMatters: 'It is the single most effective defense against identity theft and unauthorized borrowing.'
  },
  {
    id: 'bc-wire-transfer-vs-ach',
    groupId: 'banking-credit',
    question: 'What is a Wire Transfer vs an ACH Transfer?',
    explanation: 'ACH is an automated electronic clearing house batch network that takes 1–3 business days and is usually free. Wires move money almost instantly and irreversibly for a fee ($25–$50).',
    example: 'Direct deposit payroll uses ACH; buying a home and funding the closing escrow uses an immediate wire transfer.',
    whyItMatters: 'Wires cannot be recalled once sent, making them the favorite payment method requested by real estate scammers.'
  },
  {
    id: 'bc-escrow-accounts',
    groupId: 'banking-credit',
    question: 'What is an Escrow Account in mortgage banking?',
    explanation: 'A holding account managed by your mortgage servicer that collects extra money each month to pay property taxes and homeowners insurance on your behalf.',
    example: 'Your monthly mortgage payment is $1,600: $1,200 goes toward loan principal and interest, and $400 is saved in escrow for annual county taxes.',
    whyItMatters: 'Escrow prevents you from facing a surprise $5,000 lump-sum property tax bill at the end of the year.'
  },
  {
    id: 'bc-credit-card-chargebacks',
    groupId: 'banking-credit',
    question: 'What is a Chargeback?',
    explanation: 'A consumer protection process where your credit card issuer forcibly reverses a charge after a merchant fails to deliver the promised goods or commits fraud.',
    example: 'You order a table online that never arrives, and the seller stops answering emails. You file a chargeback and your credit card issuer refunds the money.',
    whyItMatters: 'Gives consumers powerful leverage against fraudulent or deceptive merchants.'
  },
  {
    id: 'bc-peer-to-peer-lending',
    groupId: 'banking-credit',
    question: 'What is Peer-to-Peer (P2P) Lending?',
    explanation: 'Online platforms that match individual borrowers directly with individual investors, bypassing traditional retail banking branches.',
    example: 'Borrowing $10,000 to consolidate debt from an online platform where 50 regular people each funded $200 of your loan.',
    whyItMatters: 'Often offers lower borrowing costs for creditworthy individuals and higher yield opportunities for patient investors.'
  }
]
