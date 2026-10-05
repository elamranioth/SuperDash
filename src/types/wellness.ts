export type WellnessReminderType =
  | 'water'
  | 'breathing'
  | 'stand'
  | 'stretch'
  | 'eyes'
  | 'relax'

export type DayOfWeek = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'

export interface WellnessReminderConfig {
  id: WellnessReminderType
  name: string
  icon: string
  description: string
  enabled: boolean
  intervalMinutes: number // default interval in minutes
  lastTriggeredAt?: number // unix timestamp
}

export interface WellnessSettings {
  masterEnabled: boolean
  startHour: string // 'HH:mm', default '09:00'
  endHour: string   // 'HH:mm', default '19:00'
  activeDays: DayOfWeek[] // ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
  pausedUntil?: number | null // timestamp until which notifications are quieted
  pauseReason?: string
  reminders: Record<WellnessReminderType, WellnessReminderConfig>
}

export interface WellnessMessage {
  title: string
  body: string
}
