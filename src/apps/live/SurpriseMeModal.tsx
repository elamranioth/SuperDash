import { useState } from 'react'
import { X, Sparkles, RefreshCw } from 'lucide-react'
import { getRandomSurprise } from '@/services/live'
import { sounds } from '@/utils/sound'

interface SurpriseMeModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SurpriseMeModal({ isOpen, onClose }: SurpriseMeModalProps) {
  const [surprise, setSurprise] = useState(getRandomSurprise())
  const [fade, setFade] = useState(false)

  if (!isOpen) return null

  const handleNext = () => {
    sounds.playClick()
    setFade(true)
    setTimeout(() => {
      setSurprise(getRandomSurprise())
      setFade(false)
    }, 200)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/85 backdrop-blur-2xl animate-in fade-in select-none">
      <div className="relative w-full max-w-lg text-center flex flex-col items-center">
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div
          className={`transition-all duration-200 ${
            fade ? 'opacity-0 scale-98' : 'opacity-100 scale-100'
          } flex flex-col items-center max-w-md`}
        >
          <span className="text-[10px] uppercase tracking-widest font-bold text-amber-400 px-3 py-1 rounded-full bg-white/10 mb-8 border border-white/10">
            A small ordinary idea
          </span>

          <h2 className="text-2xl sm:text-3xl font-serif text-white leading-relaxed mb-6">
            "{surprise}"
          </h2>

          <p className="text-xs text-slate-400 font-sans mb-10 max-w-xs leading-relaxed">
            No score. No challenge. Ignore this completely or do it just because you can.
          </p>

          <div className="flex items-center gap-3">
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/15 text-xs text-slate-200 border border-white/10 transition-all hover:scale-105 active:scale-95"
            >
              <RefreshCw className="w-3.5 h-3.5 text-amber-300" />
              <span>Another surprise</span>
            </button>

            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-full bg-transparent hover:bg-white/5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
