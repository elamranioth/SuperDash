import {
  Monitor,
  Tablet,
  Smartphone,
  Undo2,
  Redo2,
  Eye,
  EyeOff,
  Save,
  Check,
  ChevronDown,
  Layers,
  ZoomIn,
  ZoomOut,
  X,
  Plus,
  Sliders
} from 'lucide-react'
import { sounds } from '@/utils/sound'

export type ResponsiveDevice = 'desktop' | 'tablet' | 'mobile'

interface BuilderToolbarProps {
  dashboardName: string
  activeDevice: ResponsiveDevice
  zoom: number // 50, 75, 100
  canUndo: boolean
  canRedo: boolean
  isPreviewMode: boolean
  saveStatus: 'saved' | 'saving' | 'dirty'
  isLibraryOpen?: boolean
  isSettingsOpen?: boolean
  onToggleLibrary?: () => void
  onToggleSettings?: () => void
  onSelectDevice: (device: ResponsiveDevice) => void
  onSetZoom: (zoom: number) => void
  onUndo: () => void
  onRedo: () => void
  onTogglePreview: () => void
  onSave: () => void
  onOpenDashboardsList: () => void
  onClose: () => void
}

export default function BuilderToolbar({
  dashboardName,
  activeDevice,
  zoom,
  canUndo,
  canRedo,
  isPreviewMode,
  saveStatus,
  isLibraryOpen,
  isSettingsOpen,
  onToggleLibrary,
  onToggleSettings,
  onSelectDevice,
  onSetZoom,
  onUndo,
  onRedo,
  onTogglePreview,
  onSave,
  onOpenDashboardsList,
  onClose
}: BuilderToolbarProps) {
  return (
    <div className="px-2.5 sm:px-4 py-2 border-b border-white/10 flex items-center justify-between gap-1.5 sm:gap-3 bg-black/40 backdrop-blur-md shrink-0 select-none overflow-x-auto no-scrollbar">
      {/* Left: Switcher & Dashboards Manager */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={onOpenDashboardsList}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white transition group"
          title="Switch or manage dashboards"
        >
          <span className="text-indigo-400 font-bold truncate max-w-[90px] sm:max-w-[150px]">
            {dashboardName}
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition" />
        </button>

        {/* Quick Add Widget button for mobile / quick access */}
        {onToggleLibrary && (
          <button
            onClick={onToggleLibrary}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition border ${
              isLibraryOpen
                ? 'bg-indigo-600/30 border-indigo-400/50 text-indigo-300'
                : 'bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-white/10'
            }`}
            title="Toggle Widget Library"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Add</span>
          </button>
        )}

        {/* Quick Settings button */}
        {onToggleSettings && (
          <button
            onClick={onToggleSettings}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition border ${
              isSettingsOpen
                ? 'bg-indigo-600/30 border-indigo-400/50 text-indigo-300'
                : 'bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-white/10'
            }`}
            title="Toggle Dashboard & Widget Settings"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Settings</span>
          </button>
        )}

        {/* Save Status pill */}
        <div className="hidden md:flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-lg bg-black/30 border border-white/5 font-mono">
          {saveStatus === 'saved' ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400">Saved</span>
            </>
          ) : saveStatus === 'saving' ? (
            <>
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span className="text-amber-400">Saving...</span>
            </>
          ) : (
            <>
              <div className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="text-amber-300">Draft edited</span>
            </>
          )}
        </div>
      </div>

      {/* Center: Responsive Breakpoints & Zoom */}
      <div className="flex items-center gap-1">
        {/* Device Switcher */}
        <div className="flex items-center bg-black/40 border border-white/10 rounded-xl p-0.5">
          <button
            onClick={() => {
              sounds.playClick()
              onSelectDevice('desktop')
            }}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition ${
              activeDevice === 'desktop'
                ? 'bg-white/20 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Desktop 12-column view"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Desktop</span>
          </button>
          <button
            onClick={() => {
              sounds.playClick()
              onSelectDevice('tablet')
            }}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition ${
              activeDevice === 'tablet'
                ? 'bg-white/20 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Tablet 8-column view"
          >
            <Tablet className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Tablet</span>
          </button>
          <button
            onClick={() => {
              sounds.playClick()
              onSelectDevice('mobile')
            }}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition ${
              activeDevice === 'mobile'
                ? 'bg-white/20 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Mobile 4-column view"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Mobile</span>
          </button>
        </div>

        {/* Zoom Selector */}
        <div className="hidden lg:flex items-center bg-black/40 border border-white/10 rounded-xl p-0.5 ml-2">
          {[50, 75, 100].map(val => (
            <button
              key={val}
              onClick={() => {
                sounds.playClick()
                onSetZoom(val)
              }}
              className={`px-2 py-1 rounded-lg text-[10px] font-mono font-medium transition ${
                zoom === val ? 'bg-white/20 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {val}%
            </button>
          ))}
        </div>
      </div>

      {/* Right: Undo/Redo, Preview, Save, Close */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => {
            sounds.playClick()
            onUndo()
          }}
          disabled={!canUndo}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition disabled:opacity-30 disabled:pointer-events-none"
          title="Undo (⌘Z)"
        >
          <Undo2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            sounds.playClick()
            onRedo()
          }}
          disabled={!canRedo}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition disabled:opacity-30 disabled:pointer-events-none"
          title="Redo (⌘⇧Z)"
        >
          <Redo2 className="w-4 h-4" />
        </button>

        <button
          onClick={() => {
            sounds.playClick()
            onTogglePreview()
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition ${
            isPreviewMode
              ? 'bg-indigo-600 border-indigo-400 text-white shadow-md'
              : 'bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-white/10'
          }`}
          title="Toggle Clean Preview Mode"
        >
          {isPreviewMode ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          <span>{isPreviewMode ? 'Exit Preview' : 'Preview'}</span>
        </button>

        <button
          onClick={() => {
            sounds.playSuccess()
            onSave()
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition"
        >
          <Save className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Save</span>
        </button>

        <button
          onClick={onClose}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
          title="Close Dashboard Builder"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
