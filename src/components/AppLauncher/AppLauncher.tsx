import { useState, useMemo, useEffect } from 'react'
import { getRegisteredApps, RegisteredApp } from '@/registry/appRegistry'
import { sounds } from '@/utils/sound'
import { GripVertical } from 'lucide-react'
import { updateService } from '@/services/updateService'
import AppIcon from './AppIcon'

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
  onAppOrderChange,
  onOpenApp
}: AppLauncherProps) {
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

    return ordered
  }, [allApps, appOrder, hiddenAppIds])

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
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center select-none px-2 sm:px-4">
      {/* Applications Header */}
      <div className="w-full flex items-center justify-center mb-4 sm:mb-6">
        <span className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.25em] text-slate-300/80 drop-shadow">
          Applications
        </span>
      </div>

      {/* 4-Column Responsive App Grid on Mobile */}
      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-x-2.5 sm:gap-x-4 md:gap-x-6 gap-y-4 sm:gap-y-6 w-full justify-items-center">
        {visibleApps.map(app => {
          const isDragging = draggedAppId === app.id
          const isDragOver = dragOverAppId === app.id

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
              className={`flex flex-col items-center group cursor-pointer select-none transition-all duration-300 w-full max-w-[80px] sm:max-w-[92px] md:max-w-[104px] relative ${
                isDragging ? 'opacity-40 scale-95' : 'hover:scale-105 active:scale-95'
              } ${isDragOver ? 'ring-2 ring-indigo-400 rounded-3xl p-1 scale-105' : ''}`}
            >
              {/* Premium OS-Grade Squircle App Icon */}
              <div className="relative">
                <AppIcon appId={app.id} />

                {/* Unread Update indicator for Settings app */}
                {app.id === 'settings' && hasUnreadUpdates && (
                  <span className="absolute -top-1.5 -right-1.5 z-20 px-1.5 py-0.5 rounded-full bg-emerald-400 text-slate-950 text-[9px] font-extrabold uppercase tracking-wider shadow-lg border border-white/40 animate-pulse">
                    NEW
                  </span>
                )}
              </div>

              {/* App Name Label - 2 lines max centered, perfectly legible */}
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
