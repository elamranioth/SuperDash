import {
  SUPERDASH_VERSION,
  isUpdateAvailable
} from '@/version'

export type ChangeType = 'NEW' | 'IMPROVED' | 'FIXED'

export interface AppChange {
  appId: string
  appName: string
  type: ChangeType
  description: string
}

export interface ReleaseInfo {
  version: string
  releaseDate: string
  title: string
  summary: string
  minAppVersion?: string
  downloadUrl?: string
  apkDownloadUrl?: string
  highlights: string[]
  changes: AppChange[]
}

export interface HistoricalRelease {
  version: string
  releaseDate: string
  title: string
  summary: string
  highlights: string[]
}

const LAST_VIEWED_VERSION_KEY = 'superdash_last_viewed_update_version'

export class UpdateService {
  private cachedLatest: ReleaseInfo | null = null

  /**
   * Fetch the latest update manifest from /updates/latest.json
   */
  async checkForUpdates(): Promise<{
    updateAvailable: boolean
    currentVersion: string
    release: ReleaseInfo | null
    error?: string
  }> {
    try {
      // Add cache buster query parameter
      const res = await fetch(`./updates/latest.json?t=${Date.now()}`, {
        headers: { 'Cache-Control': 'no-cache' }
      })
      if (!res.ok) {
        throw new Error(`Failed to fetch update manifest (status: ${res.status})`)
      }
      const data: ReleaseInfo = await res.json()
      this.cachedLatest = data

      const available = isUpdateAvailable(SUPERDASH_VERSION, data.version)
      return {
        updateAvailable: available,
        currentVersion: SUPERDASH_VERSION,
        release: data
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown network error'
      // If cached data is available, return that with error notice
      if (this.cachedLatest) {
        return {
          updateAvailable: isUpdateAvailable(SUPERDASH_VERSION, this.cachedLatest.version),
          currentVersion: SUPERDASH_VERSION,
          release: this.cachedLatest,
          error: `Offline mode: ${message}`
        }
      }
      return {
        updateAvailable: false,
        currentVersion: SUPERDASH_VERSION,
        release: null,
        error: message
      }
    }
  }

  /**
   * Fetch historical release records from /updates/history.json
   */
  async getReleaseHistory(): Promise<HistoricalRelease[]> {
    try {
      const res = await fetch(`./updates/history.json?t=${Date.now()}`, {
        headers: { 'Cache-Control': 'no-cache' }
      })
      if (!res.ok) return []
      return await res.json()
    } catch {
      return []
    }
  }

  /**
   * Trigger Service Worker update if in PWA/Web environment
   */
  async triggerPwaUpdate(): Promise<boolean> {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return false
    }

    try {
      const registration = await navigator.serviceWorker.getRegistration()
      if (registration) {
        if (registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' })
          window.location.reload()
          return true
        }
        await registration.update()
        return true
      }
    } catch (err) {
      console.warn('Failed to update service worker:', err)
    }
    return false
  }

  /**
   * Check if user has viewed the notes for the current version
   */
  hasUnreadUpdates(): boolean {
    if (typeof window === 'undefined') return false
    const lastViewed = localStorage.getItem(LAST_VIEWED_VERSION_KEY)
    if (!lastViewed) return true
    return lastViewed !== SUPERDASH_VERSION
  }

  /**
   * Mark current version updates as viewed
   */
  markUpdatesAsViewed(version: string = SUPERDASH_VERSION): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(LAST_VIEWED_VERSION_KEY, version)
    window.dispatchEvent(new CustomEvent('superdash_updates_viewed', { detail: { version } }))
  }

  /**
   * Get list of app IDs that have changes in the current version
   */
  getRecentlyUpdatedAppIds(release: ReleaseInfo | null): string[] {
    if (!release?.changes) return []
    return release.changes.map(c => c.appId)
  }
}

export const updateService = new UpdateService()
