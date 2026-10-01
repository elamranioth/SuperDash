import { storageService } from '@/services/storage'
import { SUPERDASH_VERSION } from '@/version'

export const STORAGE_SCHEMA_VERSION = 10
export const BACKUP_FORMAT_VERSION = 1

export interface BackupManifest {
  backupVersion: number
  superDashVersion: string
  schemaVersion: number
  createdAt: string
  checksum: string
  modules: Record<string, number>
}

export interface BackupPackage {
  manifest: BackupManifest
  data: Record<string, unknown>
}

export type AutoBackupFrequency = 'daily' | 'weekly' | 'manual'

export interface BackupSettings {
  autoBackup: AutoBackupFrequency
  lastBackupDate?: string
  lastBackupSize?: number
  lastBackupLocation?: string
  lastBackupStatus?: 'success' | 'failed'
  lastBackupError?: string
}

export const DEFAULT_BACKUP_SETTINGS: BackupSettings = {
  autoBackup: 'daily',
  lastBackupLocation: 'Browser / Downloads'
}

const SETTINGS_KEY = 'backup_settings'
const PRE_RESTORE_KEY = 'superdash_pre_restore_snapshot'
const IDB_NAME = 'SuperDashBackupDB'
const IDB_STORE = 'handles'
const IDB_HANDLE_KEY = 'backup_folder_handle'

// ─── IndexedDB Helper for File System Access API Directory Handle ────────────

function openBackupDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      return reject(new Error('IndexedDB not supported'))
    }
    const req = indexedDB.open(IDB_NAME, 1)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE)
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

async function saveFolderHandle(handle: FileSystemDirectoryHandle): Promise<void> {
  try {
    const db = await openBackupDB()
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, 'readwrite')
      const store = tx.objectStore(IDB_STORE)
      const req = store.put(handle, IDB_HANDLE_KEY)
      req.onsuccess = () => resolve()
      req.onerror = () => reject(req.error)
    })
  } catch (err) {
    console.warn('[BackupService] Could not store directory handle in IndexedDB:', err)
  }
}

async function getFolderHandle(): Promise<FileSystemDirectoryHandle | null> {
  try {
    const db = await openBackupDB()
    return await new Promise<FileSystemDirectoryHandle | null>((resolve) => {
      const tx = db.transaction(IDB_STORE, 'readonly')
      const store = tx.objectStore(IDB_STORE)
      const req = store.get(IDB_HANDLE_KEY)
      req.onsuccess = () => resolve((req.result as FileSystemDirectoryHandle) || null)
      req.onerror = () => resolve(null)
    })
  } catch {
    return null
  }
}

async function clearFolderHandle(): Promise<void> {
  try {
    const db = await openBackupDB()
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, 'readwrite')
      const store = tx.objectStore(IDB_STORE)
      const req = store.delete(IDB_HANDLE_KEY)
      req.onsuccess = () => resolve()
      req.onerror = () => reject(req.error)
    })
  } catch {
    // ignore
  }
}

// ─── Simple Hash for Checksum ────────────────────────────────────────────────

async function computeChecksum(content: string): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    try {
      const encoder = new TextEncoder()
      const data = encoder.encode(content)
      const hashBuffer = await crypto.subtle.digest('SHA-256', data)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    } catch {
      // fallback below
    }
  }
  // Simple deterministic fallback hash
  let hash = 0
  for (let i = 0; i < content.length; i++) {
    hash = (hash << 5) - hash + content.charCodeAt(i)
    hash |= 0
  }
  return 'fb_' + Math.abs(hash).toString(16)
}

// ─── Module Record Counter ───────────────────────────────────────────────────

function countItems(val: unknown): number {
  if (!val) return 0
  if (Array.isArray(val)) return val.length
  if (typeof val === 'object') return Object.keys(val).length
  return 1
}

function computeModuleStats(data: Record<string, unknown>): Record<string, number> {
  const counts: Record<string, number> = {}

  if (data.notes_list || data.notes) counts.notes = countItems(data.notes_list || data.notes)
  if (data.tasks) counts.tasks = countItems(data.tasks)
  if (data.calendar_events) counts.calendar = countItems(data.calendar_events)

  let financeCount = 0
  if (data.finance_clients) financeCount += countItems(data.finance_clients)
  if (data.finance_invoices) financeCount += countItems(data.finance_invoices)
  if (data.finance_payments) financeCount += countItems(data.finance_payments)
  if (data.finance_expenses) financeCount += countItems(data.finance_expenses)
  if (financeCount > 0) counts.finance = financeCount

  if (data.hearings_cases) counts.hearings = countItems(data.hearings_cases)
  if (data.ideas_list || data.ideas) counts.ideas = countItems(data.ideas_list || data.ideas)
  if (data.decision_book_records) counts.decisionbook = countItems(data.decision_book_records)
  if (data.reader_articles) counts.reader = countItems(data.reader_articles)

  let liveCount = 0
  if (data.live_memories) liveCount += countItems(data.live_memories)
  if (data.live_people) liveCount += countItems(data.live_people)
  if (data.live_letters) liveCount += countItems(data.live_letters)
  if (liveCount > 0) counts.live = liveCount

  if (data.collections_items) counts.collections = countItems(data.collections_items)

  let growthCount = 0
  if (data.growth_leads) growthCount += countItems(data.growth_leads)
  if (data.growth_client_relationships) growthCount += countItems(data.growth_client_relationships)
  if (data.growth_campaigns) growthCount += countItems(data.growth_campaigns)
  if (growthCount > 0) counts.growth = growthCount

  if (data.settings) counts.settings = 1

  return counts
}

// ─── Filter Out Sensitive Secrets ────────────────────────────────────────────

function sanitizeDataForBackup(raw: Record<string, unknown>): Record<string, unknown> {
  const clean: Record<string, unknown> = {}
  const blacklistedTokens = ['token', 'secret', 'password', 'private_key', 'keystore', 'credential']

  for (const [key, value] of Object.entries(raw)) {
    const lowerKey = key.toLowerCase()
    const isSensitive = blacklistedTokens.some(token => lowerKey.includes(token))
    if (!isSensitive) {
      clean[key] = value
    }
  }

  return clean
}

// ─── BackupService Class ─────────────────────────────────────────────────────

export class BackupService {
  /**
   * Get current backup configuration
   */
  async getSettings(): Promise<BackupSettings> {
    return await storageService.get<BackupSettings>(SETTINGS_KEY, DEFAULT_BACKUP_SETTINGS)
  }

  /**
   * Save backup configuration
   */
  async saveSettings(settings: Partial<BackupSettings>): Promise<BackupSettings> {
    const current = await this.getSettings()
    const updated = { ...current, ...settings }
    await storageService.set(SETTINGS_KEY, updated)
    return updated
  }

  /**
   * Generate complete structured backup package
   */
  async generateBackupPackage(): Promise<BackupPackage> {
    const rawData = await storageService.exportAll()
    const cleanData = sanitizeDataForBackup(rawData)
    const moduleCounts = computeModuleStats(cleanData)
    const dataString = JSON.stringify(cleanData)
    const checksum = await computeChecksum(dataString)

    const manifest: BackupManifest = {
      backupVersion: BACKUP_FORMAT_VERSION,
      superDashVersion: SUPERDASH_VERSION,
      schemaVersion: STORAGE_SCHEMA_VERSION,
      createdAt: new Date().toISOString(),
      checksum,
      modules: moduleCounts
    }

    return {
      manifest,
      data: cleanData
    }
  }

  /**
   * Check if File System Access API is supported (e.g. Chrome, Edge, desktop browser)
   */
  isFileSystemAccessSupported(): boolean {
    return typeof window !== 'undefined' && 'showDirectoryPicker' in window
  }

  /**
   * User chooses local backup folder (e.g., MEGA Sync synchronized folder)
   */
  async chooseBackupFolder(): Promise<{ success: boolean; folderName?: string; error?: string }> {
    if (!this.isFileSystemAccessSupported()) {
      return { success: false, error: 'Local folder access is not supported on this browser or platform.' }
    }

    try {
      // @ts-expect-error - File System Access API
      const handle = (await window.showDirectoryPicker({
        id: 'superdash-backup',
        mode: 'readwrite'
      })) as FileSystemDirectoryHandle

      await saveFolderHandle(handle)
      const folderName = handle.name || 'Selected Folder'

      await this.saveSettings({
        lastBackupLocation: `MEGA Sync / ${folderName}`
      })

      return { success: true, folderName }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        return { success: false, error: 'Selection cancelled' }
      }
      return { success: false, error: err instanceof Error ? err.message : 'Could not access folder' }
    }
  }

  /**
   * Disconnect the configured backup directory handle
   */
  async disconnectBackupFolder(): Promise<void> {
    await clearFolderHandle()
    await this.saveSettings({
      lastBackupLocation: 'Browser / Downloads'
    })
  }

  /**
   * Perform a backup operation.
   * If a folder handle is connected (MEGA folder), writes directly into it with 7-day retention.
   * If on Android or no folder handle, offers file download / share.
   */
  async performBackup(): Promise<{
    success: boolean
    filename: string
    fileSize: number
    location: string
    error?: string
  }> {
    try {
      const pkg = await this.generateBackupPackage()
      const content = JSON.stringify(pkg, null, 2)
      const datePart = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 16)
      const filename = `SuperDash-Backup-${datePart}.superdash`
      const fileSize = new Blob([content]).size

      // 1. Try Writing into Connected Directory Handle (MEGA folder)
      const handle = await getFolderHandle()
      if (handle) {
        try {
          // Verify permission
          // @ts-expect-error - File System Access API
          let perm = await handle.queryPermission({ mode: 'readwrite' })
          if (perm !== 'granted') {
            // @ts-expect-error - File System Access API
            perm = await handle.requestPermission({ mode: 'readwrite' })
          }

          if (perm === 'granted') {
            // Write file
            const fileHandle = await handle.getFileHandle(filename, { create: true })
            const writable = await fileHandle.createWritable()
            await writable.write(content)
            await writable.close()

            // Apply retention: keep last 7 SuperDash backups in that directory
            await this.applyRetention(handle)

            const location = `MEGA Sync / ${handle.name}`
            await this.saveSettings({
              lastBackupDate: new Date().toISOString(),
              lastBackupSize: fileSize,
              lastBackupLocation: location,
              lastBackupStatus: 'success',
              lastBackupError: undefined
            })

            return { success: true, filename, fileSize, location }
          }
        } catch (handleErr) {
          console.warn('[BackupService] Folder write failed, falling back to download:', handleErr)
        }
      }

      // 2. Mobile Android Web Share API (if available and user can share to MEGA or Files)
      if (typeof navigator !== 'undefined' && navigator.share && navigator.canShare) {
        try {
          const file = new File([content], filename, { type: 'application/json' })
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              title: 'SuperDash Backup',
              text: `SuperDash Backup ${new Date().toLocaleDateString()}`,
              files: [file]
            })

            const location = 'Shared to Android / MEGA'
            await this.saveSettings({
              lastBackupDate: new Date().toISOString(),
              lastBackupSize: fileSize,
              lastBackupLocation: location,
              lastBackupStatus: 'success',
              lastBackupError: undefined
            })

            return { success: true, filename, fileSize, location }
          }
        } catch {
          // User may have dismissed share or platform failed; fallback to download
        }
      }

      // 3. Fallback: Browser Download
      const blob = new Blob([content], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      const location = 'Downloads / Local File'
      await this.saveSettings({
        lastBackupDate: new Date().toISOString(),
        lastBackupSize: fileSize,
        lastBackupLocation: location,
        lastBackupStatus: 'success',
        lastBackupError: undefined
      })

      return { success: true, filename, fileSize, location }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Backup failed'
      await this.saveSettings({
        lastBackupStatus: 'failed',
        lastBackupError: msg
      })
      return {
        success: false,
        filename: '',
        fileSize: 0,
        location: '',
        error: msg
      }
    }
  }

  /**
   * Clean up older SuperDash backups (retain up to 7 most recent)
   */
  private async applyRetention(dirHandle: FileSystemDirectoryHandle): Promise<void> {
    try {
      const backupEntries: { name: string }[] = []
      for await (const entry of dirHandle.values()) {
        if (entry.kind === 'file' && entry.name.startsWith('SuperDash-Backup-') && entry.name.endsWith('.superdash')) {
          backupEntries.push({ name: entry.name })
        }
      }

      // Sort newest to oldest
      backupEntries.sort((a, b) => b.name.localeCompare(a.name))

      // Keep 7, remove older
      if (backupEntries.length > 7) {
        const toDelete = backupEntries.slice(7)
        for (const item of toDelete) {
          try {
            await dirHandle.removeEntry(item.name)
          } catch {
            // ignore failure on individual file
          }
        }
      }
    } catch (err) {
      console.warn('[BackupService] Retention cleanup notice:', err)
    }
  }

  /**
   * Inspect and validate a backup file before restoring
   */
  async inspectBackup(content: string): Promise<{
    valid: boolean
    pkg?: BackupPackage
    manifest?: BackupManifest
    error?: string
  }> {
    try {
      const parsed = JSON.parse(content)

      // Format check: either BackupPackage or legacy raw export
      if (parsed.manifest && parsed.data) {
        const pkg = parsed as BackupPackage
        if (!pkg.manifest.backupVersion || !pkg.manifest.modules) {
          return { valid: false, error: 'Invalid backup manifest structure' }
        }
        return { valid: true, pkg, manifest: pkg.manifest }
      }

      // Legacy direct storage export format fallback
      if (typeof parsed === 'object' && parsed !== null) {
        const moduleCounts = computeModuleStats(parsed)
        const manifest: BackupManifest = {
          backupVersion: 1,
          superDashVersion: 'legacy',
          schemaVersion: 1,
          createdAt: new Date().toISOString(),
          checksum: 'legacy',
          modules: moduleCounts
        }
        const pkg: BackupPackage = {
          manifest,
          data: parsed
        }
        return { valid: true, pkg, manifest }
      }

      return { valid: false, error: 'File does not contain valid SuperDash data' }
    } catch (err: unknown) {
      return { valid: false, error: err instanceof Error ? err.message : 'Invalid JSON file' }
    }
  }

  /**
   * Restore from a validated backup package.
   * Creates a safety recovery snapshot before touching current state.
   */
  async restoreBackup(pkg: BackupPackage): Promise<{ success: boolean; error?: string }> {
    let recoverySnapshot: Record<string, unknown> | null = null

    try {
      // 1. Create Safety Recovery Snapshot
      recoverySnapshot = await storageService.exportAll()
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(PRE_RESTORE_KEY, JSON.stringify(recoverySnapshot))
      }

      // 2. Import New State
      await storageService.importAll(pkg.data)

      return { success: true }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Restore failed'
      // Revert if possible
      if (recoverySnapshot) {
        try {
          await storageService.importAll(recoverySnapshot)
        } catch {
          // secondary error
        }
      }
      return { success: false, error: msg }
    }
  }

  /**
   * Check if automatic backup is due (run on app startup)
   */
  async checkAutomaticBackupDue(): Promise<boolean> {
    const settings = await this.getSettings()
    if (settings.autoBackup === 'manual') return false

    if (!settings.lastBackupDate) return true

    const lastTime = new Date(settings.lastBackupDate).getTime()
    const now = Date.now()
    const diffHours = (now - lastTime) / (1000 * 60 * 60)

    if (settings.autoBackup === 'daily' && diffHours >= 24) {
      return true
    }
    if (settings.autoBackup === 'weekly' && diffHours >= 168) {
      return true
    }
    return false
  }
}

export const backupService = new BackupService()
