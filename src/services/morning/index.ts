import {
  MorningPreferences,
  MorningSectionId,
  MorningPriorityItem,
  MorningDayData,
  Hearing,
  TaskItem,
  CalendarEvent,
  ReminderItem,
  MarketPairData,
  IdeaItem,
  DecisionItem
} from '@/types'
import { storageService, INITIAL_TASKS, INITIAL_CALENDAR_EVENTS, INITIAL_REMINDERS } from '@/services/storage'
import { hearingRepository } from '@/services/hearings'
import { financeService } from '@/services/finance'
import { marketService } from '@/services/market'
import { focusService } from '@/services/focus'
import { decisionService } from '@/services/decisions'
import { ideasService } from '@/services/ideas'

const PREFERENCES_KEY = 'morning_preferences'
const MORNING_DATA_PREFIX = 'morning_day_'

export const DEFAULT_MORNING_SECTIONS: MorningSectionId[] = [
  'priorities',
  'focus',
  'hearings',
  'tasks',
  'calendar',
  'reminders',
  'finance',
  'markets',
  'decisions',
  'idea',
  'note'
]

export const DEFAULT_MORNING_PREFERENCES: MorningPreferences = {
  sectionOrder: DEFAULT_MORNING_SECTIONS,
  hiddenSections: [],
  showIdeaOfTheDay: true
}

export interface MorningFinanceSummary {
  receivedMonth: number
  expensesMonth: number
  outstanding: number
  currency: string
}

export interface MorningAggregatedData {
  dateStr: string
  formattedDate: string
  priorities: MorningPriorityItem[]
  morningNote: string
  focusStats: {
    todayCompletedSeconds: number
    todayGoalSeconds: number
    todayProgressFraction: number
    streakDays: number
  }
  hearingsToday: Hearing[]
  tasksToday: TaskItem[]
  calendarEventsToday: CalendarEvent[]
  remindersToday: ReminderItem[]
  markets: MarketPairData[]
  financeSummary: MorningFinanceSummary | null
  decisionsDue: DecisionItem[]
  ideaOfTheDay: IdeaItem | null
}

class MorningAggregatorServiceImpl {
  private getTodayDateString(): string {
    const now = new Date()
    const y = now.getFullYear()
    const m = String(now.getMonth() + 1).padStart(2, '0')
    const d = String(now.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }

  async getPreferences(): Promise<MorningPreferences> {
    return storageService.get<MorningPreferences>(PREFERENCES_KEY, DEFAULT_MORNING_PREFERENCES)
  }

  async savePreferences(prefs: MorningPreferences): Promise<void> {
    await storageService.set(PREFERENCES_KEY, prefs)
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('superdash_morning_prefs_updated'))
    }
  }

  async getDayData(dateStr?: string): Promise<MorningDayData> {
    const date = dateStr || this.getTodayDateString()
    const defaultData: MorningDayData = {
      date,
      priorities: [
        { id: 'p1', text: '', completed: false },
        { id: 'p2', text: '', completed: false },
        { id: 'p3', text: '', completed: false }
      ],
      note: ''
    }
    const data = await storageService.get<MorningDayData>(MORNING_DATA_PREFIX + date, defaultData)

    // Ensure 3 priority slots exist
    while (data.priorities.length < 3) {
      data.priorities.push({
        id: 'p' + (data.priorities.length + 1),
        text: '',
        completed: false
      })
    }
    return data
  }

  async saveDayData(data: MorningDayData): Promise<void> {
    await storageService.set(MORNING_DATA_PREFIX + data.date, data)
  }

  async setPriority(index: number, text: string, completed = false, dateStr?: string): Promise<void> {
    const data = await this.getDayData(dateStr)
    if (data.priorities[index]) {
      data.priorities[index].text = text
      data.priorities[index].completed = completed
    }
    await this.saveDayData(data)
  }

  async togglePriority(index: number, dateStr?: string): Promise<void> {
    const data = await this.getDayData(dateStr)
    if (data.priorities[index]) {
      data.priorities[index].completed = !data.priorities[index].completed
    }
    await this.saveDayData(data)
  }

  async saveMorningNote(note: string, dateStr?: string): Promise<void> {
    const data = await this.getDayData(dateStr)
    data.note = note
    await this.saveDayData(data)
  }

  // Complete a task safely from Morning
  async completeTask(taskId: string): Promise<void> {
    const tasks = await storageService.get<TaskItem[]>('tasks', INITIAL_TASKS)
    const updated = tasks.map(t => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    await storageService.set('tasks', updated)
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('superdash_task_updated'))
    }
  }

  // Master Aggregation method
  async getMorningBriefing(): Promise<MorningAggregatedData> {
    const today = this.getTodayDateString()
    const now = new Date()

    // Formatted date string (e.g. Tuesday, 29 September 2026)
    const formattedDate = now.toLocaleDateString(undefined, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })

    // 1. Day data (Priorities & Note)
    const dayData = await this.getDayData(today)

    // 2. Focus stats
    let focusStats = {
      todayCompletedSeconds: 0,
      todayGoalSeconds: 7200,
      todayProgressFraction: 0,
      streakDays: 0
    }
    try {
      const stats = await focusService.getStats()
      focusStats = {
        todayCompletedSeconds: stats.todayCompletedSeconds,
        todayGoalSeconds: stats.todayGoalSeconds,
        todayProgressFraction: stats.todayProgressFraction,
        streakDays: stats.streakDays
      }
    } catch (e) {
      console.warn('Could not read focus stats:', e)
    }

    // 3. Hearings today
    let hearingsToday: Hearing[] = []
    try {
      const allHearings = await hearingRepository.getAll()
      hearingsToday = allHearings.filter(h => h.hearingDate === today && h.status !== 'Cancelled')
    } catch (e) {
      console.warn('Could not read hearings:', e)
    }

    // 4. Tasks today
    let tasksToday: TaskItem[] = []
    try {
      const allTasks = await storageService.get<TaskItem[]>('tasks', INITIAL_TASKS)
      // Show pending tasks that are high priority or due today
      tasksToday = allTasks.filter(t => !t.completed && (t.dueDate === today || t.priority === 'high')).slice(0, 5)
      // If none, show latest pending tasks
      if (tasksToday.length === 0) {
        tasksToday = allTasks.filter(t => !t.completed).slice(0, 4)
      }
    } catch (e) {
      console.warn('Could not read tasks:', e)
    }

    // 5. Calendar events today
    let calendarEventsToday: CalendarEvent[] = []
    try {
      const allEvents = await storageService.get<CalendarEvent[]>('calendar_events', INITIAL_CALENDAR_EVENTS)
      calendarEventsToday = allEvents.filter(e => e.date === today)
    } catch (e) {
      console.warn('Could not read calendar events:', e)
    }

    // 6. Reminders today
    let remindersToday: ReminderItem[] = []
    try {
      const allReminders = await storageService.get<ReminderItem[]>('reminders_list', INITIAL_REMINDERS)
      remindersToday = allReminders.filter(r => !r.completed && r.date === today)
    } catch (e) {
      console.warn('Could not read reminders:', e)
    }

    // 7. Markets (cached rates)
    let markets: MarketPairData[] = []
    try {
      markets = await marketService.fetchPairs(['BTC-USD', 'AED-MAD', 'USD-AED'])
    } catch (e) {
      console.warn('Could not read market data:', e)
    }

    // 8. Finance snapshot
    let financeSummary: MorningFinanceSummary | null = null
    try {
      const invoices = await financeService.getInvoices()
      const payments = await financeService.getPayments()
      const expenses = await financeService.getExpenses()
      const settings = await financeService.getSettings()

      const currentYearMonth = today.slice(0, 7) // YYYY-MM

      let receivedMonth = 0
      payments.forEach(p => {
        if (p.paymentDate.startsWith(currentYearMonth)) {
          receivedMonth += p.amount
        }
      })

      let expensesMonth = 0
      expenses.forEach(exp => {
        if (exp.date.startsWith(currentYearMonth)) {
          expensesMonth += exp.amount
        }
      })

      // Calculate total outstanding balance
      let outstanding = 0
      invoices.forEach(inv => {
        if (inv.status !== 'Draft' && inv.status !== 'Cancelled') {
          const invPayments = payments.filter(p => p.invoiceId === inv.id)
          const paidAmt = invPayments.reduce((s, p) => s + p.amount, 0)
          const bal = Math.max(0, inv.total - paidAmt)
          outstanding += bal
        }
      })

      financeSummary = {
        receivedMonth,
        expensesMonth,
        outstanding,
        currency: settings.defaultCurrency || 'AED'
      }
    } catch (e) {
      console.warn('Could not read finance summary:', e)
    }

    // 9. Decisions due for review
    let decisionsDue: DecisionItem[] = []
    try {
      decisionsDue = await decisionService.getReviewsDue()
    } catch (e) {
      console.warn('Could not read decisions due:', e)
    }

    // 10. Idea of the day (stored unfinished idea)
    let ideaOfTheDay: IdeaItem | null = null
    try {
      ideaOfTheDay = await ideasService.getRandomUnfinishedIdea()
    } catch (e) {
      console.warn('Could not read random idea:', e)
    }

    return {
      dateStr: today,
      formattedDate,
      priorities: dayData.priorities,
      morningNote: dayData.note,
      focusStats,
      hearingsToday,
      tasksToday,
      calendarEventsToday,
      remindersToday,
      markets,
      financeSummary,
      decisionsDue,
      ideaOfTheDay
    }
  }
}

export const morningAggregatorService = new MorningAggregatorServiceImpl()
