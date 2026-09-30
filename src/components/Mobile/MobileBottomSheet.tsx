import { useEffect, ReactNode } from 'react'
import { X } from 'lucide-react'
import { sounds } from '@/utils/sound'
import { cn } from '@/utils/cn'

export interface MobileBottomSheetProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  maxHeight?: string
  className?: string
}

export default function MobileBottomSheet({
  isOpen,
  onClose,
  title,
  children,
  maxHeight = 'max-h-[85vh]',
  className
}: MobileBottomSheetProps) {
  // Lock body scroll and listen for Escape
  useEffect(() => {
    if (!isOpen) return
    const origOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = origOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-40 flex flex-col justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={() => {
          sounds.playClick()
          onClose()
        }}
      />

      {/* Bottom Sheet Drawer */}
      <div
        className={cn(
          'relative z-50 w-full bg-slate-900 border-t border-white/15 rounded-t-3xl shadow-2xl flex flex-col overflow-hidden animate-bottom-sheet pb-[max(1rem,env(safe-area-inset-bottom,0px))]',
          maxHeight,
          className
        )}
      >
        {/* Drag Pill Indicator */}
        <div className="pt-2.5 pb-1 flex justify-center shrink-0">
          <div className="w-10 h-1.5 rounded-full bg-white/20" />
        </div>

        {/* Optional Header */}
        {title && (
          <div className="px-4 py-2.5 flex items-center justify-between border-b border-white/10 shrink-0">
            <h2 className="text-sm font-bold text-white tracking-tight">{title}</h2>
            <button
              onClick={() => {
                sounds.playClick()
                onClose()
              }}
              className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Scrollable Sheet Content */}
        <div className="flex-1 overflow-y-auto px-4 py-3 min-w-0 max-w-full">
          {children}
        </div>
      </div>
    </div>
  )
}
