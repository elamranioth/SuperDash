import { useState, useEffect, useMemo } from 'react'
import {
  Target,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Clock,
  Flame,
  Calendar,
  Sparkles,
  Settings,
  X,
  History,
  TrendingUp,
  Volume2,
  Trash2,
  Check,
  ChevronRight,
  Hourglass as HourglassIcon,
  CircleDot,
  Type,
  Binary,
  Timer as TimerIcon,
  Globe
} from 'lucide-react'
import confetti from 'canvas-confetti'
import { FocusSession, FocusSettings, TimerVisualMode } from '@/types'
import {
  focusService,
  ActiveFocusState,
  DEFAULT_FOCUS_SETTINGS
} from '@/services/focus'
import { timerService } from '@/services/timer'
import HourglassCanvas from '@/apps/timer/HourglassCanvas'
import GlassPanel from '@/components/LiquidGlass/GlassPanel'
import GlassButton from '@/components/LiquidGlass/GlassButton'
import GlassModal from '@/components/LiquidGlass/GlassModal'
import AppHeader from '@/components/AppWindow/AppHeader'
import { sounds } from '@/utils/sound'

interface FocusAppProps {
  activeTimeMode?: 'timer' | 'focus' | 'world'
  onSelectTimeMode?: (mode: 'timer' | 'focus' | 'world') => void
}

export default function FocusApp({
  activeTimeMode = 'focus',
  onSelectTimeMode
}: FocusAppProps = {}) {
  const [activeSession, setActiveSession] = useState<ActiveFocusState | null>(focusService.getActiveSession())
  const [taskTitle, setTaskTitle] = useState('')
  const [selectedMinutes, setSelectedMinutes] = useState<number>(25)
  const [customMinutes, setCustomMinutes] = useState<number>(30)
  const [isCustom, setIsCustom] = useState(false)
  const [settings, setSettings] = useState<FocusSettings>(DEFAULT_FOCUS_SETTINGS)
  const [stats, setStats] = useState({
    todayCompletedSeconds: 0,
    todayGoalSeconds: 7200,
    todayProgressFraction: 0,
    weekCompletedSeconds: 0,
    todaySessionCount: 0,
    streakDays: 0
  })
  const [history, setHistory] = useState<FocusSession[]>([])
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)

  // Completion modal state
  const [completedSessionData, setCompletedSessionData] = useState<{
    durationMinutes: number
    title: string
  } | null>(null)
  const [accomplishmentNote, setAccomplishmentNote] = useState('')

  // Load state and statistics
  const reloadData = async () => {
    setActiveSession(focusService.getActiveSession())
    const s = await focusService.getSettings()
    setSettings(s)
    const st = await focusService.getStats()
    setStats(st)
    const hist = await focusService.getSessions()
    setHistory(hist)
  }

  useEffect(() => {
    reloadData()
    const unsub = focusService.subscribe(() => {
      setActiveSession(focusService.getActiveSession())
      focusService.getStats().then(setStats)
    })

    // Listen for completion event
    const handleCompletion = (e: Event) => {
      const custom = e as CustomEvent<{ session: ActiveFocusState }>
      if (custom.detail?.session) {
        sounds.playSuccess()
        try {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.7 }
          })
        } catch {
          // ignore
        }
        setCompletedSessionData({
          title: custom.detail.session.title,
          durationMinutes: Math.round(custom.detail.session.durationPlanned / 60)
        })
      }
    }
    window.addEventListener('superdash_focus_completed', handleCompletion)

    return () => {
      unsub()
      window.removeEventListener('superdash_focus_completed', handleCompletion)
    }
  }, [])

  // Start Focus Session
  const handleStartFocus = async () => {
    const mins = isCustom ? customMinutes : selectedMinutes
    if (mins <= 0) return

    sounds.playClick()
    const title = taskTitle.trim() || 'Focus Session'
    await focusService.startFocusSession(title, mins, settings.visualMode)
    setActiveSession(focusService.getActiveSession())
  }

  // Pause / Resume
  const handleTogglePause = () => {
    sounds.playClick()
    if (!activeSession) return
    if (activeSession.isRunning) {
      focusService.pauseFocus()
    } else {
      focusService.resumeFocus()
    }
  }

  // End Session early or normally
  const handleEndSession = async () => {
    sounds.playClick()
    if (!activeSession) return
    const isCompleted = activeSession.remainingSeconds === 0
    await focusService.endSession(isCompleted)
    reloadData()
  }

  // Save session completion note
  const handleSaveCompletionNote = async () => {
    sounds.playSuccess()
    if (activeSession) {
      await focusService.endSession(true, accomplishmentNote)
    }
    setCompletedSessionData(null)
    setAccomplishmentNote('')
    setTaskTitle('')
    reloadData()
  }

  // Format seconds to mm:ss
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  // Format seconds to human text: "1h 25m" or "45m"
  const formatHumanDuration = (totalSec: number) => {
    const hours = Math.floor(totalSec / 3600)
    const mins = Math.floor((totalSec % 3600) / 60)
    if (hours > 0) {
      return `${hours}h ${mins > 0 ? `${mins}m` : ''}`
    }
    return `${mins}m`
  }

  // Visualization helper calculations
  const progressFraction = useMemo(() => {
    if (!activeSession || activeSession.durationPlanned <= 0) return 0
    return Math.max(0, Math.min(1, activeSession.remainingSeconds / activeSession.durationPlanned))
  }, [activeSession])

  const circumference = 2 * Math.PI * 96
  const strokeDashoffset = circumference * (1 - progressFraction)

  // --------------------------------------------------------------------------
  // SCREEN 1: ACTIVE DISTRACTION-FREE FOCUS MODE
  // --------------------------------------------------------------------------
  if (activeSession) {
    return (
      <div className="h-full flex flex-col items-center justify-between p-6 relative select-none animate-fadeIn">
        {/* Top Minimal Bar */}
        <div className="w-full flex items-center justify-between shrink-0 max-w-2xl">
          <div className="flex items-center gap-2 text-indigo-400">
            <Target className="w-4 h-4 animate-pulse" />
            <span className="text-xs uppercase tracking-widest font-semibold">Focus Mode</span>
          </div>

          {/* Visual Mode selector */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.06] border border-white/10">
            {(
              [
                { id: 'hourglass', icon: HourglassIcon, label: 'Hourglass' },
                { id: 'liquid_ring', icon: CircleDot, label: 'Liquid Ring' },
                { id: 'minimal', icon: Type, label: 'Minimal' },
                { id: 'digital', icon: Binary, label: 'Digital' }
              ] as const
            ).map(mode => {
              const Icon = mode.icon
              const isCurrent = (activeSession.visualMode || settings.visualMode) === mode.id
              return (
                <button
                  key={mode.id}
                  onClick={() => {
                    sounds.playClick()
                    focusService.updateSettings({ visualMode: mode.id })
                    timerService.setVisualMode(mode.id)
                  }}
                  className={`p-1.5 rounded-lg transition ${
                    isCurrent ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                  title={mode.label}
                >
                  <Icon className="w-3.5 h-3.5" />
                </button>
              )
            })}
          </div>
        </div>

        {/* Center: Title & Timer Visualization */}
        <div className="my-auto flex flex-col items-center justify-center text-center max-w-lg w-full">
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white mb-6 uppercase tracking-wider drop-shadow-md">
            {activeSession.title}
          </h2>

          {/* Visual Mode Renderer */}
          <div className="my-2 flex flex-col items-center justify-center">
            {activeSession.visualMode === 'hourglass' ? (
              <div className="flex flex-col items-center">
                <HourglassCanvas
                  progress={progressFraction}
                  isRunning={activeSession.isRunning}
                  isPaused={activeSession.isPaused}
                  isFinished={activeSession.remainingSeconds === 0}
                  isRestarting={false}
                  width={210}
                  height={250}
                />
                <div className="mt-4 text-5xl font-mono font-light text-white tracking-tight">
                  {formatTime(activeSession.remainingSeconds)}
                </div>
              </div>
            ) : activeSession.visualMode === 'liquid_ring' ? (
              <div className="relative w-64 h-64 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90">
                  <circle
                    cx="128"
                    cy="128"
                    r="96"
                    className="stroke-white/10"
                    strokeWidth="10"
                    fill="transparent"
                  />
                  <circle
                    cx="128"
                    cy="128"
                    r="96"
                    className="stroke-indigo-500 transition-all duration-300"
                    strokeWidth="10"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-mono font-extralight tracking-tight text-white">
                    {formatTime(activeSession.remainingSeconds)}
                  </span>
                  <span className="text-xs text-slate-400 mt-2 font-mono">
                    {Math.round(progressFraction * 100)}% left
                  </span>
                </div>
              </div>
            ) : activeSession.visualMode === 'digital' ? (
              <div className="p-8 rounded-3xl bg-black/50 border border-white/10 shadow-2xl flex flex-col items-center">
                <div className="text-6xl md:text-7xl font-mono tracking-wider font-bold text-indigo-400 drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]">
                  {formatTime(activeSession.remainingSeconds)}
                </div>
                <div className="mt-3 text-xs uppercase tracking-widest text-slate-400 font-mono">
                  Target: {Math.round(activeSession.durationPlanned / 60)} minutes
                </div>
              </div>
            ) : (
              /* Minimal Mode */
              <div className="flex flex-col items-center">
                <div className="text-7xl md:text-8xl font-extralight tracking-tighter text-white font-mono">
                  {formatTime(activeSession.remainingSeconds)}
                </div>
                <div className="w-56 h-1.5 bg-white/10 rounded-full mt-6 overflow-hidden">
                  <div
                    className="bg-indigo-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${(1 - progressFraction) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="text-xs text-slate-400 mt-4 font-medium uppercase tracking-widest">
            {activeSession.remainingSeconds === 0
              ? 'Session Finished'
              : activeSession.isPaused
              ? 'Session Paused'
              : 'Deep Concentration in Progress'}
          </div>
        </div>

        {/* Bottom Control Bar */}
        <div className="w-full max-w-sm flex flex-col items-center gap-3 shrink-0">
          <div className="flex items-center gap-3 w-full">
            <GlassButton
              onClick={handleTogglePause}
              variant={activeSession.isPaused ? 'primary' : 'default'}
              size="lg"
              className="flex-1 py-3 text-sm font-semibold"
            >
              {activeSession.isPaused ? (
                <>
                  <Play className="w-4 h-4 fill-current mr-1.5" /> RESUME
                </>
              ) : (
                <>
                  <Pause className="w-4 h-4 fill-current mr-1.5" /> PAUSE
                </>
              )}
            </GlassButton>
          </div>

          <button
            onClick={handleEndSession}
            className="text-xs text-slate-400 hover:text-rose-300 transition py-1"
          >
            End Session
          </button>
        </div>
      </div>
    )
  }

  // --------------------------------------------------------------------------
  // SCREEN 2: CALM FOCUS HOME SCREEN
  // --------------------------------------------------------------------------
  return (
    <div className="h-full flex flex-col bg-slate-950/90 text-white overflow-y-auto select-none">
      {/* Standardized App Header */}
      <AppHeader
        icon={Target}
        title="Focus"
        subtitle="Distraction-Free Deep Work & Daily Focus Goals"
        gradient="from-indigo-500 to-purple-700"
        primaryAction={{
          label: 'History & Stats',
          icon: History,
          variant: 'default',
          onClick: () => setShowHistoryModal(true)
        }}
        secondaryAction={{
          label: 'Settings',
          icon: Settings,
          onClick: () => setShowSettingsModal(true)
        }}
      >
        {onSelectTimeMode && (
          <div className="flex items-center p-0.5 rounded-xl bg-white/10 border border-white/10 shrink-0">
            <button
              onClick={() => {
                sounds.playClick()
                onSelectTimeMode('timer')
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-300 hover:text-white transition"
            >
              <TimerIcon className="w-3.5 h-3.5 text-violet-400" />
              <span>Timer</span>
            </button>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-600 text-white shadow-sm">
              <Target className="w-3.5 h-3.5" />
              <span>Focus</span>
            </div>
            <button
              onClick={() => {
                sounds.playClick()
                onSelectTimeMode('world')
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-300 hover:text-white transition"
            >
              <Globe className="w-3.5 h-3.5 text-teal-400" />
              <span>World</span>
            </button>
          </div>
        )}
      </AppHeader>

      {/* Main Focus Card */}
      <div className="max-w-xl mx-auto w-full space-y-5 p-4 sm:p-6 my-auto">
        {/* Task Input */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            What are you working on?
          </label>
          <div className="relative">
            <input
              type="text"
              value={taskTitle}
              onChange={e => setTaskTitle(e.target.value)}
              placeholder="e.g. Preparing defence memorandum..."
              className="w-full px-4 py-3 rounded-2xl liquid-glass border border-white/15 text-white placeholder-slate-500 text-sm md:text-base focus:outline-none focus:border-indigo-400/50 shadow-lg font-sans"
            />
          </div>
        </div>

        {/* Choose Session Presets */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Choose session length
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {[25, 45, 60, 90].map(mins => (
              <button
                key={mins}
                type="button"
                onClick={() => {
                  sounds.playClick()
                  setSelectedMinutes(mins)
                  setIsCustom(false)
                }}
                className={`py-3 px-2 rounded-2xl text-xs md:text-sm font-semibold transition-all border ${
                  !isCustom && selectedMinutes === mins
                    ? 'bg-indigo-600/90 border-indigo-400/50 text-white shadow-lg shadow-indigo-500/20 scale-[1.02]'
                    : 'liquid-glass border-white/10 text-slate-300 hover:text-white hover:border-white/20'
                }`}
              >
                {mins} min
              </button>
            ))}

            <button
              type="button"
              onClick={() => {
                sounds.playClick()
                setIsCustom(true)
              }}
              className={`py-3 px-2 rounded-2xl text-xs md:text-sm font-semibold transition-all border ${
                isCustom
                  ? 'bg-indigo-600/90 border-indigo-400/50 text-white shadow-lg shadow-indigo-500/20 scale-[1.02]'
                  : 'liquid-glass border-white/10 text-slate-300 hover:text-white hover:border-white/20'
              }`}
            >
              Custom
            </button>
          </div>

          {/* Custom Duration Input */}
          {isCustom && (
            <div className="mt-3 flex items-center gap-2 p-2 rounded-xl bg-white/[0.04] border border-white/10">
              <span className="text-xs text-slate-400 pl-2">Minutes:</span>
              <input
                type="number"
                min={1}
                max={240}
                value={customMinutes}
                onChange={e => setCustomMinutes(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-20 px-2 py-1 rounded-lg bg-black/40 border border-white/15 text-white text-xs font-mono text-center focus:outline-none"
              />
              <span className="text-xs text-slate-500">
                ({Math.floor(customMinutes / 60)}h {customMinutes % 60}m)
              </span>
            </div>
          )}
        </div>

        {/* Start Focus Button */}
        <GlassButton
          onClick={handleStartFocus}
          size="lg"
          variant="primary"
          className="w-full py-4 text-base font-bold shadow-xl shadow-indigo-500/25 uppercase tracking-wider"
        >
          <Play className="w-5 h-5 fill-current mr-2" /> START FOCUS
        </GlassButton>

        {/* Daily Goal & Progress */}
        <div className="p-4 rounded-2xl liquid-glass border border-white/10 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold uppercase tracking-wider text-slate-400">
              Daily Focus Goal ({Math.round(stats.todayGoalSeconds / 3600)}h)
            </span>
            <span className="font-mono text-white font-medium">
              {formatHumanDuration(stats.todayCompletedSeconds)} / {formatHumanDuration(stats.todayGoalSeconds)}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2.5 rounded-full bg-white/10 overflow-hidden relative">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
              style={{ width: `${Math.round(stats.todayProgressFraction * 100)}%` }}
            />
          </div>
        </div>

        {/* Simple Statistics Strip */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-2xl liquid-glass border border-white/10 text-center">
            <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
              Today
            </div>
            <div className="text-base font-bold text-white font-mono mt-0.5">
              {formatHumanDuration(stats.todayCompletedSeconds)}
            </div>
          </div>

          <div className="p-3 rounded-2xl liquid-glass border border-white/10 text-center">
            <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
              This Week
            </div>
            <div className="text-base font-bold text-indigo-300 font-mono mt-0.5">
              {formatHumanDuration(stats.weekCompletedSeconds)}
            </div>
          </div>

          <div className="p-3 rounded-2xl liquid-glass border border-white/10 text-center">
            <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
              Streak
            </div>
            <div className="text-base font-bold text-amber-300 font-mono mt-0.5 flex items-center justify-center gap-1">
              <Flame className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>{settings.streakEnabled ? `${stats.streakDays}d` : 'Off'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Session Completion Modal */}
      <GlassModal
        isOpen={!!completedSessionData}
        onClose={() => setCompletedSessionData(null)}
        title={
          <div className="flex items-center gap-2 text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            <span>SESSION COMPLETE</span>
          </div>
        }
        maxWidth="max-w-md"
      >
        {completedSessionData && (
          <div className="space-y-4 py-2">
            <div className="text-center">
              <p className="text-sm font-semibold text-white">
                {completedSessionData.durationMinutes} minutes focused
              </p>
              <p className="text-xs text-slate-400 mt-1">"{completedSessionData.title}"</p>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                What did you accomplish? (Optional)
              </label>
              <textarea
                rows={3}
                value={accomplishmentNote}
                onChange={e => setAccomplishmentNote(e.target.value)}
                placeholder="Brief summary of progress made..."
                className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/15 text-white text-xs focus:outline-none focus:border-indigo-400/50 resize-none"
              />
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-between">
              <GlassButton
                variant="ghost"
                size="sm"
                onClick={() => setCompletedSessionData(null)}
              >
                Close
              </GlassButton>

              <div className="flex items-center gap-2">
                <GlassButton
                  variant="default"
                  size="sm"
                  onClick={() => {
                    handleSaveCompletionNote()
                    handleStartFocus()
                  }}
                >
                  Start Another
                </GlassButton>
                <GlassButton
                  variant="primary"
                  size="sm"
                  onClick={handleSaveCompletionNote}
                >
                  Save
                </GlassButton>
              </div>
            </div>
          </div>
        )}
      </GlassModal>

      {/* History Modal */}
      <GlassModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        title={
          <div className="flex items-center gap-2 text-white">
            <History className="w-4 h-4 text-indigo-400" />
            <span>Focus Session History</span>
          </div>
        }
        maxWidth="max-w-lg"
      >
        <div className="space-y-3">
          {history.length === 0 ? (
            <p className="text-center text-xs text-slate-500 py-6">No focus sessions recorded yet.</p>
          ) : (
            history.slice(0, 15).map(sess => (
              <div
                key={sess.id}
                className="p-3 rounded-xl bg-white/[0.04] border border-white/10 flex items-start justify-between gap-3 text-xs"
              >
                <div>
                  <div className="font-semibold text-white">{sess.title}</div>
                  {sess.notes && (
                    <p className="text-slate-400 mt-1 italic text-[11px] leading-relaxed">
                      "{sess.notes}"
                    </p>
                  )}
                  <div className="text-[10px] text-slate-500 mt-1.5 flex items-center gap-2">
                    <span>{new Date(sess.endedAt || sess.startedAt).toLocaleDateString()}</span>
                    <span>•</span>
                    <span className="font-mono text-indigo-300">
                      {Math.round(sess.durationCompleted / 60)} min completed
                    </span>
                  </div>
                </div>

                <button
                  onClick={async () => {
                    sounds.playClick()
                    await focusService.deleteSession(sess.id)
                    reloadData()
                  }}
                  className="p-1 rounded text-slate-500 hover:text-rose-400 transition"
                  title="Delete record"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </GlassModal>

      {/* Settings Modal */}
      <GlassModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        title={
          <div className="flex items-center gap-2 text-white">
            <Settings className="w-4 h-4 text-indigo-400" />
            <span>Focus Settings</span>
          </div>
        }
        maxWidth="max-w-sm"
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Daily Focus Goal (Hours)
            </label>
            <input
              type="number"
              min={0.5}
              max={12}
              step={0.5}
              value={settings.dailyGoalMinutes / 60}
              onChange={e => {
                const val = parseFloat(e.target.value) || 2
                focusService.updateSettings({ dailyGoalMinutes: Math.round(val * 60) })
                setSettings(prev => ({ ...prev, dailyGoalMinutes: Math.round(val * 60) }))
              }}
              className="w-full px-3 py-2 rounded-xl bg-white/[0.06] border border-white/15 text-white font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Daily Streak Requirement (Minutes)
            </label>
            <input
              type="number"
              min={5}
              max={120}
              value={settings.dailyMinimumMinutes}
              onChange={e => {
                const val = parseInt(e.target.value) || 25
                focusService.updateSettings({ dailyMinimumMinutes: val })
                setSettings(prev => ({ ...prev, dailyMinimumMinutes: val }))
              }}
              className="w-full px-3 py-2 rounded-xl bg-white/[0.06] border border-white/15 text-white font-mono"
            />
          </div>

          <div className="pt-2 border-t border-white/10 flex items-center justify-between">
            <span className="text-slate-300 font-medium">Enable Focus Streak</span>
            <input
              type="checkbox"
              checked={settings.streakEnabled}
              onChange={e => {
                focusService.updateSettings({ streakEnabled: e.target.checked })
                setSettings(prev => ({ ...prev, streakEnabled: e.target.checked }))
              }}
              className="w-4 h-4 accent-indigo-600 rounded"
            />
          </div>

          <div className="pt-3 text-right">
            <GlassButton
              variant="primary"
              size="sm"
              onClick={() => setShowSettingsModal(false)}
            >
              Done
            </GlassButton>
          </div>
        </div>
      </GlassModal>
    </div>
  )
}
