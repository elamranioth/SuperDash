import { storageService } from '@/services/storage'

export interface SecuritySettings {
  appLockEnabled: boolean
  pinSalt?: string
  pinHash?: string
  autoLockTimeoutMinutes: number // 0 = immediate, 1 = 1 min, 5 = 5 min, 15 = 15 min, -1 = never
  lockOnBackground: boolean
  protectSensitiveScreens: boolean
  backupEncryptionEnabled: boolean
  lastUnlockedAt?: number
}

export const DEFAULT_SECURITY_SETTINGS: SecuritySettings = {
  appLockEnabled: false,
  autoLockTimeoutMinutes: 5,
  lockOnBackground: true,
  protectSensitiveScreens: false,
  backupEncryptionEnabled: false
}

const SECURITY_STORAGE_KEY = 'security_settings'

// ─── Cryptographic Helpers ───────────────────────────────────────────────────

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes.buffer
}

function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

function hexToBuffer(hex: string): ArrayBuffer {
  const tokens = hex.match(/.{1,2}/g) || []
  const bytes = new Uint8Array(tokens.map(token => parseInt(token, 16)))
  return bytes.buffer
}

export class SecurityService {
  private inMemoryLocked = false
  private lastActiveTimestamp: number = Date.now()
  private listeners: Set<(locked: boolean) => void> = new Set()

  constructor() {
    this.initSession()
  }

  private async initSession() {
    const settings = await this.getSettings()
    if (settings.appLockEnabled && settings.pinHash) {
      // Require unlock on initial load if lock is enabled
      this.inMemoryLocked = true
      this.notifyListeners()
    }
  }

  public subscribeLockState(callback: (locked: boolean) => void): () => void {
    this.listeners.add(callback)
    callback(this.inMemoryLocked)
    return () => this.listeners.delete(callback)
  }

  private notifyListeners() {
    for (const cb of this.listeners) {
      cb(this.inMemoryLocked)
    }
  }

  public isCurrentlyLocked(): boolean {
    return this.inMemoryLocked
  }

  public lock(): void {
    this.inMemoryLocked = true
    this.notifyListeners()
  }

  public async getSettings(): Promise<SecuritySettings> {
    return await storageService.get<SecuritySettings>(SECURITY_STORAGE_KEY, DEFAULT_SECURITY_SETTINGS)
  }

  public async saveSettings(partial: Partial<SecuritySettings>): Promise<SecuritySettings> {
    const current = await this.getSettings()
    const updated = { ...current, ...partial }
    await storageService.set(SECURITY_STORAGE_KEY, updated)
    return updated
  }

  /**
   * Hashes a PIN with a salt using Web Crypto SHA-256.
   * Raw PIN is never stored.
   */
  public async hashPin(pin: string, saltHex: string): Promise<string> {
    const encoder = new TextEncoder()
    const saltBuffer = hexToBuffer(saltHex)
    const pinBuffer = encoder.encode(pin)

    // Combine salt + pin
    const combined = new Uint8Array(saltBuffer.byteLength + pinBuffer.byteLength)
    combined.set(new Uint8Array(saltBuffer), 0)
    combined.set(pinBuffer, saltBuffer.byteLength)

    const hashBuffer = await crypto.subtle.digest('SHA-256', combined)
    return bufferToHex(hashBuffer)
  }

  /**
   * Setup or change the system PIN.
   */
  public async setPin(pin: string): Promise<void> {
    if (!pin || pin.length < 4) {
      throw new Error('PIN must be at least 4 digits')
    }
    const saltBytes = new Uint8Array(16)
    crypto.getRandomValues(saltBytes)
    const saltHex = bufferToHex(saltBytes.buffer)
    const hash = await this.hashPin(pin, saltHex)

    await this.saveSettings({
      appLockEnabled: true,
      pinSalt: saltHex,
      pinHash: hash
    })
    this.inMemoryLocked = false
    this.recordActivity()
    this.notifyListeners()
  }

  /**
   * Verify an entered PIN against the stored hash.
   */
  public async verifyPin(pin: string): Promise<boolean> {
    const settings = await this.getSettings()
    if (!settings.appLockEnabled || !settings.pinSalt || !settings.pinHash) {
      return true
    }
    const computed = await this.hashPin(pin, settings.pinSalt)
    return computed === settings.pinHash
  }

  /**
   * Unlock SuperDash with PIN.
   */
  public async unlockWithPin(pin: string): Promise<boolean> {
    const valid = await this.verifyPin(pin)
    if (valid) {
      this.inMemoryLocked = false
      this.recordActivity()
      this.notifyListeners()
      return true
    }
    return false
  }

  /**
   * Disable App Lock completely.
   */
  public async disableAppLock(currentPin: string): Promise<boolean> {
    const valid = await this.verifyPin(currentPin)
    if (!valid) return false

    await this.saveSettings({
      appLockEnabled: false,
      pinSalt: undefined,
      pinHash: undefined
    })
    this.inMemoryLocked = false
    this.notifyListeners()
    return true
  }

  /**
   * Keep track of user interaction time for auto-lock calculations.
   */
  public recordActivity(): void {
    this.lastActiveTimestamp = Date.now()
  }

  /**
   * Evaluates whether auto-lock timeout has passed.
   * Returns true if locked.
   */
  public checkAutoLock(settings: SecuritySettings): boolean {
    if (!settings.appLockEnabled || this.inMemoryLocked) return this.inMemoryLocked
    if (settings.autoLockTimeoutMinutes < 0) return false // Never

    const elapsedMs = Date.now() - this.lastActiveTimestamp
    const allowedMs = settings.autoLockTimeoutMinutes * 60 * 1000

    if (elapsedMs >= allowedMs) {
      this.lock()
      return true
    }
    return false
  }

  /**
   * Called when application goes to background or becomes visible.
   */
  public async handleVisibilityChange(hidden: boolean): Promise<void> {
    const settings = await this.getSettings()
    if (!settings.appLockEnabled) return

    if (hidden) {
      this.recordActivity()
    } else {
      if (settings.lockOnBackground && settings.autoLockTimeoutMinutes === 0) {
        this.lock()
      } else {
        this.checkAutoLock(settings)
      }
    }
  }

  /**
   * Check genuine platform biometric support (e.g. WebAuthn platform authenticator).
   * Does NOT show fake biometric option if platform does not support it.
   */
  public async checkBiometricSupport(): Promise<boolean> {
    if (typeof window === 'undefined') return false
    if (!window.PublicKeyCredential) return false
    try {
      if (typeof PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function') {
        return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
      }
    } catch {
      return false
    }
    return false
  }

  // ─── AES-GCM Backup Encryption ─────────────────────────────────────────────

  /**
   * Derives a 256-bit AES-GCM key from user passphrase using PBKDF2 (100,000 rounds).
   */
  private async deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
    const encoder = new TextEncoder()
    const passphraseKey = await crypto.subtle.importKey(
      'raw',
      encoder.encode(passphrase),
      'PBKDF2',
      false,
      ['deriveKey']
    )

    return await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt as BufferSource,
        iterations: 100000,
        hash: 'SHA-256'
      },
      passphraseKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    )
  }

  /**
   * Encrypt arbitrary string (e.g. JSON backup) with AES-GCM 256-bit.
   */
  public async encryptPayload(plaintext: string, passphrase: string): Promise<{
    ciphertext: string
    salt: string
    iv: string
  }> {
    const encoder = new TextEncoder()
    const salt = new Uint8Array(16)
    crypto.getRandomValues(salt)

    const iv = new Uint8Array(12)
    crypto.getRandomValues(iv)

    const key = await this.deriveKey(passphrase, salt)
    const encryptedBuffer = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv as BufferSource },
      key,
      encoder.encode(plaintext)
    )

    return {
      ciphertext: arrayBufferToBase64(encryptedBuffer),
      salt: bufferToHex(salt.buffer),
      iv: bufferToHex(iv.buffer)
    }
  }

  /**
   * Decrypt AES-GCM 256-bit encrypted payload.
   * Throws if passphrase is incorrect or data was tampered with.
   */
  public async decryptPayload(
    encrypted: { ciphertext: string; salt: string; iv: string },
    passphrase: string
  ): Promise<string> {
    const salt = new Uint8Array(hexToBuffer(encrypted.salt))
    const iv = new Uint8Array(hexToBuffer(encrypted.iv))
    const data = base64ToArrayBuffer(encrypted.ciphertext)

    const key = await this.deriveKey(passphrase, salt)
    try {
      const decryptedBuffer = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: iv as BufferSource },
        key,
        data
      )
      const decoder = new TextDecoder()
      return decoder.decode(decryptedBuffer)
    } catch {
      throw new Error('Decryption failed: Incorrect passphrase or corrupted backup file.')
    }
  }
}

export const securityService = new SecurityService()
