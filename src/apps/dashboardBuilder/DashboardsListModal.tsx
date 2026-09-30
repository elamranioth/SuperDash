import { useState } from 'react'
import {
  X,
  Plus,
  Copy,
  Trash2,
  Check,
  Star,
  Download,
  Upload,
  Edit2,
  ArrowRight,
  Layers,
  Sparkles
} from 'lucide-react'
import { DashboardDefinition } from '@/types'
import { dashboardRepository } from '@/services/dashboardBuilder'
import { sounds } from '@/utils/sound'

interface DashboardsListModalProps {
  isOpen: boolean
  dashboards: DashboardDefinition[]
  currentDashboardId: string
  onClose: () => void
  onSelectDashboard: (id: string) => void
  onRefreshList: () => Promise<void>
}

export default function DashboardsListModal({
  isOpen,
  dashboards,
  currentDashboardId,
  onClose,
  onSelectDashboard,
  onRefreshList
}: DashboardsListModalProps) {
  const [isCreatingNew, setIsCreatingNew] = useState(false)
  const [newDashName, setNewDashName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [importError, setImportError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newDashName.trim()) return

    sounds.playSuccess()
    const created = await dashboardRepository.createDashboard({
      name: newDashName.trim()
    })
    setNewDashName('')
    setIsCreatingNew(false)
    await onRefreshList()
    onSelectDashboard(created.id)
  }

  const handleDuplicate = async (id: string) => {
    sounds.playSuccess()
    const duplicated = await dashboardRepository.duplicateDashboard(id)
    await onRefreshList()
    onSelectDashboard(duplicated.id)
  }

  const handleSetDefault = async (id: string) => {
    sounds.playClick()
    await dashboardRepository.setDefaultDashboard(id)
    await onRefreshList()
  }

  const handleDelete = async (id: string, name: string) => {
    if (dashboards.length <= 1) {
      alert('You cannot delete the only remaining dashboard.')
      return
    }
    if (window.confirm(`Are you sure you want to delete dashboard "${name}"?`)) {
      sounds.playClick()
      await dashboardRepository.deleteDashboard(id)
      await onRefreshList()
    }
  }

  const handleStartRename = (dash: DashboardDefinition) => {
    setEditingId(dash.id)
    setEditingName(dash.name)
  }

  const handleSaveRename = async (id: string) => {
    if (!editingName.trim()) return
    sounds.playClick()
    await dashboardRepository.updateDashboard(id, { name: editingName.trim() })
    setEditingId(null)
    await onRefreshList()
  }

  const handleExport = async (id: string, name: string) => {
    sounds.playSuccess()
    const jsonStr = await dashboardRepository.exportDashboard(id)
    const blob = new Blob([jsonStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `superdash_${name.toLowerCase().replace(/\s+/g, '_')}_layout.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImportError(null)

    try {
      const text = await file.text()
      const imported = await dashboardRepository.importDashboard(text)
      sounds.playSuccess()
      await onRefreshList()
      onSelectDashboard(imported.id)
    } catch (err: unknown) {
      setImportError(err instanceof Error ? err.message : 'Failed to import dashboard JSON')
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="liquid-glass-heavy border border-white/20 rounded-3xl p-4 sm:p-6 w-full max-w-xl shadow-2xl animate-window-open flex flex-col max-h-[92vh] sm:max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center">
              <Layers className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Manage Dashboards
              </h2>
              <p className="text-[11px] text-slate-400">
                Switch workspaces, set default layout, duplicate or export
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Import Error alert if any */}
        {importError && (
          <div className="mb-3 p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-xs text-rose-300">
            {importError}
          </div>
        )}

        {/* Dashboards List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 min-h-[220px]">
          {dashboards.map(dash => {
            const isCurrent = dash.id === currentDashboardId
            const isEditing = editingId === dash.id

            return (
              <div
                key={dash.id}
                className={`p-3 sm:p-3.5 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 ${
                  isCurrent
                    ? 'bg-indigo-600/20 border-indigo-400/50 shadow-md'
                    : 'bg-black/30 border-white/10 hover:border-white/25 hover:bg-white/5'
                }`}
              >
                {/* Left Info / Rename form */}
                <div className="flex-1 min-w-0">
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        autoFocus
                        value={editingName}
                        onChange={e => setEditingName(e.target.value)}
                        className="px-2.5 py-1 rounded-lg bg-black/60 border border-white/20 text-white text-xs focus:outline-none"
                      />
                      <button
                        onClick={() => handleSaveRename(dash.id)}
                        className="px-2.5 py-1 bg-indigo-600 text-white rounded-lg text-xs font-semibold"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="text-xs text-slate-400"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white truncate">
                          {dash.name}
                        </span>
                        {dash.isDefault && (
                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase font-mono font-bold">
                            Default
                          </span>
                        )}
                        {isCurrent && (
                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase font-mono font-bold">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 truncate">
                        {dash.items.length} {dash.items.length === 1 ? 'widget' : 'widgets'} ·{' '}
                        {dash.description || 'Custom Workspace'}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {!isCurrent && (
                    <button
                      onClick={() => {
                        sounds.playClick()
                        onSelectDashboard(dash.id)
                        onClose()
                      }}
                      className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition flex items-center gap-1"
                    >
                      <span>Open</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}

                  {!dash.isDefault && (
                    <button
                      onClick={() => handleSetDefault(dash.id)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-amber-300 hover:bg-white/10 transition"
                      title="Set as Default Starting Dashboard"
                    >
                      <Star className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    onClick={() => handleStartRename(dash)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
                    title="Rename"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDuplicate(dash.id)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
                    title="Duplicate Dashboard"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleExport(dash.id, dash.name)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-indigo-300 hover:bg-white/10 transition"
                    title="Export JSON Configuration"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>

                  {dashboards.length > 1 && (
                    <button
                      onClick={() => handleDelete(dash.id, dash.name)}
                      className="p-1.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-white/10 transition"
                      title="Delete Dashboard"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Bottom Actions: New Dashboard & Import */}
        <div className="pt-4 border-t border-white/10 mt-3 flex items-center justify-between gap-3">
          {isCreatingNew ? (
            <form onSubmit={handleCreate} className="flex-1 flex gap-2">
              <input
                type="text"
                autoFocus
                placeholder="New dashboard name (e.g. Legal, Research)..."
                value={newDashName}
                onChange={e => setNewDashName(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-xl bg-black/40 border border-white/20 text-white text-xs focus:outline-none focus:border-indigo-400"
              />
              <button
                type="submit"
                disabled={!newDashName.trim()}
                className="px-4 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold disabled:opacity-50"
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
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsCreatingNew(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ New Dashboard</span>
              </button>

              <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-300 hover:text-white cursor-pointer transition">
                <Upload className="w-3.5 h-3.5 text-indigo-400" />
                <span>Import JSON</span>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleImportFile}
                  className="hidden"
                />
              </label>
            </div>
          )}

          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs text-slate-400 hover:text-white rounded-xl transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
