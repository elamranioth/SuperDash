import { MarketPairData } from '@/types'
import { storageService } from '@/services/storage'

export interface CryptoTickerData {
  price: number
  change24h: number
  high24h: number
  low24h: number
  volume24h: number
  sparkline: number[]
}

export interface IMarketService {
  fetchPairs(pairIds: string[]): Promise<MarketPairData[]>
  fetchBtcDetail(): Promise<(CryptoTickerData & { lastUpdated: number }) | null>
}

// In-memory cache to prevent redundant API calls
const cache: Record<string, { data: MarketPairData; timestamp: number }> = {}
const CACHE_TTL_MS = 60 * 1000 // 1 minute

class MarketDataService implements IMarketService {
  private async getFiatRates(): Promise<Record<string, number> | null> {
    try {
      const res = await fetch('https://open.er-api.com/v6/latest/USD')
      if (!res.ok) throw new Error('Failed to fetch fiat exchange rates')
      const json = await res.json()
      if (json && json.rates) {
        await storageService.set('cached_fiat_rates', {
          rates: json.rates,
          timestamp: Date.now()
        })
        return json.rates
      }
      throw new Error('Invalid format')
    } catch {
      // Fallback to storage cached rates
      const cached = await storageService.get<{ rates: Record<string, number>; timestamp: number } | null>(
        'cached_fiat_rates',
        null
      )
      return cached ? cached.rates : null
    }
  }

  private async getCryptoTicker(symbol = 'BTCUSDT'): Promise<CryptoTickerData | null> {
    try {
      // Fetch 24hr ticker from Binance public REST API
      const tickerRes = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`)
      if (!tickerRes.ok) throw new Error('Crypto API error')
      const ticker = await tickerRes.json()

      // Fetch 24-hour hourly sparkline
      let sparkline: number[] = []
      try {
        const klineRes = await fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1h&limit=24`)
        if (klineRes.ok) {
          const klines = await klineRes.json()
          sparkline = klines.map((k: Array<string | number>) => parseFloat(String(k[4])))
        }
      } catch {
        // Sparkline optional
      }

      const price = parseFloat(ticker.lastPrice)
      const change24h = parseFloat(ticker.priceChangePercent)
      const high24h = parseFloat(ticker.highPrice)
      const low24h = parseFloat(ticker.lowPrice)
      const volume24h = parseFloat(ticker.volume)

      const result: CryptoTickerData = { price, change24h, high24h, low24h, volume24h, sparkline }
      await storageService.set(`cached_crypto_${symbol}`, { ...result, timestamp: Date.now() })
      return result
    } catch {
      // Storage fallback
      const cached = await storageService.get<(CryptoTickerData & { timestamp: number }) | null>(`cached_crypto_${symbol}`, null)

      return cached
    }
  }

  async fetchBtcDetail() {
    const data = await this.getCryptoTicker('BTCUSDT')
    if (!data) return null
    return {
      ...data,
      lastUpdated: Date.now()
    }
  }

  async fetchPairs(pairIds: string[]): Promise<MarketPairData[]> {
    const now = Date.now()
    const needsFetch = pairIds.some(id => !cache[id] || now - cache[id].timestamp > CACHE_TTL_MS)

    let fiatRates: Record<string, number> | null = null
    let btcData: CryptoTickerData | null = null

    if (needsFetch) {
      const hasFiat = pairIds.some(id => !id.startsWith('BTC') && !id.startsWith('ETH') && !id.startsWith('SOL'))
      const hasBtc = pairIds.some(id => id.startsWith('BTC'))

      const [fiat, btc] = await Promise.all([
        hasFiat ? this.getFiatRates() : Promise.resolve(null),
        hasBtc ? this.getCryptoTicker('BTCUSDT') : Promise.resolve(null)
      ])
      fiatRates = fiat
      btcData = btc
    }

    const results: MarketPairData[] = []

    for (const pairId of pairIds) {
      // Check in-memory fresh cache first
      if (cache[pairId] && now - cache[pairId].timestamp <= CACHE_TTL_MS) {
        results.push(cache[pairId].data)
        continue
      }

      if (pairId === 'BTC-USD') {
        if (btcData) {
          const item: MarketPairData = {
            id: 'BTC-USD',
            base: 'BTC',
            quote: 'USD',
            name: 'Bitcoin / US Dollar',
            isCrypto: true,
            price: btcData.price,
            change24h: btcData.change24h,
            high24h: btcData.high24h,
            low24h: btcData.low24h,
            sparkline: btcData.sparkline,
            lastUpdated: now,
            status: 'live'
          }
          cache[pairId] = { data: item, timestamp: now }
          results.push(item)
          continue
        }
      }

      // Handle fiat pairs e.g. 'AED-MAD', 'USD-AED', 'EUR-USD', 'EUR-AED', 'USD-MAD'
      const parts = pairId.split('-')
      if (parts.length === 2 && fiatRates) {
        const base = parts[0]
        const quote = parts[1]

        const baseRate = base === 'USD' ? 1 : fiatRates[base]
        const quoteRate = quote === 'USD' ? 1 : fiatRates[quote]

        if (baseRate && quoteRate) {
          // Quote rate per 1 base currency
          const price = quoteRate / baseRate
          const item: MarketPairData = {
            id: pairId,
            base,
            quote,
            name: `${base} / ${quote}`,
            isCrypto: false,
            price,
            change24h: 0.05, // Fiat subtle movement
            lastUpdated: now,
            status: 'live'
          }
          cache[pairId] = { data: item, timestamp: now }
          results.push(item)
          continue
        }
      }

      // If data could not be retrieved, show explicit error item (never fake numbers!)
      results.push({
        id: pairId,
        base: parts[0] || pairId,
        quote: parts[1] || 'USD',
        name: pairId,
        isCrypto: pairId.includes('BTC') || pairId.includes('ETH'),
        price: 0,
        change24h: 0,
        lastUpdated: now,
        status: 'error'
      })
    }

    return results
  }
}

export const marketService: IMarketService = new MarketDataService()
