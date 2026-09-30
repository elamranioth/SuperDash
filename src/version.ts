export const SUPERDASH_VERSION = '1.5.0'
export const SUPERDASH_BUILD_DATE = '2026-09-30'
export const SUPERDASH_CHANNEL = 'stable'
export const SUPERDASH_GITHUB_REPO = 'elamranioth/SuperDash'

export type AppPlatform = 'android' | 'pwa' | 'web'

export function getAppPlatform(): AppPlatform {
  if (typeof window === 'undefined') return 'web'
  // Capacitor Android detection
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cap = (window as any).Capacitor
  if (cap?.getPlatform?.() === 'android' || cap?.isNativePlatform?.()) {
    return 'android'
  }
  // PWA standalone display-mode detection
  if (
    window.matchMedia('(display-mode: standalone)').matches ||
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window.navigator as any).standalone === true
  ) {
    return 'pwa'
  }
  return 'web'
}

/**
 * Compare two semver strings like "1.5.0" and "1.4.2".
 * Returns 1 if v1 > v2, -1 if v1 < v2, 0 if equal.
 */
export function compareVersions(v1: string, v2: string): number {
  const parts1 = v1.replace(/^v/, '').split('.').map(p => parseInt(p, 10) || 0)
  const parts2 = v2.replace(/^v/, '').split('.').map(p => parseInt(p, 10) || 0)
  const maxLen = Math.max(parts1.length, parts2.length)
  for (let i = 0; i < maxLen; i++) {
    const a = parts1[i] || 0
    const b = parts2[i] || 0
    if (a > b) return 1
    if (a < b) return -1
  }
  return 0
}

export function isUpdateAvailable(currentVersion: string, latestVersion: string): boolean {
  return compareVersions(latestVersion, currentVersion) > 0
}
