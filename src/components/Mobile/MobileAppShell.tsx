import React, { ReactNode } from 'react'
import { ChevronLeft, MoreVertical } from 'lucide-react'
import { sounds } from '@/utils/sound'
import { cn } from '@/utils/cn'

export interface MobileAppShellProps {
  title: string
  subtitle?: string
  icon?: React.ComponentType<{ className?: string }>
  gradient?: string
  onBack?: () => void
  primaryAction?: {
    label: string
    icon?: React.ComponentType<{ className?: string }>
    onClick: () => void
    disabled?: boolean
  }
  menuItems?: Array<{
    label: string
    icon?: React.ComponentType<{ className?: string }>
    onClick: () => void
    danger?: boolean
  }>
  headerExtra?: ReactNode
  children: ReactNode
  className?: string
  contentClassName?: string
  noPadding?: boolean
}

export default function MobileAppShell({
  title,
  subtitle,
  icon: Icon,
  gradient = 'from-indigo-500 to-purple-600',
  onBack,
  primaryAction,
  menuItems,
  headerExtra,
  children,
  className,
  contentClassName,
  noPadding = false
}: MobileAppShellProps) {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false)

  return (
    <div
      className={cn(
        'w-full h-full flex flex-col bg-slate-950 text-slate-100 overflow-hidden relative select-none',
        className
      )}
    >
      {/* Mobile Top Header (Sticky / Z-Layer 10) */}
      <header className="shrink-0 bg-slate-900/90 backdrop-blur-xl border-b border-white/10 px-3 py-2.5 flex items-center justify-between gap-2 relative z-10 pt-[max(0.6rem,env(safe-area-inset-top,0px))]">
        {/* Left: Back button + Icon + Title */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {onBack && (
            <button
              onClick={() => {
                sounds.playClick()
                onBack()
              }}
              className="min-w-[40px] min-h-[40px] p-2 -ml-1 text-slate-400 hover:text-white active:scale-95 flex items-center justify-center rounded-xl hover:bg-white/5 transition shrink-0"
              title="Back"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          {Icon && (
            <div
              className={cn(
                'w-8 h-8 rounded-xl bg-gradient-to-br flex items-center justify-center text-white shadow-sm shrink-0',
                gradient
              )}
            >
              <Icon className="w-4 h-4" />
            </div>
          )}

          <div className="flex flex-col min-w-0 flex-1">
            <h1 className="text-sm font-semibold text-white tracking-tight truncate leading-tight">
              {title}
            </h1>
            {subtitle && (
              <span className="text-[11px] text-slate-400 truncate leading-tight">
                {subtitle}
              </span>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {primaryAction && (
            <button
              onClick={() => {
                sounds.playClick()
                primaryAction.onClick()
              }}
              disabled={primaryAction.disabled}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition disabled:opacity-50"
            >
              {primaryAction.icon && <primaryAction.icon className="w-3.5 h-3.5" />}
              <span>{primaryAction.label}</span>
            </button>
          )}

          {menuItems && menuItems.length > 0 && (
            <div className="relative">
              <button
                onClick={() => {
                  sounds.playClick()
                  setIsMenuOpen(prev => !prev)
                }}
                className="min-w-[40px] min-h-[40px] p-2 text-slate-400 hover:text-white active:bg-white/10 rounded-xl flex items-center justify-center transition"
                title="Options"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {isMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setIsMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-1 w-48 rounded-2xl bg-slate-900 border border-white/15 shadow-2xl p-1.5 z-40 animate-window-open">
                    {menuItems.map((item, idx) => {
                      const ItemIcon = item.icon
                      return (
                        <button
                          key={idx}
                          onClick={() => {
                            setIsMenuOpen(false)
                            sounds.playClick()
                            item.onClick()
                          }}
                          className={cn(
                            'w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition text-left',
                            item.danger
                              ? 'text-rose-400 hover:bg-rose-500/10'
                              : 'text-slate-200 hover:bg-white/10 hover:text-white'
                          )}
                        >
                          {ItemIcon && <ItemIcon className="w-4 h-4 shrink-0" />}
                          <span className="truncate">{item.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Sub-header or tab rail if provided */}
      {headerExtra && <div className="shrink-0 z-10">{headerExtra}</div>}

      {/* Scrollable Content Viewport */}
      <main
        className={cn(
          'flex-1 overflow-y-auto overflow-x-hidden min-w-0 w-full max-w-full pb-[max(1rem,env(safe-area-inset-bottom,0px))]',
          noPadding ? 'p-0' : 'p-3.5 sm:p-5',
          contentClassName
        )}
      >
        {children}
      </main>
    </div>
  )
}
