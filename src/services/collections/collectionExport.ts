import { Collection, CollectionItem } from '@/types'
import { ResolvedCollectionItem } from './collectionsRepository'

export function exportCollectionToMarkdown(
  collection: Collection,
  items: ResolvedCollectionItem[]
): string {
  const lines: string[] = []

  lines.push(`# ${collection.name}`)
  if (collection.description) {
    lines.push(`\n> ${collection.description}\n`)
  }

  if (collection.note) {
    lines.push(`\n**Curator Note:** ${collection.note}\n`)
  }

  lines.push(`---\n`)
  lines.push(`*Exported from SuperDash Collections on ${new Date().toLocaleDateString('en-US', { dateStyle: 'long' })}*\n`)
  lines.push(`*Total Items:* ${items.length}\n`)

  const sections = collection.sections || []

  if (sections.length > 0) {
    sections
      .sort((a, b) => a.order - b.order)
      .forEach(sec => {
        const sectionItems = items.filter(i => i.sectionId === sec.id)
        if (sectionItems.length > 0) {
          lines.push(`\n## ${sec.title}\n`)
          sectionItems.forEach((item, idx) => {
            appendItemMarkdown(lines, item, idx + 1)
          })
        }
      })

    const unassignedItems = items.filter(
      i => !i.sectionId || !sections.some(s => s.id === i.sectionId)
    )
    if (unassignedItems.length > 0) {
      lines.push(`\n## General\n`)
      unassignedItems.forEach((item, idx) => {
        appendItemMarkdown(lines, item, idx + 1)
      })
    }
  } else {
    items.forEach((item, idx) => {
      appendItemMarkdown(lines, item, idx + 1)
    })
  }

  return lines.join('\n')
}

function appendItemMarkdown(lines: string[], item: ResolvedCollectionItem, index: number) {
  const displayTitle = item.liveTitle || item.title
  const typeTag = item.itemType.toUpperCase()

  lines.push(`### ${index}. [${typeTag}] ${displayTitle}`)

  if (item.url) {
    lines.push(`- **Link:** [${item.url}](${item.url})`)
  }

  if (item.liveDescription || item.description) {
    lines.push(`- **Summary:** ${item.liveDescription || item.description}`)
  }

  if (item.manualContent) {
    lines.push(`- **Content:**\n\n  > ${item.manualContent.replace(/\n/g, '\n  > ')}\n`)
  }

  if (item.sourceType) {
    lines.push(`- **Source:** SuperDash (${item.sourceType.replace('_', ' ')})`)
  }

  if (item.note) {
    lines.push(`- **Personal Note:** *${item.note}*`)
  }

  lines.push(
    `- **Added:** ${new Date(item.addedAt).toLocaleDateString('en-US', {
      dateStyle: 'medium'
    })}\n`
  )
}

export function downloadMarkdownFile(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', `${filename.replace(/[^a-z0-9_-]/gi, '_').toLowerCase()}.md`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
