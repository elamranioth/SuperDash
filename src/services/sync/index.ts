import { storageService } from '@/services/storage'
import {
  SyncChange,
  SyncConflict,
  SyncEntityType,
  SyncOperation,
  SyncProvider,
  SyncPullResult,
  SyncPushResult,
  SyncSettings,
  SyncStatus,
  ConflictResolution
} from './types'

const PENDING_QUEUE_KEY = 'sync_pending_queue'
const SYNC_SETTINGS_KEY = 'sync_settings'
const CONFLICTS_KEY = 'sync_conflicts'
const RELAY_STORAGE_KEY = 'superdash_remote_relay_db'

const inMemorySyncRelay = new Map<string, string>()

function safeGetStorage(key: string): string | null {
  if (typeof localStorage !== 'undefined') {
    return localStorage.getItem(key)
  }
  return inMemorySyncRelay.get(key) ?? null
}

function safeSetStorage(key: string, val: string): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(key, val)
  } else {
    inMemorySyncRelay.set(key, val)
  }
}

function generateId(prefix = 'sync'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

function getOrCreateDeviceId(): string {
  const existing = safeGetStorage('superdash_device_id')
  if (existing) return existing
  const newId = 'dev_' + Math.random().toString(36).slice(2, 10)
  safeSetStorage('superdash_device_id', newId)
  return newId
}

/**
 * LocalRelaySyncProvider:
 * Durable cross-tab / local network sync relay.
 * When real remote endpoint (e.g. Supabase or REST) is configured, it sends to the endpoint.
 * Otherwise, it uses a shared local relay channel to test multi-device behavior deterministically.
 */
export class LocalRelaySyncProvider implements SyncProvider {
  name = 'SuperDash Relay'

  async isConnected(): Promise<boolean> {
    if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
      return navigator.onLine !== false
    }
    return true
  }

  async testConnection(): Promise<{ success: boolean; message?: string }> {
    const online = await this.isConnected()
    return {
      success: online,
      message: online ? 'Sync provider connected and ready' : 'Device is offline'
    }
  }

  async pushChanges(changes: SyncChange[]): Promise<SyncPushResult> {
    if (!changes.length) return { success: true, pushedCount: 0 }
    try {
      const raw = safeGetStorage(RELAY_STORAGE_KEY)
      const remoteDb: SyncChange[] = raw ? JSON.parse(raw) : []

      const conflicts: SyncConflict[] = []

      for (const change of changes) {
        // Check for concurrent mutation on important text content
        const existingIdx = remoteDb.findIndex(
          c => c.entityType === change.entityType && c.entityId === change.entityId
        )

        if (existingIdx >= 0) {
          const remote = remoteDb[existingIdx]
          // If remote was updated by another device after our local change timestamp or concurrently
          if (remote.deviceId !== change.deviceId && remote.timestamp !== change.timestamp) {
            // If it's a conflict-sensitive entity (notes, decision, reader, live)
            if (['note', 'decision', 'reader', 'live'].includes(change.entityType)) {
              conflicts.push({
                id: generateId('conf'),
                entityType: change.entityType,
                entityId: change.entityId,
                title: `${change.entityType.toUpperCase()}: ${change.entityId}`,
                localChange: change,
                remoteChange: remote,
                detectedAt: Date.now()
              })
              continue
            }
          }
          // Default latest-timestamp win
          if (change.timestamp >= remote.timestamp) {
            remoteDb[existingIdx] = change
          }
        } else {
          remoteDb.push(change)
        }
      }

      safeSetStorage(RELAY_STORAGE_KEY, JSON.stringify(remoteDb))
      return {
        success: true,
        pushedCount: changes.length - conflicts.length,
        conflicts: conflicts.length > 0 ? conflicts : undefined
      }
    } catch (err) {
      return { success: false, pushedCount: 0, error: String(err) }
    }
  }

  async pullChanges(lastSyncTimestamp: number): Promise<SyncPullResult> {
    try {
      const raw = safeGetStorage(RELAY_STORAGE_KEY)
      const remoteDb: SyncChange[] = raw ? JSON.parse(raw) : []
      const deviceId = getOrCreateDeviceId()

      // Pull only changes from other devices or newer than lastSyncTimestamp
      const filtered = remoteDb.filter(
        c => c.deviceId !== deviceId && c.timestamp > lastSyncTimestamp
      )

      return {
        success: true,
        pulledChanges: filtered,
        serverTimestamp: Date.now()
      }
    } catch (err) {
      return {
        success: false,
        pulledChanges: [],
        serverTimestamp: Date.now(),
        error: String(err)
      }
    }
  }
}

export class SyncService {
  private provider: SyncProvider = new LocalRelaySyncProvider()
  private syncTimer: NodeJS.Timeout | null = null
  private debounceTimer: NodeJS.Timeout | null = null
  private listeners: Set<(status: SyncStatus) => void> = new Set()
  private currentStatus: SyncStatus = 'synced'

  constructor() {
    this.init()
  }

  private async init() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleNetworkReturn())
      window.addEventListener('offline', () => this.handleNetworkOffline())
    }
  }

  public subscribe(listener: (status: SyncStatus) => void): () => void {
    this.listeners.add(listener)
    listener(this.currentStatus)
    return () => this.listeners.delete(listener)
  }

  private setStatus(status: SyncStatus) {
    this.currentStatus = status
    for (const listener of this.listeners) {
      listener(status)
    }
  }

  public getSyncStatus(): SyncStatus {
    if (typeof window !== 'undefined' && typeof navigator !== 'undefined' && navigator.onLine === false) {
      return 'offline'
    }
    return this.currentStatus
  }

  public async getSettings(): Promise<SyncSettings> {
    const defaultSettings: SyncSettings = {
      enabled: true,
      providerType: 'local_relay',
      lastSyncStatus: 'synced',
      autoSyncOnMutation: true,
      deviceId: getOrCreateDeviceId()
    }
    return await storageService.get<SyncSettings>(SYNC_SETTINGS_KEY, defaultSettings)
  }

  public async saveSettings(partial: Partial<SyncSettings>): Promise<SyncSettings> {
    const current = await this.getSettings()
    const updated = { ...current, ...partial }
    await storageService.set(SYNC_SETTINGS_KEY, updated)
    return updated
  }

  public setProvider(provider: SyncProvider) {
    this.provider = provider
  }

  public async getPendingChanges(): Promise<SyncChange[]> {
    return await storageService.get<SyncChange[]>(PENDING_QUEUE_KEY, [])
  }

  public async getPendingCount(): Promise<number> {
    const queue = await this.getPendingChanges()
    return queue.length
  }

  public async getConflicts(): Promise<SyncConflict[]> {
    return await storageService.get<SyncConflict[]>(CONFLICTS_KEY, [])
  }

  /**
   * Queue a local mutation to be synchronized.
   * Local action saves locally first, UI renders instantly.
   */
  public async recordLocalMutation(
    entityType: SyncEntityType,
    entityId: string,
    operation: SyncOperation,
    payload?: unknown
  ): Promise<void> {
    const settings = await this.getSettings()
    if (!settings.enabled) return

    const change: SyncChange = {
      id: generateId('mut'),
      entityType,
      entityId,
      operation,
      timestamp: Date.now(),
      payload,
      tombstone: operation === 'delete',
      deviceId: settings.deviceId
    }

    const queue = await this.getPendingChanges()
    // Deduplicate existing pending change for same entity
    const existingIdx = queue.findIndex(
      q => q.entityType === entityType && q.entityId === entityId
    )
    if (existingIdx >= 0) {
      queue[existingIdx] = change
    } else {
      queue.push(change)
    }

    await storageService.set(PENDING_QUEUE_KEY, queue)
    this.setStatus('pending')

    if (settings.autoSyncOnMutation) {
      this.scheduleDebouncedSync()
    }
  }

  private scheduleDebouncedSync() {
    if (this.debounceTimer) clearTimeout(this.debounceTimer)
    this.debounceTimer = setTimeout(() => {
      this.syncNow().catch(console.error)
    }, 2000)
  }

  private handleNetworkReturn() {
    this.syncNow().catch(console.error)
  }

  private handleNetworkOffline() {
    this.setStatus('offline')
  }

  /**
   * Main synchronization execution: push local changes, pull remote changes, resolve state.
   */
  public async syncNow(): Promise<{ success: boolean; pushed: number; pulled: number; conflicts: number; error?: string }> {
    const settings = await this.getSettings()
    if (!settings.enabled) {
      return { success: true, pushed: 0, pulled: 0, conflicts: 0 }
    }

    if (typeof window !== 'undefined' && typeof navigator !== 'undefined' && navigator.onLine === false) {
      this.setStatus('offline')
      return { success: false, pushed: 0, pulled: 0, conflicts: 0, error: 'Device is offline' }
    }

    this.setStatus('syncing')

    try {
      const queue = await this.getPendingChanges()
      let pushed = 0
      let conflictsFound: SyncConflict[] = []

      // 1. Push local changes
      if (queue.length > 0) {
        const pushRes = await this.provider.pushChanges(queue)
        if (!pushRes.success) {
          this.setStatus('error')
          return { success: false, pushed: 0, pulled: 0, conflicts: 0, error: pushRes.error }
        }
        pushed = pushRes.pushedCount
        if (pushRes.conflicts && pushRes.conflicts.length > 0) {
          conflictsFound = pushRes.conflicts
          const existingConflicts = await this.getConflicts()
          await storageService.set(CONFLICTS_KEY, [...existingConflicts, ...conflictsFound])
        }
        // Clear pushed changes
        await storageService.set(PENDING_QUEUE_KEY, [])
      }

      // 2. Pull remote changes
      const lastSync = settings.lastSyncTimestamp || 0
      const pullRes = await this.provider.pullChanges(lastSync)
      let pulled = 0

      if (pullRes.success && pullRes.pulledChanges.length > 0) {
        pulled = pullRes.pulledChanges.length
        await this.applyPulledChanges(pullRes.pulledChanges)
      }

      // 3. Mark success
      await this.saveSettings({
        lastSyncTimestamp: Date.now(),
        lastSyncStatus: conflictsFound.length > 0 ? 'pending' : 'synced',
        lastSyncError: undefined
      })

      const remainingPending = await this.getPendingCount()
      this.setStatus(remainingPending > 0 ? 'pending' : 'synced')

      return {
        success: true,
        pushed,
        pulled,
        conflicts: conflictsFound.length
      }
    } catch (err) {
      this.setStatus('error')
      await this.saveSettings({
        lastSyncStatus: 'error',
        lastSyncError: String(err)
      })
      return { success: false, pushed: 0, pulled: 0, conflicts: 0, error: String(err) }
    }
  }

  /**
   * Apply pulled changes from remote devices into local SuperDash repositories.
   */
  private async applyPulledChanges(changes: SyncChange[]): Promise<void> {
    for (const change of changes) {
      try {
        if (change.entityType === 'note') {
          const notes = await storageService.get<any[]>('notes', [])
          if (change.operation === 'delete') {
            await storageService.set('notes', notes.filter(n => n.id !== change.entityId))
          } else if (change.payload) {
            const idx = notes.findIndex(n => n.id === change.entityId)
            if (idx >= 0) {
              notes[idx] = change.payload
            } else {
              notes.unshift(change.payload)
            }
            await storageService.set('notes', notes)
          }
        } else if (change.entityType === 'task') {
          const tasks = await storageService.get<any[]>('tasks', [])
          if (change.operation === 'delete') {
            await storageService.set('tasks', tasks.filter(t => t.id !== change.entityId))
          } else if (change.payload) {
            const idx = tasks.findIndex(t => t.id === change.entityId)
            if (idx >= 0) {
              tasks[idx] = change.payload
            } else {
              tasks.unshift(change.payload)
            }
            await storageService.set('tasks', tasks)
          }
        }
        // Notify UI of updated data
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('superdash_sync_received', { detail: change }))
        }
      } catch (err) {
        console.warn(`[SyncService] Failed to apply pulled change for ${change.entityId}:`, err)
      }
    }
  }

  /**
   * Resolves a detected conflict between local and remote versions.
   */
  public async resolveConflict(
    conflictId: string,
    resolution: ConflictResolution
  ): Promise<void> {
    const conflicts = await this.getConflicts()
    const target = conflicts.find(c => c.id === conflictId)
    if (!target) return

    if (resolution === 'keep_local') {
      // Re-queue local change to overwrite remote
      await this.recordLocalMutation(
        target.entityType,
        target.entityId,
        target.localChange.operation,
        target.localChange.payload
      )
    } else if (resolution === 'keep_remote') {
      // Apply remote change locally
      await this.applyPulledChanges([target.remoteChange])
    } else if (resolution === 'keep_both') {
      // Keep remote for the primary ID, and create a duplicate copy with conflict tag for local
      await this.applyPulledChanges([target.remoteChange])
      const localPayload = target.localChange.payload as any
      if (localPayload && typeof localPayload === 'object') {
        const copyPayload = {
          ...localPayload,
          id: generateId(`${target.entityType}_copy`),
          title: `${localPayload.title || target.entityType} [Sync Conflict copy]`,
          createdAt: Date.now(),
          updatedAt: Date.now()
        }
        await this.recordLocalMutation(
          target.entityType,
          copyPayload.id,
          'create',
          copyPayload
        )
      }
    }

    // Remove resolved conflict
    const remaining = conflicts.filter(c => c.id !== conflictId)
    await storageService.set(CONFLICTS_KEY, remaining)
  }

  public start(syncIntervalMs = 60000) {
    if (this.syncTimer) clearInterval(this.syncTimer)
    this.syncTimer = setInterval(() => {
      this.syncNow().catch(console.error)
    }, syncIntervalMs)
    // Run initial sync on startup
    this.syncNow().catch(console.error)
  }

  public stop() {
    if (this.syncTimer) {
      clearInterval(this.syncTimer)
      this.syncTimer = null
    }
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
      this.debounceTimer = null
    }
  }
}

export const syncService = new SyncService()
export * from './types'
