import { CurrencyData } from '@/types'
import { storageService } from '@/services/storage'

export interface IExchangeRateService {
  getCurrencies(): CurrencyData[]
  getRates(baseCurrency: string): Promise<Record<string, number>>
  convert(amount: number, from: string, to: string): Promise<number>
  getLastUpdated(): number
}

// Master list of 30+ ISO Currencies with symbols, names, and flags
export const ISO_CURRENCIES: CurrencyData[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$', rateAgainstUSD: 1.0, flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro', symbol: '€', rateAgainstUSD: 0.92, flag: '🇪🇺' },
  { code: 'GBP', name: 'British Pound', symbol: '£', rateAgainstUSD: 0.78, flag: '🇬🇧' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', rateAgainstUSD: 3.6725, flag: '🇦🇪' },
  { code: 'MAD', name: 'Moroccan Dirham', symbol: 'DH', rateAgainstUSD: 9.94, flag: '🇲🇦' },
  { code: 'SAR', name: 'Saudi Riyal', symbol: '﷼', rateAgainstUSD: 3.75, flag: '🇸🇦' },
  { code: 'QAR', name: 'Qatari Riyal', symbol: 'QR', rateAgainstUSD: 3.64, flag: '🇶🇦' },
  { code: 'KWD', name: 'Kuwaiti Dinar', symbol: 'KD', rateAgainstUSD: 0.307, flag: '🇰🇼' },
  { code: 'BHD', name: 'Bahraini Dinar', symbol: 'BD', rateAgainstUSD: 0.376, flag: '🇧🇭' },
  { code: 'OMR', name: 'Omani Rial', symbol: 'RO', rateAgainstUSD: 0.385, flag: '🇴🇲' },
  { code: 'PHP', name: 'Philippine Peso', symbol: '₱', rateAgainstUSD: 56.4, flag: '🇵🇭' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', rateAgainstUSD: 153.2, flag: '🇯🇵' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', rateAgainstUSD: 7.23, flag: '🇨🇳' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', rateAgainstUSD: 1.34, flag: '🇸🇬' },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$', rateAgainstUSD: 7.82, flag: '🇭🇰' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', rateAgainstUSD: 1.52, flag: '🇦🇺' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$', rateAgainstUSD: 1.36, flag: '🇨🇦' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', rateAgainstUSD: 0.89, flag: '🇨🇭' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', rateAgainstUSD: 83.5, flag: '🇮🇳' },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩', rateAgainstUSD: 1370.0, flag: '🇰🇷' },
  { code: 'TRY', name: 'Turkish Lira', symbol: '₺', rateAgainstUSD: 32.2, flag: '🇹🇷' },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$', rateAgainstUSD: 1.64, flag: '🇳🇿' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', rateAgainstUSD: 5.15, flag: '🇧🇷' },
  { code: 'MXN', name: 'Mexican Peso', symbol: '$', rateAgainstUSD: 16.7, flag: '🇲🇽' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R', rateAgainstUSD: 18.4, flag: '🇿🇦' },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr', rateAgainstUSD: 10.8, flag: '🇸🇪' },
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr', rateAgainstUSD: 10.9, flag: '🇳🇴' },
  { code: 'EGP', name: 'Egyptian Pound', symbol: 'E£', rateAgainstUSD: 47.5, flag: '🇪🇬' }
]

class CentralExchangeRateService implements IExchangeRateService {
  private lastUpdated: number = Date.now()
  private cachedRates: Record<string, number> = {}

  getCurrencies(): CurrencyData[] {
    return ISO_CURRENCIES
  }

  getLastUpdated(): number {
    return this.lastUpdated
  }

  async getRates(baseCurrency = 'USD'): Promise<Record<string, number>> {
    try {
      const res = await fetch(`https://open.er-api.com/v6/latest/${baseCurrency}`)
      if (!res.ok) throw new Error('Exchange rate fetch failed')
      const data = await res.json()
      if (data && data.rates) {
        this.cachedRates = data.rates
        this.lastUpdated = Date.now()
        await storageService.set(`rates_${baseCurrency}`, { rates: data.rates, lastUpdated: this.lastUpdated })
        return data.rates
      }
      throw new Error('Malformed rate payload')
    } catch {
      // Storage fallback
      const stored = await storageService.get<{ rates: Record<string, number>; lastUpdated: number } | null>(
        `rates_${baseCurrency}`,
        null
      )
      if (stored) {
        this.lastUpdated = stored.lastUpdated
        return stored.rates
      }

      // Hardcoded fallback computed against USD
      const fallback: Record<string, number> = {}
      const baseEntry = ISO_CURRENCIES.find(c => c.code === baseCurrency) || ISO_CURRENCIES[0]
      const baseUSD = baseEntry.rateAgainstUSD

      ISO_CURRENCIES.forEach(c => {
        fallback[c.code] = c.rateAgainstUSD / baseUSD
      })
      return fallback
    }
  }

  async convert(amount: number, from: string, to: string): Promise<number> {
    if (from === to) return amount
    const rates = await this.getRates(from)
    const rate = rates[to]
    if (!rate) return amount
    return amount * rate
  }
}

export const exchangeRateService: IExchangeRateService = new CentralExchangeRateService()
