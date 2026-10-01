import React, { useState, useEffect } from 'react'
import {
  TrendingUp,
  Users,
  Target,
  BookOpen,
  Plus,
  ChevronRight,
  Phone,
  MessageCircle,
  Clock,
  Star,
  ArrowRight,
  Sparkles,
  RotateCcw,
  GitBranch,
  X,
  Check,
  AlertCircle,
  Calendar,
  Zap
} from 'lucide-react'
import GlassPanel from '@/components/LiquidGlass/GlassPanel'
import GlassButton from '@/components/LiquidGlass/GlassButton'
import GlassModal from '@/components/LiquidGlass/GlassModal'
import EmptyState from '@/components/LiquidGlass/EmptyState'
import AppHeader from '@/components/AppWindow/AppHeader'
import { growthService, TodayAction } from '@/services/growth'
import { Lead, LeadStage, LeadSource, ClientRelationship } from '@/types/growth'
import { Client } from '@/types'
import { PLAYBOOK_LESSONS } from './playbook'
import { MESSAGE_TEMPLATES, MessageTemplateType } from './messageTemplates'

type ActiveView = 'today' | 'leads' | 'clients' | 'playbook'

// ─── Utility ─────────────────────────────────────────────────────────────────

function gid() {
  return 'growth_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
}

function formatRelativeDate(timestamp?: number): string {
  if (!timestamp) return 'Never'
  const diff = Date.now() - timestamp
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  if (days < 30) return `${Math.floor(days / 7)}w ago`
  return `${Math.floor(days / 30)}mo ago`
}

function formatDateStr(dateStr?: string): string {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

const STAGE_LABELS: Record<LeadStage, string> = {
  new: 'New',
  contacted: 'Contacted',
  discussing: 'Discussing',
  proposal: 'Proposal',
  won: 'Won',
  lost: 'Lost'
}

const STAGE_COLORS: Record<LeadStage, string> = {
  new: 'text-slate-400 bg-slate-500/20',
  contacted: 'text-blue-400 bg-blue-500/20',
  discussing: 'text-amber-400 bg-amber-500/20',
  proposal: 'text-violet-400 bg-violet-500/20',
  won: 'text-emerald-400 bg-emerald-500/20',
  lost: 'text-red-400 bg-red-500/20'
}

const SOURCE_LABELS: Record<LeadSource, string> = {
  referral: 'Referral',
  google: 'Google',
  website: 'Website',
  whatsapp: 'WhatsApp',
  instagram: 'Instagram',
  linkedin: 'LinkedIn',
  existing_client: 'Existing Client',
  walkin: 'Walk-in',
  networking: 'Networking',
  other: 'Other'
}

// ─── Today View ───────────────────────────────────────────────────────────────

function TodayView({ onNavigate }: { onNavigate: (view: ActiveView) => void }) {
  const [actions, setActions] = useState<TodayAction[]>([])
  const [loading, setLoading] = useState(true)
  const [leads, setLeads] = useState<Lead[]>([])
  const [financeClients, setFinanceClients] = useState<Client[]>([])
  const [stats, setStats] = useState({ leads: 0, followups: 0, won: 0 })

  useEffect(() => {
    Promise.all([
      growthService.getTodayActions(),
      growthService.getLeads(),
      growthService.getFinanceClients()
    ]).then(([acts, ls, fc]) => {
      setActions(acts)
      setLeads(ls)
      setFinanceClients(fc)
      const followups = ls.filter(l =>
        l.nextFollowUpAt && l.nextFollowUpAt <= Date.now() && l.stage !== 'won' && l.stage !== 'lost'
      ).length
      setStats({ leads: ls.filter(l => l.stage !== 'won' && l.stage !== 'lost').length, followups, won: ls.filter(l => l.stage === 'won').length })
      setLoading(false)
    })
  }, [])

  const today = new Date()
  const dayName = today.toLocaleDateString('en-GB', { weekday: 'long' })
  const dateStr = today.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

  const actionIcon = (type: TodayAction['type']) => {
    switch (type) {
      case 'followup': return <Clock className="w-4 h-4 text-amber-400" />
      case 'reconnect': return <RotateCcw className="w-4 h-4 text-blue-400" />
      case 'referral': return <Star className="w-4 h-4 text-violet-400" />
      case 'care': return <Check className="w-4 h-4 text-emerald-400" />
    }
  }

  const actionColor = (type: TodayAction['type']) => {
    switch (type) {
      case 'followup': return 'border-amber-500/30 bg-amber-500/5'
      case 'reconnect': return 'border-blue-500/30 bg-blue-500/5'
      case 'referral': return 'border-violet-500/30 bg-violet-500/5'
      case 'care': return 'border-emerald-500/30 bg-emerald-500/5'
    }
  }

  const actionLabel = (type: TodayAction['type']) => {
    switch (type) {
      case 'followup': return 'FOLLOW UP'
      case 'reconnect': return 'RECONNECT'
      case 'referral': return 'REFERRAL OPPORTUNITY'
      case 'care': return 'CLIENT CARE'
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-teal-400/50 border-t-teal-400 rounded-full animate-spin" />
      </div>
    )
  }

  // First run empty state
  if (leads.length === 0 && financeClients.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <div>
          <p className="text-white/50 text-sm">{dayName}</p>
          <p className="text-white/30 text-xs">{dateStr}</p>
        </div>

        <div className="text-center py-12 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center mx-auto">
            <TrendingUp className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-white font-semibold text-lg">Start with one person</h2>
            <p className="text-white/50 text-sm mt-1 max-w-xs mx-auto">
              Add a potential client to begin your growth journey.
            </p>
          </div>
          <div className="flex flex-col gap-3 items-center">
            <button
              onClick={() => onNavigate('leads')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-500/20 border border-teal-500/30 text-teal-300 text-sm font-medium hover:bg-teal-500/30 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Lead
            </button>
            <button
              onClick={() => onNavigate('playbook')}
              className="text-white/40 text-sm hover:text-white/60 transition-colors"
            >
              Learn how Growth works →
            </button>
          </div>
        </div>

        {/* Philosophy */}
        <GlassPanel className="p-4 space-y-2">
          <p className="text-white/70 text-xs font-medium tracking-widest uppercase">The Growth Loop</p>
          <div className="space-y-1.5 text-sm text-white/50">
            {['Be useful', 'Build trust', 'Do good work', 'Stay remembered', 'Make returning easy', 'Earn the referral'].map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-teal-400/60" />
                <span>{s}</span>
              </div>
            ))}
          </div>
        </GlassPanel>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-white/50 text-sm">{dayName}</p>
          <p className="text-white/30 text-xs">{dateStr}</p>
        </div>
        <div className="flex gap-3 text-center">
          <div>
            <p className="text-white font-bold text-lg leading-none">{stats.leads}</p>
            <p className="text-white/40 text-[10px] mt-0.5">LEADS</p>
          </div>
          <div className="w-px bg-white/10" />
          <div>
            <p className="text-amber-400 font-bold text-lg leading-none">{stats.followups}</p>
            <p className="text-white/40 text-[10px] mt-0.5">DUE</p>
          </div>
          <div className="w-px bg-white/10" />
          <div>
            <p className="text-emerald-400 font-bold text-lg leading-none">{stats.won}</p>
            <p className="text-white/40 text-[10px] mt-0.5">WON</p>
          </div>
        </div>
      </div>

      {/* Today section header */}
      <div>
        <h2 className="text-white font-semibold text-sm tracking-wider uppercase">Today</h2>
        {actions.length > 0 && (
          <p className="text-white/40 text-xs mt-0.5">{actions.length} action{actions.length > 1 ? 's' : ''} worth your attention</p>
        )}
      </div>

      {/* Action cards */}
      {actions.length === 0 ? (
        <GlassPanel className="p-4 text-center">
          <p className="text-white/60 text-sm">You're all caught up for today.</p>
          <p className="text-white/30 text-xs mt-1">Add leads or check your pipeline.</p>
        </GlassPanel>
      ) : (
        <div className="space-y-3">
          {actions.map(action => (
            <div
              key={action.relatedId + action.type}
              className={`rounded-xl border p-4 space-y-2 ${actionColor(action.type)}`}
            >
              <div className="flex items-center gap-2">
                {actionIcon(action.type)}
                <span className="text-[10px] font-bold tracking-widest text-white/50 uppercase">
                  {actionLabel(action.type)}
                </span>
              </div>
              <p className="text-white font-medium text-sm">{action.label}</p>
              <p className="text-white/50 text-xs">{action.subtitle}</p>
              <button
                onClick={() => onNavigate(action.relatedType === 'lead' ? 'leads' : 'clients')}
                className="text-teal-400 text-xs font-medium flex items-center gap-1 hover:text-teal-300 transition-colors mt-1"
              >
                {action.type === 'followup' ? 'View Lead' : action.type === 'reconnect' ? 'View Relationship' : action.type === 'referral' ? 'Request Referral' : 'View Client'}
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Growth Idea */}
      <div className="rounded-xl border border-teal-500/20 bg-teal-500/5 p-4 space-y-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-teal-400" />
          <span className="text-[10px] font-bold tracking-widest text-white/50 uppercase">Growth Idea</span>
        </div>
        <p className="text-white/70 text-sm">
          Answer one question a client frequently asks you — and share it where they can find it.
        </p>
        <button
          onClick={() => onNavigate('playbook')}
          className="text-teal-400 text-xs font-medium flex items-center gap-1 hover:text-teal-300 transition-colors"
        >
          Open Playbook
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  )
}

// ─── Add Lead Modal ────────────────────────────────────────────────────────────

const LEAD_SOURCES: { value: LeadSource; label: string }[] = [
  { value: 'referral', label: 'Referral' },
  { value: 'google', label: 'Google' },
  { value: 'website', label: 'Website' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'existing_client', label: 'Existing Client' },
  { value: 'walkin', label: 'Walk-in' },
  { value: 'networking', label: 'Networking' },
  { value: 'other', label: 'Other' },
]

function AddLeadModal({ onClose, onSave }: { onClose: () => void; onSave: (lead: Lead) => void }) {
  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [phone, setPhone] = useState('')
  const [serviceInterest, setServiceInterest] = useState('')
  const [source, setSource] = useState<LeadSource>('referral')

  const handleSave = () => {
    if (!name.trim()) return
    const now = Date.now()
    onSave({
      id: gid(),
      name: name.trim(),
      company: company.trim() || undefined,
      phone: phone.trim() || undefined,
      serviceInterest: serviceInterest.trim() || undefined,
      source,
      stage: 'new',
      createdAt: now,
      updatedAt: now
    })
  }

  return (
    <GlassModal isOpen={true} onClose={onClose} title="Add Lead">
      <div className="space-y-4 p-1">
        <div>
          <label className="text-white/60 text-xs uppercase tracking-wider block mb-1.5">Name *</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Ahmed Hassan"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm placeholder-white/30 focus:outline-none focus:border-teal-500/50"
            autoFocus
          />
        </div>
        <div>
          <label className="text-white/60 text-xs uppercase tracking-wider block mb-1.5">Company</label>
          <input
            value={company}
            onChange={e => setCompany(e.target.value)}
            placeholder="ABC Trading LLC"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm placeholder-white/30 focus:outline-none focus:border-teal-500/50"
          />
        </div>
        <div>
          <label className="text-white/60 text-xs uppercase tracking-wider block mb-1.5">Phone</label>
          <input
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="+971 50 000 0000"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm placeholder-white/30 focus:outline-none focus:border-teal-500/50"
          />
        </div>
        <div>
          <label className="text-white/60 text-xs uppercase tracking-wider block mb-1.5">Interested In</label>
          <input
            value={serviceInterest}
            onChange={e => setServiceInterest(e.target.value)}
            placeholder="Company Formation, Visa, Attestation…"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm placeholder-white/30 focus:outline-none focus:border-teal-500/50"
          />
        </div>
        <div>
          <label className="text-white/60 text-xs uppercase tracking-wider block mb-1.5">Source</label>
          <select
            value={source}
            onChange={e => setSource(e.target.value as LeadSource)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-teal-500/50 appearance-none"
          >
            {LEAD_SOURCES.map(s => (
              <option key={s.value} value={s.value} className="bg-slate-800">{s.label}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-3 pt-2">
          <GlassButton onClick={onClose} className="flex-1">Cancel</GlassButton>
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="flex-1 py-2.5 rounded-xl bg-teal-500/30 border border-teal-500/40 text-teal-300 text-sm font-medium disabled:opacity-40 hover:bg-teal-500/40 transition-colors"
          >
            Save Lead
          </button>
        </div>
      </div>
    </GlassModal>
  )
}

// ─── Lead Detail Modal ─────────────────────────────────────────────────────────

function LeadDetailModal({ lead, onClose, onChange }: { lead: Lead; onClose: () => void; onChange: () => void }) {
  const [currentLead, setCurrentLead] = useState<Lead>(lead)
  const [showMessageHelper, setShowMessageHelper] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplateType>('first_followup')
  const [generatedMessage, setGeneratedMessage] = useState('')
  const [note, setNote] = useState('')
  const [copied, setCopied] = useState(false)
  const [showFollowUpPicker, setShowFollowUpPicker] = useState(false)
  const [showLostReason, setShowLostReason] = useState(false)
  const [lostReason, setLostReason] = useState('')

  const stages: LeadStage[] = ['new', 'contacted', 'discussing', 'proposal', 'won', 'lost']

  const handleStageChange = async (stage: LeadStage) => {
    if (stage === 'lost') {
      setShowLostReason(true)
      return
    }
    const updated = { ...currentLead, stage, updatedAt: Date.now() }
    await growthService.saveLead(updated)
    setCurrentLead(updated)
    onChange()
  }

  const handleLostConfirm = async () => {
    const updated = { ...currentLead, stage: 'lost' as LeadStage, lostReason: lostReason || undefined, updatedAt: Date.now() }
    await growthService.saveLead(updated)
    setCurrentLead(updated)
    setShowLostReason(false)
    onChange()
  }

  const handleFollowUp = async (days: number) => {
    const ts = Date.now() + days * 86400000
    const updated = { ...currentLead, nextFollowUpAt: ts, lastContactAt: Date.now(), updatedAt: Date.now() }
    await growthService.saveLead(updated)
    setCurrentLead(updated)
    setShowFollowUpPicker(false)
    onChange()
  }

  const generateMessage = () => {
    const tmpl = MESSAGE_TEMPLATES.find(t => t.type === selectedTemplate)
    if (!tmpl) return
    const msg = tmpl.template
      .replace(/\{\{name\}\}/g, currentLead.name)
      .replace(/\{\{service\}\}/g, currentLead.serviceInterest || 'the service we discussed')
      .replace(/\{\{company\}\}/g, 'our firm')
    setGeneratedMessage(msg)
  }

  const copyMessage = async () => {
    await navigator.clipboard.writeText(generatedMessage)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <GlassModal isOpen={true} onClose={onClose} title={currentLead.name}>
      <div className="space-y-5 p-1 max-h-[70vh] overflow-y-auto">
        {/* Info */}
        <div className="space-y-2">
          {currentLead.company && <p className="text-white/60 text-sm">{currentLead.company}</p>}
          {currentLead.phone && (
            <div className="flex items-center gap-2 text-sm text-white/60">
              <Phone className="w-3.5 h-3.5" />
              {currentLead.phone}
            </div>
          )}
          {currentLead.serviceInterest && (
            <div className="flex items-center gap-2 text-sm text-white/60">
              <Zap className="w-3.5 h-3.5 text-teal-400" />
              {currentLead.serviceInterest}
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-white/60">
            <GitBranch className="w-3.5 h-3.5" />
            {SOURCE_LABELS[currentLead.source]}
          </div>
          {currentLead.lastContactAt && (
            <div className="flex items-center gap-2 text-sm text-white/60">
              <Clock className="w-3.5 h-3.5" />
              Last contact: {formatRelativeDate(currentLead.lastContactAt)}
            </div>
          )}
          {currentLead.nextFollowUpAt && (
            <div className={`flex items-center gap-2 text-sm ${currentLead.nextFollowUpAt <= Date.now() ? 'text-amber-400' : 'text-white/60'}`}>
              <Calendar className="w-3.5 h-3.5" />
              Follow-up: {new Date(currentLead.nextFollowUpAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
              {currentLead.nextFollowUpAt <= Date.now() && ' — Due today'}
            </div>
          )}
        </div>

        {/* Stage selector */}
        <div>
          <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Pipeline Stage</p>
          <div className="flex flex-wrap gap-1.5">
            {stages.map(s => (
              <button
                key={s}
                onClick={() => handleStageChange(s)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                  currentLead.stage === s
                    ? STAGE_COLORS[s] + ' ring-1 ring-current'
                    : 'text-white/40 bg-white/5 hover:bg-white/10'
                }`}
              >
                {STAGE_LABELS[s]}
              </button>
            ))}
          </div>
        </div>

        {/* Follow-up */}
        <div>
          <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Schedule Follow-up</p>
          {!showFollowUpPicker ? (
            <button
              onClick={() => setShowFollowUpPicker(true)}
              className="flex items-center gap-2 text-sm text-teal-400 hover:text-teal-300 transition-colors"
            >
              <Clock className="w-4 h-4" />
              Set follow-up reminder
            </button>
          ) : (
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Today', days: 0 },
                { label: 'Tomorrow', days: 1 },
                { label: '3 Days', days: 3 },
                { label: '1 Week', days: 7 },
                { label: '2 Weeks', days: 14 },
              ].map(opt => (
                <button
                  key={opt.days}
                  onClick={() => handleFollowUp(opt.days)}
                  className="px-3 py-1.5 rounded-lg bg-teal-500/20 border border-teal-500/30 text-teal-300 text-xs hover:bg-teal-500/30 transition-colors"
                >
                  {opt.label}
                </button>
              ))}
              <button onClick={() => setShowFollowUpPicker(false)} className="text-white/40 text-xs px-2">Cancel</button>
            </div>
          )}
        </div>

        {/* Message helper */}
        <div>
          <button
            onClick={() => setShowMessageHelper(!showMessageHelper)}
            className="flex items-center gap-2 text-sm font-medium text-violet-400 hover:text-violet-300 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            Help me write a message
          </button>

          {showMessageHelper && (
            <div className="mt-3 space-y-3">
              <div>
                <label className="text-white/40 text-xs uppercase tracking-wider block mb-1.5">Message type</label>
                <select
                  value={selectedTemplate}
                  onChange={e => setSelectedTemplate(e.target.value as MessageTemplateType)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none"
                >
                  {MESSAGE_TEMPLATES.filter(t => ['first_followup', 'quotation_followup', 'no_response_followup', 'final_gentle_followup'].includes(t.type)).map(t => (
                    <option key={t.type} value={t.type} className="bg-slate-800">{t.title}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={generateMessage}
                className="w-full py-2 rounded-xl bg-violet-500/20 border border-violet-500/30 text-violet-300 text-sm hover:bg-violet-500/30 transition-colors"
              >
                Generate Draft
              </button>
              {generatedMessage && (
                <div className="space-y-2">
                  <div className="bg-white/5 rounded-xl p-3 text-white/80 text-sm leading-relaxed whitespace-pre-wrap">
                    {generatedMessage}
                  </div>
                  <p className="text-white/30 text-xs italic">
                    {MESSAGE_TEMPLATES.find(t => t.type === selectedTemplate)?.tip}
                  </p>
                  <button
                    onClick={copyMessage}
                    className={`w-full py-2 rounded-xl border text-sm font-medium transition-colors ${
                      copied
                        ? 'border-emerald-500/40 bg-emerald-500/20 text-emerald-300'
                        : 'border-white/10 bg-white/5 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    {copied ? '✓ Copied' : 'Copy Message'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Why follow-up matters */}
        <details className="group">
          <summary className="text-white/30 text-xs cursor-pointer hover:text-white/50 transition-colors list-none flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Why does following up matter?
          </summary>
          <div className="mt-2 pl-4 border-l border-white/10 text-white/50 text-xs leading-relaxed space-y-2">
            <p>Many potential clients do not respond immediately — not because they're uninterested, but because they're busy or undecided.</p>
            <p>A thoughtful follow-up can remind them without creating pressure. The best follow-ups add something useful: context, clarification, or a relevant update.</p>
            <p className="text-white/30 italic">A useful message is remembered. A pushy one is ignored.</p>
          </div>
        </details>

        {/* Notes */}
        <div>
          <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Notes</p>
          <textarea
            value={note || currentLead.notes || ''}
            onChange={e => setNote(e.target.value)}
            onBlur={async () => {
              if (note !== currentLead.notes) {
                const updated = { ...currentLead, notes: note, updatedAt: Date.now() }
                await growthService.saveLead(updated)
                setCurrentLead(updated)
                onChange()
              }
            }}
            placeholder="Add a note about this lead…"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white/80 text-sm placeholder-white/20 focus:outline-none focus:border-teal-500/30 resize-none"
            rows={3}
          />
        </div>
      </div>

      {/* Lost reason picker */}
      {showLostReason && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-4">
          <GlassPanel className="w-full max-w-sm p-5 space-y-4">
            <h3 className="text-white font-medium">Why was this lost?</h3>
            <div className="flex flex-wrap gap-2">
              {['Price', 'No response', 'Chose competitor', 'Not ready', 'Service unavailable', 'Other'].map(r => (
                <button
                  key={r}
                  onClick={() => setLostReason(r)}
                  className={`px-3 py-1.5 rounded-lg text-xs border transition-colors ${
                    lostReason === r
                      ? 'border-red-500/50 bg-red-500/20 text-red-300'
                      : 'border-white/10 bg-white/5 text-white/50 hover:bg-white/10'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
            <p className="text-white/30 text-xs">Optional — helps you understand patterns over time.</p>
            <div className="flex gap-3">
              <GlassButton onClick={() => setShowLostReason(false)} className="flex-1">Cancel</GlassButton>
              <button
                onClick={handleLostConfirm}
                className="flex-1 py-2 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 text-sm hover:bg-red-500/30 transition-colors"
              >
                Mark Lost
              </button>
            </div>
          </GlassPanel>
        </div>
      )}
    </GlassModal>
  )
}

// ─── Leads View ────────────────────────────────────────────────────────────────

function LeadsView() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [filterStage, setFilterStage] = useState<LeadStage | 'all'>('all')

  const loadLeads = async () => {
    const ls = await growthService.getLeads()
    setLeads(ls.sort((a, b) => b.updatedAt - a.updatedAt))
  }

  useEffect(() => { loadLeads() }, [])

  const handleSaveLead = async (lead: Lead) => {
    await growthService.saveLead(lead)
    await loadLeads()
    setShowAddModal(false)
  }

  const stages: (LeadStage | 'all')[] = ['all', 'new', 'contacted', 'discussing', 'proposal', 'won', 'lost']

  const filteredLeads = filterStage === 'all' ? leads : leads.filter(l => l.stage === filterStage)
  const activeLeads = leads.filter(l => l.stage !== 'won' && l.stage !== 'lost')
  const wonLeads = leads.filter(l => l.stage === 'won')

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Pipeline filter */}
      <div className="px-4 pt-4 pb-3 flex gap-2 overflow-x-auto scrollbar-hide">
        {stages.map(s => (
          <button
            key={s}
            onClick={() => setFilterStage(s)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filterStage === s
                ? s === 'all' ? 'bg-teal-500/30 text-teal-300 border border-teal-500/40' : STAGE_COLORS[s as LeadStage] + ' border border-current/30'
                : 'text-white/40 bg-white/5 hover:bg-white/10'
            }`}
          >
            {s === 'all' ? `All (${leads.length})` : `${STAGE_LABELS[s as LeadStage]}`}
          </button>
        ))}
      </div>

      {/* Stats row */}
      {leads.length > 0 && (
        <div className="px-4 pb-3 flex gap-3">
          <div className="text-sm text-white/40">
            <span className="text-white font-medium">{activeLeads.length}</span> active ·{' '}
            <span className="text-emerald-400 font-medium">{wonLeads.length}</span> won
          </div>
        </div>
      )}

      {/* Leads list */}
      <div className="px-4 pb-4 space-y-3">
        {filteredLeads.length === 0 ? (
          <EmptyState
            icon={Users}
            title={filterStage === 'all' ? 'No leads yet' : `No ${STAGE_LABELS[filterStage as LeadStage]} leads`}
            description={filterStage === 'all' ? 'Add your first potential client to get started.' : 'Change the filter to see other stages.'}
          />
        ) : (
          filteredLeads.map(lead => (
            <button
              key={lead.id}
              onClick={() => setSelectedLead(lead)}
              className="w-full text-left"
            >
              <GlassPanel className="p-4 hover:bg-white/5 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-white font-medium text-sm">{lead.name}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STAGE_COLORS[lead.stage]}`}>
                        {STAGE_LABELS[lead.stage]}
                      </span>
                      {lead.nextFollowUpAt && lead.nextFollowUpAt <= Date.now() && lead.stage !== 'won' && lead.stage !== 'lost' && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400">
                          Follow-up due
                        </span>
                      )}
                    </div>
                    {lead.serviceInterest && (
                      <p className="text-white/50 text-xs mt-0.5">{lead.serviceInterest}</p>
                    )}
                    {lead.company && (
                      <p className="text-white/40 text-xs">{lead.company}</p>
                    )}
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                      <span className="text-white/30 text-xs">{SOURCE_LABELS[lead.source]}</span>
                      {lead.lastContactAt && (
                        <span className="text-white/30 text-xs">{formatRelativeDate(lead.lastContactAt)}</span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/20 flex-shrink-0 mt-0.5" />
                </div>
              </GlassPanel>
            </button>
          ))
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-20 right-4 sm:bottom-6 w-12 h-12 rounded-full bg-teal-500/30 border border-teal-500/50 text-teal-300 flex items-center justify-center shadow-lg hover:bg-teal-500/40 transition-colors z-10"
      >
        <Plus className="w-5 h-5" />
      </button>

      {showAddModal && (
        <AddLeadModal onClose={() => setShowAddModal(false)} onSave={handleSaveLead} />
      )}
      {selectedLead && (
        <LeadDetailModal
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onChange={loadLeads}
        />
      )}
    </div>
  )
}

// ─── Clients View ──────────────────────────────────────────────────────────────

function ClientsView() {
  const [financeClients, setFinanceClients] = useState<Client[]>([])
  const [relationships, setRelationships] = useState<ClientRelationship[]>([])
  const [selected, setSelected] = useState<Client | null>(null)
  const [selectedRel, setSelectedRel] = useState<ClientRelationship | null>(null)
  const [showAddInteraction, setShowAddInteraction] = useState(false)
  const [interactionNote, setInteractionNote] = useState('')
  const [interactionType, setInteractionType] = useState<'call' | 'whatsapp' | 'email' | 'meeting' | 'note'>('call')
  const [showMessageHelper, setShowMessageHelper] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplateType>('existing_client_reconnect')
  const [generatedMessage, setGeneratedMessage] = useState('')
  const [copied, setCopied] = useState(false)

  const loadData = async () => {
    const [fc, rels] = await Promise.all([
      growthService.getFinanceClients(),
      growthService.getClientRelationships()
    ])
    setFinanceClients(fc.filter(c => !c.isArchived))
    setRelationships(rels)
  }

  useEffect(() => { loadData() }, [])

  const getRelForClient = (clientId: string) =>
    relationships.find(r => r.clientId === clientId)

  const handleSelectClient = (client: Client) => {
    setSelected(client)
    setSelectedRel(getRelForClient(client.id) || null)
    setInteractionNote('')
    setGeneratedMessage('')
  }

  const handleSaveInteraction = async () => {
    if (!selected || !interactionNote.trim()) return
    const now = Date.now()
    const todayStr = new Date().toISOString().split('T')[0]
    let rel = selectedRel

    if (!rel) {
      rel = {
        id: selected.id,
        clientId: selected.id,
        referralStatus: 'not_asked',
        referredClientIds: [],
        interactions: [],
        serviceHistory: [],
        createdAt: now,
        updatedAt: now
      }
    }

    const interaction = {
      id: gid(),
      clientId: selected.id,
      type: interactionType,
      date: todayStr,
      note: interactionNote.trim(),
      createdAt: now
    }

    const updated: ClientRelationship = {
      ...rel,
      lastContactDate: todayStr,
      interactions: [...(rel.interactions || []), interaction],
      updatedAt: now
    }

    await growthService.saveClientRelationship(updated)
    setSelectedRel(updated)
    setInteractionNote('')
    setShowAddInteraction(false)
    await loadData()
  }

  const handleUpdateReferral = async (status: 'not_asked' | 'asked' | 'referred') => {
    if (!selected) return
    const now = Date.now()
    const rel = selectedRel || {
      id: selected.id,
      clientId: selected.id,
      referralStatus: 'not_asked' as const,
      referredClientIds: [],
      interactions: [],
      serviceHistory: [],
      createdAt: now,
      updatedAt: now
    }
    const updated = { ...rel, referralStatus: status, updatedAt: now }
    await growthService.saveClientRelationship(updated)
    setSelectedRel(updated)
    await loadData()
  }

  const generateMessage = () => {
    if (!selected) return
    const tmpl = MESSAGE_TEMPLATES.find(t => t.type === selectedTemplate)
    if (!tmpl) return
    const rel = selectedRel
    const msg = tmpl.template
      .replace(/\{\{name\}\}/g, selected.name)
      .replace(/\{\{service\}\}/g, rel?.lastServiceDescription || 'the service we completed')
      .replace(/\{\{company\}\}/g, 'our firm')
    setGeneratedMessage(msg)
  }

  const copyMessage = async () => {
    await navigator.clipboard.writeText(generatedMessage)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (selected) {
    const rel = selectedRel
    return (
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Back */}
        <button
          onClick={() => setSelected(null)}
          className="flex items-center gap-1.5 text-white/50 text-sm hover:text-white/70 transition-colors"
        >
          <ChevronRight className="w-4 h-4 rotate-180" />
          All Clients
        </button>

        {/* Client header */}
        <div>
          <h2 className="text-white font-semibold text-lg">{selected.name}</h2>
          {selected.companyName && <p className="text-white/50 text-sm">{selected.companyName}</p>}
          {selected.phone && (
            <div className="flex items-center gap-2 text-white/40 text-sm mt-1">
              <Phone className="w-3.5 h-3.5" />
              {selected.phone}
            </div>
          )}
        </div>

        {/* Relationship info */}
        <GlassPanel className="p-4 space-y-3">
          <p className="text-white/40 text-xs uppercase tracking-wider">Relationship</p>
          {rel?.lastServiceDescription && (
            <div>
              <p className="text-white/30 text-xs">Last Service</p>
              <p className="text-white/70 text-sm mt-0.5">{rel.lastServiceDescription}</p>
              {rel.lastServiceDate && <p className="text-white/30 text-xs mt-0.5">{formatDateStr(rel.lastServiceDate)}</p>}
            </div>
          )}
          {rel?.lastContactDate && (
            <div>
              <p className="text-white/30 text-xs">Last Contact</p>
              <p className="text-white/70 text-sm mt-0.5">{formatDateStr(rel.lastContactDate)}</p>
            </div>
          )}
          {rel?.nextRenewalDate && (
            <div>
              <p className="text-white/30 text-xs">Upcoming Renewal</p>
              <p className="text-amber-400 text-sm mt-0.5 font-medium">{rel.renewalDescription || 'Renewal'} — {formatDateStr(rel.nextRenewalDate)}</p>
            </div>
          )}
          {rel?.notes && (
            <div>
              <p className="text-white/30 text-xs">Notes</p>
              <p className="text-white/60 text-sm mt-0.5">{rel.notes}</p>
            </div>
          )}
          {!rel && (
            <p className="text-white/30 text-xs">No relationship data yet. Log your first interaction below.</p>
          )}
        </GlassPanel>

        {/* Referral */}
        <GlassPanel className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-white/40 text-xs uppercase tracking-wider">Referral Status</p>
            {rel?.referredClientIds?.length ? (
              <span className="text-emerald-400 text-xs font-medium">{rel.referredClientIds.length} referred</span>
            ) : null}
          </div>
          <div className="flex gap-2 flex-wrap">
            {(['not_asked', 'asked', 'referred'] as const).map(s => (
              <button
                key={s}
                onClick={() => handleUpdateReferral(s)}
                className={`px-3 py-1.5 rounded-lg text-xs border transition-colors ${
                  rel?.referralStatus === s
                    ? s === 'referred' ? 'border-emerald-500/50 bg-emerald-500/20 text-emerald-300'
                    : s === 'asked' ? 'border-violet-500/50 bg-violet-500/20 text-violet-300'
                    : 'border-white/20 bg-white/10 text-white/70'
                    : 'border-white/10 bg-white/5 text-white/40 hover:bg-white/10'
                }`}
              >
                {s === 'not_asked' ? 'Not asked' : s === 'asked' ? 'Asked' : 'Referred someone'}
              </button>
            ))}
          </div>
          {rel?.referralStatus !== 'asked' && (
            <details className="group">
              <summary className="text-white/30 text-xs cursor-pointer hover:text-white/50 list-none flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                When to ask for a referral
              </summary>
              <div className="mt-2 pl-4 border-l border-white/10 text-white/50 text-xs leading-relaxed">
                <p>Ask after a successful outcome — when the client expresses satisfaction. Not before delivering meaningful value.</p>
                <p className="mt-1 italic text-white/30">"If you know anyone who may need help with something similar, you're always welcome to introduce us."</p>
              </div>
            </details>
          )}
        </GlassPanel>

        {/* Message helper */}
        <GlassPanel className="p-4 space-y-3">
          <button
            onClick={() => setShowMessageHelper(!showMessageHelper)}
            className="flex items-center gap-2 text-sm font-medium text-violet-400"
          >
            <MessageCircle className="w-4 h-4" />
            Help me write a message
          </button>
          {showMessageHelper && (
            <div className="space-y-3">
              <select
                value={selectedTemplate}
                onChange={e => setSelectedTemplate(e.target.value as MessageTemplateType)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none"
              >
                {MESSAGE_TEMPLATES.filter(t => ['existing_client_reconnect', 'care_checkin', 'renewal_reminder', 'referral_introduction'].includes(t.type)).map(t => (
                  <option key={t.type} value={t.type} className="bg-slate-800">{t.title}</option>
                ))}
              </select>
              <button onClick={generateMessage} className="w-full py-2 rounded-xl bg-violet-500/20 border border-violet-500/30 text-violet-300 text-sm">
                Generate Draft
              </button>
              {generatedMessage && (
                <div className="space-y-2">
                  <div className="bg-white/5 rounded-xl p-3 text-white/80 text-sm leading-relaxed whitespace-pre-wrap">{generatedMessage}</div>
                  <button
                    onClick={copyMessage}
                    className={`w-full py-2 rounded-xl border text-sm font-medium transition-colors ${copied ? 'border-emerald-500/40 bg-emerald-500/20 text-emerald-300' : 'border-white/10 bg-white/5 text-white/60'}`}
                  >
                    {copied ? '✓ Copied' : 'Copy Message'}
                  </button>
                </div>
              )}
            </div>
          )}
        </GlassPanel>

        {/* Interaction log */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-white/40 text-xs uppercase tracking-wider">Interaction History</p>
            <button
              onClick={() => setShowAddInteraction(!showAddInteraction)}
              className="text-teal-400 text-xs flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Log
            </button>
          </div>

          {showAddInteraction && (
            <div className="mb-3 space-y-3 p-3 rounded-xl bg-white/5 border border-white/10">
              <div className="flex gap-2 flex-wrap">
                {(['call', 'whatsapp', 'email', 'meeting', 'note'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setInteractionType(t)}
                    className={`px-2.5 py-1 rounded-lg text-xs border transition-colors capitalize ${
                      interactionType === t ? 'border-teal-500/50 bg-teal-500/20 text-teal-300' : 'border-white/10 bg-white/5 text-white/40'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <textarea
                value={interactionNote}
                onChange={e => setInteractionNote(e.target.value)}
                placeholder="Brief note about this interaction…"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white/80 text-sm placeholder-white/20 focus:outline-none resize-none"
                rows={2}
              />
              <div className="flex gap-2">
                <GlassButton onClick={() => setShowAddInteraction(false)} className="flex-1 text-xs">Cancel</GlassButton>
                <button
                  onClick={handleSaveInteraction}
                  disabled={!interactionNote.trim()}
                  className="flex-1 py-2 rounded-xl bg-teal-500/20 border border-teal-500/30 text-teal-300 text-xs disabled:opacity-40"
                >
                  Save
                </button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {(rel?.interactions || []).slice().reverse().map(interaction => (
              <div key={interaction.id} className="flex gap-3 items-start">
                <div className="w-1 h-1 rounded-full bg-teal-400/60 mt-1.5 flex-shrink-0" />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-white/40 text-xs capitalize">{interaction.type}</span>
                    <span className="text-white/20 text-xs">{formatDateStr(interaction.date)}</span>
                  </div>
                  <p className="text-white/70 text-xs mt-0.5">{interaction.note}</p>
                </div>
              </div>
            ))}
            {(!rel?.interactions || rel.interactions.length === 0) && (
              <p className="text-white/20 text-xs">No interactions logged yet.</p>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <div>
        <h2 className="text-white/40 text-xs uppercase tracking-wider mb-0.5">Clients</h2>
        <p className="text-white/30 text-xs">Referencing Finance clients — no duplicate data.</p>
      </div>

      {financeClients.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No clients yet"
          description="Add clients in Finance, then manage relationships here."
        />
      ) : (
        <div className="space-y-3">
          {financeClients.map(client => {
            const rel = getRelForClient(client.id)
            return (
              <button key={client.id} onClick={() => handleSelectClient(client)} className="w-full text-left">
                <GlassPanel className="p-4 hover:bg-white/5 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-white font-medium text-sm">{client.name}</p>
                      {client.companyName && <p className="text-white/50 text-xs mt-0.5">{client.companyName}</p>}
                      <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                        {rel?.lastServiceDescription && (
                          <span className="text-white/30 text-xs">{rel.lastServiceDescription}</span>
                        )}
                        {rel?.lastContactDate && (
                          <span className="text-white/30 text-xs">Contact: {formatDateStr(rel.lastContactDate)}</span>
                        )}
                        {rel?.nextRenewalDate && (
                          <span className="text-amber-400 text-xs font-medium">Renewal approaching</span>
                        )}
                      </div>
                      {rel?.referralStatus === 'referred' && (
                        <span className="text-emerald-400 text-xs mt-1 block">Has referred clients ✓</span>
                      )}
                    </div>
                    <ChevronRight className="w-4 h-4 text-white/20 flex-shrink-0 mt-0.5" />
                  </div>
                </GlassPanel>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Playbook View ─────────────────────────────────────────────────────────────

function PlaybookView({ onNavigate }: { onNavigate: (view: ActiveView) => void }) {
  const [activeLesson, setActiveLesson] = useState<typeof PLAYBOOK_LESSONS[0] | null>(null)
  const [activeSection, setActiveSection] = useState<'get_clients' | 'keep_clients'>('get_clients')

  const sectionLessons = PLAYBOOK_LESSONS.filter(l => l.section === activeSection)

  if (activeLesson) {
    return (
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        <button
          onClick={() => setActiveLesson(null)}
          className="flex items-center gap-1.5 text-white/50 text-sm hover:text-white/70 transition-colors"
        >
          <ChevronRight className="w-4 h-4 rotate-180" />
          Playbook
        </button>

        <div className="space-y-1">
          <span className={`text-[10px] font-bold tracking-widest uppercase ${activeLesson.section === 'get_clients' ? 'text-teal-400' : 'text-violet-400'}`}>
            {activeLesson.section === 'get_clients' ? 'Get Clients' : 'Keep Clients'}
          </span>
          <h2 className="text-white font-semibold text-xl leading-tight">{activeLesson.title}</h2>
        </div>

        <div className="space-y-4">
          {/* Idea */}
          <GlassPanel className="p-4 space-y-2">
            <p className="text-teal-400 text-[10px] font-bold uppercase tracking-wider">Idea</p>
            <p className="text-white/80 text-sm leading-relaxed">{activeLesson.idea}</p>
          </GlassPanel>

          {/* Why it works */}
          <GlassPanel className="p-4 space-y-2">
            <p className="text-blue-400 text-[10px] font-bold uppercase tracking-wider">Why it works</p>
            <p className="text-white/70 text-sm leading-relaxed">{activeLesson.whyItWorks}</p>
          </GlassPanel>

          {/* Examples */}
          {(activeLesson.badExample || activeLesson.goodExample) && (
            <div className="space-y-3">
              {activeLesson.badExample && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 space-y-1">
                  <p className="text-red-400 text-[10px] font-bold uppercase tracking-wider">Not this</p>
                  <p className="text-white/60 text-sm italic leading-relaxed">"{activeLesson.badExample}"</p>
                </div>
              )}
              {activeLesson.goodExample && (
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-1">
                  <p className="text-emerald-400 text-[10px] font-bold uppercase tracking-wider">Better</p>
                  <p className="text-white/70 text-sm leading-relaxed">"{activeLesson.goodExample}"</p>
                </div>
              )}
            </div>
          )}

          {/* Do this */}
          <div className="rounded-xl border border-teal-500/30 bg-teal-500/10 p-4 space-y-2">
            <p className="text-teal-400 text-[10px] font-bold uppercase tracking-wider">Do this</p>
            <p className="text-white font-medium text-sm leading-relaxed">{activeLesson.doThis}</p>
            {activeLesson.actionLabel && activeLesson.actionType && (
              <button
                onClick={() => {
                  setActiveLesson(null)
                  if (activeLesson.actionType === 'add_lead' || activeLesson.actionType === 'open_leads') onNavigate('leads')
                  else if (activeLesson.actionType === 'open_clients' || activeLesson.actionType === 'open_referrals') onNavigate('clients')
                }}
                className="flex items-center gap-2 text-teal-300 text-sm font-medium mt-2 hover:text-teal-200 transition-colors"
              >
                {activeLesson.actionLabel}
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-5">
      {/* Section tabs */}
      <div className="flex gap-2">
        {(['get_clients', 'keep_clients'] as const).map(s => (
          <button
            key={s}
            onClick={() => setActiveSection(s)}
            className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-colors ${
              activeSection === s
                ? s === 'get_clients'
                  ? 'bg-teal-500/20 border-teal-500/40 text-teal-300'
                  : 'bg-violet-500/20 border-violet-500/40 text-violet-300'
                : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'
            }`}
          >
            {s === 'get_clients' ? 'Get Clients' : 'Keep Clients'}
          </button>
        ))}
      </div>

      {/* Intro */}
      <GlassPanel className="p-4">
        <p className="text-white/50 text-sm leading-relaxed">
          {activeSection === 'get_clients'
            ? 'Short, practical lessons for attracting quality clients — without aggressive sales tactics.'
            : 'Practical lessons for keeping clients coming back and earning referrals through genuine relationship.'}
        </p>
      </GlassPanel>

      {/* Lessons */}
      <div className="space-y-3">
        {sectionLessons.map(lesson => (
          <button
            key={lesson.id}
            onClick={() => setActiveLesson(lesson)}
            className="w-full text-left"
          >
            <GlassPanel className="p-4 hover:bg-white/5 transition-colors">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-white font-medium text-sm">{lesson.title}</p>
                  <p className="text-white/40 text-xs mt-0.5 line-clamp-2">{lesson.idea}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-white/20 flex-shrink-0" />
              </div>
            </GlassPanel>
          </button>
        ))}
      </div>

      {/* Principles */}
      <div>
        <p className="text-white/40 text-xs uppercase tracking-wider mb-3">Core Principles</p>
        <div className="space-y-2">
          {[
            'Be easy to understand',
            'Respond quickly',
            'Follow up thoughtfully',
            'Teach before selling',
            'Be useful',
            'Keep promises',
            'Track where clients actually came from',
            'Do more of what works',
          ].map((p, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-1 h-1 rounded-full bg-teal-400/60 flex-shrink-0" />
              <p className="text-white/50 text-sm">{p}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Main GrowthApp ────────────────────────────────────────────────────────────

export default function GrowthApp() {
  const [activeView, setActiveView] = useState<ActiveView>('today')

  const navItems: { id: ActiveView; label: string; icon: React.ElementType }[] = [
    { id: 'today', label: 'Today', icon: Zap },
    { id: 'leads', label: 'Leads', icon: Target },
    { id: 'clients', label: 'Clients', icon: Users },
    { id: 'playbook', label: 'Playbook', icon: BookOpen },
  ]

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <AppHeader
        title="Growth"
        subtitle={activeView === 'today' ? 'What should I do today?' : activeView === 'leads' ? 'Pipeline' : activeView === 'clients' ? 'Relationships' : 'Learn & Apply'}
        icon={TrendingUp}
        gradient="from-teal-500 to-emerald-600"
      />

      {/* Content */}
      <div className="flex-1 overflow-hidden flex flex-col min-h-0">
        {activeView === 'today' && <TodayView onNavigate={setActiveView} />}
        {activeView === 'leads' && <LeadsView />}
        {activeView === 'clients' && <ClientsView />}
        {activeView === 'playbook' && <PlaybookView onNavigate={setActiveView} />}
      </div>

      {/* Bottom navigation */}
      <div className="flex-shrink-0 border-t border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="flex">
          {navItems.map(item => {
            const Icon = item.icon
            const active = activeView === item.id
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`flex-1 flex flex-col items-center justify-center py-3 gap-1 transition-colors ${
                  active ? 'text-teal-400' : 'text-white/30 hover:text-white/50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
