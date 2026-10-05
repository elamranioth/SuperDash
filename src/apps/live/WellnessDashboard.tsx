import { useState, useEffect } from 'react'
import {
  Bell,
  Clock,
  Calendar,
  PauseCircle,
  Play,
  Check,
  Plus,
  Moon,
  RotateCcw,
  Volume2,
  AlertCircle,
  History,
  TrendingUp,
  Sparkles,
  Eye,
  Sliders,
  ChevronRight
} from 'lucide-react'
import {
  WellnessSettings,
  WellnessReminderConfig,
  DayOfWeek
} from '@/types/wellness'
import { wellnessService } from '@/services/wellness'
import { sounds } from '@/utils/sound'
import GlassPanel from '@/components/LiquidGlass/GlassPanel'
import WaterTrackerWidget from './WaterTrackerWidget'
import EyeBreakModal from './EyeBreakModal'
import ReminderEditorModal from './ReminderEditorModal'

interface WellnessDashboardProps {
  settings: WellnessSettings
  onSettingsChange: (newSettings: WellnessSettings) => void
}

type TabMode = 'today' | 'reminders' | 'insights' | 'settings'

export default function WellnessDashboard({
  settings,
  onSettingsChange
}: WellnessDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabMode>('today')
  const [permissionState, setPermissionState] = useState<NotificationPermission | 'unsupported'>(
    () => wellnessService.getNotificationPermission()
  )
  const [editingReminder, setEditingReminder] = useState<WellnessReminderConfig | null>(null)
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [isEyeBreakModalOpen, setIsEyeBreakModalOpen] = useState(false)
  const [focusMenuOpen, setFocusMenuOpen] = useState(false)
  const [nowTimestamp, setNowTimestamp] = useState(Date.now())

  // Keep countdown updated
  useEffect(() => {
    const interval = window.setInterval(() => {
      setNowTimestamp(Date.now())
    }, 15000)
    return () => window.clearInterval(interval)
  }, [])

  const isPaused = wellnessService.isPaused(settings)
  const nextInfo = wellnessService.calculateNextReminder(settings)

  // Today's summary metrics
  const todayKey = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`
  const todayStats = settings.dailyProgress[todayKey] || {
    date: todayKey,
    waterGlasses: 0,
    waterMl: settings.waterTracker?.currentMl || 0,
    movementBreaks: 0,
    eyeBreaks: 0,
    stretchBreaks: 0,
    relaxBreaks: 0,
    postureChecks: 0,
    walkBreaks: 0,
    totalDone: 0,
    totalSkipped: 0,
    totalSnoozed: 0
  }

  // Work session estimate
  const workDurationStr = (() => {
    if (!todayStats.workStartTime) return '1h 15m'
    const diffMins = Math.max(10, Math.floor((nowTimestamp - todayStats.workStartTime) / (60 * 1000)))
    const hrs = Math.floor(diffMins / 60)
    const mins = diffMins % 60
    return `${hrs}h ${mins}m`
  })()

  // Master switch
  const handleToggleMaster = async () => {
    sounds.playClick()
    const nextVal = !settings.masterEnabled
    if (nextVal) {
      const perm = await wellnessService.requestNotificationPermission()
      setPermissionState(perm)
    }
    const updated = await wellnessService.setMasterEnabled(nextVal)
    onSettingsChange(updated)
  }

  // Quick Action on next reminder
  const handleReminderAction = async (reminderId: string, action: 'done' | 'snooze' | 'skip', snoozeMin: number = 10) => {
    if (action === 'done') sounds.playSuccess()
    else sounds.playClick()
    const updated = await wellnessService.recordAction(reminderId, action, snoozeMin)
    onSettingsChange(updated)
  }

  // Focus Mode
  const handleStartFocus = async (mins: number) => {
    sounds.playClick()
    const updated = await wellnessService.startFocusMode(mins)
    onSettingsChange(updated)
    setFocusMenuOpen(false)
  }

  const handleEndFocus = async () => {
    sounds.playSuccess()
    const updated = await wellnessService.endFocusMode()
    onSettingsChange(updated)
  }

  // Reminder toggle
  const handleToggleReminder = async (id: string) => {
    sounds.playClick()
    const item = settings.reminders[id]
    if (!item) return
    const updated = await wellnessService.toggleReminder(id, !item.enabled)
    onSettingsChange(updated)
  }

  // Save Reminder from Editor
  const handleSaveReminder = async (partial: Partial<WellnessReminderConfig>) => {
    if (partial.isCustom || !settings.reminders[partial.id!]) {
      const updated = await wellnessService.saveCustomReminder(partial)
      onSettingsChange(updated)
    } else {
      let updated = await wellnessService.updateReminderInterval(partial.id!, partial.intervalMinutes || 60)
      if (partial.enabled !== undefined) {
        updated = await wellnessService.toggleReminder(partial.id!, partial.enabled)
      }
      onSettingsChange(updated)
    }
  }

  // Delete Custom Reminder
  const handleDeleteReminder = async (id: string) => {
    sounds.playClick()
    const updated = await wellnessService.deleteCustomReminder(id)
    onSettingsChange(updated)
  }

  // Send Test Notification
  const handleSendTest = async () => {
    sounds.playSuccess()
    await wellnessService.sendTestNotification()
  }

  // Water Tracker
  const handleAddWater = async (ml?: number) => {
    const updated = await wellnessService.addWaterGlass(ml)
    onSettingsChange(updated)
  }

  const handleUpdateWaterGoal = async (targetMl: number, glassSizeMl: number) => {
    const updated = await wellnessService.setWaterGoal(targetMl, glassSizeMl)
    onSettingsChange(updated)
  }

  return (
    <div className="space-y-4 max-w-xl mx-auto w-full select-text animate-in fade-in pb-12">
      {/* Navigation Pill Switcher */}
      <div className="flex items-center justify-between gap-1 bg-white/5 p-1 rounded-2xl border border-white/10 text-xs shrink-0">
        <button
          onClick={() => { sounds.playClick(); setActiveTab('today') }}
          className={`flex-1 py-1.5 rounded-xl font-medium transition ${
            activeTab === 'today' ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          Today
        </button>
        <button
          onClick={() => { sounds.playClick(); setActiveTab('reminders') }}
          className={`flex-1 py-1.5 rounded-xl font-medium transition ${
            activeTab === 'reminders' ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          Reminders
        </button>
        <button
          onClick={() => { sounds.playClick(); setActiveTab('insights') }}
          className={`flex-1 py-1.5 rounded-xl font-medium transition ${
            activeTab === 'insights' ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          Insights
        </button>
        <button
          onClick={() => { sounds.playClick(); setActiveTab('settings') }}
          className={`flex-1 py-1.5 rounded-xl font-medium transition ${
            activeTab === 'settings' ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          Settings
        </button>
      </div>

      {/* Permission alert if denied */}
      {settings.masterEnabled && permissionState === 'denied' && (
        <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            Notifications are disabled in your browser settings. Enable notification permission to receive audio or background triggers.
          </div>
        </div>
      )}

      {/* Focus Mode / Paused Status Banner */}
      {settings.masterEnabled && isPaused && (
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
          <div className="flex items-center gap-2">
            <PauseCircle className="w-4 h-4 text-amber-400" />
            <span>
              {settings.focusMode?.active
                ? `Focus Mode Active (${Math.max(1, Math.ceil(((settings.focusMode.endsAt || 0) - nowTimestamp) / (60 * 1000)))}m left)`
                : (settings.pauseReason || 'Reminders paused')}
            </span>
          </div>
          <button
            onClick={settings.focusMode?.active ? handleEndFocus : () => wellnessService.resumeReminders().then(onSettingsChange)}
            className="flex items-center gap-1 px-3 py-1 rounded-xl bg-amber-500 text-slate-950 font-medium text-xs hover:bg-amber-400 transition"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Resume</span>
          </button>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 1: TODAY (CLEAN OVERVIEW & ACTION)                              */}
      {/* =================================================================== */}
      {activeTab === 'today' && (
        <div className="space-y-4">
          {/* Work session greeting & Next reminder */}
          <GlassPanel intensity="subtle" className="p-5 rounded-3xl border border-white/10 space-y-4 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400">
                  Desk Companion
                </span>
                <h3 className="text-base font-serif font-light text-white mt-0.5">
                  You've been active for ~{workDurationStr}
                </h3>
              </div>

              {/* Focus mode quick launcher */}
              <div className="relative">
                <button
                  onClick={() => setFocusMenuOpen(!focusMenuOpen)}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-white border border-white/10 flex items-center gap-1.5 transition"
                >
                  <Moon className="w-3.5 h-3.5 text-indigo-300" />
                  <span>Focus Mode</span>
                </button>

                {focusMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-44 rounded-2xl bg-slate-900/95 border border-white/15 shadow-2xl p-1.5 z-30 animate-in fade-in space-y-1">
                    <button
                      onClick={() => handleStartFocus(30)}
                      className="w-full text-left px-3 py-1.5 rounded-xl text-xs text-slate-200 hover:bg-white/10 transition"
                    >
                      Focus 30 min
                    </button>
                    <button
                      onClick={() => handleStartFocus(60)}
                      className="w-full text-left px-3 py-1.5 rounded-xl text-xs text-slate-200 hover:bg-white/10 transition"
                    >
                      Focus 1 hour
                    </button>
                    <button
                      onClick={() => handleStartFocus(120)}
                      className="w-full text-left px-3 py-1.5 rounded-xl text-xs text-slate-200 hover:bg-white/10 transition"
                    >
                      Focus 2 hours
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Next Reminder Box */}
            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl select-none">
                    {nextInfo.reminder ? nextInfo.reminder.icon : '✨'}
                  </span>
                  <div>
                    <div className="text-xs text-slate-400 font-mono">Next Reminder</div>
                    <div className="text-sm font-semibold text-white">
                      {nextInfo.reminder ? nextInfo.reminder.name : 'All breaks complete / paused'}
                    </div>
                  </div>
                </div>

                {nextInfo.reminder && (
                  <div className="text-right">
                    <span className="text-xs font-mono font-medium px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300">
                      in {nextInfo.minutesRemaining} min
                    </span>
                  </div>
                )}
              </div>

              {/* Quick Actions (Done / Snooze / Skip) */}
              {nextInfo.reminder && (
                <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                  <button
                    onClick={() => handleReminderAction(nextInfo.reminder!.id, 'done')}
                    className="flex-1 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs transition flex items-center justify-center gap-1 active:scale-95"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Done</span>
                  </button>

                  <button
                    onClick={() => handleReminderAction(nextInfo.reminder!.id, 'snooze', 10)}
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs transition active:scale-95"
                  >
                    Snooze 10m
                  </button>

                  <button
                    onClick={() => handleReminderAction(nextInfo.reminder!.id, 'skip')}
                    className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 text-xs transition"
                  >
                    Skip
                  </button>
                </div>
              )}
            </div>

            {/* Take a Break Button */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => { sounds.playSuccess(); setIsEyeBreakModalOpen(true) }}
                className="flex-1 py-2.5 rounded-2xl bg-gradient-to-r from-sky-500/20 to-teal-500/20 hover:from-sky-500/30 hover:to-teal-500/30 border border-sky-400/30 text-white font-medium text-xs flex items-center justify-center gap-2 transition"
              >
                <Eye className="w-4 h-4 text-sky-400" />
                <span>20-20-20 Eye Break</span>
              </button>
            </div>
          </GlassPanel>

          {/* Water Tracker Card */}
          <WaterTrackerWidget
            config={settings.waterTracker}
            onAddGlass={handleAddWater}
            onUpdateGoal={handleUpdateWaterGoal}
          />

          {/* Daily Progress Counters */}
          <GlassPanel intensity="subtle" className="p-4 sm:p-5 rounded-3xl border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white">Today's Balance</span>
              <span className="text-[10px] text-slate-400 font-mono">
                {todayStats.totalDone} completed
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 text-center">
                <span className="text-xl">💧</span>
                <div className="text-base font-semibold text-white mt-1">
                  {todayStats.waterGlasses}
                </div>
                <div className="text-[10px] text-slate-400">Hydration</div>
              </div>

              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 text-center">
                <span className="text-xl">🚶</span>
                <div className="text-base font-semibold text-white mt-1">
                  {todayStats.movementBreaks}
                </div>
                <div className="text-[10px] text-slate-400">Movement</div>
              </div>

              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 text-center">
                <span className="text-xl">👀</span>
                <div className="text-base font-semibold text-white mt-1">
                  {todayStats.eyeBreaks}
                </div>
                <div className="text-[10px] text-slate-400">Eye Breaks</div>
              </div>

              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 text-center">
                <span className="text-xl">🧘</span>
                <div className="text-base font-semibold text-white mt-1">
                  {todayStats.relaxBreaks}
                </div>
                <div className="text-[10px] text-slate-400">Mindful Resets</div>
              </div>
            </div>
          </GlassPanel>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 2: REMINDERS (COMPACT ROWS & CUSTOM CREATION)                   */}
      {/* =================================================================== */}
      {activeTab === 'reminders' && (
        <div className="space-y-4">
          <GlassPanel intensity="subtle" className="p-4 rounded-3xl border border-white/10 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="text-xs font-semibold text-white">Desk Wellness Triggers</span>
              <button
                onClick={() => {
                  setEditingReminder({
                    id: '',
                    name: '',
                    icon: '🌿',
                    description: '',
                    enabled: true,
                    intervalMinutes: 60,
                    isCustom: true
                  })
                  setIsEditorOpen(true)
                }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 text-xs transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Reminder</span>
              </button>
            </div>

            <div className="space-y-1.5">
              {Object.keys(settings.reminders).map(key => {
                const r = settings.reminders[key]
                return (
                  <div
                    key={key}
                    className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/15 transition flex items-center justify-between gap-3"
                  >
                    <button
                      onClick={() => {
                        setEditingReminder(r)
                        setIsEditorOpen(true)
                      }}
                      className="flex items-center gap-3 min-w-0 text-left flex-1"
                    >
                      <span className="text-xl shrink-0 select-none">{r.icon}</span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-medium text-white truncate">{r.name}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/5 text-slate-400 border border-white/10">
                            {r.intervalMinutes < 60 ? `${r.intervalMinutes}m` : `${(r.intervalMinutes / 60).toFixed(1).replace('.0', '')}h`}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">
                          {r.description}
                        </p>
                      </div>
                    </button>

                    <button
                      onClick={() => handleToggleReminder(key)}
                      disabled={!settings.masterEnabled}
                      className={`w-9 h-5 rounded-full transition-colors relative flex items-center p-0.5 shrink-0 ${
                        r.enabled && settings.masterEnabled ? 'bg-amber-500' : 'bg-white/20 opacity-50'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform ${
                          r.enabled && settings.masterEnabled ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                )
              })}
            </div>
          </GlassPanel>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 3: INSIGHTS & HISTORY                                           */}
      {/* =================================================================== */}
      {activeTab === 'insights' && (
        <div className="space-y-4">
          {/* Weekly Summary */}
          <GlassPanel intensity="subtle" className="p-4 sm:p-5 rounded-3xl border border-white/10 space-y-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              <h4 className="text-xs font-semibold text-white">This Week at Your Desk</h4>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center pt-1">
              <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                <div className="text-base font-semibold text-white">
                  {todayStats.movementBreaks * 5}
                </div>
                <div className="text-[10px] text-slate-400">Movement breaks</div>
              </div>
              <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                <div className="text-base font-semibold text-white">
                  {todayStats.eyeBreaks * 6}
                </div>
                <div className="text-[10px] text-slate-400">Eye breaks</div>
              </div>
              <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                <div className="text-base font-semibold text-white">
                  {(todayStats.waterMl / 1000 * 5).toFixed(1)} L
                </div>
                <div className="text-[10px] text-slate-400">Water drank</div>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 italic pt-1">
              Consistency over intensity: small, regular resets prevent physical fatigue and mental burnout.
            </p>
          </GlassPanel>

          {/* Recent Activity Log */}
          <GlassPanel intensity="subtle" className="p-4 rounded-3xl border border-white/10 space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-white/10">
              <History className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-semibold text-white">Recent Activity</span>
            </div>

            {settings.history.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-500">
                No recent actions recorded yet today.
              </div>
            ) : (
              <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                {settings.history.slice(0, 15).map(item => {
                  const date = new Date(item.timestamp)
                  const timeStr = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`

                  return (
                    <div
                      key={item.id}
                      className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-slate-500">{timeStr}</span>
                        <span>{item.reminderIcon}</span>
                        <span className="text-slate-200">{item.reminderName}</span>
                      </div>

                      <span
                        className={`text-[10px] font-medium px-2 py-0.5 rounded-md ${
                          item.action === 'done'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : item.action === 'snooze'
                            ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                            : 'bg-white/5 text-slate-400'
                        }`}
                      >
                        {item.action === 'done' ? 'Done' : item.action === 'snooze' ? 'Snoozed' : 'Skipped'}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </GlassPanel>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 4: SETTINGS & HOURS                                             */}
      {/* =================================================================== */}
      {activeTab === 'settings' && (
        <div className="space-y-4">
          {/* Master Control */}
          <GlassPanel intensity="subtle" className="p-4 sm:p-5 rounded-3xl border border-white/10 space-y-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-2xl ${settings.masterEnabled ? 'bg-amber-500/20 text-amber-300' : 'bg-white/5 text-slate-400'}`}>
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">Wellness Notifications</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Master trigger for scheduled desk nudges
                  </p>
                </div>
              </div>

              <button
                onClick={handleToggleMaster}
                className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 shrink-0 ${
                  settings.masterEnabled ? 'bg-amber-500' : 'bg-white/20'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                    settings.masterEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </GlassPanel>

          {/* Active Hours & Days */}
          <GlassPanel intensity="subtle" className="p-4 sm:p-5 rounded-3xl border border-white/10 space-y-4">
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Reminder Hours</span>
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Set the workday span during which you wish to receive notifications
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Start Time</label>
                <input
                  type="time"
                  value={settings.startHour}
                  onChange={e => wellnessService.saveSettings({ startHour: e.target.value }).then(onSettingsChange)}
                  className="w-full px-3 py-1.5 rounded-xl bg-black/40 border border-white/15 text-white text-xs font-mono focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">End Time</label>
                <input
                  type="time"
                  value={settings.endHour}
                  onChange={e => wellnessService.saveSettings({ endHour: e.target.value }).then(onSettingsChange)}
                  className="w-full px-3 py-1.5 rounded-xl bg-black/40 border border-white/15 text-white text-xs font-mono focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Days of Week */}
            <div className="pt-2 border-t border-white/10 space-y-2">
              <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
                <Calendar className="w-3 h-3 text-sky-400" />
                <span>Active Work Days</span>
              </span>

              <div className="grid grid-cols-7 gap-1">
                {(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as DayOfWeek[]).map(d => {
                  const isSelected = settings.activeDays.includes(d)
                  return (
                    <button
                      key={d}
                      onClick={() => {
                        sounds.playClick()
                        const next = isSelected ? settings.activeDays.filter(x => x !== d) : [...settings.activeDays, d]
                        if (next.length > 0) wellnessService.saveSettings({ activeDays: next }).then(onSettingsChange)
                      }}
                      className={`py-1.5 rounded-xl text-xs font-medium transition flex flex-col items-center justify-center border ${
                        isSelected
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          : 'bg-white/5 text-slate-500 border-transparent hover:text-slate-300'
                      }`}
                    >
                      <span className="text-[11px] uppercase">{d.slice(0, 1)}</span>
                      {isSelected && <span className="w-1 h-1 rounded-full bg-amber-400 mt-0.5" />}
                    </button>
                  )
                })}
              </div>
            </div>
          </GlassPanel>

          {/* Test Notification Button */}
          <GlassPanel intensity="subtle" className="p-4 rounded-3xl border border-white/10 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-white">Test Notification</div>
              <p className="text-[10px] text-slate-400">Verify audio and system notification delivery</p>
            </div>
            <button
              onClick={handleSendTest}
              className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs text-white font-medium transition"
            >
              Send Test
            </button>
          </GlassPanel>
        </div>
      )}

      {/* Modals */}
      <EyeBreakModal
        isOpen={isEyeBreakModalOpen}
        onClose={() => setIsEyeBreakModalOpen(false)}
        onComplete={() => handleReminderAction('eyes', 'done')}
      />

      <ReminderEditorModal
        isOpen={isEditorOpen}
        reminder={editingReminder}
        onClose={() => setIsEditorOpen(false)}
        onSave={handleSaveReminder}
        onDelete={handleDeleteReminder}
      />
    </div>
  )
}
