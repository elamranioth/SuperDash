import { useMemo } from 'react'
import {
  Sparkles,
  Quote,
  Heart,
  Compass,
  Maximize2,
  Wind,
  HelpCircle,
  Eye
} from 'lucide-react'
import { getTodayBeautifulThing } from '@/services/live'
import { sounds } from '@/utils/sound'
import LiveIcon from './LiveIcon'

interface LiveHomeProps {
  onTakeAMoment: () => void
  onOpenLiveMode: () => void
  onOpenRightNow: () => void
  onOpenHumanVoices: () => void
  onOpenRemember: () => void
  onOpenPeople: () => void
  onOpenSomewhere: () => void
}

const GENTLE_QUESTIONS = [
  'When was the last time you watched the sunset?',
  'When was the last time you called someone just to hear their voice?',
  'When was the last time you went somewhere alone?',
  'When was the last time you laughed until your stomach hurt?',
  'When was the last time you did absolutely nothing for an hour?',
  'When was the last time you looked closely at the stars?',
  'When was the last time you walked barefoot on grass or sand?',
  'When was the last time you helped someone who could do nothing for you?'
]

export default function LiveHome({
  onTakeAMoment,
  onOpenLiveMode,
  onOpenRightNow,
  onOpenHumanVoices,
  onOpenRemember,
  onOpenPeople,
  onOpenSomewhere
}: LiveHomeProps) {
  // Current time of day & gentle phrasing
  const { timeGreeting, gentleTimeText, todayDateText } = useMemo(() => {
    const now = new Date()
    const hour = now.getHours()

    let greeting = 'You are here today. Don’t rush through all of it.'
    let timeLabel = 'afternoon'

    if (hour >= 5 && hour < 12) {
      greeting = 'Before the day asks anything from you, take a moment for yourself.'
      timeLabel = 'morning'
    } else if (hour >= 12 && hour < 17) {
      greeting = 'You don’t have to wait until tonight to enjoy part of your day.'
      timeLabel = 'afternoon'
    } else if (hour >= 17 && hour < 22) {
      greeting = 'The workday may be ending. Your life isn’t.'
      timeLabel = 'evening'
    } else {
      greeting = 'Not everything unfinished needs to be finished tonight.'
      timeLabel = 'night'
    }

    const dayName = now.toLocaleDateString('en-US', { weekday: 'long' })
    const dateFormatted = now.toLocaleDateString('en-US', { day: 'numeric', month: 'long' })

    return {
      timeGreeting: greeting,
      gentleTimeText: `${dayName} ${timeLabel}`,
      todayDateText: dateFormatted
    }
  }, [])

  const beautifulThing = useMemo(() => getTodayBeautifulThing(), [])

  const gentleQuestion = useMemo(() => {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000)
    return GENTLE_QUESTIONS[dayOfYear % GENTLE_QUESTIONS.length]
  }, [])

  return (
    <div className="flex-1 flex flex-col items-center justify-between h-full overflow-y-auto px-6 py-10 md:py-16 text-center select-none max-w-2xl mx-auto">
      {/* Top Identity & Atmosphere */}
      <div className="flex flex-col items-center animate-in fade-in duration-500 w-full">
        <div className="flex items-center gap-2 mb-3 text-amber-400">
          <LiveIcon className="w-6 h-6 stroke-[1.75]" />
          <span className="text-xs font-semibold tracking-widest uppercase text-slate-300">
            Live
          </span>
        </div>

        <h2 className="text-xs font-mono uppercase tracking-widest text-slate-400 mb-6">
          {gentleTimeText} • {todayDateText}
        </h2>

        {/* The Heart Opening Message */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-normal text-slate-100 leading-relaxed max-w-lg mb-10">
          {timeGreeting}
        </h1>

        {/* Prominent, Warm Primary Action: Take a Moment */}
        <button
          onClick={() => {
            sounds.playSuccess()
            onTakeAMoment()
          }}
          className="group relative flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-rose-500/20 hover:from-amber-500/30 hover:via-orange-500/30 hover:to-rose-500/30 text-white font-serif text-base border border-amber-400/30 shadow-xl shadow-amber-500/5 transition-all duration-300 hover:scale-105 active:scale-95 mb-12"
        >
          <Sparkles className="w-4 h-4 text-amber-400 group-hover:rotate-12 transition-transform" />
          <span>Take a Moment</span>
        </button>
      </div>

      {/* Gentle Ordinary Wonders Section */}
      <div className="w-full space-y-4 my-4 animate-in fade-in duration-700 max-w-lg">
        {/* One Beautiful Thing */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-left transition-all hover:bg-white/[0.07]">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-amber-400/90 flex items-center gap-1.5 mb-1">
            <Eye className="w-3 h-3" />
            Today, notice
          </span>
          <p className="text-xs font-serif italic text-slate-200 leading-relaxed">
            {beautifulThing.title}
          </p>
          <p className="text-[11px] text-slate-400 font-sans mt-0.5">
            {beautifulThing.description}
          </p>
        </div>

        {/* When Was The Last Time? */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-left transition-all hover:bg-white/[0.07]">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-sky-400/90 flex items-center gap-1.5 mb-1">
            <HelpCircle className="w-3 h-3" />
            A gentle question
          </span>
          <p className="text-xs font-serif text-slate-200 leading-relaxed">
            {gentleQuestion}
          </p>
          <span className="text-[10px] text-slate-500 mt-1 block">
            No need to answer. Just let it cross your mind.
          </span>
        </div>
      </div>

      {/* Quiet Secondary Gateways */}
      <div className="w-full pt-8 border-t border-white/10 flex items-center justify-center gap-2 sm:gap-4 flex-wrap text-xs text-slate-400 animate-in fade-in duration-700">
        <button
          onClick={() => {
            sounds.playClick()
            onOpenHumanVoices()
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-white/10 hover:text-white transition-colors"
        >
          <Quote className="w-3.5 h-3.5 text-amber-400" />
          <span>Human Voices</span>
        </button>

        <button
          onClick={() => {
            sounds.playClick()
            onOpenRemember()
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-white/10 hover:text-white transition-colors"
        >
          <Heart className="w-3.5 h-3.5 text-rose-400" />
          <span>Remember</span>
        </button>

        <button
          onClick={() => {
            sounds.playClick()
            onOpenPeople()
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-white/10 hover:text-white transition-colors"
        >
          <Heart className="w-3.5 h-3.5 text-emerald-400" />
          <span>People</span>
        </button>

        <button
          onClick={() => {
            sounds.playClick()
            onOpenSomewhere()
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-white/10 hover:text-white transition-colors"
        >
          <Compass className="w-3.5 h-3.5 text-sky-400" />
          <span>Somewhere</span>
        </button>

        <button
          onClick={() => {
            sounds.playClick()
            onOpenRightNow()
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-white/10 hover:text-white transition-colors"
        >
          <Wind className="w-3.5 h-3.5 text-indigo-400" />
          <span>Right Now</span>
        </button>

        <button
          onClick={() => {
            sounds.playClick()
            onOpenLiveMode()
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-white/10 hover:text-white transition-colors"
        >
          <Maximize2 className="w-3.5 h-3.5 text-amber-300" />
          <span>Live Mode</span>
        </button>
      </div>
    </div>
  )
}
