/**
 * Unified Date and Time formatting utility for SuperDash OS
 */

export function parseDate(input: string | number | Date): Date {
  if (input instanceof Date) return input
  if (typeof input === 'number') return new Date(input)
  if (typeof input === 'string') {
    // If YYYY-MM-DD or ISO string
    if (input.includes('T')) return new Date(input)
    const [y, m, d] = input.split(/[-/]/).map(Number)
    if (y && m && d) {
      return new Date(y, m - 1, d)
    }
    return new Date(input)
  }
  return new Date()
}

/**
 * Format date in standard legal/financial format: e.g. "15 Oct 2026"
 */
export function formatExactDate(
  input: string | number | Date,
  options?: { includeWeekday?: boolean; monthStyle?: 'short' | 'long' }
): string {
  try {
    const d = parseDate(input)
    if (isNaN(d.getTime())) return String(input)
    
    const day = d.getDate()
    const month = d.toLocaleString('en-US', { month: options?.monthStyle || 'short' })
    const year = d.getFullYear()
    
    if (options?.includeWeekday) {
      const weekday = d.toLocaleString('en-US', { weekday: 'short' })
      return `${weekday}, ${day} ${month} ${year}`
    }
    return `${day} ${month} ${year}`
  } catch {
    return String(input)
  }
}

/**
 * Relative date description: "Today", "Tomorrow", "Yesterday", "In 3 days", "4 days ago"
 */
export function formatRelativeDate(input: string | number | Date): string {
  try {
    const d = parseDate(input)
    if (isNaN(d.getTime())) return String(input)

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const target = new Date(d.getFullYear(), d.getMonth(), d.getDate())
    
    const diffDays = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Tomorrow'
    if (diffDays === -1) return 'Yesterday'
    if (diffDays > 1 && diffDays <= 7) return `In ${diffDays} days`
    if (diffDays < -1 && diffDays >= -7) return `${Math.abs(diffDays)} days ago`
    if (diffDays > 7 && diffDays <= 30) {
      const weeks = Math.round(diffDays / 7)
      return `In ${weeks} ${weeks === 1 ? 'week' : 'weeks'}`
    }
    if (diffDays > 30) {
      const months = Math.round(diffDays / 30)
      return `In ${months} ${months === 1 ? 'month' : 'months'}`
    }
    return formatExactDate(d)
  } catch {
    return String(input)
  }
}

/**
 * Smart hybrid format: "Today • 29 Sep 2026" or "In 3 days • 02 Oct 2026"
 */
export function formatSmartDate(
  input: string | number | Date,
  options?: { showRelativePrefix?: boolean }
): string {
  const d = parseDate(input)
  if (isNaN(d.getTime())) return String(input)

  const rel = formatRelativeDate(d)
  const exact = formatExactDate(d)

  if (options?.showRelativePrefix === false) {
    return exact
  }

  if (rel === 'Today' || rel === 'Tomorrow' || rel === 'Yesterday') {
    return `${rel} • ${exact}`
  }
  if (rel.startsWith('In ') || rel.endsWith(' ago')) {
    return `${rel} • ${exact}`
  }
  return exact
}

/**
 * Format a Date object into local YYYY-MM-DD string, avoiding UTC date shifts.
 */
export function toLocalYYYYMMDD(d: Date = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

