import { CommandItem } from '@/types'
import {
  Calculator,
  Calendar,
  FileText,
  CheckSquare,
  Timer,
  ArrowLeftRight,
  Settings,
  CloudSun,
  Moon,
  Clock,
  Bell,
  Folder,
  Scale,
  Wallet,
  Lightbulb,
  Target,
  BookMarked,
  Sunrise,
  Shuffle,
  BookOpen,
  Quote as QuoteIcon,
  Sparkles,
  Heart
} from 'lucide-react'
import { focusService } from '@/services/focus'

class CommandRegistryService {
  private commands: CommandItem[] = []

  register(command: CommandItem) {
    const idx = this.commands.findIndex(c => c.id === command.id)
    if (idx >= 0) {
      this.commands[idx] = command
    } else {
      this.commands.push(command)
    }
  }

  registerMultiple(commands: CommandItem[]) {
    commands.forEach(c => this.register(c))
  }

  getAll(): CommandItem[] {
    return [...this.commands]
  }

  search(query: string): CommandItem[] {
    const q = query.toLowerCase().trim()
    if (!q) return this.commands

    return this.commands.filter(cmd => {
      const matchTitle = cmd.title.toLowerCase().includes(q)
      const matchDesc = cmd.description.toLowerCase().includes(q)
      const matchKeyword = cmd.keywords.some(k => k.toLowerCase().includes(q))
      return matchTitle || matchDesc || matchKeyword
    })
  }
}

export const commandRegistry = new CommandRegistryService()

// Default baseline system commands
export function setupDefaultCommands(actions: {
  openApp: (appId: string, customProps?: Record<string, unknown>) => void
  toggleTheme: () => void
  startTimer: (minutes: number) => void
  openConverterWithPair: (from: string, to: string) => void
  createQuickNote: () => void
  createQuickTask: () => void
}) {
  const defaultCommands: CommandItem[] = [
    // --- MORNING COMMANDS ---
    {
      id: 'cmd-open-morning',
      title: 'Open Morning',
      description: 'Open your personal daily starting point and morning overview',
      category: 'apps',
      keywords: ['morning', 'today', 'briefing', 'day', 'start', 'agenda'],
      icon: Sunrise,
      shortcut: 'M',
      execute: () => actions.openApp('morning')
    },
    {
      id: 'cmd-morning-priorities',
      title: "Today's Priorities",
      description: "Review and edit today's 3 primary focus priorities",
      category: 'productivity',
      keywords: ['priorities', 'today', 'focus', 'goals', 'morning'],
      icon: Sunrise,
      execute: () => actions.openApp('morning')
    },
    {
      id: 'cmd-morning-schedule',
      title: "Today's Schedule",
      description: 'View today meetings, hearings, and scheduled agenda',
      category: 'productivity',
      keywords: ['schedule', 'agenda', 'calendar', 'today', 'morning'],
      icon: Sunrise,
      execute: () => actions.openApp('morning')
    },
    {
      id: 'cmd-morning-overview',
      title: 'Morning Overview',
      description: 'Instant glance at focus, finance, hearings, and market stats',
      category: 'productivity',
      keywords: ['overview', 'dashboard', 'morning', 'briefing'],
      icon: Sunrise,
      execute: () => actions.openApp('morning')
    },

    // --- IDEAS COMMANDS ---
    {
      id: 'cmd-open-ideas',
      title: 'Open Ideas',
      description: 'Launch Ideas app for ultra-fast thought capture and organization',
      category: 'apps',
      keywords: ['ideas', 'idea', 'capture', 'brainstorm', 'thoughts', 'concept'],
      icon: Lightbulb,
      shortcut: 'I',
      execute: () => actions.openApp('ideas')
    },
    {
      id: 'cmd-new-idea',
      title: 'New Idea',
      description: 'Instantly capture a thought into your Ideas Inbox',
      category: 'productivity',
      keywords: ['new', 'idea', 'capture', 'quick', 'add idea', 'thought'],
      icon: Lightbulb,
      shortcut: '⌥I',
      execute: () => {
        actions.openApp('ideas')
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('superdash_ideas_new_focus'))
        }, 120)
      }
    },
    {
      id: 'cmd-search-ideas',
      title: 'Search Ideas',
      description: 'Search through all recorded concepts, apps, and business ideas',
      category: 'productivity',
      keywords: ['search', 'find', 'ideas', 'explore', 'thoughts'],
      icon: Lightbulb,
      execute: () => actions.openApp('ideas')
    },
    {
      id: 'cmd-random-idea',
      title: 'Random Idea (Surprise Me)',
      description: 'Rediscover a forgotten unfinished idea from your collection',
      category: 'productivity',
      keywords: ['random', 'surprise', 'rediscover', 'idea', 'shuffle'],
      icon: Shuffle,
      execute: () => actions.openApp('ideas')
    },

    // --- FOCUS COMMANDS ---
    {
      id: 'cmd-open-focus',
      title: 'Open Focus',
      description: 'Launch Focus app for distraction-free concentration sessions',
      category: 'apps',
      keywords: ['focus', 'deep work', 'session', 'concentrate', 'streak'],
      icon: Target,
      shortcut: '⌥F',
      execute: () => actions.openApp('focus')
    },
    {
      id: 'cmd-start-focus',
      title: 'Start Focus',
      description: 'Begin a new concentration session with daily goal tracking',
      category: 'productivity',
      keywords: ['start focus', 'deep work', 'concentrate', 'session'],
      icon: Target,
      execute: () => actions.openApp('focus')
    },
    {
      id: 'cmd-focus-25m',
      title: 'Focus 25 Minutes',
      description: 'Start a 25-minute Pomodoro concentration session',
      category: 'timer',
      keywords: ['focus 25', '25', 'pomodoro', 'work', 'minutes'],
      icon: Target,
      execute: () => {
        actions.openApp('focus')
        setTimeout(() => {
          focusService.startFocusSession('Focus Session', 25)
        }, 100)
      }
    },
    {
      id: 'cmd-focus-45m',
      title: 'Focus 45 Minutes',
      description: 'Start a 45-minute deep work interval',
      category: 'timer',
      keywords: ['focus 45', '45', 'deep work', 'minutes'],
      icon: Target,
      execute: () => {
        actions.openApp('focus')
        setTimeout(() => {
          focusService.startFocusSession('Deep Work', 45)
        }, 100)
      }
    },
    {
      id: 'cmd-focus-60m',
      title: 'Focus 60 Minutes',
      description: 'Start a 1-hour intensive focus session',
      category: 'timer',
      keywords: ['focus 60', '60', 'hour', 'intensive'],
      icon: Target,
      execute: () => {
        actions.openApp('focus')
        setTimeout(() => {
          focusService.startFocusSession('Intensive Focus', 60)
        }, 100)
      }
    },
    {
      id: 'cmd-todays-focus',
      title: "Today's Focus",
      description: 'Review your daily focus goal progress and session history',
      category: 'productivity',
      keywords: ['today', 'focus', 'progress', 'goal', 'history'],
      icon: Target,
      execute: () => actions.openApp('focus')
    },

    // --- DECISION BOOK COMMANDS ---
    {
      id: 'cmd-open-decisions',
      title: 'Open Decision Book',
      description: 'Record decisions, risks, expected outcomes, and evaluate results',
      category: 'apps',
      keywords: ['decision', 'decisions', 'decision book', 'choice', 'review', 'judgment'],
      icon: BookMarked,
      shortcut: 'D',
      execute: () => actions.openApp('decisionbook')
    },
    {
      id: 'cmd-new-decision',
      title: 'New Decision',
      description: 'Record an important decision and formulate expected outcome',
      category: 'productivity',
      keywords: ['new decision', 'record decision', 'choice', 'outcome'],
      icon: BookMarked,
      execute: () => actions.openApp('decisionbook')
    },
    {
      id: 'cmd-decisions-review',
      title: 'Decisions to Review',
      description: 'Evaluate decisions whose review date has arrived',
      category: 'productivity',
      keywords: ['decisions to review', 'review due', 'evaluate', 'outcome'],
      icon: BookMarked,
      execute: () => actions.openApp('decisionbook')
    },
    {
      id: 'cmd-search-decisions',
      title: 'Search Decisions',
      description: 'Search decision logs, reasons, risks, and lessons learned',
      category: 'productivity',
      keywords: ['search decisions', 'find decision', 'history', 'lessons'],
      icon: BookMarked,
      execute: () => actions.openApp('decisionbook')
    },

    // --- FINANCE COMMANDS ---
    {
      id: 'cmd-open-finance',
      title: 'Open Finance',
      description: 'Launch Finance app for invoices, clients, payments, and accounts',
      category: 'apps',
      keywords: ['finance', 'billing', 'invoices', 'payments', 'accounts', 'money', 'revenue', 'expenses'],
      icon: Wallet,
      shortcut: 'F',
      execute: () => actions.openApp('finance')
    },
    {
      id: 'cmd-new-invoice',
      title: 'New Invoice',
      description: 'Create and issue a professional VAT tax invoice',
      category: 'productivity',
      keywords: ['new', 'invoice', 'create', 'bill', 'billing', 'tax', 'vat', 'client'],
      icon: Wallet,
      shortcut: '⌥I',
      execute: () => {
        actions.openApp('finance')
        setTimeout(() => {
          window.dispatchEvent(
            new CustomEvent('superdash_finance_action', { detail: { action: 'new_invoice' } })
          )
        }, 120)
      }
    },
    {
      id: 'cmd-add-client',
      title: 'Add Client',
      description: 'Register a new corporate or individual client profile',
      category: 'productivity',
      keywords: ['add', 'client', 'customer', 'company', 'contact', 'new client'],
      icon: Wallet,
      execute: () => {
        actions.openApp('finance')
        setTimeout(() => {
          window.dispatchEvent(
            new CustomEvent('superdash_finance_action', { detail: { action: 'add_client' } })
          )
        }, 120)
      }
    },
    {
      id: 'cmd-record-payment',
      title: 'Record Payment',
      description: 'Record incoming payment against an invoice and generate receipt',
      category: 'productivity',
      keywords: ['record', 'payment', 'receive', 'paid', 'receipt', 'bank', 'cash'],
      icon: Wallet,
      execute: () => {
        actions.openApp('finance')
        setTimeout(() => {
          window.dispatchEvent(
            new CustomEvent('superdash_finance_action', { detail: { action: 'record_payment' } })
          )
        }, 120)
      }
    },
    {
      id: 'cmd-add-expense',
      title: 'Add Expense',
      description: 'Record a business expense with category and payment method',
      category: 'productivity',
      keywords: ['expense', 'add', 'cost', 'spend', 'bill', 'receipt'],
      icon: Wallet,
      execute: () => {
        actions.openApp('finance')
        setTimeout(() => {
          window.dispatchEvent(
            new CustomEvent('superdash_finance_action', { detail: { action: 'add_expense' } })
          )
        }, 120)
      }
    },
    {
      id: 'cmd-unpaid-invoices',
      title: 'Unpaid Invoices',
      description: 'Filter and review outstanding and overdue invoices',
      category: 'productivity',
      keywords: ['unpaid', 'overdue', 'pending', 'invoices', 'due', 'outstanding'],
      icon: Wallet,
      execute: () => {
        actions.openApp('finance')
        setTimeout(() => {
          window.dispatchEvent(
            new CustomEvent('superdash_finance_action', { detail: { tab: 'invoices', filter: 'unpaid' } })
          )
        }, 120)
      }
    },
    {
      id: 'cmd-open-hearings',
      title: 'Open Hearings',
      description: 'Launch Hearings app to review court sessions and decisions',
      category: 'apps',
      keywords: ['hearings', 'court', 'case', 'legal', 'lawyer', 'session', 'law'],
      icon: Scale,
      shortcut: 'H',
      execute: () => actions.openApp('hearings')
    },
    {
      id: 'cmd-add-hearing',
      title: 'Add Hearing',
      description: 'Register a new court hearing session',
      category: 'productivity',
      keywords: ['hearing', 'add', 'court', 'case', 'session', 'new'],
      icon: Scale,
      shortcut: '⌥H',
      execute: () => {
        actions.openApp('hearings')
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('superdash_hearings_action', { detail: { action: 'add' } }))
        }, 120)
      }
    },
    {
      id: 'cmd-today-hearings',
      title: "Today's Hearings",
      description: "View all court hearings scheduled for today",
      category: 'productivity',
      keywords: ['today', 'hearings', 'court', 'sessions', 'schedule'],
      icon: Scale,
      execute: () => {
        actions.openApp('hearings')
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('superdash_hearings_action', { detail: { view: 'today' } }))
        }, 120)
      }
    },
    {
      id: 'cmd-upcoming-hearings',
      title: 'Upcoming Hearings',
      description: 'View upcoming future court sessions',
      category: 'productivity',
      keywords: ['upcoming', 'hearings', 'future', 'court', 'agenda'],
      icon: Scale,
      execute: () => {
        actions.openApp('hearings')
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('superdash_hearings_action', { detail: { view: 'upcoming' } }))
        }, 120)
      }
    },
    {
      id: 'cmd-open-calc',
      title: 'Open Calculator',
      description: 'Launch the standard and scientific calculator',
      category: 'apps',
      keywords: ['calculator', 'math', 'open', 'calc'],
      icon: Calculator,
      shortcut: 'C',
      execute: () => actions.openApp('calculator')
    },
    {
      id: 'cmd-create-note',
      title: 'Create Note',
      description: 'Open Notes app and start drafting a new note',
      category: 'productivity',
      keywords: ['note', 'notes', 'create', 'write', 'memo'],
      icon: FileText,
      shortcut: 'N',
      execute: () => {
        actions.openApp('notes')
        actions.createQuickNote()
      }
    },
    {
      id: 'cmd-add-task',
      title: 'Add Task',
      description: 'Quickly record a new task to complete',
      category: 'productivity',
      keywords: ['task', 'todo', 'add', 'goal', 'new'],
      icon: CheckSquare,
      shortcut: 'T',
      execute: () => {
        actions.openApp('tasks')
        actions.createQuickTask()
      }
    },
    {
      id: 'cmd-timer-10m',
      title: 'Timer 10 minutes',
      description: 'Start a 10-minute focus countdown',
      category: 'timer',
      keywords: ['timer', '10', 'minutes', 'countdown'],
      icon: Timer,
      execute: () => {
        actions.startTimer(10)
        actions.openApp('timer')
      }
    },
    {
      id: 'cmd-timer-25m',
      title: 'Start 25 minute focus',
      description: 'Launch a 25-minute Pomodoro session with animated hourglass',
      category: 'timer',
      keywords: ['focus', 'pomodoro', '25', 'work', 'deep'],
      icon: Timer,
      execute: () => {
        actions.startTimer(25)
        actions.openApp('timer')
      }
    },
    {
      id: 'cmd-open-calendar',
      title: 'Open Calendar',
      description: 'View monthly schedule and today agenda',
      category: 'apps',
      keywords: ['calendar', 'events', 'schedule', 'agenda'],
      icon: Calendar,
      execute: () => actions.openApp('calendar')
    },
    {
      id: 'cmd-convert-usd-aed',
      title: 'Convert USD to AED',
      description: 'Check live exchange rates between US Dollar and UAE Dirham',
      category: 'convert',
      keywords: ['convert', 'usd', 'aed', 'currency', 'rates'],
      icon: ArrowLeftRight,
      execute: () => actions.openConverterWithPair('USD', 'AED')
    },
    {
      id: 'cmd-convert-aed-mad',
      title: 'Convert AED to MAD',
      description: 'Check live exchange rates between UAE Dirham and Moroccan Dirham',
      category: 'convert',
      keywords: ['convert', 'aed', 'mad', 'currency', 'dirham'],
      icon: ArrowLeftRight,
      execute: () => actions.openConverterWithPair('AED', 'MAD')
    },
    {
      id: 'cmd-change-theme',
      title: 'Change Theme',
      description: 'Toggle between dark and light Liquid Glass mode',
      category: 'system',
      keywords: ['theme', 'dark', 'light', 'mode', 'switch', 'color'],
      icon: Moon,
      execute: () => actions.toggleTheme()
    },
    {
      id: 'cmd-open-weather',
      title: 'Open Weather',
      description: 'View atmospheric conditions and 7-day forecast',
      category: 'apps',
      keywords: ['weather', 'forecast', 'rain', 'temp', 'temperature'],
      icon: CloudSun,
      execute: () => actions.openApp('weather')
    },
    {
      id: 'cmd-open-reminders',
      title: 'Open Reminders',
      description: 'Check upcoming notifications and deadlines',
      category: 'apps',
      keywords: ['reminders', 'alerts', 'notifications'],
      icon: Bell,
      execute: () => actions.openApp('reminders')
    },
    {
      id: 'cmd-open-files',
      title: 'Open Files',
      description: 'Explore documents, spreadsheets, and stored files',
      category: 'apps',
      keywords: ['files', 'documents', 'docs', 'storage'],
      icon: Folder,
      execute: () => actions.openApp('files')
    },
    {
      id: 'cmd-open-worldclock',
      title: 'Open World Clock',
      description: 'View global time across world cities',
      category: 'apps',
      keywords: ['world', 'clock', 'time', 'zones', 'dubai', 'london'],
      icon: Clock,
      execute: () => actions.openApp('worldclock')
    },
    {
      id: 'cmd-open-settings',
      title: 'Open Settings',
      description: 'Configure Liquid Glass, wallpapers, and widgets',
      category: 'system',
      keywords: ['settings', 'preferences', 'wallpaper', 'glass', 'configure'],
      icon: Settings,
      execute: () => actions.openApp('settings')
    },
    // --- READER COMMANDS ---
    {
      id: 'cmd-open-reader',
      title: 'Open Reader',
      description: 'Distraction-free article reader with highlights and translation',
      category: 'apps',
      keywords: ['reader', 'read', 'article', 'book', 'clean', 'distraction free'],
      icon: BookOpen,
      shortcut: 'R',
      execute: () => actions.openApp('reader')
    },
    {
      id: 'cmd-reader-quotes',
      title: 'View Saved Quotes',
      description: 'Explore wisdom and saved quotations across your reading library',
      category: 'productivity',
      keywords: ['quotes', 'quotations', 'wisdom', 'reader', 'saved'],
      icon: QuoteIcon,
      execute: () => actions.openApp('reader', { initialTab: 'quotes' })
    },
    {
      id: 'cmd-reader-library',
      title: 'Reading Library',
      description: 'Browse in-progress, unread, finished, and favorite articles',
      category: 'productivity',
      keywords: ['library', 'reading', 'articles', 'unread', 'reader'],
      icon: BookOpen,
      execute: () => actions.openApp('reader')
    },
    // --- LIVE COMMANDS ---
    {
      id: 'cmd-open-live',
      title: 'Open Live',
      description: 'A gentle reminder to pause, look around, and live today',
      category: 'apps',
      keywords: ['live', 'pause', 'breathe', 'peace', 'quiet', 'moment'],
      icon: Sparkles,
      shortcut: 'L',
      execute: () => actions.openApp('live')
    },
    {
      id: 'cmd-live-moment',
      title: 'Take a Moment',
      description: 'Receive one gentle invitation to notice the world outside',
      category: 'productivity',
      keywords: ['moment', 'pause', 'invitation', 'walk', 'breathe', 'live'],
      icon: Sparkles,
      execute: () => actions.openApp('live')
    },
    {
      id: 'cmd-live-remember',
      title: 'Remember Something',
      description: 'Preserve an ordinary moment in the Memory Jar',
      category: 'productivity',
      keywords: ['remember', 'memory', 'jar', 'keep', 'preserve', 'live'],
      icon: Heart,
      execute: () => actions.openApp('live', { initialView: 'remember' })
    },
    // --- COLLECTIONS COMMANDS ---
    {
      id: 'cmd-open-collections',
      title: 'Open Collections',
      description: 'Curated library of articles, research, quotes, and ideas',
      category: 'apps',
      keywords: ['collections', 'collection', 'curate', 'library', 'research', 'gather'],
      icon: Sparkles,
      shortcut: 'C',
      execute: () => actions.openApp('collections')
    },
    {
      id: 'cmd-new-collection',
      title: 'New Collection',
      description: 'Create a new curated collection for research or inspiration',
      category: 'productivity',
      keywords: ['new collection', 'create collection', 'gather', 'curate'],
      icon: Sparkles,
      execute: () => actions.openApp('collections', { openCreateModal: true })
    },
    {
      id: 'cmd-search-collections',
      title: 'Search Collections',
      description: 'Search across all collections, curated items, and references',
      category: 'productivity',
      keywords: ['search collections', 'find collection', 'library search'],
      icon: Sparkles,
      execute: () => actions.openApp('collections')
    },
    // --- DASHBOARD BUILDER COMMANDS ---
    {
      id: 'cmd-open-builder',
      title: 'Open Dashboard Builder',
      description: 'Visually configure, resize, and position widgets and dashboards',
      category: 'apps',
      keywords: ['dashboard', 'builder', 'layout', 'canvas', 'edit dashboard', 'widgets'],
      icon: Sparkles,
      shortcut: 'B',
      execute: () => actions.openApp('dashboardbuilder')
    },
    {
      id: 'cmd-edit-dashboard',
      title: 'Edit Current Dashboard',
      description: 'Open the visual canvas editor for your active workspace',
      category: 'system',
      keywords: ['edit layout', 'change widgets', 'customize desktop'],
      icon: Sparkles,
      execute: () => actions.openApp('dashboardbuilder')
    },
    {
      id: 'cmd-new-dashboard',
      title: 'New Dashboard Workspace',
      description: 'Create a new independent dashboard page with custom widgets',
      category: 'system',
      keywords: ['new dashboard', 'add workspace', 'create layout'],
      icon: Sparkles,
      execute: () => actions.openApp('dashboardbuilder', { openNewModal: true })
    }
  ]

  commandRegistry.registerMultiple(defaultCommands)
}
