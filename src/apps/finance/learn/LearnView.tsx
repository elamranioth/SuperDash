import React, { useState, useEffect, useMemo } from 'react'
import {
  Wallet,
  PiggyBank,
  Landmark,
  TrendingUp,
  LineChart,
  Layers,
  FileText,
  Coins,
  Briefcase,
  Globe,
  ShieldCheck,
  Building2,
  FileSpreadsheet,
  Zap,
  ArrowLeft,
  Search,
  Check,
  CheckCircle2,
  Sparkles,
  Lightbulb,
  X,
  ChevronRight,
  BookOpen,
  HelpCircle,
  Award
} from 'lucide-react'
import GlassPanel from '@/components/LiquidGlass/GlassPanel'
import GlassButton from '@/components/LiquidGlass/GlassButton'
import { sounds } from '@/utils/sound'
import { cn } from '@/utils/cn'
import { LearnGroup, LearnLesson } from './types'
import {
  LEARN_GROUPS,
  ALL_LEARN_LESSONS,
  LESSONS_BY_GROUP,
  LESSON_MAP,
  GROUP_MAP,
  getLessonOfTheDay
} from './data'
import {
  getCompletedLessons,
  toggleLessonCompleted
} from './learnStorage'

interface LearnViewProps {
  onBackToOverview: () => void
}

// Map string icon names to Lucide icon components
function getGroupIcon(iconName: string, className = 'w-5 h-5') {
  switch (iconName) {
    case 'Wallet':
      return <Wallet className={className} />
    case 'PiggyBank':
      return <PiggyBank className={className} />
    case 'Landmark':
      return <Landmark className={className} />
    case 'TrendingUp':
      return <TrendingUp className={className} />
    case 'LineChart':
      return <LineChart className={className} />
    case 'Layers':
      return <Layers className={className} />
    case 'FileText':
      return <FileText className={className} />
    case 'Coins':
      return <Coins className={className} />
    case 'Briefcase':
      return <Briefcase className={className} />
    case 'Globe':
      return <Globe className={className} />
    case 'ShieldCheck':
      return <ShieldCheck className={className} />
    case 'Building2':
      return <Building2 className={className} />
    case 'FileSpreadsheet':
      return <FileSpreadsheet className={className} />
    case 'Zap':
      return <Zap className={className} />
    default:
      return <BookOpen className={className} />
  }
}

// Group theme accent styling
function getThemeStyles(color: string) {
  switch (color) {
    case 'emerald':
      return {
        badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        iconBg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
        progressBar: 'bg-emerald-500',
        hoverBorder: 'hover:border-emerald-500/40'
      }
    case 'teal':
      return {
        badge: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
        iconBg: 'bg-teal-500/15 text-teal-400 border-teal-500/30',
        progressBar: 'bg-teal-500',
        hoverBorder: 'hover:border-teal-500/40'
      }
    case 'cyan':
      return {
        badge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
        iconBg: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
        progressBar: 'bg-cyan-500',
        hoverBorder: 'hover:border-cyan-500/40'
      }
    case 'blue':
      return {
        badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        iconBg: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
        progressBar: 'bg-blue-500',
        hoverBorder: 'hover:border-blue-500/40'
      }
    case 'indigo':
      return {
        badge: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
        iconBg: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
        progressBar: 'bg-indigo-500',
        hoverBorder: 'hover:border-indigo-500/40'
      }
    case 'violet':
      return {
        badge: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
        iconBg: 'bg-violet-500/15 text-violet-400 border-violet-500/30',
        progressBar: 'bg-violet-500',
        hoverBorder: 'hover:border-violet-500/40'
      }
    case 'amber':
      return {
        badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        iconBg: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
        progressBar: 'bg-amber-500',
        hoverBorder: 'hover:border-amber-500/40'
      }
    case 'orange':
      return {
        badge: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
        iconBg: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
        progressBar: 'bg-orange-500',
        hoverBorder: 'hover:border-orange-500/40'
      }
    case 'sky':
      return {
        badge: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
        iconBg: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
        progressBar: 'bg-sky-500',
        hoverBorder: 'hover:border-sky-500/40'
      }
    case 'rose':
      return {
        badge: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
        iconBg: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
        progressBar: 'bg-rose-500',
        hoverBorder: 'hover:border-rose-500/40'
      }
    case 'yellow':
      return {
        badge: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
        iconBg: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
        progressBar: 'bg-yellow-500',
        hoverBorder: 'hover:border-yellow-500/40'
      }
    case 'fuchsia':
      return {
        badge: 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20',
        iconBg: 'bg-fuchsia-500/15 text-fuchsia-400 border-fuchsia-500/30',
        progressBar: 'bg-fuchsia-500',
        hoverBorder: 'hover:border-fuchsia-500/40'
      }
    case 'purple':
      return {
        badge: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
        iconBg: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
        progressBar: 'bg-purple-500',
        hoverBorder: 'hover:border-purple-500/40'
      }
    default:
      return {
        badge: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
        iconBg: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
        progressBar: 'bg-slate-400',
        hoverBorder: 'hover:border-slate-500/40'
      }
  }
}

export default function LearnView({ onBackToOverview }: LearnViewProps) {
  // Navigation State
  // selectedGroupId: string | null
  // activeLesson: LearnLesson | null
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
  const [activeLesson, setActiveLesson] = useState<LearnLesson | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([])

  // Load saved progress on mount
  useEffect(() => {
    getCompletedLessons().then(ids => {
      setCompletedLessonIds(ids)
    })
  }, [])

  // Featured Lesson of the Day
  const lessonOfTheDay = useMemo(() => getLessonOfTheDay(), [])

  // Completion lookup set
  const completedSet = useMemo(() => new Set(completedLessonIds), [completedLessonIds])

  // Overall Statistics
  const totalCompleted = completedLessonIds.length
  const totalLessons = ALL_LEARN_LESSONS.length
  const overallPercentage = Math.round((totalCompleted / (totalLessons || 1)) * 100)

  // Current selected group object
  const currentGroup = useMemo(() => {
    return selectedGroupId ? GROUP_MAP.get(selectedGroupId) : null
  }, [selectedGroupId])

  // Lessons for current group
  const currentGroupLessons = useMemo(() => {
    return selectedGroupId ? LESSONS_BY_GROUP[selectedGroupId] || [] : []
  }, [selectedGroupId])

  // Search Results
  const searchResults = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return []
    return ALL_LEARN_LESSONS.filter(l => {
      return (
        l.question.toLowerCase().includes(q) ||
        l.explanation.toLowerCase().includes(q) ||
        l.whyItMatters.toLowerCase().includes(q) ||
        l.example.toLowerCase().includes(q)
      )
    })
  }, [searchQuery])

  // Toggle lesson complete handler
  const handleToggleComplete = async (lessonId: string) => {
    sounds.playClick()
    const updated = await toggleLessonCompleted(lessonId, completedLessonIds)
    setCompletedLessonIds(updated)
    if (!completedSet.has(lessonId)) {
      sounds.playSuccess()
    }
  }

  // Handle open lesson
  const handleOpenLesson = (lesson: LearnLesson) => {
    sounds.playClick()
    setActiveLesson(lesson)
  }

  // Handle close lesson
  const handleCloseLesson = () => {
    sounds.playClick()
    setActiveLesson(null)
  }

  // Next / Previous Lesson in group
  const { prevLesson, nextLesson } = useMemo(() => {
    if (!activeLesson) return { prevLesson: null, nextLesson: null }
    const list = LESSONS_BY_GROUP[activeLesson.groupId] || []
    const idx = list.findIndex(l => l.id === activeLesson.id)
    return {
      prevLesson: idx > 0 ? list[idx - 1] : null,
      nextLesson: idx < list.length - 1 ? list[idx + 1] : null
    }
  }, [activeLesson])

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* ===================== LEARN HEADER BAR ===================== */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              sounds.playClick()
              if (activeLesson) {
                setActiveLesson(null)
              } else if (selectedGroupId) {
                setSelectedGroupId(null)
              } else {
                onBackToOverview()
              }
            }}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition flex items-center gap-1.5 text-xs"
            title="Go back"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">
              {activeLesson ? 'Back to Questions' : selectedGroupId ? 'All Topics' : 'Finance'}
            </span>
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-400" />
                {activeLesson ? (
                  <span className="truncate max-w-[220px] sm:max-w-md">1-Minute Lesson</span>
                ) : currentGroup ? (
                  currentGroup.name
                ) : (
                  'Finance Knowledge Library'
                )}
              </h2>
              {currentGroup && !activeLesson && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-medium">
                  {currentGroupLessons.length} lessons
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              {activeLesson
                ? currentGroup?.name || 'Micro-Lesson'
                : currentGroup
                ? currentGroup.description
                : 'Bite-sized, 60-second financial fundamentals explained in plain English.'}
            </p>
          </div>
        </div>

        {/* Global Progress Indicator Badge */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="text-right">
            <div className="text-[11px] font-mono text-slate-400">
              Completed <span className="text-emerald-400 font-bold">{totalCompleted}</span> / {totalLessons}
            </div>
            <div className="w-28 sm:w-32 h-1.5 bg-white/10 rounded-full overflow-hidden mt-1">
              <div
                className="h-full bg-emerald-400 rounded-full transition-all duration-300"
                style={{ width: `${overallPercentage}%` }}
              />
            </div>
          </div>
          <div className="px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-mono font-bold">
            {overallPercentage}%
          </div>
        </div>
      </div>

      {/* ===================== GLOBAL SEARCH BAR ===================== */}
      {!activeLesson && (
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search what you want to learn… (e.g. bond, inflation, margin, ETF)"
            className="w-full bg-white/[0.05] border border-white/10 text-white rounded-2xl pl-10 pr-9 py-2.5 text-xs sm:text-sm placeholder:text-slate-500 focus:outline-none focus:border-emerald-400/50 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* ===================== VIEW 1: SEARCH RESULTS ===================== */}
      {searchQuery.trim() ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>
              Found <strong className="text-white">{searchResults.length}</strong> lesson
              {searchResults.length === 1 ? '' : 's'} matching "{searchQuery}"
            </span>
            <button
              onClick={() => setSearchQuery('')}
              className="text-emerald-400 hover:underline text-[11px]"
            >
              Clear search
            </button>
          </div>

          {searchResults.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              No lessons found matching "{searchQuery}". Try searching for words like "yield", "debt", "profit", or "crypto".
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {searchResults.map(lesson => {
                const group = GROUP_MAP.get(lesson.groupId)
                const isDone = completedSet.has(lesson.id)
                return (
                  <GlassPanel
                    key={lesson.id}
                    intensity="subtle"
                    onClick={() => {
                      setSelectedGroupId(lesson.groupId)
                      handleOpenLesson(lesson)
                    }}
                    className={cn(
                      'p-3.5 rounded-2xl border transition text-left cursor-pointer flex items-center justify-between gap-3 group',
                      isDone
                        ? 'border-emerald-500/30 bg-emerald-500/[0.04]'
                        : 'border-white/10 hover:border-white/20 bg-white/[0.03]'
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-400">
                          {group?.name || 'General'}
                        </span>
                        {isDone && (
                          <span className="text-[10px] text-emerald-400 flex items-center gap-0.5 font-medium">
                            <Check className="w-3 h-3" /> Learned
                          </span>
                        )}
                      </div>
                      <div className="text-xs sm:text-sm font-semibold text-white group-hover:text-emerald-300 transition line-clamp-1">
                        {lesson.question}
                      </div>
                      <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                        {lesson.explanation}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition shrink-0" />
                  </GlassPanel>
                )
              })}
            </div>
          )}
        </div>
      ) : activeLesson ? (
        /* ===================== VIEW 2: 1-MINUTE LESSON DETAIL ===================== */
        <div className="space-y-4 max-w-3xl mx-auto">
          {/* Main Lesson Card */}
          <GlassPanel
            intensity="subtle"
            className="p-5 sm:p-7 rounded-3xl border-emerald-500/20 bg-slate-900/60 space-y-6 relative overflow-hidden"
          >
            <div className="glass-specular" />

            {/* Top Row: Group Pill & Learned Toggle */}
            <div className="flex items-center justify-between gap-3">
              <span className="text-[11px] font-medium px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 text-slate-300 flex items-center gap-1.5">
                {currentGroup && getGroupIcon(currentGroup.iconName, 'w-3.5 h-3.5 text-emerald-400')}
                {currentGroup?.name || 'Finance'}
              </span>

              <button
                onClick={() => handleToggleComplete(activeLesson.id)}
                className={cn(
                  'px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition active:scale-95',
                  completedSet.has(activeLesson.id)
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 border-white/10'
                )}
              >
                {completedSet.has(activeLesson.id) ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Learned ✓</span>
                  </>
                ) : (
                  <>
                    <Award className="w-4 h-4 text-slate-400" />
                    <span>Mark as Learned</span>
                  </>
                )}
              </button>
            </div>

            {/* Lesson Title / Question */}
            <div>
              <h1 className="text-lg sm:text-2xl font-extrabold text-white tracking-tight leading-snug">
                {activeLesson.question}
              </h1>
            </div>

            {/* Section 1: Simple Explanation */}
            <div className="space-y-1.5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                Simple Explanation
              </div>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed bg-white/[0.02] p-3.5 rounded-2xl border border-white/5">
                {activeLesson.explanation}
              </p>
            </div>

            {/* Section 2: Real-World Example */}
            <div className="space-y-1.5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Real-World Example
              </div>
              <div className="text-xs sm:text-sm text-amber-100/90 leading-relaxed bg-amber-500/[0.06] p-3.5 rounded-2xl border border-amber-500/20">
                {activeLesson.example}
              </div>
            </div>

            {/* Section 3: Why It Matters */}
            <div className="space-y-1.5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5" />
                Why It Matters
              </div>
              <p className="text-xs sm:text-sm text-sky-100/90 leading-relaxed bg-sky-500/[0.06] p-3.5 rounded-2xl border border-sky-500/20">
                {activeLesson.whyItMatters}
              </p>
            </div>

            {/* Bottom Lesson Footer Navigation */}
            <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-3">
              {prevLesson ? (
                <button
                  onClick={() => handleOpenLesson(prevLesson)}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs transition flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Previous</span>
                </button>
              ) : (
                <div />
              )}

              <button
                onClick={handleCloseLesson}
                className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-semibold transition"
              >
                Back to Questions
              </button>

              {nextLesson ? (
                <button
                  onClick={() => handleOpenLesson(nextLesson)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-300 text-xs transition flex items-center gap-1.5 font-semibold"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <div />
              )}
            </div>
          </GlassPanel>
        </div>
      ) : selectedGroupId && currentGroup ? (
        /* ===================== VIEW 3: GROUP QUESTIONS LIST ===================== */
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3 bg-white/[0.02] p-3 rounded-2xl border border-white/5">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                {getGroupIcon(currentGroup.iconName, 'w-5 h-5')}
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">{currentGroup.name}</h3>
                <p className="text-[11px] text-slate-400">
                  Select any question card to read the 60-second explanation.
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-mono font-bold text-emerald-400">
                {currentGroupLessons.filter(l => completedSet.has(l.id)).length} / {currentGroupLessons.length}
              </span>
              <div className="text-[10px] text-slate-500">learned</div>
            </div>
          </div>

          {/* List of Question Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {currentGroupLessons.map((lesson, idx) => {
              const isDone = completedSet.has(lesson.id)
              return (
                <GlassPanel
                  key={lesson.id}
                  intensity="subtle"
                  onClick={() => handleOpenLesson(lesson)}
                  className={cn(
                    'p-3.5 rounded-2xl border transition text-left cursor-pointer flex items-center justify-between gap-3 group relative overflow-hidden',
                    isDone
                      ? 'border-emerald-500/30 bg-emerald-500/[0.04] hover:border-emerald-500/50'
                      : 'border-white/10 hover:border-white/25 bg-white/[0.03] hover:bg-white/[0.05]'
                  )}
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div
                      className={cn(
                        'w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 font-mono mt-0.5 border',
                        isDone
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-white/5 text-slate-400 border-white/10 group-hover:border-white/20'
                      )}
                    >
                      {isDone ? <Check className="w-3 h-3 text-emerald-400" /> : idx + 1}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="text-xs sm:text-sm font-semibold text-white group-hover:text-emerald-300 transition leading-snug">
                        {lesson.question}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        ~45 sec read
                      </div>
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition shrink-0" />
                </GlassPanel>
              )
            })}
          </div>
        </div>
      ) : (
        /* ===================== VIEW 4: ALL GROUPS MAIN SCREEN ===================== */
        <div className="space-y-6">
          {/* Featured: 1-Minute Lesson of the Day Card */}
          <GlassPanel
            intensity="subtle"
            onClick={() => {
              setSelectedGroupId(lessonOfTheDay.groupId)
              handleOpenLesson(lessonOfTheDay)
            }}
            className="p-4 sm:p-5 rounded-3xl border-indigo-500/30 bg-gradient-to-r from-indigo-500/[0.08] via-emerald-500/[0.04] to-transparent hover:border-indigo-500/50 transition cursor-pointer group relative overflow-hidden"
          >
            <div className="glass-specular" />
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  1-Minute Lesson of the Day
                </div>
                <h3 className="text-sm sm:text-base font-extrabold text-white group-hover:text-indigo-300 transition line-clamp-1">
                  {lessonOfTheDay.question}
                </h3>
                <p className="text-xs text-slate-300 line-clamp-2">
                  {lessonOfTheDay.explanation}
                </p>
                <div className="text-[11px] text-indigo-300 flex items-center gap-1 pt-1 font-medium">
                  Read 60-second breakdown &rarr;
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 shrink-0 group-hover:scale-105 transition">
                <BookOpen className="w-5 h-5" />
              </div>
            </div>
          </GlassPanel>

          {/* 14 Groups Grid of Cards */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Select a Topic ({LEARN_GROUPS.length} Groups)
              </h3>
              <span className="text-xs text-slate-500 font-mono">
                {totalLessons} total lessons
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {LEARN_GROUPS.map(group => {
                const groupLessons = LESSONS_BY_GROUP[group.id] || []
                const groupDone = groupLessons.filter(l => completedSet.has(l.id)).length
                const groupTotal = groupLessons.length
                const pct = Math.round((groupDone / (groupTotal || 1)) * 100)
                const styles = getThemeStyles(group.color)

                return (
                  <GlassPanel
                    key={group.id}
                    intensity="subtle"
                    onClick={() => {
                      sounds.playClick()
                      setSelectedGroupId(group.id)
                    }}
                    className={cn(
                      'p-4 rounded-3xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] transition-all cursor-pointer group flex flex-col justify-between space-y-3 relative overflow-hidden',
                      styles.hoverBorder
                    )}
                  >
                    <div className="glass-specular" />

                    {/* Card Header: Icon & Lesson Count Badge */}
                    <div className="flex items-start justify-between gap-2">
                      <div
                        className={cn(
                          'p-2.5 rounded-2xl border transition-all group-hover:scale-105',
                          styles.iconBg
                        )}
                      >
                        {getGroupIcon(group.iconName, 'w-5 h-5')}
                      </div>

                      <span
                        className={cn(
                          'text-[10px] px-2 py-0.5 rounded-full border font-mono font-semibold',
                          styles.badge
                        )}
                      >
                        {groupTotal} lessons
                      </span>
                    </div>

                    {/* Card Title & Short Description */}
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-white transition flex items-center justify-between">
                        <span>{group.name}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition" />
                      </h4>
                      <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                        {group.description}
                      </p>
                    </div>

                    {/* Progress Bar & Counter */}
                    <div className="space-y-1 pt-1 border-t border-white/5">
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                        <span>
                          {groupDone} / {groupTotal} learned
                        </span>
                        <span className="font-semibold text-slate-300">{pct}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                        <div
                          className={cn('h-full rounded-full transition-all duration-300', styles.progressBar)}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </GlassPanel>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
