import { useState, useMemo } from 'react'
import {
  Quote as QuoteIcon,
  Search,
  Star,
  Copy,
  Check,
  Trash2,
  ExternalLink,
  Download,
  Filter,
  BookOpen
} from 'lucide-react'
import { Quote } from '@/types'
import { sounds } from '@/utils/sound'
import { toLocalYYYYMMDD } from '@/utils/date'
import GlassPanel from '@/components/LiquidGlass/GlassPanel'

interface QuotesLibraryViewProps {
  quotes: Quote[]
  onOpenArticle: (articleId: string) => void
  onToggleFavorite: (quoteId: string) => void
  onDeleteQuote: (quoteId: string) => void
}

export default function QuotesLibraryView({
  quotes,
  onOpenArticle,
  onToggleFavorite,
  onDeleteQuote
}: QuotesLibraryViewProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterFavOnly, setFilterFavOnly] = useState(false)
  const [selectedArticleFilter, setSelectedArticleFilter] = useState<string>('all')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Extract unique articles
  const uniqueArticles = useMemo(() => {
    const map = new Map<string, string>()
    quotes.forEach(q => {
      map.set(q.articleId, q.articleTitle)
    })
    return Array.from(map.entries()).map(([id, title]) => ({ id, title }))
  }, [quotes])

  const filteredQuotes = useMemo(() => {
    return quotes.filter(q => {
      if (filterFavOnly && !q.favorite) return false
      if (selectedArticleFilter !== 'all' && q.articleId !== selectedArticleFilter) return false
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        const matchText = q.text.toLowerCase().includes(query)
        const matchTitle = q.articleTitle.toLowerCase().includes(query)
        const matchAuthor = q.articleAuthor?.toLowerCase().includes(query) || false
        const matchTags = q.tags?.some(t => t.toLowerCase().includes(query)) || false
        if (!matchText && !matchTitle && !matchAuthor && !matchTags) return false
      }
      return true
    })
  }, [quotes, searchQuery, filterFavOnly, selectedArticleFilter])

  const handleCopyCitation = async (quote: Quote) => {
    sounds.playClick()
    const citation = `"${quote.text}"\n— ${quote.articleAuthor || 'Author'}, ${quote.articleTitle}`
    try {
      await navigator.clipboard.writeText(citation)
    } catch {}
    setCopiedId(quote.id)
    setTimeout(() => setCopiedId(null), 1500)
  }

  const handleExportQuotes = () => {
    sounds.playClick()
    let content = `# SuperDash Quotes Collection\nExported: ${new Date().toLocaleString()}\n\n`
    filteredQuotes.forEach(q => {
      content += `> "${q.text}"\n\n`
      content += `— **${q.articleAuthor || 'Author'}**, *${q.articleTitle}*\n`
      if (q.articleUrl) content += `Source: ${q.articleUrl}\n`
      content += `\n---\n\n`
    })

    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `superdash_saved_quotes_${toLocalYYYYMMDD()}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-4 md:p-6 select-text">
      {/* Search & Filter Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-white/10">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <QuoteIcon className="w-5 h-5 text-emerald-400" />
            <span>Quotes Collection</span>
            <span className="text-xs font-normal text-slate-400 ml-1">
              ({filteredQuotes.length} {filteredQuotes.length === 1 ? 'quote' : 'quotes'})
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Highlighted wisdom, striking arguments, and memorable passages from your readings.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 md:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search quotes..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-900/60 border border-white/10 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
            />
          </div>

          {uniqueArticles.length > 1 && (
            <select
              value={selectedArticleFilter}
              onChange={e => setSelectedArticleFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-900/60 border border-white/10 text-xs text-slate-200 focus:outline-none"
            >
              <option value="all">All Articles</option>
              {uniqueArticles.map(a => (
                <option key={a.id} value={a.id}>
                  {a.title.slice(0, 30)}...
                </option>
              ))}
            </select>
          )}

          <button
            onClick={() => setFilterFavOnly(!filterFavOnly)}
            className={`p-2 rounded-xl border transition-all ${
              filterFavOnly
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
            }`}
            title="Filter Favorites"
          >
            <Star className={`w-3.5 h-3.5 ${filterFavOnly ? 'fill-amber-400' : ''}`} />
          </button>

          <button
            onClick={handleExportQuotes}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-slate-200 border border-white/10 transition-colors"
            title="Export Quotes as Markdown"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* Quotes Cards Grid */}
      <div className="flex-1 overflow-y-auto pt-4 space-y-4 pr-1">
        {filteredQuotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center text-slate-400">
            <QuoteIcon className="w-12 h-12 opacity-20 text-emerald-400 mb-3" />
            <p className="text-sm font-semibold text-slate-300">No Quotes Found</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              {searchQuery || filterFavOnly
                ? 'Try changing your search terms or filters.'
                : 'Highlight any text in an article and click "Quote" to collect it here.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredQuotes.map(q => (
              <GlassPanel
                key={q.id}
                intensity="subtle"
                className="p-5 rounded-2xl border border-white/10 hover:border-emerald-500/30 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <QuoteIcon className="w-6 h-6 text-emerald-400/50" />
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onToggleFavorite(q.id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-amber-400 transition-colors"
                      >
                        <Star className={`w-3.5 h-3.5 ${q.favorite ? 'fill-amber-400 text-amber-400' : ''}`} />
                      </button>
                      <button
                        onClick={() => handleCopyCitation(q)}
                        className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors"
                        title="Copy formatted citation"
                      >
                        {copiedId === q.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => onDeleteQuote(q.id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100"
                        title="Delete Quote"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <blockquote className="text-sm font-serif text-slate-100 italic leading-relaxed mb-4">
                    "{q.text}"
                  </blockquote>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-end justify-between gap-2">
                  <div className="overflow-hidden">
                    {q.articleAuthor && (
                      <p className="text-xs font-semibold text-emerald-300 truncate">
                        {q.articleAuthor}
                      </p>
                    )}
                    <button
                      onClick={() => onOpenArticle(q.articleId)}
                      className="text-[11px] text-slate-400 hover:text-white truncate block text-left transition-colors"
                    >
                      {q.articleTitle}
                    </button>
                  </div>

                  <button
                    onClick={() => onOpenArticle(q.articleId)}
                    className="flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-emerald-300 transition-colors flex-shrink-0"
                  >
                    <span>Read</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </GlassPanel>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
