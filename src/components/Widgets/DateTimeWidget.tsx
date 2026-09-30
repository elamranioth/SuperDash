import { useState, useEffect } from 'react'
import { Calendar as CalendarIcon, Clock } from 'lucide-react'
import { sounds } from '@/utils/sound'
import { cn } from '@/utils/cn'

interface DateTimeWidgetProps {
  format?: '12h' | '24h'
  showSeconds?: boolean
  onClick?: () => void
  compact?: boolean
  variant?: 'background' | 'glass'
}

export default function DateTimeWidget({
  format = '12h',
  showSeconds = false,
  onClick,
  compact = false,
  variant = 'background'
}: DateTimeWidgetProps) {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Format time based on 12h/24h setting
  const timeString = time.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
    second: showSeconds ? '2-digit' : undefined,
    hour12: format === '12h'
  })

  // Format day and date
  const dayName = time.toLocaleDateString([], { weekday: 'long' }).toUpperCase()
  const dayNumber = time.getDate()
  const monthName = time.toLocaleDateString([], { month: 'long' }).toUpperCase()
  const yearNumber = time.getFullYear()
  const fullDate = `${dayNumber} ${monthName} ${yearNumber}`

  // 1. BACKGROUND MODE (Embedded directly into the desktop wallpaper - NO card, NO borders, NO rectangle)
  if (variant === 'background') {
    return (
      <div
        onClick={() => {
          sounds.playClick()
          if (onClick) onClick()
        }}
        className="flex flex-col items-center justify-center text-center cursor-pointer select-none group transition-all duration-300 py-1"
        title="Open Calendar & Schedule"
      >
        {/* Large Clean Time Display */}
        <div className="font-extralight tracking-tight font-mono text-white text-4xl sm:text-6xl md:text-7xl drop-shadow-[0_4px_16px_rgba(0,0,0,0.65)] group-hover:text-indigo-200 transition-colors">
          {timeString}
        </div>

        {/* Day Name */}
        <div className="text-[11px] sm:text-sm font-semibold tracking-[0.2em] sm:tracking-[0.25em] text-indigo-300/90 drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] mt-1.5 sm:mt-2">
          {dayName}
        </div>

        {/* Full Date */}
        <div className="text-[11px] sm:text-sm font-medium tracking-[0.1em] sm:tracking-[0.16em] text-slate-300/80 drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] mt-0.5">
          {fullDate}
        </div>
      </div>
    )
  }

  // 2. GLASS CARD MODE (Fallback when placed as an individual widget inside Personal Widgets)
  return (
    <div
      onClick={() => {
        sounds.playClick()
        if (onClick) onClick()
      }}
      className={cn(
        'glass-card hover:bg-white/10 transition-all duration-300 flex items-center justify-between cursor-pointer group shadow-lg w-full max-w-full',
        compact
          ? 'rounded-2xl p-3 md:p-3.5'
          : 'rounded-3xl p-3.5 sm:p-5'
      )}
      title="Click to view full calendar & agenda"
    >
      <div className="flex flex-col justify-between text-left min-w-0 pr-2">
        <div
          className={cn(
            'font-extralight tracking-tight font-mono text-white group-hover:text-indigo-300 transition flex items-baseline gap-1',
            compact ? 'text-lg sm:text-xl md:text-2xl' : 'text-xl sm:text-2xl md:text-3xl'
          )}
        >
          <span className="truncate">{timeString}</span>
        </div>

        <div className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-indigo-400 mt-0.5 truncate">
          {dayName}
        </div>

        <div className="text-[10px] sm:text-[11px] text-slate-400 font-medium truncate">
          {fullDate}
        </div>
      </div>

      <div
        className={cn(
          'rounded-2xl bg-white/5 border border-white/5 group-hover:scale-110 transition-transform shrink-0',
          compact ? 'p-1.5 sm:p-2' : 'p-2 sm:p-3'
        )}
      >
        <Clock className={cn('text-indigo-400', compact ? 'w-5 h-5 sm:w-6 sm:h-6' : 'w-6 h-6 sm:w-8 sm:h-8 md:w-9 md:h-9')} />
      </div>
    </div>
  )
}
