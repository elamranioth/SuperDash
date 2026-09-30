import { useState, useEffect } from 'react'
import { BookOpen, Quote as QuoteIcon, Sparkles } from 'lucide-react'
import { Article, Quote, ReadingStatus } from '@/types'
import { readerRepository, annotationService } from '@/services/reader'
import { sounds } from '@/utils/sound'
import AppHeader from '@/components/AppWindow/AppHeader'
import ReaderHome from './ReaderHome'
import ReadingView from './ReadingView'
import QuotesLibraryView from './QuotesLibraryView'

interface ReaderAppProps {
  initialArticleId?: string
  initialQuoteId?: string
}

export default function ReaderApp({ initialArticleId, initialQuoteId }: ReaderAppProps) {
  const [articles, setArticles] = useState<Article[]>([])
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [activeArticle, setActiveArticle] = useState<Article | null>(null)
  const [activeTab, setActiveTab] = useState<'library' | 'quotes'>('library')
  const [loading, setLoading] = useState(true)

  // Load initial data
  useEffect(() => {
    Promise.all([
      readerRepository.getAllArticles(),
      annotationService.getQuotes()
    ]).then(([loadedArticles, loadedQuotes]) => {
      setArticles(loadedArticles)
      setQuotes(loadedQuotes)
      setLoading(false)

      if (initialArticleId) {
        const found = loadedArticles.find(a => a.id === initialArticleId)
        if (found) {
          setActiveArticle(found)
        }
      } else if (initialQuoteId) {
        setActiveTab('quotes')
      }
    })
  }, [initialArticleId, initialQuoteId])

  // Save new article
  const handleSaveNewArticle = async (article: Article) => {
    const saved = await readerRepository.saveArticle(article)
    setArticles(prev => [saved, ...prev.filter(a => a.id !== saved.id)])
  }

  // Update existing article
  const handleUpdateArticle = (updated: Article) => {
    setActiveArticle(updated)
    setArticles(prev => prev.map(a => (a.id === updated.id ? updated : a)))
  }

  // Toggle favorite
  const handleToggleFavorite = async (articleId: string) => {
    sounds.playClick()
    const isFav = await readerRepository.toggleFavorite(articleId)
    setArticles(prev =>
      prev.map(a => (a.id === articleId ? { ...a, favorite: isFav } : a))
    )
    if (activeArticle && activeArticle.id === articleId) {
      setActiveArticle({ ...activeArticle, favorite: isFav })
    }
  }

  // Update status
  const handleUpdateStatus = async (articleId: string, status: ReadingStatus) => {
    sounds.playClick()
    await readerRepository.updateArticleStatus(articleId, status)
    setArticles(prev =>
      prev.map(a => (a.id === articleId ? { ...a, status } : a))
    )
    if (activeArticle && activeArticle.id === articleId) {
      setActiveArticle({ ...activeArticle, status })
    }
  }

  // Delete article
  const handleDeleteArticle = async (articleId: string) => {
    sounds.playClick()
    if (confirm('Delete this article from your library?')) {
      await readerRepository.deleteArticle(articleId)
      setArticles(prev => prev.filter(a => a.id !== articleId))
      if (activeArticle && activeArticle.id === articleId) {
        setActiveArticle(null)
      }
    }
  }

  // Toggle quote favorite
  const handleToggleQuoteFavorite = async (quoteId: string) => {
    sounds.playClick()
    const nextFav = await annotationService.toggleQuoteFavorite(quoteId)
    setQuotes(prev =>
      prev.map(q => (q.id === quoteId ? { ...q, favorite: nextFav } : q))
    )
  }

  // Delete quote
  const handleDeleteQuote = async (quoteId: string) => {
    sounds.playClick()
    await annotationService.deleteQuote(quoteId)
    setQuotes(prev => prev.filter(q => q.id !== quoteId))
  }

  // Open article directly from quotes view
  const handleOpenArticleById = (articleId: string) => {
    const found = articles.find(a => a.id === articleId)
    if (found) {
      setActiveArticle(found)
      setActiveTab('library')
    }
  }

  return (
    <div className="flex flex-col h-full w-full bg-slate-950 text-slate-100 overflow-hidden select-none">
      {/* App Header (shown when not reading an article or in library) */}
      {!activeArticle && (
        <AppHeader
          title="Reader"
          subtitle="Distraction-free reading, English-to-Arabic translation, highlights & quotes"
          icon={BookOpen}
        >
          {/* Header Navigation Tabs */}
          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10 text-xs">
            <button
              onClick={() => {
                sounds.playClick()
                setActiveTab('library')
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'library'
                  ? 'bg-amber-500/20 text-amber-300 shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Library</span>
            </button>

            <button
              onClick={() => {
                sounds.playClick()
                setActiveTab('quotes')
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'quotes'
                  ? 'bg-emerald-500/20 text-emerald-300 shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <QuoteIcon className="w-3.5 h-3.5" />
              <span>Quotes</span>
              {quotes.length > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/10 font-mono">
                  {quotes.length}
                </span>
              )}
            </button>
          </div>
        </AppHeader>
      )}

      {/* Main View Area */}
      <div className="flex-1 overflow-hidden relative">
        {activeArticle ? (
          <ReadingView
            article={activeArticle}
            onBack={() => {
              sounds.playClick()
              setActiveArticle(null)
            }}
            onUpdateArticle={handleUpdateArticle}
          />
        ) : activeTab === 'library' ? (
          <ReaderHome
            articles={articles}
            onOpenArticle={art => setActiveArticle(art)}
            onSaveNewArticle={handleSaveNewArticle}
            onToggleFavorite={handleToggleFavorite}
            onUpdateStatus={handleUpdateStatus}
            onDeleteArticle={handleDeleteArticle}
          />
        ) : (
          <QuotesLibraryView
            quotes={quotes}
            onOpenArticle={handleOpenArticleById}
            onToggleFavorite={handleToggleQuoteFavorite}
            onDeleteQuote={handleDeleteQuote}
          />
        )}
      </div>
    </div>
  )
}
