import React, { useState, useEffect, useMemo, useRef } from 'react'
import {
  FileText,
  CheckSquare,
  Plus,
  Trash2,
  Pin,
  Bold,
  Italic,
  Heading2,
  List,
  ListOrdered,
  Quote,
  Search,
  CheckCircle2,
  Circle,
  Calendar,
  ChevronDown,
  ChevronRight,
  Sun,
  Star,
  List as ListIcon,
  FolderPlus,
  Edit2,
  Check,
  X,
  Target,
  Sparkles,
  ArrowRight,
  Clock,
  ChevronLeft,
  FilePlus,
  Square
} from 'lucide-react'
import confetti from 'canvas-confetti'
import { NoteItem, TaskItem, TaskPriority, TaskList } from '@/types'
import {
  storageService,
  INITIAL_NOTES,
  INITIAL_TASKS,
  INITIAL_TASK_LISTS
} from '@/services/storage'
import { sounds } from '@/utils/sound'
import { formatRelativeDate, formatSmartDate, toLocalYYYYMMDD } from '@/utils/date'
import EmptyState from '@/components/LiquidGlass/EmptyState'

export type PlanTab = 'notes' | 'tasks'
export type TaskViewType = 'my-day' | 'important' | 'planned' | 'tasks' | string

interface PlanAppProps {
  initialTab?: PlanTab
  initialNoteId?: string
  initialFilter?: string
  createNewNote?: boolean
  onOpenApp?: (appId: string, customProps?: Record<string, unknown>) => void
}

const COLOR_OPTIONS = [
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Rose', value: '#f43f5e' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Sky', value: '#0ea5e9' }
]

/**
 * Convert legacy markdown syntax to clean HTML so users see visual formatting
 * instead of raw Markdown symbols (**text**, *text*, > quote).
 */
function markdownToHtml(md: string): string {
  if (!md) return ''
  if (/<(p|b|strong|i|em|blockquote|ul|ol|li|h[1-6]|div|span)[^>]*>/i.test(md)) {
    return md
  }
  let html = md
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.+?)__/g, '<strong>$1</strong>')
    .replace(/\*([^*]+?)\*/g, '<em>$1</em>')
    .replace(/_([^_]+?)_/g, '<em>$1</em>')
    .replace(/^###\s+(.*)$/gm, '<h3>$1</h3>')
    .replace(/^##\s+(.*)$/gm, '<h2>$1</h2>')
    .replace(/^>\s+(.*)$/gm, '<blockquote>$1</blockquote>')
    .replace(/^-\s+(?!\[[ xX]\])(.*)$/gm, '<ul><li>$1</li></ul>')
    .replace(/^(\d+)\.\s+(.*)$/gm, '<ol><li>$2</li></ol>')
    .replace(/\n\n/g, '<p></p>')
    .replace(/\n/g, '<br>')

  html = html.replace(/<\/ul>\s*<ul>/g, '')
  html = html.replace(/<\/ol>\s*<ol>/g, '')
  return html
}

export default function PlanApp({
  initialTab = 'notes',
  initialNoteId,
  initialFilter = 'my-day',
  createNewNote: shouldCreateNewNote = false
}: PlanAppProps) {
  // Primary Plan Tab: Notes vs Tasks
  const [activeTab, setActiveTab] = useState<PlanTab>(initialTab)

  // ==========================================
  // --- NOTES STATE ---
  // ==========================================
  const [notes, setNotes] = useState<NoteItem[]>([])
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(initialNoteId || null)
  const [noteSearchQuery, setNoteSearchQuery] = useState('')
  const [isNoteSavedNotice, setIsNoteSavedNotice] = useState(false)
  const [activeNoteTag, setActiveNoteTag] = useState<string>('all')
  const [newChecklistText, setNewChecklistText] = useState('')
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const noteSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const noteSearchInputRef = useRef<HTMLInputElement>(null)
  const richEditorRef = useRef<HTMLDivElement>(null)
  const checklistInputRef = useRef<HTMLInputElement>(null)

  // ==========================================
  // --- TASKS STATE ---
  // ==========================================
  const [tasks, setTasks] = useState<TaskItem[]>([])
  const [taskLists, setTaskLists] = useState<TaskList[]>([])
  const [activeTaskView, setActiveTaskView] = useState<TaskViewType>(initialFilter)
  const [taskSearchQuery, setTaskSearchQuery] = useState('')
  const [isTaskSidebarOpenMobile, setIsTaskSidebarOpenMobile] = useState(false)

  // Custom List creation/editing state
  const [isCreatingList, setIsCreatingList] = useState(false)
  const [newListName, setNewListName] = useState('')
  const [editingListId, setEditingListId] = useState<string | null>(null)
  const [editingListName, setEditingListName] = useState('')

  // Top Task Quick Add input
  const [quickTaskTitle, setQuickTaskTitle] = useState('')
  const [quickTaskPriority, setQuickTaskPriority] = useState<TaskPriority>('medium')
  const [quickTaskDueDate, setQuickTaskDueDate] = useState('')
  const quickTaskInputRef = useRef<HTMLInputElement>(null)

  // Side Focus Input state
  const [sideFocusText, setSideFocusText] = useState('')

  // Expanded task inspection
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null)
  const [showCompletedTasks, setShowCompletedTasks] = useState(false)

  const todayStr = toLocalYYYYMMDD()

  const showToast = (msg: string) => {
    setToastMessage(msg)
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current)
    toastTimeoutRef.current = setTimeout(() => setToastMessage(null), 2500)
  }

  // ==========================================
  // --- LOAD INITIAL DATA ---
  // ==========================================
  useEffect(() => {
    storageService.get<NoteItem[]>('notes', INITIAL_NOTES).then(loadedNotes => {
      setNotes(loadedNotes)
      if (initialNoteId && loadedNotes.some(n => n.id === initialNoteId)) {
        setSelectedNoteId(initialNoteId)
      } else if (loadedNotes.length > 0 && !selectedNoteId && window.innerWidth >= 768) {
        setSelectedNoteId(loadedNotes[0].id)
      }
    })

    storageService.get<TaskItem[]>('tasks', INITIAL_TASKS).then(setTasks)
    storageService.get<TaskList[]>('task_lists', INITIAL_TASK_LISTS).then(setTaskLists)
  }, [initialNoteId])

  useEffect(() => {
    if (shouldCreateNewNote) {
      handleCreateNewNote()
    }
  }, [shouldCreateNewNote])

  // ==========================================
  // --- NOTES PERSISTENCE & ACTIONS ---
  // ==========================================
  const saveNotes = (updated: NoteItem[]) => {
    setNotes(updated)
    storageService.set('notes', updated)
    setIsNoteSavedNotice(true)
    if (noteSaveTimeoutRef.current) clearTimeout(noteSaveTimeoutRef.current)
    noteSaveTimeoutRef.current = setTimeout(() => {
      setIsNoteSavedNotice(false)
    }, 1200)
  }

  const selectedNote = useMemo(() => {
    return notes.find(n => n.id === selectedNoteId) || null
  }, [notes, selectedNoteId])

  // Sync content into contentEditable whenever selectedNote changes
  useEffect(() => {
    if (richEditorRef.current && selectedNote) {
      const formatted = markdownToHtml(selectedNote.content)
      if (richEditorRef.current.innerHTML !== formatted) {
        richEditorRef.current.innerHTML = formatted
      }
    }
  }, [selectedNoteId])

  const allNoteTags = useMemo(() => {
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
    const q = noteSearchQuery.toLowerCase().trim()
    let list = notes
    if (activeNoteTag !== 'all') {
      list = list.filter(n =>
        (n.tags || []).some(t => t.replace(/^#/, '').toLowerCase() === activeNoteTag.toLowerCase())
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
    return [...list].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1
      if (!a.isPinned && b.isPinned) return 1
      return b.updatedAt - a.updatedAt
    })
  }, [notes, noteSearchQuery, activeNoteTag])

  const handleCreateNewNote = () => {
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
    saveNotes(updated)
    setSelectedNoteId(newNote.id)
    setActiveTab('notes')
    setTimeout(() => {
      if (richEditorRef.current) {
        richEditorRef.current.innerHTML = ''
        richEditorRef.current.focus()
      }
    }, 50)
  }

  const handleDeleteCurrentNote = () => {
    if (!selectedNoteId) return
    sounds.playClick()
    const updated = notes.filter(n => n.id !== selectedNoteId)
    saveNotes(updated)
    if (window.innerWidth < 768) {
      setSelectedNoteId(null)
    } else {
      setSelectedNoteId(updated.length > 0 ? updated[0].id : null)
    }
  }

  const handleTogglePinNote = () => {
    if (!selectedNoteId) return
    sounds.playClick()
    const updated = notes.map(n =>
      n.id === selectedNoteId ? { ...n, isPinned: !n.isPinned, updatedAt: Date.now() } : n
    )
    saveNotes(updated)
  }

  const handleUpdateNoteTitle = (title: string) => {
    if (!selectedNoteId) return
    const updated = notes.map(n =>
      n.id === selectedNoteId ? { ...n, title, updatedAt: Date.now() } : n
    )
    saveNotes(updated)
  }

  const handleEditorInput = () => {
    if (!richEditorRef.current || !selectedNoteId) return
    const newHtml = richEditorRef.current.innerHTML

    // Check if user just typed "1. " or "- " at block start
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      const node = selection.getRangeAt(0).startContainer
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent || ''
        if (/^1\.\s/.test(text)) {
          node.textContent = text.replace(/^1\.\s/, '')
          document.execCommand('insertOrderedList', false)
        } else if (/^[-*]\s/.test(text)) {
          node.textContent = text.replace(/^[-*]\s/, '')
          document.execCommand('insertUnorderedList', false)
        }
      }
    }

    const updated = notes.map(n =>
      n.id === selectedNoteId ? { ...n, content: newHtml, updatedAt: Date.now() } : n
    )
    saveNotes(updated)
  }

  // Smart list continuation and exit on Enter
  const handleEditorKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      const selection = window.getSelection()
      if (!selection || !selection.rangeCount) return
      const range = selection.getRangeAt(0)
      const node = range.startContainer

      // Check if current block or parent is empty list item
      let listItem = node.parentElement
      while (listItem && listItem !== richEditorRef.current && listItem.tagName !== 'LI') {
        listItem = listItem.parentElement
      }

      if (listItem && listItem.tagName === 'LI') {
        const itemText = listItem.textContent?.trim() || ''
        if (!itemText) {
          // Double enter on empty list item -> exit list
          e.preventDefault()
          document.execCommand('outdent', false)
          return
        }
      }

      // Check inline typed lists
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent || ''
        const offset = range.startOffset
        const lineBeforeCursor = text.substring(0, offset)

        const numMatch = lineBeforeCursor.match(/^(\d+)\.\s*(.*)$/)
        if (numMatch) {
          if (!numMatch[2].trim()) {
            // Empty numbered item -> exit
            e.preventDefault()
            node.textContent = text.replace(/^\d+\.\s*/, '')
            document.execCommand('insertParagraph', false)
            return
          }
          e.preventDefault()
          const nextNum = parseInt(numMatch[1], 10) + 1
          document.execCommand('insertHTML', false, `<br>${nextNum}.&nbsp;`)
          return
        }

        const bulletMatch = lineBeforeCursor.match(/^([-*•])\s*(.*)$/)
        if (bulletMatch) {
          if (!bulletMatch[2].trim()) {
            // Empty bullet item -> exit
            e.preventDefault()
            node.textContent = text.replace(/^[-*•]\s*/, '')
            document.execCommand('insertParagraph', false)
            return
          }
          e.preventDefault()
          document.execCommand('insertHTML', false, '<br>•&nbsp;')
          return
        }
      }
    }
  }

  // WYSIWYG Formatting Helpers (Real Rich-Text)
  const applyRichFormat = (command: string, value: string | undefined = undefined) => {
    sounds.playClick()
    if (!richEditorRef.current) return
    richEditorRef.current.focus()

    if (command === 'formatBlock') {
      document.execCommand('formatBlock', false, value)
    } else {
      document.execCommand(command, false, value)
    }
    handleEditorInput()
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
    const updated = notes.map(n =>
      n.id === selectedNoteId ? { ...n, content: lines.join('\n'), updatedAt: Date.now() } : n
    )
    saveNotes(updated)
  }

  const updateChecklistItemText = (lineIndex: number, newText: string) => {
    if (!selectedNote) return
    const lines = selectedNote.content.split('\n')
    const current = lines[lineIndex]
    if (typeof current !== 'string') return
    const isCompleted = /^\s*-\s*\[[xX]\]/.test(current)
    lines[lineIndex] = `${isCompleted ? '- [x]' : '- [ ]'} ${newText}`
    const updated = notes.map(n =>
      n.id === selectedNoteId ? { ...n, content: lines.join('\n'), updatedAt: Date.now() } : n
    )
    saveNotes(updated)
  }

  const deleteChecklistItem = (lineIndex: number) => {
    if (!selectedNote) return
    sounds.playClick()
    const lines = selectedNote.content.split('\n')
    lines.splice(lineIndex, 1)
    const updated = notes.map(n =>
      n.id === selectedNoteId ? { ...n, content: lines.join('\n'), updatedAt: Date.now() } : n
    )
    saveNotes(updated)
  }

  const handleAddChecklistItem = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!selectedNote) return
    const textToAdd = newChecklistText.trim()
    sounds.playClick()
    const current = selectedNote.content
    const prefix = current.length > 0 && !current.endsWith('\n') ? '\n' : ''
    const newLine = `- [ ] ${textToAdd}`
    const updated = notes.map(n =>
      n.id === selectedNoteId
        ? { ...n, content: current + prefix + newLine + '\n', updatedAt: Date.now() }
        : n
    )
    saveNotes(updated)
    setNewChecklistText('')
    setTimeout(() => checklistInputRef.current?.focus(), 50)
  }

  // --- INTEGRATION: Convert Checklist item in Note to a Task in Plan ---
  const handleConvertChecklistToTask = (item: { text: string; completed: boolean }) => {
    sounds.playSuccess()
    const newTask: TaskItem = {
      id: 'task-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      title: item.text,
      completed: item.completed,
      priority: 'medium',
      myDay: true,
      important: false,
      notes: selectedNote ? `From Note: ${selectedNote.title}` : '',
      createdAt: Date.now()
    }
    const updatedTasks = [newTask, ...tasks]
    saveTasks(updatedTasks)
    showToast(`Converted to Task in "My Day"`)
  }

  // Word & character stats
  const noteStats = useMemo(() => {
    if (!selectedNote) return { words: 0, chars: 0 }
    const text = selectedNote.content.replace(/<[^>]*>/g, '').trim()
    const words = text ? text.split(/\s+/).length : 0
    return { words, chars: text.length }
  }, [selectedNote])

  // ==========================================
  // --- TASKS PERSISTENCE & ACTIONS ---
  // ==========================================
  const saveTasks = (updated: TaskItem[]) => {
    setTasks(updated)
    storageService.set('tasks', updated)
    window.dispatchEvent(new CustomEvent('superdash_task_updated'))
  }

  const saveTaskLists = (updated: TaskList[]) => {
    setTaskLists(updated)
    storageService.set('task_lists', updated)
  }

  const toggleTaskComplete = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    sounds.playClick()
    const task = tasks.find(t => t.id === id)
    const isNowCompleted = !task?.completed

    if (isNowCompleted) {
      sounds.playSuccess()
      try {
        confetti({
          particleCount: 35,
          spread: 45,
          origin: { y: 0.8 },
          colors: ['#10b981', '#6366f1', '#f59e0b']
        })
      } catch {
        // Fallback
      }
    }

    const updated = tasks.map(t => (t.id === id ? { ...t, completed: isNowCompleted } : t))
    saveTasks(updated)
  }

  const toggleTaskImportant = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    sounds.playClick()
    const updated = tasks.map(t => {
      if (t.id === id) {
        const nextImportant = !t.important
        return {
          ...t,
          important: nextImportant,
          priority: nextImportant
            ? ('high' as TaskPriority)
            : t.priority === 'high'
            ? 'medium'
            : t.priority
        }
      }
      return t
    })
    saveTasks(updated)
  }

  const toggleTaskMyDay = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    sounds.playClick()
    const updated = tasks.map(t => (t.id === id ? { ...t, myDay: !t.myDay } : t))
    saveTasks(updated)
  }

  const deleteTask = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    sounds.playClick()
    const updated = tasks.filter(t => t.id !== id)
    saveTasks(updated)
    if (expandedTaskId === id) setExpandedTaskId(null)
  }

  // Top Task Quick-Add Component
  const handleQuickAddTask = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const trimmed = quickTaskTitle.trim()
    if (!trimmed) return

    sounds.playClick()
    const isCustomList = taskLists.some(l => l.id === activeTaskView)
    const isMyDayView = activeTaskView === 'my-day'
    const isImportantView = activeTaskView === 'important'
    const isPlannedView = activeTaskView === 'planned'

    const newTask: TaskItem = {
      id: 'task-' + Date.now(),
      title: trimmed,
      completed: false,
      priority: isImportantView ? 'high' : quickTaskPriority,
      dueDate: quickTaskDueDate || (isPlannedView ? todayStr : undefined),
      myDay: isMyDayView,
      important: isImportantView,
      listId: isCustomList ? activeTaskView : undefined,
      createdAt: Date.now()
    }

    saveTasks([newTask, ...tasks])
    setQuickTaskTitle('')
    setQuickTaskDueDate('')
    setQuickTaskPriority('medium')
    quickTaskInputRef.current?.focus()
  }

  // Custom lists management
  const handleCreateCustomList = (e: React.FormEvent) => {
    e.preventDefault()
    const name = newListName.trim()
    if (!name) return

    sounds.playClick()
    const newList: TaskList = {
      id: 'list-' + Date.now(),
      name,
      createdAt: Date.now()
    }
    const updated = [...taskLists, newList]
    saveTaskLists(updated)
    setNewListName('')
    setIsCreatingList(false)
    setActiveTaskView(newList.id)
  }

  const handleUpdateListName = (listId: string) => {
    const trimmed = editingListName.trim()
    if (!trimmed) {
      setEditingListId(null)
      return
    }
    sounds.playClick()
    const updated = taskLists.map(l => (l.id === listId ? { ...l, name: trimmed } : l))
    saveTaskLists(updated)
    setEditingListId(null)
  }

  const handleDeleteCustomList = (listId: string) => {
    sounds.playClick()
    const updatedLists = taskLists.filter(l => l.id !== listId)
    saveTaskLists(updatedLists)
    const updatedTasks = tasks.map(t => (t.listId === listId ? { ...t, listId: undefined } : t))
    saveTasks(updatedTasks)
    if (activeTaskView === listId) {
      setActiveTaskView('tasks')
    }
  }

  // --- INTEGRATION: Create or Open Note linked to a Task ---
  const handleCreateNoteFromTask = (task: TaskItem) => {
    sounds.playClick()
    const existing = notes.find(n => n.title.toLowerCase() === task.title.toLowerCase())
    if (existing) {
      setSelectedNoteId(existing.id)
      setActiveTab('notes')
      showToast(`Opened linked Note: "${existing.title}"`)
      return
    }

    const newNote: NoteItem = {
      id: 'note-' + Date.now(),
      title: task.title,
      content: task.notes
        ? `Task Notes:\n${task.notes}\n\n- [ ] ${task.title}`
        : `Task Details & Notes:\n- [ ] ${task.title}\n\n`,
      color: '#10b981',
      isPinned: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      tags: ['Tasks']
    }
    const updatedNotes = [newNote, ...notes]
    saveNotes(updatedNotes)
    setSelectedNoteId(newNote.id)
    setActiveTab('notes')
    showToast(`Created Note for "${task.title}"`)
  }

  // Filter tasks for active view
  const currentViewTasks = useMemo(() => {
    let list = tasks

    if (activeTaskView === 'my-day') {
      list = list.filter(t => t.myDay)
    } else if (activeTaskView === 'important') {
      list = list.filter(t => t.important)
    } else if (activeTaskView === 'planned') {
      list = list.filter(t => Boolean(t.dueDate))
    } else if (activeTaskView === 'tasks') {
      list = list.filter(t => !t.listId)
    } else {
      // Custom list filter
      list = list.filter(t => t.listId === activeTaskView)
    }

    if (taskSearchQuery.trim()) {
      const q = taskSearchQuery.toLowerCase()
      list = list.filter(
        t => t.title.toLowerCase().includes(q) || (t.notes && t.notes.toLowerCase().includes(q))
      )
    }

    return list
  }, [tasks, activeTaskView, taskSearchQuery])

  const pendingTasks = useMemo(
    () => currentViewTasks.filter(t => !t.completed),
    [currentViewTasks]
  )
  const completedTasksList = useMemo(
    () => currentViewTasks.filter(t => t.completed),
    [currentViewTasks]
  )

  const activeCustomList = useMemo(
    () => taskLists.find(l => l.id === activeTaskView),
    [taskLists, activeTaskView]
  )

  const getViewTitle = () => {
    switch (activeTaskView) {
      case 'my-day':
        return 'My Day'
      case 'important':
        return 'Important'
      case 'planned':
        return 'Planned'
      case 'tasks':
        return 'Tasks'
      default:
        return activeCustomList?.name || 'Tasks'
    }
  }

  const getViewIcon = () => {
    switch (activeTaskView) {
      case 'my-day':
        return <Sun className="w-5 h-5 text-amber-400" />
      case 'important':
        return <Star className="w-5 h-5 text-rose-400 fill-rose-400" />
      case 'planned':
        return <Calendar className="w-5 h-5 text-teal-400" />
      case 'tasks':
        return <CheckSquare className="w-5 h-5 text-emerald-400" />
      default:
        return <ListIcon className="w-5 h-5 text-indigo-400" />
    }
  }

  return (
    <div className="flex-1 min-h-0 h-full w-full bg-slate-950/95 text-white flex flex-col overflow-hidden select-none relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-2xl bg-slate-900 border border-teal-500/40 text-teal-300 text-xs font-semibold shadow-2xl flex items-center gap-2 animate-window-open">
          <Sparkles className="w-4 h-4 text-teal-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Plan Header: Unified Tab Switcher & Minimal Quick Shortcut */}
      <header className="h-14 sm:h-12 border-b border-white/10 px-3 sm:px-5 flex items-center justify-between bg-black/40 shrink-0 z-20">
        {/* Left: App Title and Segmented Tabs */}
        <div className="flex items-center gap-3 sm:gap-6 min-w-0">
          <div className="flex items-center gap-2 shrink-0">
            <span className="font-bold text-sm tracking-tight text-white hidden sm:inline">
              Plan
            </span>
          </div>

          {/* Simple & Fast Tab Switcher (Notes | Tasks) */}
          <div className="flex items-center p-1 rounded-xl bg-white/5 border border-white/10 shadow-inner">
            <button
              onClick={() => {
                sounds.playClick()
                setActiveTab('notes')
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition ${
                activeTab === 'notes'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              <span>Notes</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/10 font-mono text-slate-300">
                {notes.length}
              </span>
            </button>

            <button
              onClick={() => {
                sounds.playClick()
                setActiveTab('tasks')
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition ${
                activeTab === 'tasks'
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5 text-teal-400" />
              <span>Tasks</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/10 font-mono text-slate-300">
                {tasks.filter(t => !t.completed).length}
              </span>
            </button>
          </div>
        </div>

        {/* Right: Small Compact Note / Task Shortcut (No large yellow pills or labels!) */}
        <div className="flex items-center gap-2">
          {activeTab === 'notes' && (
            <button
              onClick={handleCreateNewNote}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-amber-300 hover:text-white border border-white/15 active:scale-95 transition shrink-0 relative group"
              title="New Note"
              aria-label="New Note"
            >
              <div className="relative flex items-center justify-center">
                <FileText className="w-4 h-4 text-amber-400" />
                <Plus className="w-2.5 h-2.5 text-white absolute -bottom-0.5 -right-1 stroke-[3]" />
              </div>
            </button>
          )}

          {activeTab === 'tasks' && (
            <button
              onClick={() => quickTaskInputRef.current?.focus()}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-teal-300 hover:text-white border border-white/15 active:scale-95 transition shrink-0"
              title="New Task"
              aria-label="New Task"
            >
              <div className="relative flex items-center justify-center">
                <CheckSquare className="w-4 h-4 text-teal-400" />
                <Plus className="w-2.5 h-2.5 text-white absolute -bottom-0.5 -right-1 stroke-[3]" />
              </div>
            </button>
          )}
        </div>
      </header>

      {/* Main Content Pane */}
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col relative">
        {/* ======================================================== */}
        {/* 1. NOTES SECTION                                         */}
        {/* ======================================================== */}
        {activeTab === 'notes' && (
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
            {/* Notes Tag Bar */}
            <div className="px-3 sm:px-5 py-2 border-b border-white/10 bg-black/20 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
                Filter:
              </span>
              <button
                onClick={() => setActiveNoteTag('all')}
                className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition shrink-0 ${
                  activeNoteTag === 'all'
                    ? 'bg-amber-500/25 text-amber-300 border border-amber-500/40 shadow-xs'
                    : 'text-slate-400 hover:text-white bg-white/5 border border-white/5'
                }`}
              >
                All
              </button>
              {allNoteTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setActiveNoteTag(tag)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition shrink-0 ${
                    activeNoteTag === tag
                      ? 'bg-amber-500/25 text-amber-300 border border-amber-500/40 shadow-xs'
                      : 'text-slate-400 hover:text-white bg-white/5 border border-white/5'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* Notes 2-Column Layout */}
            <div className="flex-1 min-h-0 flex overflow-hidden divide-x divide-white/10">
              {/* Notes Sidebar List */}
              <aside
                className={`w-full md:w-80 flex flex-col bg-black/20 shrink-0 overflow-hidden ${
                  selectedNoteId ? 'hidden md:flex' : 'flex'
                }`}
              >
                {/* Search Bar */}
                <div className="p-3 border-b border-white/10 shrink-0">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      ref={noteSearchInputRef}
                      type="text"
                      placeholder="Search notes (⌘F)..."
                      value={noteSearchQuery}
                      onChange={e => setNoteSearchQuery(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-sans"
                    />
                  </div>
                </div>

                {/* Notes Scroller */}
                <div className="flex-1 min-h-0 overflow-y-auto p-2 space-y-1.5">
                  {filteredNotes.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 text-xs px-4">
                      No matching notes found
                    </div>
                  ) : (
                    filteredNotes.map(n => {
                      const isSelected = n.id === selectedNoteId
                      const snippet =
                        n.content
                          .replace(/<[^>]*>/g, ' ')
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
                            {snippet}
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

              {/* Notes WYSIWYG Editor Surface */}
              <main
                className={`flex-1 min-h-0 flex flex-col bg-slate-950/40 overflow-hidden ${
                  selectedNoteId ? 'flex' : 'hidden md:flex'
                }`}
              >
                {selectedNote ? (
                  <>
                    {/* WYSIWYG Formatting Toolbar */}
                    <div className="px-3 sm:px-5 py-2 border-b border-white/10 flex items-center justify-between bg-black/20 text-xs gap-2 shrink-0">
                      {/* Back to Notes Button (Mobile only) */}
                      <button
                        onClick={() => setSelectedNoteId(null)}
                        className="md:hidden flex items-center gap-1 text-amber-400 hover:text-amber-300 font-semibold text-xs px-2.5 py-1 rounded-lg bg-amber-400/10 shrink-0"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        <span>Notes</span>
                      </button>

                      {/* True WYSIWYG Formatting Tools */}
                      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                        <button
                          type="button"
                          onMouseDown={e => {
                            e.preventDefault()
                            applyRichFormat('bold')
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition shrink-0"
                          title="Bold"
                        >
                          <Bold className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onMouseDown={e => {
                            e.preventDefault()
                            applyRichFormat('italic')
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition shrink-0"
                          title="Italic"
                        >
                          <Italic className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onMouseDown={e => {
                            e.preventDefault()
                            applyRichFormat('formatBlock', '<h3>')
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition shrink-0"
                          title="Heading"
                        >
                          <Heading2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onMouseDown={e => {
                            e.preventDefault()
                            applyRichFormat('insertUnorderedList')
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition shrink-0"
                          title="Bullet List"
                        >
                          <List className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onMouseDown={e => {
                            e.preventDefault()
                            applyRichFormat('insertOrderedList')
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition shrink-0"
                          title="Numbered List"
                        >
                          <ListOrdered className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onMouseDown={e => {
                            e.preventDefault()
                            applyRichFormat('formatBlock', '<blockquote>')
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition shrink-0"
                          title="Quote"
                        >
                          <Quote className="w-3.5 h-3.5" />
                        </button>

                        {/* Checklist Trigger */}
                        <button
                          type="button"
                          onClick={() => checklistInputRef.current?.focus()}
                          className="flex items-center gap-1 px-2 py-1 rounded-lg text-amber-300 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 transition shrink-0 font-medium"
                          title="Add Checklist Item"
                        >
                          <CheckSquare className="w-3.5 h-3.5" />
                          <span>Checklist</span>
                        </button>
                      </div>

                      {/* Right State: Pin, Delete, Saved Indicator */}
                      <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-auto">
                        <span className="text-[11px] text-slate-500 hidden sm:inline">
                          {noteStats.words} words • {noteStats.chars} chars
                        </span>

                        {isNoteSavedNotice ? (
                          <span className="text-[11px] font-medium text-emerald-400/90 animate-pulse">
                            Saved
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-500 hidden sm:inline">Autosaved</span>
                        )}

                        <button
                          onClick={handleTogglePinNote}
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
                          onClick={handleDeleteCurrentNote}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                          title="Delete Note"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Writing Canvas - Internal Scroll Container */}
                    <div className="flex-1 min-h-0 flex flex-col p-5 sm:p-8 md:p-10 overflow-y-auto max-w-4xl mx-auto w-full">
                      {/* Note Title Input */}
                      <input
                        type="text"
                        placeholder="Note title..."
                        value={selectedNote.title}
                        onChange={e => handleUpdateNoteTitle(e.target.value)}
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
                                item.completed ? 'line-through text-slate-500' : 'text-slate-100'
                              }`}
                            />

                            {/* Convert to Task in Plan Button (Requirement 8) */}
                            <button
                              type="button"
                              onClick={() => handleConvertChecklistToTask(item)}
                              className="p-1 rounded-lg text-slate-500 hover:text-teal-300 opacity-60 group-hover:opacity-100 transition"
                              title="Convert to Task (Plan)"
                            >
                              <CheckSquare className="w-3.5 h-3.5 text-teal-400" />
                            </button>

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

                      {/* True WYSIWYG ContentEditable Editor */}
                      <div
                        ref={richEditorRef}
                        contentEditable
                        onInput={handleEditorInput}
                        onKeyDown={handleEditorKeyDown}
                        className="flex-1 min-h-[280px] w-full bg-transparent border-none text-slate-200 focus:outline-none leading-relaxed font-sans text-base sm:text-lg prose prose-invert max-w-none focus:ring-0 [&>blockquote]:border-l-4 [&>blockquote]:border-amber-400 [&>blockquote]:pl-3 [&>blockquote]:italic [&>blockquote]:text-slate-300 [&>blockquote]:my-2 [&>blockquote]:py-1 [&>ol]:list-decimal [&>ol]:list-inside [&>ol]:space-y-1 [&>ol]:my-2 [&>ul]:list-disc [&>ul]:list-inside [&>ul]:space-y-1 [&>ul]:my-2 [&>h3]:text-xl [&>h3]:font-bold [&>h3]:text-white [&>h3]:my-2"
                        data-placeholder="Start typing your thoughts, notes, and ideas..."
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
                      onClick: handleCreateNewNote
                    }}
                  />
                )}
              </main>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 2. TASKS SECTION                                         */}
        {/* ======================================================== */}
        {activeTab === 'tasks' && (
          <div className="flex-1 min-h-0 flex overflow-hidden">
            {/* Tasks Navigation Sidebar (Desktop + Mobile slideout) */}
            <aside
              className={`w-72 bg-black/30 border-r border-white/10 flex flex-col shrink-0 overflow-hidden ${
                isTaskSidebarOpenMobile
                  ? 'fixed inset-y-0 left-0 z-40 bg-slate-950/95 w-72'
                  : 'hidden md:flex'
              }`}
            >
              {/* Sidebar Header & Close on mobile */}
              <div className="p-3 border-b border-white/10 flex items-center justify-between md:hidden">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Task Navigation
                </span>
                <button
                  onClick={() => setIsTaskSidebarOpenMobile(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Primary Views (Microsoft To-Do UX standard: My Day, Important, Planned, Tasks) */}
              <div className="p-3 space-y-1 border-b border-white/10">
                <button
                  onClick={() => {
                    sounds.playClick()
                    setActiveTaskView('my-day')
                    setIsTaskSidebarOpenMobile(false)
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
                    activeTaskView === 'my-day'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-xs'
                      : 'text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Sun className="w-4 h-4 text-amber-400" />
                    <span>My Day</span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10 font-mono">
                    {tasks.filter(t => t.myDay && !t.completed).length}
                  </span>
                </button>

                <button
                  onClick={() => {
                    sounds.playClick()
                    setActiveTaskView('important')
                    setIsTaskSidebarOpenMobile(false)
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
                    activeTaskView === 'important'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 shadow-xs'
                      : 'text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Star className="w-4 h-4 text-rose-400 fill-rose-400" />
                    <span>Important</span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10 font-mono">
                    {tasks.filter(t => t.important && !t.completed).length}
                  </span>
                </button>

                <button
                  onClick={() => {
                    sounds.playClick()
                    setActiveTaskView('planned')
                    setIsTaskSidebarOpenMobile(false)
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
                    activeTaskView === 'planned'
                      ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30 shadow-xs'
                      : 'text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Calendar className="w-4 h-4 text-teal-400" />
                    <span>Planned</span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10 font-mono">
                    {tasks.filter(t => Boolean(t.dueDate) && !t.completed).length}
                  </span>
                </button>

                <button
                  onClick={() => {
                    sounds.playClick()
                    setActiveTaskView('tasks')
                    setIsTaskSidebarOpenMobile(false)
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
                    activeTaskView === 'tasks'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-xs'
                      : 'text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <CheckSquare className="w-4 h-4 text-emerald-400" />
                    <span>Tasks</span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10 font-mono">
                    {tasks.filter(t => !t.listId && !t.completed).length}
                  </span>
                </button>
              </div>

              {/* Custom Lists Section */}
              <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-1">
                <div className="flex items-center justify-between px-1 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Custom Lists
                  </span>
                  <button
                    onClick={() => setIsCreatingList(true)}
                    className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition"
                    title="New List"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {isCreatingList && (
                  <form onSubmit={handleCreateCustomList} className="mb-2">
                    <div className="flex items-center gap-1 bg-white/5 border border-indigo-500/40 rounded-xl p-1">
                      <input
                        type="text"
                        autoFocus
                        placeholder="List name..."
                        value={newListName}
                        onChange={e => setNewListName(e.target.value)}
                        className="w-full bg-transparent border-none text-xs text-white px-2 py-1 focus:outline-none"
                      />
                      <button
                        type="submit"
                        className="p-1 text-emerald-400 hover:text-emerald-300"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsCreatingList(false)}
                        className="p-1 text-slate-400 hover:text-white"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </form>
                )}

                {taskLists.map(list => {
                  const isActive = activeTaskView === list.id
                  const isEditing = editingListId === list.id
                  const count = tasks.filter(t => t.listId === list.id && !t.completed).length

                  return (
                    <div
                      key={list.id}
                      className={`group flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition ${
                        isActive
                          ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                          : 'text-slate-300 hover:bg-white/5'
                      }`}
                      onClick={() => {
                        sounds.playClick()
                        setActiveTaskView(list.id)
                        setIsTaskSidebarOpenMobile(false)
                      }}
                    >
                      {isEditing ? (
                        <div
                          className="flex items-center gap-1 flex-1"
                          onClick={e => e.stopPropagation()}
                        >
                          <input
                            type="text"
                            autoFocus
                            value={editingListName}
                            onChange={e => setEditingListName(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') handleUpdateListName(list.id)
                              if (e.key === 'Escape') setEditingListId(null)
                            }}
                            className="bg-black/40 border border-white/20 rounded px-1.5 py-0.5 text-xs text-white w-full focus:outline-none"
                          />
                          <button
                            onClick={() => handleUpdateListName(list.id)}
                            className="text-emerald-400 p-0.5"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-2 truncate flex-1 mr-2">
                            <ListIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{list.name}</span>
                          </div>

                          <div className="flex items-center gap-1">
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10 font-mono">
                              {count}
                            </span>
                            <div className="hidden group-hover:flex items-center gap-0.5 ml-1">
                              <button
                                onClick={e => {
                                  e.stopPropagation()
                                  setEditingListId(list.id)
                                  setEditingListName(list.name)
                                }}
                                className="p-1 text-slate-400 hover:text-white"
                                title="Rename list"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                              <button
                                onClick={e => {
                                  e.stopPropagation()
                                  handleDeleteCustomList(list.id)
                                }}
                                className="p-1 text-slate-400 hover:text-rose-400"
                                title="Delete list"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Side Task Component: Preserved Focus Input Component */}
              <div className="p-3 border-t border-white/10 bg-black/40 shrink-0">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Target className="w-3.5 h-3.5 text-teal-400" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-300">
                    Focus Objective
                  </span>
                </div>
                <input
                  type="text"
                  placeholder="Set main daily priority..."
                  value={sideFocusText}
                  onChange={e => setSideFocusText(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400 font-sans"
                />
              </div>
            </aside>

            {/* Main Task List Work Area */}
            <main className="flex-1 min-h-0 flex flex-col bg-slate-950/40 overflow-hidden">
              {/* Task View Header & Search */}
              <div className="p-3 sm:p-5 border-b border-white/10 flex items-center justify-between gap-3 shrink-0 bg-black/20">
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => setIsTaskSidebarOpenMobile(true)}
                    className="md:hidden p-1.5 rounded-xl bg-white/5 text-slate-300 hover:text-white"
                  >
                    <ListIcon className="w-4 h-4" />
                  </button>
                  <div className="p-1.5 rounded-xl bg-white/5 border border-white/10">
                    {getViewIcon()}
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2">
                      {getViewTitle()}
                    </h2>
                    <span className="text-[11px] text-slate-400">
                      {pendingTasks.length} pending • {completedTasksList.length} completed
                    </span>
                  </div>
                </div>

                {/* Search Tasks */}
                <div className="relative max-w-xs w-full hidden sm:block">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search in view..."
                    value={taskSearchQuery}
                    onChange={e => setTaskSearchQuery(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-3 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400"
                  />
                </div>
              </div>

              {/* Top Task Component: Preserved Quick-Add Input Form */}
              <div className="p-3 sm:p-5 border-b border-white/10 bg-black/30 shrink-0">
                <form onSubmit={handleQuickAddTask} className="flex flex-col sm:flex-row gap-2">
                  <div className="flex-1 flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-3 py-2 focus-within:border-teal-400/60 focus-within:bg-white/[0.08] transition">
                    <Plus className="w-4 h-4 text-teal-400 shrink-0" />
                    <input
                      ref={quickTaskInputRef}
                      type="text"
                      placeholder="Add a task... Press Enter to save"
                      value={quickTaskTitle}
                      onChange={e => setQuickTaskTitle(e.target.value)}
                      className="w-full bg-transparent border-none text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none font-sans"
                    />
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <input
                      type="date"
                      value={quickTaskDueDate}
                      onChange={e => setQuickTaskDueDate(e.target.value)}
                      className="bg-white/5 border border-white/10 rounded-xl px-2.5 py-2 text-xs text-slate-300 focus:outline-none"
                    />

                    <select
                      value={quickTaskPriority}
                      onChange={e => setQuickTaskPriority(e.target.value as TaskPriority)}
                      className="bg-slate-900 border border-white/10 rounded-xl px-2.5 py-2 text-xs text-slate-300 focus:outline-none"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>

                    <button
                      type="submit"
                      disabled={!quickTaskTitle.trim()}
                      className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs disabled:opacity-30 disabled:pointer-events-none transition shadow-md shadow-teal-500/20"
                    >
                      Add
                    </button>
                  </div>
                </form>
              </div>

              {/* Task Items Scrollable Canvas */}
              <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-5 space-y-2">
                {pendingTasks.length === 0 && completedTasksList.length === 0 ? (
                  <div className="text-center py-16 text-slate-500 text-xs">
                    No tasks found in this view. Use the quick-add input above to create one.
                  </div>
                ) : (
                  <>
                    {/* Pending Tasks */}
                    {pendingTasks.map(task => {
                      const isExpanded = expandedTaskId === task.id

                      return (
                        <div
                          key={task.id}
                          onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}
                          className="p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 transition group cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            {/* Checkbox */}
                            <button
                              type="button"
                              onClick={e => toggleTaskComplete(task.id, e)}
                              className="text-slate-400 hover:text-teal-400 transition shrink-0"
                            >
                              <Circle className="w-5 h-5" />
                            </button>

                            {/* Title & metadata */}
                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs sm:text-sm font-medium text-white truncate">
                                {task.title}
                              </h4>
                              <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400 flex-wrap">
                                {task.myDay && (
                                  <span className="flex items-center gap-1 text-amber-300 font-semibold">
                                    <Sun className="w-3 h-3" /> My Day
                                  </span>
                                )}
                                {task.dueDate && (
                                  <span className="flex items-center gap-1 text-teal-300">
                                    <Calendar className="w-3 h-3" />{' '}
                                    {formatSmartDate(task.dueDate)}
                                  </span>
                                )}
                                {task.priority === 'high' && (
                                  <span className="px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 font-semibold">
                                    High Priority
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Actions: Important toggle, Note link, Delete */}
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={e => {
                                  e.stopPropagation()
                                  handleCreateNoteFromTask(task)
                                }}
                                className="p-1 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-white/10 transition"
                                title="Open or create note for this task"
                              >
                                <FileText className="w-4 h-4 text-amber-400" />
                              </button>

                              <button
                                type="button"
                                onClick={e => toggleTaskImportant(task.id, e)}
                                className={`p-1 rounded-lg transition ${
                                  task.important
                                    ? 'text-rose-400'
                                    : 'text-slate-500 hover:text-slate-300'
                                }`}
                                title={task.important ? 'Unmark important' : 'Mark important'}
                              >
                                <Star
                                  className={`w-4 h-4 ${task.important ? 'fill-rose-400' : ''}`}
                                />
                              </button>

                              <button
                                type="button"
                                onClick={e => deleteTask(task.id, e)}
                                className="p-1 rounded-lg text-slate-500 hover:text-rose-400 opacity-60 group-hover:opacity-100 transition"
                                title="Delete task"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Expanded Detail View */}
                          {isExpanded && (
                            <div
                              className="mt-3 pt-3 border-t border-white/10 text-xs space-y-2 animate-window-open"
                              onClick={e => e.stopPropagation()}
                            >
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={e => toggleTaskMyDay(task.id, e)}
                                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                                    task.myDay
                                      ? 'bg-amber-500/25 text-amber-300 border border-amber-500/40'
                                      : 'bg-white/5 text-slate-300 hover:bg-white/10'
                                  }`}
                                >
                                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                                  <span>{task.myDay ? 'In My Day' : 'Add to My Day'}</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleCreateNoteFromTask(task)}
                                  className="px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 border border-amber-500/20 transition"
                                >
                                  <FileText className="w-3.5 h-3.5 text-amber-400" />
                                  <span>Open in Notes</span>
                                </button>
                              </div>

                              <div>
                                <textarea
                                  placeholder="Add additional notes or details..."
                                  value={task.notes || ''}
                                  onChange={e => {
                                    const val = e.target.value
                                    const updated = tasks.map(t =>
                                      t.id === task.id ? { ...t, notes: val } : t
                                    )
                                    saveTasks(updated)
                                  }}
                                  className="w-full h-16 bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-400"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}

                    {/* Completed Tasks Accordion */}
                    {completedTasksList.length > 0 && (
                      <div className="pt-4">
                        <button
                          type="button"
                          onClick={() => setShowCompletedTasks(!showCompletedTasks)}
                          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white mb-2"
                        >
                          {showCompletedTasks ? (
                            <ChevronDown className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5" />
                          )}
                          <span>Completed ({completedTasksList.length})</span>
                        </button>

                        {showCompletedTasks && (
                          <div className="space-y-1.5">
                            {completedTasksList.map(task => (
                              <div
                                key={task.id}
                                className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between gap-3 text-slate-500 group"
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <button
                                    type="button"
                                    onClick={e => toggleTaskComplete(task.id, e)}
                                    className="text-emerald-400 shrink-0"
                                  >
                                    <CheckCircle2 className="w-5 h-5 fill-emerald-500/20" />
                                  </button>
                                  <span className="text-xs line-through truncate text-slate-400">
                                    {task.title}
                                  </span>
                                </div>

                                <button
                                  type="button"
                                  onClick={e => deleteTask(task.id, e)}
                                  className="p-1 rounded-lg text-slate-500 hover:text-rose-400 opacity-60 group-hover:opacity-100 transition shrink-0"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </main>
          </div>
        )}
      </div>
    </div>
  )
}
