import { useState, useEffect, useMemo } from 'react'
import {
  Play,
  Pause,
  RotateCcw,
  Flag,
  Timer as TimerIcon,
  Watch,
  Flame,
  Layers,
  Sparkles,
  Plus,
  Trash2,
  Hourglass as HourglassIcon,
  CircleDot,
  Type,
  Binary,
  Volume2,
  Target,
  Globe
} from 'lucide-react'
import { timerService, TimerState } from '@/services/timer'
import { storageService, INITIAL_TIMER_PRESETS } from '@/services/storage'
import { TimerPreset, TimerVisualMode, TimerAppMode, TimerSound } from '@/types'
import HourglassCanvas from '@/apps/timer/HourglassCanvas'
import GlassPanel from '@/components/LiquidGlass/GlassPanel'
import GlassButton from '@/components/LiquidGlass/GlassButton'
import AppHeader from '@/components/AppWindow/AppHeader'
import MobileBottomSheet from '@/components/Mobile/MobileBottomSheet'
import { sounds } from '@/utils/sound'

interface TimerAppProps {
  activeTimeMode?: 'timer' | 'focus' | 'world'
  onSelectTimeMode?: (mode: 'timer' | 'focus' | 'world') => void
}

export default function TimerApp({
  activeTimeMode = 'timer',
  onSelectTimeMode
}: TimerAppProps = {}) {
  const [timerState, setTimerState] = useState<TimerState>(timerService.getState())
  const [presets, setPresets] = useState<TimerPreset[]>(INITIAL_TIMER_PRESETS)
  const [isRestarting, setIsRestarting] = useState(false)
  const [newPresetLabel, setNewPresetLabel] = useState('')
  const [newPresetMinutes, setNewPresetMinutes] = useState(20)
  const [isAddingPreset, setIsAddingPreset] = useState(false)
  const [selectedSound, setSelectedSound] = useState<TimerSound>('soft_bell')

  // Subscribe to centralized TimerService
  useEffect(() => {
    const unsubscribe = timerService.subscribe(setTimerState)
    storageService.get<TimerPreset[]>('user_timer_presets', INITIAL_TIMER_PRESETS).then(setPresets)
    storageService.get<TimerSound>('preferred_timer_sound', 'soft_bell').then(setSelectedSound)
    return () => unsubscribe()
  }, [])

  const savePresets = (updated: TimerPreset[]) => {
    setPresets(updated)
    storageService.set('user_timer_presets', updated)
  }

  const handleAddPreset = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPresetLabel.trim() || newPresetMinutes <= 0) return
    const newP: TimerPreset = {
      id: 'preset-' + Date.now(),
      label: newPresetLabel.trim(),
      durationSeconds: Math.round(newPresetMinutes * 60),
      category: 'custom'
    }
    const updated = [...presets, newP]
    savePresets(updated)
    setNewPresetLabel('')
    setIsAddingPreset(false)
    sounds.playSuccess()
  }

  const handleDeletePreset = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    sounds.playClick()
    const updated = presets.filter(p => p.id !== id)
    savePresets(updated)
  }

  // Timer actions
  const handleToggleTimer = () => {
    if (timerState.remainingSeconds === 0) {
      handleRestart()
    } else if (timerState.isRunning) {
      sounds.playClick()
      timerService.pauseTimer()
    } else if (timerState.isPaused) {
      sounds.playClick()
      timerService.resumeTimer()
    } else {
      sounds.playClick()
      timerService.startTimer()
    }
  }

  const handleRestart = () => {
    sounds.playClick()
    setIsRestarting(true)
    setTimeout(() => setIsRestarting(false), 600)
    timerService.resetTimer()
    timerService.startTimer()
  }

  const handleReset = () => {
    sounds.playClick()
    setIsRestarting(true)
    setTimeout(() => setIsRestarting(false), 500)
    timerService.resetTimer()
  }

  const handleAddFiveMin = () => {
    sounds.playClick()
    timerService.addTime(300)
  }

  // Format time helpers
  const formatTimerDisplay = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  const formatStopwatchDisplay = (ms: number) => {
    const totalSecs = Math.floor(ms / 1000)
    const mins = Math.floor(totalSecs / 60)
    const secs = totalSecs % 60
    const centiseconds = Math.floor((ms % 1000) / 10)
    return {
      time: `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`,
      ms: `.${String(centiseconds).padStart(2, '0')}`
    }
  }

  // Progress fraction (1.0 = full top, 0.0 = done)
  const progressFraction =
    timerState.durationSeconds > 0 ? timerState.remainingSeconds / timerState.durationSeconds : 0

  // Stopwatch stats
  const laps = timerState.stopwatch.laps
  const fastestLap = useMemo(() => {
    if (laps.length < 2) return null
    return Math.min(...laps.map(l => l.splitMs))
  }, [laps])

  const slowestLap = useMemo(() => {
    if (laps.length < 2) return null
    return Math.max(...laps.map(l => l.splitMs))
  }, [laps])

  const circumference = 2 * Math.PI * 96
  const strokeDashoffset = circumference - progressFraction * circumference

  return (
    <div className="flex h-full w-full bg-slate-950/90 text-white flex-col overflow-hidden select-none">
      {/* Standardized App Header */}
      <AppHeader
        icon={TimerIcon}
        title="Timer"
        subtitle="Focus Hourglass & Multi-Mode Precision Countdown"
        gradient="from-violet-500 to-purple-600"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
            {onSelectTimeMode && (
              <div className="flex items-center p-0.5 rounded-xl bg-white/10 border border-white/10 shrink-0 mr-1">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-violet-600 text-white shadow-sm">
                  <TimerIcon className="w-3.5 h-3.5" />
                  <span>Timer</span>
                </div>
                <button
                  onClick={() => {
                    sounds.playClick()
                    onSelectTimeMode('focus')
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-300 hover:text-white transition"
                >
                  <Target className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Focus</span>
                </button>
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
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white/5 border border-white/10">
            {[
              { id: 'countdown', label: 'Timer', icon: TimerIcon },
              { id: 'pomodoro', label: 'Pomodoro', icon: Flame },
              { id: 'interval', label: 'Intervals', icon: Layers },
              { id: 'stopwatch', label: 'Stopwatch', icon: Watch }
            ].map(tab => {
              const Icon = tab.icon
              const isActive = timerState.mode === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    sounds.playClick()
                    timerService.setMode(tab.id as TimerAppMode)
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium transition ${
                    isActive
                      ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
            </div>
          </div>

          {/* Visual Mode Picker (for Countdown & Pomodoro) */}
          {(timerState.mode === 'countdown' || timerState.mode === 'pomodoro') && (
            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-2xl border border-white/10 text-xs">
              {[
                { id: 'hourglass', label: 'Hourglass', icon: HourglassIcon },
                { id: 'liquid_ring', label: 'Liquid Ring', icon: CircleDot },
                { id: 'minimal', label: 'Minimal', icon: Type },
                { id: 'digital', label: 'Digital', icon: Binary }
              ].map(m => {
                const Icon = m.icon
                const isActive = timerState.visualMode === m.id
                return (
                  <button
                    key={m.id}
                    onClick={() => {
                      sounds.playClick()
                      timerService.setVisualMode(m.id as TimerVisualMode)
                    }}
                    className={`p-1.5 rounded-xl transition ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                    title={m.label}
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </AppHeader>

      {/* Main Workspace Body */}
      {timerState.mode !== 'stopwatch' ? (
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Main Visualization Center */}
          <div className="flex-1 flex flex-col items-center justify-between p-6 overflow-y-auto">
            {/* Quick Preset Pills: 1m, 5m, 10m, 15m, 25m, 45m, Custom */}
            {timerState.mode === 'countdown' && (
              <div className="flex items-center gap-1.5 flex-wrap justify-center mb-2">
                {[
                  { label: '1m', secs: 60 },
                  { label: '5m', secs: 300 },
                  { label: '10m', secs: 600 },
                  { label: '15m', secs: 900 },
                  { label: '25m', secs: 1500 },
                  { label: '45m', secs: 2700 }
                ].map(p => (
                  <button
                    key={p.label}
                    onClick={() => {
                      sounds.playClick()
                      timerService.resetTimer(p.secs)
                      timerService.startTimer()
                    }}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold transition border ${
                      timerState.durationSeconds === p.secs
                        ? 'bg-violet-600/90 text-white border-violet-400/50 shadow-md shadow-violet-600/25'
                        : 'bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border-white/10'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
                <button
                  onClick={() => setIsAddingPreset(true)}
                  className="px-2.5 py-1 rounded-xl text-xs font-medium bg-white/[0.03] hover:bg-white/[0.06] text-slate-400 hover:text-white border border-white/10"
                >
                  Custom
                </button>
              </div>
            )}

            {/* Status indicator / Pomodoro session tag */}
            <div className="text-center">
              {timerState.mode === 'pomodoro' ? (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-medium">
                  <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span>
                    {timerState.pomodoro.isLongBreak
                      ? 'Long Rest Phase'
                      : timerState.pomodoro.isBreak
                      ? 'Short Break'
                      : `Focus Session ${timerState.pomodoro.currentRound} of ${timerState.pomodoro.roundsTotal}`}
                  </span>
                </div>
              ) : timerState.mode === 'interval' ? (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-medium">
                  <Layers className="w-3.5 h-3.5" />
                  <span>
                    {timerState.interval.isWorkPhase ? 'Work Interval' : 'Rest Interval'} (Round{' '}
                    {timerState.interval.currentCycle}/{timerState.interval.repeatCycles})
                  </span>
                </div>
              ) : (
                <span className="text-xs uppercase tracking-widest text-slate-400 font-semibold">
                  {timerState.remainingSeconds === 0
                    ? "Time's up"
                    : timerState.isRunning
                    ? 'In Progress'
                    : timerState.isPaused
                    ? 'Paused'
                    : 'Ready'}
                </span>
              )}
            </div>

            {/* VISUAL MODES */}
            <div className="my-auto py-4 flex flex-col items-center justify-center">
              {timerState.visualMode === 'hourglass' ? (
                /* Signature Animated Liquid Glass Hourglass */
                <div className="relative flex flex-col items-center">
                  <HourglassCanvas
                    progress={progressFraction}
                    isRunning={timerState.isRunning}
                    isPaused={timerState.isPaused}
                    isFinished={timerState.remainingSeconds === 0}
                    isRestarting={isRestarting}
                    width={220}
                    height={270}
                  />
                  <div className="mt-2 text-3xl font-mono font-light text-white tracking-tight">
                    {formatTimerDisplay(timerState.remainingSeconds)}
                  </div>
                </div>
              ) : timerState.visualMode === 'liquid_ring' ? (
                /* Liquid Glass Circular Ring */
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
                      {formatTimerDisplay(timerState.remainingSeconds)}
                    </span>
                    <span className="text-xs text-slate-400 mt-2 font-mono">
                      {Math.round(progressFraction * 100)}% left
                    </span>
                  </div>
                </div>
              ) : timerState.visualMode === 'digital' ? (
                /* Retro-Modern Digital Clock Face */
                <div className="p-8 rounded-3xl bg-black/50 border border-white/10 shadow-2xl flex flex-col items-center">
                  <div className="text-6xl md:text-7xl font-mono tracking-wider font-bold text-indigo-400 drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]">
                    {formatTimerDisplay(timerState.remainingSeconds)}
                  </div>
                  <div className="mt-3 text-xs uppercase tracking-widest text-slate-400 font-mono">
                    Target: {formatTimerDisplay(timerState.durationSeconds)}
                  </div>
                </div>
              ) : (
                /* Minimal Typography Mode */
                <div className="flex flex-col items-center">
                  <div className="text-7xl md:text-8xl font-extralight tracking-tighter text-white font-mono">
                    {formatTimerDisplay(timerState.remainingSeconds)}
                  </div>
                  <div className="w-48 h-1 bg-white/10 rounded-full mt-4 overflow-hidden">
                    <div
                      className="bg-indigo-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${progressFraction * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Controls */}
            {timerState.remainingSeconds === 0 ? (
              /* Finish Screen Actions */
              <div className="flex items-center gap-3 animate-window-open">
                <GlassButton variant="primary" onClick={handleRestart}>
                  <RotateCcw className="w-4 h-4" /> Restart
                </GlassButton>
                <GlassButton onClick={handleAddFiveMin}>+5 min</GlassButton>
                <GlassButton variant="ghost" onClick={handleReset}>
                  Reset
                </GlassButton>
              </div>
            ) : (
              /* Normal Controls */
              <div className="flex items-center gap-4">
                <GlassButton iconOnly onClick={handleReset} title="Reset">
                  <RotateCcw className="w-5 h-5 text-slate-300" />
                </GlassButton>

                <button
                  onClick={handleToggleTimer}
                  className={`px-8 py-3.5 rounded-full font-semibold text-sm transition-all shadow-xl active:scale-95 flex items-center gap-2 ${
                    timerState.isRunning
                      ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-900/40'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/40'
                  }`}
                >
                  {timerState.isRunning ? (
                    <>
                      <Pause className="w-4 h-4" /> Pause
                    </>
                  ) : timerState.isPaused ? (
                    <>
                      <Play className="w-4 h-4 fill-white" /> Resume
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-white" /> Start
                    </>
                  )}
                </button>

                <GlassButton onClick={handleAddFiveMin} title="Add 5 minutes">
                  +5 min
                </GlassButton>
              </div>
            )}
          </div>

          {/* Presets Sidebar (Desktop) */}
          <div className="hidden md:flex w-72 border-l border-white/10 bg-black/25 p-4 flex-col shrink-0 overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-white/10 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <span>Timer Presets</span>
              <button
                onClick={() => setIsAddingPreset(!isAddingPreset)}
                className="text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Custom</span>
              </button>
            </div>

            {/* Add Custom Preset Form */}
            {isAddingPreset && (
              <form onSubmit={handleAddPreset} className="p-3 my-2 rounded-2xl bg-white/5 border border-white/10 space-y-2 text-xs animate-window-open">
                <input
                  type="text"
                  required
                  placeholder="e.g. Tea Steep, Reading"
                  value={newPresetLabel}
                  onChange={e => setNewPresetLabel(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-white focus:outline-none"
                />
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Minutes:</span>
                  <input
                    type="number"
                    min="1"
                    max="180"
                    value={newPresetMinutes}
                    onChange={e => setNewPresetMinutes(parseInt(e.target.value) || 1)}
                    className="w-20 bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-white focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="ml-auto px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium"
                  >
                    Save
                  </button>
                </div>
              </form>
            )}

            {/* Presets List */}
            <div className="space-y-1.5 mt-3 flex-1">
              {presets.map(p => {
                const isCurrent = timerState.durationSeconds === p.durationSeconds
                return (
                  <div
                    key={p.id}
                    onClick={() => {
                      sounds.playClick()
                      timerService.resetTimer(p.durationSeconds)
                    }}
                    className={`p-2.5 rounded-2xl cursor-pointer transition border flex items-center justify-between group ${
                      isCurrent
                        ? 'bg-indigo-600/30 border-indigo-500/50 text-white'
                        : 'bg-white/5 hover:bg-white/10 border-transparent text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-semibold">{p.label}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {Math.floor(p.durationSeconds / 60)} min
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {p.category === 'custom' && (
                        <button
                          onClick={e => handleDeletePreset(p.id, e)}
                          className="p-1 rounded text-slate-400 hover:text-rose-400 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition"
                          title="Delete preset"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <div className="text-xs px-2 py-0.5 rounded-lg bg-black/30 font-mono text-slate-400">
                        {formatTimerDisplay(p.durationSeconds)}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Mobile Presets & Custom Sheet */}
          <MobileBottomSheet
            isOpen={isAddingPreset}
            onClose={() => setIsAddingPreset(false)}
            title="Timer Presets"
          >
            <div className="space-y-4 pt-1 text-xs">
              <form onSubmit={handleAddPreset} className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-2.5">
                <span className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider block">Add Custom Preset</span>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tea Steep, Reading..."
                  value={newPresetLabel}
                  onChange={e => setNewPresetLabel(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none text-xs"
                />
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Minutes:</span>
                  <input
                    type="number"
                    min="1"
                    max="180"
                    value={newPresetMinutes}
                    onChange={e => setNewPresetMinutes(parseInt(e.target.value) || 1)}
                    className="w-24 bg-black/40 border border-white/10 rounded-xl px-2.5 py-1.5 text-white focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="ml-auto px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold shadow-sm"
                  >
                    Save Preset
                  </button>
                </div>
              </form>

              <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                {presets.map(p => (
                  <div
                    key={p.id}
                    onClick={() => {
                      sounds.playClick()
                      timerService.resetTimer(p.durationSeconds)
                      setIsAddingPreset(false)
                    }}
                    className="p-3 rounded-2xl cursor-pointer transition border border-white/5 bg-white/5 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-semibold text-white">{p.label}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {Math.floor(p.durationSeconds / 60)} min
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {p.category === 'custom' && (
                        <button
                          onClick={e => handleDeletePreset(p.id, e)}
                          className="p-1 rounded text-slate-400 hover:text-rose-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <div className="text-xs px-2.5 py-1 rounded-lg bg-black/30 font-mono text-slate-300">
                        {formatTimerDisplay(p.durationSeconds)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </MobileBottomSheet>
        </div>
      ) : (
        /* STOPWATCH VIEW */
        <div className="flex-1 flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-white/10 overflow-hidden">
          <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-8">
            <div className="flex items-baseline font-mono text-white">
              <span className="text-6xl md:text-8xl font-extralight tracking-tight">
                {formatStopwatchDisplay(timerState.stopwatch.elapsedMs).time}
              </span>
              <span className="text-3xl text-indigo-400 font-light ml-1">
                {formatStopwatchDisplay(timerState.stopwatch.elapsedMs).ms}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <GlassButton
                iconOnly
                onClick={() => timerService.resetStopwatch()}
                title="Reset"
              >
                <RotateCcw className="w-5 h-5 text-slate-300" />
              </GlassButton>

              <button
                onClick={() => {
                  sounds.playClick()
                  if (timerState.stopwatch.isRunning) {
                    timerService.pauseStopwatch()
                  } else {
                    timerService.startStopwatch()
                  }
                }}
                className={`px-8 py-3.5 rounded-full font-semibold text-sm transition-all shadow-xl active:scale-95 flex items-center gap-2 ${
                  timerState.stopwatch.isRunning
                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/40'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/40'
                }`}
              >
                {timerState.stopwatch.isRunning ? (
                  <>
                    <Pause className="w-4 h-4" /> Stop
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" /> Start
                  </>
                )}
              </button>

              <GlassButton
                iconOnly
                onClick={() => timerService.addStopwatchLap()}
                disabled={!timerState.stopwatch.isRunning}
                title="Lap"
              >
                <Flag className="w-5 h-5 text-slate-300" />
              </GlassButton>
            </div>
          </div>

          {/* Laps List */}
          <div className="w-full md:w-80 bg-black/25 p-4 flex flex-col shrink-0 h-56 md:h-full">
            <div className="flex items-center justify-between pb-2 border-b border-white/10 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <span>Laps Record</span>
              <span>{laps.length} Laps</span>
            </div>

            <div className="flex-1 overflow-y-auto mt-2 space-y-1.5 pr-1">
              {laps.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-8">
                  Start the stopwatch and click the flag button to record laps.
                </p>
              ) : (
                laps.map(lap => {
                  const isFastest = lap.splitMs === fastestLap
                  const isSlowest = lap.splitMs === slowestLap
                  const formatted = formatStopwatchDisplay(lap.ms)
                  const splitFormatted = formatStopwatchDisplay(lap.splitMs)

                  return (
                    <div
                      key={lap.id}
                      className="flex items-center justify-between p-2 rounded-xl bg-white/5 text-xs font-mono"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">Lap {lap.id}</span>
                        {isFastest && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300">
                            Fastest
                          </span>
                        )}
                        {isSlowest && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-rose-500/20 text-rose-300">
                            Slowest
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-white font-medium">
                          {formatted.time}
                          <span className="text-indigo-400">{formatted.ms}</span>
                        </div>
                        <div className="text-[10px] text-slate-500">
                          +{splitFormatted.time}
                          {splitFormatted.ms}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
