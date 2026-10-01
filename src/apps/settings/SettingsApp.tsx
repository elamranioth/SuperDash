import { useState, useEffect } from 'react'
import {
  Sun,
  Moon,
  Clock,
  Layout,
  Eye,
  EyeOff,
  RotateCcw,
  Sliders,
  Palette,
  Volume2,
  Sparkles,
  Hourglass,
  Accessibility,
  HardDrive,
  Info,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Upload,
  Grid,
  Bell
} from 'lucide-react'
import {
  DashboardSettings,
  ThemeMode,
  TimerVisualMode,
  TimerSound,
  WallpaperCategory
} from '@/types'
import { storageService, DEFAULT_SETTINGS, WALLPAPER_COLLECTION } from '@/services/storage'
import { sounds } from '@/utils/sound'
import AppHeader from '@/components/AppWindow/AppHeader'
import GlassPanel from '@/components/LiquidGlass/GlassPanel'
import UpdatesApp from '@/apps/updates/UpdatesApp'
import DataBackupSettings from '@/apps/settings/DataBackupSettings'
import AboutDiagnosticsSettings from '@/apps/settings/AboutDiagnosticsSettings'
import { updateService } from '@/services/updateService'

const APP_META: Record<string, string> = {
  notes: 'Notes',
  calendar: 'Calendar',
  tasks: 'Tasks',
  ideas: 'Ideas',
  decisionbook: 'Decision Book',
  collections: 'Collections',
  reader: 'Reader',
  live: 'Live',
  hearings: 'Hearings',
  finance: 'Finance',
  growth: 'Growth',
  calculator: 'Calculator',
  time: 'Time',
  weather: 'Weather',
  files: 'Files',
  settings: 'Settings'
}

export type SettingsTabId =
  | 'appearance'
  | 'dashboard'
  | 'apps'
  | 'notifications'
  | 'data'
  | 'updates'
  | 'accessibility'
  | 'about'

interface SettingsAppProps {
  initialTab?: SettingsTabId
  onSettingsChange?: (newSettings: DashboardSettings) => void
  onOpenApp?: (appId: string) => void
}

export default function SettingsApp({
  initialTab = 'appearance',
  onSettingsChange,
  onOpenApp
}: SettingsAppProps) {
  const [settings, setSettings] = useState<DashboardSettings>(DEFAULT_SETTINGS)
  const [savedNotice, setSavedNotice] = useState(false)
  const [activeTab, setActiveTab] = useState<SettingsTabId>(initialTab)
  const [mobileSection, setMobileSection] = useState<SettingsTabId | null>(null)
  const [hasUnreadUpdates, setHasUnreadUpdates] = useState<boolean>(() => updateService.hasUnreadUpdates())
  const [wallpaperCat, setWallpaperCat] = useState<WallpaperCategory | 'all'>('all')

  useEffect(() => {
    const handleUpdatesViewed = () => {
      setHasUnreadUpdates(updateService.hasUnreadUpdates())
    }
    window.addEventListener('superdash_updates_viewed', handleUpdatesViewed)
    return () => window.removeEventListener('superdash_updates_viewed', handleUpdatesViewed)
  }, [])

  useEffect(() => {
    storageService.get<DashboardSettings>('settings', DEFAULT_SETTINGS).then(s => {
      setSettings(s)
    })
  }, [])

  const updateSetting = <K extends keyof DashboardSettings>(key: K, value: DashboardSettings[K]) => {
    sounds.playClick()
    const updated = { ...settings, [key]: value }
    setSettings(updated)
    storageService.set('settings', updated)
    if (onSettingsChange) onSettingsChange(updated)

    setSavedNotice(true)
    setTimeout(() => setSavedNotice(false), 1200)
  }

  const toggleAppVisibility = (appId: string) => {
    if (appId === 'settings') return // Settings must remain visible
    const hidden = settings.hiddenAppIds || []
    const isHidden = hidden.includes(appId)
    const newHidden = isHidden ? hidden.filter(id => id !== appId) : [...hidden, appId]
    updateSetting('hiddenAppIds', newHidden)
  }

  const handleCustomWallpaperUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = event => {
      const dataUri = event.target?.result as string
      if (dataUri) {
        sounds.playSuccess()
        updateSetting('customWallpaperData', dataUri)
        updateSetting('wallpaper', 'custom')
      }
    }
    reader.readAsDataURL(file)
  }

  const handleResetDefaults = async () => {
    if (confirm('Restore default preferences? Your notes, tasks, finances, and files will remain untouched.')) {
      sounds.playClick()
      await storageService.set('settings', DEFAULT_SETTINGS)
      setSettings(DEFAULT_SETTINGS)
      if (onSettingsChange) onSettingsChange(DEFAULT_SETTINGS)
      alert('Preferences restored to defaults.')
    }
  }

  const filteredWallpapers = WALLPAPER_COLLECTION.filter(
    w => wallpaperCat === 'all' || w.category === wallpaperCat
  )

  const tabs = [
    {
      id: 'appearance' as SettingsTabId,
      label: 'Appearance',
      desc: 'Theme, Liquid Glass & Wallpapers',
      icon: Palette
    },
    {
      id: 'dashboard' as SettingsTabId,
      label: 'Dashboard',
      desc: 'Clock, Shelves & Layout',
      icon: Layout
    },
    {
      id: 'apps' as SettingsTabId,
      label: 'Apps',
      desc: 'Launcher Visibility & Organization',
      icon: Grid
    },
    {
      id: 'notifications' as SettingsTabId,
      label: 'Notifications',
      desc: 'Audio chimes, haptics & alarms',
      icon: Bell
    },
    {
      id: 'data' as SettingsTabId,
      label: 'Data & Backup',
      desc: 'MEGA Sync, Export & Restore',
      icon: HardDrive
    },
    {
      id: 'updates' as SettingsTabId,
      label: 'Updates',
      desc: "What's New & System Releases",
      icon: Sparkles,
      badge: hasUnreadUpdates ? 'NEW' : undefined
    },
    {
      id: 'accessibility' as SettingsTabId,
      label: 'Accessibility',
      desc: 'Reduced Motion & Sound Effects',
      icon: Accessibility
    },
    {
      id: 'about' as SettingsTabId,
      label: 'About',
      desc: 'System Specs & Diagnostics Log',
      icon: Info
    }
  ]

  const currentTabObj = tabs.find(t => t.id === (mobileSection || activeTab)) || tabs[0]

  // Render the inner content for a selected tab
  const renderTabContent = (tabId: SettingsTabId) => {
    switch (tabId) {
      case 'appearance':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white mb-1">Color Theme</h3>
              <p className="text-xs text-slate-400 mb-4">Choose light, dark, or follow system theme.</p>
              <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                {[
                  { id: 'dark', label: 'Dark Mode', icon: Moon },
                  { id: 'light', label: 'Light Mode', icon: Sun },
                  { id: 'system', label: 'Auto (System)', icon: Sliders }
                ].map(m => {
                  const Icon = m.icon
                  const isSelected = settings.theme === m.id
                  return (
                    <button
                      key={m.id}
                      onClick={() => updateSetting('theme', m.id as ThemeMode)}
                      className={`p-3.5 sm:p-4 rounded-2xl border text-center transition flex flex-col items-center gap-2 ${
                        isSelected
                          ? 'bg-indigo-600/25 border-indigo-500 text-white shadow-sm'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <Icon className="w-5 h-5 text-indigo-400" />
                      <span className="text-xs font-medium">{m.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Liquid Glass Sliders */}
            <div className="pt-6 border-t border-white/10 space-y-4">
              <h3 className="text-sm sm:text-base font-bold text-white mb-1">Liquid Glass Effects</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span>Glass Opacity</span>
                    <span className="font-mono text-indigo-400 font-bold">{settings.glassOpacity}%</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="95"
                    value={settings.glassOpacity}
                    onChange={e => updateSetting('glassOpacity', parseInt(e.target.value))}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span>Backdrop Blur</span>
                    <span className="font-mono text-indigo-400 font-bold">{settings.glassBlur}px</span>
                  </div>
                  <input
                    type="range"
                    min="8"
                    max="40"
                    value={settings.glassBlur}
                    onChange={e => updateSetting('glassBlur', parseInt(e.target.value))}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Wallpapers */}
            <div className="pt-6 border-t border-white/10">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white mb-0.5">Desktop Wallpapers</h3>
                  <p className="text-xs text-slate-400">
                    Gradients, abstracts, photography, or custom uploaded image.
                  </p>
                </div>

                <label className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer shadow-sm transition">
                  <Upload className="w-3.5 h-3.5 inline mr-1" /> Upload Image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCustomWallpaperUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="flex items-center gap-1.5 mb-3 overflow-x-auto pb-1 no-scrollbar">
                {(['all', 'gradient', 'abstract', 'solid', 'image'] as const).map(cat => (
                  <button
                    key={cat}
                    onClick={() => {
                      sounds.playClick()
                      setWallpaperCat(cat)
                    }}
                    className={`px-3 py-1 rounded-xl text-xs capitalize transition shrink-0 ${
                      wallpaperCat === cat ? 'bg-indigo-600 text-white font-semibold' : 'bg-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {filteredWallpapers.map(w => {
                  const isSelected = settings.wallpaper === w.id
                  return (
                    <button
                      key={w.id}
                      onClick={() => updateSetting('wallpaper', w.id)}
                      className={`p-2.5 rounded-2xl border text-left transition group relative overflow-hidden ${
                        isSelected
                          ? 'border-indigo-500 ring-2 ring-indigo-500/50'
                          : 'border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className={`h-16 rounded-xl bg-gradient-to-br ${w.preview} mb-2 shadow-inner border border-white/10`} />
                      <div className="text-xs font-semibold text-white">{w.name}</div>
                      <div className="text-[10px] text-slate-500 capitalize">{w.category}</div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )

      case 'dashboard':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white mb-1">Clock Display Format</h3>
              <p className="text-xs text-slate-400 mb-3">Choose 12-hour or 24-hour presentation.</p>
              <div className="grid grid-cols-2 gap-3 max-w-md">
                <button
                  onClick={() => updateSetting('clockFormat', '12h')}
                  className={`p-3.5 rounded-2xl border text-center transition ${
                    settings.clockFormat === '12h'
                      ? 'bg-indigo-600/25 border-indigo-500 text-white'
                      : 'bg-white/5 border-white/10 text-slate-400'
                  }`}
                >
                  <div className="text-lg font-mono font-bold text-white">6:25 PM</div>
                  <span className="text-xs text-slate-400">12-Hour</span>
                </button>

                <button
                  onClick={() => updateSetting('clockFormat', '24h')}
                  className={`p-3.5 rounded-2xl border text-center transition ${
                    settings.clockFormat === '24h'
                      ? 'bg-indigo-600/25 border-indigo-500 text-white'
                      : 'bg-white/5 border-white/10 text-slate-400'
                  }`}
                >
                  <div className="text-lg font-mono font-bold text-white">18:25</div>
                  <span className="text-xs text-slate-400">24-Hour</span>
                </button>
              </div>
            </div>

            <div className="pt-6 border-t border-white/10">
              <h3 className="text-sm sm:text-base font-bold text-white mb-1">Recent Applications Shelf</h3>
              <p className="text-xs text-slate-400 mb-3">
                Display recently opened apps on home dashboard for quick access.
              </p>
              <button
                onClick={() => updateSetting('showRecentApps', !settings.showRecentApps)}
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition ${
                  settings.showRecentApps ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white/10 text-slate-400'
                }`}
              >
                {settings.showRecentApps ? 'Recent Shelf: Active' : 'Recent Shelf: Disabled'}
              </button>
            </div>

            <div className="pt-6 border-t border-white/10">
              <h3 className="text-sm sm:text-base font-bold text-rose-400 mb-1">Reset Preferences</h3>
              <p className="text-xs text-slate-400 mb-3">
                Revert wallpapers, clock format, and widget layout back to system defaults.
              </p>
              <button
                onClick={handleResetDefaults}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Defaults</span>
              </button>
            </div>
          </div>
        )

      case 'apps':
        return (
          <div className="space-y-5">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white mb-1">App Visibility in Launcher</h3>
              <p className="text-xs text-slate-400">
                Hide apps you rarely use to keep your launcher grid ultra-minimal.
              </p>
            </div>

            <div className="divide-y divide-white/5 bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
              {Object.entries(APP_META).map(([id, name]) => {
                const isHidden = (settings.hiddenAppIds || []).includes(id)
                const isLocked = id === 'settings'

                return (
                  <div key={id} className="p-3.5 flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-medium text-white">{name}</span>
                    <button
                      disabled={isLocked}
                      onClick={() => toggleAppVisibility(id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                        isLocked
                          ? 'opacity-40 cursor-not-allowed text-slate-500'
                          : isHidden
                          ? 'bg-rose-500/20 text-rose-300'
                          : 'bg-emerald-500/20 text-emerald-300'
                      }`}
                    >
                      {isHidden ? (
                        <>
                          <EyeOff className="w-3.5 h-3.5" /> Hidden
                        </>
                      ) : (
                        <>
                          <Eye className="w-3.5 h-3.5" /> Visible
                        </>
                      )}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )

      case 'notifications':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white mb-1">Interface Sound Effects</h3>
              <p className="text-xs text-slate-400 mb-3">Subtle haptic sound feedback on clicks and transitions.</p>
              <button
                onClick={() => updateSetting('soundEnabled', !settings.soundEnabled)}
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition ${
                  settings.soundEnabled ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white/10 text-slate-400'
                }`}
              >
                {settings.soundEnabled ? 'Interface Sounds: Enabled' : 'Interface Sounds: Muted'}
              </button>
            </div>

            <div className="pt-6 border-t border-white/10">
              <h3 className="text-sm sm:text-base font-bold text-white mb-1">Timer Completion Chime</h3>
              <p className="text-xs text-slate-400 mb-3">Sound played when a countdown timer or Pomodoro finishes.</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'soft_bell', label: 'Soft Bell' },
                  { id: 'glass_chime', label: 'Glass Chime' },
                  { id: 'digital', label: 'Digital Beep' },
                  { id: 'gong', label: 'Gentle Gong' },
                  { id: 'none', label: 'Silent' }
                ].map(s => (
                  <button
                    key={s.id}
                    onClick={() => updateSetting('timerSound', s.id as TimerSound)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition ${
                      settings.timerSound === s.id
                        ? 'bg-indigo-600 text-white border-indigo-400 shadow-sm'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-white/10">
              <h3 className="text-sm sm:text-base font-bold text-white mb-1">Timer Visual Style</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-3">
                {[
                  { id: 'hourglass', label: 'Hourglass', desc: 'Flowing sand' },
                  { id: 'liquid_ring', label: 'Liquid Ring', desc: 'Glowing glass' },
                  { id: 'minimal', label: 'Minimal', desc: 'Clean typography' },
                  { id: 'digital', label: 'Digital', desc: 'Clock digits' }
                ].map(v => (
                  <button
                    key={v.id}
                    onClick={() => updateSetting('timerVisualMode', v.id as TimerVisualMode)}
                    className={`p-3 rounded-2xl border text-center transition ${
                      settings.timerVisualMode === v.id
                        ? 'bg-indigo-600/25 border-indigo-500 text-white'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="text-xs font-bold">{v.label}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{v.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )

      case 'data':
        return <DataBackupSettings />

      case 'updates':
        return <UpdatesApp isEmbedded={true} onOpenApp={onOpenApp} />

      case 'accessibility':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white mb-1">Reduced Motion</h3>
              <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                Simplifies 3D transforms, glass reflections, and spring physics for maximum battery performance and visual comfort.
              </p>
              <button
                onClick={() => updateSetting('reducedMotion', !settings.reducedMotion)}
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition ${
                  settings.reducedMotion ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white/10 text-slate-400'
                }`}
              >
                {settings.reducedMotion ? 'Reduced Motion: Active' : 'Reduced Motion: Standard'}
              </button>
            </div>
          </div>
        )

      case 'about':
        return <AboutDiagnosticsSettings />

      default:
        return null
    }
  }

  return (
    <div className="flex h-full w-full bg-slate-950/80 text-white flex-col overflow-hidden select-none">
      {/* Standard AppHeader */}
      <AppHeader
        title="Settings"
        subtitle="System preferences, data backup, updates & diagnostics"
        icon={Sliders}
      />

      {/* Main View Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* DESKTOP SIDEBAR (md and up) */}
        <div className="hidden md:flex w-64 bg-black/30 border-r border-white/10 p-3 space-y-1 shrink-0 flex-col justify-between">
          <div className="space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 py-1.5">
              Settings
            </div>

            {tabs.map(tab => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    sounds.playClick()
                    setActiveTab(tab.id)
                    if (tab.id === 'updates') {
                      updateService.markUpdatesAsViewed()
                      setHasUnreadUpdates(false)
                    }
                  }}
                  className={`w-full flex items-center justify-between gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-medium transition ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md font-semibold'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className="w-4 h-4 shrink-0 text-indigo-400" />
                    <span className="truncate">{tab.label}</span>
                  </div>
                  {tab.badge && (
                    <span className="px-1.5 py-0.2 rounded-full bg-emerald-400 text-slate-950 text-[9px] font-extrabold uppercase tracking-wider animate-pulse">
                      {tab.badge}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {savedNotice && (
            <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-pulse">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Preferences saved</span>
            </div>
          )}
        </div>

        {/* DESKTOP CONTENT PANEL (md and up) */}
        <div className="hidden md:flex flex-1 overflow-y-auto p-6 md:p-8 max-w-4xl">
          <div className="w-full">{renderTabContent(activeTab)}</div>
        </div>

        {/* MOBILE DRILL-DOWN CONTAINER (< md) */}
        <div className="md:hidden flex-1 flex flex-col h-full overflow-hidden">
          {mobileSection === null ? (
            /* Mobile Root Category List */
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
                System Preferences
              </div>
              <div className="divide-y divide-white/5 bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
                {tabs.map(tab => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        sounds.playClick()
                        setMobileSection(tab.id)
                        if (tab.id === 'updates') {
                          updateService.markUpdatesAsViewed()
                          setHasUnreadUpdates(false)
                        }
                      }}
                      className="w-full p-4 flex items-center justify-between text-left hover:bg-white/5 transition active:bg-white/10"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-400/30 flex items-center justify-center shrink-0 text-indigo-300">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white flex items-center gap-2">
                            <span>{tab.label}</span>
                            {tab.badge && (
                              <span className="px-1.5 py-0.2 rounded-full bg-emerald-400 text-slate-950 text-[9px] font-extrabold uppercase tracking-wider">
                                {tab.badge}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">{tab.desc}</div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
                    </button>
                  )
                })}
              </div>
            </div>
          ) : (
            /* Mobile Drilled-Down View */
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              <div className="px-3 py-2.5 bg-black/40 border-b border-white/10 flex items-center gap-2 shrink-0">
                <button
                  onClick={() => {
                    sounds.playClick()
                    setMobileSection(null)
                  }}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-indigo-300 text-xs font-semibold transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Settings</span>
                </button>
                <div className="text-xs font-bold text-white truncate px-1">
                  {currentTabObj.label}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {renderTabContent(mobileSection)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
