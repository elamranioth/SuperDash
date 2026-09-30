import { useState, useEffect } from 'react'
import { Globe, ExternalLink } from 'lucide-react'
import { sounds } from '@/utils/sound'

interface WorldClockWidgetProps {
  onOpenApp?: () => void
}

const DEFAULT_WIDGET_CITIES = [
  { city: 'Dubai', timezone: 'Asia/Dubai', flag: '🇦🇪' },
  { city: 'Manila', timezone: 'Asia/Manila', flag: '🇵🇭' },
  { city: 'London', timezone: 'Europe/London', flag: '🇬🇧' },
  { city: 'New York', timezone: 'America/New_York', flag: '🇺🇸' }
]

export default function WorldClockWidget({ onOpenApp }: WorldClockWidgetProps) {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="liquid-glass rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 flex flex-col justify-between shadow-xl w-full max-w-full h-full relative group select-none">
      <div className="glass-specular" />

      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-white/10 relative z-10">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
          <Globe className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <span className="truncate">World Clocks</span>
        </div>

        {onOpenApp && (
          <button
            onClick={() => {
              sounds.playClick()
              onOpenApp()
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
            title="Open World Clock"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Cities List */}
      <div className="space-y-1.5 relative z-10 my-2 flex-1">
        {DEFAULT_WIDGET_CITIES.map(c => {
          const formatted = time.toLocaleTimeString([], {
            timeZone: c.timezone,
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          })

          return (
            <div
              key={c.city}
              className="flex items-center justify-between text-xs py-1 px-2 rounded-xl bg-white/[0.03]"
            >
              <div className="flex items-center gap-2">
                <span>{c.flag}</span>
                <span className="font-semibold text-slate-200">{c.city}</span>
              </div>
              <span className="font-mono text-white font-medium">{formatted}</span>
            </div>
          )
        })}
      </div>

      <div className="pt-2 border-t border-white/10 text-[10px] text-slate-400 relative z-10">
        <span>Global Standard Time</span>
      </div>
    </div>
  )
}
