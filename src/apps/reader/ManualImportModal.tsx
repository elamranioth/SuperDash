import { useState } from 'react'
import {
  FileText,
  X,
  BookOpen,
  Sparkles,
  Link as LinkIcon,
  User
} from 'lucide-react'
import { ManualImportPayload } from '@/services/reader'
import { sounds } from '@/utils/sound'
import GlassPanel from '@/components/LiquidGlass/GlassPanel'

interface ManualImportModalProps {
  initialUrl?: string
  isOpen: boolean
  onClose: () => void
  onImport: (payload: ManualImportPayload) => void
}

export default function ManualImportModal({
  initialUrl = '',
  isOpen,
  onClose,
  onImport
}: ManualImportModalProps) {
  const [url, setUrl] = useState(initialUrl)
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [content, setContent] = useState('')
  const [coverImage, setCoverImage] = useState('')

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    sounds.playSuccess()
    onImport({
      title: title.trim() || 'Untitled Article',
      url: url.trim() || undefined,
      author: author.trim() || undefined,
      content: content.trim(),
      coverImage: coverImage.trim() || undefined
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-xl animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
        <GlassPanel intensity="intense" className="p-6 border border-white/20 shadow-2xl rounded-2xl">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
            <div className="flex items-center gap-2 text-amber-400">
              <FileText className="w-5 h-5" />
              <h3 className="text-base font-semibold text-slate-100">
                Direct Article Import
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-400 mb-4">
            Paste the text or markdown of any article to format it into a clean, distraction-free reading experience.
          </p>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Article Title <span className="text-amber-400">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. The Architecture of Thought"
                required
                className="w-full px-3 py-2 rounded-xl bg-slate-900/70 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-300 mb-1 flex items-center gap-1">
                  <User className="w-3 h-3 text-slate-400" />
                  <span>Author</span>
                </label>
                <input
                  type="text"
                  value={author}
                  onChange={e => setAuthor(e.target.value)}
                  placeholder="Author or Publication"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900/70 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-300 mb-1 flex items-center gap-1">
                  <LinkIcon className="w-3 h-3 text-slate-400" />
                  <span>Source URL (Optional)</span>
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-900/70 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Article Content (Text or Markdown) <span className="text-amber-400">*</span>
              </label>
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="Paste the article body here... Paragraphs, headers (#, ##), and quotes (>) will be beautifully rendered."
                rows={8}
                required
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900/70 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400 resize-none font-mono"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!content.trim()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-black shadow-lg shadow-amber-500/20 disabled:opacity-40 transition-all active:scale-95"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Start Reading</span>
              </button>
            </div>
          </form>
        </GlassPanel>
      </div>
    </div>
  )
}
