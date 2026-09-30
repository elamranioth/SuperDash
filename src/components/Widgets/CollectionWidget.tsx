import { useState, useEffect } from 'react'
import { Sparkles, ArrowRight, BookOpen, Quote as QuoteIcon, Lightbulb, FileText, ExternalLink } from 'lucide-react'
import { Collection, CollectionItem, WidgetSize } from '@/types'
import { collectionsRepository } from '@/services/collections'
import { sounds } from '@/utils/sound'

interface CollectionWidgetProps {
  collectionId?: string
  size?: WidgetSize
  onOpenCollection?: (collectionId: string) => void
  onOpenApp?: (appId: string, customProps?: Record<string, unknown>) => void
}

export default function CollectionWidget({
  collectionId,
  size = 'md',
  onOpenCollection,
  onOpenApp
}: CollectionWidgetProps) {
  const [collection, setCollection] = useState<Collection | null>(null)
  const [items, setItems] = useState<CollectionItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    async function fetchWidgetData() {
      try {
        const allCols = await collectionsRepository.getAllCollections(false)
        if (allCols.length === 0) {
          if (isMounted) setIsLoading(false)
          return
        }

        // Pick requested collection or first favorite or first available
        const target = collectionId
          ? allCols.find(c => c.id === collectionId) || allCols[0]
          : allCols.find(c => c.favorite) || allCols[0]

        if (target && isMounted) {
          setCollection(target)
          const colItems = await collectionsRepository.getItemsByCollection(target.id)
          setItems(colItems.slice(0, size === 'sm' ? 2 : 4))
        }
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    fetchWidgetData()
    return () => {
      isMounted = false
    }
  }, [collectionId, size])

  const handleOpen = () => {
    sounds.playClick()
    if (!collection) return
    if (onOpenCollection) {
      onOpenCollection(collection.id)
    } else if (onOpenApp) {
      onOpenApp('collections', { initialCollectionId: collection.id })
    }
  }

  if (isLoading) {
    return (
      <div className="p-3 text-center text-xs text-slate-400 flex items-center justify-center h-full min-h-[100px]">
        Loading collection...
      </div>
    )
  }

  if (!collection) {
    return (
      <div className="p-3 text-center text-xs text-slate-400 flex flex-col items-center justify-center h-full min-h-[100px]">
        <Sparkles className="w-5 h-5 text-indigo-400/50 mb-1" />
        <span>No collection selected</span>
      </div>
    )
  }

  return (
    <div
      onClick={handleOpen}
      className="flex flex-col justify-between h-full p-1 cursor-pointer group"
    >
      <div>
        <div className="flex items-center justify-between gap-1 mb-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="w-5 h-5 rounded-lg bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center shrink-0">
              <Sparkles className="w-3 h-3 text-indigo-300" />
            </div>
            <span className="text-xs font-bold text-white group-hover:text-indigo-200 transition truncate">
              {collection.name}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono shrink-0">
            {items.length} {items.length === 1 ? 'item' : 'items'}
          </span>
        </div>

        {/* Latest Items List */}
        <div className="space-y-1.5 mt-2">
          {items.map(item => (
            <div
              key={item.id}
              className="px-2 py-1.5 rounded-lg bg-black/25 border border-white/5 flex items-center justify-between gap-2 text-[11px]"
            >
              <span className="text-slate-300 truncate font-medium flex-1">
                {item.title}
              </span>
              <span className="text-[9px] uppercase tracking-wider text-indigo-300 font-semibold px-1 rounded bg-white/5 shrink-0">
                {item.itemType}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-2 mt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-indigo-400 font-semibold group-hover:text-indigo-300 transition">
        <span>Open Collection</span>
        <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  )
}
