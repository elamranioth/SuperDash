import { useState, useEffect, useMemo } from 'react'
import {
  BookMarked,
  Plus,
  Search,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  TrendingUp,
  Clock,
  ArrowRight,
  Sparkles,
  Tag,
  ThumbsUp,
  ThumbsDown,
  Trash2,
  Archive,
  Edit3,
  X,
  ChevronRight,
  ShieldAlert,
  Percent,
  History
} from 'lucide-react'
import { DecisionItem, DecisionStatus, DecisionRating } from '@/types'
import {
  decisionService,
  DEFAULT_DECISION_CATEGORIES,
  INITIAL_DECISIONS
} from '@/services/decisions'
import GlassPanel from '@/components/LiquidGlass/GlassPanel'
import GlassButton from '@/components/LiquidGlass/GlassButton'
import GlassModal from '@/components/LiquidGlass/GlassModal'
import AppHeader from '@/components/AppWindow/AppHeader'
import EmptyState from '@/components/LiquidGlass/EmptyState'
import { sounds } from '@/utils/sound'
import { toLocalYYYYMMDD } from '@/utils/date'

type TabType = 'active' | 'review_due' | 'reviewed' | 'archived'

interface DecisionBookAppProps {
  initialDecisionId?: string
}

export default function DecisionBookApp({ initialDecisionId }: DecisionBookAppProps) {
  const [decisions, setDecisions] = useState<DecisionItem[]>([])
  const [activeTab, setActiveTab] = useState<TabType>('active')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [selectedDecision, setSelectedDecision] = useState<DecisionItem | null>(null)
  const [isReviewOpen, setIsReviewOpen] = useState(false)

  // Creation Form State
  const [newTitle, setNewTitle] = useState('')
  const [newContext, setNewContext] = useState('')
  const [newDecision, setNewDecision] = useState('')
  const [newCategory, setNewCategory] = useState('Business')
  const [newDecisionDate, setNewDecisionDate] = useState(toLocalYYYYMMDD())
  const [newReviewDate, setNewReviewDate] = useState('')
  const [newConfidence, setNewConfidence] = useState(80)
  const [newExpectedOutcome, setNewExpectedOutcome] = useState('')
  const [newOptions, setNewOptions] = useState<string[]>([])
  const [tempOption, setTempOption] = useState('')
  const [newReasons, setNewReasons] = useState<string[]>([])
  const [tempReason, setTempReason] = useState('')
  const [newRisks, setNewRisks] = useState<string[]>([])
  const [tempRisk, setTempRisk] = useState('')

  // Review Evaluation Form State
  const [evalOutcome, setEvalOutcome] = useState('')
  const [evalLessons, setEvalLessons] = useState('')
  const [evalRepeat, setEvalRepeat] = useState<'Yes' | 'No' | 'Not Sure'>('Yes')
  const [evalRating, setEvalRating] = useState<DecisionRating>('AS EXPECTED')

  // Load Decisions
  const reloadData = async () => {
    const list = await decisionService.getAll()
    setDecisions(list)
  }

  useEffect(() => {
    reloadData()
    const unsub = decisionService.subscribe(() => {
      reloadData()
    })
    return () => unsub()
  }, [])

  // Deep linking support
  useEffect(() => {
    if (initialDecisionId && decisions.length > 0) {
      const match = decisions.find(d => d.id === initialDecisionId)
      if (match) {
        setSelectedDecision(match)
      }
    }
  }, [initialDecisionId, decisions])

  // Categories list
  const categories = useMemo(() => {
    const set = new Set(DEFAULT_DECISION_CATEGORIES)
    decisions.forEach(d => {
      if (d.category) set.add(d.category)
    })
    return Array.from(set)
  }, [decisions])

  // Preset Review Dates
  const setReviewOffset = (days: number) => {
    sounds.playClick()
    const d = new Date()
    d.setDate(d.getDate() + days)
    setNewReviewDate(toLocalYYYYMMDD(d))
  }

  // Open Creation Modal
  const handleOpenCreate = () => {
    sounds.playClick()
    setNewTitle('')
    setNewContext('')
    setNewDecision('')
    setNewCategory('Business')
    const today = toLocalYYYYMMDD()
    setNewDecisionDate(today)
    // Default review: 1 month later
    const d = new Date()
    d.setMonth(d.getMonth() + 1)
    setNewReviewDate(toLocalYYYYMMDD(d))
    setNewConfidence(80)
    setNewExpectedOutcome('')
    setNewOptions([])
    setTempOption('')
    setNewReasons([])
    setTempReason('')
    setNewRisks([])
    setTempRisk('')
    setIsCreateOpen(true)
  }

  // Submit New Decision
  const handleSaveDecision = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim() || !newDecision.trim()) return

    sounds.playSuccess()
    await decisionService.add({
      title: newTitle.trim(),
      context: newContext.trim() || undefined,
      decision: newDecision.trim(),
      options: newOptions,
      reasons: newReasons,
      risks: newRisks,
      expectedOutcome: newExpectedOutcome.trim() || undefined,
      confidence: newConfidence,
      category: newCategory,
      decisionDate: newDecisionDate,
      reviewDate: newReviewDate
    })

    setIsCreateOpen(false)
    reloadData()
  }

  // Start Evaluation Modal
  const handleStartReview = (d: DecisionItem) => {
    sounds.playClick()
    setSelectedDecision(d)
    setEvalOutcome(d.actualOutcome || '')
    setEvalLessons(d.lessons || '')
    setEvalRepeat(d.repeatDecision || 'Yes')
    setEvalRating(d.resultRating || 'AS EXPECTED')
    setIsReviewOpen(true)
  }

  // Submit Evaluation
  const handleSaveReview = async () => {
    if (!selectedDecision || !evalOutcome.trim()) return

    sounds.playSuccess()
    await decisionService.evaluate(selectedDecision.id, {
      actualOutcome: evalOutcome.trim(),
      lessons: evalLessons.trim(),
      repeatDecision: evalRepeat,
      resultRating: evalRating
    })

    setIsReviewOpen(false)
    reloadData()
    // Refresh selected decision in detail view if open
    const updated = await decisionService.getById(selectedDecision.id)
    setSelectedDecision(updated || null)
  }

  // Delete decision
  const handleDelete = async (id: string) => {
    sounds.playClick()
    if (window.confirm('Delete this decision record permanently?')) {
      await decisionService.delete(id)
      if (selectedDecision?.id === id) setSelectedDecision(null)
      if (isReviewOpen) setIsReviewOpen(false)
      reloadData()
    }
  }

  // Filtered decisions list
  const filteredDecisions = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    const today = toLocalYYYYMMDD()

    return decisions.filter(d => {
      // Tab filter
      if (activeTab === 'active' && (d.status === 'ARCHIVED' || d.status === 'REVIEWED')) return false
      if (activeTab === 'review_due') {
        const isDue = d.reviewDate <= today && d.status !== 'REVIEWED' && d.status !== 'ARCHIVED'
        if (!isDue) return false
      }
      if (activeTab === 'reviewed' && d.status !== 'REVIEWED') return false
      if (activeTab === 'archived' && d.status !== 'ARCHIVED') return false

      // Category filter
      if (selectedCategory !== 'all' && d.category !== selectedCategory) return false

      // Search query
      if (q) {
        const inTitle = d.title.toLowerCase().includes(q)
        const inContext = d.context?.toLowerCase().includes(q)
        const inDec = d.decision.toLowerCase().includes(q)
        const inReasons = d.reasons?.some(r => r.toLowerCase().includes(q))
        const inLessons = d.lessons?.toLowerCase().includes(q)
        const inCat = d.category.toLowerCase().includes(q)
        if (!inTitle && !inContext && !inDec && !inReasons && !inLessons && !inCat) return false
      }

      return true
    })
  }, [decisions, activeTab, selectedCategory, searchQuery])

  // Status Badge UI
  const getStatusBadge = (status: DecisionStatus) => {
    switch (status) {
      case 'REVIEW DUE':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
            <Clock className="w-2.5 h-2.5" /> REVIEW DUE
          </span>
        )
      case 'ACTIVE':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-500/15 text-sky-300 border border-sky-500/25">
            ACTIVE
          </span>
        )
      case 'WAITING FOR OUTCOME':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/25">
            WAITING
          </span>
        )
      case 'REVIEWED':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 flex items-center gap-1">
            <CheckCircle2 className="w-2.5 h-2.5" /> REVIEWED
          </span>
        )
      case 'ARCHIVED':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-500/15 text-zinc-400 border border-zinc-500/25">
            ARCHIVED
          </span>
        )
    }
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Standard AppHeader */}
      <AppHeader
        title="Decision Book"
        subtitle={`${decisions.length} recorded • Calibrate judgment, predicted outcomes & reviews`}
        icon={BookMarked}
        gradient="from-blue-500 to-indigo-600"
        primaryAction={{
          label: 'New Decision',
          icon: Plus,
          onClick: handleOpenCreate
        }}
      />

      <div className="flex-1 flex flex-col p-4 md:p-6 overflow-hidden">

      {/* Navigation Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 shrink-0 pb-1">
        {/* Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/10 shrink-0 overflow-x-auto no-scrollbar">
          {(
            [
              { id: 'active', label: 'Active' },
              { id: 'review_due', label: 'Review Due' },
              { id: 'reviewed', label: 'Reviewed' },
              { id: 'archived', label: 'Archived' }
            ] as const
          ).map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                sounds.playClick()
                setActiveTab(tab.id)
              }}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-white/15 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.05]'
              }`}
            >
              {tab.label}
              {tab.id === 'review_due' && (
                <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500/30 text-amber-300">
                  {decisions.filter(d => d.status === 'REVIEW DUE').length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl bg-white/[0.06] border border-white/10 text-xs text-slate-300 focus:outline-none shrink-0 max-w-[130px] truncate"
          >
            <option value="all" className="bg-slate-900 text-white">All Categories</option>
            {categories.map(c => (
              <option key={c} value={c} className="bg-slate-900 text-white">{c}</option>
            ))}
          </select>

          <div className="relative flex-1 sm:w-48 flex items-center min-w-0">
            <Search className="w-3.5 h-3.5 absolute left-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search decisions..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-400/40 font-sans"
            />
          </div>
        </div>
      </div>

      {/* Decisions List */}
      <div className="flex-1 overflow-y-auto pr-1">
        {filteredDecisions.length === 0 ? (
          <EmptyState
            icon={BookMarked}
            title="No decisions found"
            description={
              searchQuery
                ? `No decisions matching "${searchQuery}". Try different keywords or clear filters.`
                : activeTab === 'review_due'
                ? 'No decisions currently pending review. Great work!'
                : 'Record your first decision, options considered, and expected outcomes.'
            }
            action={{
              label: 'New Decision',
              icon: Plus,
              onClick: handleOpenCreate
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredDecisions.map(item => (
              <div
                key={item.id}
                onClick={() => {
                  sounds.playClick()
                  setSelectedDecision(item)
                }}
                className="liquid-glass rounded-2xl p-4 border border-white/10 hover:border-blue-400/30 hover:bg-white/[0.07] transition-all duration-200 cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-sm text-white group-hover:text-blue-200 transition line-clamp-2 leading-snug">
                      {item.title}
                    </h3>
                    <div className="shrink-0">{getStatusBadge(item.status)}</div>
                  </div>

                  <p className="text-xs text-slate-300 font-medium line-clamp-2 mb-2">
                    <span className="text-blue-400 font-semibold">Decided: </span>
                    {item.decision}
                  </p>

                  {item.expectedOutcome && (
                    <p className="text-xs text-slate-400 italic line-clamp-1 mb-2">
                      "Expected: {item.expectedOutcome}"
                    </p>
                  )}
                </div>

                <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-white/[0.06] text-[11px] font-medium text-slate-300">
                      {item.category}
                    </span>
                    {item.confidence && (
                      <span className="text-[11px] font-mono text-blue-300">
                        {item.confidence}% conf.
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500">
                      Review: {item.reviewDate}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      </div>

      {/* Decision Detail Modal & Timeline */}
      <GlassModal
        isOpen={!!selectedDecision && !isReviewOpen}
        onClose={() => setSelectedDecision(null)}
        title={
          <div className="flex items-center gap-2">
            <BookMarked className="w-4 h-4 text-blue-400" />
            <span>Decision Record</span>
          </div>
        }
        maxWidth="max-w-3xl"
      >
        {selectedDecision && (
          <div className="space-y-5 text-xs text-slate-300">
            {/* Header info */}
            <div>
              <div className="flex items-start justify-between gap-3 mb-1">
                <h2 className="text-base md:text-lg font-bold text-white leading-snug">
                  {selectedDecision.title}
                </h2>
                <div>{getStatusBadge(selectedDecision.status)}</div>
              </div>

              {selectedDecision.context && (
                <p className="text-slate-400 text-xs italic mt-1 leading-relaxed">
                  Context: {selectedDecision.context}
                </p>
              )}
            </div>

            {/* Core Decision Callout */}
            <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/25">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300 block mb-1">
                What was decided
              </span>
              <p className="text-sm font-semibold text-white leading-snug">
                {selectedDecision.decision}
              </p>
            </div>

            {/* Options Considered */}
            {selectedDecision.options && selectedDecision.options.length > 0 && (
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Options Considered
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedDecision.options.map((opt, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-xl bg-white/[0.06] border border-white/10 text-xs text-slate-200"
                    >
                      {i + 1}. {opt}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Reasons & Risks Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Reasons */}
              <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block mb-2">
                  + Why I Chose This
                </span>
                {selectedDecision.reasons && selectedDecision.reasons.length > 0 ? (
                  <ul className="space-y-1">
                    {selectedDecision.reasons.map((r, i) => (
                      <li key={i} className="text-slate-300 flex items-start gap-1.5">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-500 italic">No specific reasons recorded.</p>
                )}
              </div>

              {/* Risks */}
              <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block mb-2">
                  - Risks / What Could Go Wrong
                </span>
                {selectedDecision.risks && selectedDecision.risks.length > 0 ? (
                  <ul className="space-y-1">
                    {selectedDecision.risks.map((r, i) => (
                      <li key={i} className="text-slate-300 flex items-start gap-1.5">
                        <span className="text-amber-400 font-bold">•</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-500 italic">No risks identified.</p>
                )}
              </div>
            </div>

            {/* Expected Outcome vs Actual Outcome */}
            <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 space-y-2">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Expected Outcome (Recorded at decision time)
                </span>
                <p className="text-slate-200 italic">
                  "{selectedDecision.expectedOutcome || 'None specified'}"
                </p>
                <div className="text-[11px] text-blue-300 font-mono mt-1">
                  Confidence: {selectedDecision.confidence}%
                </div>
              </div>

              {selectedDecision.actualOutcome && (
                <div className="pt-2 border-t border-white/10">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block mb-1">
                    What Actually Happened (Evaluated Result)
                  </span>
                  <p className="text-white font-medium">{selectedDecision.actualOutcome}</p>

                  {selectedDecision.lessons && (
                    <div className="mt-1.5">
                      <span className="text-[10px] font-bold text-slate-400">Lessons Learned: </span>
                      <span className="text-slate-300">{selectedDecision.lessons}</span>
                    </div>
                  )}

                  <div className="mt-2 flex items-center gap-3 text-xs">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold text-[10px]">
                      {selectedDecision.resultRating}
                    </span>
                    <span className="text-slate-400">
                      Would repeat? <strong className="text-white">{selectedDecision.repeatDecision}</strong>
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Decision Timeline */}
            <div className="p-3 rounded-xl bg-black/30 border border-white/10">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2 flex items-center gap-1.5">
                <History className="w-3 h-3" /> Chronological Timeline
              </span>
              <div className="space-y-2 pl-2 border-l-2 border-white/15 text-xs">
                <div className="relative pl-3">
                  <div className="absolute -left-[17px] top-1 w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-slate-400 font-mono text-[10px]">{selectedDecision.decisionDate}</span>
                  <p className="text-slate-200">Decision recorded</p>
                </div>

                <div className="relative pl-3">
                  <div className="absolute -left-[17px] top-1 w-2 h-2 rounded-full bg-indigo-500" />
                  <span className="text-slate-400 font-mono text-[10px]">{selectedDecision.decisionDate}</span>
                  <p className="text-slate-200">Expected outcome and risks recorded</p>
                </div>

                <div className="relative pl-3">
                  <div className="absolute -left-[17px] top-1 w-2 h-2 rounded-full bg-amber-500" />
                  <span className="text-slate-400 font-mono text-[10px]">{selectedDecision.reviewDate}</span>
                  <p className="text-slate-200">Review scheduled</p>
                </div>

                {selectedDecision.reviewedAt && (
                  <div className="relative pl-3">
                    <div className="absolute -left-[17px] top-1 w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-slate-400 font-mono text-[10px]">
                      {toLocalYYYYMMDD(new Date(selectedDecision.reviewedAt))}
                    </span>
                    <p className="text-emerald-300 font-medium">Outcome evaluated & reviewed</p>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-between">
              <GlassButton
                variant="danger"
                size="sm"
                onClick={() => handleDelete(selectedDecision.id)}
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
              </GlassButton>

              <div className="flex items-center gap-2">
                {selectedDecision.status !== 'REVIEWED' && (
                  <GlassButton
                    variant="primary"
                    size="sm"
                    onClick={() => handleStartReview(selectedDecision)}
                    className="bg-emerald-600/80 hover:bg-emerald-600 border-emerald-400/40"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Evaluate Decision
                  </GlassButton>
                )}
                <GlassButton
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedDecision(null)}
                >
                  Close
                </GlassButton>
              </div>
            </div>
          </div>
        )}
      </GlassModal>

      {/* Review / Evaluation Modal */}
      <GlassModal
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        title={
          <div className="flex items-center gap-2 text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            <span>Evaluate Decision Outcome</span>
          </div>
        }
        maxWidth="max-w-2xl"
      >
        {selectedDecision && (
          <div className="space-y-4 text-xs">
            {/* Read-Only Original Information */}
            <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Original Decision
              </span>
              <p className="text-sm font-semibold text-white">{selectedDecision.decision}</p>
              {selectedDecision.expectedOutcome && (
                <p className="text-slate-300 italic">
                  Original Expectation: "{selectedDecision.expectedOutcome}"
                </p>
              )}
            </div>

            {/* Evaluation Form */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                WHAT ACTUALLY HAPPENED? *
              </label>
              <textarea
                rows={3}
                value={evalOutcome}
                onChange={e => setEvalOutcome(e.target.value)}
                placeholder="Describe the actual results, consequences, and reality..."
                className="w-full px-3 py-2 rounded-xl bg-white/[0.06] border border-white/15 text-white text-xs focus:outline-none focus:border-emerald-400/50 resize-y"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                LESSONS LEARNED
              </label>
              <textarea
                rows={2}
                value={evalLessons}
                onChange={e => setEvalLessons(e.target.value)}
                placeholder="What did this teach you for future decisions?"
                className="w-full px-3 py-2 rounded-xl bg-white/[0.06] border border-white/15 text-white text-xs focus:outline-none focus:border-emerald-400/50 resize-y"
              />
            </div>

            {/* Questions Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                  WOULD I MAKE THE SAME DECISION AGAIN?
                </label>
                <div className="flex gap-2">
                  {(['Yes', 'No', 'Not Sure'] as const).map(opt => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setEvalRepeat(opt)}
                      className={`flex-1 py-1.5 rounded-xl font-medium transition ${
                        evalRepeat === opt
                          ? 'bg-emerald-600 text-white font-semibold shadow-md'
                          : 'bg-white/[0.06] text-slate-300 hover:text-white border border-white/10'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                  RESULT CLASSIFICATION
                </label>
                <select
                  value={evalRating}
                  onChange={e => setEvalRating(e.target.value as DecisionRating)}
                  className="w-full px-3 py-1.5 rounded-xl bg-white/[0.06] border border-white/15 text-white text-xs focus:outline-none"
                >
                  <option value="BETTER THAN EXPECTED" className="bg-slate-900 text-emerald-400">BETTER THAN EXPECTED</option>
                  <option value="AS EXPECTED" className="bg-slate-900 text-sky-400">AS EXPECTED</option>
                  <option value="WORSE THAN EXPECTED" className="bg-slate-900 text-rose-400">WORSE THAN EXPECTED</option>
                  <option value="TOO EARLY TO KNOW" className="bg-slate-900 text-slate-400">TOO EARLY TO KNOW</option>
                </select>
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-between">
              <GlassButton variant="ghost" size="sm" onClick={() => setIsReviewOpen(false)}>
                Cancel
              </GlassButton>
              <GlassButton
                variant="primary"
                size="sm"
                onClick={handleSaveReview}
                disabled={!evalOutcome.trim()}
                className="bg-emerald-600/90 hover:bg-emerald-600 border-emerald-400/40 text-white"
              >
                Complete Evaluation
              </GlassButton>
            </div>
          </div>
        )}
      </GlassModal>

      {/* New Decision Capture Modal */}
      <GlassModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title={
          <div className="flex items-center gap-2">
            <BookMarked className="w-4 h-4 text-blue-400" />
            <span>New Decision</span>
          </div>
        }
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSaveDecision} className="space-y-4 text-xs">
          {/* Decision Question */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider text-[10px]">
              DECISION (What decision are you making?) *
            </label>
            <input
              type="text"
              required
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              placeholder="e.g. Which cloud hosting platform should I use?"
              className="w-full px-3 py-2 rounded-xl bg-white/[0.06] border border-white/15 text-white font-medium text-sm focus:outline-none focus:border-blue-400/50"
            />
          </div>

          {/* Context */}
          <div>
            <label className="block text-slate-400 font-semibold mb-1 uppercase tracking-wider text-[10px]">
              Context (What is happening? - Optional)
            </label>
            <textarea
              rows={2}
              value={newContext}
              onChange={e => setNewContext(e.target.value)}
              placeholder="Background context, current situation, constraints..."
              className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/15 text-white text-xs focus:outline-none resize-none"
            />
          </div>

          {/* Chosen Decision */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider text-[10px]">
              Chosen Direction / Option Chosen *
            </label>
            <input
              type="text"
              required
              value={newDecision}
              onChange={e => setNewDecision(e.target.value)}
              placeholder="e.g. Deploy to Cloudflare Pages with edge workers"
              className="w-full px-3 py-2 rounded-xl bg-white/[0.06] border border-white/15 text-white text-xs focus:outline-none focus:border-blue-400/50 font-medium"
            />
          </div>

          {/* Options Considered */}
          <div>
            <label className="block text-slate-400 font-semibold mb-1 uppercase tracking-wider text-[10px]">
              Options Considered
            </label>
            <div className="flex gap-2 mb-1.5">
              <input
                type="text"
                value={tempOption}
                onChange={e => setTempOption(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    if (tempOption.trim()) {
                      setNewOptions([...newOptions, tempOption.trim()])
                      setTempOption('')
                    }
                  }
                }}
                placeholder="e.g. Vercel, Hostinger... (Press Enter)"
                className="flex-1 px-3 py-1.5 rounded-xl bg-white/[0.05] border border-white/10 text-white text-xs focus:outline-none"
              />
              <GlassButton
                type="button"
                size="sm"
                onClick={() => {
                  if (tempOption.trim()) {
                    setNewOptions([...newOptions, tempOption.trim()])
                    setTempOption('')
                  }
                }}
              >
                + Add
              </GlassButton>
            </div>
            {newOptions.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {newOptions.map((opt, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white/10 text-slate-300 text-[11px]"
                  >
                    {i + 1}. {opt}
                    <button
                      type="button"
                      onClick={() => setNewOptions(newOptions.filter((_, idx) => idx !== i))}
                      className="hover:text-rose-400"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Reasons & Risks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Why I chose this */}
            <div>
              <label className="block text-emerald-400 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                + Why I chose this (Reasons)
              </label>
              <div className="flex gap-1.5 mb-1.5">
                <input
                  type="text"
                  value={tempReason}
                  onChange={e => setTempReason(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      if (tempReason.trim()) {
                        setNewReasons([...newReasons, tempReason.trim()])
                        setTempReason('')
                      }
                    }
                  }}
                  placeholder="Reason... (Press Enter)"
                  className="flex-1 px-3 py-1.5 rounded-xl bg-white/[0.05] border border-white/10 text-white text-xs focus:outline-none"
                />
                <GlassButton
                  type="button"
                  size="sm"
                  onClick={() => {
                    if (tempReason.trim()) {
                      setNewReasons([...newReasons, tempReason.trim()])
                      setTempReason('')
                    }
                  }}
                >
                  +
                </GlassButton>
              </div>
              {newReasons.length > 0 && (
                <div className="space-y-1">
                  {newReasons.map((r, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between text-slate-300 text-[11px] bg-emerald-500/10 px-2 py-0.5 rounded-lg"
                    >
                      <span>+ {r}</span>
                      <button
                        type="button"
                        onClick={() => setNewReasons(newReasons.filter((_, idx) => idx !== i))}
                        className="hover:text-rose-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Risks */}
            <div>
              <label className="block text-amber-400 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                - Risks / What could go wrong
              </label>
              <div className="flex gap-1.5 mb-1.5">
                <input
                  type="text"
                  value={tempRisk}
                  onChange={e => setTempRisk(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      if (tempRisk.trim()) {
                        setNewRisks([...newRisks, tempRisk.trim()])
                        setTempRisk('')
                      }
                    }
                  }}
                  placeholder="Risk... (Press Enter)"
                  className="flex-1 px-3 py-1.5 rounded-xl bg-white/[0.05] border border-white/10 text-white text-xs focus:outline-none"
                />
                <GlassButton
                  type="button"
                  size="sm"
                  onClick={() => {
                    if (tempRisk.trim()) {
                      setNewRisks([...newRisks, tempRisk.trim()])
                      setTempRisk('')
                    }
                  }}
                >
                  +
                </GlassButton>
              </div>
              {newRisks.length > 0 && (
                <div className="space-y-1">
                  {newRisks.map((r, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between text-slate-300 text-[11px] bg-amber-500/10 px-2 py-0.5 rounded-lg"
                    >
                      <span>- {r}</span>
                      <button
                        type="button"
                        onClick={() => setNewRisks(newRisks.filter((_, idx) => idx !== i))}
                        className="hover:text-rose-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Expected Outcome & Confidence */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider text-[10px]">
              WHAT DO I EXPECT TO HAPPEN? (Before knowing the result)
            </label>
            <textarea
              rows={2}
              value={newExpectedOutcome}
              onChange={e => setNewExpectedOutcome(e.target.value)}
              placeholder="Specific expectation to verify later..."
              className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/15 text-white text-xs focus:outline-none resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-400 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                Confidence ({newConfidence}%)
              </label>
              <div className="flex items-center gap-1.5 flex-wrap">
                {[50, 60, 70, 80, 90, 95].map(pct => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setNewConfidence(pct)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-mono transition ${
                      newConfidence === pct
                        ? 'bg-blue-600 text-white font-bold'
                        : 'bg-white/[0.06] text-slate-300 hover:text-white'
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                Category
              </label>
              <select
                value={newCategory}
                onChange={e => setNewCategory(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-xl bg-white/[0.06] border border-white/15 text-white text-xs focus:outline-none"
              >
                {DEFAULT_DECISION_CATEGORIES.map(c => (
                  <option key={c} value={c} className="bg-slate-900 text-white">{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                Review Date
              </label>
              <input
                type="date"
                required
                value={newReviewDate}
                onChange={e => setNewReviewDate(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-xl bg-white/[0.06] border border-white/15 text-white text-xs font-mono focus:outline-none"
              />
              <div className="flex gap-1 mt-1">
                <button type="button" onClick={() => setReviewOffset(7)} className="text-[9px] text-blue-300 hover:underline">1w</button>
                <span className="text-[9px] text-slate-500">•</span>
                <button type="button" onClick={() => setReviewOffset(30)} className="text-[9px] text-blue-300 hover:underline">1m</button>
                <span className="text-[9px] text-slate-500">•</span>
                <button type="button" onClick={() => setReviewOffset(90)} className="text-[9px] text-blue-300 hover:underline">3m</button>
                <span className="text-[9px] text-slate-500">•</span>
                <button type="button" onClick={() => setReviewOffset(180)} className="text-[9px] text-blue-300 hover:underline">6m</button>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-white/10 flex items-center justify-between">
            <GlassButton type="button" variant="ghost" size="sm" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </GlassButton>
            <GlassButton
              type="submit"
              variant="primary"
              size="sm"
              disabled={!newTitle.trim() || !newDecision.trim()}
              className="bg-blue-600/90 hover:bg-blue-600 text-white border-blue-400/40"
            >
              Save Decision
            </GlassButton>
          </div>
        </form>
      </GlassModal>
    </div>
  )
}
