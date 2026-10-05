import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  DashboardSettings,
  ThemeMode,
  DashboardWidgetConfig,
  WidgetSize,
  DashboardDefinition
} from '@/types'
import { storageService, DEFAULT_SETTINGS, WALLPAPER_COLLECTION } from '@/services/storage'
import { dashboardRepository } from '@/services/dashboardBuilder'
import { setupDefaultCommands } from '@/services/commands'
import { favoritesService } from '@/services/favorites'
import { recentAppsService } from '@/services/recent'
import { timerService } from '@/services/timer'
import { App as CapApp } from '@capacitor/app'
import TopMenuBar from '@/components/Dashboard/TopMenuBar'
import ControlCenter from '@/components/Dashboard/ControlCenter'
import Dock from '@/components/Dashboard/Dock'
import GlobalSearchBar from '@/components/GlobalSearch/GlobalSearchBar'
import GlobalSearchModal from '@/components/GlobalSearch/GlobalSearchModal'
import MarketsWidget from '@/components/Widgets/MarketsWidget'
import DateTimeWidget from '@/components/Widgets/DateTimeWidget'

import TasksWidget from '@/components/Widgets/TasksWidget'
import QuickNotesWidget from '@/components/Widgets/QuickNotesWidget'
import TimerWidget from '@/components/Widgets/TimerWidget'
import WorldClockWidget from '@/components/Widgets/WorldClockWidget'
import HearingsWidget from '@/components/Widgets/HearingsWidget'
import FinanceWidget from '@/components/Widgets/FinanceWidget'
import QuickIdeaWidget from '@/components/Widgets/QuickIdeaWidget'
import FocusWidget from '@/components/Widgets/FocusWidget'
import DecisionsWidget from '@/components/Widgets/DecisionsWidget'
import MorningWidget from '@/components/Widgets/MorningWidget'
import CollectionWidget from '@/components/Widgets/CollectionWidget'
import AppLauncher from '@/components/AppLauncher/AppLauncher'
import AppWindow from '@/components/AppWindow/AppWindow'
import GlassWidget from '@/components/LiquidGlass/GlassWidget'
import { getAllWidgets } from '@/registry/widgetRegistry'
import { sounds } from '@/utils/sound'
import { Plus, Check, LayoutGrid } from 'lucide-react'
import AppLockScreen from '@/components/Security/AppLockScreen'
import { securityService } from '@/services/security'
import { syncService } from '@/services/sync'

export default function Dashboard() {
  const [settings, setSettings] = useState<DashboardSettings>(DEFAULT_SETTINGS)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isControlCenterOpen, setIsControlCenterOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [isAddWidgetModalOpen, setIsAddWidgetModalOpen] = useState(false)

  // Window management states
  const [openAppIds, setOpenAppIds] = useState<string[]>([])
  const [minimizedAppIds, setMinimizedAppIds] = useState<string[]>([])
  const [maximizedAppIds, setMaximizedAppIds] = useState<string[]>([])
  const [activeAppId, setActiveAppId] = useState<string | null>(null)
  const [appWindowProps, setAppWindowProps] = useState<Record<string, Record<string, unknown>>>({})
  const [activeDashboard, setActiveDashboard] = useState<DashboardDefinition | null>(null)
  const [isLocked, setIsLocked] = useState(false)

  // Security and Sync services lifecycle
  useEffect(() => {
    // 1. Subscribe to security lock state
    const unsubLock = securityService.subscribeLockState(locked => {
      setIsLocked(locked)
    })

    // 2. Track activity for auto-lock timeout
    const handleUserActivity = () => {
      securityService.recordActivity()
    }
    window.addEventListener('pointerdown', handleUserActivity, { passive: true })
    window.addEventListener('keydown', handleUserActivity, { passive: true })

    const handleVisibility = () => {
      securityService.handleVisibilityChange(document.hidden)
    }
    document.addEventListener('visibilitychange', handleVisibility)

    // 3. Start local-first sync engine
    syncService.start()

    return () => {
      unsubLock()
      window.removeEventListener('pointerdown', handleUserActivity)
      window.removeEventListener('keydown', handleUserActivity)
      document.removeEventListener('visibilitychange', handleVisibility)
      syncService.stop()
    }
  }, [])

  // Load settings and active dashboard on mount
  useEffect(() => {
    storageService.get<DashboardSettings>('settings', DEFAULT_SETTINGS).then(s => {
      setSettings(s)
    })
    dashboardRepository.getActiveDashboard().then(setActiveDashboard)

    const unsubDash = dashboardRepository.subscribe(() => {
      dashboardRepository.getActiveDashboard().then(setActiveDashboard)
    })
    return () => unsubDash()
  }, [])

  // Apply Theme and Liquid Glass CSS variables to document root
  useEffect(() => {
    const root = document.documentElement
    if (settings.theme === 'light') {
      root.classList.add('theme-light')
      root.classList.remove('dark')
    } else if (settings.theme === 'dark') {
      root.classList.remove('theme-light')
      root.classList.add('dark')
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      if (prefersDark) {
        root.classList.remove('theme-light')
        root.classList.add('dark')
      } else {
        root.classList.add('theme-light')
        root.classList.remove('dark')
      }
    }

    // Set dynamic glass blur & opacity
    root.style.setProperty('--glass-blur-amt', `${settings.glassBlur}px`)
  }, [settings.theme, settings.glassBlur])

  // Open App handler
  const handleOpenApp = useCallback((appId: string, customProps?: Record<string, unknown>) => {
    sounds.playClick()
    // Backward-compatibility and consolidated redirection
    if (appId === 'notes') {
      appId = 'plan'
      customProps = { initialTab: 'notes', ...(customProps || {}) }
    } else if (appId === 'tasks' || appId === 'reminders') {
      appId = 'plan'
      customProps = { initialTab: 'tasks', ...(customProps || {}) }
    } else if (appId === 'converter') {
      appId = 'calculator'
      customProps = { ...(customProps || {}), initialMode: 'convert' }
    } else if (appId === 'timer') {
      appId = 'time'
      customProps = { ...(customProps || {}), initialMode: 'timer' }
    } else if (appId === 'focus') {
      appId = 'time'
      customProps = { ...(customProps || {}), initialMode: 'focus' }
    } else if (appId === 'worldclock') {
      appId = 'time'
      customProps = { ...(customProps || {}), initialMode: 'world' }
    } else if (appId === 'updates') {
      appId = 'settings'
      customProps = { ...(customProps || {}), initialTab: 'updates' }
    } else if (appId === 'dashboardbuilder') {
      appId = 'settings'
      customProps = { ...(customProps || {}), initialTab: 'dashboard' }
    } else if (appId === 'morning') {
      dashboardRepository.setActiveDashboard('dash-morning').catch(() => {})
      return
    } else if (appId === 'wellness') {
      appId = 'live'
      customProps = { ...(customProps || {}), openWellness: true }
    }


    recentAppsService.recordAppLaunch(appId)
    setOpenAppIds(prev => (prev.includes(appId) ? prev : [...prev, appId]))
    setMinimizedAppIds(prev => prev.filter(id => id !== appId))
    setActiveAppId(appId)
    if (customProps) {
      setAppWindowProps(prev => ({ ...prev, [appId]: customProps }))
    }
  }, [])

  // Close App handler
  const handleCloseApp = useCallback((appId: string) => {
    setOpenAppIds(prev => prev.filter(id => id !== appId))
    setMinimizedAppIds(prev => prev.filter(id => id !== appId))
    setMaximizedAppIds(prev => prev.filter(id => id !== appId))
    setActiveAppId(prev => (prev === appId ? null : prev))
  }, [])

  // Minimize App handler
  const handleMinimizeApp = useCallback((appId: string) => {
    setMinimizedAppIds(prev => (prev.includes(appId) ? prev : [...prev, appId]))
    setActiveAppId(prev => (prev === appId ? null : prev))
  }, [])

  // Toggle Maximize App handler
  const handleToggleMaximizeApp = useCallback((appId: string) => {
    setMaximizedAppIds(prev =>
      prev.includes(appId) ? prev.filter(id => id !== appId) : [...prev, appId]
    )
  }, [])

  // Restore App from minimized state
  const handleRestoreApp = useCallback((appId: string) => {
    setMinimizedAppIds(prev => prev.filter(id => id !== appId))
    setActiveAppId(appId)
  }, [])

  // Open Converter with preselected currencies
  const handleOpenConverterWithPair = useCallback((from: string, to: string) => {
    handleOpenApp('calculator', { initialMode: 'convert', initialFromCurrency: from, initialToCurrency: to })
  }, [handleOpenApp])

  // Global listener for cross-app opening
  useEffect(() => {
    const handleGlobalOpenApp = (e: Event) => {
      const custom = e as CustomEvent<{ appId: string; customProps?: Record<string, unknown> }>
      if (custom.detail?.appId) {
        handleOpenApp(custom.detail.appId, custom.detail.customProps)
      }
    }
    window.addEventListener('superdash_open_app', handleGlobalOpenApp)
    return () => window.removeEventListener('superdash_open_app', handleGlobalOpenApp)
  }, [handleOpenApp])

  // Setup natural language command registry
  useEffect(() => {
    setupDefaultCommands({
      openApp: handleOpenApp,
      toggleTheme: () => {
        const nextTheme: ThemeMode = settings.theme === 'dark' ? 'light' : 'dark'
        const updated = { ...settings, theme: nextTheme }
        setSettings(updated)
        storageService.set('settings', updated)
      },
      startTimer: (minutes: number) => {
        timerService.startTimer(minutes * 60)
      },
      openConverterWithPair: handleOpenConverterWithPair,
      createQuickNote: () => {},
      createQuickTask: () => {}
    })
  }, [handleOpenApp, handleOpenConverterWithPair, settings])

  // Global keyboard shortcuts (⌘K / Ctrl+K, Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setIsSearchOpen(prev => !prev)
      } else if (e.key === 'Escape') {
        if (isSearchOpen) setIsSearchOpen(false)
        if (isControlCenterOpen) setIsControlCenterOpen(false)
        if (isEditMode) setIsEditMode(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isSearchOpen, isControlCenterOpen, isEditMode])

  // Capacitor Android hardware back button handler
  useEffect(() => {
    let listenerHandler: { remove: () => void } | null = null
    try {
      CapApp.addListener('backButton', ({ canGoBack }) => {
        if (openAppIds.length > 0) {
          const topAppId = activeAppId || openAppIds[openAppIds.length - 1]
          handleCloseApp(topAppId)
        } else if (isSearchOpen) {
          setIsSearchOpen(false)
        } else if (isControlCenterOpen) {
          setIsControlCenterOpen(false)
        } else if (isAddWidgetModalOpen) {
          setIsAddWidgetModalOpen(false)
        } else if (isEditMode) {
          setIsEditMode(false)
        } else if (!canGoBack) {
          CapApp.exitApp()
        }
      }).then(h => {
        listenerHandler = h
      })
    } catch {
      // Non-Capacitor environment
    }

    return () => {
      if (listenerHandler) listenerHandler.remove()
    }
  }, [openAppIds, activeAppId, isSearchOpen, isControlCenterOpen, isAddWidgetModalOpen, isEditMode, handleCloseApp])

  // Toggle Theme handler
  const handleToggleTheme = () => {
    const nextTheme: ThemeMode = settings.theme === 'dark' ? 'light' : 'dark'
    const updated = { ...settings, theme: nextTheme }
    setSettings(updated)
    storageService.set('settings', updated)
  }

  // Update App Order handler
  const handleAppOrderChange = (newOrder: string[]) => {
    const updated = { ...settings, appOrder: newOrder }
    setSettings(updated)
    storageService.set('settings', updated)
  }

  // Toggle Favorite App
  const handleToggleFavorite = async (appId: string) => {
    await favoritesService.toggleFavorite('apps', appId)
    const favs = await favoritesService.getFavorites()
    const updated = { ...settings, favoriteAppIds: favs.apps || [] }
    setSettings(updated)
    storageService.set('settings', updated)
  }

  // Partial settings update
  const handleUpdateSettings = (partial: Partial<DashboardSettings>) => {
    const updated = { ...settings, ...partial }
    setSettings(updated)
    storageService.set('settings', updated)
  }

  // Widgets configuration actions
  const handleRemoveWidget = (instanceId: string) => {
    sounds.playClick()
    if (activeDashboard) {
      const updatedItems = activeDashboard.items.filter(w => w.id !== instanceId)
      dashboardRepository.updateDashboard(activeDashboard.id, { items: updatedItems })
    }
    const updated = (settings.activeWidgets || []).filter(w => w.instanceId !== instanceId)
    handleUpdateSettings({ activeWidgets: updated })
  }

  const handleToggleWidgetSize = (instanceId: string) => {
    sounds.playClick()
    if (activeDashboard) {
      const updatedItems = activeDashboard.items.map(w => {
        if (w.id === instanceId) {
          const nextSize: WidgetSize = w.size === 'sm' ? 'md' : w.size === 'md' ? 'lg' : 'sm'
          const nextWidth = nextSize === 'lg' ? 8 : nextSize === 'md' ? 6 : 4
          return { ...w, size: nextSize, width: nextWidth }
        }
        return w
      })
      dashboardRepository.updateDashboard(activeDashboard.id, { items: updatedItems })
    }
    const updated = (settings.activeWidgets || []).map(w => {
      if (w.instanceId === instanceId) {
        const nextSize: WidgetSize = w.size === 'sm' ? 'md' : w.size === 'md' ? 'lg' : 'sm'
        return { ...w, size: nextSize }
      }
      return w
    })
    handleUpdateSettings({ activeWidgets: updated })
  }

  const handleAddWidget = (widgetId: string) => {
    sounds.playClick()
    const size: WidgetSize = widgetId === 'quicknotes' || widgetId === 'markets' ? 'md' : 'sm'
    const newConfig: DashboardWidgetConfig = {
      instanceId: `w-${widgetId}-${Date.now()}`,
      widgetId,
      size,
      order: (settings.activeWidgets || []).length
    }
    if (activeDashboard) {
      const count = activeDashboard.items.length
      const newItem = {
        id: newConfig.instanceId,
        dashboardId: activeDashboard.id,
        widgetId,
        x: (count * 4) % 12,
        y: Math.floor((count * 4) / 12),
        width: size === 'md' ? 6 : 4,
        height: 1,
        size,
        settings: {},
        visibility: { desktop: true, tablet: true, mobile: true }
      }
      dashboardRepository.updateDashboard(activeDashboard.id, {
        items: [...activeDashboard.items, newItem]
      })
    }
    const updated = [...(settings.activeWidgets || []), newConfig]
    handleUpdateSettings({ activeWidgets: updated })
    setIsAddWidgetModalOpen(false)
  }

  // Active rendered widgets from dashboard definition
  const renderedWidgets = useMemo(() => {
    if (activeDashboard && activeDashboard.items.length > 0) {
      return activeDashboard.items.map(it => ({
        instanceId: it.id,
        widgetId: it.widgetId,
        size: it.size || 'sm',
        order: it.x
      }))
    }
    return settings.activeWidgets || []
  }, [activeDashboard, settings.activeWidgets])

  // Dynamic Wallpaper resolver
  const currentWallpaper = activeDashboard?.wallpaper || settings.wallpaper
  const currentCustomData = activeDashboard?.customWallpaperData || settings.customWallpaperData

  const wallpaperStyle = useMemo(() => {
    if (currentWallpaper === 'custom' && currentCustomData) {
      return {
        backgroundImage: `url(${currentCustomData})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }
    }
    const found = WALLPAPER_COLLECTION.find(w => w.id === currentWallpaper)
    if (found?.category === 'image') {
      return {
        backgroundImage: `url(${found.value})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }
    }
    return {}
  }, [currentWallpaper, currentCustomData])

  const wallpaperClass = useMemo(() => {
    const found = WALLPAPER_COLLECTION.find(w => w.id === currentWallpaper)
    if (found && (found.category === 'gradient' || found.category === 'abstract' || found.category === 'solid')) {
      return found.value
    }
    return 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/60 via-slate-950 to-black'
  }, [currentWallpaper])

  return (
    <div
      style={wallpaperStyle}
      className={`h-[100dvh] min-h-[100dvh] w-full max-w-full overflow-x-hidden flex flex-col relative select-none ${wallpaperClass} transition-colors duration-500`}
    >
      {/* Dynamic ambient refraction glow overlay */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Top Menu Bar */}
      <TopMenuBar
        theme={settings.theme}
        onToggleTheme={handleToggleTheme}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenApp={handleOpenApp}
        clockFormat={settings.clockFormat}
        isEditMode={isEditMode}
        onToggleEditMode={() => setIsEditMode(!isEditMode)}
        onOpenControlCenter={() => setIsControlCenterOpen(true)}
        onOpenReminders={() => handleOpenApp('reminders')}
      />

      {/* Main Workspace Scrollable Container */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden px-2.5 sm:px-6 md:px-8 py-3 sm:py-6 md:py-8 flex flex-col items-center max-w-7xl mx-auto w-full max-w-full">
        {/* Top Hero Section: Clean composition of Universal Search */}
        {((!activeDashboard || activeDashboard.layoutConfig.showSearch) ||
          (activeDashboard?.layoutConfig.showClock)) && (
          <div className="w-full flex flex-col items-center max-w-4xl mx-auto mb-4 sm:mb-6">
            {/* 1. Universal Search Bar */}
            {(!activeDashboard || activeDashboard.layoutConfig.showSearch) && (
              <div className="w-full flex justify-center order-1 mb-2 sm:mb-3">
                <GlobalSearchBar onOpen={() => setIsSearchOpen(true)} />
              </div>
            )}

            {/* 2. Optional Wallpaper Clock & Date (Hidden by default on Home) */}
            {activeDashboard?.layoutConfig.showClock && (
              <div className="w-full flex justify-center order-2 mb-2 sm:mb-3">
                <DateTimeWidget
                  variant="background"
                  format={activeDashboard?.layoutConfig.clockFormat || settings.clockFormat}
                  showSeconds={settings.showSeconds}
                  onClick={() => handleOpenApp('time')}
                />
              </div>
            )}
          </div>
        )}

        {/* Central Application Launcher View */}
        {(!activeDashboard || activeDashboard.layoutConfig.showAppLauncher) && (
          <div className="w-full my-auto pb-8">
            <AppLauncher
              appOrder={settings.appOrder}
              hiddenAppIds={settings.hiddenAppIds || []}
              favoriteAppIds={settings.favoriteAppIds || []}
              recentAppIds={settings.recentAppIds || []}
              showRecentApps={settings.showRecentApps}
              onToggleFavorite={handleToggleFavorite}
              onAppOrderChange={handleAppOrderChange}
              onOpenApp={handleOpenApp}
            />
          </div>
        )}

        {/* Customizable Dashboard Widgets Area */}
        <div className="w-full max-w-5xl mt-6 pb-20">
          <div className="flex items-center justify-between mb-4 px-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Personal Widgets
            </span>

            {isEditMode && (
              <button
                onClick={() => setIsAddWidgetModalOpen(true)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Widget</span>
              </button>
            )}
          </div>

          {/* Widgets Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(renderedWidgets || [])
              .filter(w => w.widgetId !== 'markets' && w.widgetId !== 'clock')
              .map(wConfig => {
              if (wConfig.widgetId === 'markets') {
                return (
                  <GlassWidget
                    key={wConfig.instanceId}
                    id={wConfig.instanceId}
                    title="Live Markets"
                    size={wConfig.size}
                    noCard
                    isEditMode={isEditMode}
                    onRemove={() => handleRemoveWidget(wConfig.instanceId)}
                    onToggleSize={() => handleToggleWidgetSize(wConfig.instanceId)}
                  >
                    <MarketsWidget
                      onOpenConverter={handleOpenConverterWithPair}
                      onOpenApp={handleOpenApp}
                    />
                  </GlassWidget>
                )
              }
              if (wConfig.widgetId === 'quicknotes') {
                return (
                  <GlassWidget
                    key={wConfig.instanceId}
                    id={wConfig.instanceId}
                    title="Quick Notes"
                    size={wConfig.size}
                    noCard
                    isEditMode={isEditMode}
                    onRemove={() => handleRemoveWidget(wConfig.instanceId)}
                    onToggleSize={() => handleToggleWidgetSize(wConfig.instanceId)}
                  >
                    <QuickNotesWidget onOpenNotes={() => handleOpenApp('notes')} />
                  </GlassWidget>
                )
              }
              if (wConfig.widgetId === 'timer') {
                return (
                  <GlassWidget
                    key={wConfig.instanceId}
                    id={wConfig.instanceId}
                    title="Focus Timer"
                    size={wConfig.size}
                    noCard
                    isEditMode={isEditMode}
                    onRemove={() => handleRemoveWidget(wConfig.instanceId)}
                    onToggleSize={() => handleToggleWidgetSize(wConfig.instanceId)}
                  >
                    <TimerWidget onOpenTimer={() => handleOpenApp('timer')} />
                  </GlassWidget>
                )
              }

              if (wConfig.widgetId === 'tasks') {
                return (
                  <GlassWidget
                    key={wConfig.instanceId}
                    id={wConfig.instanceId}
                    title="Tasks Checklist"
                    size={wConfig.size}
                    noCard
                    isEditMode={isEditMode}
                    onRemove={() => handleRemoveWidget(wConfig.instanceId)}
                    onToggleSize={() => handleToggleWidgetSize(wConfig.instanceId)}
                  >
                    <TasksWidget onOpenTasks={() => handleOpenApp('tasks')} />
                  </GlassWidget>
                )
              }
              if (wConfig.widgetId === 'worldclock') {
                return (
                  <GlassWidget
                    key={wConfig.instanceId}
                    id={wConfig.instanceId}
                    title="World Clocks"
                    size={wConfig.size}
                    noCard
                    isEditMode={isEditMode}
                    onRemove={() => handleRemoveWidget(wConfig.instanceId)}
                    onToggleSize={() => handleToggleWidgetSize(wConfig.instanceId)}
                  >
                    <WorldClockWidget onOpenApp={() => handleOpenApp('worldclock')} />
                  </GlassWidget>
                )
              }
              if (wConfig.widgetId === 'hearings') {
                return (
                  <GlassWidget
                    key={wConfig.instanceId}
                    id={wConfig.instanceId}
                    title="Upcoming Hearings"
                    size={wConfig.size}
                    noCard
                    isEditMode={isEditMode}
                    onRemove={() => handleRemoveWidget(wConfig.instanceId)}
                    onToggleSize={() => handleToggleWidgetSize(wConfig.instanceId)}
                  >
                    <HearingsWidget onOpenHearings={() => handleOpenApp('hearings')} />
                  </GlassWidget>
                )
              }
              if (wConfig.widgetId === 'finance') {
                return (
                  <GlassWidget
                    key={wConfig.instanceId}
                    id={wConfig.instanceId}
                    title="Finance — This Month"
                    size={wConfig.size}
                    noCard
                    isEditMode={isEditMode}
                    onRemove={() => handleRemoveWidget(wConfig.instanceId)}
                    onToggleSize={() => handleToggleWidgetSize(wConfig.instanceId)}
                  >
                    <FinanceWidget
                      size={wConfig.size}
                      onOpenFinance={() => handleOpenApp('finance')}
                    />
                  </GlassWidget>
                )
              }
              if (wConfig.widgetId === 'quickidea') {
                return (
                  <GlassWidget
                    key={wConfig.instanceId}
                    id={wConfig.instanceId}
                    title="Quick Idea"
                    size={wConfig.size}
                    isEditMode={isEditMode}
                    onRemove={() => handleRemoveWidget(wConfig.instanceId)}
                    onToggleSize={() => handleToggleWidgetSize(wConfig.instanceId)}
                  >
                    <QuickIdeaWidget onOpenIdeas={() => handleOpenApp('ideas')} />
                  </GlassWidget>
                )
              }
              if (wConfig.widgetId === 'focus') {
                return (
                  <GlassWidget
                    key={wConfig.instanceId}
                    id={wConfig.instanceId}
                    title="Focus"
                    size={wConfig.size}
                    isEditMode={isEditMode}
                    onRemove={() => handleRemoveWidget(wConfig.instanceId)}
                    onToggleSize={() => handleToggleWidgetSize(wConfig.instanceId)}
                  >
                    <FocusWidget onOpenFocus={() => handleOpenApp('focus')} />
                  </GlassWidget>
                )
              }
              if (wConfig.widgetId === 'decisions') {
                return (
                  <GlassWidget
                    key={wConfig.instanceId}
                    id={wConfig.instanceId}
                    title="Decisions to Review"
                    size={wConfig.size}
                    isEditMode={isEditMode}
                    onRemove={() => handleRemoveWidget(wConfig.instanceId)}
                    onToggleSize={() => handleToggleWidgetSize(wConfig.instanceId)}
                  >
                    <DecisionsWidget onOpenDecisions={() => handleOpenApp('decisionbook')} />
                  </GlassWidget>
                )
              }
              if (wConfig.widgetId === 'morning') {
                return (
                  <GlassWidget
                    key={wConfig.instanceId}
                    id={wConfig.instanceId}
                    title="Today"
                    size={wConfig.size}
                    isEditMode={isEditMode}
                    onRemove={() => handleRemoveWidget(wConfig.instanceId)}
                    onToggleSize={() => handleToggleWidgetSize(wConfig.instanceId)}
                  >
                    <MorningWidget onOpenMorning={() => handleOpenApp('morning')} />
                  </GlassWidget>
                )
              }
              if (wConfig.widgetId === 'collection') {
                return (
                  <GlassWidget
                    key={wConfig.instanceId}
                    id={wConfig.instanceId}
                    title="Curated Collection"
                    size={wConfig.size}
                    isEditMode={isEditMode}
                    onRemove={() => handleRemoveWidget(wConfig.instanceId)}
                    onToggleSize={() => handleToggleWidgetSize(wConfig.instanceId)}
                  >
                    <CollectionWidget
                      size={wConfig.size}
                      onOpenApp={handleOpenApp}
                      onOpenCollection={colId => handleOpenApp('collections', { initialCollectionId: colId })}
                    />
                  </GlassWidget>
                )
              }
              return null
            })}
          </div>
        </div>
      </main>

      {/* Spotlight Universal Search & Command Palette Modal */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onOpenApp={handleOpenApp}
        onOpenConverterWithPair={handleOpenConverterWithPair}
      />

      {/* Floating Liquid Glass Control Center */}
      <ControlCenter
        isOpen={isControlCenterOpen}
        onClose={() => setIsControlCenterOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onOpenApp={handleOpenApp}
        isEditMode={isEditMode}
        onToggleEditMode={() => setIsEditMode(!isEditMode)}
      />

      {/* Add Widget Modal in Edit Mode */}
      {isAddWidgetModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
          <div className="liquid-glass-heavy rounded-2xl sm:rounded-3xl p-4 sm:p-6 w-full max-w-lg shadow-2xl animate-window-open max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3 sm:mb-4 shrink-0">
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <LayoutGrid className="w-4 h-4 text-indigo-400" />
                <span>Add Dashboard Widget</span>
              </div>
              <button
                onClick={() => setIsAddWidgetModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 overflow-y-auto pr-1">
              {getAllWidgets().map(w => {
                const Icon = w.icon
                return (
                  <button
                    key={w.id}
                    onClick={() => handleAddWidget(w.id)}
                    className="p-3.5 rounded-2xl liquid-glass text-left hover:border-indigo-400/50 hover:bg-white/10 transition group"
                  >
                    <Icon className="w-5 h-5 text-indigo-400 mb-2 group-hover:scale-110 transition-transform" />
                    <div className="text-xs font-bold text-white">{w.name}</div>
                    <div className="text-[10px] text-slate-400 mt-1 leading-snug">
                      {w.description}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Active Application Windows */}
      {openAppIds.map(appId => {
        const isMinimized = minimizedAppIds.includes(appId)
        const isMaximized = maximizedAppIds.includes(appId)
        const propsForApp = { ...(appWindowProps[appId] || {}), onOpenApp: handleOpenApp }

        return (
          <AppWindow
            key={appId}
            appId={appId}
            isMinimized={isMinimized}
            isMaximized={isMaximized}
            onClose={handleCloseApp}
            onMinimize={handleMinimizeApp}
            onToggleMaximize={handleToggleMaximizeApp}
            onSettingsChange={handleUpdateSettings}
            appProps={propsForApp}
          />
        )
      })}

      {/* Bottom Minimized / Running Apps Dock */}
      <Dock
        openAppIds={openAppIds}
        minimizedAppIds={minimizedAppIds}
        activeAppId={activeAppId}
        onOpenApp={handleOpenApp}
        onRestoreApp={handleRestoreApp}
      />

      {/* App Lock Protection Screen */}
      {isLocked && <AppLockScreen onUnlocked={() => setIsLocked(false)} />}
    </div>
  )
}
