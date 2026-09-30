import { Search, Command } from 'lucide-react'
import { sounds } from '@/utils/sound'

interface GlobalSearchBarProps {
  onOpen: () => void
}

export default function GlobalSearchBar({ onOpen }: GlobalSearchBarProps) {
  return (
    <div
      onClick={() => {
        sounds.playClick()
        onOpen()
      }}
      className="w-full max-w-xl cursor-pointer group px-0.5 sm:px-0"
    >
      <div className="glass-panel group-hover:bg-white/10 group-hover:border-indigo-500/40 transition-all duration-300 rounded-2xl md:rounded-full px-3.5 sm:px-5 py-2.5 sm:py-3.5 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-2.5 sm:gap-3 text-slate-400 group-hover:text-slate-200 transition min-w-0">
          <Search className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400 group-hover:scale-110 transition-transform shrink-0" />
          <span className="text-xs sm:text-sm md:text-base font-normal select-none text-slate-400 group-hover:text-slate-300 truncate">
            <span className="inline sm:hidden">Search SuperDash...</span>
            <span className="hidden sm:inline">Search apps, tools, notes, calendar...</span>
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-400 group-hover:text-slate-200 font-mono shadow-sm shrink-0">
          <span className="text-xs">⌘</span>
          <span className="text-xs font-semibold">K</span>
        </div>
      </div>
    </div>
  )
}
