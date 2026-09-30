import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

interface StayModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function StayModal({ isOpen, onClose }: StayModalProps) {
  const [showExit, setShowExit] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setShowExit(false)
      const timer = setTimeout(() => {
        setShowExit(true)
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center p-8 bg-gradient-to-b from-slate-950 via-slate-900 to-black text-slate-100 select-none animate-in fade-in duration-1000"
      onMouseMove={() => setShowExit(true)}
    >
      {/* Centered Atmosphere */}
      <div className="text-center max-w-md animate-in fade-in zoom-in-95 duration-1000">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-light text-slate-100 leading-relaxed mb-4">
          Stay here
        </h1>
        <p className="text-xl sm:text-2xl font-serif font-light text-slate-400">
          for a little while.
        </p>
      </div>

      {/* Subtle Exit revealed after time or movement */}
      <div
        className={`absolute bottom-12 transition-all duration-700 ${
          showExit ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'
        }`}
      >
        <button
          onClick={onClose}
          className="px-6 py-2 rounded-full bg-white/5 hover:bg-white/10 text-xs font-serif text-slate-400 hover:text-slate-200 border border-white/5 transition-all"
        >
          Leave
        </button>
      </div>
    </div>
  )
}
