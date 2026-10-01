import { useState, useEffect, useRef } from 'react'
import {
  Folder,
  Download,
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  HardDrive,
  Cloud,
  FileCheck,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Calendar,
  Layers,
  Check
} from 'lucide-react'
import {
  backupService,
  BackupSettings,
  BackupPackage,
  BackupManifest
} from '@/services/backup'
import { sounds } from '@/utils/sound'
import GlassPanel from '@/components/LiquidGlass/GlassPanel'
import GlassModal from '@/components/LiquidGlass/GlassModal'

export default function DataBackupSettings() {
  const [settings, setSettings] = useState<BackupSettings>({ autoBackup: 'daily' })
  const [loading, setLoading] = useState(true)
  const [backingUp, setBackingUp] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // Restore Modal State
  const [inspectModalOpen, setInspectModalOpen] = useState(false)
  const [candidatePackage, setCandidatePackage] = useState<BackupPackage | null>(null)
  const [candidateManifest, setCandidateManifest] = useState<BackupManifest | null>(null)
  const [restoring, setRestoring] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isFsaSupported = backupService.isFileSystemAccessSupported()

  useEffect(() => {
    backupService.getSettings().then(s => {
      setSettings(s)
      setLoading(false)
    })
  }, [])

  const handlePerformBackup = async () => {
    sounds.playClick()
    setBackingUp(true)
    setFeedback(null)

    const res = await backupService.performBackup()
    setBackingUp(false)

    if (res.success) {
      sounds.playSuccess()
      setFeedback({
        type: 'success',
        message: `Backup saved to ${res.location} (${(res.fileSize / 1024).toFixed(1)} KB)`
      })
      const updated = await backupService.getSettings()
      setSettings(updated)
    } else {
      setFeedback({
        type: 'error',
        message: res.error || 'Backup could not be completed'
      })
    }

    setTimeout(() => {
      setFeedback(null)
    }, 6000)
  }

  const handleConnectFolder = async () => {
    sounds.playClick()
    setFeedback(null)

    const res = await backupService.chooseBackupFolder()
    if (res.success) {
      sounds.playSuccess()
      const updated = await backupService.getSettings()
      setSettings(updated)
      setFeedback({
        type: 'success',
        message: `Connected folder "${res.folderName}". SuperDash will save backups here for automatic MEGA synchronization.`
      })
    } else if (res.error && res.error !== 'Selection cancelled') {
      setFeedback({
        type: 'error',
        message: res.error
      })
    }

    setTimeout(() => {
      setFeedback(null)
    }, 6000)
  }

  const handleDisconnectFolder = async () => {
    sounds.playClick()
    await backupService.disconnectBackupFolder()
    const updated = await backupService.getSettings()
    setSettings(updated)
    sounds.playSuccess()
    setFeedback({
      type: 'success',
      message: 'Folder disconnected. Backups will save via browser downloads.'
    })
    setTimeout(() => setFeedback(null), 4000)
  }

  const handleAutoBackupChange = async (val: 'daily' | 'weekly' | 'manual') => {
    sounds.playClick()
    const updated = await backupService.saveSettings({ autoBackup: val })
    setSettings(updated)
  }

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const inspected = await backupService.inspectBackup(text)
      if (inspected.valid && inspected.pkg && inspected.manifest) {
        sounds.playClick()
        setCandidatePackage(inspected.pkg)
        setCandidateManifest(inspected.manifest)
        setInspectModalOpen(true)
      } else {
        setFeedback({
          type: 'error',
          message: inspected.error || 'Invalid SuperDash backup file'
        })
      }
    } catch {
      setFeedback({
        type: 'error',
        message: 'Could not read backup file'
      })
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleConfirmRestore = async () => {
    if (!candidatePackage) return
    sounds.playClick()
    setRestoring(true)

    const res = await backupService.restoreBackup(candidatePackage)
    setRestoring(false)

    if (res.success) {
      sounds.playSuccess()
      setInspectModalOpen(false)
      alert('Backup restored successfully! SuperDash will now reload your workspace.')
      window.location.reload()
    } else {
      setFeedback({
        type: 'error',
        message: res.error || 'Restoration failed. Existing data was preserved.'
      })
      setInspectModalOpen(false)
    }
  }

  const formatLastBackup = (dateStr?: string) => {
    if (!dateStr) return 'Never'
    try {
      const d = new Date(dateStr)
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return dateStr
    }
  }

  const isConnectedToMega = settings.lastBackupLocation?.includes('MEGA')

  return (
    <div className="space-y-5 text-slate-100 select-none">
      {/* Hidden file input for restore */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelected}
        accept=".superdash,.json"
        className="hidden"
      />

      {/* Top Banner: Backup Status */}
      <div className="p-4 sm:p-5 rounded-2xl bg-indigo-950/30 border border-indigo-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-400/30 flex items-center justify-center shrink-0 text-indigo-300">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white uppercase tracking-wider">
                Backup Health
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                <Check className="w-3 h-3" />
                {settings.lastBackupDate ? 'Protected' : 'Pending'}
              </span>
            </div>
            <div className="text-xs text-slate-300 mt-1">
              Last backup: <span className="font-semibold text-white">{formatLastBackup(settings.lastBackupDate)}</span>
              {settings.lastBackupSize ? ` · ${(settings.lastBackupSize / 1024).toFixed(1)} KB` : ''}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Destination: <span className="text-indigo-300">{settings.lastBackupLocation || 'Local storage / Downloads'}</span>
            </div>
          </div>
        </div>

        <button
          onClick={handlePerformBackup}
          disabled={backingUp}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 disabled:opacity-50 text-white font-semibold text-xs shadow-md transition shrink-0"
        >
          <HardDrive className={`w-4 h-4 ${backingUp ? 'animate-bounce' : ''}`} />
          <span>{backingUp ? 'Backing Up...' : 'Back Up Now'}</span>
        </button>
      </div>

      {/* Feedback Alert */}
      {feedback && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center gap-2.5 ${
            feedback.type === 'success'
              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
              : 'bg-amber-500/20 border-amber-500/40 text-amber-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Primary Section: MEGA Sync / Backup Destination */}
      <GlassPanel className="p-4 sm:p-5 space-y-3.5">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
          <Cloud className="w-4 h-4 text-sky-400" />
          <span>Backup Location (MEGA Sync)</span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          SuperDash keeps your data independent from external login credentials. Simply select a folder
          synchronized by your desktop <strong className="text-white">MEGA Sync</strong> client (e.g.{' '}
          <code className="text-indigo-300 bg-white/5 px-1.5 py-0.5 rounded">MEGA/SuperDash Backups</code>).
          SuperDash saves backups locally, and MEGA automatically syncs them to the cloud.
        </p>

        <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Folder className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <div className="text-xs font-semibold text-white">
                {isConnectedToMega ? settings.lastBackupLocation : 'Default Browser Downloads'}
              </div>
              <div className="text-[11px] text-slate-400">
                {isConnectedToMega
                  ? 'Active · Retains rolling 7 daily backups automatically'
                  : 'Files are saved to your Downloads folder on demand'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isFsaSupported ? (
              <>
                <button
                  onClick={handleConnectFolder}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-400/40 text-indigo-200 text-xs font-semibold transition"
                >
                  {isConnectedToMega ? 'Change Folder' : 'Choose MEGA Folder'}
                </button>
                {isConnectedToMega && (
                  <button
                    onClick={handleDisconnectFolder}
                    className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs transition"
                  >
                    Disconnect
                  </button>
                )}
              </>
            ) : (
              <span className="text-[11px] text-slate-500 italic">
                Folder picker not supported on this browser (Downloads fallback active)
              </span>
            )}
          </div>
        </div>
      </GlassPanel>

      {/* Automatic Backups & Frequency */}
      <GlassPanel className="p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <span>Automatic Backups</span>
          </div>

          <div className="flex items-center gap-1 bg-black/40 border border-white/10 p-1 rounded-xl">
            {(['daily', 'weekly', 'manual'] as const).map(freq => (
              <button
                key={freq}
                onClick={() => handleAutoBackupChange(freq)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition capitalize ${
                  settings.autoBackup === freq
                    ? 'bg-white/20 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {freq}
              </button>
            ))}
          </div>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          {settings.autoBackup === 'daily'
            ? 'SuperDash will automatically create a backup once per day when data changes, retaining the last 7 daily snapshots.'
            : settings.autoBackup === 'weekly'
            ? 'SuperDash will create a backup once per week, keeping your backup folder clean and organized.'
            : 'Automatic backups are off. Use "Back Up Now" whenever you wish to save a snapshot.'}
        </p>
      </GlassPanel>

      {/* Restore & Portability Actions */}
      <GlassPanel className="p-4 sm:p-5 space-y-3.5">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
          <RotateCcw className="w-4 h-4 text-violet-400" />
          <span>Restore & Recovery</span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Restore from any <code className="text-indigo-300 bg-white/5 px-1.5 py-0.5 rounded">.superdash</code> or{' '}
          JSON backup file. SuperDash creates a safety snapshot of your current state prior to restoring so you can
          never accidentally lose data.
        </p>

        <div className="flex items-center gap-2.5 flex-wrap pt-1">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600/30 hover:bg-violet-600/50 border border-violet-400/40 text-violet-200 text-xs font-semibold transition active:scale-95 shadow-sm"
          >
            <Upload className="w-4 h-4" />
            <span>Restore Backup File</span>
          </button>

          <button
            onClick={handlePerformBackup}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-slate-200 text-xs font-semibold transition active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Export Portable File</span>
          </button>
        </div>
      </GlassPanel>

      {/* Inspection / Confirmation Modal Before Restore */}
      {inspectModalOpen && candidateManifest && (
        <GlassModal
          isOpen={true}
          onClose={() => setInspectModalOpen(false)}
          title="Verify & Restore Backup"
        >
          <div className="space-y-4 p-2 text-slate-100 max-h-[70vh] overflow-y-auto">
            <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 space-y-1">
              <div className="text-xs font-bold text-white flex items-center justify-between">
                <span>SuperDash v{candidateManifest.superDashVersion}</span>
                <span className="text-[11px] font-mono text-slate-400">
                  {formatLastBackup(candidateManifest.createdAt)}
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                Schema v{candidateManifest.schemaVersion} · Checksum: {candidateManifest.checksum.slice(0, 12)}…
              </p>
            </div>

            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Included Records
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Object.entries(candidateManifest.modules).map(([moduleName, count]) => (
                  <div
                    key={moduleName}
                    className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs"
                  >
                    <span className="capitalize text-slate-300">{moduleName}</span>
                    <span className="font-mono font-bold text-emerald-400">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs leading-relaxed">
              <strong>Pre-Restore Guarantee:</strong> A recovery snapshot of your current workspace will be preserved
              in local storage before restoring.
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setInspectModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-semibold transition"
              >
                Cancel
              </button>

              <button
                onClick={handleConfirmRestore}
                disabled={restoring}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>{restoring ? 'Restoring Workspace...' : 'Confirm & Restore'}</span>
              </button>
            </div>
          </div>
        </GlassModal>
      )}
    </div>
  )
}
