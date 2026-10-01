import { describe, it, expect, beforeEach } from 'vitest'
import { syncService, LocalRelaySyncProvider, SyncChange } from '@/services/sync'
import { storageService } from '@/services/storage'

describe('Sync Engine - Local-First Queue, Conflict Resolution & Deletions', () => {
  beforeEach(async () => {
    await storageService.set('sync_pending_queue', [])
    await storageService.set('sync_conflicts', [])
    await storageService.set('superdash_remote_relay_db', [])
  })

  it('records local mutations immediately into local-first queue', async () => {
    await syncService.recordLocalMutation('note', 'note-test-1', 'create', {
      id: 'note-test-1',
      title: 'Local First Note'
    })

    const count = await syncService.getPendingCount()
    expect(count).toBe(1)

    const pending = await syncService.getPendingChanges()
    expect(pending[0].entityId).toBe('note-test-1')
    expect(pending[0].operation).toBe('create')
    expect(pending[0].tombstone).toBe(false)
  })

  it('deduplicates multiple mutations on the same record in queue', async () => {
    await syncService.recordLocalMutation('task', 'task-99', 'create', { title: 'First draft' })
    await syncService.recordLocalMutation('task', 'task-99', 'update', { title: 'Second draft' })

    const count = await syncService.getPendingCount()
    expect(count).toBe(1)

    const pending = await syncService.getPendingChanges()
    expect(pending[0].operation).toBe('update')
  })

  it('sets tombstone flag for deletion mutations', async () => {
    await syncService.recordLocalMutation('note', 'note-to-delete', 'delete')

    const pending = await syncService.getPendingChanges()
    expect(pending[0].operation).toBe('delete')
    expect(pending[0].tombstone).toBe(true)
  })

  it('pushes mutations and clears pending queue on successful sync', async () => {
    await syncService.recordLocalMutation('note', 'note-synced', 'create', {
      id: 'note-synced',
      title: 'Synced Note'
    })

    const res = await syncService.syncNow()
    expect(res.success).toBe(true)
    expect(res.pushed).toBe(1)

    const remaining = await syncService.getPendingCount()
    expect(remaining).toBe(0)
  })

  it('detects concurrent edits on important text content and produces a conflict', async () => {
    // Seed remote change from Device B
    const remoteRelay = new LocalRelaySyncProvider()
    const changeDeviceB: SyncChange = {
      id: 'mut_remote_1',
      entityType: 'note',
      entityId: 'note-shared',
      operation: 'update',
      timestamp: Date.now() - 5000,
      deviceId: 'device_b',
      payload: { id: 'note-shared', title: 'Remote Note Edit', content: 'From Device B' }
    }
    await remoteRelay.pushChanges([changeDeviceB])

    // Device A edits same note concurrently
    await syncService.recordLocalMutation('note', 'note-shared', 'update', {
      id: 'note-shared',
      title: 'Local Note Edit',
      content: 'From Device A'
    })

    const res = await syncService.syncNow()
    expect(res.conflicts).toBe(1)

    const conflicts = await syncService.getConflicts()
    expect(conflicts.length).toBe(1)
    expect(conflicts[0].entityId).toBe('note-shared')

    // Resolving conflict with 'keep_both' creates non-destructive copy
    await syncService.resolveConflict(conflicts[0].id, 'keep_both')
    const remainingConflicts = await syncService.getConflicts()
    expect(remainingConflicts.length).toBe(0)
  })
})
