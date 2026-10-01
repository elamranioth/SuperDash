import { describe, it, expect, beforeEach } from 'vitest'
import {
  backupService,
  STORAGE_SCHEMA_VERSION,
  BACKUP_FORMAT_VERSION,
  BackupPackage
} from '@/services/backup'
import { storageService } from '@/services/storage'

describe('Backup Service - Verification, Sanitization & Rolling Retention', () => {
  beforeEach(async () => {
    // Seed sample test data into storage
    await storageService.set('notes', [
      { id: 'note-1', title: 'Backup Test Note', content: 'Testing backup generation' }
    ])
    await storageService.set('tasks', [
      { id: 'task-1', title: 'Test Task', completed: false }
    ])
  })

  it('generates a valid .superdash package with manifest and record counters', async () => {
    const pkg = await backupService.generateBackupPackage()

    expect(pkg.manifest).toBeDefined()
    expect(pkg.manifest.backupVersion).toBe(BACKUP_FORMAT_VERSION)
    expect(pkg.manifest.schemaVersion).toBe(STORAGE_SCHEMA_VERSION)
    expect(pkg.manifest.checksum).toBeDefined()
    expect(pkg.manifest.checksum.length).toBeGreaterThan(0)

    // Manifest module statistics
    expect(pkg.manifest.modules.notes).toBeGreaterThanOrEqual(1)
    expect(pkg.manifest.modules.tasks).toBeGreaterThanOrEqual(1)

    // Data payload
    expect(pkg.data).toBeDefined()
    expect(pkg.data.notes).toBeDefined()
  })

  it('sanitizes blacklisted sensitive credentials from backup output', async () => {
    // Store dummy sensitive tokens
    await storageService.set('user_secret_token', 'super_secret_jwt_token_12345')
    await storageService.set('api_password', 'p@ssword123')

    const pkg = await backupService.generateBackupPackage()

    expect(pkg.data.user_secret_token).toBeUndefined()
    expect(pkg.data.api_password).toBeUndefined()
    expect(pkg.data.notes).toBeDefined()
  })

  it('inspects and verifies integrity of exported backup JSON', async () => {
    const pkg = await backupService.generateBackupPackage()
    const jsonStr = JSON.stringify(pkg)

    const inspected = await backupService.inspectBackup(jsonStr)
    expect(inspected.valid).toBe(true)
    expect(inspected.manifest?.schemaVersion).toBe(STORAGE_SCHEMA_VERSION)
    expect(inspected.manifest?.modules.notes).toBeGreaterThanOrEqual(1)

    // Inspect corrupted JSON
    const corruptedResult = await backupService.inspectBackup('{ corrupted json')
    expect(corruptedResult.valid).toBe(false)
    expect(corruptedResult.error).toBeDefined()

    // Inspect missing manifest
    const missingManifestResult = await backupService.inspectBackup(JSON.stringify({ data: {} }))
    expect(missingManifestResult.valid).toBe(false)
  })
})
