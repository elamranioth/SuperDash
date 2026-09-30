import { useState, useEffect } from 'react'
import { X, RefreshCw } from 'lucide-react'
import { sounds } from '@/utils/sound'

interface LiveModeViewProps {
  onClose: () => void
}

const IMMERSIVE_THOUGHTS = [
  {
    main: 'Nothing needs\nto happen\nfor this moment\nto matter.',
    foot: 'Stay a while.'
  },
  {
    main: 'This particular day\nwill never exist again.\nBe here for it.',
    foot: 'Take a slow breath.'
  },
  {
    main: 'You are not a machine.\nYou are a living person\non a quiet planet.',
    foot: 'You can rest now.'
  },
  {
    main: 'Not everything unfinished\nneeds to be finished tonight.',
    foot: 'The world will wait.'
  },
  {
    main: 'Life is happening\nright now,\nnot when everything is done.',
    foot: 'Look around you.'
  }
]

export default function LiveModeView({ onClose }: LiveModeViewProps) {
  const [index, setIndex] = useState(0)
  const [fade, setFade] = useState(false)
  const [showControls, setShowControls] = useState(false)

  // Reveal controls subtly after 2.5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowControls(true)
    }, 2500)
    return () => clearTimeout(timer)
  }, [index])

  const handleNextThought = () => {
    sounds.playClick()
    setFade(true)
    setTimeout(() => {
      setIndex(prev => (prev + 1) % IMMERSIVE_THOUGHTS.length)
      setFade(false)
    }, 250)
  }

  const thought = IMMERSIVE_THOUGHTS[index]

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center p-8 bg-gradient-to-b from-slate-950 via-slate-900 to-black text-white select-none transition-all duration-700 animate-in fade-in"
      onMouseMove={() => setShowControls(true)}
    >
      {/* Top right subtle exit button */}
      <button
        onClick={onClose}
        className={`absolute top-6 right-6 p-3 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-all duration-500 ${
          showControls ? 'opacity-80' : 'opacity-0'
        }`}
        title="Exit Live Mode"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Centered Breathing Thought */}
      <div
        className={`text-center max-w-lg transition-all duration-700 ${
          fade ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
        }`}
      >
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-light leading-relaxed tracking-wide text-slate-100 whitespace-pre-line mb-8">
          {thought.main}
        </h1>

        <div className="w-1.5 h-1.5 rounded-full bg-amber-400/60 mx-auto my-6 animate-pulse" />

        <p className="text-sm font-sans tracking-widest uppercase text-slate-400 font-light">
          {thought.foot}
        </p>
      </div>

      {/* Subtly Revealed Actions */}
      <div
        className={`absolute bottom-10 flex items-center gap-4 transition-all duration-700 ${
          showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'
        }`}
      >
        <button
          onClick={handleNextThought}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/15 text-xs text-slate-200 border border-white/10 transition-all hover:scale-105 active:scale-95"
        >
          <RefreshCw className="w-3.5 h-3.5 text-amber-300" />
          <span>Another thought</span>
        </button>

        <button
          onClick={onClose}
          className="px-5 py-2.5 rounded-full bg-transparent hover:bg-white/5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
        >
          Return
        </button>
      </div>
    </div>
  )
}
