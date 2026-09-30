import { FocusSession, FocusSettings, TimerVisualMode } from '@/types'
import { storageService } from '@/services/storage'
import { timerService, TimerState } from '@/services/timer'
import { toLocalYYYYMMDD } from '@/utils/date'

const SESSIONS_STORAGE_KEY = 'focus_sessions'
const SETTINGS_STORAGE_KEY = 'focus_settings'
const ACTIVE_FOCUS_KEY = 'focus_active_session'

export interface ActiveFocusState {
  title: string
  durationPlanned: number // in seconds
  startedAt: number
  isRunning: boolean
  isPaused: boolean
  remainingSeconds: number
  visualMode: TimerVisualMode
}

export const DEFAULT_FOCUS_SETTINGS: FocusSettings = {
  dailyGoalMinutes: 120, // 2 hours
  dailyMinimumMinutes: 25, // 25 min for streak
  streakEnabled: true,
  visualMode: 'hourglass'
}

// Realistic seed data for focus sessions
const now = Date.now()
const oneDayMs = 86400000

export const INITIAL_FOCUS_SESSIONS: FocusSession[] = [
  {
    id: 'f-sess-1',
    title: 'Review Claimant Rejoinder & Case Law',
    durationPlanned: 2700, // 45 min
    durationCompleted: 2700,
    startedAt: now - 3600000 * 3,
    endedAt: now - 3600000 * 2.25,
    completed: true,
    notes: 'Outlined counter-arguments regarding UAE Civil Transactions Law Article 218.'
  },
  {
    id: 'f-sess-2',
    title: 'VAT Invoicing & Tax Ledger Audit',
    durationPlanned: 2400, // 40 min
    durationCompleted: 2400,
    startedAt: now - 3600000 * 6,
    endedAt: now - 3600000 * 5.33,
    completed: true,
    notes: 'Reconciled September client billings.'
  },
  {
    id: 'f-sess-3',
    title: 'Drafting Statement of Defense (Dubai Court)',
    durationPlanned: 3600, // 60 min
    durationCompleted: 3600,
    startedAt: now - oneDayMs - 3600000 * 4,
    endedAt: now - oneDayMs - 3600000 * 3,
    completed: true,
    notes: 'Completed sections 1 through 4.'
  },
  {
    id: 'f-sess-4',
    title: 'Legal Precedent Research on Commercial Agency',
    durationPlanned: 1800, // 30 min
    durationCompleted: 1800,
    startedAt: now - oneDayMs * 2 - 3600000 * 5,
    endedAt: now - oneDayMs * 2 - 3600000 * 4.5,
    completed: true,
    notes: 'Gathered Cassation Court rulings.'
  },
  {
    id: 'f-sess-5',
    title: 'Preparation for Expert Accounting Meeting',
    durationPlanned: 2700,
    durationCompleted: 2700,
    startedAt: now - oneDayMs * 3 - 3600000 * 2,
    endedAt: now - oneDayMs * 3 - 3600000 * 1.25,
    completed: true,
    notes: 'Organized bank invoices and payroll receipts.'
  }
]

type FocusSubscriber = () => void

class FocusServiceImpl {
  private subscribers = new Set<FocusSubscriber>()
  private activeSession: ActiveFocusState | null = null
  private settings: FocusSettings = DEFAULT_FOCUS_SETTINGS
  private timerUnsubscribe: (() => void) | null = null

  constructor() {
    this.init()
  }

  private async init() {
    this.settings = await storageService.get<FocusSettings>(SETTINGS_STORAGE_KEY, DEFAULT_FOCUS_SETTINGS)
    const savedActive = await storageService.get<ActiveFocusState | null>(ACTIVE_FOCUS_KEY, null)

    const timerState = timerService.getState()
    if (savedActive && (timerState.isRunning || timerState.isPaused)) {
      this.activeSession = {
        ...savedActive,
        isRunning: timerState.isRunning,
        isPaused: timerState.isPaused,
        remainingSeconds: timerState.remainingSeconds
      }
    } else if (savedActive && timerState.remainingSeconds > 0 && !timerState.isRunning && !timerState.isPaused) {
      // Restore cached state if exists
      this.activeSession = savedActive
    }

    // Subscribe to timer service ticks to stay 100% in sync
    this.timerUnsubscribe = timerService.subscribe((state: TimerState) => {
      if (this.activeSession) {
        const wasRunning = this.activeSession.isRunning
        this.activeSession = {
          ...this.activeSession,
          isRunning: state.isRunning,
          isPaused: state.isPaused,
          remainingSeconds: state.remainingSeconds
        }

        // If timer reached zero while focus session was active
        if (state.remainingSeconds === 0 && wasRunning && !state.isRunning) {
          // Trigger completion notification event
          if (typeof window !== 'undefined') {
            window.dispatchEvent(
              new CustomEvent('superdash_focus_completed', {
                detail: { session: this.activeSession }
              })
            )
          }
        }

        this.notify()
      }
    })
  }

  subscribe(callback: FocusSubscriber): () => void {
    this.subscribers.add(callback)
    return () => {
      this.subscribers.delete(callback)
    }
  }

  private notify() {
    this.subscribers.forEach(cb => {
      try {
        cb()
      } catch (e) {
        console.error('Focus subscription error:', e)
      }
    })
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('superdash_focus_updated'))
    }
  }

  getActiveSession(): ActiveFocusState | null {
    return this.activeSession ? { ...this.activeSession } : null
  }

  async getSettings(): Promise<FocusSettings> {
    const s = await storageService.get<FocusSettings>(SETTINGS_STORAGE_KEY, DEFAULT_FOCUS_SETTINGS)
    this.settings = s
    return s
  }

  async updateSettings(updates: Partial<FocusSettings>): Promise<FocusSettings> {
    const current = await this.getSettings()
    const updated = { ...current, ...updates }
    this.settings = updated
    await storageService.set(SETTINGS_STORAGE_KEY, updated)
    this.notify()
    return updated
  }

  async startFocusSession(title: string, durationMinutes: number, visualMode?: TimerVisualMode): Promise<void> {
    const durationSeconds = Math.round(durationMinutes * 60)
    const mode = visualMode || this.settings.visualMode || 'hourglass'

    this.activeSession = {
      title: title.trim() || 'Focus Session',
      durationPlanned: durationSeconds,
      startedAt: Date.now(),
      isRunning: true,
      isPaused: false,
      remainingSeconds: durationSeconds,
      visualMode: mode
    }

    await storageService.set(ACTIVE_FOCUS_KEY, this.activeSession)

    // Reuse timerService to power the countdown and alarms
    timerService.setVisualMode(mode)
    timerService.startTimer(durationSeconds)
    this.notify()
  }

  pauseFocus(): void {
    if (this.activeSession) {
      this.activeSession.isPaused = true
      this.activeSession.isRunning = false
      timerService.pauseTimer()
      storageService.set(ACTIVE_FOCUS_KEY, this.activeSession)
      this.notify()
    }
  }

  resumeFocus(): void {
    if (this.activeSession) {
      this.activeSession.isPaused = false
      this.activeSession.isRunning = true
      timerService.resumeTimer()
      storageService.set(ACTIVE_FOCUS_KEY, this.activeSession)
      this.notify()
    }
  }

  async endSession(completed = false, notes?: string): Promise<FocusSession | null> {
    if (!this.activeSession) return null

    const timerState = timerService.getState()
    const remaining = timerState.remainingSeconds
    const durationPlanned = this.activeSession.durationPlanned
    const durationCompleted = Math.max(0, durationPlanned - remaining)

    const sessionRecord: FocusSession = {
      id: 'focus-' + Date.now(),
      title: this.activeSession.title,
      durationPlanned,
      durationCompleted,
      startedAt: this.activeSession.startedAt,
      endedAt: Date.now(),
      completed,
      notes: notes?.trim() || undefined
    }

    // Only record in history if user completed at least 1 minute of focus
    if (durationCompleted >= 60 || completed) {
      const history = await this.getSessions()
      const updated = [sessionRecord, ...history]
      await storageService.set(SESSIONS_STORAGE_KEY, updated)
    }

    timerService.resetTimer()
    this.activeSession = null
    await storageService.set(ACTIVE_FOCUS_KEY, null)
    this.notify()
    return sessionRecord
  }

  async getSessions(): Promise<FocusSession[]> {
    return storageService.get<FocusSession[]>(SESSIONS_STORAGE_KEY, INITIAL_FOCUS_SESSIONS)
  }

  async deleteSession(id: string): Promise<void> {
    const list = await this.getSessions()
    const filtered = list.filter(s => s.id !== id)
    await storageService.set(SESSIONS_STORAGE_KEY, filtered)
    this.notify()
  }

  // Daily & Weekly Statistics calculation
  async getStats(): Promise<{
    todayCompletedSeconds: number
    todayGoalSeconds: number
    todayProgressFraction: number
    weekCompletedSeconds: number
    todaySessionCount: number
    streakDays: number
  }> {
    const sessions = await this.getSessions()
    const settings = await this.getSettings()

    const todayDateStr = toLocalYYYYMMDD()
    const now = new Date()

    // Calculate start of current week (Monday)
    const day = now.getDay()
    const diffToMon = (day === 0 ? -6 : 1) - day
    const monday = new Date(now)
    monday.setDate(now.getDate() + diffToMon)
    monday.setHours(0, 0, 0, 0)
    const mondayTimestamp = monday.getTime()

    let todayCompletedSeconds = 0
    let todaySessionCount = 0
    let weekCompletedSeconds = 0

    sessions.forEach(s => {
      const sDateStr = toLocalYYYYMMDD(new Date(s.endedAt || s.startedAt))
      if (sDateStr === todayDateStr) {
        todayCompletedSeconds += s.durationCompleted
        todaySessionCount += 1
      }
      if ((s.endedAt || s.startedAt) >= mondayTimestamp) {
        weekCompletedSeconds += s.durationCompleted
      }
    })

    const todayGoalSeconds = (settings.dailyGoalMinutes || 120) * 60
    const todayProgressFraction = Math.min(1, todayCompletedSeconds / (todayGoalSeconds || 1))

    // Calculate streak
    let streakDays = 0
    if (settings.streakEnabled) {
      const minRequiredSec = (settings.dailyMinimumMinutes || 25) * 60

      // Map sessions per day
      const dayTotals = new Map<string, number>()
      sessions.forEach(s => {
        const d = toLocalYYYYMMDD(new Date(s.endedAt || s.startedAt))
        dayTotals.set(d, (dayTotals.get(d) || 0) + s.durationCompleted)
      })

      // Check consecutively backwards starting from today or yesterday
      const checkDate = new Date()
      let checkStr = toLocalYYYYMMDD(checkDate)

      // If today reached minimum, start streak from today; otherwise check if yesterday met it
      if ((dayTotals.get(checkStr) || 0) >= minRequiredSec) {
        streakDays = 1
        checkDate.setDate(checkDate.getDate() - 1)
      } else {
        checkDate.setDate(checkDate.getDate() - 1)
        checkStr = toLocalYYYYMMDD(checkDate)
        if ((dayTotals.get(checkStr) || 0) >= minRequiredSec) {
          streakDays = 1
          checkDate.setDate(checkDate.getDate() - 1)
        }
      }

      while (streakDays > 0) {
        const dStr = toLocalYYYYMMDD(checkDate)
        if ((dayTotals.get(dStr) || 0) >= minRequiredSec) {
          streakDays++
          checkDate.setDate(checkDate.getDate() - 1)
        } else {
          break
        }
      }
    }

    return {
      todayCompletedSeconds,
      todayGoalSeconds,
      todayProgressFraction,
      weekCompletedSeconds,
      todaySessionCount,
      streakDays
    }
  }
}

export const focusService = new FocusServiceImpl()
