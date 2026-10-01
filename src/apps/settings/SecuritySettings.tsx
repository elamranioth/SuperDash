import { useState, useEffect } from 'react'
import {
  Shield,
  Lock,
  Unlock,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Clock,
  EyeOff,
  Fingerprint,
  FileCode2,
  Check
} from 'lucide-react'
import {
  securityService,
  SecuritySettings as ISecuritySettings,
  DEFAULT_SECURITY_SETTINGS
} from '@/services/security'
import { sounds } from '@/utils/sound'
import GlassPanel from '@/components/LiquidGlass/GlassPanel'
import GlassModal from '@/components/LiquidGlass/GlassModal'

export default function SecuritySettings() {
  const [settings, setSettings] = useState<ISecuritySettings>(DEFAULT_SECURITY_SETTINGS)
  const [loading, setLoading] = useState(true)
  const [hasBiometric, setHasBiometric] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // PIN Setup Modal
  const [pinModalOpen, setPinModalOpen] = useState(false)
  const [pinMode, setPinMode] = useState<'create' | 'change' | 'disable'>('create')
  const [currentPinInput, setCurrentPinInput] = useState('')
  const [newPinInput, setNewPinInput] = useState('')
  const [confirmPinInput, setConfirmPinInput] = useState('')
  const [pinError, setPinError] = useState('')

  useEffect(() => {
    securityService.getSettings().then(s => {
      setSettings(s)
      setLoading(false)
    })
    securityService.checkBiometricSupport().then(setHasBiometric)
  }, [])

  const handleOpenPinModal = (mode: 'create' | 'change' | 'disable') => {
    sounds.playClick()
    setPinMode(mode)
    setCurrentPinInput('')
    setNewPinInput('')
    setConfirmPinInput('')
    setPinError('')
    setPinModalOpen(true)
  }

  const handleSavePinAction = async () => {
    setPinError('')

    if (pinMode === 'create') {
      if (newPinInput.length < 4) {
        setPinError('PIN must be at least 4 digits')
        return
      }
      if (newPinInput !== confirmPinInput) {
        setPinError('PINs do not match')
        return
      }
      await securityService.setPin(newPinInput)
      const updated = await securityService.getSettings()
      setSettings(updated)
      setPinModalOpen(false)
      sounds.playSuccess()
      setFeedback({ type: 'success', message: 'App Lock enabled successfully' })
    } else if (pinMode === 'change') {
      const valid = await securityService.verifyPin(currentPinInput)
      if (!valid) {
        setPinError('Current PIN is incorrect')
        return
      }
      if (newPinInput.length < 4) {
        setPinError('New PIN must be at least 4 digits')
        return
      }
      if (newPinInput !== confirmPinInput) {
        setPinError('New PINs do not match')
        return
      }
      await securityService.setPin(newPinInput)
      const updated = await securityService.getSettings()
      setSettings(updated)
      setPinModalOpen(false)
      sounds.playSuccess()
      setFeedback({ type: 'success', message: 'PIN changed successfully' })
    } else if (pinMode === 'disable') {
      const valid = await securityService.disableAppLock(currentPinInput)
      if (!valid) {
        setPinError('PIN is incorrect')
        return
      }
      const updated = await securityService.getSettings()
      setSettings(updated)
      setPinModalOpen(false)
      sounds.playSuccess()
      setFeedback({ type: 'success', message: 'App Lock disabled' })
    }

    setTimeout(() => setFeedback(null), 5000)
  }

  const handleUpdateTimeout = async (timeoutMinutes: number) => {
    sounds.playClick()
    const updated = await securityService.saveSettings({ autoLockTimeoutMinutes: timeoutMinutes })
    setSettings(updated)
  }

  const handleToggleBackgroundLock = async () => {
    sounds.playClick()
    const updated = await securityService.saveSettings({ lockOnBackground: !settings.lockOnBackground })
    setSettings(updated)
  }

  const handleToggleSensitiveScreens = async () => {
    sounds.playClick()
    const updated = await securityService.saveSettings({
      protectSensitiveScreens: !settings.protectSensitiveScreens
    })
    setSettings(updated)
  }

  const handleToggleBackupEncryption = async () => {
    sounds.playClick()
    const nextVal = !settings.backupEncryptionEnabled
    const updated = await securityService.saveSettings({ backupEncryptionEnabled: nextVal })
    setSettings(updated)
    setFeedback({
      type: 'success',
      message: nextVal
        ? 'Backup encryption active. Backups will be AES-GCM encrypted.'
        : 'Backup encryption disabled.'
    })
    setTimeout(() => setFeedback(null), 5000)
  }

  if (loading) {
    return <div className="p-8 text-center text-xs text-slate-400">Loading security settings...</div>
  }

  return (
    <div className="space-y-6 max-w-3xl pb-12">
      {/* Header Info */}
      <div className="space-y-1">
        <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
          <Shield className="w-5 h-5 text-indigo-400" />
          <span>Security & Privacy</span>
        </h2>
        <p className="text-xs text-slate-400">
          Hardware-grade privacy, passcode locking, background protection, and backup encryption.
        </p>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-2xl flex items-center gap-2.5 text-xs font-medium border animate-fade-in ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* 1. App Lock Card */}
      <GlassPanel className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                settings.appLockEnabled
                  ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-400'
                  : 'bg-white/5 border-white/10 text-slate-400'
              }`}
            >
              {settings.appLockEnabled ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
            </div>
            <div>
              <div className="text-sm font-bold text-white">App Lock</div>
              <div className="text-xs text-slate-400">
                {settings.appLockEnabled ? 'Protected with salted SHA-256 PIN' : 'SuperDash opens without a PIN'}
              </div>
            </div>
          </div>

          <div>
            {settings.appLockEnabled ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenPinModal('change')}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-semibold text-slate-200 transition active:scale-95"
                >
                  Change PIN
                </button>
                <button
                  onClick={() => handleOpenPinModal('disable')}
                  className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 text-xs font-semibold text-rose-300 transition active:scale-95"
                >
                  Disable
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleOpenPinModal('create')}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-sm transition active:scale-95"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Set Passcode</span>
              </button>
            )}
          </div>
        </div>

        {settings.appLockEnabled && (
          <div className="pt-3 border-t border-white/10 space-y-4">
            {/* Auto Lock Duration */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Auto-Lock Timer</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Require PIN after period of user inactivity
                </div>
              </div>

              <select
                value={settings.autoLockTimeoutMinutes}
                onChange={e => handleUpdateTimeout(Number(e.target.value))}
                className="px-3 py-1.5 rounded-xl bg-black/40 border border-white/15 text-xs text-white outline-none focus:border-indigo-400"
              >
                <option value={0}>Immediately</option>
                <option value={1}>1 minute</option>
                <option value={5}>5 minutes</option>
                <option value={15}>15 minutes</option>
                <option value={-1}>Never</option>
              </select>
            </div>

            {/* Lock on Background */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="text-xs font-semibold text-white">Lock on App Switch</div>
                <div className="text-[11px] text-slate-400">
                  Require unlock immediately when returning from background
                </div>
              </div>

              <button
                type="button"
                onClick={handleToggleBackgroundLock}
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  settings.lockOnBackground ? 'bg-indigo-600' : 'bg-white/10'
                }`}
              >
                <span
                  className={`block w-4 h-4 rounded-full bg-white shadow transform transition-transform ${
                    settings.lockOnBackground ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {hasBiometric && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2.5 text-xs text-emerald-300">
                <Fingerprint className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>Hardware biometric authenticator is supported and active.</span>
              </div>
            )}
          </div>
        )}
      </GlassPanel>

      {/* 2. Privacy & Screen Protection */}
      <GlassPanel className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="text-sm font-bold text-white flex items-center gap-2">
              <EyeOff className="w-4 h-4 text-slate-400" />
              <span>Sensitive Screen Protection</span>
            </div>
            <div className="text-xs text-slate-400 leading-relaxed max-w-md">
              Obscures SuperDash preview in the Android / OS multitasking app switcher to prevent visual snooping.
            </div>
          </div>

          <button
            type="button"
            onClick={handleToggleSensitiveScreens}
            className={`w-11 h-6 rounded-full transition-colors relative ${
              settings.protectSensitiveScreens ? 'bg-indigo-600' : 'bg-white/10'
            }`}
          >
            <span
              className={`block w-4 h-4 rounded-full bg-white shadow transform transition-transform ${
                settings.protectSensitiveScreens ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </GlassPanel>

      {/* 3. Backup Encryption */}
      <GlassPanel className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="text-sm font-bold text-white flex items-center gap-2">
              <FileCode2 className="w-4 h-4 text-slate-400" />
              <span>Backup Encryption (AES-GCM 256-bit)</span>
            </div>
            <div className="text-xs text-slate-400 leading-relaxed max-w-md">
              Encrypt portable <code className="text-indigo-300">.superdash</code> backup packages using a user passphrase before writing to disk or MEGA sync.
            </div>
          </div>

          <button
            type="button"
            onClick={handleToggleBackupEncryption}
            className={`w-11 h-6 rounded-full transition-colors relative ${
              settings.backupEncryptionEnabled ? 'bg-indigo-600' : 'bg-white/10'
            }`}
          >
            <span
              className={`block w-4 h-4 rounded-full bg-white shadow transform transition-transform ${
                settings.backupEncryptionEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {settings.backupEncryptionEnabled && (
          <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 leading-relaxed">
            <strong>Important:</strong> Passphrase keys are derived with PBKDF2 (100,000 rounds). Never lose your passphrase; encrypted backups cannot be decrypted without it.
          </div>
        )}
      </GlassPanel>

      {/* PIN Setup Modal */}
      {pinModalOpen && (
        <GlassModal
          isOpen={true}
          onClose={() => setPinModalOpen(false)}
          title={
            pinMode === 'create'
              ? 'Set Up App Lock PIN'
              : pinMode === 'change'
              ? 'Change Security PIN'
              : 'Disable App Lock'
          }
        >
          <div className="space-y-4 p-2 text-slate-100">
            {pinError && (
              <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{pinError}</span>
              </div>
            )}

            {(pinMode === 'change' || pinMode === 'disable') && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Current PIN</label>
                <input
                  type="password"
                  maxLength={8}
                  value={currentPinInput}
                  onChange={e => setCurrentPinInput(e.target.value)}
                  placeholder="Enter current PIN"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-sm text-white outline-none focus:border-indigo-400"
                />
              </div>
            )}

            {pinMode !== 'disable' && (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    {pinMode === 'create' ? 'Choose 4-8 Digit PIN' : 'New PIN'}
                  </label>
                  <input
                    type="password"
                    maxLength={8}
                    value={newPinInput}
                    onChange={e => setNewPinInput(e.target.value)}
                    placeholder="Enter new PIN"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-sm text-white outline-none focus:border-indigo-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Confirm PIN</label>
                  <input
                    type="password"
                    maxLength={8}
                    value={confirmPinInput}
                    onChange={e => setConfirmPinInput(e.target.value)}
                    placeholder="Re-enter PIN"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-sm text-white outline-none focus:border-indigo-400"
                  />
                </div>
              </>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setPinModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSavePinAction}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition"
              >
                <Check className="w-4 h-4" />
                <span>Save</span>
              </button>
            </div>
          </div>
        </GlassModal>
      )}
    </div>
  )
}
