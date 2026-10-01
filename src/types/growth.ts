// Lead pipeline stages
export type LeadStage = 'new' | 'contacted' | 'discussing' | 'proposal' | 'won' | 'lost'

// Lead sources
export type LeadSource = 'referral' | 'google' | 'website' | 'whatsapp' | 'instagram' | 'linkedin' | 'existing_client' | 'walkin' | 'networking' | 'other'

// Interaction types
export type InteractionType = 'whatsapp' | 'call' | 'email' | 'meeting' | 'note'

// Feedback outcomes
export type ClientFeedback = 'happy' | 'issue_raised' | 'needs_followup'

// Referral request status
export type ReferralStatus = 'not_asked' | 'asked' | 'referred'

// Campaign status
export type CampaignStatus = 'draft' | 'active' | 'paused' | 'completed'

// Experiment status
export type ExperimentStatus = 'running' | 'completed' | 'stopped'

export interface Lead {
  id: string
  name: string
  company?: string
  phone?: string
  email?: string
  source: LeadSource
  customSource?: string
  serviceInterest?: string
  stage: LeadStage
  estimatedValue?: number
  lastContactAt?: number // timestamp
  nextFollowUpAt?: number // timestamp
  notes?: string
  clientId?: string // set when converted to client
  lostReason?: string
  createdAt: number
  updatedAt: number
}

export interface LeadInteraction {
  id: string
  leadId: string
  type: InteractionType
  date: string // YYYY-MM-DD
  note: string
  createdAt: number
}

// Growth-specific relationship metadata attached to Finance clients
export interface ClientRelationship {
  id: string // same as clientId
  clientId: string
  lastServiceDescription?: string
  lastServiceDate?: string // YYYY-MM-DD
  lastContactDate?: string // YYYY-MM-DD
  nextRenewalDate?: string // YYYY-MM-DD
  renewalDescription?: string
  feedback?: ClientFeedback
  feedbackNote?: string
  referralStatus: ReferralStatus
  referredByClientId?: string // who referred this client
  referredClientIds: string[] // clients this person has referred
  notes?: string // relationship notes (preferences, etc)
  interactions: ClientInteraction[]
  playbook?: string // applied playbook id
  serviceHistory: ServiceHistoryItem[]
  createdAt: number
  updatedAt: number
}

export interface ClientInteraction {
  id: string
  clientId: string
  type: InteractionType
  date: string // YYYY-MM-DD
  note: string
  createdAt: number
}

export interface ServiceHistoryItem {
  id: string
  clientId: string
  description: string
  date: string // YYYY-MM-DD
  notes?: string
  createdAt: number
}

export interface Campaign {
  id: string
  name: string
  goal: string
  audience?: string
  channels: string[]
  startDate?: string
  endDate?: string
  status: CampaignStatus
  notes?: string
  results?: string
  createdAt: number
  updatedAt: number
}

export interface MarketingExperiment {
  id: string
  title: string
  hypothesis: string
  action: string
  durationDays: number
  startDate: string
  status: ExperimentStatus
  outcome?: string
  leadsGenerated?: number
  notes?: string
  continueAfter?: boolean
  createdAt: number
  updatedAt: number
}

export interface GrowthSettings {
  defaultFollowUpDays: number
  serviceTypes: string[]
  customLeadSources: string[]
  notificationsEnabled: boolean
}
