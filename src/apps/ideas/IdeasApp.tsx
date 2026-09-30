import { useState, useEffect, useMemo, useRef } from 'react'
import {
  Lightbulb,
  Plus,
  Search,
  Heart,
  MoreVertical,
  Sparkles,
  Shuffle,
  Trash2,
  Archive,
  ArrowRight,
  Tag,
  Folder,
  CheckCircle2,
  Clock,
  Flame,
  X,
  Edit3,
  FolderPlus
} from 'lucide-react'
import CollectionPickerModal, { CollectionPickerPayload } from '@/apps/collections/CollectionPickerModal'
import { IdeaItem, IdeaStatus, IdeaPriority } from '@/types'
import {
  ideasService,
  DEFAULT_IDEA_CATEGORIES,
  INITIAL_IDEAS
} from '@/services/ideas'
import GlassPanel from '@/components/LiquidGlass/GlassPanel'
import GlassButton from '@/components/LiquidGlass/GlassButton'
import GlassModal from '@/components/LiquidGlass/GlassModal'
import AppHeader from '@/components/AppWindow/AppHeader'
import EmptyState from '@/components/LiquidGlass/EmptyState'
import { sounds } from '@/utils/sound'

type FilterTab = 'all' | 'inbox' | 'favorites' | 'in_progress' | 'archived'

interface IdeasAppProps {
  initialIdeaId?: string
}

export default function IdeasApp({ initialIdeaId }: IdeasAppProps) {
  const [ideas, setIdeas] = useState<IdeaItem[]>([])
  const [activeTab, setActiveTab] = useState<FilterTab>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  
  // Quick Capture input
  const [quickTitle, setQuickTitle] = useState('')
  const quickInputRef = useRef<HTMLInputElement>(null)

  // Selected idea for editing / detail view
  const [editingIdea, setEditingIdea] = useState<IdeaItem | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [editCategory, setEditCategory] = useState('')
  const [editCustomCategory, setEditCustomCategory] = useState('')
  const [editStatus, setEditStatus] = useState<IdeaStatus>('INBOX')
  const [editPriority, setEditPriority] = useState<IdeaPriority>('medium')
  const [editTags, setEditTags] = useState<string[]>([])
  const [newTagInput, setNewTagInput] = useState('')

  // Surprise Me modal
  const [surpriseIdea, setSurpriseIdea] = useState<IdeaItem | null>(null)

  // Context menu dropdown state
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null)
  const [collectionPickerPayload, setCollectionPickerPayload] = useState<CollectionPickerPayload | null>(null)

  // Load ideas
  const loadIdeas = async () => {
    const list = await ideasService.getAll()
    setIdeas(list)
  }

  useEffect(() => {
    loadIdeas()
    const unsub = ideasService.subscribe(() => {
      loadIdeas()
    })
    return () => unsub()
  }, [])

  // Open Edit Modal
  const openDetailModal = (idea: IdeaItem) => {
    sounds.playClick()
    setEditingIdea(idea)
    setEditTitle(idea.title)
    setEditDesc(idea.description || '')
    setEditCategory(idea.category || 'Other')
    setEditCustomCategory('')
    setEditStatus(idea.status)
    setEditPriority(idea.priority || 'medium')
    setEditTags(idea.tags || [])
    setNewTagInput('')
  }

  // Deep linking support
  useEffect(() => {
    if (initialIdeaId && ideas.length > 0) {
      const match = ideas.find(i => i.id === initialIdeaId)
      if (match) {
        openDetailModal(match)
      }
    }
  }, [initialIdeaId, ideas])

  // Close context menu on outside click
  useEffect(() => {
    const handleWindowClick = () => setActiveMenuId(null)
    window.addEventListener('click', handleWindowClick)
    return () => window.removeEventListener('click', handleWindowClick)
  }, [])

  // Listen for custom event e.g. from Command Palette "New Idea"
  useEffect(() => {
    const handleCommandNew = () => {
      quickInputRef.current?.focus()
    }
    window.addEventListener('superdash_ideas_new_focus', handleCommandNew)
    return () => window.removeEventListener('superdash_ideas_new_focus', handleCommandNew)
  }, [])

  // All distinct categories
  const categories = useMemo(() => {
    const set = new Set(DEFAULT_IDEA_CATEGORIES)
    ideas.forEach(i => {
      if (i.category) set.add(i.category)
    })
    return Array.from(set)
  }, [ideas])

  // Handle Quick Capture
  const handleQuickCapture = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!quickTitle.trim()) return

    sounds.playSuccess()
    await ideasService.add({
      title: quickTitle.trim(),
      status: 'INBOX'
    })
    setQuickTitle('')
    quickInputRef.current?.focus()
  }

  // Save Edit
  const handleSaveEdit = async () => {
    if (!editingIdea || !editTitle.trim()) return

    const cat = editCategory === 'CUSTOM' ? (editCustomCategory.trim() || 'Other') : editCategory
    sounds.playSuccess()
    await ideasService.update(editingIdea.id, {
      title: editTitle.trim(),
      description: editDesc.trim(),
      category: cat,
      status: editStatus,
      priority: editPriority,
      tags: editTags
    })
    setEditingIdea(null)
  }

  // Toggle Favorite
  const handleToggleFavorite = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    sounds.playClick()
    await ideasService.toggleFavorite(id)
  }

  // Quick Status change
  const handleChangeStatus = async (id: string, newStatus: IdeaStatus, e: React.MouseEvent) => {
    e.stopPropagation()
    sounds.playClick()
    await ideasService.update(id, { status: newStatus })
    setActiveMenuId(null)
  }

  // Delete Idea
  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    sounds.playClick()
    if (window.confirm('Are you sure you want to permanently delete this idea?')) {
      await ideasService.delete(id)
      if (editingIdea?.id === id) setEditingIdea(null)
      if (surpriseIdea?.id === id) setSurpriseIdea(null)
    }
    setActiveMenuId(null)
  }

  // Surprise Me: pick a random unfinished idea
  const handleSurpriseMe = async () => {
    sounds.playSuccess()
    const random = await ideasService.getRandomUnfinishedIdea()
    if (random) {
      setSurpriseIdea(random)
    } else {
      alert('No unfinished ideas available! You have completed or archived all your thoughts.')
    }
  }

  // Add tag in edit modal
  const handleAddTag = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return
    e.preventDefault()
    if (!newTagInput.trim()) return
    const tag = newTagInput.trim().replace(/^#/, '')
    if (!editTags.includes(tag)) {
      setEditTags([...editTags, tag])
    }
    setNewTagInput('')
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setEditTags(editTags.filter(t => t !== tagToRemove))
  }

  // Filtered Ideas
  const filteredIdeas = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    return ideas.filter(item => {
      // Tab filter
      if (activeTab === 'inbox' && item.status !== 'INBOX') return false
      if (activeTab === 'favorites' && !item.favorite) return false
      if (activeTab === 'in_progress' && item.status !== 'IN PROGRESS') return false
      if (activeTab === 'archived' && item.status !== 'ARCHIVED') return false
      if (activeTab !== 'archived' && item.status === 'ARCHIVED') return false

      // Category filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) return false

      // Search query
      if (q) {
        const inTitle = item.title.toLowerCase().includes(q)
        const inDesc = item.description?.toLowerCase().includes(q)
        const inCat = item.category?.toLowerCase().includes(q)
        const inTags = item.tags?.some(t => t.toLowerCase().includes(q))
        if (!inTitle && !inDesc && !inCat && !inTags) return false
      }

      return true
    })
  }, [ideas, activeTab, selectedCategory, searchQuery])

  // Helper date formatter
  const formatIdeaDate = (timestamp: number) => {
    const diffHours = (Date.now() - timestamp) / 3600000
    if (diffHours < 24) return 'Added today'
    const days = Math.floor(diffHours / 24)
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days} days ago`
    return new Date(timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  }

  // Status badges
  const getStatusBadge = (status: IdeaStatus) => {
    switch (status) {
      case 'INBOX':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/25">INBOX</span>
      case 'EXPLORING':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-500/15 text-sky-300 border border-sky-500/25">EXPLORING</span>
      case 'PLANNED':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/25">PLANNED</span>
      case 'IN PROGRESS':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">IN PROGRESS</span>
      case 'DONE':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">DONE</span>
      case 'ARCHIVED':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-500/15 text-zinc-400 border border-zinc-500/25">ARCHIVED</span>
    }
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Standard AppHeader */}
      <AppHeader
        title="Ideas"
        subtitle={`${ideas.filter(i => i.status !== 'ARCHIVED').length} thoughts • Capture first, organize later`}
        icon={Lightbulb}
        gradient="from-amber-500 to-orange-500"
        primaryAction={{
          label: 'Surprise Me',
          icon: Shuffle,
          onClick: handleSurpriseMe
        }}
      />

      <div className="flex-1 flex flex-col p-4 md:p-6 overflow-hidden">

      {/* Prominent Quick Capture Bar */}
      <form onSubmit={handleQuickCapture} className="mb-5 shrink-0">
        <div className="relative flex items-center rounded-2xl liquid-glass border border-white/15 p-1.5 focus-within:border-amber-400/50 focus-within:ring-2 focus-within:ring-amber-400/20 transition-all shadow-lg">
          <div className="pl-3.5 pr-2 text-amber-400 shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <input
            ref={quickInputRef}
            type="text"
            value={quickTitle}
            onChange={e => setQuickTitle(e.target.value)}
            placeholder="What's your idea?"
            className="flex-1 bg-transparent border-none text-sm md:text-base text-white placeholder-slate-400 focus:outline-none px-2 py-1.5"
          />
          <GlassButton
            type="submit"
            size="sm"
            variant="primary"
            disabled={!quickTitle.trim()}
            className="shrink-0 bg-amber-500/80 hover:bg-amber-500 border-amber-400/40 text-black font-semibold shadow-md"
          >
            <Plus className="w-4 h-4 mr-0.5" />
            <span>Save Idea</span>
          </GlassButton>
        </div>
      </form>

      {/* Navigation & Filters Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 shrink-0 pb-1">
        {/* Compact Navigation Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar p-1 rounded-xl bg-white/[0.04] border border-white/10 shrink-0">
          {(
            [
              { id: 'all', label: 'All' },
              { id: 'inbox', label: 'Inbox' },
              { id: 'favorites', label: 'Favorites' },
              { id: 'in_progress', label: 'In Progress' },
              { id: 'archived', label: 'Archived' }
            ] as const
          ).map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                sounds.playClick()
                setActiveTab(tab.id)
              }}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-white/15 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.05]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Category Filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl bg-white/[0.06] border border-white/10 text-xs text-slate-300 focus:outline-none focus:border-amber-400/40 shrink-0 max-w-[130px] truncate"
          >
            <option value="all" className="bg-slate-900 text-white">All Categories</option>
            {categories.map(c => (
              <option key={c} value={c} className="bg-slate-900 text-white">{c}</option>
            ))}
          </select>

          {/* Search Input */}
          <div className="relative flex-1 sm:w-48 flex items-center min-w-0">
            <Search className="w-3.5 h-3.5 absolute left-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search ideas..."
              className="w-full pl-8 pr-7 py-1.5 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-400/40 transition-all font-sans"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 text-slate-400 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Idea Cards Grid */}
      <div className="flex-1 overflow-y-auto pr-1">
        {filteredIdeas.length === 0 ? (
          <EmptyState
            icon={Lightbulb}
            title="No ideas found"
            description={
              searchQuery
                ? `No ideas matching "${searchQuery}". Try different keywords or clear filters.`
                : activeTab === 'inbox'
                ? 'Your Inbox is clear. Type a thought above to capture it instantly.'
                : 'No ideas match the active filter.'
            }
            action={{
              label: 'Focus Capture Input',
              icon: Plus,
              onClick: () => quickInputRef.current?.focus()
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredIdeas.map(item => (
              <div
                key={item.id}
                onClick={() => openDetailModal(item)}
                className="group relative liquid-glass rounded-2xl p-4 border border-white/10 hover:border-amber-400/30 hover:bg-white/[0.07] transition-all duration-200 cursor-pointer flex flex-col justify-between"
              >
                {/* Header & Status */}
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <h3 className="font-semibold text-sm text-white group-hover:text-amber-200 transition line-clamp-2 leading-snug">
                      {item.title}
                    </h3>

                    <button
                      onClick={e => handleToggleFavorite(item.id, e)}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-400 transition shrink-0"
                      title={item.favorite ? 'Unfavorite' : 'Favorite'}
                    >
                      <Heart
                        className={`w-4 h-4 transition ${
                          item.favorite ? 'fill-rose-500 text-rose-500' : 'text-slate-400 hover:text-rose-300'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Description Preview */}
                  {item.description && (
                    <p className="text-xs text-slate-400 line-clamp-2 mb-3 leading-relaxed">
                      {item.description}
                    </p>
                  )}
                </div>

                {/* Footer metadata */}
                <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-2 flex-wrap">
                    {getStatusBadge(item.status)}
                    {item.category && (
                      <span className="text-[11px] font-medium text-slate-300">
                        {item.category}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-500">
                      {formatIdeaDate(item.createdAt)}
                    </span>

                    {/* Context menu button */}
                    <div className="relative">
                      <button
                        onClick={e => {
                          e.stopPropagation()
                          setActiveMenuId(activeMenuId === item.id ? null : item.id)
                        }}
                        className="p-1 rounded-md hover:bg-white/10 text-slate-400 hover:text-white transition"
                      >
                        <MoreVertical className="w-3.5 h-3.5" />
                      </button>

                      {activeMenuId === item.id && (
                        <div
                          onClick={e => e.stopPropagation()}
                          className="absolute right-0 bottom-full mb-1 w-36 py-1 rounded-xl liquid-glass-heavy border border-white/15 shadow-2xl z-30 text-xs"
                        >
                          <button
                            onClick={() => {
                              openDetailModal(item)
                              setActiveMenuId(null)
                            }}
                            className="w-full text-left px-3 py-1.5 hover:bg-white/10 text-slate-200 flex items-center gap-2"
                          >
                            <Edit3 className="w-3.5 h-3.5" /> Edit
                          </button>
                          <button
                            onClick={() => {
                              setCollectionPickerPayload({
                                title: item.title,
                                description: item.description,
                                itemType: 'idea',
                                sourceType: 'idea',
                                sourceId: item.id
                              })
                              setActiveMenuId(null)
                            }}
                            className="w-full text-left px-3 py-1.5 hover:bg-white/10 text-indigo-300 flex items-center gap-2"
                          >
                            <FolderPlus className="w-3.5 h-3.5" /> Add to Collection
                          </button>
                          {item.status !== 'IN PROGRESS' && (
                            <button
                              onClick={e => handleChangeStatus(item.id, 'IN PROGRESS', e)}
                              className="w-full text-left px-3 py-1.5 hover:bg-white/10 text-indigo-300 flex items-center gap-2"
                            >
                              <Flame className="w-3.5 h-3.5" /> Start Work
                            </button>
                          )}
                          {item.status !== 'DONE' && (
                            <button
                              onClick={e => handleChangeStatus(item.id, 'DONE', e)}
                              className="w-full text-left px-3 py-1.5 hover:bg-white/10 text-emerald-300 flex items-center gap-2"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" /> Mark Done
                            </button>
                          )}
                          {item.status !== 'ARCHIVED' ? (
                            <button
                              onClick={e => handleChangeStatus(item.id, 'ARCHIVED', e)}
                              className="w-full text-left px-3 py-1.5 hover:bg-white/10 text-zinc-400 flex items-center gap-2"
                            >
                              <Archive className="w-3.5 h-3.5" /> Archive
                            </button>
                          ) : (
                            <button
                              onClick={e => handleChangeStatus(item.id, 'INBOX', e)}
                              className="w-full text-left px-3 py-1.5 hover:bg-white/10 text-amber-300 flex items-center gap-2"
                            >
                              <ArrowRight className="w-3.5 h-3.5" /> Move to Inbox
                            </button>
                          )}
                          <div className="h-px bg-white/10 my-1" />
                          <button
                            onClick={e => handleDelete(item.id, e)}
                            className="w-full text-left px-3 py-1.5 hover:bg-rose-500/20 text-rose-300 flex items-center gap-2"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      </div>

      {/* Idea Detail / Edit Modal */}
      <GlassModal
        isOpen={!!editingIdea}
        onClose={() => setEditingIdea(null)}
        title={
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-400" />
            <span>Idea Details</span>
          </div>
        }
        maxWidth="max-w-2xl"
      >
        {editingIdea && (
          <div className="space-y-4 text-sm">
            {/* Title */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Idea Title *
              </label>
              <input
                type="text"
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/15 text-white font-medium text-base focus:outline-none focus:border-amber-400/50"
                placeholder="Idea title..."
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Full Description & Notes
              </label>
              <textarea
                rows={4}
                value={editDesc}
                onChange={e => setEditDesc(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/15 text-white text-sm focus:outline-none focus:border-amber-400/50 resize-y leading-relaxed"
                placeholder="Elaborate on the idea, key requirements, potential impact..."
              />
            </div>

            {/* Category & Status Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Category
                </label>
                <select
                  value={editCategory}
                  onChange={e => setEditCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.06] border border-white/15 text-white text-xs focus:outline-none"
                >
                  {categories.map(c => (
                    <option key={c} value={c} className="bg-slate-900 text-white">{c}</option>
                  ))}
                  <option value="CUSTOM" className="bg-slate-900 text-amber-300">+ Custom Category...</option>
                </select>
                {editCategory === 'CUSTOM' && (
                  <input
                    type="text"
                    value={editCustomCategory}
                    onChange={e => setEditCustomCategory(e.target.value)}
                    placeholder="Enter category name..."
                    className="w-full mt-2 px-3 py-1.5 rounded-xl bg-white/[0.05] border border-amber-400/30 text-white text-xs focus:outline-none"
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Lifecycle Status
                </label>
                <select
                  value={editStatus}
                  onChange={e => setEditStatus(e.target.value as IdeaStatus)}
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.06] border border-white/15 text-white text-xs focus:outline-none"
                >
                  <option value="INBOX" className="bg-slate-900 text-amber-300">INBOX (New capture)</option>
                  <option value="EXPLORING" className="bg-slate-900 text-sky-300">EXPLORING (Researching)</option>
                  <option value="PLANNED" className="bg-slate-900 text-purple-300">PLANNED (Scheduled)</option>
                  <option value="IN PROGRESS" className="bg-slate-900 text-indigo-300">IN PROGRESS (Executing)</option>
                  <option value="DONE" className="bg-slate-900 text-emerald-300">DONE (Completed)</option>
                  <option value="ARCHIVED" className="bg-slate-900 text-zinc-400">ARCHIVED (Shelved)</option>
                </select>
              </div>
            </div>

            {/* Priority & Tags */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Priority
                </label>
                <div className="flex gap-2">
                  {(['low', 'medium', 'high'] as const).map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setEditPriority(p)}
                      className={`flex-1 py-1.5 rounded-xl text-xs font-medium uppercase transition ${
                        editPriority === p
                          ? p === 'high'
                            ? 'bg-rose-500/25 border-rose-500/40 text-rose-300 border'
                            : p === 'medium'
                            ? 'bg-amber-500/25 border-amber-500/40 text-amber-300 border'
                            : 'bg-emerald-500/25 border-emerald-500/40 text-emerald-300 border'
                          : 'bg-white/[0.05] border border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Tags
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={newTagInput}
                    onChange={e => setNewTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                    placeholder="Add tag and press Enter..."
                    className="flex-1 px-3 py-1.5 rounded-xl bg-white/[0.05] border border-white/15 text-white text-xs focus:outline-none"
                  />
                  <GlassButton type="button" size="sm" onClick={handleAddTag}>
                    <Plus className="w-3.5 h-3.5" />
                  </GlassButton>
                </div>
                {editTags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {editTags.map(tag => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white/10 text-slate-300 text-xs"
                      >
                        #{tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-rose-400"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <GlassButton
                variant="danger"
                size="sm"
                onClick={e => handleDelete(editingIdea.id, e)}
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
              </GlassButton>

              <div className="flex items-center gap-2">
                <GlassButton variant="ghost" size="sm" onClick={() => setEditingIdea(null)}>
                  Cancel
                </GlassButton>
                <GlassButton variant="primary" size="sm" onClick={handleSaveEdit}>
                  Save Changes
                </GlassButton>
              </div>
            </div>
          </div>
        )}
      </GlassModal>

      {/* Surprise Me Highlight Modal */}
      <GlassModal
        isOpen={!!surpriseIdea}
        onClose={() => setSurpriseIdea(null)}
        title={
          <div className="flex items-center gap-2 text-amber-400">
            <Sparkles className="w-4 h-4" />
            <span>Rediscover an Idea</span>
          </div>
        }
        maxWidth="max-w-md"
      >
        {surpriseIdea && (
          <div className="text-center py-2 space-y-4">
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 inline-block">
              <Lightbulb className="w-8 h-8 text-amber-400" />
            </div>

            <div>
              <h2 className="text-lg font-bold text-white mb-2">{surpriseIdea.title}</h2>
              {surpriseIdea.description ? (
                <p className="text-xs text-slate-300 leading-relaxed px-4">
                  {surpriseIdea.description}
                </p>
              ) : (
                <p className="text-xs text-slate-500 italic">No description written yet.</p>
              )}
            </div>

            <div className="flex items-center justify-center gap-2 text-xs">
              {getStatusBadge(surpriseIdea.status)}
              {surpriseIdea.category && (
                <span className="px-2 py-0.5 rounded-full bg-white/10 text-slate-300">
                  {surpriseIdea.category}
                </span>
              )}
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-center gap-2">
              <GlassButton
                size="sm"
                variant="default"
                onClick={handleSurpriseMe}
                className="text-amber-300"
              >
                <Shuffle className="w-3.5 h-3.5 mr-1" /> Shuffle Another
              </GlassButton>
              <GlassButton
                size="sm"
                variant="primary"
                onClick={() => {
                  const item = surpriseIdea
                  setSurpriseIdea(null)
                  openDetailModal(item)
                }}
              >
                Open Details <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </GlassButton>
            </div>
          </div>
        )}
      </GlassModal>

      {/* Collection Picker Modal */}
      <CollectionPickerModal
        isOpen={!!collectionPickerPayload}
        payload={collectionPickerPayload}
        onClose={() => setCollectionPickerPayload(null)}
      />
    </div>
  )
}
