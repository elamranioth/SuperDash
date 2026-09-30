import { useState, useEffect } from 'react'
import { Lightbulb, Plus, ArrowRight, Sparkles } from 'lucide-react'
import { ideasService } from '@/services/ideas'
import GlassButton from '@/components/LiquidGlass/GlassButton'
import { sounds } from '@/utils/sound'

interface QuickIdeaWidgetProps {
  onOpenIdeas: () => void
}

export default function QuickIdeaWidget({ onOpenIdeas }: QuickIdeaWidgetProps) {
  const [ideaText, setIdeaText] = useState('')
  const [waitingCount, setWaitingCount] = useState(0)

  const reload = async () => {
    const count = await ideasService.getWaitingCount()
    setWaitingCount(count)
  }

  useEffect(() => {
    reload()
    const unsub = ideasService.subscribe(reload)
    return () => unsub()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!ideaText.trim()) return

    sounds.playSuccess()
    await ideasService.add({
      title: ideaText.trim(),
      status: 'INBOX'
    })
    setIdeaText('')
    reload()
  }

  return (
    <div className="h-full flex flex-col justify-between p-1">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-amber-400">
          <Lightbulb className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wider">Quick Idea</span>
        </div>

        <button
          onClick={onOpenIdeas}
          className="text-[11px] text-slate-400 hover:text-white flex items-center gap-0.5 transition"
        >
          <span>Ideas</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="my-auto">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/[0.06] border border-white/10 focus-within:border-amber-400/40">
          <input
            type="text"
            value={ideaText}
            onChange={e => setIdeaText(e.target.value)}
            placeholder="What's on your mind?"
            className="flex-1 bg-transparent border-none text-xs text-white placeholder-slate-500 px-2 py-1 focus:outline-none"
          />
          <GlassButton
            type="submit"
            size="sm"
            variant="primary"
            disabled={!ideaText.trim()}
            className="px-2.5 py-1 text-[11px] bg-amber-500/80 hover:bg-amber-500 border-amber-400/40 text-black font-semibold"
          >
            Save
          </GlassButton>
        </div>
      </form>

      {/* Footer count */}
      <div className="mt-2 pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-400">
        <span>Ideas waiting: <strong className="text-amber-300 font-mono">{waitingCount}</strong></span>
        <button
          type="button"
          onClick={onOpenIdeas}
          className="text-amber-400/90 hover:underline"
        >
          Review Inbox →
        </button>
      </div>
    </div>
  )
}
