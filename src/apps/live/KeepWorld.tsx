import { useState } from 'react'
import {
  Sparkles,
  Heart,
  Mail,
  Compass,
  Plus,
  Calendar,
  Trash2,
  X,
  MessageCircle
} from 'lucide-react'
import { LiveMemory, LivePerson } from '@/types'
import { liveRepository } from '@/services/live'
import { sounds } from '@/utils/sound'
import { toLocalYYYYMMDD } from '@/utils/date'
import GlassPanel from '@/components/LiquidGlass/GlassPanel'
import OrdinaryDaysModal from './OrdinaryDaysModal'
import LettersModal from './LettersModal'
import SomedayModal from './SomedayModal'

type KeepTab = 'memories' | 'people' | 'letters' | 'someday'

interface KeepWorldProps {
  memories: LiveMemory[]
  people: LivePerson[]
  onSaveMemory: (m: LiveMemory) => void
  onDeleteMemory: (id: string) => void
  onSavePerson: (p: LivePerson) => void
  onDeletePerson: (id: string) => void
}

export default function KeepWorld({
  memories,
  people,
  onSaveMemory,
  onDeleteMemory,
  onSavePerson,
  onDeletePerson
}: KeepWorldProps) {
  const [activeTab, setActiveTab] = useState<KeepTab>('memories')

  // Modals
  const [ordinaryDaysOpen, setOrdinaryDaysOpen] = useState(false)
  const [lettersOpen, setLettersOpen] = useState(false)
  const [somedayOpen, setSomedayOpen] = useState(false)

  // Quick Memory State
  const [isAddingMemory, setIsAddingMemory] = useState(false)
  const [newMemoryText, setNewMemoryText] = useState('')
  const [newMemoryDate, setNewMemoryDate] = useState(toLocalYYYYMMDD())
  const [surfacedMemory, setSurfacedMemory] = useState<LiveMemory | null>(null)

  // People State
  const [isAddingPerson, setIsAddingPerson] = useState(false)
  const [personName, setPersonName] = useState('')
  const [personRelationship, setPersonRelationship] = useState('')
  const [personWhyTheyMatter, setPersonWhyTheyMatter] = useState('')
  const [personThingsToRemember, setPersonThingsToRemember] = useState('')
  const [personLastMoment, setPersonLastMoment] = useState('')

  // Quick Memory submission
  const handleAddMemory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMemoryText.trim()) return

    sounds.playSuccess()
    const memory: LiveMemory = {
      id: `mem-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      text: newMemoryText.trim(),
      date: newMemoryDate,
      createdAt: Date.now()
    }
    await liveRepository.saveMemory(memory)
    onSaveMemory(memory)
    setNewMemoryText('')
    setIsAddingMemory(false)
  }

  // Resurface a memory
  const handleSurfaceRandom = () => {
    sounds.playClick()
    if (memories.length === 0) return
    const random = memories[Math.floor(Math.random() * memories.length)]
    setSurfacedMemory(random)
  }

  // Add person submission
  const handleAddPerson = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!personName.trim()) return

    sounds.playSuccess()
    const person: LivePerson = {
      id: `per-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: personName.trim(),
      relationship: personRelationship.trim() || undefined,
      whyTheyMatter: personWhyTheyMatter.trim() || undefined,
      thingsToRemember: personThingsToRemember.trim() || undefined,
      lastMeaningfulMoment: personLastMoment.trim() || undefined,
      createdAt: Date.now()
    }
    await liveRepository.savePerson(person)
    onSavePerson(person)
    setPersonName('')
    setPersonRelationship('')
    setPersonWhyTheyMatter('')
    setPersonThingsToRemember('')
    setPersonLastMoment('')
    setIsAddingPerson(false)
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-6 md:p-10 select-text max-w-4xl mx-auto w-full">
      {/* Keep World Sub-Navigation */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10 gap-3 flex-wrap">
        <div>
          <span className="text-[10px] uppercase tracking-widest font-bold text-rose-400 block mb-0.5">
            World 2
          </span>
          <h2 className="text-xl font-serif text-white">
            Keep the small things
          </h2>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/10 text-xs">
          <button
            onClick={() => {
              sounds.playClick()
              setActiveTab('memories')
            }}
            className={`px-3 py-1.5 rounded-full transition-all ${
              activeTab === 'memories'
                ? 'bg-white/15 text-white font-medium shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Memory Jar
          </button>
          <button
            onClick={() => {
              sounds.playClick()
              setActiveTab('people')
            }}
            className={`px-3 py-1.5 rounded-full transition-all ${
              activeTab === 'people'
                ? 'bg-white/15 text-rose-300 font-medium shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            People
          </button>
          <button
            onClick={() => {
              sounds.playClick()
              setLettersOpen(true)
            }}
            className="px-3 py-1.5 rounded-full text-slate-400 hover:text-white transition-colors"
          >
            Letters
          </button>
          <button
            onClick={() => {
              sounds.playClick()
              setSomedayOpen(true)
            }}
            className="px-3 py-1.5 rounded-full text-slate-400 hover:text-white transition-colors"
          >
            Someday, Maybe
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto pt-6 space-y-6">
        {/* ================= MEMORIES TAB ================= */}
        {activeTab === 'memories' && (
          <div className="space-y-6">
            {/* Top Memory Actions: Quick Memory & Ordinary Days */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <p className="text-xs text-slate-400 font-serif italic">
                "Is there anything from today you don't want to lose?"
              </p>

              <div className="flex items-center gap-2">
                {memories.length > 0 && (
                  <button
                    onClick={handleSurfaceRandom}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-xs text-amber-300 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Remember this?</span>
                  </button>
                )}

                <button
                  onClick={() => setOrdinaryDaysOpen(true)}
                  className="px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-xs text-slate-300 border border-white/10 transition-colors font-serif"
                >
                  Keep an Ordinary Day
                </button>

                <button
                  onClick={() => setIsAddingMemory(!isAddingMemory)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/30 text-xs font-medium transition-all active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Preserve a moment</span>
                </button>
              </div>
            </div>

            {/* Surfaced Memory Banner */}
            {surfacedMemory && (
              <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-slate-100 flex items-start justify-between gap-4 animate-in fade-in">
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

            {/* Quick Memory Form */}
            {isAddingMemory && (
              <form onSubmit={handleAddMemory} className="p-5 rounded-2xl bg-white/5 border border-white/15 space-y-3 animate-in fade-in">
                <textarea
                  value={newMemoryText}
                  onChange={e => setNewMemoryText(e.target.value)}
                  placeholder="We sat outside drinking coffee. Nothing particularly important happened. It was a good evening..."
                  rows={3}
                  autoFocus
                  required
                  className="w-full p-3.5 rounded-xl bg-slate-950/80 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400 font-serif leading-relaxed resize-none"
                />
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="date"
                      value={newMemoryDate}
                      onChange={e => setNewMemoryDate(e.target.value)}
                      className="bg-transparent text-xs text-slate-300 focus:outline-none font-mono"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingMemory(false)}
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

            {/* Memories List */}
            {memories.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center text-slate-400">
                <p className="text-sm font-serif italic text-slate-300">
                  The jar is quiet right now.
                </p>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  Whenever an ordinary moment makes you smile or feel something real, save a sentence here.
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
                    <div>
                      {m.isOrdinaryDay && (
                        <span className="text-[10px] uppercase tracking-widest font-bold text-amber-400/90 block mb-1">
                          Ordinary Day
                        </span>
                      )}
                      <p className="text-sm font-serif text-slate-100 leading-relaxed italic mb-4">
                        "{m.text}"
                      </p>
                    </div>

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
        )}

        {/* ================= PEOPLE TAB ================= */}
        {activeTab === 'people' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <p className="text-xs text-slate-400 font-serif italic">
                People who matter to me. Not a contact list or CRM.
              </p>

              <button
                onClick={() => setIsAddingPerson(!isAddingPerson)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/30 text-xs font-medium transition-all active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add someone</span>
              </button>
            </div>

            {/* Add Person Form */}
            {isAddingPerson && (
              <form onSubmit={handleAddPerson} className="p-5 rounded-2xl bg-white/5 border border-white/15 space-y-3.5 animate-in fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-slate-300 font-semibold mb-1">
                      Name <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={personName}
                      onChange={e => setPersonName(e.target.value)}
                      placeholder="e.g. Mother, Sarah, Ahmed"
                      required
                      className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-rose-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-slate-300 font-semibold mb-1">
                      Relationship
                    </label>
                    <input
                      type="text"
                      value={personRelationship}
                      onChange={e => setPersonRelationship(e.target.value)}
                      placeholder="e.g. Family, Friend since childhood"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-rose-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-slate-300 font-semibold mb-1">
                    Why they matter to me
                  </label>
                  <input
                    type="text"
                    value={personWhyTheyMatter}
                    onChange={e => setPersonWhyTheyMatter(e.target.value)}
                    placeholder="e.g. Her unconditional warmth across every stage of my life..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-rose-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-slate-300 font-semibold mb-1">
                    Things I never want to forget about them
                  </label>
                  <input
                    type="text"
                    value={personThingsToRemember}
                    onChange={e => setPersonThingsToRemember(e.target.value)}
                    placeholder="e.g. The way she laughs when recounting old family stories..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-rose-400"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAddingPerson(false)}
                    className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white text-xs font-semibold shadow"
                  >
                    Save Person
                  </button>
                </div>
              </form>
            )}

            {/* People Cards */}
            {people.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center text-slate-400">
                <Heart className="w-10 h-10 opacity-20 text-rose-400 mb-2" />
                <p className="text-sm font-serif italic text-slate-300">
                  No one added yet.
                </p>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  Add someone who makes life feel warmer.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {people.map(person => (
                  <GlassPanel
                    key={person.id}
                    intensity="subtle"
                    className="p-5 rounded-2xl border border-white/10 hover:border-rose-400/30 transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className="text-base font-serif font-medium text-white">
                            {person.name}
                          </h3>
                          {person.relationship && (
                            <span className="text-[11px] text-rose-300 font-sans">
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

                      {person.whyTheyMatter && (
                        <p className="text-xs text-slate-300 leading-relaxed mb-3">
                          {person.whyTheyMatter}
                        </p>
                      )}

                      {person.thingsToRemember && (
                        <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-[11px] text-slate-400 italic mb-2">
                          "{person.thingsToRemember}"
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-rose-300/80">
                      <span className="flex items-center gap-1.5">
                        <MessageCircle className="w-3 h-3 text-rose-400" />
                        <span>Maybe today is a nice day to say hello.</span>
                      </span>
                    </div>
                  </GlassPanel>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals for KEEP world */}
      <OrdinaryDaysModal
        isOpen={ordinaryDaysOpen}
        onClose={() => setOrdinaryDaysOpen(false)}
        onSave={m => onSaveMemory(m)}
      />
      <LettersModal
        isOpen={lettersOpen}
        onClose={() => setLettersOpen(false)}
      />
      <SomedayModal
        isOpen={somedayOpen}
        onClose={() => setSomedayOpen(false)}
      />
    </div>
  )
}
