import { useState, useMemo } from 'react'
import {
  Sparkles,
  Heart,
  Wind,
  Shuffle,
  Eye,
  HelpCircle,
  ArrowRight,
  Maximize2
} from 'lucide-react'
import { getSafeLiveContext, getTodayBeautifulThing } from '@/services/live'
import { sounds } from '@/utils/sound'
import LiveIcon from './LiveIcon'
import TakeAMomentModal from './TakeAMomentModal'
import SurpriseMeModal from './SurpriseMeModal'
import AliveModal from './AliveModal'
import StayModal from './StayModal'
import RightNowModal from './RightNowModal'

interface NowWorldProps {
  onGoToKeep: () => void
  onGoToHuman: () => void
  onOpenWellness?: () => void
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

export default function NowWorld({ onGoToKeep, onGoToHuman, onOpenWellness }: NowWorldProps) {
  const context = useMemo(() => getSafeLiveContext(), [])
  const beautifulThing = useMemo(() => getTodayBeautifulThing(), [])

  // Modals
  const [momentOpen, setMomentOpen] = useState(false)
  const [surpriseOpen, setSurpriseOpen] = useState(false)
  const [aliveOpen, setAliveOpen] = useState(false)
  const [stayOpen, setStayOpen] = useState(false)
  const [rightNowOpen, setRightNowOpen] = useState(false)

  const gentleQuestion = useMemo(() => {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000)
    return GENTLE_QUESTIONS[dayOfYear % GENTLE_QUESTIONS.length]
  }, [])

  return (
    <div className="flex-1 flex flex-col items-center justify-between h-full overflow-y-auto px-6 py-10 md:py-16 text-center select-none max-w-2xl mx-auto">
      {/* Top Atmosphere & Opening Message */}
      <div className="flex flex-col items-center animate-in fade-in duration-500 w-full">
        <div className="flex items-center gap-2 mb-3 text-amber-400">
          <LiveIcon className="w-6 h-6 stroke-[1.75]" />
          <span className="text-xs font-semibold tracking-widest uppercase text-slate-300">
            Live
          </span>
        </div>

        <h2 className="text-xs font-mono uppercase tracking-widest text-slate-400 mb-6">
          {context.dayOfWeek} {context.timeOfDay} • {context.friendlyDate}
        </h2>

        {/* Central Opening Message */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-light text-slate-100 leading-relaxed max-w-lg mb-3">
          {context.greeting}
        </h1>
        <p className="text-sm font-serif italic text-slate-400 mb-10 max-w-md">
          {context.subgreeting}
        </p>

        {/* Central Action: Take a Moment */}
        <button
          onClick={() => {
            sounds.playSuccess()
            setMomentOpen(true)
          }}
          className="group relative flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-rose-500/20 hover:from-amber-500/30 hover:via-orange-500/30 hover:to-rose-500/30 text-white font-serif text-base border border-amber-400/30 shadow-xl shadow-amber-500/5 transition-all duration-300 hover:scale-105 active:scale-95 mb-10"
        >
          <Sparkles className="w-4 h-4 text-amber-400 group-hover:rotate-12 transition-transform" />
          <span>TAKE A MOMENT</span>
        </button>
      </div>

      {/* Gentle Sights & Question */}
      <div className="w-full space-y-4 my-2 animate-in fade-in duration-700 max-w-lg">
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

        {/* Gentle Question */}
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

      {/* Secondary Quiet Actions: Surprise Me, Alive, Stay, Right Now */}
      <div className="w-full pt-6 border-t border-white/10 flex flex-col items-center gap-4 animate-in fade-in duration-700">
        <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap text-xs text-slate-300">
          <button
            onClick={() => {
              sounds.playClick()
              setSurpriseOpen(true)
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-amber-300 border border-white/5 transition-all active:scale-95"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>Surprise Me</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick()
              setAliveOpen(true)
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-rose-300 border border-white/5 transition-all active:scale-95"
          >
            <Heart className="w-3.5 h-3.5" />
            <span>Alive</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick()
              setRightNowOpen(true)
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-sky-300 border border-white/5 transition-all active:scale-95"
          >
            <Wind className="w-3.5 h-3.5" />
            <span>Right Now</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick()
              setStayOpen(true)
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5 transition-all active:scale-95"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Stay</span>
          </button>

          {onOpenWellness && (
            <button
              onClick={() => {
                sounds.playClick()
                onOpenWellness()
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 transition-all active:scale-95"
            >
              <Heart className="w-3.5 h-3.5" />
              <span>Wellness</span>
            </button>
          )}
        </div>


        {/* Gentle World Gateways */}
        <div className="flex items-center gap-6 text-xs text-slate-400 pt-2">
          <button
            onClick={onGoToKeep}
            className="hover:text-amber-300 transition-colors flex items-center gap-1"
          >
            <span>Keep something</span>
            <ArrowRight className="w-3 h-3" />
          </button>
          <span>•</span>
          <button
            onClick={onGoToHuman}
            className="hover:text-amber-300 transition-colors flex items-center gap-1"
          >
            <span>Human Voices</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Modals */}
      <TakeAMomentModal isOpen={momentOpen} onClose={() => setMomentOpen(false)} />
      <SurpriseMeModal isOpen={surpriseOpen} onClose={() => setSurpriseOpen(false)} />
      <AliveModal isOpen={aliveOpen} onClose={() => setAliveOpen(false)} />
      <StayModal isOpen={stayOpen} onClose={() => setStayOpen(false)} />
      <RightNowModal isOpen={rightNowOpen} onClose={() => setRightNowOpen(false)} />
    </div>
  )
}
