import { Suspense } from 'react'
import { X, Minus, Maximize2, Minimize2, Loader2, ChevronLeft } from 'lucide-react'
import { getAppById } from '@/registry/appRegistry'
import { DashboardSettings } from '@/types'
import { sounds } from '@/utils/sound'
import { AppErrorBoundary } from '@/components/Common/AppErrorBoundary'

interface AppWindowProps {
  appId: string
  isMinimized: boolean
  isMaximized: boolean
  onClose: (appId: string) => void
  onMinimize: (appId: string) => void
  onToggleMaximize: (appId: string) => void
  onSettingsChange?: (newSettings: DashboardSettings) => void
  appProps?: Record<string, unknown>
}

export default function AppWindow({
  appId,
  isMinimized,
  isMaximized,
  onClose,
  onMinimize,
  onToggleMaximize,
  onSettingsChange,
  appProps
}: AppWindowProps) {
  const app = getAppById(appId)
  if (!app) return null

  const AppComponent = app.component
  const Icon = app.icon

  // If minimized, keep rendered in background to preserve state without showing
  if (isMinimized) {
    return (
      <div className="hidden">
        <Suspense fallback={null}>
          <AppErrorBoundary appName={app.name} onClose={() => onClose(appId)}>
            <AppComponent onSettingsChange={onSettingsChange} {...appProps} />
          </AppErrorBoundary>
        </Suspense>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-40 bg-slate-950 sm:bg-black/60 sm:backdrop-blur-md flex items-center justify-center p-0 sm:p-2 md:p-3 overflow-hidden transition-all duration-200">
      <div
        className={`liquid-glass-heavy border-0 sm:border sm:border-white/20 rounded-none sm:rounded-2xl md:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-window-open transition-all duration-300 w-full max-w-full relative h-[100dvh] max-h-[100dvh] ${
          isMaximized
            ? 'sm:h-[100dvh] sm:max-h-[100dvh] sm:rounded-none'
            : 'sm:max-w-5xl sm:h-[min(90dvh,820px)] sm:max-h-[calc(100dvh-1rem)] md:sm:max-h-[calc(100dvh-1.5rem)]'
        }`}
      >
        <div className="glass-specular hidden sm:block" />

        {/* Window Title Bar - Always Visible, Sticky, Never Pushed Off-Screen */}
        <div className="h-12 bg-slate-900/95 sm:bg-black/50 border-b border-white/10 px-2 sm:px-4 flex items-center justify-between select-none shrink-0 relative z-30 pt-[env(safe-area-inset-top,0px)]">
          {/* Mobile Back Button (left side) */}
          <div className="flex sm:hidden items-center">
            <button
              onClick={() => {
                sounds.playClick()
                onClose(appId)
              }}
              className="min-w-[40px] min-h-[40px] p-1.5 -ml-1 text-slate-300 hover:text-white active:scale-90 flex items-center justify-center transition"
              title="Back to Dashboard"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>

          {/* Desktop Traffic Light Controls */}
          <div className="hidden sm:flex items-center gap-2 group/lights">
            <button
              onClick={() => {
                sounds.playClick()
                onClose(appId)
              }}
              className="w-3.5 h-3.5 rounded-full bg-rose-500 hover:bg-rose-600 flex items-center justify-center text-rose-950 transition shadow-sm"
              title="Close"
            >
              <X className="w-2.5 h-2.5 opacity-0 group-hover/lights:opacity-100 transition-opacity" />
            </button>

            <button
              onClick={() => {
                sounds.playClick()
                onMinimize(appId)
              }}
              className="w-3.5 h-3.5 rounded-full bg-amber-500 hover:bg-amber-600 flex items-center justify-center text-amber-950 transition shadow-sm"
              title="Minimize"
            >
              <Minus className="w-2.5 h-2.5 opacity-0 group-hover/lights:opacity-100 transition-opacity" />
            </button>

            <button
              onClick={() => {
                sounds.playClick()
                onToggleMaximize(appId)
              }}
              className="w-3.5 h-3.5 rounded-full bg-emerald-500 hover:bg-emerald-600 flex items-center justify-center text-emerald-950 transition shadow-sm"
              title={isMaximized ? 'Restore' : 'Maximize'}
            >
              {isMaximized ? (
                <Minimize2 className="w-2.5 h-2.5 opacity-0 group-hover/lights:opacity-100 transition-opacity" />
              ) : (
                <Maximize2 className="w-2.5 h-2.5 opacity-0 group-hover/lights:opacity-100 transition-opacity" />
              )}
            </button>
          </div>

          {/* App Title & Icon */}
          <div className="flex items-center gap-2 text-slate-200 min-w-0 flex-1 justify-center sm:justify-start px-2">
            <div className={`p-1.5 sm:p-1 rounded-xl sm:rounded-lg bg-gradient-to-br ${app.gradient} text-white shadow-sm shrink-0`}>
              <Icon className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
            </div>
            <span className="text-sm sm:text-xs font-semibold tracking-wide truncate">{app.name}</span>
          </div>

          {/* Right Action: Permanent Close X button visible on ALL screen sizes */}
          <div className="flex items-center justify-end">
            <button
              onClick={() => {
                sounds.playClick()
                onClose(appId)
              }}
              className="min-w-[40px] min-h-[40px] sm:min-w-0 sm:min-h-0 p-2 sm:p-1.5 -mr-1 text-slate-400 hover:text-white hover:bg-white/10 active:scale-95 rounded-xl flex items-center justify-center transition"
              title="Close window (Esc)"
              aria-label="Close window"
            >
              <X className="w-5 h-5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>

        {/* Window Content Canvas - Strict Min-H-0 and Flex Layout for Internal Scrolling */}
        <div className="flex-1 min-h-0 overflow-hidden relative bg-slate-950/90 z-10 w-full max-w-full flex flex-col pb-[env(safe-area-inset-bottom,0px)]">
          <Suspense
            fallback={
              <div className="flex h-full w-full items-center justify-center text-slate-500 gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                <span className="text-xs">Loading application...</span>
              </div>
            }
          >
            <AppErrorBoundary appName={app.name} onClose={() => onClose(appId)}>
              <AppComponent onSettingsChange={onSettingsChange} {...appProps} />
            </AppErrorBoundary>
          </Suspense>
        </div>
      </div>
    </div>
  )
}
