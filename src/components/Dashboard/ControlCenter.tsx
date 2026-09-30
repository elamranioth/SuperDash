import { useEffect, useState } from 'react'
import {
  Sun,
  Moon,
  Volume2,
  VolumeX,
  Clock,
  Flame,
  Sliders,
  Palette,
  X,
  PencilRuler,
  Bell,
  Settings as SettingsIcon,
  Check
} from 'lucide-react'
import { DashboardSettings, ThemeMode } from '@/types'
import { WALLPAPER_COLLECTION } from '@/services/storage'
import { timerService } from '@/services/timer'
import { notificationService } from '@/services/notifications'
import { sounds } from '@/utils/sound'

interface ControlCenterProps {
  isOpen: boolean
  onClose: () => void
  settings: DashboardSettings
  onUpdateSettings: (newSettings: Partial<DashboardSettings>) => void
  onOpenApp: (appId: string) => void
  isEditMode?: boolean
  onToggleEditMode?: () => void
}

export default function ControlCenter({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onOpenApp,
  isEditMode = false,
  onToggleEditMode
}: ControlCenterProps) {
  const [unreadCount, setUnreadCount] = useState(notificationService.getUnreadCount())

  useEffect(() => {
    const unsub = notificationService.subscribe(() => {
      setUnreadCount(notificationService.getUnreadCount())
    })
    return unsub
  }, [])

  // Lock background scroll when sheet is open
  useEffect(() => {
    if (isOpen) {
      const prevOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = prevOverflow
      }
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleToggleTheme = () => {
    sounds.playClick()
    const next: ThemeMode = settings.theme === 'dark' ? 'light' : 'dark'
    onUpdateSettings({ theme: next })
  }

  const handleToggleSound = () => {
    sounds.playClick()
    onUpdateSettings({ soundEnabled: !settings.soundEnabled })
  }

  const handleToggleClock = () => {
    sounds.playClick()
    onUpdateSettings({ clockFormat: settings.clockFormat === '12h' ? '24h' : '12h' })
  }

  const handleStartQuickFocus = () => {
    sounds.playSuccess()
    timerService.setMode('pomodoro')
    timerService.startTimer(25 * 60)
    onOpenApp('time')
    onClose()
  }

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-end md:items-start justify-center md:justify-end md:p-6 select-none animate-window-open"
    >
      <div
        onClick={e => e.stopPropagation()}
        className="w-full max-w-lg md:max-w-sm liquid-glass-heavy rounded-t-3xl md:rounded-3xl p-5 shadow-2xl space-y-4 relative max-h-[70dvh] md:max-h-[85vh] overflow-y-auto pb-[max(1.5rem,env(safe-area-inset-bottom,0px))] md:pb-5 border-t border-x md:border border-white/20 animate-bottom-sheet md:animate-window-open"
      >
        {/* Grab Handle for Mobile */}
        <div className="w-12 h-1.5 rounded-full bg-white/25 mx-auto -mt-1 mb-2 md:hidden" />

        <div className="glass-specular" />

        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-white/10 relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[10px] text-white font-black">
              S
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Quick Controls
            </span>
          </div>

          <button
            onClick={() => {
              sounds.playClick()
              onClose()
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-white transition"
            aria-label="Close Controls"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Primary 2x2 Quick Control Grid */}
        <div className="grid grid-cols-2 gap-2.5 relative z-10">
          {/* 1. Theme Toggle */}
          <button
            onClick={handleToggleTheme}
            className="p-3 rounded-2xl liquid-glass flex items-center gap-3 text-left hover:bg-white/15 transition active:scale-95 border border-white/10"
          >
            {settings.theme === 'dark' ? (
              <Moon className="w-5 h-5 text-indigo-400 shrink-0" />
            ) : (
              <Sun className="w-5 h-5 text-amber-400 shrink-0" />
            )}
            <div className="truncate">
              <div className="text-xs font-semibold text-white capitalize">{settings.theme} Mode</div>
              <div className="text-[10px] text-slate-400">Tap to toggle</div>
            </div>
          </button>

          {/* 2. Edit Dashboard Mode */}
          <button
            onClick={() => {
              sounds.playClick()
              if (onToggleEditMode) onToggleEditMode()
            }}
            className={`p-3 rounded-2xl border flex items-center gap-3 text-left active:scale-95 transition ${
              isEditMode
                ? 'bg-amber-500/25 border-amber-400/60 text-amber-200 shadow-md shadow-amber-500/10'
                : 'liquid-glass hover:bg-white/15 border-white/10 text-white'
            }`}
          >
            {isEditMode ? (
              <Check className="w-5 h-5 text-amber-400 shrink-0" />
            ) : (
              <PencilRuler className="w-5 h-5 text-amber-400 shrink-0" />
            )}
            <div className="truncate">
              <div className="text-xs font-semibold text-white">
                {isEditMode ? 'Done Editing' : 'Edit Mode'}
              </div>
              <div className="text-[10px] text-slate-400">
                {isEditMode ? 'Layout active' : 'Rearrange widgets'}
              </div>
            </div>
          </button>

          {/* 3. Notifications / Tasks */}
          <button
            onClick={() => {
              sounds.playClick()
              onOpenApp('tasks')
              onClose()
            }}
            className="p-3 rounded-2xl liquid-glass flex items-center gap-3 text-left hover:bg-white/15 transition active:scale-95 border border-white/10 relative"
          >
            <Bell className="w-5 h-5 text-rose-400 shrink-0" />
            <div className="truncate">
              <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                )}
              </div>
              <div className="text-[10px] text-slate-400">
                {unreadCount > 0 ? `${unreadCount} unread alert${unreadCount > 1 ? 's' : ''}` : 'Tasks & alerts'}
              </div>
            </div>
          </button>

          {/* 4. Settings */}
          <button
            onClick={() => {
              sounds.playClick()
              onOpenApp('settings')
              onClose()
            }}
            className="p-3 rounded-2xl liquid-glass flex items-center gap-3 text-left hover:bg-white/15 transition active:scale-95 border border-white/10"
          >
            <SettingsIcon className="w-5 h-5 text-cyan-400 shrink-0" />
            <div className="truncate">
              <div className="text-xs font-semibold text-white">Settings</div>
              <div className="text-[10px] text-slate-400">System & updates</div>
            </div>
          </button>
        </div>

        {/* Secondary Toggles (Audio, Clock, Focus) */}
        <div className="grid grid-cols-3 gap-2 relative z-10 pt-1">
          {/* Sound Mute / Unmute */}
          <button
            onClick={handleToggleSound}
            className="p-2.5 rounded-xl liquid-glass flex flex-col items-center justify-center gap-1 hover:bg-white/15 transition active:scale-95 border border-white/5"
          >
            {settings.soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-rose-400" />
            )}
            <span className="text-[10px] font-semibold text-white">
              {settings.soundEnabled ? 'Audio On' : 'Muted'}
            </span>
          </button>

          {/* 12h / 24h Clock */}
          <button
            onClick={handleToggleClock}
            className="p-2.5 rounded-xl liquid-glass flex flex-col items-center justify-center gap-1 hover:bg-white/15 transition active:scale-95 border border-white/5"
          >
            <Clock className="w-4 h-4 text-sky-400" />
            <span className="text-[10px] font-semibold text-white">
              {settings.clockFormat.toUpperCase()} Clock
            </span>
          </button>

          {/* Start 25m Focus */}
          <button
            onClick={handleStartQuickFocus}
            className="p-2.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-400/40 text-white flex flex-col items-center justify-center gap-1 transition active:scale-95"
          >
            <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span className="text-[10px] font-semibold">25m Focus</span>
          </button>
        </div>

        {/* Liquid Glass Sliders */}
        <div className="space-y-3 relative z-10 pt-2 border-t border-white/10">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
              <span>Glass Transparency</span>
              <span className="font-mono text-indigo-400">{settings.glassOpacity}%</span>
            </div>
            <input
              type="range"
              min="20"
              max="95"
              value={settings.glassOpacity}
              onChange={e => onUpdateSettings({ glassOpacity: parseInt(e.target.value) })}
              className="w-full accent-indigo-500 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
              <span>Backdrop Blur</span>
              <span className="font-mono text-indigo-400">{settings.glassBlur}px</span>
            </div>
            <input
              type="range"
              min="8"
              max="40"
              value={settings.glassBlur}
              onChange={e => onUpdateSettings({ glassBlur: parseInt(e.target.value) })}
              className="w-full accent-indigo-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Quick Wallpaper Switcher */}
        <div className="space-y-2 relative z-10 pt-2 border-t border-white/10">
          <div className="flex items-center justify-between text-xs text-slate-300">
            <span className="flex items-center gap-1">
              <Palette className="w-3.5 h-3.5 text-indigo-400" /> Quick Wallpapers
            </span>
            <button
              onClick={() => {
                onOpenApp('settings')
                onClose()
              }}
              className="text-[10px] text-indigo-400 hover:underline"
            >
              All Wallpapers
            </button>
          </div>

          <div className="grid grid-cols-4 gap-1.5">
            {WALLPAPER_COLLECTION.slice(0, 4).map(w => (
              <button
                key={w.id}
                onClick={() => {
                  sounds.playClick()
                  onUpdateSettings({ wallpaper: w.id })
                }}
                className={`h-10 rounded-xl bg-gradient-to-br ${w.preview} border transition ${
                  settings.wallpaper === w.id
                    ? 'ring-2 ring-indigo-500 border-white/50 scale-105'
                    : 'border-white/10 opacity-70 hover:opacity-100'
                }`}
                title={w.name}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
