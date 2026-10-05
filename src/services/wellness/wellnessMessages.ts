import { WellnessReminderType, WellnessMessage } from '@/types/wellness'

export const WELLNESS_MESSAGES: Record<WellnessReminderType, WellnessMessage[]> = {
  water: [
    { title: '💧 Hydration Break', body: 'Time for some water.' },
    { title: '💧 Drink Water', body: 'Stay hydrated — take a few sips.' },
    { title: '💧 Quick Hydration', body: 'Quick hydration break. Grab a fresh glass of water.' },
    { title: '💧 Refresh Your Body', body: 'A sip of water keeps your energy and focus sharp.' }
  ],
  breathing: [
    { title: '🌬️ Take a Breath', body: 'Take a slow, deep breath.' },
    { title: '🌬️ Deep Breathing', body: 'Breathe in. Breathe out. Reset.' },
    { title: '🌬️ 30-Second Reset', body: 'Take 30 seconds to breathe slowly and release tension.' },
    { title: '🌬️ Mindful Exhale', body: 'Inhale gently for 4 counts, exhale for 6.' }
  ],
  stand: [
    { title: '🚶 Stand Up', body: "You've been sitting for a while. Stand up for a minute." },
    { title: '🚶 Time to Stand', body: 'Time to get out of the chair and move around.' },
    { title: '🚶 Standing Break', body: 'A short standing break will do you good.' },
    { title: '🚶 Shake Out Your Legs', body: 'Stand up, pace for a moment, and get your circulation flowing.' }
  ],
  stretch: [
    { title: '🤸 Stretch Break', body: 'Quick stretch break.' },
    { title: '🤸 Loosen Up', body: 'Stretch your shoulders, neck and back.' },
    { title: '🤸 One Minute Stretch', body: 'Take one minute to loosen up tight muscles.' },
    { title: '🤸 Posture Check', body: 'Roll your shoulders backward and gently stretch your arms overhead.' }
  ],
  eyes: [
    { title: '👀 Eye Break', body: 'Give your eyes a break.' },
    { title: '👀 20-20-20 Rule', body: 'Look away from the screen for 20 seconds.' },
    { title: '👀 Rest Your Vision', body: 'Focus on something far away out a window for a moment.' },
    { title: '👀 Soft Blink Break', body: 'Blink softly a few times and let your eye muscles relax.' }
  ],
  relax: [
    { title: '🧘 Pause & Relax', body: 'Take a short mental reset.' },
    { title: '🧘 One Quiet Minute', body: 'One quiet minute before continuing.' },
    { title: '🧘 Slow Down', body: 'Relax your shoulders, drop your jaw, and slow down.' },
    { title: '🧘 Mental Clarity', body: 'Step back from what you are doing and clear your thoughts.' }
  ]
}

/**
 * Returns a random message variation for a given reminder type.
 */
export function getRandomWellnessMessage(type: WellnessReminderType): WellnessMessage {
  const list = WELLNESS_MESSAGES[type] || WELLNESS_MESSAGES.water
  const index = Math.floor(Math.random() * list.length)
  return list[index]
}
