import { useState, useEffect } from 'react'
import { Timer as TimerIcon, Play, Pause, RotateCcw, ExternalLink } from 'lucide-react'
import { timerService, TimerState } from '@/services/timer'
import { sounds } from '@/utils/sound'
import HourglassCanvas from '@/apps/timer/HourglassCanvas'

interface TimerWidgetProps {
  onOpenTimer?: () => void
}

export default function TimerWidget({ onOpenTimer }: TimerWidgetProps) {
  const [state, setState] = useState<TimerState>(timerService.getState())

  useEffect(() => {
    return timerService.subscribe(setState)
  }, [])

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60)
    const s = secs % 60
    return `${String(mins).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  const progressFraction =
    state.durationSeconds > 0 ? state.remainingSeconds / state.durationSeconds : 0

  return (
    <div className="liquid-glass rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 flex flex-col justify-between shadow-xl w-full max-w-full h-full relative group select-none">
      <div className="glass-specular" />

      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-white/10 relative z-10">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
          <TimerIcon className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <span className="truncate">{state.isRunning ? 'Focus Active' : 'Timer'}</span>
        </div>

        {onOpenTimer && (
          <button
            onClick={() => {
              sounds.playClick()
              onOpenTimer()
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
            title="Open full Timer app"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Body: Inactive presets vs Running progress */}
      <div className="relative z-10 my-3 flex-1 flex flex-col justify-center">
        {!state.isRunning && !state.isPaused ? (
          /* Inactive Quick Start Presets */
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-1.5">
              {[
                { label: '5m', sec: 300 },
                { label: '10m', sec: 600 },
                { label: '25m', sec: 1500 }
              ].map(p => (
                <button
                  key={p.label}
                  onClick={() => {
                    sounds.playClick()
                    timerService.resetTimer(p.sec)
                    timerService.startTimer(p.sec)
                  }}
                  className="flex-1 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-200 border border-white/5 transition active:scale-95"
                >
                  {p.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                sounds.playClick()
                timerService.startTimer()
              }}
              className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition shadow-md shadow-indigo-600/30 flex items-center justify-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5 fill-white" /> Start ({formatTimer(state.durationSeconds)})
            </button>
          </div>
        ) : (
          /* Running or Paused State with miniature Hourglass */
          <div className="flex items-center justify-between gap-3">
            <div className="shrink-0 scale-75 -my-4 -ml-4">
              <HourglassCanvas
                progress={progressFraction}
                isRunning={state.isRunning}
                isPaused={state.isPaused}
                isFinished={state.remainingSeconds === 0}
                width={100}
                height={120}
              />
            </div>

            <div className="flex-1 text-right">
              <div className="text-3xl font-mono font-light text-white tracking-tight">
                {formatTimer(state.remainingSeconds)}
              </div>

              {/* Progress bar */}
              <div className="w-full bg-white/10 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-indigo-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${progressFraction * 100}%` }}
                />
              </div>

              <div className="flex items-center justify-end gap-2 mt-3">
                <button
                  onClick={() => {
                    sounds.playClick()
                    timerService.resetTimer()
                  }}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
                  title="Reset"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => {
                    sounds.playClick()
                    if (state.isRunning) timerService.pauseTimer()
                    else timerService.resumeTimer()
                  }}
                  className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium flex items-center gap-1"
                >
                  {state.isRunning ? (
                    <>
                      <Pause className="w-3 h-3" /> Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-3 h-3 fill-white" /> Resume
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400 relative z-10">
        <span>Synced with Timer Engine</span>
        <span className="font-mono text-indigo-400">
          {Math.round(progressFraction * 100)}%
        </span>
      </div>
    </div>
  )
}
