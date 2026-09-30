import { Article, ArticleBlock } from '@/types'
import { toLocalYYYYMMDD } from '@/utils/date'

export interface ManualImportPayload {
  title: string
  url?: string
  author?: string
  publication?: string
  content: string
  coverImage?: string
}

export class ArticleImportError extends Error {
  code: 'INVALID_URL' | 'FETCH_FAILED' | 'CORS_OR_BLOCKED' | 'EMPTY_CONTENT'
  constructor(message: string, code: 'INVALID_URL' | 'FETCH_FAILED' | 'CORS_OR_BLOCKED' | 'EMPTY_CONTENT') {
    super(message)
    this.name = 'ArticleImportError'
    this.code = code
  }
}

function cleanText(text: string): string {
  return text.replace(/\s+/g, ' ').trim()
}

function extractDomain(url: string): string {
  try {
    const parsed = new URL(url)
    return parsed.hostname.replace(/^www\./, '')
  } catch {
    return 'Web Article'
  }
}

function calculateReadingTime(wordCount: number): number {
  return Math.max(1, Math.ceil(wordCount / 200))
}

class ArticleImportService {
  async importFromUrl(rawUrl: string): Promise<Article> {
    const trimmed = rawUrl.trim()
    let validUrl: URL
    try {
      validUrl = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`)
    } catch {
      throw new ArticleImportError('Please enter a valid web article URL (e.g. https://example.com/article).', 'INVALID_URL')
    }

    const domain = extractDomain(validUrl.toString())
    let htmlContent = ''

    // 1. Try direct fetch
    try {
      const res = await fetch(validUrl.toString(), {
        headers: { Accept: 'text/html,application/xhtml+xml' },
        signal: AbortSignal.timeout(6000)
      })
      if (res.ok) {
        htmlContent = await res.text()
      }
    } catch {
      // Direct fetch failed (likely CORS), try proxy
    }

    // 2. Try proxy 1: allorigins
    if (!htmlContent) {
      try {
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(validUrl.toString())}`
        const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(8000) })
        if (res.ok) {
          htmlContent = await res.text()
        }
      } catch {
        // Fallback to proxy 2
      }
    }

    // 3. Try proxy 2: corsproxy.io
    if (!htmlContent) {
      try {
        const proxy2Url = `https://corsproxy.io/?url=${encodeURIComponent(validUrl.toString())}`
        const res = await fetch(proxy2Url, { signal: AbortSignal.timeout(8000) })
        if (res.ok) {
          htmlContent = await res.text()
        }
      } catch {
        // All network attempts failed
      }
    }

    if (!htmlContent) {
      throw new ArticleImportError(
        `Unable to fetch directly from ${domain} due to cross-origin or website security restrictions. You can paste the article text or HTML directly to read it instantly.`,
        'CORS_OR_BLOCKED'
      )
    }

    return this.parseHtmlToArticle(htmlContent, validUrl.toString(), domain)
  }

  parseHtmlToArticle(html: string, url: string, domain: string): Article {
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')

    // Remove scripts, styles, ads, navigation, and noise
    const noisySelectors = [
      'script',
      'style',
      'noscript',
      'iframe',
      'nav',
      'header',
      'footer',
      'aside',
      '.advertisement',
      '.ad',
      '.ads',
      '.social-share',
      '.share-buttons',
      '.comments',
      '.newsletter-signup',
      '.cookie-banner',
      '#disqus_thread'
    ]
    noisySelectors.forEach(sel => {
      doc.querySelectorAll(sel).forEach(el => el.remove())
    })

    // Extract Title
    let title =
      doc.querySelector('meta[property="og:title"]')?.getAttribute('content') ||
      doc.querySelector('meta[name="twitter:title"]')?.getAttribute('content') ||
      doc.querySelector('title')?.textContent ||
      doc.querySelector('h1')?.textContent ||
      'Untitled Article'
    title = cleanText(title)

    // Extract Author
    let author =
      doc.querySelector('meta[name="author"]')?.getAttribute('content') ||
      doc.querySelector('meta[property="article:author"]')?.getAttribute('content') ||
      doc.querySelector('[rel="author"]')?.textContent ||
      doc.querySelector('.author, .byline, .author-name')?.textContent ||
      undefined
    if (author) author = cleanText(author)

    // Extract Publication Date
    const publishedAt =
      doc.querySelector('meta[property="article:published_time"]')?.getAttribute('content')?.split('T')[0] ||
      doc.querySelector('time[datetime]')?.getAttribute('datetime')?.split('T')[0] ||
      doc.querySelector('time')?.textContent?.trim() ||
      toLocalYYYYMMDD()

    // Extract Cover Image
    const coverImage =
      doc.querySelector('meta[property="og:image"]')?.getAttribute('content') ||
      doc.querySelector('meta[name="twitter:image"]')?.getAttribute('content') ||
      undefined

    // Identify primary content container
    let rootContainer: Element | null =
      doc.querySelector('article') ||
      doc.querySelector('[role="main"]') ||
      doc.querySelector('main') ||
      doc.querySelector('.post-content, .article-content, .entry-content, .story-body')

    if (!rootContainer) {
      // Find element with the most paragraph tags
      const candidates = Array.from(doc.querySelectorAll('div, section'))
      let maxPCount = 0
      candidates.forEach(el => {
        const count = el.querySelectorAll('p').length
        if (count > maxPCount) {
          maxPCount = count
          rootContainer = el
        }
      })
    }

    if (!rootContainer) {
      rootContainer = doc.body
    }

    const blocks: ArticleBlock[] = []
    let totalWordCount = 0
    let blockIdCounter = 1

    // Process nodes inside content container
    const children = Array.from(rootContainer.querySelectorAll('h1, h2, h3, h4, p, blockquote, ul, ol, pre, img'))

    children.forEach(node => {
      const tagName = node.tagName.toLowerCase()

      if (tagName === 'h1') {
        const text = cleanText(node.textContent || '')
        if (text && text !== title) {
          blocks.push({ id: `blk-${blockIdCounter++}`, type: 'h1', text })
        }
      } else if (tagName === 'h2') {
        const text = cleanText(node.textContent || '')
        if (text) blocks.push({ id: `blk-${blockIdCounter++}`, type: 'h2', text })
      } else if (tagName === 'h3' || tagName === 'h4') {
        const text = cleanText(node.textContent || '')
        if (text) blocks.push({ id: `blk-${blockIdCounter++}`, type: 'h3', text })
      } else if (tagName === 'p') {
        const text = cleanText(node.textContent || '')
        if (text && text.length > 20) {
          blocks.push({ id: `blk-${blockIdCounter++}`, type: 'paragraph', text })
          totalWordCount += text.split(/\s+/).length
        }
      } else if (tagName === 'blockquote') {
        const text = cleanText(node.textContent || '')
        if (text) {
          blocks.push({ id: `blk-${blockIdCounter++}`, type: 'blockquote', text })
          totalWordCount += text.split(/\s+/).length
        }
      } else if (tagName === 'ul' || tagName === 'ol') {
        const items = Array.from(node.querySelectorAll('li'))
          .map(li => cleanText(li.textContent || ''))
          .filter(t => t.length > 0)
        if (items.length > 0) {
          blocks.push({ id: `blk-${blockIdCounter++}`, type: 'list', items })
          totalWordCount += items.reduce((sum, item) => sum + item.split(/\s+/).length, 0)
        }
      } else if (tagName === 'pre') {
        const text = node.textContent?.trim() || ''
        if (text) {
          blocks.push({ id: `blk-${blockIdCounter++}`, type: 'code', text })
        }
      } else if (tagName === 'img') {
        const src = node.getAttribute('src')
        const caption = node.getAttribute('alt') || node.getAttribute('title') || undefined
        if (src && !src.startsWith('data:') && !src.includes('tracker') && !src.includes('pixel')) {
          // Resolve relative URLs
          let fullSrc = src
          try {
            fullSrc = new URL(src, url).toString()
          } catch {
            // Keep original
          }
          blocks.push({ id: `blk-${blockIdCounter++}`, type: 'image', src: fullSrc, caption })
        }
      }
    })

    if (blocks.length === 0) {
      throw new ArticleImportError(
        'Could not extract readable article text from this page. You can paste the text directly.',
        'EMPTY_CONTENT'
      )
    }

    const firstParagraph = blocks.find(b => b.type === 'paragraph')?.text
    const excerpt = firstParagraph ? firstParagraph.slice(0, 160) + '...' : undefined

    return {
      id: `art-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      url,
      title,
      author,
      publication: domain,
      publishedAt,
      readingTimeMinutes: calculateReadingTime(totalWordCount),
      wordCount: totalWordCount,
      excerpt,
      coverImage,
      blocks,
      status: 'UNREAD',
      favorite: false,
      scrollProgress: 0,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
  }

  importFromManualText(payload: ManualImportPayload): Article {
    const { title, url, author, publication, content, coverImage } = payload
    const trimmedTitle = cleanText(title) || 'Untitled Article'
    const trimmedContent = content.trim()

    if (!trimmedContent) {
      throw new ArticleImportError('Please provide article content to read.', 'EMPTY_CONTENT')
    }

    // Split paragraphs by double newline
    const rawParagraphs = trimmedContent.split(/\n\s*\n/)
    const blocks: ArticleBlock[] = []
    let totalWordCount = 0
    let counter = 1

    rawParagraphs.forEach(rawP => {
      const line = rawP.trim()
      if (!line) return

      if (line.startsWith('# ')) {
        blocks.push({ id: `blk-${counter++}`, type: 'h1', text: line.replace(/^#\s+/, '') })
      } else if (line.startsWith('## ')) {
        blocks.push({ id: `blk-${counter++}`, type: 'h2', text: line.replace(/^##\s+/, '') })
      } else if (line.startsWith('### ')) {
        blocks.push({ id: `blk-${counter++}`, type: 'h3', text: line.replace(/^###\s+/, '') })
      } else if (line.startsWith('> ')) {
        const text = line.replace(/^>\s+/, '').replace(/\n>\s+/g, ' ')
        blocks.push({ id: `blk-${counter++}`, type: 'blockquote', text })
        totalWordCount += text.split(/\s+/).length
      } else if (line.startsWith('- ') || line.startsWith('* ') || /^\d+\.\s/.test(line)) {
        const items = line
          .split('\n')
          .map(l => l.replace(/^[-*]\s+|\d+\.\s+/, '').trim())
          .filter(Boolean)
        blocks.push({ id: `blk-${counter++}`, type: 'list', items })
        totalWordCount += items.reduce((sum, it) => sum + it.split(/\s+/).length, 0)
      } else {
        blocks.push({ id: `blk-${counter++}`, type: 'paragraph', text: line })
        totalWordCount += line.split(/\s+/).length
      }
    })

    const domain = url ? extractDomain(url) : publication || 'Pasted Article'
    const firstParagraph = blocks.find(b => b.type === 'paragraph')?.text
    const excerpt = firstParagraph ? firstParagraph.slice(0, 160) + '...' : undefined

    return {
      id: `art-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      url: url?.trim() || undefined,
      title: trimmedTitle,
      author: author?.trim() || undefined,
      publication: domain,
      publishedAt: toLocalYYYYMMDD(),
      readingTimeMinutes: calculateReadingTime(totalWordCount),
      wordCount: totalWordCount,
      excerpt,
      coverImage: coverImage?.trim() || undefined,
      blocks,
      rawContent: trimmedContent,
      status: 'UNREAD',
      favorite: false,
      scrollProgress: 0,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
  }
}

export const articleImportService = new ArticleImportService()
