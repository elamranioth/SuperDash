import {
  WellnessSettings,
  WellnessReminderConfig,
  DayOfWeek,
  DailyWellnessProgress,
  ReminderHistoryItem,
  WaterTrackerConfig
} from '@/types/wellness'
import { storageService } from '@/services/storage'
import { getRandomWellnessMessage } from './wellnessMessages'

const WELLNESS_STORAGE_KEY = 'superdash_wellness_settings'

function getTodayDateStr(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export const DEFAULT_WATER_TRACKER: WaterTrackerConfig = {
  dailyTargetMl: 2000,
  currentMl: 0,
  glassSizeMl: 250,
  lastUpdatedDate: getTodayDateStr()
}

export const DEFAULT_WELLNESS_SETTINGS: WellnessSettings = {
  masterEnabled: false,
  startHour: '09:00',
  endHour: '22:00',
  activeDays: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
  pausedUntil: null,
  focusMode: { active: false, durationMinutes: 60, endsAt: null },
  waterTracker: DEFAULT_WATER_TRACKER,
  mode202020Enabled: false,
  history: [],
  dailyProgress: {},
  reminders: {
    water: {
      id: 'water',
      name: 'Drink Water',
      icon: '💧',
      description: 'Stay hydrated during your workday',
      enabled: true,
      intervalMinutes: 60
    },
    eyes: {
      id: 'eyes',
      name: 'Eye Break',
      icon: '👀',
      description: 'Rest your vision and prevent digital eye strain',
      enabled: true,
      intervalMinutes: 45
    },
    stand: {
      id: 'stand',
      name: 'Stand Up',
      icon: '🚶',
      description: 'Get out of your chair and improve circulation',
      enabled: true,
      intervalMinutes: 60
    },
    stretch: {
      id: 'stretch',
      name: 'Stretch',
      icon: '🤸',
      description: 'Loosen tight neck, shoulder and back muscles',
      enabled: true,
      intervalMinutes: 120
    },
    breathing: {
      id: 'breathing',
      name: 'Deep Breathing',
      icon: '🫁',
      description: 'Reset your nervous system with mindful breath',
      enabled: true,
      intervalMinutes: 120
    },
    relax: {
      id: 'relax',
      name: 'Relax & Reset',
      icon: '🧘',
      description: 'Take a short, quiet reset for mental clarity',
      enabled: true,
      intervalMinutes: 180
    },
    posture: {
      id: 'posture',
      name: 'Posture Check',
      icon: '🪑',
      description: 'Relax your shoulders, align spine and sit upright',
      enabled: false,
      intervalMinutes: 90
    },
    walk: {
      id: 'walk',
      name: 'Short Walk',
      icon: '🚶',
      description: 'Step away from the screen for a 2-minute stroll',
      enabled: false,
      intervalMinutes: 150
    }
  }
}

export type WellnessListener = (settings: WellnessSettings) => void

class WellnessService {
  private timerId: number | null = null
  private listeners: Set<WellnessListener> = new Set()
  private isChecking = false
  private lastNotificationTimestamp: number = 0

  constructor() {
    this.startBackgroundLoop()
  }

  public subscribe(listener: WellnessListener): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private notify(settings: WellnessSettings): void {
    this.listeners.forEach(fn => {
      try {
        fn(settings)
      } catch (err) {
        console.error('[WellnessService] Error in listener:', err)
      }
    })
  }

  public async getSettings(): Promise<WellnessSettings> {
    const saved = await storageService.get<WellnessSettings>(WELLNESS_STORAGE_KEY, DEFAULT_WELLNESS_SETTINGS)
    const today = getTodayDateStr()

    // Safely migrate existing settings without overwriting customized user fields
    const waterTracker: WaterTrackerConfig = {
      ...DEFAULT_WATER_TRACKER,
      ...(saved?.waterTracker || {})
    }
    // Daily water reset if new day
    if (waterTracker.lastUpdatedDate !== today) {
      waterTracker.currentMl = 0
      waterTracker.lastUpdatedDate = today
    }

    const mergedReminders: Record<string, WellnessReminderConfig> = {
      ...DEFAULT_WELLNESS_SETTINGS.reminders,
      ...(saved?.reminders || {})
    }

    const merged: WellnessSettings = {
      ...DEFAULT_WELLNESS_SETTINGS,
      ...saved,
      waterTracker,
      reminders: mergedReminders,
      history: (saved?.history || []).slice(-100), // retain max 100 historical records
      dailyProgress: saved?.dailyProgress || {}
    }

    // Initialize today's progress if missing
    if (!merged.dailyProgress[today]) {
      merged.dailyProgress[today] = {
        date: today,
        workStartTime: Date.now(),
        waterGlasses: Math.floor(waterTracker.currentMl / (waterTracker.glassSizeMl || 250)),
        waterMl: waterTracker.currentMl,
        movementBreaks: 0,
        eyeBreaks: 0,
        stretchBreaks: 0,
        relaxBreaks: 0,
        postureChecks: 0,
        walkBreaks: 0,
        totalDone: 0,
        totalSkipped: 0,
        totalSnoozed: 0
      }
    }

    return merged
  }

  public async saveSettings(partial: Partial<WellnessSettings>): Promise<WellnessSettings> {
    const current = await this.getSettings()
    const updated: WellnessSettings = {
      ...current,
      ...partial,
      reminders: partial.reminders !== undefined ? partial.reminders : current.reminders
    }
    await storageService.set(WELLNESS_STORAGE_KEY, updated)
    this.notify(updated)
    return updated
  }


  public async setMasterEnabled(enabled: boolean): Promise<WellnessSettings> {
    const current = await this.getSettings()
    const updated = await this.saveSettings({
      masterEnabled: enabled,
      pausedUntil: enabled ? null : current.pausedUntil,
      focusMode: enabled ? { ...current.focusMode, active: false, endsAt: null } : current.focusMode
    })

    if (enabled) {
      // Stagger anchor timestamps so they don't fire immediately all at once
      const now = Date.now()
      const updatedReminders = { ...updated.reminders }
      let offset = 0
      for (const key of Object.keys(updatedReminders)) {
        if (updatedReminders[key].enabled) {
          // Stagger starting anchors slightly
          updatedReminders[key].lastTriggeredAt = now + offset * 1000 * 60
          updatedReminders[key].snoozedUntil = null
          offset += 5
        }
      }
      return await this.saveSettings({ reminders: updatedReminders })
    }

    return updated
  }

  public async toggleReminder(id: string, enabled: boolean): Promise<WellnessSettings> {
    const settings = await this.getSettings()
    const reminder = settings.reminders[id]
    if (!reminder) return settings

    const updatedReminder: WellnessReminderConfig = {
      ...reminder,
      enabled,
      lastTriggeredAt: enabled ? Date.now() : undefined,
      snoozedUntil: null
    }

    return await this.saveSettings({
      reminders: {
        ...settings.reminders,
        [id]: updatedReminder
      }
    })
  }

  public async updateReminderInterval(id: string, intervalMinutes: number): Promise<WellnessSettings> {
    const settings = await this.getSettings()
    const reminder = settings.reminders[id]
    if (!reminder) return settings

    const updatedReminder: WellnessReminderConfig = {
      ...reminder,
      intervalMinutes,
      lastTriggeredAt: Date.now(),
      snoozedUntil: null
    }

    return await this.saveSettings({
      reminders: {
        ...settings.reminders,
        [id]: updatedReminder
      }
    })
  }

  public async saveCustomReminder(reminder: Partial<WellnessReminderConfig>): Promise<WellnessSettings> {
    const settings = await this.getSettings()
    const id = reminder.id || `custom_${Date.now()}`
    const config: WellnessReminderConfig = {
      id,
      name: reminder.name || 'Custom Break',
      icon: reminder.icon || '🌿',
      description: reminder.description || 'Personal desk break',
      enabled: reminder.enabled ?? true,
      intervalMinutes: reminder.intervalMinutes || 60,
      isCustom: true,
      customMessage: reminder.customMessage,
      startHour: reminder.startHour,
      endHour: reminder.endHour,
      activeDays: reminder.activeDays,
      lastTriggeredAt: Date.now()
    }

    return await this.saveSettings({
      reminders: {
        ...settings.reminders,
        [id]: config
      }
    })
  }

  public async deleteCustomReminder(id: string): Promise<WellnessSettings> {
    const settings = await this.getSettings()
    const copy = { ...settings.reminders }
    delete copy[id]
    return await this.saveSettings({ reminders: copy })
  }

  // ─── Actions: Done / Snooze / Skip ─────────────────────────────────────────

  public async recordAction(
    reminderId: string,
    action: 'done' | 'snooze' | 'skip',
    snoozeMinutes: number = 10
  ): Promise<WellnessSettings> {
    const settings = await this.getSettings()
    const reminder = settings.reminders[reminderId]
    if (!reminder) return settings

    const now = Date.now()
    const today = getTodayDateStr()
    const todayProg = { ...(settings.dailyProgress[today] || {
      date: today,
      workStartTime: now,
      waterGlasses: 0,
      waterMl: 0,
      movementBreaks: 0,
      eyeBreaks: 0,
      stretchBreaks: 0,
      relaxBreaks: 0,
      postureChecks: 0,
      walkBreaks: 0,
      totalDone: 0,
      totalSkipped: 0,
      totalSnoozed: 0
    }) }

    const historyItem: ReminderHistoryItem = {
      id: `act_${now}_${Math.random().toString(36).slice(2, 6)}`,
      reminderId,
      reminderName: reminder.name,
      reminderIcon: reminder.icon,
      action,
      timestamp: now
    }

    const updatedReminder = { ...reminder }

    if (action === 'done') {
      updatedReminder.lastTriggeredAt = now
      updatedReminder.snoozedUntil = null
      todayProg.totalDone++

      if (reminderId === 'water') {
        todayProg.waterGlasses++
        todayProg.waterMl += (settings.waterTracker.glassSizeMl || 250)
      } else if (reminderId === 'stand' || reminderId === 'walk') {
        todayProg.movementBreaks++
        if (reminderId === 'walk') todayProg.walkBreaks++
      } else if (reminderId === 'eyes') {
        todayProg.eyeBreaks++
      } else if (reminderId === 'stretch') {
        todayProg.stretchBreaks++
      } else if (reminderId === 'relax' || reminderId === 'breathing') {
        todayProg.relaxBreaks++
      } else if (reminderId === 'posture') {
        todayProg.postureChecks++
      }
    } else if (action === 'snooze') {
      updatedReminder.snoozedUntil = now + snoozeMinutes * 60 * 1000
      todayProg.totalSnoozed++
    } else if (action === 'skip') {
      updatedReminder.lastTriggeredAt = now
      updatedReminder.snoozedUntil = null
      todayProg.totalSkipped++
    }

    const newHistory = [historyItem, ...settings.history].slice(0, 100)

    return await this.saveSettings({
      reminders: {
        ...settings.reminders,
        [reminderId]: updatedReminder
      },
      history: newHistory,
      dailyProgress: {
        ...settings.dailyProgress,
        [today]: todayProg
      }
    })
  }

  // ─── Water Tracker ─────────────────────────────────────────────────────────

  public async addWaterGlass(glassSizeMl?: number): Promise<WellnessSettings> {
    const settings = await this.getSettings()
    const added = glassSizeMl || settings.waterTracker.glassSizeMl || 250
    const newCurrent = settings.waterTracker.currentMl + added
    const today = getTodayDateStr()

    const todayProg = { ...(settings.dailyProgress[today] || {}) } as DailyWellnessProgress
    todayProg.waterGlasses = Math.floor(newCurrent / (settings.waterTracker.glassSizeMl || 250))
    todayProg.waterMl = newCurrent

    return await this.saveSettings({
      waterTracker: {
        ...settings.waterTracker,
        currentMl: newCurrent,
        lastUpdatedDate: today
      },
      dailyProgress: {
        ...settings.dailyProgress,
        [today]: todayProg
      }
    })
  }

  public async setWaterGoal(dailyTargetMl: number, glassSizeMl: number): Promise<WellnessSettings> {
    const settings = await this.getSettings()
    return await this.saveSettings({
      waterTracker: {
        ...settings.waterTracker,
        dailyTargetMl,
        glassSizeMl
      }
    })
  }

  // ─── Focus Mode & Pause ───────────────────────────────────────────────────

  public async startFocusMode(durationMinutes: number): Promise<WellnessSettings> {
    const endsAt = Date.now() + durationMinutes * 60 * 1000
    return await this.saveSettings({
      focusMode: {
        active: true,
        durationMinutes,
        startedAt: Date.now(),
        endsAt
      }
    })
  }

  public async endFocusMode(): Promise<WellnessSettings> {
    const now = Date.now()
    const settings = await this.getSettings()
    // Stagger reminders upon resuming so no sudden explosion of alerts
    const updatedReminders = { ...settings.reminders }
    for (const key of Object.keys(updatedReminders)) {
      if (updatedReminders[key].enabled) {
        updatedReminders[key].lastTriggeredAt = now
        updatedReminders[key].snoozedUntil = null
      }
    }

    return await this.saveSettings({
      focusMode: {
        active: false,
        durationMinutes: 60,
        endsAt: null
      },
      reminders: updatedReminders
    })
  }

  public async pauseReminders(durationMinutes: number | 'tomorrow' | 'off'): Promise<WellnessSettings> {
    if (durationMinutes === 'off') {
      return await this.setMasterEnabled(false)
    }

    let pausedUntil: number
    let pauseReason = ''

    if (durationMinutes === 'tomorrow') {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(9, 0, 0, 0)
      pausedUntil = tomorrow.getTime()
      pauseReason = 'Paused until tomorrow 9:00 AM'
    } else {
      pausedUntil = Date.now() + durationMinutes * 60 * 1000
      pauseReason = `Paused for ${durationMinutes >= 60 ? `${durationMinutes / 60} hour(s)` : `${durationMinutes} min`}`
    }

    return await this.saveSettings({
      pausedUntil,
      pauseReason
    })
  }

  public async resumeReminders(): Promise<WellnessSettings> {
    const now = Date.now()
    const settings = await this.getSettings()
    const updatedReminders = { ...settings.reminders }

    for (const key of Object.keys(updatedReminders)) {
      if (updatedReminders[key].enabled) {
        updatedReminders[key].lastTriggeredAt = now
        updatedReminders[key].snoozedUntil = null
      }
    }

    return await this.saveSettings({
      pausedUntil: null,
      pauseReason: undefined,
      focusMode: { active: false, durationMinutes: 60, endsAt: null },
      reminders: updatedReminders
    })
  }

  public isPaused(settings: WellnessSettings): boolean {
    if (settings.focusMode?.active && settings.focusMode.endsAt && Date.now() < settings.focusMode.endsAt) {
      return true
    }
    if (!settings.pausedUntil) return false
    return Date.now() < settings.pausedUntil
  }

  public isWithinActiveHours(settings: WellnessSettings, date: Date = new Date()): boolean {
    const daysMap: Record<number, DayOfWeek> = {
      0: 'sun', 1: 'mon', 2: 'tue', 3: 'wed', 4: 'thu', 5: 'fri', 6: 'sat'
    }
    const currentDay = daysMap[date.getDay()]
    if (!settings.activeDays.includes(currentDay)) {
      return false
    }

    const [startH, startM] = (settings.startHour || '09:00').split(':').map(Number)
    const [endH, endM] = (settings.endHour || '22:00').split(':').map(Number)

    const currentMinutes = date.getHours() * 60 + date.getMinutes()
    const startMinutes = (startH || 9) * 60 + (startM || 0)
    const endMinutes = (endH || 22) * 60 + (endM || 0)

    if (startMinutes <= endMinutes) {
      return currentMinutes >= startMinutes && currentMinutes <= endMinutes
    } else {
      return currentMinutes >= startMinutes || currentMinutes <= endMinutes
    }
  }

  // ─── Next Reminder Calculation ─────────────────────────────────────────────

  public calculateNextReminder(settings: WellnessSettings): {
    reminder: WellnessReminderConfig | null
    dueTimestamp: number
    minutesRemaining: number
  } {
    if (!settings.masterEnabled || this.isPaused(settings)) {
      return { reminder: null, dueTimestamp: 0, minutesRemaining: 0 }
    }

    const now = Date.now()
    let earliestReminder: WellnessReminderConfig | null = null
    let earliestTime = Infinity

    for (const key of Object.keys(settings.reminders)) {
      const r = settings.reminders[key]
      if (!r.enabled) continue

      let dueAt = 0
      if (r.snoozedUntil && r.snoozedUntil > now) {
        dueAt = r.snoozedUntil
      } else {
        const intervalMs = (r.intervalMinutes || 60) * 60 * 1000
        const lastTrigger = r.lastTriggeredAt || now
        dueAt = lastTrigger + intervalMs
      }

      if (dueAt < earliestTime) {
        earliestTime = dueAt
        earliestReminder = r
      }
    }

    if (!earliestReminder) {
      return { reminder: null, dueTimestamp: 0, minutesRemaining: 0 }
    }

    const diffMs = Math.max(0, earliestTime - now)
    const minutesRemaining = Math.ceil(diffMs / (60 * 1000))

    return {
      reminder: earliestReminder,
      dueTimestamp: earliestTime,
      minutesRemaining
    }
  }

  // ─── Notification Dispatch & Throttling ────────────────────────────────────

  public async requestNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'unsupported'
    }
    if (Notification.permission === 'granted') return 'granted'

    try {
      return await Notification.requestPermission()
    } catch {
      return Notification.permission
    }
  }

  public getNotificationPermission(): NotificationPermission | 'unsupported' {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'unsupported'
    }
    return Notification.permission
  }

  public async triggerNotification(title: string, body: string, tag: string = 'superdash-wellness'): Promise<void> {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        const notif = new Notification(title, {
          body,
          icon: '/favicon.svg',
          badge: '/favicon.svg',
          tag,
          silent: false
        })

        notif.onclick = () => {
          window.focus()
          window.dispatchEvent(
            new CustomEvent('superdash_open_app', {
              detail: { appId: 'live', customProps: { initialWorld: 'NOW', openWellness: true } }
            })
          )
          notif.close()
        }
      } catch (err) {
        console.warn('[WellnessService] System notification fallback:', err)
      }
    }

    // In-app alert dispatch
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('superdash_wellness_alert', {
          detail: { title, body }
        })
      )
    }
  }

  public async sendTestNotification(): Promise<void> {
    await this.triggerNotification(
      '💧 SuperDash Live Test',
      'Wellness reminders are working perfectly on this device.',
      'superdash-test'
    )
  }

  /**
   * Intelligently evaluates reminders with throttling (min 10 mins apart) and combines close triggers.
   */
  public async checkAndDispatch(): Promise<void> {
    if (this.isChecking) return
    this.isChecking = true

    try {
      const settings = await this.getSettings()

      if (!settings.masterEnabled) return
      if (this.isPaused(settings)) return
      if (!this.isWithinActiveHours(settings)) return

      const now = Date.now()

      // Throttle: Never spam within 10 minutes (600,000 ms)
      if (now - this.lastNotificationTimestamp < 10 * 60 * 1000) {
        return
      }

      const dueReminders: WellnessReminderConfig[] = []
      const updatedReminders = { ...settings.reminders }
      let changed = false

      for (const key of Object.keys(updatedReminders)) {
        const item = updatedReminders[key]
        if (!item || !item.enabled) continue

        let isDue = false
        if (item.snoozedUntil && item.snoozedUntil <= now) {
          isDue = true
        } else {
          const intervalMs = (item.intervalMinutes || 60) * 60 * 1000
          const lastTrigger = item.lastTriggeredAt || 0
          if (now - lastTrigger >= intervalMs) {
            isDue = true
          }
        }

        if (isDue) {
          dueReminders.push(item)
          updatedReminders[key] = {
            ...item,
            lastTriggeredAt: now,
            snoozedUntil: null
          }
          changed = true
        }
      }

      if (dueReminders.length > 0) {
        this.lastNotificationTimestamp = now

        if (dueReminders.length === 1) {
          const r = dueReminders[0]
          const msg = getRandomWellnessMessage(r.id, r.customMessage)
          await this.triggerNotification(`${r.icon} ${r.name}`, msg.body, `superdash-${r.id}`)
        } else {
          // Intelligently combine reminders into a single "Quick Desk Break" notification
          const bullets = dueReminders.map(r => `${r.icon} ${r.name}`).join(' • ')
          await this.triggerNotification(
            '🌿 Quick Desk Break',
            `Time for a mindful pause: ${bullets}`,
            'superdash-bundle'
          )
        }
      }

      if (changed) {
        await storageService.set(WELLNESS_STORAGE_KEY, {
          ...settings,
          reminders: updatedReminders
        })
        this.notify({
          ...settings,
          reminders: updatedReminders
        })
      }
    } catch (err) {
      console.error('[WellnessService] Error in checkAndDispatch:', err)
    } finally {
      this.isChecking = false
    }
  }

  private startBackgroundLoop(): void {
    if (typeof window === 'undefined') return
    if (this.timerId !== null) return

    this.timerId = window.setInterval(() => {
      this.checkAndDispatch()
    }, 30000)

    window.setTimeout(() => {
      this.checkAndDispatch()
    }, 2000)
  }

  public stop(): void {
    if (this.timerId !== null) {
      window.clearInterval(this.timerId)
      this.timerId = null
    }
  }
}

export const wellnessService = new WellnessService()
