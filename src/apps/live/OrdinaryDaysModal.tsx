import { useState } from 'react'
import { X, Calendar, Check } from 'lucide-react'
import { LiveMemory } from '@/types'
import { liveRepository } from '@/services/live'
import { sounds } from '@/utils/sound'
import { toLocalYYYYMMDD } from '@/utils/date'

interface OrdinaryDaysModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (memory: LiveMemory) => void
}

export default function OrdinaryDaysModal({ isOpen, onClose, onSave }: OrdinaryDaysModalProps) {
  const [date, setDate] = useState(toLocalYYYYMMDD())
  const [wokeUp, setWokeUp] = useState('')
  const [spokeTo, setSpokeTo] = useState('')
  const [ate, setAte] = useState('')
  const [thinkingAbout, setThinkingAbout] = useState('')
  const [laughedAt, setLaughedAt] = useState('')
  const [eveningLookedLike, setEveningLookedLike] = useState('')

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Build human narrative of the ordinary day
    const parts: string[] = []
    if (wokeUp.trim()) parts.push(`Woke up: ${wokeUp.trim()}`)
    if (spokeTo.trim()) parts.push(`Spoke with: ${spokeTo.trim()}`)
    if (ate.trim()) parts.push(`Ate: ${ate.trim()}`)
    if (thinkingAbout.trim()) parts.push(`Thinking about: ${thinkingAbout.trim()}`)
    if (laughedAt.trim()) parts.push(`Laughed at: ${laughedAt.trim()}`)
    if (eveningLookedLike.trim()) parts.push(`Evening: ${eveningLookedLike.trim()}`)

    if (parts.length === 0) return

    sounds.playSuccess()
    const memory: LiveMemory = {
      id: `mem-ord-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      text: parts.join(' • '),
      date,
      isOrdinaryDay: true,
      ordinaryDayAnswers: {
        wokeUp,
        spokeTo,
        ate,
        thinkingAbout,
        laughedAt,
        eveningLookedLike
      },
      createdAt: Date.now()
    }

    await liveRepository.saveMemory(memory)
    onSave(memory)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/85 backdrop-blur-2xl animate-in fade-in select-text">
      <div className="w-full max-w-xl max-h-[85vh] flex flex-col bg-slate-900/95 border border-white/15 rounded-3xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-widest font-bold text-amber-400 block mb-0.5">
              Ordinary Days
            </span>
            <h2 className="text-xl font-serif text-white">
              Keep an Ordinary Day
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="px-5 pt-3 text-xs text-slate-400 leading-relaxed">
          Most memory apps preserve birthdays and trips. But most of life consists of ordinary Tuesdays. Answer any or none of these questions.
        </p>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-3.5">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-amber-400" />
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="bg-transparent text-xs text-slate-200 focus:outline-none font-mono"
            />
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wider text-slate-300 font-semibold mb-1">
              Where did you wake up?
            </label>
            <input
              type="text"
              value={wokeUp}
              onChange={e => setWokeUp(e.target.value)}
              placeholder="e.g. In my own bed, sunlight hitting the curtains early..."
              className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400"
            />
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wider text-slate-300 font-semibold mb-1">
              Who did you speak to today?
            </label>
            <input
              type="text"
              value={spokeTo}
              onChange={e => setSpokeTo(e.target.value)}
              placeholder="e.g. My mother on the phone, the baker downstairs..."
              className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400"
            />
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wider text-slate-300 font-semibold mb-1">
              What did you eat?
            </label>
            <input
              type="text"
              value={ate}
              onChange={e => setAte(e.target.value)}
              placeholder="e.g. Black tea and toasted bread, soup in the evening..."
              className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400"
            />
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wider text-slate-300 font-semibold mb-1">
              What made you smile or laugh?
            </label>
            <input
              type="text"
              value={laughedAt}
              onChange={e => setLaughedAt(e.target.value)}
              placeholder="e.g. A silly comment from a colleague, a dog chasing a pigeon..."
              className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400"
            />
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wider text-slate-300 font-semibold mb-1">
              What were you thinking about?
            </label>
            <input
              type="text"
              value={thinkingAbout}
              onChange={e => setThinkingAbout(e.target.value)}
              placeholder="e.g. Whether to plant mint on the balcony, how fast this month went..."
              className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400"
            />
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wider text-slate-300 font-semibold mb-1">
              What did the evening look like?
            </label>
            <input
              type="text"
              value={eveningLookedLike}
              onChange={e => setEveningLookedLike(e.target.value)}
              placeholder="e.g. Quiet rain, lamps on, reading in the corner."
              className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400"
            />
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-semibold shadow"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Keep this day</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
