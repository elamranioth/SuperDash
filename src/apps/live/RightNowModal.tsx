import { useState } from 'react'
import { X, ArrowRight, Check } from 'lucide-react'
import { sounds } from '@/utils/sound'

interface RightNowModalProps {
  isOpen: boolean
  onClose: () => void
}

const STEPS = [
  {
    title: 'Where are you right now?',
    body: 'Not on a map. In this moment. Sitting in a chair, standing in a room, feeling the air.'
  },
  {
    title: 'What can you hear?',
    body: 'Traffic in the distance? An air conditioner? Wind outside? Notice whatever sound is reaching your ears right now.'
  },
  {
    title: 'Is your body tense?',
    body: 'Notice your shoulders. Can you let them drop half an inch? Unclench your jaw. Let your tongue rest from the roof of your mouth.'
  },
  {
    title: 'Take one slow breath.',
    body: 'Inhale gently through your nose... and let it out through your mouth without forcing anything.'
  },
  {
    title: 'Look away from the screen.',
    body: 'Find a window, a wall, or look out across the room for ten seconds.'
  },
  {
    title: 'That is enough.',
    body: 'You do not have to fix yourself. You are here, and this day is yours.'
  }
]

export default function RightNowModal({ isOpen, onClose }: RightNowModalProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [fade, setFade] = useState(false)

  if (!isOpen) return null

  const handleNext = () => {
    sounds.playClick()
    if (currentStep < STEPS.length - 1) {
      setFade(true)
      setTimeout(() => {
        setCurrentStep(prev => prev + 1)
        setFade(false)
      }, 200)
    } else {
      onClose()
      setCurrentStep(0)
    }
  }

  const step = STEPS[currentStep]
  const isLast = currentStep === STEPS.length - 1

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-2xl animate-in fade-in select-none">
      <div className="relative w-full max-w-lg text-center flex flex-col items-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Step Counter Indicator */}
        <div className="flex items-center gap-1.5 mb-8">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-300 ${
                i === currentStep
                  ? 'w-6 bg-amber-400'
                  : i < currentStep
                  ? 'w-2 bg-amber-400/40'
                  : 'w-2 bg-white/10'
              }`}
            />
          ))}
        </div>

        {/* Step Content */}
        <div
          className={`transition-opacity duration-200 ${
            fade ? 'opacity-0 scale-98' : 'opacity-100 scale-100'
          } flex flex-col items-center max-w-md`}
        >
          <h2 className="text-2xl sm:text-3xl font-serif text-white mb-4 leading-snug">
            {step.title}
          </h2>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-sans font-light mb-10">
            {step.body}
          </p>

          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-400/30 text-xs font-medium transition-all hover:scale-105 active:scale-95 shadow-lg"
          >
            <span>{isLast ? 'Return to your day' : 'Next'}</span>
            {isLast ? <Check className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  )
}
