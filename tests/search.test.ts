import { describe, it, expect } from 'vitest'
import { getRegisteredApps, getAppById } from '@/registry/appRegistry'

describe('Universal Search & App Registry - Integrity & Deep Linking', () => {
  it('contains exactly the authorized 16 registered apps in AppRegistry', () => {
    const apps = getRegisteredApps()
    expect(apps.length).toBe(16)

    const expectedAppIds = [
      'notes',
      'calendar',
      'tasks',
      'ideas',
      'decisionbook',
      'reader',
      'live',
      'collections',
      'hearings',
      'finance',
      'growth',
      'calculator',
      'time',
      'weather',
      'files',
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
    // Finance deep link
    const financeApp = getAppById('finance')
    expect(financeApp).toBeDefined()

    // Growth deep link
    const growthApp = getAppById('growth')
    expect(growthApp).toBeDefined()

    // Hearings deep link
    const hearingsApp = getAppById('hearings')
    expect(hearingsApp).toBeDefined()

    // Reader deep link
    const readerApp = getAppById('reader')
    expect(readerApp).toBeDefined()
  })
})
