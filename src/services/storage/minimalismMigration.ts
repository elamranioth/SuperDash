import { storageService, DEFAULT_SETTINGS } from '@/services/storage'
import { TaskItem, ReminderItem, DashboardSettings } from '@/types'

const MIGRATION_KEY = 'migration_minimalism_v1'

export async function runMinimalismMigration(): Promise<{ migrated: boolean; remindersImported: number }> {
  try {
    const alreadyMigrated = await storageService.get<boolean>(MIGRATION_KEY, false)
    if (alreadyMigrated) {
      return { migrated: false, remindersImported: 0 }
    }

    console.log('[SuperDash] Running Minimalism Refactor Migration...')

    // 1. Migrate Reminders into Tasks
    let remindersImported = 0
    const existingTasks = await storageService.get<TaskItem[]>('tasks', [])
    const existingReminders = await storageService.get<ReminderItem[]>('reminders_list', [])

    if (existingReminders.length > 0) {
      const taskIds = new Set(existingTasks.map(t => t.id))
      const taskTitles = new Set(existingTasks.map(t => t.title.toLowerCase().trim()))
      const newTasksToAdd: TaskItem[] = []

      for (const rem of existingReminders) {
        const derivedId = `task-${rem.id}`
        // Avoid duplicate if same ID or exact title already exists
        if (!taskIds.has(derivedId) && !taskTitles.has(rem.title.toLowerCase().trim())) {
          newTasksToAdd.push({
            id: derivedId,
            title: rem.title,
            completed: rem.completed,
            priority: rem.priority || 'medium',
            dueDate: rem.date,
            reminderTime: rem.time || '09:00',
            notes: rem.notes || '',
            repeat: rem.repeat || 'none',
            hasReminder: true,
            tag: 'Reminder',
            createdAt: rem.createdAt || Date.now()
          })
          remindersImported++
        }
      }

      if (newTasksToAdd.length > 0) {
        const combinedTasks = [...existingTasks, ...newTasksToAdd]
        await storageService.set('tasks', combinedTasks)
        console.log(`[SuperDash] Migrated ${remindersImported} reminders into Tasks.`)
      }
    }

    // 2. Normalize Dashboard Settings (App IDs & Order)
    const settings = await storageService.get<DashboardSettings>('settings', DEFAULT_SETTINGS)
    const appMap: Record<string, string> = {
      converter: 'calculator',
      reminders: 'tasks',
      timer: 'time',
      focus: 'time',
      worldclock: 'time',
      dashboardbuilder: 'settings',
      updates: 'settings',
      morning: 'calendar'
    }

    const mapList = (list: string[] = []): string[] => {
      const seen = new Set<string>()
      const result: string[] = []
      for (const id of list) {
        const mapped = appMap[id] || id
        // Exclude system features that are now internal to settings/dashboard
        if (mapped === 'morning' || mapped === 'updates' || mapped === 'dashboardbuilder') {
          continue
        }
        if (!seen.has(mapped)) {
          seen.add(mapped)
          result.push(mapped)
        }
      }
      return result
    }

    const updatedSettings: DashboardSettings = {
      ...settings,
      appOrder: mapList(settings.appOrder),
      favoriteAppIds: mapList(settings.favoriteAppIds),
      recentAppIds: mapList(settings.recentAppIds),
      hiddenAppIds: mapList(settings.hiddenAppIds)
    }

    await storageService.set('settings', updatedSettings)

    // Mark migration as done
    await storageService.set(MIGRATION_KEY, true)
    console.log('[SuperDash] Minimalism migration successfully applied.')
    return { migrated: true, remindersImported }
  } catch (err) {
    console.error('[SuperDash] Minimalism migration error:', err)
    return { migrated: false, remindersImported: 0 }
  }
}
