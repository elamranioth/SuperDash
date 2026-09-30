import { useState, useEffect } from 'react'
import { Sunrise, ArrowRight, Scale, CheckSquare, Bell, BookMarked } from 'lucide-react'
import { morningAggregatorService, MorningAggregatedData } from '@/services/morning'

interface MorningWidgetProps {
  onOpenMorning: () => void
}

export default function MorningWidget({ onOpenMorning }: MorningWidgetProps) {
  const [data, setData] = useState<MorningAggregatedData | null>(null)

  const reload = async () => {
    const d = await morningAggregatorService.getMorningBriefing()
    setData(d)
  }

  useEffect(() => {
    reload()
    const handleRefresh = () => reload()
    window.addEventListener('superdash_task_updated', handleRefresh)
    window.addEventListener('superdash_hearings_action', handleRefresh)
    window.addEventListener('superdash_decisions_updated', handleRefresh)
    return () => {
      window.removeEventListener('superdash_task_updated', handleRefresh)
      window.removeEventListener('superdash_hearings_action', handleRefresh)
      window.removeEventListener('superdash_decisions_updated', handleRefresh)
    }
  }, [])

  const hearingsCount = data?.hearingsToday.length || 0
  const tasksCount = data?.tasksToday.filter(t => !t.completed).length || 0
  const remindersCount = data?.remindersToday.filter(r => !r.completed).length || 0
  const decisionsCount = data?.decisionsDue.length || 0

  return (
    <div className="h-full flex flex-col justify-between p-1">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-amber-400">
          <Sunrise className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wider">Today</span>
        </div>

        <button
          onClick={onOpenMorning}
          className="text-[11px] text-slate-400 hover:text-white flex items-center gap-0.5 transition"
        >
          <span>Open</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* Main Body */}
      <div className="my-auto grid grid-cols-2 gap-2 text-xs">
        <div className="p-2 rounded-xl bg-white/[0.04] border border-white/10 flex items-center gap-2">
          <Scale className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <div>
            <span className="font-bold text-white font-mono">{hearingsCount}</span>
            <span className="text-[10px] text-slate-400 ml-1">hearings</span>
          </div>
        </div>

        <div className="p-2 rounded-xl bg-white/[0.04] border border-white/10 flex items-center gap-2">
          <CheckSquare className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <div>
            <span className="font-bold text-white font-mono">{tasksCount}</span>
            <span className="text-[10px] text-slate-400 ml-1">tasks</span>
          </div>
        </div>

        <div className="p-2 rounded-xl bg-white/[0.04] border border-white/10 flex items-center gap-2">
          <Bell className="w-3.5 h-3.5 text-pink-400 shrink-0" />
          <div>
            <span className="font-bold text-white font-mono">{remindersCount}</span>
            <span className="text-[10px] text-slate-400 ml-1">reminders</span>
          </div>
        </div>

        <div className="p-2 rounded-xl bg-white/[0.04] border border-white/10 flex items-center gap-2">
          <BookMarked className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          <div>
            <span className="font-bold text-white font-mono">{decisionsCount}</span>
            <span className="text-[10px] text-slate-400 ml-1">reviews</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-2 pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-400">
        <span className="text-[10px]">Daily Briefing</span>
        <button
          type="button"
          onClick={onOpenMorning}
          className="text-amber-400/90 hover:underline"
        >
          Open Morning →
        </button>
      </div>
    </div>
  )
}
