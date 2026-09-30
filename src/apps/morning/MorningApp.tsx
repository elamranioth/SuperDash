import { useState, useEffect, useMemo } from 'react'
import {
  Sunrise,
  Sun,
  Sunset,
  Moon,
  Clock,
  CheckCircle2,
  Circle,
  Calendar as CalIcon,
  CheckSquare,
  Bell,
  Scale,
  Wallet,
  Target,
  Coins,
  BookMarked,
  Lightbulb,
  Edit3,
  Settings,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  Sparkles,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff
} from 'lucide-react'
import {
  morningAggregatorService,
  MorningAggregatedData,
  DEFAULT_MORNING_SECTIONS
} from '@/services/morning'
import { MorningPreferences, MorningSectionId, Hearing, TaskItem, CalendarEvent, ReminderItem } from '@/types'
import { formatMoney } from '@/services/finance'
import GlassPanel from '@/components/LiquidGlass/GlassPanel'
import GlassButton from '@/components/LiquidGlass/GlassButton'
import GlassModal from '@/components/LiquidGlass/GlassModal'
import AppHeader from '@/components/AppWindow/AppHeader'
import { sounds } from '@/utils/sound'

interface MorningAppProps {
  onOpenApp?: (appId: string, customProps?: Record<string, unknown>) => void
}

export default function MorningApp({ onOpenApp }: MorningAppProps) {
  const [data, setData] = useState<MorningAggregatedData | null>(null)
  const [prefs, setPrefs] = useState<MorningPreferences>({
    sectionOrder: DEFAULT_MORNING_SECTIONS,
    hiddenSections: [],
    showIdeaOfTheDay: true
  })
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())

  // Priorities local state
  const [p1Text, setP1Text] = useState('')
  const [p2Text, setP2Text] = useState('')
  const [p3Text, setP3Text] = useState('')

  // Note local state
  const [noteText, setNoteText] = useState('')

  // Load Data
  const loadBriefing = async () => {
    const p = await morningAggregatorService.getPreferences()
    setPrefs(p)
    const briefing = await morningAggregatorService.getMorningBriefing()
    setData(briefing)
    setP1Text(briefing.priorities[0]?.text || '')
    setP2Text(briefing.priorities[1]?.text || '')
    setP3Text(briefing.priorities[2]?.text || '')
    setNoteText(briefing.morningNote || '')
  }

  useEffect(() => {
    loadBriefing()

    // Clock ticker
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    // Listeners for cross-app updates
    const handleRefresh = () => loadBriefing()
    window.addEventListener('superdash_task_updated', handleRefresh)
    window.addEventListener('superdash_focus_updated', handleRefresh)
    window.addEventListener('superdash_hearings_action', handleRefresh)
    window.addEventListener('superdash_ideas_updated', handleRefresh)
    window.addEventListener('superdash_decisions_updated', handleRefresh)

    return () => {
      clearInterval(timer)
      window.removeEventListener('superdash_task_updated', handleRefresh)
      window.removeEventListener('superdash_focus_updated', handleRefresh)
      window.removeEventListener('superdash_hearings_action', handleRefresh)
      window.removeEventListener('superdash_ideas_updated', handleRefresh)
      window.removeEventListener('superdash_decisions_updated', handleRefresh)
    }
  }, [])

  // Greeting based on time of day
  const greeting = useMemo(() => {
    const hours = currentTime.getHours()
    if (hours >= 4 && hours < 12) return { text: 'GOOD MORNING', icon: Sunrise, sub: 'Here’s your day.' }
    if (hours >= 12 && hours < 17) return { text: 'GOOD AFTERNOON', icon: Sun, sub: 'Here’s your afternoon agenda.' }
    if (hours >= 17 && hours < 21) return { text: 'GOOD EVENING', icon: Sunset, sub: 'Wrapping up your day.' }
    return { text: 'GOOD NIGHT', icon: Moon, sub: 'Prepare for tomorrow.' }
  }, [currentTime])

  // Open external app
  const openApp = (appId: string, customProps?: Record<string, unknown>) => {
    sounds.playClick()
    if (onOpenApp) {
      onOpenApp(appId, customProps)
    } else if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('superdash_open_app', { detail: { appId, customProps } }))
    }
  }

  // Priority toggles
  const handleTogglePriority = async (index: number) => {
    sounds.playClick()
    await morningAggregatorService.togglePriority(index)
    loadBriefing()
  }

  const handlePriorityBlur = async (index: number, text: string) => {
    await morningAggregatorService.setPriority(index, text)
  }

  // Note autosave on blur
  const handleNoteBlur = async () => {
    await morningAggregatorService.saveMorningNote(noteText)
  }

  // Toggle Task Completion directly from Morning
  const handleToggleTask = async (taskId: string) => {
    sounds.playClick()
    await morningAggregatorService.completeTask(taskId)
    loadBriefing()
  }

  // Customization Section toggling and reordering
  const toggleSectionVisibility = async (secId: MorningSectionId) => {
    sounds.playClick()
    const isHidden = prefs.hiddenSections.includes(secId)
    const newHidden = isHidden
      ? prefs.hiddenSections.filter(s => s !== secId)
      : [...prefs.hiddenSections, secId]
    const updated = { ...prefs, hiddenSections: newHidden }
    setPrefs(updated)
    await morningAggregatorService.savePreferences(updated)
  }

  const moveSectionOrder = async (index: number, direction: 'up' | 'down') => {
    sounds.playClick()
    const targetIdx = direction === 'up' ? index - 1 : index + 1
    if (targetIdx < 0 || targetIdx >= prefs.sectionOrder.length) return

    const newOrder = [...prefs.sectionOrder]
    const temp = newOrder[index]
    newOrder[index] = newOrder[targetIdx]
    newOrder[targetIdx] = temp

    const updated = { ...prefs, sectionOrder: newOrder }
    setPrefs(updated)
    await morningAggregatorService.savePreferences(updated)
  }

  const formatHumanDuration = (totalSec: number) => {
    const hours = Math.floor(totalSec / 3600)
    const mins = Math.floor((totalSec % 3600) / 60)
    if (hours > 0) return `${hours}h ${mins > 0 ? `${mins}m` : ''}`
    return `${mins}m`
  }

  if (!data) {
    return (
      <div className="h-full flex items-center justify-center p-8 text-slate-400">
        <Sunrise className="w-8 h-8 animate-pulse text-amber-400 mr-2" />
        <span>Preparing your morning briefing...</span>
      </div>
    )
  }

  const GreetingIcon = greeting.icon

  return (
    <div className="h-full flex flex-col overflow-hidden select-none">
      {/* Standard AppHeader */}
      <AppHeader
        title="Morning Briefing"
        subtitle={`${data.formattedDate} • Daily executive briefing & schedule`}
        icon={Sunrise}
        gradient="from-amber-500 to-rose-500"
        primaryAction={{
          label: 'Customize',
          icon: Settings,
          onClick: () => setIsCustomizeOpen(true)
        }}
      />

      <div className="flex-1 overflow-y-auto p-4 md:p-8 max-w-5xl mx-auto w-full">
        {/* 1. Header & Time Greeting Hero */}
        <div className="flex items-center gap-4 mb-8 shrink-0 p-5 rounded-3xl liquid-glass border border-white/10">
          <div className="p-3.5 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400">
            <GreetingIcon className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
              {greeting.text}
            </h1>
            <p className="text-xs md:text-sm text-slate-400 font-medium mt-0.5">
              {data.formattedDate} • <span className="text-slate-300 font-mono">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </p>
            <p className="text-xs text-amber-300/80 italic mt-0.5">"{greeting.sub}"</p>
          </div>
        </div>

      {/* 2. Top Priorities (Intentionally limited to 3 items) */}
      {!prefs.hiddenSections.includes('priorities') && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Today's 3 Priorities
            </span>
            <span className="text-[11px] text-slate-500">Focus on what matters most</span>
          </div>

          <div className="space-y-2">
            {[
              { idx: 0, text: p1Text, setText: setP1Text, item: data.priorities[0] },
              { idx: 1, text: p2Text, setText: setP2Text, item: data.priorities[1] },
              { idx: 2, text: p3Text, setText: setP3Text, item: data.priorities[2] }
            ].map(({ idx, text, setText, item }) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-3 rounded-2xl liquid-glass border border-white/10 focus-within:border-amber-400/40 transition-all shadow-md"
              >
                <button
                  type="button"
                  onClick={() => handleTogglePriority(idx)}
                  className="text-slate-400 hover:text-amber-400 transition shrink-0"
                >
                  {item?.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-400/20" />
                  ) : (
                    <Circle className="w-5 h-5" />
                  )}
                </button>
                <span className="font-mono text-xs text-amber-400/80 font-bold shrink-0">
                  {idx + 1}.
                </span>
                <input
                  type="text"
                  value={text}
                  onChange={e => setText(e.target.value)}
                  onBlur={() => handlePriorityBlur(idx, text)}
                  placeholder={`Priority ${idx + 1}...`}
                  className={`flex-1 bg-transparent border-none text-xs md:text-sm text-white focus:outline-none placeholder-slate-500 ${
                    item?.completed ? 'line-through text-slate-400' : ''
                  }`}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grid of Modular Daily Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* SECTION: FOCUS */}
        {!prefs.hiddenSections.includes('focus') && (
          <div className="p-4 rounded-3xl liquid-glass border border-white/10 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5" /> Focus Today
                </span>
                <button
                  onClick={() => openApp('focus')}
                  className="text-[11px] text-indigo-300 hover:underline flex items-center gap-1 font-medium"
                >
                  Start Focus <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">
                    Goal: {formatHumanDuration(data.focusStats.todayGoalSeconds)}
                  </span>
                  <span className="font-mono text-white font-medium">
                    {formatHumanDuration(data.focusStats.todayCompletedSeconds)} completed
                  </span>
                </div>

                <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-indigo-500 transition-all duration-300"
                    style={{ width: `${Math.round(data.focusStats.todayProgressFraction * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-400">
              <span>{Math.round(data.focusStats.todayProgressFraction * 100)}% of daily goal reached</span>
              {data.focusStats.streakDays > 0 && (
                <span className="text-amber-300 font-medium">🔥 {data.focusStats.streakDays} day streak</span>
              )}
            </div>
          </div>
        )}

        {/* SECTION: HEARINGS */}
        {!prefs.hiddenSections.includes('hearings') && (
          <div className="p-4 rounded-3xl liquid-glass border border-white/10 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5" /> Hearings Today
                </span>
                <button
                  onClick={() => openApp('hearings')}
                  className="text-[11px] text-amber-300 hover:underline flex items-center gap-1 font-medium"
                >
                  Open Hearings <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {data.hearingsToday.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-3">No court hearings scheduled today</p>
              ) : (
                <div className="space-y-1.5 mt-2">
                  {data.hearingsToday.slice(0, 3).map(h => (
                    <div
                      key={h.id}
                      onClick={() => openApp('hearings', { initialHearingId: h.id })}
                      className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] cursor-pointer transition text-xs flex items-center justify-between"
                    >
                      <div>
                        <span className="font-semibold text-white">{h.clientName}</span>
                        <span className="text-slate-400 ml-2 font-mono text-[11px]">{h.caseNumber}</span>
                      </div>
                      <span className="font-mono text-amber-300 text-[11px]">{h.hearingTime || 'Today'}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* SECTION: TASKS */}
        {!prefs.hiddenSections.includes('tasks') && (
          <div className="p-4 rounded-3xl liquid-glass border border-white/10 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <CheckSquare className="w-3.5 h-3.5" /> Tasks Today
                </span>
                <button
                  onClick={() => openApp('tasks')}
                  className="text-[11px] text-emerald-300 hover:underline flex items-center gap-1 font-medium"
                >
                  Open Tasks <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {data.tasksToday.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-3">All urgent tasks completed!</p>
              ) : (
                <div className="space-y-1 mt-1">
                  {data.tasksToday.slice(0, 4).map(task => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-1.5 rounded-xl hover:bg-white/[0.04] transition text-xs"
                    >
                      <button
                        type="button"
                        onClick={() => handleToggleTask(task.id)}
                        className="flex items-center gap-2 text-left flex-1"
                      >
                        {task.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-slate-400 hover:text-emerald-400 shrink-0" />
                        )}
                        <span className={`text-slate-200 line-clamp-1 ${task.completed ? 'line-through text-slate-500' : ''}`}>
                          {task.title}
                        </span>
                      </button>
                      <span className="text-[10px] text-slate-500 uppercase px-1.5 py-0.5 rounded bg-white/[0.05]">
                        {task.priority}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* SECTION: CALENDAR & SCHEDULE */}
        {!prefs.hiddenSections.includes('calendar') && (
          <div className="p-4 rounded-3xl liquid-glass border border-white/10 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                  <CalIcon className="w-3.5 h-3.5" /> Today's Schedule
                </span>
                <button
                  onClick={() => openApp('calendar')}
                  className="text-[11px] text-rose-300 hover:underline flex items-center gap-1 font-medium"
                >
                  Open Calendar <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {data.calendarEventsToday.length === 0 && data.remindersToday.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-3">No scheduled meetings or events for today.</p>
              ) : (
                <div className="space-y-1.5 mt-2">
                  {data.calendarEventsToday.map(evt => (
                    <div
                      key={evt.id}
                      className="p-2 rounded-xl bg-white/[0.04] text-xs flex items-center justify-between"
                    >
                      <span className="font-semibold text-white">{evt.title}</span>
                      <span className="text-rose-300 font-mono text-[11px]">
                        {evt.startTime || 'All Day'}
                      </span>
                    </div>
                  ))}
                  {data.remindersToday.map(rem => (
                    <div
                      key={rem.id}
                      className="p-2 rounded-xl bg-white/[0.04] text-xs flex items-center justify-between"
                    >
                      <span className="text-slate-300 flex items-center gap-1.5">
                        <Bell className="w-3 h-3 text-pink-400" /> {rem.title}
                      </span>
                      <span className="text-slate-400 font-mono text-[11px]">{rem.time || 'Alert'}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* SECTION: FINANCE SNAPSHOT */}
        {!prefs.hiddenSections.includes('finance') && data.financeSummary && (
          <div className="p-4 rounded-3xl liquid-glass border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5" /> Finance — This Month
              </span>
              <button
                onClick={() => openApp('finance')}
                className="text-[11px] text-emerald-300 hover:underline flex items-center gap-1 font-medium"
              >
                Open Finance <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-2">
              <div className="p-2.5 rounded-xl bg-white/[0.04] text-center">
                <div className="text-[10px] uppercase text-slate-400 font-semibold">Received</div>
                <div className="text-xs md:text-sm font-bold text-emerald-400 font-mono mt-0.5">
                  {formatMoney(data.financeSummary.receivedMonth, data.financeSummary.currency)}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-white/[0.04] text-center">
                <div className="text-[10px] uppercase text-slate-400 font-semibold">Expenses</div>
                <div className="text-xs md:text-sm font-bold text-rose-400 font-mono mt-0.5">
                  {formatMoney(data.financeSummary.expensesMonth, data.financeSummary.currency)}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-white/[0.04] text-center">
                <div className="text-[10px] uppercase text-slate-400 font-semibold">Outstanding</div>
                <div className="text-xs md:text-sm font-bold text-amber-400 font-mono mt-0.5">
                  {formatMoney(data.financeSummary.outstanding, data.financeSummary.currency)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION: MARKETS */}
        {!prefs.hiddenSections.includes('markets') && data.markets.length > 0 && (
          <div className="p-4 rounded-3xl liquid-glass border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5" /> Live Markets
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Updated</span>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-2">
              {data.markets.map(m => (
                <div key={m.id} className="p-2.5 rounded-xl bg-white/[0.04] text-center">
                  <div className="text-[10px] uppercase text-slate-400 font-semibold">{m.name}</div>
                  <div className="text-xs md:text-sm font-bold text-white font-mono mt-0.5">
                    {m.isCrypto ? `$${m.price.toLocaleString()}` : m.price.toFixed(3)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION: DECISIONS TO REVIEW */}
        {!prefs.hiddenSections.includes('decisions') && (
          <div className="p-4 rounded-3xl liquid-glass border border-white/10 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                  <BookMarked className="w-3.5 h-3.5" /> Decisions to Review
                </span>
                <button
                  onClick={() => openApp('decisionbook')}
                  className="text-[11px] text-blue-300 hover:underline flex items-center gap-1 font-medium"
                >
                  Decision Book <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {data.decisionsDue.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-2">No reviews scheduled for today.</p>
              ) : (
                <div className="space-y-1.5 mt-1">
                  {data.decisionsDue.slice(0, 2).map(d => (
                    <div
                      key={d.id}
                      onClick={() => openApp('decisionbook', { initialDecisionId: d.id })}
                      className="p-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 cursor-pointer transition text-xs flex items-center justify-between"
                    >
                      <span className="font-semibold text-white line-clamp-1">{d.title}</span>
                      <span className="text-amber-300 font-mono text-[10px] shrink-0 ml-2">Review Due</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* SECTION: IDEA OF THE DAY */}
        {!prefs.hiddenSections.includes('idea') && data.ideaOfTheDay && (
          <div className="p-4 rounded-3xl liquid-glass border border-white/10 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5" /> Rediscover an Idea
                </span>
                <button
                  onClick={() => openApp('ideas')}
                  className="text-[11px] text-amber-300 hover:underline flex items-center gap-1 font-medium"
                >
                  Open Ideas <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div
                onClick={() => openApp('ideas', { initialIdeaId: data.ideaOfTheDay?.id })}
                className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 mt-1 cursor-pointer hover:bg-amber-500/20 transition"
              >
                <h4 className="font-semibold text-xs md:text-sm text-white mb-1">
                  "{data.ideaOfTheDay.title}"
                </h4>
                {data.ideaOfTheDay.description && (
                  <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                    {data.ideaOfTheDay.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SECTION: MORNING NOTE */}
      {!prefs.hiddenSections.includes('note') && (
        <div className="mb-6 p-4 rounded-3xl liquid-glass border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Edit3 className="w-3.5 h-3.5 text-indigo-400" /> Morning Note
            </span>
            <span className="text-[10px] text-slate-500">Autosaves for {data.dateStr}</span>
          </div>
          <textarea
            rows={2}
            value={noteText}
            onChange={e => setNoteText(e.target.value)}
            onBlur={handleNoteBlur}
            placeholder="Today's mindset, personal reflection, key reminder..."
            className="w-full bg-transparent border-none text-xs md:text-sm text-white focus:outline-none placeholder-slate-500 resize-none leading-relaxed"
          />
        </div>
      )}
      </div>

      {/* Customize Morning Modal */}
      <GlassModal
        isOpen={isCustomizeOpen}
        onClose={() => setIsCustomizeOpen(false)}
        title={
          <div className="flex items-center gap-2 text-white">
            <Settings className="w-4 h-4 text-amber-400" />
            <span>Customize Morning Briefing</span>
          </div>
        }
        maxWidth="max-w-md"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-400">
            Show, hide, or reorder the modules that make up your morning briefing:
          </p>

          <div className="space-y-1.5">
            {prefs.sectionOrder.map((secId, idx) => {
              const isHidden = prefs.hiddenSections.includes(secId)
              return (
                <div
                  key={secId}
                  className="flex items-center justify-between p-2 rounded-xl bg-white/[0.04] border border-white/10"
                >
                  <span className={`font-semibold capitalize ${isHidden ? 'text-slate-500' : 'text-white'}`}>
                    {secId}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => toggleSectionVisibility(secId)}
                      className={`p-1 rounded-lg transition ${
                        isHidden ? 'text-slate-500 hover:text-white' : 'text-emerald-400'
                      }`}
                      title={isHidden ? 'Show section' : 'Hide section'}
                    >
                      {isHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => moveSectionOrder(idx, 'up')}
                      className="p-1 rounded-lg text-slate-400 hover:text-white disabled:opacity-30"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      disabled={idx === prefs.sectionOrder.length - 1}
                      onClick={() => moveSectionOrder(idx, 'down')}
                      className="p-1 rounded-lg text-slate-400 hover:text-white disabled:opacity-30"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="pt-3 border-t border-white/10 text-right">
            <GlassButton
              variant="primary"
              size="sm"
              onClick={() => setIsCustomizeOpen(false)}
            >
              Done
            </GlassButton>
          </div>
        </div>
      </GlassModal>
    </div>
  )
}
