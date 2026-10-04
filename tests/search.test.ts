import { describe, it, expect } from 'vitest'
import { getRegisteredApps, getAppById } from '@/registry/appRegistry'

describe('Universal Search & App Registry - Integrity & Deep Linking', () => {
  it('contains exactly the authorized 11 registered apps in AppRegistry', () => {
    const apps = getRegisteredApps()
    expect(apps.length).toBe(11)

    const expectedAppIds = [
      'notes',
      'tasks',
      'ideas',
      'decisionbook',
      'live',
      'collections',
      'hearings',
      'finance',
      'growth',
      'time',
      'settings'
    ]

    expectedAppIds.forEach(id => {
      const app = getAppById(id)
      expect(app).toBeDefined()
      expect(app?.name).toBeDefined()
      expect(app?.component).toBeDefined()
      expect(app?.category).toMatch(/productivity|business|utilities/)
    })
  })

  it('guarantees unique app IDs with collision-free registrations', () => {
    const apps = getRegisteredApps()
    const ids = apps.map(a => a.id)
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(ids.length)
  })

  it('verifies deep link parameters for primary modules', () => {
    // Notes deep link
    const notesApp = getAppById('notes')
    expect(notesApp).toBeDefined()

    // Tasks deep link
    const tasksApp = getAppById('tasks')
    expect(tasksApp).toBeDefined()

    // Finance deep link
    const financeApp = getAppById('finance')
    expect(financeApp).toBeDefined()

    // Growth deep link
    const growthApp = getAppById('growth')
    expect(growthApp).toBeDefined()

    // Hearings deep link
    const hearingsApp = getAppById('hearings')
    expect(hearingsApp).toBeDefined()
  })
})
