import { useState, useEffect } from 'react'
import { Calendar as CalendarIcon, Clock, ExternalLink } from 'lucide-react'
import { CalendarEvent, Hearing } from '@/types'
import { storageService, INITIAL_CALENDAR_EVENTS } from '@/services/storage'
import { hearingRepository, getTodayDateString } from '@/services/hearings'
import { sounds } from '@/utils/sound'

interface CalendarWidgetProps {
  onOpenCalendar?: () => void
}

export default function CalendarWidget({ onOpenCalendar }: CalendarWidgetProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [hearings, setHearings] = useState<Hearing[]>([])

  useEffect(() => {
    storageService.get<CalendarEvent[]>('calendar_events', INITIAL_CALENDAR_EVENTS).then(setEvents)
    hearingRepository.getAll().then(setHearings)
    const unsub = hearingRepository.subscribe(setHearings)
    return () => unsub()
  }, [])

  const todayStr = getTodayDateString()
  const todayCourtEvents: CalendarEvent[] = hearings
    .filter(h => h.hearingDate === todayStr && h.status !== 'Cancelled')
    .map(h => ({
      id: `cal-h-${h.id}`,
      title: `Court: ${h.clientName} (${h.caseNumber})`,
      date: h.hearingDate,
      startTime: h.hearingTime || '10:00',
      color: '#f59e0b',
      allDay: false
    }))

  const todayEvents = [...events.filter(e => e.date === todayStr), ...todayCourtEvents]

  return (
    <div className="liquid-glass rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 flex flex-col justify-between shadow-xl w-full max-w-full h-full relative group select-none">
      <div className="glass-specular" />

      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-white/10 relative z-10">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
          <CalendarIcon className="w-3.5 h-3.5 text-rose-400 shrink-0" />
          <span className="truncate">Today's Agenda</span>
        </div>

        {onOpenCalendar && (
          <button
            onClick={() => {
              sounds.playClick()
              onOpenCalendar()
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
            title="Open full Calendar"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Events List */}
      <div className="space-y-1.5 relative z-10 my-2 flex-1">
        {todayEvents.length === 0 ? (
          <p className="text-xs text-slate-500 italic py-4 text-center">No events scheduled today.</p>
        ) : (
          todayEvents.slice(0, 3).map(e => (
            <div key={e.id} className="p-2 rounded-xl bg-white/[0.04] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 truncate">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: e.color }} />
                <span className="truncate font-medium text-slate-200">{e.title}</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono shrink-0 ml-2">{e.startTime}</span>
            </div>
          ))
        )}
      </div>

      <div className="pt-2 border-t border-white/10 text-[10px] text-slate-400 relative z-10 flex items-center justify-between">
        <span>{todayEvents.length} events scheduled</span>
        <span className="text-indigo-400 font-medium">Calendar</span>
      </div>
    </div>
  )
}
