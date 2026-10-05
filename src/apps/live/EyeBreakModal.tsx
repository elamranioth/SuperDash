import { useState, useEffect } from 'react'
import { Eye, Check, X, Play, RotateCcw } from 'lucide-react'
import { sounds } from '@/utils/sound'
import GlassPanel from '@/components/LiquidGlass/GlassPanel'

interface EyeBreakModalProps {
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
}

export default function EyeBreakModal({ isOpen, onClose, onComplete }: EyeBreakModalProps) {
  const [secondsLeft, setSecondsLeft] = useState(20)
  const [isRunning, setIsRunning] = useState(true)
  const [isDone, setIsDone] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      setSecondsLeft(20)
      setIsRunning(true)
      setIsDone(false)
      return
    }

    let interval: number | null = null
    if (isRunning && secondsLeft > 0) {
      interval = window.setInterval(() => {
        setSecondsLeft(prev => {
          if (prev <= 1) {
            setIsRunning(false)
            setIsDone(true)
            sounds.playSuccess()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (interval) window.clearInterval(interval)
    }
  }, [isOpen, isRunning, secondsLeft])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in">
      <GlassPanel intensity="heavy" className="p-6 sm:p-8 rounded-3xl border border-white/15 max-w-sm w-full text-center space-y-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex flex-col items-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-sky-500/20 text-sky-300 flex items-center justify-center border border-sky-500/30">
            <Eye className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-serif font-medium text-white">20-20-20 Eye Break</h3>
          <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
            Look away from the screen and focus gently on an object at least 20 feet (6 meters) away.
          </p>
        </div>

        {/* Circular / Large Countdown */}
        <div className="flex flex-col items-center justify-center my-4">
          <div className="relative w-32 h-32 rounded-full border-4 border-white/10 flex items-center justify-center">
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="58"
                fill="none"
                stroke="rgba(56, 189, 248, 0.8)"
                strokeWidth="4"
                strokeDasharray="364.4"
                strokeDashoffset={364.4 * (1 - secondsLeft / 20)}
                className="transition-all duration-1000 ease-linear"
              />
            </svg>
            <div className="text-4xl font-mono font-light text-white">
              {secondsLeft}
            </div>
          </div>
        </div>

        {isDone ? (
          <div className="space-y-3 animate-in zoom-in-95">
            <div className="flex items-center justify-center gap-2 text-emerald-400 text-sm font-medium">
              <Check className="w-5 h-5" />
              <span>Eye break completed</span>
            </div>
            <button
              onClick={() => {
                onComplete()
                onClose()
              }}
              className="w-full py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-medium text-xs transition"
            >
              Done & Record
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-white transition flex items-center gap-1.5"
            >
              {isRunning ? 'Pause' : <><Play className="w-3 h-3 fill-current" /> Resume</>}
            </button>
            <button
              onClick={() => {
                setSecondsLeft(20)
                setIsRunning(true)
                setIsDone(false)
              }}
              className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-slate-300 transition"
              title="Reset"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </GlassPanel>
    </div>
  )
}
