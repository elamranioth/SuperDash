import { useState, useMemo } from 'react'
import {
  Link as LinkIcon,
  Search,
  BookOpen,
  Clock,
  Star,
  CheckCircle,
  Archive,
  Trash2,
  ExternalLink,
  Highlighter,
  Quote as QuoteIcon,
  Plus,
  Clipboard,
  Loader2,
  Sparkles,
  ArrowUpDown
} from 'lucide-react'
import { Article, ReadingStatus } from '@/types'
import { articleImportService, ManualImportPayload, ArticleImportError } from '@/services/reader'
import { sounds } from '@/utils/sound'
import GlassPanel from '@/components/LiquidGlass/GlassPanel'
import ManualImportModal from './ManualImportModal'

interface ReaderHomeProps {
  articles: Article[]
  onOpenArticle: (article: Article) => void
  onSaveNewArticle: (article: Article) => void
  onToggleFavorite: (articleId: string) => void
  onUpdateStatus: (articleId: string, status: ReadingStatus) => void
  onDeleteArticle: (articleId: string) => void
}

type TabFilter = 'all' | 'READING' | 'UNREAD' | 'FINISHED' | 'favorites' | 'ARCHIVED'
type SortOption = 'lastRead' | 'newest' | 'readingTime' | 'title'

export default function ReaderHome({
  articles,
  onOpenArticle,
  onSaveNewArticle,
  onToggleFavorite,
  onUpdateStatus,
  onDeleteArticle
}: ReaderHomeProps) {
  const [urlInput, setUrlInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)
  const [manualModalOpen, setManualModalOpen] = useState(false)
  const [manualInitialUrl, setManualInitialUrl] = useState('')

  // Filter & Search state
  const [activeTab, setActiveTab] = useState<TabFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('lastRead')

  // Paste from clipboard helper
  const handlePasteClipboard = async () => {
    sounds.playClick()
    try {
      const text = await navigator.clipboard.readText()
      if (text) {
        setUrlInput(text.trim())
      }
    } catch {
      // Clipboard permission denied or unavailable
    }
  }

  // Handle URL import
  const handleImportUrl = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!urlInput.trim()) return

    setLoading(true)
    setImportError(null)

    try {
      const imported = await articleImportService.importFromUrl(urlInput.trim())
      sounds.playSuccess()
      onSaveNewArticle(imported)
      setUrlInput('')
      onOpenArticle(imported)
    } catch (err: any) {
      sounds.playError()
      const msg = err.message || 'Unable to import article from URL.'
      setImportError(msg)
      if (err instanceof ArticleImportError && err.code === 'CORS_OR_BLOCKED') {
        setManualInitialUrl(urlInput.trim())
      }
    } finally {
      setLoading(false)
    }
  }

  // Handle manual paste import
  const handleManualImport = (payload: ManualImportPayload) => {
    try {
      const article = articleImportService.importFromManualText(payload)
      onSaveNewArticle(article)
      onOpenArticle(article)
    } catch (err: any) {
      alert(err.message || 'Failed to parse manual article.')
    }
  }

  // Filtered & Sorted Articles
  const filteredArticles = useMemo(() => {
    return articles
      .filter(art => {
        // Tab filter
        if (activeTab === 'favorites') {
          if (!art.favorite) return false
        } else if (activeTab !== 'all') {
          if (art.status !== activeTab) return false
        } else if (art.status === 'ARCHIVED' && activeTab === 'all') {
          // Hide archived from 'All' unless explicitly viewing Archived tab
          return false
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase()
          const matchTitle = art.title.toLowerCase().includes(q)
          const matchAuthor = art.author?.toLowerCase().includes(q) || false
          const matchPub = art.publication?.toLowerCase().includes(q) || false
          if (!matchTitle && !matchAuthor && !matchPub) return false
        }

        return true
      })
      .sort((a, b) => {
        if (sortBy === 'lastRead') {
          return (b.lastReadAt || b.createdAt) - (a.lastReadAt || a.createdAt)
        }
        if (sortBy === 'newest') {
          return b.createdAt - a.createdAt
        }
        if (sortBy === 'readingTime') {
          return a.readingTimeMinutes - b.readingTimeMinutes
        }
        if (sortBy === 'title') {
          return a.title.localeCompare(b.title)
        }
        return 0
      })
  }, [articles, activeTab, searchQuery, sortBy])

  // Counts for tabs
  const counts = useMemo(() => {
    return {
      all: articles.filter(a => a.status !== 'ARCHIVED').length,
      reading: articles.filter(a => a.status === 'READING').length,
      unread: articles.filter(a => a.status === 'UNREAD').length,
      finished: articles.filter(a => a.status === 'FINISHED').length,
      favorites: articles.filter(a => a.favorite).length,
      archived: articles.filter(a => a.status === 'ARCHIVED').length
    }
  }, [articles])

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-4 md:p-6 select-text">
      {/* Hero / Import Bar */}
      <div className="mb-6">
        <GlassPanel intensity="subtle" className="p-5 md:p-6 rounded-2xl border border-white/10 shadow-xl">
          <div className="max-w-2xl mx-auto text-center mb-4">
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center justify-center gap-2">
              <BookOpen className="w-6 h-6 text-amber-400" />
              <span>Distraction-Free Reader</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Read any online article cleanly without ads, popups, or layout distractions.
            </p>
          </div>

          <form onSubmit={handleImportUrl} className="max-w-2xl mx-auto flex items-center gap-2">
            <div className="relative flex-1">
              <LinkIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={urlInput}
                onChange={e => setUrlInput(e.target.value)}
                placeholder="Paste article URL to read (e.g. https://...)"
                disabled={loading}
                className="w-full pl-10 pr-24 py-2.5 rounded-xl bg-slate-900/80 border border-white/15 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50 shadow-inner"
              />
              <button
                type="button"
                onClick={handlePasteClipboard}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 rounded-lg text-[11px] font-medium text-slate-300 hover:text-white bg-white/10 hover:bg-white/15 transition-all flex items-center gap-1"
                title="Paste from Clipboard"
              >
                <Clipboard className="w-3 h-3" />
                <span className="hidden sm:inline">Paste</span>
              </button>
            </div>

            <button
              type="submit"
              disabled={loading || !urlInput.trim()}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-semibold shadow-lg shadow-amber-500/20 disabled:opacity-40 transition-all active:scale-95 flex-shrink-0"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Extracting...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Read Now</span>
                </>
              )}
            </button>
          </form>

          {/* Import error message with manual paste button */}
          {importError && (
            <div className="max-w-2xl mx-auto mt-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between text-xs text-rose-300">
              <span className="truncate mr-2">{importError}</span>
              <button
                type="button"
                onClick={() => {
                  setManualInitialUrl(urlInput.trim())
                  setManualModalOpen(true)
                }}
                className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 font-medium text-[11px] flex-shrink-0 transition-colors"
              >
                Paste Text Directly
              </button>
            </div>
          )}

          <div className="flex items-center justify-center gap-4 mt-3 text-[11px] text-slate-400">
            <span>Or</span>
            <button
              type="button"
              onClick={() => {
                setManualInitialUrl('')
                setManualModalOpen(true)
              }}
              className="hover:text-amber-400 text-slate-300 underline underline-offset-4 transition-colors"
            >
              Paste text or markdown manually
            </button>
          </div>
        </GlassPanel>
      </div>

      {/* Tabs & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-white/10">
        {/* Navigation Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none text-xs font-medium">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'all'
                ? 'bg-amber-500/20 border border-amber-500/30 text-amber-300 font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <span>All</span>
            <span className="text-[10px] px-1 rounded-full bg-white/10">{counts.all}</span>
          </button>

          <button
            onClick={() => setActiveTab('READING')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'READING'
                ? 'bg-amber-500/20 border border-amber-500/30 text-amber-300 font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <span>Reading</span>
            {counts.reading > 0 && (
              <span className="text-[10px] px-1 rounded-full bg-amber-400/20 text-amber-300 font-bold">
                {counts.reading}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('UNREAD')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'UNREAD'
                ? 'bg-amber-500/20 border border-amber-500/30 text-amber-300 font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <span>Unread</span>
            <span className="text-[10px] px-1 rounded-full bg-white/10">{counts.unread}</span>
          </button>

          <button
            onClick={() => setActiveTab('FINISHED')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'FINISHED'
                ? 'bg-amber-500/20 border border-amber-500/30 text-amber-300 font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <span>Finished</span>
            <span className="text-[10px] px-1 rounded-full bg-white/10">{counts.finished}</span>
          </button>

          <button
            onClick={() => setActiveTab('favorites')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'favorites'
                ? 'bg-amber-500/20 border border-amber-500/30 text-amber-300 font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Star className="w-3 h-3 text-amber-400 fill-amber-400/50" />
            <span>Favorites</span>
            <span className="text-[10px] px-1 rounded-full bg-white/10">{counts.favorites}</span>
          </button>

          <button
            onClick={() => setActiveTab('ARCHIVED')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'ARCHIVED'
                ? 'bg-amber-500/20 border border-amber-500/30 text-amber-300 font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <span>Archive</span>
            <span className="text-[10px] px-1 rounded-full bg-white/10">{counts.archived}</span>
          </button>
        </div>

        {/* Search & Sort */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 md:w-48">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search library..."
              className="w-full pl-8 pr-3 py-1 rounded-xl bg-slate-900/60 border border-white/10 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
            />
          </div>

          <div className="flex items-center gap-1 text-slate-400 text-xs flex-shrink-0">
            <ArrowUpDown className="w-3.5 h-3.5" />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as SortOption)}
              className="bg-slate-900/60 border border-white/10 rounded-xl px-2 py-1 text-xs text-slate-200 focus:outline-none"
            >
              <option value="lastRead">Recently Read</option>
              <option value="newest">Recently Added</option>
              <option value="readingTime">Reading Time</option>
              <option value="title">Title (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Articles Grid */}
      <div className="flex-1 overflow-y-auto pt-4 pr-1">
        {filteredArticles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center text-slate-400">
            <BookOpen className="w-12 h-12 opacity-20 text-amber-400 mb-3" />
            <p className="text-sm font-semibold text-slate-300">No Articles Found</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              {searchQuery
                ? 'No reading material matched your search query.'
                : 'Paste a link above or add a sample reading to begin.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-6">
            {filteredArticles.map(article => {
              const remainingMinutes = Math.max(
                1,
                Math.round(article.readingTimeMinutes * ((100 - article.scrollProgress) / 100))
              )

              return (
                <GlassPanel
                  key={article.id}
                  intensity="subtle"
                  className="p-5 rounded-2xl border border-white/10 hover:border-amber-400/40 transition-all flex flex-col justify-between group cursor-pointer"
                  onClick={() => {
                    sounds.playClick()
                    onOpenArticle(article)
                  }}
                >
                  <div>
                    {/* Header: Publication & Actions */}
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-amber-300 truncate max-w-[180px]">
                        {article.publication || 'Article'}
                      </span>

                      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => onToggleFavorite(article.id)}
                          className="p-1 rounded-lg text-slate-400 hover:text-amber-400 transition-colors"
                          title="Favorite"
                        >
                          <Star className={`w-3.5 h-3.5 ${article.favorite ? 'fill-amber-400 text-amber-400' : ''}`} />
                        </button>
                        <button
                          onClick={() => {
                            const next = article.status === 'FINISHED' ? 'UNREAD' : 'FINISHED'
                            onUpdateStatus(article.id, next)
                          }}
                          className={`p-1 rounded-lg transition-colors ${
                            article.status === 'FINISHED' ? 'text-emerald-400' : 'text-slate-400 hover:text-white'
                          }`}
                          title={article.status === 'FINISHED' ? 'Mark unread' : 'Mark finished'}
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteArticle(article.id)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-400 transition-colors"
                          title="Delete article"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-sm font-semibold text-white group-hover:text-amber-300 transition-colors line-clamp-2 leading-snug mb-2">
                      {article.title}
                    </h3>

                    {/* Excerpt */}
                    {article.excerpt && (
                      <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed mb-4">
                        {article.excerpt}
                      </p>
                    )}
                  </div>

                  {/* Footer Meta & Progress */}
                  <div className="pt-3 border-t border-white/10">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>{article.readingTimeMinutes} min read</span>
                      </div>
                      {article.scrollProgress > 0 && (
                        <span className="font-mono text-amber-300 font-medium">
                          {article.scrollProgress}% ({remainingMinutes}m left)
                        </span>
                      )}
                    </div>

                    {/* Progress line */}
                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          article.scrollProgress >= 95 ? 'bg-emerald-400' : 'bg-amber-400'
                        }`}
                        style={{ width: `${article.scrollProgress}%` }}
                      />
                    </div>
                  </div>
                </GlassPanel>
              )
            })}
          </div>
        )}
      </div>

      {/* Direct Manual Import Modal */}
      <ManualImportModal
        initialUrl={manualInitialUrl}
        isOpen={manualModalOpen}
        onClose={() => setManualModalOpen(false)}
        onImport={handleManualImport}
      />
    </div>
  )
}
