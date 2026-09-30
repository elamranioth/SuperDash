import { useState, useEffect, useMemo, useRef } from 'react'
import {
  Bell,
  Plus,
  CheckCircle2,
  Circle,
  Trash2,
  Calendar,
  Clock,
  Repeat,
  AlertCircle,
  X,
  ChevronDown
} from 'lucide-react'
import { ReminderItem, TaskPriority } from '@/types'
import { storageService, INITIAL_REMINDERS } from '@/services/storage'
import { sounds } from '@/utils/sound'
import { formatSmartDate, formatExactDate, toLocalYYYYMMDD } from '@/utils/date'
import AppHeader from '@/components/AppWindow/AppHeader'
import EmptyState from '@/components/LiquidGlass/EmptyState'
import MobileBottomSheet from '@/components/Mobile/MobileBottomSheet'

type ReminderSection = 'today' | 'scheduled' | 'completed'

export default function RemindersApp() {
  const [reminders, setReminders] = useState<ReminderItem[]>([])
  const [activeSection, setActiveSection] = useState<ReminderSection>('today')

  // Quick Add State
  const [isAdding, setIsAdding] = useState(false)
  const [quickTitle, setQuickTitle] = useState('')
  const [quickDate, setQuickDate] = useState(toLocalYYYYMMDD())
  const [quickTime, setQuickTime] = useState('16:00')
  const [quickNotes, setQuickNotes] = useState('')
  const [quickRepeat, setQuickRepeat] = useState<'none' | 'daily' | 'weekly' | 'monthly'>('none')
  const [quickPriority, setQuickPriority] = useState<TaskPriority>('medium')
  const titleInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    storageService.get<ReminderItem[]>('reminders_list', INITIAL_REMINDERS).then(setReminders)
  }, [])

  const saveReminders = (list: ReminderItem[]) => {
    setReminders(list)
    storageService.set('reminders_list', list)
  }

  const handleToggleComplete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    sounds.playClick()
    const updated = reminders.map(r => (r.id === id ? { ...r, completed: !r.completed } : r))
    saveReminders(updated)
  }

  const handleAddReminder = (e: React.FormEvent) => {
    e.preventDefault()
    if (!quickTitle.trim()) return

    sounds.playSuccess()
    const newRem: ReminderItem = {
      id: 'rem-' + Date.now(),
      title: quickTitle.trim(),
      date: quickDate,
      time: quickTime,
      notes: quickNotes.trim(),
      repeat: quickRepeat,
      completed: false,
      priority: quickPriority,
      createdAt: Date.now()
    }

    saveReminders([newRem, ...reminders])
    setQuickTitle('')
    setQuickNotes('')
    setIsAdding(false)
  }

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    sounds.playClick()
    saveReminders(reminders.filter(r => r.id !== id))
  }

  const todayStr = toLocalYYYYMMDD()

  // Filter lists according to sections
  const filteredReminders = useMemo(() => {
    return reminders.filter(r => {
      if (activeSection === 'completed') return r.completed
      if (r.completed) return false

      if (activeSection === 'today') {
        return !r.date || r.date <= todayStr
      }
      if (activeSection === 'scheduled') {
        return r.date && r.date > todayStr
      }
      return true
    })
  }, [reminders, activeSection, todayStr])

  const todayCount = useMemo(
    () => reminders.filter(r => !r.completed && (!r.date || r.date <= todayStr)).length,
    [reminders, todayStr]
  )
  const scheduledCount = useMemo(
    () => reminders.filter(r => !r.completed && r.date && r.date > todayStr).length,
    [reminders, todayStr]
  )

  const renderAddFormContent = () => (
    <form onSubmit={handleAddReminder} className="space-y-3">
      <input
        ref={titleInputRef}
        type="text"
        required
        placeholder="Reminder title (e.g. Call client regarding contract)..."
        value={quickTitle}
        onChange={e => setQuickTitle(e.target.value)}
        className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 font-sans"
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
          <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="date"
            value={quickDate}
            onChange={e => setQuickDate(e.target.value)}
            className="bg-transparent border-none text-white text-xs focus:outline-none w-full"
          />
        </div>

        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
          <Clock className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="time"
            value={quickTime}
            onChange={e => setQuickTime(e.target.value)}
            className="bg-transparent border-none text-white text-xs focus:outline-none w-full"
          />
        </div>

        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
          <Repeat className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={quickRepeat}
            onChange={e => setQuickRepeat(e.target.value as typeof quickRepeat)}
            className="bg-transparent border-none text-white text-xs focus:outline-none w-full"
          >
            <option value="none">No Repeat</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={() => setIsAdding(false)}
          className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition shadow-sm"
        >
          Save Alert
        </button>
      </div>
    </form>
  )

  return (
    <div className="flex h-full w-full bg-slate-950/90 text-white flex-col overflow-hidden select-none">
      {/* Standardized App Header */}
      <AppHeader
        icon={Bell}
        title="Reminders"
        subtitle="Time-Sensitive Alerts & Scheduled Follow-ups"
        gradient="from-pink-500 to-rose-600"
        primaryAction={{
          label: isAdding ? 'Cancel' : 'New Reminder',
          icon: isAdding ? X : Plus,
          variant: isAdding ? 'default' : 'primary',
          onClick: () => {
            setIsAdding(!isAdding)
            if (!isAdding) setTimeout(() => titleInputRef.current?.focus(), 50)
          }
        }}
      >
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {[
            { id: 'today', label: 'Today', count: todayCount },
            { id: 'scheduled', label: 'Scheduled', count: scheduledCount },
            { id: 'completed', label: 'Completed' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                sounds.playClick()
                setActiveSection(tab.id as ReminderSection)
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium transition ${
                activeSection === tab.id
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                  : 'bg-white/5 hover:bg-white/10 text-slate-400'
              }`}
            >
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && tab.count > 0 && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    activeSection === tab.id ? 'bg-black/30 text-white' : 'bg-white/10 text-slate-300'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </AppHeader>

      {/* Quick Add Form Drawer - Desktop only */}
      {isAdding && (
        <div className="hidden sm:block p-4 md:p-5 bg-black/40 border-b border-white/10 shrink-0 animate-window-open text-xs max-w-2xl mx-auto w-full">
          {renderAddFormContent()}
        </div>
      )}

      {/* Quick Add Bottom Sheet - Mobile only */}
      <MobileBottomSheet
        isOpen={isAdding}
        onClose={() => setIsAdding(false)}
        title="New Reminder"
      >
        <div className="sm:hidden pt-1">
          {renderAddFormContent()}
        </div>
      </MobileBottomSheet>

      {/* Main Timeline Scroller */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 max-w-2xl mx-auto w-full">
        {filteredReminders.length === 0 ? (
          <EmptyState
            icon={Bell}
            title={activeSection === 'completed' ? 'No Completed Alerts' : 'No Reminders Due'}
            description={
              activeSection === 'completed'
                ? 'Resolved reminders will show here for your historical reference.'
                : activeSection === 'today'
                ? 'You have zero pending reminders scheduled for today.'
                : 'No future reminders are currently on the calendar.'
            }
            action={{
              label: 'Set New Reminder',
              icon: Plus,
              onClick: () => {
                setIsAdding(true)
                setTimeout(() => titleInputRef.current?.focus(), 50)
              }
            }}
          />
        ) : (
          <div className="space-y-3">
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 px-1">
              {activeSection === 'today'
                ? 'TODAY'
                : activeSection === 'scheduled'
                ? 'UPCOMING SCHEDULE'
                : 'COMPLETED'}
            </div>

            <div className="space-y-1.5">
              {filteredReminders.map(rem => (
                <div
                  key={rem.id}
                  onClick={e => handleToggleComplete(rem.id, e)}
                  className={`px-4 py-3 rounded-2xl border transition-all cursor-pointer group flex items-start justify-between gap-3 ${
                    rem.completed
                      ? 'bg-white/[0.01] border-white/5 opacity-50'
                      : 'bg-white/[0.03] hover:bg-white/[0.06] border-white/10 shadow-xs'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <button
                      onClick={e => handleToggleComplete(rem.id, e)}
                      className={`mt-0.5 p-0.5 rounded-full transition shrink-0 ${
                        rem.completed
                          ? 'text-rose-400'
                          : 'text-slate-500 hover:text-rose-400'
                      }`}
                    >
                      {rem.completed ? (
                        <CheckCircle2 className="w-5 h-5 fill-rose-500/20" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>

                    <div className="min-w-0 flex-1">
                      <div
                        className={`text-sm font-medium tracking-tight truncate ${
                          rem.completed ? 'line-through text-slate-500' : 'text-slate-100'
                        }`}
                      >
                        {rem.title}
                      </div>

                      <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400 font-mono">
                        {rem.time && (
                          <span className="flex items-center gap-1 text-rose-300/90 font-medium">
                            <Clock className="w-3 h-3" />
                            <span>{rem.time}</span>
                          </span>
                        )}

                        {activeSection !== 'today' && rem.date && (
                          <span className="flex items-center gap-1 text-slate-400">
                            <Calendar className="w-3 h-3" />
                            <span>{formatExactDate(rem.date)}</span>
                          </span>
                        )}

                        {rem.repeat && rem.repeat !== 'none' && (
                          <span className="flex items-center gap-1 px-1.5 py-0.2 rounded bg-white/5 text-slate-400">
                            <Repeat className="w-2.5 h-2.5" />
                            <span className="capitalize">{rem.repeat}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={e => handleDelete(rem.id, e)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition shrink-0"
                    title="Delete Reminder"
                  >
                    <Trash2 className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

