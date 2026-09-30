import { useState, useMemo, useEffect } from 'react'
import { getRegisteredApps, RegisteredApp } from '@/registry/appRegistry'
import { AppCategory } from '@/types'
import { sounds } from '@/utils/sound'
import { GripVertical, Star, History } from 'lucide-react'
import { updateService } from '@/services/updateService'

interface AppLauncherProps {
  appOrder: string[]
  hiddenAppIds: string[]
  favoriteAppIds?: string[]
  recentAppIds?: string[]
  showRecentApps?: boolean
  onToggleFavorite?: (appId: string) => void
  onAppOrderChange: (newOrder: string[]) => void
  onOpenApp: (appId: string) => void
}

export default function AppLauncher({
  appOrder,
  hiddenAppIds,
  favoriteAppIds = [],
  recentAppIds = [],
  showRecentApps = true,
  onToggleFavorite,
  onAppOrderChange,
  onOpenApp
}: AppLauncherProps) {
  const [selectedCategory, setSelectedCategory] = useState<AppCategory | 'all' | 'favorites'>('all')
  const [draggedAppId, setDraggedAppId] = useState<string | null>(null)
  const [dragOverAppId, setDragOverAppId] = useState<string | null>(null)
  const [hasUnreadUpdates, setHasUnreadUpdates] = useState<boolean>(() => updateService.hasUnreadUpdates())

  useEffect(() => {
    const handleUpdatesViewed = () => {
      setHasUnreadUpdates(updateService.hasUnreadUpdates())
    }
    window.addEventListener('superdash_updates_viewed', handleUpdatesViewed)
    return () => window.removeEventListener('superdash_updates_viewed', handleUpdatesViewed)
  }, [])

  const allApps = useMemo(() => getRegisteredApps(), [])

  // Order apps according to appOrder state, filtering out hidden apps
  const visibleApps = useMemo(() => {
    const ordered: RegisteredApp[] = []
    const appMap = new Map(allApps.map(a => [a.id, a]))

    // Add ordered apps first
    appOrder.forEach(id => {
      const app = appMap.get(id)
      if (app && !hiddenAppIds.includes(id)) {
        ordered.push(app)
        appMap.delete(id)
      }
    })

    // Add any remaining registered apps that weren't in appOrder yet
    appMap.forEach(app => {
      if (!hiddenAppIds.includes(app.id)) {
        ordered.push(app)
      }
    })

    // Filter by category or favorites
    if (selectedCategory === 'favorites') {
      return ordered.filter(a => favoriteAppIds.includes(a.id))
    }
    if (selectedCategory !== 'all') {
      return ordered.filter(a => a.category === selectedCategory)
    }

    return ordered
  }, [allApps, appOrder, hiddenAppIds, selectedCategory, favoriteAppIds])

  // Recent apps list
  const recentAppsList = useMemo(() => {
    return recentAppIds
      .map(id => allApps.find(a => a.id === id))
      .filter((a): a is RegisteredApp => !!a && !hiddenAppIds.includes(a.id))
      .slice(0, 5)
  }, [allApps, recentAppIds, hiddenAppIds])

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedAppId(id)
    e.dataTransfer.setData('text/plain', id)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault()
    if (draggedAppId && draggedAppId !== id) {
      setDragOverAppId(id)
    }
  }

  const handleDragLeave = () => {
    setDragOverAppId(null)
  }

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault()
    setDragOverAppId(null)
    if (!draggedAppId || draggedAppId === targetId) return

    sounds.playClick()

    const currentOrder = [...appOrder]
    allApps.forEach(a => {
      if (!currentOrder.includes(a.id)) currentOrder.push(a.id)
    })

    const fromIndex = currentOrder.indexOf(draggedAppId)
    const toIndex = currentOrder.indexOf(targetId)

    if (fromIndex !== -1 && toIndex !== -1) {
      currentOrder.splice(fromIndex, 1)
      currentOrder.splice(toIndex, 0, draggedAppId)
      onAppOrderChange(currentOrder)
    }
    setDraggedAppId(null)
  }

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col items-center select-none px-2 sm:px-4">
      {/* Applications Header & Category Filter Pills */}
      <div className="w-full flex flex-col items-center gap-2.5 sm:gap-3 mb-5 sm:mb-6">
        <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400/80 drop-shadow">
          Applications
        </span>

        {/* Horizontal scrollable category rail on mobile, centered on desktop */}
        <div className="w-full max-w-full overflow-x-auto no-scrollbar flex items-center justify-start sm:justify-center px-1 py-0.5">
          <div className="flex items-center gap-1 sm:gap-1.5 p-1 rounded-full liquid-glass border border-white/10 shadow-md shrink-0 mx-auto">
            {[
              { id: 'all', label: 'All Apps' },
              { id: 'favorites', label: '★ Favorites' },
              { id: 'productivity', label: 'Productivity' },
              { id: 'utilities', label: 'Utilities' },
              { id: 'business', label: 'Business' }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => {
                  sounds.playClick()
                  setSelectedCategory(cat.id as typeof selectedCategory)
                }}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap shrink-0 transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5 active:bg-white/10'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Visually Subdued Recently Opened Strip */}
      {showRecentApps && recentAppsList.length > 0 && selectedCategory === 'all' && (
        <div className="w-full mb-5 px-1 sm:px-4 flex items-center justify-start sm:justify-center gap-2 text-xs overflow-x-auto no-scrollbar">
          <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider flex items-center gap-1 shrink-0 pl-1">
            <History className="w-3 h-3" /> Recent:
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {recentAppsList.map(app => {
              const Icon = app.icon
              return (
                <button
                  key={app.id}
                  onClick={() => {
                    sounds.playClick()
                    onOpenApp(app.id)
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.08] active:bg-white/[0.12] border border-white/5 hover:border-white/15 transition group text-left shrink-0"
                >
                  <div className={`p-1 rounded-md bg-gradient-to-br ${app.gradient} text-white shadow-xs shrink-0`}>
                    <Icon className="w-2.5 h-2.5" />
                  </div>
                  <span className="text-[11px] font-medium text-slate-300 group-hover:text-white truncate max-w-[90px]">
                    {app.name}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Responsive App Grid */}
      <div className="grid grid-cols-3 min-[380px]:grid-cols-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3 sm:gap-4 md:gap-6 w-full justify-items-center">
        {visibleApps.map(app => {
          const Icon = app.icon
          const isDragging = draggedAppId === app.id
          const isDragOver = dragOverAppId === app.id
          const isFav = favoriteAppIds.includes(app.id)

          return (
            <div
              key={app.id}
              draggable
              onDragStart={e => handleDragStart(e, app.id)}
              onDragOver={e => handleDragOver(e, app.id)}
              onDragLeave={handleDragLeave}
              onDrop={e => handleDrop(e, app.id)}
              onClick={() => {
                sounds.playClick()
                onOpenApp(app.id)
              }}
              className={`flex flex-col items-center group cursor-pointer select-none transition-all duration-300 w-full max-w-[88px] sm:max-w-[96px] md:max-w-[110px] relative ${
                isDragging ? 'opacity-40 scale-95' : 'hover:scale-105 active:scale-95'
              } ${isDragOver ? 'ring-2 ring-indigo-400 rounded-3xl p-1 scale-105' : ''}`}
            >
              {/* App Icon Liquid Glass Squircle */}
              <div
                className={`relative w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-2xl sm:rounded-3xl bg-gradient-to-br ${app.gradient} p-0.5 shadow-xl transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-indigo-500/25 shrink-0`}
              >
                {/* Specular gloss highlight */}
                <div className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-b from-white/35 via-transparent to-black/25 pointer-events-none" />

                {/* Unread Update indicator for Updates app */}
                {app.id === 'updates' && hasUnreadUpdates && (
                  <span className="absolute -top-1.5 -left-1.5 z-20 px-1.5 py-0.5 rounded-full bg-emerald-400 text-slate-950 text-[9px] font-extrabold uppercase tracking-wider shadow-lg border border-white/40 animate-pulse">
                    NEW
                  </span>
                )}

                {/* Integrated Favorite Star Badge */}
                {onToggleFavorite && (
                  <button
                    onClick={e => {
                      e.stopPropagation()
                      sounds.playClick()
                      onToggleFavorite(app.id)
                    }}
                    className={`absolute top-1 right-1 z-20 w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center transition-all duration-200 ${
                      isFav
                        ? 'bg-black/60 text-amber-400 border border-amber-400/30 shadow-sm opacity-100'
                        : 'bg-black/40 text-white/50 border border-white/10 hover:text-amber-400 hover:bg-black/70 opacity-0 group-hover:opacity-100'
                    }`}
                    title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <Star className={`w-2 h-2 sm:w-2.5 sm:h-2.5 ${isFav ? 'fill-amber-400' : ''}`} />
                  </button>
                )}

                <div className="w-full h-full rounded-[14px] sm:rounded-[22px] flex items-center justify-center text-white relative">
                  <Icon className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 transition-transform duration-300 group-hover:scale-110 drop-shadow-md" />
                </div>
              </div>

              {/* App Name Label - 2 lines max centered, no truncation ellipsis cutoff */}
              <span className="mt-1.5 sm:mt-2 text-[11px] sm:text-xs font-medium text-slate-200 group-hover:text-white transition tracking-tight text-center line-clamp-2 leading-tight break-words px-0.5 w-full min-h-[26px] flex items-start justify-center drop-shadow">
                {app.name}
              </span>
            </div>
          )
        })}
      </div>

      <div className="mt-6 text-[11px] text-slate-500 hidden sm:flex items-center gap-1.5 opacity-60">
        <GripVertical className="w-3.5 h-3.5" />
        <span>Drag and drop icons to customize launcher order</span>
      </div>
    </div>
  )
}
