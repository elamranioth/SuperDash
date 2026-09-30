import { useState, useEffect, useRef } from 'react'
import { FileText, ExternalLink, CheckCircle2 } from 'lucide-react'
import { storageService, INITIAL_NOTES } from '@/services/storage'
import { NoteItem } from '@/types'
import { sounds } from '@/utils/sound'

interface QuickNotesWidgetProps {
  onOpenNotes?: () => void
}

export default function QuickNotesWidget({ onOpenNotes }: QuickNotesWidgetProps) {
  const [content, setContent] = useState('')
  const [lastModified, setLastModified] = useState<number>(Date.now())
  const [savedBadge, setSavedBadge] = useState(false)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    storageService.get<NoteItem[]>('notes', INITIAL_NOTES).then(notes => {
      if (notes.length > 0) {
        setContent(notes[0].content)
        setLastModified(notes[0].updatedAt)
      }
    })
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value
    setContent(newText)
    const now = Date.now()
    setLastModified(now)

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    saveTimeoutRef.current = setTimeout(async () => {
      const notes = await storageService.get<NoteItem[]>('notes', INITIAL_NOTES)
      if (notes.length > 0) {
        const updated = notes.map((n, idx) =>
          idx === 0 ? { ...n, content: newText, updatedAt: now } : n
        )
        await storageService.set('notes', updated)
      } else {
        const newNote: NoteItem = {
          id: 'note-quick',
          title: 'Quick Scratchpad',
          content: newText,
          color: '#6366f1',
          isPinned: true,
          createdAt: now,
          updatedAt: now,
          tags: ['QuickNotes']
        }
        await storageService.set('notes', [newNote])
      }
      setSavedBadge(true)
      setTimeout(() => setSavedBadge(false), 1200)
    }, 600)
  }

  const timeString = new Date(lastModified).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit'
  })

  return (
    <div className="liquid-glass rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 flex flex-col justify-between shadow-xl w-full max-w-full h-full relative group">
      <div className="glass-specular" />

      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-white/10 relative z-10">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
          <FileText className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="truncate">Quick Note</span>
        </div>

        <div className="flex items-center gap-2">
          {savedBadge && (
            <span className="text-[10px] text-emerald-400 flex items-center gap-1 animate-pulse">
              <CheckCircle2 className="w-3 h-3" /> Saved
            </span>
          )}
          {onOpenNotes && (
            <button
              onClick={() => {
                sounds.playClick()
                onOpenNotes()
              }}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
              title="Open full Notes app"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Immediate text input */}
      <div className="relative z-10 flex-1 my-2">
        <textarea
          value={content}
          onChange={handleChange}
          placeholder="Jot down quick thoughts, ideas, or meeting notes..."
          className="w-full h-24 bg-transparent border-none resize-none text-xs leading-relaxed text-slate-200 placeholder-slate-500 focus:outline-none font-sans"
        />
      </div>

      {/* Footer */}
      <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400 relative z-10">
        <span>Modified {timeString}</span>
        <span className="text-slate-500">{content.trim().length} chars</span>
      </div>
    </div>
  )
}
