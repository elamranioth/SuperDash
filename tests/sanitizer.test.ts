import { describe, it, expect } from 'vitest'
import { sanitizeHtml, stripHtml } from '@/services/security/sanitizer'

describe('Security Sanitizer - XSS Prevention', () => {
  it('strips dangerous <script> tags and malicious inline handlers', () => {
    const dirty = '<p>Hello world <script>alert("XSS")</script><img src="x" onerror="alert(1)"> safe text</p>'
    const clean = sanitizeHtml(dirty)

    expect(clean).not.toContain('<script>')
    expect(clean).not.toContain('alert')
    expect(clean).not.toContain('onerror')
    expect(clean).toContain('Hello world')
    expect(clean).toContain('safe text')
  })

  it('neutralizes javascript: pseudoprotocol URLs in href attributes', () => {
    const dirty = '<a href="javascript:stealCookie()">Click here</a>'
    const clean = sanitizeHtml(dirty)

    expect(clean).not.toContain('javascript:')
    expect(clean).toContain('Click here')
  })

  it('allows safe formatting tags and cleans unauthorized tags', () => {
    const dirty = '<b>Bold</b> <i>Italic</i> <blockquote>Quote</blockquote> <iframe src="evil.com"></iframe>'
    const clean = sanitizeHtml(dirty)

    expect(clean).toContain('<b>Bold</b>')
    expect(clean).toContain('<i>Italic</i>')
    expect(clean).toContain('<blockquote>Quote</blockquote>')
    expect(clean).not.toContain('<iframe')
  })

  it('stripHtml converts HTML string to raw text', () => {
    const html = '<h1>Heading</h1><p>Paragraph with <a href="#">link</a></p>'
    const text = stripHtml(html)

    expect(text).toBe('HeadingParagraph with link')
  })
})
