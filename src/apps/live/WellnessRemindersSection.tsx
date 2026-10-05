import { useState } from 'react'
import {
  Bell,
  Clock,
  Calendar,
  PauseCircle,
  Play,
  Check,
  ChevronDown,
  AlertCircle
} from 'lucide-react'
import {
  WellnessSettings,
  WellnessReminderType,
  DayOfWeek
} from '@/types/wellness'
import { wellnessService } from '@/services/wellness'
import { sounds } from '@/utils/sound'
import GlassPanel from '@/components/LiquidGlass/GlassPanel'

interface WellnessRemindersSectionProps {
  settings: WellnessSettings
  onSettingsChange: (newSettings: WellnessSettings) => void
}

const INTERVAL_OPTIONS = [
  { label: '15 min', value: 15 },
  { label: '30 min', value: 30 },
  { label: '45 min', value: 45 },
  { label: '1 hour', value: 60 },
  { label: '1.5 hours', value: 90 },
  { label: '2 hours', value: 120 },
  { label: '3 hours', value: 180 }
]

const DAYS_OF_WEEK: { id: DayOfWeek; label: string; full: string }[] = [
  { id: 'mon', label: 'M', full: 'Mon' },
  { id: 'tue', label: 'T', full: 'Tue' },
  { id: 'wed', label: 'W', full: 'Wed' },
  { id: 'thu', label: 'T', full: 'Thu' },
  { id: 'fri', label: 'F', full: 'Fri' },
  { id: 'sat', label: 'S', full: 'Sat' },
  { id: 'sun', label: 'S', full: 'Sun' }
]

export default function WellnessRemindersSection({
  settings,
  onSettingsChange
}: WellnessRemindersSectionProps) {
  const [permissionState, setPermissionState] = useState<NotificationPermission | 'unsupported'>(
    () => wellnessService.getNotificationPermission()
  )
  const [pauseMenuOpen, setPauseMenuOpen] = useState(false)
  const [editingIntervalFor, setEditingIntervalFor] = useState<WellnessReminderType | null>(null)
  const [customIntervalInput, setCustomIntervalInput] = useState<string>('')

  const isPaused = wellnessService.isPaused(settings)

  // Toggle Master Switch
  const handleToggleMaster = async () => {
    sounds.playClick()
    const nextVal = !settings.masterEnabled

    if (nextVal) {
      // Request permission only upon user activating the feature
      const perm = await wellnessService.requestNotificationPermission()
      setPermissionState(perm)
    }

    const updated = await wellnessService.setMasterEnabled(nextVal)
    onSettingsChange(updated)
  }

  // Toggle Individual Reminder
  const handleToggleReminder = async (id: WellnessReminderType) => {
    sounds.playClick()
    const current = settings.reminders[id]
    if (!current) return
    const updated = await wellnessService.toggleReminder(id, !current.enabled)
    onSettingsChange(updated)
  }

  // Select Interval
  const handleSelectInterval = async (id: WellnessReminderType, minutes: number) => {
    sounds.playClick()
    const updated = await wellnessService.updateReminderInterval(id, minutes)
    onSettingsChange(updated)
    setEditingIntervalFor(null)
  }

  // Set Custom Interval
  const handleApplyCustomInterval = async (id: WellnessReminderType) => {
    const mins = parseInt(customIntervalInput, 10)
    if (!isNaN(mins) && mins >= 5 && mins <= 480) {
      sounds.playClick()
      const updated = await wellnessService.updateReminderInterval(id, mins)
      onSettingsChange(updated)
      setEditingIntervalFor(null)
      setCustomIntervalInput('')
    }
  }

  // Handle Pause
  const handlePause = async (duration: number | 'tomorrow' | 'off') => {
    sounds.playClick()
    const updated = await wellnessService.pauseReminders(duration)
    onSettingsChange(updated)
    setPauseMenuOpen(false)
  }

  // Handle Resume
  const handleResume = async () => {
    sounds.playSuccess()
    const updated = await wellnessService.resumeReminders()
    onSettingsChange(updated)
  }

  // Toggle Day
  const handleToggleDay = async (day: DayOfWeek) => {
    sounds.playClick()
    let nextDays: DayOfWeek[]
    if (settings.activeDays.includes(day)) {
      if (settings.activeDays.length === 1) return // Keep at least one day
      nextDays = settings.activeDays.filter(d => d !== day)
    } else {
      nextDays = [...settings.activeDays, day]
    }
    const updated = await wellnessService.saveSettings({ activeDays: nextDays })
    onSettingsChange(updated)
  }

  // Quick select every day
  const handleSelectEveryDay = async () => {
    sounds.playClick()
    const allDays: DayOfWeek[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
    const updated = await wellnessService.saveSettings({ activeDays: allDays })
    onSettingsChange(updated)
  }

  // Change Active Hours
  const handleTimeChange = async (type: 'start' | 'end', val: string) => {
    const patch = type === 'start' ? { startHour: val } : { endHour: val }
    const updated = await wellnessService.saveSettings(patch)
    onSettingsChange(updated)
  }

  const formatIntervalDisplay = (minutes: number) => {
    if (minutes === 60) return 'Every 60 min'
    if (minutes < 60) return `Every ${minutes} min`
    if (minutes % 60 === 0) return `Every ${minutes / 60} ${minutes / 60 === 1 ? 'hour' : 'hours'}`
    const hrs = (minutes / 60).toFixed(1).replace('.0', '')
    return `Every ${hrs} hours`
  }

  return (
    <div className="space-y-4">
      {/* Master Card */}
      <GlassPanel intensity="subtle" className="p-4 sm:p-5 rounded-2xl border border-white/10 space-y-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl transition-colors ${settings.masterEnabled ? 'bg-amber-500/20 text-amber-300' : 'bg-white/5 text-slate-400'}`}>
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Wellness Notifications</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Periodic smart nudges designed for long desk & computer hours
              </p>
            </div>
          </div>

          <button
            onClick={handleToggleMaster}
            aria-label="Toggle wellness notifications"
            className={`w-12 h-6.5 rounded-full transition-colors relative flex items-center p-0.5 flex-shrink-0 ${
              settings.masterEnabled ? 'bg-amber-500' : 'bg-white/20'
            }`}
          >
            <div
              className={`w-5.5 h-5.5 rounded-full bg-white shadow-md transform transition-transform ${
                settings.masterEnabled ? 'translate-x-5.5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Permission Denied Warning */}
        {settings.masterEnabled && permissionState === 'denied' && (
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Notifications are disabled for Live. Enable notification permission in your browser or device settings to receive wellness reminders.
            </p>
          </div>
        )}

        {/* Paused Banner */}
        {settings.masterEnabled && isPaused && (
          <div className="flex items-center justify-between p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
            <div className="flex items-center gap-2">
              <PauseCircle className="w-4 h-4" />
              <span>{settings.pauseReason || 'Reminders paused'}</span>
            </div>
            <button
              onClick={handleResume}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 font-medium text-[11px] hover:bg-amber-400 transition"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Resume</span>
            </button>
          </div>
        )}
      </GlassPanel>

      {/* Reminders List */}
      <GlassPanel intensity="subtle" className="p-3 sm:p-4 rounded-2xl border border-white/10 space-y-1">
        <div className="px-2 py-1.5 flex items-center justify-between">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
            Desk Wellness Triggers
          </span>
          <span className="text-[11px] text-slate-500">
            Tap interval to customize
          </span>
        </div>

        {(Object.keys(settings.reminders) as WellnessReminderType[]).map(key => {
          const reminder = settings.reminders[key]
          const isEnabled = settings.masterEnabled && reminder.enabled && !isPaused
          const isEditing = editingIntervalFor === key

          return (
            <div
              key={key}
              className={`p-3 rounded-xl transition-all border ${
                reminder.enabled
                  ? 'bg-white/[0.04] border-white/5 hover:border-white/10'
                  : 'bg-white/[0.01] border-transparent opacity-60'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xl flex-shrink-0 select-none">{reminder.icon}</span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs sm:text-sm font-medium text-white truncate">
                        {reminder.name}
                      </span>
                      {/* Interval Badge */}
                      <button
                        onClick={() => {
                          sounds.playClick()
                          setEditingIntervalFor(isEditing ? null : key)
                        }}
                        disabled={!settings.masterEnabled}
                        className={`text-[10px] font-medium px-2 py-0.5 rounded-md border transition flex items-center gap-1 ${
                          isEnabled
                            ? 'bg-amber-500/10 border-amber-500/20 text-amber-300 hover:bg-amber-500/20'
                            : 'bg-white/5 border-white/10 text-slate-400'
                        }`}
                      >
                        <span>{formatIntervalDisplay(reminder.intervalMinutes)}</span>
                        <ChevronDown className={`w-2.5 h-2.5 transition-transform ${isEditing ? 'rotate-180' : ''}`} />
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {reminder.description}
                    </p>
                  </div>
                </div>

                {/* Reminder toggle */}
                <button
                  onClick={() => handleToggleReminder(key)}
                  disabled={!settings.masterEnabled}
                  aria-label={`Toggle ${reminder.name}`}
                  className={`w-9 h-5 rounded-full transition-colors relative flex items-center p-0.5 flex-shrink-0 ${
                    reminder.enabled && settings.masterEnabled
                      ? 'bg-amber-500'
                      : 'bg-white/20 opacity-50'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform ${
                      reminder.enabled && settings.masterEnabled ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Interval Selection Drawer */}
              {isEditing && (
                <div className="mt-3 pt-3 border-t border-white/10 animate-in fade-in space-y-2">
                  <div className="flex flex-wrap gap-1.5">
                    {INTERVAL_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => handleSelectInterval(key, opt.value)}
                        className={`px-2.5 py-1 rounded-lg text-xs transition border ${
                          reminder.intervalMinutes === opt.value
                            ? 'bg-amber-500 text-slate-950 font-semibold border-amber-500'
                            : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>

                  {/* Custom minutes row */}
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[11px] text-slate-400">Custom:</span>
                    <input
                      type="number"
                      min={5}
                      max={480}
                      placeholder="Minutes (e.g. 75)"
                      value={customIntervalInput}
                      onChange={e => setCustomIntervalInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleApplyCustomInterval(key)
                      }}
                      className="w-32 px-2 py-1 text-xs rounded-lg bg-black/40 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    />
                    <button
                      onClick={() => handleApplyCustomInterval(key)}
                      className="px-2.5 py-1 text-xs rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition"
                    >
                      Set
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </GlassPanel>

      {/* Reminder Hours & Days Configuration */}
      <GlassPanel intensity="subtle" className="p-4 sm:p-5 rounded-2xl border border-white/10 space-y-4">
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Reminder Hours</span>
          </h4>
          <p className="text-xs text-slate-400 mt-1">
            Notifications are sent exclusively during your active desk hours
          </p>
        </div>

        {/* Time Inputs */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Start Time</label>
            <input
              type="time"
              value={settings.startHour}
              onChange={e => handleTimeChange('start', e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl bg-black/40 border border-white/15 text-white text-xs font-mono focus:outline-none focus:border-amber-400"
            />
          </div>
          <div>
            <label className="text-[11px] text-slate-400 block mb-1">End Time</label>
            <input
              type="time"
              value={settings.endHour}
              onChange={e => handleTimeChange('end', e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl bg-black/40 border border-white/15 text-white text-xs font-mono focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        {/* Days of Week */}
        <div className="pt-2 border-t border-white/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
              <Calendar className="w-3 h-3 text-sky-400" />
              <span>Active Days</span>
            </span>
            <button
              onClick={handleSelectEveryDay}
              className="text-[10px] text-amber-400 hover:text-amber-300 transition"
            >
              Select Every Day
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
            {DAYS_OF_WEEK.map(d => {
              const isSelected = settings.activeDays.includes(d.id)
              return (
                <button
                  key={d.id}
                  onClick={() => handleToggleDay(d.id)}
                  className={`py-1.5 rounded-xl text-xs font-medium transition flex flex-col items-center justify-center border ${
                    isSelected
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      : 'bg-white/5 text-slate-500 border-transparent hover:text-slate-300'
                  }`}
                  title={d.full}
                >
                  <span className="text-[11px]">{d.label}</span>
                  {isSelected && <span className="w-1 h-1 rounded-full bg-amber-400 mt-0.5" />}
                </button>
              )
            })}
          </div>
        </div>
      </GlassPanel>

      {/* Quiet Mode / Pause Reminders */}
      <GlassPanel intensity="subtle" className="p-4 sm:p-5 rounded-2xl border border-white/10">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h4 className="text-xs font-semibold text-white flex items-center gap-2">
              <PauseCircle className="w-4 h-4 text-rose-400" />
              <span>Pause Reminders</span>
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Temporarily mute alerts during meetings, calls, or focus blocks
            </p>
          </div>

          <div className="relative">
            <button
              onClick={() => {
                sounds.playClick()
                setPauseMenuOpen(!pauseMenuOpen)
              }}
              disabled={!settings.masterEnabled}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-white border border-white/10 transition flex items-center gap-1.5 disabled:opacity-40"
            >
              <span>{isPaused ? 'Paused' : 'Pause'}</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${pauseMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Pause Menu Dropdown */}
            {pauseMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 rounded-xl bg-slate-900/95 border border-white/15 backdrop-blur-xl shadow-2xl p-1 z-30 animate-in fade-in">
                <button
                  onClick={() => handlePause(60)}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs text-slate-200 hover:bg-white/10 transition"
                >
                  Pause for 1 hour
                </button>
                <button
                  onClick={() => handlePause(120)}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs text-slate-200 hover:bg-white/10 transition"
                >
                  Pause for 2 hours
                </button>
                <button
                  onClick={() => handlePause('tomorrow')}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs text-slate-200 hover:bg-white/10 transition"
                >
                  Pause until tomorrow
                </button>
                <div className="my-1 border-t border-white/10" />
                <button
                  onClick={() => handlePause('off')}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs text-rose-400 hover:bg-rose-500/10 transition"
                >
                  Turn reminders off
                </button>
              </div>
            )}
          </div>
        </div>
      </GlassPanel>
    </div>
  )
}
