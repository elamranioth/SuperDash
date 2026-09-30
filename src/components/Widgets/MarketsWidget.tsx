import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import {
  RotateCw,
  TrendingUp,
  TrendingDown,
  Plus,
  Trash2,
  SlidersHorizontal,
  X,
  ArrowRight,
  ExternalLink,
  Coins,
  MoreHorizontal
} from 'lucide-react'
import { MarketPairData } from '@/types'
import { marketService } from '@/services/market'
import { storageService } from '@/services/storage'
import { sounds } from '@/utils/sound'
import { cn } from '@/utils/cn'
import GlassModal from '@/components/LiquidGlass/GlassModal'

interface MarketsWidgetProps {
  onOpenConverter?: (from: string, to: string) => void
  onOpenApp?: (appId: string) => void
  compact?: boolean
  variant?: 'strip' | 'card'
}

const DEFAULT_PAIRS = ['BTC-USD', 'AED-MAD', 'USD-AED']

export default function MarketsWidget({
  onOpenConverter,
  onOpenApp,
  compact = false,
  variant = 'strip'
}: MarketsWidgetProps) {
  const [pairIds, setPairIds] = useState<string[]>(DEFAULT_PAIRS)
  const [data, setData] = useState<MarketPairData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [lastRefreshedTime, setLastRefreshedTime] = useState<number>(Date.now())
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const [selectedBtcDetail, setSelectedBtcDetail] = useState<{
    price: number
    change24h: number
    high24h: number
    low24h: number
    volume24h: number
    sparkline: number[]
    lastUpdated: number
  } | null>(null)
  const [isBtcModalOpen, setIsBtcModalOpen] = useState(false)

  // Load user customized market pairs from storage
  useEffect(() => {
    storageService.get<string[]>('dashboard_market_pairs', DEFAULT_PAIRS).then(saved => {
      setPairIds(saved)
    })
  }, [])

  // Close context menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false)
      }
    }
    if (isMenuOpen) {
      window.addEventListener('click', handleClickOutside)
    }
    return () => window.removeEventListener('click', handleClickOutside)
  }, [isMenuOpen])

  const fetchAllPairs = useCallback(async () => {
    setIsLoading(true)
    try {
      const results = await marketService.fetchPairs(pairIds)
      setData(results)
      setLastRefreshedTime(Date.now())
    } finally {
      setIsLoading(false)
    }
  }, [pairIds])

  useEffect(() => {
    fetchAllPairs()
    // Auto-refresh every 2 minutes
    const interval = setInterval(fetchAllPairs, 120000)
    return () => clearInterval(interval)
  }, [fetchAllPairs])

  const handleManualRefresh = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    sounds.playClick()
    fetchAllPairs()
  }

  const handlePairClick = (item: MarketPairData) => {
    sounds.playClick()
    if (item.isCrypto && item.base === 'BTC') {
      marketService.fetchBtcDetail().then(detail => {
        setSelectedBtcDetail(detail)
        setIsBtcModalOpen(true)
      })
    } else if (onOpenConverter) {
      onOpenConverter(item.base, item.quote)
    }
  }

  const handleAddCustomPair = (base: string, quote: string) => {
    const id = `${base}-${quote}`
    if (!pairIds.includes(id)) {
      const updated = [...pairIds, id]
      setPairIds(updated)
      storageService.set('dashboard_market_pairs', updated)
    }
  }

  const handleRemovePair = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    sounds.playClick()
    const updated = pairIds.filter(p => p !== id)
    setPairIds(updated)
    storageService.set('dashboard_market_pairs', updated)
  }

  const handleRestoreDefaults = () => {
    sounds.playClick()
    setPairIds(DEFAULT_PAIRS)
    storageService.set('dashboard_market_pairs', DEFAULT_PAIRS)
  }

  // Calculate elapsed time text
  const updatedText = useMemo(() => {
    const diffMins = Math.floor((Date.now() - lastRefreshedTime) / 60000)
    if (diffMins <= 0) return 'Updated just now'
    return `Updated ${diffMins}m ago`
  }, [lastRefreshedTime])

  // =========================================================================
  // 1. COMPACT LIQUID GLASS STRIP (Default Home composition)
  // Single, thin, horizontal Liquid Glass pill. No nested glass cards.
  // =========================================================================
  // =========================================================================
  // 1. COMPACT LIQUID GLASS STRIP (Default Home composition)
  // Mobile: Horizontal snap carousel with minimal header
  // Desktop: Sleek single horizontal pill
  // =========================================================================
  if (variant === 'strip') {
    return (
      <>
        {/* MOBILE LAYOUT (< sm): Dedicated compact horizontal carousel */}
        <div className="flex sm:hidden flex-col w-full max-w-full px-2 select-none mb-1">
          {/* Minimal Mobile Header */}
          <div className="flex items-center justify-between pb-1.5 px-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Markets
            </span>
            <div className="flex items-center gap-1.5" ref={menuRef}>
              <button
                type="button"
                onClick={handleManualRefresh}
                className="p-1 rounded-lg text-slate-400 hover:text-white active:bg-white/10 transition-colors"
                title={`Refresh (${updatedText})`}
              >
                <RotateCw
                  className={cn(
                    'w-3.5 h-3.5 transition-transform duration-500',
                    isLoading && 'animate-spin text-indigo-400'
                  )}
                />
              </button>
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation()
                  sounds.playClick()
                  setIsMenuOpen(!isMenuOpen)
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-white active:bg-white/10 transition-colors"
                title="Options"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>

              {/* Context Dropdown Menu */}
              {isMenuOpen && (
                <div
                  onClick={e => e.stopPropagation()}
                  className="absolute right-2 top-8 w-44 py-1 rounded-2xl liquid-glass-heavy border border-white/20 shadow-2xl z-50 text-xs animate-window-open"
                >
                  <button
                    onClick={() => {
                      setIsMenuOpen(false)
                      handleManualRefresh()
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-white/10 text-slate-200 flex items-center justify-between"
                  >
                    <span>Refresh Data</span>
                    <RotateCw className="w-3 h-3 text-slate-400" />
                  </button>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false)
                      sounds.playClick()
                      setIsCustomizeOpen(true)
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-white/10 text-slate-200 flex items-center justify-between"
                  >
                    <span>Edit Pairs</span>
                    <SlidersHorizontal className="w-3 h-3 text-slate-400" />
                  </button>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false)
                      handleRestoreDefaults()
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-white/10 text-slate-400 hover:text-slate-200 flex items-center justify-between"
                  >
                    <span>Restore Defaults</span>
                    <Trash2 className="w-3 h-3 text-slate-500" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Horizontally scrollable cards rail (ONLY this scrolls, never the page) */}
          <div className="flex items-center gap-2 overflow-x-auto snap-x snap-mandatory no-scrollbar w-full py-1">
            {data.map(item => {
              const isCrypto = item.isCrypto
              const isPositive = item.change24h >= 0
              const priceDisplay = isCrypto
                ? `$${item.price.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
                : item.price > 0
                ? item.price.toFixed(4)
                : '...'

              return (
                <div
                  key={item.id}
                  onClick={() => handlePairClick(item)}
                  className="w-[140px] shrink-0 snap-start liquid-glass rounded-2xl p-2.5 border border-white/10 active:scale-95 transition-transform flex flex-col justify-between cursor-pointer shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
                      {isCrypto && <span className="text-amber-400 text-xs">₿</span>}
                      {item.base}/{item.quote}
                    </span>
                    {isCrypto && item.price > 0 && (
                      <span
                        className={cn(
                          'text-[10px] font-mono font-bold',
                          isPositive ? 'text-emerald-400' : 'text-rose-400'
                        )}
                      >
                        {isPositive ? `+${item.change24h.toFixed(1)}%` : `${item.change24h.toFixed(1)}%`}
                      </span>
                    )}
                  </div>

                  <div className="font-mono font-bold text-sm text-white tracking-tight mt-1">
                    {priceDisplay}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* DESKTOP LAYOUT (>= sm): Sleek single horizontal pill */}
        <div className="hidden sm:flex flex-col items-center select-none">
          <div className="liquid-glass rounded-full px-5 py-2 border border-white/15 shadow-xl flex items-center justify-center gap-4 md:gap-5 relative backdrop-blur-xl transition-all duration-300 hover:border-white/25 max-w-full overflow-x-auto no-scrollbar">
            <div className="glass-specular rounded-full" />

            {/* Market Values */}
            {data.map((item, index) => {
              const isCrypto = item.isCrypto
              const isPositive = item.change24h >= 0
              const priceDisplay = isCrypto
                ? `$${item.price.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
                : item.price > 0
                ? item.price.toFixed(4)
                : '...'

              return (
                <div key={item.id} className="flex items-center gap-3 shrink-0">
                  {/* Pair Item */}
                  <div
                    onClick={() => handlePairClick(item)}
                    className="flex items-center gap-2 cursor-pointer group/item py-0.5 hover:opacity-90 transition-opacity"
                    title={isCrypto ? 'Click for Bitcoin 24h trend' : 'Click to open Currency Converter'}
                  >
                    {isCrypto ? (
                      <span className="text-amber-400 font-bold text-sm">₿</span>
                    ) : null}

                    <span className="text-xs font-semibold text-slate-300 group-hover/item:text-white transition-colors">
                      {item.base}/{item.quote}
                    </span>

                    <span className="text-sm font-mono font-bold text-white tracking-tight">
                      {priceDisplay}
                    </span>

                    {isCrypto && item.price > 0 && (
                      <span
                        className={cn(
                          'text-[11px] font-mono font-semibold',
                          isPositive ? 'text-emerald-400' : 'text-rose-400'
                        )}
                      >
                        {isPositive ? `+${item.change24h.toFixed(2)}%` : `${item.change24h.toFixed(2)}%`}
                      </span>
                    )}
                  </div>

                  {/* Subtle vertical separator between pairs */}
                  {index < data.length - 1 && (
                    <div className="h-3.5 w-px bg-white/15 shrink-0" />
                  )}
                </div>
              )
            })}

            {/* Separator before controls */}
            <div className="h-3.5 w-px bg-white/20 shrink-0" />

            {/* Controls: Refresh & More */}
            <div className="flex items-center gap-1 shrink-0 relative" ref={menuRef}>
              <button
                type="button"
                onClick={handleManualRefresh}
                className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                title={`Refresh rates (${updatedText})`}
              >
                <RotateCw
                  className={cn(
                    'w-3.5 h-3.5 transition-transform duration-500',
                    isLoading && 'animate-spin text-indigo-400'
                  )}
                />
              </button>

              <button
                type="button"
                onClick={e => {
                  e.stopPropagation()
                  sounds.playClick()
                  setIsMenuOpen(!isMenuOpen)
                }}
                className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                title="Market options"
              >
                <MoreHorizontal className="w-3.5 h-3.5" />
              </button>

              {/* Context Dropdown Menu */}
              {isMenuOpen && (
                <div
                  onClick={e => e.stopPropagation()}
                  className="absolute right-0 top-full mt-2 w-44 py-1 rounded-2xl liquid-glass-heavy border border-white/20 shadow-2xl z-50 text-xs animate-window-open"
                >
                  <button
                    onClick={() => {
                      setIsMenuOpen(false)
                      handleManualRefresh()
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-white/10 text-slate-200 flex items-center justify-between"
                  >
                    <span>Refresh Data</span>
                    <RotateCw className="w-3 h-3 text-slate-400" />
                  </button>

                  <button
                    onClick={() => {
                      setIsMenuOpen(false)
                      sounds.playClick()
                      setIsCustomizeOpen(true)
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-white/10 text-slate-200 flex items-center justify-between"
                  >
                    <span>Edit Pairs</span>
                    <SlidersHorizontal className="w-3 h-3 text-slate-400" />
                  </button>

                  <button
                    onClick={() => {
                      setIsMenuOpen(false)
                      handleRestoreDefaults()
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-white/10 text-slate-400 hover:text-slate-200 flex items-center justify-between"
                  >
                    <span>Restore Defaults</span>
                    <Trash2 className="w-3 h-3 text-slate-500" />
                  </button>

                  {onOpenApp && (
                    <button
                      onClick={() => {
                        setIsMenuOpen(false)
                        sounds.playClick()
                        onOpenApp('converter')
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-white/10 text-indigo-300 flex items-center justify-between border-t border-white/10"
                    >
                      <span>Open Converter</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Subtle timestamp underneath */}
          <div className="text-[10px] text-slate-400/80 font-mono tracking-wider text-center mt-1.5 opacity-60 hover:opacity-100 transition-opacity">
            {updatedText}
          </div>
        </div>

        {/* Bitcoin Detailed Modal */}
        {isBtcModalOpen && selectedBtcDetail && (
          <GlassModal
            isOpen={isBtcModalOpen}
            onClose={() => setIsBtcModalOpen(false)}
            title={
              <div className="flex items-center gap-2">
                <span className="text-xl">₿</span>
                <span>Bitcoin (BTC / USD) Spot Overview</span>
              </div>
            }
          >
            <div className="space-y-5">
              <div className="p-5 rounded-3xl bg-black/40 border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Live Spot Price</span>
                  <div className="text-4xl md:text-5xl font-mono font-bold text-white tracking-tight my-1">
                    ${selectedBtcDetail.price.toLocaleString()}
                  </div>
                  <span
                    className={cn(
                      'font-semibold font-mono text-xs px-2.5 py-0.5 rounded-full inline-block',
                      selectedBtcDetail.change24h >= 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                    )}
                  >
                    {selectedBtcDetail.change24h >= 0 ? '+' : ''}
                    {selectedBtcDetail.change24h.toFixed(2)}% (24h)
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs w-full md:w-auto">
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                    <span className="text-slate-400">24h High</span>
                    <div className="text-sm font-bold font-mono text-white mt-1">
                      ${selectedBtcDetail.high24h.toLocaleString()}
                    </div>
                  </div>
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                    <span className="text-slate-400">24h Low</span>
                    <div className="text-sm font-bold font-mono text-white mt-1">
                      ${selectedBtcDetail.low24h.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Sparkline chart */}
              {selectedBtcDetail.sparkline && selectedBtcDetail.sparkline.length > 0 && (
                <div className="p-4 rounded-3xl bg-black/30 border border-white/10">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 block">
                    24-Hour Price Trend
                  </span>
                  <div className="h-32 w-full">
                    <svg className="w-full h-full" viewBox="0 0 400 100" preserveAspectRatio="none">
                      {(() => {
                        const min = Math.min(...selectedBtcDetail.sparkline)
                        const max = Math.max(...selectedBtcDetail.sparkline)
                        const range = max - min || 1
                        const coords = selectedBtcDetail.sparkline.map((val, idx) => {
                          const x = (idx / (selectedBtcDetail.sparkline.length - 1)) * 400
                          const y = 90 - ((val - min) / range) * 80
                          return { x, y }
                        })
                        const points = coords.map(c => `${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ')
                        const areaPoints = `${points} 400,100 0,100`

                        return (
                          <>
                            <defs>
                              <linearGradient id="btcGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3" />
                                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                              </linearGradient>
                            </defs>
                            <polygon fill="url(#btcGrad)" points={areaPoints} />
                            <polyline fill="none" stroke="#f59e0b" strokeWidth="2.5" points={points} />
                          </>
                        )
                      })()}
                    </svg>
                  </div>
                </div>
              )}
            </div>
          </GlassModal>
        )}

        {/* Customize Market Pairs Modal */}
        {isCustomizeOpen && (
          <GlassModal
            isOpen={isCustomizeOpen}
            onClose={() => setIsCustomizeOpen(false)}
            title={
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
                <span>Customize Market Pairs</span>
              </div>
            }
          >
            <div className="space-y-4 text-xs">
              <p className="text-slate-400">
                Choose the currency pairs displayed in your compact market strip:
              </p>

              <div className="space-y-1.5">
                {pairIds.map(pair => (
                  <div
                    key={pair}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.04] border border-white/10"
                  >
                    <span className="font-semibold text-white font-mono">{pair}</span>
                    <button
                      onClick={e => handleRemovePair(pair, e)}
                      className="p-1 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 transition"
                      title="Remove pair"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleRestoreDefaults}
                  className="text-xs text-indigo-400 hover:underline"
                >
                  Restore Defaults
                </button>
                <button
                  type="button"
                  onClick={() => setIsCustomizeOpen(false)}
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 text-white font-semibold shadow-md"
                >
                  Done
                </button>
              </div>
            </div>
          </GlassModal>
        )}
      </>
    )
  }

  // =========================================================================
  // 2. GLASS CARD MODE (Fallback when placed inside Personal Widgets grid below)
  // =========================================================================
  return (
    <>
      <div
        className={cn(
          'liquid-glass flex flex-col justify-between shadow-xl group transition-all duration-300 relative select-none w-full max-w-full',
          compact
            ? 'rounded-2xl p-3 md:p-3.5'
            : 'rounded-2xl sm:rounded-3xl p-3.5 sm:p-5'
        )}
      >
        <div className="glass-specular" />

        {/* Top Header */}
        <div
          className={cn(
            'flex items-center justify-between border-b border-white/10 relative z-10',
            compact ? 'pb-1.5 mb-1.5' : 'pb-2 mb-2'
          )}
        >
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Markets</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsCustomizeOpen(true)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition opacity-0 group-hover:opacity-100"
              title="Customize Pairs"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleManualRefresh}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
              title="Refresh Market Rates"
            >
              <RotateCw className={cn('w-3.5 h-3.5', isLoading && 'animate-spin text-indigo-400')} />
            </button>
          </div>
        </div>

        {/* Pairs List */}
        <div className="space-y-1.5 relative z-10 my-auto">
          {data.map(item => {
            const isCrypto = item.isCrypto
            const isPositive = item.change24h >= 0

            return (
              <div
                key={item.id}
                onClick={() => handlePairClick(item)}
                className="flex items-center justify-between p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] cursor-pointer transition text-xs"
              >
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-white">{item.name}</span>
                  {isCrypto && (
                    <span
                      className={cn(
                        'text-[10px] font-mono font-semibold',
                        isPositive ? 'text-emerald-400' : 'text-rose-400'
                      )}
                    >
                      {isPositive ? '+' : ''}{item.change24h.toFixed(2)}%
                    </span>
                  )}
                </div>

                <div className="font-mono font-bold text-white text-xs">
                  {isCrypto
                    ? `$${item.price.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
                    : item.price.toFixed(4)}
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer info & timestamp */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400 relative z-10">
          <span>{updatedText}</span>
          <span className="text-indigo-400 hover:underline cursor-pointer" onClick={() => setIsCustomizeOpen(true)}>
            Edit Pairs
          </span>
        </div>
      </div>

      {/* Bitcoin Detailed Modal */}
      {isBtcModalOpen && selectedBtcDetail && (
        <GlassModal
          isOpen={isBtcModalOpen}
          onClose={() => setIsBtcModalOpen(false)}
          title={
            <div className="flex items-center gap-2">
              <span className="text-xl">₿</span>
              <span>Bitcoin (BTC / USD) Spot Overview</span>
            </div>
          }
        >
          <div className="space-y-5">
            <div className="p-5 rounded-3xl bg-black/40 border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Live Spot Price</span>
                <div className="text-4xl md:text-5xl font-mono font-bold text-white tracking-tight my-1">
                  ${selectedBtcDetail.price.toLocaleString()}
                </div>
                <span
                  className={cn(
                    'font-semibold font-mono text-xs px-2.5 py-0.5 rounded-full inline-block',
                    selectedBtcDetail.change24h >= 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                  )}
                >
                  {selectedBtcDetail.change24h >= 0 ? '+' : ''}
                  {selectedBtcDetail.change24h.toFixed(2)}% (24h)
                </span>
              </div>
            </div>
          </div>
        </GlassModal>
      )}
    </>
  )
}
