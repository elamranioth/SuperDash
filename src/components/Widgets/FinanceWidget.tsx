import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  Wallet,
  ExternalLink,
  Plus,
  AlertCircle,
  Clock,
  ArrowUpRight,
  ArrowDownLeft
} from 'lucide-react'
import { Invoice, Payment, Expense, FinanceBusinessSettings } from '@/types'
import { financeService, formatMoney, roundMoney } from '@/services/finance'
import { sounds } from '@/utils/sound'
import { cn } from '@/utils/cn'

interface FinanceWidgetProps {
  size?: 'sm' | 'md' | 'lg'
  onOpenFinance?: () => void
}

export default function FinanceWidget({ size = 'md', onOpenFinance }: FinanceWidgetProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [settings, setSettings] = useState<FinanceBusinessSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadData = useCallback(async () => {
    try {
      const [inv, pay, exp, sett] = await Promise.all([
        financeService.getInvoices(),
        financeService.getPayments(),
        financeService.getExpenses(),
        financeService.getSettings()
      ])
      setInvoices(inv)
      setPayments(pay)
      setExpenses(exp)
      setSettings(sett)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
    const unsubscribe = financeService.subscribe(loadData)
    const handleUpdate = () => loadData()
    window.addEventListener('superdash_finance_updated', handleUpdate)

    return () => {
      unsubscribe()
      window.removeEventListener('superdash_finance_updated', handleUpdate)
    }
  }, [loadData])

  const currency = settings?.defaultCurrency || 'AED'

  // Metric calculations: Total Received, Total Pending, Total Expenses
  const stats = useMemo(() => {
    // 1. Total Received (Cash)
    const totalReceived = roundMoney(
      payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0)
    )

    // 2. Total Expenses
    const totalExpenses = roundMoney(
      expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0)
    )

    // 3. Total Pending (Unpaid & Overdue Invoice Balances)
    const paidByInvoice = new Map<string, number>()
    payments.forEach(p => {
      paidByInvoice.set(p.invoiceId, roundMoney((paidByInvoice.get(p.invoiceId) || 0) + (p.amount || 0)))
    })

    const activeInvoices = invoices.filter(i => i.status !== 'Cancelled' && i.status !== 'Draft')
    let totalOutstanding = 0
    let unpaidCount = 0
    let overdueCount = 0

    activeInvoices.forEach(inv => {
      const paid = paidByInvoice.get(inv.id) || 0
      const balance = roundMoney(Math.max(0, inv.total - paid))
      if (balance > 0) {
        totalOutstanding += balance
        unpaidCount++
        if (inv.status === 'Overdue') {
          overdueCount++
        }
      }
    })

    totalOutstanding = roundMoney(totalOutstanding)
    const netCash = roundMoney(totalReceived - totalExpenses)

    return {
      totalReceived,
      totalOutstanding,
      totalExpenses,
      netCash,
      unpaidCount,
      overdueCount
    }
  }, [payments, expenses, invoices])

  const handleNewInvoiceClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    sounds.playClick()
    if (onOpenFinance) {
      onOpenFinance()
    }
    setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent('superdash_finance_action', { detail: { action: 'new_invoice' } })
      )
    }, 150)
  }

  const handleWidgetClick = () => {
    sounds.playClick()
    if (onOpenFinance) {
      onOpenFinance()
    }
  }

  return (
    <div
      onClick={handleWidgetClick}
      className="liquid-glass rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 flex flex-col justify-between shadow-xl w-full max-w-full h-full relative group select-none cursor-pointer"
    >
      <div className="glass-specular" />

      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-white/10 relative z-10">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
          <Wallet className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="truncate">Finance</span>
        </div>

        <div className="flex items-center gap-1.5">
          {stats.overdueCount > 0 ? (
            <span
              className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1 font-semibold animate-pulse"
              title={`${stats.overdueCount} overdue invoice(s)`}
            >
              <AlertCircle className="w-2.5 h-2.5 text-rose-400" />
              {stats.overdueCount} Overdue
            </span>
          ) : stats.unpaidCount > 0 ? (
            <span
              className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1 font-medium"
              title={`${stats.unpaidCount} unpaid invoice(s)`}
            >
              <Clock className="w-2.5 h-2.5 text-amber-400" />
              {stats.unpaidCount} Pending
            </span>
          ) : (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium">
              Up to date
            </span>
          )}

          {onOpenFinance && (
            <button
              onClick={e => {
                e.stopPropagation()
                sounds.playClick()
                onOpenFinance()
              }}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
              title="Open full Finance app"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 3 Simple Metrics: Total Received, Total Pending, Total Expenses */}
      <div className="space-y-2 relative z-10 my-2.5 flex-1 flex flex-col justify-center">
        {/* 1. Total Received */}
        <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-lg bg-emerald-500/20 text-emerald-400">
              <ArrowDownLeft className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-semibold text-emerald-300">Total Received</span>
          </div>
          <span className="text-sm sm:text-base font-bold text-white font-mono">
            {formatMoney(stats.totalReceived, currency)}
          </span>
        </div>

        {/* 2. Total Pending */}
        <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-lg bg-amber-500/20 text-amber-400">
              <Clock className="w-3.5 h-3.5" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-amber-300">Total Pending</span>
              {stats.unpaidCount > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-200">
                  {stats.unpaidCount}
                </span>
              )}
            </div>
          </div>
          <span className="text-sm sm:text-base font-bold text-white font-mono">
            {formatMoney(stats.totalOutstanding, currency)}
          </span>
        </div>

        {/* 3. Total Expenses */}
        <div className="p-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-lg bg-rose-500/20 text-rose-400">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-semibold text-rose-300">Total Expenses</span>
          </div>
          <span className="text-sm sm:text-base font-bold text-white font-mono">
            {formatMoney(stats.totalExpenses, currency)}
          </span>
        </div>
      </div>

      {/* Footer Quick Action */}
      <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-slate-400 relative z-10">
        <button
          onClick={handleNewInvoiceClick}
          className="text-[11px] font-medium px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30 transition flex items-center gap-1"
        >
          <Plus className="w-3 h-3" />
          <span>New Invoice</span>
        </button>

        {onOpenFinance && (
          <button
            onClick={e => {
              e.stopPropagation()
              sounds.playClick()
              onOpenFinance()
            }}
            className="text-[11px] text-emerald-400 hover:text-emerald-300 font-medium hover:underline flex items-center gap-1"
          >
            <span>Open Finance</span>
            <span>&rarr;</span>
          </button>
        )}
      </div>
    </div>
  )
}
