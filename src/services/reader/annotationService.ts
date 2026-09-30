import { Highlight, Quote, ReaderNote, HighlightColor } from '@/types'
import { storageService } from '@/services/storage'
import { SAMPLE_HIGHLIGHTS, SAMPLE_QUOTES, SAMPLE_NOTES } from './sampleAnnotations'

const STORAGE_KEYS = {
  HIGHLIGHTS: 'reader_highlights',
  QUOTES: 'reader_quotes',
  NOTES: 'reader_notes'
}

class AnnotationService {
  // ==================== HIGHLIGHTS ====================

  async getHighlights(articleId?: string): Promise<Highlight[]> {
    const list = await storageService.get<Highlight[]>(STORAGE_KEYS.HIGHLIGHTS, SAMPLE_HIGHLIGHTS)
    if (!list) return []
    if (articleId) {
      return list.filter(h => h.articleId === articleId)
    }
    return list
  }

  async saveHighlight(highlight: Highlight): Promise<Highlight> {
    const list = await this.getHighlights()
    const index = list.findIndex(h => h.id === highlight.id)
    let updated: Highlight[]

    if (index >= 0) {
      updated = [...list]
      updated[index] = { ...highlight, updatedAt: Date.now() }
    } else {
      updated = [highlight, ...list]
    }

    await storageService.set(STORAGE_KEYS.HIGHLIGHTS, updated)
    return highlight
  }

  async updateHighlightColor(id: string, color: HighlightColor): Promise<void> {
    const list = await this.getHighlights()
    const index = list.findIndex(h => h.id === id)
    if (index >= 0) {
      list[index].color = color
      list[index].updatedAt = Date.now()
      await storageService.set(STORAGE_KEYS.HIGHLIGHTS, list)
    }
  }

  async updateHighlightNote(id: string, note: string): Promise<void> {
    const list = await this.getHighlights()
    const index = list.findIndex(h => h.id === id)
    if (index >= 0) {
      list[index].note = note
      list[index].updatedAt = Date.now()
      await storageService.set(STORAGE_KEYS.HIGHLIGHTS, list)
    }
  }

  async deleteHighlight(id: string): Promise<void> {
    const list = await this.getHighlights()
    const filtered = list.filter(h => h.id !== id)
    await storageService.set(STORAGE_KEYS.HIGHLIGHTS, filtered)
  }

  // ==================== QUOTES ====================

  async getQuotes(articleId?: string): Promise<Quote[]> {
    const list = await storageService.get<Quote[]>(STORAGE_KEYS.QUOTES, SAMPLE_QUOTES)
    if (!list) return []
    if (articleId) {
      return list.filter(q => q.articleId === articleId)
    }
    return list
  }

  async saveQuote(quote: Quote): Promise<Quote> {
    const list = await this.getQuotes()
    const index = list.findIndex(q => q.id === quote.id)
    let updated: Quote[]

    if (index >= 0) {
      updated = [...list]
      updated[index] = quote
    } else {
      updated = [quote, ...list]
    }

    await storageService.set(STORAGE_KEYS.QUOTES, updated)
    return quote
  }

  async deleteQuote(id: string): Promise<void> {
    const list = await this.getQuotes()
    const filtered = list.filter(q => q.id !== id)
    await storageService.set(STORAGE_KEYS.QUOTES, filtered)
  }

  async toggleQuoteFavorite(id: string): Promise<boolean> {
    const list = await this.getQuotes()
    const index = list.findIndex(q => q.id === id)
    if (index >= 0) {
      const nextFav = !list[index].favorite
      list[index].favorite = nextFav
      await storageService.set(STORAGE_KEYS.QUOTES, list)
      return nextFav
    }
    return false
  }

  // ==================== NOTES ====================

  async getNotes(articleId?: string): Promise<ReaderNote[]> {
    const list = await storageService.get<ReaderNote[]>(STORAGE_KEYS.NOTES, SAMPLE_NOTES)
    if (!list) return []
    if (articleId) {
      return list.filter(n => n.articleId === articleId)
    }
    return list
  }

  async saveNote(note: ReaderNote): Promise<ReaderNote> {
    const list = await this.getNotes()
    const index = list.findIndex(n => n.id === note.id)
    let updated: ReaderNote[]

    if (index >= 0) {
      updated = [...list]
      updated[index] = { ...note, updatedAt: Date.now() }
    } else {
      updated = [note, ...list]
    }

    await storageService.set(STORAGE_KEYS.NOTES, updated)
    return note
  }

  async deleteNote(id: string): Promise<void> {
    const list = await this.getNotes()
    const filtered = list.filter(n => n.id !== id)
    await storageService.set(STORAGE_KEYS.NOTES, filtered)
  }
}

export const annotationService = new AnnotationService()
