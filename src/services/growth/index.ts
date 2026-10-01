import type {
  Lead,
  LeadInteraction,
  ClientRelationship,
  ClientInteraction,
  ServiceHistoryItem,
  Campaign,
  MarketingExperiment,
  GrowthSettings,
  LeadSource,
} from '@/types/growth'
import type { Client } from '@/types'
import { storageService } from '@/services/storage'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const DEFAULT_SERVICE_TYPES: string[] = [
  'Accounting',
  'Tax Filing',
  'Bookkeeping',
  'Payroll',
  'Financial Advisory',
  'Audit',
  'VAT / GST Filing',
  'Business Registration',
  'Consulting',
]

export const DEFAULT_GROWTH_SETTINGS: GrowthSettings = {
  defaultFollowUpDays: 3,
  serviceTypes: DEFAULT_SERVICE_TYPES,
  customLeadSources: [],
  notificationsEnabled: true,
}

// ---------------------------------------------------------------------------
// Storage keys
// ---------------------------------------------------------------------------

const KEYS = {
  leads: 'growth_leads',
  leadInteractions: 'growth_lead_interactions',
  clientRelationships: 'growth_client_relationships',
  campaigns: 'growth_campaigns',
  experiments: 'growth_experiments',
  settings: 'growth_settings',
  financeClients: 'finance_clients',
} as const

// ---------------------------------------------------------------------------
// ID generation
// ---------------------------------------------------------------------------

function generateId(): string {
  return 'growth_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
}

// ---------------------------------------------------------------------------
// Insight types (exported)
// ---------------------------------------------------------------------------

export interface TodayAction {
  type: 'followup' | 'reconnect' | 'referral' | 'care'
  label: string
  subtitle: string
  relatedId: string // leadId or clientId
  relatedType: 'lead' | 'client'
}

export interface SourceBreakdown {
  source: string
  count: number
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Parse a YYYY-MM-DD string to a UTC midnight timestamp (ms). */
function parseDateStr(dateStr: string): number {
  return new Date(dateStr + 'T00:00:00Z').getTime()
}

/** Return today's UTC midnight timestamp. */
function todayUTC(): number {
  const d = new Date()
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
}

// ---------------------------------------------------------------------------
// Leads
// ---------------------------------------------------------------------------

async function getLeads(): Promise<Lead[]> {
  return storageService.get<Lead[]>(KEYS.leads, [])
}

async function saveLead(lead: Lead): Promise<void> {
  const leads = await getLeads()
  const idx = leads.findIndex((l) => l.id === lead.id)
  if (idx >= 0) {
    leads[idx] = lead
  } else {
    leads.push(lead)
  }
  storageService.set(KEYS.leads, leads)
}

async function deleteLead(id: string): Promise<void> {
  const leads = await getLeads()
  storageService.set(
    KEYS.leads,
    leads.filter((l) => l.id !== id)
  )
  // Also clean up interactions for this lead
  const interactions = await _getAllLeadInteractions()
  storageService.set(
    KEYS.leadInteractions,
    interactions.filter((i) => i.leadId !== id)
  )
}

async function _getAllLeadInteractions(): Promise<LeadInteraction[]> {
  return storageService.get<LeadInteraction[]>(KEYS.leadInteractions, [])
}

async function getLeadInteractions(leadId: string): Promise<LeadInteraction[]> {
  const all = await _getAllLeadInteractions()
  return all.filter((i) => i.leadId === leadId)
}

async function addLeadInteraction(interaction: LeadInteraction): Promise<void> {
  const all = await _getAllLeadInteractions()
  all.push(interaction)
  storageService.set(KEYS.leadInteractions, all)
}

async function convertLeadToClient(leadId: string, clientId: string): Promise<void> {
  const leads = await getLeads()
  const idx = leads.findIndex((l) => l.id === leadId)
  if (idx < 0) return
  leads[idx] = {
    ...leads[idx],
    stage: 'won',
    clientId,
    updatedAt: Date.now(),
  }
  storageService.set(KEYS.leads, leads)
}

// ---------------------------------------------------------------------------
// Client Relationships
// ---------------------------------------------------------------------------

async function getClientRelationships(): Promise<ClientRelationship[]> {
  return storageService.get<ClientRelationship[]>(KEYS.clientRelationships, [])
}

async function getClientRelationship(clientId: string): Promise<ClientRelationship | null> {
  const all = await getClientRelationships()
  return all.find((r) => r.clientId === clientId) ?? null
}

async function saveClientRelationship(rel: ClientRelationship): Promise<void> {
  const all = await getClientRelationships()
  const idx = all.findIndex((r) => r.clientId === rel.clientId)
  if (idx >= 0) {
    all[idx] = rel
  } else {
    all.push(rel)
  }
  storageService.set(KEYS.clientRelationships, all)
}

async function addClientInteraction(interaction: ClientInteraction): Promise<void> {
  const all = await getClientRelationships()
  const idx = all.findIndex((r) => r.clientId === interaction.clientId)
  if (idx < 0) return
  const rel = all[idx]
  all[idx] = {
    ...rel,
    interactions: [...rel.interactions, interaction],
    lastContactDate: interaction.date,
    updatedAt: Date.now(),
  }
  storageService.set(KEYS.clientRelationships, all)
}

async function addServiceHistory(item: ServiceHistoryItem): Promise<void> {
  const all = await getClientRelationships()
  const idx = all.findIndex((r) => r.clientId === item.clientId)
  if (idx < 0) return
  const rel = all[idx]
  all[idx] = {
    ...rel,
    serviceHistory: [...rel.serviceHistory, item],
    lastServiceDescription: item.description,
    lastServiceDate: item.date,
    updatedAt: Date.now(),
  }
  storageService.set(KEYS.clientRelationships, all)
}

// ---------------------------------------------------------------------------
// Finance Clients (read-only bridge)
// ---------------------------------------------------------------------------

async function getFinanceClients(): Promise<Client[]> {
  return storageService.get<Client[]>(KEYS.financeClients, [])
}

// ---------------------------------------------------------------------------
// Campaigns
// ---------------------------------------------------------------------------

async function getCampaigns(): Promise<Campaign[]> {
  return storageService.get<Campaign[]>(KEYS.campaigns, [])
}

async function saveCampaign(campaign: Campaign): Promise<void> {
  const all = await getCampaigns()
  const idx = all.findIndex((c) => c.id === campaign.id)
  if (idx >= 0) {
    all[idx] = campaign
  } else {
    all.push(campaign)
  }
  storageService.set(KEYS.campaigns, all)
}

async function deleteCampaign(id: string): Promise<void> {
  const all = await getCampaigns()
  storageService.set(
    KEYS.campaigns,
    all.filter((c) => c.id !== id)
  )
}

// ---------------------------------------------------------------------------
// Experiments
// ---------------------------------------------------------------------------

async function getExperiments(): Promise<MarketingExperiment[]> {
  return storageService.get<MarketingExperiment[]>(KEYS.experiments, [])
}

async function saveExperiment(exp: MarketingExperiment): Promise<void> {
  const all = await getExperiments()
  const idx = all.findIndex((e) => e.id === exp.id)
  if (idx >= 0) {
    all[idx] = exp
  } else {
    all.push(exp)
  }
  storageService.set(KEYS.experiments, all)
}

async function deleteExperiment(id: string): Promise<void> {
  const all = await getExperiments()
  storageService.set(
    KEYS.experiments,
    all.filter((e) => e.id !== id)
  )
}

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

async function getGrowthSettings(): Promise<GrowthSettings> {
  return storageService.get<GrowthSettings>(KEYS.settings, DEFAULT_GROWTH_SETTINGS)
}

async function saveGrowthSettings(settings: GrowthSettings): Promise<void> {
  storageService.set(KEYS.settings, settings)
}

// ---------------------------------------------------------------------------
// Insights
// ---------------------------------------------------------------------------

async function getTodayActions(): Promise<TodayAction[]> {
  const now = Date.now()
  const today = todayUTC()
  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000
  const ninetyDaysMs = 90 * 24 * 60 * 60 * 1000

  const actions: TodayAction[] = []

  // --- Leads: overdue follow-ups ---
  const leads = await getLeads()
  const clients = await getFinanceClients()

  const clientMap = new Map<string, Client>(clients.map((c) => [c.id, c]))

  for (const lead of leads) {
    if (actions.length >= 5) break
    if (
      lead.stage !== 'won' &&
      lead.stage !== 'lost' &&
      lead.nextFollowUpAt !== undefined &&
      lead.nextFollowUpAt <= now
    ) {
      actions.push({
        type: 'followup',
        label: `Follow up with ${lead.name}`,
        subtitle: lead.company
          ? `${lead.company} — ${lead.stage}`
          : `Stage: ${lead.stage}`,
        relatedId: lead.id,
        relatedType: 'lead',
      })
    }
  }

  // --- Client relationships ---
  const relationships = await getClientRelationships()

  for (const rel of relationships) {
    if (actions.length >= 5) break

    const client = clientMap.get(rel.clientId)
    const clientName = client?.name ?? rel.clientId

    // Reconnect: last contact > 90 days ago AND renewal within 30 days
    if (rel.lastContactDate && rel.nextRenewalDate) {
      const lastContact = parseDateStr(rel.lastContactDate)
      const nextRenewal = parseDateStr(rel.nextRenewalDate)
      const daysSinceContact = today - lastContact
      const daysToRenewal = nextRenewal - today

      if (daysSinceContact > ninetyDaysMs && daysToRenewal >= 0 && daysToRenewal <= thirtyDaysMs) {
        actions.push({
          type: 'reconnect',
          label: `Reconnect with ${clientName}`,
          subtitle: rel.renewalDescription
            ? `Renewal soon: ${rel.renewalDescription}`
            : 'Renewal approaching in 30 days',
          relatedId: rel.clientId,
          relatedType: 'client',
        })
        continue
      }
    }

    // Referral: happy client, referral not yet asked
    if (rel.feedback === 'happy' && rel.referralStatus === 'not_asked') {
      actions.push({
        type: 'referral',
        label: `Ask ${clientName} for a referral`,
        subtitle: 'Happy client — great time to ask',
        relatedId: rel.clientId,
        relatedType: 'client',
      })
    }
  }

  return actions.slice(0, 5)
}

async function getSourceBreakdown(): Promise<SourceBreakdown[]> {
  const leads = await getLeads()
  const wonLeads = leads.filter((l) => l.stage === 'won')

  const counts = new Map<string, number>()

  for (const lead of wonLeads) {
    const sourceLabel =
      lead.source === 'other' && lead.customSource
        ? lead.customSource
        : formatSourceLabel(lead.source)
    counts.set(sourceLabel, (counts.get(sourceLabel) ?? 0) + 1)
  }

  return Array.from(counts.entries())
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count)
}

function formatSourceLabel(source: LeadSource): string {
  const labels: Record<LeadSource, string> = {
    referral: 'Referral',
    google: 'Google',
    website: 'Website',
    whatsapp: 'WhatsApp',
    instagram: 'Instagram',
    linkedin: 'LinkedIn',
    existing_client: 'Existing Client',
    walkin: 'Walk-in',
    networking: 'Networking',
    other: 'Other',
  }
  return labels[source] ?? source
}

// ---------------------------------------------------------------------------
// Exported service object + named exports
// ---------------------------------------------------------------------------

export const growthService = {
  // Leads
  getLeads,
  saveLead,
  deleteLead,
  getLeadInteractions,
  addLeadInteraction,
  convertLeadToClient,

  // Client relationships
  getClientRelationships,
  getClientRelationship,
  saveClientRelationship,
  addClientInteraction,
  addServiceHistory,

  // Finance clients (read-only)
  getFinanceClients,

  // Campaigns
  getCampaigns,
  saveCampaign,
  deleteCampaign,

  // Experiments
  getExperiments,
  saveExperiment,
  deleteExperiment,

  // Settings
  getGrowthSettings,
  saveGrowthSettings,

  // Insights
  getTodayActions,
  getSourceBreakdown,

  // Utilities
  generateId,
}

// Named exports
export {
  getLeads,
  saveLead,
  deleteLead,
  getLeadInteractions,
  addLeadInteraction,
  convertLeadToClient,
  getClientRelationships,
  getClientRelationship,
  saveClientRelationship,
  addClientInteraction,
  addServiceHistory,
  getFinanceClients,
  getCampaigns,
  saveCampaign,
  deleteCampaign,
  getExperiments,
  saveExperiment,
  deleteExperiment,
  getGrowthSettings,
  saveGrowthSettings,
  getTodayActions,
  getSourceBreakdown,
  generateId,
}
