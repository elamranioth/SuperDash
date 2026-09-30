import { useState, useEffect, useMemo } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Trash2,
  Calendar as CalendarIcon,
  X,
  Scale,
  List,
  Grid
} from 'lucide-react'
import { CalendarEvent, Hearing } from '@/types'
import { storageService, INITIAL_CALENDAR_EVENTS } from '@/services/storage'
import { hearingRepository } from '@/services/hearings'
import { sounds } from '@/utils/sound'
import { formatExactDate, formatSmartDate, toLocalYYYYMMDD } from '@/utils/date'
import AppHeader from '@/components/AppWindow/AppHeader'
import EmptyState from '@/components/LiquidGlass/EmptyState'
import MobileBottomSheet from '@/components/Mobile/MobileBottomSheet'

type CalendarViewMode = 'month' | 'agenda'

const EVENT_COLORS = [
  { name: 'Indigo', hex: '#6366f1' },
  { name: 'Emerald', hex: '#10b981' },
  { name: 'Amber', hex: '#f59e0b' },
  { name: 'Rose', hex: '#f43f5e' },
  { name: 'Purple', hex: '#a855f7' },
  { name: 'Sky', hex: '#0ea5e9' }
]

interface CalendarAppProps {
  initialEventId?: string
}

export default function CalendarApp({ initialEventId }: CalendarAppProps = {}) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<CalendarViewMode>('month')
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [hearings, setHearings] = useState<Hearing[]>([])
  const [selectedDateStr, setSelectedDateStr] = useState<string>(
    toLocalYYYYMMDD()
  )
  const [quickEventTitle, setQuickEventTitle] = useState('')
  const [showQuickForm, setShowQuickForm] = useState(false)
  const [quickStartTime, setQuickStartTime] = useState('10:00')
  const [quickEndTime, setQuickEndTime] = useState('11:00')
  const [quickColor, setQuickColor] = useState('#6366f1')

  useEffect(() => {
    storageService.get<CalendarEvent[]>('calendar_events', INITIAL_CALENDAR_EVENTS).then(evts => {
      setEvents(evts)
      if (initialEventId) {
        const found = evts.find(e => e.id === initialEventId)
        if (found) {
          setSelectedDateStr(found.date)
          setCurrentDate(new Date(found.date))
          setViewMode('agenda')
        }
      }
    })
    hearingRepository.getAll().then(setHearings)
    const unsubscribe = hearingRepository.subscribe(setHearings)
    return () => unsubscribe()
  }, [initialEventId])

  const saveEvents = (updated: CalendarEvent[]) => {
    setEvents(updated)
    storageService.set('calendar_events', updated)
  }

  const prevMonth = () => {
    sounds.playClick()
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    sounds.playClick()
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const goToToday = () => {
    sounds.playClick()
    const today = new Date()
    setCurrentDate(today)
    setSelectedDateStr(toLocalYYYYMMDD(today))
  }

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const monthName = currentDate.toLocaleString('default', { month: 'long' })
  const todayStr = toLocalYYYYMMDD()

  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const daysInPrevMonth = new Date(year, month, 0).getDate()

    const days: Array<{
      dateStr: string
      dayNum: number
      isCurrentMonth: boolean
      isToday: boolean
    }> = []

    // Previous month padding
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i
      const prevDate = new Date(year, month - 1, d)
      const dateStr = toLocalYYYYMMDD(prevDate)
      days.push({
        dateStr,
        dayNum: d,
        isCurrentMonth: false,
        isToday: dateStr === todayStr
      })
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const mStr = String(month + 1).padStart(2, '0')
      const dStr = String(i).padStart(2, '0')
      const dateStr = `${year}-${mStr}-${dStr}`
      days.push({
        dateStr,
        dayNum: i,
        isCurrentMonth: true,
        isToday: dateStr === todayStr
      })
    }

    // Next month padding
    const remaining = 42 - days.length
    for (let i = 1; i <= remaining; i++) {
      const nextDate = new Date(year, month + 1, i)
      const dateStr = toLocalYYYYMMDD(nextDate)
      days.push({
        dateStr,
        dayNum: i,
        isCurrentMonth: false,
        isToday: dateStr === todayStr
      })
    }

    return days
  }, [year, month, todayStr])

  // Combined events and hearings
  const allEvents = useMemo(() => {
    const list: Array<{
      id: string
      title: string
      date: string
      startTime?: string
      endTime?: string
      color: string
      isHearing?: boolean
      court?: string
      caseNumber?: string
    }> = []

    events.forEach(e => {
      list.push({
        id: e.id,
        title: e.title,
        date: e.date,
        startTime: e.startTime,
        endTime: e.endTime,
        color: e.color
      })
    })

    hearings.forEach(h => {
      list.push({
        id: 'hearing-' + h.id,
        title: `Court: ${h.clientName} (${h.caseNumber})`,
        date: h.hearingDate,
        startTime: h.hearingTime,
        color: '#f59e0b',
        isHearing: true,
        court: h.court,
        caseNumber: h.caseNumber
      })
    })

    return list.sort((a, b) => {
      const cmp = a.date.localeCompare(b.date)
      if (cmp !== 0) return cmp
      return (a.startTime || '').localeCompare(b.startTime || '')
    })
  }, [events, hearings])

  const selectedDayItems = useMemo(() => {
    return allEvents.filter(e => e.date === selectedDateStr)
  }, [allEvents, selectedDateStr])

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!quickEventTitle.trim()) return

    sounds.playSuccess()
    const newEv: CalendarEvent = {
      id: 'event-' + Date.now(),
      title: quickEventTitle.trim(),
      date: selectedDateStr,
      startTime: quickStartTime,
      endTime: quickEndTime,
      color: quickColor,
      recurrence: 'none'
    }

    saveEvents([...events, newEv])
    setQuickEventTitle('')
    setShowQuickForm(false)
  }

  const deleteEvent = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    sounds.playClick()
    saveEvents(events.filter(ev => ev.id !== id))
  }

  // Agenda grouping
  const agendaDates = useMemo(() => {
    const datesMap = new Map<string, typeof allEvents>()
    allEvents
      .filter(item => item.date >= todayStr)
      .slice(0, 30)
      .forEach(item => {
        const existing = datesMap.get(item.date) || []
        datesMap.set(item.date, [...existing, item])
      })
    return Array.from(datesMap.entries())
  }, [allEvents, todayStr])

  return (
    <div className="flex h-full w-full bg-slate-950/90 text-white flex-col overflow-hidden select-none">
      {/* Standardized App Header */}
      <AppHeader
        icon={CalendarIcon}
        title="Calendar"
        subtitle={`${monthName} ${year}`}
        gradient="from-rose-500 to-red-600"
        primaryAction={{
          label: 'New Event',
          icon: Plus,
          onClick: () => {
            setShowQuickForm(true)
          }
        }}
      >
        <div className="flex items-center justify-between gap-3">
          {/* Navigation Controls */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={goToToday}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition ${
                selectedDateStr === todayStr
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300'
              }`}
            >
              Today
            </button>

            <button
              onClick={prevMonth}
              className="p-1 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300"
              title="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={nextMonth}
              className="p-1 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300"
              title="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* View Toggle */}
          <div className="flex items-center bg-white/5 rounded-xl p-0.5 border border-white/10 text-xs">
            <button
              onClick={() => {
                sounds.playClick()
                setViewMode('month')
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition ${
                viewMode === 'month'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Month</span>
            </button>
            <button
              onClick={() => {
                sounds.playClick()
                setViewMode('agenda')
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition ${
                viewMode === 'agenda'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Agenda</span>
            </button>
          </div>
        </div>
      </AppHeader>

      {/* Main Calendar Body */}
      {viewMode === 'month' ? (
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden divide-y md:divide-y-0 md:divide-x divide-white/10">
          {/* Month Matrix Grid */}
          <div className="flex-1 flex flex-col p-3 md:p-5 overflow-hidden">
            {/* Weekday Labels */}
            <div className="grid grid-cols-7 mb-2 text-center text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="py-1">
                  {day}
                </div>
              ))}
            </div>

            {/* Month Day Cells */}
            <div className="grid grid-cols-7 gap-1 md:gap-1.5 flex-1 auto-rows-fr">
              {calendarDays.map((day, idx) => {
                const isSelected = day.dateStr === selectedDateStr
                const dayItems = allEvents.filter(e => e.date === day.dateStr)

                return (
                  <button
                    key={idx}
                    onClick={() => {
                      sounds.playClick()
                      setSelectedDateStr(day.dateStr)
                    }}
                    className={`rounded-xl p-1.5 flex flex-col items-center justify-between transition-all relative group ${
                      isSelected
                        ? 'bg-white/15 ring-2 ring-rose-500 shadow-md'
                        : day.isToday
                        ? 'bg-rose-500/10 border border-rose-500/30'
                        : day.isCurrentMonth
                        ? 'bg-white/[0.02] hover:bg-white/[0.06] border border-white/5'
                        : 'bg-black/10 opacity-30 hover:opacity-60'
                    }`}
                  >
                    <span
                      className={`text-xs font-semibold ${
                        day.isToday
                          ? 'text-rose-400 font-bold'
                          : isSelected
                          ? 'text-white'
                          : day.isCurrentMonth
                          ? 'text-slate-200'
                          : 'text-slate-500'
                      }`}
                    >
                      {day.dayNum}
                    </span>

                    {/* Micro-pills / dots (no overflow blobs) */}
                    <div className="flex items-center gap-1 mt-auto pb-0.5 max-w-full overflow-hidden">
                      {dayItems.slice(0, 3).map((item, i) => (
                        <div
                          key={i}
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: item.color }}
                          title={item.title}
                        />
                      ))}
                      {dayItems.length > 3 && (
                        <span className="text-[9px] text-slate-400 font-mono">
                          +{dayItems.length - 3}
                        </span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Selected Day Agenda Drawer (Right Sidebar) */}
          <aside className="w-full md:w-80 flex flex-col bg-black/30 p-4 shrink-0 overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
              <div>
                <span className="text-xs font-bold text-white uppercase tracking-wider block">
                  {formatSmartDate(selectedDateStr)}
                </span>
                <span className="text-[11px] text-slate-400">
                  {selectedDayItems.length} {selectedDayItems.length === 1 ? 'event' : 'events'} scheduled
                </span>
              </div>

              <button
                onClick={() => setShowQuickForm(true)}
                className="p-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white transition"
                title="Add event on this date"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick Create Drawer (Desktop) */}
            {showQuickForm && (
              <form
                onSubmit={handleQuickAdd}
                className="hidden md:block mb-4 p-3 rounded-2xl bg-white/[0.04] border border-white/15 space-y-2 animate-window-open text-xs"
              >
                <input
                  type="text"
                  required
                  placeholder="Event title..."
                  value={quickEventTitle}
                  onChange={e => setQuickEventTitle(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                  autoFocus
                />

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Start:</label>
                    <input
                      type="time"
                      value={quickStartTime}
                      onChange={e => setQuickStartTime(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">End:</label>
                    <input
                      type="time"
                      value={quickEndTime}
                      onChange={e => setQuickEndTime(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1.5">
                    {EVENT_COLORS.map(c => (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => setQuickColor(c.hex)}
                        className={`w-3.5 h-3.5 rounded-full transition ${
                          quickColor === c.hex ? 'ring-2 ring-white scale-110' : ''
                        }`}
                        style={{ backgroundColor: c.hex }}
                      />
                    ))}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setShowQuickForm(false)}
                      className="px-2 py-1 rounded-lg text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-medium shadow-sm"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Quick Create Bottom Sheet (Mobile) */}
            <MobileBottomSheet
              isOpen={showQuickForm}
              onClose={() => setShowQuickForm(false)}
              title={`New Event • ${formatSmartDate(selectedDateStr)}`}
            >
              <form onSubmit={handleQuickAdd} className="space-y-3 pt-1 text-xs">
                <input
                  type="text"
                  required
                  placeholder="Event title..."
                  value={quickEventTitle}
                  onChange={e => setQuickEventTitle(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Start Time:</label>
                    <input
                      type="time"
                      value={quickStartTime}
                      onChange={e => setQuickStartTime(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">End Time:</label>
                    <input
                      type="time"
                      value={quickEndTime}
                      onChange={e => setQuickEndTime(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1.5">Color Tag:</label>
                  <div className="flex items-center gap-3">
                    {EVENT_COLORS.map(c => (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => setQuickColor(c.hex)}
                        className={`w-6 h-6 rounded-full transition ${
                          quickColor === c.hex ? 'ring-2 ring-white scale-110 shadow-md' : 'opacity-80'
                        }`}
                        style={{ backgroundColor: c.hex }}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowQuickForm(false)}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-sm"
                  >
                    Save Event
                  </button>
                </div>
              </form>
            </MobileBottomSheet>

            {/* Events on selected day */}
            <div className="space-y-2 flex-1">
              {selectedDayItems.length === 0 ? (
                <div className="text-center py-10 text-slate-500 text-xs">
                  No events on this date
                </div>
              ) : (
                selectedDayItems.map(item => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-start justify-between gap-2 group"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-xs font-semibold text-white truncate">
                          {item.title}
                        </span>
                      </div>

                      {item.startTime && (
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-1 font-mono">
                          <Clock className="w-3 h-3" />
                          <span>
                            {item.startTime}
                            {item.endTime ? ` - ${item.endTime}` : ''}
                          </span>
                        </div>
                      )}

                      {item.isHearing && (
                        <div className="mt-1 text-[10px] text-amber-400 flex items-center gap-1 font-mono">
                          <Scale className="w-3 h-3" />
                          <span>{item.court}</span>
                        </div>
                      )}
                    </div>

                    {!item.isHearing && (
                      <button
                        onClick={e => deleteEvent(item.id, e)}
                        className="p-1 rounded text-slate-400 hover:text-rose-400 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </aside>
        </div>
      ) : (
        /* Agenda View: Chronological list */
        <div className="flex-1 overflow-y-auto p-4 md:p-6 max-w-2xl mx-auto w-full">
          {agendaDates.length === 0 ? (
            <EmptyState
              icon={CalendarIcon}
              title="No Upcoming Events"
              description="Your schedule is completely clear for the coming days."
              action={{
                label: 'Add an Event',
                icon: Plus,
                onClick: () => {
                  setViewMode('month')
                  setShowQuickForm(true)
                }
              }}
            />
          ) : (
            <div className="space-y-6">
              {agendaDates.map(([dateKey, dayEvents]) => (
                <div key={dateKey} className="space-y-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-rose-400 px-1 border-b border-white/10 pb-1">
                    {formatSmartDate(dateKey)}
                  </div>

                  <div className="space-y-1.5">
                    {dayEvents.map(item => (
                      <div
                        key={item.id}
                        className="p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 flex items-center justify-between gap-3 transition"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: item.color }}
                          />
                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-white truncate">
                              {item.title}
                            </div>
                            {item.isHearing && (
                              <div className="text-[10px] text-amber-400 font-mono">
                                Court: {item.court}
                              </div>
                            )}
                          </div>
                        </div>

                        {item.startTime && (
                          <div className="text-xs font-mono text-slate-400 shrink-0 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{item.startTime}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
