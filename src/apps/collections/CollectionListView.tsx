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

interface CollectionListViewProps {
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

export default function CollectionListView({
  items,
  onOpenItem,
  onToggleFavorite,
  onRemoveItem
}: CollectionListViewProps) {
  if (items.length === 0) {
    return (
      <div className="py-16 text-center text-slate-400">
        <Sparkles className="w-8 h-8 text-indigo-400/60 mx-auto mb-2" />
        <p className="text-sm font-medium text-slate-300">No items match the current filter</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-white/10 text-[10px] uppercase font-semibold tracking-wider text-slate-400">
            <th className="py-2.5 px-3 w-10"></th>
            <th className="py-2.5 px-3">Type</th>
            <th className="py-2.5 px-3">Item / Title</th>
            <th className="py-2.5 px-3">Source & Context</th>
            <th className="py-2.5 px-3">Curator Note</th>
            <th className="py-2.5 px-3 w-20 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5 text-xs">
          {items.map(item => {
            const Icon = getItemIcon(item.itemType)
            const displayTitle = item.liveTitle || item.title
            const displaySubtitle = item.liveDescription || item.description

            return (
              <tr
                key={item.id}
                onClick={() => onOpenItem(item)}
                className="group hover:bg-white/10 transition cursor-pointer"
              >
                {/* Star */}
                <td className="py-3 px-3 text-center" onClick={e => e.stopPropagation()}>
                  <button
                    onClick={() => {
                      sounds.playClick()
                      onToggleFavorite(item.id)
                    }}
                    className={`p-1 rounded hover:bg-white/10 transition ${
                      item.favorite ? 'text-amber-400' : 'text-slate-500'
                    }`}
                  >
                    <Star className={`w-3.5 h-3.5 ${item.favorite ? 'fill-current' : ''}`} />
                  </button>
                </td>

                {/* Type */}
                <td className="py-3 px-3">
                  <div className="flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span className="text-[11px] font-medium text-slate-300 capitalize">
                      {item.itemType}
                    </span>
                  </div>
                </td>

                {/* Item / Title */}
                <td className="py-3 px-3 min-w-[220px]">
                  <div className="font-medium text-white group-hover:text-indigo-300 transition line-clamp-1">
                    {displayTitle}
                  </div>
                  {item.manualContent && (
                    <div className="text-[11px] text-slate-400 italic line-clamp-1 mt-0.5">
                      {item.manualContent}
                    </div>
                  )}
                  {item.isMissing && (
                    <div className="flex items-center gap-1 text-[10px] text-amber-400 mt-0.5">
                      <AlertCircle className="w-3 h-3" />
                      <span>Original deleted</span>
                    </div>
                  )}
                </td>

                {/* Source & Context */}
                <td className="py-3 px-3 min-w-[160px] text-slate-400 text-[11px]">
                  {item.sourceType ? (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-indigo-300">
                      SuperDash {item.sourceType.replace('_', ' ')}
                    </span>
                  ) : item.url ? (
                    <span className="text-slate-400 flex items-center gap-1 truncate max-w-[180px]">
                      <ExternalLink className="w-3 h-3 shrink-0" />
                      {item.url}
                    </span>
                  ) : (
                    displaySubtitle || '—'
                  )}
                </td>

                {/* Curator Note */}
                <td className="py-3 px-3 min-w-[150px] text-slate-400 italic text-[11px]">
                  {item.note || '—'}
                </td>

                {/* Actions */}
                <td
                  className="py-3 px-3 text-right"
                  onClick={e => e.stopPropagation()}
                >
                  <button
                    onClick={() => {
                      sounds.playClick()
                      onRemoveItem(item.id)
                    }}
                    className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-white/10 transition"
                    title="Remove"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
