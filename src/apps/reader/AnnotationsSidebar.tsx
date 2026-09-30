import { useState } from 'react'
import {
  Highlighter,
  Quote as QuoteIcon,
  StickyNote,
  Layers,
  Trash2,
  Copy,
  Check,
  X,
  ExternalLink,
  Download,
  Plus
} from 'lucide-react'
import { Highlight, Quote, ReaderNote, HighlightColor } from '@/types'
import { sounds } from '@/utils/sound'
import GlassPanel from '@/components/LiquidGlass/GlassPanel'

interface AnnotationsSidebarProps {
  articleTitle: string
  highlights: Highlight[]
  quotes: Quote[]
  notes: ReaderNote[]
  isOpen: boolean
  onClose: () => void
  onScrollToBlock: (blockId?: string) => void
  onDeleteHighlight: (id: string) => void
  onDeleteQuote: (id: string) => void
  onDeleteNote: (id: string) => void
  onSaveGeneralNote: (text: string) => void
}

const COLOR_CLASSES: Record<HighlightColor, { bg: string; text: string; dot: string }> = {
  yellow: { bg: 'bg-amber-500/10 border-amber-500/30', text: 'text-amber-300', dot: 'bg-amber-400' },
  green: { bg: 'bg-emerald-500/10 border-emerald-500/30', text: 'text-emerald-300', dot: 'bg-emerald-400' },
  blue: { bg: 'bg-sky-500/10 border-sky-500/30', text: 'text-sky-300', dot: 'bg-sky-400' },
  rose: { bg: 'bg-rose-500/10 border-rose-500/30', text: 'text-rose-300', dot: 'bg-rose-400' },
  purple: { bg: 'bg-purple-500/10 border-purple-500/30', text: 'text-purple-300', dot: 'bg-purple-400' }
}

export default function AnnotationsSidebar({
  articleTitle,
  highlights,
  quotes,
  notes,
  isOpen,
  onClose,
  onScrollToBlock,
  onDeleteHighlight,
  onDeleteQuote,
  onDeleteNote,
  onSaveGeneralNote
}: AnnotationsSidebarProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'highlights' | 'quotes' | 'notes'>('all')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [isAddingNote, setIsAddingNote] = useState(false)
  const [newNoteText, setNewNoteText] = useState('')

  if (!isOpen) return null

  const handleCopyText = async (id: string, text: string) => {
    sounds.playClick()
    try {
      await navigator.clipboard.writeText(text)
    } catch {}
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 1500)
  }

  const handleExportAnnotations = () => {
    sounds.playClick()
    let content = `# Annotations for: ${articleTitle}\nExported: ${new Date().toLocaleString()}\n\n`

    if (highlights.length > 0) {
      content += `## Highlights (${highlights.length})\n\n`
      highlights.forEach(h => {
        content += `> ${h.text}\n`
        if (h.note) content += `*Note: ${h.note}*\n`
        content += `\n`
      })
    }

    if (quotes.length > 0) {
      content += `## Saved Quotes (${quotes.length})\n\n`
      quotes.forEach(q => {
        content += `> "${q.text}"\n\n`
      })
    }

    if (notes.length > 0) {
      content += `## Notes (${notes.length})\n\n`
      notes.forEach(n => {
        if (n.title) content += `### ${n.title}\n`
        content += `${n.text}\n\n`
      })
    }

    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${articleTitle.slice(0, 30).replace(/[^a-zA-Z0-9]/g, '_')}_annotations.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleAddGeneralNote = () => {
    if (!newNoteText.trim()) return
    onSaveGeneralNote(newNoteText.trim())
    setNewNoteText('')
    setIsAddingNote(false)
  }

  return (
    <aside className="fixed inset-0 sm:static sm:w-80 md:w-96 flex-shrink-0 flex flex-col h-full border-l border-white/10 bg-slate-950/95 sm:bg-slate-900/90 backdrop-blur-2xl z-40 sm:z-30 transition-all duration-200">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-amber-400" />
          <h2 className="text-sm font-semibold text-slate-100">Annotations</h2>
          <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-white/10 text-slate-300 font-mono">
            {highlights.length + quotes.length + notes.length}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleExportAnnotations}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Export Annotations as Markdown"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Close Sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-4 p-1.5 gap-1 border-b border-white/10 bg-black/20 text-xs font-medium">
        <button
          onClick={() => {
            sounds.playClick()
            setActiveTab('all')
          }}
          className={`py-1.5 rounded-lg transition-all ${
            activeTab === 'all'
              ? 'bg-white/15 text-white shadow-sm font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          All
        </button>
        <button
          onClick={() => {
            sounds.playClick()
            setActiveTab('highlights')
          }}
          className={`py-1.5 rounded-lg flex items-center justify-center gap-1 transition-all ${
            activeTab === 'highlights'
              ? 'bg-white/15 text-amber-300 shadow-sm font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>Marks</span>
          {highlights.length > 0 && <span className="text-[10px]">({highlights.length})</span>}
        </button>
        <button
          onClick={() => {
            sounds.playClick()
            setActiveTab('quotes')
          }}
          className={`py-1.5 rounded-lg flex items-center justify-center gap-1 transition-all ${
            activeTab === 'quotes'
              ? 'bg-white/15 text-emerald-300 shadow-sm font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>Quotes</span>
          {quotes.length > 0 && <span className="text-[10px]">({quotes.length})</span>}
        </button>
        <button
          onClick={() => {
            sounds.playClick()
            setActiveTab('notes')
          }}
          className={`py-1.5 rounded-lg flex items-center justify-center gap-1 transition-all ${
            activeTab === 'notes'
              ? 'bg-white/15 text-purple-300 shadow-sm font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>Notes</span>
          {notes.length > 0 && <span className="text-[10px]">({notes.length})</span>}
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 select-text">
        {/* New Note Button for Notes Tab */}
        {activeTab === 'notes' && (
          <div className="mb-3">
            {!isAddingNote ? (
              <button
                onClick={() => setIsAddingNote(true)}
                className="w-full py-2 px-3 rounded-xl border border-dashed border-white/20 hover:border-purple-400/40 text-slate-300 hover:text-purple-300 text-xs font-medium flex items-center justify-center gap-1.5 transition-all bg-white/5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Write Article Note</span>
              </button>
            ) : (
              <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 space-y-2">
                <textarea
                  value={newNoteText}
                  onChange={e => setNewNoteText(e.target.value)}
                  placeholder="Record insights, summary, or thoughts on this article..."
                  rows={3}
                  className="w-full bg-slate-900/80 border border-white/10 rounded-lg p-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-400 resize-none"
                  autoFocus
                />
                <div className="flex justify-end gap-1.5">
                  <button
                    onClick={() => {
                      setIsAddingNote(false)
                      setNewNoteText('')
                    }}
                    className="px-2.5 py-1 text-xs text-slate-400 hover:text-white rounded-lg hover:bg-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddGeneralNote}
                    disabled={!newNoteText.trim()}
                    className="px-3 py-1 text-xs font-medium bg-purple-600 hover:bg-purple-500 text-white rounded-lg disabled:opacity-40 transition-all shadow"
                  >
                    Save Note
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {highlights.length === 0 && quotes.length === 0 && notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400 px-4">
            <Highlighter className="w-8 h-8 mb-2 opacity-30 text-amber-400" />
            <p className="text-xs font-medium text-slate-300">No Annotations Yet</p>
            <p className="text-[11px] text-slate-500 mt-1 max-w-[220px]">
              Select any sentence or paragraph in the article to highlight, translate, quote, or take notes.
            </p>
          </div>
        ) : null}

        {/* Highlights List */}
        {(activeTab === 'all' || activeTab === 'highlights') &&
          highlights.map(h => {
            const style = COLOR_CLASSES[h.color] || COLOR_CLASSES.yellow
            return (
              <div
                key={h.id}
                className={`p-3 rounded-xl border ${style.bg} transition-all hover:scale-[1.01] group relative`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${style.dot}`} />
                    <span className={`text-[10px] uppercase font-semibold tracking-wider ${style.text}`}>
                      Highlight
                    </span>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleCopyText(h.id, h.text)}
                      className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10"
                      title="Copy text"
                    >
                      {copiedId === h.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                    <button
                      onClick={() => onScrollToBlock(h.blockId)}
                      className="p-1 rounded text-slate-400 hover:text-sky-300 hover:bg-white/10"
                      title="Jump to passage"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => onDeleteHighlight(h.id)}
                      className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-white/10"
                      title="Delete highlight"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <p
                  onClick={() => onScrollToBlock(h.blockId)}
                  className="text-xs text-slate-200 line-clamp-3 cursor-pointer hover:text-white transition-colors"
                >
                  "{h.text}"
                </p>

                {h.note && (
                  <div className="mt-2 pt-2 border-t border-white/10 flex items-start gap-1.5 text-[11px] text-amber-200/90 font-sans italic">
                    <StickyNote className="w-3 h-3 flex-shrink-0 mt-0.5 opacity-70" />
                    <span>{h.note}</span>
                  </div>
                )}
              </div>
            )
          })}

        {/* Quotes List */}
        {(activeTab === 'all' || activeTab === 'quotes') &&
          quotes.map(q => (
            <div
              key={q.id}
              className="p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 transition-all hover:scale-[1.01] group relative"
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <QuoteIcon className="w-3 h-3" />
                  <span className="text-[10px] uppercase font-semibold tracking-wider">Quote</span>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleCopyText(q.id, `"${q.text}"`)}
                    className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10"
                    title="Copy Quote"
                  >
                    {copiedId === q.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                  <button
                    onClick={() => onDeleteQuote(q.id)}
                    className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-white/10"
                    title="Delete Quote"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <blockquote className="text-xs text-slate-200 italic line-clamp-3">
                "{q.text}"
              </blockquote>
            </div>
          ))}

        {/* Notes List */}
        {(activeTab === 'all' || activeTab === 'notes') &&
          notes.map(n => (
            <div
              key={n.id}
              className="p-3 rounded-xl border border-purple-500/20 bg-purple-500/10 transition-all hover:scale-[1.01] group relative"
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-1.5 text-purple-400">
                  <StickyNote className="w-3 h-3" />
                  <span className="text-[10px] uppercase font-semibold tracking-wider">
                    {n.title || 'Note'}
                  </span>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleCopyText(n.id, n.text)}
                    className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10"
                    title="Copy Note"
                  >
                    {copiedId === n.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                  {n.blockId && (
                    <button
                      onClick={() => onScrollToBlock(n.blockId)}
                      className="p-1 rounded text-slate-400 hover:text-sky-300 hover:bg-white/10"
                      title="Jump to block"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                  <button
                    onClick={() => onDeleteNote(n.id)}
                    className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-white/10"
                    title="Delete Note"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {n.selectedText && (
                <div className="text-[10px] text-slate-400 italic line-clamp-1 border-l-2 border-purple-400/40 pl-1.5 mb-1.5">
                  "{n.selectedText}"
                </div>
              )}

              <p className="text-xs text-slate-200 leading-relaxed select-text">{n.text}</p>
            </div>
          ))}
      </div>
    </aside>
  )
}
