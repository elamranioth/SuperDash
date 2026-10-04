import { ComponentType } from 'react'
import {
  Coins,
  Clock,
  FileText,
  CheckSquare,
  Timer,
  Globe,
  Scale,
  Wallet,
  Lightbulb,
  Target,
  BookMarked,
  Sunrise,
  Sparkles
} from 'lucide-react'
import { WidgetDefinition } from '@/types'

export interface RegisteredWidget extends WidgetDefinition {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: ComponentType<any>
}

// Master list of available widgets
const WIDGET_REGISTRY: WidgetDefinition[] = [
  {
    id: 'markets',
    name: 'Live Markets',
    description: 'Real-time crypto (BTC/USD) and fiat exchange rates (AED/MAD, USD/AED)',
    icon: Coins,
    defaultSize: 'md',
    supportedSizes: ['sm', 'md', 'lg'],
    category: 'finance'
  },
  {
    id: 'clock',
    name: 'Clock & Date',
    description: 'Real-time live ticking clock and day calendar indicator',
    icon: Clock,
    defaultSize: 'sm',
    supportedSizes: ['sm', 'md'],
    category: 'clock'
  },
  {
    id: 'quicknotes',
    name: 'Quick Notes',
    description: 'Instant scratchpad with background autosave',
    icon: FileText,
    defaultSize: 'sm',
    supportedSizes: ['sm', 'md', 'lg'],
    category: 'productivity'
  },
  {
    id: 'tasks',
    name: 'Tasks Checklist',
    description: 'Overview of pending priority goals and instant checkmark',
    icon: CheckSquare,
    defaultSize: 'sm',
    supportedSizes: ['sm', 'md'],
    category: 'productivity'
  },
  {
    id: 'timer',
    name: 'Focus Timer',
    description: 'Synchronized countdown status and quick 5m/10m/25m presets',
    icon: Timer,
    defaultSize: 'sm',
    supportedSizes: ['sm', 'md'],
    category: 'tools'
  },
  {
    id: 'worldclock',
    name: 'World Clocks',
    description: 'Simultaneous time across Dubai, Manila, London, New York',
    icon: Globe,
    defaultSize: 'sm',
    supportedSizes: ['sm', 'md'],
    category: 'clock'
  },
  {
    id: 'hearings',
    name: 'Upcoming Hearings',
    description: 'Upcoming court sessions, today agenda, and judicial decision status',
    icon: Scale,
    defaultSize: 'md',
    supportedSizes: ['sm', 'md', 'lg'],
    category: 'legal'
  },
  {
    id: 'finance',
    name: 'Finance — This Month',
    description: 'Real-time received income, expenses, net cash flow, and overdue billing alerts',
    icon: Wallet,
    defaultSize: 'md',
    supportedSizes: ['sm', 'md', 'lg'],
    category: 'finance'
  },
  {
    id: 'quickidea',
    name: 'Quick Idea',
    description: 'Instant personal thought capture and unorganized ideas count',
    icon: Lightbulb,
    defaultSize: 'sm',
    supportedSizes: ['sm', 'md'],
    category: 'productivity'
  },
  {
    id: 'focus',
    name: 'Focus',
    description: 'Concentration session progress, daily goal tracking, and instant session start',
    icon: Target,
    defaultSize: 'sm',
    supportedSizes: ['sm', 'md'],
    category: 'productivity'
  },
  {
    id: 'decisions',
    name: 'Decisions to Review',
    description: 'Overview of decisions whose scheduled review date has arrived',
    icon: BookMarked,
    defaultSize: 'sm',
    supportedSizes: ['sm', 'md', 'lg'],
    category: 'productivity'
  },
  {
    id: 'morning',
    name: 'Today',
    description: 'Daily briefing summary of court hearings, tasks, reminders, and reviews',
    icon: Sunrise,
    defaultSize: 'sm',
    supportedSizes: ['sm', 'md'],
    category: 'productivity'
  },
  {
    id: 'collection',
    name: 'Curated Collection',
    description: 'Glance at latest articles, quotes, ideas, and links inside a chosen collection',
    icon: Sparkles,
    defaultSize: 'md',
    supportedSizes: ['sm', 'md'],
    category: 'personal',
    settingsSchema: {
      fields: [
        {
          id: 'collectionId',
          label: 'Collection ID',
          type: 'text',
          defaultValue: 'col-ai'
        }
      ]
    }
  }
]

export function getAllWidgets(): WidgetDefinition[] {
  return [...WIDGET_REGISTRY]
}

export function getWidgetById(id: string): WidgetDefinition | undefined {
  return WIDGET_REGISTRY.find(w => w.id === id)
}
