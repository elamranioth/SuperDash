import { IdeaItem, IdeaStatus } from '@/types'
import { storageService } from '@/services/storage'

const STORAGE_KEY = 'ideas_items'

export const INITIAL_IDEAS: IdeaItem[] = [
  {
    id: 'idea-1',
    title: 'AI Document Analyzer',
    description: 'Build a tool that compares two legal documents or contracts automatically, highlighting discrepancies and liability shifts.',
    category: 'AI',
    tags: ['LegalTech', 'AI', 'Contracts'],
    status: 'INBOX',
    priority: 'high',
    favorite: true,
    createdAt: Date.now() - 3600000 * 24 * 2,
    updatedAt: Date.now() - 3600000 * 5
  },
  {
    id: 'idea-2',
    title: 'Client Portal for Court Hearing Updates',
    description: 'Provide clients with a secure read-only view of their case docket, upcoming sessions, and procedural judgments in real-time.',
    category: 'Legal',
    tags: ['Clients', 'Portal', 'Hearings'],
    status: 'EXPLORING',
    priority: 'medium',
    favorite: false,
    createdAt: Date.now() - 3600000 * 24 * 4,
    updatedAt: Date.now() - 3600000 * 24
  },
  {
    id: 'idea-3',
    title: 'Automated VAT Reconciliation Tool',
    description: 'One-click reconciliation between bank account statements and generated tax invoices with XML/PDF export for FTA filing.',
    category: 'Finance',
    tags: ['VAT', 'Accounting', 'Automation'],
    status: 'PLANNED',
    priority: 'high',
    favorite: true,
    createdAt: Date.now() - 3600000 * 24 * 7,
    updatedAt: Date.now() - 3600000 * 24 * 3
  },
  {
    id: 'idea-4',
    title: 'Focus Music Generator with Binaural Beats',
    description: 'Ambient sound generator embedded directly into the productivity dashboard for 45-minute deep concentration intervals.',
    category: 'Personal',
    tags: ['Focus', 'Audio', 'Flow'],
    status: 'IN PROGRESS',
    priority: 'low',
    favorite: false,
    createdAt: Date.now() - 3600000 * 24 * 10,
    updatedAt: Date.now() - 3600000 * 12
  }
]

export const DEFAULT_IDEA_CATEGORIES = [
  'Apps',
  'Business',
  'Legal',
  'AI',
  'Technology',
  'Personal',
  'Finance',
  'Other'
]

type Listener = () => void

class IdeasServiceImpl {
  private listeners = new Set<Listener>()

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  private notify() {
    this.listeners.forEach(l => {
      try {
        l()
      } catch (e) {
        console.error('Error notifying ideas listener:', e)
      }
    })
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('superdash_ideas_updated'))
    }
  }

  async getAll(): Promise<IdeaItem[]> {
    return storageService.get<IdeaItem[]>(STORAGE_KEY, INITIAL_IDEAS)
  }

  async getById(id: string): Promise<IdeaItem | undefined> {
    const list = await this.getAll()
    return list.find(item => item.id === id)
  }

  async add(item: Partial<IdeaItem> & { title: string }): Promise<IdeaItem> {
    const list = await this.getAll()
    const now = Date.now()
    const newIdea: IdeaItem = {
      id: 'idea-' + now + '-' + Math.random().toString(36).substring(2, 6),
      title: item.title.trim(),
      description: item.description?.trim() || '',
      category: item.category || 'Other',
      tags: item.tags || [],
      status: item.status || 'INBOX',
      priority: item.priority || 'medium',
      favorite: !!item.favorite,
      createdAt: now,
      updatedAt: now
    }
    const updated = [newIdea, ...list]
    await storageService.set(STORAGE_KEY, updated)
    this.notify()
    return newIdea
  }

  async update(id: string, updates: Partial<IdeaItem>): Promise<IdeaItem | null> {
    const list = await this.getAll()
    const idx = list.findIndex(i => i.id === id)
    if (idx === -1) return null

    const updatedItem: IdeaItem = {
      ...list[idx],
      ...updates,
      updatedAt: Date.now()
    }

    if (updates.status === 'ARCHIVED' && !list[idx].archivedAt) {
      updatedItem.archivedAt = Date.now()
    } else if (updates.status && updates.status !== 'ARCHIVED') {
      updatedItem.archivedAt = undefined
    }

    list[idx] = updatedItem
    await storageService.set(STORAGE_KEY, list)
    this.notify()
    return updatedItem
  }

  async delete(id: string): Promise<boolean> {
    const list = await this.getAll()
    const filtered = list.filter(i => i.id !== id)
    if (filtered.length === list.length) return false
    await storageService.set(STORAGE_KEY, filtered)
    this.notify()
    return true
  }

  async toggleFavorite(id: string): Promise<boolean> {
    const item = await this.getById(id)
    if (!item) return false
    await this.update(id, { favorite: !item.favorite })
    return !item.favorite
  }

  async getRandomUnfinishedIdea(): Promise<IdeaItem | null> {
    const list = await this.getAll()
    const unfinished = list.filter(i => i.status !== 'DONE' && i.status !== 'ARCHIVED')
    if (unfinished.length === 0) return null
    const randomIndex = Math.floor(Math.random() * unfinished.length)
    return unfinished[randomIndex]
  }

  async getWaitingCount(): Promise<number> {
    const list = await this.getAll()
    return list.filter(i => i.status === 'INBOX' || i.status === 'EXPLORING').length
  }

  async search(query: string): Promise<IdeaItem[]> {
    const q = query.toLowerCase().trim()
    const list = await this.getAll()
    if (!q) return list
    return list.filter(item => {
      const matchTitle = item.title.toLowerCase().includes(q)
      const matchDesc = item.description?.toLowerCase().includes(q)
      const matchCat = item.category?.toLowerCase().includes(q)
      const matchTags = item.tags?.some(t => t.toLowerCase().includes(q))
      return matchTitle || matchDesc || matchCat || matchTags
    })
  }
}

export const ideasService = new IdeasServiceImpl()
