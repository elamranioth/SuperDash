import { getAppById } from '@/registry/appRegistry'
import { sounds } from '@/utils/sound'

interface DockProps {
  openAppIds: string[]
  minimizedAppIds: string[]
  activeAppId: string | null
  onOpenApp: (appId: string) => void
  onRestoreApp: (appId: string) => void
}

export default function Dock({
  openAppIds,
  minimizedAppIds,
  activeAppId,
  onOpenApp,
  onRestoreApp
}: DockProps) {
  if (openAppIds.length === 0) return null

  return (
    <div className="hidden sm:block fixed bottom-4 left-1/2 -translate-x-1/2 z-30 animate-window-open">
      <div className="glass-panel px-3 py-2 rounded-2xl flex items-center gap-2 shadow-2xl border border-white/15">
        {openAppIds.map(id => {
          const app = getAppById(id)
          if (!app) return null
          const Icon = app.icon
          const isMinimized = minimizedAppIds.includes(id)
          const isActive = activeAppId === id && !isMinimized

          return (
            <button
              key={id}
              onClick={() => {
                sounds.playClick()
                if (isMinimized) {
                  onRestoreApp(id)
                } else {
                  onOpenApp(id)
                }
              }}
              className={`relative p-2 rounded-xl transition-all duration-200 group flex flex-col items-center ${
                isActive
                  ? 'bg-white/20 scale-105 shadow-md'
                  : isMinimized
                  ? 'opacity-60 hover:opacity-100 hover:bg-white/10'
                  : 'hover:bg-white/10'
              }`}
              title={`${app.name}${isMinimized ? ' (Minimized)' : ''}`}
            >
              <div className={`p-1.5 rounded-lg bg-gradient-to-br ${app.gradient} text-white shadow-sm`}>
                <Icon className="w-5 h-5" />
              </div>

              {/* Indicator dot under app icon */}
              <div
                className={`w-1 h-1 rounded-full mt-1 transition-all ${
                  isActive ? 'bg-indigo-400 w-2' : isMinimized ? 'bg-amber-400' : 'bg-slate-400'
                }`}
              />

              {/* Tooltip */}
              <span className="absolute -top-8 px-2 py-0.5 rounded-md bg-slate-900/90 border border-white/10 text-[10px] text-white opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow">
                {app.name}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
