import { useState } from 'react'
import { X, Check } from 'lucide-react'
import { WellnessReminderConfig, DayOfWeek } from '@/types/wellness'
import { sounds } from '@/utils/sound'
import GlassPanel from '@/components/LiquidGlass/GlassPanel'

interface ReminderEditorModalProps {
  isOpen: boolean
  reminder: WellnessReminderConfig | null
  onClose: () => void
  onSave: (updated: Partial<WellnessReminderConfig>) => void
  onDelete?: (id: string) => void
}

const INTERVAL_CHOICES = [
  { label: '15 min', value: 15 },
  { label: '30 min', value: 30 },
  { label: '45 min', value: 45 },
  { label: '1 hour', value: 60 },
  { label: '1.5 hours', value: 90 },
  { label: '2 hours', value: 120 },
  { label: '2.5 hours', value: 150 },
  { label: '3 hours', value: 180 },
  { label: '4 hours', value: 240 }
]

const DAYS_OF_WEEK: { id: DayOfWeek; label: string }[] = [
  { id: 'mon', label: 'M' },
  { id: 'tue', label: 'T' },
  { id: 'wed', label: 'W' },
  { id: 'thu', label: 'T' },
  { id: 'fri', label: 'F' },
  { id: 'sat', label: 'S' },
  { id: 'sun', label: 'S' }
]

const EMOJI_OPTIONS = ['💧', '👀', '🚶', '🤸', '🫁', '🧘', '🪑', '☕', '🌤️', '🍎', '🍵', '🌿']

export default function ReminderEditorModal({
  isOpen,
  reminder,
  onClose,
  onSave,
  onDelete
}: ReminderEditorModalProps) {
  if (!isOpen || !reminder) return null

  const [name, setName] = useState(reminder.name)
  const [icon, setIcon] = useState(reminder.icon)
  const [description, setDescription] = useState(reminder.description)
  const [intervalMinutes, setIntervalMinutes] = useState(reminder.intervalMinutes || 60)
  const [customMinutesInput, setCustomMinutesInput] = useState('')
  const [customMessage, setCustomMessage] = useState(reminder.customMessage || '')
  const [enabled, setEnabled] = useState(reminder.enabled)

  const handleSave = () => {
    sounds.playSuccess()
    const finalInterval = customMinutesInput ? parseInt(customMinutesInput, 10) || intervalMinutes : intervalMinutes
    onSave({
      id: reminder.id,
      name,
      icon,
      description,
      intervalMinutes: finalInterval,
      customMessage: customMessage || undefined,
      enabled
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <GlassPanel intensity="heavy" className="p-5 sm:p-6 rounded-3xl border border-white/15 max-w-md w-full space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl relative">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{icon}</span>
            <h3 className="text-sm font-semibold text-white">
              {reminder.isCustom ? 'Custom Reminder' : `Edit ${reminder.name}`}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Name (editable if custom) */}
        {reminder.isCustom ? (
          <div className="space-y-1">
            <label className="text-[11px] text-slate-400">Reminder Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl bg-black/40 border border-white/15 text-white text-xs focus:outline-none focus:border-amber-400"
              placeholder="e.g. Coffee Break"
            />
          </div>
        ) : null}

        {/* Emoji Selector for custom */}
        {reminder.isCustom && (
          <div className="space-y-1">
            <label className="text-[11px] text-slate-400">Icon</label>
            <div className="flex flex-wrap gap-1.5">
              {EMOJI_OPTIONS.map(em => (
                <button
                  key={em}
                  type="button"
                  onClick={() => setIcon(em)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm transition border ${
                    icon === em ? 'bg-amber-500/20 border-amber-500/50' : 'bg-white/5 border-transparent hover:bg-white/10'
                  }`}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Description / Custom notification message */}
        <div className="space-y-1">
          <label className="text-[11px] text-slate-400">
            {reminder.isCustom ? 'Notification Message' : 'Description'}
          </label>
          <input
            type="text"
            value={reminder.isCustom ? customMessage : description}
            onChange={e => reminder.isCustom ? setCustomMessage(e.target.value) : setDescription(e.target.value)}
            className="w-full px-3 py-1.5 rounded-xl bg-black/40 border border-white/15 text-white text-xs focus:outline-none focus:border-amber-400"
            placeholder="Helpful nudge text..."
          />
        </div>

        {/* Frequency / Interval */}
        <div className="space-y-1.5">
          <label className="text-[11px] text-slate-400 block">Frequency</label>
          <div className="grid grid-cols-3 gap-1.5">
            {INTERVAL_CHOICES.map(c => (
              <button
                key={c.value}
                type="button"
                onClick={() => {
                  setIntervalMinutes(c.value)
                  setCustomMinutesInput('')
                }}
                className={`py-1.5 rounded-xl text-xs font-medium transition border ${
                  intervalMinutes === c.value && !customMinutesInput
                    ? 'bg-amber-500 text-slate-950 font-semibold border-amber-500'
                    : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 pt-1">
            <span className="text-[11px] text-slate-400">Custom min:</span>
            <input
              type="number"
              min={5}
              max={480}
              placeholder="e.g. 75"
              value={customMinutesInput}
              onChange={e => setCustomMinutesInput(e.target.value)}
              className="w-24 px-2 py-1 text-xs rounded-lg bg-black/40 border border-white/15 text-white focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        {/* Enabled Toggle */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
          <span className="text-xs text-white">Enable this trigger</span>
          <button
            type="button"
            onClick={() => setEnabled(!enabled)}
            className={`w-10 h-5.5 rounded-full transition-colors relative flex items-center p-0.5 ${
              enabled ? 'bg-amber-500' : 'bg-white/20'
            }`}
          >
            <div
              className={`w-4.5 h-4.5 rounded-full bg-white shadow-md transform transition-transform ${
                enabled ? 'translate-x-4.5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-3 border-t border-white/10">
          {reminder.isCustom && onDelete ? (
            <button
              type="button"
              onClick={() => {
                onDelete(reminder.id)
                onClose()
              }}
              className="text-xs text-rose-400 hover:text-rose-300 transition"
            >
              Delete
            </button>
          ) : <div />}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl bg-white/5 text-xs text-slate-400 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-medium text-xs transition flex items-center gap-1"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save</span>
            </button>
          </div>
        </div>
      </GlassPanel>
    </div>
  )
}
