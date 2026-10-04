import { useState, useEffect, useMemo, useRef } from 'react'
import {
  Plus,
  Search,
  Trash2,
  Pin,
  Bold,
  Italic,
  Heading2,
  List,
  CheckSquare,
  Square,
  Quote,
  FileText,
  ChevronLeft,
  X
} from 'lucide-react'
import { NoteItem } from '@/types'
import { storageService, INITIAL_NOTES } from '@/services/storage'
import { sounds } from '@/utils/sound'
import { formatRelativeDate } from '@/utils/date'
import AppHeader from '@/components/AppWindow/AppHeader'
import EmptyState from '@/components/LiquidGlass/EmptyState'

interface NotesAppProps {
  initialNoteId?: string
}

const COLOR_OPTIONS = [
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Rose', value: '#f43f5e' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Sky', value: '#0ea5e9' }
]

export default function NotesApp({ initialNoteId }: NotesAppProps) {
  const [notes, setNotes] = useState<NoteItem[]>([])
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(initialNoteId || null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSavedNotice, setIsSavedNotice] = useState(false)
  const [activeTag, setActiveTag] = useState<string>('all')
  const [newChecklistText, setNewChecklistText] = useState('')
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const editorTextareaRef = useRef<HTMLTextAreaElement>(null)
  const checklistInputRef = useRef<HTMLInputElement>(null)

  // Load notes on mount
  useEffect(() => {
    storageService.get<NoteItem[]>('notes', INITIAL_NOTES).then(loaded => {
      setNotes(loaded)
      if (initialNoteId && loaded.some(n => n.id === initialNoteId)) {
        setSelectedNoteId(initialNoteId)
      } else if (loaded.length > 0 && !selectedNoteId && window.innerWidth >= 768) {
        setSelectedNoteId(loaded[0].id)
      }
    })
  }, [initialNoteId])

  // Save notes to storage whenever notes change
  const saveNotesToStorage = (updatedNotes: NoteItem[]) => {
    setNotes(updatedNotes)
    storageService.set('notes', updatedNotes)
    setIsSavedNotice(true)
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    saveTimeoutRef.current = setTimeout(() => {
      setIsSavedNotice(false)
    }, 1200)
  }

  const selectedNote = useMemo(() => {
    return notes.find(n => n.id === selectedNoteId) || null
  }, [notes, selectedNoteId])

  // Extract all tags (cleaned without '#')
  const allTags = useMemo(() => {
    const set = new Set<string>()
    notes.forEach(n => {
      ;(n.tags || []).forEach(t => {
        const clean = t.replace(/^#/, '').trim()
        if (clean) set.add(clean)
      })
    })
    return Array.from(set)
  }, [notes])

  const filteredNotes = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    let list = notes
    if (activeTag !== 'all') {
      list = list.filter(n =>
        (n.tags || []).some(t => t.replace(/^#/, '').toLowerCase() === activeTag.toLowerCase())
      )
    }
    if (q) {
      list = list.filter(
        n =>
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q) ||
          (n.tags || []).some(t => t.toLowerCase().includes(q))
      )
    }
    // Sort pinned to top, then recent updated
    return [...list].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1
      if (!a.isPinned && b.isPinned) return 1
      return b.updatedAt - a.updatedAt
    })
  }, [notes, searchQuery, activeTag])

  const createNewNote = () => {
    sounds.playClick()
    const newNote: NoteItem = {
      id: 'note-' + Date.now(),
      title: 'Untitled Note',
      content: '',
      color: COLOR_OPTIONS[Math.floor(Math.random() * COLOR_OPTIONS.length)].value,
      isPinned: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      tags: ['Personal']
    }
    const updated = [newNote, ...notes]
    saveNotesToStorage(updated)
    setSelectedNoteId(newNote.id)
    setTimeout(() => editorTextareaRef.current?.focus(), 50)
  }

  const deleteCurrentNote = () => {
    if (!selectedNoteId) return
    sounds.playClick()
    const updated = notes.filter(n => n.id !== selectedNoteId)
    saveNotesToStorage(updated)
    if (window.innerWidth < 768) {
      setSelectedNoteId(null)
    } else {
      setSelectedNoteId(updated.length > 0 ? updated[0].id : null)
    }
  }

  const togglePin = () => {
    if (!selectedNoteId) return
    sounds.playClick()
    const updated = notes.map(n => {
      if (n.id === selectedNoteId) {
        return { ...n, isPinned: !n.isPinned, updatedAt: Date.now() }
      }
      return n
    })
    saveNotesToStorage(updated)
  }

  const updateTitle = (title: string) => {
    if (!selectedNoteId) return
    const updated = notes.map(n =>
      n.id === selectedNoteId ? { ...n, title, updatedAt: Date.now() } : n
    )
    saveNotesToStorage(updated)
  }

  const updateContent = (content: string) => {
    if (!selectedNoteId) return
    const updated = notes.map(n =>
      n.id === selectedNoteId ? { ...n, content, updatedAt: Date.now() } : n
    )
    saveNotesToStorage(updated)
  }

  // Formatting helpers
  const applyFormat = (prefix: string, suffix = '') => {
    if (!editorTextareaRef.current || !selectedNote) return
    sounds.playClick()
    const el = editorTextareaRef.current
    const start = el.selectionStart
    const end = el.selectionEnd
    const current = selectedNote.content
    const selected = current.substring(start, end)
    const replacement = `${prefix}${selected || 'text'}${suffix}`
    const updated = current.substring(0, start) + replacement + current.substring(end)
    updateContent(updated)
    setTimeout(() => {
      el.focus()
      el.setSelectionRange(start + prefix.length, start + prefix.length + (selected.length || 4))
    }, 20)
  }

  // Parse markdown checklist items from note content
  const checklistItems = useMemo(() => {
    if (!selectedNote) return []
    const lines = selectedNote.content.split('\n')
    const items: Array<{ lineIndex: number; completed: boolean; text: string }> = []
    lines.forEach((line, idx) => {
      const match = line.match(/^\s*-\s*\[([ xX])\]\s*(.*)$/)
      if (match) {
        items.push({
          lineIndex: idx,
          completed: match[1].toLowerCase() === 'x',
          text: match[2]
        })
      }
    })
    return items
  }, [selectedNote])

  // Checklist actions
  const toggleChecklistItem = (lineIndex: number) => {
    if (!selectedNote) return
    sounds.playClick()
    const lines = selectedNote.content.split('\n')
    const current = lines[lineIndex]
    if (typeof current !== 'string') return

    if (/^\s*-\s*\[[xX]\]/.test(current)) {
      lines[lineIndex] = current.replace(/^\s*-\s*\[[xX]\]/, '- [ ]')
    } else {
      sounds.playSuccess()
      lines[lineIndex] = current.replace(/^\s*-\s*\[\s*\]/, '- [x]')
    }
    updateContent(lines.join('\n'))
  }

  const updateChecklistItemText = (lineIndex: number, newText: string) => {
    if (!selectedNote) return
    const lines = selectedNote.content.split('\n')
    const current = lines[lineIndex]
    if (typeof current !== 'string') return
    const isCompleted = /^\s*-\s*\[[xX]\]/.test(current)
    lines[lineIndex] = `${isCompleted ? '- [x]' : '- [ ]'} ${newText}`
    updateContent(lines.join('\n'))
  }

  const deleteChecklistItem = (lineIndex: number) => {
    if (!selectedNote) return
    sounds.playClick()
    const lines = selectedNote.content.split('\n')
    lines.splice(lineIndex, 1)
    updateContent(lines.join('\n'))
  }

  const handleAddChecklistItem = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!selectedNote) return
    const textToAdd = newChecklistText.trim()
    sounds.playClick()
    const current = selectedNote.content
    const prefix = current.length > 0 && !current.endsWith('\n') ? '\n' : ''
    const newLine = `- [ ] ${textToAdd}`
    updateContent(current + prefix + newLine + '\n')
    setNewChecklistText('')
    setTimeout(() => checklistInputRef.current?.focus(), 50)
  }

  const handleToolbarChecklistClick = () => {
    if (!selectedNote) return
    sounds.playClick()
    const el = editorTextareaRef.current
    if (el) {
      const start = el.selectionStart
      const end = el.selectionEnd
      const selected = selectedNote.content.substring(start, end).trim()
      if (selected) {
        // Convert selected lines into checklist items
        const converted = selected
          .split('\n')
          .map(line => (/^\s*-\s*\[/.test(line) ? line : `- [ ] ${line.replace(/^[-*]\s*/, '')}`))
          .join('\n')
        const updated = selectedNote.content.substring(0, start) + converted + selectedNote.content.substring(end)
        updateContent(updated)
        return
      }
    }
    // No selection: focus checklist input or add an empty item
    checklistInputRef.current?.focus()
    if (!checklistInputRef.current) {
      handleAddChecklistItem()
    }
  }

  // Word count and char count stats
  const stats = useMemo(() => {
    if (!selectedNote) return { words: 0, chars: 0 }
    const text = selectedNote.content.trim()
    const words = text ? text.split(/\s+/).length : 0
    return { words, chars: text.length }
  }, [selectedNote])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault()
        createNewNote()
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [notes])

  return (
    <div className="flex h-full w-full bg-slate-950/90 text-white flex-col overflow-hidden select-none">
      {/* Standardized App Header — No Subtitle for a Cleaner Aesthetic */}
      <AppHeader
        icon={FileText}
        title="Notes"
        gradient="from-amber-400 to-yellow-600"
      >
        <div className="flex items-center justify-between gap-3 overflow-x-auto no-scrollbar py-0.5">
          {/* Dedicated Compact + New Note Action Button */}
          <button
            onClick={createNewNote}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition shrink-0 active:scale-95"
            title="Create new note"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <FileText className="w-3.5 h-3.5" />
            <span>New Note</span>
          </button>

          {/* Categories / Labels Filter Without Visible '#' Prefix */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <button
              onClick={() => setActiveTag('all')}
              className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition shrink-0 ${
                activeTag === 'all'
                  ? 'bg-amber-500/25 text-amber-300 border border-amber-500/40 shadow-xs'
                  : 'text-slate-400 hover:text-white bg-white/5 border border-white/5'
              }`}
            >
              All
            </button>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition shrink-0 ${
                  activeTag === tag
                    ? 'bg-amber-500/25 text-amber-300 border border-amber-500/40 shadow-xs'
                    : 'text-slate-400 hover:text-white bg-white/5 border border-white/5'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </AppHeader>

      {/* Main Workspace: 2-column on desktop, single view toggle on mobile */}
      <div className="flex-1 flex overflow-hidden divide-x divide-white/10">
        {/* Notes Sidebar List */}
        <aside
          className={`w-full md:w-80 flex flex-col bg-black/20 shrink-0 overflow-hidden ${
            selectedNoteId ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Search Bar */}
          <div className="p-3 border-b border-white/10">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search notes (⌘F)..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-sans"
              />
            </div>
          </div>

          {/* Notes Scroller */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
            {filteredNotes.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs px-4">
                No matching notes found
              </div>
            ) : (
              filteredNotes.map(n => {
                const isSelected = n.id === selectedNoteId
                const previewSnippet =
                  n.content
                    .trim()
                    .split('\n')[0]
                    ?.replace(/^-\s*\[ \]\s*/, '☐ ')
                    ?.replace(/^-\s*\[x\]\s*/i, '☑ ') || 'No additional text'

                const cleanTag = n.tags?.[0]?.replace(/^#/, '')

                return (
                  <div
                    key={n.id}
                    onClick={() => {
                      sounds.playClick()
                      setSelectedNoteId(n.id)
                    }}
                    className={`p-3 rounded-2xl cursor-pointer transition text-left relative group border ${
                      isSelected
                        ? 'bg-white/[0.08] border-amber-400/40 shadow-sm'
                        : 'bg-white/[0.02] hover:bg-white/[0.05] border-white/5'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-semibold text-white truncate flex-1">
                        {n.title || 'Untitled Note'}
                      </h4>
                      {n.isPinned && (
                        <Pin className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />
                      )}
                    </div>

                    <p className="text-[11px] text-slate-400 line-clamp-1 mt-1 font-sans">
                      {previewSnippet}
                    </p>

                    <div className="flex items-center justify-between mt-2 text-[10px] text-slate-500">
                      <span>{formatRelativeDate(n.updatedAt)}</span>
                      {cleanTag && (
                        <span className="px-1.5 py-0.5 rounded-md bg-white/5 text-slate-300 font-medium">
                          {cleanTag}
                        </span>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </aside>

        {/* Notes Writing Editor */}
        <main
          className={`flex-1 flex flex-col bg-slate-950/40 overflow-hidden ${
            selectedNoteId ? 'flex' : 'hidden md:flex'
          }`}
        >
          {selectedNote ? (
            <>
              {/* Editor Top Bar: Formatting Controls + Checklist Button */}
              <div className="px-3 sm:px-5 py-2 border-b border-white/10 flex items-center justify-between bg-black/20 text-xs gap-2">
                {/* Back to Notes Button (Mobile only) */}
                <button
                  onClick={() => setSelectedNoteId(null)}
                  className="md:hidden flex items-center gap-1 text-amber-400 hover:text-amber-300 font-semibold text-xs px-2.5 py-1 rounded-lg bg-amber-400/10 shrink-0"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Notes</span>
                </button>

                {/* Formatting Tools with Accessible Checklist Button */}
                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                  <button
                    onClick={() => applyFormat('**', '**')}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition shrink-0"
                    title="Bold"
                  >
                    <Bold className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => applyFormat('*', '*')}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition shrink-0"
                    title="Italic"
                  >
                    <Italic className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => applyFormat('### ')}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition shrink-0"
                    title="Heading"
                  >
                    <Heading2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => applyFormat('- ')}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition shrink-0"
                    title="Bullet List"
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                  {/* Dedicated Accessible Checklist Button */}
                  <button
                    onClick={handleToolbarChecklistClick}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg text-amber-300 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 transition shrink-0 font-medium"
                    title="Add or convert to checklist"
                  >
                    <CheckSquare className="w-3.5 h-3.5" />
                    <span>Checklist</span>
                  </button>
                  <button
                    onClick={() => applyFormat('> ')}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition shrink-0"
                    title="Quote"
                  >
                    <Quote className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Right State: Pin, Delete, Saved Indicator */}
                <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-auto">
                  <span className="text-[11px] text-slate-500 hidden sm:inline">
                    {stats.words} words • {stats.chars} chars
                  </span>

                  {isSavedNotice ? (
                    <span className="text-[11px] font-medium text-emerald-400/90 animate-pulse">
                      Saved
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-500 hidden sm:inline">Autosaved</span>
                  )}

                  <button
                    onClick={togglePin}
                    className={`p-1.5 rounded-lg transition ${
                      selectedNote.isPinned
                        ? 'text-amber-400 bg-amber-400/10'
                        : 'text-slate-400 hover:text-white hover:bg-white/10'
                    }`}
                    title={selectedNote.isPinned ? 'Unpin' : 'Pin to top'}
                  >
                    <Pin className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={deleteCurrentNote}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                    title="Delete Note"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Title & Editor Surface — Spacious and Comfortable */}
              <div className="flex-1 flex flex-col p-5 sm:p-8 md:p-10 overflow-y-auto max-w-4xl mx-auto w-full">
                {/* Note Title Input */}
                <input
                  type="text"
                  placeholder="Note title..."
                  value={selectedNote.title}
                  onChange={e => updateTitle(e.target.value)}
                  className="bg-transparent border-none text-2xl sm:text-3xl font-bold text-white placeholder-slate-600 focus:outline-none mb-4 sm:mb-6 font-sans tracking-tight"
                />

                {/* Interactive Checklist Items Section */}
                <div className="space-y-2 mb-6">
                  {checklistItems.map(item => (
                    <div
                      key={item.lineIndex}
                      className="flex items-center gap-2.5 p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 group transition"
                    >
                      {/* Checkbox item */}
                      <button
                        type="button"
                        onClick={() => toggleChecklistItem(item.lineIndex)}
                        className={`p-1 rounded-lg transition shrink-0 ${
                          item.completed
                            ? 'text-emerald-400 hover:text-emerald-300'
                            : 'text-slate-400 hover:text-amber-300'
                        }`}
                        title={item.completed ? 'Uncheck item' : 'Check item'}
                      >
                        {item.completed ? (
                          <CheckSquare className="w-4 h-4 fill-emerald-500/20" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>

                      {/* In-place Editable Item Text */}
                      <input
                        type="text"
                        value={item.text}
                        onChange={e => updateChecklistItemText(item.lineIndex, e.target.value)}
                        placeholder="Checklist task..."
                        className={`flex-1 bg-transparent border-none focus:outline-none text-sm sm:text-base font-sans transition ${
                          item.completed
                            ? 'line-through text-slate-500'
                            : 'text-slate-100'
                        }`}
                      />

                      {/* Delete Checklist Item Button */}
                      <button
                        type="button"
                        onClick={() => deleteChecklistItem(item.lineIndex)}
                        className="p-1 rounded-lg text-slate-500 hover:text-rose-400 opacity-60 group-hover:opacity-100 transition"
                        title="Delete item"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}

                  {/* Add New Checklist Item Quick Form */}
                  <form
                    onSubmit={handleAddChecklistItem}
                    className="flex items-center gap-2 p-1.5 rounded-xl bg-white/[0.02] border border-dashed border-white/15 focus-within:border-amber-400/50 focus-within:bg-white/[0.05] transition"
                  >
                    <div className="p-1 text-slate-500">
                      <Plus className="w-4 h-4" />
                    </div>
                    <input
                      ref={checklistInputRef}
                      type="text"
                      placeholder="Add checklist item (hit Enter)..."
                      value={newChecklistText}
                      onChange={e => setNewChecklistText(e.target.value)}
                      className="flex-1 bg-transparent border-none text-sm sm:text-base text-white placeholder-slate-500 focus:outline-none font-sans"
                    />
                    <button
                      type="submit"
                      disabled={!newChecklistText.trim()}
                      className="px-3 py-1 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 disabled:opacity-30 disabled:pointer-events-none text-xs font-semibold transition"
                    >
                      Add
                    </button>
                  </form>
                </div>

                {/* Primary Writing Area — Large Comfortable Typography */}
                <textarea
                  ref={editorTextareaRef}
                  placeholder="Start writing... Markdown supported."
                  value={selectedNote.content}
                  onChange={e => updateContent(e.target.value)}
                  className="flex-1 min-h-[300px] w-full bg-transparent border-none text-slate-200 placeholder-slate-600 focus:outline-none resize-none leading-relaxed font-sans text-base sm:text-lg"
                />
              </div>
            </>
          ) : (
            <EmptyState
              icon={FileText}
              title="No Note Selected"
              description="Select an existing note from the list or create a new one to begin writing."
              action={{
                label: 'Create Note',
                icon: Plus,
                onClick: createNewNote
              }}
            />
          )}
        </main>
      </div>
    </div>
  )
}
