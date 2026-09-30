import { useState, useEffect } from 'react'
import { X, Sparkles, RefreshCw } from 'lucide-react'
import { LiveMoment } from '@/types'
import { CURATED_MOMENTS } from '@/services/live'
import { sounds } from '@/utils/sound'

interface TakeAMomentModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function TakeAMomentModal({ isOpen, onClose }: TakeAMomentModalProps) {
  const [currentMoment, setCurrentMoment] = useState<LiveMoment>(CURATED_MOMENTS[0])
  const [fade, setFade] = useState(false)

  // Pick a fresh random moment on open
  useEffect(() => {
    if (isOpen) {
      const randomIdx = Math.floor(Math.random() * CURATED_MOMENTS.length)
      setCurrentMoment(CURATED_MOMENTS[randomIdx])
      setFade(false)
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleNextThought = () => {
    sounds.playClick()
    setFade(true)
    setTimeout(() => {
      let nextIdx = Math.floor(Math.random() * CURATED_MOMENTS.length)
      // Pick different moment
      if (CURATED_MOMENTS[nextIdx].id === currentMoment.id) {
        nextIdx = (nextIdx + 1) % CURATED_MOMENTS.length
      }
      setCurrentMoment(CURATED_MOMENTS[nextIdx])
      setFade(false)
    }, 200)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/85 backdrop-blur-2xl animate-in fade-in duration-300 select-none">
      <div className="relative w-full max-w-xl text-center flex flex-col items-center">
        {/* Close Button top-right */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content Box */}
        <div
          className={`transition-opacity duration-300 ${
            fade ? 'opacity-0 scale-98' : 'opacity-100 scale-100'
          } flex flex-col items-center max-w-lg`}
        >
          {/* Subtle Category Pill */}
          <span className="text-[11px] font-semibold tracking-widest uppercase px-3 py-1 rounded-full bg-white/10 text-amber-300/90 mb-8 border border-white/10">
            {currentMoment.theme}
          </span>

          {/* Main Invitation Text */}
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif text-white leading-relaxed tracking-tight mb-4">
            {currentMoment.text}
          </h2>

          {/* Subtext */}
          {currentMoment.subtext && (
            <p className="text-sm sm:text-base text-slate-400 font-sans leading-relaxed max-w-md mb-10">
              {currentMoment.subtext}
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 mt-4">
            <button
              onClick={handleNextThought}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-medium border border-white/10 transition-all hover:scale-105 active:scale-95 shadow-lg"
            >
              <RefreshCw className="w-3.5 h-3.5 text-amber-300" />
              <span>Another thought</span>
            </button>

            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-full bg-transparent hover:bg-white/5 text-slate-400 hover:text-slate-200 text-xs font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
