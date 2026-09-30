import { useState } from 'react'
import { Plus, ArrowRight, Trash2, ExternalLink } from 'lucide-react'
import { CollectionSection } from '@/types'
import { ResolvedCollectionItem } from '@/services/collections'
import { sounds } from '@/utils/sound'

interface CollectionBoardViewProps {
  sections: CollectionSection[]
  items: ResolvedCollectionItem[]
  onOpenItem: (item: ResolvedCollectionItem) => void
  onMoveItemToSection: (itemId: string, sectionId?: string) => Promise<void>
  onAddSection: (title: string) => Promise<void>
  onRemoveItem: (itemId: string) => void
}

export default function CollectionBoardView({
  sections,
  items,
  onOpenItem,
  onMoveItemToSection,
  onAddSection,
  onRemoveItem
}: CollectionBoardViewProps) {
  const [newSectionTitle, setNewSectionTitle] = useState('')
  const [isAddingSection, setIsAddingSection] = useState(false)

  const handleCreateSection = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSectionTitle.trim()) return
    sounds.playSuccess()
    await onAddSection(newSectionTitle.trim())
    setNewSectionTitle('')
    setIsAddingSection(false)
  }

  // All columns to display: defined sections + "General" if there are items without a section
  const unassignedItems = items.filter(
    i => !i.sectionId || !sections.some(s => s.id === i.sectionId)
  )

  const columns: Array<{ id: string | undefined; title: string; count: number; items: ResolvedCollectionItem[] }> = []

  // If there are unassigned items or no sections, show General column
  if (unassignedItems.length > 0 || sections.length === 0) {
    columns.push({
      id: undefined,
      title: 'General',
      count: unassignedItems.length,
      items: unassignedItems
    })
  }

  sections
    .slice()
    .sort((a, b) => a.order - b.order)
    .forEach(sec => {
      const colItems = items.filter(i => i.sectionId === sec.id)
      columns.push({
        id: sec.id,
        title: sec.title,
        count: colItems.length,
        items: colItems
      })
    })

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 pt-1 items-start min-h-[360px]">
      {columns.map(col => (
        <div
          key={col.id || 'general'}
          className="w-72 shrink-0 rounded-2xl liquid-glass border border-white/10 flex flex-col max-h-[650px] overflow-hidden"
        >
          {/* Column Header */}
          <div className="p-3 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                {col.title}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-slate-300 font-semibold">
                {col.count}
              </span>
            </div>
          </div>

          {/* Column Items */}
          <div className="p-2 space-y-2.5 overflow-y-auto flex-1">
            {col.items.length === 0 ? (
              <div className="py-8 text-center text-[11px] text-slate-500 italic">
                No items in this section
              </div>
            ) : (
              col.items.map(item => {
                const displayTitle = item.liveTitle || item.title
                return (
                  <div
                    key={item.id}
                    onClick={() => onOpenItem(item)}
                    className="p-3 rounded-xl bg-black/30 border border-white/10 hover:border-indigo-400/40 hover:bg-white/5 transition cursor-pointer group"
                  >
                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      <span className="text-[9px] uppercase font-semibold text-slate-400 px-1.5 py-0.5 rounded bg-white/5">
                        {item.itemType}
                      </span>
                      <button
                        onClick={e => {
                          e.stopPropagation()
                          sounds.playClick()
                          onRemoveItem(item.id)
                        }}
                        className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-500 hover:text-rose-400 transition"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="text-xs font-semibold text-white group-hover:text-indigo-200 line-clamp-2 leading-snug">
                      {displayTitle}
                    </div>

                    {item.note && (
                      <p className="text-[10px] text-slate-400 italic mt-1 line-clamp-2">
                        {item.note}
                      </p>
                    )}

                    {/* Move selector */}
                    {sections.length > 0 && (
                      <div
                        className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[10px]"
                        onClick={e => e.stopPropagation()}
                      >
                        <span className="text-slate-500">Move to:</span>
                        <select
                          value={item.sectionId || ''}
                          onChange={e => onMoveItemToSection(item.id, e.target.value || undefined)}
                          className="bg-black/50 border border-white/10 text-slate-300 rounded px-1.5 py-0.5 text-[10px] focus:outline-none"
                        >
                          <option value="">General</option>
                          {sections.map(s => (
                            <option key={s.id} value={s.id}>
                              {s.title}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>
      ))}

      {/* Add New Section Button / Card */}
      <div className="w-64 shrink-0">
        {isAddingSection ? (
          <form
            onSubmit={handleCreateSection}
            className="p-3.5 rounded-2xl liquid-glass border border-indigo-400/40 space-y-2.5"
          >
            <input
              type="text"
              autoFocus
              placeholder="Section Name (e.g. TO READ, AGENTS)"
              value={newSectionTitle}
              onChange={e => setNewSectionTitle(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-400"
            />
            <div className="flex justify-end gap-1.5">
              <button
                type="button"
                onClick={() => setIsAddingSection(false)}
                className="px-2.5 py-1 text-[11px] text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[11px] font-semibold"
              >
                Add
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setIsAddingSection(true)}
            className="w-full py-3.5 px-4 rounded-2xl border border-dashed border-white/15 hover:border-white/40 text-slate-400 hover:text-white flex items-center justify-center gap-2 text-xs font-semibold transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Board Section</span>
          </button>
        )}
      </div>
    </div>
  )
}
