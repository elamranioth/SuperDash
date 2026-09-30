import { useState, useMemo, useEffect } from 'react'
import {
  ArrowLeftRight,
  Ruler,
  Scale,
  Thermometer,
  Square,
  Coins,
  HardDrive,
  Box,
  Gauge,
  Clock,
  Copy,
  Check,
  Plus,
  Trash2,
  Search,
  RotateCw,
  X
} from 'lucide-react'
import { sounds } from '@/utils/sound'
import { exchangeRateService, ISO_CURRENCIES } from '@/services/currency'
import { storageService } from '@/services/storage'
import GlassPanel from '@/components/LiquidGlass/GlassPanel'
import GlassButton from '@/components/LiquidGlass/GlassButton'
import AppHeader from '@/components/AppWindow/AppHeader'
import MobileBottomSheet from '@/components/Mobile/MobileBottomSheet'

type ConversionCategory =
  | 'currency'
  | 'length'
  | 'weight'
  | 'temperature'
  | 'area'
  | 'volume'
  | 'speed'
  | 'time'
  | 'storage'

interface UnitDef {
  id: string
  label: string
  rate: number // ratio to base unit
  symbol: string
}

const STANDARD_CATEGORIES: Array<{
  id: Exclude<ConversionCategory, 'currency'>
  label: string
  icon: typeof Ruler
  units: UnitDef[]
}> = [
  {
    id: 'length',
    label: 'Length',
    icon: Ruler,
    units: [
      { id: 'm', label: 'Meters', rate: 1, symbol: 'm' },
      { id: 'km', label: 'Kilometers', rate: 1000, symbol: 'km' },
      { id: 'cm', label: 'Centimeters', rate: 0.01, symbol: 'cm' },
      { id: 'mm', label: 'Millimeters', rate: 0.001, symbol: 'mm' },
      { id: 'mi', label: 'Miles', rate: 1609.344, symbol: 'mi' },
      { id: 'yd', label: 'Yards', rate: 0.9144, symbol: 'yd' },
      { id: 'ft', label: 'Feet', rate: 0.3048, symbol: 'ft' },
      { id: 'in', label: 'Inches', rate: 0.0254, symbol: 'in' }
    ]
  },
  {
    id: 'weight',
    label: 'Weight',
    icon: Scale,
    units: [
      { id: 'kg', label: 'Kilograms', rate: 1, symbol: 'kg' },
      { id: 'g', label: 'Grams', rate: 0.001, symbol: 'g' },
      { id: 'mg', label: 'Milligrams', rate: 0.000001, symbol: 'mg' },
      { id: 'lb', label: 'Pounds', rate: 0.45359237, symbol: 'lb' },
      { id: 'oz', label: 'Ounces', rate: 0.028349523, symbol: 'oz' },
      { id: 'ton', label: 'Metric Tons', rate: 1000, symbol: 't' }
    ]
  },
  {
    id: 'temperature',
    label: 'Temperature',
    icon: Thermometer,
    units: [
      { id: 'c', label: 'Celsius', rate: 1, symbol: '°C' },
      { id: 'f', label: 'Fahrenheit', rate: 1, symbol: '°F' },
      { id: 'k', label: 'Kelvin', rate: 1, symbol: 'K' }
    ]
  },
  {
    id: 'area',
    label: 'Area',
    icon: Square,
    units: [
      { id: 'sqm', label: 'Square Meters', rate: 1, symbol: 'm²' },
      { id: 'sqkm', label: 'Square Kilometers', rate: 1000000, symbol: 'km²' },
      { id: 'sqft', label: 'Square Feet', rate: 0.092903, symbol: 'ft²' },
      { id: 'acre', label: 'Acres', rate: 4046.86, symbol: 'ac' },
      { id: 'ha', label: 'Hectares', rate: 10000, symbol: 'ha' }
    ]
  },
  {
    id: 'storage',
    label: 'Digital Data',
    icon: HardDrive,
    units: [
      { id: 'b', label: 'Bytes', rate: 1, symbol: 'B' },
      { id: 'kb', label: 'Kilobytes', rate: 1024, symbol: 'KB' },
      { id: 'mb', label: 'Megabytes', rate: 1024 * 1024, symbol: 'MB' },
      { id: 'gb', label: 'Gigabytes', rate: 1024 * 1024 * 1024, symbol: 'GB' },
      { id: 'tb', label: 'Terabytes', rate: 1024 * 1024 * 1024 * 1024, symbol: 'TB' }
    ]
  },
  {
    id: 'volume',
    label: 'Volume',
    icon: Box,
    units: [
      { id: 'l', label: 'Liters', rate: 1, symbol: 'L' },
      { id: 'ml', label: 'Milliliters', rate: 0.001, symbol: 'mL' },
      { id: 'gal', label: 'US Gallons', rate: 3.78541, symbol: 'gal' },
      { id: 'qt', label: 'US Quarts', rate: 0.946353, symbol: 'qt' },
      { id: 'pt', label: 'US Pints', rate: 0.473176, symbol: 'pt' },
      { id: 'cup', label: 'US Cups', rate: 0.236588, symbol: 'cup' },
      { id: 'floz', label: 'Fluid Ounces', rate: 0.0295735, symbol: 'fl oz' },
      { id: 'm3', label: 'Cubic Meters', rate: 1000, symbol: 'm³' }
    ]
  },
  {
    id: 'speed',
    label: 'Speed',
    icon: Gauge,
    units: [
      { id: 'kph', label: 'Kilometers / hour', rate: 0.277778, symbol: 'km/h' },
      { id: 'mps', label: 'Meters / second', rate: 1, symbol: 'm/s' },
      { id: 'mph', label: 'Miles / hour', rate: 0.44704, symbol: 'mph' },
      { id: 'knot', label: 'Knots', rate: 0.514444, symbol: 'kn' }
    ]
  },
  {
    id: 'time',
    label: 'Time',
    icon: Clock,
    units: [
      { id: 's', label: 'Seconds', rate: 1, symbol: 's' },
      { id: 'ms', label: 'Milliseconds', rate: 0.001, symbol: 'ms' },
      { id: 'min', label: 'Minutes', rate: 60, symbol: 'min' },
      { id: 'hr', label: 'Hours', rate: 3600, symbol: 'hr' },
      { id: 'day', label: 'Days', rate: 86400, symbol: 'd' },
      { id: 'wk', label: 'Weeks', rate: 604800, symbol: 'wk' },
      { id: 'yr', label: 'Years', rate: 31536000, symbol: 'yr' }
    ]
  }
]

interface ConverterAppProps {
  initialFromCurrency?: string
  initialToCurrency?: string
}

export default function ConverterApp({
  initialFromCurrency = 'USD',
  initialToCurrency = 'AED'
}: ConverterAppProps) {
  const [activeCategory, setActiveCategory] = useState<ConversionCategory>('currency')

  // MULTI-CURRENCY STATE
  const [baseCurrency, setBaseCurrency] = useState<string>(initialFromCurrency)
  const [currencyAmount, setCurrencyAmount] = useState<string>('1000')
  const [selectedTargetCurrencies, setSelectedTargetCurrencies] = useState<string[]>([
    'AED',
    'EUR',
    'GBP',
    'MAD',
    'PHP',
    'SAR',
    'JPY',
    'CAD'
  ])
  const [rates, setRates] = useState<Record<string, number>>({})
  const [isLoadingRates, setIsLoadingRates] = useState(false)
  const [isAddCurrencyModalOpen, setIsAddCurrencyModalOpen] = useState(false)
  const [currencySearchQuery, setCurrencySearchQuery] = useState('')
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  // STANDARD UNITS STATE
  const [unitInputValue, setUnitInputValue] = useState<string>('1')
  const [fromUnitId, setFromUnitId] = useState<string>('m')
  const [toUnitId, setToUnitId] = useState<string>('ft')

  // Load user's selected currencies from storage
  useEffect(() => {
    storageService
      .get<string[]>('converter_currencies', ['AED', 'EUR', 'GBP', 'MAD', 'PHP', 'SAR', 'JPY', 'CAD'])
      .then(list => {
        if (initialToCurrency && !list.includes(initialToCurrency)) {
          setSelectedTargetCurrencies([initialToCurrency, ...list])
        } else {
          setSelectedTargetCurrencies(list)
        }
      })
  }, [initialToCurrency])

  // Fetch exchange rates when baseCurrency changes
  useEffect(() => {
    let isMounted = true
    setIsLoadingRates(true)
    exchangeRateService
      .getRates(baseCurrency)
      .then(fetchedRates => {
        if (isMounted) {
          setRates(fetchedRates)
          setIsLoadingRates(false)
        }
      })
      .catch(() => {
        if (isMounted) setIsLoadingRates(false)
      })
    return () => {
      isMounted = false
    }
  }, [baseCurrency])

  const saveTargetCurrencies = (updated: string[]) => {
    setSelectedTargetCurrencies(updated)
    storageService.set('converter_currencies', updated)
  }

  const handleAddCurrency = (code: string) => {
    sounds.playClick()
    if (!selectedTargetCurrencies.includes(code)) {
      const updated = [...selectedTargetCurrencies, code]
      saveTargetCurrencies(updated)
    }
    setIsAddCurrencyModalOpen(false)
  }

  const handleRemoveCurrency = (code: string) => {
    sounds.playClick()
    const updated = selectedTargetCurrencies.filter(c => c !== code)
    saveTargetCurrencies(updated)
  }

  const handleSetNewBase = (newBase: string) => {
    sounds.playClick()
    const oldBase = baseCurrency
    setBaseCurrency(newBase)
    if (!selectedTargetCurrencies.includes(oldBase)) {
      saveTargetCurrencies([oldBase, ...selectedTargetCurrencies.filter(c => c !== newBase)])
    }
  }

  const handleCopyCurrency = (code: string, value: string) => {
    sounds.playSuccess()
    navigator.clipboard?.writeText(value)?.catch(() => {})
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 1500)
  }

  // Format currency output with separators
  const formatCurrencyValue = (val: number, code: string) => {
    const isZeroDecimal = ['JPY', 'KRW'].includes(code)
    return val.toLocaleString(undefined, {
      minimumFractionDigits: isZeroDecimal ? 0 : 2,
      maximumFractionDigits: isZeroDecimal ? 0 : 2
    })
  }

  // Standard Unit calculations
  const standardCategoryDef = useMemo(() => {
    if (activeCategory === 'currency') return null
    return STANDARD_CATEGORIES.find(c => c.id === activeCategory)!
  }, [activeCategory])

  const convertedStandardValue = useMemo(() => {
    if (!standardCategoryDef) return '0'
    const val = parseFloat(unitInputValue)
    if (isNaN(val)) return '0'

    if (activeCategory === 'temperature') {
      let celsius = val
      if (fromUnitId === 'f') celsius = (val - 32) * (5 / 9)
      else if (fromUnitId === 'k') celsius = val - 273.15

      let target = celsius
      if (toUnitId === 'f') target = (celsius * 9) / 5 + 32
      else if (toUnitId === 'k') target = celsius + 273.15

      return parseFloat(target.toFixed(4)).toString()
    }

    const fromUnit = standardCategoryDef.units.find(u => u.id === fromUnitId)
    const toUnit = standardCategoryDef.units.find(u => u.id === toUnitId)
    if (!fromUnit || !toUnit) return '0'

    const inBase = val * fromUnit.rate
    const inTarget = inBase / toUnit.rate
    return parseFloat(inTarget.toFixed(6)).toString()
  }, [unitInputValue, fromUnitId, toUnitId, activeCategory, standardCategoryDef])

  // Filtered currency list for Add Currency modal
  const availableCurrenciesToAdd = useMemo(() => {
    const q = currencySearchQuery.toLowerCase().trim()
    return ISO_CURRENCIES.filter(c => {
      if (c.code === baseCurrency) return false
      if (!q) return true
      return c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q)
    })
  }, [currencySearchQuery, baseCurrency])

  const baseCurrencyMeta = ISO_CURRENCIES.find(c => c.code === baseCurrency) || ISO_CURRENCIES[0]
  const parsedAmount = parseFloat(currencyAmount) || 0

  return (
    <div className="flex h-full w-full bg-slate-950/90 text-white flex-col overflow-hidden select-none">
      {/* Standardized App Header */}
      <AppHeader
        icon={ArrowLeftRight}
        title="Converter"
        subtitle="Universal Multi-Currency & Precision Units Workspace"
        gradient="from-cyan-400 to-blue-600"
        primaryAction={
          activeCategory === 'currency'
            ? {
                label: 'Add Currency',
                icon: Plus,
                onClick: () => setIsAddCurrencyModalOpen(true)
              }
            : undefined
        }
      >
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <button
            onClick={() => {
              sounds.playClick()
              setActiveCategory('currency')
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition shrink-0 ${
              activeCategory === 'currency'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-white/5 hover:bg-white/10 text-slate-400'
            }`}
          >
            <Coins className="w-3.5 h-3.5" />
            <span>Currency</span>
          </button>

          {STANDARD_CATEGORIES.map(cat => {
            const Icon = cat.icon
            const isActive = activeCategory === cat.id
            return (
              <button
                key={cat.id}
                onClick={() => {
                  sounds.playClick()
                  setActiveCategory(cat.id)
                  setFromUnitId(cat.units[0].id)
                  setToUnitId(cat.units[1]?.id || cat.units[0].id)
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition shrink-0 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-white/5 hover:bg-white/10 text-slate-400'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            )
          })}
        </div>
      </AppHeader>

      {/* Main Content Area */}
      {activeCategory === 'currency' ? (
        /* MULTI-CURRENCY CONVERSION WORKSPACE */
        <div className="flex-1 p-3 sm:p-5 md:p-6 flex flex-col max-w-4xl mx-auto w-full overflow-hidden min-w-0">
          {/* Base Currency Input Header */}
          <div className="p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl liquid-glass mb-3 sm:mb-4 shrink-0 shadow-lg">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-semibold uppercase tracking-wider text-indigo-400">Base Currency</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    sounds.playClick()
                    exchangeRateService.getRates(baseCurrency).then(setRates)
                  }}
                  className="p-1 rounded text-slate-400 hover:text-white"
                  title="Refresh rates"
                >
                  <RotateCw className={`w-3.5 h-3.5 ${isLoadingRates ? 'animate-spin text-indigo-400' : ''}`} />
                </button>
                <span className="text-[11px] text-slate-500">Live FX</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-2xl">{baseCurrencyMeta.flag}</span>
                <select
                  value={baseCurrency}
                  onChange={e => {
                    sounds.playClick()
                    setBaseCurrency(e.target.value)
                  }}
                  className="bg-black/40 border border-white/15 rounded-xl px-3 py-1.5 text-sm font-bold text-white focus:outline-none"
                >
                  {ISO_CURRENCIES.map(c => (
                    <option key={c.code} value={c.code}>
                      {c.code} — {c.name} ({c.symbol})
                    </option>
                  ))}
                </select>
              </div>

              <div className="w-full sm:w-auto flex items-center justify-end">
                <input
                  type="number"
                  value={currencyAmount}
                  onChange={e => setCurrencyAmount(e.target.value)}
                  placeholder="1000"
                  className="text-3xl md:text-4xl font-mono font-light text-right bg-transparent border-none text-white focus:outline-none w-full sm:w-64 placeholder-slate-600"
                />
              </div>
            </div>
          </div>

          {/* Target Currencies Simultaneous Stack */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            <div className="flex items-center justify-between pb-1 text-xs text-slate-400 font-semibold uppercase tracking-wider">
              <span>Simultaneous Conversions ({selectedTargetCurrencies.length})</span>
              <button
                onClick={() => {
                  sounds.playClick()
                  setIsAddCurrencyModalOpen(true)
                }}
                className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium capitalize"
              >
                <Plus className="w-3.5 h-3.5" /> Add Currency
              </button>
            </div>

            {selectedTargetCurrencies.map(code => {
              const meta = ISO_CURRENCIES.find(c => c.code === code)
              const rate = rates[code] || 1
              const converted = parsedAmount * rate
              const formatted = formatCurrencyValue(converted, code)
              const isCopied = copiedCode === code

              return (
                <div
                  key={code}
                  className="p-3.5 rounded-2xl liquid-glass flex items-center justify-between gap-3 group transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{meta?.flag || '🌐'}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">{code}</span>
                        <span className="text-xs text-slate-400 hidden sm:inline">{meta?.name}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        1 {baseCurrency} = {rate.toFixed(4)} {code}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    <span className="text-lg sm:text-xl md:text-2xl font-mono font-medium text-emerald-400">
                      {formatted}
                    </span>

                    <div className="flex items-center gap-0.5 sm:gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition">
                      <button
                        onClick={() => handleSetNewBase(code)}
                        className="p-1 sm:p-1.5 rounded-lg text-slate-400 hover:text-indigo-300 hover:bg-white/5 active:bg-white/10"
                        title="Set as base currency"
                      >
                        <ArrowLeftRight className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleCopyCurrency(code, formatted)}
                        className="p-1 sm:p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 active:bg-white/10"
                        title="Copy value"
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => handleRemoveCurrency(code)}
                        className="p-1 sm:p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 active:bg-rose-500/20"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Desktop Add Currency Modal */}
          {isAddCurrencyModalOpen && (
            <div className="hidden md:flex fixed inset-0 z-50 bg-black/60 backdrop-blur-md items-center justify-center p-4">
              <div className="bg-slate-900 border border-white/15 rounded-3xl w-full max-w-md p-5 shadow-2xl animate-window-open max-h-[80vh] flex flex-col">
                <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
                  <span className="text-sm font-bold text-white">Add Target Currency</span>
                  <button
                    onClick={() => setIsAddCurrencyModalOpen(false)}
                    className="p-1 text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="relative mb-3">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search currency code or country..."
                    value={currencySearchQuery}
                    onChange={e => setCurrencySearchQuery(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none"
                    autoFocus
                  />
                </div>

                <div className="flex-1 overflow-y-auto space-y-1 pr-1">
                  {availableCurrenciesToAdd.map(c => {
                    const isAlreadyAdded = selectedTargetCurrencies.includes(c.code)
                    return (
                      <div
                        key={c.code}
                        onClick={() => !isAlreadyAdded && handleAddCurrency(c.code)}
                        className={`p-2.5 rounded-xl flex items-center justify-between text-xs transition cursor-pointer ${
                          isAlreadyAdded
                            ? 'opacity-40 bg-white/5 cursor-not-allowed'
                            : 'hover:bg-white/10 text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-xl">{c.flag}</span>
                          <div>
                            <span className="font-bold">{c.code}</span>
                            <span className="text-slate-400 ml-1.5">({c.name})</span>
                          </div>
                        </div>
                        {isAlreadyAdded ? (
                          <span className="text-[10px] text-slate-500">Added</span>
                        ) : (
                          <span className="text-indigo-400 font-semibold">+ Add</span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Mobile Add Currency Bottom Sheet */}
          <MobileBottomSheet
            isOpen={isAddCurrencyModalOpen}
            onClose={() => setIsAddCurrencyModalOpen(false)}
            title="Add Target Currency"
            className="md:hidden"
          >
            <div className="space-y-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search currency code or country..."
                  value={currencySearchQuery}
                  onChange={e => setCurrencySearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1 max-h-[50vh] overflow-y-auto pr-1">
                {availableCurrenciesToAdd.map(c => {
                  const isAlreadyAdded = selectedTargetCurrencies.includes(c.code)
                  return (
                    <div
                      key={c.code}
                      onClick={() => !isAlreadyAdded && handleAddCurrency(c.code)}
                      className={`p-2.5 rounded-xl flex items-center justify-between text-xs transition cursor-pointer ${
                        isAlreadyAdded
                          ? 'opacity-40 bg-white/5 cursor-not-allowed'
                          : 'active:bg-white/10 text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">{c.flag}</span>
                        <div>
                          <span className="font-bold">{c.code}</span>
                          <span className="text-slate-400 ml-1.5">({c.name})</span>
                        </div>
                      </div>
                      {isAlreadyAdded ? (
                        <span className="text-[10px] text-slate-500">Added</span>
                      ) : (
                        <span className="text-indigo-400 font-semibold">+ Add</span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </MobileBottomSheet>
        </div>
      ) : (
        /* STANDARD UNIT CONVERSION */
        <div className="flex-1 flex flex-col p-6 md:p-8 max-w-2xl mx-auto w-full justify-center space-y-6 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center relative">
            {/* From */}
            <div className="p-5 rounded-3xl liquid-glass space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>From</span>
                <select
                  value={fromUnitId}
                  onChange={e => setFromUnitId(e.target.value)}
                  className="bg-slate-800 border border-white/10 rounded-lg px-2 py-1 text-xs text-indigo-300 focus:outline-none"
                >
                  {standardCategoryDef?.units.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.label} ({u.symbol})
                    </option>
                  ))}
                </select>
              </div>

              <input
                type="number"
                value={unitInputValue}
                onChange={e => setUnitInputValue(e.target.value)}
                className="w-full text-3xl md:text-4xl font-mono font-light bg-transparent border-none text-white focus:outline-none"
              />
            </div>

            {/* To */}
            <div className="p-5 rounded-3xl liquid-glass-heavy space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="text-indigo-300">To</span>
                <select
                  value={toUnitId}
                  onChange={e => setToUnitId(e.target.value)}
                  className="bg-slate-800 border border-white/10 rounded-lg px-2 py-1 text-xs text-indigo-300 focus:outline-none"
                >
                  {standardCategoryDef?.units.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.label} ({u.symbol})
                    </option>
                  ))}
                </select>
              </div>

              <div className="text-3xl md:text-4xl font-mono font-light text-emerald-400">
                {convertedStandardValue}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
