import { LiveLetter } from '@/types'
import { storageService } from '@/services/storage'

const STORAGE_KEY = 'live_letters'

const INITIAL_LETTERS: LiveLetter[] = [
  {
    id: 'let-1',
    title: 'To myself ten years ago',
    recipientDescription: 'A younger version of me',
    content: 'Do not worry so much about proving yourself to everyone you meet. The things you think are urgent right now will barely be remembered. Learn to cook a good meal, call your mother more often, and take more slow walks. You are doing fine.',
    promptType: 'myself_at_18',
    createdAt: Date.now() - 86400000 * 20,
    updatedAt: Date.now() - 86400000 * 20
  }
]

export const LETTER_PROMPTS = [
  { type: 'someone_i_miss', label: 'A letter to someone I miss', placeholder: 'Write whatever you never got the chance to say...' },
  { type: 'myself_at_18', label: 'A letter to myself at 18', placeholder: 'What do you wish you had known back then?' },
  { type: 'someone_who_helped', label: 'A letter to someone who helped me', placeholder: 'To a teacher, a stranger, a friend who held the door...' },
  { type: 'someone_i_lost', label: 'A letter to someone I lost', placeholder: 'Remembering their voice, their hands, or their presence...' },
  { type: 'future_self', label: 'A letter to my future self', placeholder: 'What do you hope you never forget from this time in your life?' },
  { type: 'never_said', label: 'Something I’ve never said', placeholder: 'Things you keep inside because the world is too loud...' }
] as const

class LiveLettersRepository {
  async getAll(): Promise<LiveLetter[]> {
    const letters = await storageService.get<LiveLetter[]>(STORAGE_KEY, INITIAL_LETTERS)
    return letters || []
  }

  async save(letter: LiveLetter): Promise<LiveLetter> {
    const list = await this.getAll()
    const index = list.findIndex(l => l.id === letter.id)
    let updated: LiveLetter[]

    if (index >= 0) {
      updated = [...list]
      updated[index] = { ...letter, updatedAt: Date.now() }
    } else {
      updated = [letter, ...list]
    }

    await storageService.set(STORAGE_KEY, updated)
    return letter
  }

  async delete(id: string): Promise<void> {
    const list = await this.getAll()
    const filtered = list.filter(l => l.id !== id)
    await storageService.set(STORAGE_KEY, filtered)
  }
}

export const liveLettersRepository = new LiveLettersRepository()
