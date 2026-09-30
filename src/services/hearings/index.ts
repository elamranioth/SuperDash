import { Hearing, HearingStatus, HearingReminder } from '@/types'
import { storageService } from '@/services/storage'
import { notificationService } from '@/services/notifications'
import { toLocalYYYYMMDD } from '@/utils/date'

const STORAGE_KEY = 'hearings'

// Helper for today's date formatted as YYYY-MM-DD in local time
export function getTodayDateString(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function isActionRequired(hearing: Hearing): boolean {
  if (hearing.status === 'Completed' || hearing.status === 'Cancelled') {
    return false
  }
  const today = getTodayDateString()
  const isPast = hearing.hearingDate < today
  const hasNoDecision = !hearing.decision || hearing.decision.trim() === ''
  return isPast && hasNoDecision
}

// Initial realistic seed hearings for a legal professional
export const INITIAL_HEARINGS: Hearing[] = [
  {
    id: 'hearing-1',
    clientId: 'client-1',
    clientName: 'Ahmed Ali',
    caseId: 'case-1',
    caseNumber: 'Commercial 123/2026',
    caseType: 'Commercial',
    court: 'Dubai Court of First Instance',
    hearingDate: getTodayDateString(),
    hearingTime: '10:00',
    decision: 'Adjourned to 15 Oct for claimant reply memorandum',
    nextHearingDate: '2026-10-15',
    status: 'Today',
    notes: 'Defense submitted counterclaim arguments. Need to prepare rejoinder before next hearing.',
    reminder: '1_day',
    createdAt: Date.now() - 86400000 * 20,
    updatedAt: Date.now() - 3600000 * 2
  },
  {
    id: 'hearing-1-hist1',
    clientId: 'client-1',
    clientName: 'Ahmed Ali',
    caseId: 'case-1',
    caseNumber: 'Commercial 123/2026',
    caseType: 'Commercial',
    court: 'Dubai Court of First Instance',
    hearingDate: '2026-09-05',
    hearingTime: '10:00',
    decision: 'First hearing. Both parties attended. Defendant requested time to submit statement of defense.',
    nextHearingDate: '2026-09-20',
    status: 'Completed',
    notes: 'Power of attorney submitted.',
    reminder: 'none',
    createdAt: Date.now() - 86400000 * 25,
    updatedAt: Date.now() - 86400000 * 24
  },
  {
    id: 'hearing-1-hist2',
    clientId: 'client-1',
    clientName: 'Ahmed Ali',
    caseId: 'case-1',
    caseNumber: 'Commercial 123/2026',
    caseType: 'Commercial',
    court: 'Dubai Court of First Instance',
    hearingDate: '2026-09-20',
    hearingTime: '10:00',
    decision: 'Memorandum submitted by defense. Case adjourned to 29 Sep.',
    nextHearingDate: getTodayDateString(),
    status: 'Completed',
    notes: 'Counsel received defense documents.',
    reminder: 'none',
    createdAt: Date.now() - 86400000 * 10,
    updatedAt: Date.now() - 86400000 * 9
  },
  {
    id: 'hearing-2',
    clientId: 'client-2',
    clientName: 'Sara Hassan',
    caseId: 'case-2',
    caseNumber: 'Labour 456/2026',
    caseType: 'Labour',
    court: 'Dubai Labour Court',
    hearingDate: toLocalYYYYMMDD(new Date(Date.now() + 86400000)),
    hearingTime: '11:30',
    decision: 'Expert appointed to audit end-of-service benefits and commission calculations',
    nextHearingDate: '2026-10-22',
    status: 'Upcoming',
    notes: 'Need to submit payroll receipts and bank statements to the court-appointed accounting expert.',
    reminder: '1_day',
    createdAt: Date.now() - 86400000 * 15,
    updatedAt: Date.now() - 3600000 * 5
  },
  {
    id: 'hearing-3',
    clientId: 'client-3',
    clientName: 'John Smith',
    caseId: 'case-3',
    caseNumber: 'Civil 789/2026',
    caseType: 'Civil',
    court: 'Dubai Court of Appeal',
    hearingDate: toLocalYYYYMMDD(new Date(Date.now() + 86400000 * 4)),
    hearingTime: '09:00',
    decision: 'Reserved for judgment on 20/10/2026',
    nextHearingDate: '2026-10-20',
    status: 'Reserved for Judgment',
    notes: 'Pleadings concluded. Both parties submitted concluding briefs.',
    reminder: '2_days',
    createdAt: Date.now() - 86400000 * 30,
    updatedAt: Date.now() - 86400000 * 2
  },
  {
    id: 'hearing-4',
    clientId: 'client-4',
    clientName: 'Fatima Al Mansoori',
    caseId: 'case-4',
    caseNumber: 'Real Estate 102/2026',
    caseType: 'Real Estate',
    court: 'Dubai Rental Dispute Centre',
    hearingDate: '2026-09-22', // Passed date without decision -> Action Required
    hearingTime: '10:30',
    decision: '',
    nextHearingDate: '',
    status: 'Upcoming',
    notes: 'Session took place before judicial committee. Awaiting written tribunal decree.',
    reminder: 'none',
    createdAt: Date.now() - 86400000 * 12,
    updatedAt: Date.now() - 86400000 * 7
  },
  {
    id: 'hearing-5',
    clientId: 'client-5',
    clientName: 'Apex Logistics LLC',
    caseId: 'case-5',
    caseNumber: 'Commercial 884/2026',
    caseType: 'Commercial',
    court: 'Abu Dhabi Commercial Court',
    hearingDate: toLocalYYYYMMDD(new Date(Date.now() + 86400000 * 8)),
    hearingTime: '12:00',
    decision: '',
    nextHearingDate: '',
    status: 'Upcoming',
    notes: 'First hearing session for contractual breach damages claim.',
    reminder: '3_days',
    createdAt: Date.now() - 86400000 * 4,
    updatedAt: Date.now()
  }
]

type HearingChangeSubscriber = (hearings: Hearing[]) => void

export interface IHearingRepository {
  getAll(): Promise<Hearing[]>
  getById(id: string): Promise<Hearing | null>
  create(data: Omit<Hearing, 'id' | 'createdAt' | 'updatedAt'>): Promise<Hearing>
  update(id: string, updates: Partial<Hearing>): Promise<Hearing | null>
  delete(id: string): Promise<boolean>
  getUpcoming(): Promise<Hearing[]>
  getToday(): Promise<Hearing[]>
  getByClient(clientName: string): Promise<Hearing[]>
  getByCase(caseNumber: string): Promise<Hearing[]>
  getCaseHistory(caseNumber: string): Promise<Hearing[]>
  createNextHearing(prevHearingId: string, nextHearingDate: string): Promise<Hearing | null>
  subscribe(callback: HearingChangeSubscriber): () => void
}

class LocalHearingRepository implements IHearingRepository {
  private subscribers: Set<HearingChangeSubscriber> = new Set()

  private notify(hearings: Hearing[]) {
    this.subscribers.forEach(cb => {
      try {
        cb([...hearings])
      } catch (err) {
        console.error('Subscriber callback error in HearingRepository:', err)
      }
    })
  }

  subscribe(callback: HearingChangeSubscriber): () => void {
    this.subscribers.add(callback)
    this.getAll().then(list => callback([...list]))
    return () => {
      this.subscribers.delete(callback)
    }
  }

  async getAll(): Promise<Hearing[]> {
    const list = await storageService.get<Hearing[]>(STORAGE_KEY, INITIAL_HEARINGS)
    const today = getTodayDateString()

    // Auto-update status to 'Today' if hearingDate is today and was marked upcoming
    let changed = false
    const normalized = list.map(h => {
      if (h.hearingDate === today && h.status === 'Upcoming') {
        changed = true
        return { ...h, status: 'Today' as HearingStatus }
      }
      return h
    })

    if (changed) {
      await storageService.set(STORAGE_KEY, normalized)
    }

    return normalized
  }

  async getById(id: string): Promise<Hearing | null> {
    const all = await this.getAll()
    return all.find(h => h.id === id) || null
  }

  async create(data: Omit<Hearing, 'id' | 'createdAt' | 'updatedAt'>): Promise<Hearing> {
    const all = await this.getAll()
    const now = Date.now()
    const today = getTodayDateString()

    let status = data.status
    if (data.hearingDate === today && status === 'Upcoming') {
      status = 'Today'
    }

    const newHearing: Hearing = {
      ...data,
      id: `hearing_${now}_${Math.random().toString(36).slice(2, 7)}`,
      status,
      createdAt: now,
      updatedAt: now
    }

    const updated = [newHearing, ...all]
    await storageService.set(STORAGE_KEY, updated)
    this.notify(updated)

    // Schedule internal notification if reminder was chosen or hearing is today/tomorrow
    this.handleNotificationTrigger(newHearing)

    return newHearing
  }

  async update(id: string, updates: Partial<Hearing>): Promise<Hearing | null> {
    const all = await this.getAll()
    const index = all.findIndex(h => h.id === id)
    if (index === -1) return null

    const existing = all[index]
    const updatedHearing: Hearing = {
      ...existing,
      ...updates,
      updatedAt: Date.now()
    }

    const updated = [...all]
    updated[index] = updatedHearing
    await storageService.set(STORAGE_KEY, updated)
    this.notify(updated)

    if (updates.reminder && updates.reminder !== 'none') {
      this.handleNotificationTrigger(updatedHearing)
    }

    return updatedHearing
  }

  async delete(id: string): Promise<boolean> {
    const all = await this.getAll()
    const filtered = all.filter(h => h.id !== id)
    if (filtered.length === all.length) return false

    await storageService.set(STORAGE_KEY, filtered)
    this.notify(filtered)
    return true
  }

  async getUpcoming(): Promise<Hearing[]> {
    const all = await this.getAll()
    const today = getTodayDateString()
    return all
      .filter(h => h.hearingDate >= today && h.status !== 'Completed' && h.status !== 'Cancelled')
      .sort((a, b) => a.hearingDate.localeCompare(b.hearingDate) || (a.hearingTime || '').localeCompare(b.hearingTime || ''))
  }

  async getToday(): Promise<Hearing[]> {
    const all = await this.getAll()
    const today = getTodayDateString()
    return all
      .filter(h => h.hearingDate === today && h.status !== 'Cancelled')
      .sort((a, b) => (a.hearingTime || '').localeCompare(b.hearingTime || ''))
  }

  async getByClient(clientName: string): Promise<Hearing[]> {
    const all = await this.getAll()
    const target = clientName.trim().toLowerCase()
    return all
      .filter(h => h.clientName.trim().toLowerCase() === target)
      .sort((a, b) => b.hearingDate.localeCompare(a.hearingDate))
  }

  async getByCase(caseNumber: string): Promise<Hearing[]> {
    const all = await this.getAll()
    const target = caseNumber.trim().toLowerCase()
    return all
      .filter(h => h.caseNumber.trim().toLowerCase() === target)
      .sort((a, b) => a.hearingDate.localeCompare(b.hearingDate))
  }

  async getCaseHistory(caseNumber: string): Promise<Hearing[]> {
    return this.getByCase(caseNumber)
  }

  async createNextHearing(prevHearingId: string, nextHearingDate: string): Promise<Hearing | null> {
    const prev = await this.getById(prevHearingId)
    if (!prev) return null

    const today = getTodayDateString()
    const newStatus: HearingStatus = nextHearingDate === today ? 'Today' : 'Upcoming'

    // Create next hearing carrying forward client, case, court, etc.
    const newHearing = await this.create({
      clientId: prev.clientId,
      clientName: prev.clientName,
      caseId: prev.caseId,
      caseNumber: prev.caseNumber,
      caseType: prev.caseType,
      court: prev.court,
      hearingDate: nextHearingDate,
      hearingTime: prev.hearingTime || '10:00',
      decision: '', // Fresh decision for next hearing
      nextHearingDate: '',
      status: newStatus,
      notes: `Continued from hearing on ${prev.hearingDate}. Previous result: ${prev.decision || 'Adjourned'}`,
      reminder: prev.reminder || '1_day'
    })

    // Optionally mark previous hearing as completed or adjourned
    if (prev.status === 'Upcoming' || prev.status === 'Today') {
      await this.update(prevHearingId, {
        status: 'Adjourned'
      })
    }

    return newHearing
  }

  private handleNotificationTrigger(hearing: Hearing) {
    try {
      const today = getTodayDateString()
      const isToday = hearing.hearingDate === today
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const isTomorrow = hearing.hearingDate === toLocalYYYYMMDD(tomorrow)

      if (isToday) {
        notificationService.add({
          title: `COURT HEARING TODAY: ${hearing.clientName}`,
          message: `${hearing.caseNumber} • ${hearing.court || 'Court'}${hearing.hearingTime ? ` at ${hearing.hearingTime}` : ''}`,
          type: 'info',
          actionLabel: 'Open Hearings',
          actionAppId: 'hearings'
        })
      } else if (isTomorrow) {
        notificationService.add({
          title: `HEARING TOMORROW: ${hearing.clientName}`,
          message: `${hearing.caseNumber} • ${hearing.court || 'Court'}${hearing.hearingTime ? ` at ${hearing.hearingTime}` : ''}`,
          type: 'info',
          actionLabel: 'Open Hearings',
          actionAppId: 'hearings'
        })
      }
    } catch (e) {
      console.warn('Failed to send hearing notification:', e)
    }
  }
}

export const hearingRepository: IHearingRepository = new LocalHearingRepository()

// CSV Export Utility
export function exportHearingsToCSV(hearings: Hearing[]): void {
  const headers = [
    'Client Name',
    'Case Number',
    'Case Type',
    'Court',
    'Hearing Date',
    'Hearing Time',
    'Decision / Result',
    'Next Hearing Date',
    'Status',
    'Notes'
  ]

  const escapeCSV = (val: string | undefined | null) => {
    if (val === undefined || val === null) return '""'
    const str = String(val).replace(/"/g, '""')
    return `"${str}"`
  }

  const rows = hearings.map(h => [
    escapeCSV(h.clientName),
    escapeCSV(h.caseNumber),
    escapeCSV(h.caseType),
    escapeCSV(h.court),
    escapeCSV(h.hearingDate),
    escapeCSV(h.hearingTime),
    escapeCSV(h.decision),
    escapeCSV(h.nextHearingDate),
    escapeCSV(h.status),
    escapeCSV(h.notes)
  ])

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n')
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `Hearings_Export_${getTodayDateString()}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
