import { SomedayItem } from '@/types'
import { storageService } from '@/services/storage'

const STORAGE_KEY = 'live_someday_items'

const INITIAL_SOMEDAY: SomedayItem[] = [
  {
    id: 'sm-1',
    text: 'See the northern lights in a quiet place.',
    optionalReason: 'Green and violet light dancing across cold silence.',
    createdAt: Date.now() - 86400000 * 40
  },
  {
    id: 'sm-2',
    text: 'Sleep beneath the stars on a warm summer night.',
    optionalReason: 'Without a roof or screen, looking straight up into the galaxy.',
    createdAt: Date.now() - 86400000 * 30
  },
  {
    id: 'sm-3',
    text: 'Learn to make proper sourdough bread from scratch.',
    optionalReason: 'Flour, water, salt, time, and the smell of a hot kitchen.',
    createdAt: Date.now() - 86400000 * 15
  },
  {
    id: 'sm-4',
    text: 'Spend a whole week somewhere quiet without checking work once.',
    optionalReason: 'To see how slow a single day can actually feel.',
    createdAt: Date.now() - 86400000 * 5
  }
]

class SomedayRepository {
  async getAll(): Promise<SomedayItem[]> {
    const items = await storageService.get<SomedayItem[]>(STORAGE_KEY, INITIAL_SOMEDAY)
    return items || []
  }

  async save(item: SomedayItem): Promise<SomedayItem> {
    const list = await this.getAll()
    const index = list.findIndex(i => i.id === item.id)
    let updated: SomedayItem[]

    if (index >= 0) {
      updated = [...list]
      updated[index] = item
    } else {
      updated = [item, ...list]
    }

    await storageService.set(STORAGE_KEY, updated)
    return item
  }

  async delete(id: string): Promise<void> {
    const list = await this.getAll()
    const filtered = list.filter(i => i.id !== id)
    await storageService.set(STORAGE_KEY, filtered)
  }

  async getRandomSurfaced(): Promise<SomedayItem | null> {
    const list = await this.getAll()
    if (list.length === 0) return null
    const randomIndex = Math.floor(Math.random() * list.length)
    return list[randomIndex]
  }
}

export const somedayRepository = new SomedayRepository()
