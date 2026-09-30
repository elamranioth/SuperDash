import { useState } from 'react'
import { X, Sparkles, Compass, Scale, Brain, Heart, Bookmark, Folder, Palette } from 'lucide-react'
import { Collection, CollectionCoverType } from '@/types'
import { sounds } from '@/utils/sound'

interface CreateCollectionModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (data: Omit<Collection, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
}

const PRESET_GRADIENTS = [
  { label: 'Violet Dawn', value: 'from-violet-600 via-indigo-600 to-cyan-500', accent: '#8b5cf6' },
  { label: 'Emerald Sea', value: 'from-emerald-500 via-teal-600 to-sky-600', accent: '#10b981' },
  { label: 'Midnight Blue', value: 'from-blue-600 via-indigo-700 to-slate-800', accent: '#3b82f6' },
  { label: 'Sunset Amber', value: 'from-amber-500 via-rose-500 to-purple-600', accent: '#f59e0b' },
  { label: 'Rose Gold', value: 'from-rose-500 via-pink-600 to-amber-500', accent: '#f43f5e' },
  { label: 'Obsidian Slate', value: 'from-slate-800 via-zinc-900 to-black', accent: '#64748b' }
]

const PRESET_ICONS = [
  { id: 'Sparkles', icon: Sparkles, label: 'Sparkles' },
  { id: 'Brain', icon: Brain, label: 'Brain' },
  { id: 'Compass', icon: Compass, label: 'Compass' },
  { id: 'Scale', icon: Scale, label: 'Scale' },
  { id: 'Heart', icon: Heart, label: 'Heart' },
  { id: 'Bookmark', icon: Bookmark, label: 'Bookmark' },
  { id: 'Folder', icon: Folder, label: 'Folder' }
]

export default function CreateCollectionModal({
  isOpen,
  onClose,
  onCreate
}: CreateCollectionModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedGradient, setSelectedGradient] = useState(PRESET_GRADIENTS[0])
  const [selectedIcon, setSelectedIcon] = useState('Sparkles')
  const [coverType, setCoverType] = useState<CollectionCoverType>('gradient')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    try {
      setIsSubmitting(true)
      sounds.playSuccess()
      await onCreate({
        name: name.trim(),
        description: description.trim() || undefined,
        coverType,
        coverValue: coverType === 'gradient' ? selectedGradient.value : undefined,
        accent: selectedGradient.accent,
        icon: selectedIcon,
        viewMode: 'grid',
        favorite: false,
        archived: false,
        sections: []
      })
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
      <div className="liquid-glass-heavy border border-white/20 rounded-3xl p-6 w-full max-w-lg shadow-2xl animate-window-open">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-5">
          <div className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-xl bg-gradient-to-tr ${selectedGradient.value} flex items-center justify-center shadow`}
            >
              <Palette className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">New Collection</h2>
              <p className="text-[11px] text-slate-400">Gather things that belong together</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Collection Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder="e.g. Future of Artificial Intelligence, Places to Visit"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-400/60 focus:ring-1 focus:ring-indigo-400/30 transition"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Description <span className="text-slate-500 font-normal">(optional)</span>
            </label>
            <textarea
              rows={2}
              placeholder="Articles, predictions, and research about AI development..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-400/60 transition resize-none"
            />
          </div>

          {/* Cover Style / Gradient */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Visual Aura
            </label>
            <div className="grid grid-cols-6 gap-2">
              {PRESET_GRADIENTS.map((g, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setSelectedGradient(g)
                    setCoverType('gradient')
                  }}
                  className={`h-9 rounded-xl bg-gradient-to-tr ${g.value} border transition transform ${
                    selectedGradient.value === g.value
                      ? 'border-white scale-105 shadow-md shadow-black/40 ring-2 ring-white/40'
                      : 'border-white/10 hover:border-white/40 opacity-75 hover:opacity-100'
                  }`}
                  title={g.label}
                />
              ))}
            </div>
          </div>

          {/* Icon Choice */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Icon Symbol
            </label>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {PRESET_ICONS.map(item => {
                const IconComponent = item.icon
                const isSelected = selectedIcon === item.id
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedIcon(item.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs transition ${
                      isSelected
                        ? 'bg-white/20 border-white text-white shadow-sm'
                        : 'bg-black/20 border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    <IconComponent className="w-3.5 h-3.5" />
                    <span className="text-[11px]">{item.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-white/10 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || isSubmitting}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white shadow-md transition"
            >
              Create Collection
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
