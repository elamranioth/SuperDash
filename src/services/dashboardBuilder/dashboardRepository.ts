import {
  DashboardDefinition,
  DashboardItem,
  DashboardLayoutConfig,
  DashboardSettings,
  WidgetSize
} from '@/types'
import { storageService, DEFAULT_SETTINGS } from '@/services/storage'
import { getAllWidgets, getWidgetById } from '@/registry/widgetRegistry'

const STORAGE_KEYS = {
  DASHBOARDS: 'dashboards_list',
  ACTIVE_ID: 'active_dashboard_id'
}

export const DEFAULT_LAYOUT_CONFIG: DashboardLayoutConfig = {
  showSearch: true,
  showClock: false,
  clockPosition: 'center',
  clockFormat: '12h',
  showMarketsStrip: false,
  showAppLauncher: true,
  appLauncherColumns: 4,
  gridColumns: 12,
  gap: 16
}

function synthesizeHomeDashboard(settings: DashboardSettings): DashboardDefinition {
  const items: DashboardItem[] = (settings.activeWidgets || []).map((w, index) => {
    const width = w.size === 'lg' ? 8 : w.size === 'md' ? 6 : 4
    const height = w.size === 'lg' ? 2 : 1
    return {
      id: w.instanceId || `item-${w.widgetId}-${index}`,
      dashboardId: 'dash-home',
      widgetId: w.widgetId,
      x: (index * 4) % 12,
      y: Math.floor((index * 4) / 12),
      width,
      height,
      size: w.size,
      settings: {},
      visibility: { desktop: true, tablet: true, mobile: true }
    }
  })

  return {
    id: 'dash-home',
    name: 'Home',
    description: 'Main personal workspace with daily briefing, markets, and priority apps',
    icon: 'LayoutDashboard',
    wallpaper: settings.wallpaper || 'cosmic',
    wallpaperCategory: settings.wallpaperCategory || 'gradient',
    customWallpaperData: settings.customWallpaperData,
    layoutConfig: {
      ...DEFAULT_LAYOUT_CONFIG,
      clockFormat: settings.clockFormat || '12h'
    },
    items,
    isDefault: true,
    createdAt: Date.now() - 86400000 * 30,
    updatedAt: Date.now()
  }
}

export const INITIAL_DASHBOARDS_SEED: DashboardDefinition[] = [
  {
    id: 'dash-home',
    name: 'Home',
    description: 'Main personal workspace with daily briefing, markets, and priority apps',
    icon: 'LayoutDashboard',
    wallpaper: 'cosmic',
    wallpaperCategory: 'gradient',
    layoutConfig: DEFAULT_LAYOUT_CONFIG,
    items: [
      {
        id: 'w-hearings-0',
        dashboardId: 'dash-home',
        widgetId: 'hearings',
        x: 0,
        y: 0,
        width: 6,
        height: 1,
        size: 'md',
        visibility: { desktop: true, tablet: true, mobile: true }
      },
      {
        id: 'w-finance-1',
        dashboardId: 'dash-home',
        widgetId: 'finance',
        x: 6,
        y: 0,
        width: 6,
        height: 1,
        size: 'md',
        visibility: { desktop: true, tablet: true, mobile: true }
      },
      {
        id: 'w-quicknotes-2',
        dashboardId: 'dash-home',
        widgetId: 'quicknotes',
        x: 0,
        y: 1,
        width: 4,
        height: 1,
        size: 'sm',
        visibility: { desktop: true, tablet: true, mobile: true }
      },
      {
        id: 'w-timer-3',
        dashboardId: 'dash-home',
        widgetId: 'timer',
        x: 4,
        y: 1,
        width: 4,
        height: 1,
        size: 'sm',
        visibility: { desktop: true, tablet: true, mobile: true }
      },
      {
        id: 'w-collection-4',
        dashboardId: 'dash-home',
        widgetId: 'collection',
        x: 8,
        y: 1,
        width: 4,
        height: 1,
        size: 'sm',
        visibility: { desktop: true, tablet: true, mobile: true }
      }
    ],
    isDefault: true,
    createdAt: Date.now() - 86400000 * 30,
    updatedAt: Date.now()
  },
  {
    id: 'dash-legal',
    name: 'Legal & Practice',
    description: 'Tailored for court sessions, case proceedings, client billing, and case files',
    icon: 'Scale',
    wallpaper: 'midnight',
    wallpaperCategory: 'gradient',
    layoutConfig: {
      ...DEFAULT_LAYOUT_CONFIG,
      showMarketsStrip: false
    },
    items: [
      {
        id: 'leg-item-1',
        dashboardId: 'dash-legal',
        widgetId: 'hearings',
        x: 0,
        y: 0,
        width: 8,
        height: 1,
        size: 'lg',
        visibility: { desktop: true, tablet: true, mobile: true }
      },
      {
        id: 'leg-item-2',
        dashboardId: 'dash-legal',
        widgetId: 'finance',
        x: 8,
        y: 0,
        width: 4,
        height: 1,
        size: 'sm',
        visibility: { desktop: true, tablet: true, mobile: true }
      },
      {
        id: 'leg-item-3',
        dashboardId: 'dash-legal',
        widgetId: 'calendar',
        x: 0,
        y: 1,
        width: 6,
        height: 1,
        size: 'md',
        visibility: { desktop: true, tablet: true, mobile: true }
      },
      {
        id: 'leg-item-4',
        dashboardId: 'dash-legal',
        widgetId: 'tasks',
        x: 6,
        y: 1,
        width: 6,
        height: 1,
        size: 'md',
        visibility: { desktop: true, tablet: true, mobile: true }
      }
    ],
    isDefault: false,
    createdAt: Date.now() - 86400000 * 15,
    updatedAt: Date.now()
  },
  {
    id: 'dash-focus',
    name: 'Deep Focus',
    description: 'Distraction-free environment with concentration timer, quick ideas, and quiet agenda',
    icon: 'Target',
    wallpaper: 'aurora',
    wallpaperCategory: 'gradient',
    layoutConfig: {
      ...DEFAULT_LAYOUT_CONFIG,
      showMarketsStrip: false,
      showAppLauncher: true
    },
    items: [
      {
        id: 'foc-item-1',
        dashboardId: 'dash-focus',
        widgetId: 'focus',
        x: 0,
        y: 0,
        width: 6,
        height: 1,
        size: 'md',
        visibility: { desktop: true, tablet: true, mobile: true }
      },
      {
        id: 'foc-item-2',
        dashboardId: 'dash-focus',
        widgetId: 'timer',
        x: 6,
        y: 0,
        width: 6,
        height: 1,
        size: 'md',
        visibility: { desktop: true, tablet: true, mobile: true }
      },
      {
        id: 'foc-item-3',
        dashboardId: 'dash-focus',
        widgetId: 'quickidea',
        x: 0,
        y: 1,
        width: 6,
        height: 1,
        size: 'md',
        visibility: { desktop: true, tablet: true, mobile: true }
      },
      {
        id: 'foc-item-4',
        dashboardId: 'dash-focus',
        widgetId: 'quicknotes',
        x: 6,
        y: 1,
        width: 6,
        height: 1,
        size: 'md',
        visibility: { desktop: true, tablet: true, mobile: true }
      }
    ],
    isDefault: false,
    createdAt: Date.now() - 86400000 * 10,
    updatedAt: Date.now()
  },
  {
    id: 'dash-morning',
    name: 'Morning Briefing',
    description: 'Daily executive glance with today schedule, priorities, tasks, and markets',
    icon: 'Sunrise',
    wallpaper: 'sunset',
    wallpaperCategory: 'gradient',
    layoutConfig: {
      ...DEFAULT_LAYOUT_CONFIG,
      showMarketsStrip: true,
      showAppLauncher: true
    },
    items: [
      {
        id: 'mrn-item-1',
        dashboardId: 'dash-morning',
        widgetId: 'calendar',
        x: 0,
        y: 0,
        width: 6,
        height: 1,
        size: 'md',
        visibility: { desktop: true, tablet: true, mobile: true }
      },
      {
        id: 'mrn-item-2',
        dashboardId: 'dash-morning',
        widgetId: 'tasks',
        x: 6,
        y: 0,
        width: 6,
        height: 1,
        size: 'md',
        visibility: { desktop: true, tablet: true, mobile: true }
      },
      {
        id: 'mrn-item-3',
        dashboardId: 'dash-morning',
        widgetId: 'weather',
        x: 0,
        y: 1,
        width: 4,
        height: 1,
        size: 'sm',
        visibility: { desktop: true, tablet: true, mobile: true }
      },
      {
        id: 'mrn-item-4',
        dashboardId: 'dash-morning',
        widgetId: 'hearings',
        x: 4,
        y: 1,
        width: 4,
        height: 1,
        size: 'sm',
        visibility: { desktop: true, tablet: true, mobile: true }
      },
      {
        id: 'mrn-item-5',
        dashboardId: 'dash-morning',
        widgetId: 'finance',
        x: 8,
        y: 1,
        width: 4,
        height: 1,
        size: 'sm',
        visibility: { desktop: true, tablet: true, mobile: true }
      }
    ],
    isDefault: false,
    createdAt: Date.now() - 86400000 * 5,
    updatedAt: Date.now()
  }
]

class DashboardRepository {
  private listeners: Array<() => void> = []

  subscribe(listener: () => void): () => void {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }

  private notify() {
    this.listeners.forEach(l => l())
    window.dispatchEvent(new CustomEvent('superdash_dashboards_updated'))
  }

  async getAllDashboards(): Promise<DashboardDefinition[]> {
    const stored = await storageService.get<DashboardDefinition[] | null>(
      STORAGE_KEYS.DASHBOARDS,
      null
    )

    if (stored && stored.length > 0) {
      return stored
    }

    // Migration fallback: If not stored yet, synthesize from current user settings
    const settings = await storageService.get<DashboardSettings>('settings', DEFAULT_SETTINGS)
    const homeDash = synthesizeHomeDashboard(settings)
    const initialList = [homeDash, INITIAL_DASHBOARDS_SEED[1], INITIAL_DASHBOARDS_SEED[2]]
    await storageService.set(STORAGE_KEYS.DASHBOARDS, initialList)
    await storageService.set(STORAGE_KEYS.ACTIVE_ID, homeDash.id)
    return initialList
  }

  async getActiveDashboard(): Promise<DashboardDefinition> {
    const list = await this.getAllDashboards()
    const activeId = await storageService.get<string>(
      STORAGE_KEYS.ACTIVE_ID,
      list[0]?.id || 'dash-home'
    )
    const found = list.find(d => d.id === activeId)
    if (found) return found

    const defaultDash = list.find(d => d.isDefault) || list[0]
    return defaultDash
  }

  async setActiveDashboard(id: string): Promise<void> {
    await storageService.set(STORAGE_KEYS.ACTIVE_ID, id)
    this.notify()
  }

  async getDashboardById(id: string): Promise<DashboardDefinition | undefined> {
    const list = await this.getAllDashboards()
    return list.find(d => d.id === id)
  }

  async createDashboard(
    data: Partial<DashboardDefinition> & { name: string }
  ): Promise<DashboardDefinition> {
    const list = await this.getAllDashboards()
    const newDash: DashboardDefinition = {
      id: `dash-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: data.name,
      description: data.description,
      icon: data.icon || 'LayoutDashboard',
      wallpaper: data.wallpaper || 'cosmic',
      wallpaperCategory: data.wallpaperCategory || 'gradient',
      customWallpaperData: data.customWallpaperData,
      layoutConfig: data.layoutConfig || { ...DEFAULT_LAYOUT_CONFIG },
      items: data.items || [],
      isDefault: false,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }

    list.push(newDash)
    await storageService.set(STORAGE_KEYS.DASHBOARDS, list)
    this.notify()
    return newDash
  }

  async updateDashboard(
    id: string,
    updates: Partial<DashboardDefinition>
  ): Promise<DashboardDefinition | null> {
    const list = await this.getAllDashboards()
    const idx = list.findIndex(d => d.id === id)
    if (idx === -1) return null

    const updated: DashboardDefinition = {
      ...list[idx],
      ...updates,
      updatedAt: Date.now()
    }
    list[idx] = updated
    await storageService.set(STORAGE_KEYS.DASHBOARDS, list)
    this.notify()
    return updated
  }

  async duplicateDashboard(id: string, newName?: string): Promise<DashboardDefinition> {
    const source = await this.getDashboardById(id)
    if (!source) {
      throw new Error(`Source dashboard ${id} not found`)
    }

    const dupName = newName || `${source.name} (Copy)`
    const newDash: DashboardDefinition = {
      ...source,
      id: `dash-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: dupName,
      isDefault: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      items: source.items.map(item => ({
        ...item,
        id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
      }))
    }

    const list = await this.getAllDashboards()
    list.push(newDash)
    await storageService.set(STORAGE_KEYS.DASHBOARDS, list)
    this.notify()
    return newDash
  }

  async deleteDashboard(id: string): Promise<boolean> {
    const list = await this.getAllDashboards()
    if (list.length <= 1) {
      throw new Error('Cannot delete the only remaining dashboard.')
    }

    const target = list.find(d => d.id === id)
    if (!target) return false

    const filtered = list.filter(d => d.id !== id)

    // If target was default, assign the first remaining as default
    if (target.isDefault && filtered.length > 0) {
      filtered[0].isDefault = true
    }

    await storageService.set(STORAGE_KEYS.DASHBOARDS, filtered)

    // If active dashboard was deleted, switch to default
    const activeId = await storageService.get<string>(STORAGE_KEYS.ACTIVE_ID, '')
    if (activeId === id) {
      const nextActive = filtered.find(d => d.isDefault) || filtered[0]
      await storageService.set(STORAGE_KEYS.ACTIVE_ID, nextActive.id)
    }

    this.notify()
    return true
  }

  async setDefaultDashboard(id: string): Promise<void> {
    const list = await this.getAllDashboards()
    const updated = list.map(d => ({
      ...d,
      isDefault: d.id === id,
      updatedAt: Date.now()
    }))
    await storageService.set(STORAGE_KEYS.DASHBOARDS, updated)
    this.notify()
  }

  // --- Export & Safe Import ---

  async exportDashboard(id: string): Promise<string> {
    const dash = await this.getDashboardById(id)
    if (!dash) throw new Error('Dashboard not found')
    return JSON.stringify(dash, null, 2)
  }

  async importDashboard(jsonString: string): Promise<DashboardDefinition> {
    let parsed: Partial<DashboardDefinition>
    try {
      parsed = JSON.parse(jsonString) as Partial<DashboardDefinition>
    } catch {
      throw new Error('Invalid JSON format: Unable to parse dashboard configuration')
    }

    if (!parsed || typeof parsed !== 'object') {
      throw new Error('Invalid dashboard configuration: root must be an object')
    }
    if (!parsed.name || typeof parsed.name !== 'string') {
      throw new Error('Invalid dashboard: name is required')
    }

    // Whitelist valid registered widgets only
    const registeredWidgetIds = new Set(getAllWidgets().map(w => w.id))

    const validItems: DashboardItem[] = Array.isArray(parsed.items)
      ? parsed.items
          .filter(it => it && typeof it === 'object' && registeredWidgetIds.has(it.widgetId))
          .map((it, idx) => ({
            id: `item-${Date.now()}-${idx}`,
            dashboardId: '',
            widgetId: it.widgetId,
            x: Number(it.x) || 0,
            y: Number(it.y) || 0,
            width: Number(it.width) || 4,
            height: Number(it.height) || 1,
            size: (it.size as WidgetSize) || 'sm',
            settings: typeof it.settings === 'object' && it.settings !== null ? it.settings : {},
            visibility: {
              desktop: it.visibility?.desktop ?? true,
              tablet: it.visibility?.tablet ?? true,
              mobile: it.visibility?.mobile ?? true
            }
          }))
      : []

    const newDash = await this.createDashboard({
      name: `${parsed.name} (Imported)`,
      description: parsed.description,
      icon: parsed.icon || 'LayoutDashboard',
      wallpaper: parsed.wallpaper || 'cosmic',
      wallpaperCategory: parsed.wallpaperCategory || 'gradient',
      customWallpaperData: parsed.customWallpaperData,
      layoutConfig: {
        ...DEFAULT_LAYOUT_CONFIG,
        ...(parsed.layoutConfig || {})
      },
      items: validItems
    })

    return newDash
  }
}

export const dashboardRepository = new DashboardRepository()
