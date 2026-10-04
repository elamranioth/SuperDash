import { useState, useEffect, useMemo, useRef } from 'react'
import {
  CheckSquare,
  Plus,
  CheckCircle2,
  Circle,
  Trash2,
  Calendar,
  Search,
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
  ChevronLeft
} from 'lucide-react'
import confetti from 'canvas-confetti'
import { TaskItem, TaskPriority, TaskList } from '@/types'
import { storageService, INITIAL_TASKS, INITIAL_TASK_LISTS } from '@/services/storage'
import { sounds } from '@/utils/sound'
import { formatSmartDate, toLocalYYYYMMDD } from '@/utils/date'
import AppHeader from '@/components/AppWindow/AppHeader'
import EmptyState from '@/components/LiquidGlass/EmptyState'

export type TaskViewType = 'my-day' | 'important' | 'planned' | 'tasks' | string

interface TasksAppProps {
  initialFilter?: string
}

export default function TasksApp({ initialFilter = 'my-day' }: TasksAppProps = {}) {
  const [tasks, setTasks] = useState<TaskItem[]>([])
  const [lists, setLists] = useState<TaskList[]>([])
  const [activeView, setActiveView] = useState<TaskViewType>(initialFilter)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false)

  // Custom List creation/editing state
  const [isCreatingList, setIsCreatingList] = useState(false)
  const [newListName, setNewListName] = useState('')
  const [editingListId, setEditingListId] = useState<string | null>(null)
  const [editingListName, setEditingListName] = useState('')

  // Quick Add input state (Top Task component)
  const [quickTitle, setQuickTitle] = useState('')
  const [quickPriority, setQuickPriority] = useState<TaskPriority>('medium')
  const [quickDueDate, setQuickDueDate] = useState('')
  const quickInputRef = useRef<HTMLInputElement>(null)

  // Side Focus Input state
  const [sideFocusText, setSideFocusText] = useState('')

  // Detail inspection / editing
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null)
  const [showCompleted, setShowCompleted] = useState(false)

  const todayStr = toLocalYYYYMMDD()

  // Load tasks and custom lists from storage
  useEffect(() => {
    storageService.get<TaskItem[]>('tasks', INITIAL_TASKS).then(setTasks)
    storageService.get<TaskList[]>('task_lists', INITIAL_TASK_LISTS).then(setLists)
  }, [])

  const saveTasks = (updated: TaskItem[]) => {
    setTasks(updated)
    storageService.set('tasks', updated)
    window.dispatchEvent(new CustomEvent('superdash_task_updated'))
  }

  const saveLists = (updated: TaskList[]) => {
    setLists(updated)
    storageService.set('task_lists', updated)
  }

  // Task actions
  const toggleComplete = (id: string, e?: React.MouseEvent) => {
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

  const toggleImportant = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    sounds.playClick()
    const updated = tasks.map(t => {
      if (t.id === id) {
        const nextImportant = !t.important
        return {
          ...t,
          important: nextImportant,
          priority: nextImportant ? ('high' as TaskPriority) : t.priority === 'high' ? 'medium' : t.priority
        }
      }
      return t
    })
    saveTasks(updated)
  }

  const toggleMyDay = (id: string, e?: React.MouseEvent) => {
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

  const updateTaskField = <K extends keyof TaskItem>(id: string, field: K, val: TaskItem[K]) => {
    const updated = tasks.map(t => (t.id === id ? { ...t, [field]: val } : t))
    saveTasks(updated)
  }

  // Prominent Top Task Quick Add
  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!quickTitle.trim()) return

    sounds.playClick()
    const isMyDayView = activeView === 'my-day'
    const isImportantView = activeView === 'important'
    const isPlannedView = activeView === 'planned'
    const isCustomList = !['my-day', 'important', 'planned', 'tasks'].includes(activeView)

    const newTask: TaskItem = {
      id: 'task-' + Date.now(),
      title: quickTitle.trim(),
      completed: false,
      priority: isImportantView ? 'high' : quickPriority,
      dueDate: isPlannedView ? (quickDueDate || todayStr) : quickDueDate || (isMyDayView ? todayStr : undefined),
      myDay: isMyDayView,
      important: isImportantView,
      listId: isCustomList ? activeView : undefined,
      tag: isCustomList ? lists.find(l => l.id === activeView)?.name : 'General',
      createdAt: Date.now()
    }

    saveTasks([newTask, ...tasks])
    setQuickTitle('')
    setQuickDueDate('')
  }

  // Side Focus Input submission
  const handleSideFocusSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!sideFocusText.trim()) return

    sounds.playClick()
    const newTask: TaskItem = {
      id: 'task-focus-' + Date.now(),
      title: sideFocusText.trim(),
      completed: false,
      priority: 'high',
      dueDate: todayStr,
      myDay: true,
      important: true,
      tag: 'Focus',
      createdAt: Date.now()
    }

    saveTasks([newTask, ...tasks])
    setSideFocusText('')
    setActiveView('my-day')
  }

  // Custom List management
  const handleCreateList = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newListName.trim()) return
    sounds.playClick()
    const newList: TaskList = {
      id: 'list-' + Date.now(),
      name: newListName.trim(),
      color: '#6366f1',
      createdAt: Date.now()
    }
    const updated = [...lists, newList]
    saveLists(updated)
    setNewListName('')
    setIsCreatingList(false)
    setActiveView(newList.id)
  }

  const handleRenameList = (id: string, e: React.FormEvent) => {
    e.preventDefault()
    if (!editingListName.trim()) return
    sounds.playClick()
    const updated = lists.map(l => (l.id === id ? { ...l, name: editingListName.trim() } : l))
    saveLists(updated)
    setEditingListId(null)
    setEditingListName('')
  }

  const handleDeleteList = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    sounds.playClick()
    const updatedLists = lists.filter(l => l.id !== id)
    saveLists(updatedLists)
    // Remove list association from tasks
    const updatedTasks = tasks.map(t => (t.listId === id ? { ...t, listId: undefined } : t))
    saveTasks(updatedTasks)
    if (activeView === id) setActiveView('tasks')
  }

  // Counts for each view
  const myDayCount = useMemo(
    () => tasks.filter(t => !t.completed && (t.myDay || t.dueDate === todayStr)).length,
    [tasks, todayStr]
  )
  const importantCount = useMemo(
    () => tasks.filter(t => !t.completed && (t.important || t.priority === 'high')).length,
    [tasks]
  )
  const plannedCount = useMemo(
    () => tasks.filter(t => !t.completed && Boolean(t.dueDate)).length,
    [tasks]
  )
  const allTasksCount = useMemo(
    () => tasks.filter(t => !t.completed).length,
    [tasks]
  )

  // Current view metadata
  const currentViewMeta = useMemo(() => {
    if (activeView === 'my-day') {
      const todayDateFormatted = new Date().toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
      })
      return {
        title: 'My Day',
        subtitle: todayDateFormatted,
        icon: Sun,
        colorClass: 'text-amber-400',
        bgClass: 'from-amber-500/20 to-orange-500/10'
      }
    }
    if (activeView === 'important') {
      return {
        title: 'Important',
        subtitle: 'Starred and high priority tasks',
        icon: Star,
        colorClass: 'text-rose-400',
        bgClass: 'from-rose-500/20 to-pink-500/10'
      }
    }
    if (activeView === 'planned') {
      return {
        title: 'Planned',
        subtitle: 'Tasks with upcoming due dates',
        icon: Calendar,
        colorClass: 'text-sky-400',
        bgClass: 'from-sky-500/20 to-indigo-500/10'
      }
    }
    if (activeView === 'tasks') {
      return {
        title: 'Tasks',
        subtitle: 'All active to-dos and action items',
        icon: CheckSquare,
        colorClass: 'text-emerald-400',
        bgClass: 'from-emerald-500/20 to-teal-500/10'
      }
    }
    const foundList = lists.find(l => l.id === activeView)
    return {
      title: foundList?.name || 'Custom List',
      subtitle: 'Custom List',
      icon: ListIcon,
      colorClass: 'text-indigo-400',
      bgClass: 'from-indigo-500/20 to-purple-500/10',
      isCustom: true,
      listId: foundList?.id
    }
  }, [activeView, lists])

  // Filter tasks for active view
  const currentViewTasks = useMemo(() => {
    return tasks.filter(t => {
      // Search query filtering
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchTitle = t.title.toLowerCase().includes(q)
        const matchNotes = t.notes?.toLowerCase().includes(q)
        const matchTag = t.tag?.toLowerCase().includes(q)
        if (!matchTitle && !matchNotes && !matchTag) return false
      }

      // View filtering
      if (activeView === 'my-day') {
        return Boolean(t.myDay || t.dueDate === todayStr)
      }
      if (activeView === 'important') {
        return Boolean(t.important || t.priority === 'high')
      }
      if (activeView === 'planned') {
        return Boolean(t.dueDate)
      }
      if (activeView === 'tasks') {
        return true
      }
      // Custom List
      return t.listId === activeView
    })
  }, [tasks, activeView, searchQuery, todayStr])

  const pendingTasks = useMemo(
    () => currentViewTasks.filter(t => !t.completed),
    [currentViewTasks]
  )
  const completedTasks = useMemo(
    () => currentViewTasks.filter(t => t.completed),
    [currentViewTasks]
  )

  const activeTask = useMemo(
    () => tasks.find(t => t.id === expandedTaskId) || null,
    [tasks, expandedTaskId]
  )

  return (
    <div className="flex h-full w-full bg-slate-950/90 text-white flex-col overflow-hidden select-none">
      {/* App Header — Clean without explanatory subtitle */}
      <AppHeader
        icon={CheckSquare}
        title="Tasks"
        gradient="from-emerald-400 to-teal-600"
        primaryAction={{
          label: 'Focus Input',
          icon: Plus,
          onClick: () => {
            quickInputRef.current?.focus()
            setIsSidebarOpenMobile(false)
          }
        }}
      >
        <div className="flex items-center justify-between gap-3">
          {/* Mobile view toggle button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setIsSidebarOpenMobile(!isSidebarOpenMobile)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/10 text-xs font-semibold text-white"
            >
              <currentViewMeta.icon className={`w-3.5 h-3.5 ${currentViewMeta.colorClass}`} />
              <span>{currentViewMeta.title}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>

          {/* Quick Search */}
          <div className="relative w-full max-w-xs ml-auto">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Filter tasks..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-sans"
            />
          </div>
        </div>
      </AppHeader>

      {/* Main Workspace: 2-column on desktop, drawer toggle on mobile */}
      <div className="flex-1 flex overflow-hidden divide-x divide-white/10 relative">
        {/* SIDE TASK AREA: Navigation Views + Custom Lists + Existing Focus Input */}
        <aside
          className={`w-72 bg-black/30 flex flex-col shrink-0 overflow-y-auto z-20 transition-transform md:translate-x-0 ${
            isSidebarOpenMobile
              ? 'absolute inset-y-0 left-0 w-72 bg-slate-950/95 shadow-2xl translate-x-0'
              : 'hidden md:flex'
          }`}
        >
          {/* Primary To Do Navigation Views */}
          <div className="p-3 space-y-1 border-b border-white/10">
            {[
              { id: 'my-day', label: 'My Day', icon: Sun, count: myDayCount, color: 'text-amber-400' },
              { id: 'important', label: 'Important', icon: Star, count: importantCount, color: 'text-rose-400' },
              { id: 'planned', label: 'Planned', icon: Calendar, count: plannedCount, color: 'text-sky-400' },
              { id: 'tasks', label: 'Tasks', icon: CheckSquare, count: allTasksCount, color: 'text-emerald-400' }
            ].map(view => {
              const Icon = view.icon
              const isActive = activeView === view.id
              return (
                <button
                  key={view.id}
                  onClick={() => {
                    sounds.playClick()
                    setActiveView(view.id)
                    setIsSidebarOpenMobile(false)
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className={`w-4 h-4 shrink-0 ${view.color}`} />
                    <span className="truncate">{view.label}</span>
                  </div>
                  {view.count > 0 && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                        isActive ? 'bg-emerald-500/30 text-emerald-200' : 'bg-white/10 text-slate-400'
                      }`}
                    >
                      {view.count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Custom Lists Section */}
          <div className="flex-1 p-3 space-y-1">
            <div className="flex items-center justify-between px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <span>Custom Lists</span>
              <button
                onClick={() => {
                  sounds.playClick()
                  setIsCreatingList(true)
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-emerald-300 hover:bg-white/10 transition"
                title="Create new list"
              >
                <FolderPlus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Inline list creation */}
            {isCreatingList && (
              <form onSubmit={handleCreateList} className="flex items-center gap-1.5 px-2 py-1">
                <input
                  type="text"
                  placeholder="List name..."
                  autoFocus
                  value={newListName}
                  onChange={e => setNewListName(e.target.value)}
                  className="flex-1 bg-white/10 border border-emerald-500/40 rounded-lg px-2 py-1 text-xs text-white focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!newListName.trim()}
                  className="p-1 rounded-lg bg-emerald-600 text-white disabled:opacity-40"
                >
                  <Check className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreatingList(false)}
                  className="p-1 rounded-lg hover:bg-white/10 text-slate-400"
                >
                  <X className="w-3 h-3" />
                </button>
              </form>
            )}

            {lists.map(list => {
              const isActive = activeView === list.id
              const count = tasks.filter(t => !t.completed && t.listId === list.id).length
              const isEditing = editingListId === list.id

              if (isEditing) {
                return (
                  <form
                    key={list.id}
                    onSubmit={e => handleRenameList(list.id, e)}
                    className="flex items-center gap-1.5 px-2 py-1"
                  >
                    <input
                      type="text"
                      autoFocus
                      value={editingListName}
                      onChange={e => setEditingListName(e.target.value)}
                      className="flex-1 bg-white/10 border border-emerald-500/40 rounded-lg px-2 py-1 text-xs text-white focus:outline-none"
                    />
                    <button type="submit" className="p-1 rounded bg-emerald-600 text-white">
                      <Check className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingListId(null)}
                      className="p-1 rounded hover:bg-white/10 text-slate-400"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </form>
                )
              }

              return (
                <div
                  key={list.id}
                  onClick={() => {
                    sounds.playClick()
                    setActiveView(list.id)
                    setIsSidebarOpenMobile(false)
                  }}
                  className={`group flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition ${
                    isActive
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate flex-1">
                    <ListIcon className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span className="truncate">{list.name}</span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {count > 0 && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono bg-white/10 text-slate-400">
                        {count}
                      </span>
                    )}

                    {/* Rename button */}
                    <button
                      onClick={e => {
                        e.stopPropagation()
                        setEditingListId(list.id)
                        setEditingListName(list.name)
                      }}
                      className="p-1 rounded text-slate-500 hover:text-white opacity-0 group-hover:opacity-100 transition"
                      title="Rename list"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>

                    {/* Delete button */}
                    <button
                      onClick={e => handleDeleteList(list.id, e)}
                      className="p-1 rounded text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition"
                      title="Delete list"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )
            })}

            {/* + New List Button */}
            {!isCreatingList && (
              <button
                onClick={() => {
                  sounds.playClick()
                  setIsCreatingList(true)
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-white/5 transition mt-2 font-medium"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-400" />
                <span>+ New List</span>
              </button>
            )}
          </div>

          {/* SIDE TASK COMPONENT: Reused Focus Input (Replaces old Task Daily Objective) */}
          <div className="p-3 border-t border-white/10 bg-black/40">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-400 mb-2">
              <Target className="w-3.5 h-3.5" />
              <span>Focus Input</span>
            </div>

            <form onSubmit={handleSideFocusSubmit} className="space-y-2">
              <input
                type="text"
                placeholder="What is your main focus today?"
                value={sideFocusText}
                onChange={e => setSideFocusText(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-xl bg-white/5 border border-white/15 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 font-sans"
              />
              <button
                type="submit"
                disabled={!sideFocusText.trim()}
                className="w-full py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-semibold shadow-sm transition flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Set Focus Task</span>
              </button>
            </form>
          </div>
        </aside>

        {/* MAIN TASK AREA: Top Task Component + Task Items + Collapsible Completed */}
        <main className="flex-1 flex flex-col bg-slate-950/40 overflow-y-auto p-4 sm:p-6 md:p-8 max-w-4xl mx-auto w-full">
          {/* View Title Banner */}
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center gap-2.5">
              <currentViewMeta.icon className={`w-6 h-6 ${currentViewMeta.colorClass}`} />
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {currentViewMeta.title}
              </h2>
            </div>
            {currentViewMeta.subtitle && (
              <p className="text-xs text-slate-400 mt-1 font-sans">
                {currentViewMeta.subtitle} • {pendingTasks.length} pending
              </p>
            )}
          </div>

          {/* EXISTING TOP TASK COMPONENT: Prominent Quick-Add Input Bar Kept Exactly As Requested */}
          <form
            onSubmit={handleQuickAdd}
            className="mb-4 sm:mb-6 p-2 rounded-2xl bg-white/[0.04] border border-white/15 focus-within:border-emerald-400/50 focus-within:bg-white/[0.07] transition-all flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shadow-sm"
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="p-1 sm:p-2 text-emerald-400 shrink-0">
                <Plus className="w-4 h-4" />
              </div>

              <input
                ref={quickInputRef}
                type="text"
                placeholder={
                  activeView === 'my-day'
                    ? 'Add a task to My Day... Hit Enter'
                    : activeView === 'important'
                    ? 'Add an important task... Hit Enter'
                    : 'What do you need to do? Hit Enter...'
                }
                value={quickTitle}
                onChange={e => setQuickTitle(e.target.value)}
                className="flex-1 bg-transparent border-none text-sm text-white placeholder-slate-500 focus:outline-none font-sans min-w-0"
              />
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-1.5 shrink-0 pr-1 pl-7 sm:pl-0">
              {/* Optional Due Date Picker */}
              <input
                type="date"
                value={quickDueDate}
                onChange={e => setQuickDueDate(e.target.value)}
                className="bg-black/30 border border-white/10 text-[11px] rounded-lg px-2 py-1 text-slate-300 focus:outline-none"
                title="Due date"
              />

              {/* Priority quick toggle */}
              <select
                value={quickPriority}
                onChange={e => setQuickPriority(e.target.value as TaskPriority)}
                className="bg-black/30 border border-white/10 text-[11px] rounded-lg px-2.5 py-1 text-slate-300 focus:outline-none"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>

              <button
                type="submit"
                disabled={!quickTitle.trim()}
                className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:pointer-events-none text-white text-xs font-semibold shadow-sm transition"
              >
                Add Task
              </button>
            </div>
          </form>

          {/* Pending Tasks List */}
          {pendingTasks.length === 0 && completedTasks.length === 0 ? (
            <EmptyState
              icon={currentViewMeta.icon}
              title={`No Tasks in ${currentViewMeta.title}`}
              description={
                activeView === 'my-day'
                  ? 'Tasks added to My Day will appear here so you can focus on today.'
                  : activeView === 'important'
                  ? 'Star tasks you want to highlight as important.'
                  : activeView === 'planned'
                  ? 'Assign due dates to tasks to view your schedule here.'
                  : 'Start adding tasks to stay organized and productive.'
              }
              action={{
                label: 'Add a Task',
                icon: Plus,
                onClick: () => quickInputRef.current?.focus()
              }}
            />
          ) : (
            <div className="space-y-2">
              {pendingTasks.map(task => {
                const isOverdue = task.dueDate && task.dueDate < todayStr
                const isExpanded = expandedTaskId === task.id
                const taskListObj = lists.find(l => l.id === task.listId)

                return (
                  <div
                    key={task.id}
                    onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}
                    className="p-3 sm:p-3.5 rounded-2xl border transition-all cursor-pointer group bg-white/[0.03] hover:bg-white/[0.06] border-white/10 shadow-xs"
                  >
                    <div className="flex items-center justify-between gap-3">
                      {/* Checkbox & Title */}
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <button
                          type="button"
                          onClick={e => toggleComplete(task.id, e)}
                          className="p-1 rounded-lg transition shrink-0 text-slate-500 hover:text-emerald-400"
                          title="Complete task"
                        >
                          <Circle className="w-5 h-5" />
                        </button>

                        <div className="min-w-0 flex-1">
                          <span className="text-sm font-medium tracking-tight block truncate text-slate-100 group-hover:text-white">
                            {task.title}
                          </span>

                          <div className="flex items-center gap-2 flex-wrap mt-0.5">
                            {/* My Day indicator */}
                            {task.myDay && (
                              <span className="text-[10px] flex items-center gap-1 text-amber-400 font-medium">
                                <Sun className="w-3 h-3" />
                                <span>My Day</span>
                              </span>
                            )}

                            {/* Due Date */}
                            {task.dueDate && (
                              <span
                                className={`text-[10px] flex items-center gap-1 ${
                                  isOverdue ? 'text-rose-400 font-semibold' : 'text-slate-400'
                                }`}
                              >
                                <Calendar className="w-3 h-3" />
                                <span>{formatSmartDate(task.dueDate)}</span>
                                {isOverdue && <span>• Overdue</span>}
                              </span>
                            )}

                            {/* List badge */}
                            {taskListObj && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-medium">
                                {taskListObj.name}
                              </span>
                            )}

                            {task.notes && (
                              <span className="text-[10px] text-slate-500 truncate max-w-[200px]">
                                • {task.notes}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right action toggles: My Day, Star, Delete */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* My Day Toggle Button */}
                        <button
                          type="button"
                          onClick={e => toggleMyDay(task.id, e)}
                          className={`p-1.5 rounded-lg transition ${
                            task.myDay
                              ? 'text-amber-400 bg-amber-400/10'
                              : 'text-slate-500 hover:text-amber-300 hover:bg-white/10'
                          }`}
                          title={task.myDay ? 'Remove from My Day' : 'Add to My Day'}
                        >
                          <Sun className="w-4 h-4" />
                        </button>

                        {/* Star / Important Toggle Button */}
                        <button
                          type="button"
                          onClick={e => toggleImportant(task.id, e)}
                          className={`p-1.5 rounded-lg transition ${
                            task.important || task.priority === 'high'
                              ? 'text-rose-400 fill-rose-400 bg-rose-500/10'
                              : 'text-slate-500 hover:text-rose-400 hover:bg-white/10'
                          }`}
                          title={task.important ? 'Remove important' : 'Mark as important'}
                        >
                          <Star
                            className={`w-4 h-4 ${
                              task.important || task.priority === 'high' ? 'fill-rose-400' : ''
                            }`}
                          />
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={e => deleteTask(task.id, e)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition"
                          title="Delete task"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Inline Expanded Edit Panel */}
                    {isExpanded && (
                      <div
                        onClick={e => e.stopPropagation()}
                        className="mt-3 pt-3 border-t border-white/10 space-y-2.5 text-xs"
                      >
                        {/* Title inline edit */}
                        <div>
                          <label className="text-[11px] text-slate-400 block mb-1">Edit Title:</label>
                          <input
                            type="text"
                            value={task.title}
                            onChange={e => updateTaskField(task.id, 'title', e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-400"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          {/* Due date picker */}
                          <div>
                            <label className="text-[11px] text-slate-400 block mb-1">Due Date:</label>
                            <input
                              type="date"
                              value={task.dueDate || ''}
                              onChange={e => updateTaskField(task.id, 'dueDate', e.target.value || undefined)}
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-2.5 py-1 text-xs text-white focus:outline-none"
                            />
                          </div>

                          {/* List Assignment */}
                          <div>
                            <label className="text-[11px] text-slate-400 block mb-1">List:</label>
                            <select
                              value={task.listId || ''}
                              onChange={e => updateTaskField(task.id, 'listId', e.target.value || undefined)}
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-2.5 py-1 text-xs text-slate-200 focus:outline-none"
                            >
                              <option value="">No list (Default Tasks)</option>
                              {lists.map(l => (
                                <option key={l.id} value={l.id}>
                                  {l.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Priority */}
                          <div>
                            <label className="text-[11px] text-slate-400 block mb-1">Priority:</label>
                            <select
                              value={task.priority}
                              onChange={e =>
                                updateTaskField(task.id, 'priority', e.target.value as TaskPriority)
                              }
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-2.5 py-1 text-xs text-slate-200 focus:outline-none"
                            >
                              <option value="low">Low</option>
                              <option value="medium">Medium</option>
                              <option value="high">High</option>
                            </select>
                          </div>
                        </div>

                        {/* Notes */}
                        <div>
                          <label className="text-[11px] text-slate-400 block mb-1">Notes:</label>
                          <textarea
                            value={task.notes || ''}
                            onChange={e => updateTaskField(task.id, 'notes', e.target.value)}
                            placeholder="Add notes or subtasks..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none resize-none h-16 font-sans"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* Collapsible Completed Tasks Section */}
          {completedTasks.length > 0 && (
            <div className="mt-8 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setShowCompleted(!showCompleted)}
                className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition py-1"
              >
                {showCompleted ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                <span>Completed ({completedTasks.length})</span>
              </button>

              {showCompleted && (
                <div className="space-y-1.5 mt-3">
                  {completedTasks.map(task => (
                    <div
                      key={task.id}
                      className="p-3 rounded-2xl bg-white/[0.01] border border-white/5 opacity-60 flex items-center justify-between gap-3 group"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <button
                          type="button"
                          onClick={e => toggleComplete(task.id, e)}
                          className="p-1 rounded-lg text-emerald-400 hover:text-slate-400 transition"
                          title="Mark uncompleted"
                        >
                          <CheckCircle2 className="w-5 h-5 fill-emerald-500/20" />
                        </button>
                        <span className="text-sm font-medium line-through text-slate-500 truncate flex-1">
                          {task.title}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={e => deleteTask(task.id, e)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 transition"
                        title="Delete task"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
