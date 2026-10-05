import { useState, useEffect } from 'react'
import { Lock, ShieldCheck, AlertCircle, Fingerprint } from 'lucide-react'
import { securityService } from '@/services/security'

interface AppLockScreenProps {
  onUnlocked: () => void
}

export default function AppLockScreen({ onUnlocked }: AppLockScreenProps) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [shake, setShake] = useState(false)
  const [hasBiometric, setHasBiometric] = useState(false)

  useEffect(() => {
    securityService.checkBiometricSupport().then(setHasBiometric)
  }, [])

  const handleDigit = (digit: string) => {
    if (pin.length < 8) {
      const next = pin + digit
      setPin(next)
      setError('')
      if (next.length >= 4) {
        // Auto-check on 4 or 6 digits
        attemptUnlock(next)
      }
    }
  }

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1))
    setError('')
  }

  const attemptUnlock = async (pinCandidate: string) => {
    const lockoutSec = securityService.getRemainingLockoutSeconds()
    if (lockoutSec > 0) {
      setError(`Too many attempts. Locked for ${lockoutSec}s`)
      setShake(true)
      setTimeout(() => setShake(false), 500)
      return
    }

    try {
      const valid = await securityService.unlockWithPin(pinCandidate)
      if (valid) {
        onUnlocked()
      } else if (pinCandidate.length >= 4) {
        const afterLockout = securityService.getRemainingLockoutSeconds()
        if (afterLockout > 0) {
          setError(`Too many attempts. Locked for ${afterLockout}s`)
        } else {
          setError('Incorrect PIN')
        }
        setShake(true)
        setTimeout(() => {
          setShake(false)
          setPin('')
        }, 500)
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Incorrect PIN')
      setShake(true)
      setTimeout(() => setShake(false), 500)
    }
  }

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-2xl px-4 select-none">
      <div
        className={`w-full max-w-sm rounded-3xl p-6 sm:p-8 bg-zinc-900/90 border border-white/10 shadow-2xl text-center backdrop-blur-xl transition-transform ${
          shake ? 'animate-bounce' : ''
        }`}
      >
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-tr from-indigo-500/20 to-purple-500/30 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-lg">
          <Lock className="w-8 h-8" />
        </div>

        <h2 className="text-xl font-bold text-white mb-1 tracking-tight">SuperDash</h2>
        <p className="text-xs text-zinc-400 mb-6">Enter your security PIN to unlock</p>

        {/* PIN Indicators */}
        <div className="flex justify-center gap-3 mb-6">
          {[0, 1, 2, 3].map(idx => (
            <div
              key={idx}
              className={`w-4 h-4 rounded-full border transition-all duration-200 ${
                pin.length > idx
                  ? 'bg-indigo-500 border-indigo-400 scale-110 shadow-[0_0_10px_rgba(99,102,241,0.5)]'
                  : 'border-white/20 bg-white/5'
              }`}
            />
          ))}
        </div>

        {error && (
          <div className="flex items-center justify-center gap-1.5 text-xs text-rose-400 mb-4 animate-fade-in">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-3 max-w-[260px] mx-auto mb-4">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
            <button
              key={num}
              type="button"
              onClick={() => handleDigit(num)}
              className="h-14 rounded-2xl bg-white/5 hover:bg-white/10 active:bg-white/20 border border-white/5 text-lg font-medium text-white transition-all active:scale-95 flex items-center justify-center"
            >
              {num}
            </button>
          ))}
          <button
            type="button"
            onClick={handleDelete}
            className="h-14 rounded-2xl bg-white/5 hover:bg-white/10 active:bg-white/20 border border-white/5 text-xs font-semibold text-zinc-400 transition-all active:scale-95 flex items-center justify-center"
          >
            Delete
          </button>
          <button
            type="button"
            onClick={() => handleDigit('0')}
            className="h-14 rounded-2xl bg-white/5 hover:bg-white/10 active:bg-white/20 border border-white/5 text-lg font-medium text-white transition-all active:scale-95 flex items-center justify-center"
          >
            0
          </button>
          {hasBiometric ? (
            <button
              type="button"
              onClick={() => attemptUnlock(pin)}
              className="h-14 rounded-2xl bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 text-indigo-400 transition-all active:scale-95 flex items-center justify-center"
              title="Biometric Authentication"
            >
              <Fingerprint className="w-6 h-6" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => attemptUnlock(pin)}
              className="h-14 rounded-2xl bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/30 text-xs font-semibold text-indigo-300 transition-all active:scale-95 flex items-center justify-center"
            >
              OK
            </button>
          )}
        </div>

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-zinc-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500/70" />
          <span>Local Hardware Protected</span>
        </div>
      </div>
    </div>
  )
}
