import { useState } from 'react'
import {
  X,
  Sliders,
  Trash2,
  Maximize2,
  Minimize2,
  Eye,
  Layers,
  Palette,
  Clock,
  Search,
  Coins,
  LayoutGrid
} from 'lucide-react'
import {
  DashboardItem,
  DashboardDefinition,
  WidgetSize,
  WallpaperItem
} from '@/types'
import { getWidgetById } from '@/registry/widgetRegistry'
import { WALLPAPER_COLLECTION } from '@/services/storage'
import { sounds } from '@/utils/sound'

interface WidgetSettingsPanelProps {
  selectedItem: DashboardItem | null
  dashboard: DashboardDefinition
  onUpdateItem: (itemId: string, updates: Partial<DashboardItem>) => void
  onRemoveItem: (itemId: string) => void
  onUpdateDashboardConfig: (updates: Partial<DashboardDefinition>) => void
  onClose?: () => void
}

export default function WidgetSettingsPanel({
  selectedItem,
  dashboard,
  onUpdateItem,
  onRemoveItem,
  onUpdateDashboardConfig,
  onClose
}: WidgetSettingsPanelProps) {
  // If an item is selected, render item-level configuration
  if (selectedItem) {
    const widgetDef = getWidgetById(selectedItem.widgetId)
    const Icon = widgetDef?.icon || Layers
    const supportedSizes = widgetDef?.supportedSizes || ['sm', 'md', 'lg']

    const handleSetSize = (newSize: WidgetSize) => {
      sounds.playClick()
      const width = newSize === 'lg' ? 8 : newSize === 'md' ? 6 : 4
      onUpdateItem(selectedItem.id, {
        size: newSize,
        width
      })
    }

    const handleToggleVisibility = (breakpoint: 'desktop' | 'tablet' | 'mobile') => {
      sounds.playClick()
      const currentVis = selectedItem.visibility || { desktop: true, tablet: true, mobile: true }
      onUpdateItem(selectedItem.id, {
        visibility: {
          ...currentVis,
          [breakpoint]: !currentVis[breakpoint]
        }
      })
    }

    return (
      <>
        {/* Mobile backdrop */}
        {onClose && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            onClick={onClose}
          />
        )}
        <div className="fixed md:static inset-y-0 right-0 z-50 w-full sm:w-80 border-l border-white/10 bg-slate-950/95 md:bg-black/40 backdrop-blur-md flex flex-col h-full shrink-0 select-none overflow-y-auto shadow-2xl md:shadow-none">
          {/* Header */}
          <div className="p-3.5 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center">
                <Icon className="w-4 h-4 text-indigo-300" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wide">
                  {widgetDef?.name || selectedItem.widgetId}
                </h3>
                <p className="text-[10px] text-slate-400">Widget Configuration</p>
              </div>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 -mr-1 rounded-xl text-slate-400 hover:text-white"
                aria-label="Close widget settings"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

        <div className="p-4 space-y-5 flex-1">
          {/* Size Selector */}
          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2">
              Widget Size
            </label>
            <div className="grid grid-cols-3 gap-1.5 bg-black/40 border border-white/10 p-1 rounded-xl">
              {(['sm', 'md', 'lg'] as WidgetSize[]).map(s => {
                const isSupported = supportedSizes.includes(s)
                const isCurrent = (selectedItem.size || 'sm') === s
                return (
                  <button
                    key={s}
                    disabled={!isSupported}
                    onClick={() => handleSetSize(s)}
                    className={`py-1.5 rounded-lg text-xs font-bold uppercase transition ${
                      isCurrent
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : isSupported
                        ? 'text-slate-400 hover:text-white hover:bg-white/5'
                        : 'opacity-25 text-slate-600 cursor-not-allowed'
                    }`}
                  >
                    {s === 'sm' ? 'Small' : s === 'md' ? 'Medium' : 'Large'}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Visibility Across Breakpoints */}
          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2">
              Responsive Visibility
            </label>
            <div className="space-y-2">
              {(['desktop', 'tablet', 'mobile'] as const).map(bp => {
                const isVisible = selectedItem.visibility?.[bp] ?? true
                return (
                  <button
                    key={bp}
                    onClick={() => handleToggleVisibility(bp)}
                    className={`w-full p-2 rounded-xl border flex items-center justify-between text-xs transition ${
                      isVisible
                        ? 'bg-white/10 border-white/20 text-white'
                        : 'bg-black/30 border-white/5 text-slate-500'
                    }`}
                  >
                    <span className="capitalize font-medium">{bp}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                        isVisible
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-white/5 text-slate-500'
                      }`}
                    >
                      {isVisible ? 'Visible' : 'Hidden'}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Custom Widget Settings from Schema if any */}
          {widgetDef?.settingsSchema && widgetDef.settingsSchema.fields.length > 0 && (
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2">
                Custom Properties
              </label>
              <div className="space-y-3">
                {widgetDef.settingsSchema.fields.map(field => {
                  const currentVal = selectedItem.settings?.[field.id] ?? field.defaultValue
                  return (
                    <div key={field.id}>
                      <label className="block text-[11px] text-slate-400 mb-1">
                        {field.label}
                      </label>
                      {field.type === 'text' && (
                        <input
                          type="text"
                          value={String(currentVal || '')}
                          onChange={e => {
                            onUpdateItem(selectedItem.id, {
                              settings: {
                                ...(selectedItem.settings || {}),
                                [field.id]: e.target.value
                              }
                            })
                          }}
                          className="w-full px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-400"
                        />
                      )}
                      {field.type === 'boolean' && (
                        <button
                          onClick={() => {
                            sounds.playClick()
                            onUpdateItem(selectedItem.id, {
                              settings: {
                                ...(selectedItem.settings || {}),
                                [field.id]: !currentVal
                              }
                            })
                          }}
                          className={`w-full px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition ${
                            currentVal
                              ? 'bg-indigo-600/30 border-indigo-400 text-white'
                              : 'bg-black/30 border-white/10 text-slate-400'
                          }`}
                        >
                          <span>{field.label}</span>
                          <span>{currentVal ? 'Enabled' : 'Disabled'}</span>
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Remove Widget */}
          <div className="pt-4 border-t border-white/10">
            <button
              onClick={() => {
                sounds.playClick()
                onRemoveItem(selectedItem.id)
              }}
              className="w-full py-2 px-3 rounded-xl border border-rose-500/30 hover:border-rose-500/60 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Remove from Dashboard</span>
            </button>
          </div>
        </div>
      </div>
      </>
    )
  }

  // If no item is selected, render global dashboard settings
  const layout = dashboard.layoutConfig

  return (
    <>
      {/* Mobile backdrop */}
      {onClose && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
        />
      )}
      <div className="fixed md:static inset-y-0 right-0 z-50 w-full sm:w-80 border-l border-white/10 bg-slate-950/95 md:bg-black/40 backdrop-blur-md flex flex-col h-full shrink-0 select-none overflow-y-auto shadow-2xl md:shadow-none">
        {/* Header */}
        <div className="p-3.5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center">
              <Sliders className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wide">
                Dashboard Settings
              </h3>
              <p className="text-[10px] text-slate-400">Layout & Visual Atmosphere</p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 -mr-1 rounded-xl text-slate-400 hover:text-white"
              aria-label="Close dashboard settings"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

      <div className="p-4 space-y-5 flex-1">
        {/* Dashboard Name */}
        <div>
          <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
            Dashboard Name
          </label>
          <input
            type="text"
            value={dashboard.name}
            onChange={e => onUpdateDashboardConfig({ name: e.target.value })}
            className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs font-semibold focus:outline-none focus:border-indigo-400 transition"
          />
        </div>

        {/* Wallpaper Picker */}
        <div>
          <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-indigo-400" />
            <span>Wallpaper Aura</span>
          </label>
          <div className="grid grid-cols-4 gap-2">
            {WALLPAPER_COLLECTION.slice(0, 8).map(w => (
              <button
                key={w.id}
                onClick={() => {
                  sounds.playClick()
                  onUpdateDashboardConfig({
                    wallpaper: w.id,
                    wallpaperCategory: w.category
                  })
                }}
                className={`h-9 rounded-xl border transition overflow-hidden relative ${
                  dashboard.wallpaper === w.id
                    ? 'border-white scale-105 shadow-md ring-2 ring-white/50'
                    : 'border-white/10 opacity-70 hover:opacity-100'
                } ${w.value}`}
                title={w.name}
              />
            ))}
          </div>
        </div>

        {/* System Elements Toggles */}
        <div className="space-y-2.5">
          <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider">
            System Modules
          </label>

          {/* Universal Search */}
          <button
            onClick={() => {
              sounds.playClick()
              onUpdateDashboardConfig({
                layoutConfig: {
                  ...layout,
                  showSearch: !layout.showSearch
                }
              })
            }}
            className={`w-full p-2 rounded-xl border flex items-center justify-between text-xs transition ${
              layout.showSearch
                ? 'bg-white/10 border-white/20 text-white'
                : 'bg-black/30 border-white/5 text-slate-500'
            }`}
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-indigo-400" />
              <span>Universal Search</span>
            </div>
            <span className="text-[10px] font-mono">
              {layout.showSearch ? 'ON' : 'OFF'}
            </span>
          </button>

          {/* Background Clock */}
          <button
            onClick={() => {
              sounds.playClick()
              onUpdateDashboardConfig({
                layoutConfig: {
                  ...layout,
                  showClock: !layout.showClock
                }
              })
            }}
            className={`w-full p-2 rounded-xl border flex items-center justify-between text-xs transition ${
              layout.showClock
                ? 'bg-white/10 border-white/20 text-white'
                : 'bg-black/30 border-white/5 text-slate-500'
            }`}
          >
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              <span>Atmospheric Clock</span>
            </div>
            <span className="text-[10px] font-mono">
              {layout.showClock ? 'ON' : 'OFF'}
            </span>
          </button>

          {/* Markets Strip */}
          <button
            onClick={() => {
              sounds.playClick()
              onUpdateDashboardConfig({
                layoutConfig: {
                  ...layout,
                  showMarketsStrip: !layout.showMarketsStrip
                }
              })
            }}
            className={`w-full p-2 rounded-xl border flex items-center justify-between text-xs transition ${
              layout.showMarketsStrip
                ? 'bg-white/10 border-white/20 text-white'
                : 'bg-black/30 border-white/5 text-slate-500'
            }`}
          >
            <div className="flex items-center gap-2">
              <Coins className="w-3.5 h-3.5 text-indigo-400" />
              <span>Market Strip</span>
            </div>
            <span className="text-[10px] font-mono">
              {layout.showMarketsStrip ? 'ON' : 'OFF'}
            </span>
          </button>

          {/* App Launcher */}
          <button
            onClick={() => {
              sounds.playClick()
              onUpdateDashboardConfig({
                layoutConfig: {
                  ...layout,
                  showAppLauncher: !layout.showAppLauncher
                }
              })
            }}
            className={`w-full p-2 rounded-xl border flex items-center justify-between text-xs transition ${
              layout.showAppLauncher
                ? 'bg-white/10 border-white/20 text-white'
                : 'bg-black/30 border-white/5 text-slate-500'
            }`}
          >
            <div className="flex items-center gap-2">
              <LayoutGrid className="w-3.5 h-3.5 text-indigo-400" />
              <span>App Launcher</span>
            </div>
            <span className="text-[10px] font-mono">
              {layout.showAppLauncher ? 'ON' : 'OFF'}
            </span>
          </button>
        </div>
      </div>
    </div>
    </>
  )
}
