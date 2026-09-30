import { useState, useEffect, useMemo } from 'react'
import {
  X,
  Search,
  Link as LinkIcon,
  FileText,
  BookOpen,
  Lightbulb,
  BookMarked,
  Scale,
  CheckSquare,
  Quote as QuoteIcon,
  Sparkles,
  Plus,
  Compass,
  Film,
  Book
} from 'lucide-react'
import {
  CollectionItem,
  CollectionItemType,
  CollectionSection,
  NoteItem,
  TaskItem,
  DocumentItem,
  Article,
  Quote,
  IdeaItem,
  DecisionItem,
  Hearing
} from '@/types'
import { storageService, INITIAL_NOTES, INITIAL_TASKS, INITIAL_DOCUMENTS } from '@/services/storage'
import { readerRepository, annotationService } from '@/services/reader'
import { ideasService } from '@/services/ideas'
import { decisionService } from '@/services/decisions'
import { hearingRepository } from '@/services/hearings'
import { sounds } from '@/utils/sound'

interface AddItemModalProps {
  isOpen: boolean
  collectionId: string
  sections?: CollectionSection[]
  currentSectionId?: string
  onClose: () => void
  onAdd: (item: Omit<CollectionItem, 'id' | 'addedAt'>) => Promise<void>
}

type TabType = 'existing' | 'link' | 'manual'

export default function AddItemModal({
  isOpen,
  collectionId,
  sections = [],
  currentSectionId,
  onClose,
  onAdd
}: AddItemModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('existing')
  const [selectedSectionId, setSelectedSectionId] = useState<string | undefined>(currentSectionId)
  const [note, setNote] = useState('')

  // Search existing SuperDash items state
  const [searchQuery, setSearchQuery] = useState('')
  const [articles, setArticles] = useState<Article[]>([])
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [notes, setNotes] = useState<NoteItem[]>([])
  const [ideas, setIdeas] = useState<IdeaItem[]>([])
  const [decisions, setDecisions] = useState<DecisionItem[]>([])
  const [hearings, setHearings] = useState<Hearing[]>([])
  const [tasks, setTasks] = useState<TaskItem[]>([])
  const [documents, setDocuments] = useState<DocumentItem[]>([])
  const [isLoadingSources, setIsLoadingSources] = useState(false)

  // Link state
  const [linkUrl, setLinkUrl] = useState('')
  const [linkTitle, setLinkTitle] = useState('')
  const [linkDescription, setLinkDescription] = useState('')

  // Manual item state
  const [manualTitle, setManualTitle] = useState('')
  const [manualContent, setManualContent] = useState('')
  const [manualType, setManualType] = useState<CollectionItemType>('manual')

  // Load existing SuperDash items when tab is 'existing'
  useEffect(() => {
    if (isOpen) {
      setSelectedSectionId(currentSectionId)
      setIsLoadingSources(true)
      Promise.all([
        readerRepository.getAllArticles(),
        annotationService.getQuotes(),
        storageService.get<NoteItem[]>('notes', INITIAL_NOTES),
        ideasService.getAll(),
        decisionService.getAll(),
        hearingRepository.getAll(),
        storageService.get<TaskItem[]>('tasks', INITIAL_TASKS),
        storageService.get<DocumentItem[]>('stored_documents', INITIAL_DOCUMENTS)
      ])
        .then(([arts, qts, nts, ids, decs, hrs, tsks, docs]) => {
          setArticles(arts)
          setQuotes(qts)
          setNotes(nts)
          setIdeas(ids)
          setDecisions(decs)
          setHearings(hrs)
          setTasks(tsks)
          setDocuments(docs)
        })
        .finally(() => setIsLoadingSources(false))
    }
  }, [isOpen, currentSectionId])

  // Filtered source items
  const sourceResults = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    const results: Array<{
      id: string
      type: CollectionItemType
      sourceType:
        | 'reader_article'
        | 'reader_quote'
        | 'note'
        | 'idea'
        | 'decision'
        | 'hearing'
        | 'task'
        | 'document'
      title: string
      subtitle: string
      icon: typeof Sparkles
      raw: unknown
    }> = []

    // 1. Reader Articles
    articles.forEach(a => {
      if (!q || a.title.toLowerCase().includes(q) || a.author?.toLowerCase().includes(q)) {
        results.push({
          id: a.id,
          type: 'article',
          sourceType: 'reader_article',
          title: a.title,
          subtitle: `${a.author || 'Author'} · Reader Article`,
          icon: BookOpen,
          raw: a
        })
      }
    })

    // 2. Reader Quotes
    quotes.forEach(qt => {
      if (!q || qt.text.toLowerCase().includes(q) || qt.articleTitle?.toLowerCase().includes(q)) {
        results.push({
          id: qt.id,
          type: 'quote',
          sourceType: 'reader_quote',
          title: `"${qt.text}"`,
          subtitle: `${qt.articleTitle || 'Article'} · Reader Quote`,
          icon: QuoteIcon,
          raw: qt
        })
      }
    })

    // 3. Ideas
    ideas.forEach(i => {
      if (!q || i.title.toLowerCase().includes(q) || (i.description && i.description.toLowerCase().includes(q))) {
        results.push({
          id: i.id,
          type: 'idea',
          sourceType: 'idea',
          title: i.title,
          subtitle: `${i.category} Idea (${i.status})`,
          icon: Lightbulb,
          raw: i
        })
      }
    })

    // 4. Notes
    notes.forEach(n => {
      if (!q || n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)) {
        results.push({
          id: n.id,
          type: 'note',
          sourceType: 'note',
          title: n.title,
          subtitle: n.content.slice(0, 60),
          icon: FileText,
          raw: n
        })
      }
    })

    // 5. Decisions
    decisions.forEach(d => {
      if (!q || d.title.toLowerCase().includes(q) || d.decision.toLowerCase().includes(q)) {
        results.push({
          id: d.id,
          type: 'decision',
          sourceType: 'decision',
          title: d.title,
          subtitle: `Decision (${d.status})`,
          icon: BookMarked,
          raw: d
        })
      }
    })

    // 6. Hearings
    hearings.forEach(h => {
      if (!q || h.clientName.toLowerCase().includes(q) || (h.caseType && h.caseType.toLowerCase().includes(q))) {
        results.push({
          id: h.id,
          type: 'hearing',
          sourceType: 'hearing',
          title: `${h.clientName} — ${h.court || 'Court'}`,
          subtitle: `Hearing · ${h.hearingDate} (${h.status})`,
          icon: Scale,
          raw: h
        })
      }
    })

    // 7. Tasks
    tasks.forEach(t => {
      if (!q || t.title.toLowerCase().includes(q)) {
        results.push({
          id: t.id,
          type: 'task',
          sourceType: 'task',
          title: t.title,
          subtitle: `Task (${t.priority} priority)`,
          icon: CheckSquare,
          raw: t
        })
      }
    })

    return results
  }, [searchQuery, articles, quotes, ideas, notes, decisions, hearings, tasks])

  if (!isOpen) return null

  // Handle adding reference
  const handleSelectReference = async (refItem: (typeof sourceResults)[0]) => {
    sounds.playSuccess()
    await onAdd({
      collectionId,
      sectionId: selectedSectionId,
      itemType: refItem.type,
      sourceType: refItem.sourceType,
      sourceId: refItem.id,
      title: refItem.title,
      description: refItem.subtitle,
      note: note.trim() || undefined,
      position: 0
    })
    onClose()
  }

  // Handle adding link
  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!linkUrl.trim()) return

    sounds.playSuccess()
    let displayTitle = linkTitle.trim()
    if (!displayTitle) {
      try {
        const parsed = new URL(linkUrl)
        displayTitle = parsed.hostname.replace('www.', '')
      } catch {
        displayTitle = linkUrl
      }
    }

    let faviconUrl: string | undefined
    try {
      const parsed = new URL(linkUrl)
      faviconUrl = `https://www.google.com/s2/favicons?domain=${parsed.hostname}&sz=32`
    } catch {
      faviconUrl = undefined
    }

    await onAdd({
      collectionId,
      sectionId: selectedSectionId,
      itemType: 'link',
      title: displayTitle,
      url: linkUrl.trim(),
      description: linkDescription.trim() || undefined,
      faviconUrl,
      note: note.trim() || undefined,
      position: 0
    })
    onClose()
  }

  // Handle adding manual entry
  const handleAddManual = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!manualTitle.trim()) return

    sounds.playSuccess()
    await onAdd({
      collectionId,
      sectionId: selectedSectionId,
      itemType: manualType,
      title: manualTitle.trim(),
      manualContent: manualContent.trim() || undefined,
      note: note.trim() || undefined,
      position: 0
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-md flex items-center justify-center p-4">
      <div className="liquid-glass-heavy border border-white/20 rounded-3xl p-6 w-full max-w-xl shadow-2xl animate-window-open flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center">
              <Plus className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Add to Collection</h2>
              <p className="text-[11px] text-slate-400">
                Reference an existing SuperDash item, add a link, or write a note
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section selection & optional personal note */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          {sections.length > 0 && (
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Target Section
              </label>
              <select
                value={selectedSectionId || ''}
                onChange={e => setSelectedSectionId(e.target.value || undefined)}
                className="w-full px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-400"
              >
                <option value="">General (No Section)</option>
                {sections.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className={sections.length > 0 ? '' : 'sm:col-span-2'}>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              Curator Note <span className="text-slate-500 font-normal">(Why does this matter?)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Essential reading on scaling limits..."
              value={note}
              onChange={e => setNote(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-400"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10 mb-4 gap-1">
          <button
            onClick={() => setActiveTab('existing')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-xl transition ${
              activeTab === 'existing'
                ? 'text-white border-b-2 border-indigo-400 bg-white/5'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Reference SuperDash</span>
          </button>
          <button
            onClick={() => setActiveTab('link')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-xl transition ${
              activeTab === 'link'
                ? 'text-white border-b-2 border-indigo-400 bg-white/5'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>Web Link</span>
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-xl transition ${
              activeTab === 'manual'
                ? 'text-white border-b-2 border-indigo-400 bg-white/5'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Manual / Note / Place</span>
          </button>
        </div>

        {/* Tab 1: Existing SuperDash Items */}
        {activeTab === 'existing' && (
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <div className="relative mb-3">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                autoFocus
                placeholder="Search Reader articles, quotes, ideas, notes, decisions, hearings..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-400 transition"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[220px]">
              {isLoadingSources ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  Loading SuperDash records...
                </div>
              ) : sourceResults.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  No matching SuperDash records found.
                </div>
              ) : (
                sourceResults.map(item => {
                  const Icon = item.icon
                  return (
                    <button
                      key={`${item.sourceType}-${item.id}`}
                      onClick={() => handleSelectReference(item)}
                      className="w-full p-2.5 rounded-xl liquid-glass text-left flex items-start gap-3 hover:border-indigo-400/50 hover:bg-white/10 transition group"
                    >
                      <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-400/20 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                        <Icon className="w-3.5 h-3.5 text-indigo-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-white truncate">
                          {item.title}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate mt-0.5">
                          {item.subtitle}
                        </div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300 capitalize shrink-0 self-center">
                        {item.type}
                      </span>
                    </button>
                  )
                })
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Link */}
        {activeTab === 'link' && (
          <form onSubmit={handleAddLink} className="space-y-3 flex-1 overflow-y-auto">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                URL / Web Address <span className="text-rose-400">*</span>
              </label>
              <input
                type="url"
                required
                autoFocus
                placeholder="https://..."
                value={linkUrl}
                onChange={e => setLinkUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Title <span className="text-slate-500 font-normal">(optional — defaults to domain)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Stanford AI Index 2026"
                value={linkTitle}
                onChange={e => setLinkTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Summary / Description
              </label>
              <textarea
                rows={2}
                placeholder="Brief excerpt or what this page is about..."
                value={linkDescription}
                onChange={e => setLinkDescription(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-400 resize-none"
              />
            </div>
            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={!linkUrl.trim()}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition disabled:opacity-50"
              >
                Add Link
              </button>
            </div>
          </form>
        )}

        {/* Tab 3: Manual / Note */}
        {activeTab === 'manual' && (
          <form onSubmit={handleAddManual} className="space-y-3 flex-1 overflow-y-auto">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Item Classification
              </label>
              <div className="flex gap-2 flex-wrap">
                {[
                  { id: 'manual', label: 'Manual Thought', icon: Sparkles },
                  { id: 'place', label: 'Place', icon: Compass },
                  { id: 'movie', label: 'Movie', icon: Film },
                  { id: 'book', label: 'Book', icon: Book },
                  { id: 'quote', label: 'Quote', icon: QuoteIcon }
                ].map(cat => {
                  const Icon = cat.icon
                  const isSel = manualType === cat.id
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setManualType(cat.id as CollectionItemType)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs border transition ${
                        isSel
                          ? 'bg-white/20 border-white text-white'
                          : 'bg-black/20 border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Icon className="w-3 h-3" />
                      <span>{cat.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Title / Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                autoFocus
                placeholder="e.g. Man's Search for Meaning, Philosopher's Walk"
                value={manualTitle}
                onChange={e => setManualTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Content / Details
              </label>
              <textarea
                rows={3}
                placeholder="Notes, observations, takeaways..."
                value={manualContent}
                onChange={e => setManualContent(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-400 resize-none"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={!manualTitle.trim()}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition disabled:opacity-50"
              >
                Add Item
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
