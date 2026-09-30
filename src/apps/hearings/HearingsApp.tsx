import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  Hearing,
  HearingStatus,
  HearingReminder,
  AppWindowProps
} from '@/types'
import {
  hearingRepository,
  isActionRequired,
  getTodayDateString,
  exportHearingsToCSV
} from '@/services/hearings'
import GlassPanel from '@/components/LiquidGlass/GlassPanel'
import GlassButton from '@/components/LiquidGlass/GlassButton'
import GlassModal from '@/components/LiquidGlass/GlassModal'
import AppHeader from '@/components/AppWindow/AppHeader'
import { sounds } from '@/utils/sound'
import { cn } from '@/utils/cn'
import { toLocalYYYYMMDD } from '@/utils/date'
import {
  Scale,
  Plus,
  Zap,
  Download,
  Search,
  X,
  Calendar,
  Clock,
  AlertCircle,
  History,
  User,
  ArrowRight,
  Edit2,
  Trash2,
  Building2,
  CalendarDays,
  ListFilter
} from 'lucide-react'

type TabView = 'upcoming' | 'today' | 'all' | 'completed' | 'calendar'

const CASE_TYPES = [
  'Commercial',
  'Labour',
  'Civil',
  'Real Estate',
  'Criminal',
  'Corporate',
  'Family',
  'Administrative'
]

const COURTS = [
  'Dubai Court of First Instance',
  'Dubai Court of Appeal',
  'Dubai Court of Cassation',
  'Dubai Labour Court',
  'Dubai Commercial Court',
  'Dubai Rental Dispute Centre',
  'Abu Dhabi Federal Court',
  'Abu Dhabi Commercial Court',
  'DIFC Courts'
]

interface HearingsAppProps extends Partial<AppWindowProps> {
  initialHearingId?: string
  initialCaseNumber?: string
}

export default function HearingsApp({ initialHearingId, initialCaseNumber }: HearingsAppProps) {
  const [hearings, setHearings] = useState<Hearing[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabView>('upcoming')
  const [searchQuery, setSearchQuery] = useState('')

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [caseTypeFilter, setCaseTypeFilter] = useState<string>('all')
  const [courtFilter, setCourtFilter] = useState<string>('all')
  const [actionRequiredOnly, setActionRequiredOnly] = useState(false)

  // Sorting
  const [sortBy, setSortBy] = useState<'date' | 'client' | 'case' | 'status'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  // Modals
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false)
  const [editingHearing, setEditingHearing] = useState<Hearing | null>(null)
  const [isQuickAddModalOpen, setIsQuickAddModalOpen] = useState(false)
  const [deleteConfirmHearing, setDeleteConfirmHearing] = useState<Hearing | null>(null)
  const [decisionModalHearing, setDecisionModalHearing] = useState<Hearing | null>(null)
  const [caseHistoryModalHearing, setCaseHistoryModalHearing] = useState<Hearing | null>(null)
  const [clientViewModalClient, setClientViewModalClient] = useState<string | null>(null)

  // Form states for Full Add/Edit
  const [formClientName, setFormClientName] = useState('')
  const [formCaseNumber, setFormCaseNumber] = useState('')
  const [formCaseType, setFormCaseType] = useState('Commercial')
  const [formCourt, setFormCourt] = useState('Dubai Court of First Instance')
  const [formHearingDate, setFormHearingDate] = useState(getTodayDateString())
  const [formHearingTime, setFormHearingTime] = useState('10:00')
  const [formDecision, setFormDecision] = useState('')
  const [formNextHearingDate, setFormNextHearingDate] = useState('')
  const [formStatus, setFormStatus] = useState<HearingStatus>('Upcoming')
  const [formNotes, setFormNotes] = useState('')
  const [formReminder, setFormReminder] = useState<HearingReminder>('1_day')

  // Quick Add Form States
  const [quickClientName, setQuickClientName] = useState('')
  const [quickCaseNumber, setQuickCaseNumber] = useState('')
  const [quickHearingDate, setQuickHearingDate] = useState(getTodayDateString())

  // Quick Decision Update States
  const [quickDecisionText, setQuickDecisionText] = useState('')
  const [quickNextDate, setQuickNextDate] = useState('')
  const [quickStatus, setQuickStatus] = useState<HearingStatus>('Completed')

  // Calendar view state
  const [calendarMonth, setCalendarMonth] = useState(() => new Date())
  const [calendarSelectedDate, setCalendarSelectedDate] = useState<string>(getTodayDateString())

  // Load hearings
  const refreshHearings = useCallback(async () => {
    const list = await hearingRepository.getAll()
    setHearings(list)
    setLoading(false)
  }, [])

  useEffect(() => {
    refreshHearings()
    const unsubscribe = hearingRepository.subscribe(updated => {
      setHearings(updated)
    })
    return () => unsubscribe()
  }, [refreshHearings])

  const todayStr = getTodayDateString()

  // Statistics
  const stats = useMemo(() => {
    const now = new Date()
    const in7Days = toLocalYYYYMMDD(new Date(now.getTime() + 7 * 86400000))

    let todayCount = 0
    let weekCount = 0
    let upcomingCount = 0
    let actionRequiredCount = 0

    hearings.forEach(h => {
      if (h.status === 'Cancelled') return

      if (h.hearingDate === todayStr) {
        todayCount++
      }
      if (h.hearingDate >= todayStr && h.hearingDate <= in7Days && h.status !== 'Completed') {
        weekCount++
      }
      if (h.hearingDate >= todayStr && h.status !== 'Completed') {
        upcomingCount++
      }
      if (isActionRequired(h)) {
        actionRequiredCount++
      }
    })

    return {
      today: todayCount,
      thisWeek: weekCount,
      upcoming: upcomingCount,
      actionRequired: actionRequiredCount
    }
  }, [hearings, todayStr])

  // Reset form
  const resetForm = () => {
    setFormClientName('')
    setFormCaseNumber('')
    setFormCaseType('Commercial')
    setFormCourt('Dubai Court of First Instance')
    setFormHearingDate(getTodayDateString())
    setFormHearingTime('10:00')
    setFormDecision('')
    setFormNextHearingDate('')
    setFormStatus('Upcoming')
    setFormNotes('')
    setFormReminder('1_day')
    setEditingHearing(null)
  }

  // Open Full Add Modal
  const handleOpenAddModal = () => {
    sounds.playClick()
    resetForm()
    setIsAddEditModalOpen(true)
  }

  // Open Edit Modal
  const handleOpenEditModal = (h: Hearing) => {
    sounds.playClick()
    setEditingHearing(h)
    setFormClientName(h.clientName)
    setFormCaseNumber(h.caseNumber)
    setFormCaseType(h.caseType || 'Commercial')
    setFormCourt(h.court || 'Dubai Court of First Instance')
    setFormHearingDate(h.hearingDate)
    setFormHearingTime(h.hearingTime || '10:00')
    setFormDecision(h.decision || '')
    setFormNextHearingDate(h.nextHearingDate || '')
    setFormStatus(h.status)
    setFormNotes(h.notes || '')
    setFormReminder(h.reminder || '1_day')
    setIsAddEditModalOpen(true)
  }

  // Save Full Add / Edit
  const handleSaveHearing = async () => {
    if (!formClientName.trim() || !formCaseNumber.trim() || !formHearingDate) {
      sounds.playError()
      return
    }

    sounds.playSuccess()

    if (editingHearing) {
      await hearingRepository.update(editingHearing.id, {
        clientName: formClientName.trim(),
        caseNumber: formCaseNumber.trim(),
        caseType: formCaseType,
        court: formCourt,
        hearingDate: formHearingDate,
        hearingTime: formHearingTime,
        decision: formDecision.trim(),
        nextHearingDate: formNextHearingDate.trim(),
        status: formStatus,
        notes: formNotes.trim(),
        reminder: formReminder
      })
    } else {
      await hearingRepository.create({
        clientName: formClientName.trim(),
        caseNumber: formCaseNumber.trim(),
        caseType: formCaseType,
        court: formCourt,
        hearingDate: formHearingDate,
        hearingTime: formHearingTime,
        decision: formDecision.trim(),
        nextHearingDate: formNextHearingDate.trim(),
        status: formStatus,
        notes: formNotes.trim(),
        reminder: formReminder
      })
    }

    setIsAddEditModalOpen(false)
    resetForm()
  }

  // Quick Add
  const handleQuickAdd = async () => {
    if (!quickClientName.trim() || !quickCaseNumber.trim() || !quickHearingDate) {
      sounds.playError()
      return
    }

    sounds.playSuccess()
    await hearingRepository.create({
      clientName: quickClientName.trim(),
      caseNumber: quickCaseNumber.trim(),
      caseType: 'Commercial',
      court: 'Dubai Court of First Instance',
      hearingDate: quickHearingDate,
      hearingTime: '10:00',
      decision: '',
      nextHearingDate: '',
      status: quickHearingDate === todayStr ? 'Today' : 'Upcoming',
      notes: '',
      reminder: '1_day'
    })

    setQuickClientName('')
    setQuickCaseNumber('')
    setQuickHearingDate(getTodayDateString())
    setIsQuickAddModalOpen(false)
  }

  // Open Quick Decision Modal
  const handleOpenDecisionModal = (h: Hearing) => {
    sounds.playClick()
    setDecisionModalHearing(h)
    setQuickDecisionText(h.decision || '')
    setQuickNextDate(h.nextHearingDate || '')
    setQuickStatus(h.status === 'Upcoming' || h.status === 'Today' ? 'Adjourned' : h.status)
  }

  // Save Quick Decision
  const handleSaveDecision = async () => {
    if (!decisionModalHearing) return
    sounds.playSuccess()

    await hearingRepository.update(decisionModalHearing.id, {
      decision: quickDecisionText.trim(),
      nextHearingDate: quickNextDate.trim(),
      status: quickStatus
    })

    setDecisionModalHearing(null)
  }

  // Create Next Hearing 1-click action
  const handleCreateNextHearing = async (h: Hearing) => {
    if (!h.nextHearingDate) {
      // If no next date yet, open decision modal to enter it
      handleOpenDecisionModal(h)
      return
    }

    sounds.playSuccess()
    const nextH = await hearingRepository.createNextHearing(h.id, h.nextHearingDate)
    if (nextH) {
      if (caseHistoryModalHearing) {
        setCaseHistoryModalHearing(nextH)
      }
    }
  }

  // Delete Hearing
  const handleConfirmDelete = async () => {
    if (!deleteConfirmHearing) return
    sounds.playSuccess()
    await hearingRepository.delete(deleteConfirmHearing.id)
    setDeleteConfirmHearing(null)
  }

  // Listen to external window custom events from Command Palette or Spotlight
  useEffect(() => {
    const handleAction = (e: Event) => {
      const custom = e as CustomEvent<{ action?: string; view?: TabView }>
      if (custom.detail) {
        if (custom.detail.view) {
          setActiveTab(custom.detail.view)
        }
        if (custom.detail.action === 'add') {
          handleOpenAddModal()
        }
      }
    }
    window.addEventListener('superdash_hearings_action', handleAction)
    return () => window.removeEventListener('superdash_hearings_action', handleAction)
  }, [])

  // Deep linking support
  useEffect(() => {
    if (hearings.length === 0) return
    if (initialHearingId) {
      const target = hearings.find(h => h.id === initialHearingId)
      if (target) {
        handleOpenDecisionModal(target)
      }
    } else if (initialCaseNumber) {
      const target = hearings.find(h => h.caseNumber.toLowerCase() === initialCaseNumber.toLowerCase())
      if (target) {
        setCaseHistoryModalHearing(target)
      }
    }
  }, [initialHearingId, initialCaseNumber, hearings])

  // Filtered & Sorted Hearings List
  const filteredHearings = useMemo(() => {
    let result = [...hearings]

    // 1. Tab Views
    if (activeTab === 'today') {
      result = result.filter(h => h.hearingDate === todayStr && h.status !== 'Cancelled')
    } else if (activeTab === 'upcoming') {
      result = result.filter(h => h.hearingDate >= todayStr && h.status !== 'Completed' && h.status !== 'Cancelled')
    } else if (activeTab === 'completed') {
      result = result.filter(h => h.status === 'Completed')
    }

    // 2. Action Required toggle
    if (actionRequiredOnly) {
      result = result.filter(isActionRequired)
    }

    // 3. Dropdown Filters
    if (statusFilter !== 'all') {
      result = result.filter(h => h.status === statusFilter)
    }
    if (caseTypeFilter !== 'all') {
      result = result.filter(h => h.caseType === caseTypeFilter)
    }
    if (courtFilter !== 'all') {
      result = result.filter(h => h.court === courtFilter)
    }

    // 4. Instant Search across multiple fields
    const q = searchQuery.toLowerCase().trim()
    if (q) {
      result = result.filter(h => {
        return (
          h.clientName.toLowerCase().includes(q) ||
          h.caseNumber.toLowerCase().includes(q) ||
          (h.caseType && h.caseType.toLowerCase().includes(q)) ||
          (h.court && h.court.toLowerCase().includes(q)) ||
          (h.decision && h.decision.toLowerCase().includes(q)) ||
          (h.notes && h.notes.toLowerCase().includes(q))
        )
      })
    }

    // 5. Sorting
    result.sort((a, b) => {
      let comparison = 0
      if (sortBy === 'date') {
        comparison = a.hearingDate.localeCompare(b.hearingDate) || (a.hearingTime || '').localeCompare(b.hearingTime || '')
      } else if (sortBy === 'client') {
        comparison = a.clientName.localeCompare(b.clientName)
      } else if (sortBy === 'case') {
        comparison = a.caseNumber.localeCompare(b.caseNumber)
      } else if (sortBy === 'status') {
        comparison = a.status.localeCompare(b.status)
      }
      return sortOrder === 'asc' ? comparison : -comparison
    })

    return result
  }, [
    hearings,
    activeTab,
    todayStr,
    actionRequiredOnly,
    statusFilter,
    caseTypeFilter,
    courtFilter,
    searchQuery,
    sortBy,
    sortOrder
  ])

  // Active filters count for Clear Filters button
  const hasActiveFilters =
    statusFilter !== 'all' ||
    caseTypeFilter !== 'all' ||
    courtFilter !== 'all' ||
    actionRequiredOnly ||
    searchQuery !== ''

  const handleClearFilters = () => {
    sounds.playClick()
    setStatusFilter('all')
    setCaseTypeFilter('all')
    setCourtFilter('all')
    setActionRequiredOnly(false)
    setSearchQuery('')
  }

  // Case history records for modal
  const caseHistoryList = useMemo(() => {
    if (!caseHistoryModalHearing) return []
    const caseNum = caseHistoryModalHearing.caseNumber.trim().toLowerCase()
    return hearings
      .filter(h => h.caseNumber.trim().toLowerCase() === caseNum)
      .sort((a, b) => a.hearingDate.localeCompare(b.hearingDate))
  }, [caseHistoryModalHearing, hearings])

  // Client view hearings
  const clientHearingsList = useMemo(() => {
    if (!clientViewModalClient) return []
    const target = clientViewModalClient.trim().toLowerCase()
    return hearings
      .filter(h => h.clientName.trim().toLowerCase() === target)
      .sort((a, b) => b.hearingDate.localeCompare(a.hearingDate))
  }, [clientViewModalClient, hearings])

  // Calendar month days calculation
  const calendarDays = useMemo(() => {
    const year = calendarMonth.getFullYear()
    const month = calendarMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)

    const days = []
    const startingDayOfWeek = firstDay.getDay() // 0 = Sun

    // Previous month filler days
    const prevMonthLastDay = new Date(year, month, 0).getDate()
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const d = prevMonthLastDay - i
      const m = month === 0 ? 12 : month
      const y = month === 0 ? year - 1 : year
      const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      days.push({ dayNumber: d, dateStr, isCurrentMonth: false })
    }

    // Current month days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
      days.push({ dayNumber: i, dateStr, isCurrentMonth: true })
    }

    // Next month filler days to complete grid
    const remaining = 35 - days.length
    for (let i = 1; i <= remaining && remaining < 7; i++) {
      const m = month === 11 ? 1 : month + 2
      const y = month === 11 ? year + 1 : year
      const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(i).padStart(2, '0')}`
      days.push({ dayNumber: i, dateStr, isCurrentMonth: false })
    }

    return days
  }, [calendarMonth])

  // Map of hearings by date string for calendar dots
  const hearingsByDateMap = useMemo(() => {
    const map: Record<string, Hearing[]> = {}
    hearings.forEach(h => {
      if (!map[h.hearingDate]) {
        map[h.hearingDate] = []
      }
      map[h.hearingDate].push(h)
    })
    return map
  }, [hearings])

  const calendarSelectedHearings = useMemo(() => {
    return hearingsByDateMap[calendarSelectedDate] || []
  }, [calendarSelectedDate, hearingsByDateMap])

  return (
    <div className="h-full flex flex-col bg-slate-950/40 text-slate-100 overflow-hidden">
      {/* Standard AppHeader */}
      <AppHeader
        title="Hearings"
        subtitle="Court sessions, judicial decisions & procedural case dockets"
        icon={Scale}
        primaryAction={{
          label: 'Add Hearing',
          icon: Plus,
          onClick: handleOpenAddModal
        }}
        secondaryAction={{
          label: 'Quick Add',
          icon: Zap,
          onClick: () => {
            sounds.playClick()
            setIsQuickAddModalOpen(true)
          }
        }}
      >
        <GlassButton
          variant="ghost"
          size="sm"
          onClick={() => {
            sounds.playClick()
            exportHearingsToCSV(filteredHearings)
          }}
          title="Export active hearings list to CSV"
        >
          <Download className="w-3.5 h-3.5 mr-1 text-slate-300" />
          <span className="hidden sm:inline">Export</span>
        </GlassButton>
      </AppHeader>

      {/* Statistics Cards */}
      <div className="px-4 md:px-6 pt-3 pb-2 border-b border-white/10 shrink-0 space-y-3">

        {/* 4 Compact Liquid Glass Statistic Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 md:gap-3.5">
          {/* 1. TODAY */}
          <GlassPanel
            intensity="subtle"
            onClick={() => {
              sounds.playClick()
              setActiveTab('today')
              setActionRequiredOnly(false)
            }}
            className={cn(
              'p-3 cursor-pointer hover:border-amber-400/40 group transition-all',
              activeTab === 'today' && !actionRequiredOnly ? 'ring-1 ring-amber-400/50 bg-amber-500/10' : ''
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-300/90">
                Today
              </span>
              <Calendar className="w-3.5 h-3.5 text-amber-400/70" />
            </div>
            <div className="text-2xl font-bold text-white mt-1 group-hover:scale-105 transition-transform origin-left">
              {stats.today}
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Court sessions today</p>
          </GlassPanel>

          {/* 2. THIS WEEK */}
          <GlassPanel
            intensity="subtle"
            onClick={() => {
              sounds.playClick()
              setActiveTab('upcoming')
              setActionRequiredOnly(false)
            }}
            className={cn(
              'p-3 cursor-pointer hover:border-indigo-400/40 group transition-all',
              activeTab === 'upcoming' && !actionRequiredOnly ? 'ring-1 ring-indigo-400/50 bg-indigo-500/10' : ''
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-300/90">
                This Week
              </span>
              <Clock className="w-3.5 h-3.5 text-indigo-400/70" />
            </div>
            <div className="text-2xl font-bold text-white mt-1 group-hover:scale-105 transition-transform origin-left">
              {stats.thisWeek}
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Next 7 days</p>
          </GlassPanel>

          {/* 3. UPCOMING */}
          <GlassPanel
            intensity="subtle"
            onClick={() => {
              sounds.playClick()
              setActiveTab('upcoming')
              setActionRequiredOnly(false)
            }}
            className={cn(
              'p-3 cursor-pointer hover:border-emerald-400/40 group transition-all'
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-300/90">
                Upcoming
              </span>
              <CalendarDays className="w-3.5 h-3.5 text-emerald-400/70" />
            </div>
            <div className="text-2xl font-bold text-white mt-1 group-hover:scale-105 transition-transform origin-left">
              {stats.upcoming}
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Active upcoming cases</p>
          </GlassPanel>

          {/* 4. ACTION REQUIRED */}
          <GlassPanel
            intensity="subtle"
            onClick={() => {
              sounds.playClick()
              setActionRequiredOnly(prev => !prev)
            }}
            className={cn(
              'p-3 cursor-pointer transition-all group',
              actionRequiredOnly
                ? 'ring-1 ring-rose-400/70 bg-rose-500/20'
                : stats.actionRequired > 0
                ? 'border-rose-500/30 hover:border-rose-400/50 bg-rose-500/5'
                : 'hover:border-slate-500/40'
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-rose-300/90 flex items-center gap-1">
                Action Required
                {stats.actionRequired > 0 && (
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                )}
              </span>
              <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
            </div>
            <div className="text-2xl font-bold text-rose-200 mt-1 group-hover:scale-105 transition-transform origin-left">
              {stats.actionRequired}
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Past date, missing decision</p>
          </GlassPanel>
        </div>

        {/* View Tabs & Search Toolbar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-1">
          {/* Tabs */}
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-white/[0.04] border border-white/10 overflow-x-auto no-scrollbar">
            {(
              [
                { id: 'upcoming', label: 'Upcoming' },
                { id: 'today', label: 'Today' },
                { id: 'all', label: 'All Hearings' },
                { id: 'completed', label: 'Completed' },
                { id: 'calendar', label: 'Calendar' }
              ] as const
            ).map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  sounds.playClick()
                  setActiveTab(tab.id)
                }}
                className={cn(
                  'px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-200',
                  activeTab === tab.id
                    ? 'bg-amber-500/20 text-amber-200 border border-amber-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search bar & quick filters */}
          <div className="flex items-center gap-2 flex-1 md:max-w-md">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search client, case 123/2026, court, decision..."
                className="w-full pl-8.5 pr-8 py-1.5 rounded-xl bg-white/[0.06] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/30 transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Clear filters badge if active */}
            {hasActiveFilters && (
              <GlassButton
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="text-[11px] text-amber-400 hover:text-amber-300 px-2 py-1 shrink-0"
              >
                <X className="w-3 h-3 mr-1" />
                Clear
              </GlassButton>
            )}
          </div>
        </div>

        {/* Lightweight Filter Bar */}
        {activeTab !== 'calendar' && (
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="text-slate-500 flex items-center gap-1 font-medium text-[11px]">
              <ListFilter className="w-3 h-3" /> Filters:
            </span>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={e => {
                sounds.playClick()
                setStatusFilter(e.target.value)
              }}
              className="bg-white/[0.05] border border-white/10 text-slate-300 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-amber-400/40"
            >
              <option value="all" className="bg-slate-900 text-slate-200">
                All Statuses
              </option>
              <option value="Upcoming" className="bg-slate-900 text-slate-200">
                Upcoming
              </option>
              <option value="Today" className="bg-slate-900 text-slate-200">
                Today
              </option>
              <option value="Adjourned" className="bg-slate-900 text-slate-200">
                Adjourned
              </option>
              <option value="Reserved for Judgment" className="bg-slate-900 text-slate-200">
                Reserved for Judgment
              </option>
              <option value="Completed" className="bg-slate-900 text-slate-200">
                Completed
              </option>
              <option value="Cancelled" className="bg-slate-900 text-slate-200">
                Cancelled
              </option>
            </select>

            {/* Case Type Filter */}
            <select
              value={caseTypeFilter}
              onChange={e => {
                sounds.playClick()
                setCaseTypeFilter(e.target.value)
              }}
              className="bg-white/[0.05] border border-white/10 text-slate-300 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-amber-400/40"
            >
              <option value="all" className="bg-slate-900 text-slate-200">
                All Case Types
              </option>
              {CASE_TYPES.map(t => (
                <option key={t} value={t} className="bg-slate-900 text-slate-200">
                  {t}
                </option>
              ))}
            </select>

            {/* Court Filter */}
            <select
              value={courtFilter}
              onChange={e => {
                sounds.playClick()
                setCourtFilter(e.target.value)
              }}
              className="bg-white/[0.05] border border-white/10 text-slate-300 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-amber-400/40 max-w-[170px] truncate"
            >
              <option value="all" className="bg-slate-900 text-slate-200">
                All Courts
              </option>
              {COURTS.map(c => (
                <option key={c} value={c} className="bg-slate-900 text-slate-200">
                  {c}
                </option>
              ))}
            </select>

            {/* Sort Dropdown */}
            <div className="ml-auto flex items-center gap-1.5 text-slate-400 text-[11px]">
              <span>Sort:</span>
              <button
                onClick={() => {
                  sounds.playClick()
                  setSortOrder(o => (o === 'asc' ? 'desc' : 'asc'))
                }}
                className="px-2 py-1 rounded-lg bg-white/[0.05] hover:bg-white/10 border border-white/10 text-slate-200 transition"
                title={`Sort ${sortOrder === 'asc' ? 'Ascending' : 'Descending'}`}
              >
                {sortBy === 'date' ? 'Date' : sortBy === 'client' ? 'Client' : sortBy === 'case' ? 'Case' : 'Status'} (
                {sortOrder === 'asc' ? '↑' : '↓'})
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center gap-3 text-slate-400">
            <Scale className="w-8 h-8 animate-pulse text-amber-400" />
            <span className="text-sm">Loading court sessions...</span>
          </div>
        ) : activeTab === 'calendar' ? (
          /* CALENDAR VIEW */
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-white/[0.04] p-3 rounded-2xl border border-white/10">
              <h2 className="text-sm md:text-base font-semibold text-white">
                {calendarMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </h2>
              <div className="flex items-center gap-2">
                <GlassButton
                  size="sm"
                  variant="default"
                  onClick={() => {
                    sounds.playClick()
                    setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))
                  }}
                >
                  Previous
                </GlassButton>
                <GlassButton
                  size="sm"
                  variant="default"
                  onClick={() => {
                    sounds.playClick()
                    setCalendarMonth(new Date())
                    setCalendarSelectedDate(getTodayDateString())
                  }}
                >
                  Current
                </GlassButton>
                <GlassButton
                  size="sm"
                  variant="default"
                  onClick={() => {
                    sounds.playClick()
                    setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))
                  }}
                >
                  Next
                </GlassButton>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 md:gap-2 text-center text-xs font-semibold text-slate-400 pb-1">
              <div>Sun</div>
              <div>Mon</div>
              <div>Tue</div>
              <div>Wed</div>
              <div>Thu</div>
              <div>Fri</div>
              <div>Sat</div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 md:gap-2">
              {calendarDays.map((item, idx) => {
                const dayHearings = hearingsByDateMap[item.dateStr] || []
                const isSelected = item.dateStr === calendarSelectedDate
                const isTodayDate = item.dateStr === todayStr

                return (
                  <div
                    key={idx}
                    onClick={() => {
                      sounds.playClick()
                      setCalendarSelectedDate(item.dateStr)
                    }}
                    className={cn(
                      'min-h-[75px] md:min-h-[90px] p-2 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between',
                      item.isCurrentMonth
                        ? 'bg-white/[0.03] border-white/10 hover:border-amber-400/40 hover:bg-white/[0.06]'
                        : 'bg-white/[0.01] border-white/5 opacity-40',
                      isSelected && 'ring-2 ring-amber-400 border-amber-400/60 bg-amber-500/10',
                      isTodayDate && !isSelected && 'border-amber-400/40 bg-amber-500/5'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={cn(
                          'text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center',
                          isTodayDate ? 'bg-amber-500 text-slate-950' : 'text-slate-300'
                        )}
                      >
                        {item.dayNumber}
                      </span>
                      {dayHearings.length > 0 && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {dayHearings.length}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1 mt-1 overflow-hidden">
                      {dayHearings.slice(0, 2).map(h => (
                        <div
                          key={h.id}
                          className="text-[10px] truncate px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-200 border border-amber-500/30 text-left font-medium"
                          title={`${h.clientName} - ${h.caseNumber}`}
                        >
                          {h.hearingTime && <span className="font-mono mr-1">{h.hearingTime}</span>}
                          {h.clientName}
                        </div>
                      ))}
                      {dayHearings.length > 2 && (
                        <div className="text-[9px] text-slate-400 text-center font-medium">
                          +{dayHearings.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Selected Date Detail Panel */}
            <div className="mt-4 p-4 rounded-2xl liquid-glass border border-white/10 space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <div className="font-semibold text-sm text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-400" />
                  Hearings for {calendarSelectedDate}
                  {calendarSelectedDate === todayStr && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                      TODAY
                    </span>
                  )}
                </div>
                <span className="text-xs text-slate-400">
                  {calendarSelectedHearings.length} session(s)
                </span>
              </div>

              {calendarSelectedHearings.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  No court hearings scheduled for this date.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {calendarSelectedHearings.map(h => (
                    <div
                      key={h.id}
                      className="p-3 rounded-xl bg-white/[0.04] border border-white/10 flex flex-col justify-between gap-2 hover:border-amber-400/40 transition"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <button
                            onClick={() => {
                              sounds.playClick()
                              setClientViewModalClient(h.clientName)
                            }}
                            className="font-semibold text-sm text-amber-200 hover:underline flex items-center gap-1.5"
                          >
                            <User className="w-3.5 h-3.5 text-amber-400" />
                            {h.clientName}
                          </button>
                          <span
                            className={cn(
                              'text-[10px] px-2 py-0.5 rounded-full border font-medium',
                              h.status === 'Completed'
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                : h.status === 'Today'
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                            )}
                          >
                            {h.status}
                          </span>
                        </div>
                        <div className="text-xs text-slate-300 font-mono font-medium">
                          {h.caseNumber}
                          {h.caseType && (
                            <span className="ml-2 text-[10px] text-slate-400 font-sans">
                              ({h.caseType})
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-slate-500" />
                          {h.court || 'Court'}
                          {h.hearingTime && ` • ${h.hearingTime}`}
                        </div>
                        {h.decision && (
                          <div className="text-xs text-slate-200 p-2 rounded-lg bg-white/[0.03] border border-white/5 mt-1">
                            <span className="text-[10px] text-amber-300 uppercase font-bold block">
                              Decision:
                            </span>
                            {h.decision}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
                        <GlassButton
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            sounds.playClick()
                            setCaseHistoryModalHearing(h)
                          }}
                          className="text-xs"
                        >
                          <History className="w-3 h-3 mr-1" /> History
                        </GlassButton>
                        <GlassButton
                          size="sm"
                          variant="default"
                          onClick={() => handleOpenDecisionModal(h)}
                          className="text-xs"
                        >
                          Decision
                        </GlassButton>
                        <GlassButton
                          size="sm"
                          variant="default"
                          onClick={() => handleOpenEditModal(h)}
                          className="text-xs"
                        >
                          <Edit2 className="w-3 h-3" />
                        </GlassButton>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : filteredHearings.length === 0 ? (
          /* EMPTY STATE */
          <div className="h-64 flex flex-col items-center justify-center text-center p-6 space-y-3">
            <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 text-slate-500">
              <Scale className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">No hearing records found</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                {searchQuery || hasActiveFilters
                  ? 'No court sessions match your search terms or active filters.'
                  : 'Start tracking court sessions, decisions, and procedural case history.'}
              </p>
            </div>
            <div className="flex items-center gap-2 pt-1">
              {hasActiveFilters ? (
                <GlassButton size="sm" variant="default" onClick={handleClearFilters}>
                  Clear Filters
                </GlassButton>
              ) : (
                <GlassButton size="sm" variant="primary" onClick={handleOpenAddModal}>
                  <Plus className="w-4 h-4 mr-1" /> Add First Hearing
                </GlassButton>
              )}
            </div>
          </div>
        ) : (
          /* DESKTOP TABLE & MOBILE RESPONSIVE CARDS */
          <div className="space-y-4">
            {/* 1. Desktop & Tablet Liquid Glass Table */}
            <div className="hidden md:block rounded-2xl liquid-glass overflow-hidden border border-white/10">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.03] text-[11px] uppercase tracking-wider text-slate-400 select-none">
                    <th
                      className="py-3 px-4 font-semibold cursor-pointer hover:text-white transition"
                      onClick={() => {
                        sounds.playClick()
                        setSortBy('client')
                        setSortOrder(o => (o === 'asc' ? 'desc' : 'asc'))
                      }}
                    >
                      Client Name {sortBy === 'client' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th
                      className="py-3 px-4 font-semibold cursor-pointer hover:text-white transition"
                      onClick={() => {
                        sounds.playClick()
                        setSortBy('case')
                        setSortOrder(o => (o === 'asc' ? 'desc' : 'asc'))
                      }}
                    >
                      Case {sortBy === 'case' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th
                      className="py-3 px-4 font-semibold cursor-pointer hover:text-white transition"
                      onClick={() => {
                        sounds.playClick()
                        setSortBy('date')
                        setSortOrder(o => (o === 'asc' ? 'desc' : 'asc'))
                      }}
                    >
                      Hearing Date {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="py-3 px-4 font-semibold">Decision / Result</th>
                    <th className="py-3 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredHearings.map(h => {
                    const isTodayHearing = h.hearingDate === todayStr
                    const actionReq = isActionRequired(h)

                    return (
                      <tr
                        key={h.id}
                        className={cn(
                          'hover:bg-white/[0.04] transition-colors group',
                          isTodayHearing && 'bg-amber-500/[0.05]',
                          actionReq && 'bg-rose-500/[0.04]'
                        )}
                      >
                        {/* CLIENT NAME */}
                        <td className="py-3.5 px-4 font-medium">
                          <button
                            onClick={() => {
                              sounds.playClick()
                              setClientViewModalClient(h.clientName)
                            }}
                            className="text-white hover:text-amber-300 hover:underline flex items-center gap-1.5 transition text-left"
                            title="Click to view all hearings for this client"
                          >
                            <User className="w-3.5 h-3.5 text-amber-400/80 shrink-0" />
                            <span className="font-semibold text-sm">{h.clientName}</span>
                          </button>
                        </td>

                        {/* CASE */}
                        <td className="py-3.5 px-4">
                          <div className="flex flex-col gap-0.5">
                            <span className="font-mono text-slate-200 font-medium">
                              {h.caseNumber}
                            </span>
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                              {h.caseType && (
                                <span className="px-1.5 py-0.2 rounded bg-white/[0.06] text-slate-300 border border-white/10 text-[10px]">
                                  {h.caseType}
                                </span>
                              )}
                              <span className="truncate max-w-[160px]" title={h.court}>
                                {h.court || 'Court'}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* HEARING DATE */}
                        <td className="py-3.5 px-4">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-slate-200">
                                {h.hearingDate}
                              </span>
                              {h.hearingTime && (
                                <span className="text-slate-400 text-[11px] font-mono">
                                  {h.hearingTime}
                                </span>
                              )}
                            </div>

                            {/* Status Badges */}
                            <div className="flex flex-wrap items-center gap-1.5">
                              {isTodayHearing ? (
                                <span className="px-2 py-0.5 rounded-full bg-amber-500/25 text-amber-300 border border-amber-500/40 font-bold text-[10px] tracking-wide animate-pulse">
                                  TODAY
                                </span>
                              ) : actionReq ? (
                                <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold text-[10px] tracking-wide flex items-center gap-1">
                                  <AlertCircle className="w-2.5 h-2.5" /> ACTION REQUIRED
                                </span>
                              ) : (
                                <span
                                  className={cn(
                                    'px-2 py-0.5 rounded-full text-[10px] border font-medium',
                                    h.status === 'Completed'
                                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                                      : h.status === 'Adjourned'
                                      ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                                      : h.status === 'Reserved for Judgment'
                                      ? 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                                      : 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
                                  )}
                                >
                                  {h.status}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* DECISION / RESULT */}
                        <td className="py-3.5 px-4 max-w-xs">
                          {h.decision ? (
                            <div className="space-y-1">
                              <div
                                onClick={() => handleOpenDecisionModal(h)}
                                className="text-slate-200 line-clamp-2 hover:line-clamp-none cursor-pointer hover:bg-white/[0.04] p-1.5 -m-1.5 rounded-lg transition"
                                title="Click to update decision"
                              >
                                {h.decision}
                              </div>
                              {h.nextHearingDate && (
                                <div className="flex items-center gap-2 pt-0.5">
                                  <span className="text-[10px] text-amber-400 font-medium flex items-center gap-1">
                                    <ArrowRight className="w-3 h-3" /> Next: {h.nextHearingDate}
                                  </span>
                                  <button
                                    onClick={() => handleCreateNextHearing(h)}
                                    className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 transition cursor-pointer"
                                    title="Create next hearing record using same case info"
                                  >
                                    + Create Next
                                  </button>
                                </div>
                              )}
                            </div>
                          ) : (
                            <button
                              onClick={() => handleOpenDecisionModal(h)}
                              className="text-xs text-amber-400/80 hover:text-amber-300 flex items-center gap-1 hover:underline py-1"
                            >
                              <Edit2 className="w-3 h-3" /> Enter Decision
                            </button>
                          )}
                        </td>

                        {/* ACTIONS */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => {
                                sounds.playClick()
                                setCaseHistoryModalHearing(h)
                              }}
                              className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition"
                              title="Case Hearing History"
                            >
                              <History className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleOpenEditModal(h)}
                              className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-amber-300 transition"
                              title="Edit Hearing"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                sounds.playClick()
                                setDeleteConfirmHearing(h)
                              }}
                              className="p-1.5 rounded-xl hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition"
                              title="Delete Hearing"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* 2. Mobile Responsive View (Compact Cards) */}
            <div className="md:hidden space-y-3">
              {filteredHearings.map(h => {
                const isTodayHearing = h.hearingDate === todayStr
                const actionReq = isActionRequired(h)

                return (
                  <GlassPanel
                    key={h.id}
                    intensity="subtle"
                    className={cn(
                      'p-4 space-y-3',
                      isTodayHearing && 'border-amber-400/40 bg-amber-500/5',
                      actionReq && 'border-rose-400/40 bg-rose-500/5'
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <button
                          onClick={() => {
                            sounds.playClick()
                            setClientViewModalClient(h.clientName)
                          }}
                          className="font-bold text-base text-white hover:text-amber-300 text-left"
                        >
                          {h.clientName}
                        </button>
                        <div className="text-xs font-mono text-amber-300/90 font-medium">
                          {h.caseNumber}
                        </div>
                      </div>

                      {/* Status / Today Badge */}
                      {isTodayHearing ? (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/25 text-amber-300 border border-amber-500/40 font-bold text-[10px] animate-pulse">
                          TODAY
                        </span>
                      ) : actionReq ? (
                        <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold text-[10px]">
                          ACTION REQ
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-white/[0.08] text-slate-300 border border-white/10 text-[10px]">
                          {h.status}
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-slate-300 flex items-center justify-between border-y border-white/5 py-2">
                      <div className="flex items-center gap-1.5 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-amber-400" />
                        <span>{h.hearingDate}</span>
                        {h.hearingTime && <span className="font-mono">({h.hearingTime})</span>}
                      </div>
                      <span className="text-slate-400 truncate max-w-[140px]">{h.court || 'Court'}</span>
                    </div>

                    {/* Decision */}
                    <div className="space-y-1">
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        Decision / Result
                      </div>
                      {h.decision ? (
                        <p className="text-xs text-slate-200 bg-white/[0.03] p-2 rounded-lg border border-white/5">
                          {h.decision}
                        </p>
                      ) : (
                        <button
                          onClick={() => handleOpenDecisionModal(h)}
                          className="text-xs text-amber-400 underline"
                        >
                          + Enter court decision
                        </button>
                      )}
                    </div>

                    {/* Next Hearing Action */}
                    {h.nextHearingDate && (
                      <div className="flex items-center justify-between p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs">
                        <span className="text-amber-300">Next: {h.nextHearingDate}</span>
                        <button
                          onClick={() => handleCreateNextHearing(h)}
                          className="text-[10px] font-bold px-2 py-1 rounded bg-amber-500/30 text-white"
                        >
                          Create Next
                        </button>
                      </div>
                    )}

                    {/* Mobile Row Action Buttons */}
                    <div className="flex items-center justify-between pt-1">
                      <button
                        onClick={() => {
                          sounds.playClick()
                          setCaseHistoryModalHearing(h)
                        }}
                        className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                      >
                        <History className="w-3.5 h-3.5" /> History
                      </button>
                      <div className="flex items-center gap-2">
                        <GlassButton
                          size="sm"
                          variant="default"
                          onClick={() => handleOpenDecisionModal(h)}
                        >
                          Decision
                        </GlassButton>
                        <GlassButton
                          size="sm"
                          variant="default"
                          onClick={() => handleOpenEditModal(h)}
                        >
                          Edit
                        </GlassButton>
                        <GlassButton
                          size="sm"
                          variant="danger"
                          onClick={() => {
                            sounds.playClick()
                            setDeleteConfirmHearing(h)
                          }}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </GlassButton>
                      </div>
                    </div>
                  </GlassPanel>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* FULL ADD / EDIT HEARING MODAL */}
      <GlassModal
        isOpen={isAddEditModalOpen}
        onClose={() => setIsAddEditModalOpen(false)}
        title={editingHearing ? 'Edit Court Hearing' : 'Add New Court Hearing'}
        maxWidth="max-w-2xl"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Client Name * */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Client Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={formClientName}
                onChange={e => setFormClientName(e.target.value)}
                placeholder="e.g. Ahmed Ali"
                className="w-full px-3 py-2 rounded-xl bg-white/[0.06] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/50"
              />
            </div>

            {/* Case Number * */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Case Number <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={formCaseNumber}
                onChange={e => setFormCaseNumber(e.target.value)}
                placeholder="e.g. Commercial 123/2026"
                className="w-full px-3 py-2 rounded-xl bg-white/[0.06] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/50"
              />
            </div>

            {/* Case Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Case Type</label>
              <select
                value={formCaseType}
                onChange={e => setFormCaseType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-400/50"
              >
                {CASE_TYPES.map(t => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Court */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Court</label>
              <select
                value={formCourt}
                onChange={e => setFormCourt(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-400/50"
              >
                {COURTS.map(c => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Hearing Date * */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Hearing Date <span className="text-rose-400">*</span>
              </label>
              <input
                type="date"
                value={formHearingDate}
                onChange={e => setFormHearingDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/[0.06] border border-white/10 text-xs text-white focus:outline-none focus:border-amber-400/50"
              />
            </div>

            {/* Hearing Time */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Hearing Time</label>
              <input
                type="time"
                value={formHearingTime}
                onChange={e => setFormHearingTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/[0.06] border border-white/10 text-xs text-white focus:outline-none focus:border-amber-400/50"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Status</label>
              <select
                value={formStatus}
                onChange={e => setFormStatus(e.target.value as HearingStatus)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-400/50"
              >
                <option value="Upcoming">Upcoming</option>
                <option value="Today">Today</option>
                <option value="Adjourned">Adjourned</option>
                <option value="Reserved for Judgment">Reserved for Judgment</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            {/* Reminder */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Reminder</label>
              <select
                value={formReminder}
                onChange={e => setFormReminder(e.target.value as HearingReminder)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-400/50"
              >
                <option value="none">No Reminder</option>
                <option value="1_day">1 Day Before</option>
                <option value="2_days">2 Days Before</option>
                <option value="3_days">3 Days Before</option>
                <option value="1_week">1 Week Before</option>
              </select>
            </div>
          </div>

          {/* Decision / Result */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Decision / Hearing Result
            </label>
            <textarea
              rows={2}
              value={formDecision}
              onChange={e => setFormDecision(e.target.value)}
              placeholder="e.g. Adjourned to 15 Oct for defense response, expert appointed, etc."
              className="w-full px-3 py-2 rounded-xl bg-white/[0.06] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/50 resize-none"
            />
          </div>

          {/* Next Hearing Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Next Hearing Date (if adjourned or postponed)
            </label>
            <input
              type="date"
              value={formNextHearingDate}
              onChange={e => setFormNextHearingDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white/[0.06] border border-white/10 text-xs text-white focus:outline-none focus:border-amber-400/50"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Case Notes / Instructions</label>
            <textarea
              rows={2}
              value={formNotes}
              onChange={e => setFormNotes(e.target.value)}
              placeholder="Required documents to prepare, client communication, witness details..."
              className="w-full px-3 py-2 rounded-xl bg-white/[0.06] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/50 resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
            <GlassButton
              variant="ghost"
              size="sm"
              onClick={() => {
                sounds.playClick()
                setIsAddEditModalOpen(false)
              }}
            >
              Cancel
            </GlassButton>
            <GlassButton
              variant="primary"
              size="sm"
              onClick={handleSaveHearing}
              disabled={!formClientName.trim() || !formCaseNumber.trim() || !formHearingDate}
            >
              Save Hearing
            </GlassButton>
          </div>
        </div>
      </GlassModal>

      {/* QUICK ADD MODAL */}
      <GlassModal
        isOpen={isQuickAddModalOpen}
        onClose={() => setIsQuickAddModalOpen(false)}
        title="Quick Add Hearing"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-400">
            Register a court hearing in seconds. All other details can be added later.
          </p>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Client Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                autoFocus
                value={quickClientName}
                onChange={e => setQuickClientName(e.target.value)}
                placeholder="e.g. Ahmed Ali"
                className="w-full px-3 py-2 rounded-xl bg-white/[0.06] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Case Number <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={quickCaseNumber}
                onChange={e => setQuickCaseNumber(e.target.value)}
                placeholder="e.g. Labour 456/2026"
                className="w-full px-3 py-2 rounded-xl bg-white/[0.06] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Hearing Date <span className="text-rose-400">*</span>
              </label>
              <input
                type="date"
                value={quickHearingDate}
                onChange={e => setQuickHearingDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/[0.06] border border-white/10 text-xs text-white focus:outline-none focus:border-amber-400/50"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
            <GlassButton
              variant="ghost"
              size="sm"
              onClick={() => {
                sounds.playClick()
                setIsQuickAddModalOpen(false)
              }}
            >
              Cancel
            </GlassButton>
            <GlassButton
              variant="primary"
              size="sm"
              onClick={handleQuickAdd}
              disabled={!quickClientName.trim() || !quickCaseNumber.trim() || !quickHearingDate}
            >
              Quick Save
            </GlassButton>
          </div>
        </div>
      </GlassModal>

      {/* QUICK DECISION UPDATE MODAL */}
      <GlassModal
        isOpen={Boolean(decisionModalHearing)}
        onClose={() => setDecisionModalHearing(null)}
        title={
          decisionModalHearing
            ? `Record Decision: ${decisionModalHearing.caseNumber}`
            : 'Record Decision'
        }
        maxWidth="max-w-lg"
      >
        {decisionModalHearing && (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 text-xs space-y-1">
              <div className="text-white font-semibold">{decisionModalHearing.clientName}</div>
              <div className="text-slate-400">
                {decisionModalHearing.court || 'Court'} • Session:{' '}
                {decisionModalHearing.hearingDate}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Court Decision / Result
              </label>
              <textarea
                autoFocus
                rows={3}
                value={quickDecisionText}
                onChange={e => setQuickDecisionText(e.target.value)}
                placeholder="e.g. Adjourned to 15/10/2026 for expert appointment..."
                className="w-full px-3 py-2 rounded-xl bg-white/[0.06] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/50 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Next Hearing Date
                </label>
                <input
                  type="date"
                  value={quickNextDate}
                  onChange={e => setQuickNextDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.06] border border-white/10 text-xs text-white focus:outline-none focus:border-amber-400/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Update Status To
                </label>
                <select
                  value={quickStatus}
                  onChange={e => setQuickStatus(e.target.value as HearingStatus)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-400/50"
                >
                  <option value="Adjourned">Adjourned</option>
                  <option value="Reserved for Judgment">Reserved for Judgment</option>
                  <option value="Completed">Completed</option>
                  <option value="Upcoming">Upcoming</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-white/10">
              {quickNextDate ? (
                <button
                  type="button"
                  onClick={async () => {
                    await handleSaveDecision()
                    if (decisionModalHearing && quickNextDate) {
                      await hearingRepository.createNextHearing(decisionModalHearing.id, quickNextDate)
                    }
                  }}
                  className="text-xs text-amber-300 hover:text-amber-200 font-medium flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Save & Create Next Hearing
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
                <GlassButton
                  variant="ghost"
                  size="sm"
                  onClick={() => setDecisionModalHearing(null)}
                >
                  Cancel
                </GlassButton>
                <GlassButton variant="primary" size="sm" onClick={handleSaveDecision}>
                  Save Result
                </GlassButton>
              </div>
            </div>
          </div>
        )}
      </GlassModal>

      {/* CASE HEARING HISTORY MODAL */}
      <GlassModal
        isOpen={Boolean(caseHistoryModalHearing)}
        onClose={() => setCaseHistoryModalHearing(null)}
        title={
          caseHistoryModalHearing ? (
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-amber-400" />
              <span>Hearing History: {caseHistoryModalHearing.caseNumber}</span>
            </div>
          ) : (
            'Case History'
          )
        }
        maxWidth="max-w-2xl"
      >
        {caseHistoryModalHearing && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-2xl liquid-glass border border-white/10 flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-white">
                  {caseHistoryModalHearing.clientName}
                </div>
                <div className="text-xs text-slate-300">
                  {caseHistoryModalHearing.court || 'Court'} • {caseHistoryModalHearing.caseType || 'General'}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-semibold text-amber-300">
                  {caseHistoryList.length} Total Hearing Session(s)
                </div>
              </div>
            </div>

            {/* Chronological Procedural History Timeline */}
            <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/10">
              {caseHistoryList.map((h, i) => (
                <div key={h.id} className="relative group">
                  <div
                    className={cn(
                      'absolute -left-6 top-1.5 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all',
                      h.hearingDate === todayStr
                        ? 'border-amber-400 bg-amber-500 scale-125'
                        : h.status === 'Completed'
                        ? 'border-emerald-400 bg-emerald-500/20'
                        : 'border-indigo-400 bg-slate-900'
                    )}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  </div>

                  <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 hover:border-amber-400/40 transition">
                    <div className="flex items-center justify-between text-xs">
                      <div className="font-semibold text-white flex items-center gap-2">
                        <span>{h.hearingDate}</span>
                        {h.hearingTime && <span className="font-mono text-slate-400">({h.hearingTime})</span>}
                        {h.hearingDate === todayStr && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 font-bold">
                            TODAY
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.08] text-slate-300 border border-white/10">
                        {h.status}
                      </span>
                    </div>

                    <div className="mt-2 text-xs text-slate-200">
                      {h.decision ? (
                        <p className="font-medium text-amber-200/90">{h.decision}</p>
                      ) : (
                        <span className="text-slate-500 italic">No decision recorded yet</span>
                      )}
                    </div>

                    {h.notes && (
                      <p className="mt-1 text-[11px] text-slate-400 italic">
                        Note: {h.notes}
                      </p>
                    )}

                    {h.nextHearingDate && (
                      <div className="mt-2 pt-2 border-t border-white/5 text-[11px] text-amber-400 flex items-center justify-between">
                        <span>Next Session: {h.nextHearingDate}</span>
                        {i === caseHistoryList.length - 1 && (
                          <button
                            onClick={() => handleCreateNextHearing(h)}
                            className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40"
                          >
                            + Create Next Hearing
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-white/10">
              <GlassButton
                variant="default"
                size="sm"
                onClick={() => setCaseHistoryModalHearing(null)}
              >
                Close History
              </GlassButton>
            </div>
          </div>
        )}
      </GlassModal>

      {/* CLIENT VIEW MODAL */}
      <GlassModal
        isOpen={Boolean(clientViewModalClient)}
        onClose={() => setClientViewModalClient(null)}
        title={
          clientViewModalClient ? (
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-amber-400" />
              <span>Client: {clientViewModalClient}</span>
            </div>
          ) : (
            'Client View'
          )
        }
        maxWidth="max-w-2xl"
      >
        {clientViewModalClient && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl liquid-glass border border-white/10 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">{clientViewModalClient}</h3>
                <p className="text-xs text-slate-400">
                  Total Associated Hearings: {clientHearingsList.length}
                </p>
              </div>
              <GlassButton
                size="sm"
                variant="primary"
                onClick={() => {
                  sounds.playClick()
                  resetForm()
                  setFormClientName(clientViewModalClient)
                  setIsAddEditModalOpen(true)
                  setClientViewModalClient(null)
                }}
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> New Hearing for Client
              </GlassButton>
            </div>

            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
              {clientHearingsList.map(h => (
                <div
                  key={h.id}
                  className="p-3 rounded-xl bg-white/[0.04] border border-white/10 flex flex-col gap-1.5 hover:border-amber-400/40 transition"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-amber-300 font-semibold">{h.caseNumber}</span>
                    <span className="text-slate-400">{h.hearingDate}</span>
                  </div>
                  <div className="text-xs text-slate-300">
                    {h.court || 'Court'} • <span className="text-slate-400">{h.caseType}</span>
                  </div>
                  {h.decision && (
                    <div className="text-xs text-slate-200 bg-white/[0.03] p-1.5 rounded border border-white/5">
                      {h.decision}
                    </div>
                  )}
                  {h.nextHearingDate && (
                    <div className="text-[11px] text-amber-400">
                      Next: {h.nextHearingDate}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2 border-t border-white/10">
              <GlassButton
                variant="default"
                size="sm"
                onClick={() => setClientViewModalClient(null)}
              >
                Close
              </GlassButton>
            </div>
          </div>
        )}
      </GlassModal>

      {/* DELETE CONFIRMATION MODAL */}
      <GlassModal
        isOpen={Boolean(deleteConfirmHearing)}
        onClose={() => setDeleteConfirmHearing(null)}
        title="Delete Hearing Record?"
        maxWidth="max-w-md"
      >
        {deleteConfirmHearing && (
          <div className="space-y-4">
            <p className="text-xs text-slate-300">
              Are you sure you want to delete this hearing record for{' '}
              <strong className="text-white">{deleteConfirmHearing.clientName}</strong> (
              <span className="font-mono text-amber-300">
                {deleteConfirmHearing.caseNumber}
              </span>
              )? This action cannot be undone.
            </p>

            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 space-y-1">
              <div>Session: {deleteConfirmHearing.hearingDate}</div>
              <div>Court: {deleteConfirmHearing.court || 'Court'}</div>
              {deleteConfirmHearing.decision && (
                <div>Decision: {deleteConfirmHearing.decision}</div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
              <GlassButton
                variant="ghost"
                size="sm"
                onClick={() => {
                  sounds.playClick()
                  setDeleteConfirmHearing(null)
                }}
              >
                Cancel
              </GlassButton>
              <GlassButton variant="danger" size="sm" onClick={handleConfirmDelete}>
                Delete Hearing
              </GlassButton>
            </div>
          </div>
        )}
      </GlassModal>
    </div>
  )
}
