import { useState } from 'react'
import {
  Info,
  Copy,
  Check,
  Smartphone,
  Globe,
  Database,
  ShieldCheck,
  RefreshCw,
  Clock,
  Terminal,
  FileText
} from 'lucide-react'
import {
  SUPERDASH_VERSION,
  SUPERDASH_BUILD_DATE,
  SUPERDASH_CHANNEL,
  SUPERDASH_GITHUB_REPO,
  getAppPlatform
} from '@/version'
import { STORAGE_SCHEMA_VERSION } from '@/services/backup'
import { DIAGNOSTIC_ERRORS } from '@/components/Common/AppErrorBoundary'
import { sounds } from '@/utils/sound'
import GlassPanel from '@/components/LiquidGlass/GlassPanel'

export default function AboutDiagnosticsSettings() {
  const [copied, setCopied] = useState(false)
  const platform = getAppPlatform()

  const generateDiagnosticText = () => {
    const swState = typeof navigator !== 'undefined' && 'serviceWorker' in navigator && navigator.serviceWorker.controller
      ? 'Active / Controlling'
      : 'Inactive or Not Supported'

    const lines = [
      `=== SuperDash Diagnostics Log ===`,
      `Version: ${SUPERDASH_VERSION}`,
      `Build Date: ${SUPERDASH_BUILD_DATE}`,
      `Channel: ${SUPERDASH_CHANNEL}`,
      `Platform: ${platform}`,
      `Storage Schema: v${STORAGE_SCHEMA_VERSION}`,
      `GitHub Repository: ${SUPERDASH_GITHUB_REPO}`,
      `Service Worker: ${swState}`,
      `User Agent: ${typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown'}`,
      `Recent App Errors (${DIAGNOSTIC_ERRORS.length}):`
    ]

    if (DIAGNOSTIC_ERRORS.length === 0) {
      lines.push(`  None recorded (clean session)`)
    } else {
      DIAGNOSTIC_ERRORS.forEach((err, idx) => {
        lines.push(`  [${idx + 1}] ${err.time} - ${err.appName}: ${err.message}`)
      })
    }

    return lines.join('\n')
  }

  const handleCopyDiagnostics = async () => {
    sounds.playClick()
    try {
      await navigator.clipboard.writeText(generateDiagnosticText())
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      // ignore
    }
  }

  return (
    <div className="space-y-5 text-slate-100 select-none">
      {/* About Header Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-indigo-950/30 border border-indigo-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-400/30 flex items-center justify-center shrink-0 text-indigo-300">
            <Info className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-white tracking-tight">SuperDash</span>
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono text-xs font-bold border border-indigo-500/40">
                v{SUPERDASH_VERSION}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Personal mini-operating system with modular dashboard, minimal clutter, and private offline persistence.
            </p>
          </div>
        </div>

        <button
          onClick={handleCopyDiagnostics}
          className="flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-semibold text-white transition active:scale-95 shrink-0"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied Diagnostics' : 'Copy Diagnostics'}</span>
        </button>
      </div>

      {/* Specifications Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <GlassPanel className="p-4 space-y-1">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Release Channel</div>
          <div className="text-sm font-semibold text-white capitalize">{SUPERDASH_CHANNEL} · Stable</div>
        </GlassPanel>

        <GlassPanel className="p-4 space-y-1">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Platform Environment</div>
          <div className="text-sm font-semibold text-white flex items-center gap-2">
            {platform === 'android' ? (
              <>
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span>Android Native APK (Capacitor)</span>
              </>
            ) : (
              <>
                <Globe className="w-4 h-4 text-sky-400" />
                <span>Web / Progressive Web App</span>
              </>
            )}
          </div>
        </GlassPanel>

        <GlassPanel className="p-4 space-y-1">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Storage Schema</div>
          <div className="text-sm font-semibold text-white">Version {STORAGE_SCHEMA_VERSION} · Zero-loss migration</div>
        </GlassPanel>

        <GlassPanel className="p-4 space-y-1">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Build Timestamp</div>
          <div className="text-sm font-semibold text-white font-mono">{SUPERDASH_BUILD_DATE}</div>
        </GlassPanel>
      </div>

      {/* Diagnostics Terminal Output */}
      <GlassPanel className="p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span>Diagnostics Log (Non-Sensitive)</span>
          </div>

          <button
            onClick={handleCopyDiagnostics}
            className="text-[11px] text-indigo-300 hover:text-white transition flex items-center gap-1"
          >
            <Copy className="w-3 h-3" />
            <span>Copy</span>
          </button>
        </div>

        <pre className="p-3.5 rounded-xl bg-black/60 border border-white/10 text-[11px] font-mono text-slate-300 overflow-x-auto whitespace-pre leading-relaxed select-text">
          {generateDiagnosticText()}
        </pre>
      </GlassPanel>
    </div>
  )
}
