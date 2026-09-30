import { useState, useEffect, useMemo } from 'react'
import {
  Sparkles,
  RefreshCw,
  CheckCircle2,
  DownloadCloud,
  ExternalLink,
  ShieldCheck,
  History,
  Layers,
  Smartphone,
  Globe,
  Tag,
  Check,
  AlertCircle
} from 'lucide-react'
import {
  updateService,
  ReleaseInfo,
  HistoricalRelease,
  ChangeType
} from '@/services/updateService'
import {
  SUPERDASH_VERSION,
  SUPERDASH_BUILD_DATE,
  getAppPlatform
} from '@/version'
import { sounds } from '@/utils/sound'
import MobileAppShell from '@/components/Mobile/MobileAppShell'

interface UpdatesAppProps {
  onOpenApp?: (appId: string) => void
  isEmbedded?: boolean
}

export default function UpdatesApp({ onOpenApp, isEmbedded = false }: UpdatesAppProps) {
  const [loading, setLoading] = useState<boolean>(true)
  const [checking, setChecking] = useState<boolean>(false)
  const [release, setRelease] = useState<ReleaseInfo | null>(null)
  const [history, setHistory] = useState<HistoricalRelease[]>([])
  const [isUpdateAvail, setIsUpdateAvail] = useState<boolean>(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'current' | 'history' | 'safety'>('current')
  const [filterType, setFilterType] = useState<ChangeType | 'ALL'>('ALL')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null)

  const platform = useMemo(() => getAppPlatform(), [])

  // Initial check on mount
  useEffect(() => {
    let mounted = true
    async function loadData() {
      setLoading(true)
      const res = await updateService.checkForUpdates()
      const hist = await updateService.getReleaseHistory()
      if (mounted) {
        setRelease(res.release)
        setHistory(hist)
        setIsUpdateAvail(res.updateAvailable)
        if (res.error) setErrorMsg(res.error)
        setLoading(false)
        // Mark as viewed
        updateService.markUpdatesAsViewed(SUPERDASH_VERSION)
      }
    }
    loadData()
    return () => {
      mounted = false
    }
  }, [])

  // Manual Check
  const handleCheckForUpdates = async () => {
    sounds.playClick()
    setChecking(true)
    setErrorMsg(null)
    setStatusFeedback(null)

    const res = await updateService.checkForUpdates()
    const hist = await updateService.getReleaseHistory()
    setRelease(res.release)
    setHistory(hist)
    setIsUpdateAvail(res.updateAvailable)
    if (res.error) setErrorMsg(res.error)

    setChecking(false)
    if (res.updateAvailable) {
      sounds.playSuccess()
      setStatusFeedback(`New version ${res.release?.version} is available!`)
    } else {
      sounds.playSuccess()
      setStatusFeedback('You are running the latest version.')
    }

    setTimeout(() => {
      setStatusFeedback(null)
    }, 4000)
  }

  // Filtered changes
  const filteredChanges = useMemo(() => {
    if (!release?.changes) return []
    return release.changes.filter(c => {
      if (filterType !== 'ALL' && c.type !== filterType) return false
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        return (
          c.appName.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.appId.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [release, filterType, searchQuery])

  const counts = useMemo(() => {
    if (!release?.changes) return { all: 0, new: 0, improved: 0, fixed: 0 }
    return {
      all: release.changes.length,
      new: release.changes.filter(c => c.type === 'NEW').length,
      improved: release.changes.filter(c => c.type === 'IMPROVED').length,
      fixed: release.changes.filter(c => c.type === 'FIXED').length
    }
  }, [release])

  const platformLabel =
    platform === 'android'
      ? 'Android App'
      : platform === 'pwa'
      ? 'Progressive Web App'
      : 'Web App'

  const body = (
    <div className={`text-slate-100 flex flex-col h-full overflow-hidden ${isEmbedded ? 'bg-transparent' : 'bg-slate-950/95'}`}>
      {/* Top Banner / Status Hero */}
      <div className="p-4 sm:p-6 border-b border-white/10 bg-gradient-to-br from-indigo-950/40 via-black/40 to-black/60 shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-6 h-6 text-indigo-300" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg font-bold text-white tracking-tight">SuperDash</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-xs font-mono font-bold text-indigo-300">
                  v{SUPERDASH_VERSION}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-slate-400">
                  {platform === 'android' ? (
                    <Smartphone className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Globe className="w-3 h-3 text-cyan-400" />
                  )}
                  {platformLabel}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Build date: {SUPERDASH_BUILD_DATE} · Release channel: Stable
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 self-start sm:self-center">
            <button
              onClick={handleCheckForUpdates}
              disabled={checking}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold shadow-md transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin' : ''}`} />
              <span>{checking ? 'Checking...' : 'Check for Updates'}</span>
            </button>

            {platform === 'android' && release?.apkDownloadUrl && (
              <a
                href={release.apkDownloadUrl}
                download
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-semibold transition"
              >
                <DownloadCloud className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Download APK</span>
              </a>
            )}
          </div>
        </div>

        {/* Feedback pill */}
        {statusFeedback && (
          <div className="mt-3.5 p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{statusFeedback}</span>
          </div>
        )}

        {errorMsg && (
          <div className="mt-3.5 p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-xs text-amber-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 mt-5 overflow-x-auto no-scrollbar border-b border-white/5 pb-1">
          <button
            onClick={() => setActiveTab('current')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 ${
              activeTab === 'current'
                ? 'bg-white/20 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            What's New in v{SUPERDASH_VERSION} ({counts.all})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 ${
              activeTab === 'history'
                ? 'bg-white/20 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Release History
          </button>
          <button
            onClick={() => setActiveTab('safety')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 ${
              activeTab === 'safety'
                ? 'bg-white/20 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Data Safety Guarantee
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400 space-y-3">
            <RefreshCw className="w-6 h-6 animate-spin text-indigo-400" />
            <p className="text-xs">Loading release information...</p>
          </div>
        ) : activeTab === 'current' ? (
          <>
            {/* Release Summary Card */}
            {release && (
              <div className="p-4 sm:p-5 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 backdrop-blur-md">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <h2 className="text-sm font-bold text-white">{release.title}</h2>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Released: {release.releaseDate}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  {release.summary}
                </p>

                {release.highlights && release.highlights.length > 0 && (
                  <div className="mt-3.5 pt-3 border-t border-white/10">
                    <div className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider mb-2">
                      Key Highlights
                    </div>
                    <ul className="space-y-1.5">
                      {release.highlights.map((h, i) => (
                        <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Filter Bar & Search */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-1 bg-black/40 border border-white/10 p-1 rounded-xl overflow-x-auto no-scrollbar">
                <button
                  onClick={() => setFilterType('ALL')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition shrink-0 ${
                    filterType === 'ALL'
                      ? 'bg-white/20 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  All ({counts.all})
                </button>
                <button
                  onClick={() => setFilterType('NEW')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition shrink-0 ${
                    filterType === 'NEW'
                      ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  New ({counts.new})
                </button>
                <button
                  onClick={() => setFilterType('IMPROVED')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition shrink-0 ${
                    filterType === 'IMPROVED'
                      ? 'bg-indigo-500/30 text-indigo-300 border border-indigo-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Improved ({counts.improved})
                </button>
                <button
                  onClick={() => setFilterType('FIXED')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition shrink-0 ${
                    filterType === 'FIXED'
                      ? 'bg-amber-500/30 text-amber-300 border border-amber-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Fixed ({counts.fixed})
                </button>
              </div>

              <input
                type="text"
                placeholder="Filter changes by app..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 transition"
              />
            </div>

            {/* Per-App Changelog List */}
            <div className="space-y-2.5">
              {filteredChanges.length === 0 ? (
                <div className="text-center py-10 text-xs text-slate-500">
                  No matching changes found.
                </div>
              ) : (
                filteredChanges.map((change, idx) => {
                  const badgeColor =
                    change.type === 'NEW'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : change.type === 'IMPROVED'
                      ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/40'

                  return (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-black/30 border border-white/10 hover:border-white/20 transition flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border ${badgeColor}`}
                          >
                            {change.type}
                          </span>
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white flex items-center gap-2">
                            <span>{change.appName}</span>
                          </div>
                          <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                            {change.description}
                          </p>
                        </div>
                      </div>

                      {onOpenApp && change.appId !== 'home' && change.appId !== 'updates' && (
                        <button
                          onClick={() => {
                            sounds.playClick()
                            onOpenApp(change.appId)
                          }}
                          className="self-end sm:self-center px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-[11px] font-semibold text-slate-300 hover:text-white transition shrink-0"
                        >
                          Open App
                        </button>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </>
        ) : activeTab === 'history' ? (
          /* Release History */
          <div className="space-y-4">
            {history.map((h, i) => (
              <div
                key={i}
                className="p-4 sm:p-5 rounded-2xl bg-black/30 border border-white/10 hover:border-white/20 transition"
              >
                <div className="flex items-center justify-between gap-2 flex-wrap mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">v{h.version}</span>
                    <span className="text-xs text-indigo-300 font-semibold">— {h.title}</span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    {h.releaseDate}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed mb-3">
                  {h.summary}
                </p>
                {h.highlights && h.highlights.length > 0 && (
                  <ul className="space-y-1 pt-2 border-t border-white/5">
                    {h.highlights.map((hl, j) => (
                      <li key={j} className="text-xs text-slate-400 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                        <span>{hl}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        ) : (
          /* Data Safety & Migration Guarantee */
          <div className="space-y-4">
            <div className="p-4 sm:p-6 rounded-2xl bg-emerald-950/20 border border-emerald-500/30">
              <div className="flex items-center gap-3 mb-3">
                <ShieldCheck className="w-7 h-7 text-emerald-400 shrink-0" />
                <div>
                  <h3 className="text-sm font-bold text-white">Zero Data Overwrite Guarantee</h3>
                  <p className="text-xs text-slate-400">Your personal data is safe across all updates</p>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed space-y-2">
                SuperDash operates with an offline-first, client-side persistence model. Updating SuperDash
                (whether updating web assets, installing a new APK, or updating Service Worker caches)
                never erases or resets your local records.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-black/30 border border-white/10">
                <h4 className="text-xs font-bold text-white mb-1">Android APK Updates</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Installing a newer APK version overwrites application logic while preserving all Android
                  WebView localStorage and IndexedDB files untouched.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-black/30 border border-white/10">
                <h4 className="text-xs font-bold text-white mb-1">Web & PWA Updates</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Web deployments cache static assets with cache-busting hashes. Service workers refresh in the
                  background without clearing stored datasets.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  if (isEmbedded) {
    return body
  }

  return (
    <MobileAppShell title="Updates & What's New" className="bg-slate-950/95 text-slate-100 flex flex-col h-full">
      {body}
    </MobileAppShell>
  )
}
