import {
  Collection,
  CollectionItem,
  CollectionSection,
  NoteItem,
  TaskItem,
  DocumentItem
} from '@/types'
import { storageService } from '@/services/storage'
import { ideasService } from '@/services/ideas'
import { decisionService } from '@/services/decisions'
import { readerRepository, annotationService } from '@/services/reader'
import { hearingRepository } from '@/services/hearings'

const STORAGE_KEYS = {
  COLLECTIONS: 'collections_list',
  ITEMS: 'collection_items'
}

export const INITIAL_COLLECTIONS: Collection[] = [
  {
    id: 'col-ai',
    name: 'Future of Artificial Intelligence',
    description: 'Articles, predictions, and research about AI development, cognitive agents, and scaling architectures.',
    coverType: 'gradient',
    coverValue: 'from-violet-600 via-indigo-600 to-cyan-500',
    icon: 'Sparkles',
    accent: '#8b5cf6',
    viewMode: 'grid',
    favorite: true,
    archived: false,
    sections: [
      { id: 'sec-ai-res', collectionId: 'col-ai', title: 'Research & Theories', order: 0 },
      { id: 'sec-ai-agents', collectionId: 'col-ai', title: 'Agent Architectures', order: 1 },
      { id: 'sec-ai-ideas', collectionId: 'col-ai', title: 'Ideas & Implementations', order: 2 }
    ],
    relatedCollectionIds: ['col-legal'],
    note: 'Curated synthesis for our 2026 cognitive systems initiative.',
    createdAt: Date.now() - 86400000 * 14,
    updatedAt: Date.now() - 86400000 * 1
  },
  {
    id: 'col-places',
    name: 'Places I Want to Visit',
    description: 'Quiet coastal towns, seaside tea spots, mountain libraries, and travel inspirations.',
    coverType: 'gradient',
    coverValue: 'from-emerald-500 via-teal-600 to-sky-600',
    icon: 'Compass',
    accent: '#10b981',
    viewMode: 'grid',
    favorite: true,
    archived: false,
    sections: [
      { id: 'sec-coastal', collectionId: 'col-places', title: 'Seaside & Coastal', order: 0 },
      { id: 'sec-retreats', collectionId: 'col-places', title: 'Quiet Retreats', order: 1 }
    ],
    note: 'Places where thought is quiet and time slows down.',
    createdAt: Date.now() - 86400000 * 20,
    updatedAt: Date.now() - 86400000 * 3
  },
  {
    id: 'col-legal',
    name: 'Legal Research — Brokerage Commission',
    description: 'Case precedents, statutory notes, articles on real estate commission rights, and court rulings.',
    coverType: 'gradient',
    coverValue: 'from-blue-600 via-indigo-700 to-slate-800',
    icon: 'Scale',
    accent: '#3b82f6',
    viewMode: 'list',
    favorite: false,
    archived: false,
    sections: [
      { id: 'sec-cases', collectionId: 'col-legal', title: 'Active Proceedings', order: 0 },
      { id: 'sec-law', collectionId: 'col-legal', title: 'Statutes & Commentary', order: 1 }
    ],
    relatedCollectionIds: ['col-ai'],
    createdAt: Date.now() - 86400000 * 10,
    updatedAt: Date.now() - 86400000 * 2
  }
]

export const INITIAL_COLLECTION_ITEMS: CollectionItem[] = [
  {
    id: 'item-ai-1',
    collectionId: 'col-ai',
    sectionId: 'sec-ai-res',
    itemType: 'article',
    sourceType: 'reader_article',
    sourceId: 'sample-agentic-ai',
    title: 'The Architecture of Thought: How Agentic Systems Are Redefining Modern Computing',
    description: 'Elena Vance & Liam Croft — Emergent Systems Quarterly',
    note: 'Foundational read on moving from single-shot LLM completion to dynamic deliberation loops.',
    favorite: true,
    position: 0,
    addedAt: Date.now() - 86400000 * 6
  },
  {
    id: 'item-ai-2',
    collectionId: 'col-ai',
    sectionId: 'sec-ai-res',
    itemType: 'quote',
    sourceType: 'reader_quote',
    sourceId: 'quote-sample-agentic',
    title: '"True machine intelligence begins when a model possesses the metacognitive capacity to realize its initial hypothesis was flawed..."',
    description: 'Elena Vance — The Architecture of Thought',
    note: 'Core thesis of agentic loops.',
    favorite: true,
    position: 1,
    addedAt: Date.now() - 86400000 * 5
  },
  {
    id: 'item-ai-3',
    collectionId: 'col-ai',
    sectionId: 'sec-ai-ideas',
    itemType: 'idea',
    sourceType: 'idea',
    sourceId: 'idea-1',
    title: 'AI Document Analyzer',
    description: 'Tool that compares two legal documents or contracts automatically, highlighting discrepancies and liability shifts.',
    note: 'Integrates with our legal contract review pipeline.',
    favorite: false,
    position: 2,
    addedAt: Date.now() - 86400000 * 4
  },
  {
    id: 'item-ai-4',
    collectionId: 'col-ai',
    sectionId: 'sec-ai-agents',
    itemType: 'link',
    title: 'Direct Preference Optimization: Your Language Model is Secretly a Reward Model',
    description: 'Rafailov et al. (Stanford University) — ArXiv 2305.18290',
    url: 'https://arxiv.org/abs/2305.18290',
    faviconUrl: 'https://arxiv.org/favicon.ico',
    note: 'Key paper removing RLHF complexity by optimizing directly on preference probabilities.',
    favorite: true,
    position: 3,
    addedAt: Date.now() - 86400000 * 3
  },
  {
    id: 'item-ai-5',
    collectionId: 'col-ai',
    sectionId: 'sec-ai-res',
    itemType: 'note',
    sourceType: 'note',
    sourceId: 'note-1',
    title: 'Project Roadmap 2026',
    description: 'Strategic engineering milestones and quarterly deliverables',
    note: 'Referenced section 3 on autonomous workflow integration.',
    favorite: false,
    position: 4,
    addedAt: Date.now() - 86400000 * 2
  },
  {
    id: 'item-ai-6',
    collectionId: 'col-ai',
    sectionId: 'sec-ai-res',
    itemType: 'manual',
    title: 'Scaling Limits vs Test-Time Compute (Open Research Question)',
    manualContent: 'Does adding pre-training parameters hit diminishing returns before test-time search and verification? Need to benchmark tree-of-thought vs MCTS.',
    note: 'Bring up during next technical debate.',
    favorite: false,
    position: 5,
    addedAt: Date.now() - 86400000 * 1
  },
  // Places items
  {
    id: 'item-plc-1',
    collectionId: 'col-places',
    sectionId: 'sec-coastal',
    itemType: 'place',
    title: 'Seaside café on the Brittany coast',
    description: 'Granite stone walls, stormy Atlantic morning, strong black tea, cedar smoke.',
    note: 'Spend an entire rainy Tuesday reading without an agenda.',
    favorite: true,
    position: 0,
    addedAt: Date.now() - 86400000 * 10
  },
  {
    id: 'item-plc-2',
    collectionId: 'col-places',
    sectionId: 'sec-retreats',
    itemType: 'place',
    title: 'Philosopher\'s Walk, Kyoto',
    description: 'Stone path alongside cherry canal, quiet wooden tea houses, autumn moss.',
    note: 'Best walked at 6:30 AM before anyone else is out.',
    favorite: false,
    position: 1,
    addedAt: Date.now() - 86400000 * 8
  },
  // Legal research items
  {
    id: 'item-leg-1',
    collectionId: 'col-legal',
    sectionId: 'sec-cases',
    itemType: 'hearing',
    sourceType: 'hearing',
    sourceId: 'h-1',
    title: 'Al-Mansoor Trading LLC vs Gulf Horizon Properties',
    description: 'Commercial Agency & Commission Dispute — Session #4',
    note: 'Key hearing regarding entitlement to brokerage fee post contractual term.',
    favorite: true,
    position: 0,
    addedAt: Date.now() - 86400000 * 9
  },
  {
    id: 'item-leg-2',
    collectionId: 'col-legal',
    sectionId: 'sec-law',
    itemType: 'manual',
    title: 'Federal Commercial Transactions Law — Article 252 Requirements',
    manualContent: 'Broker is entitled to fee only if the deal concluded as a direct result of their mediation, unless standard customs stipulate otherwise.',
    note: 'Must cross-reference with Court of Cassation precedent 2024/118.',
    favorite: true,
    position: 1,
    addedAt: Date.now() - 86400000 * 7
  }
]

export interface ResolvedCollectionItem extends CollectionItem {
  isMissing?: boolean
  liveTitle?: string
  liveDescription?: string
}

class CollectionsRepository {
  async getAllCollections(includeArchived = false): Promise<Collection[]> {
    const list = await storageService.get<Collection[]>(
      STORAGE_KEYS.COLLECTIONS,
      INITIAL_COLLECTIONS
    )
    if (!includeArchived) {
      return list.filter(c => !c.archived)
    }
    return list
  }

  async getCollectionById(id: string): Promise<Collection | undefined> {
    const list = await this.getAllCollections(true)
    return list.find(c => c.id === id)
  }

  async createCollection(
    data: Omit<Collection, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Collection> {
    const list = await this.getAllCollections(true)
    const newCol: Collection = {
      ...data,
      id: `col-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
    list.unshift(newCol)
    await storageService.set(STORAGE_KEYS.COLLECTIONS, list)
    return newCol
  }

  async updateCollection(
    id: string,
    updates: Partial<Collection>
  ): Promise<Collection | null> {
    const list = await this.getAllCollections(true)
    const idx = list.findIndex(c => c.id === id)
    if (idx === -1) return null

    const updated: Collection = {
      ...list[idx],
      ...updates,
      updatedAt: Date.now()
    }
    list[idx] = updated
    await storageService.set(STORAGE_KEYS.COLLECTIONS, list)
    return updated
  }

  async toggleFavorite(id: string): Promise<boolean> {
    const list = await this.getAllCollections(true)
    const col = list.find(c => c.id === id)
    if (!col) return false
    col.favorite = !col.favorite
    col.updatedAt = Date.now()
    await storageService.set(STORAGE_KEYS.COLLECTIONS, list)
    return col.favorite
  }

  async archiveCollection(id: string, archive = true): Promise<boolean> {
    const list = await this.getAllCollections(true)
    const col = list.find(c => c.id === id)
    if (!col) return false
    col.archived = archive
    col.updatedAt = Date.now()
    await storageService.set(STORAGE_KEYS.COLLECTIONS, list)
    return true
  }

  async deleteCollection(id: string): Promise<boolean> {
    const list = await this.getAllCollections(true)
    const filtered = list.filter(c => c.id !== id)
    await storageService.set(STORAGE_KEYS.COLLECTIONS, filtered)

    // Also delete all items inside this collection
    const items = await this.getAllItems()
    const remainingItems = items.filter(i => i.collectionId !== id)
    await storageService.set(STORAGE_KEYS.ITEMS, remainingItems)
    return true
  }

  // --- Collection Items ---

  async getAllItems(): Promise<CollectionItem[]> {
    return storageService.get<CollectionItem[]>(
      STORAGE_KEYS.ITEMS,
      INITIAL_COLLECTION_ITEMS
    )
  }

  async getItemsByCollection(collectionId: string): Promise<CollectionItem[]> {
    const all = await this.getAllItems()
    return all
      .filter(i => i.collectionId === collectionId)
      .sort((a, b) => a.position - b.position)
  }

  async addItem(item: Omit<CollectionItem, 'id' | 'addedAt'>): Promise<CollectionItem> {
    const all = await this.getAllItems()
    const existingInCol = all.filter(i => i.collectionId === item.collectionId)
    const newItem: CollectionItem = {
      ...item,
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      position: item.position ?? existingInCol.length,
      addedAt: Date.now()
    }
    all.push(newItem)
    await storageService.set(STORAGE_KEYS.ITEMS, all)

    // Touch collection updatedAt
    await this.updateCollection(item.collectionId, {})
    return newItem
  }

  async updateItem(
    id: string,
    updates: Partial<CollectionItem>
  ): Promise<CollectionItem | null> {
    const all = await this.getAllItems()
    const idx = all.findIndex(i => i.id === id)
    if (idx === -1) return null

    const updated: CollectionItem = {
      ...all[idx],
      ...updates,
      updatedAt: Date.now()
    }
    all[idx] = updated
    await storageService.set(STORAGE_KEYS.ITEMS, all)
    return updated
  }

  async removeItem(id: string): Promise<boolean> {
    const all = await this.getAllItems()
    const item = all.find(i => i.id === id)
    const filtered = all.filter(i => i.id !== id)
    await storageService.set(STORAGE_KEYS.ITEMS, filtered)
    if (item) {
      await this.updateCollection(item.collectionId, {})
    }
    return true
  }

  async toggleItemFavorite(id: string): Promise<boolean> {
    const all = await this.getAllItems()
    const item = all.find(i => i.id === id)
    if (!item) return false
    item.favorite = !item.favorite
    item.updatedAt = Date.now()
    await storageService.set(STORAGE_KEYS.ITEMS, all)
    return !!item.favorite
  }

  async reorderItems(collectionId: string, itemIdsInOrder: string[]): Promise<void> {
    const all = await this.getAllItems()
    const idMap = new Map(itemIdsInOrder.map((id, index) => [id, index]))

    all.forEach(item => {
      if (item.collectionId === collectionId && idMap.has(item.id)) {
        item.position = idMap.get(item.id)!
      }
    })

    await storageService.set(STORAGE_KEYS.ITEMS, all)
  }

  async moveItemToSection(itemId: string, sectionId?: string): Promise<void> {
    await this.updateItem(itemId, { sectionId })
  }

  // --- Dynamic Live Reference Resolver ---

  async resolveLiveItem(item: CollectionItem): Promise<ResolvedCollectionItem> {
    // If it's a standalone manual item, link, image, or text, return as-is
    if (!item.sourceType || !item.sourceId) {
      return item
    }

    try {
      if (item.sourceType === 'reader_article') {
        const article = await readerRepository.getArticleById(item.sourceId)
        if (!article) return { ...item, isMissing: true }
        return {
          ...item,
          liveTitle: article.title,
          liveDescription: `${article.author || 'Author'} — ${article.publication || 'Reader'}`
        }
      }

      if (item.sourceType === 'reader_quote') {
        const quotes = await annotationService.getQuotes()
        const q = quotes.find(q => q.id === item.sourceId)
        if (!q) {
          // If it was sample quote, fallback to snapshot
          return item
        }
        return {
          ...item,
          liveTitle: `"${q.text}"`,
          liveDescription: q.articleTitle ? `From: ${q.articleTitle}` : undefined
        }
      }

      if (item.sourceType === 'idea') {
        const idea = await ideasService.getById(item.sourceId)
        if (!idea) return { ...item, isMissing: true }
        return {
          ...item,
          liveTitle: idea.title,
          liveDescription: idea.description
        }
      }

      if (item.sourceType === 'decision') {
        const decision = await decisionService.getById(item.sourceId)
        if (!decision) return { ...item, isMissing: true }
        return {
          ...item,
          liveTitle: decision.title,
          liveDescription: decision.context || decision.decision
        }
      }

      if (item.sourceType === 'note') {
        const notes = await storageService.get<NoteItem[]>('notes', [])
        const note = notes.find(n => n.id === item.sourceId)
        if (!note) return { ...item, isMissing: true }
        return {
          ...item,
          liveTitle: note.title,
          liveDescription: note.content.slice(0, 100)
        }
      }

      if (item.sourceType === 'task') {
        const tasks = await storageService.get<TaskItem[]>('tasks', [])
        const task = tasks.find(t => t.id === item.sourceId)
        if (!task) return { ...item, isMissing: true }
        return {
          ...item,
          liveTitle: task.title,
          liveDescription: task.dueDate ? `Due: ${task.dueDate}` : undefined
        }
      }

      if (item.sourceType === 'hearing') {
        const hearing = await hearingRepository.getById(item.sourceId)
        if (!hearing) return { ...item, isMissing: true }
        return {
          ...item,
          liveTitle: `${hearing.clientName} — ${hearing.court || 'Court'}`,
          liveDescription: hearing.caseType ? `Case: ${hearing.caseType}` : hearing.caseId
        }
      }

      if (item.sourceType === 'document') {
        const docs = await storageService.get<DocumentItem[]>('stored_documents', [])
        const doc = docs.find(d => d.id === item.sourceId)
        if (!doc) return { ...item, isMissing: true }
        return {
          ...item,
          liveTitle: doc.name,
          liveDescription: doc.category
        }
      }

      return item
    } catch (e) {
      console.warn('Error resolving collection item reference:', e)
      return item
    }
  }

  async resolveAllInCollection(collectionId: string): Promise<ResolvedCollectionItem[]> {
    const items = await this.getItemsByCollection(collectionId)
    return Promise.all(items.map(item => this.resolveLiveItem(item)))
  }
}

export const collectionsRepository = new CollectionsRepository()
