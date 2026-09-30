import { useState } from 'react'
import { ArrowLeft, Compass, Plus, Trash2, MapPin, Check } from 'lucide-react'
import { LivePlace } from '@/types'
import { liveRepository } from '@/services/live'
import { sounds } from '@/utils/sound'
import GlassPanel from '@/components/LiquidGlass/GlassPanel'

interface SomewhereViewProps {
  places: LivePlace[]
  onBack: () => void
  onSavePlace: (place: LivePlace) => void
  onDeletePlace: (id: string) => void
}

export default function SomewhereView({
  places,
  onBack,
  onSavePlace,
  onDeletePlace
}: SomewhereViewProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [name, setName] = useState('')
  const [reason, setReason] = useState('')

  const handleAddPlace = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    sounds.playSuccess()
    const place: LivePlace = {
      id: `plc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: name.trim(),
      reason: reason.trim() || undefined,
      visited: false,
      createdAt: Date.now()
    }
    await liveRepository.savePlace(place)
    onSavePlace(place)
    setName('')
    setReason('')
    setIsAdding(false)
  }

  const handleToggleVisited = async (place: LivePlace) => {
    sounds.playClick()
    const updated = { ...place, visited: !place.visited }
    await liveRepository.savePlace(updated)
    onSavePlace(updated)
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-6 md:p-10 select-text">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Live Home</span>
        </button>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/30 text-xs font-medium transition-all active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add a place</span>
        </button>
      </div>

      {/* Gentle Header Note */}
      <div className="pt-4 pb-2">
        <h2 className="text-xl font-serif text-white mb-1">
          Somewhere to be
        </h2>
        <p className="text-xs text-slate-400">
          Places you want to experience someday. Not an itinerary or a booking list — just places waiting for you.
        </p>
      </div>

      {/* Add Form */}
      {isAdding && (
        <form onSubmit={handleAddPlace} className="my-4 p-5 rounded-2xl bg-slate-900/80 border border-white/15 space-y-3 animate-in fade-in">
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-slate-300 font-semibold mb-1">
              Where is it? <span className="text-amber-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. A bench overlooking the harbor, The bookshop café downtown, The mountain pass..."
              required
              className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400"
            />
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wider text-slate-300 font-semibold mb-1">
              Why do you want to be there?
            </label>
            <input
              type="text"
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="e.g. To sit quietly with a hot tea and watch the sunset..."
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
              Remember this place
            </button>
          </div>
        </form>
      )}

      {/* Places Grid */}
      <div className="flex-1 overflow-y-auto pt-4 pr-1">
        {places.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center text-slate-400">
            <Compass className="w-10 h-10 opacity-20 text-amber-400 mb-2" />
            <p className="text-sm font-serif italic text-slate-300">
              No places recorded yet.
            </p>
            <p className="text-xs text-slate-500 mt-1 max-w-xs">
              Think of a corner, a street, a trail, or a coast you want to stand on. It can be five hundred meters away.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {places.map(place => (
              <GlassPanel
                key={place.id}
                intensity="subtle"
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between group ${
                  place.visited
                    ? 'border-emerald-500/20 bg-emerald-950/10'
                    : 'border-white/10 hover:border-amber-400/30'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-start gap-2">
                      <MapPin className={`w-4 h-4 mt-0.5 flex-shrink-0 ${place.visited ? 'text-emerald-400' : 'text-amber-400'}`} />
                      <h3 className="text-base font-semibold text-white">
                        {place.name}
                      </h3>
                    </div>

                    <button
                      onClick={() => {
                        sounds.playClick()
                        onDeletePlace(place.id)
                      }}
                      className="p-1 rounded text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {place.reason && (
                    <p className="text-xs text-slate-300 leading-relaxed pl-6 mb-3 italic font-serif">
                      "{place.reason}"
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
                  <button
                    onClick={() => handleToggleVisited(place)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] transition-colors ${
                      place.visited
                        ? 'bg-emerald-500/20 text-emerald-300 font-medium'
                        : 'bg-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    {place.visited && <Check className="w-3 h-3 text-emerald-400" />}
                    <span>{place.visited ? 'Been here' : 'Haven’t been yet'}</span>
                  </button>

                  <span className="text-[10px] text-slate-500">
                    Added to heart
                  </span>
                </div>
              </GlassPanel>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
