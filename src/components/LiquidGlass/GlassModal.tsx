import { ReactNode } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/utils/cn'
import { sounds } from '@/utils/sound'

interface GlassModalProps {
  isOpen: boolean
  onClose: () => void
  title?: ReactNode
  children: ReactNode
  maxWidth?: string
  className?: string
}

export default function GlassModal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'max-w-xl',
  className
}: GlassModalProps) {
  if (!isOpen) return null

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-md flex items-center justify-center p-2.5 sm:p-6 transition-all duration-300"
    >
      <div
        onClick={e => e.stopPropagation()}
        className={cn(
          'w-full liquid-glass-heavy rounded-2xl sm:rounded-3xl spotlight-glow overflow-hidden animate-window-open shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[85vh] my-auto',
          maxWidth,
          className
        )}
      >
        <div className="glass-specular" />

        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between relative z-10 shrink-0">
          <div className="font-semibold text-sm md:text-base text-white">{title}</div>
          <button
            onClick={() => {
              sounds.playClick()
              onClose()
            }}
            className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 md:p-6 overflow-y-auto relative z-10">{children}</div>
      </div>
    </div>
  )
}
