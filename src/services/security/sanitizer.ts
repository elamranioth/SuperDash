/**
 * SuperDash DOM & HTML Sanitizer
 * 
 * Zero-dependency, defense-in-depth HTML sanitizer using the browser's native DOMParser.
 * Strictly whitelist-based: strips all script, iframe, object, embed, form, event handlers (on*),
 * and dangerous protocols (javascript:, data:, vbscript:).
 */

const DANGEROUS_TAGS = new Set([
  'script', 'iframe', 'object', 'embed', 'form', 'style', 'noscript', 'meta', 'link'
])

const ALLOWED_TAGS = new Set([
  'p', 'br', 'b', 'i', 'strong', 'em', 'u', 's', 'strike',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li', 'blockquote', 'code', 'pre', 'hr',
  'span', 'div', 'a'
])

const ALLOWED_ATTRS = new Set([
  'class', 'style', 'title', 'href', 'target', 'rel'
])

const SAFE_PROTOCOLS = new Set(['http:', 'https:', 'mailto:', 'tel:'])

function isSafeUrl(urlStr: string): boolean {
  if (!urlStr) return false
  if (urlStr.startsWith('/') || urlStr.startsWith('#')) return true
  try {
    const parsed = new URL(urlStr, 'https://superdash.local')
    return SAFE_PROTOCOLS.has(parsed.protocol)
  } catch {
    return false
  }
}

/**
 * Strips dangerous tags, attributes, event handlers and dangerous protocols.
 * Returns safe HTML string suitable for rendering in rich text views.
 */
export function sanitizeHtml(rawHtml: string): string {
  if (!rawHtml || typeof rawHtml !== 'string') return ''

  if (typeof DOMParser === 'undefined') {
    // Defense-in-depth fallback when DOMParser is not in environment:
    // 1. Remove dangerous script/style/iframe/object tags and their contents
    let cleaned = rawHtml.replace(/<(script|iframe|object|embed|form|style|noscript)[^>]*>[\s\S]*?<\/\1>/gi, '')
    // 2. Remove inline event handlers (onerror=, onclick=, etc.)
    cleaned = cleaned.replace(/\s+on[a-z]+(\s*=\s*("[^"]*"|'[^']*'|[^\s>]+))/gi, '')
    // 3. Remove javascript: or vbscript: or data: protocols
    cleaned = cleaned.replace(/href\s*=\s*(['"])\s*(javascript|vbscript|data):[\s\S]*?\1/gi, '')
    // 4. Strip out any tags not in allowed list
    cleaned = cleaned.replace(/<\/?([a-z0-9]+)(?:\s+[^>]*)?>/gi, (match, tag) => {
      const lower = tag.toLowerCase()
      if (ALLOWED_TAGS.has(lower)) {
        // Strip out any remaining dangerous attrs from allowed tag
        if (match.startsWith('</')) return `</${lower}>`
        const safeAttrs = match.replace(/\s+(on[a-z]+|href\s*=\s*['"](?:javascript|data):[^'"]*['"])[^>\s]*/gi, '')
        return safeAttrs
      }
      return ''
    })
    return cleaned
  }

  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(rawHtml, 'text/html')

    function cleanNode(node: Node): void {
      const children = Array.from(node.childNodes)
      for (const child of children) {
        if (child.nodeType === Node.ELEMENT_NODE) {
          const el = child as HTMLElement
          const tagName = el.tagName.toLowerCase()

          // 1. Remove dangerous elements entirely (including their contents)
          if (DANGEROUS_TAGS.has(tagName)) {
            el.remove()
            continue
          }

          // 2. Unwrap non-whitelisted elements (keep text, remove tag)
          if (!ALLOWED_TAGS.has(tagName)) {
            const textNode = doc.createTextNode(el.textContent || '')
            el.replaceWith(textNode)
            continue
          }

          // 3. Inspect attributes
          const attrs = Array.from(el.attributes)
          for (const attr of attrs) {
            const attrName = attr.name.toLowerCase()
            const attrVal = attr.value.trim()

            // Remove all event handlers (onclick, onerror, etc.)
            if (attrName.startsWith('on')) {
              el.removeAttribute(attr.name)
              continue
            }

            // Inspect href attributes
            if (attrName === 'href') {
              if (!isSafeUrl(attrVal)) {
                el.removeAttribute(attr.name)
              }
              continue
            }

            // Disallow unauthorized attributes
            if (!ALLOWED_ATTRS.has(attrName) && !attrName.startsWith('data-')) {
              el.removeAttribute(attr.name)
            }
          }

          cleanNode(child)
        }
      }
    }

    cleanNode(doc.body)
    return doc.body.innerHTML
  } catch (err) {
    console.warn('[Sanitizer] Parse error, falling back to plaintext:', err)
    return rawHtml.replace(/<[^>]*>/g, '')
  }
}


/**
 * Strips all HTML tags and returns only raw text content.
 */
export function stripHtml(html: string): string {
  if (!html) return ''
  if (typeof DOMParser === 'undefined') {
    return html.replace(/<[^>]*>/g, '')
  }
  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')
    return doc.body.textContent || ''
  } catch {
    return html.replace(/<[^>]*>/g, '')
  }
}

/**
 * Escapes characters for safe plaintext insertion into HTML contexts.
 */
export function escapeHtml(str: string): string {
  if (!str) return ''
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
