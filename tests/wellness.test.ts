import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  wellnessService,
  DEFAULT_WELLNESS_SETTINGS,
  WELLNESS_MESSAGES,
  getRandomWellnessMessage
} from '@/services/wellness'
import { storageService } from '@/services/storage'

describe('Wellness Reminders Service', () => {
  beforeEach(async () => {
    // Reset storage before each test
    await storageService.set('superdash_wellness_settings', DEFAULT_WELLNESS_SETTINGS)
  })

  it('loads default settings with 6 desk reminders and disabled master by default', async () => {
    const settings = await wellnessService.getSettings()

    expect(settings.masterEnabled).toBe(false)
    expect(settings.startHour).toBe('09:00')
    expect(settings.endHour).toBe('19:00')
    expect(settings.activeDays.length).toBe(7)

    // Check all 6 core desk reminders
    expect(settings.reminders.water).toBeDefined()
    expect(settings.reminders.water.intervalMinutes).toBe(60)

    expect(settings.reminders.breathing).toBeDefined()
    expect(settings.reminders.breathing.intervalMinutes).toBe(90)

    expect(settings.reminders.stand).toBeDefined()
    expect(settings.reminders.stand.intervalMinutes).toBe(60)

    expect(settings.reminders.stretch).toBeDefined()
    expect(settings.reminders.stretch.intervalMinutes).toBe(120)

    expect(settings.reminders.eyes).toBeDefined()
    expect(settings.reminders.eyes.intervalMinutes).toBe(45)

    expect(settings.reminders.relax).toBeDefined()
    expect(settings.reminders.relax.intervalMinutes).toBe(180)
  })

  it('updates intervals and retains customized values', async () => {
    await wellnessService.updateReminderInterval('water', 30)
    await wellnessService.updateReminderInterval('stretch', 90)

    const updated = await wellnessService.getSettings()
    expect(updated.reminders.water.intervalMinutes).toBe(30)
    expect(updated.reminders.stretch.intervalMinutes).toBe(90)
    expect(updated.reminders.water.lastTriggeredAt).toBeDefined()
  })

  it('correctly toggles master and individual reminders', async () => {
    // Toggle individual reminder
    await wellnessService.toggleReminder('breathing', false)
    let settings = await wellnessService.getSettings()
    expect(settings.reminders.breathing.enabled).toBe(false)

    // Toggle master
    await wellnessService.setMasterEnabled(true)
    settings = await wellnessService.getSettings()
    expect(settings.masterEnabled).toBe(true)

    // Breathing remains individually disabled
    expect(settings.reminders.breathing.enabled).toBe(false)
    // Water remains enabled
    expect(settings.reminders.water.enabled).toBe(true)
  })

  it('evaluates active hours window correctly', () => {
    const settings = {
      ...DEFAULT_WELLNESS_SETTINGS,
      startHour: '09:00',
      endHour: '19:00',
      activeDays: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as any
    }

    // Inside window: 14:30 (2:30 PM) on a Monday
    const insideDate = new Date(2026, 9, 5, 14, 30) // Monday
    expect(wellnessService.isWithinActiveHours(settings, insideDate)).toBe(true)

    // Outside window: 21:00 (9:00 PM)
    const lateDate = new Date(2026, 9, 5, 21, 0)
    expect(wellnessService.isWithinActiveHours(settings, lateDate)).toBe(false)

    // Outside window: 07:30 (7:30 AM)
    const earlyDate = new Date(2026, 9, 5, 7, 30)
    expect(wellnessService.isWithinActiveHours(settings, earlyDate)).toBe(false)

    // Inactive day test
    const weekdaysOnly = {
      ...settings,
      activeDays: ['mon', 'tue', 'wed', 'thu', 'fri'] as any
    }
    const sundayDate = new Date(2026, 9, 4, 14, 30) // Sunday
    expect(wellnessService.isWithinActiveHours(weekdaysOnly, sundayDate)).toBe(false)
  })

  it('manages pause mode with auto-expiry correctly', async () => {
    // Pause for 60 minutes
    await wellnessService.pauseReminders(60)
    let settings = await wellnessService.getSettings()

    expect(wellnessService.isPaused(settings)).toBe(true)
    expect(settings.pausedUntil).toBeGreaterThan(Date.now())

    // Resume reminders
    await wellnessService.resumeReminders()
    settings = await wellnessService.getSettings()
    expect(wellnessService.isPaused(settings)).toBe(false)
    expect(settings.pausedUntil).toBeNull()
  })

  it('provides rotating notification messages for all reminder categories', () => {
    const categories = ['water', 'breathing', 'stand', 'stretch', 'eyes', 'relax'] as const

    categories.forEach(cat => {
      const messages = WELLNESS_MESSAGES[cat]
      expect(messages.length).toBeGreaterThanOrEqual(3)

      const randomMsg = getRandomWellnessMessage(cat)
      expect(randomMsg.title).toBeDefined()
      expect(randomMsg.body).toBeDefined()
      expect(randomMsg.title.length).toBeGreaterThan(0)
    })
  })
})
