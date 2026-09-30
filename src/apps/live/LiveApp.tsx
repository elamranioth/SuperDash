import { useState, useEffect } from 'react'
import {
  Sparkles,
  Maximize2,
  Settings,
  Shield,
  X,
  ArrowLeft,
  Bell
} from 'lucide-react'
import { LiveMemory, LivePerson, LivePreferences } from '@/types'
import { liveRepository } from '@/services/live'
import { sounds } from '@/utils/sound'
import LiveIcon from './LiveIcon'
import NowWorld from './NowWorld'
import KeepWorld from './KeepWorld'
import HumanWorld from './HumanWorld'
import StayModal from './StayModal'
import GlassPanel from '@/components/LiquidGlass/GlassPanel'

export type LiveWorld = 'NOW' | 'KEEP' | 'HUMAN'

interface LiveAppProps {
  initialWorld?: LiveWorld
}

export default function LiveApp({ initialWorld = 'NOW' }: LiveAppProps) {
  const [currentWorld, setCurrentWorld] = useState<LiveWorld>(initialWorld)
  const [stayOpen, setStayOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

  // Data
  const [memories, setMemories] = useState<LiveMemory[]>([])
  const [people, setPeople] = useState<LivePerson[]>([])
  const [preferences, setPreferences] = useState<LivePreferences>({
    atmospherePreference: 'auto',
    includeMemoriesInSearch: false,
    notificationsEnabled: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00'
  })

  // Load data
  useEffect(() => {
    Promise.all([
      liveRepository.getMemories(),
      liveRepository.getPeople(),
      liveRepository.getPreferences()
    ]).then(([mems, ppl, prefs]) => {
      setMemories(mems)
      setPeople(ppl)
      setPreferences(prefs)
    })
  }, [])

  // Memory handlers
  const handleSaveMemory = (memory: LiveMemory) => {
    setMemories(prev => [memory, ...prev.filter(m => m.id !== memory.id)])
  }

  const handleDeleteMemory = async (id: string) => {
    await liveRepository.deleteMemory(id)
    setMemories(prev => prev.filter(m => m.id !== id))
  }

  // People handlers
  const handleSavePerson = (person: LivePerson) => {
    setPeople(prev => [person, ...prev.filter(p => p.id !== person.id)])
  }

  const handleDeletePerson = async (id: string) => {
    await liveRepository.deletePerson(id)
    setPeople(prev => prev.filter(p => p.id !== id))
  }

  // Toggle search privacy
  const handleToggleSearchPrivacy = async () => {
    sounds.playClick()
    const nextVal = !preferences.includeMemoriesInSearch
    const updated = await liveRepository.savePreferences({ includeMemoriesInSearch: nextVal })
    setPreferences(updated)
  }

  // Toggle notifications
  const handleToggleNotifications = async () => {
    sounds.playClick()
    const nextVal = !preferences.notificationsEnabled
    const updated = await liveRepository.savePreferences({ notificationsEnabled: nextVal })
    setPreferences(updated)
  }

  return (
    <div className="flex flex-col h-full w-full bg-gradient-to-b from-slate-950 via-slate-900 to-black text-slate-100 overflow-hidden select-none relative font-sans">
      {/* Quiet Top Navigation Bar */}
      <header className="flex items-center justify-between px-3 sm:px-6 py-2 sm:py-3 border-b border-white/10 bg-slate-950/60 backdrop-blur-xl z-20 flex-shrink-0">
        {/* Brand */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <LiveIcon className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 stroke-[1.75]" />
          <span className="text-xs sm:text-sm font-semibold tracking-wider text-white">LIVE</span>
        </div>

        {/* The Three Worlds Switcher */}
        <div className="flex items-center gap-0.5 sm:gap-1 bg-white/5 p-0.5 sm:p-1 rounded-full border border-white/10 text-xs">
          <button
            onClick={() => {
              sounds.playClick()
              setCurrentWorld('NOW')
            }}
            className={`px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-full font-serif transition-all text-xs ${
              currentWorld === 'NOW'
                ? 'bg-white/15 text-white font-medium shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            NOW
          </button>

          <button
            onClick={() => {
              sounds.playClick()
              setCurrentWorld('KEEP')
            }}
            className={`px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-full font-serif transition-all text-xs ${
              currentWorld === 'KEEP'
                ? 'bg-white/15 text-rose-300 font-medium shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            KEEP
          </button>

          <button
            onClick={() => {
              sounds.playClick()
              setCurrentWorld('HUMAN')
            }}
            className={`px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-full font-serif transition-all text-xs ${
              currentWorld === 'HUMAN'
                ? 'bg-white/15 text-amber-300 font-medium shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            HUMAN
          </button>
        </div>

        {/* Right side controls: Stay & Settings */}
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => {
              sounds.playClick()
              setStayOpen(true)
            }}
            className="flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 text-xs text-amber-300 border border-white/10 transition-colors"
            title="Stay here for a little while"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Stay</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick()
              setSettingsOpen(!settingsOpen)
            }}
            className={`p-1.5 rounded-lg transition-colors ${
              settingsOpen ? 'text-amber-300 bg-white/10' : 'text-slate-400 hover:text-white'
            }`}
            title="Privacy & Quiet Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Experience Stage */}
      <main className="flex-1 overflow-hidden relative flex flex-col">
        {settingsOpen ? (
          /* Privacy & Quiet Settings Panel */
          <div className="flex-1 overflow-y-auto p-6 md:p-12 max-w-xl mx-auto w-full select-text animate-in fade-in">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
              <h2 className="text-xl font-serif text-white">
                Privacy & Quiet
              </h2>
              <button
                onClick={() => setSettingsOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              LIVE protects your inner quiet. There are no tracking scripts, analytics, or external servers. Your reflections remain private on your computer.
            </p>

            <div className="space-y-4">
              <GlassPanel intensity="subtle" className="p-5 rounded-2xl border border-white/10 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
                      <Shield className="w-4 h-4 text-amber-400" />
                      <span>Include Memories in Universal Search</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      By default, private memories, letters, and reflections are strictly excluded from SuperDash Global Search (⌘K). Enable this only if you want memories to appear in global search results.
                    </p>
                  </div>

                  <button
                    onClick={handleToggleSearchPrivacy}
                    className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 flex-shrink-0 ${
                      preferences.includeMemoriesInSearch ? 'bg-amber-500' : 'bg-white/20'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                        preferences.includeMemoriesInSearch ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </GlassPanel>

              <GlassPanel intensity="subtle" className="p-5 rounded-2xl border border-white/10 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
                      <Bell className="w-4 h-4 text-rose-400" />
                      <span>Rare Gentle Notifications</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Default is OFF. If enabled, LIVE will only send infrequent, quiet invitations like "The sky is still there" or "Leave a little part of today unplanned." No streaks, no demands.
                    </p>
                  </div>

                  <button
                    onClick={handleToggleNotifications}
                    className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 flex-shrink-0 ${
                      preferences.notificationsEnabled ? 'bg-amber-500' : 'bg-white/20'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                        preferences.notificationsEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </GlassPanel>

              <div className="p-5 rounded-2xl bg-white/5 border border-white/5 space-y-2 text-center">
                <p className="text-xs text-slate-300 font-serif italic leading-relaxed">
                  "LIVE should not teach a person how to live. It should occasionally remind them that they already are."
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {currentWorld === 'NOW' && (
              <NowWorld
                onGoToKeep={() => setCurrentWorld('KEEP')}
                onGoToHuman={() => setCurrentWorld('HUMAN')}
              />
            )}

            {currentWorld === 'KEEP' && (
              <KeepWorld
                memories={memories}
                people={people}
                onSaveMemory={handleSaveMemory}
                onDeleteMemory={handleDeleteMemory}
                onSavePerson={handleSavePerson}
                onDeletePerson={handleDeletePerson}
              />
            )}

            {currentWorld === 'HUMAN' && (
              <HumanWorld />
            )}
          </>
        )}
      </main>

      {/* Stay Modal */}
      <StayModal isOpen={stayOpen} onClose={() => setStayOpen(false)} />
    </div>
  )
}
