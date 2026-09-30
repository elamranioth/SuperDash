import { useState, useEffect, useMemo } from 'react'
import {
  Sun,
  Cloud,
  CloudSun,
  CloudRain,
  CloudSnow,
  CloudFog,
  CloudLightning,
  Wind,
  Droplets,
  Gauge,
  Eye,
  Search,
  MapPin,
  RefreshCw,
  Compass,
  Sunrise,
  Sunset
} from 'lucide-react'
import { WeatherData } from '@/types'
import { weatherService } from '@/services/weather'
import { storageService } from '@/services/storage'
import { sounds } from '@/utils/sound'
import AppHeader from '@/components/AppWindow/AppHeader'

function getWeatherIcon(iconName: string, className = 'w-6 h-6') {
  switch (iconName) {
    case 'Sun':
      return <Sun className={`${className} text-amber-400`} />
    case 'CloudSun':
      return <CloudSun className={`${className} text-amber-300`} />
    case 'Cloud':
      return <Cloud className={`${className} text-slate-300`} />
    case 'CloudRain':
    case 'CloudDrizzle':
      return <CloudRain className={`${className} text-sky-400`} />
    case 'CloudSnow':
      return <CloudSnow className={`${className} text-indigo-200`} />
    case 'CloudLightning':
      return <CloudLightning className={`${className} text-yellow-300`} />
    case 'CloudFog':
      return <CloudFog className={`${className} text-slate-400`} />
    default:
      return <CloudSun className={`${className} text-amber-300`} />
  }
}

export default function WeatherApp() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<
    Array<{ name: string; country: string; admin1?: string; lat: number; lon: number }>
  >([])
  const [isSearching, setIsSearching] = useState(false)
  const [unit, setUnit] = useState<'C' | 'F'>('C')

  const fetchCityWeather = async (cityName: string, lat?: number, lon?: number) => {
    setLoading(true)
    try {
      const data = await weatherService.fetchWeather(cityName, lat, lon)
      setWeather(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    Promise.all([
      storageService.get<{ fullName: string; lat?: number; lon?: number }>('weather_saved_city', {
        fullName: 'Dubai, United Arab Emirates',
        lat: 25.2048,
        lon: 55.2708
      }),
      storageService.get<'C' | 'F'>('weather_unit', 'C')
    ]).then(([savedCity, savedUnit]) => {
      setUnit(savedUnit)
      fetchCityWeather(savedCity.fullName, savedCity.lat, savedCity.lon)
    })
  }, [])

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    setIsSearching(true)
    sounds.playClick()
    const results = await weatherService.searchCities(searchQuery)
    setSearchResults(results)
    setIsSearching(false)
  }

  const selectCity = (city: {
    name: string
    country: string
    admin1?: string
    lat: number
    lon: number
  }) => {
    sounds.playClick()
    const fullName = city.admin1
      ? `${city.name}, ${city.admin1}`
      : `${city.name}, ${city.country}`
    fetchCityWeather(fullName, city.lat, city.lon)
    storageService.set('weather_saved_city', { fullName, lat: city.lat, lon: city.lon })
    setSearchResults([])
    setSearchQuery('')
  }

  const formatTemp = (celsius: number) => {
    if (unit === 'F') {
      return `${Math.round((celsius * 9) / 5 + 32)}°`
    }
    return `${celsius}°`
  }

  const atmosphericBackground = useMemo(() => {
    if (!weather) return 'bg-slate-950/90'
    const cond = weather.condition.toLowerCase()
    if (cond.includes('rain') || cond.includes('drizzle')) {
      return 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-950/80 via-slate-950 to-black'
    }
    if (cond.includes('sun') || cond.includes('clear')) {
      return 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-950/40 via-indigo-950/50 to-slate-950'
    }
    if (cond.includes('cloud')) {
      return 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900/80 via-indigo-950/40 to-slate-950'
    }
    return 'bg-slate-950/90'
  }, [weather])

  const popularCities = [
    { name: 'Manila', lat: 14.5995, lon: 120.9842 },
    { name: 'Dubai', lat: 25.2048, lon: 55.2708 },
    { name: 'London', lat: 51.5074, lon: -0.1278 },
    { name: 'Tokyo', lat: 35.6762, lon: 139.6503 },
    { name: 'New York', lat: 40.7128, lon: -74.006 }
  ]

  return (
    <div
      className={`flex h-full w-full ${atmosphericBackground} text-white flex-col overflow-hidden select-none transition-colors duration-700`}
    >
      {/* Standardized App Header */}
      <AppHeader
        icon={CloudSun}
        title="Weather"
        subtitle={weather ? `${weather.city} Forecast` : 'Live Atmosphere'}
        gradient="from-sky-400 to-blue-600"
      >
        <div className="flex items-center justify-between gap-2 w-full">
          {/* City Search */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-0 max-w-sm">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search world city..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 sm:pl-9 pr-7 sm:pr-16 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 font-sans"
            />
            {isSearching && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-sky-400 animate-pulse">
                ...
              </span>
            )}

            {/* Dropdown Results */}
            {searchResults.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-slate-900 border border-white/15 rounded-xl shadow-2xl z-[50] max-h-60 overflow-y-auto divide-y divide-white/5">
                {searchResults.map((c, idx) => (
                  <div
                    key={idx}
                    onClick={() => selectCity(c)}
                    className="px-3.5 py-2 hover:bg-white/10 cursor-pointer flex items-center justify-between text-xs text-slate-300 transition"
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-sky-400" />
                      <span className="font-semibold text-white">{c.name}</span>
                      <span className="text-slate-400">
                        ({c.admin1 ? `${c.admin1}, ` : ''}
                        {c.country})
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </form>

          {/* Quick city pills + Temp Unit Toggle */}
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="hidden sm:flex items-center gap-1">
              {popularCities.map(c => (
                <button
                  key={c.name}
                  onClick={() => {
                    sounds.playClick()
                    fetchCityWeather(c.name, c.lat, c.lon)
                    storageService.set('weather_saved_city', { fullName: c.name, lat: c.lat, lon: c.lon })
                  }}
                  className={`text-[11px] px-2.5 py-1 rounded-lg transition ${
                    weather?.city.startsWith(c.name)
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                      : 'bg-white/5 hover:bg-white/10 text-slate-400'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>

            <div className="flex items-center bg-white/5 rounded-xl p-0.5 border border-white/10 text-xs">
              <button
                onClick={() => {
                  setUnit('C')
                  storageService.set('weather_unit', 'C')
                  sounds.playClick()
                }}
                className={`px-2 sm:px-2.5 py-1 rounded-lg font-medium transition text-xs ${
                  unit === 'C' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                °C
              </button>
              <button
                onClick={() => {
                  setUnit('F')
                  storageService.set('weather_unit', 'F')
                  sounds.playClick()
                }}
                className={`px-2 sm:px-2.5 py-1 rounded-lg font-medium transition text-xs ${
                  unit === 'F' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                °F
              </button>
            </div>

            <button
              onClick={() => weather && fetchCityWeather(weather.city)}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition"
              title="Refresh"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-sky-400' : ''}`} />
            </button>
          </div>
        </div>
      </AppHeader>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 max-w-4xl mx-auto w-full space-y-6">
        {weather && (
          <>
            {/* DOMINANT ATMOSPHERIC HERO */}
            <div className="flex flex-col items-center justify-center text-center pt-2 pb-4">
              <h2 className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-slate-400 mb-1">
                {weather.city}
              </h2>

              <div className="text-5xl sm:text-7xl md:text-8xl font-extralight font-mono tracking-tighter text-white drop-shadow-md my-1">
                {formatTemp(weather.temperature)}
              </div>

              <div className="flex items-center gap-2 text-base md:text-lg font-medium text-slate-200">
                {getWeatherIcon(weather.icon, 'w-5 h-5')}
                <span>{weather.condition}</span>
              </div>

              <div className="text-xs text-slate-400 mt-1 font-mono">
                Feels like {formatTemp(weather.feelsLike)} • H: {formatTemp(weather.highTemp)} L:{' '}
                {formatTemp(weather.lowTemp)}
              </div>
            </div>

            {/* HOURLY FORECAST HORIZONTAL STRIP */}
            {weather.hourlyForecast && weather.hourlyForecast.length > 0 && (
              <div className="p-4 rounded-3xl bg-black/25 border border-white/10 backdrop-blur-md">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-3 block">
                  Hourly Conditions
                </span>

                <div className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-1">
                  {weather.hourlyForecast.map((hour, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col items-center min-w-[58px] py-1.5 px-1 rounded-xl bg-white/[0.02] border border-white/5 text-center shrink-0"
                    >
                      <span className="text-[11px] text-slate-400 font-mono mb-1.5">
                        {hour.time}
                      </span>
                      <div className="my-1">{getWeatherIcon(hour.icon, 'w-5 h-5')}</div>
                      <span className="text-xs font-semibold text-white font-mono mt-1">
                        {formatTemp(hour.temp)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 7-DAY FORECAST & SECONDARY ATMOSPHERE DETAILS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 7-Day Forecast */}
              <div className="p-4 rounded-3xl bg-black/25 border border-white/10 backdrop-blur-md">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-3 block">
                  7-Day Outlook
                </span>

                <div className="space-y-2">
                  {weather.dailyForecast.map((day, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-xs py-1 border-b border-white/5 last:border-none"
                    >
                      <span className="w-14 font-medium text-slate-300">{day.day}</span>
                      <div className="flex items-center gap-1.5">
                        {getWeatherIcon(day.icon, 'w-4 h-4')}
                        <span className="text-[11px] text-slate-400 w-24 truncate hidden sm:inline">
                          {day.condition}
                        </span>
                      </div>
                      <div className="text-right font-mono text-[11px]">
                        <span className="text-slate-400">{formatTemp(day.tempMin)}</span>
                        <span className="mx-1.5 text-slate-600">/</span>
                        <span className="text-white font-semibold">
                          {formatTemp(day.tempMax)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Atmospheric Details Grid */}
              <div className="p-4 rounded-3xl bg-black/25 border border-white/10 backdrop-blur-md flex flex-col justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-3 block">
                  Atmospheric Metrics
                </span>

                <div className="grid grid-cols-2 gap-3 flex-1">
                  <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5">
                    <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                      <Droplets className="w-3.5 h-3.5 text-sky-400" />
                      <span>Humidity</span>
                    </div>
                    <div className="text-xl font-bold font-mono text-white">
                      {weather.humidity}%
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5">
                    <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                      <Wind className="w-3.5 h-3.5 text-teal-400" />
                      <span>Wind</span>
                    </div>
                    <div className="text-xl font-bold font-mono text-white">
                      {weather.windSpeed} km/h
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5">
                    <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                      <Sun className="w-3.5 h-3.5 text-amber-400" />
                      <span>UV Index</span>
                    </div>
                    <div className="text-xl font-bold font-mono text-white">
                      {weather.uvIndex} of 10
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5">
                    <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                      <Gauge className="w-3.5 h-3.5 text-purple-400" />
                      <span>Pressure</span>
                    </div>
                    <div className="text-xl font-bold font-mono text-white">
                      {weather.pressure} hPa
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
