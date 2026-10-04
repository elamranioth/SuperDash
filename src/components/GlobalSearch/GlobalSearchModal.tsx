import { useState, useEffect, useRef, useMemo } from 'react'
import {
  Search,
  Command,
  FileText,
  CheckSquare,
  Calendar as CalIcon,
  Calculator as CalcIcon,
  CornerDownLeft,
  Sparkles,
  X,
  Terminal,
  Bell,
  Folder,
  Coins,
  ArrowRight,
  Scale,
  Wallet,
  Lightbulb,
  BookMarked,
  BookOpen,
  Quote as QuoteIcon,
  TrendingUp
} from 'lucide-react'
import { getRegisteredApps } from '@/registry/appRegistry'
import { storageService, INITIAL_NOTES, INITIAL_TASKS, INITIAL_CALENDAR_EVENTS, INITIAL_REMINDERS, INITIAL_DOCUMENTS } from '@/services/storage'
import { commandRegistry } from '@/services/commands'
import { ISO_CURRENCIES } from '@/services/currency'
import { hearingRepository } from '@/services/hearings'
import { financeService, formatMoney, roundMoney } from '@/services/finance'
import { ideasService } from '@/services/ideas'
import { decisionService } from '@/services/decisions'
import { readerRepository, annotationService } from '@/services/reader'
import { liveRepository, HUMAN_VOICES } from '@/services/live'
import { collectionsRepository } from '@/services/collections'
import { dashboardRepository } from '@/services/dashboardBuilder'
import { growthService } from '@/services/growth'
import { Lead } from '@/types/growth'
import {
  NoteItem,
  TaskItem,
  CalendarEvent,
  ReminderItem,
  DocumentItem,
  SearchResultItem,
  Hearing,
  Invoice,
  Client,
  IdeaItem,
  DecisionItem,
  Article,
  Quote,
  LiveMemory,
  Collection,
  CollectionItem,
  DashboardDefinition
} from '@/types'
import { sounds } from '@/utils/sound'

interface GlobalSearchModalProps {
  isOpen: boolean
  onClose: () => void
  onOpenApp: (appId: string, customProps?: Record<string, unknown>) => void
  onOpenConverterWithPair?: (from: string, to: string) => void
}

export default function GlobalSearchModal({
  isOpen,
  onClose,
  onOpenApp,
  onOpenConverterWithPair
}: GlobalSearchModalProps) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  // Local caches for deep search
  const [notes, setNotes] = useState<NoteItem[]>([])
  const [tasks, setTasks] = useState<TaskItem[]>([])
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [reminders, setReminders] = useState<ReminderItem[]>([])
  const [documents, setDocuments] = useState<DocumentItem[]>([])
  const [hearings, setHearings] = useState<Hearing[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [ideas, setIdeas] = useState<IdeaItem[]>([])
  const [decisions, setDecisions] = useState<DecisionItem[]>([])
  const [readerArticles, setReaderArticles] = useState<Article[]>([])
  const [readerQuotes, setReaderQuotes] = useState<Quote[]>([])
  const [liveMemories, setLiveMemories] = useState<LiveMemory[]>([])
  const [collections, setCollections] = useState<Collection[]>([])
  const [collectionItems, setCollectionItems] = useState<CollectionItem[]>([])
  const [dashboards, setDashboards] = useState<DashboardDefinition[]>([])
  const [growthLeads, setGrowthLeads] = useState<Lead[]>([])

  useEffect(() => {
    if (isOpen) {
      storageService.get<NoteItem[]>('notes', INITIAL_NOTES).then(setNotes)
      storageService.get<TaskItem[]>('tasks', INITIAL_TASKS).then(setTasks)
      storageService.get<CalendarEvent[]>('calendar_events', INITIAL_CALENDAR_EVENTS).then(setEvents)
      storageService.get<ReminderItem[]>('reminders_list', INITIAL_REMINDERS).then(setReminders)
      storageService.get<DocumentItem[]>('stored_documents', INITIAL_DOCUMENTS).then(setDocuments)
      hearingRepository.getAll().then(setHearings)
      financeService.getInvoices().then(setInvoices)
      financeService.getClients(true).then(setClients)
      ideasService.getAll().then(setIdeas)
      decisionService.getAll().then(setDecisions)
      readerRepository.getAllArticles().then(setReaderArticles)
      annotationService.getQuotes().then(setReaderQuotes)
      growthService.getLeads().then(setGrowthLeads)
      // Check privacy preference: only load if user explicitly opted in
      liveRepository.getPreferences().then(prefs => {
        if (prefs.includeMemoriesInSearch) {
          liveRepository.getMemories().then(setLiveMemories)
        } else {
          setLiveMemories([])
        }
      })
      collectionsRepository.getAllCollections(false).then(setCollections)
      collectionsRepository.getAllItems().then(setCollectionItems)
      dashboardRepository.getAllDashboards().then(setDashboards)
      setQuery('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 40)
    }
  }, [isOpen])

  // Quick math calculator evaluator
  const mathResult = useMemo(() => {
    if (!query.trim()) return null
    const sanitized = query.trim()
    if (/^[\d\s+\-*/().%^eE]+$/.test(sanitized) && /[\d]/.test(sanitized)) {
      try {
        const expr = sanitized.replace(/\^/g, '**')
        // eslint-disable-next-line no-new-func
        const res = Function(`'use strict'; return (${expr})`)()
        if (typeof res === 'number' && !isNaN(res) && isFinite(res)) {
          return {
            equation: query,
            value: Number.isInteger(res) ? res.toString() : parseFloat(res.toFixed(6)).toString()
          }
        }
      } catch {
        return null
      }
    }
    return null
  }, [query])

  // Results indexing across All Sources
  const results = useMemo(() => {
    const q = query.toLowerCase().trim()
    const allApps = getRegisteredApps()
    const items: SearchResultItem[] = []

    // 1. Math calculation result
    if (mathResult) {
      items.push({
        id: 'math-calc',
        type: 'calc',
        title: `= ${mathResult.value}`,
        subtitle: `Calculation: ${mathResult.equation}`,
        icon: CalcIcon,
        categoryLabel: 'Quick Math',
        badge: 'Formula',
        action: () => {
          sounds.playSuccess()
          navigator.clipboard?.writeText(mathResult.value)?.catch(() => {})
          onClose()
        }
      })
    }

    // 2. Command Palette commands
    if (q) {
      const commands = commandRegistry.search(q)
      commands.forEach(cmd => {
        items.push({
          id: cmd.id,
          type: 'command',
          title: cmd.title,
          subtitle: cmd.description,
          icon: cmd.icon || Terminal,
          categoryLabel: 'Commands',
          badge: cmd.shortcut || 'Action',
          action: () => {
            sounds.playSuccess()
            cmd.execute()
            onClose()
          }
        })
      })
    }

    // 3. Currency quick lookups
    if (q) {
      const matchedCurrencies = ISO_CURRENCIES.filter(
        c => c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q)
      ).slice(0, 3)

      matchedCurrencies.forEach(c => {
        items.push({
          id: `currency-${c.code}`,
          type: 'convert',
          title: `${c.code} (${c.name})`,
          subtitle: `1 USD ≈ ${c.rateAgainstUSD} ${c.code} • Click to open converter`,
          icon: Coins,
          categoryLabel: 'Currencies',
          badge: c.flag,
          action: () => {
            sounds.playClick()
            if (onOpenConverterWithPair) {
              onOpenConverterWithPair('USD', c.code)
            } else {
              onOpenApp('converter')
            }
            onClose()
          }
        })
      })
    }

    // 4. Apps search
    allApps.forEach(app => {
      const matchName = app.name.toLowerCase().includes(q)
      const matchDesc = app.description.toLowerCase().includes(q)
      const matchKeyword = app.keywords.some(k => k.toLowerCase().includes(q))
      const matchCat = app.category.toLowerCase().includes(q)

      if (!q || matchName || matchDesc || matchKeyword || matchCat) {
        items.push({
          id: `app-${app.id}`,
          type: 'app',
          title: app.name,
          subtitle: app.description,
          icon: app.icon,
          categoryLabel: 'Applications',
          badge: app.category,
          action: () => {
            sounds.playClick()
            onOpenApp(app.id)
            onClose()
          }
        })
      }
    })

    // 5. Deep Content Searches if query is non-empty
    if (q) {
      // Notes
      notes.forEach(note => {
        if (
          note.title.toLowerCase().includes(q) ||
          note.content.toLowerCase().includes(q) ||
          note.tags.some(t => t.toLowerCase().includes(q))
        ) {
          items.push({
            id: `note-${note.id}`,
            type: 'note',
            title: note.title || 'Untitled Note',
            subtitle: note.content.slice(0, 60) || 'Empty note content',
            icon: FileText,
            categoryLabel: 'Notes',
            badge: note.tags[0] || 'Note',
            action: () => {
              sounds.playClick()
              onOpenApp('plan', { initialTab: 'notes', initialNoteId: note.id })
              onClose()
            }
          })
        }
      })

      // Tasks
      tasks.forEach(task => {
        if (
          task.title.toLowerCase().includes(q) ||
          task.priority.toLowerCase().includes(q) ||
          task.tag?.toLowerCase().includes(q)
        ) {
          items.push({
            id: `task-${task.id}`,
            type: 'task',
            title: task.title,
            subtitle: `Priority: ${task.priority.toUpperCase()} • ${task.dueDate ? `Due ${task.dueDate}` : 'Pending'}`,
            icon: CheckSquare,
            categoryLabel: 'Tasks',
            badge: task.completed ? 'Done' : 'Pending',
            action: () => {
              sounds.playClick()
              onOpenApp('plan', { initialTab: 'tasks' })
              onClose()
            }
          })
        }
      })

      // Calendar Events
      events.forEach(evt => {
        if (
          evt.title.toLowerCase().includes(q) ||
          evt.description?.toLowerCase().includes(q) ||
          evt.date.includes(q)
        ) {
          items.push({
            id: `evt-${evt.id}`,
            type: 'calendar',
            title: evt.title,
            subtitle: `${evt.date} • ${evt.startTime || 'All day'}`,
            icon: CalIcon,
            categoryLabel: 'Calendar',
            badge: 'Event',
            action: () => {
              sounds.playClick()
              onOpenApp('tasks')
              onClose()
            }
          })
        }
      })

      // Reminders
      reminders.forEach(rem => {
        if (rem.title.toLowerCase().includes(q) || rem.notes?.toLowerCase().includes(q)) {
          items.push({
            id: `rem-${rem.id}`,
            type: 'reminder',
            title: rem.title,
            subtitle: `${rem.date} ${rem.time ? `at ${rem.time}` : ''}`,
            icon: Bell,
            categoryLabel: 'Reminders',
            badge: rem.completed ? 'Done' : 'Alert',
            action: () => {
              sounds.playClick()
              onOpenApp('tasks')
              onClose()
            }
          })
        }
      })

      // Documents
      documents.forEach(doc => {
        if (doc.name.toLowerCase().includes(q) || doc.category.toLowerCase().includes(q)) {
          items.push({
            id: `doc-${doc.id}`,
            type: 'file',
            title: doc.name,
            subtitle: `${doc.category} • ${(doc.sizeBytes / 1024).toFixed(1)} KB`,
            icon: Folder,
            categoryLabel: 'Documents',
            badge: doc.type,
            action: () => {
              sounds.playClick()
              onOpenApp('collections')
              onClose()
            }
          })
        }
      })

      // Hearings (Legal court sessions, decisions, and case numbers)
      hearings.forEach(h => {
        if (
          h.clientName.toLowerCase().includes(q) ||
          h.caseNumber.toLowerCase().includes(q) ||
          (h.caseType && h.caseType.toLowerCase().includes(q)) ||
          (h.court && h.court.toLowerCase().includes(q)) ||
          (h.decision && h.decision.toLowerCase().includes(q)) ||
          (h.notes && h.notes.toLowerCase().includes(q))
        ) {
          items.push({
            id: `hearing-${h.id}`,
            type: 'hearing',
            title: `${h.clientName} • ${h.caseNumber}`,
            subtitle: `${h.hearingDate}${h.hearingTime ? ` ${h.hearingTime}` : ''} • ${h.court || 'Court'}${h.decision ? ` • Result: ${h.decision}` : ''}`,
            icon: Scale,
            categoryLabel: 'Hearings',
            badge: h.status,
            action: () => {
              sounds.playClick()
              onOpenApp('hearings', { initialHearingId: h.id })
              onClose()
            }
          })
        }
      })

      // Finance Invoices & Clients
      const clientMap = new Map(clients.map(c => [c.id, c]))

      invoices.forEach(inv => {
        const client = clientMap.get(inv.clientId)
        const clientName = client?.name || client?.companyName || 'Client'
        const isMatchNum = inv.invoiceNumber.toLowerCase().includes(q)
        const isMatchClient = clientName.toLowerCase().includes(q)
        const isMatchNotes = inv.notes?.toLowerCase().includes(q) || false
        const isMatchItem = inv.items.some(it => it.description.toLowerCase().includes(q))
        const isUnpaid = inv.status === 'Unpaid' || inv.status === 'Overdue' || inv.status === 'Partially Paid'
        const isMatchUnpaidQuery = (q === 'unpaid' || q === 'unpaid invoices' || q === 'overdue') && isUnpaid

        if (isMatchNum || isMatchClient || isMatchNotes || isMatchItem || isMatchUnpaidQuery) {
          items.push({
            id: `invoice-${inv.id}`,
            type: 'finance',
            title: `Invoice #${inv.invoiceNumber} • ${clientName}`,
            subtitle: `${inv.invoiceDate} • Total: ${formatMoney(inv.total, inv.currency)} • Status: ${inv.status}`,
            icon: Wallet,
            categoryLabel: 'Finance',
            badge: inv.status,
            action: () => {
              sounds.playClick()
              onOpenApp('finance', { initialInvoiceId: inv.id })
              onClose()
            }
          })
        }
      })

      // Clients
      clients.forEach(client => {
        if (
          client.name.toLowerCase().includes(q) ||
          (client.companyName && client.companyName.toLowerCase().includes(q)) ||
          (client.email && client.email.toLowerCase().includes(q)) ||
          (client.phone && client.phone.toLowerCase().includes(q)) ||
          (client.taxNumber && client.taxNumber.toLowerCase().includes(q))
        ) {
          const clientInvoices = invoices.filter(i => i.clientId === client.id && i.status !== 'Cancelled')
          const totalInvoiced = roundMoney(clientInvoices.reduce((sum, i) => sum + i.total, 0))

          items.push({
            id: `client-${client.id}`,
            type: 'finance',
            title: `${client.name}${client.companyName ? ` (${client.companyName})` : ''}`,
            subtitle: `${client.phone || client.email || 'Client Profile'} • Invoiced: ${formatMoney(totalInvoiced, 'AED')}`,
            icon: Wallet,
            categoryLabel: 'Clients',
            badge: 'Client',
            action: () => {
              sounds.playClick()
              onOpenApp('finance', { initialClientId: client.id })
              onClose()
            }
          })
        }
      })

      // Ideas
      ideas.forEach(idea => {
        if (
          idea.title.toLowerCase().includes(q) ||
          idea.description?.toLowerCase().includes(q) ||
          idea.category?.toLowerCase().includes(q) ||
          idea.tags?.some(t => t.toLowerCase().includes(q))
        ) {
          items.push({
            id: `idea-${idea.id}`,
            type: 'idea',
            title: idea.title,
            subtitle: idea.description ? idea.description.slice(0, 65) : `${idea.category || 'Idea'} • ${idea.status}`,
            icon: Lightbulb,
            categoryLabel: 'Ideas',
            badge: idea.status,
            action: () => {
              sounds.playClick()
              onOpenApp('ideas', { initialIdeaId: idea.id })
              onClose()
            }
          })
        }
      })

      // Decisions
      decisions.forEach(dec => {
        if (
          dec.title.toLowerCase().includes(q) ||
          dec.decision.toLowerCase().includes(q) ||
          dec.context?.toLowerCase().includes(q) ||
          dec.reasons?.some(r => r.toLowerCase().includes(q)) ||
          dec.category.toLowerCase().includes(q)
        ) {
          items.push({
            id: `dec-${dec.id}`,
            type: 'decision',
            title: dec.title,
            subtitle: `Decided: ${dec.decision.slice(0, 60)} • ${dec.status}`,
            icon: BookMarked,
            categoryLabel: 'Decision Book',
            badge: dec.status,
            action: () => {
              sounds.playClick()
              onOpenApp('decisionbook', { initialDecisionId: dec.id })
              onClose()
            }
          })
        }
      })



      // Human Voices (Verified historical reflections)
      HUMAN_VOICES.forEach(voice => {
        if (
          voice.quote.toLowerCase().includes(q) ||
          voice.person.toLowerCase().includes(q)
        ) {
          items.push({
            id: `voice-${voice.id}`,
            type: 'live',
            title: `"${voice.quote.slice(0, 65)}..."`,
            subtitle: `${voice.person} • ${voice.source}`,
            icon: Sparkles,
            categoryLabel: 'Human Voices',
            badge: 'Live',
            action: () => {
              sounds.playClick()
              onOpenApp('live', { initialView: 'voices' })
              onClose()
            }
          })
        }
      })

      // Private Live Memories (strictly only if user opted in via Live Settings)
      liveMemories.forEach(mem => {
        if (mem.text.toLowerCase().includes(q)) {
          items.push({
            id: `mem-${mem.id}`,
            type: 'live',
            title: `"${mem.text.slice(0, 65)}..."`,
            subtitle: `Memory Jar • ${mem.date}`,
            icon: Sparkles,
            categoryLabel: 'Memories',
            badge: 'Private',
            action: () => {
              sounds.playClick()
              onOpenApp('live', { initialView: 'remember' })
              onClose()
            }
          })
        }
      })

      // Collections
      collections.forEach(col => {
        if (
          col.name.toLowerCase().includes(q) ||
          (col.description && col.description.toLowerCase().includes(q))
        ) {
          items.push({
            id: `col-${col.id}`,
            type: 'collection',
            title: col.name,
            subtitle: col.description || 'Curated Collection',
            icon: Sparkles,
            categoryLabel: 'Collections',
            badge: 'Collection',
            action: () => {
              sounds.playClick()
              onOpenApp('collections', { initialCollectionId: col.id })
              onClose()
            }
          })
        }
      })

      // Collection Items
      collectionItems.forEach(ci => {
        // Privacy safeguard: If referencing a live_memory and user has not opted into memory search, omit
        if (ci.sourceType === 'live_memory' && liveMemories.length === 0) return

        if (
          ci.title.toLowerCase().includes(q) ||
          (ci.description && ci.description.toLowerCase().includes(q)) ||
          (ci.note && ci.note.toLowerCase().includes(q)) ||
          (ci.manualContent && ci.manualContent.toLowerCase().includes(q))
        ) {
          const parentCol = collections.find(c => c.id === ci.collectionId)
          items.push({
            id: `col-item-${ci.id}`,
            type: 'collection_item',
            title: ci.title,
            subtitle: parentCol ? `Inside ${parentCol.name} (${ci.itemType})` : `Collection Item (${ci.itemType})`,
            icon: Sparkles,
            categoryLabel: 'Collections',
            badge: ci.itemType,
            action: () => {
              sounds.playClick()
              onOpenApp('collections', { initialCollectionId: ci.collectionId })
              onClose()
            }
          })
        }
      })

      // Dashboards
      dashboards.forEach(dash => {
        if (
          dash.name.toLowerCase().includes(q) ||
          (dash.description && dash.description.toLowerCase().includes(q))
        ) {
          items.push({
            id: `dash-res-${dash.id}`,
            type: 'dashboard',
            title: dash.name,
            subtitle: `${dash.items.length} widgets · ${dash.description || 'Workspace'}`,
            icon: Sparkles,
            categoryLabel: 'Dashboards',
            badge: dash.isDefault ? 'Default' : 'Dashboard',
            action: () => {
              sounds.playClick()
              dashboardRepository.setActiveDashboard(dash.id)
              onClose()
            }
          })
        }
      })

      // Growth Leads
      growthLeads.forEach(lead => {
        if (
          lead.name.toLowerCase().includes(q) ||
          (lead.company && lead.company.toLowerCase().includes(q)) ||
          (lead.serviceInterest && lead.serviceInterest.toLowerCase().includes(q)) ||
          (lead.notes && lead.notes.toLowerCase().includes(q))
        ) {
          items.push({
            id: `growth-${lead.id}`,
            type: 'growth',
            title: `${lead.name}${lead.company ? ` • ${lead.company}` : ''}`,
            subtitle: `${lead.serviceInterest || 'Lead'} • Stage: ${lead.stage}`,
            icon: TrendingUp,
            categoryLabel: 'Growth',
            badge: lead.stage,
            action: () => {
              sounds.playClick()
              onOpenApp('growth', { initialLeadId: lead.id, initialView: 'leads' })
              onClose()
            }
          })
        }
      })
    }

    return items
  }, [
    query,
    mathResult,
    notes,
    tasks,
    events,
    reminders,
    documents,
    hearings,
    invoices,
    clients,
    ideas,
    decisions,
    readerArticles,
    readerQuotes,
    liveMemories,
    collections,
    collectionItems,
    dashboards,
    onOpenApp,
    onClose,
    onOpenConverterWithPair
  ])

  useEffect(() => {
    setSelectedIndex(0)
  }, [results.length])

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : results.length - 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (results[selectedIndex]) {
        results[selectedIndex].action()
      }
    } else if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-start justify-center pt-16 md:pt-24 px-4 select-none"
    >
      <div
        onClick={e => e.stopPropagation()}
        className="w-full max-w-2xl liquid-glass-heavy rounded-3xl spotlight-glow overflow-hidden animate-window-open shadow-2xl flex flex-col max-h-[78vh] relative"
      >
        <div className="glass-specular" />

        {/* Search Input Bar */}
        <div className="relative p-4 md:p-5 border-b border-white/10 flex items-center gap-3 z-10">
          <Search className="w-5 h-5 text-indigo-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search apps, commands, notes, tasks, finances, currencies, math..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent border-none text-base md:text-lg text-white placeholder-slate-500 focus:outline-none font-sans"
          />

          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg bg-white/10 text-[10px] text-slate-300 font-mono">
            <span>ESC to close</span>
          </div>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1 relative z-10">
          {results.length === 0 ? (
            <div className="py-12 text-center text-slate-500 space-y-1">
              <Sparkles className="w-6 h-6 mx-auto text-slate-600 mb-2" />
              <p className="text-sm font-medium text-slate-400">No matching results</p>
              <p className="text-xs">
                Try typing a command like "Open Plan", "Timer 10 minutes", or math like "15 * 8"
              </p>
            </div>
          ) : (
            results.map((item, idx) => {
              const isSelected = idx === selectedIndex
              const Icon = item.icon

              return (
                <div
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`p-3 rounded-2xl flex items-center justify-between cursor-pointer transition border ${
                    isSelected
                      ? 'bg-indigo-600/90 text-white border-indigo-400/50 shadow-lg'
                      : 'bg-white/[0.04] hover:bg-white/[0.08] border-transparent text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div
                      className={`p-2.5 rounded-xl shrink-0 ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-white/10 text-indigo-400'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    <div className="truncate flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm truncate">{item.title}</span>
                        {item.badge && (
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-mono uppercase tracking-wider ${
                              isSelected ? 'bg-black/30 text-white' : 'bg-white/10 text-slate-400'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p
                        className={`text-xs truncate ${
                          isSelected ? 'text-white/80' : 'text-slate-400'
                        }`}
                      >
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <span
                      className={`text-[11px] hidden md:inline-block ${
                        isSelected ? 'text-white/70' : 'text-slate-500'
                      }`}
                    >
                      {item.categoryLabel}
                    </span>
                    {isSelected && (
                      <div className="flex items-center gap-1 bg-black/30 px-2 py-1 rounded-lg text-[10px] font-mono">
                        <span>Open</span>
                        <CornerDownLeft className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="px-5 py-2.5 bg-black/40 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400 relative z-10">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <span className="px-1.5 py-0.5 rounded bg-white/10 text-slate-300 font-mono">↑↓</span> navigate
            </span>
            <span className="flex items-center gap-1">
              <span className="px-1.5 py-0.5 rounded bg-white/10 text-slate-300 font-mono">↵</span> select
            </span>
            <span className="flex items-center gap-1">
              <span className="px-1.5 py-0.5 rounded bg-white/10 text-slate-300 font-mono">esc</span> exit
            </span>
          </div>

          <span className="text-indigo-400 font-medium hidden sm:inline">Spotlight Command Center</span>
        </div>
      </div>
    </div>
  )
}
