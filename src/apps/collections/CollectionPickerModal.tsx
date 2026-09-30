import { useState, useEffect, useMemo } from 'react'
import { X, Search, Plus, Check, Sparkles, FolderPlus } from 'lucide-react'
import { Collection, CollectionItemType, CollectionSourceType } from '@/types'
import { collectionsRepository } from '@/services/collections'
import { sounds } from '@/utils/sound'

export interface CollectionPickerPayload {
  title: string
  description?: string
  itemType: CollectionItemType
  sourceType?: CollectionSourceType
  sourceId?: string
  url?: string
  manualContent?: string
  note?: string
}

interface CollectionPickerModalProps {
  isOpen: boolean
  payload: CollectionPickerPayload | null
  onClose: () => void
  onSuccess?: (addedCollectionNames: string[]) => void
}

export default function CollectionPickerModal({
  isOpen,
  payload,
  onClose,
  onSuccess
}: CollectionPickerModalProps) {
  const [collections, setCollections] = useState<Collection[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedColIds, setSelectedColIds] = useState<string[]>([])
  const [curatorNote, setCuratorNote] = useState('')
  const [isCreatingNew, setIsCreatingNew] = useState(false)
  const [newColName, setNewColName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      collectionsRepository.getAllCollections(false).then(setCollections)
      setSelectedColIds([])
      setCuratorNote(payload?.note || '')
      setIsCreatingNew(false)
      setNewColName('')
    }
  }, [isOpen, payload])

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return collections
    const q = searchQuery.toLowerCase().trim()
    return collections.filter(c => c.name.toLowerCase().includes(q))
  }, [collections, searchQuery])

  if (!isOpen || !payload) return null

  const toggleSelect = (id: string) => {
    sounds.playClick()
    setSelectedColIds(prev =>
      prev.includes(id) ? prev.filter(cId => cId !== id) : [...prev, id]
    )
  }

  const handleCreateFastCollection = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newColName.trim()) return
    sounds.playSuccess()
    const newCol = await collectionsRepository.createCollection({
      name: newColName.trim(),
      coverType: 'gradient',
      coverValue: 'from-violet-600 via-indigo-600 to-cyan-500',
      icon: 'Sparkles',
      viewMode: 'grid',
      favorite: false,
      archived: false,
      sections: []
    })
    setCollections(prev => [newCol, ...prev])
    setSelectedColIds(prev => [...prev, newCol.id])
    setNewColName('')
    setIsCreatingNew(false)
  }

  const handleConfirmAdd = async () => {
    if (selectedColIds.length === 0) return
    setIsSubmitting(true)
    sounds.playSuccess()

    const addedNames: string[] = []
    for (const colId of selectedColIds) {
      const col = collections.find(c => c.id === colId)
      if (col) addedNames.push(col.name)

      await collectionsRepository.addItem({
        collectionId: colId,
        itemType: payload.itemType,
        sourceType: payload.sourceType,
        sourceId: payload.sourceId,
        title: payload.title,
        description: payload.description,
        url: payload.url,
        manualContent: payload.manualContent,
        note: curatorNote.trim() || undefined,
        position: 0
      })
    }

    setIsSubmitting(false)
    if (onSuccess) onSuccess(addedNames)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-md flex items-center justify-center p-4">
      <div className="liquid-glass-heavy border border-white/20 rounded-3xl p-6 w-full max-w-md shadow-2xl animate-window-open flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center">
              <FolderPlus className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Add to Collection</h2>
              <p className="text-[11px] text-slate-400 truncate max-w-[220px]">
                {payload.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Optional Curator Note */}
        <div className="mb-3">
          <label className="block text-[11px] font-semibold text-slate-300 mb-1">
            Curator Note <span className="text-slate-500 font-normal">(optional)</span>
          </label>
          <input
            type="text"
            placeholder="Why does this belong in this collection?"
            value={curatorNote}
            onChange={e => setCuratorNote(e.target.value)}
            className="w-full px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-400"
          />
        </div>

        {/* Search collections */}
        <div className="relative mb-3">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search collections..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-400"
          />
        </div>

        {/* Collection items list */}
        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 min-h-[160px] max-h-[220px]">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No matching collections
            </div>
          ) : (
            filtered.map(col => {
              const isSelected = selectedColIds.includes(col.id)
              return (
                <button
                  key={col.id}
                  onClick={() => toggleSelect(col.id)}
                  className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between border transition ${
                    isSelected
                      ? 'bg-indigo-600/30 border-indigo-400/60 text-white shadow-sm'
                      : 'bg-black/20 border-white/5 text-slate-300 hover:bg-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs font-semibold truncate">{col.name}</span>
                  </div>
                  <div
                    className={`w-4 h-4 rounded-md border flex items-center justify-center transition ${
                      isSelected
                        ? 'bg-indigo-500 border-indigo-400 text-white'
                        : 'border-white/20'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </button>
              )
            })
          )}
        </div>

        {/* Fast New Collection Form / Toggle */}
        <div className="mt-3 pt-3 border-t border-white/10">
          {isCreatingNew ? (
            <form onSubmit={handleCreateFastCollection} className="flex gap-2">
              <input
                type="text"
                autoFocus
                placeholder="Collection name..."
                value={newColName}
                onChange={e => setNewColName(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-xl bg-black/40 border border-white/15 text-white text-xs focus:outline-none focus:border-indigo-400"
              />
              <button
                type="submit"
                disabled={!newColName.trim()}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold disabled:opacity-50"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => setIsCreatingNew(false)}
                className="px-2 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
            </form>
          ) : (
            <button
              onClick={() => setIsCreatingNew(true)}
              className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ New Collection</span>
            </button>
          )}
        </div>

        {/* Footer Confirm */}
        <div className="flex items-center justify-between pt-4 mt-3 border-t border-white/10">
          <span className="text-[11px] text-slate-400">
            {selectedColIds.length} {selectedColIds.length === 1 ? 'collection' : 'collections'} selected
          </span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-white rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmAdd}
              disabled={selectedColIds.length === 0 || isSubmitting}
              className="px-4 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow transition disabled:opacity-40"
            >
              Add Item
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
