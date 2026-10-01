import { lazy, ComponentType } from 'react'
import {
  Calculator as CalcIcon,
  FileText,
  Calendar as CalIcon,
  CloudSun,
  CheckSquare,
  Timer as TimerIcon,
  Settings as SettingsIcon,
  Folder,
  Scale,
  Wallet,
  Lightbulb,
  BookMarked,
  BookOpen
} from 'lucide-react'
import { AppDefinition, AppCategory } from '@/types'
import LiveIcon from '@/apps/live/LiveIcon'
import CollectionIcon from '@/apps/collections/CollectionIcon'
import GrowthIcon from '@/apps/growth/GrowthIcon'

// Lazy-loaded application components for optimal code splitting & performance
const CalculatorApp = lazy(() => import('@/apps/calculator/CalculatorApp'))
const NotesApp = lazy(() => import('@/apps/notes/NotesApp'))
const CalendarApp = lazy(() => import('@/apps/calendar/CalendarApp'))
const WeatherApp = lazy(() => import('@/apps/weather/WeatherApp'))
const TasksApp = lazy(() => import('@/apps/tasks/TasksApp'))
const TimeApp = lazy(() => import('@/apps/time/TimeApp'))
const SettingsApp = lazy(() => import('@/apps/settings/SettingsApp'))
const FilesApp = lazy(() => import('@/apps/files/FilesApp'))
const HearingsApp = lazy(() => import('@/apps/hearings/HearingsApp'))
const FinanceApp = lazy(() => import('@/apps/finance/FinanceApp'))
const IdeasApp = lazy(() => import('@/apps/ideas/IdeasApp'))
const DecisionBookApp = lazy(() => import('@/apps/decisionbook/DecisionBookApp'))
const ReaderApp = lazy(() => import('@/apps/reader/ReaderApp'))
const LiveApp = lazy(() => import('@/apps/live/LiveApp'))
const CollectionsApp = lazy(() => import('@/apps/collections/CollectionsApp'))
const GrowthApp = lazy(() => import('@/apps/growth/GrowthApp'))

export interface RegisteredApp extends AppDefinition {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: ComponentType<any>
}

// Master Minimalist 15-App Registry
const APP_REGISTRY: RegisteredApp[] = [
  // --- PRODUCTIVITY ---
  {
    id: 'notes',
    name: 'Notes',
    description: 'Fast auto-saving notes with tags, color coding, and search',
    icon: FileText,
    category: 'productivity',
    keywords: ['notes', 'memo', 'writing', 'text', 'markdown', 'ideas'],
    gradient: 'from-amber-400 to-yellow-600',
    component: NotesApp,
    defaultWindowSize: { width: 920, height: 640 }
  },
  {
    id: 'calendar',
    name: 'Calendar',
    description: 'Monthly schedule, event manager, and today agenda glance',
    icon: CalIcon,
    category: 'productivity',
    keywords: ['calendar', 'events', 'schedule', 'agenda', 'meetings', 'dates'],
    gradient: 'from-rose-500 to-red-600',
    component: CalendarApp,
    defaultWindowSize: { width: 960, height: 680 }
  },
  {
    id: 'tasks',
    name: 'Tasks',
    description: 'Actionable goal tracker, daily checklists, scheduled reminders, and priorities',
    icon: CheckSquare,
    category: 'productivity',
    keywords: ['tasks', 'todo', 'goals', 'checklist', 'productivity', 'habits', 'reminders', 'alerts'],
    gradient: 'from-emerald-400 to-teal-600',
    component: TasksApp,
    defaultWindowSize: { width: 840, height: 620 }
  },
  {
    id: 'ideas',
    name: 'Ideas',
    description: 'Ultra-fast personal idea-capture system. Capture first, organize later.',
    icon: Lightbulb,
    category: 'productivity',
    keywords: ['ideas', 'idea', 'capture', 'brainstorm', 'thoughts', 'concept', 'notes', 'projects', 'apps'],
    gradient: 'from-amber-400 to-yellow-600',
    component: IdeasApp,
    defaultWindowSize: { width: 880, height: 640 }
  },
  {
    id: 'decisionbook',
    name: 'Decision Book',
    description: 'Record important decisions, expected outcomes, risks, and evaluate results over time to improve judgment',
    icon: BookMarked,
    category: 'productivity',
    keywords: ['decision', 'decisions', 'decision book', 'choice', 'review', 'judgment', 'reflection', 'lessons', 'outcome', 'strategy'],
    gradient: 'from-blue-600 to-cyan-700',
    component: DecisionBookApp,
    defaultWindowSize: { width: 920, height: 660 }
  },
  {
    id: 'reader',
    name: 'Reader',
    description: 'Distraction-free article reader with highlights, English-to-Arabic translation, and saved quotes library',
    icon: BookOpen,
    category: 'productivity',
    keywords: ['reader', 'article', 'reading', 'read', 'highlight', 'quote', 'translation', 'translate', 'arabic', 'research', 'web', 'clean', 'distraction free', 'book'],
    gradient: 'from-amber-500 via-orange-500 to-rose-600',
    component: ReaderApp,
    defaultWindowSize: { width: 1040, height: 740 }
  },
  {
    id: 'live',
    name: 'Live',
    description: 'A gentle reminder to pause, look around, notice nature, remember loved ones, and live today',
    icon: LiveIcon,
    category: 'productivity',
    keywords: ['live', 'pause', 'moment', 'human', 'rest', 'reflect', 'breathe', 'nature', 'peace', 'memories', 'somewhere', 'people', 'life'],
    gradient: 'from-amber-400 via-rose-400 to-orange-500',
    component: LiveApp,
    defaultWindowSize: { width: 960, height: 680 }
  },
  {
    id: 'collections',
    name: 'Collections',
    description: 'Curated spaces for articles, quotes, ideas, notes, files, places, and thoughts that belong together',
    icon: CollectionIcon,
    category: 'productivity',
    keywords: ['collections', 'collection', 'curate', 'library', 'research', 'gather', 'articles', 'ideas', 'quotes', 'knowledge', 'links', 'meaning'],
    gradient: 'from-violet-600 via-indigo-600 to-cyan-500',
    component: CollectionsApp,
    defaultWindowSize: { width: 1040, height: 720 }
  },

  // --- BUSINESS ---
  {
    id: 'hearings',
    name: 'Hearings',
    description: 'Track court sessions, judicial decisions, procedural case history, and upcoming follow-ups',
    icon: Scale,
    category: 'business',
    keywords: ['hearing', 'hearings', 'court', 'case', 'client', 'decision', 'session', 'legal', 'law', 'adjourned', 'lawyer'],
    gradient: 'from-amber-600 to-indigo-700',
    component: HearingsApp,
    defaultWindowSize: { width: 980, height: 680 }
  },
  {
    id: 'finance',
    name: 'Finance',
    description: 'Professional billing, invoices, client ledger, payments, expenses, and VAT accounting',
    icon: Wallet,
    category: 'business',
    keywords: ['finance', 'invoicing', 'invoices', 'payments', 'clients', 'billing', 'expenses', 'accounts', 'revenue', 'money', 'cash flow', 'receipt', 'tax invoice', 'vat', 'aed'],
    gradient: 'from-emerald-500 to-teal-700',
    component: FinanceApp,
    defaultWindowSize: { width: 1040, height: 700 }
  },
  {
    id: 'growth',
    name: 'Growth',
    description: 'Get clients, follow up properly, stay remembered, build relationships, earn referrals',
    icon: GrowthIcon,
    category: 'business',
    keywords: ['growth', 'leads', 'clients', 'marketing', 'referrals', 'follow up', 'pipeline', 'crm', 'prospects', 'retention', 'playbook', 'campaigns', 'business development'],
    gradient: 'from-teal-500 to-emerald-600',
    component: GrowthApp,
    defaultWindowSize: { width: 920, height: 680 }
  },

  // --- UTILITIES ---
  {
    id: 'calculator',
    name: 'Calculator',
    description: 'Standard & scientific math calculator with history tape and precision currency/unit converter',
    icon: CalcIcon,
    category: 'utilities',
    keywords: ['calculator', 'math', 'numbers', 'addition', 'scientific', 'calculate', 'converter', 'currency', 'exchange', 'units', 'aed', 'usd', 'eur'],
    gradient: 'from-amber-500 to-orange-600',
    component: CalculatorApp,
    defaultWindowSize: { width: 560, height: 640 }
  },
  {
    id: 'time',
    name: 'Time',
    description: 'Focus timer with Liquid Glass hourglass, deep work concentration goals, and global world clocks',
    icon: TimerIcon,
    category: 'utilities',
    keywords: ['time', 'timer', 'hourglass', 'focus', 'stopwatch', 'pomodoro', 'countdown', 'world clock', 'clock', 'timezone', 'dubai', 'manila', 'london', 'new york'],
    gradient: 'from-violet-500 via-indigo-500 to-purple-600',
    component: TimeApp,
    defaultWindowSize: { width: 840, height: 640 }
  },
  {
    id: 'weather',
    name: 'Weather',
    description: 'Live atmospheric conditions, hourly graph, and 7-day forecast',
    icon: CloudSun,
    category: 'utilities',
    keywords: ['weather', 'forecast', 'temperature', 'rain', 'climate', 'sun'],
    gradient: 'from-sky-400 to-blue-600',
    component: WeatherApp,
    defaultWindowSize: { width: 880, height: 620 }
  },
  {
    id: 'files',
    name: 'Files',
    description: 'Organize documents, spreadsheets, presentations, and stored files',
    icon: Folder,
    category: 'utilities',
    keywords: ['files', 'documents', 'docs', 'storage', 'pdf'],
    gradient: 'from-blue-500 to-indigo-600',
    component: FilesApp,
    defaultWindowSize: { width: 840, height: 580 }
  },
  {
    id: 'settings',
    name: 'Settings',
    description: 'Liquid Glass personalization, wallpapers, dashboard layouts, updates, and data backup',
    icon: SettingsIcon,
    category: 'utilities',
    keywords: ['settings', 'preferences', 'theme', 'dark mode', 'wallpaper', 'backup', 'glass', 'updates', 'version', 'changelog', 'release', 'upgrade', 'dashboard', 'layout', 'builder'],
    gradient: 'from-slate-500 to-zinc-700',
    component: SettingsApp,
    defaultWindowSize: { width: 920, height: 640 }
  }
]

// Registry accessor API
export function getRegisteredApps(): RegisteredApp[] {
  return [...APP_REGISTRY]
}

export function getAppById(appId: string): RegisteredApp | undefined {
  return APP_REGISTRY.find(app => app.id === appId)
}

export function getAppsByCategory(category: AppCategory): RegisteredApp[] {
  return APP_REGISTRY.filter(app => app.category === category)
}

export function registerApp(app: RegisteredApp): void {
  const existingIdx = APP_REGISTRY.findIndex(a => a.id === app.id)
  if (existingIdx >= 0) {
    APP_REGISTRY[existingIdx] = app
  } else {
    APP_REGISTRY.push(app)
  }
}
