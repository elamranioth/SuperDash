import { useState } from 'react'
import { ArrowLeft, ArrowRight, Info, X } from 'lucide-react'
import { HUMAN_VOICES } from '@/services/live'
import { sounds } from '@/utils/sound'
import GlassPanel from '@/components/LiquidGlass/GlassPanel'

export default function HumanWorld() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showContextModal, setShowContextModal] = useState(false)
  const [fade, setFade] = useState(false)

  const currentVoice = HUMAN_VOICES[currentIndex]

  const handleNext = () => {
    sounds.playClick()
    setFade(true)
    setTimeout(() => {
      setCurrentIndex(prev => (prev + 1) % HUMAN_VOICES.length)
      setFade(false)
    }, 200)
  }

  const handlePrev = () => {
    sounds.playClick()
    setFade(true)
    setTimeout(() => {
      setCurrentIndex(prev => (prev - 1 + HUMAN_VOICES.length) % HUMAN_VOICES.length)
      setFade(false)
    }, 200)
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-6 md:p-12 select-text max-w-4xl mx-auto w-full relative">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <div>
          <span className="text-[10px] uppercase tracking-widest font-bold text-amber-400 block mb-0.5">
            World 3
          </span>
          <h2 className="text-xl font-serif text-white">
            Human Voices
          </h2>
        </div>

        <span className="text-[11px] font-mono text-slate-500 uppercase tracking-widest">
          {currentIndex + 1} of {HUMAN_VOICES.length}
        </span>
      </div>

      {/* Main Quote Stage (Uncluttered, dignified, spacious) */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-4 max-w-2xl mx-auto">
        <div
          className={`transition-all duration-300 ${
            fade ? 'opacity-0 scale-98' : 'opacity-100 scale-100'
          }`}
        >
          <blockquote className="text-2xl sm:text-3xl md:text-4xl font-serif text-slate-100 leading-relaxed italic mb-8">
            "{currentVoice.quote}"
          </blockquote>

          <div className="space-y-1 mb-8">
            <p className="text-lg font-medium text-amber-300 tracking-wide font-sans">
              — {currentVoice.person}
            </p>
            <p className="text-xs text-slate-400 font-mono">
              {currentVoice.source}
            </p>
          </div>

          <button
            onClick={() => setShowContextModal(true)}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-300 underline underline-offset-4 transition-colors"
          >
            <Info className="w-3.5 h-3.5" />
            <span>Learn about this person →</span>
          </button>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-center gap-6 pt-6 border-t border-white/10 select-none">
        <button
          onClick={handlePrev}
          className="flex items-center gap-2 px-5 py-2 rounded-full bg-white/5 hover:bg-white/10 text-xs text-slate-300 transition-all hover:scale-105 active:scale-95"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Previous voice</span>
        </button>

        <button
          onClick={handleNext}
          className="flex items-center gap-2 px-5 py-2 rounded-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-400/30 text-xs font-medium transition-all hover:scale-105 active:scale-95 shadow-md"
        >
          <span>Next voice</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Historical Context Modal */}
      {showContextModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <GlassPanel intensity="intense" className="p-6 rounded-2xl border border-white/20 shadow-2xl">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
                <h3 className="text-base font-serif font-semibold text-white">
                  {currentVoice.person}
                </h3>
                <button
                  onClick={() => setShowContextModal(false)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4 text-xs text-slate-300 leading-relaxed select-text">
                <div>
                  <span className="text-[10px] uppercase tracking-wider font-bold text-amber-400 block mb-1">
                    Historical Context
                  </span>
                  <p className="font-serif leading-relaxed">{currentVoice.context}</p>
                </div>

                <div>
                  <span className="text-[10px] uppercase tracking-wider font-bold text-amber-400 block mb-1">
                    Exact Citation & Source
                  </span>
                  <p className="font-mono text-slate-400">{currentVoice.source}</p>
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-white/10 flex justify-end">
                <button
                  onClick={() => setShowContextModal(false)}
                  className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-white transition-colors"
                >
                  Close
                </button>
              </div>
            </GlassPanel>
          </div>
        </div>
      )}
    </div>
  )
}
