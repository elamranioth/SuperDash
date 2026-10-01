export type SyncStatus = 'synced' | 'syncing' | 'offline' | 'pending' | 'error'

export type SyncEntityType =
  | 'note'
  | 'task'
  | 'calendar'
  | 'finance'
  | 'hearing'
  | 'idea'
  | 'decision'
  | 'reader'
  | 'live'
  | 'collection'
  | 'growth'
  | 'settings'

export type SyncOperation = 'create' | 'update' | 'delete'

export interface SyncChange {
  id: string
  entityType: SyncEntityType
  entityId: string
  operation: SyncOperation
  timestamp: number
  payload?: unknown
  tombstone?: boolean
  deviceId: string
}

export interface SyncConflict {
  id: string
  entityType: SyncEntityType
  entityId: string
  title: string
  localChange: SyncChange
  remoteChange: SyncChange
  detectedAt: number
}

export type ConflictResolution = 'keep_local' | 'keep_remote' | 'keep_both'

export interface SyncPushResult {
  success: boolean
  pushedCount: number
  conflicts?: SyncConflict[]
  error?: string
}

export interface SyncPullResult {
  success: boolean
  pulledChanges: SyncChange[]
  serverTimestamp: number
  error?: string
}

export interface SyncProvider {
  name: string
  isConnected(): Promise<boolean>
  pushChanges(changes: SyncChange[]): Promise<SyncPushResult>
  pullChanges(lastSyncTimestamp: number): Promise<SyncPullResult>
  testConnection?(): Promise<{ success: boolean; message?: string }>
}

export interface SyncSettings {
  enabled: boolean
  providerType: 'local_relay' | 'remote_endpoint' | 'disabled'
  endpointUrl?: string
  lastSyncTimestamp?: number
  lastSyncStatus: SyncStatus
  lastSyncError?: string
  autoSyncOnMutation: boolean
  deviceId: string
}
