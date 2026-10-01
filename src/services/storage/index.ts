import {
  DashboardSettings,
  NoteItem,
  TaskItem,
  CalendarEvent,
  ReminderItem,
  DocumentItem,
  TimerPreset,
  WallpaperItem
} from '@/types'
import { toLocalYYYYMMDD } from '@/utils/date'

export interface IStorageService {
  get<T>(key: string, defaultValue: T): Promise<T>
  set<T>(key: string, value: T): Promise<void>
  remove(key: string): Promise<void>
  clear(): Promise<void>
  exportAll(): Promise<Record<string, unknown>>
  importAll(data: Record<string, unknown>): Promise<void>
}

class LocalStorageService implements IStorageService {
  private prefix = 'superdash_'

  async get<T>(key: string, defaultValue: T): Promise<T> {
    try {
      const item = localStorage.getItem(this.prefix + key)
      if (item === null) return defaultValue
      const parsed = JSON.parse(item)
      // Merge with default if object to guarantee new fields are present
      if (typeof defaultValue === 'object' && defaultValue !== null && !Array.isArray(defaultValue)) {
        return { ...defaultValue, ...parsed }
      }
      return parsed as T
    } catch (e) {
      console.error(`Error reading ${key} from storage:`, e)
      return defaultValue
    }
  }

  async set<T>(key: string, value: T): Promise<void> {
    try {
      localStorage.setItem(this.prefix + key, JSON.stringify(value))
    } catch (e) {
      console.error(`Error writing ${key} to storage:`, e)
    }
  }

  async remove(key: string): Promise<void> {
    try {
      localStorage.removeItem(this.prefix + key)
    } catch (e) {
      console.error(`Error removing ${key} from storage:`, e)
    }
  }

  async clear(): Promise<void> {
    try {
      const keysToRemove: string[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i)
        if (k && k.startsWith(this.prefix)) {
          keysToRemove.push(k)
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k))
    } catch (e) {
      console.error('Error clearing storage:', e)
    }
  }

  async exportAll(): Promise<Record<string, unknown>> {
    const result: Record<string, unknown> = {}
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k && k.startsWith(this.prefix)) {
        try {
          const raw = localStorage.getItem(k)
          result[k.replace(this.prefix, '')] = raw ? JSON.parse(raw) : null
        } catch {
          // ignore corrupted keys
        }
      }
    }
    return result
  }

  async importAll(data: Record<string, unknown>): Promise<void> {
    for (const [key, value] of Object.entries(data)) {
      await this.set(key, value)
    }
  }
}

// Singleton storage service instance
export const storageService: IStorageService = new LocalStorageService()

export const WALLPAPER_COLLECTION: WallpaperItem[] = [
  // Gradients
  {
    id: 'cosmic',
    name: 'Cosmic Liquid',
    category: 'gradient',
    value: 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/60 via-slate-950 to-black',
    preview: 'from-indigo-900 via-slate-950 to-black'
  },
  {
    id: 'aurora',
    name: 'Northern Aurora',
    category: 'gradient',
    value: 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/40 via-teal-950 to-slate-950',
    preview: 'from-emerald-900 via-teal-950 to-slate-950'
  },
  {
    id: 'sunset',
    name: 'Cyber Sunset',
    category: 'gradient',
    value: 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-rose-900/50 via-purple-950/60 to-black',
    preview: 'from-rose-900 via-purple-950 to-black'
  },
  {
    id: 'ocean',
    name: 'Abyssal Depth',
    category: 'gradient',
    value: 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-900/50 via-blue-950 to-black',
    preview: 'from-sky-900 via-blue-950 to-black'
  },
  // Abstract
  {
    id: 'fluid_glass',
    name: 'Fluid Obsidian',
    category: 'abstract',
    value: 'bg-gradient-to-tr from-zinc-950 via-indigo-950/80 to-neutral-900',
    preview: 'from-zinc-950 via-indigo-950 to-neutral-900'
  },
  {
    id: 'neon_noir',
    name: 'Neon Horizon',
    category: 'abstract',
    value: 'bg-gradient-to-br from-violet-950 via-black to-slate-900',
    preview: 'from-violet-950 via-black to-slate-900'
  },
  // Solid
  {
    id: 'deep_onyx',
    name: 'Deep Onyx',
    category: 'solid',
    value: 'bg-[#06070a]',
    preview: 'from-[#06070a] to-[#0d0e15]'
  },
  {
    id: 'pure_titanium',
    name: 'Pure Titanium',
    category: 'solid',
    value: 'bg-[#121319]',
    preview: 'from-[#121319] to-[#1e2029]'
  },
  // Curated High-Res Unsplash Photographic Wallpapers
  {
    id: 'mountain_mist',
    name: 'Alpine Mist',
    category: 'image',
    value: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=2000&q=80',
    preview: 'from-sky-900 to-emerald-950'
  },
  {
    id: 'calm_ocean',
    name: 'Pacific Solitude',
    category: 'image',
    value: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2000&q=80',
    preview: 'from-blue-900 to-indigo-950'
  },
  {
    id: 'dark_nebula',
    name: 'James Webb Deep Space',
    category: 'image',
    value: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=2000&q=80',
    preview: 'from-purple-900 to-blue-950'
  }
]

// Default fallback settings
export const DEFAULT_SETTINGS: DashboardSettings = {
  theme: 'dark',
  clockFormat: '12h',
  showSeconds: true,
  weatherLocation: 'San Francisco',
  weatherCoordinates: { lat: 37.7749, lon: -122.4194 },
  weatherUnit: 'celsius',
  wallpaper: 'cosmic',
  wallpaperCategory: 'gradient',
  dockPosition: 'bottom',
  hiddenAppIds: [],
  appOrder: [
    'notes',
    'calendar',
    'tasks',
    'calculator',
    'time',
    'weather',
    'files',
    'reader',
    'ideas',
    'collections',
    'decisionbook',
    'live',
    'hearings',
    'finance',
    'growth',
    'settings'
  ],
  glassOpacity: 75,
  glassBlur: 20,
  visualIntensity: 'balanced',
  reducedMotion: false,
  soundEnabled: true,
  timerSound: 'soft_bell',
  timerSandSound: true,
  timerVisualMode: 'hourglass',
  activeWidgets: [
    { instanceId: 'w-hearings', widgetId: 'hearings', size: 'md', order: 0 },
    { instanceId: 'w-finance', widgetId: 'finance', size: 'md', order: 1 },
    { instanceId: 'w-quicknotes', widgetId: 'quicknotes', size: 'sm', order: 2 },
    { instanceId: 'w-timer', widgetId: 'timer', size: 'sm', order: 3 }
  ],
  marketPairs: ['BTC-USD', 'AED-MAD', 'USD-AED'],
  selectedCurrencies: ['AED', 'EUR', 'GBP', 'MAD', 'PHP', 'SAR', 'JPY', 'CAD'],
  worldClockCities: ['Dubai', 'Manila', 'London', 'New York', 'Tokyo'],
  favoriteAppIds: ['calculator', 'notes', 'time', 'tasks'],
  recentAppIds: ['notes', 'tasks', 'calculator'],
  showRecentApps: true
}

export const INITIAL_TIMER_PRESETS: TimerPreset[] = [
  { id: 'p-1', label: '1 min', durationSeconds: 60, category: 'break' },
  { id: 'p-2', label: '5 min', durationSeconds: 300, category: 'break' },
  { id: 'p-3', label: 'Coffee Break', durationSeconds: 600, category: 'break' },
  { id: 'p-4', label: '15 min', durationSeconds: 900, category: 'break' },
  { id: 'p-5', label: 'Focus', durationSeconds: 1500, category: 'focus' },
  { id: 'p-6', label: 'Reading', durationSeconds: 1800, category: 'focus' },
  { id: 'p-7', label: 'Deep Work', durationSeconds: 2700, category: 'work' },
  { id: 'p-8', label: 'Meeting', durationSeconds: 3600, category: 'work' }
]

export const INITIAL_REMINDERS: ReminderItem[] = [
  {
    id: 'rem-1',
    title: 'Review weekly asset performance',
    date: toLocalYYYYMMDD(),
    time: '16:00',
    notes: 'Check BTC/USD and AED/MAD exchange rates for transfer.',
    repeat: 'weekly',
    completed: false,
    priority: 'high',
    createdAt: Date.now() - 3600000 * 2
  },
  {
    id: 'rem-2',
    title: 'Focus Hour: Deep code refactor',
    date: toLocalYYYYMMDD(),
    time: '18:30',
    notes: 'Use 25-minute Pomodoro hourglass timer.',
    repeat: 'none',
    completed: false,
    priority: 'medium',
    createdAt: Date.now() - 3600000
  },
  {
    id: 'rem-3',
    title: 'Backup system data and notes',
    date: toLocalYYYYMMDD(new Date(Date.now() + 86400000)),
    time: '20:00',
    notes: 'Export JSON backup from Settings > Data.',
    repeat: 'monthly',
    completed: true,
    priority: 'low',
    createdAt: Date.now() - 86400000
  }
]

export const INITIAL_DOCUMENTS: DocumentItem[] = [
  {
    id: 'doc-1',
    name: 'SuperDash System Architecture.pdf',
    sizeBytes: 248000,
    type: 'pdf',
    category: 'Architecture',
    isFavorite: true,
    updatedAt: Date.now() - 3600000 * 4,
    contentSnippet: 'Modular App Registry, Centralized Services, and Liquid Glass UI specification.'
  },
  {
    id: 'doc-2',
    name: 'Financial Portfolio Allocation.xlsx',
    sizeBytes: 152000,
    type: 'spreadsheet',
    category: 'Finance',
    isFavorite: true,
    updatedAt: Date.now() - 86400000,
    contentSnippet: 'Crypto holdings, AED fixed deposits, and international currency exposure.'
  },
  {
    id: 'doc-3',
    name: 'Productivity OS Roadmap.md',
    sizeBytes: 42000,
    type: 'document',
    category: 'Roadmap',
    isFavorite: false,
    updatedAt: Date.now() - 86400000 * 2,
    contentSnippet: 'Phase 1: Liquid Glass. Phase 2: Hourglass Engine. Phase 3: Multi-currency converter.'
  }
]

export const INITIAL_NOTES: NoteItem[] = [
  {
    id: 'note-1',
    title: 'SuperDash Architecture Notes',
    content: '1. Modular App Registry pattern for dynamic tool onboarding.\n2. Isolated Weather Service with Open-Meteo REST API.\n3. Universal Spotlight Search with instant hotkey (Cmd+K).\n4. Unified state preservation for active windows.',
    color: '#6366f1',
    isPinned: true,
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 3600000,
    tags: ['Architecture', 'Ideas']
  },
  {
    id: 'note-2',
    title: 'Weekly Sprint Goals',
    content: '- Launch Version 1 of Dashboard OS\n- Test keyboard navigation across all apps\n- Check responsive layout on iPhone and iPad\n- Review color contrast and dark mode glass effects',
    color: '#10b981',
    isPinned: false,
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 7200000,
    tags: ['Work', 'Sprint']
  }
]

export const INITIAL_TASKS: TaskItem[] = [
  {
    id: 'task-1',
    title: 'Complete SuperDash core architecture',
    completed: true,
    priority: 'high',
    dueDate: toLocalYYYYMMDD(),
    tag: 'Development',
    createdAt: Date.now() - 3600000 * 5
  },
  {
    id: 'task-2',
    title: 'Test Spotlight search with Cmd+K shortcuts',
    completed: false,
    priority: 'high',
    dueDate: toLocalYYYYMMDD(),
    tag: 'Testing',
    createdAt: Date.now() - 3600000 * 3
  },
  {
    id: 'task-3',
    title: 'Customize dashboard wallpaper and theme',
    completed: false,
    priority: 'medium',
    dueDate: toLocalYYYYMMDD(new Date(Date.now() + 86400000)),
    tag: 'Design',
    createdAt: Date.now() - 3600000
  },
  {
    id: 'task-4',
    title: 'Set 25-minute Pomodoro timer for deep focus',
    completed: false,
    priority: 'low',
    dueDate: toLocalYYYYMMDD(new Date(Date.now() + 86400000 * 2)),
    tag: 'Productivity',
    createdAt: Date.now()
  }
]

export const INITIAL_CALENDAR_EVENTS: CalendarEvent[] = [
  {
    id: 'evt-1',
    title: 'Product Review & Demo',
    date: toLocalYYYYMMDD(),
    startTime: '10:00',
    endTime: '11:00',
    color: '#6366f1',
    description: 'Walkthrough of SuperDash apps, spotlight search, and modular app registry.',
    allDay: false
  },
  {
    id: 'evt-2',
    title: 'Team Sync & Retrospective',
    date: toLocalYYYYMMDD(),
    startTime: '14:30',
    endTime: '15:15',
    color: '#ec4899',
    description: 'Review milestone progress and plan next batch of custom applications.',
    allDay: false
  },
  {
    id: 'evt-3',
    title: 'Deep Focus Coding Session',
    date: toLocalYYYYMMDD(new Date(Date.now() + 86400000)),
    startTime: '09:00',
    endTime: '12:00',
    color: '#10b981',
    description: 'Build new widgets and integrations.',
    allDay: false
  }
]
