import { useState, useEffect } from 'react'
import { X, Plus, Mail, Trash2, ArrowLeft, Calendar } from 'lucide-react'
import { LiveLetter } from '@/types'
import { liveLettersRepository, LETTER_PROMPTS } from '@/services/live'
import { sounds } from '@/utils/sound'
import GlassPanel from '@/components/LiquidGlass/GlassPanel'

interface LettersModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function LettersModal({ isOpen, onClose }: LettersModalProps) {
  const [letters, setLetters] = useState<LiveLetter[]>([])
  const [activeLetter, setActiveLetter] = useState<LiveLetter | null>(null)
  const [isWriting, setIsWriting] = useState(false)
  const [title, setTitle] = useState('')
  const [recipient, setRecipient] = useState('')
  const [content, setContent] = useState('')

  useEffect(() => {
    if (isOpen) {
      liveLettersRepository.getAll().then(setLetters)
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleSelectPrompt = (prompt: typeof LETTER_PROMPTS[number]) => {
    setTitle(prompt.label)
    setRecipient('')
    setContent('')
    setIsWriting(true)
  }

  const handleSaveLetter = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    sounds.playSuccess()
    const letter: LiveLetter = {
      id: `let-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: title.trim() || 'A letter to my thoughts',
      recipientDescription: recipient.trim() || undefined,
      content: content.trim(),
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
    await liveLettersRepository.save(letter)
    setLetters(prev => [letter, ...prev])
    setIsWriting(false)
    setActiveLetter(letter)
  }

  const handleDelete = async (id: string) => {
    sounds.playClick()
    await liveLettersRepository.delete(id)
    setLetters(prev => prev.filter(l => l.id !== id))
    if (activeLetter?.id === id) setActiveLetter(null)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/85 backdrop-blur-2xl animate-in fade-in select-text">
      <div className="w-full max-w-2xl max-h-[88vh] flex flex-col bg-slate-900/95 border border-white/15 rounded-3xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {activeLetter || isWriting ? (
              <button
                onClick={() => {
                  setActiveLetter(null)
                  setIsWriting(false)
                }}
                className="p-1 text-slate-400 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            ) : null}
            <div>
              <span className="text-[10px] uppercase tracking-widest font-bold text-amber-400 block mb-0.5">
                Private Sanctuary
              </span>
              <h2 className="text-xl font-serif text-white">
                {activeLetter ? activeLetter.title : isWriting ? 'Write a Letter' : 'Letters that may never be sent'}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeLetter ? (
            /* Viewing an existing letter */
            <div className="space-y-4 max-w-lg mx-auto font-serif">
              <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-white/10">
                <span>{activeLetter.recipientDescription ? `To: ${activeLetter.recipientDescription}` : 'Personal'}</span>
                <span>{new Date(activeLetter.createdAt).toLocaleDateString()}</span>
              </div>
              <p className="text-sm leading-loose text-slate-100 whitespace-pre-line select-text">
                {activeLetter.content}
              </p>
              <div className="pt-6 border-t border-white/10 flex justify-between">
                <button
                  onClick={() => handleDelete(activeLetter.id)}
                  className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-rose-400 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete letter</span>
                </button>
                <button
                  onClick={() => setActiveLetter(null)}
                  className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-white"
                >
                  Back to letters
                </button>
              </div>
            </div>
          ) : isWriting ? (
            /* Writing a letter */
            <form onSubmit={handleSaveLetter} className="space-y-3.5 max-w-lg mx-auto">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-slate-300 font-semibold mb-1">
                  Title or Topic
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. A letter to someone I miss"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400 font-serif"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-slate-300 font-semibold mb-1">
                  Who is this for? (Optional)
                </label>
                <input
                  type="text"
                  value={recipient}
                  onChange={e => setRecipient(e.target.value)}
                  placeholder="e.g. Someone I haven't spoken to in years, My 18-year-old self..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-slate-300 font-semibold mb-1">
                  Your words
                </label>
                <textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="Write freely. No one else will read this..."
                  rows={8}
                  required
                  autoFocus
                  className="w-full p-3.5 rounded-xl bg-slate-950/80 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400 font-serif leading-relaxed resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsWriting(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-semibold shadow"
                >
                  Keep this letter
                </button>
              </div>
            </form>
          ) : (
            /* Letters Index & Prompts */
            <div className="space-y-6">
              <div>
                <span className="text-xs uppercase tracking-widest text-slate-400 font-semibold block mb-3">
                  Start with a thought
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {LETTER_PROMPTS.map(p => (
                    <button
                      key={p.type}
                      onClick={() => handleSelectPrompt(p)}
                      className="p-3 text-left rounded-2xl bg-white/5 border border-white/5 hover:border-amber-400/30 hover:bg-white/10 transition-all group"
                    >
                      <span className="text-xs font-serif text-slate-200 group-hover:text-amber-300 block mb-0.5">
                        {p.label}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {p.placeholder}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {letters.length > 0 && (
                <div className="pt-4 border-t border-white/10">
                  <span className="text-xs uppercase tracking-widest text-slate-400 font-semibold block mb-3">
                    Your Letters ({letters.length})
                  </span>
                  <div className="space-y-2.5">
                    {letters.map(letter => (
                      <div
                        key={letter.id}
                        onClick={() => setActiveLetter(letter)}
                        className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-amber-400/30 cursor-pointer transition-all flex items-center justify-between group"
                      >
                        <div>
                          <h4 className="text-xs font-serif text-slate-100 group-hover:text-amber-300 font-medium">
                            {letter.title}
                          </h4>
                          <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                            {letter.content}
                          </p>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono flex-shrink-0 ml-3">
                          {new Date(letter.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
