import { WellnessMessage } from '@/types/wellness'

export const MICRO_STRETCHES = [
  'Roll your shoulders backward 5 times.',
  'Slowly turn your neck left and right.',
  'Stand and reach both arms overhead.',
  'Stretch your wrists and fingers for 20 seconds.',
  'Walk around for one minute.',
  'Straighten your back and relax your shoulder blades.',
  'Interlace your fingers behind your back and open your chest.',
  'Gently tilt your head toward your shoulder and breathe deeply.'
]

export const WELLNESS_MESSAGES: Record<string, WellnessMessage[]> = {
  water: [
    { title: '💧 Hydration Break', body: 'Time for some water.' },
    { title: '💧 Drink Water', body: 'Stay hydrated — take a few sips.' },
    { title: '💧 Quick Hydration', body: 'Quick hydration break. Grab a fresh glass of water.' },
    { title: '💧 Refresh Your Body', body: 'A sip of water keeps your energy and focus sharp.' }
  ],
  breathing: [
    { title: '🫁 Take a Breath', body: 'Take a slow, deep breath.' },
    { title: '🫁 Deep Breathing', body: 'Breathe in. Breathe out. Reset.' },
    { title: '🫁 30-Second Reset', body: 'Take 30 seconds to breathe slowly and release tension.' },
    { title: '🫁 Mindful Exhale', body: 'Inhale gently for 4 counts, exhale for 6.' }
  ],
  stand: [
    { title: '🚶 Stand Up', body: "You've been sitting for a while. Stand up for a minute." },
    { title: '🚶 Time to Stand', body: 'Time to get out of the chair and move around.' },
    { title: '🚶 Standing Break', body: 'A short standing break will do you good.' },
    { title: '🚶 Shake Out Your Legs', body: 'Stand up, pace for a moment, and get your circulation flowing.' }
  ],
  stretch: [
    { title: '🤸 Stretch Break', body: 'Roll your shoulders backward 5 times.' },
    { title: '🤸 Loosen Up', body: 'Slowly turn your neck left and right.' },
    { title: '🤸 One Minute Stretch', body: 'Stand and reach both arms overhead.' },
    { title: '🤸 Wrist & Back Relief', body: 'Stretch your wrists for 20 seconds and open your chest.' }
  ],
  eyes: [
    { title: '👀 Eye Break', body: 'Give your eyes a break.' },
    { title: '👀 20-20-20 Rule', body: 'Look away from the screen for 20 seconds at something 20 feet away.' },
    { title: '👀 Rest Your Vision', body: 'Focus on something far away out a window for a moment.' },
    { title: '👀 Soft Blink Break', body: 'Blink softly a few times and let your eye muscles relax.' }
  ],
  relax: [
    { title: '🧘 Pause & Relax', body: 'Take a short mental reset.' },
    { title: '🧘 One Quiet Minute', body: 'One quiet minute before continuing.' },
    { title: '🧘 Slow Down', body: 'Relax your shoulders, drop your jaw, and slow down.' },
    { title: '🧘 Mental Clarity', body: 'Step back from what you are doing and clear your thoughts.' }
  ],
  posture: [
    { title: '🪑 Posture Check', body: 'Relax your shoulders, align your neck, and sit upright.' },
    { title: '🪑 Check Your Seat', body: 'Uncross your legs and bring your feet flat on the floor.' },
    { title: '🪑 Spine Reset', body: 'Lengthen your spine and draw your shoulder blades gently down.' }
  ],
  walk: [
    { title: '🚶 Short Walk', body: 'Walk for 2 minutes and get away from the desk for a moment.' },
    { title: '🚶 Step Away', body: 'Take a brief stroll to refresh your legs and mind.' },
    { title: '🚶 Movement Moment', body: 'Pace around your room or hallway for 90 seconds.' }
  ]
}

/**
 * Returns a random message variation for a given reminder type or custom message.
 */
export function getRandomWellnessMessage(type: string, customMessage?: string): WellnessMessage {
  if (customMessage) {
    return { title: '🌿 Desk Reminder', body: customMessage }
  }
  const list = WELLNESS_MESSAGES[type] || WELLNESS_MESSAGES.water
  const index = Math.floor(Math.random() * list.length)
  return list[index]
}

export function getRandomMicroStretch(): string {
  const index = Math.floor(Math.random() * MICRO_STRETCHES.length)
  return MICRO_STRETCHES[index]
}
