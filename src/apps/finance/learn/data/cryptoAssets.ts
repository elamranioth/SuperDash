import { LearnLesson } from '../types'

export const CRYPTO_ASSETS_LESSONS: LearnLesson[] = [
  {
    id: 'cda-what-is-blockchain',
    groupId: 'crypto-digital-assets',
    question: 'What is a Blockchain?',
    explanation: 'A distributed digital ledger maintained by a network of computers worldwide. Transactions are bundled into cryptographic blocks, verified by consensus, and permanently recorded without needing a central bank or corporate intermediary.',
    example: 'Instead of Visa verifying that Alice sent $50 to Bob, thousands of independent computers verify the ledger math and confirm the transaction.',
    whyItMatters: 'Enables trustless, tamper-resistant record keeping across untrusted parties across the globe.'
  },
  {
    id: 'cda-what-is-bitcoin',
    groupId: 'crypto-digital-assets',
    question: 'What is Bitcoin and why was it created?',
    explanation: 'The first decentralized digital currency, invented in 2008 by Satoshi Nakamoto following the global financial crisis. It has a strict mathematical supply cap of 21 million coins and operates without any central authority.',
    example: 'Sending funds directly to another person across international borders in 20 minutes on a Sunday without asking a bank for permission.',
    whyItMatters: 'Often viewed as "digital gold"—a censorship-resistant, non-sovereign store of value immune to government money printing.'
  },
  {
    id: 'cda-what-is-ethereum',
    groupId: 'crypto-digital-assets',
    question: 'What is Ethereum and Smart Contracts?',
    explanation: 'A programmable blockchain platform where developers can deploy self-executing software programs called Smart Contracts. When predetermined conditions are met, code runs automatically without human intervention.',
    example: 'An automated escrow contract that releases payment to a seller only when an external tracking API confirms package delivery.',
    whyItMatters: 'Turned blockchains from simple currency transmission networks into global computational platforms for decentralized applications.'
  },
  {
    id: 'cda-what-is-a-stablecoin',
    groupId: 'crypto-digital-assets',
    question: 'What is a Stablecoin?',
    explanation: 'A cryptocurrency engineered to maintain a constant 1:1 price peg with a traditional fiat currency, usually the US Dollar, backed by cash reserves and short-term Treasuries in regulated bank accounts.',
    example: 'Holding 100 USDC or USDT represents approximately $100.00 of liquid cash value that can be sent globally in seconds.',
    whyItMatters: 'Allows people in countries with collapsing local currencies (like Argentina or Nigeria) to preserve savings in digital dollars.'
  },
  {
    id: 'cda-custody-wallets',
    groupId: 'crypto-digital-assets',
    question: 'What is a Custodial vs Self-Custody Wallet?',
    explanation: 'In a custodial wallet (like an exchange), a company holds your credentials. In a self-custody wallet (hardware or software), you hold your private keys directly and control your funds with zero intermediaries.',
    example: 'Leaving coins on an exchange vs storing them on a physical Ledger or Trezor hardware device disconnected from the internet.',
    whyItMatters: '"Not your keys, not your coins"—if an exchange goes bankrupt (like FTX in 2022), custodial users often lose their entire deposits.'
  },
  {
    id: 'cda-private-keys-seed-phrase',
    groupId: 'crypto-digital-assets',
    question: 'What is a Private Key and Seed Phrase?',
    explanation: 'A 12-to-24-word recovery phrase that generates your master cryptographic private keys. Anyone who knows your seed phrase has irrevocable total access to drain your funds.',
    example: 'Writing your 12 recovery words on a steel backup plate stored in a home safe, never typing them into any website or phone screenshot.',
    whyItMatters: 'Unlike banks with password resets, blockchain transactions are mathematically irreversible; lost keys mean permanently lost money.'
  },
  {
    id: 'cda-proof-of-work-vs-stake',
    groupId: 'crypto-digital-assets',
    question: 'What is Proof of Work vs Proof of Stake?',
    explanation: 'Proof of Work (used by Bitcoin) secures the network using computational electricity to solve cryptographic puzzles. Proof of Stake (used by Ethereum) secures the network by requiring validators to pledge native coins as collateral against bad behavior.',
    example: 'Bitcoin miners running high-powered computers vs Ethereum validators locking up 32 ETH to propose blocks.',
    whyItMatters: 'Proof of Stake drastically reduces energy consumption (by >99%), while Proof of Work provides battle-tested physical security against state attacks.'
  },
  {
    id: 'cda-crypto-volatility-risk',
    groupId: 'crypto-digital-assets',
    question: 'Why is Crypto extremely Volatile and Risky?',
    explanation: 'Crypto markets are young, trade 24/7 with zero circuit breakers, lack traditional cashflow valuation models, and are heavily influenced by leverage and social media hype.',
    example: 'Major cryptocurrencies dropping 80% during multi-year "crypto winters" before recovering in subsequent speculative cycles.',
    whyItMatters: 'Investors should never commit capital to digital assets that they cannot afford to lose or wait years to recover.'
  },
  {
    id: 'cda-defi-decentralized-finance',
    groupId: 'crypto-digital-assets',
    question: 'What is DeFi (Decentralized Finance)?',
    explanation: 'Financial applications built on blockchains that offer automated lending, borrowing, and currency trading through smart contracts without traditional banks or brokers.',
    example: 'Depositing digital assets into a lending smart contract to earn automated yield paid by borrowers who supply collateral.',
    whyItMatters: 'Removes bureaucratic bank gatekeepers, but introduces severe risks from software bugs and malicious smart contract exploits.'
  },
  {
    id: 'cda-tokenomics',
    groupId: 'crypto-digital-assets',
    question: 'What is "Tokenomics" and why inspect it?',
    explanation: 'The mathematical economic design of a token: total supply cap, inflation rate, vesting schedules, and how many tokens the project founders reserved for themselves.',
    example: 'A project where founders own 50% of the token supply and can unlock and dump millions of tokens onto retail buyers every month.',
    whyItMatters: 'High founder allocations and predatory unlock schedules dilute late retail buyers and cause token prices to crash over time.'
  },
  {
    id: 'cda-gas-network-fees',
    groupId: 'crypto-digital-assets',
    question: 'What are Gas Fees and Transaction Costs?',
    explanation: 'The micro-payment paid to network validators to include your transaction in an upcoming block on the blockchain ledger.',
    example: 'During peak network congestion, sending a $20 transaction might require paying a $15 validator gas fee.',
    whyItMatters: 'Ledger block space is finite; users bid against each other in real time for priority processing.'
  },
  {
    id: 'cda-crypto-scams-phishing',
    groupId: 'crypto-digital-assets',
    question: 'What are the most common Crypto Scams?',
    explanation: 'Fake customer support DMs asking for seed phrases, phishing websites mimicking exchanges, and "pump and dump" influencer tokens designed to steal deposits.',
    example: 'A scammer sends an email saying your wallet has an urgent update, directing you to a lookalike website that drains your funds once connected.',
    whyItMatters: 'Because transactions cannot be reversed or refunded by customer support, skepticism and operational security are mandatory.'
  },
  {
    id: 'cda-halving-bitcoin',
    groupId: 'crypto-digital-assets',
    question: 'What is the Bitcoin Halving?',
    explanation: 'A programmed event occurring roughly every four years (every 210,000 blocks) that cuts the new issuance rate of freshly minted bitcoins to miners in half.',
    example: 'The reward started at 50 BTC per block in 2009, dropped to 25, then 12.5, 6.25, and halved again to 3.125 BTC in 2024.',
    whyItMatters: 'Programmatically reduces incoming supply over time, contrasting sharply with expanding fiat currency supplies.'
  },
  {
    id: 'cda-cbdc-central-bank',
    groupId: 'crypto-digital-assets',
    question: 'What is a CBDC (Central Bank Digital Currency)?',
    explanation: 'A government-issued digital currency managed directly by a country’s central bank, unlike decentralized cryptocurrencies.',
    example: 'The Digital Yuan or a potential Federal Reserve Digital Dollar issued directly to citizen phone apps.',
    whyItMatters: 'Provides speed and lower transaction fees, but raises severe privacy concerns since central authorities can monitor or restrict all citizen spending.'
  },
  {
    id: 'cda-layer-2-scaling',
    groupId: 'crypto-digital-assets',
    question: 'What is a Layer 2 (L2) Scaling Solution?',
    explanation: 'Secondary networks built on top of a main blockchain that process thousands of transactions off-chain at high speed and low cost, settling only final summaries back to Layer 1.',
    example: 'The Lightning Network for Bitcoin or Arbitrum and Optimism for Ethereum.',
    whyItMatters: 'Solves the blockchain scalability trilemma, allowing networks to handle global transaction volumes like Visa without crippling fees.'
  },
  {
    id: 'cda-staking',
    groupId: 'crypto-digital-assets',
    question: 'What is Crypto Staking and its risks?',
    explanation: 'Locking up your digital tokens to participate in running or validating a Proof of Stake network, earning native network token rewards for securing the system.',
    example: 'Staking coins to earn a 4% annualized reward paid directly by the underlying protocol.',
    whyItMatters: 'Staking rewards do not protect against price drops—earning 5% in tokens is useless if the token’s market price drops by 50%.'
  },
  {
    id: 'cda-smart-contract-risk',
    groupId: 'crypto-digital-assets',
    question: 'What is Smart Contract Risk?',
    explanation: 'The risk that an unforeseen bug, vulnerability, or coding logic flaw in a smart contract allows hackers to drain deposited collateral.',
    example: 'A DeFi lending protocol having $100 million drained overnight because developers forgot to secure a flash-loan balance check.',
    whyItMatters: 'Code is law on blockchains; if code contains a flaw, the losses are immediate and irreversible.'
  },
  {
    id: 'cda-tokenization-real-world-assets',
    groupId: 'crypto-digital-assets',
    question: 'What is Tokenization of Real-World Assets (RWA)?',
    explanation: 'Representing ownership of physical, tangible assets (such as commercial real estate, art, or US Treasury bonds) as digital tokens on a blockchain.',
    example: 'Buying a $100 digital token that legally represents 0.001% ownership of an apartment building in Manhattan and receives rental income.',
    whyItMatters: 'Brings fractional ownership, global liquidity, and instant 24/7 settlement to traditionally slow, illiquid physical markets.'
  },
  {
    id: 'cda-regulatory-risks',
    groupId: 'crypto-digital-assets',
    question: 'What are Crypto Regulatory and Legal Risks?',
    explanation: 'The risk that governments classify tokens as unregistered securities, ban private self-custody wallets, or impose strict banking restrictions on crypto exchanges.',
    example: 'Government regulators suing an exchange, causing banking partners to halt fiat dollar deposits and withdrawals overnight.',
    whyItMatters: 'Sudden regulatory crackdowns can instantly freeze liquidity and severely depress asset valuations.'
  },
  {
    id: 'cda-hard-fork-vs-soft-fork',
    groupId: 'crypto-digital-assets',
    question: 'What is a Hard Fork vs Soft Fork in blockchains?',
    explanation: 'A software upgrade. A soft fork is backward-compatible with older software. A hard fork is a permanent divergence where non-upgraded nodes are split into a separate new blockchain.',
    example: 'The 2017 split between Bitcoin (BTC) and Bitcoin Cash (BCH) over transaction block size rules.',
    whyItMatters: 'Disagreements in decentralized governance can split communities and create new competing tokens out of thin air.'
  },
  {
    id: 'cda-crypto-tax-rules',
    groupId: 'crypto-digital-assets',
    question: 'Are Crypto Transactions Taxable?',
    explanation: 'In almost all countries, crypto is treated as property. Selling for fiat, swapping one coin for another, or buying a cup of coffee triggers a reportable capital gains tax event.',
    example: 'Swapping Bitcoin for Ethereum at a profit triggers a capital gains tax liability just as if you had sold the Bitcoin for cash first.',
    whyItMatters: 'Failing to track crypto trades can lead to catastrophic tax penalties and IRS/tax authority audits.'
  },
  {
    id: 'cda-prudent-portfolio-sizing',
    groupId: 'crypto-digital-assets',
    question: 'What is Prudent Portfolio Sizing for Crypto?',
    explanation: 'Limiting volatile digital assets to an asymmetric allocation (such as 1% to 5% of your total net worth) that you are psychologically prepared to see drop by 80%.',
    example: 'A person with a $100,000 portfolio holds $2,000 in crypto. If it multiplies 10x, it meaningfully boosts wealth; if it goes to $0, their life is completely unaffected.',
    whyItMatters: 'Asymmetric bets capture massive upside without risking life-altering personal financial ruin.'
  }
]
