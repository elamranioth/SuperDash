import { LiveMemory, LivePerson, LivePlace, LivePreferences } from '@/types'
import { storageService } from '@/services/storage'

const STORAGE_KEYS = {
  MEMORIES: 'live_memories',
  PEOPLE: 'live_people',
  PLACES: 'live_places',
  PREFERENCES: 'live_preferences'
}

const DEFAULT_PREFERENCES: LivePreferences = {
  atmospherePreference: 'auto',
  includeMemoriesInSearch: false, // Default is strictly OFF for privacy
  notificationsEnabled: false,
  quietHoursStart: '22:00',
  quietHoursEnd: '08:00'
}

const INITIAL_MEMORIES: LiveMemory[] = [
  {
    id: 'mem-1',
    text: 'We sat outside after dinner and talked until almost midnight. Nobody looked at their phone once.',
    date: '2026-09-15',
    createdAt: Date.now() - 86400000 * 14
  },
  {
    id: 'mem-2',
    text: 'Early morning walk near the water. The fog was just starting to lift, and the air smelled like cedar and cold salt.',
    date: '2026-09-22',
    createdAt: Date.now() - 86400000 * 7
  }
]

const INITIAL_PEOPLE: LivePerson[] = [
  {
    id: 'per-1',
    name: 'Mother',
    relationship: 'Family',
    whyTheyMatter: 'Her warmth and unconditional presence across every stage of my life.',
    thingsToRemember: 'The way she laughs when recounting childhood stories, and how she insists on feeding anyone who enters her house.',
    lastMeaningfulMoment: 'Called last Sunday while she was tending her balcony flowers.',
    createdAt: Date.now() - 86400000 * 30
  },
  {
    id: 'per-2',
    name: 'Karim',
    relationship: 'Old Friend',
    whyTheyMatter: 'Friend since school days. We can go four months without speaking and resume without missing a beat.',
    thingsToRemember: 'His quiet humor and loyalty during our first uncertain years after university.',
    lastMeaningfulMoment: 'Coffee near the old library on a rainy afternoon.',
    createdAt: Date.now() - 86400000 * 20
  }
]

const INITIAL_PLACES: LivePlace[] = [
  {
    id: 'plc-1',
    name: 'A seaside café on a cloudy morning',
    reason: 'To sit with a hot tea for two hours, watching the waves roll in without needing to do anything.',
    visited: false,
    createdAt: Date.now() - 86400000 * 10
  },
  {
    id: 'plc-2',
    name: 'The quiet pine forest trail',
    reason: 'Where the ground is soft with needles and the only sound is wind through high branches.',
    visited: true,
    createdAt: Date.now() - 86400000 * 5
  }
]

class LiveRepository {
  // ==================== MEMORIES (MEMORY JAR) ====================

  async getMemories(): Promise<LiveMemory[]> {
    const memories = await storageService.get<LiveMemory[]>(STORAGE_KEYS.MEMORIES, INITIAL_MEMORIES)
    return memories || []
  }

  async saveMemory(memory: LiveMemory): Promise<LiveMemory> {
    const list = await this.getMemories()
    const index = list.findIndex(m => m.id === memory.id)
    let updated: LiveMemory[]

    if (index >= 0) {
      updated = [...list]
      updated[index] = memory
    } else {
      updated = [memory, ...list]
    }

    await storageService.set(STORAGE_KEYS.MEMORIES, updated)
    return memory
  }

  async deleteMemory(id: string): Promise<void> {
    const list = await this.getMemories()
    const filtered = list.filter(m => m.id !== id)
    await storageService.set(STORAGE_KEYS.MEMORIES, filtered)
  }

  async getRandomMemory(): Promise<LiveMemory | null> {
    const list = await this.getMemories()
    if (list.length === 0) return null
    const randomIndex = Math.floor(Math.random() * list.length)
    return list[randomIndex]
  }

  // ==================== PEOPLE ====================

  async getPeople(): Promise<LivePerson[]> {
    const people = await storageService.get<LivePerson[]>(STORAGE_KEYS.PEOPLE, INITIAL_PEOPLE)
    return people || []
  }

  async savePerson(person: LivePerson): Promise<LivePerson> {
    const list = await this.getPeople()
    const index = list.findIndex(p => p.id === person.id)
    let updated: LivePerson[]

    if (index >= 0) {
      updated = [...list]
      updated[index] = person
    } else {
      updated = [person, ...list]
    }

    await storageService.set(STORAGE_KEYS.PEOPLE, updated)
    return person
  }

  async deletePerson(id: string): Promise<void> {
    const list = await this.getPeople()
    const filtered = list.filter(p => p.id !== id)
    await storageService.set(STORAGE_KEYS.PEOPLE, filtered)
  }

  // ==================== SOMEWHERE (PLACES) ====================

  async getPlaces(): Promise<LivePlace[]> {
    const places = await storageService.get<LivePlace[]>(STORAGE_KEYS.PLACES, INITIAL_PLACES)
    return places || []
  }

  async savePlace(place: LivePlace): Promise<LivePlace> {
    const list = await this.getPlaces()
    const index = list.findIndex(p => p.id === place.id)
    let updated: LivePlace[]

    if (index >= 0) {
      updated = [...list]
      updated[index] = place
    } else {
      updated = [place, ...list]
    }

    await storageService.set(STORAGE_KEYS.PLACES, updated)
    return place
  }

  async deletePlace(id: string): Promise<void> {
    const list = await this.getPlaces()
    const filtered = list.filter(p => p.id !== id)
    await storageService.set(STORAGE_KEYS.PLACES, filtered)
  }

  // ==================== PREFERENCES ====================

  async getPreferences(): Promise<LivePreferences> {
    const prefs = await storageService.get<LivePreferences>(STORAGE_KEYS.PREFERENCES, DEFAULT_PREFERENCES)
    return { ...DEFAULT_PREFERENCES, ...prefs }
  }

  async savePreferences(partial: Partial<LivePreferences>): Promise<LivePreferences> {
    const current = await this.getPreferences()
    const updated = { ...current, ...partial }
    await storageService.set(STORAGE_KEYS.PREFERENCES, updated)
    return updated
  }
}

export const liveRepository = new LiveRepository()
