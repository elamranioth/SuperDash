import { TranslationCacheItem } from '@/types'
import { storageService } from '@/services/storage'

const CACHE_KEY = 'reader_translations_cache'

// Quick helper to decode HTML entities returned by translation APIs
function decodeHtmlEntities(str: string): string {
  const txt = document.createElement('textarea')
  txt.innerHTML = str
  return txt.value
}

class TranslationService {
  private cache: Map<string, string> = new Map()
  private initialized = false

  private async initCache(): Promise<void> {
    if (this.initialized) return
    try {
      const items = await storageService.get<TranslationCacheItem[]>(CACHE_KEY, [])
      if (Array.isArray(items)) {
        items.forEach(it => {
          this.cache.set(`${it.sourceLang}:${it.targetLang}:${it.sourceText.trim()}`, it.targetText)
        })
      }
    } catch (e) {
      console.warn('Failed to load translation cache:', e)
    }
    this.initialized = true
  }

  private async saveToCache(sourceText: string, targetText: string, sourceLang = 'en', targetLang = 'ar'): Promise<void> {
    const key = `${sourceLang}:${targetLang}:${sourceText.trim()}`
    this.cache.set(key, targetText)

    try {
      const items = await storageService.get<TranslationCacheItem[]>(CACHE_KEY, [])
      const updated = [
        {
          id: `tr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          sourceText: sourceText.trim(),
          targetText,
          sourceLang,
          targetLang,
          createdAt: Date.now()
        },
        ...items.slice(0, 200) // Keep latest 200 translations
      ]
      await storageService.set(CACHE_KEY, updated)
    } catch (e) {
      console.warn('Failed to save to translation cache:', e)
    }
  }

  async translate(
    text: string,
    sourceLang = 'en',
    targetLang = 'ar'
  ): Promise<{ text: string; cached: boolean; provider: string }> {
    const trimmed = text.trim()
    if (!trimmed) {
      return { text: '', cached: false, provider: 'none' }
    }

    await this.initCache()
    const cacheKey = `${sourceLang}:${targetLang}:${trimmed}`
    if (this.cache.has(cacheKey)) {
      return {
        text: this.cache.get(cacheKey)!,
        cached: true,
        provider: 'cache'
      }
    }

    // Try primary provider: MyMemory
    try {
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(trimmed)}&langpair=${sourceLang}|${targetLang}`
      const res = await fetch(url, { signal: AbortSignal.timeout(6000) })
      if (res.ok) {
        const data = await res.json()
        if (data && data.responseData && data.responseData.translatedText) {
          const cleaned = decodeHtmlEntities(data.responseData.translatedText)
          // If MyMemory returns match limit message or error string
          if (!cleaned.toLowerCase().includes('quota exceeded') && !cleaned.toLowerCase().includes('mymemory')) {
            await this.saveToCache(trimmed, cleaned, sourceLang, targetLang)
            return { text: cleaned, cached: false, provider: 'mymemory' }
          }
        }
      }
    } catch {
      // Continue to fallback
    }

    // Fallback: Google Translate public endpoint
    try {
      const gUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(trimmed)}`
      const gRes = await fetch(gUrl, { signal: AbortSignal.timeout(6000) })
      if (gRes.ok) {
        const gData = await gRes.json()
        if (Array.isArray(gData) && Array.isArray(gData[0])) {
          const translatedParts = gData[0].map((item: unknown[]) => (item && item[0] ? String(item[0]) : '')).join('')
          if (translatedParts) {
            await this.saveToCache(trimmed, translatedParts, sourceLang, targetLang)
            return { text: translatedParts, cached: false, provider: 'google' }
          }
        }
      }
    } catch (e) {
      console.warn('Fallback translation failed:', e)
    }

    throw new Error('Unable to translate selected text. Please check your internet connection and try again.')
  }

  speakArabic(text: string): boolean {
    if (!('speechSynthesis' in window)) return false
    try {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'ar-SA'
      utterance.rate = 0.9

      // Find Arabic voice if available
      const voices = window.speechSynthesis.getVoices()
      const arVoice = voices.find(v => v.lang.startsWith('ar'))
      if (arVoice) utterance.voice = arVoice

      window.speechSynthesis.speak(utterance)
      return true
    } catch (e) {
      console.warn('Speech synthesis error:', e)
      return false
    }
  }
}

export const translationService = new TranslationService()
