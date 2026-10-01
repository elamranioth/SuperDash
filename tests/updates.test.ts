import { describe, it, expect } from 'vitest'
import { compareVersions, isUpdateAvailable } from '@/version'

describe('Update Engine - Semver Comparison & Update Availability', () => {
  it('correctly compares version numbers across major, minor, and patch', () => {
    expect(compareVersions('1.7.0', '1.6.0')).toBe(1)
    expect(compareVersions('1.6.0', '1.7.0')).toBe(-1)
    expect(compareVersions('1.7.0', '1.7.0')).toBe(0)

    // Patch version
    expect(compareVersions('1.7.1', '1.7.0')).toBe(1)
    expect(compareVersions('1.7.0', '1.7.1')).toBe(-1)

    // Major version
    expect(compareVersions('2.0.0', '1.9.9')).toBe(1)
    expect(compareVersions('1.9.9', '2.0.0')).toBe(-1)

    // Prefixed with 'v'
    expect(compareVersions('v1.8.0', '1.7.0')).toBe(1)
    expect(compareVersions('1.8.0', 'v1.7.0')).toBe(1)
    expect(compareVersions('v1.8.0', 'v1.8.0')).toBe(0)
  })

  it('determines whether an update is available', () => {
    // Newer remote build available
    expect(isUpdateAvailable('1.7.0', '1.8.0')).toBe(true)
    expect(isUpdateAvailable('1.7.0', '2.0.0')).toBe(true)

    // Current is already equal or newer
    expect(isUpdateAvailable('1.7.0', '1.7.0')).toBe(false)
    expect(isUpdateAvailable('1.7.0', '1.6.5')).toBe(false)
  })
})
