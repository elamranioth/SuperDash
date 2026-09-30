import { useState } from 'react'
import { ArrowLeft, User, Plus, Trash2, Heart, MessageCircle } from 'lucide-react'
import { LivePerson } from '@/types'
import { liveRepository } from '@/services/live'
import { sounds } from '@/utils/sound'
import GlassPanel from '@/components/LiquidGlass/GlassPanel'

interface PeopleViewProps {
  people: LivePerson[]
  onBack: () => void
  onSavePerson: (person: LivePerson) => void
  onDeletePerson: (id: string) => void
}

export default function PeopleView({
  people,
  onBack,
  onSavePerson,
  onDeletePerson
}: PeopleViewProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [name, setName] = useState('')
  const [relationship, setRelationship] = useState('')
  const [note, setNote] = useState('')
  const [lastMoment, setLastMoment] = useState('')

  const handleAddPerson = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    sounds.playSuccess()
    const person: LivePerson = {
      id: `per-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: name.trim(),
      relationship: relationship.trim() || undefined,
      note: note.trim() || undefined,
      lastMeaningfulMoment: lastMoment.trim() || undefined,
      createdAt: Date.now()
    }
    await liveRepository.savePerson(person)
    onSavePerson(person)
    setName('')
    setRelationship('')
    setNote('')
    setLastMoment('')
    setIsAdding(false)
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
          <span>Add someone who matters</span>
        </button>
      </div>

      {/* Gentle Header Note */}
      <div className="pt-4 pb-2">
        <h2 className="text-xl font-serif text-white mb-1">
          People who matter
        </h2>
        <p className="text-xs text-slate-400">
          Not a contacts list. Just people who make being alive feel meaningful.
        </p>
      </div>

      {/* Add Form */}
      {isAdding && (
        <form onSubmit={handleAddPerson} className="my-4 p-5 rounded-2xl bg-slate-900/80 border border-white/15 space-y-3 animate-in fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-slate-300 font-semibold mb-1">
                Name <span className="text-amber-400">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Mother, Sarah, Ahmed"
                required
                className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400"
              />
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-slate-300 font-semibold mb-1">
                Relationship or Context
              </label>
              <input
                type="text"
                value={relationship}
                onChange={e => setRelationship(e.target.value)}
                placeholder="e.g. Sister, Friend from university, Mentor"
                className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wider text-slate-300 font-semibold mb-1">
              What do you love or remember about them?
            </label>
            <input
              type="text"
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="e.g. Her boundless patience, the way he always calls on rainy days..."
              className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400"
            />
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wider text-slate-300 font-semibold mb-1">
              A recent moment with them
            </label>
            <input
              type="text"
              value={lastMoment}
              onChange={e => setLastMoment(e.target.value)}
              placeholder="e.g. We had tea last Friday and laughed about our old road trip."
              className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
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
              Save Person
            </button>
          </div>
        </form>
      )}

      {/* People Grid */}
      <div className="flex-1 overflow-y-auto pt-4 pr-1">
        {people.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center text-slate-400">
            <Heart className="w-10 h-10 opacity-20 text-rose-400 mb-2" />
            <p className="text-sm font-serif italic text-slate-300">
              No one added yet.
            </p>
            <p className="text-xs text-slate-500 mt-1 max-w-xs">
              Add someone you love or value so you can occasionally be reminded of them.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {people.map(person => (
              <GlassPanel
                key={person.id}
                intensity="subtle"
                className="p-5 rounded-2xl border border-white/10 hover:border-amber-400/30 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="text-base font-semibold text-white">
                        {person.name}
                      </h3>
                      {person.relationship && (
                        <span className="text-[11px] text-amber-300 font-sans">
                          {person.relationship}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        sounds.playClick()
                        onDeletePerson(person.id)
                      }}
                      className="p-1 rounded text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {person.note && (
                    <p className="text-xs text-slate-300 leading-relaxed mb-3">
                      {person.note}
                    </p>
                  )}

                  {person.lastMeaningfulMoment && (
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-[11px] text-slate-400 italic mb-2">
                      "{person.lastMeaningfulMoment}"
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-amber-300/80">
                  <span className="flex items-center gap-1.5">
                    <MessageCircle className="w-3 h-3 text-amber-400" />
                    <span>Maybe today is a good day to say hello.</span>
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
