import { useState, useMemo } from 'react'
import {
  ArrowLeft,
  Plus,
  Search,
  LayoutGrid,
  List as ListIcon,
  Columns3,
  Download,
  Star,
  Archive,
  Trash2,
  Share2,
  Sparkles,
  Link as LinkIcon,
  Filter,
  Check,
  Edit3
} from 'lucide-react'
import { Collection, CollectionItemType, CollectionViewMode } from '@/types'
import {
  ResolvedCollectionItem,
  exportCollectionToMarkdown,
  downloadMarkdownFile
} from '@/services/collections'
import CollectionGridView from './CollectionGridView'
import CollectionListView from './CollectionListView'
import CollectionBoardView from './CollectionBoardView'
import AddItemModal from './AddItemModal'
import { sounds } from '@/utils/sound'

interface CollectionDetailViewProps {
  collection: Collection
  items: ResolvedCollectionItem[]
  allCollections: Collection[]
  onBack: () => void
  onOpenApp: (appId: string, customProps?: Record<string, unknown>) => void
  onToggleFavoriteCollection: (id: string) => Promise<void>
  onArchiveCollection: (id: string) => Promise<void>
  onDeleteCollection: (id: string) => Promise<void>
  onUpdateCollection: (id: string, updates: Partial<Collection>) => Promise<void>
  onAddItem: (item: Parameters<typeof AddItemModal>[0]['onAdd'] extends (arg: infer P) => unknown ? P : never) => Promise<void>
  onRemoveItem: (itemId: string) => Promise<void>
  onToggleFavoriteItem: (itemId: string) => Promise<void>
  onMoveItemToSection: (itemId: string, sectionId?: string) => Promise<void>
  onSelectCollection: (colId: string) => void
}

export default function CollectionDetailView({
  collection,
  items,
  allCollections,
  onBack,
  onOpenApp,
  onToggleFavoriteCollection,
  onArchiveCollection,
  onDeleteCollection,
  onUpdateCollection,
  onAddItem,
  onRemoveItem,
  onToggleFavoriteItem,
  onMoveItemToSection,
  onSelectCollection
}: CollectionDetailViewProps) {
  const [viewMode, setViewMode] = useState<CollectionViewMode>(collection.viewMode || 'grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'recent' | 'oldest' | 'alpha' | 'favorite'>('recent')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditingNote, setIsEditingNote] = useState(false)
  const [collectionNote, setCollectionNote] = useState(collection.note || '')

  // Save preferred view mode
  const handleSetViewMode = (mode: CollectionViewMode) => {
    sounds.playClick()
    setViewMode(mode)
    onUpdateCollection(collection.id, { viewMode: mode })
  }

  // Calculate available item types present in this collection for filtering
  const presentTypes = useMemo(() => {
    const types = new Set<CollectionItemType>()
    items.forEach(i => types.add(i.itemType))
    return Array.from(types)
  }, [items])

  // Filter and sort items
  const filteredItems = useMemo(() => {
    let result = [...items]

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      result = result.filter(i => {
        const title = (i.liveTitle || i.title).toLowerCase()
        const desc = (i.liveDescription || i.description || '').toLowerCase()
        const note = (i.note || '').toLowerCase()
        const manual = (i.manualContent || '').toLowerCase()
        return title.includes(q) || desc.includes(q) || note.includes(q) || manual.includes(q)
      })
    }

    // Type filter
    if (selectedTypeFilter !== 'all') {
      result = result.filter(i => i.itemType === selectedTypeFilter)
    }

    // Sorting
    if (sortBy === 'favorite') {
      result.sort((a, b) => (b.favorite ? 1 : 0) - (a.favorite ? 1 : 0))
    } else if (sortBy === 'alpha') {
      result.sort((a, b) => (a.liveTitle || a.title).localeCompare(b.liveTitle || b.title))
    } else if (sortBy === 'oldest') {
      result.sort((a, b) => a.addedAt - b.addedAt)
    } else {
      // Recent (default)
      result.sort((a, b) => b.addedAt - a.addedAt)
    }

    return result
  }, [items, searchQuery, selectedTypeFilter, sortBy])

  // Handle opening an item based on reference / URL
  const handleOpenItem = (item: ResolvedCollectionItem) => {
    sounds.playClick()
    if (item.url) {
      window.open(item.url, '_blank')
      return
    }

    if (item.sourceType && item.sourceId) {
      switch (item.sourceType) {
        case 'reader_article':
          onOpenApp('reader', { activeArticleId: item.sourceId })
          break
        case 'reader_quote':
          onOpenApp('reader')
          break
        case 'idea':
          onOpenApp('ideas', { focusIdeaId: item.sourceId })
          break
        case 'note':
          onOpenApp('notes', { selectedNoteId: item.sourceId })
          break
        case 'decision':
          onOpenApp('decisionbook', { focusDecisionId: item.sourceId })
          break
        case 'hearing':
          onOpenApp('hearings', { focusHearingId: item.sourceId })
          break
        case 'task':
          onOpenApp('tasks')
          break
        case 'document':
          onOpenApp('files')
          break
        default:
          break
      }
    }
  }

  // Handle Export Markdown
  const handleExport = () => {
    sounds.playSuccess()
    const md = exportCollectionToMarkdown(collection, items)
    downloadMarkdownFile(collection.name, md)
  }

  // Handle Add section from board view
  const handleAddSection = async (title: string) => {
    const sections = collection.sections || []
    const newSection = {
      id: `sec-${Date.now()}`,
      collectionId: collection.id,
      title,
      order: sections.length
    }
    await onUpdateCollection(collection.id, {
      sections: [...sections, newSection]
    })
  }

  // Save collection note
  const handleSaveCollectionNote = async () => {
    sounds.playClick()
    await onUpdateCollection(collection.id, { note: collectionNote.trim() || undefined })
    setIsEditingNote(false)
  }

  const relatedCollections = useMemo(() => {
    const ids = collection.relatedCollectionIds || []
    return allCollections.filter(c => ids.includes(c.id))
  }, [collection.relatedCollectionIds, allCollections])

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Top Navigation & Actions Bar */}
      <div className="px-5 py-3 border-b border-white/10 flex items-center justify-between gap-3 shrink-0">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white text-xs font-semibold transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>All Collections</span>
        </button>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onToggleFavoriteCollection(collection.id)}
            className={`p-2 rounded-xl hover:bg-white/10 transition ${
              collection.favorite ? 'text-amber-400' : 'text-slate-400'
            }`}
            title={collection.favorite ? 'Unfavorite' : 'Favorite'}
          >
            <Star className={`w-4 h-4 ${collection.favorite ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-300 hover:text-white transition"
            title="Export as Markdown document"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Export MD</span>
          </button>
          <button
            onClick={() => onArchiveCollection(collection.id)}
            className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition"
            title={collection.archived ? 'Unarchive' : 'Archive'}
          >
            <Archive className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              if (window.confirm(`Are you sure you want to delete "${collection.name}"? This cannot be undone.`)) {
                onDeleteCollection(collection.id)
              }
            }}
            className="p-2 rounded-xl hover:bg-white/10 text-slate-500 hover:text-rose-400 transition"
            title="Delete Collection"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto px-6 py-6 max-w-6xl mx-auto w-full">
        {/* Editorial Cover Banner */}
        <div className="relative rounded-3xl overflow-hidden mb-6 p-6 sm:p-8 border border-white/15 shadow-xl bg-gradient-to-br from-black/40 to-black/80">
          {collection.coverValue && (
            <div
              className={`absolute inset-0 bg-gradient-to-tr ${collection.coverValue} opacity-20 pointer-events-none`}
            />
          )}

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-400/20">
                Collection
              </span>
              <span className="text-xs text-slate-400">
                {items.length} {items.length === 1 ? 'item' : 'items'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
              {collection.name}
            </h1>

            {collection.description && (
              <p className="text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
                {collection.description}
              </p>
            )}

            {/* Curator note */}
            <div className="mt-4 pt-3 border-t border-white/10 max-w-2xl">
              {isEditingNote ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    autoFocus
                    placeholder="Add a curator note about this collection..."
                    value={collectionNote}
                    onChange={e => setCollectionNote(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-xl bg-black/50 border border-white/20 text-white text-xs focus:outline-none"
                  />
                  <button
                    onClick={handleSaveCollectionNote}
                    className="px-3 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setIsEditingNote(false)}
                    className="px-2 text-xs text-slate-400"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => setIsEditingNote(true)}
                  className="flex items-center gap-2 text-xs text-slate-400 hover:text-white cursor-pointer group"
                >
                  <Edit3 className="w-3 h-3 text-indigo-400 shrink-0" />
                  <span className="italic">
                    {collection.note ? `"${collection.note}"` : 'Add curator note...'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Collections if defined */}
        {relatedCollections.length > 0 && (
          <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider shrink-0">
              Related Collections:
            </span>
            {relatedCollections.map(rel => (
              <button
                key={rel.id}
                onClick={() => onSelectCollection(rel.id)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 hover:border-indigo-400/40 text-xs text-slate-300 hover:text-white transition shrink-0"
              >
                <span>{rel.name}</span>
                <span className="text-[10px] text-slate-500">→</span>
              </button>
            ))}
          </div>
        )}

        {/* Toolbar: + Add Item, Search, Filter, Sort, View Modes */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-5">
          {/* Left: Add & Search */}
          <div className="flex items-center gap-2 flex-1">
            <button
              onClick={() => {
                sounds.playClick()
                setIsAddModalOpen(true)
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add Item</span>
            </button>

            <div className="relative flex-1 max-w-xs">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search collection..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-black/30 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-400"
              />
            </div>
          </div>

          {/* Right: View Mode switcher & Sort */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* Sort */}
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as typeof sortBy)}
              className="bg-black/30 border border-white/10 text-slate-300 rounded-xl px-2.5 py-1.5 text-xs focus:outline-none"
            >
              <option value="recent">Recently Added</option>
              <option value="oldest">Oldest First</option>
              <option value="alpha">Alphabetical</option>
              <option value="favorite">Favorites First</option>
            </select>

            {/* View Switcher */}
            <div className="flex items-center bg-black/40 border border-white/10 rounded-xl p-0.5">
              <button
                onClick={() => handleSetViewMode('grid')}
                className={`p-1.5 rounded-lg transition ${
                  viewMode === 'grid' ? 'bg-white/20 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleSetViewMode('list')}
                className={`p-1.5 rounded-lg transition ${
                  viewMode === 'list' ? 'bg-white/20 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="List View"
              >
                <ListIcon className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleSetViewMode('board')}
                className={`p-1.5 rounded-lg transition ${
                  viewMode === 'board' ? 'bg-white/20 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="Board View"
              >
                <Columns3 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Type Filter Pills (only show types present in this collection) */}
        {presentTypes.length > 1 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-3">
            <button
              onClick={() => setSelectedTypeFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition ${
                selectedTypeFilter === 'all'
                  ? 'bg-indigo-600/30 border-indigo-400 text-white'
                  : 'bg-black/20 border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              All ({items.length})
            </button>
            {presentTypes.map(type => {
              const count = items.filter(i => i.itemType === type).length
              return (
                <button
                  key={type}
                  onClick={() => setSelectedTypeFilter(type)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border capitalize transition ${
                    selectedTypeFilter === type
                      ? 'bg-indigo-600/30 border-indigo-400 text-white'
                      : 'bg-black/20 border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  {type} ({count})
                </button>
              )
            })}
          </div>
        )}

        {/* Items View */}
        {items.length === 0 ? (
          <div className="py-20 text-center rounded-3xl border border-dashed border-white/15 p-8">
            <Sparkles className="w-10 h-10 text-indigo-400/60 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white tracking-wide">
              THIS COLLECTION IS EMPTY
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Gather articles, quotes, ideas, notes, links, or thoughts that belong together.
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="mt-4 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition shadow-md"
            >
              + Add Item
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <CollectionGridView
            items={filteredItems}
            onOpenItem={handleOpenItem}
            onToggleFavorite={onToggleFavoriteItem}
            onRemoveItem={onRemoveItem}
          />
        ) : viewMode === 'list' ? (
          <CollectionListView
            items={filteredItems}
            onOpenItem={handleOpenItem}
            onToggleFavorite={onToggleFavoriteItem}
            onRemoveItem={onRemoveItem}
          />
        ) : (
          <CollectionBoardView
            sections={collection.sections || []}
            items={filteredItems}
            onOpenItem={handleOpenItem}
            onMoveItemToSection={onMoveItemToSection}
            onAddSection={handleAddSection}
            onRemoveItem={onRemoveItem}
          />
        )}
      </div>

      {/* Add Item Modal */}
      <AddItemModal
        isOpen={isAddModalOpen}
        collectionId={collection.id}
        sections={collection.sections || []}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={onAddItem}
      />
    </div>
  )
}
