import { DecisionItem, DecisionStatus, DecisionRating } from '@/types'
import { storageService } from '@/services/storage'
import { toLocalYYYYMMDD } from '@/utils/date'

const STORAGE_KEY = 'decisions_items'

export const DEFAULT_DECISION_CATEGORIES = [
  'Business',
  'Technology',
  'Financial',
  'Career',
  'Personal',
  'Project',
  'Legal',
  'Other'
]

// Date helper
function getOffsetDate(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return toLocalYYYYMMDD(d)
}

export const INITIAL_DECISIONS: DecisionItem[] = [
  {
    id: 'dec-1',
    title: 'Migrate Cloud Hosting to Cloudflare Pages & Workers',
    context: 'Evaluating hosting infrastructure for web dashboard and client-facing advisory tools.',
    decision: 'Deploy primary applications to Cloudflare Pages with edge workers.',
    options: ['Cloudflare Pages', 'Vercel Pro', 'Self-hosted VPS on Hetzner'],
    reasons: [
      'Sub-50ms global edge latency in UAE and Middle East',
      'Extremely generous free/starter tier with no bandwidth surprises',
      'Integrated DDoS protection and zero-trust tunneling'
    ],
    risks: [
      'Worker runtime differs from full Node.js environment',
      'Vendor-specific binding configuration'
    ],
    expectedOutcome: 'Zero server maintenance overhead, under 300ms page loads in Dubai, and zero hosting bill under current volume.',
    confidence: 85,
    category: 'Technology',
    decisionDate: getOffsetDate(-45),
    reviewDate: getOffsetDate(0), // Due today!
    status: 'REVIEW DUE',
    createdAt: Date.now() - 3600000 * 24 * 45,
    updatedAt: Date.now() - 3600000 * 24 * 10
  },
  {
    id: 'dec-2',
    title: 'Implement 5% UAE VAT Direct Billing Automation',
    context: 'Transitioning from manual Excel receipt sheets to automated software billing engine.',
    decision: 'Embed standard compliant VAT invoicing engine with TRN registration directly in SuperDash.',
    options: ['Custom embedded SuperDash Finance app', 'Third-party QuickBooks subscription', 'Zoho Books'],
    reasons: [
      'Single consolidated operating system interface for law firm & advisory',
      'No monthly recurring SaaS subscription cost',
      'Complete local data sovereignty on client confidential matters'
    ],
    risks: [
      'Need to ensure compliance with UAE FTA tax invoice requirements'
    ],
    expectedOutcome: 'Faster invoice issuance, automated 5% calculation, and instant payment receipt tracking.',
    confidence: 90,
    category: 'Financial',
    decisionDate: getOffsetDate(-30),
    reviewDate: getOffsetDate(15),
    status: 'ACTIVE',
    createdAt: Date.now() - 3600000 * 24 * 30,
    updatedAt: Date.now() - 3600000 * 24 * 30
  },
  {
    id: 'dec-3',
    title: 'Adopt Liquid Glass OS Interface Design Language',
    context: 'Deciding on the visual styling for the entire personal dashboard.',
    decision: 'Build a bespoke Liquid Glass design system using CSS backdrop-filter, specular highlights, and calm translucent tokens.',
    options: ['Liquid Glass Apple/iOS-inspired', 'Flat minimalist monochrome', 'Standard Tailwind TailwindUI'],
    reasons: [
      'Unique, high-end feel that inspires daily deep work',
      'Seamless support for ambient background wallpapers',
      'Differentiates the dashboard from generic productivity apps'
    ],
    risks: [
      'GPU rendering overhead on older hardware with high blur'
    ],
    expectedOutcome: 'A visually breathtaking workspace that feels like a personal desktop OS.',
    confidence: 95,
    category: 'Project',
    decisionDate: getOffsetDate(-60),
    reviewDate: getOffsetDate(-10),
    actualOutcome: 'Interface looks stunning, smooth 60fps animations, highly praised and delightful to use daily.',
    lessons: 'Investing in high aesthetic fidelity dramatically increases satisfaction and focus.',
    repeatDecision: 'Yes',
    resultRating: 'BETTER THAN EXPECTED',
    status: 'REVIEWED',
    createdAt: Date.now() - 3600000 * 24 * 60,
    updatedAt: Date.now() - 3600000 * 24 * 10,
    reviewedAt: Date.now() - 3600000 * 24 * 10
  }
]

type DecisionSubscriber = () => void

class DecisionServiceImpl {
  private subscribers = new Set<DecisionSubscriber>()

  subscribe(callback: DecisionSubscriber): () => void {
    this.subscribers.add(callback)
    return () => {
      this.subscribers.delete(callback)
    }
  }

  private notify() {
    this.subscribers.forEach(cb => {
      try {
        cb()
      } catch (e) {
        console.error('Decision subscription error:', e)
      }
    })
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('superdash_decisions_updated'))
    }
  }

  async getAll(): Promise<DecisionItem[]> {
    const list = await storageService.get<DecisionItem[]>(STORAGE_KEY, INITIAL_DECISIONS)
    const today = toLocalYYYYMMDD()

    // Auto-compute status for items where review date has passed and not yet reviewed
    return list.map(item => {
      if (item.status === 'ACTIVE' || item.status === 'WAITING FOR OUTCOME') {
        if (item.reviewDate <= today) {
          return { ...item, status: 'REVIEW DUE' as DecisionStatus }
        }
      }
      return item
    })
  }

  async getById(id: string): Promise<DecisionItem | undefined> {
    const list = await this.getAll()
    return list.find(d => d.id === id)
  }

  async add(item: {
    title: string
    context?: string
    decision: string
    options?: string[]
    reasons?: string[]
    risks?: string[]
    expectedOutcome?: string
    confidence?: number
    category?: string
    decisionDate?: string
    reviewDate?: string
  }): Promise<DecisionItem> {
    const list = await this.getAll()
    const now = Date.now()
    const today = toLocalYYYYMMDD()

    const newDecision: DecisionItem = {
      id: 'dec-' + now + '-' + Math.random().toString(36).substring(2, 6),
      title: item.title.trim(),
      context: item.context?.trim() || undefined,
      decision: item.decision.trim(),
      options: item.options?.filter(o => o.trim()) || [],
      reasons: item.reasons?.filter(r => r.trim()) || [],
      risks: item.risks?.filter(r => r.trim()) || [],
      expectedOutcome: item.expectedOutcome?.trim() || undefined,
      confidence: item.confidence ?? 70,
      category: item.category || 'Business',
      decisionDate: item.decisionDate || today,
      reviewDate: item.reviewDate || today,
      status: (item.reviewDate && item.reviewDate <= today) ? 'REVIEW DUE' : 'ACTIVE',
      createdAt: now,
      updatedAt: now
    }

    const updated = [newDecision, ...list]
    await storageService.set(STORAGE_KEY, updated)
    this.notify()
    return newDecision
  }

  async update(id: string, updates: Partial<DecisionItem>): Promise<DecisionItem | null> {
    const list = await this.getAll()
    const idx = list.findIndex(d => d.id === id)
    if (idx === -1) return null

    const updatedItem: DecisionItem = {
      ...list[idx],
      ...updates,
      updatedAt: Date.now()
    }

    list[idx] = updatedItem
    await storageService.set(STORAGE_KEY, list)
    this.notify()
    return updatedItem
  }

  async evaluate(
    id: string,
    evaluation: {
      actualOutcome: string
      lessons: string
      repeatDecision: 'Yes' | 'No' | 'Not Sure'
      resultRating: DecisionRating
    }
  ): Promise<DecisionItem | null> {
    const list = await this.getAll()
    const idx = list.findIndex(d => d.id === id)
    if (idx === -1) return null

    const updatedItem: DecisionItem = {
      ...list[idx],
      actualOutcome: evaluation.actualOutcome.trim(),
      lessons: evaluation.lessons.trim(),
      repeatDecision: evaluation.repeatDecision,
      resultRating: evaluation.resultRating,
      status: 'REVIEWED',
      reviewedAt: Date.now(),
      updatedAt: Date.now()
    }

    list[idx] = updatedItem
    await storageService.set(STORAGE_KEY, list)
    this.notify()
    return updatedItem
  }

  async delete(id: string): Promise<boolean> {
    const list = await this.getAll()
    const filtered = list.filter(d => d.id !== id)
    if (filtered.length === list.length) return false
    await storageService.set(STORAGE_KEY, filtered)
    this.notify()
    return true
  }

  async getReviewsDue(): Promise<DecisionItem[]> {
    const list = await this.getAll()
    const today = toLocalYYYYMMDD()
    return list.filter(d => d.reviewDate <= today && d.status !== 'REVIEWED' && d.status !== 'ARCHIVED')
  }

  async search(query: string): Promise<DecisionItem[]> {
    const q = query.toLowerCase().trim()
    const list = await this.getAll()
    if (!q) return list
    return list.filter(d => {
      const matchTitle = d.title.toLowerCase().includes(q)
      const matchContext = d.context?.toLowerCase().includes(q)
      const matchDec = d.decision.toLowerCase().includes(q)
      const matchReasons = d.reasons?.some(r => r.toLowerCase().includes(q))
      const matchLessons = d.lessons?.toLowerCase().includes(q)
      const matchCat = d.category.toLowerCase().includes(q)
      return matchTitle || matchContext || matchDec || matchReasons || matchLessons || matchCat
    })
  }
}

export const decisionService = new DecisionServiceImpl()
