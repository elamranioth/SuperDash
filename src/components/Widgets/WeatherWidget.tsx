import { useState, useEffect } from 'react'
import {
  Sun,
  Cloud,
  CloudSun,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudFog,
  ArrowUp,
  ArrowDown
} from 'lucide-react'
import { WeatherData } from '@/types'
import { weatherService } from '@/services/weather'
import { sounds } from '@/utils/sound'

interface WeatherWidgetProps {
  location?: string
  unit?: 'celsius' | 'fahrenheit'
  onClick?: () => void
}

function getWeatherIcon(iconName: string, className = 'w-7 h-7') {
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

export default function WeatherWidget({
  location = 'San Francisco',
  unit = 'celsius',
  onClick
}: WeatherWidgetProps) {
  const [data, setData] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    weatherService.fetchWeather(location).then(res => {
      if (isMounted) {
        setData(res)
        setLoading(false)
      }
    })
    return () => {
      isMounted = false
    }
  }, [location])

  const formatTemp = (celsius: number) => {
    if (unit === 'fahrenheit') {
      return `${Math.round((celsius * 9) / 5 + 32)}°`
    }
    return `${celsius}°`
  }

  return (
    <div
      onClick={() => {
        sounds.playClick()
        if (onClick) onClick()
      }}
      className="glass-card hover:bg-white/10 transition-all duration-300 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 flex items-center justify-between cursor-pointer group shadow-lg w-full max-w-full"
      title="Click to view detailed weather forecast"
    >
      {loading || !data ? (
        <div className="flex items-center gap-3 w-full animate-pulse">
          <div className="w-10 h-10 rounded-2xl bg-white/10" />
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-white/10 rounded w-24" />
            <div className="h-3 bg-white/10 rounded w-16" />
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-col justify-between">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 group-hover:text-indigo-300 transition truncate max-w-[140px]">
              {data.city}
            </div>

            <div className="flex items-baseline gap-1 my-1">
              <span className="text-3xl md:text-4xl font-extralight tracking-tight font-mono text-white">
                {formatTemp(data.temperature)}
              </span>
              <span className="text-xs text-slate-400 font-medium ml-1">
                {data.condition}
              </span>
            </div>

            <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
              <span className="flex items-center gap-0.5 text-rose-300">
                <ArrowUp className="w-3 h-3" />
                {formatTemp(data.highTemp)}
              </span>
              <span className="flex items-center gap-0.5 text-sky-300">
                <ArrowDown className="w-3 h-3" />
                {formatTemp(data.lowTemp)}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white/5 border border-white/5 group-hover:scale-110 transition-transform">
            {getWeatherIcon(data.icon, 'w-8 h-8 md:w-9 md:h-9')}
          </div>
        </>
      )}
    </div>
  )
}
