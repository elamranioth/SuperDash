import { useState, useEffect } from 'react'
import {
  Globe,
  Plus,
  Trash2,
  Search,
  X,
  Sun,
  Sunrise,
  Sunset,
  Moon,
  Clock,
  LucideIcon
} from 'lucide-react'
import { storageService } from '@/services/storage'
import { sounds } from '@/utils/sound'
import AppHeader from '@/components/AppWindow/AppHeader'
import EmptyState from '@/components/LiquidGlass/EmptyState'
import MobileBottomSheet from '@/components/Mobile/MobileBottomSheet'

interface CityTimezone {
  city: string
  country: string
  timezone: string
  flag: string
}

const GLOBAL_CITIES: CityTimezone[] = [
  { city: 'Dubai', country: 'United Arab Emirates', timezone: 'Asia/Dubai', flag: '🇦🇪' },
  { city: 'Manila', country: 'Philippines', timezone: 'Asia/Manila', flag: '🇵🇭' },
  { city: 'London', country: 'United Kingdom', timezone: 'Europe/London', flag: '🇬🇧' },
  { city: 'New York', country: 'United States', timezone: 'America/New_York', flag: '🇺🇸' },
  { city: 'Tokyo', country: 'Japan', timezone: 'Asia/Tokyo', flag: '🇯🇵' },
  { city: 'Paris', country: 'France', timezone: 'Europe/Paris', flag: '🇫🇷' },
  { city: 'Singapore', country: 'Singapore', timezone: 'Asia/Singapore', flag: '🇸🇬' },
  { city: 'Sydney', country: 'Australia', timezone: 'Australia/Sydney', flag: '🇦🇺' },
  { city: 'Riyadh', country: 'Saudi Arabia', timezone: 'Asia/Riyadh', flag: '🇸🇦' },
  { city: 'Casablanca', country: 'Morocco', timezone: 'Africa/Casablanca', flag: '🇲🇦' },
  { city: 'Hong Kong', country: 'Hong Kong', timezone: 'Asia/Hong_Kong', flag: '🇭🇰' },
  { city: 'San Francisco', country: 'United States', timezone: 'America/Los_Angeles', flag: '🇺🇸' },
  { city: 'Berlin', country: 'Germany', timezone: 'Europe/Berlin', flag: '🇩🇪' },
  { city: 'Zurich', country: 'Switzerland', timezone: 'Europe/Zurich', flag: '🇨🇭' },
  { city: 'Seoul', country: 'South Korea', timezone: 'Asia/Seoul', flag: '🇰🇷' },
  { city: 'Toronto', country: 'Canada', timezone: 'America/Toronto', flag: '🇨🇦' }
]

function getGmtOffsetString(timezone: string): string {
  try {
    const d = new Date()
    const str = d.toLocaleDateString('en-US', { timeZone: timezone, timeZoneName: 'shortOffset' })
    const match = str.match(/GMT([+-]\d+(:?\d+)?)/)
    return match ? `${match[1]} GMT` : 'GMT'
  } catch {
    return 'GMT'
  }
}

function getTimeDifferenceHours(timezone: string): string {
  try {
    const now = new Date()
    const targetFormatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
    const localFormatter = new Intl.DateTimeFormat('en-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
    const targetStr = targetFormatter.format(now).replace(', ', 'T') + ':00'
    const localStr = localFormatter.format(now).replace(', ', 'T') + ':00'
    const targetMs = new Date(targetStr).getTime()
    const localMs = new Date(localStr).getTime()
    const diffHours = Math.round((targetMs - localMs) / (1000 * 60 * 60))
    if (diffHours === 0) return 'Local Time'
    return diffHours > 0 ? `+${diffHours}h` : `${diffHours}h`
  } catch {
    return ''
  }
}

function getDayNightPhase(timezone: string): {
  label: 'Night' | 'Morning' | 'Day' | 'Evening'
  icon: LucideIcon
  colorClass: string
} {
  try {
    const now = new Date()
    const hourStr = now.toLocaleTimeString('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      hour12: false
    })
    const hour = parseInt(hourStr, 10)
    if (hour >= 5 && hour < 12) {
      return {
        label: 'Morning',
        icon: Sunrise,
        colorClass: 'text-amber-300 bg-amber-500/10 border-amber-500/20'
      }
    }
    if (hour >= 12 && hour < 17) {
      return {
        label: 'Day',
        icon: Sun,
        colorClass: 'text-sky-300 bg-sky-500/10 border-sky-500/20'
      }
    }
    if (hour >= 17 && hour < 21) {
      return {
        label: 'Evening',
        icon: Sunset,
        colorClass: 'text-orange-300 bg-orange-500/10 border-orange-500/20'
      }
    }
    return {
      label: 'Night',
      icon: Moon,
      colorClass: 'text-indigo-300 bg-indigo-500/10 border-indigo-500/20'
    }
  } catch {
    return {
      label: 'Day',
      icon: Sun,
      colorClass: 'text-slate-300 bg-white/5 border-white/10'
    }
  }
}

export default function WorldClockApp() {
  const [activeCities, setActiveCities] = useState<CityTimezone[]>([
    GLOBAL_CITIES[0], // Dubai
    GLOBAL_CITIES[1], // Manila
    GLOBAL_CITIES[2], // London
    GLOBAL_CITIES[3], // New York
    GLOBAL_CITIES[4] // Tokyo
  ])
  const [time, setTime] = useState(new Date())
  const [is12h, setIs12h] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    storageService
      .get<string[]>('world_clock_city_names', ['Dubai', 'Manila', 'London', 'New York', 'Tokyo'])
      .then(savedNames => {
        const found = savedNames
          .map(name => GLOBAL_CITIES.find(c => c.city === name))
          .filter((c): c is CityTimezone => !!c)
        if (found.length > 0) setActiveCities(found)
      })
  }, [])

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const saveCities = (list: CityTimezone[]) => {
    setActiveCities(list)
    storageService.set(
      'world_clock_city_names',
      list.map(c => c.city)
    )
  }

  const handleAddCity = (cityObj: CityTimezone) => {
    sounds.playClick()
    if (!activeCities.some(c => c.city === cityObj.city)) {
      saveCities([...activeCities, cityObj])
    }
    setIsAddModalOpen(false)
  }

  const handleRemoveCity = (cityName: string) => {
    sounds.playClick()
    saveCities(activeCities.filter(c => c.city !== cityName))
  }

  const getTimeForZone = (timezone: string) => {
    try {
      return time.toLocaleTimeString([], {
        timeZone: timezone,
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: is12h
      })
    } catch {
      return '--:--'
    }
  }

  const getDateForZone = (timezone: string) => {
    try {
      return time.toLocaleDateString([], {
        timeZone: timezone,
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      })
    } catch {
      return ''
    }
  }

  const filteredAvailableCities = GLOBAL_CITIES.filter(
    c =>
      !activeCities.some(a => a.city === c.city) &&
      (c.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.country.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <div className="flex h-full w-full bg-slate-950/90 text-white flex-col overflow-hidden select-none">
      {/* Standardized App Header */}
      <AppHeader
        icon={Globe}
        title="World Clock"
        subtitle="Global Timezones & Regional Differences"
        gradient="from-teal-500 to-emerald-600"
        primaryAction={{
          label: 'Add City',
          icon: Plus,
          onClick: () => setIsAddModalOpen(true)
        }}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400">
            {activeCities.length} tracked {activeCities.length === 1 ? 'city' : 'cities'}
          </span>

          <div className="flex items-center bg-white/5 rounded-xl p-0.5 border border-white/10 text-xs">
            <button
              onClick={() => {
                sounds.playClick()
                setIs12h(true)
              }}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                is12h ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              12H
            </button>
            <button
              onClick={() => {
                sounds.playClick()
                setIs12h(false)
              }}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                !is12h ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              24H
            </button>
          </div>
        </div>
      </AppHeader>

      {/* Main City Rows Container */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 max-w-4xl mx-auto w-full">
        {activeCities.length === 0 ? (
          <EmptyState
            icon={Globe}
            title="No Clocks Added"
            description="Add cities from around the world to track simultaneous times, time zone differences, and day/night cycles."
            action={{
              label: 'Add Your First City',
              icon: Plus,
              onClick: () => setIsAddModalOpen(true)
            }}
          />
        ) : (
          <div className="space-y-2 sm:space-y-2.5">
            {activeCities.map(item => {
              const phase = getDayNightPhase(item.timezone)
              const PhaseIcon = phase.icon
              const offsetGmt = getGmtOffsetString(item.timezone)
              const deltaDiff = getTimeDifferenceHours(item.timezone)

              return (
                <div
                  key={item.city}
                  className="px-3.5 sm:px-5 py-3 sm:py-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-white/15 transition-all flex items-center justify-between group shadow-sm gap-2"
                >
                  {/* Left: City, Flag, Country */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="text-2xl select-none shrink-0">{item.flag}</span>
                    <div className="min-w-0">
                      <div className="text-sm sm:text-base font-bold text-white tracking-wide truncate">
                        {item.city.toUpperCase()}
                      </div>
                      <div className="text-[11px] sm:text-xs text-slate-400 truncate mt-0.5">
                        {item.country}
                      </div>
                    </div>
                  </div>

                  {/* Center: Day/Night Phase & Time Difference (Desktop) */}
                  <div className="hidden sm:flex items-center gap-3">
                    <div
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${phase.colorClass}`}
                    >
                      <PhaseIcon className="w-3.5 h-3.5" />
                      <span>{phase.label}</span>
                    </div>

                    <div className="text-xs text-slate-400 font-mono tracking-tight flex items-center gap-1.5">
                      <span>{offsetGmt}</span>
                      {deltaDiff && (
                        <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-indigo-300 font-semibold">
                          {deltaDiff}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right: Live Time & Remove Action */}
                  <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                    <div className="text-right">
                      <div className="text-lg sm:text-2xl font-mono font-light text-white tracking-tight">
                        {getTimeForZone(item.timezone)}
                      </div>
                      <div className="text-[10px] sm:text-[11px] text-slate-400 flex items-center justify-end gap-1.5 uppercase tracking-wider">
                        <span>{getDateForZone(item.timezone)}</span>
                        {deltaDiff && (
                          <span className="sm:hidden px-1.5 py-0.2 rounded bg-white/10 text-indigo-300 font-semibold font-mono text-[9px]">
                            {deltaDiff}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemoveCity(item.city)}
                      className="p-1.5 sm:p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 active:bg-rose-500/20 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all"
                      title={`Remove ${item.city}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Desktop Add City Modal */}
      {isAddModalOpen && (
        <div className="hidden md:flex fixed inset-0 z-50 bg-black/60 backdrop-blur-md items-center justify-center p-4">
          <div className="liquid-glass-heavy rounded-3xl p-5 md:p-6 w-full max-w-md shadow-2xl border border-white/20 animate-window-open">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-teal-400" />
                <span>Track World City</span>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search */}
            <div className="relative mb-3">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search city or country..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-sans"
                autoFocus
              />
            </div>

            {/* List */}
            <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1">
              {filteredAvailableCities.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-xs">
                  No cities found
                </div>
              ) : (
                filteredAvailableCities.map(c => (
                  <button
                    key={c.city}
                    onClick={() => handleAddCity(c)}
                    className="w-full p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/5 hover:border-white/15 flex items-center justify-between text-left transition group"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">{c.flag}</span>
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-teal-300">
                          {c.city}
                        </div>
                        <div className="text-[10px] text-slate-400">{c.country}</div>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono text-slate-500">
                      {getGmtOffsetString(c.timezone)}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Add City Bottom Sheet */}
      <MobileBottomSheet
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Track World City"
        className="md:hidden"
      >
        <div className="space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search city or country..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none"
            />
          </div>

          <div className="max-h-[50vh] overflow-y-auto space-y-1.5 pr-1">
            {filteredAvailableCities.length === 0 ? (
              <div className="text-center py-6 text-slate-500 text-xs">
                No cities found
              </div>
            ) : (
              filteredAvailableCities.map(c => (
                <button
                  key={c.city}
                  onClick={() => handleAddCity(c)}
                  className="w-full p-2.5 rounded-xl bg-white/[0.04] active:bg-white/10 border border-white/5 flex items-center justify-between text-left transition"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">{c.flag}</span>
                    <div>
                      <div className="text-xs font-bold text-white">
                        {c.city}
                      </div>
                      <div className="text-[10px] text-slate-400">{c.country}</div>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500">
                    {getGmtOffsetString(c.timezone)}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      </MobileBottomSheet>
    </div>
  )
}
