import { LearnLesson, LearnGroup } from '../types'
import { LEARN_GROUPS } from './groups'
import { MONEY_BASICS_LESSONS } from './moneyBasics'
import { PERSONAL_FINANCE_LESSONS } from './personalFinance'
import { BANKING_CREDIT_LESSONS } from './bankingCredit'
import { INVESTING_LESSONS } from './investing'
import { STOCK_MARKET_LESSONS } from './stockMarket'
import { ETFS_FUNDS_LESSONS } from './etfsFunds'
import { BONDS_FIXED_INCOME_LESSONS } from './bondsFixedIncome'
import { CRYPTO_ASSETS_LESSONS } from './cryptoAssets'
import { BUSINESS_FINANCE_LESSONS } from './businessFinance'
import { ECONOMICS_LESSONS } from './economics'
import { RISK_INSURANCE_LESSONS } from './riskInsurance'
import { REAL_ESTATE_FINANCE_LESSONS } from './realEstateFinance'
import { FINANCIAL_STATEMENTS_LESSONS } from './financialStatements'
import { ADVANCED_FINANCE_LESSONS } from './advancedFinance'

export { LEARN_GROUPS }

export const ALL_LEARN_LESSONS: LearnLesson[] = [
  ...MONEY_BASICS_LESSONS,
  ...PERSONAL_FINANCE_LESSONS,
  ...BANKING_CREDIT_LESSONS,
  ...INVESTING_LESSONS,
  ...STOCK_MARKET_LESSONS,
  ...ETFS_FUNDS_LESSONS,
  ...BONDS_FIXED_INCOME_LESSONS,
  ...CRYPTO_ASSETS_LESSONS,
  ...BUSINESS_FINANCE_LESSONS,
  ...ECONOMICS_LESSONS,
  ...RISK_INSURANCE_LESSONS,
  ...REAL_ESTATE_FINANCE_LESSONS,
  ...FINANCIAL_STATEMENTS_LESSONS,
  ...ADVANCED_FINANCE_LESSONS
]

export const LESSONS_BY_GROUP: Record<string, LearnLesson[]> = {
  'money-basics': MONEY_BASICS_LESSONS,
  'personal-finance': PERSONAL_FINANCE_LESSONS,
  'banking-credit': BANKING_CREDIT_LESSONS,
  'investing': INVESTING_LESSONS,
  'stock-market': STOCK_MARKET_LESSONS,
  'etfs-funds': ETFS_FUNDS_LESSONS,
  'bonds-fixed-income': BONDS_FIXED_INCOME_LESSONS,
  'crypto-digital-assets': CRYPTO_ASSETS_LESSONS,
  'business-finance': BUSINESS_FINANCE_LESSONS,
  'economics': ECONOMICS_LESSONS,
  'risk-insurance': RISK_INSURANCE_LESSONS,
  'real-estate-finance': REAL_ESTATE_FINANCE_LESSONS,
  'financial-statements': FINANCIAL_STATEMENTS_LESSONS,
  'advanced-finance': ADVANCED_FINANCE_LESSONS
}

export const LESSON_MAP = new Map<string, LearnLesson>(
  ALL_LEARN_LESSONS.map(l => [l.id, l])
)

export const GROUP_MAP = new Map<string, LearnGroup>(
  LEARN_GROUPS.map(g => [g.id, g])
)

/**
 * Returns a deterministic "Lesson of the Day" based on calendar day.
 */
export function getLessonOfTheDay(): LearnLesson {
  const now = new Date()
  const dayOfYear = Math.floor(
    (Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) -
      Date.UTC(now.getFullYear(), 0, 0)) /
      (24 * 60 * 60 * 1000)
  )
  const index = Math.abs(dayOfYear % ALL_LEARN_LESSONS.length)
  return ALL_LEARN_LESSONS[index] || ALL_LEARN_LESSONS[0]
}
