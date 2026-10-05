export type BuiltInWellnessReminderType =
  | 'water'
  | 'breathing'
  | 'stand'
  | 'stretch'
  | 'eyes'
  | 'relax'
  | 'posture'
  | 'walk'

export type WellnessReminderType = BuiltInWellnessReminderType | string

export type DayOfWeek = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'

export interface WellnessReminderConfig {
  id: string
  name: string
  icon: string
  description: string
  enabled: boolean
  intervalMinutes: number // default interval in minutes
  lastTriggeredAt?: number // unix timestamp
  isCustom?: boolean
  customMessage?: string
  startHour?: string // optional custom start time
  endHour?: string   // optional custom end time
  activeDays?: DayOfWeek[]
  snoozedUntil?: number | null // temporary snooze timestamp
}

export interface WaterTrackerConfig {
  dailyTargetMl: number // default 2000 ml
  currentMl: number     // resets daily
  glassSizeMl: number   // default 250 ml
  lastUpdatedDate: string // 'YYYY-MM-DD'
}

export interface DailyWellnessProgress {
  date: string // 'YYYY-MM-DD'
  workStartTime?: number // timestamp of first interaction of day
  waterGlasses: number
  waterMl: number
  movementBreaks: number
  eyeBreaks: number
  stretchBreaks: number
  relaxBreaks: number
  postureChecks: number
  walkBreaks: number
  totalDone: number
  totalSkipped: number
  totalSnoozed: number
}

export interface ReminderHistoryItem {
  id: string
  reminderId: string
  reminderName: string
  reminderIcon: string
  action: 'done' | 'snooze' | 'skip'
  timestamp: number
  note?: string
}

export interface FocusModeConfig {
  active: boolean
  durationMinutes: number
  startedAt?: number
  endsAt?: number | null
}

export interface WellnessSettings {
  masterEnabled: boolean
  startHour: string // 'HH:mm', default '09:00'
  endHour: string   // 'HH:mm', default '22:00'
  activeDays: DayOfWeek[] // ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
  pausedUntil?: number | null // timestamp until which notifications are quieted
  pauseReason?: string
  focusMode?: FocusModeConfig
  waterTracker: WaterTrackerConfig
  mode202020Enabled?: boolean // Eye Break 20-20-20 countdown mode
  reminders: Record<string, WellnessReminderConfig>
  history: ReminderHistoryItem[]
  dailyProgress: Record<string, DailyWellnessProgress> // keyed by YYYY-MM-DD
}

export interface WellnessMessage {
  title: string
  body: string
}
