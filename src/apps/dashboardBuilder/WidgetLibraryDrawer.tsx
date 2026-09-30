import { useState, useMemo } from 'react'
import { Search, Plus, Sparkles, ChevronRight, X, Layers } from 'lucide-react'
import { getAllWidgets, RegisteredWidget } from '@/registry/widgetRegistry'
import { WidgetDefinition } from '@/types'
import { sounds } from '@/utils/sound'

interface WidgetLibraryDrawerProps {
  onAddWidget: (widgetId: string) => void
  onClose?: () => void
}

const CATEGORY_ORDER: Array<{ key: string; label: string }> = [
  { key: 'essential', label: 'Essential & System' },
  { key: 'productivity', label: 'Productivity' },
  { key: 'business', label: 'Business & Finance' },
  { key: 'information', label: 'Information & Clock' },
  { key: 'personal', label: 'Personal & Curated' }
]

function mapCategory(cat: string): string {
  if (cat === 'clock') return 'essential'
  if (cat === 'finance' || cat === 'legal') return 'business'
  if (cat === 'weather' || cat === 'tools') return 'information'
  if (cat === 'personal') return 'personal'
  return 'productivity'
}

export default function WidgetLibraryDrawer({
  onAddWidget,
  onClose
}: WidgetLibraryDrawerProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const allWidgets = useMemo(() => getAllWidgets(), [])

  // Filter widgets by search and category
  const filteredWidgets = useMemo(() => {
    return allWidgets.filter(w => {
      const q = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !q ||
        w.name.toLowerCase().includes(q) ||
        w.description.toLowerCase().includes(q) ||
        w.id.toLowerCase().includes(q)

      if (!matchesSearch) return false

      if (selectedCategory === 'all') return true
      return mapCategory(w.category) === selectedCategory
    })
  }, [allWidgets, searchQuery, selectedCategory])

  return (
    <>
      {/* Mobile backdrop */}
      {onClose && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
        />
      )}
      <div className="fixed md:static inset-y-0 left-0 z-50 w-full sm:w-80 border-r border-white/10 bg-slate-950/95 md:bg-black/40 backdrop-blur-md flex flex-col h-full shrink-0 select-none overflow-hidden shadow-2xl md:shadow-none">
      {/* Drawer Header */}
      <div className="p-3.5 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white tracking-wide uppercase">
              Widget Library
            </h3>
            <p className="text-[10px] text-slate-400">
              {allWidgets.length} registered widgets
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-2 -mr-1 rounded-xl text-slate-400 hover:text-white md:hidden"
            aria-label="Close widget library"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Search Input */}
      <div className="p-3 border-b border-white/10">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search widgets (e.g. timer, markets)..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-400 transition"
          />
        </div>

        {/* Category Pills */}
        <div className="flex gap-1 overflow-x-auto pt-2 pb-0.5">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold border shrink-0 transition ${
              selectedCategory === 'all'
                ? 'bg-white/20 border-white text-white'
                : 'bg-black/20 border-white/5 text-slate-400 hover:text-white'
            }`}
          >
            All
          </button>
          {CATEGORY_ORDER.map(cat => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold border shrink-0 transition ${
                selectedCategory === cat.key
                  ? 'bg-indigo-600/30 border-indigo-400 text-white'
                  : 'bg-black/20 border-white/5 text-slate-400 hover:text-white'
              }`}
            >
              {cat.label.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Widgets List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {filteredWidgets.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No widgets match your search.
          </div>
        ) : (
          filteredWidgets.map(widget => {
            const Icon = widget.icon
            return (
              <div
                key={widget.id}
                className="p-3 rounded-2xl liquid-glass border border-white/10 hover:border-indigo-400/40 hover:bg-white/10 transition flex flex-col justify-between group"
              >
                <div className="flex items-start gap-2.5 mb-2">
                  <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                    <Icon className="w-4 h-4 text-indigo-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-white group-hover:text-indigo-200 truncate">
                      {widget.name}
                    </div>
                    <div className="text-[10px] text-slate-400 line-clamp-2 mt-0.5 leading-snug">
                      {widget.description}
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                  <div className="flex gap-1">
                    {widget.supportedSizes.map(s => (
                      <span
                        key={s}
                        className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-white/5 border border-white/5 text-slate-400 font-mono"
                      >
                        {s}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      sounds.playSuccess()
                      onAddWidget(widget.id)
                      if (window.innerWidth < 768) {
                        onClose?.()
                      }
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600/40 hover:bg-indigo-600 border border-indigo-400/50 text-white text-[11px] font-semibold transition"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add</span>
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
    </>
  )
}
