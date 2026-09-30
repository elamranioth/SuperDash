import { Article, ReaderSettings, ReadingStatus } from '@/types'
import { storageService } from '@/services/storage'
import { SAMPLE_ARTICLES } from './sampleArticles'

const STORAGE_KEYS = {
  ARTICLES: 'reader_articles',
  SETTINGS: 'reader_settings'
}

export const DEFAULT_READER_SETTINGS: ReaderSettings = {
  fontFamily: 'serif',
  fontSize: 18,
  lineHeight: 1.75,
  columnWidth: 'comfortable',
  theme: 'dark',
  bionicReading: false,
  autoBookmark: true
}

class ReaderRepository {
  async getAllArticles(): Promise<Article[]> {
    const articles = await storageService.get<Article[]>(STORAGE_KEYS.ARTICLES, SAMPLE_ARTICLES)
    return articles || []
  }

  async getArticleById(id: string): Promise<Article | undefined> {
    const list = await this.getAllArticles()
    return list.find(a => a.id === id)
  }

  async saveArticle(article: Article): Promise<Article> {
    const list = await this.getAllArticles()
    const index = list.findIndex(a => a.id === article.id)
    let updated: Article[]

    if (index >= 0) {
      updated = [...list]
      updated[index] = { ...article, updatedAt: Date.now() }
    } else {
      updated = [article, ...list]
    }

    await storageService.set(STORAGE_KEYS.ARTICLES, updated)
    return index >= 0 ? updated[index] : article
  }

  async deleteArticle(id: string): Promise<void> {
    const list = await this.getAllArticles()
    const filtered = list.filter(a => a.id !== id)
    await storageService.set(STORAGE_KEYS.ARTICLES, filtered)
  }

  async updateScrollProgress(id: string, progress: number, position?: number): Promise<void> {
    const list = await this.getAllArticles()
    const index = list.findIndex(a => a.id === id)
    if (index >= 0) {
      const art = list[index]
      const completed = progress >= 95
      const newStatus: ReadingStatus = completed ? 'FINISHED' : art.status === 'UNREAD' ? 'READING' : art.status
      list[index] = {
        ...art,
        scrollProgress: Math.min(100, Math.max(0, Math.round(progress))),
        scrollPosition: position ?? art.scrollPosition,
        status: newStatus,
        lastReadAt: Date.now(),
        updatedAt: Date.now()
      }
      await storageService.set(STORAGE_KEYS.ARTICLES, list)
    }
  }

  async updateArticleStatus(id: string, status: ReadingStatus): Promise<void> {
    const list = await this.getAllArticles()
    const index = list.findIndex(a => a.id === id)
    if (index >= 0) {
      list[index] = {
        ...list[index],
        status,
        updatedAt: Date.now()
      }
      await storageService.set(STORAGE_KEYS.ARTICLES, list)
    }
  }

  async toggleFavorite(id: string): Promise<boolean> {
    const list = await this.getAllArticles()
    const index = list.findIndex(a => a.id === id)
    if (index >= 0) {
      const nextFav = !list[index].favorite
      list[index] = {
        ...list[index],
        favorite: nextFav,
        updatedAt: Date.now()
      }
      await storageService.set(STORAGE_KEYS.ARTICLES, list)
      return nextFav
    }
    return false
  }

  async getSettings(): Promise<ReaderSettings> {
    const settings = await storageService.get<ReaderSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_READER_SETTINGS)
    return { ...DEFAULT_READER_SETTINGS, ...settings }
  }

  async saveSettings(partial: Partial<ReaderSettings>): Promise<ReaderSettings> {
    const current = await this.getSettings()
    const updated = { ...current, ...partial }
    await storageService.set(STORAGE_KEYS.SETTINGS, updated)
    return updated
  }
}

export const readerRepository = new ReaderRepository()
