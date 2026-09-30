import { useState, useEffect } from 'react'
import {
  Folder,
  FileText,
  FileSpreadsheet,
  FileImage,
  FileCode,
  File,
  LayoutGrid,
  List,
  Search,
  Star,
  Clock,
  HardDrive,
  Info,
  Download,
  Trash2,
  Plus
} from 'lucide-react'
import { DocumentItem } from '@/types'
import { storageService, INITIAL_DOCUMENTS } from '@/services/storage'
import { sounds } from '@/utils/sound'
import AppHeader from '@/components/AppWindow/AppHeader'
import EmptyState from '@/components/LiquidGlass/EmptyState'
import GlassModal from '@/components/LiquidGlass/GlassModal'
import GlassButton from '@/components/LiquidGlass/GlassButton'

interface FilesAppProps {
  initialFileId?: string
}

export default function FilesApp({ initialFileId }: FilesAppProps) {
  const [documents, setDocuments] = useState<DocumentItem[]>([])
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  // New file state
  const [newFileName, setNewFileName] = useState('')
  const [newFileCategory, setNewFileCategory] = useState('Architecture')
  const [newFileType, setNewFileType] = useState<DocumentItem['type']>('document')
  const [newFileContent, setNewFileContent] = useState('')

  useEffect(() => {
    storageService.get<DocumentItem[]>('stored_documents', INITIAL_DOCUMENTS).then(docs => {
      setDocuments(docs)
      if (initialFileId) {
        const found = docs.find(d => d.id === initialFileId)
        if (found) {
          setSelectedDoc(found)
          setIsDetailModalOpen(true)
        }
      }
    })
  }, [initialFileId])

  const saveDocuments = (list: DocumentItem[]) => {
    setDocuments(list)
    storageService.set('stored_documents', list)
  }

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    sounds.playClick()
    const updated = documents.map(d => (d.id === id ? { ...d, isFavorite: !d.isFavorite } : d))
    saveDocuments(updated)
    if (selectedDoc?.id === id) {
      setSelectedDoc(prev => (prev ? { ...prev, isFavorite: !prev.isFavorite } : null))
    }
  }

  const handleDelete = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    sounds.playClick()
    saveDocuments(documents.filter(d => d.id !== id))
    if (selectedDoc?.id === id) setIsDetailModalOpen(false)
  }

  const handleCreateDocument = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newFileName.trim()) return

    sounds.playSuccess()
    const extMap: Record<DocumentItem['type'], string> = {
      document: '.md',
      spreadsheet: '.csv',
      presentation: '.key',
      pdf: '.pdf',
      image: '.png',
      code: '.ts',
      note: '.txt'
    }

    let finalName = newFileName.trim()
    const expectedExt = extMap[newFileType]
    if (!finalName.includes('.')) {
      finalName += expectedExt
    }

    const byteLen = new TextEncoder().encode(newFileContent || ' ').length

    const newDoc: DocumentItem = {
      id: `doc-${Date.now()}`,
      name: finalName,
      type: newFileType,
      sizeBytes: Math.max(byteLen, 128),
      category: newFileCategory,
      isFavorite: false,
      updatedAt: Date.now(),
      contentSnippet: newFileContent.trim() || undefined
    }

    const updated = [newDoc, ...documents]
    saveDocuments(updated)
    setIsCreateModalOpen(false)
    setNewFileName('')
    setNewFileContent('')
    setSelectedDoc(newDoc)
    setIsDetailModalOpen(true)
  }

  const handleDownload = (doc: DocumentItem) => {
    sounds.playSuccess()
    const content = doc.contentSnippet || `# ${doc.name}\n\nCreated in SuperDash.\nCategory: ${doc.category}`
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = doc.name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getFileIcon = (type: DocumentItem['type'], className = 'w-7 h-7') => {
    switch (type) {
      case 'spreadsheet':
        return <FileSpreadsheet className={`${className} text-emerald-400`} />
      case 'pdf':
        return <FileText className={`${className} text-rose-400`} />
      case 'document':
      case 'note':
        return <FileText className={`${className} text-indigo-400`} />
      case 'image':
        return <FileImage className={`${className} text-amber-400`} />
      case 'code':
        return <FileCode className={`${className} text-sky-400`} />
      default:
        return <File className={`${className} text-slate-400`} />
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const totalBytes = documents.reduce((acc, d) => acc + (d.sizeBytes || 0), 0)

  // Categories list
  const uniqueCategories = Array.from(new Set(documents.map(d => d.category))).filter(Boolean)

  const filteredDocs = documents.filter(doc => {
    const matchSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase())
    if (!matchSearch) return false
    if (activeCategory === 'favorites') return doc.isFavorite
    if (activeCategory !== 'all') return doc.category.toLowerCase() === activeCategory.toLowerCase()
    return true
  })

  return (
    <div className="flex h-full w-full bg-slate-950/80 text-white flex-col overflow-hidden select-none">
      {/* Standard AppHeader */}
      <AppHeader
        title="Files"
        subtitle={`${documents.length} documents • ${formatFileSize(totalBytes)} stored`}
        icon={Folder}
        primaryAction={{
          label: 'New Document',
          icon: Plus,
          onClick: () => {
            sounds.playClick()
            setIsCreateModalOpen(true)
          }
        }}
      />

      {/* Sub-toolbar: Search + View Mode */}
      <div className="px-5 py-2.5 border-b border-white/10 flex items-center justify-between gap-3 bg-white/[0.02] shrink-0">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search documents and code..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white/5 rounded-xl p-0.5 border border-white/10">
            <button
              onClick={() => {
                sounds.playClick()
                setViewMode('grid')
              }}
              title="Grid View"
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'grid' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                sounds.playClick()
                setViewMode('list')
              }}
              title="List View"
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'list' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Area: Sidebar + Browser Canvas */}
      <div className="flex-1 flex overflow-hidden divide-x divide-white/10">
        {/* Categories Sidebar */}
        <div className="w-48 bg-black/20 p-3 space-y-1 shrink-0 hidden sm:block overflow-y-auto">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 px-3 py-1.5">
            Collections
          </div>

          <button
            onClick={() => {
              sounds.playClick()
              setActiveCategory('all')
            }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
              activeCategory === 'all'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <HardDrive className="w-3.5 h-3.5" />
              <span>All Files</span>
            </div>
            <span className="text-[10px] opacity-70 font-mono">{documents.length}</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick()
              setActiveCategory('favorites')
            }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
              activeCategory === 'favorites'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <Star className="w-3.5 h-3.5 text-amber-400" />
              <span>Favorites</span>
            </div>
            <span className="text-[10px] opacity-70 font-mono">
              {documents.filter(d => d.isFavorite).length}
            </span>
          </button>

          <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 px-3 pt-3 pb-1">
            Tags & Folders
          </div>

          {uniqueCategories.map(cat => (
            <button
              key={cat}
              onClick={() => {
                sounds.playClick()
                setActiveCategory(cat)
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
                activeCategory === cat
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <Folder className="w-3.5 h-3.5 shrink-0 opacity-70" />
                <span className="truncate">{cat}</span>
              </div>
              <span className="text-[10px] opacity-70 font-mono">
                {documents.filter(d => d.category === cat).length}
              </span>
            </button>
          ))}
        </div>

        {/* Content Canvas */}
        <div className="flex-1 p-3 sm:p-5 overflow-y-auto">
          {/* Mobile Category Rail */}
          <div className="sm:hidden flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-3 mb-2 border-b border-white/5">
            <button
              onClick={() => {
                sounds.playClick()
                setActiveCategory('all')
              }}
              className={`px-3 py-1 rounded-xl text-xs font-medium whitespace-nowrap transition shrink-0 ${
                activeCategory === 'all'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              All Files ({documents.length})
            </button>
            <button
              onClick={() => {
                sounds.playClick()
                setActiveCategory('favorites')
              }}
              className={`px-3 py-1 rounded-xl text-xs font-medium whitespace-nowrap transition shrink-0 flex items-center gap-1 ${
                activeCategory === 'favorites'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              <Star className="w-3 h-3 text-amber-400" />
              <span>Favorites</span>
            </button>
            {uniqueCategories.map(cat => (
              <button
                key={cat}
                onClick={() => {
                  sounds.playClick()
                  setActiveCategory(cat)
                }}
                className={`px-3 py-1 rounded-xl text-xs font-medium whitespace-nowrap transition shrink-0 ${
                  activeCategory === cat
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {filteredDocs.length === 0 ? (
            <EmptyState
              icon={Folder}
              title={searchQuery ? 'No matching files' : 'No documents in this collection'}
              description={
                searchQuery
                  ? `No files matching "${searchQuery}". Try a different keyword.`
                  : 'Create or upload your first document to build your knowledge vault.'
              }
              action={{
                label: 'Create Document',
                icon: Plus,
                onClick: () => {
                  sounds.playClick()
                  setIsCreateModalOpen(true)
                }
              }}
            />
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {filteredDocs.map(doc => (
                <div
                  key={doc.id}
                  onClick={() => {
                    sounds.playClick()
                    setSelectedDoc(doc)
                    setIsDetailModalOpen(true)
                  }}
                  className="p-4 rounded-2xl liquid-glass flex flex-col justify-between group cursor-pointer hover:border-indigo-400/40 transition h-40 border border-white/10"
                >
                  <div className="flex items-start justify-between">
                    {getFileIcon(doc.type)}
                    <button
                      onClick={e => toggleFavorite(doc.id, e)}
                      className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-amber-400 transition"
                      title={doc.isFavorite ? 'Remove Favorite' : 'Mark as Favorite'}
                    >
                      <Star
                        className={`w-4 h-4 ${doc.isFavorite ? 'text-amber-400 fill-amber-400' : ''}`}
                      />
                    </button>
                  </div>

                  <div>
                    <div className="text-xs font-semibold text-white truncate" title={doc.name}>
                      {doc.name}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between font-mono">
                      <span>{formatFileSize(doc.sizeBytes)}</span>
                      <span className="text-slate-500 font-sans">{doc.category}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-1.5">
              {filteredDocs.map(doc => (
                <div
                  key={doc.id}
                  onClick={() => {
                    sounds.playClick()
                    setSelectedDoc(doc)
                    setIsDetailModalOpen(true)
                  }}
                  className="p-3 rounded-xl liquid-glass flex items-center justify-between cursor-pointer hover:border-indigo-400/40 transition group border border-white/5"
                >
                  <div className="flex items-center gap-3 truncate">
                    <div>{getFileIcon(doc.type, 'w-5 h-5')}</div>
                    <span className="text-xs font-medium text-white truncate">{doc.name}</span>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 text-xs text-slate-400">
                    <span className="text-[11px] px-2 py-0.5 rounded-md bg-white/5 hidden sm:inline text-slate-300">
                      {doc.category}
                    </span>
                    <span className="font-mono text-[11px]">{formatFileSize(doc.sizeBytes)}</span>
                    <button
                      onClick={e => toggleFavorite(doc.id, e)}
                      className="p-1 hover:text-amber-400"
                    >
                      <Star
                        className={`w-4 h-4 ${doc.isFavorite ? 'text-amber-400 fill-amber-400' : ''}`}
                      />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* File Details Modal */}
      {isDetailModalOpen && selectedDoc && (
        <GlassModal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-indigo-400" />
              <span>Document Inspector</span>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-4">
              {getFileIcon(selectedDoc.type, 'w-10 h-10')}
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold text-white truncate">{selectedDoc.name}</div>
                <div className="text-xs text-slate-400 mt-0.5">
                  {formatFileSize(selectedDoc.sizeBytes)} • {selectedDoc.category}
                </div>
              </div>
            </div>

            {selectedDoc.contentSnippet ? (
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                  Preview Content
                </span>
                <p className="p-3 rounded-xl bg-black/40 border border-white/10 text-xs text-slate-300 leading-relaxed font-mono whitespace-pre-wrap max-h-56 overflow-y-auto">
                  {selectedDoc.contentSnippet}
                </p>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-white/5 text-center text-xs text-slate-400">
                Binary or empty document. Download to inspect locally.
              </div>
            )}

            <div className="pt-3 border-t border-white/10 flex items-center justify-between">
              <button
                onClick={() => handleDelete(selectedDoc.id)}
                className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 font-semibold"
              >
                <Trash2 className="w-4 h-4" /> Delete
              </button>

              <div className="flex items-center gap-2">
                <GlassButton
                  variant="default"
                  onClick={e => toggleFavorite(selectedDoc.id, e)}
                >
                  <Star
                    className={`w-3.5 h-3.5 mr-1 ${
                      selectedDoc.isFavorite ? 'text-amber-400 fill-amber-400' : ''
                    }`}
                  />
                  {selectedDoc.isFavorite ? 'Favorited' : 'Favorite'}
                </GlassButton>

                <GlassButton
                  variant="primary"
                  onClick={() => handleDownload(selectedDoc)}
                >
                  <Download className="w-3.5 h-3.5 mr-1" /> Download
                </GlassButton>
              </div>
            </div>
          </div>
        </GlassModal>
      )}

      {/* Create New Document Modal */}
      {isCreateModalOpen && (
        <GlassModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title={
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4 text-indigo-400" />
              <span>Create New Document</span>
            </div>
          }
        >
          <form onSubmit={handleCreateDocument} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Document Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. system_architecture.md"
                value={newFileName}
                onChange={e => setNewFileName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Format / Type
                </label>
                <select
                  value={newFileType}
                  onChange={e => setNewFileType(e.target.value as DocumentItem['type'])}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                >
                  <option value="document">Markdown (.md)</option>
                  <option value="code">Code Script (.ts / .py)</option>
                  <option value="spreadsheet">Spreadsheet (.csv)</option>
                  <option value="note">Plain Text (.txt)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Collection / Category
                </label>
                <input
                  type="text"
                  placeholder="e.g. Architecture, Finance"
                  value={newFileCategory}
                  onChange={e => setNewFileCategory(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Document Content
              </label>
              <textarea
                rows={4}
                placeholder="Write or paste document contents..."
                value={newFileContent}
                onChange={e => setNewFileContent(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white font-mono focus:outline-none focus:border-indigo-500/50 resize-none"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <GlassButton variant="ghost" onClick={() => setIsCreateModalOpen(false)}>
                Cancel
              </GlassButton>
              <GlassButton variant="primary">
                Create Document
              </GlassButton>
            </div>
          </form>
        </GlassModal>
      )}
    </div>
  )
}
