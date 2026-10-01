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

export const LIVE_MANIFEST_URL = 'https://elamranioth.github.io/SuperDash/updates/latest.json'
export const LIVE_HISTORY_URL = 'https://elamranioth.github.io/SuperDash/updates/history.json'
export const DEFAULT_APK_DOWNLOAD_URL = 'https://elamranioth.github.io/SuperDash/SuperDash.apk'

/**
 * Open external URL in system browser / Android download manager
 */
export function openApkDownload(url: string = DEFAULT_APK_DOWNLOAD_URL): void {
  if (typeof window === 'undefined') return
  try {
    // 1. Try window.open with _system (Capacitor Android launches native intent)
    const win = window.open(url, '_system')
    if (!win) {
      // 2. Direct anchor click fallback
      const a = document.createElement('a')
      a.href = url
      a.target = '_blank'
      a.rel = 'noopener noreferrer'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    }
  } catch (err) {
    console.error('[UpdateService] Failed to trigger download:', err)
    window.location.href = url
  }
}

export class UpdateService {
  private cachedLatest: ReleaseInfo | null = null

  /**
   * Fetch the latest update manifest.
   * Checks the live remote URL first so Android APK installs can discover updates.
   * Falls back to local bundled ./updates/latest.json when offline.
   */
  async checkForUpdates(): Promise<{
    updateAvailable: boolean
    currentVersion: string
    release: ReleaseInfo | null
    error?: string
  }> {
    let rawData: ReleaseInfo | null = null
    let fetchError: string | null = null

    // 1. First attempt: Live online manifest with 6-second timeout
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 6000)
      const res = await fetch(`${LIVE_MANIFEST_URL}?t=${Date.now()}`, {
        headers: { 'Cache-Control': 'no-cache' },
        signal: controller.signal
      })
      clearTimeout(timeoutId)
      if (res.ok) {
        rawData = await res.json()
      }
    } catch (e: unknown) {
      console.warn('[UpdateService] Live manifest fetch failed, falling back to local asset:', e)
      fetchError = e instanceof Error ? e.message : 'Network error'
    }

    // 2. Fallback: local relative manifest (for offline use or local development)
    if (!rawData) {
      try {
        const res = await fetch(`./updates/latest.json?t=${Date.now()}`, {
          headers: { 'Cache-Control': 'no-cache' }
        })
        if (res.ok) {
          rawData = await res.json()
          fetchError = null
        }
      } catch (localErr) {
        console.warn('[UpdateService] Local manifest fetch failed:', localErr)
      }
    }

    if (!rawData) {
      if (this.cachedLatest) {
        return {
          updateAvailable: isUpdateAvailable(SUPERDASH_VERSION, this.cachedLatest.version),
          currentVersion: SUPERDASH_VERSION,
          release: this.cachedLatest,
          error: fetchError ? `Offline mode: ${fetchError}` : undefined
        }
      }
      return {
        updateAvailable: false,
        currentVersion: SUPERDASH_VERSION,
        release: null,
        error: fetchError || 'Unable to check for updates'
      }
    }

    // Ensure valid APK download URLs (normalize away any 404 GitHub releases links)
    if (!rawData.apkDownloadUrl || rawData.apkDownloadUrl.includes('releases/latest') || rawData.apkDownloadUrl.includes('github.com')) {
      rawData.apkDownloadUrl = DEFAULT_APK_DOWNLOAD_URL
    }
    if (!rawData.downloadUrl || rawData.downloadUrl.includes('releases/latest')) {
      rawData.downloadUrl = DEFAULT_APK_DOWNLOAD_URL
    }

    this.cachedLatest = rawData
    const available = isUpdateAvailable(SUPERDASH_VERSION, rawData.version)

    return {
      updateAvailable: available,
      currentVersion: SUPERDASH_VERSION,
      release: rawData,
      error: fetchError || undefined
    }
  }

  /**
   * Fetch historical release records.
   * Tries remote first, falls back to local.
   */
  async getReleaseHistory(): Promise<HistoricalRelease[]> {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 6000)
      const res = await fetch(`${LIVE_HISTORY_URL}?t=${Date.now()}`, {
        headers: { 'Cache-Control': 'no-cache' },
        signal: controller.signal
      })
      clearTimeout(timeoutId)
      if (res.ok) return await res.json()
    } catch {
      // fallback to local
    }

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
   * Download APK with real progress callbacks.
   */
  async downloadApkWithProgress(
    url: string,
    onProgress: (loaded: number, total: number, percentage: number) => void
  ): Promise<Blob> {
    const downloadUrl = url || DEFAULT_APK_DOWNLOAD_URL
    const response = await fetch(downloadUrl)
    if (!response.ok) {
      throw new Error(`Download failed: server returned status ${response.status}`)
    }

    const contentLength = response.headers.get('content-length')
    const total = contentLength ? parseInt(contentLength, 10) : 0

    if (!response.body) {
      const blob = await response.blob()
      onProgress(blob.size, blob.size, 100)
      return blob
    }

    const reader = response.body.getReader()
    const chunks: BlobPart[] = []
    let loaded = 0

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      if (value) {
        chunks.push(value)
        loaded += value.length
        const pct = total > 0 ? Math.min(100, Math.round((loaded / total) * 100)) : 50
        onProgress(loaded, total || loaded, pct)
      }
    }

    onProgress(loaded, total || loaded, 100)
    return new Blob(chunks, { type: 'application/vnd.android.package-archive' })
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
