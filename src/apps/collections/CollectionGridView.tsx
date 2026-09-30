import {
  ExternalLink,
  BookOpen,
  Quote as QuoteIcon,
  Lightbulb,
  FileText,
  BookMarked,
  Scale,
  CheckSquare,
  Sparkles,
  Compass,
  Film,
  Book,
  Star,
  Trash2,
  AlertCircle
} from 'lucide-react'
import { CollectionItemType } from '@/types'
import { ResolvedCollectionItem } from '@/services/collections'
import { sounds } from '@/utils/sound'

interface CollectionGridViewProps {
  items: ResolvedCollectionItem[]
  onOpenItem: (item: ResolvedCollectionItem) => void
  onToggleFavorite: (itemId: string) => void
  onRemoveItem: (itemId: string) => void
}

function getItemIcon(type: CollectionItemType) {
  switch (type) {
    case 'article':
      return BookOpen
    case 'quote':
      return QuoteIcon
    case 'idea':
      return Lightbulb
    case 'note':
      return FileText
    case 'decision':
      return BookMarked
    case 'hearing':
      return Scale
    case 'task':
      return CheckSquare
    case 'place':
      return Compass
    case 'movie':
      return Film
    case 'book':
      return Book
    case 'link':
      return ExternalLink
    default:
      return Sparkles
  }
}

export default function CollectionGridView({
  items,
  onOpenItem,
  onToggleFavorite,
  onRemoveItem
}: CollectionGridViewProps) {
  if (items.length === 0) {
    return (
      <div className="py-16 text-center text-slate-400">
        <Sparkles className="w-8 h-8 text-indigo-400/60 mx-auto mb-2" />
        <p className="text-sm font-medium text-slate-300">No items match the current filter</p>
        <p className="text-xs text-slate-500 mt-1">Add items or switch filters above</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
      {items.map(item => {
        const Icon = getItemIcon(item.itemType)
        const displayTitle = item.liveTitle || item.title
        const displaySubtitle = item.liveDescription || item.description

        return (
          <div
            key={item.id}
            onClick={() => onOpenItem(item)}
            className="group relative p-4 rounded-2xl liquid-glass border border-white/10 hover:border-white/25 hover:bg-white/10 transition flex flex-col justify-between cursor-pointer min-h-[140px]"
          >
            {/* Top Bar: Icon, Type Badge, Star & Delete */}
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-6 h-6 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
                  <Icon className="w-3.5 h-3.5 text-indigo-300" />
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 capitalize truncate">
                  {item.itemType}
                </span>
                {item.sourceType && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 shrink-0">
                    Live Link
                  </span>
                )}
              </div>

              <div
                className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition"
                onClick={e => e.stopPropagation()}
              >
                <button
                  onClick={() => {
                    sounds.playClick()
                    onToggleFavorite(item.id)
                  }}
                  className={`p-1 rounded-lg hover:bg-white/10 transition ${
                    item.favorite ? 'text-amber-400' : 'text-slate-400'
                  }`}
                  title={item.favorite ? 'Unfavorite' : 'Favorite'}
                >
                  <Star className={`w-3.5 h-3.5 ${item.favorite ? 'fill-current' : ''}`} />
                </button>
                <button
                  onClick={() => {
                    sounds.playClick()
                    onRemoveItem(item.id)
                  }}
                  className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-white/10 transition"
                  title="Remove from collection"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Title & Description */}
            <div className="flex-1 min-w-0 mb-3">
              <h3 className="text-xs font-semibold text-white group-hover:text-indigo-200 transition line-clamp-2 leading-snug">
                {displayTitle}
              </h3>
              {displaySubtitle && (
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {displaySubtitle}
                </p>
              )}
              {item.manualContent && (
                <p className="text-[11px] text-slate-300 italic mt-1.5 line-clamp-2 border-l-2 border-indigo-400/40 pl-2">
                  {item.manualContent}
                </p>
              )}
              {item.isMissing && (
                <div className="flex items-center gap-1 text-[10px] text-amber-400/90 mt-1.5">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>Original record was removed; snapshot kept</span>
                </div>
              )}
            </div>

            {/* Bottom Note & Action Indicator */}
            <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px]">
              {item.note ? (
                <span className="text-slate-400 truncate italic">
                  Note: {item.note}
                </span>
              ) : (
                <span className="text-slate-500">
                  Added {new Date(item.addedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              )}

              <span className="text-indigo-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5 shrink-0 ml-2">
                <span>Open</span>
                {item.url ? <ExternalLink className="w-2.5 h-2.5" /> : <span>→</span>}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
