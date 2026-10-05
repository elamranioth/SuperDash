import { describe, it, expect, beforeEach } from 'vitest'
import {
  wellnessService,
  DEFAULT_WELLNESS_SETTINGS,
  WELLNESS_MESSAGES,
  getRandomWellnessMessage,
  MICRO_STRETCHES,
  getRandomMicroStretch
} from '@/services/wellness'
import { storageService } from '@/services/storage'

describe('Wellness Reminders Service', () => {
  beforeEach(async () => {
    // Reset storage before each test
    await storageService.set('superdash_wellness_settings', DEFAULT_WELLNESS_SETTINGS)
  })

  it('loads default settings with core desk reminders, water tracker, and disabled master', async () => {
    const settings = await wellnessService.getSettings()

    expect(settings.masterEnabled).toBe(false)
    expect(settings.startHour).toBe('09:00')
    expect(settings.endHour).toBe('22:00')
    expect(settings.activeDays.length).toBe(7)

    // Check desk reminders
    expect(settings.reminders.water).toBeDefined()
    expect(settings.reminders.water.intervalMinutes).toBe(60)

    expect(settings.reminders.eyes).toBeDefined()
    expect(settings.reminders.eyes.intervalMinutes).toBe(45)

    expect(settings.reminders.stand).toBeDefined()
    expect(settings.reminders.stand.intervalMinutes).toBe(60)

    expect(settings.reminders.stretch).toBeDefined()
    expect(settings.reminders.stretch.intervalMinutes).toBe(120)

    expect(settings.reminders.breathing).toBeDefined()
    expect(settings.reminders.breathing.intervalMinutes).toBe(120)

    expect(settings.reminders.relax).toBeDefined()
    expect(settings.reminders.relax.intervalMinutes).toBe(180)

    expect(settings.reminders.posture).toBeDefined()
    expect(settings.reminders.walk).toBeDefined()

    // Water tracker defaults
    expect(settings.waterTracker).toBeDefined()
    expect(settings.waterTracker.dailyTargetMl).toBe(2000)
    expect(settings.waterTracker.glassSizeMl).toBe(250)
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
      endHour: '22:00',
      activeDays: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as any
    }

    // Inside window: 14:30 (2:30 PM) on a Monday
    const insideDate = new Date(2026, 9, 5, 14, 30)
    expect(wellnessService.isWithinActiveHours(settings, insideDate)).toBe(true)

    // Outside window: 23:00 (11:00 PM)
    const lateDate = new Date(2026, 9, 5, 23, 0)
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

  it('tracks water intake and logs glasses accurately', async () => {
    await wellnessService.setWaterGoal(2500, 250)
    await wellnessService.addWaterGlass(250)
    await wellnessService.addWaterGlass(250)

    const settings = await wellnessService.getSettings()
    expect(settings.waterTracker.currentMl).toBe(500)
    expect(settings.waterTracker.dailyTargetMl).toBe(2500)
  })

  it('calculates the next upcoming reminder accurately', async () => {
    await wellnessService.setMasterEnabled(true)
    const settings = await wellnessService.getSettings()

    const next = wellnessService.calculateNextReminder(settings)
    expect(next.reminder).not.toBeNull()
    expect(next.dueTimestamp).toBeGreaterThan(0)
    expect(next.minutesRemaining).toBeGreaterThanOrEqual(0)
  })

  it('supports custom reminders creation and deletion', async () => {
    await wellnessService.saveCustomReminder({
      name: 'Coffee Break',
      icon: '☕',
      intervalMinutes: 180,
      enabled: true
    })

    let settings = await wellnessService.getSettings()
    const customKey = Object.keys(settings.reminders).find(k => settings.reminders[k].name === 'Coffee Break')
    expect(customKey).toBeDefined()
    expect(settings.reminders[customKey!].icon).toBe('☕')

    // Delete
    await wellnessService.deleteCustomReminder(customKey!)
    settings = await wellnessService.getSettings()
    expect(settings.reminders[customKey!]).toBeUndefined()
  })

  it('provides rotating micro stretches and messages', () => {
    expect(MICRO_STRETCHES.length).toBeGreaterThanOrEqual(6)
    const stretchMsg = getRandomMicroStretch()
    expect(stretchMsg.length).toBeGreaterThan(5)

    const categories = ['water', 'breathing', 'stand', 'stretch', 'eyes', 'relax', 'posture', 'walk'] as const
    categories.forEach(cat => {
      const messages = WELLNESS_MESSAGES[cat]
      expect(messages.length).toBeGreaterThanOrEqual(3)

      const randomMsg = getRandomWellnessMessage(cat)
      expect(randomMsg.title).toBeDefined()
      expect(randomMsg.body).toBeDefined()
    })
  })
})
