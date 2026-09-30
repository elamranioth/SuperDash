import { useState } from 'react'
import { ArrowLeft, Sparkles, Plus, Trash2, Calendar, Image as ImageIcon, X } from 'lucide-react'
import { LiveMemory } from '@/types'
import { liveRepository } from '@/services/live'
import { sounds } from '@/utils/sound'
import { toLocalYYYYMMDD } from '@/utils/date'
import GlassPanel from '@/components/LiquidGlass/GlassPanel'

interface RememberViewProps {
  memories: LiveMemory[]
  onBack: () => void
  onSaveMemory: (memory: LiveMemory) => void
  onDeleteMemory: (id: string) => void
}

export default function RememberView({
  memories,
  onBack,
  onSaveMemory,
  onDeleteMemory
}: RememberViewProps) {
  const [newText, setNewText] = useState('')
  const [newDate, setNewDate] = useState(toLocalYYYYMMDD())
  const [isAdding, setIsAdding] = useState(false)
  const [surfacedMemory, setSurfacedMemory] = useState<LiveMemory | null>(null)

  const handleAddMemory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newText.trim()) return

    sounds.playSuccess()
    const memory: LiveMemory = {
      id: `mem-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      text: newText.trim(),
      date: newDate,
      createdAt: Date.now()
    }
    await liveRepository.saveMemory(memory)
    onSaveMemory(memory)
    setNewText('')
    setIsAdding(false)
  }

  const handleSurfaceRandom = () => {
    sounds.playClick()
    if (memories.length === 0) return
    const randomIdx = Math.floor(Math.random() * memories.length)
    setSurfacedMemory(memories[randomIdx])
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-6 md:p-10 select-text">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Live Home</span>
        </button>

        <div className="flex items-center gap-2">
          {memories.length > 0 && (
            <button
              onClick={handleSurfaceRandom}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/15 text-xs text-amber-300 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Remember this?</span>
            </button>
          )}

          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/30 text-xs font-medium transition-all active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Preserve a moment</span>
          </button>
        </div>
      </div>

      {/* Surfaced Memory Banner if triggered */}
      {surfacedMemory && (
        <div className="mt-4 p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-slate-100 flex items-start justify-between gap-4 animate-in fade-in">
          <div>
            <span className="text-[10px] uppercase tracking-widest font-bold text-amber-400 block mb-1">
              Remember this? • {surfacedMemory.date}
            </span>
            <p className="text-sm font-serif italic leading-relaxed text-amber-100">
              "{surfacedMemory.text}"
            </p>
          </div>
          <button
            onClick={() => setSurfacedMemory(null)}
            className="p-1 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* New Memory Form */}
      {isAdding && (
        <form onSubmit={handleAddMemory} className="mt-4 p-5 rounded-2xl bg-slate-900/80 border border-white/15 space-y-3 animate-in fade-in">
          <label className="block text-xs font-serif text-slate-200">
            What happened recently that you don't want to forget?
          </label>
          <textarea
            value={newText}
            onChange={e => setNewText(e.target.value)}
            placeholder="My father laughed when... / We sat outside near the water... / Today I noticed..."
            rows={3}
            autoFocus
            required
            className="w-full p-3 rounded-xl bg-slate-950/80 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400 resize-none font-serif leading-relaxed"
          />
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="date"
                value={newDate}
                onChange={e => setNewDate(e.target.value)}
                className="bg-transparent text-xs text-slate-300 focus:outline-none"
              />
            </div>
            <div className="flex gap-2">
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
                Save into Jar
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Memory Cards Collection */}
      <div className="flex-1 overflow-y-auto pt-6 pr-1">
        <h2 className="text-xs uppercase tracking-widest text-slate-400 mb-4 font-sans font-semibold">
          The Memory Jar ({memories.length})
        </h2>

        {memories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center text-slate-400">
            <p className="text-sm font-serif italic text-slate-300">
              The jar is empty right now.
            </p>
            <p className="text-xs text-slate-500 mt-1 max-w-xs">
              When an ordinary moment makes you smile or feel something real, save a few words here so it doesn't get lost.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {memories.map(m => (
              <GlassPanel
                key={m.id}
                intensity="subtle"
                className="p-5 rounded-2xl border border-white/10 flex flex-col justify-between group hover:border-amber-400/30 transition-all"
              >
                <p className="text-sm font-serif text-slate-100 leading-relaxed italic mb-4">
                  "{m.text}"
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[11px] text-slate-400">
                  <span className="font-mono">{m.date}</span>
                  <button
                    onClick={() => {
                      sounds.playClick()
                      onDeleteMemory(m.id)
                    }}
                    className="p-1 rounded text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove memory"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
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
