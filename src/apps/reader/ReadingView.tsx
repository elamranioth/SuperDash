import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import {
  ArrowLeft,
  Settings2,
  Maximize2,
  Minimize2,
  Search,
  BookOpen,
  Layers,
  Star,
  ExternalLink,
  ChevronUp,
  ChevronDown,
  X,
  Type,
  AlignLeft,
  Check,
  Palette,
  FolderPlus
} from 'lucide-react'
import CollectionPickerModal, { CollectionPickerPayload } from '@/apps/collections/CollectionPickerModal'
import {
  Article,
  ArticleBlock,
  Highlight,
  Quote,
  ReaderNote,
  ReaderSettings,
  HighlightColor,
  ReadingStatus
} from '@/types'
import { readerRepository, annotationService } from '@/services/reader'
import { sounds } from '@/utils/sound'
import TextSelectionToolbar from './TextSelectionToolbar'
import TranslationModal from './TranslationModal'
import AnnotationsSidebar from './AnnotationsSidebar'

interface ReadingViewProps {
  article: Article
  onBack: () => void
  onUpdateArticle: (updated: Article) => void
}

const THEME_STYLES: Record<string, { bg: string; text: string; headerBg: string; border: string; highlightHover: string }> = {
  light: {
    bg: 'bg-[#faf9f5]',
    text: 'text-[#1a1a1a]',
    headerBg: 'bg-[#faf9f5]/90',
    border: 'border-[#e5e3dc]',
    highlightHover: 'hover:bg-amber-100'
  },
  sepia: {
    bg: 'bg-[#f4ecd8]',
    text: 'text-[#3d3226]',
    headerBg: 'bg-[#f4ecd8]/90',
    border: 'border-[#e2d6bc]',
    highlightHover: 'hover:bg-[#ebdfc4]'
  },
  dark: {
    bg: 'bg-slate-950',
    text: 'text-slate-100',
    headerBg: 'bg-slate-900/90',
    border: 'border-white/10',
    highlightHover: 'hover:bg-white/5'
  },
  black: {
    bg: 'bg-black',
    text: 'text-neutral-200',
    headerBg: 'bg-black/90',
    border: 'border-neutral-800',
    highlightHover: 'hover:bg-neutral-900'
  }
}

const HIGHLIGHT_COLOR_CLASSES: Record<HighlightColor, string> = {
  yellow: 'bg-amber-400/35 text-amber-950 dark:text-amber-100 border-b-2 border-amber-400/80 rounded-xs px-0.5',
  green: 'bg-emerald-400/35 text-emerald-950 dark:text-emerald-100 border-b-2 border-emerald-400/80 rounded-xs px-0.5',
  blue: 'bg-sky-400/35 text-sky-950 dark:text-sky-100 border-b-2 border-sky-400/80 rounded-xs px-0.5',
  rose: 'bg-rose-400/35 text-rose-950 dark:text-rose-100 border-b-2 border-rose-400/80 rounded-xs px-0.5',
  purple: 'bg-purple-400/35 text-purple-950 dark:text-purple-100 border-b-2 border-purple-400/80 rounded-xs px-0.5'
}

export default function ReadingView({ article, onBack, onUpdateArticle }: ReadingViewProps) {
  const [settings, setSettings] = useState<ReaderSettings>({
    fontFamily: 'serif',
    fontSize: 18,
    lineHeight: 1.75,
    columnWidth: 'comfortable',
    theme: 'dark',
    bionicReading: false,
    autoBookmark: true
  })

  // Annotations
  const [highlights, setHighlights] = useState<Highlight[]>([])
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [notes, setNotes] = useState<ReaderNote[]>([])

  // UI state
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [distractionFree, setDistractionFree] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(article.scrollProgress || 0)

  // In-article search
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchIndex, setSearchIndex] = useState(0)
  const searchMatches = useRef<HTMLElement[]>([])

  // Selection & Toolbar state
  const [selectionToolbarPos, setSelectionToolbarPos] = useState<{ x: number; y: number } | null>(null)
  const [selectedText, setSelectedText] = useState('')
  const [selectedBlockId, setSelectedBlockId] = useState<string>('')

  // Translation Modal
  const [translationOpen, setTranslationOpen] = useState(false)
  const [translationSourceText, setTranslationSourceText] = useState('')

  // Collection Picker Modal
  const [collectionPickerPayload, setCollectionPickerPayload] = useState<CollectionPickerPayload | null>(null)

  // Active Highlight Bubble (when clicking existing highlight)
  const [activeHighlightId, setActiveHighlightId] = useState<string | null>(null)

  const contentContainerRef = useRef<HTMLDivElement>(null)
  const scrollDebounceRef = useRef<NodeJS.Timeout | null>(null)

  // Load settings and annotations
  useEffect(() => {
    readerRepository.getSettings().then(setSettings)
    annotationService.getHighlights(article.id).then(setHighlights)
    annotationService.getQuotes(article.id).then(setQuotes)
    annotationService.getNotes(article.id).then(setNotes)
  }, [article.id])

  // Restore scroll position
  useEffect(() => {
    if (article.scrollPosition && contentContainerRef.current) {
      setTimeout(() => {
        if (contentContainerRef.current) {
          contentContainerRef.current.scrollTop = article.scrollPosition || 0
        }
      }, 80)
    }
  }, [article.id, article.scrollPosition])

  // Handle scroll tracking
  const handleScroll = useCallback(() => {
    const el = contentContainerRef.current
    if (!el) return

    const { scrollTop, scrollHeight, clientHeight } = el
    const totalScrollable = scrollHeight - clientHeight
    const currentProgress = totalScrollable > 0 ? Math.round((scrollTop / totalScrollable) * 100) : 0
    setScrollProgress(currentProgress)

    // Debounced persist
    if (scrollDebounceRef.current) clearTimeout(scrollDebounceRef.current)
    scrollDebounceRef.current = setTimeout(() => {
      readerRepository.updateScrollProgress(article.id, currentProgress, scrollTop)
    }, 400)
  }, [article.id])

  // Keyboard shortcut listener for Ctrl+F
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault()
        setSearchOpen(true)
      } else if (e.key === 'Escape') {
        setSearchOpen(false)
        setSelectionToolbarPos(null)
        setActiveHighlightId(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Handle text selection
  const handleMouseUp = useCallback(() => {
    const selection = window.getSelection()
    if (!selection || selection.isCollapsed) {
      setSelectionToolbarPos(null)
      return
    }

    const text = selection.toString().trim()
    if (text.length < 2) {
      setSelectionToolbarPos(null)
      return
    }

    // Identify which block contains the selection
    let node: Node | null = selection.anchorNode
    let blockId = ''
    while (node && node !== contentContainerRef.current) {
      if (node instanceof HTMLElement && node.dataset.blockId) {
        blockId = node.dataset.blockId
        break
      }
      node = node.parentNode
    }

    const range = selection.getRangeAt(0)
    const rect = range.getBoundingClientRect()

    setSelectedText(text)
    setSelectedBlockId(blockId || article.blocks[0]?.id || 'blk-1')
    setSelectionToolbarPos({
      x: rect.left + rect.width / 2,
      y: Math.max(10, rect.top - 46)
    })
  }, [article.blocks])

  // Actions from selection toolbar
  const handleHighlight = async (color: HighlightColor) => {
    if (!selectedText) return
    const newHighlight: Highlight = {
      id: `hl-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      articleId: article.id,
      blockId: selectedBlockId,
      text: selectedText,
      color,
      createdAt: Date.now()
    }

    const saved = await annotationService.saveHighlight(newHighlight)
    setHighlights(prev => [...prev, saved])
    setSelectionToolbarPos(null)
    window.getSelection()?.removeAllRanges()
  }

  const handleTranslateSelection = () => {
    if (!selectedText) return
    setTranslationSourceText(selectedText)
    setTranslationOpen(true)
    setSelectionToolbarPos(null)
  }

  const handleSaveQuoteFromSelection = async (customText?: string) => {
    const textToSave = customText || selectedText
    if (!textToSave) return

    const newQuote: Quote = {
      id: `qt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      articleId: article.id,
      articleTitle: article.title,
      articleAuthor: article.author,
      articleUrl: article.url,
      text: textToSave,
      createdAt: Date.now()
    }

    const saved = await annotationService.saveQuote(newQuote)
    setQuotes(prev => [saved, ...prev])
    setSelectionToolbarPos(null)
    window.getSelection()?.removeAllRanges()
  }

  const handleAddNoteFromSelection = async () => {
    if (!selectedText) return
    const noteText = prompt('Add a note to this passage:', '')
    if (!noteText || !noteText.trim()) return

    const newNote: ReaderNote = {
      id: `nt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      articleId: article.id,
      blockId: selectedBlockId,
      text: noteText.trim(),
      selectedText,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }

    const saved = await annotationService.saveNote(newNote)
    setNotes(prev => [saved, ...prev])
    setSelectionToolbarPos(null)
    window.getSelection()?.removeAllRanges()
  }

  const handleSaveGeneralNote = async (text: string) => {
    const newNote: ReaderNote = {
      id: `nt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      articleId: article.id,
      text,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
    const saved = await annotationService.saveNote(newNote)
    setNotes(prev => [saved, ...prev])
  }

  const handleDeleteHighlight = async (id: string) => {
    await annotationService.deleteHighlight(id)
    setHighlights(prev => prev.filter(h => h.id !== id))
    setActiveHighlightId(null)
  }

  const handleDeleteQuote = async (id: string) => {
    await annotationService.deleteQuote(id)
    setQuotes(prev => prev.filter(q => q.id !== id))
  }

  const handleDeleteNote = async (id: string) => {
    await annotationService.deleteNote(id)
    setNotes(prev => prev.filter(n => n.id !== id))
  }

  // Smooth scroll to target block
  const handleScrollToBlock = (blockId?: string) => {
    if (!blockId || !contentContainerRef.current) return
    const targetEl = contentContainerRef.current.querySelector(`[data-block-id="${blockId}"]`)
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
      targetEl.classList.add('ring-2', 'ring-amber-400', 'ring-offset-2', 'transition-all')
      setTimeout(() => {
        targetEl.classList.remove('ring-2', 'ring-amber-400', 'ring-offset-2')
      }, 2000)
    }
  }

  // Toggle favorite
  const handleToggleFavorite = async () => {
    const nextFav = await readerRepository.toggleFavorite(article.id)
    onUpdateArticle({ ...article, favorite: nextFav })
  }

  // Change reading status
  const handleChangeStatus = async (status: ReadingStatus) => {
    await readerRepository.updateArticleStatus(article.id, status)
    onUpdateArticle({ ...article, status })
  }

  // Theme configuration
  const currentTheme = THEME_STYLES[settings.theme] || THEME_STYLES.dark

  // Font family class
  const fontClass =
    settings.fontFamily === 'serif'
      ? 'font-serif'
      : settings.fontFamily === 'mono'
      ? 'font-mono'
      : 'font-sans'

  // Max width column class
  const columnWidthClass =
    settings.columnWidth === 'compact'
      ? 'max-w-2xl'
      : settings.columnWidth === 'wide'
      ? 'max-w-4xl'
      : 'max-w-3xl'

  // Render block content with highlights
  const renderBlockContent = (block: ArticleBlock) => {
    if (!block.text) return null

    // Find highlights associated with this block
    const blockHighlights = highlights.filter(h => h.blockId === block.id)
    if (blockHighlights.length === 0) {
      return block.text
    }

    // Sort highlights by occurrence in text
    let renderedText: React.ReactNode[] = [block.text]

    blockHighlights.forEach(h => {
      const nextRendered: React.ReactNode[] = []
      renderedText.forEach((node, nodeIdx) => {
        if (typeof node !== 'string') {
          nextRendered.push(node)
          return
        }

        const idx = node.indexOf(h.text)
        if (idx >= 0) {
          const before = node.slice(0, idx)
          const match = node.slice(idx, idx + h.text.length)
          const after = node.slice(idx + h.text.length)

          if (before) nextRendered.push(before)

          const colorClass = HIGHLIGHT_COLOR_CLASSES[h.color] || HIGHLIGHT_COLOR_CLASSES.yellow
          nextRendered.push(
            <mark
              key={`hl-${h.id}-${nodeIdx}`}
              onClick={e => {
                e.stopPropagation()
                sounds.playClick()
                setActiveHighlightId(h.id)
              }}
              className={`${colorClass} cursor-pointer transition-all hover:brightness-110 relative inline-block`}
              title={h.note ? `Note: ${h.note}` : 'Click for highlight options'}
            >
              {match}
            </mark>
          )

          if (after) nextRendered.push(after)
        } else {
          nextRendered.push(node)
        }
      })
      renderedText = nextRendered
    })

    return <>{renderedText}</>
  }

  return (
    <div className={`flex flex-col h-full overflow-hidden select-text ${currentTheme.bg} ${currentTheme.text} transition-colors duration-200`}>
      {/* Top Reading Navigation Bar */}
      {!distractionFree && (
        <header className={`flex items-center justify-between px-4 py-2.5 border-b ${currentTheme.border} ${currentTheme.headerBg} backdrop-blur-xl z-20 transition-all`}>
          {/* Left: Back & Title snippet */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl hover:bg-white/10 transition-colors text-xs font-medium text-slate-300 hover:text-white"
              title="Back to Reading Library"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Library</span>
            </button>

            <div className="h-4 w-[1px] bg-white/10 hidden sm:block" />

            <div className="min-w-0">
              <h2 className="text-xs font-semibold truncate max-w-[260px] md:max-w-md">
                {article.title}
              </h2>
              <p className="text-[10px] text-slate-400 truncate">
                {article.publication} • {article.readingTimeMinutes} min read
              </p>
            </div>
          </div>

          {/* Right: Controls */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* Status Dropdown */}
            <select
              value={article.status}
              onChange={e => handleChangeStatus(e.target.value as ReadingStatus)}
              className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-[11px] text-slate-300 focus:outline-none"
            >
              <option value="READING">Reading</option>
              <option value="UNREAD">Unread</option>
              <option value="FINISHED">Finished</option>
              <option value="ARCHIVED">Archived</option>
            </select>

            {/* Favorite button */}
            <button
              onClick={handleToggleFavorite}
              className={`p-1.5 rounded-lg hover:bg-white/10 transition-colors ${
                article.favorite ? 'text-amber-400' : 'text-slate-400'
              }`}
              title="Favorite article"
            >
              <Star className={`w-4 h-4 ${article.favorite ? 'fill-amber-400' : ''}`} />
            </button>

            {/* Add to Collection */}
            <button
              onClick={() => {
                sounds.playClick()
                setCollectionPickerPayload({
                  itemType: 'article',
                  sourceType: 'reader_article',
                  title: article.title,
                  description: article.excerpt || '',
                  url: article.url,
                  sourceId: article.id
                })
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Save to Collection"
            >
              <FolderPlus className="w-4 h-4" />
            </button>

            {/* Find in article */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className={`p-1.5 rounded-lg transition-colors ${
                searchOpen ? 'bg-amber-500/20 text-amber-300' : 'text-slate-400 hover:text-white hover:bg-white/10'
              }`}
              title="Search in article (Ctrl+F)"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Typography & Theme Popover Toggle */}
            <button
              onClick={() => setSettingsOpen(!settingsOpen)}
              className={`p-1.5 rounded-lg transition-colors ${
                settingsOpen ? 'bg-sky-500/20 text-sky-300' : 'text-slate-400 hover:text-white hover:bg-white/10'
              }`}
              title="Reader Settings & Typography"
            >
              <Settings2 className="w-4 h-4" />
            </button>

            {/* Distraction-Free Toggle */}
            <button
              onClick={() => setDistractionFree(true)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Distraction-Free Mode"
            >
              <Maximize2 className="w-4 h-4" />
            </button>

            {/* Annotations Sidebar Toggle */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl transition-all text-xs font-medium border ${
                sidebarOpen
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                  : 'bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-white/10'
              }`}
              title="Annotations and Notes"
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Notes</span>
              <span className="text-[10px] px-1 rounded-full bg-white/10">
                {highlights.length + quotes.length + notes.length}
              </span>
            </button>
          </div>
        </header>
      )}

      {/* Floating Exit Distraction-Free Button */}
      {distractionFree && (
        <button
          onClick={() => setDistractionFree(false)}
          className="fixed top-4 right-4 z-50 p-2 rounded-full bg-slate-900/90 text-white border border-white/20 shadow-xl hover:bg-slate-800 transition-all active:scale-95"
          title="Exit Fullscreen Mode"
        >
          <Minimize2 className="w-4 h-4" />
        </button>
      )}

      {/* Progress Bar */}
      <div className="w-full h-1 bg-white/5 overflow-hidden">
        <div
          className="h-full bg-amber-400 transition-all duration-150"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Search in Article Bar */}
      {searchOpen && (
        <div className={`px-4 py-2 border-b ${currentTheme.border} ${currentTheme.headerBg} flex items-center justify-between gap-3 text-xs animate-in slide-in-from-top-2`}>
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Find in article..."
              autoFocus
              className="w-full bg-transparent text-white placeholder-slate-500 focus:outline-none text-xs"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400">
              {searchQuery ? 'Searching...' : 'Type to search'}
            </span>
            <button
              onClick={() => setSearchOpen(false)}
              className="p-1 rounded text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Settings Panel Popover */}
      {settingsOpen && (
        <div className="fixed top-14 right-4 z-40 w-72 p-4 rounded-2xl bg-slate-900/95 backdrop-blur-2xl border border-white/20 shadow-2xl text-slate-200 text-xs animate-in zoom-in-95 duration-150 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <span className="font-semibold text-white">Appearance & Typography</span>
            <button onClick={() => setSettingsOpen(false)} className="text-slate-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Theme Selection */}
          <div>
            <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5 block">
              Theme
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { id: 'dark', label: 'Dark', bg: 'bg-slate-900 border-white/20 text-white' },
                { id: 'light', label: 'Light', bg: 'bg-[#faf9f5] border-[#e5e3dc] text-black' },
                { id: 'sepia', label: 'Sepia', bg: 'bg-[#f4ecd8] border-[#e2d6bc] text-[#3d3226]' },
                { id: 'black', label: 'OLED', bg: 'bg-black border-neutral-800 text-white' }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => {
                    const next = { ...settings, theme: t.id as any }
                    setSettings(next)
                    readerRepository.saveSettings(next)
                  }}
                  className={`py-1.5 rounded-lg border text-center font-medium transition-all ${t.bg} ${
                    settings.theme === t.id ? 'ring-2 ring-amber-400 scale-105' : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Font Family */}
          <div>
            <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5 block">
              Typeface
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: 'serif', label: 'Serif', font: 'font-serif' },
                { id: 'sans', label: 'Sans', font: 'font-sans' },
                { id: 'mono', label: 'Mono', font: 'font-mono' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => {
                    const next = { ...settings, fontFamily: f.id as any }
                    setSettings(next)
                    readerRepository.saveSettings(next)
                  }}
                  className={`py-1.5 rounded-lg border border-white/10 text-center font-medium transition-all ${f.font} ${
                    settings.fontFamily === f.id
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-white/5 hover:bg-white/10'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Font Size */}
          <div>
            <div className="flex justify-between text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5">
              <span>Text Size</span>
              <span>{settings.fontSize}px</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs">A</span>
              <input
                type="range"
                min={15}
                max={24}
                step={1}
                value={settings.fontSize}
                onChange={e => {
                  const next = { ...settings, fontSize: Number(e.target.value) }
                  setSettings(next)
                  readerRepository.saveSettings(next)
                }}
                className="w-full accent-amber-400 cursor-pointer"
              />
              <span className="text-base font-bold">A</span>
            </div>
          </div>

          {/* Column Width */}
          <div>
            <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5 block">
              Column Width
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {(['compact', 'comfortable', 'wide'] as const).map(w => (
                <button
                  key={w}
                  onClick={() => {
                    const next = { ...settings, columnWidth: w }
                    setSettings(next)
                    readerRepository.saveSettings(next)
                  }}
                  className={`py-1.5 rounded-lg border border-white/10 text-center capitalize transition-all ${
                    settings.columnWidth === w
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-white/5 hover:bg-white/10'
                  }`}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Reading View with Optional Sidebar */}
      <div className="flex-1 flex overflow-hidden relative">
        <main
          ref={contentContainerRef}
          onScroll={handleScroll}
          onMouseUp={handleMouseUp}
          className="flex-1 overflow-y-auto px-4 sm:px-8 py-8 md:py-14 scroll-smooth"
        >
          <article
            className={`mx-auto ${columnWidthClass} transition-all duration-200`}
            style={{
              fontSize: `${settings.fontSize}px`,
              lineHeight: settings.lineHeight
            }}
          >
            {/* Article Meta Header */}
            <header className="mb-10 pb-6 border-b border-white/10">
              <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold mb-3 flex-wrap">
                {article.publication && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/20 uppercase tracking-wider text-[10px]">
                    {article.publication}
                  </span>
                )}
                {article.publishedAt && (
                  <span className="text-slate-400">{article.publishedAt}</span>
                )}
                <span className="text-slate-400">•</span>
                <span className="text-slate-400">{article.readingTimeMinutes} min read</span>
                {article.url && (
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-slate-400 hover:text-amber-400 transition-colors ml-auto text-[11px]"
                  >
                    <span>Original</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-4 leading-tight">
                {article.title}
              </h1>

              {article.author && (
                <p className="text-xs sm:text-sm text-slate-400 italic">
                  By {article.author}
                </p>
              )}

              {article.coverImage && (
                <div className="mt-6 rounded-2xl overflow-hidden border border-white/10 shadow-xl max-h-96">
                  <img
                    src={article.coverImage}
                    alt={article.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </header>

            {/* Article Blocks Body */}
            <div className={`space-y-6 ${fontClass}`}>
              {article.blocks.map(block => {
                if (block.type === 'h1') {
                  return (
                    <h1
                      key={block.id}
                      data-block-id={block.id}
                      className="text-2xl sm:text-3xl font-bold mt-8 mb-4 tracking-tight"
                    >
                      {block.text}
                    </h1>
                  )
                }

                if (block.type === 'h2') {
                  return (
                    <h2
                      key={block.id}
                      data-block-id={block.id}
                      className="text-xl sm:text-2xl font-bold mt-8 mb-3 tracking-tight"
                    >
                      {block.text}
                    </h2>
                  )
                }

                if (block.type === 'h3') {
                  return (
                    <h3
                      key={block.id}
                      data-block-id={block.id}
                      className="text-lg sm:text-xl font-semibold mt-6 mb-2 tracking-tight"
                    >
                      {block.text}
                    </h3>
                  )
                }

                if (block.type === 'blockquote') {
                  return (
                    <blockquote
                      key={block.id}
                      data-block-id={block.id}
                      className="pl-4 sm:pl-6 my-6 border-l-4 border-amber-400/80 italic text-base sm:text-lg opacity-90 leading-relaxed font-serif"
                    >
                      {renderBlockContent(block)}
                    </blockquote>
                  )
                }

                if (block.type === 'list' && block.items) {
                  return (
                    <ul
                      key={block.id}
                      data-block-id={block.id}
                      className="list-disc pl-6 space-y-2.5 my-4"
                    >
                      {block.items.map((item, idx) => (
                        <li key={idx} className="leading-relaxed">
                          {item}
                        </li>
                      ))}
                    </ul>
                  )
                }

                if (block.type === 'image' && block.src) {
                  return (
                    <figure key={block.id} data-block-id={block.id} className="my-8">
                      <div className="rounded-xl overflow-hidden border border-white/10 shadow-lg">
                        <img src={block.src} alt={block.caption || ''} className="w-full object-cover" />
                      </div>
                      {block.caption && (
                        <figcaption className="text-center text-xs text-slate-400 mt-2 italic">
                          {block.caption}
                        </figcaption>
                      )}
                    </figure>
                  )
                }

                if (block.type === 'code') {
                  return (
                    <pre
                      key={block.id}
                      data-block-id={block.id}
                      className="p-4 rounded-xl bg-black/40 border border-white/10 font-mono text-xs overflow-x-auto my-4 text-emerald-400"
                    >
                      <code>{block.text}</code>
                    </pre>
                  )
                }

                // Default paragraph
                return (
                  <p
                    key={block.id}
                    data-block-id={block.id}
                    className="leading-relaxed select-text"
                  >
                    {renderBlockContent(block)}
                  </p>
                )
              })}
            </div>

            {/* End of article reading check */}
            <div className="mt-16 pt-8 border-t border-white/10 flex flex-col items-center justify-center text-center">
              <BookOpen className="w-8 h-8 text-amber-400 mb-2 opacity-50" />
              <p className="text-sm font-semibold text-slate-200">You finished this reading</p>
              <p className="text-xs text-slate-400 mt-1 mb-4">
                Great job! Your reading progress has been saved.
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleChangeStatus('FINISHED')}
                  className="px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-all active:scale-95"
                >
                  Mark as Finished
                </button>
                <button
                  onClick={onBack}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-medium transition-all"
                >
                  Return to Library
                </button>
              </div>
            </div>
          </article>
        </main>

        {/* Annotations & Notes Sidebar */}
        <AnnotationsSidebar
          articleTitle={article.title}
          highlights={highlights}
          quotes={quotes}
          notes={notes}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onScrollToBlock={handleScrollToBlock}
          onDeleteHighlight={handleDeleteHighlight}
          onDeleteQuote={handleDeleteQuote}
          onDeleteNote={handleDeleteNote}
          onSaveGeneralNote={handleSaveGeneralNote}
        />
      </div>

      {/* Floating Selection Toolbar */}
      {selectionToolbarPos && (
        <TextSelectionToolbar
          position={selectionToolbarPos}
          selectedText={selectedText}
          onHighlight={handleHighlight}
          onTranslate={handleTranslateSelection}
          onSaveQuote={() => handleSaveQuoteFromSelection()}
          onAddNote={handleAddNoteFromSelection}
          onClose={() => setSelectionToolbarPos(null)}
        />
      )}

      {/* English to Arabic Translation Modal */}
      <TranslationModal
        sourceText={translationSourceText}
        isOpen={translationOpen}
        onClose={() => setTranslationOpen(false)}
        onSaveAsNote={arabic => {
          handleSaveGeneralNote(`Arabic Translation:\n${arabic}\n\nOriginal:\n"${translationSourceText}"`)
          setTranslationOpen(false)
        }}
        onSaveAsQuote={arabic => {
          handleSaveQuoteFromSelection(arabic)
          setTranslationOpen(false)
        }}
      />

      {/* Collection Picker Modal */}
      <CollectionPickerModal
        isOpen={!!collectionPickerPayload}
        payload={collectionPickerPayload}
        onClose={() => setCollectionPickerPayload(null)}
      />
    </div>
  )
}
