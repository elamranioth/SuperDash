import { useState, useEffect } from 'react'
import { CheckSquare, Circle, CheckCircle2, ExternalLink } from 'lucide-react'
import { TaskItem } from '@/types'
import { storageService, INITIAL_TASKS } from '@/services/storage'
import { sounds } from '@/utils/sound'

interface TasksWidgetProps {
  onOpenTasks?: () => void
}

export default function TasksWidget({ onOpenTasks }: TasksWidgetProps) {
  const [tasks, setTasks] = useState<TaskItem[]>([])

  useEffect(() => {
    const load = () => {
      storageService.get<TaskItem[]>('tasks', INITIAL_TASKS).then(setTasks)
    }
    load()
    window.addEventListener('superdash_task_updated', load)
    return () => window.removeEventListener('superdash_task_updated', load)
  }, [])

  const handleToggle = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    sounds.playClick()
    const updated = tasks.map(t => (t.id === id ? { ...t, completed: !t.completed } : t))
    setTasks(updated)
    storageService.set('tasks', updated)
  }

  const activeTasks = tasks.filter(t => !t.completed)
  const completedCount = tasks.filter(t => t.completed).length

  return (
    <div className="liquid-glass rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 flex flex-col justify-between shadow-xl w-full max-w-full h-full relative group select-none">
      <div className="glass-specular" />

      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-white/10 relative z-10">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
          <CheckSquare className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="truncate">Priority Tasks</span>
        </div>

        {onOpenTasks && (
          <button
            onClick={() => {
              sounds.playClick()
              onOpenTasks()
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
            title="Open full Tasks app"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Tasks List */}
      <div className="space-y-1.5 relative z-10 my-2 flex-1">
        {activeTasks.length === 0 ? (
          <p className="text-xs text-slate-500 italic py-4 text-center">All caught up! Zero pending tasks.</p>
        ) : (
          activeTasks.slice(0, 3).map(task => (
            <div
              key={task.id}
              onClick={e => handleToggle(task.id, e)}
              className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] cursor-pointer flex items-center justify-between gap-2 text-xs transition"
            >
              <div className="flex items-center gap-2 truncate">
                <Circle className="w-3.5 h-3.5 text-slate-400 hover:text-emerald-400 shrink-0" />
                <span className="truncate text-slate-200">{task.title}</span>
              </div>
              <span
                className={`text-[9px] px-1.5 py-0.5 rounded font-mono uppercase tracking-wider ${
                  task.priority === 'high'
                    ? 'bg-rose-500/20 text-rose-300'
                    : task.priority === 'medium'
                    ? 'bg-amber-500/20 text-amber-300'
                    : 'bg-emerald-500/20 text-emerald-300'
                }`}
              >
                {task.priority}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="pt-2 border-t border-white/10 text-[10px] text-slate-400 relative z-10 flex items-center justify-between">
        <span>{activeTasks.length} pending</span>
        <span className="font-mono text-emerald-400">{completedCount} completed</span>
      </div>
    </div>
  )
}
