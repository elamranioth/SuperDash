import { ReactNode } from 'react'
import { RotateCw, X, Maximize2, Minimize2 } from 'lucide-react'
import { WidgetSize } from '@/types'
import { cn } from '@/utils/cn'
import { sounds } from '@/utils/sound'

interface GlassWidgetProps {
  id: string
  title: string
  icon?: ReactNode
  children: ReactNode
  size?: WidgetSize
  className?: string
  isEditMode?: boolean
  noCard?: boolean
  onRemove?: () => void
  onToggleSize?: () => void
  onRefresh?: () => void
  isRefreshing?: boolean
  onClick?: () => void
}

export default function GlassWidget({
  title,
  icon,
  children,
  size = 'md',
  className,
  isEditMode = false,
  noCard = false,
  onRemove,
  onToggleSize,
  onRefresh,
  isRefreshing = false,
  onClick
}: GlassWidgetProps) {
  const sizeMap = {
    sm: 'col-span-1 min-h-[140px]',
    md: 'col-span-1 md:col-span-2 min-h-[160px]',
    lg: 'col-span-1 md:col-span-2 lg:col-span-3 min-h-[200px]'
  }

  if (noCard) {
    return (
      <div
        onClick={onClick}
        className={cn(
          'flex flex-col justify-between group transition-all duration-300 relative w-full max-w-full',
          sizeMap[size],
          isEditMode && 'ring-2 ring-indigo-500/70 rounded-3xl p-0.5',
          className
        )}
      >
        {isEditMode && (
          <div
            className="absolute top-2 right-2 z-30 flex items-center gap-1 bg-black/75 backdrop-blur-md p-1.5 rounded-xl border border-white/20 shadow-lg animate-window-open"
            onClick={e => e.stopPropagation()}
          >
            {onToggleSize && (
              <button
                onClick={() => {
                  sounds.playClick()
                  onToggleSize()
                }}
                className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white"
                title="Toggle Size"
              >
                {size === 'sm' ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
              </button>
            )}
            {onRemove && (
              <button
                onClick={() => {
                  sounds.playClick()
                  onRemove()
                }}
                className="p-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300"
                title="Remove from Dashboard"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
        <div className="w-full h-full flex flex-col">{children}</div>
      </div>
    )
  }

  return (
    <div
      onClick={onClick}
      className={cn(
        'liquid-glass rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 flex flex-col justify-between group transition-all duration-300 relative w-full max-w-full',
        isEditMode && 'ring-2 ring-indigo-500/70 border-indigo-400/50',
        sizeMap[size],
        className
      )}
    >
      <div className="glass-specular" />

      {/* Widget Header */}
      <div className="flex items-center justify-between gap-2 pb-2 mb-1 relative z-10 shrink-0">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 group-hover:text-indigo-300 transition">
          {icon && <span className="text-indigo-400">{icon}</span>}
          <span className="truncate">{title}</span>
        </div>

        {/* Actions / Edit Mode buttons */}
        <div className="flex items-center gap-1">
          {onRefresh && !isEditMode && (
            <button
              onClick={e => {
                e.stopPropagation()
                sounds.playClick()
                onRefresh()
              }}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition opacity-0 group-hover:opacity-100"
              title="Refresh"
            >
              <RotateCw className={cn('w-3.5 h-3.5', isRefreshing && 'animate-spin text-indigo-400')} />
            </button>
          )}

          {isEditMode && (
            <div className="flex items-center gap-1 animate-window-open" onClick={e => e.stopPropagation()}>
              {onToggleSize && (
                <button
                  onClick={() => {
                    sounds.playClick()
                    onToggleSize()
                  }}
                  className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white text-[10px]"
                  title="Toggle Size"
                >
                  {size === 'sm' ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
                </button>
              )}
              {onRemove && (
                <button
                  onClick={() => {
                    sounds.playClick()
                    onRemove()
                  }}
                  className="p-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-[10px]"
                  title="Remove from Dashboard"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Widget Body */}
      <div className="flex-1 relative z-10 flex flex-col justify-center">{children}</div>
    </div>
  )
}
