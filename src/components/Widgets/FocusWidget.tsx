import { useState, useEffect } from 'react'
import { Target, Play, Pause, ArrowRight, Flame } from 'lucide-react'
import { focusService, ActiveFocusState } from '@/services/focus'
import GlassButton from '@/components/LiquidGlass/GlassButton'
import { sounds } from '@/utils/sound'

interface FocusWidgetProps {
  onOpenFocus: () => void
}

export default function FocusWidget({ onOpenFocus }: FocusWidgetProps) {
  const [activeSession, setActiveSession] = useState<ActiveFocusState | null>(focusService.getActiveSession())
  const [selectedMinutes, setSelectedMinutes] = useState(25)
  const [stats, setStats] = useState({
    todayCompletedSeconds: 0,
    todayGoalSeconds: 7200,
    todayProgressFraction: 0,
    streakDays: 0
  })

  const reload = async () => {
    setActiveSession(focusService.getActiveSession())
    const st = await focusService.getStats()
    setStats(st)
  }

  useEffect(() => {
    reload()
    const unsub = focusService.subscribe(() => {
      setActiveSession(focusService.getActiveSession())
      focusService.getStats().then(setStats)
    })
    return () => unsub()
  }, [])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  const formatHuman = (sec: number) => {
    const h = Math.floor(sec / 3600)
    const m = Math.floor((sec % 3600) / 60)
    if (h > 0) return `${h}h ${m > 0 ? `${m}m` : ''}`
    return `${m}m`
  }

  // Toggle pause/resume in widget
  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    sounds.playClick()
    if (!activeSession) return
    if (activeSession.isRunning) {
      focusService.pauseFocus()
    } else {
      focusService.resumeFocus()
    }
  }

  // Start focus preset from widget
  const handleStart = async (e: React.MouseEvent) => {
    e.stopPropagation()
    sounds.playClick()
    await focusService.startFocusSession('Focus Session', selectedMinutes)
    reload()
  }

  return (
    <div className="h-full flex flex-col justify-between p-1">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-indigo-400">
          <Target className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wider">Focus</span>
        </div>

        <button
          onClick={onOpenFocus}
          className="text-[11px] text-slate-400 hover:text-white flex items-center gap-0.5 transition"
        >
          <span>Open</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* Main Body: Active session vs Idle */}
      {activeSession ? (
        <div className="my-auto py-1 text-center space-y-2">
          <p className="text-xs font-semibold text-white line-clamp-1">
            {activeSession.title}
          </p>
          <div className="text-3xl font-mono font-light text-indigo-400">
            {formatTime(activeSession.remainingSeconds)}
          </div>
          <div className="flex justify-center">
            <GlassButton
              size="sm"
              variant={activeSession.isPaused ? 'primary' : 'default'}
              onClick={handleToggle}
              className="py-1 px-4 text-xs font-semibold"
            >
              {activeSession.isPaused ? (
                <>
                  <Play className="w-3.5 h-3.5 fill-current mr-1" /> Resume
                </>
              ) : (
                <>
                  <Pause className="w-3.5 h-3.5 fill-current mr-1" /> Pause
                </>
              )}
            </GlassButton>
          </div>
        </div>
      ) : (
        <div className="my-auto space-y-2.5">
          {/* Today goal progress */}
          <div>
            <div className="flex justify-between text-[11px] text-slate-400 mb-1">
              <span>Today</span>
              <span className="font-mono text-white">
                {formatHuman(stats.todayCompletedSeconds)} / {formatHuman(stats.todayGoalSeconds)}
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                style={{ width: `${Math.round(stats.todayProgressFraction * 100)}%` }}
              />
            </div>
          </div>

          {/* Quick presets & Start */}
          <div className="flex items-center gap-1.5">
            {[25, 45, 60].map(mins => (
              <button
                key={mins}
                type="button"
                onClick={() => {
                  sounds.playClick()
                  setSelectedMinutes(mins)
                }}
                className={`flex-1 py-1 rounded-lg text-xs font-medium border transition ${
                  selectedMinutes === mins
                    ? 'bg-indigo-600/80 border-indigo-400/40 text-white'
                    : 'bg-white/[0.04] border-white/10 text-slate-300 hover:text-white'
                }`}
              >
                {mins}m
              </button>
            ))}

            <GlassButton
              size="sm"
              variant="primary"
              onClick={handleStart}
              className="py-1 px-3 text-xs bg-indigo-600/80 hover:bg-indigo-600"
            >
              Start
            </GlassButton>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-2 pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-400">
        <span className="text-[10px]">
          {activeSession ? 'Session active' : `${Math.round(stats.todayProgressFraction * 100)}% of goal`}
        </span>
        {stats.streakDays > 0 && (
          <span className="text-amber-300 flex items-center gap-1 text-[10px] font-mono">
            <Flame className="w-3 h-3 fill-amber-400 text-amber-400" /> {stats.streakDays}d streak
          </span>
        )}
      </div>
    </div>
  )
}
