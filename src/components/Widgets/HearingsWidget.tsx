import { useState, useEffect, useMemo } from 'react'
import { Scale, ExternalLink, Calendar, AlertCircle } from 'lucide-react'
import { Hearing } from '@/types'
import {
  hearingRepository,
  getTodayDateString,
  isActionRequired
} from '@/services/hearings'
import { sounds } from '@/utils/sound'
import { cn } from '@/utils/cn'
import { toLocalYYYYMMDD } from '@/utils/date'

interface HearingsWidgetProps {
  onOpenHearings?: (hearingId?: string) => void
}

export default function HearingsWidget({ onOpenHearings }: HearingsWidgetProps) {
  const [hearings, setHearings] = useState<Hearing[]>([])

  useEffect(() => {
    hearingRepository.getAll().then(setHearings)
    const unsubscribe = hearingRepository.subscribe(setHearings)
    return () => unsubscribe()
  }, [])

  const todayStr = getTodayDateString()
  const tomorrowStr = toLocalYYYYMMDD(new Date(Date.now() + 86400000))

  // Filter upcoming and today sessions
  const activeHearings = useMemo(() => {
    return hearings
      .filter(h => h.hearingDate >= todayStr && h.status !== 'Completed' && h.status !== 'Cancelled')
      .sort((a, b) => a.hearingDate.localeCompare(b.hearingDate) || (a.hearingTime || '').localeCompare(b.hearingTime || ''))
      .slice(0, 4)
  }, [hearings, todayStr])

  const actionRequiredCount = useMemo(() => {
    return hearings.filter(isActionRequired).length
  }, [hearings])

  const formatDateLabel = (dateStr: string) => {
    if (dateStr === todayStr) return 'Today'
    if (dateStr === tomorrowStr) return 'Tomorrow'
    const parts = dateStr.split('-')
    if (parts.length === 3) {
      const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]))
      return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
    }
    return dateStr
  }

  return (
    <div className="liquid-glass rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 flex flex-col justify-between shadow-xl w-full max-w-full h-full relative group select-none">
      <div className="glass-specular" />

      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-white/10 relative z-10">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
          <Scale className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="truncate">Upcoming Hearings</span>
        </div>

        <div className="flex items-center gap-1.5">
          {actionRequiredCount > 0 && (
            <span
              className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1"
              title={`${actionRequiredCount} passed hearing(s) need decision recorded`}
            >
              <AlertCircle className="w-2.5 h-2.5 text-rose-400" />
              {actionRequiredCount}
            </span>
          )}

          {onOpenHearings && (
            <button
              onClick={() => {
                sounds.playClick()
                onOpenHearings()
              }}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
              title="Open Hearings app"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Hearings List */}
      <div className="space-y-2 relative z-10 my-2 flex-1">
        {activeHearings.length === 0 ? (
          <div className="py-4 text-center text-xs text-slate-500 italic">
            No upcoming court hearings scheduled.
          </div>
        ) : (
          activeHearings.map(h => {
            const isToday = h.hearingDate === todayStr
            const label = formatDateLabel(h.hearingDate)

            return (
              <div
                key={h.id}
                onClick={() => {
                  sounds.playClick()
                  if (onOpenHearings) onOpenHearings(h.id)
                }}
                className={cn(
                  'p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-1',
                  isToday
                    ? 'bg-amber-500/10 border-amber-500/30 hover:border-amber-400/60'
                    : 'bg-white/[0.03] border-white/5 hover:border-white/20 hover:bg-white/[0.06]'
                )}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      'text-[10px] font-bold uppercase tracking-wider',
                      isToday ? 'text-amber-300' : 'text-slate-400'
                    )}
                  >
                    {label}
                  </span>
                  <div className="text-[11px] font-mono text-slate-300 font-medium">
                    {h.hearingTime || '10:00 AM'}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 min-w-0">
                  <span className="text-xs font-semibold text-white truncate min-w-0 flex-1">
                    {h.clientName}
                  </span>
                  <span className="text-[10px] font-mono text-amber-200/90 truncate shrink-0 max-w-[120px]">
                    {h.caseNumber}
                  </span>
                </div>

                {h.decision && (
                  <div className="text-[10px] text-slate-400 truncate italic">
                    Result: {h.decision}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Footer View All */}
      <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-slate-400 relative z-10">
        <span className="text-[11px]">
          {hearings.filter(h => h.hearingDate >= todayStr && h.status !== 'Completed').length} active session(s)
        </span>
        {onOpenHearings && (
          <button
            onClick={() => {
              sounds.playClick()
              onOpenHearings()
            }}
            className="text-[11px] text-amber-400 hover:text-amber-300 font-medium hover:underline flex items-center gap-1"
          >
            <span>View All</span>
            <span>&rarr;</span>
          </button>
        )}
      </div>
    </div>
  )
}
