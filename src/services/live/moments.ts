import { LiveMoment } from '@/types'

export interface LiveContextInfo {
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night'
  isWeekend: boolean
  isRaining?: boolean
}

export const CURATED_MOMENTS: LiveMoment[] = [
  // --- NOTICE ---
  {
    id: 'mom-1',
    theme: 'NOTICE',
    text: 'Look at the sky for a while.',
    subtext: 'You do not need to photograph it.',
    timeContexts: ['morning', 'afternoon', 'evening']
  },
  {
    id: 'mom-2',
    theme: 'NOTICE',
    text: 'Look carefully at something ordinary.',
    subtext: 'A shadow on the wall, the grain of wood on a table, the way tea leaves steep.'
  },
  {
    id: 'mom-3',
    theme: 'NOTICE',
    text: 'Look around you.',
    subtext: 'Find three quiet things you normally wouldn’t notice.'
  },
  {
    id: 'mom-4',
    theme: 'NOTICE',
    text: 'Watch people passing by.',
    subtext: 'Every single person has a full, complicated life you know nothing about.',
    timeContexts: ['afternoon', 'evening', 'weekend']
  },

  // --- CONNECT ---
  {
    id: 'mom-5',
    theme: 'CONNECT',
    text: 'Call someone you love.',
    subtext: 'Not because you need anything. Just to hear their voice.',
    timeContexts: ['afternoon', 'evening', 'weekend']
  },
  {
    id: 'mom-6',
    theme: 'CONNECT',
    text: 'Send a message to someone you haven’t spoken to recently.',
    subtext: 'Just three lines: "Thought of you today. Hope you are well."'
  },
  {
    id: 'mom-7',
    theme: 'CONNECT',
    text: 'Ask someone how they are.',
    subtext: 'Then actually listen until they are finished.'
  },
  {
    id: 'mom-8',
    theme: 'CONNECT',
    text: 'Say thank you to someone who made your day slightly easier today.',
    subtext: 'Even if it was just opening a door or making coffee.',
    timeContexts: ['afternoon', 'evening']
  },

  // --- WANDER ---
  {
    id: 'mom-9',
    theme: 'WANDER',
    text: 'Take a different road home.',
    subtext: 'Turn down a street you have never walked before.',
    timeContexts: ['evening']
  },
  {
    id: 'mom-10',
    theme: 'WANDER',
    text: 'Walk somewhere without deciding where you are going first.',
    subtext: 'Let your feet make the turns.',
    timeContexts: ['weekend', 'morning', 'evening']
  },
  {
    id: 'mom-11',
    theme: 'WANDER',
    text: 'Go somewhere nearby you have never had a reason to visit.',
    subtext: 'A park bench, an unfamiliar grocery store, a quiet corner street.',
    timeContexts: ['weekend', 'afternoon']
  },

  // --- REST ---
  {
    id: 'mom-12',
    theme: 'REST',
    text: 'Make a coffee or tea. Sit somewhere different.',
    subtext: 'Drink it slowly. Don’t read anything.',
    timeContexts: ['morning', 'afternoon']
  },
  {
    id: 'mom-13',
    theme: 'REST',
    text: 'Sit somewhere quiet.',
    subtext: 'You don’t have to think about anything.'
  },
  {
    id: 'mom-14',
    theme: 'REST',
    text: 'Leave something unfinished tonight.',
    subtext: 'The world will still be here tomorrow.',
    timeContexts: ['evening', 'night']
  },
  {
    id: 'mom-15',
    theme: 'REST',
    text: 'Lie down for ten minutes in the afternoon.',
    subtext: 'Close your eyes. No alarm needed unless you must.',
    timeContexts: ['afternoon', 'weekend']
  },
  {
    id: 'mom-15b',
    theme: 'REST',
    text: 'Nothing important needs to be decided tonight.',
    subtext: 'Sleep on it. Things are softer in the morning light.',
    timeContexts: ['night']
  },

  // --- PLAY & ORDINARY JOY ---
  {
    id: 'mom-16',
    theme: 'PLAY',
    text: 'Buy an ice cream.',
    subtext: 'Eat it on a bench while watching whatever happens.',
    isPlayful: true,
    timeContexts: ['afternoon', 'weekend']
  },
  {
    id: 'mom-17',
    theme: 'PLAY',
    text: 'Play a song you loved years ago.',
    subtext: 'Don’t do anything else until it finishes.'
  },
  {
    id: 'mom-18',
    theme: 'PLAY',
    text: 'Dance badly in your kitchen.',
    subtext: 'Nobody is scoring your form.',
    isPlayful: true
  },
  {
    id: 'mom-19',
    theme: 'PLAY',
    text: 'Eat something you love without looking at a screen.',
    subtext: 'Actually taste the first three bites.'
  },
  {
    id: 'mom-20',
    theme: 'PLAY',
    text: 'Watch a terrible comedy.',
    subtext: 'Laugh without judging your taste.',
    isPlayful: true,
    timeContexts: ['evening', 'night', 'weekend']
  },

  // --- NATURE ---
  {
    id: 'mom-21',
    theme: 'NATURE',
    text: 'Go outside for five minutes.',
    subtext: 'Leave your phone behind.'
  },
  {
    id: 'mom-22',
    theme: 'NATURE',
    text: 'Find a tree. Look at it properly.',
    subtext: 'Notice the branches, the bark, the leaves moving in the breeze.'
  },
  {
    id: 'mom-23',
    theme: 'NATURE',
    text: 'Watch the sunset if you can.',
    subtext: 'Even through a window between buildings.',
    timeContexts: ['evening']
  },
  {
    id: 'mom-24',
    theme: 'NATURE',
    text: 'Walk barefoot on grass or sand.',
    subtext: 'Remember what the earth feels like underneath you.',
    timeContexts: ['weekend', 'morning', 'afternoon']
  },
  {
    id: 'mom-25',
    theme: 'NATURE',
    text: 'Listen to the rain.',
    subtext: 'Find somewhere dry where you can hear it. Leave your phone face down.',
    weatherContexts: ['rain']
  },

  // --- KINDNESS ---
  {
    id: 'mom-26',
    theme: 'KINDNESS',
    text: 'Do something kind today without telling anyone.',
    subtext: 'Keep it as a private secret between you and the world.'
  },
  {
    id: 'mom-27',
    theme: 'KINDNESS',
    text: 'Forgive someone in your mind.',
    subtext: 'Not for them. For the weight you don’t need to carry today.'
  },
  {
    id: 'mom-28',
    theme: 'KINDNESS',
    text: 'Leave a generous tip or a warm note.',
    subtext: 'Brighten someone’s shift.'
  },

  // --- REMEMBER ---
  {
    id: 'mom-29',
    theme: 'REMEMBER',
    text: 'Remember someone who was kind to you when they didn’t have to be.',
    subtext: 'A teacher, a stranger, an aunt, an old friend.'
  },
  {
    id: 'mom-30',
    theme: 'REMEMBER',
    text: 'Think about an ordinary day from childhood you still remember clearly.',
    subtext: 'What did the light look like? What was the sound in the room?'
  },

  // --- CREATE ---
  {
    id: 'mom-31',
    theme: 'CREATE',
    text: 'Write four lines about what today feels like.',
    subtext: 'On any scrap of paper. You don’t have to save it.'
  },
  {
    id: 'mom-32',
    theme: 'CREATE',
    text: 'Cook something you have never cooked before.',
    subtext: 'Even a simple soup or warm bread.'
  },

  // --- CURIOSITY ---
  {
    id: 'mom-33',
    theme: 'CURIOSITY',
    text: 'Learn the name of a bird or tree you see every week.',
    subtext: 'It has been living next to you for years.'
  },
  {
    id: 'mom-34',
    theme: 'CURIOSITY',
    text: 'Try a fruit or spice you have never tasted before.',
    subtext: 'Buy just one from the market.',
    isPlayful: true
  },

  // --- DO NOTHING ---
  {
    id: 'mom-35',
    theme: 'DO NOTHING',
    text: 'For a few minutes, don’t improve anything.',
    subtext: 'Modern software asks us to justify everything. Defend a few minutes of uselessness.'
  },
  {
    id: 'mom-36',
    theme: 'DO NOTHING',
    text: 'Just breathe. The world was spinning before you woke up.',
    subtext: 'It will keep spinning while you rest.'
  }
]

// Playful / Unexpected invitations specifically for "SURPRISE ME"
export const SURPRISE_ME_SUGGESTIONS = [
  'Buy an ice cream and eat it on a public bench.',
  'Send someone a message containing absolutely no request.',
  'Do something completely useless that makes you smile.',
  'Listen to a song that was popular when you were fourteen.',
  'Walk down a street in your neighborhood you have never walked down before.',
  'Drink a cold glass of water like you were crossing a desert.',
  'Dance badly for two minutes in an empty room.',
  'Try a fruit or food you have never eaten in your life.',
  'Watch an old, silly comedy tonight instead of learning something.',
  'Find the oldest tree near your home and stand under it for one minute.',
  'Write a postcard or short note to a friend and actually mail it.'
]

export function getRandomMoment(context?: LiveContextInfo): LiveMoment {
  if (context) {
    // If it's raining, check for rain-tagged moments
    if (context.isRaining) {
      const rainMoments = CURATED_MOMENTS.filter(m => m.weatherContexts?.includes('rain'))
      if (rainMoments.length > 0 && Math.random() < 0.4) {
        return rainMoments[Math.floor(Math.random() * rainMoments.length)]
      }
    }

    // Try matching time context
    const matching = CURATED_MOMENTS.filter(m => {
      if (context.isWeekend && m.timeContexts?.includes('weekend')) return true
      return m.timeContexts?.includes(context.timeOfDay)
    })

    if (matching.length > 0 && Math.random() < 0.6) {
      return matching[Math.floor(Math.random() * matching.length)]
    }
  }

  return CURATED_MOMENTS[Math.floor(Math.random() * CURATED_MOMENTS.length)]
}

export function getRandomSurprise(): string {
  const idx = Math.floor(Math.random() * SURPRISE_ME_SUGGESTIONS.length)
  return SURPRISE_ME_SUGGESTIONS[idx]
}
