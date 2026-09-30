import { useState, useMemo } from 'react'
import {
  Plus,
  Search,
  Star,
  Sparkles,
  Compass,
  Scale,
  Brain,
  Bookmark,
  Folder,
  Archive,
  ArrowRight,
  Layers,
  Heart
} from 'lucide-react'
import { Collection, CollectionItem } from '@/types'
import CreateCollectionModal from './CreateCollectionModal'
import { sounds } from '@/utils/sound'

interface CollectionsHomeProps {
  collections: Collection[]
  items: CollectionItem[]
  onSelectCollection: (id: string) => void
  onCreateCollection: (data: Omit<Collection, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  onToggleFavorite: (id: string) => Promise<void>
}

function getIconComponent(iconName?: string) {
  switch (iconName) {
    case 'Brain':
      return Brain
    case 'Compass':
      return Compass
    case 'Scale':
      return Scale
    case 'Heart':
      return Heart
    case 'Bookmark':
      return Bookmark
    case 'Folder':
      return Folder
    default:
      return Sparkles
  }
}

export default function CollectionsHome({
  collections,
  items,
  onSelectCollection,
  onCreateCollection,
  onToggleFavorite
}: CollectionsHomeProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [showArchived, setShowArchived] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [filterFavorite, setFilterFavorite] = useState(false)

  // Map of item counts per collection
  const countMap = useMemo(() => {
    const map = new Map<string, number>()
    items.forEach(item => {
      map.set(item.collectionId, (map.get(item.collectionId) || 0) + 1)
    })
    return map
  }, [items])

  // Filter collections
  const filteredCollections = useMemo(() => {
    return collections.filter(c => {
      if (!showArchived && c.archived) return false
      if (showArchived && !c.archived) return false
      if (filterFavorite && !c.favorite) return false
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const nameMatch = c.name.toLowerCase().includes(q)
        const descMatch = (c.description || '').toLowerCase().includes(q)
        return nameMatch || descMatch
      }
      return true
    })
  }, [collections, showArchived, filterFavorite, searchQuery])

  // Split into Recent / All
  const recentCollections = useMemo(() => {
    return [...filteredCollections]
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, 3)
  }, [filteredCollections])

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Editorial Header */}
      <div className="px-6 py-5 border-b border-white/10 shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 max-w-6xl mx-auto w-full">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">
                Curated Spaces
              </span>
              <span className="text-xs text-slate-500">·</span>
              <span className="text-xs text-slate-400">
                {collections.filter(c => !c.archived).length} Collections
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight mt-0.5">
              Collections
            </h1>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                sounds.playClick()
                setFilterFavorite(prev => !prev)
              }}
              className={`p-2 rounded-xl border text-xs transition ${
                filterFavorite
                  ? 'bg-amber-500/20 border-amber-400/50 text-amber-300'
                  : 'bg-black/30 border-white/10 text-slate-400 hover:text-white'
              }`}
              title="Filter by Favorites"
            >
              <Star className={`w-4 h-4 ${filterFavorite ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={() => {
                sounds.playClick()
                setShowArchived(prev => !prev)
              }}
              className={`p-2 rounded-xl border text-xs transition ${
                showArchived
                  ? 'bg-indigo-500/20 border-indigo-400/50 text-indigo-300'
                  : 'bg-black/30 border-white/10 text-slate-400 hover:text-white'
              }`}
              title={showArchived ? 'View Active' : 'View Archived'}
            >
              <Archive className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                sounds.playClick()
                setIsCreateModalOpen(true)
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition"
            >
              <Plus className="w-4 h-4" />
              <span>New Collection</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Body */}
      <div className="flex-1 overflow-y-auto px-6 py-6 max-w-6xl mx-auto w-full space-y-8">
        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search collections..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-black/30 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-400 transition"
          />
        </div>

        {/* RECENT Section (only if not searching or filtering) */}
        {!searchQuery && !filterFavorite && !showArchived && recentCollections.length > 0 && (
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3 px-1">
              Recent
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {recentCollections.map(col => {
                const itemCount = countMap.get(col.id) || 0
                const IconComponent = getIconComponent(col.icon)
                return (
                  <div
                    key={col.id}
                    onClick={() => {
                      sounds.playClick()
                      onSelectCollection(col.id)
                    }}
                    className="group relative rounded-3xl p-5 border border-white/15 liquid-glass hover:border-white/30 hover:bg-white/10 transition cursor-pointer overflow-hidden flex flex-col justify-between min-h-[160px] shadow-lg"
                  >
                    {col.coverValue && (
                      <div
                        className={`absolute inset-0 bg-gradient-to-tr ${col.coverValue} opacity-20 pointer-events-none group-hover:opacity-30 transition-opacity`}
                      />
                    )}

                    <div className="relative z-10 flex items-start justify-between gap-2 mb-3">
                      <div className="w-9 h-9 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center shadow">
                        <IconComponent className="w-4 h-4 text-indigo-300" />
                      </div>
                      <button
                        onClick={e => {
                          e.stopPropagation()
                          sounds.playClick()
                          onToggleFavorite(col.id)
                        }}
                        className={`p-1.5 rounded-lg hover:bg-white/10 transition ${
                          col.favorite ? 'text-amber-400' : 'text-slate-500'
                        }`}
                      >
                        <Star className={`w-3.5 h-3.5 ${col.favorite ? 'fill-current' : ''}`} />
                      </button>
                    </div>

                    <div className="relative z-10 flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-white group-hover:text-indigo-200 transition line-clamp-1">
                        {col.name}
                      </h3>
                      {col.description && (
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                          {col.description}
                        </p>
                      )}
                    </div>

                    <div className="relative z-10 pt-3 border-t border-white/10 mt-3 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 font-medium">
                        {itemCount} {itemCount === 1 ? 'item' : 'items'}
                      </span>
                      <span className="text-indigo-400 font-semibold group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                        <span>Open</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ALL COLLECTIONS Section */}
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3 px-1">
            {showArchived ? 'Archived Collections' : 'All Collections'}
          </div>

          {filteredCollections.length === 0 ? (
            <div className="py-16 text-center rounded-3xl border border-dashed border-white/15 p-6">
              <Sparkles className="w-8 h-8 text-indigo-400/50 mx-auto mb-2" />
              <p className="text-sm font-semibold text-white">No collections found</p>
              <p className="text-xs text-slate-400 mt-1">
                {searchQuery
                  ? 'Try a different search query'
                  : 'Create your first collection to gather meaningful research and thoughts.'}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
                >
                  + New Collection
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {filteredCollections.map(col => {
                const itemCount = countMap.get(col.id) || 0
                const IconComponent = getIconComponent(col.icon)
                return (
                  <div
                    key={col.id}
                    onClick={() => {
                      sounds.playClick()
                      onSelectCollection(col.id)
                    }}
                    className="group relative rounded-3xl p-5 border border-white/15 liquid-glass hover:border-white/30 hover:bg-white/10 transition cursor-pointer overflow-hidden flex flex-col justify-between min-h-[160px] shadow"
                  >
                    {col.coverValue && (
                      <div
                        className={`absolute inset-0 bg-gradient-to-tr ${col.coverValue} opacity-15 pointer-events-none group-hover:opacity-25 transition-opacity`}
                      />
                    )}

                    <div className="relative z-10 flex items-start justify-between gap-2 mb-3">
                      <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center">
                        <IconComponent className="w-4 h-4 text-indigo-300" />
                      </div>
                      <button
                        onClick={e => {
                          e.stopPropagation()
                          sounds.playClick()
                          onToggleFavorite(col.id)
                        }}
                        className={`p-1.5 rounded-lg hover:bg-white/10 transition ${
                          col.favorite ? 'text-amber-400' : 'text-slate-500'
                        }`}
                      >
                        <Star className={`w-3.5 h-3.5 ${col.favorite ? 'fill-current' : ''}`} />
                      </button>
                    </div>

                    <div className="relative z-10 flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-white group-hover:text-indigo-200 transition line-clamp-1">
                        {col.name}
                      </h3>
                      {col.description && (
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                          {col.description}
                        </p>
                      )}
                    </div>

                    <div className="relative z-10 pt-3 border-t border-white/10 mt-3 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 font-medium">
                        {itemCount} {itemCount === 1 ? 'item' : 'items'}
                      </span>
                      <span className="text-indigo-400 font-semibold group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                        <span>View</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Create Collection Modal */}
      <CreateCollectionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={onCreateCollection}
      />
    </div>
  )
}
