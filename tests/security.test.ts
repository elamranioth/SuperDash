import { describe, it, expect } from 'vitest'
import { securityService, SecuritySettings } from '@/services/security'

describe('Security Service - PIN Hashing, Auto-Lock & AES-GCM Encryption', () => {
  it('hashes PIN with unique salt using SHA-256 and validates match', async () => {
    const salt1 = 'a1b2c3d4e5f60718293a4b5c6d7e8f90'
    const salt2 = '09f8e7d6c5b4a39281706f5e4d3c2b1a'
    const pin = '4826'

    const hash1 = await securityService.hashPin(pin, salt1)
    const hash2 = await securityService.hashPin(pin, salt2)

    // Salt ensures distinct hashes for same PIN
    expect(hash1).not.toBe(hash2)
    expect(hash1.length).toBe(64) // 256 bits = 64 hex chars

    // Same pin + same salt produces exact identical hash
    const hash1Repeat = await securityService.hashPin(pin, salt1)
    expect(hash1Repeat).toBe(hash1)

    // Wrong pin produces different hash
    const wrongHash = await securityService.hashPin('9999', salt1)
    expect(wrongHash).not.toBe(hash1)
  })

  it('evaluates auto-lock timeout thresholds correctly', () => {
    const settings: SecuritySettings = {
      appLockEnabled: true,
      autoLockTimeoutMinutes: 5,
      lockOnBackground: true,
      protectSensitiveScreens: false,
      backupEncryptionEnabled: false
    }

    // Immediately after activity, it should not lock
    securityService.recordActivity()
    const lockedNow = securityService.checkAutoLock(settings)
    expect(lockedNow).toBe(false)
  })

  it('encrypts and decrypts payload using AES-GCM 256-bit with PBKDF2', async () => {
    const sensitivePayload = JSON.stringify({
      notes: [{ id: 'n1', title: 'Confidential Client Note', secret: 'abc' }],
      invoices: [{ id: 'i1', amount: 50000 }]
    })
    const passphrase = 'SuperDashSecurePassphrase2026!'

    const encrypted = await securityService.encryptPayload(sensitivePayload, passphrase)

    expect(encrypted.ciphertext).toBeDefined()
    expect(encrypted.salt).toBeDefined()
    expect(encrypted.iv).toBeDefined()
    expect(encrypted.ciphertext).not.toContain('Confidential')

    // Decrypt with correct passphrase
    const decrypted = await securityService.decryptPayload(encrypted, passphrase)
    expect(decrypted).toBe(sensitivePayload)
    const parsed = JSON.parse(decrypted)
    expect(parsed.notes[0].title).toBe('Confidential Client Note')

    // Decrypt with wrong passphrase must fail
    await expect(
      securityService.decryptPayload(encrypted, 'WrongPassphrase!')
    ).rejects.toThrow(/Decryption failed/)
  })
})
