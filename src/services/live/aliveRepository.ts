import { AliveItem } from '@/types'
import { storageService } from '@/services/storage'

const STORAGE_KEY = 'live_alive_items'

const INITIAL_ALIVE_ITEMS: AliveItem[] = [
  {
    id: 'alive-1',
    text: 'Drinking coffee outside before the morning gets busy.',
    optionalNote: 'Sitting in silence while the street wakes up.',
    createdAt: Date.now() - 86400000 * 25
  },
  {
    id: 'alive-2',
    text: 'Driving at night with the windows down and great music playing.',
    optionalNote: 'When the highway is empty and the air is cool.',
    createdAt: Date.now() - 86400000 * 18
  },
  {
    id: 'alive-3',
    text: 'Walking when it rains and having nowhere I need to be.',
    optionalNote: 'Hearing drops hit the umbrella, smelling the wet asphalt.',
    createdAt: Date.now() - 86400000 * 12
  },
  {
    id: 'alive-4',
    text: 'Laughing with an old friend until my stomach hurts.',
    optionalNote: 'Over a story we have told twenty times before.',
    createdAt: Date.now() - 86400000 * 5
  },
  {
    id: 'alive-5',
    text: 'Being near the sea.',
    optionalNote: 'Watching waves come in one after another.',
    createdAt: Date.now() - 86400000 * 2
  }
]

class AliveRepository {
  async getAll(): Promise<AliveItem[]> {
    const items = await storageService.get<AliveItem[]>(STORAGE_KEY, INITIAL_ALIVE_ITEMS)
    return items || []
  }

  async save(item: AliveItem): Promise<AliveItem> {
    const list = await this.getAll()
    const index = list.findIndex(i => i.id === item.id)
    let updated: AliveItem[]

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

  async getRandomSurfaced(): Promise<AliveItem | null> {
    const list = await this.getAll()
    if (list.length === 0) return null
    const randomIndex = Math.floor(Math.random() * list.length)
    return list[randomIndex]
  }
}

export const aliveRepository = new AliveRepository()
