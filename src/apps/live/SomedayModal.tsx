import { useState, useEffect } from 'react'
import { X, Plus, Sparkles, Trash2, Compass } from 'lucide-react'
import { SomedayItem } from '@/types'
import { somedayRepository } from '@/services/live'
import { sounds } from '@/utils/sound'
import GlassPanel from '@/components/LiquidGlass/GlassPanel'

interface SomedayModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SomedayModal({ isOpen, onClose }: SomedayModalProps) {
  const [items, setItems] = useState<SomedayItem[]>([])
  const [isAdding, setIsAdding] = useState(false)
  const [newText, setNewText] = useState('')
  const [newReason, setNewReason] = useState('')
  const [surfacedItem, setSurfacedItem] = useState<SomedayItem | null>(null)

  useEffect(() => {
    if (isOpen) {
      somedayRepository.getAll().then(loaded => {
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
    const item: SomedayItem = {
      id: `sm-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      text: newText.trim(),
      optionalReason: newReason.trim() || undefined,
      createdAt: Date.now()
    }
    await somedayRepository.save(item)
    setItems(prev => [item, ...prev])
    setNewText('')
    setNewReason('')
    setIsAdding(false)
  }

  const handleDelete = async (id: string) => {
    sounds.playClick()
    await somedayRepository.delete(id)
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
              Someday, Maybe
            </span>
            <h2 className="text-xl font-serif text-white">
              Things to experience someday
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
          <p className="text-xs text-slate-400 font-serif leading-relaxed">
            Not a bucket list with deadlines or targets. Just things you might like to see, do, or taste someday. They are allowed to stay here forever.
          </p>

          {/* Gentle Resurfaced Banner */}
          {surfacedItem && (
            <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/25 text-slate-200">
              <span className="text-[10px] uppercase tracking-widest font-bold text-sky-400 block mb-1">
                A quiet thought from the past
              </span>
              <p className="text-sm font-serif italic text-sky-100 mb-1 leading-relaxed">
                "You wrote this a while ago: <span className="font-semibold">{surfacedItem.text}</span> Still sounds beautiful."
              </p>
              <div className="flex justify-end gap-2 text-xs">
                <button
                  onClick={() => setSurfacedItem(null)}
                  className="px-3 py-1 rounded-full text-slate-400 hover:text-white"
                >
                  Close
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
              <span>Add something you might like to experience</span>
            </button>
          ) : (
            <form onSubmit={handleAdd} className="p-4 rounded-2xl bg-white/5 border border-white/15 space-y-3">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-slate-300 font-semibold mb-1">
                  What would you like to experience?
                </label>
                <input
                  type="text"
                  value={newText}
                  onChange={e => setNewText(e.target.value)}
                  placeholder="e.g. See the northern lights, Learn to make sourdough bread..."
                  required
                  autoFocus
                  className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400 font-serif"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-slate-300 font-semibold mb-1">
                  Why does it call to you? (Optional)
                </label>
                <input
                  type="text"
                  value={newReason}
                  onChange={e => setNewReason(e.target.value)}
                  placeholder="e.g. To sit quietly in the snow without a clock..."
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
                  Keep this dream
                </button>
              </div>
            </form>
          )}

          {/* List of Someday items */}
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
                  {item.optionalReason && (
                    <p className="text-[11px] text-slate-400 mt-1 font-sans italic">
                      "{item.optionalReason}"
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
            No deadlines. No pressure. Just possibilities.
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
