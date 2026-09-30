import { useState, useEffect, useMemo, useRef } from 'react'
import {
  CheckSquare,
  Plus,
  CheckCircle2,
  Circle,
  Trash2,
  Calendar,
  AlertCircle,
  Tag,
  Search,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Bell,
  Clock,
  Repeat
} from 'lucide-react'
import confetti from 'canvas-confetti'
import { TaskItem, TaskPriority } from '@/types'
import { storageService, INITIAL_TASKS } from '@/services/storage'
import { sounds } from '@/utils/sound'
import { formatSmartDate, toLocalYYYYMMDD } from '@/utils/date'
import AppHeader from '@/components/AppWindow/AppHeader'
import EmptyState from '@/components/LiquidGlass/EmptyState'

export type TaskFilterTab = 'today' | 'upcoming' | 'reminders' | 'all' | 'completed'

interface TasksAppProps {
  initialFilter?: TaskFilterTab
}

export default function TasksApp({ initialFilter = 'today' }: TasksAppProps = {}) {
  const [tasks, setTasks] = useState<TaskItem[]>([])
  const [activeTab, setActiveTab] = useState<TaskFilterTab>(initialFilter)
  const [searchQuery, setSearchQuery] = useState('')

  // Quick Add input state
  const [quickTitle, setQuickTitle] = useState('')
  const [quickPriority, setQuickPriority] = useState<TaskPriority>('medium')
  const [quickDueDate, setQuickDueDate] = useState(toLocalYYYYMMDD())
  const quickInputRef = useRef<HTMLInputElement>(null)

  // Expanded task for detailed inspection
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null)

  useEffect(() => {
    storageService.get<TaskItem[]>('tasks', INITIAL_TASKS).then(loaded => {
      setTasks(loaded)
    })
  }, [])

  const saveTasks = (updated: TaskItem[]) => {
    setTasks(updated)
    storageService.set('tasks', updated)
    window.dispatchEvent(new CustomEvent('superdash_task_updated'))
  }

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

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!quickTitle.trim()) return

    sounds.playClick()
    const isReminderTab = activeTab === 'reminders'
    const newTask: TaskItem = {
      id: 'task-' + Date.now(),
      title: quickTitle.trim(),
      completed: false,
      priority: quickPriority,
      dueDate: quickDueDate,
      reminderTime: isReminderTab ? '16:00' : undefined,
      hasReminder: isReminderTab,
      tag: isReminderTab ? 'Reminder' : 'General',
      createdAt: Date.now()
    }

    saveTasks([newTask, ...tasks])
    setQuickTitle('')
  }

  const deleteTask = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    sounds.playClick()
    const updated = tasks.filter(t => t.id !== id)
    saveTasks(updated)
    if (expandedTaskId === id) setExpandedTaskId(null)
  }

  const updateTaskField = <K extends keyof TaskItem>(id: string, field: K, val: TaskItem[K]) => {
    const updated = tasks.map(t => (t.id === id ? { ...t, [field]: val } : t))
    saveTasks(updated)
  }

  const todayStr = toLocalYYYYMMDD()

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matches = t.title.toLowerCase().includes(q) || t.tag?.toLowerCase().includes(q)
        if (!matches) return false
      }

      if (activeTab === 'completed') return t.completed
      if (t.completed) return false // other tabs show uncompleted

      if (activeTab === 'today') {
        return !t.dueDate || t.dueDate <= todayStr
      }
      if (activeTab === 'upcoming') {
        return t.dueDate && t.dueDate > todayStr
      }
      if (activeTab === 'reminders') {
        return Boolean(t.hasReminder || t.tag === 'Reminder' || t.reminderTime)
      }
      return true
    })
  }, [tasks, activeTab, searchQuery, todayStr])

  const pendingCount = useMemo(() => tasks.filter(t => !t.completed).length, [tasks])
  const todayCount = useMemo(
    () => tasks.filter(t => !t.completed && (!t.dueDate || t.dueDate <= todayStr)).length,
    [tasks, todayStr]
  )
  const remindersCount = useMemo(
    () => tasks.filter(t => !t.completed && (t.hasReminder || t.tag === 'Reminder' || t.reminderTime)).length,
    [tasks]
  )

  return (
    <div className="flex h-full w-full bg-slate-950/90 text-white flex-col overflow-hidden select-none">
      {/* Standardized App Header */}
      <AppHeader
        icon={CheckSquare}
        title="Tasks"
        subtitle="Daily Objectives & Actionable Todo Checklist"
        gradient="from-emerald-400 to-teal-600"
        primaryAction={{
          label: 'Focus Input',
          icon: Plus,
          onClick: () => quickInputRef.current?.focus()
        }}
      >
        <div className="flex items-center justify-between gap-3">
          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {[
              { id: 'today', label: 'Today', count: todayCount },
              { id: 'upcoming', label: 'Upcoming' },
              { id: 'reminders', label: 'Reminders', count: remindersCount, icon: Bell },
              { id: 'all', label: 'All Tasks', count: pendingCount },
              { id: 'completed', label: 'Completed' }
            ].map(tab => {
              const TabIcon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    sounds.playClick()
                    setActiveTab(tab.id as TaskFilterTab)
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium transition ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 font-semibold'
                      : 'bg-white/5 hover:bg-white/10 text-slate-400'
                  }`}
                >
                  {TabIcon && (
                    <TabIcon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-300' : 'text-slate-400'}`} />
                  )}
                  <span>{tab.label}</span>
                  {typeof tab.count === 'number' && tab.count > 0 && (
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                        isActive ? 'bg-black/30 text-white' : 'bg-white/10 text-slate-300'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Quick Search */}
          <div className="relative w-44 hidden sm:block">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Filter tasks..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-3 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-sans"
            />
          </div>
        </div>
      </AppHeader>

      {/* Main Task Feed Container */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 max-w-3xl mx-auto w-full flex flex-col">
        {/* Prominent Quick-Add Input Bar */}
        <form
          onSubmit={handleQuickAdd}
          className="mb-4 sm:mb-5 p-2 rounded-2xl bg-white/[0.04] border border-white/15 focus-within:border-emerald-400/50 focus-within:bg-white/[0.07] transition-all flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shadow-sm"
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="p-1 sm:p-2 text-emerald-400 shrink-0">
              <Plus className="w-4 h-4" />
            </div>

            <input
              ref={quickInputRef}
              type="text"
              placeholder="What do you need to do? Hit Enter..."
              value={quickTitle}
              onChange={e => setQuickTitle(e.target.value)}
              className="flex-1 bg-transparent border-none text-sm text-white placeholder-slate-500 focus:outline-none font-sans min-w-0"
            />
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-1.5 shrink-0 pr-1 pl-7 sm:pl-0">
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
              className="px-4 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:pointer-events-none text-white text-xs font-semibold shadow-sm transition"
            >
              Add Task
            </button>
          </div>
        </form>

        {/* Task List */}
        {filteredTasks.length === 0 ? (
          <EmptyState
            icon={CheckSquare}
            title={activeTab === 'completed' ? 'No Completed Tasks' : 'All Clear!'}
            description={
              activeTab === 'completed'
                ? 'Check off tasks as you complete them to see your finished accomplishments here.'
                : activeTab === 'today'
                ? 'You have zero pending tasks scheduled for today. Take a break or add a new task above.'
                : 'No tasks match the selected filter.'
            }
            action={{
              label: 'Add a Task',
              icon: Plus,
              onClick: () => quickInputRef.current?.focus()
            }}
          />
        ) : (
          <div className="space-y-2">
            {filteredTasks.map(task => {
              const isExpanded = expandedTaskId === task.id
              const isOverdue =
                !task.completed && task.dueDate && task.dueDate < todayStr

              return (
                <div
                  key={task.id}
                  onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer group ${
                    task.completed
                      ? 'bg-white/[0.01] border-white/5 opacity-60'
                      : 'bg-white/[0.03] hover:bg-white/[0.06] border-white/10 shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    {/* Checkbox & Title */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <button
                        onClick={e => toggleComplete(task.id, e)}
                        className={`p-1 rounded-lg transition shrink-0 ${
                          task.completed
                            ? 'text-emerald-400'
                            : 'text-slate-500 hover:text-emerald-400'
                        }`}
                      >
                        {task.completed ? (
                          <CheckCircle2 className="w-5 h-5 fill-emerald-500/20" />
                        ) : (
                          <Circle className="w-5 h-5" />
                        )}
                      </button>

                      <div className="min-w-0 flex-1">
                        <span
                          className={`text-sm font-medium tracking-tight block truncate ${
                            task.completed
                              ? 'line-through text-slate-500'
                              : 'text-slate-100 group-hover:text-white'
                          }`}
                        >
                          {task.title}
                        </span>

                        <div className="flex items-center gap-2 flex-wrap mt-0.5">
                          {task.dueDate && (
                            <span
                              className={`text-[11px] flex items-center gap-1 ${
                                isOverdue ? 'text-rose-400 font-semibold' : 'text-slate-400'
                              }`}
                            >
                              <Calendar className="w-3 h-3" />
                              <span>{formatSmartDate(task.dueDate)}</span>
                              {isOverdue && <span>• Overdue</span>}
                            </span>
                          )}

                          {(task.hasReminder || task.reminderTime) && (
                            <span className="text-[11px] flex items-center gap-1 text-amber-400 font-medium bg-amber-400/10 px-1.5 py-0.5 rounded-md">
                              <Bell className="w-3 h-3" />
                              <span>{task.reminderTime || 'Alert'}</span>
                              {task.repeat && task.repeat !== 'none' && (
                                <span className="text-[10px] text-amber-300 capitalize flex items-center gap-0.5">
                                  <Repeat className="w-2.5 h-2.5" />
                                  {task.repeat}
                                </span>
                              )}
                            </span>
                          )}

                          {task.notes && (
                            <span className="text-[11px] text-slate-400 truncate max-w-[200px]">
                              • {task.notes}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Priority & Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      {task.priority && task.priority !== 'medium' && (
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] uppercase font-semibold ${
                            task.priority === 'high'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : 'bg-slate-500/20 text-slate-300'
                          }`}
                        >
                          {task.priority}
                        </span>
                      )}

                      <button
                        onClick={e => deleteTask(task.id, e)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition"
                        title="Delete task"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Expanded Edit Panel */}
                  {isExpanded && (
                    <div
                      onClick={e => e.stopPropagation()}
                      className="mt-3 pt-3 border-t border-white/10 space-y-2 text-xs"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        <div className="flex items-center justify-between sm:justify-start gap-2 bg-white/5 sm:bg-transparent p-2 sm:p-0 rounded-xl">
                          <label className="text-slate-400 text-[11px]">Due Date:</label>
                          <input
                            type="date"
                            value={task.dueDate || ''}
                            onChange={e => updateTaskField(task.id, 'dueDate', e.target.value)}
                            className="bg-black/30 border border-white/10 rounded-lg px-2 py-1 text-white text-xs focus:outline-none"
                          />
                        </div>

                        <div className="flex items-center justify-between sm:justify-start gap-2 bg-white/5 sm:bg-transparent p-2 sm:p-0 rounded-xl">
                          <label className="text-slate-400 text-[11px] flex items-center gap-1">
                            <Bell className="w-3 h-3 text-amber-400" /> Reminder:
                          </label>
                          <input
                            type="time"
                            value={task.reminderTime || ''}
                            onChange={e => {
                              const val = e.target.value
                              updateTaskField(task.id, 'reminderTime', val || undefined)
                              updateTaskField(task.id, 'hasReminder', Boolean(val))
                            }}
                            className="bg-black/30 border border-white/10 rounded-lg px-2 py-1 text-white text-xs focus:outline-none"
                          />
                        </div>

                        <div className="flex items-center justify-between sm:justify-start gap-2 bg-white/5 sm:bg-transparent p-2 sm:p-0 rounded-xl">
                          <label className="text-slate-400 text-[11px]">Repeat:</label>
                          <select
                            value={task.repeat || 'none'}
                            onChange={e =>
                              updateTaskField(task.id, 'repeat', e.target.value as 'none' | 'daily' | 'weekly' | 'monthly')
                            }
                            className="bg-black/30 border border-white/10 rounded-lg px-2 py-1 text-white text-xs focus:outline-none"
                          >
                            <option value="none">None</option>
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        <div className="flex items-center justify-between sm:justify-start gap-2 bg-white/5 sm:bg-transparent p-2 sm:p-0 rounded-xl">
                          <label className="text-slate-400 text-[11px]">Priority:</label>
                          <select
                            value={task.priority}
                            onChange={e =>
                              updateTaskField(task.id, 'priority', e.target.value as TaskPriority)
                            }
                            className="bg-black/30 border border-white/10 rounded-lg px-2 py-1 text-white text-xs focus:outline-none"
                          >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                          </select>
                        </div>

                        <div className="flex items-center justify-between sm:justify-start gap-2 bg-white/5 sm:bg-transparent p-2 sm:p-0 rounded-xl">
                          <label className="text-slate-400 text-[11px]">Category:</label>
                          <input
                            type="text"
                            value={task.tag || ''}
                            placeholder="e.g. Work, Personal"
                            onChange={e => updateTaskField(task.id, 'tag', e.target.value)}
                            className="bg-black/30 border border-white/10 rounded-lg px-2 py-1 text-white text-xs w-28 focus:outline-none"
                          />
                        </div>

                        <div className="flex items-center justify-between sm:justify-start gap-2 bg-white/5 sm:bg-transparent p-2 sm:p-0 rounded-xl">
                          <label className="text-slate-400 text-[11px]">Notes:</label>
                          <input
                            type="text"
                            value={task.notes || ''}
                            placeholder="Optional notes or alert info..."
                            onChange={e => updateTaskField(task.id, 'notes', e.target.value)}
                            className="bg-black/30 border border-white/10 rounded-lg px-2 py-1 text-white text-xs flex-1 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
