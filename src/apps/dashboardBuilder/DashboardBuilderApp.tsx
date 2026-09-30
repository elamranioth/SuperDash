import { useState, useEffect, useCallback, useRef } from 'react'
import {
  DashboardDefinition,
  DashboardItem,
  WidgetSize
} from '@/types'
import { dashboardRepository } from '@/services/dashboardBuilder'
import BuilderToolbar, { ResponsiveDevice } from './BuilderToolbar'
import WidgetLibraryDrawer from './WidgetLibraryDrawer'
import BuilderCanvas from './BuilderCanvas'
import WidgetSettingsPanel from './WidgetSettingsPanel'
import DashboardsListModal from './DashboardsListModal'
import { sounds } from '@/utils/sound'

interface DashboardBuilderAppProps {
  initialDashboardId?: string
  onOpenApp?: (appId: string, customProps?: Record<string, unknown>) => void
}

export default function DashboardBuilderApp({
  initialDashboardId,
  onOpenApp = () => {}
}: DashboardBuilderAppProps) {
  const [dashboards, setDashboards] = useState<DashboardDefinition[]>([])
  const [activeDashboard, setActiveDashboard] = useState<DashboardDefinition | null>(null)

  // Undo/Redo history stacks
  const [history, setHistory] = useState<DashboardDefinition[]>([])
  const [redoStack, setRedoStack] = useState<DashboardDefinition[]>([])

  // Editor states
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
  const [activeDevice, setActiveDevice] = useState<ResponsiveDevice>(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 640) return 'mobile'
    if (typeof window !== 'undefined' && window.innerWidth < 1024) return 'tablet'
    return 'desktop'
  })
  const [zoom, setZoom] = useState<number>(100)
  const [isPreviewMode, setIsPreviewMode] = useState<boolean>(false)
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'dirty'>('saved')
  const [isDashboardsListOpen, setIsDashboardsListOpen] = useState<boolean>(false)
  const [isLibraryOpen, setIsLibraryOpen] = useState<boolean>(() => typeof window !== 'undefined' && window.innerWidth >= 768)
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(() => typeof window !== 'undefined' && window.innerWidth >= 768)

  const autosaveTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Load all dashboards on mount
  const refreshDashboards = useCallback(async () => {
    const list = await dashboardRepository.getAllDashboards()
    setDashboards(list)

    if (!activeDashboard) {
      if (initialDashboardId) {
        const found = list.find(d => d.id === initialDashboardId)
        setActiveDashboard(found || list[0])
      } else {
        const active = await dashboardRepository.getActiveDashboard()
        setActiveDashboard(active)
      }
    } else {
      const freshActive = list.find(d => d.id === activeDashboard.id)
      if (freshActive) {
        setActiveDashboard(freshActive)
      }
    }
  }, [initialDashboardId, activeDashboard])

  useEffect(() => {
    refreshDashboards()
    return () => {
      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current)
    }
  }, [])

  // Push new state to history for Undo
  const pushState = useCallback((nextDashboard: DashboardDefinition) => {
    if (!activeDashboard) return
    setHistory(prev => [...prev.slice(-20), activeDashboard])
    setRedoStack([])
    setActiveDashboard(nextDashboard)
    setSaveStatus('dirty')

    // Debounced autosave
    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current)
    autosaveTimerRef.current = setTimeout(async () => {
      setSaveStatus('saving')
      await dashboardRepository.updateDashboard(nextDashboard.id, nextDashboard)
      setSaveStatus('saved')
    }, 800)
  }, [activeDashboard])

  // Explicit Save
  const handleSave = async () => {
    if (!activeDashboard) return
    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current)
    setSaveStatus('saving')
    await dashboardRepository.updateDashboard(activeDashboard.id, activeDashboard)
    await refreshDashboards()
    setSaveStatus('saved')
  }

  // Undo
  const handleUndo = () => {
    if (history.length === 0 || !activeDashboard) return
    const prev = history[history.length - 1]
    setHistory(prevHistory => prevHistory.slice(0, -1))
    setRedoStack(prevRedo => [activeDashboard, ...prevRedo])
    setActiveDashboard(prev)
    setSaveStatus('dirty')
    dashboardRepository.updateDashboard(prev.id, prev)
  }

  // Redo
  const handleRedo = () => {
    if (redoStack.length === 0 || !activeDashboard) return
    const next = redoStack[0]
    setRedoStack(prevRedo => prevRedo.slice(1))
    setHistory(prevHistory => [...prevHistory, activeDashboard])
    setActiveDashboard(next)
    setSaveStatus('dirty')
    dashboardRepository.updateDashboard(next.id, next)
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault()
        if (e.shiftKey) {
          handleRedo()
        } else {
          handleUndo()
        }
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
        e.preventDefault()
        sounds.playSuccess()
        handleSave()
      } else if (e.key === 'Escape') {
        setSelectedItemId(null)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [history, redoStack, activeDashboard])

  // Add Widget from Library
  const handleAddWidget = (widgetId: string) => {
    if (!activeDashboard) return
    sounds.playSuccess()

    const size: WidgetSize =
      widgetId === 'quicknotes' || widgetId === 'markets' || widgetId === 'finance'
        ? 'md'
        : 'sm'
    const width = size === 'md' ? 6 : 4
    const count = activeDashboard.items.length

    const newItem: DashboardItem = {
      id: `w-${widgetId}-${Date.now()}`,
      dashboardId: activeDashboard.id,
      widgetId,
      x: (count * 4) % 12,
      y: Math.floor((count * 4) / 12),
      width,
      height: 1,
      size,
      settings: {},
      visibility: { desktop: true, tablet: true, mobile: true }
    }

    const updated: DashboardDefinition = {
      ...activeDashboard,
      items: [...activeDashboard.items, newItem]
    }

    pushState(updated)
    setSelectedItemId(newItem.id)
  }

  // Update Item on Canvas
  const handleUpdateItem = (itemId: string, updates: Partial<DashboardItem>) => {
    if (!activeDashboard) return
    const updatedItems = activeDashboard.items.map(it =>
      it.id === itemId ? { ...it, ...updates } : it
    )
    const updated: DashboardDefinition = {
      ...activeDashboard,
      items: updatedItems
    }
    pushState(updated)
  }

  // Remove Item
  const handleRemoveItem = (itemId: string) => {
    if (!activeDashboard) return
    sounds.playClick()
    const updatedItems = activeDashboard.items.filter(it => it.id !== itemId)
    const updated: DashboardDefinition = {
      ...activeDashboard,
      items: updatedItems
    }
    pushState(updated)
    if (selectedItemId === itemId) setSelectedItemId(null)
  }

  // Update Global Dashboard Config
  const handleUpdateDashboardConfig = (updates: Partial<DashboardDefinition>) => {
    if (!activeDashboard) return
    const updated: DashboardDefinition = {
      ...activeDashboard,
      ...updates
    }
    pushState(updated)
  }

  // Switch Active Dashboard
  const handleSelectDashboard = async (id: string) => {
    sounds.playClick()
    await dashboardRepository.setActiveDashboard(id)
    const found = dashboards.find(d => d.id === id)
    if (found) {
      setActiveDashboard(found)
      setSelectedItemId(null)
      setHistory([])
      setRedoStack([])
    }
  }

  if (!activeDashboard) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-slate-950 text-slate-400 text-xs">
        Loading dashboard configuration...
      </div>
    )
  }

  const selectedItem = activeDashboard.items.find(it => it.id === selectedItemId) || null

  return (
    <div className="h-full w-full flex flex-col bg-slate-950/80 text-white overflow-hidden relative select-none">
      {/* Top Builder Toolbar */}
      <BuilderToolbar
        dashboardName={activeDashboard.name}
        activeDevice={activeDevice}
        zoom={zoom}
        canUndo={history.length > 0}
        canRedo={redoStack.length > 0}
        isPreviewMode={isPreviewMode}
        saveStatus={saveStatus}
        isLibraryOpen={isLibraryOpen}
        isSettingsOpen={isSettingsOpen}
        onToggleLibrary={() => setIsLibraryOpen(prev => !prev)}
        onToggleSettings={() => setIsSettingsOpen(prev => !prev)}
        onSelectDevice={setActiveDevice}
        onSetZoom={setZoom}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onTogglePreview={() => setIsPreviewMode(prev => !prev)}
        onSave={handleSave}
        onOpenDashboardsList={() => setIsDashboardsListOpen(true)}
        onClose={() => {
          // Switch to this dashboard on the main desktop and close builder
          dashboardRepository.setActiveDashboard(activeDashboard.id)
          window.dispatchEvent(new CustomEvent('superdash_close_app', { detail: { appId: 'dashboardbuilder' } }))
        }}
      />

      {/* Main 3-Panel Editor Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left: Widget Library (hidden in preview mode) */}
        {!isPreviewMode && isLibraryOpen && (
          <WidgetLibraryDrawer
            onAddWidget={handleAddWidget}
            onClose={() => setIsLibraryOpen(false)}
          />
        )}

        {/* Center: Live Interactive Canvas */}
        <BuilderCanvas
          dashboard={activeDashboard}
          activeDevice={activeDevice}
          zoom={zoom}
          selectedItemId={selectedItemId}
          isPreviewMode={isPreviewMode}
          onSelectItem={id => {
            setSelectedItemId(id)
            if (id && typeof window !== 'undefined' && window.innerWidth < 768) {
              setIsSettingsOpen(true)
            }
          }}
          onUpdateItem={handleUpdateItem}
          onRemoveItem={handleRemoveItem}
          onOpenLibrary={() => setIsLibraryOpen(true)}
        />

        {/* Right: Selected Widget or Global Settings (hidden in preview mode) */}
        {!isPreviewMode && isSettingsOpen && (
          <WidgetSettingsPanel
            selectedItem={selectedItem}
            dashboard={activeDashboard}
            onUpdateItem={handleUpdateItem}
            onRemoveItem={handleRemoveItem}
            onUpdateDashboardConfig={handleUpdateDashboardConfig}
            onClose={() => setIsSettingsOpen(false)}
          />
        )}
      </div>

      {/* Dashboards Manager Modal */}
      <DashboardsListModal
        isOpen={isDashboardsListOpen}
        dashboards={dashboards}
        currentDashboardId={activeDashboard.id}
        onClose={() => setIsDashboardsListOpen(false)}
        onSelectDashboard={handleSelectDashboard}
        onRefreshList={refreshDashboards}
      />
    </div>
  )
}
