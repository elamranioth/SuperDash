import { useState, useEffect } from 'react'
import {
  Sun,
  Moon,
  Clock,
  CloudSun,
  Layout,
  Eye,
  EyeOff,
  RotateCcw,
  Download,
  Upload,
  CheckCircle2,
  Sliders,
  Palette,
  Volume2,
  Sparkles,
  Coins,
  Hourglass,
  Accessibility,
  Image,
  Layers
} from 'lucide-react'
import { DashboardSettings, ThemeMode, TimerVisualMode, TimerSound, WallpaperCategory } from '@/types'
import { storageService, DEFAULT_SETTINGS, WALLPAPER_COLLECTION } from '@/services/storage'
import { toLocalYYYYMMDD } from '@/utils/date'
import { sounds } from '@/utils/sound'
import GlassPanel from '@/components/LiquidGlass/GlassPanel'
import AppHeader from '@/components/AppWindow/AppHeader'
import UpdatesApp from '@/apps/updates/UpdatesApp'
import { updateService } from '@/services/updateService'

const APP_META: Record<string, string> = {
  calculator: 'Calculator',
  notes: 'Notes',
  calendar: 'Calendar',
  weather: 'Weather',
  tasks: 'Tasks',
  timer: 'Timer',
  converter: 'Converter',
  settings: 'Settings',
  reminders: 'Reminders',
  files: 'Files',
  worldclock: 'World Clock',
  hearings: 'Hearings',
  finance: 'Finance',
  ideas: 'Ideas',
  focus: 'Focus',
  decisionbook: 'Decision Book',
  morning: 'Morning',
  reader: 'Reader',
  live: 'Live',
  collections: 'Collections',
  dashboardbuilder: 'Dashboard Builder',
  updates: 'Updates'
}

export type SettingsTabId =
  | 'appearance'
  | 'dashboard'
  | 'markets'
  | 'timer'
  | 'accessibility'
  | 'data'
  | 'updates'

interface SettingsAppProps {
  initialTab?: SettingsTabId
  onSettingsChange?: (newSettings: DashboardSettings) => void
  onOpenApp?: (appId: string) => void
}

export default function SettingsApp({ initialTab = 'appearance', onSettingsChange, onOpenApp }: SettingsAppProps) {
  const [settings, setSettings] = useState<DashboardSettings>(DEFAULT_SETTINGS)
  const [savedNotice, setSavedNotice] = useState(false)
  const [activeTab, setActiveTab] = useState<SettingsTabId>(initialTab)
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

  const handleExportData = async () => {
    sounds.playSuccess()
    const data = await storageService.exportAll()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `superdash-backup-${toLocalYYYYMMDD()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async event => {
      try {
        const json = JSON.parse(event.target?.result as string)
        await storageService.importAll(json)
        sounds.playSuccess()
        alert('Dashboard backup imported successfully! Reloading system.')
        window.location.reload()
      } catch {
        alert('Invalid backup JSON file.')
      }
    }
    reader.readAsText(file)
  }

  const handleResetDefaults = async () => {
    if (confirm('Are you sure you want to restore default settings? Your notes, tasks, and files will remain intact.')) {
      sounds.playClick()
      await storageService.set('settings', DEFAULT_SETTINGS)
      setSettings(DEFAULT_SETTINGS)
      if (onSettingsChange) onSettingsChange(DEFAULT_SETTINGS)
      alert('Settings restored to defaults.')
    }
  }

  const filteredWallpapers = WALLPAPER_COLLECTION.filter(
    w => wallpaperCat === 'all' || w.category === wallpaperCat
  )

  const [tabFilter, setTabFilter] = useState('')

  const tabs = [
    { id: 'appearance', label: 'Liquid Glass & Wallpapers', icon: Palette, keywords: 'theme dark light wallpaper blur opacity' },
    { id: 'dashboard', label: 'Dashboard & Launcher', icon: Layout, keywords: 'clock 12h 24h recent apps launcher visibility' },
    { id: 'markets', label: 'Markets Watchlist', icon: Coins, keywords: 'crypto btc aed mad currency ticker' },
    { id: 'timer', label: 'Timer & Hourglass', icon: Hourglass, keywords: 'sound alarm countdown pomodoro chime' },
    { id: 'accessibility', label: 'Accessibility & Motion', icon: Accessibility, keywords: 'reduce motion animation sounds haptics' },
    { id: 'data', label: 'Data & Cloud Portability', icon: Sliders, keywords: 'backup json export import reset wipe restore' },
    { id: 'updates', label: "Updates & What's New", icon: Sparkles, keywords: 'updates version changelog release new features apk patch system' }
  ]

  const filteredTabs = tabs.filter(t => 
    !tabFilter.trim() || 
    t.label.toLowerCase().includes(tabFilter.toLowerCase()) || 
    t.keywords.includes(tabFilter.toLowerCase())
  )

  return (
    <div className="flex h-full w-full bg-slate-950/80 text-white flex-col overflow-hidden select-none">
      {/* Standard AppHeader */}
      <AppHeader
        title="Settings"
        subtitle="System preferences, liquid glass, launcher, updates and data backups"
        icon={Sliders}
      />

      {/* Mobile Horizontal Tabs Rail */}
      <div className="md:hidden flex items-center gap-1.5 overflow-x-auto no-scrollbar p-2 bg-black/40 border-b border-white/10 shrink-0">
        {tabs.map(tab => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => {
                sounds.playClick()
                setActiveTab(tab.id as SettingsTabId)
                if (tab.id === 'updates') {
                  updateService.markUpdatesAsViewed()
                  setHasUnreadUpdates(false)
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition shrink-0 relative ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                  : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.id === 'updates' && hasUnreadUpdates && (
                <span className="px-1.5 py-0.2 rounded-full bg-emerald-400 text-slate-950 text-[9px] font-extrabold uppercase tracking-wider animate-pulse ml-1">
                  NEW
                </span>
              )}
            </button>
          )
        })}
      </div>

      <div className="flex-1 flex md:divide-x divide-white/10 overflow-hidden">
        {/* Sidebar Tabs (Desktop) */}
        <div className="hidden md:flex w-56 md:w-64 bg-black/20 p-3 space-y-2 shrink-0 flex-col justify-between">
          <div className="space-y-1">
            <div className="px-1 pb-1">
              <input
                type="text"
                placeholder="Find a setting..."
                value={tabFilter}
                onChange={e => setTabFilter(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 font-sans"
              />
            </div>

            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 px-3 py-1.5">
              Preferences
            </div>

            {filteredTabs.map(tab => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    sounds.playClick()
                    setActiveTab(tab.id as SettingsTabId)
                    if (tab.id === 'updates') {
                      updateService.markUpdatesAsViewed()
                      setHasUnreadUpdates(false)
                    }
                  }}
                  className={`w-full flex items-center justify-between gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition ${
                    isActive ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{tab.label}</span>
                  </div>
                  {tab.id === 'updates' && hasUnreadUpdates && (
                    <span className="px-1.5 py-0.2 rounded-full bg-emerald-400 text-slate-950 text-[9px] font-extrabold uppercase tracking-wider animate-pulse shrink-0">
                      NEW
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

      {/* Settings Content Area */}
      {activeTab === 'updates' ? (
        <div className="flex-1 h-full overflow-hidden flex flex-col bg-slate-950/40">
          <UpdatesApp isEmbedded={true} onOpenApp={onOpenApp} />
        </div>
      ) : (
        <div className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto space-y-6 sm:space-y-8 max-w-3xl">
          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-white mb-1">Color Theme</h3>
              <p className="text-xs text-slate-400 mb-4">
                Choose light, dark, or follow system appearance.
              </p>
              <div className="grid grid-cols-3 gap-3">
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
                      className={`p-4 rounded-2xl border text-center transition flex flex-col items-center gap-2 ${
                        isSelected
                          ? 'bg-indigo-600/25 border-indigo-500 text-white'
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
              <h3 className="text-base font-bold text-white mb-1">Liquid Glass Effects</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span>Glass Opacity</span>
                    <span className="font-mono text-indigo-400">{settings.glassOpacity}%</span>
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
                    <span className="font-mono text-indigo-400">{settings.glassBlur}px</span>
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

            {/* Wallpapers Gallery */}
            <div className="pt-6 border-t border-white/10">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div>
                  <h3 className="text-base font-bold text-white mb-0.5">Desktop Wallpapers</h3>
                  <p className="text-xs text-slate-400">
                    Gradients, abstracts, solids, high-res photography, or custom uploaded image.
                  </p>
                </div>

                {/* Upload Custom Wallpaper Button */}
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

              {/* Category pills */}
              <div className="flex items-center gap-1.5 mb-3 overflow-x-auto pb-1">
                {(['all', 'gradient', 'abstract', 'solid', 'image'] as const).map(cat => (
                  <button
                    key={cat}
                    onClick={() => {
                      sounds.playClick()
                      setWallpaperCat(cat)
                    }}
                    className={`px-3 py-1 rounded-xl text-xs capitalize transition ${
                      wallpaperCat === cat ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-400 hover:text-white'
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
                      <div
                        className={`h-16 rounded-xl bg-gradient-to-br ${w.preview} mb-2 shadow-inner border border-white/10`}
                      />
                      <div className="text-xs font-semibold text-white">{w.name}</div>
                      <div className="text-[10px] text-slate-500 capitalize">{w.category}</div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Dashboard & Launcher Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-white mb-1">Clock Display Format</h3>
              <div className="grid grid-cols-2 gap-3 max-w-md my-3">
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
              <h3 className="text-base font-bold text-white mb-1">Recent Applications Shelf</h3>
              <p className="text-xs text-slate-400 mb-3">
                Display recently launched apps above the main launcher grid.
              </p>
              <button
                onClick={() => updateSetting('showRecentApps', !settings.showRecentApps)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
                  settings.showRecentApps ? 'bg-indigo-600 text-white' : 'bg-white/10 text-slate-400'
                }`}
              >
                {settings.showRecentApps ? 'Recent Apps: Enabled' : 'Recent Apps: Disabled'}
              </button>
            </div>

            <div className="pt-6 border-t border-white/10">
              <h3 className="text-base font-bold text-white mb-1">App Visibility & Launcher</h3>
              <div className="divide-y divide-white/5 bg-white/5 rounded-2xl border border-white/10 overflow-hidden mt-3">
                {Object.entries(APP_META).map(([id, name]) => {
                  const isHidden = (settings.hiddenAppIds || []).includes(id)
                  const isLocked = id === 'settings'

                  return (
                    <div key={id} className="p-3 flex items-center justify-between">
                      <span className="text-sm font-medium text-white">{name}</span>
                      <button
                        disabled={isLocked}
                        onClick={() => toggleAppVisibility(id)}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium transition ${
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
          </div>
        )}

        {/* Markets Watchlist Tab */}
        {activeTab === 'markets' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-white mb-1">Default Market Pairs</h3>
              <p className="text-xs text-slate-400 mb-4">
                Configure your currency and crypto watchlist displayed in the top-left Markets widget.
              </p>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span>Current Active Pairs:</span>
                  <span className="font-mono text-emerald-400">
                    {settings.marketPairs?.join(', ') || 'BTC-USD, AED-MAD, USD-AED'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  You can add or remove pairs directly from the Markets widget on the home dashboard using the sliders button.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Timer & Hourglass Tab */}
        {activeTab === 'timer' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-white mb-1">Default Timer Visualization</h3>
              <p className="text-xs text-slate-400 mb-4">
                Choose your signature countdown visual style.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { id: 'hourglass', label: 'Hourglass', desc: 'Flowing sand physics' },
                  { id: 'liquid_ring', label: 'Liquid Ring', desc: 'Glowing glass ring' },
                  { id: 'minimal', label: 'Minimal', desc: 'Clean typography' },
                  { id: 'digital', label: 'Digital', desc: 'Digital clock' }
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

            <div className="pt-6 border-t border-white/10">
              <h3 className="text-base font-bold text-white mb-1">Completion Sounds</h3>
              <p className="text-xs text-slate-400 mb-4">
                Select the audio chime played when a countdown timer or Pomodoro finishes.
              </p>
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
                        ? 'bg-indigo-600 text-white border-indigo-400'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Accessibility & Motion Tab */}
        {activeTab === 'accessibility' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-white mb-1">Reduced Motion</h3>
              <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                When enabled, complex glass reflections and spring transitions simplify automatically for improved performance and comfort.
              </p>
              <button
                onClick={() => updateSetting('reducedMotion', !settings.reducedMotion)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
                  settings.reducedMotion ? 'bg-indigo-600 text-white' : 'bg-white/10 text-slate-400'
                }`}
              >
                {settings.reducedMotion ? 'Reduced Motion: Active' : 'Reduced Motion: Standard'}
              </button>
            </div>

            <div className="pt-6 border-t border-white/10">
              <h3 className="text-base font-bold text-white mb-1">Interface Sound Effects</h3>
              <button
                onClick={() => updateSetting('soundEnabled', !settings.soundEnabled)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
                  settings.soundEnabled ? 'bg-indigo-600 text-white' : 'bg-white/10 text-slate-400'
                }`}
              >
                {settings.soundEnabled ? 'Sounds: Enabled' : 'Sounds: Muted'}
              </button>
            </div>
          </div>
        )}

        {/* Data & Backup Tab */}
        {activeTab === 'data' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-white mb-1">Backup & Cloud Portability</h3>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                SuperDash uses an isolated data layer interface. You can export your complete workspace (notes, tasks, calendar events, reminders, files, settings) as JSON, or import a previous backup file.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={handleExportData}
                  className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition text-left flex items-start gap-3 group"
                >
                  <Download className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                  <div>
                    <div className="text-sm font-semibold text-white">Export Backup JSON</div>
                    <p className="text-xs text-slate-400 mt-1">Download complete system state</p>
                  </div>
                </button>

                <label className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition text-left flex items-start gap-3 group cursor-pointer">
                  <Upload className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                  <div>
                    <div className="text-sm font-semibold text-white">Import Backup JSON</div>
                    <p className="text-xs text-slate-400 mt-1">Restore from a previous backup file</p>
                    <input type="file" accept=".json" onChange={handleImportData} className="hidden" />
                  </div>
                </label>
              </div>
            </div>

            {/* Updates Center & System Version */}
            <div className="pt-6 border-t border-white/10">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <h3 className="text-base font-bold text-white mb-0.5">SuperDash Updates & Version</h3>
                  <p className="text-xs text-slate-400">
                    Currently running version <span className="font-mono text-indigo-300 font-bold">v1.5.0</span>
                  </p>
                </div>
                <button
                  onClick={() => {
                    sounds.playClick()
                    setActiveTab('updates')
                    updateService.markUpdatesAsViewed()
                    setHasUnreadUpdates(false)
                  }}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Open Updates Center</span>
                </button>
              </div>
            </div>

            <div className="pt-6 border-t border-white/10">
              <h3 className="text-base font-bold text-white mb-1 text-rose-400">Reset Preferences</h3>
              <p className="text-xs text-slate-400 mb-4">
                Reset wallpapers, clock format, and widget layout back to defaults.
              </p>
              <button
                onClick={handleResetDefaults}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold transition"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset Preferences
              </button>
            </div>
          </div>
        )}
      </div>
      )}
    </div>
  </div>
)
}
