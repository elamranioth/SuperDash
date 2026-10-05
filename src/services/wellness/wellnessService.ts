import {
  WellnessSettings,
  WellnessReminderType,
  WellnessReminderConfig,
  DayOfWeek
} from '@/types/wellness'
import { storageService } from '@/services/storage'
import { getRandomWellnessMessage } from './wellnessMessages'

const WELLNESS_STORAGE_KEY = 'superdash_wellness_settings'

export const DEFAULT_WELLNESS_SETTINGS: WellnessSettings = {
  masterEnabled: false,
  startHour: '09:00',
  endHour: '19:00',
  activeDays: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
  pausedUntil: null,
  reminders: {
    water: {
      id: 'water',
      name: 'Drink Water',
      icon: '💧',
      description: 'Stay hydrated during your workday',
      enabled: true,
      intervalMinutes: 60
    },
    breathing: {
      id: 'breathing',
      name: 'Deep Breathing',
      icon: '🌬️',
      description: 'Reset your nervous system with mindful breath',
      enabled: true,
      intervalMinutes: 90
    },
    stand: {
      id: 'stand',
      name: 'Stand Up',
      icon: '🚶',
      description: 'Get out of your chair and improve blood flow',
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
    eyes: {
      id: 'eyes',
      name: 'Eye Break',
      icon: '👀',
      description: 'Rest your vision and prevent digital eye strain',
      enabled: true,
      intervalMinutes: 45
    },
    relax: {
      id: 'relax',
      name: 'Relax',
      icon: '🧘',
      description: 'Take a short, quiet reset for mental clarity',
      enabled: true,
      intervalMinutes: 180
    }
  }
}

export type WellnessListener = (settings: WellnessSettings) => void

class WellnessService {
  private timerId: number | null = null
  private listeners: Set<WellnessListener> = new Set()
  private isChecking = false

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
    // Merge with defaults in case new reminders or fields were added
    return {
      ...DEFAULT_WELLNESS_SETTINGS,
      ...saved,
      reminders: {
        ...DEFAULT_WELLNESS_SETTINGS.reminders,
        ...(saved?.reminders || {})
      }
    }
  }

  public async saveSettings(partial: Partial<WellnessSettings>): Promise<WellnessSettings> {
    const current = await this.getSettings()
    const updated: WellnessSettings = {
      ...current,
      ...partial,
      reminders: partial.reminders ? { ...current.reminders, ...partial.reminders } : current.reminders
    }
    await storageService.set(WELLNESS_STORAGE_KEY, updated)
    this.notify(updated)
    return updated
  }

  public async setMasterEnabled(enabled: boolean): Promise<WellnessSettings> {
    const current = await this.getSettings()
    const updated = await this.saveSettings({
      masterEnabled: enabled,
      // If toggled back on, unpause
      pausedUntil: enabled ? null : current.pausedUntil
    })

    if (enabled) {
      // Re-initialize reminder timing timestamps so they don't fire immediately all at once
      const now = Date.now()
      const updatedReminders = { ...updated.reminders }
      for (const key of Object.keys(updatedReminders) as WellnessReminderType[]) {
        if (updatedReminders[key].enabled) {
          updatedReminders[key].lastTriggeredAt = now
        }
      }
      return await this.saveSettings({ reminders: updatedReminders })
    }

    return updated
  }

  public async toggleReminder(id: WellnessReminderType, enabled: boolean): Promise<WellnessSettings> {
    const settings = await this.getSettings()
    const reminder = settings.reminders[id]
    if (!reminder) return settings

    const updatedReminder: WellnessReminderConfig = {
      ...reminder,
      enabled,
      lastTriggeredAt: enabled ? Date.now() : undefined
    }

    return await this.saveSettings({
      reminders: {
        ...settings.reminders,
        [id]: updatedReminder
      }
    })
  }

  public async updateReminderInterval(id: WellnessReminderType, intervalMinutes: number): Promise<WellnessSettings> {
    const settings = await this.getSettings()
    const reminder = settings.reminders[id]
    if (!reminder) return settings

    const updatedReminder: WellnessReminderConfig = {
      ...reminder,
      intervalMinutes,
      // Reset trigger anchor to now so the new interval counts cleanly
      lastTriggeredAt: Date.now()
    }

    return await this.saveSettings({
      reminders: {
        ...settings.reminders,
        [id]: updatedReminder
      }
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

    // Stagger / reset trigger anchor timestamps so they don't fire simultaneously
    for (const key of Object.keys(updatedReminders) as WellnessReminderType[]) {
      if (updatedReminders[key].enabled) {
        updatedReminders[key].lastTriggeredAt = now
      }
    }

    return await this.saveSettings({
      pausedUntil: null,
      pauseReason: undefined,
      reminders: updatedReminders
    })
  }

  public isPaused(settings: WellnessSettings): boolean {
    if (!settings.pausedUntil) return false
    return Date.now() < settings.pausedUntil
  }

  public isWithinActiveHours(settings: WellnessSettings, date: Date = new Date()): boolean {
    // 1. Day of week check
    const daysMap: Record<number, DayOfWeek> = {
      0: 'sun',
      1: 'mon',
      2: 'tue',
      3: 'wed',
      4: 'thu',
      5: 'fri',
      6: 'sat'
    }
    const currentDay = daysMap[date.getDay()]
    if (!settings.activeDays.includes(currentDay)) {
      return false
    }

    // 2. Time range check (HH:mm)
    const [startH, startM] = settings.startHour.split(':').map(Number)
    const [endH, endM] = settings.endHour.split(':').map(Number)

    const currentMinutes = date.getHours() * 60 + date.getMinutes()
    const startMinutes = (startH || 9) * 60 + (startM || 0)
    const endMinutes = (endH || 19) * 60 + (endM || 0)

    if (startMinutes <= endMinutes) {
      return currentMinutes >= startMinutes && currentMinutes <= endMinutes
    } else {
      // Overnight active window (e.g. 22:00 to 06:00)
      return currentMinutes >= startMinutes || currentMinutes <= endMinutes
    }
  }

  public async requestNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'unsupported'
    }

    if (Notification.permission === 'granted') {
      return 'granted'
    }

    try {
      const result = await Notification.requestPermission()
      return result
    } catch (err) {
      console.warn('[WellnessService] Permission request failed:', err)
      return Notification.permission
    }
  }

  public getNotificationPermission(): NotificationPermission | 'unsupported' {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'unsupported'
    }
    return Notification.permission
  }

  public async triggerNotification(type: WellnessReminderType): Promise<void> {
    const msg = getRandomWellnessMessage(type)

    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        const notif = new Notification(msg.title, {
          body: msg.body,
          icon: '/favicon.svg',
          badge: '/favicon.svg',
          tag: `superdash-wellness-${type}`,
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
        console.warn('[WellnessService] Failed to show system notification, falling back to UI event:', err)
      }
    }

    // Also dispatch custom in-app event for UI toasts or live banner
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('superdash_wellness_alert', {
          detail: { type, title: msg.title, body: msg.body }
        })
      )
    }
  }

  /**
   * Evaluates all enabled reminders against their intervals and active hours.
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
      let settingsChanged = false
      const updatedReminders = { ...settings.reminders }

      for (const key of Object.keys(updatedReminders) as WellnessReminderType[]) {
        const item = updatedReminders[key]
        if (!item || !item.enabled) continue

        const intervalMs = (item.intervalMinutes || 60) * 60 * 1000
        const lastTrigger = item.lastTriggeredAt || 0

        if (now - lastTrigger >= intervalMs) {
          // Trigger notification
          await this.triggerNotification(item.id)
          updatedReminders[key] = {
            ...item,
            lastTriggeredAt: now
          }
          settingsChanged = true
        }
      }

      if (settingsChanged) {
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
      console.error('[WellnessService] Error evaluating reminders:', err)
    } finally {
      this.isChecking = false
    }
  }

  private startBackgroundLoop(): void {
    if (typeof window === 'undefined') return
    if (this.timerId !== null) return

    // Run check every 30 seconds
    this.timerId = window.setInterval(() => {
      this.checkAndDispatch()
    }, 30000)

    // Run an initial check after a brief start delay
    window.setTimeout(() => {
      this.checkAndDispatch()
    }, 3000)
  }

  public stop(): void {
    if (this.timerId !== null) {
      window.clearInterval(this.timerId)
      this.timerId = null
    }
  }
}

export const wellnessService = new WellnessService()
