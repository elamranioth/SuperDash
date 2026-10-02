import { LearnLesson } from '../types'

export const ECONOMICS_LESSONS: LearnLesson[] = [
  {
    id: 'eco-what-is-inflation',
    groupId: 'economics',
    question: 'What is Inflation and what causes it?',
    explanation: 'A broad, sustained increase in the prices of goods and services across an entire economy, which reduces the purchasing power of each unit of currency.',
    example: 'A basket of everyday groceries that cost $100 last year costs $107 this year, representing a 7% annual inflation rate.',
    whyItMatters: 'Inflation acts as an invisible tax on cash savings, quietly stealing purchasing power from anyone holding uninvested cash.'
  },
  {
    id: 'eco-what-is-deflation',
    groupId: 'economics',
    question: 'What is Deflation and why do central banks fear it?',
    explanation: 'A general decrease in the price level of goods and services. While cheap prices sound great to consumers, deflation causes people to delay spending, leading to falling wages, mass layoffs, and economic stagnation.',
    example: 'Why buy a car today for $30,000 if you know it will cost $27,000 next year? Everyone waits, factories close, and workers lose jobs.',
    whyItMatters: 'Deflationary spirals (like the Great Depression or Japan’s lost decades) are historically much harder for central banks to cure than inflation.'
  },
  {
    id: 'eco-what-is-gdp',
    groupId: 'economics',
    question: 'What is Gross Domestic Product (GDP)?',
    explanation: 'The total monetary value of all finished goods and services produced within a country’s borders during a specific period (usually one year).',
    example: 'Adding up all consumer spending, business investments, government expenditures, and net exports across the nation.',
    whyItMatters: 'GDP is the master scorecard of national economic size; expanding GDP indicates rising employment and higher living standards.'
  },
  {
    id: 'eco-what-is-a-recession',
    groupId: 'economics',
    question: 'What is a Recession?',
    explanation: 'A significant, widespread decline in economic activity lasting more than a few months, traditionally defined as two consecutive quarters of negative GDP growth.',
    example: 'Businesses pull back investments, consumer spending drops, unemployment spikes, and company earnings decline across multiple industries.',
    whyItMatters: 'Recessions are natural phases of the business cycle that clear out malinvestment and reset economic valuations.'
  },
  {
    id: 'eco-central-banks',
    groupId: 'economics',
    question: 'What is a Central Bank and what is its dual mandate?',
    explanation: 'A national institution (like the Federal Reserve or European Central Bank) that controls money supply and monetary policy. Most operate under a dual mandate: maximum sustainable employment and price stability (low inflation).',
    example: 'The Federal Reserve raising benchmark interest rates to cool down an overheating housing market and tame inflation.',
    whyItMatters: 'Central bank interest rate decisions move trillions of dollars in global markets and determine the cost of your credit cards and mortgages.'
  },
  {
    id: 'eco-monetary-policy',
    groupId: 'economics',
    question: 'What is Monetary Policy vs Fiscal Policy?',
    explanation: 'Monetary policy is managed by the independent central bank via interest rates and money supply. Fiscal policy is managed by elected politicians via government taxing and spending budgets.',
    example: 'The central bank cutting rates to 1% is monetary policy; Congress passing a $1 trillion infrastructure spending bill is fiscal policy.',
    whyItMatters: 'Both levers shape inflation, jobs, and market liquidity, but operate on different timelines and political incentives.'
  },
  {
    id: 'eco-supply-and-demand',
    groupId: 'economics',
    question: 'How does the Law of Supply and Demand set prices?',
    explanation: 'When demand for an item rises while supply is limited, prices rise. When supply floods the market while demand is low, sellers slash prices to clear inventory.',
    example: 'Hotel room prices double in a city during a massive music festival because thousands of fans compete for a fixed number of rooms.',
    whyItMatters: 'Market prices are information signals that naturally coordinate global production without needing a central government planner.'
  },
  {
    id: 'eco-hyperinflation',
    groupId: 'economics',
    question: 'What is Hyperinflation?',
    explanation: 'Rapid, out-of-control inflation exceeding 50% per month, typically caused when a government prints astronomical amounts of fiat currency to finance unsustainable deficits.',
    example: 'Weimar Germany in 1923, Zimbabwe in 2008, or Venezuela, where workers were paid twice a day because prices doubled by dinnertime.',
    whyItMatters: 'Completely destroys the domestic currency and wipes out the life savings of the middle class.'
  },
  {
    id: 'eco-stagflation',
    groupId: 'economics',
    question: 'What is Stagflation?',
    explanation: 'A toxic economic combination of stagnant economic growth, high unemployment, and high inflation all occurring at the exact same time.',
    example: 'The 1970s oil crisis, where economies experienced recessionary job losses while the cost of gasoline and food skyrocketed.',
    whyItMatters: 'A nightmare for central banks because raising interest rates hurts the weak economy, while lowering rates worsens inflation.'
  },
  {
    id: 'eco-cpi-consumer-price-index',
    groupId: 'economics',
    question: 'What is the Consumer Price Index (CPI)?',
    explanation: 'A monthly government economic metric that tracks price changes for a representative basket of goods and services purchased by typical urban households.',
    example: 'Tracking the average cost changes across food, electricity, rent, used cars, airline tickets, and prescription medicine.',
    whyItMatters: 'Used by governments to calculate cost-of-living salary raises and by central banks to set monetary policy.'
  },
  {
    id: 'eco-quantitative-easing-qe',
    groupId: 'economics',
    question: 'What is Quantitative Easing (QE)?',
    explanation: 'An unconventional monetary policy where a central bank creates new digital bank reserves to purchase government bonds from commercial banks, injecting massive liquidity directly into the financial system.',
    example: 'The Fed buying hundreds of billions in bonds following 2008 and 2020 to push long-term interest rates down to record lows.',
    whyItMatters: 'Inflates asset prices (stocks, real estate) and lowers borrowing costs to stimulate economic activity during severe crises.'
  },
  {
    id: 'eco-quantitative-tightening-qt',
    groupId: 'economics',
    question: 'What is Quantitative Tightening (QT)?',
    explanation: 'The reverse of QE: the central bank shrinks its balance sheet by letting bonds mature without reinvesting the proceeds, pulling liquidity out of the banking system.',
    example: 'Allowing $60 billion in Treasury bonds to expire each month, removing cash from circulation to fight inflation.',
    whyItMatters: 'Drains speculative excess from financial markets, tightening credit and putting downward pressure on asset prices.'
  },
  {
    id: 'eco-opportunity-cost-economics',
    groupId: 'economics',
    question: 'What is Comparative Advantage in international trade?',
    explanation: 'The economic principle that countries produce and export the goods they can manufacture at the lowest relative opportunity cost, trading for the rest.',
    example: 'One nation specializes in high-tech software engineering and imports tropical coffee, leaving both nations wealthier through trade.',
    whyItMatters: 'Explains why free global trade creates higher global standards of living and cheaper consumer products.'
  },
  {
    id: 'eco-tariffs-and-protectionism',
    groupId: 'economics',
    question: 'What are Tariffs and who actually pays them?',
    explanation: 'A customs tax placed by a government on imported foreign goods. While politicians say foreign countries pay them, domestic importing businesses pay the tax and pass the cost directly to domestic consumers.',
    example: 'A 25% tariff on imported washing machines raises the retail store price paid by local families from $600 to $750.',
    whyItMatters: 'Tariffs protect specific domestic industries from competition at the expense of higher everyday consumer living costs.'
  },
  {
    id: 'eco-unemployment-rate-types',
    groupId: 'economics',
    question: 'What are the different types of Unemployment?',
    explanation: 'Frictional (transitioning between jobs), Structural (skills no longer match market needs due to technology), and Cyclical (job losses caused by an economic recession).',
    example: 'A factory worker replaced by robots faces structural unemployment; an office worker laid off during a housing crash faces cyclical unemployment.',
    whyItMatters: 'Zero unemployment is neither possible nor healthy; healthy economies always have 3–4% frictional transition.'
  },
  {
    id: 'eco-monetary-velocity',
    groupId: 'economics',
    question: 'What is Velocity of Money?',
    explanation: 'The rate at which money is exchanged from one transaction to another within an economy—how many times a single dollar bill is spent in a year.',
    example: 'You pay a plumber $100, the plumber spends $100 at the grocery store, the grocer pays $100 to a farmer. One $100 bill generated $300 of economic activity.',
    whyItMatters: 'Even if central banks print trillions, inflation stays subdued if velocity of money drops because banks hoard reserves.'
  },
  {
    id: 'eco-national-debt-deficits',
    groupId: 'economics',
    question: 'What is the National Deficit vs the National Debt?',
    explanation: 'The deficit is the annual shortfall when government tax revenue is less than its spending in a single year. The debt is the accumulated total of all unpaid past deficits combined.',
    example: 'Running a $1.5 trillion deficit this year increases the accumulated national debt from $33 trillion to $34.5 trillion.',
    whyItMatters: 'Heavy interest payments on national debt consume public budgets and risk crowding out private investment.'
  },
  {
    id: 'eco-foreign-exchange-forex',
    groupId: 'economics',
    question: 'What drives Foreign Exchange (Forex) Currency Rates?',
    explanation: 'Differences in interest rates, economic growth, inflation rates, and geopolitical stability between sovereign nations.',
    example: 'If US interest rates rise to 5% while European rates sit at 2%, global investors buy US dollars to earn higher yields, pushing the dollar higher.',
    whyItMatters: 'A stronger domestic currency makes foreign vacations and imported goods cheaper, but hurts domestic exporters.'
  },
  {
    id: 'eco-liquidity-trap',
    groupId: 'economics',
    question: 'What is a "Liquidity Trap"?',
    explanation: 'A situation where interest rates are already near zero, yet businesses and consumers refuse to borrow or spend, hoarding cash instead out of deep economic fear.',
    example: 'Cutting rates to 0% after a housing crash, yet banks refuse to lend and consumers refuse to take on debt.',
    whyItMatters: 'Renders traditional central bank monetary policy powerless, forcing governments to use direct fiscal spending.'
  },
  {
    id: 'eco-cantillon-effect',
    groupId: 'economics',
    question: 'What is the Cantillon Effect in money printing?',
    explanation: 'The phenomenon where newly created money benefits the people who receive it first (governments, major investment banks) before general prices rise, while harming everyday wage earners who receive it last.',
    example: 'Banks borrow newly printed money at 0% to buy assets; by the time the money trickles to working-class wages, rent and food prices have already soared.',
    whyItMatters: 'Explains why unchecked monetary expansion historically widens the wealth inequality gap between asset owners and wage earners.'
  },
  {
    id: 'eco-broken-window-fallacy',
    groupId: 'economics',
    question: 'What is the Broken Window Fallacy in economics?',
    explanation: 'The mistaken belief that destruction (like wars or natural disasters) stimulates the economy by creating repair work, ignoring the unseen productive wealth that was destroyed.',
    example: 'Claiming a hurricane is "good for the economy" because carpenters get paid to rebuild roofs, ignoring that homeowners now have zero money left to buy food or start businesses.',
    whyItMatters: 'Destroying real wealth to create artificial labor makes a society poorer, not richer.'
  },
  {
    id: 'eco-curse-of-resources',
    groupId: 'economics',
    question: 'What is the "Resource Curse" (Dutch Disease)?',
    explanation: 'When a nation discovers massive natural resource reserves (like crude oil), causing its currency to soar and crushing its other domestic manufacturing and technology sectors.',
    example: 'A sudden oil export boom pushes the national currency up 40%, making locally manufactured machinery too expensive for foreign buyers to purchase.',
    whyItMatters: 'Countries with abundant natural resources often have lower long-term economic diversification and higher corruption.'
  },
  {
    id: 'eco-real-vs-nominal-gdp',
    groupId: 'economics',
    question: 'What is Real GDP vs Nominal GDP?',
    explanation: 'Nominal GDP measures output using current market prices. Real GDP strips out the distorting effect of inflation to show whether the economy physically produced more actual goods and services.',
    example: 'If an economy produces 10 cars both years, but car prices double from $20k to $40k, nominal GDP doubles while real GDP growth is exactly 0%.',
    whyItMatters: 'Only Real GDP measures genuine improvements in human productivity and living standards.'
  },
  {
    id: 'eco-paradox-of-thrift',
    groupId: 'economics',
    question: 'What is the "Paradox of Thrift"?',
    explanation: 'While saving is wise for any individual person, if every single citizen in an entire nation tries to drastically cut spending simultaneously, total economic revenue collapses and jobs vanish.',
    example: 'Everyone stops dining out and buying clothes to save cash; restaurant and retail workers are laid off, reducing overall national income.',
    whyItMatters: 'Illustrates how collective behavior in an interconnected economy can produce outcomes opposite to individual intentions.'
  },
  {
    id: 'eco-economic-inequality-gini',
    groupId: 'economics',
    question: 'What is the Gini Coefficient?',
    explanation: 'A statistical measure of wealth or income inequality within a nation, ranging from 0 (perfect equality where everyone earns identical income) to 1.0 (one single person owns everything).',
    example: 'Scandinavian nations typically score around 0.27, while highly unequal developing economies score above 0.50.',
    whyItMatters: 'Economists track the Gini coefficient to monitor social mobility and economic stability.'
  }
]
