import { useState, useEffect } from 'react'
import {
  Search,
  Moon,
  Sun,
  Maximize,
  Minimize,
  Sliders,
  SlidersHorizontal,
  PencilRuler,
  Bell,
  Check,
  ChevronDown,
  Plus
} from 'lucide-react'
import { ThemeMode, DashboardDefinition } from '@/types'
import { notificationService } from '@/services/notifications'
import { dashboardRepository } from '@/services/dashboardBuilder'
import { sounds } from '@/utils/sound'

interface TopMenuBarProps {
  theme: ThemeMode
  onToggleTheme: () => void
  onOpenSearch: () => void
  onOpenApp: (appId: string) => void
  clockFormat: '12h' | '24h'
  isEditMode: boolean
  onToggleEditMode: () => void
  onOpenControlCenter: () => void
  onOpenReminders: () => void
}

export default function TopMenuBar({
  theme,
  onToggleTheme,
  onOpenSearch,
  onOpenApp,
  clockFormat,
  isEditMode,
  onToggleEditMode,
  onOpenControlCenter,
  onOpenReminders
}: TopMenuBarProps) {
  const [time, setTime] = useState(new Date())
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(notificationService.getUnreadCount())
  const [dashboards, setDashboards] = useState<DashboardDefinition[]>([])
  const [activeDashboard, setActiveDashboard] = useState<DashboardDefinition | null>(null)
  const [isDashboardMenuOpen, setIsDashboardMenuOpen] = useState(false)

  const loadDashboards = async () => {
    const list = await dashboardRepository.getAllDashboards()
    setDashboards(list)
    const active = await dashboardRepository.getActiveDashboard()
    setActiveDashboard(active)
  }

  useEffect(() => {
    loadDashboards()
    const unsubDash = dashboardRepository.subscribe(() => {
      loadDashboards()
    })
    const timer = setInterval(() => setTime(new Date()), 1000)
    const unsub = notificationService.subscribe(() => {
      setUnreadCount(notificationService.getUnreadCount())
    })
    return () => {
      clearInterval(timer)
      unsub()
      unsubDash()
    }
  }, [])

  const toggleFullscreen = () => {
    sounds.playClick()
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {})
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {})
    }
  }

  const timeStr = time.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
    hour12: clockFormat === '12h'
  })

  const dateShort = time.toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  })

  const [isMobileActionsOpen, setIsMobileActionsOpen] = useState(false)

  return (
    <header className="min-h-[44px] md:h-9 px-3 sm:px-4 flex items-center justify-between text-xs select-none bg-black/50 backdrop-blur-xl border-b border-white/10 text-slate-300 z-30 relative shadow-sm pt-[env(safe-area-inset-top,0px)]">
      {/* Left: OS Branding & Menu */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <button
          onClick={() => {
            sounds.playClick()
            onOpenApp('settings')
          }}
          className="flex items-center gap-1.5 font-bold tracking-tight text-white hover:text-indigo-400 transition py-1"
        >
          <div className="w-5 h-5 sm:w-4 sm:h-4 rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[11px] sm:text-[10px] text-white font-black shadow-sm">
            S
          </div>
          <span className="font-semibold text-xs tracking-tight">SuperDash</span>
        </button>

        <span className="text-white/20 hidden sm:inline">|</span>

        {/* Workspace / Dashboard Switcher */}
        <div className="relative">
          <button
            onClick={() => {
              sounds.playClick()
              setIsDashboardMenuOpen(!isDashboardMenuOpen)
            }}
            className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition font-medium text-xs"
            title="Switch Dashboard Workspace"
          >
            <span className="font-semibold text-white truncate max-w-[90px] sm:max-w-[140px]">
              {activeDashboard?.name || 'Home'}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
          </button>

          {isDashboardMenuOpen && (
            <div
              onClick={() => setIsDashboardMenuOpen(false)}
              className="fixed inset-0 z-40"
            />
          )}

          {isDashboardMenuOpen && (
            <div className="absolute left-0 top-full mt-1.5 w-48 py-1.5 rounded-2xl liquid-glass-heavy border border-white/15 shadow-2xl z-50 text-xs animate-window-open">
              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Workspaces
              </div>
              {dashboards.map(dash => (
                <button
                  key={dash.id}
                  onClick={() => {
                    sounds.playClick()
                    dashboardRepository.setActiveDashboard(dash.id)
                    setIsDashboardMenuOpen(false)
                  }}
                  className={`w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-white/10 transition ${
                    dash.id === activeDashboard?.id
                      ? 'text-indigo-300 font-semibold'
                      : 'text-slate-300'
                  }`}
                >
                  <span className="truncate">{dash.name}</span>
                  {dash.id === activeDashboard?.id && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-mono">
                      Active
                    </span>
                  )}
                </button>
              ))}

              <div className="border-t border-white/10 my-1" />

              <button
                onClick={() => {
                  sounds.playClick()
                  setIsDashboardMenuOpen(false)
                  onOpenApp('dashboardbuilder')
                }}
                className="w-full px-3 py-1.5 text-left text-indigo-400 hover:text-indigo-300 hover:bg-white/10 flex items-center gap-1.5 font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Manage Dashboards</span>
              </button>
            </div>
          )}
        </div>

        <nav className="hidden lg:flex items-center gap-3 text-slate-400 text-[11px]">
          <button onClick={() => onOpenApp('notes')} className="hover:text-white transition">
            Notes
          </button>
          <button onClick={() => onOpenApp('tasks')} className="hover:text-white transition">
            Tasks
          </button>
          <button onClick={() => onOpenApp('calendar')} className="hover:text-white transition">
            Calendar
          </button>
          <button onClick={() => onOpenApp('files')} className="hover:text-white transition">
            Files
          </button>
        </nav>
      </div>

      {/* Mobile Top Bar Controls (< md) */}
      <div className="flex md:hidden items-center gap-1">
        <button
          onClick={() => {
            sounds.playClick()
            onOpenSearch()
          }}
          className="p-2 rounded-xl text-slate-300 hover:text-white active:bg-white/10 transition touch-manipulation"
          title="Search"
        >
          <Search className="w-4 h-4 text-indigo-400" />
        </button>

        {unreadCount > 0 && (
          <button
            onClick={() => {
              sounds.playClick()
              onOpenReminders()
            }}
            className="p-2 rounded-xl text-slate-300 hover:text-white relative active:bg-white/10 transition touch-manipulation"
            title="Notifications"
          >
            <Bell className="w-4 h-4 text-amber-400" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500" />
          </button>
        )}

        <button
          onClick={() => {
            sounds.playClick()
            setIsMobileActionsOpen(true)
          }}
          className="p-2 rounded-xl text-slate-300 hover:text-white active:bg-white/10 transition touch-manipulation"
          title="Options"
        >
          <SlidersHorizontal className="w-4 h-4 text-slate-200" />
        </button>
      </div>

      {/* Desktop Top Bar Controls (>= md) */}
      <div className="hidden md:flex items-center gap-2 sm:gap-3">
        {/* Open Dashboard Builder */}
        <button
          onClick={() => {
            sounds.playClick()
            onOpenApp('dashboardbuilder')
          }}
          className="flex items-center gap-1 px-2 py-1 rounded-xl text-[11px] font-semibold transition border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white"
          title="Open Dashboard Builder (B)"
        >
          <PencilRuler className="w-3 h-3 text-indigo-400" />
          <span>Builder</span>
        </button>

        {/* Edit Dashboard Mode Toggle */}
        <button
          onClick={() => {
            sounds.playClick()
            onToggleEditMode()
          }}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-semibold transition border ${
            isEditMode
              ? 'bg-amber-500 text-black border-amber-400 shadow-md shadow-amber-500/20'
              : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300'
          }`}
          title={isEditMode ? 'Exit Edit Mode' : 'Quick Rearrange Widgets'}
        >
          {isEditMode ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Done Editing</span>
            </>
          ) : (
            <>
              <PencilRuler className="w-3.5 h-3.5 text-indigo-400" />
              <span>Edit Dashboard</span>
            </>
          )}
        </button>

        {/* Spotlight Trigger */}
        <button
          onClick={() => {
            sounds.playClick()
            onOpenSearch()
          }}
          className="p-1 rounded-md hover:bg-white/10 text-slate-400 hover:text-white transition flex items-center gap-1"
          title="Spotlight Search (⌘K)"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="hidden lg:inline text-[10px] font-mono text-slate-400">⌘K</span>
        </button>

        {/* Notifications / Reminders Bell */}
        <button
          onClick={() => {
            sounds.playClick()
            onOpenReminders()
          }}
          className="p-1 rounded-md hover:bg-white/10 text-slate-400 hover:text-white transition relative"
          title="Reminders & Notifications"
        >
          <Bell className="w-3.5 h-3.5" />
          {unreadCount > 0 && (
            <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-rose-500" />
          )}
        </button>

        {/* Floating Control Center Button */}
        <button
          onClick={() => {
            sounds.playClick()
            onOpenControlCenter()
          }}
          className="p-1 rounded-md hover:bg-white/10 text-slate-400 hover:text-white transition"
          title="Control Center"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
        </button>

        {/* Quick Theme Toggle */}
        <button
          onClick={() => {
            sounds.playClick()
            onToggleTheme()
          }}
          className="p-1 rounded-md hover:bg-white/10 text-slate-400 hover:text-white transition"
          title="Toggle Theme"
        >
          {theme === 'light' ? (
            <Sun className="w-3.5 h-3.5 text-amber-400" />
          ) : (
            <Moon className="w-3.5 h-3.5 text-indigo-400" />
          )}
        </button>

        {/* Fullscreen Toggle */}
        <button
          onClick={toggleFullscreen}
          className="p-1 rounded-md hover:bg-white/10 text-slate-400 hover:text-white transition"
          title="Toggle Fullscreen"
        >
          {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
        </button>

        {/* Live Clock / Calendar jump */}
        <div
          onClick={() => {
            sounds.playClick()
            onOpenApp('calendar')
          }}
          className="flex items-center gap-1.5 font-mono text-[11px] text-slate-200 cursor-pointer hover:text-indigo-300 transition ml-1"
          title="Click to open calendar"
        >
          <span className="hidden lg:inline text-slate-400">{dateShort}</span>
          <span>{timeStr}</span>
        </div>
      </div>

      {/* Mobile Action Bottom Sheet */}
      {isMobileActionsOpen && (
        <div
          onClick={() => setIsMobileActionsOpen(false)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-end justify-center select-none"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="w-full max-w-lg liquid-glass-heavy rounded-t-3xl border-t border-x border-white/20 p-5 shadow-2xl space-y-4 animate-bottom-sheet max-h-[85vh] overflow-y-auto pb-[max(1.5rem,env(safe-area-inset-bottom,0px))]"
          >
            {/* Grab Handle */}
            <div className="w-12 h-1.5 rounded-full bg-white/20 mx-auto -mt-1 mb-2" />

            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[10px] text-white font-black">
                  S
                </div>
                <span className="font-bold text-sm text-white">SuperDash Controls</span>
              </div>
              <button
                onClick={() => setIsMobileActionsOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              {/* Theme Toggle */}
              <button
                onClick={() => {
                  onToggleTheme()
                  setIsMobileActionsOpen(false)
                }}
                className="p-3 rounded-2xl liquid-glass flex items-center gap-3 text-left hover:bg-white/10 active:scale-98 transition"
              >
                {theme === 'light' ? (
                  <Sun className="w-5 h-5 text-amber-400 shrink-0" />
                ) : (
                  <Moon className="w-5 h-5 text-indigo-400 shrink-0" />
                )}
                <div>
                  <div className="text-xs font-semibold text-white capitalize">{theme} Mode</div>
                  <div className="text-[10px] text-slate-400">Tap to toggle</div>
                </div>
              </button>

              {/* Control Center */}
              <button
                onClick={() => {
                  setIsMobileActionsOpen(false)
                  onOpenControlCenter()
                }}
                className="p-3 rounded-2xl liquid-glass flex items-center gap-3 text-left hover:bg-white/10 active:scale-98 transition"
              >
                <SlidersHorizontal className="w-5 h-5 text-indigo-400 shrink-0" />
                <div>
                  <div className="text-xs font-semibold text-white">Control Center</div>
                  <div className="text-[10px] text-slate-400">Glass & sliders</div>
                </div>
              </button>

              {/* Edit Mode Toggle */}
              <button
                onClick={() => {
                  onToggleEditMode()
                  setIsMobileActionsOpen(false)
                }}
                className={`p-3 rounded-2xl border flex items-center gap-3 text-left active:scale-98 transition ${
                  isEditMode
                    ? 'bg-amber-500/20 border-amber-400/50 text-amber-200'
                    : 'liquid-glass hover:bg-white/10 text-white'
                }`}
              >
                <PencilRuler className="w-5 h-5 text-amber-400 shrink-0" />
                <div>
                  <div className="text-xs font-semibold text-white">
                    {isEditMode ? 'Done Editing' : 'Edit Widgets'}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {isEditMode ? 'Exit edit mode' : 'Rearrange & add'}
                  </div>
                </div>
              </button>

              {/* Dashboard Builder */}
              <button
                onClick={() => {
                  setIsMobileActionsOpen(false)
                  onOpenApp('dashboardbuilder')
                }}
                className="p-3 rounded-2xl liquid-glass flex items-center gap-3 text-left hover:bg-white/10 active:scale-98 transition"
              >
                <Plus className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <div className="text-xs font-semibold text-white">Builder</div>
                  <div className="text-[10px] text-slate-400">Layout editor</div>
                </div>
              </button>
            </div>

            {/* Links List */}
            <div className="space-y-1 pt-2 border-t border-white/10">
              <button
                onClick={() => {
                  setIsMobileActionsOpen(false)
                  onOpenReminders()
                }}
                className="w-full p-2.5 rounded-xl hover:bg-white/10 flex items-center justify-between text-slate-200 transition"
              >
                <div className="flex items-center gap-2.5">
                  <Bell className="w-4 h-4 text-rose-400" />
                  <span className="text-xs font-medium">Reminders & Notifications</span>
                </div>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  setIsMobileActionsOpen(false)
                  onOpenApp('settings')
                }}
                className="w-full p-2.5 rounded-xl hover:bg-white/10 flex items-center justify-between text-slate-200 transition"
              >
                <div className="flex items-center gap-2.5">
                  <Sliders className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-medium">System Settings & Backups</span>
                </div>
                <span className="text-slate-500 text-xs">›</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
