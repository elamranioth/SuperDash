import { useState, useEffect } from 'react'
import { BookMarked, ArrowRight, Clock, CheckCircle2 } from 'lucide-react'
import { decisionService } from '@/services/decisions'
import { DecisionItem } from '@/types'
import { toLocalYYYYMMDD } from '@/utils/date'

interface DecisionsWidgetProps {
  onOpenDecisions: () => void
}

export default function DecisionsWidget({ onOpenDecisions }: DecisionsWidgetProps) {
  const [reviewsDue, setReviewsDue] = useState<DecisionItem[]>([])

  const reload = async () => {
    const list = await decisionService.getReviewsDue()
    setReviewsDue(list)
  }

  useEffect(() => {
    reload()
    const unsub = decisionService.subscribe(reload)
    return () => unsub()
  }, [])

  return (
    <div className="h-full flex flex-col justify-between p-1">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-blue-400">
          <BookMarked className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wider">Decisions to Review</span>
        </div>

        <button
          onClick={onOpenDecisions}
          className="text-[11px] text-slate-400 hover:text-white flex items-center gap-0.5 transition"
        >
          <span>View All</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* Main Body */}
      <div className="my-auto space-y-1.5">
        {reviewsDue.length === 0 ? (
          <div className="py-2 text-center text-xs text-slate-400">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto mb-1 opacity-80" />
            <p className="font-medium text-slate-300">All caught up</p>
            <p className="text-[10px] text-slate-500">No decisions due for review</p>
          </div>
        ) : (
          reviewsDue.slice(0, 2).map(item => (
            <div
              key={item.id}
              onClick={onOpenDecisions}
              className="p-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 cursor-pointer transition text-xs flex items-center justify-between border border-blue-500/15"
            >
              <div className="flex-1 pr-2">
                <span className="font-semibold text-white line-clamp-1 text-[11px]">
                  {item.title}
                </span>
                <span className="text-[10px] text-slate-400">
                  {item.reviewDate === toLocalYYYYMMDD()
                    ? 'Review today'
                    : `Due ${item.reviewDate}`}
                </span>
              </div>
              <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="mt-2 pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-400">
        <span>
          <strong className="text-amber-300 font-mono">{reviewsDue.length}</strong> reviews due
        </span>
        <button
          type="button"
          onClick={onOpenDecisions}
          className="text-blue-400/90 hover:underline"
        >
          Open Book →
        </button>
      </div>
    </div>
  )
}
