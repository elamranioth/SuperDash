import { useState, useEffect } from 'react'
import { X, Plus, Sparkles, Trash2, Heart } from 'lucide-react'
import { AliveItem } from '@/types'
import { aliveRepository } from '@/services/live'
import { sounds } from '@/utils/sound'
import GlassPanel from '@/components/LiquidGlass/GlassPanel'

interface AliveModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AliveModal({ isOpen, onClose }: AliveModalProps) {
  const [items, setItems] = useState<AliveItem[]>([])
  const [isAdding, setIsAdding] = useState(false)
  const [newText, setNewText] = useState('')
  const [newNote, setNewNote] = useState('')
  const [surfacedItem, setSurfacedItem] = useState<AliveItem | null>(null)

  useEffect(() => {
    if (isOpen) {
      aliveRepository.getAll().then(loaded => {
        setItems(loaded)
        if (loaded.length > 0 && Math.random() < 0.6) {
          const random = loaded[Math.floor(Math.random() * loaded.length)]
          setSurfacedItem(random)
        } else {
          setSurfacedItem(null)
        }
      })
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newText.trim()) return

    sounds.playSuccess()
    const item: AliveItem = {
      id: `alive-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      text: newText.trim(),
      optionalNote: newNote.trim() || undefined,
      createdAt: Date.now()
    }
    await aliveRepository.save(item)
    setItems(prev => [item, ...prev])
    setNewText('')
    setNewNote('')
    setIsAdding(false)
  }

  const handleDelete = async (id: string) => {
    sounds.playClick()
    await aliveRepository.delete(id)
    setItems(prev => prev.filter(i => i.id !== id))
    if (surfacedItem?.id === id) setSurfacedItem(null)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/85 backdrop-blur-2xl animate-in fade-in select-text">
      <div className="w-full max-w-xl max-h-[85vh] flex flex-col bg-slate-900/90 border border-white/15 rounded-3xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-widest font-bold text-amber-400 block mb-0.5">
              A Personal Collection
            </span>
            <h2 className="text-xl font-serif text-white">
              What makes you feel alive?
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Gentle Resurfaced Banner */}
          {surfacedItem && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-slate-200">
              <span className="text-[10px] uppercase tracking-widest font-bold text-amber-400 block mb-1">
                A reminder from yourself
              </span>
              <p className="text-sm font-serif italic text-amber-100 mb-2 leading-relaxed">
                "You once said that <span className="font-semibold">{surfacedItem.text.toLowerCase().replace(/\.$/, '')}</span> makes you feel alive. Maybe sometime soon, you could do that again."
              </p>
              <div className="flex justify-end gap-2 text-xs">
                <button
                  onClick={() => setSurfacedItem(null)}
                  className="px-3 py-1 rounded-full text-slate-400 hover:text-white"
                >
                  Maybe later
                </button>
              </div>
            </div>
          )}

          {/* Add Button / Form */}
          {!isAdding ? (
            <button
              onClick={() => setIsAdding(true)}
              className="w-full py-2.5 px-4 rounded-2xl border border-dashed border-white/20 hover:border-amber-400/40 text-slate-300 hover:text-amber-300 text-xs font-serif flex items-center justify-center gap-2 transition-all bg-white/5"
            >
              <Plus className="w-4 h-4" />
              <span>Add something that makes you feel alive</span>
            </button>
          ) : (
            <form onSubmit={handleAdd} className="p-4 rounded-2xl bg-white/5 border border-white/15 space-y-3">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-slate-300 font-semibold mb-1">
                  What makes you feel alive?
                </label>
                <input
                  type="text"
                  value={newText}
                  onChange={e => setNewText(e.target.value)}
                  placeholder="e.g. Walking near the sea, Drinking morning coffee outside, Driving at night..."
                  required
                  autoFocus
                  className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400 font-serif"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-slate-300 font-semibold mb-1">
                  Optional note
                </label>
                <input
                  type="text"
                  value={newNote}
                  onChange={e => setNewNote(e.target.value)}
                  placeholder="e.g. When the air is cool and the streets are empty."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-semibold shadow"
                >
                  Remember this
                </button>
              </div>
            </form>
          )}

          {/* List of Alive items */}
          <div className="space-y-2.5 pt-2">
            {items.map(item => (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl bg-white/5 border border-white/5 hover:border-amber-400/25 transition-all flex items-start justify-between gap-3 group"
              >
                <div>
                  <p className="text-xs sm:text-sm font-serif text-slate-100 leading-relaxed">
                    {item.text}
                  </p>
                  {item.optionalNote && (
                    <p className="text-[11px] text-slate-400 mt-1 font-sans">
                      {item.optionalNote}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-1 rounded text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          <span className="font-serif italic">
            There is no score here. Just things that bring you back.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
