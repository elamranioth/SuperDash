import {
  Sun,
  Moon,
  Volume2,
  VolumeX,
  Clock,
  Flame,
  Sparkles,
  Sliders,
  Palette,
  X
} from 'lucide-react'
import { DashboardSettings, ThemeMode } from '@/types'
import { WALLPAPER_COLLECTION } from '@/services/storage'
import { timerService } from '@/services/timer'
import { sounds } from '@/utils/sound'
import GlassPanel from '@/components/LiquidGlass/GlassPanel'

interface ControlCenterProps {
  isOpen: boolean
  onClose: () => void
  settings: DashboardSettings
  onUpdateSettings: (newSettings: Partial<DashboardSettings>) => void
  onOpenApp: (appId: string) => void
}

export default function ControlCenter({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onOpenApp
}: ControlCenterProps) {
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
    onOpenApp('timer')
    onClose()
  }

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-start justify-end p-4 md:p-6 select-none animate-window-open"
    >
      <div
        onClick={e => e.stopPropagation()}
        className="w-full max-w-sm liquid-glass-heavy rounded-3xl p-5 shadow-2xl space-y-4 relative"
      >
        <div className="glass-specular" />

        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-white/10 relative z-10">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Control Center</span>
          </div>

          <button
            onClick={() => {
              sounds.playClick()
              onClose()
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 2x2 Quick Tile Controls */}
        <div className="grid grid-cols-2 gap-2.5 relative z-10">
          {/* Light / Dark Mode Tile */}
          <button
            onClick={handleToggleTheme}
            className="p-3.5 rounded-2xl liquid-glass flex flex-col items-center justify-center gap-1.5 hover:bg-white/15 transition active:scale-95"
          >
            {settings.theme === 'dark' ? (
              <Moon className="w-5 h-5 text-indigo-400" />
            ) : (
              <Sun className="w-5 h-5 text-amber-400" />
            )}
            <span className="text-xs font-semibold text-white capitalize">{settings.theme} Mode</span>
          </button>

          {/* Sound Mute / Unmute */}
          <button
            onClick={handleToggleSound}
            className="p-3.5 rounded-2xl liquid-glass flex flex-col items-center justify-center gap-1.5 hover:bg-white/15 transition active:scale-95"
          >
            {settings.soundEnabled ? (
              <Volume2 className="w-5 h-5 text-emerald-400" />
            ) : (
              <VolumeX className="w-5 h-5 text-rose-400" />
            )}
            <span className="text-xs font-semibold text-white">
              {settings.soundEnabled ? 'Audio On' : 'Muted'}
            </span>
          </button>

          {/* 12h / 24h Clock */}
          <button
            onClick={handleToggleClock}
            className="p-3.5 rounded-2xl liquid-glass flex flex-col items-center justify-center gap-1.5 hover:bg-white/15 transition active:scale-95"
          >
            <Clock className="w-5 h-5 text-sky-400" />
            <span className="text-xs font-semibold text-white">{settings.clockFormat.toUpperCase()} Clock</span>
          </button>

          {/* Start 25m Focus */}
          <button
            onClick={handleStartQuickFocus}
            className="p-3.5 rounded-2xl bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-400/40 text-white flex flex-col items-center justify-center gap-1.5 transition active:scale-95 shadow-lg shadow-indigo-600/20"
          >
            <Flame className="w-5 h-5 text-amber-400 fill-amber-400" />
            <span className="text-xs font-semibold">25m Focus</span>
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
