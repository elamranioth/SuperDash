import { useState, useMemo } from 'react'
import {
  DashboardItem,
  DashboardDefinition,
  WidgetSize
} from '@/types'
import { getWidgetById } from '@/registry/widgetRegistry'
import { WALLPAPER_COLLECTION } from '@/services/storage'
import {
  GripHorizontal,
  Trash2,
  Maximize2,
  Minimize2,
  Clock,
  Search,
  Coins,
  LayoutGrid,
  Plus,
  Sparkles,
  Layers
} from 'lucide-react'
import { ResponsiveDevice } from './BuilderToolbar'
import { sounds } from '@/utils/sound'

interface BuilderCanvasProps {
  dashboard: DashboardDefinition
  activeDevice: ResponsiveDevice
  zoom: number // 50, 75, 100
  selectedItemId: string | null
  isPreviewMode: boolean
  onSelectItem: (itemId: string | null) => void
  onUpdateItem: (itemId: string, updates: Partial<DashboardItem>) => void
  onRemoveItem: (itemId: string) => void
  onOpenLibrary: () => void
}

export default function BuilderCanvas({
  dashboard,
  activeDevice,
  zoom,
  selectedItemId,
  isPreviewMode,
  onSelectItem,
  onUpdateItem,
  onRemoveItem,
  onOpenLibrary
}: BuilderCanvasProps) {
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  // Wallpaper style
  const wallpaperClass = useMemo(() => {
    const found = WALLPAPER_COLLECTION.find(w => w.id === dashboard.wallpaper)
    if (found && (found.category === 'gradient' || found.category === 'solid' || found.category === 'abstract')) {
      return found.value
    }
    return 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/60 via-slate-950 to-black'
  }, [dashboard.wallpaper])

  const wallpaperStyle = useMemo(() => {
    if (dashboard.customWallpaperData) {
      return {
        backgroundImage: `url(${dashboard.customWallpaperData})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }
    }
    const found = WALLPAPER_COLLECTION.find(w => w.id === dashboard.wallpaper)
    if (found?.category === 'image') {
      return {
        backgroundImage: `url(${found.value})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }
    }
    return {}
  }, [dashboard.wallpaper, dashboard.customWallpaperData])

  // Filter items by device visibility
  const visibleItems = useMemo(() => {
    return dashboard.items.filter(item => {
      const vis = item.visibility || { desktop: true, tablet: true, mobile: true }
      return vis[activeDevice] !== false
    })
  }, [dashboard.items, activeDevice])

  // Container width based on activeDevice
  const deviceWidthClass =
    activeDevice === 'mobile'
      ? 'max-w-sm'
      : activeDevice === 'tablet'
      ? 'max-w-2xl'
      : 'max-w-5xl'

  // Grid columns based on activeDevice
  const gridColsClass =
    activeDevice === 'mobile'
      ? 'grid-cols-1'
      : activeDevice === 'tablet'
      ? 'grid-cols-2'
      : 'grid-cols-12'

  const zoomScale = zoom / 100

  // Drag & drop reordering
  const handleDragStart = (id: string) => {
    setDraggedItemId(id)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    setDragOverIndex(index)
  }

  const handleDrop = (targetIndex: number) => {
    if (!draggedItemId) return
    const currentIndex = visibleItems.findIndex(it => it.id === draggedItemId)
    if (currentIndex === -1 || currentIndex === targetIndex) {
      setDraggedItemId(null)
      setDragOverIndex(null)
      return
    }

    sounds.playClick()
    const newItems = [...dashboard.items]
    const [moved] = newItems.splice(currentIndex, 1)
    newItems.splice(targetIndex, 0, moved)

    // Re-index x/y coordinates
    newItems.forEach((it, idx) => {
      it.x = (idx * 4) % 12
      it.y = Math.floor((idx * 4) / 12)
    })

    onUpdateItem(moved.id, { x: moved.x })
    setDraggedItemId(null)
    setDragOverIndex(null)
  }

  return (
    <div
      onClick={() => onSelectItem(null)}
      className="flex-1 overflow-auto bg-black/60 p-4 sm:p-6 flex items-start justify-center select-none"
    >
      {/* Zoom transform container */}
      <div
        style={{
          transform: `scale(${zoomScale})`,
          transformOrigin: 'top center',
          transition: 'transform 0.2s ease-out'
        }}
        className={`w-full ${deviceWidthClass} transition-all duration-300`}
      >
        {/* Safe Area Frame / Dashboard Surface */}
        <div
          style={wallpaperStyle}
          className={`rounded-3xl border ${
            isPreviewMode ? 'border-white/10' : 'border-indigo-400/30'
          } shadow-2xl p-6 sm:p-8 min-h-[700px] flex flex-col relative overflow-hidden ${wallpaperClass}`}
        >
          {/* Subtle Canvas Safe Area Guidelines (hidden in preview mode) */}
          {!isPreviewMode && (
            <div className="absolute top-2 right-3 flex items-center gap-1.5 text-[9px] uppercase font-mono tracking-widest text-indigo-400/80 bg-black/40 px-2 py-0.5 rounded-full border border-indigo-400/20 pointer-events-none">
              <span>{activeDevice} Grid Mode</span>
            </div>
          )}

          {/* 1. Universal Search Bar (if enabled in layoutConfig) */}
          {dashboard.layoutConfig.showSearch && (
            <div className="w-full max-w-xl mx-auto mb-6">
              <div className="h-10 rounded-2xl liquid-glass border border-white/15 px-4 flex items-center gap-2.5 text-slate-400 text-xs shadow-sm">
                <Search className="w-4 h-4 text-slate-400" />
                <span>Search apps, commands, files, or calculations...</span>
                <span className="ml-auto font-mono text-[10px] px-1.5 py-0.5 rounded bg-white/10">⌘K</span>
              </div>
            </div>
          )}

          {/* 2. Atmospheric Clock & Date (if enabled in layoutConfig) */}
          {dashboard.layoutConfig.showClock && (
            <div className="w-full flex flex-col items-center justify-center mb-6">
              <div className="text-3xl sm:text-4xl font-extralight tracking-tight text-white/90">
                12:45 <span className="text-sm font-light text-slate-400">PM</span>
              </div>
              <div className="text-xs text-slate-400 font-medium mt-1">
                Tuesday, September 29 · Dubai
              </div>
            </div>
          )}

          {/* 3. Markets Compact Strip (if enabled in layoutConfig) */}
          {dashboard.layoutConfig.showMarketsStrip && (
            <div className="w-full max-w-2xl mx-auto mb-6">
              <div className="h-9 rounded-2xl liquid-glass border border-white/15 px-4 flex items-center justify-between text-xs text-slate-300">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 font-semibold text-white">
                    <span>BTC</span>
                    <span className="text-emerald-400">$64,280</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400">AED/MAD</span>
                    <span className="text-white">2.68</span>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Live Strip</span>
              </div>
            </div>
          )}

          {/* 4. App Launcher Placeholder if enabled */}
          {dashboard.layoutConfig.showAppLauncher && (
            <div className="w-full max-w-3xl mx-auto mb-8 p-3 rounded-2xl bg-black/20 border border-white/5">
              <div className="text-[10px] uppercase font-bold text-slate-400 mb-2 px-1 flex items-center gap-1.5">
                <LayoutGrid className="w-3 h-3 text-indigo-400" />
                <span>Applications Grid</span>
              </div>
              <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-12 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center"
                  >
                    <div className="w-6 h-6 rounded-lg bg-indigo-500/20" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. Personal Widgets Canvas Grid */}
          <div className="w-full flex-1">
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                Active Widgets ({visibleItems.length})
              </span>
              {!isPreviewMode && (
                <button
                  onClick={e => {
                    e.stopPropagation()
                    onOpenLibrary()
                  }}
                  className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Widget</span>
                </button>
              )}
            </div>

            {visibleItems.length === 0 ? (
              <div
                onClick={e => {
                  e.stopPropagation()
                  onOpenLibrary()
                }}
                className="py-20 text-center rounded-3xl border border-dashed border-white/20 p-8 cursor-pointer hover:border-indigo-400/50 hover:bg-white/5 transition"
              >
                <Sparkles className="w-10 h-10 text-indigo-400 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wide">
                  Your Dashboard Has No Widgets
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Add clock, markets, timer, hearings, finance, tasks, or curated collections from the widget library.
                </p>
                <button className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow">
                  + Browse Widget Library
                </button>
              </div>
            ) : (
              <div className={`grid ${gridColsClass} gap-4`}>
                {visibleItems.map((item, idx) => {
                  const widgetDef = getWidgetById(item.widgetId)
                  const Icon = widgetDef?.icon || Layers
                  const isSelected = selectedItemId === item.id

                  // Desktop column span
                  const colSpanClass =
                    activeDevice === 'desktop'
                      ? item.width === 12
                        ? 'col-span-12'
                        : item.width === 8
                        ? 'col-span-8'
                        : item.width === 6
                        ? 'col-span-6'
                        : 'col-span-4'
                      : activeDevice === 'tablet'
                      ? item.width >= 6
                        ? 'col-span-2'
                        : 'col-span-1'
                      : 'col-span-1'

                  return (
                    <div
                      key={item.id}
                      draggable={!isPreviewMode}
                      onDragStart={() => handleDragStart(item.id)}
                      onDragOver={e => handleDragOver(e, idx)}
                      onDrop={() => handleDrop(idx)}
                      onClick={e => {
                        e.stopPropagation()
                        sounds.playClick()
                        onSelectItem(item.id)
                      }}
                      className={`${colSpanClass} group relative p-4 rounded-3xl liquid-glass border transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[140px] shadow-lg ${
                        isSelected
                          ? 'border-indigo-400 ring-2 ring-indigo-400/50 bg-white/10 scale-[1.01]'
                          : 'border-white/15 hover:border-white/30 hover:bg-white/10'
                      }`}
                    >
                      {/* Top Bar: Icon, Name, Drag Handle, Size, Delete */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-7 h-7 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
                            <Icon className="w-3.5 h-3.5 text-indigo-300" />
                          </div>
                          <span className="text-xs font-bold text-white truncate">
                            {widgetDef?.name || item.widgetId}
                          </span>
                        </div>

                        {!isPreviewMode && (
                          <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition">
                            <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-black/40 border border-white/10 text-slate-300 font-mono">
                              {item.size || 'sm'}
                            </span>
                            <button
                              onClick={e => {
                                e.stopPropagation()
                                sounds.playClick()
                                const nextSize: WidgetSize =
                                  item.size === 'sm' ? 'md' : item.size === 'md' ? 'lg' : 'sm'
                                const nextWidth = nextSize === 'lg' ? 8 : nextSize === 'md' ? 6 : 4
                                onUpdateItem(item.id, { size: nextSize, width: nextWidth })
                              }}
                              className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
                              title="Toggle Size"
                            >
                              <Maximize2 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={e => {
                                e.stopPropagation()
                                sounds.playClick()
                                onRemoveItem(item.id)
                              }}
                              className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-rose-400"
                              title="Remove"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                            <div className="cursor-grab active:cursor-grabbing p-1 text-slate-400">
                              <GripHorizontal className="w-3.5 h-3.5" />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Representative Widget Content Preview */}
                      <div className="flex-1 flex flex-col justify-center py-2 px-1">
                        <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                          {widgetDef?.description || 'Registered SuperDash Widget'}
                        </p>
                      </div>

                      {/* Bottom Footer Indicator */}
                      <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                        <span>Col Span: {item.width}</span>
                        <span>{widgetDef?.category}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
