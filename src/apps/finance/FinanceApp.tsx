import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  Client,
  Invoice,
  InvoiceItem,
  InvoiceStatus,
  Payment,
  PaymentMethod,
  Expense,
  FinanceBusinessSettings,
  AppWindowProps
} from '@/types'
import {
  financeService,
  roundMoney,
  formatMoney,
  DateRangeFilter,
  exportInvoicesToCSV,
  exportPaymentsToCSV,
  exportExpensesToCSV
} from '@/services/finance'
import GlassPanel from '@/components/LiquidGlass/GlassPanel'
import GlassButton from '@/components/LiquidGlass/GlassButton'
import GlassModal from '@/components/LiquidGlass/GlassModal'
import AppHeader from '@/components/AppWindow/AppHeader'
import { sounds } from '@/utils/sound'
import { cn } from '@/utils/cn'
import { toLocalYYYYMMDD } from '@/utils/date'
import {
  DollarSign,
  Plus,
  Receipt,
  Users,
  CreditCard,
  TrendingDown,
  TrendingUp,
  FileText,
  Calendar,
  Search,
  Filter,
  Download,
  Printer,
  X,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  Building,
  Mail,
  Phone,
  Trash2,
  Edit2,
  Archive,
  Sliders,
  Wallet,
  Settings as SettingsIcon,
  ChevronRight,
  BarChart3,
  LayoutGrid,
  List,
  MoreVertical
} from 'lucide-react'

type TabView = 'overview' | 'invoices' | 'clients' | 'payments' | 'expenses' | 'settings'

const EXPENSE_CATEGORIES = [
  'Office',
  'Government Fees',
  'Transport',
  'Software',
  'Subscriptions',
  'Marketing',
  'Professional Fees',
  'Utilities',
  'Other'
]

const PAYMENT_METHODS: PaymentMethod[] = [
  'Bank Transfer',
  'Card',
  'Cash',
  'Cheque',
  'Other'
]

type ClientSortOption = 'name' | 'highest_invoiced' | 'highest_outstanding' | 'recently_added'
type ClientViewMode = 'grid' | 'list'

function getClientInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'CL'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

interface FinanceAppProps extends Partial<AppWindowProps> {
  initialInvoiceId?: string
  initialClientId?: string
}

export default function FinanceApp({ initialInvoiceId, initialClientId }: FinanceAppProps) {
  const [activeTab, setActiveTab] = useState<TabView>('overview')
  const [dateFilter, setDateFilter] = useState<DateRangeFilter>('this_month')

  // Data states
  const [clients, setClients] = useState<Client[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [settings, setSettings] = useState<FinanceBusinessSettings | null>(null)
  const [loading, setLoading] = useState(true)

  // Modals
  const [isNewInvoiceOpen, setIsNewInvoiceOpen] = useState(false)
  const [isNewClientOpen, setIsNewClientOpen] = useState(false)
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false)
  const [isNewExpenseOpen, setIsNewExpenseOpen] = useState(false)
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null)
  const [previewReceipt, setPreviewReceipt] = useState<Payment | null>(null)
  const [viewClient, setViewClient] = useState<Client | null>(null)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)

  // Filters & Searches
  const [invoiceSearch, setInvoiceSearch] = useState('')
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState<string>('all')
  const [clientSearch, setClientSearch] = useState('')
  const [clientSort, setClientSort] = useState<ClientSortOption>('name')
  const [clientViewMode, setClientViewMode] = useState<ClientViewMode>(() => {
    try {
      return (localStorage.getItem('superdash_client_view_mode') as ClientViewMode) || 'grid'
    } catch {
      return 'grid'
    }
  })
  const [activeMenuClientId, setActiveMenuClientId] = useState<string | null>(null)
  const [expenseCategoryFilter, setExpenseCategoryFilter] = useState<string>('all')

  // Deep linking support
  useEffect(() => {
    if (initialInvoiceId && invoices.length > 0) {
      const inv = invoices.find(
        i => i.id === initialInvoiceId || i.invoiceNumber.toLowerCase() === initialInvoiceId.toLowerCase()
      )
      if (inv) {
        setPreviewInvoice(inv)
        setActiveTab('invoices')
      }
    } else if (initialClientId && clients.length > 0) {
      const c = clients.find(c => c.id === initialClientId)
      if (c) {
        setViewClient(c)
        setActiveTab('clients')
      }
    }
  }, [initialInvoiceId, initialClientId, invoices, clients])

  // Close context menus on window click
  useEffect(() => {
    const handleClickOutside = () => setActiveMenuClientId(null)
    window.addEventListener('click', handleClickOutside)
    return () => window.removeEventListener('click', handleClickOutside)
  }, [])

  const handleSetClientViewMode = (mode: ClientViewMode) => {
    sounds.playClick()
    setClientViewMode(mode)
    try {
      localStorage.setItem('superdash_client_view_mode', mode)
    } catch {}
  }

  // --- FORM STATES: NEW INVOICE ---
  const [invNumber, setInvNumber] = useState('')
  const [invClientId, setInvClientId] = useState('')
  const [invDate, setInvDate] = useState(toLocalYYYYMMDD())
  const [invDueDate, setInvDueDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 14)
    return toLocalYYYYMMDD(d)
  })
  const [invCurrency, setInvCurrency] = useState('AED')
  const [invItems, setInvItems] = useState<InvoiceItem[]>([
    { id: 'item-1', description: '', quantity: 1, rate: 0, amount: 0 }
  ])
  const [invDiscount, setInvDiscount] = useState(0)
  const [invTaxRate, setInvTaxRate] = useState(5)
  const [invNotes, setInvNotes] = useState('Thank you for your business. Payment due within 14 days.')

  // --- FORM STATES: CLIENT ---
  const [clientName, setClientName] = useState('')
  const [clientCompany, setClientCompany] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [clientAddress, setClientAddress] = useState('')
  const [clientTaxNumber, setClientTaxNumber] = useState('')
  const [clientNotes, setClientNotes] = useState('')

  // --- FORM STATES: RECORD PAYMENT ---
  const [payInvoiceId, setPayInvoiceId] = useState('')
  const [payAmount, setPayAmount] = useState<number>(0)
  const [payDate, setPayDate] = useState(toLocalYYYYMMDD())
  const [payMethod, setPayMethod] = useState<PaymentMethod>('Bank Transfer')
  const [payRef, setPayRef] = useState('')
  const [payNotes, setPayNotes] = useState('')

  // --- FORM STATES: EXPENSE ---
  const [expDate, setExpDate] = useState(toLocalYYYYMMDD())
  const [expCategory, setExpCategory] = useState('Office')
  const [expDesc, setExpDesc] = useState('')
  const [expAmount, setExpAmount] = useState<number>(0)
  const [expMethod, setExpMethod] = useState('Card')
  const [expVendor, setExpVendor] = useState('')
  const [expRef, setExpRef] = useState('')
  const [expNotes, setExpNotes] = useState('')

  // --- FORM STATES: SETTINGS ---
  const [settBusinessName, setSettBusinessName] = useState('')
  const [settArabicName, setSettArabicName] = useState('')
  const [settAddress, setSettAddress] = useState('')
  const [settPhone, setSettPhone] = useState('')
  const [settEmail, setSettEmail] = useState('')
  const [settTaxNumber, setSettTaxNumber] = useState('')
  const [settCurrency, setSettCurrency] = useState('AED')
  const [settVatRate, setSettVatRate] = useState(5)
  const [settPrefix, setSettPrefix] = useState('2026/')

  // Load all finance data
  const loadData = useCallback(async () => {
    const [cList, iList, pList, eList, sObj] = await Promise.all([
      financeService.getClients(true),
      financeService.getInvoices(),
      financeService.getPayments(),
      financeService.getExpenses(),
      financeService.getSettings()
    ])
    setClients(cList)
    setInvoices(iList)
    setPayments(pList)
    setExpenses(eList)
    setSettings(sObj)

    // Pre-populate settings form
    setSettBusinessName(sObj.businessName)
    setSettArabicName(sObj.arabicBusinessName || '')
    setSettAddress(sObj.address)
    setSettPhone(sObj.phone)
    setSettEmail(sObj.email)
    setSettTaxNumber(sObj.taxNumber || '')
    setSettCurrency(sObj.defaultCurrency)
    setSettVatRate(sObj.defaultVatRate)
    setSettPrefix(sObj.invoicePrefix)

    setLoading(false)
  }, [])

  useEffect(() => {
    loadData()
    const unsubscribe = financeService.subscribe(() => {
      loadData()
    })
    return () => unsubscribe()
  }, [loadData])

  // Client map for quick name lookups
  const clientMap = useMemo(() => {
    return new Map(clients.map(c => [c.id, c]))
  }, [clients])

  // Calculated Overview Statistics
  const overviewStats = useMemo(() => {
    const activeInvoices = invoices.filter(i => i.status !== 'Cancelled')

    let totalInvoiced = 0
    activeInvoices.forEach(i => {
      totalInvoiced += i.total
    })
    totalInvoiced = roundMoney(totalInvoiced)

    let totalReceived = 0
    payments.forEach(p => {
      totalReceived += p.amount
    })
    totalReceived = roundMoney(totalReceived)

    let totalExpenses = 0
    expenses.forEach(e => {
      totalExpenses += e.amount
    })
    totalExpenses = roundMoney(totalExpenses)

    const netCashIncome = roundMoney(totalReceived - totalExpenses)

    let outstanding = 0
    let unpaidCount = 0
    let overdueCount = 0

    activeInvoices.forEach(inv => {
      const invPayments = payments.filter(p => p.invoiceId === inv.id)
      const paid = roundMoney(invPayments.reduce((acc, p) => acc + p.amount, 0))
      const bal = roundMoney(Math.max(0, inv.total - paid))
      if (bal > 0) {
        outstanding += bal
        unpaidCount++
        if (inv.status === 'Overdue') {
          overdueCount++
        }
      }
    })
    outstanding = roundMoney(outstanding)

    return {
      totalInvoiced,
      totalReceived,
      totalExpenses,
      netCashIncome,
      outstanding,
      unpaidCount,
      overdueCount
    }
  }, [invoices, payments, expenses])

  // Recent Activity Feed
  const recentActivities = useMemo(() => {
    const list: Array<{
      id: string
      type: 'payment' | 'invoice' | 'expense'
      title: string
      subtitle: string
      date: string
      amount: number
      currency: string
    }> = []

    payments.slice(0, 5).forEach(p => {
      const client = clientMap.get(p.clientId)
      list.push({
        id: `act-pay-${p.id}`,
        type: 'payment',
        title: `Payment Received: ${p.receiptNumber}`,
        subtitle: `${client?.name || client?.companyName || 'Client'} • via ${p.paymentMethod}`,
        date: p.paymentDate,
        amount: p.amount,
        currency: p.currency
      })
    })

    invoices.slice(0, 5).forEach(i => {
      const client = clientMap.get(i.clientId)
      list.push({
        id: `act-inv-${i.id}`,
        type: 'invoice',
        title: `Invoice Issued: ${i.invoiceNumber}`,
        subtitle: `${client?.name || client?.companyName || 'Client'} • Status: ${i.status}`,
        date: i.invoiceDate,
        amount: i.total,
        currency: i.currency
      })
    })

    expenses.slice(0, 5).forEach(e => {
      list.push({
        id: `act-exp-${e.id}`,
        type: 'expense',
        title: `Expense: ${e.description}`,
        subtitle: `${e.category}${e.vendor ? ` • ${e.vendor}` : ''}`,
        date: e.date,
        amount: e.amount,
        currency: e.currency
      })
    })

    return list.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6)
  }, [payments, invoices, expenses, clientMap])

  // --- ACTIONS: INVOICE ---
  const handleOpenNewInvoice = async () => {
    sounds.playClick()
    const nextNum = await financeService.getNextInvoiceNumber()
    setInvNumber(nextNum)
    setInvClientId(clients[0]?.id || '')
    setInvDate(toLocalYYYYMMDD())
    const d = new Date()
    d.setDate(d.getDate() + 14)
    setInvDueDate(toLocalYYYYMMDD(d))
    setInvCurrency(settings?.defaultCurrency || 'AED')
    setInvItems([{ id: 'item-1', description: '', quantity: 1, rate: 0, amount: 0 }])
    setInvDiscount(0)
    setInvTaxRate(settings?.defaultVatRate || 5)
    setInvNotes('Thank you for your business. Payment due within 14 days.')
    setIsNewInvoiceOpen(true)
  }

  const handleAddItem = () => {
    sounds.playClick()
    setInvItems(prev => [
      ...prev,
      { id: `item-${Date.now()}`, description: '', quantity: 1, rate: 0, amount: 0 }
    ])
  }

  const handleUpdateItem = (id: string, field: 'description' | 'quantity' | 'rate', value: string | number) => {
    setInvItems(prev =>
      prev.map(it => {
        if (it.id !== id) return it
        const updated = { ...it, [field]: value }
        if (field === 'quantity' || field === 'rate') {
          const q = Number(field === 'quantity' ? value : it.quantity) || 0
          const r = Number(field === 'rate' ? value : it.rate) || 0
          updated.amount = roundMoney(q * r)
        }
        return updated
      })
    )
  }

  const handleRemoveItem = (id: string) => {
    sounds.playClick()
    if (invItems.length <= 1) return
    setInvItems(prev => prev.filter(it => it.id !== id))
  }

  // Calculated Invoice Form Totals
  const formSubtotal = useMemo(() => {
    return roundMoney(invItems.reduce((acc, it) => acc + (it.amount || 0), 0))
  }, [invItems])

  const formTaxAmount = useMemo(() => {
    const discounted = Math.max(0, formSubtotal - invDiscount)
    return roundMoney((discounted * invTaxRate) / 100)
  }, [formSubtotal, invDiscount, invTaxRate])

  const formTotal = useMemo(() => {
    return roundMoney(Math.max(0, formSubtotal - invDiscount) + formTaxAmount)
  }, [formSubtotal, invDiscount, formTaxAmount])

  const handleSaveInvoice = async () => {
    if (!invClientId || !invNumber.trim() || formTotal <= 0) {
      sounds.playError()
      return
    }

    sounds.playSuccess()
    await financeService.createInvoice({
      invoiceNumber: invNumber.trim(),
      clientId: invClientId,
      invoiceDate: invDate,
      dueDate: invDueDate,
      currency: invCurrency,
      items: invItems.filter(i => i.description.trim() !== ''),
      subtotal: formSubtotal,
      discount: invDiscount,
      taxRate: invTaxRate,
      taxAmount: formTaxAmount,
      total: formTotal,
      status: 'Issued',
      notes: invNotes.trim()
    })

    setIsNewInvoiceOpen(false)
  }

  // --- ACTIONS: CLIENT ---
  const handleOpenNewClient = () => {
    sounds.playClick()
    setClientName('')
    setClientCompany('')
    setClientPhone('')
    setClientEmail('')
    setClientAddress('')
    setClientTaxNumber('')
    setClientNotes('')
    setEditingClient(null)
    setIsNewClientOpen(true)
  }

  const handleOpenEditClient = (c: Client) => {
    sounds.playClick()
    setEditingClient(c)
    setClientName(c.name)
    setClientCompany(c.companyName || '')
    setClientPhone(c.phone || '')
    setClientEmail(c.email || '')
    setClientAddress(c.address || '')
    setClientTaxNumber(c.taxNumber || '')
    setClientNotes(c.notes || '')
    setIsNewClientOpen(true)
  }

  const handleSaveClient = async () => {
    if (!clientName.trim()) {
      sounds.playError()
      return
    }

    sounds.playSuccess()
    if (editingClient) {
      await financeService.updateClient(editingClient.id, {
        name: clientName.trim(),
        companyName: clientCompany.trim(),
        phone: clientPhone.trim(),
        email: clientEmail.trim(),
        address: clientAddress.trim(),
        taxNumber: clientTaxNumber.trim(),
        notes: clientNotes.trim()
      })
    } else {
      await financeService.createClient({
        name: clientName.trim(),
        companyName: clientCompany.trim(),
        phone: clientPhone.trim(),
        email: clientEmail.trim(),
        address: clientAddress.trim(),
        taxNumber: clientTaxNumber.trim(),
        notes: clientNotes.trim(),
        isArchived: false
      })
    }
    setIsNewClientOpen(false)
  }

  const handleArchiveClient = async (c: Client) => {
    sounds.playClick()
    if (c.isArchived) {
      await financeService.updateClient(c.id, { isArchived: false })
    } else {
      await financeService.archiveClient(c.id)
    }
    if (viewClient?.id === c.id) {
      setViewClient(null)
    }
  }

  const handleDeleteClient = async (c: Client) => {
    sounds.playClick()
    const confirmDelete = window.confirm(`Are you sure you want to delete client "${c.name}"?`)
    if (!confirmDelete) return

    const res = await financeService.deleteClient(c.id)
    if (!res.success) {
      alert(res.reason)
      return
    }
    sounds.playSuccess()
    if (viewClient?.id === c.id) {
      setViewClient(null)
    }
  }

  // --- ACTIONS: RECORD PAYMENT ---
  const handleOpenRecordPayment = (inv?: Invoice) => {
    sounds.playClick()
    const targetInv = inv || invoices.find(i => i.status !== 'Paid' && i.status !== 'Cancelled') || invoices[0]
    setPayInvoiceId(targetInv ? targetInv.id : '')

    if (targetInv) {
      const invPayments = payments.filter(p => p.invoiceId === targetInv.id)
      const paid = roundMoney(invPayments.reduce((acc, p) => acc + p.amount, 0))
      const bal = roundMoney(Math.max(0, targetInv.total - paid))
      setPayAmount(bal)
    } else {
      setPayAmount(0)
    }

    setPayDate(toLocalYYYYMMDD())
    setPayMethod('Bank Transfer')
    setPayRef('')
    setPayNotes('')
    setIsRecordPaymentOpen(true)
  }

  const handleSavePayment = async () => {
    if (!payInvoiceId || payAmount <= 0) {
      sounds.playError()
      return
    }

    const inv = invoices.find(i => i.id === payInvoiceId)
    if (!inv) return

    sounds.playSuccess()
    const nextReceiptNum = await financeService.getNextReceiptNumber()
    const payment = await financeService.recordPayment({
      receiptNumber: nextReceiptNum,
      invoiceId: inv.id,
      clientId: inv.clientId,
      amount: roundMoney(payAmount),
      currency: inv.currency,
      paymentDate: payDate,
      paymentMethod: payMethod,
      reference: payRef.trim(),
      notes: payNotes.trim()
    })

    setIsRecordPaymentOpen(false)
    setPreviewReceipt(payment)
  }

  // --- ACTIONS: EXPENSE ---
  const handleOpenNewExpense = () => {
    sounds.playClick()
    setExpDate(toLocalYYYYMMDD())
    setExpCategory('Office')
    setExpDesc('')
    setExpAmount(0)
    setExpMethod('Card')
    setExpVendor('')
    setExpRef('')
    setExpNotes('')
    setEditingExpense(null)
    setIsNewExpenseOpen(true)
  }

  const handleSaveExpense = async () => {
    if (!expDesc.trim() || expAmount <= 0) {
      sounds.playError()
      return
    }

    sounds.playSuccess()
    if (editingExpense) {
      await financeService.updateExpense(editingExpense.id, {
        date: expDate,
        category: expCategory,
        description: expDesc.trim(),
        amount: roundMoney(expAmount),
        paymentMethod: expMethod,
        vendor: expVendor.trim(),
        reference: expRef.trim(),
        notes: expNotes.trim()
      })
    } else {
      await financeService.createExpense({
        date: expDate,
        category: expCategory,
        description: expDesc.trim(),
        amount: roundMoney(expAmount),
        currency: settings?.defaultCurrency || 'AED',
        paymentMethod: expMethod,
        vendor: expVendor.trim(),
        reference: expRef.trim(),
        notes: expNotes.trim()
      })
    }
    setIsNewExpenseOpen(false)
  }

  // Listen for custom window action events from Command Palette or Universal Search
  useEffect(() => {
    const handleAction = async (e: Event) => {
      const custom = e as CustomEvent<{
        action?: string
        tab?: TabView
        filter?: string
        invoiceId?: string
      }>
      if (custom.detail) {
        if (custom.detail.tab) {
          setActiveTab(custom.detail.tab)
        }
        if (custom.detail.filter) {
          setInvoiceStatusFilter(custom.detail.filter)
        }
        if (custom.detail.action === 'new_invoice') {
          handleOpenNewInvoice()
        } else if (custom.detail.action === 'add_client') {
          handleOpenNewClient()
        } else if (custom.detail.action === 'record_payment') {
          handleOpenRecordPayment()
        } else if (custom.detail.action === 'add_expense') {
          handleOpenNewExpense()
        } else if (custom.detail.action === 'view_invoice' && custom.detail.invoiceId) {
          const allInvoices = await financeService.getInvoices()
          const found = allInvoices.find(
            i => i.id === custom.detail?.invoiceId || i.invoiceNumber === custom.detail?.invoiceId
          )
          if (found) {
            setPreviewInvoice(found)
          }
        }
      }
    }
    window.addEventListener('superdash_finance_action', handleAction)
    return () => window.removeEventListener('superdash_finance_action', handleAction)
  }, [])

  // --- ACTIONS: SAVE SETTINGS ---
  const handleSaveSettings = async () => {
    sounds.playSuccess()
    await financeService.updateSettings({
      businessName: settBusinessName.trim() || 'My Business',
      arabicBusinessName: settArabicName.trim(),
      address: settAddress.trim(),
      phone: settPhone.trim(),
      email: settEmail.trim(),
      taxNumber: settTaxNumber.trim(),
      defaultCurrency: settCurrency.trim() || 'AED',
      defaultVatRate: settVatRate,
      invoicePrefix: settPrefix.trim() || '2026/'
    })
  }

  // Filtered Invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      const client = clientMap.get(inv.clientId)
      const q = invoiceSearch.toLowerCase().trim()
      if (q) {
        const matchesNum = inv.invoiceNumber.toLowerCase().includes(q)
        const matchesClient = (client?.name || '').toLowerCase().includes(q)
        const matchesCompany = (client?.companyName || '').toLowerCase().includes(q)
        const matchesDesc = inv.items.some(it => it.description.toLowerCase().includes(q))
        const matchesStatus = inv.status.toLowerCase().includes(q)
        if (!matchesNum && !matchesClient && !matchesCompany && !matchesDesc && !matchesStatus) {
          return false
        }
      }

      if (invoiceStatusFilter !== 'all' && inv.status !== invoiceStatusFilter) {
        return false
      }

      return true
    })
  }, [invoices, invoiceSearch, invoiceStatusFilter, clientMap])

  // Pre-aggregated Client Financial Metrics (Invoiced, Paid, Outstanding, Status)
  const clientFinancialMap = useMemo(() => {
    // Pre-aggregate payments by client
    const paymentsByClient = new Map<string, number>()
    payments.forEach(p => {
      paymentsByClient.set(p.clientId, roundMoney((paymentsByClient.get(p.clientId) || 0) + (p.amount || 0)))
    })

    // Pre-aggregate invoices by client
    const invoicedByClient = new Map<string, number>()
    invoices
      .filter(i => i.status !== 'Cancelled')
      .forEach(i => {
        invoicedByClient.set(i.clientId, roundMoney((invoicedByClient.get(i.clientId) || 0) + (i.total || 0)))
      })

    const map = new Map<
      string,
      {
        invoiced: number
        paid: number
        balance: number
        status: 'NO INVOICES' | 'CLEAR' | 'OUTSTANDING'
      }
    >()

    clients.forEach(c => {
      const invoiced = invoicedByClient.get(c.id) || 0
      const paid = paymentsByClient.get(c.id) || 0
      const balance = roundMoney(Math.max(0, invoiced - paid))

      let status: 'NO INVOICES' | 'CLEAR' | 'OUTSTANDING' = 'NO INVOICES'
      if (invoiced === 0) {
        status = 'NO INVOICES'
      } else if (balance <= 0) {
        status = 'CLEAR'
      } else {
        status = 'OUTSTANDING'
      }

      map.set(c.id, { invoiced, paid, balance, status })
    })

    return map
  }, [clients, invoices, payments])

  // Summary strip totals for all active clients
  const clientsSummary = useMemo(() => {
    const activeClients = clients.filter(c => !c.isArchived)
    let totalInvoiced = 0
    let totalReceived = 0
    let totalOutstanding = 0

    activeClients.forEach(c => {
      const m = clientFinancialMap.get(c.id)
      if (m) {
        totalInvoiced += m.invoiced
        totalReceived += m.paid
        totalOutstanding += m.balance
      }
    })

    return {
      totalCount: activeClients.length,
      totalInvoiced: roundMoney(totalInvoiced),
      totalReceived: roundMoney(totalReceived),
      totalOutstanding: roundMoney(totalOutstanding)
    }
  }, [clients, clientFinancialMap])

  // Filtered & Sorted Clients
  const filteredClients = useMemo(() => {
    const q = clientSearch.toLowerCase().trim()
    const list = clients.filter(c => {
      if (!q) return true
      return (
        c.name.toLowerCase().includes(q) ||
        (c.companyName && c.companyName.toLowerCase().includes(q)) ||
        (c.phone && c.phone.includes(q)) ||
        (c.email && c.email.toLowerCase().includes(q)) ||
        (c.taxNumber && c.taxNumber.toLowerCase().includes(q))
      )
    })

    return list.sort((a, b) => {
      if (clientSort === 'name') {
        return a.name.localeCompare(b.name)
      }
      if (clientSort === 'highest_invoiced') {
        const invA = clientFinancialMap.get(a.id)?.invoiced || 0
        const invB = clientFinancialMap.get(b.id)?.invoiced || 0
        return invB - invA
      }
      if (clientSort === 'highest_outstanding') {
        const balA = clientFinancialMap.get(a.id)?.balance || 0
        const balB = clientFinancialMap.get(b.id)?.balance || 0
        return balB - balA
      }
      if (clientSort === 'recently_added') {
        return (b.createdAt || 0) - (a.createdAt || 0)
      }
      return 0
    })
  }, [clients, clientSearch, clientSort, clientFinancialMap])

  // Filtered Expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => {
      if (expenseCategoryFilter !== 'all' && e.category !== expenseCategoryFilter) {
        return false
      }
      return true
    })
  }, [expenses, expenseCategoryFilter])

  return (
    <div className="h-full flex flex-col bg-slate-950/40 text-slate-100 overflow-hidden select-none">
      {/* Standard AppHeader */}
      <AppHeader
        title="Finance"
        subtitle="Practice billing, cashflow, invoices & receivables"
        icon={Wallet}
        gradient="from-emerald-500 to-teal-600"
        primaryAction={{
          label: 'New Invoice',
          icon: Plus,
          onClick: handleOpenNewInvoice
        }}
        secondaryAction={{
          label: 'Record Payment',
          icon: CreditCard,
          onClick: () => handleOpenRecordPayment()
        }}
      >
        <GlassButton
          variant="ghost"
          size="sm"
          onClick={handleOpenNewExpense}
          title="Record an expense"
        >
          <TrendingDown className="w-3.5 h-3.5 mr-1 text-rose-400" />
          <span className="hidden sm:inline">Add Expense</span>
        </GlassButton>
      </AppHeader>

      {/* Tab Navigation Strip */}
      <div className="px-3 sm:px-6 py-2 border-b border-white/10 shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white/[0.02]">
        <div className="flex items-center gap-1 p-1 rounded-2xl bg-white/[0.04] border border-white/10 overflow-x-auto no-scrollbar w-full sm:w-auto">
          {(
            [
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'invoices', label: 'Invoices', icon: FileText },
              { id: 'clients', label: 'Clients', icon: Users },
              { id: 'payments', label: 'Payments', icon: CreditCard },
              { id: 'expenses', label: 'Expenses', icon: TrendingDown },
              { id: 'settings', label: 'Settings', icon: SettingsIcon }
            ] as const
          ).map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => {
                  sounds.playClick()
                  setActiveTab(tab.id)
                }}
                className={cn(
                  'px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0',
                  activeTab === tab.id
                    ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Date Range Selector for Overview */}
        {activeTab === 'overview' && (
          <div className="flex items-center gap-1.5 text-xs self-end sm:self-auto">
            <Calendar className="w-3.5 h-3.5 text-slate-400 hidden sm:inline" />
            <select
              value={dateFilter}
              onChange={e => {
                sounds.playClick()
                setDateFilter(e.target.value as DateRangeFilter)
              }}
              className="bg-white/[0.06] border border-white/10 text-slate-200 rounded-xl px-2.5 py-1 text-xs focus:outline-none focus:border-emerald-400/50"
            >
              <option value="today" className="bg-slate-900">Today</option>
              <option value="this_week" className="bg-slate-900">This Week</option>
              <option value="this_month" className="bg-slate-900">This Month</option>
              <option value="this_quarter" className="bg-slate-900">This Quarter</option>
              <option value="this_year" className="bg-slate-900">This Year</option>
              <option value="all_time" className="bg-slate-900">All Time</option>
            </select>
          </div>
        )}
      </div>

      {/* Main Tab Views */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center gap-3 text-slate-400">
            <Wallet className="w-8 h-8 animate-pulse text-emerald-400" />
            <span className="text-sm">Calculating financial records...</span>
          </div>
        ) : activeTab === 'overview' ? (
          /* ==================== 1. OVERVIEW SCREEN ==================== */
          <div className="space-y-6">
            {/* 3 Simple Primary Financial Indicator Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
              {/* 1. TOTAL RECEIVED */}
              <GlassPanel intensity="subtle" className="p-5 md:p-6 space-y-2 border-emerald-500/30 bg-emerald-500/[0.08] hover:border-emerald-500/50 transition-all rounded-3xl relative overflow-hidden group">
                <div className="glass-specular" />
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-300 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <div className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-400">
                      <ArrowDownLeft className="w-4 h-4" />
                    </div>
                    Total Received
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium">
                    Cash In
                  </span>
                </div>
                <div className="text-2xl md:text-3xl font-extrabold text-white font-mono tracking-tight pt-1">
                  {formatMoney(overviewStats.totalReceived)}
                </div>
                <div className="text-xs text-slate-400">Collected cash payments</div>
              </GlassPanel>

              {/* 2. TOTAL PENDING */}
              <GlassPanel
                intensity="subtle"
                onClick={() => {
                  sounds.playClick()
                  setActiveTab('invoices')
                  setInvoiceStatusFilter('unpaid')
                }}
                className="p-5 md:p-6 space-y-2 border-amber-500/30 bg-amber-500/[0.08] hover:border-amber-500/50 transition-all rounded-3xl relative overflow-hidden group cursor-pointer"
              >
                <div className="glass-specular" />
                <div className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <div className="p-1.5 rounded-xl bg-amber-500/20 text-amber-400">
                      <Clock className="w-4 h-4" />
                    </div>
                    Total Pending
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-200 border border-amber-500/30 font-medium">
                    {overviewStats.unpaidCount} invoice{overviewStats.unpaidCount === 1 ? '' : 's'}
                  </span>
                </div>
                <div className="text-2xl md:text-3xl font-extrabold text-white font-mono tracking-tight pt-1">
                  {formatMoney(overviewStats.outstanding)}
                </div>
                <div className="text-xs text-slate-400 flex items-center justify-between">
                  <span>Unpaid receivables</span>
                  <span className="text-amber-300 hover:underline text-[11px]">View invoices &rarr;</span>
                </div>
              </GlassPanel>

              {/* 3. TOTAL EXPENSES */}
              <GlassPanel
                intensity="subtle"
                onClick={() => {
                  sounds.playClick()
                  setActiveTab('expenses')
                }}
                className="p-5 md:p-6 space-y-2 border-rose-500/30 bg-rose-500/[0.08] hover:border-rose-500/50 transition-all rounded-3xl relative overflow-hidden group cursor-pointer"
              >
                <div className="glass-specular" />
                <div className="text-xs font-bold uppercase tracking-wider text-rose-300 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <div className="p-1.5 rounded-xl bg-rose-500/20 text-rose-400">
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                    Total Expenses
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-medium">
                    Cash Out
                  </span>
                </div>
                <div className="text-2xl md:text-3xl font-extrabold text-white font-mono tracking-tight pt-1">
                  {formatMoney(overviewStats.totalExpenses)}
                </div>
                <div className="text-xs text-slate-400 flex items-center justify-between">
                  <span>Operational costs</span>
                  <span className="text-rose-300 hover:underline text-[11px]">View expenses &rarr;</span>
                </div>
              </GlassPanel>
            </div>

            {/* Income vs Expenses Visual Bar Overview */}
            <GlassPanel intensity="subtle" className="p-4 md:p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm md:text-base font-bold text-white flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-emerald-400" />
                    Income vs Expenses Cashflow
                  </h3>
                  <p className="text-xs text-slate-400">
                    Calculated cash comparison for the current operational period
                  </p>
                </div>
                <div className="text-right text-xs font-mono text-slate-300">
                  <span className="text-emerald-400 font-semibold mr-3">● Received Income</span>
                  <span className="text-rose-400 font-semibold">● Expenses</span>
                </div>
              </div>

              {/* Proportional visual comparison bar */}
              <div className="space-y-2">
                <div className="h-6 w-full rounded-xl bg-white/[0.05] p-1 flex items-center overflow-hidden border border-white/10 gap-1">
                  <div
                    style={{
                      width: `${Math.max(
                        10,
                        (overviewStats.totalReceived /
                          (overviewStats.totalReceived + overviewStats.totalExpenses || 1)) *
                          100
                      )}%`
                    }}
                    className="h-full rounded-lg bg-emerald-500/80 transition-all duration-500 flex items-center justify-center text-[10px] text-slate-950 font-bold"
                  >
                    {Math.round(
                      (overviewStats.totalReceived /
                        (overviewStats.totalReceived + overviewStats.totalExpenses || 1)) *
                        100
                    )}%
                  </div>
                  <div
                    style={{
                      width: `${Math.max(
                        10,
                        (overviewStats.totalExpenses /
                          (overviewStats.totalReceived + overviewStats.totalExpenses || 1)) *
                          100
                      )}%`
                    }}
                    className="h-full rounded-lg bg-rose-500/80 transition-all duration-500 flex items-center justify-center text-[10px] text-white font-bold"
                  >
                    {Math.round(
                      (overviewStats.totalExpenses /
                        (overviewStats.totalReceived + overviewStats.totalExpenses || 1)) *
                        100
                    )}%
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs font-mono text-slate-300 pt-1">
                  <div>
                    Received: <strong className="text-emerald-400">{formatMoney(overviewStats.totalReceived)}</strong>
                  </div>
                  <div>
                    Expenses: <strong className="text-rose-400">{formatMoney(overviewStats.totalExpenses)}</strong>
                  </div>
                  <div>
                    Net Margin: <strong className="text-white">{formatMoney(overviewStats.netCashIncome)}</strong>
                  </div>
                </div>
              </div>
            </GlassPanel>

            {/* Recent Financial Activity Feed */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-400" />
                  Recent Financial Activity
                </h3>
                <span className="text-xs text-slate-400">Latest transactions</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {recentActivities.map(act => (
                  <GlassPanel
                    key={act.id}
                    intensity="subtle"
                    className="p-3.5 space-y-2 hover:border-white/20 transition"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            'p-1.5 rounded-lg border text-xs',
                            act.type === 'payment'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                              : act.type === 'invoice'
                              ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                              : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          )}
                        >
                          {act.type === 'payment' ? (
                            <ArrowDownLeft className="w-3.5 h-3.5" />
                          ) : act.type === 'invoice' ? (
                            <FileText className="w-3.5 h-3.5" />
                          ) : (
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          )}
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-white">{act.title}</div>
                          <div className="text-[11px] text-slate-400 truncate max-w-[180px]">
                            {act.subtitle}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div
                          className={cn(
                            'text-xs font-mono font-bold',
                            act.type === 'payment'
                              ? 'text-emerald-400'
                              : act.type === 'invoice'
                              ? 'text-white'
                              : 'text-rose-400'
                          )}
                        >
                          {act.type === 'payment' ? '+' : act.type === 'expense' ? '-' : ''}
                          {formatMoney(act.amount, act.currency)}
                        </div>
                        <div className="text-[10px] text-slate-400">{act.date}</div>
                      </div>
                    </div>
                  </GlassPanel>
                ))}
              </div>
            </div>
          </div>
        ) : activeTab === 'invoices' ? (
          /* ==================== 2. INVOICES SCREEN ==================== */
          <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-1 max-w-md">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={invoiceSearch}
                    onChange={e => setInvoiceSearch(e.target.value)}
                    placeholder="Search invoices (e.g. 2026/1, client name)..."
                    className="w-full pl-8.5 pr-8 py-1.5 rounded-xl bg-white/[0.06] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400/50"
                  />
                  {invoiceSearch && (
                    <button
                      onClick={() => setInvoiceSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <select
                  value={invoiceStatusFilter}
                  onChange={e => setInvoiceStatusFilter(e.target.value)}
                  className="bg-white/[0.06] border border-white/10 text-slate-300 rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:border-emerald-400/50"
                >
                  <option value="all" className="bg-slate-900">All Statuses</option>
                  <option value="Draft" className="bg-slate-900">Draft</option>
                  <option value="Issued" className="bg-slate-900">Issued</option>
                  <option value="Unpaid" className="bg-slate-900">Unpaid</option>
                  <option value="Partially Paid" className="bg-slate-900">Partially Paid</option>
                  <option value="Paid" className="bg-slate-900">Paid</option>
                  <option value="Overdue" className="bg-slate-900">Overdue</option>
                  <option value="Cancelled" className="bg-slate-900">Cancelled</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <GlassButton
                  size="sm"
                  variant="default"
                  onClick={() => exportInvoicesToCSV(filteredInvoices, clients)}
                  title="Export invoices list to CSV"
                >
                  <Download className="w-3.5 h-3.5 mr-1" />
                  <span className="hidden sm:inline">Export CSV</span>
                </GlassButton>

                <GlassButton size="sm" variant="primary" onClick={handleOpenNewInvoice}>
                  <Plus className="w-4 h-4 mr-1" /> New Invoice
                </GlassButton>
              </div>
            </div>

            {/* Invoices Table (Desktop) */}
            <div className="hidden md:block rounded-2xl liquid-glass overflow-hidden border border-white/10">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.03] text-[11px] uppercase tracking-wider text-slate-400 select-none">
                    <th className="py-3 px-4 font-semibold">Invoice</th>
                    <th className="py-3 px-4 font-semibold">Client</th>
                    <th className="py-3 px-4 font-semibold">Date / Due</th>
                    <th className="py-3 px-4 font-semibold font-mono text-right">Total</th>
                    <th className="py-3 px-4 font-semibold font-mono text-right">Paid</th>
                    <th className="py-3 px-4 font-semibold font-mono text-right">Balance</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                    <th className="py-3 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredInvoices.map(inv => {
                    const client = clientMap.get(inv.clientId)
                    const invPayments = payments.filter(p => p.invoiceId === inv.id)
                    const paid = roundMoney(invPayments.reduce((acc, p) => acc + p.amount, 0))
                    const balance = roundMoney(Math.max(0, inv.total - paid))

                    return (
                      <tr key={inv.id} className="hover:bg-white/[0.04] transition group">
                        <td className="py-3.5 px-4 font-mono font-bold text-white">
                          <button
                            onClick={() => {
                              sounds.playClick()
                              setPreviewInvoice(inv)
                            }}
                            className="hover:underline hover:text-emerald-300 text-left"
                            title="Click to preview invoice document"
                          >
                            {inv.invoiceNumber}
                          </button>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-200">
                            {client?.name || 'Unknown Client'}
                          </div>
                          {client?.companyName && (
                            <div className="text-[11px] text-slate-400">{client.companyName}</div>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-slate-300">
                          <div>{inv.invoiceDate}</div>
                          <div className="text-[11px] text-slate-400">Due {inv.dueDate}</div>
                        </td>

                        <td className="py-3.5 px-4 text-right font-mono font-semibold text-white">
                          {formatMoney(inv.total, inv.currency)}
                        </td>

                        <td className="py-3.5 px-4 text-right font-mono text-emerald-400">
                          {formatMoney(paid, inv.currency)}
                        </td>

                        <td className="py-3.5 px-4 text-right font-mono font-bold text-amber-300">
                          {formatMoney(balance, inv.currency)}
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={cn(
                              'text-[10px] px-2 py-0.5 rounded-full border font-semibold',
                              inv.status === 'Paid'
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                : inv.status === 'Partially Paid'
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                : inv.status === 'Overdue'
                                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                                : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                            )}
                          >
                            {inv.status}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {balance > 0 && inv.status !== 'Cancelled' && (
                              <button
                                onClick={() => handleOpenRecordPayment(inv)}
                                className="px-2 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-semibold transition"
                                title="Record payment against this invoice"
                              >
                                Record Pay
                              </button>
                            )}

                            <button
                              onClick={() => {
                                sounds.playClick()
                                setPreviewInvoice(inv)
                              }}
                              className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition"
                              title="Print & PDF Invoice"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Invoices Mobile Cards */}
            <div className="md:hidden space-y-3">
              {filteredInvoices.map(inv => {
                const client = clientMap.get(inv.clientId)
                const invPayments = payments.filter(p => p.invoiceId === inv.id)
                const paid = roundMoney(invPayments.reduce((acc, p) => acc + p.amount, 0))
                const balance = roundMoney(Math.max(0, inv.total - paid))

                return (
                  <GlassPanel key={inv.id} intensity="subtle" className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="font-mono font-bold text-white text-base">
                        {inv.invoiceNumber}
                      </div>
                      <span
                        className={cn(
                          'text-[10px] px-2 py-0.5 rounded-full border font-semibold',
                          inv.status === 'Paid'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : inv.status === 'Partially Paid'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : inv.status === 'Overdue'
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                        )}
                      >
                        {inv.status}
                      </span>
                    </div>

                    <div className="text-xs text-slate-300">
                      <div className="font-semibold">{client?.name || 'Unknown Client'}</div>
                      {client?.companyName && (
                        <div className="text-slate-400">{client.companyName}</div>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-2 py-2 border-y border-white/5 text-xs font-mono">
                      <div>
                        <span className="text-[10px] text-slate-500 block">Total</span>
                        <span className="font-bold text-white">{formatMoney(inv.total, inv.currency)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Paid</span>
                        <span className="text-emerald-400">{formatMoney(paid, inv.currency)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Balance</span>
                        <span className="text-amber-300 font-bold">{formatMoney(balance, inv.currency)}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <button
                        onClick={() => {
                          sounds.playClick()
                          setPreviewInvoice(inv)
                        }}
                        className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                      >
                        <Printer className="w-3.5 h-3.5" /> Preview & Print
                      </button>

                      {balance > 0 && inv.status !== 'Cancelled' && (
                        <GlassButton
                          size="sm"
                          variant="primary"
                          onClick={() => handleOpenRecordPayment(inv)}
                        >
                          Record Pay
                        </GlassButton>
                      )}
                    </div>
                  </GlassPanel>
                )
              })}
            </div>
          </div>
        ) : activeTab === 'clients' ? (
          /* ==================== 3. CLIENTS CRM SECTION ==================== */
          <div className="space-y-4">
            {/* 1. Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg md:text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  CLIENTS
                </h2>
                <p className="text-xs text-slate-400">
                  Manage clients and financial relationships
                </p>
              </div>

              <GlassButton
                size="sm"
                variant="primary"
                onClick={handleOpenNewClient}
                className="self-start sm:self-auto shadow-sm"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                <span>Add Client</span>
              </GlassButton>
            </div>

            {/* 2. Compact Financial Summary Strip */}
            <div className="liquid-glass rounded-2xl p-3 md:p-3.5 border border-white/10 shadow-lg relative overflow-hidden">
              <div className="glass-specular" />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-0 sm:divide-x sm:divide-white/10 text-center">
                <div className="px-2">
                  <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                    CLIENTS
                  </span>
                  <span className="text-base md:text-lg font-extrabold text-white font-mono">
                    {clientsSummary.totalCount}
                  </span>
                </div>

                <div className="px-2">
                  <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                    TOTAL INVOICED
                  </span>
                  <span className="text-base md:text-lg font-extrabold text-white font-mono">
                    {formatMoney(clientsSummary.totalInvoiced)}
                  </span>
                </div>

                <div className="px-2">
                  <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-wider text-emerald-300 block mb-0.5">
                    RECEIVED
                  </span>
                  <span className="text-base md:text-lg font-extrabold text-emerald-400 font-mono">
                    {formatMoney(clientsSummary.totalReceived)}
                  </span>
                </div>

                <div className="px-2">
                  <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-wider text-amber-300 block mb-0.5">
                    OUTSTANDING
                  </span>
                  <span className="text-base md:text-lg font-extrabold text-amber-300 font-mono">
                    {formatMoney(clientsSummary.totalOutstanding)}
                  </span>
                </div>
              </div>
            </div>

            {/* 3. Search Bar, Sort Control, and View Toggle */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Search with subtle 1px visible glass border */}
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={clientSearch}
                  onChange={e => setClientSearch(e.target.value)}
                  placeholder="Search clients by name, company, email or phone..."
                  className="w-full pl-9 pr-9 py-2 rounded-xl bg-white/[0.05] border border-white/15 hover:border-white/25 focus:border-emerald-400/60 text-xs text-white placeholder-slate-400 focus:outline-none transition shadow-inner"
                />
                {clientSearch && (
                  <button
                    onClick={() => setClientSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5"
                    title="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                {/* Sort Dropdown */}
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/[0.05] border border-white/15 text-xs text-slate-300">
                  <Sliders className="w-3 h-3 text-slate-400" />
                  <span className="text-[11px] text-slate-400 hidden md:inline">Sort:</span>
                  <select
                    value={clientSort}
                    onChange={e => setClientSort(e.target.value as ClientSortOption)}
                    className="bg-transparent text-xs text-white focus:outline-none cursor-pointer"
                  >
                    <option value="name" className="bg-slate-900">Name</option>
                    <option value="highest_invoiced" className="bg-slate-900">Highest Invoiced</option>
                    <option value="highest_outstanding" className="bg-slate-900">Highest Outstanding</option>
                    <option value="recently_added" className="bg-slate-900">Recently Added</option>
                  </select>
                </div>

                {/* View Mode Toggle: Grid / List */}
                <div className="flex items-center p-1 rounded-xl bg-white/[0.05] border border-white/15">
                  <button
                    onClick={() => handleSetClientViewMode('grid')}
                    className={cn(
                      'p-1.5 rounded-lg transition-all',
                      clientViewMode === 'grid'
                        ? 'bg-emerald-500/20 text-emerald-300 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    )}
                    title="Grid View (Compact Cards)"
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleSetClientViewMode('list')}
                    className={cn(
                      'p-1.5 rounded-lg transition-all',
                      clientViewMode === 'list'
                        ? 'bg-emerald-500/20 text-emerald-300 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    )}
                    title="List View (Financial Table)"
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* 4. Client Directory (Grid / List / Empty State) */}
            {filteredClients.length === 0 ? (
              <div className="py-16 text-center text-slate-400 space-y-2 liquid-glass rounded-2xl border border-white/10 p-8 shadow-lg">
                <Users className="w-8 h-8 mx-auto text-slate-500 mb-2 opacity-60" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  {clients.length === 0 ? 'No Clients Yet' : 'No Clients Found'}
                </h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  {clients.length === 0
                    ? 'Add your first client to start creating invoices and tracking payments.'
                    : 'Try another name, company, email or phone.'}
                </p>
                {clients.length === 0 ? (
                  <div className="pt-2">
                    <GlassButton size="sm" variant="primary" onClick={handleOpenNewClient}>
                      <Plus className="w-3.5 h-3.5 mr-1" /> Add Client
                    </GlassButton>
                  </div>
                ) : (
                  <div className="pt-2">
                    <button
                      onClick={() => setClientSearch('')}
                      className="text-xs text-emerald-400 hover:underline"
                    >
                      Clear search filter
                    </button>
                  </div>
                )}
              </div>
            ) : clientViewMode === 'grid' ? (
              /* ==================== COMPACT GRID VIEW ==================== */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-3.5">
                {filteredClients.map(c => {
                  const m = clientFinancialMap.get(c.id) || {
                    invoiced: 0,
                    paid: 0,
                    balance: 0,
                    status: 'NO INVOICES' as const
                  }

                  return (
                    <div
                      key={c.id}
                      onClick={() => {
                        sounds.playClick()
                        setViewClient(c)
                      }}
                      className="liquid-glass rounded-2xl p-3.5 border border-white/10 hover:border-white/25 hover:bg-white/[0.06] transition-all duration-200 cursor-pointer relative group flex flex-col justify-between select-none shadow-md"
                    >
                      <div className="glass-specular" />

                      {/* Card Top: Avatar, Name, Company, Status Pill & Context Menu */}
                      <div className="flex items-start justify-between gap-2.5 mb-2.5">
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          {/* Circular Liquid Glass Initials Avatar */}
                          <div className="w-9 h-9 rounded-full bg-white/[0.08] border border-white/20 text-xs font-bold text-white flex items-center justify-center shrink-0 shadow-inner group-hover:border-emerald-400/50 group-hover:bg-emerald-500/10 transition-colors">
                            {getClientInitials(c.name)}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="font-bold text-sm text-white group-hover:text-emerald-300 transition-colors truncate">
                              {c.name}
                            </div>
                            <div className="text-xs text-slate-400 truncate">
                              {c.companyName || 'Individual'}
                            </div>
                          </div>
                        </div>

                        {/* Status pill & Context menu button */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span
                            className={cn(
                              'text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider',
                              m.status === 'CLEAR'
                                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                                : m.status === 'OUTSTANDING'
                                ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                                : 'bg-white/5 text-slate-400 border-white/10'
                            )}
                          >
                            {m.status}
                          </span>

                          <div className="relative">
                            <button
                              onClick={e => {
                                e.stopPropagation()
                                sounds.playClick()
                                setActiveMenuClientId(prev => (prev === c.id ? null : c.id))
                              }}
                              className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition"
                              title="More actions"
                            >
                              <MoreVertical className="w-3.5 h-3.5" />
                            </button>

                            {activeMenuClientId === c.id && (
                              <div
                                onClick={e => e.stopPropagation()}
                                className="absolute right-0 top-full mt-1 w-36 rounded-xl liquid-glass-heavy border border-white/15 shadow-2xl py-1 z-30 animate-in fade-in zoom-in-95 duration-100 text-xs"
                              >
                                <button
                                  onClick={() => {
                                    setActiveMenuClientId(null)
                                    sounds.playClick()
                                    setViewClient(c)
                                  }}
                                  className="w-full text-left px-3 py-1.5 text-slate-200 hover:bg-white/10 hover:text-white flex items-center gap-2"
                                >
                                  <Users className="w-3.5 h-3.5 text-indigo-400" />
                                  <span>Open Profile</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setActiveMenuClientId(null)
                                    handleOpenEditClient(c)
                                  }}
                                  className="w-full text-left px-3 py-1.5 text-slate-200 hover:bg-white/10 hover:text-white flex items-center gap-2"
                                >
                                  <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                                  <span>Edit Client</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setActiveMenuClientId(null)
                                    handleArchiveClient(c)
                                  }}
                                  className="w-full text-left px-3 py-1.5 text-slate-200 hover:bg-white/10 hover:text-white flex items-center gap-2"
                                >
                                  <Archive className="w-3.5 h-3.5 text-amber-400" />
                                  <span>{c.isArchived ? 'Unarchive' : 'Archive'}</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setActiveMenuClientId(null)
                                    handleDeleteClient(c)
                                  }}
                                  className="w-full text-left px-3 py-1.5 text-rose-300 hover:bg-rose-500/20 hover:text-rose-200 flex items-center gap-2 border-t border-white/5 mt-0.5 pt-1.5"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                                  <span>Delete</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Card Middle: Compact Financial Row (Clean & Flat, No Huge Nested Boxes) */}
                      <div className="grid grid-cols-3 gap-2 py-2 px-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-xs font-mono mb-2.5">
                        <div>
                          <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-sans">
                            Invoiced
                          </span>
                          <span className="font-semibold text-white truncate block">
                            {formatMoney(m.invoiced)}
                          </span>
                        </div>
                        <div>
                          <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-sans">
                            Paid
                          </span>
                          <span className="font-semibold text-emerald-400 truncate block">
                            {formatMoney(m.paid)}
                          </span>
                        </div>
                        <div>
                          <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-sans">
                            Outstanding
                          </span>
                          <span
                            className={cn(
                              'font-bold truncate block',
                              m.balance > 0 ? 'text-amber-300' : 'text-slate-400'
                            )}
                          >
                            {formatMoney(m.balance)}
                          </span>
                        </div>
                      </div>

                      {/* Card Bottom: Contact Snippet & Compact Open Action */}
                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5 border-t border-white/5">
                        <div className="truncate flex items-center gap-1.5 max-w-[70%]">
                          {c.email ? (
                            <>
                              <Mail className="w-3 h-3 text-slate-500 shrink-0" />
                              <span className="truncate">{c.email}</span>
                            </>
                          ) : c.phone ? (
                            <>
                              <Phone className="w-3 h-3 text-slate-500 shrink-0" />
                              <span className="truncate">{c.phone}</span>
                            </>
                          ) : (
                            <span className="text-slate-500 italic">No contact info</span>
                          )}
                        </div>

                        <div className="flex items-center gap-1 text-slate-400 group-hover:text-emerald-300 transition-colors shrink-0 font-medium">
                          <span className="text-[11px]">Open</span>
                          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              /* ==================== PROFESSIONAL FINANCIAL LIST / TABLE VIEW ==================== */
              <div className="rounded-2xl liquid-glass overflow-hidden border border-white/10 shadow-lg">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/[0.03] text-[10px] md:text-[11px] uppercase tracking-wider text-slate-400 select-none">
                        <th className="py-2.5 px-3.5 font-semibold">Client</th>
                        <th className="py-2.5 px-3.5 font-semibold">Company</th>
                        <th className="py-2.5 px-3.5 font-semibold hidden md:table-cell">Contact</th>
                        <th className="py-2.5 px-3.5 font-semibold font-mono text-right">Invoiced</th>
                        <th className="py-2.5 px-3.5 font-semibold font-mono text-right">Paid</th>
                        <th className="py-2.5 px-3.5 font-semibold font-mono text-right">Outstanding</th>
                        <th className="py-2.5 px-3.5 font-semibold text-center">Status</th>
                        <th className="py-2.5 px-3.5 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredClients.map(c => {
                        const m = clientFinancialMap.get(c.id) || {
                          invoiced: 0,
                          paid: 0,
                          balance: 0,
                          status: 'NO INVOICES' as const
                        }

                        return (
                          <tr
                            key={c.id}
                            onClick={() => {
                              sounds.playClick()
                              setViewClient(c)
                            }}
                            className="hover:bg-white/[0.05] transition-colors cursor-pointer group"
                          >
                            {/* Client Name + Avatar */}
                            <td className="py-2.5 px-3.5">
                              <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-full bg-white/[0.08] border border-white/20 text-[10px] font-bold text-white flex items-center justify-center shrink-0">
                                  {getClientInitials(c.name)}
                                </div>
                                <div>
                                  <span className="font-semibold text-white group-hover:text-emerald-300 transition-colors block">
                                    {c.name}
                                  </span>
                                  {c.isArchived && (
                                    <span className="text-[9px] text-slate-500">Archived</span>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* Company */}
                            <td className="py-2.5 px-3.5 text-slate-300">
                              {c.companyName || (
                                <span className="text-slate-500 italic">Individual</span>
                              )}
                            </td>

                            {/* Contact */}
                            <td className="py-2.5 px-3.5 text-slate-400 hidden md:table-cell">
                              <div className="truncate max-w-[160px]">
                                {c.email || c.phone || '—'}
                              </div>
                            </td>

                            {/* Invoiced */}
                            <td className="py-2.5 px-3.5 font-mono text-right text-white">
                              {formatMoney(m.invoiced)}
                            </td>

                            {/* Paid */}
                            <td className="py-2.5 px-3.5 font-mono text-right text-emerald-400">
                              {formatMoney(m.paid)}
                            </td>

                            {/* Outstanding */}
                            <td className="py-2.5 px-3.5 font-mono text-right font-bold">
                              <span
                                className={m.balance > 0 ? 'text-amber-300' : 'text-slate-400'}
                              >
                                {formatMoney(m.balance)}
                              </span>
                            </td>

                            {/* Status */}
                            <td className="py-2.5 px-3.5 text-center">
                              <span
                                className={cn(
                                  'text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider inline-block',
                                  m.status === 'CLEAR'
                                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                                    : m.status === 'OUTSTANDING'
                                    ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                                    : 'bg-white/5 text-slate-400 border-white/10'
                                )}
                              >
                                {m.status}
                              </span>
                            </td>

                            {/* Actions */}
                            <td className="py-2.5 px-3.5 text-right">
                              <div
                                className="flex items-center justify-end gap-1.5"
                                onClick={e => e.stopPropagation()}
                              >
                                <button
                                  onClick={() => {
                                    sounds.playClick()
                                    setViewClient(c)
                                  }}
                                  className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-emerald-300 transition"
                                  title="Open Financial Profile"
                                >
                                  <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleOpenEditClient(c)}
                                  className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition"
                                  title="Edit Client"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ) : activeTab === 'payments' ? (
          /* ==================== 4. PAYMENTS SCREEN ==================== */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Payment Receipts & History</h3>
                <p className="text-xs text-slate-400">
                  All recorded client settlements and generated payment receipts
                </p>
              </div>

              <div className="flex items-center gap-2">
                <GlassButton
                  size="sm"
                  variant="default"
                  onClick={() => exportPaymentsToCSV(payments, clients, invoices)}
                >
                  <Download className="w-3.5 h-3.5 mr-1" />
                  <span className="hidden sm:inline">Export CSV</span>
                </GlassButton>

                <GlassButton
                  size="sm"
                  variant="primary"
                  onClick={() => handleOpenRecordPayment()}
                >
                  <Plus className="w-4 h-4 mr-1" /> Record Payment
                </GlassButton>
              </div>
            </div>

            <div className="rounded-2xl liquid-glass overflow-hidden border border-white/10">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.03] text-[11px] uppercase tracking-wider text-slate-400 select-none">
                    <th className="py-3 px-4 font-semibold">Receipt #</th>
                    <th className="py-3 px-4 font-semibold">Invoice #</th>
                    <th className="py-3 px-4 font-semibold">Client</th>
                    <th className="py-3 px-4 font-semibold">Date</th>
                    <th className="py-3 px-4 font-semibold">Method</th>
                    <th className="py-3 px-4 font-semibold font-mono text-right">Amount Paid</th>
                    <th className="py-3 px-4 font-semibold text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {payments.map(p => {
                    const client = clientMap.get(p.clientId)
                    const inv = invoices.find(i => i.id === p.invoiceId)

                    return (
                      <tr key={p.id} className="hover:bg-white/[0.04] transition">
                        <td className="py-3.5 px-4 font-mono font-bold text-emerald-300">
                          {p.receiptNumber}
                        </td>

                        <td className="py-3.5 px-4 font-mono text-slate-300">
                          {inv?.invoiceNumber || 'Direct Payment'}
                        </td>

                        <td className="py-3.5 px-4 text-slate-200">
                          <div className="font-semibold">{client?.name || 'Client'}</div>
                          {client?.companyName && (
                            <div className="text-[11px] text-slate-400">{client.companyName}</div>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-slate-400">{p.paymentDate}</td>

                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded-full bg-white/[0.06] text-slate-300 text-[10px]">
                            {p.paymentMethod}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-400">
                          {formatMoney(p.amount, p.currency)}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => {
                              sounds.playClick()
                              setPreviewReceipt(p)
                            }}
                            className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition"
                            title="View / Print Receipt"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : activeTab === 'expenses' ? (
          /* ==================== 5. EXPENSES SCREEN ==================== */
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <select
                  value={expenseCategoryFilter}
                  onChange={e => setExpenseCategoryFilter(e.target.value)}
                  className="bg-white/[0.06] border border-white/10 text-slate-300 rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:border-emerald-400/50"
                >
                  <option value="all" className="bg-slate-900">All Categories</option>
                  {EXPENSE_CATEGORIES.map(cat => (
                    <option key={cat} value={cat} className="bg-slate-900">{cat}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <GlassButton
                  size="sm"
                  variant="default"
                  onClick={() => exportExpensesToCSV(filteredExpenses)}
                >
                  <Download className="w-3.5 h-3.5 mr-1" />
                  <span className="hidden sm:inline">Export CSV</span>
                </GlassButton>

                <GlassButton size="sm" variant="primary" onClick={handleOpenNewExpense}>
                  <Plus className="w-4 h-4 mr-1" /> Add Expense
                </GlassButton>
              </div>
            </div>

            <div className="rounded-2xl liquid-glass overflow-hidden border border-white/10">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.03] text-[11px] uppercase tracking-wider text-slate-400 select-none">
                    <th className="py-3 px-4 font-semibold">Date</th>
                    <th className="py-3 px-4 font-semibold">Category</th>
                    <th className="py-3 px-4 font-semibold">Description</th>
                    <th className="py-3 px-4 font-semibold">Vendor</th>
                    <th className="py-3 px-4 font-semibold font-mono text-right">Amount</th>
                    <th className="py-3 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredExpenses.map(e => (
                    <tr key={e.id} className="hover:bg-white/[0.04] transition group">
                      <td className="py-3.5 px-4 text-slate-300">{e.date}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full bg-white/[0.06] text-slate-300 border border-white/10 text-[10px]">
                          {e.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-white">{e.description}</td>
                      <td className="py-3.5 px-4 text-slate-400">{e.vendor || '—'}</td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-rose-300">
                        {formatMoney(e.amount, e.currency)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={async () => {
                            sounds.playClick()
                            await financeService.deleteExpense(e.id)
                          }}
                          className="p-1.5 rounded-xl hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition"
                          title="Delete Expense"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* ==================== 6. SETTINGS SCREEN ==================== */
          <div className="max-w-2xl mx-auto space-y-6">
            <GlassPanel intensity="subtle" className="p-5 md:p-6 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3">
                <SettingsIcon className="w-4 h-4 text-emerald-400" />
                Practice & Business Details
              </h3>
              <p className="text-xs text-slate-400">
                These business details automatically populate your client invoices and payment receipts.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Business Name (English)</label>
                  <input
                    type="text"
                    value={settBusinessName}
                    onChange={e => setSettBusinessName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.06] border border-white/10 text-white focus:outline-none focus:border-emerald-400/50"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Arabic Business Name</label>
                  <input
                    type="text"
                    value={settArabicName}
                    onChange={e => setSettArabicName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.06] border border-white/10 text-white text-right focus:outline-none focus:border-emerald-400/50 font-arabic"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">TRN / Tax Registration Number</label>
                  <input
                    type="text"
                    value={settTaxNumber}
                    onChange={e => setSettTaxNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.06] border border-white/10 text-white focus:outline-none focus:border-emerald-400/50 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Default Currency</label>
                  <input
                    type="text"
                    value={settCurrency}
                    onChange={e => setSettCurrency(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.06] border border-white/10 text-white focus:outline-none focus:border-emerald-400/50 uppercase"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">VAT Rate (%)</label>
                  <input
                    type="number"
                    value={settVatRate}
                    onChange={e => setSettVatRate(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.06] border border-white/10 text-white focus:outline-none focus:border-emerald-400/50"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Invoice Number Prefix</label>
                  <input
                    type="text"
                    value={settPrefix}
                    onChange={e => setSettPrefix(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.06] border border-white/10 text-white focus:outline-none focus:border-emerald-400/50 font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-300 font-semibold mb-1">Business Address</label>
                  <input
                    type="text"
                    value={settAddress}
                    onChange={e => setSettAddress(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.06] border border-white/10 text-white focus:outline-none focus:border-emerald-400/50"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={settPhone}
                    onChange={e => setSettPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.06] border border-white/10 text-white focus:outline-none focus:border-emerald-400/50"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Billing Email</label>
                  <input
                    type="email"
                    value={settEmail}
                    onChange={e => setSettEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.06] border border-white/10 text-white focus:outline-none focus:border-emerald-400/50"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t border-white/10">
                <GlassButton variant="primary" size="sm" onClick={handleSaveSettings}>
                  Save Settings
                </GlassButton>
              </div>
            </GlassPanel>
          </div>
        )}
      </div>

      {/* ==================== MODALS ==================== */}

      {/* NEW INVOICE MODAL */}
      <GlassModal
        isOpen={isNewInvoiceOpen}
        onClose={() => setIsNewInvoiceOpen(false)}
        title="Create New Invoice"
        maxWidth="max-w-3xl"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Invoice Number</label>
              <input
                type="text"
                value={invNumber}
                onChange={e => setInvNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/[0.06] border border-white/10 text-white font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Select Client</label>
              <select
                value={invClientId}
                onChange={e => setInvClientId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white"
              >
                {clients.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.companyName ? `(${c.companyName})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Currency</label>
              <input
                type="text"
                value={invCurrency}
                onChange={e => setInvCurrency(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/[0.06] border border-white/10 text-white uppercase font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Invoice Date</label>
              <input
                type="date"
                value={invDate}
                onChange={e => setInvDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/[0.06] border border-white/10 text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Due Date</label>
              <input
                type="date"
                value={invDueDate}
                onChange={e => setInvDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/[0.06] border border-white/10 text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">VAT Rate (%)</label>
              <input
                type="number"
                value={invTaxRate}
                onChange={e => setInvTaxRate(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-white/[0.06] border border-white/10 text-white"
              />
            </div>
          </div>

          {/* Line Items Editor */}
          <div className="space-y-2 pt-2 border-t border-white/10">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
              <span>Invoice Line Items</span>
              <button
                type="button"
                onClick={handleAddItem}
                className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium"
              >
                <Plus className="w-3.5 h-3.5" /> Add Line Item
              </button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {invItems.map((item, idx) => (
                <div key={item.id} className="flex items-center gap-2 text-xs">
                  <input
                    type="text"
                    placeholder="Item description / legal service..."
                    value={item.description}
                    onChange={e => handleUpdateItem(item.id, 'description', e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-xl bg-white/[0.06] border border-white/10 text-white"
                  />
                  <input
                    type="number"
                    placeholder="Qty"
                    min="1"
                    value={item.quantity}
                    onChange={e => handleUpdateItem(item.id, 'quantity', e.target.value)}
                    className="w-16 px-2 py-1.5 rounded-xl bg-white/[0.06] border border-white/10 text-white text-center font-mono"
                  />
                  <input
                    type="number"
                    placeholder="Rate"
                    value={item.rate}
                    onChange={e => handleUpdateItem(item.id, 'rate', e.target.value)}
                    className="w-24 px-2 py-1.5 rounded-xl bg-white/[0.06] border border-white/10 text-white text-right font-mono"
                  />
                  <div className="w-24 px-2 py-1.5 text-right font-mono font-bold text-white">
                    {formatMoney(item.amount, '')}
                  </div>
                  {invItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Subtotal & Total Summary */}
          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1.5 text-xs font-mono max-w-xs ml-auto">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal:</span>
              <span className="text-white font-medium">{formatMoney(formSubtotal, invCurrency)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>VAT ({invTaxRate}%):</span>
              <span className="text-white font-medium">{formatMoney(formTaxAmount, invCurrency)}</span>
            </div>
            <div className="flex justify-between border-t border-white/10 pt-1 text-sm font-bold text-emerald-400">
              <span>Total:</span>
              <span>{formatMoney(formTotal, invCurrency)}</span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
            <GlassButton variant="ghost" size="sm" onClick={() => setIsNewInvoiceOpen(false)}>
              Cancel
            </GlassButton>
            <GlassButton
              variant="primary"
              size="sm"
              onClick={handleSaveInvoice}
              disabled={!invClientId || formTotal <= 0}
            >
              Issue Invoice
            </GlassButton>
          </div>
        </div>
      </GlassModal>

      {/* NEW CLIENT MODAL */}
      <GlassModal
        isOpen={isNewClientOpen}
        onClose={() => setIsNewClientOpen(false)}
        title={editingClient ? 'Edit Client' : 'Add New Client'}
        maxWidth="max-w-lg"
      >
        <div className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Client Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={clientName}
              onChange={e => setClientName(e.target.value)}
              placeholder="e.g. Ahmed Ali"
              className="w-full px-3 py-2 rounded-xl bg-white/[0.06] border border-white/10 text-white"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Company Name</label>
            <input
              type="text"
              value={clientCompany}
              onChange={e => setClientCompany(e.target.value)}
              placeholder="e.g. Al Noor Trading LLC"
              className="w-full px-3 py-2 rounded-xl bg-white/[0.06] border border-white/10 text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Phone</label>
              <input
                type="text"
                value={clientPhone}
                onChange={e => setClientPhone(e.target.value)}
                placeholder="+971 50 000 0000"
                className="w-full px-3 py-2 rounded-xl bg-white/[0.06] border border-white/10 text-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Email</label>
              <input
                type="email"
                value={clientEmail}
                onChange={e => setClientEmail(e.target.value)}
                placeholder="billing@company.com"
                className="w-full px-3 py-2 rounded-xl bg-white/[0.06] border border-white/10 text-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Tax / TRN Number</label>
            <input
              type="text"
              value={clientTaxNumber}
              onChange={e => setClientTaxNumber(e.target.value)}
              placeholder="100XXXXXXXXXXXX"
              className="w-full px-3 py-2 rounded-xl bg-white/[0.06] border border-white/10 text-white font-mono"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Address</label>
            <input
              type="text"
              value={clientAddress}
              onChange={e => setClientAddress(e.target.value)}
              placeholder="City, Street, Suite..."
              className="w-full px-3 py-2 rounded-xl bg-white/[0.06] border border-white/10 text-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
            <GlassButton variant="ghost" size="sm" onClick={() => setIsNewClientOpen(false)}>
              Cancel
            </GlassButton>
            <GlassButton variant="primary" size="sm" onClick={handleSaveClient} disabled={!clientName.trim()}>
              Save Client
            </GlassButton>
          </div>
        </div>
      </GlassModal>

      {/* RECORD PAYMENT MODAL */}
      <GlassModal
        isOpen={isRecordPaymentOpen}
        onClose={() => setIsRecordPaymentOpen(false)}
        title="Record Client Payment"
        maxWidth="max-w-md"
      >
        <div className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Apply to Invoice</label>
            <select
              value={payInvoiceId}
              onChange={e => {
                const id = e.target.value
                setPayInvoiceId(id)
                const inv = invoices.find(i => i.id === id)
                if (inv) {
                  const invPayments = payments.filter(p => p.invoiceId === inv.id)
                  const paid = roundMoney(invPayments.reduce((acc, p) => acc + p.amount, 0))
                  const bal = roundMoney(Math.max(0, inv.total - paid))
                  setPayAmount(bal)
                }
              }}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white font-mono"
            >
              {invoices
                .filter(i => i.status !== 'Cancelled')
                .map(inv => {
                  const c = clientMap.get(inv.clientId)
                  return (
                    <option key={inv.id} value={inv.id}>
                      {inv.invoiceNumber} — {c?.name || 'Client'} ({formatMoney(inv.total, inv.currency)})
                    </option>
                  )
                })}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Payment Amount ({settings?.defaultCurrency || 'AED'})
            </label>
            <input
              type="number"
              step="any"
              value={payAmount}
              onChange={e => setPayAmount(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl bg-white/[0.06] border border-white/10 text-white font-mono font-bold text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Payment Date</label>
              <input
                type="date"
                value={payDate}
                onChange={e => setPayDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/[0.06] border border-white/10 text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Payment Method</label>
              <select
                value={payMethod}
                onChange={e => setPayMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white"
              >
                {PAYMENT_METHODS.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Reference / Transaction ID</label>
            <input
              type="text"
              value={payRef}
              onChange={e => setPayRef(e.target.value)}
              placeholder="e.g. TXN-89410-ENBD"
              className="w-full px-3 py-2 rounded-xl bg-white/[0.06] border border-white/10 text-white font-mono"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
            <GlassButton variant="ghost" size="sm" onClick={() => setIsRecordPaymentOpen(false)}>
              Cancel
            </GlassButton>
            <GlassButton variant="primary" size="sm" onClick={handleSavePayment} disabled={payAmount <= 0}>
              Save & Print Receipt
            </GlassButton>
          </div>
        </div>
      </GlassModal>

      {/* NEW EXPENSE MODAL */}
      <GlassModal
        isOpen={isNewExpenseOpen}
        onClose={() => setIsNewExpenseOpen(false)}
        title="Record Expense"
        maxWidth="max-w-md"
      >
        <div className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Description *</label>
            <input
              type="text"
              value={expDesc}
              onChange={e => setExpDesc(e.target.value)}
              placeholder="e.g. Office rent, LexisNexis research, court fee..."
              className="w-full px-3 py-2 rounded-xl bg-white/[0.06] border border-white/10 text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Category</label>
              <select
                value={expCategory}
                onChange={e => setExpCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white"
              >
                {EXPENSE_CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Amount</label>
              <input
                type="number"
                step="any"
                value={expAmount}
                onChange={e => setExpAmount(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-white/[0.06] border border-white/10 text-white font-mono font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Date</label>
              <input
                type="date"
                value={expDate}
                onChange={e => setExpDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/[0.06] border border-white/10 text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Vendor / Payee</label>
              <input
                type="text"
                value={expVendor}
                onChange={e => setExpVendor(e.target.value)}
                placeholder="e.g. Dubai Courts, Emaar..."
                className="w-full px-3 py-2 rounded-xl bg-white/[0.06] border border-white/10 text-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
            <GlassButton variant="ghost" size="sm" onClick={() => setIsNewExpenseOpen(false)}>
              Cancel
            </GlassButton>
            <GlassButton variant="primary" size="sm" onClick={handleSaveExpense} disabled={!expDesc.trim() || expAmount <= 0}>
              Save Expense
            </GlassButton>
          </div>
        </div>
      </GlassModal>

      {/* INVOICE PREVIEW & PRINTABLE DOCUMENT MODAL */}
      <GlassModal
        isOpen={Boolean(previewInvoice)}
        onClose={() => setPreviewInvoice(null)}
        title={
          previewInvoice ? (
            <div className="flex items-center justify-between w-full pr-4">
              <span>Invoice {previewInvoice.invoiceNumber}</span>
              <button
                onClick={() => window.print()}
                className="px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" /> Print / Save PDF
              </button>
            </div>
          ) : (
            'Invoice'
          )
        }
        maxWidth="max-w-3xl"
      >
        {previewInvoice && (
          <div className="p-6 md:p-8 bg-slate-900/90 rounded-2xl border border-white/10 text-slate-200 text-xs space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-white/10 pb-6">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  {settings?.businessName || 'Consultancy'}
                </h2>
                {settings?.arabicBusinessName && (
                  <p className="text-xs text-slate-400 font-arabic mt-0.5">{settings.arabicBusinessName}</p>
                )}
                <p className="text-slate-400 mt-2 max-w-xs">{settings?.address}</p>
                <p className="text-slate-400">TRN: {settings?.taxNumber}</p>
                <p className="text-slate-400">Email: {settings?.email}</p>
              </div>

              <div className="text-right">
                <span className="text-2xl font-bold font-mono text-emerald-400 block">TAX INVOICE</span>
                <span className="font-mono text-sm text-white font-semibold">#{previewInvoice.invoiceNumber}</span>
                <div className="mt-2 text-slate-400">
                  <div>Date: <strong className="text-white">{previewInvoice.invoiceDate}</strong></div>
                  <div>Due: <strong className="text-white">{previewInvoice.dueDate}</strong></div>
                  <div className="mt-1">
                    <span className="px-2 py-0.5 rounded-full bg-white/10 text-slate-200 font-medium">
                      Status: {previewInvoice.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Billed To */}
            <div>
              <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
                Billed To:
              </div>
              {(() => {
                const c = clientMap.get(previewInvoice.clientId)
                return (
                  <div className="space-y-0.5 text-slate-200">
                    <div className="font-bold text-sm text-white">{c?.name}</div>
                    {c?.companyName && <div>{c.companyName}</div>}
                    {c?.address && <div className="text-slate-400">{c.address}</div>}
                    {c?.taxNumber && <div className="text-slate-400">TRN: {c.taxNumber}</div>}
                  </div>
                )
              })()}
            </div>

            {/* Items Table */}
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 text-[11px] uppercase">
                  <th className="py-2 text-left">Description</th>
                  <th className="py-2 text-center w-16">Qty</th>
                  <th className="py-2 text-right w-24">Rate</th>
                  <th className="py-2 text-right w-28">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {previewInvoice.items.map((it, idx) => (
                  <tr key={idx}>
                    <td className="py-2.5 text-white">{it.description}</td>
                    <td className="py-2.5 text-center font-mono">{it.quantity}</td>
                    <td className="py-2.5 text-right font-mono">{formatMoney(it.rate, '')}</td>
                    <td className="py-2.5 text-right font-mono font-semibold">{formatMoney(it.amount, '')}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="flex justify-end pt-4 border-t border-white/10">
              <div className="w-64 space-y-1 font-mono text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal:</span>
                  <span className="text-white">{formatMoney(previewInvoice.subtotal, previewInvoice.currency)}</span>
                </div>
                {previewInvoice.discount > 0 && (
                  <div className="flex justify-between text-rose-400">
                    <span>Discount:</span>
                    <span>-{formatMoney(previewInvoice.discount, previewInvoice.currency)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-400">
                  <span>VAT ({previewInvoice.taxRate}%):</span>
                  <span className="text-white">{formatMoney(previewInvoice.taxAmount, previewInvoice.currency)}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-emerald-400 pt-2 border-t border-white/10">
                  <span>Total Amount:</span>
                  <span>{formatMoney(previewInvoice.total, previewInvoice.currency)}</span>
                </div>
              </div>
            </div>

            {previewInvoice.notes && (
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 text-[11px] text-slate-400">
                <span className="font-semibold text-slate-300 block mb-0.5">Notes:</span>
                {previewInvoice.notes}
              </div>
            )}
          </div>
        )}
      </GlassModal>

      {/* PAYMENT RECEIPT MODAL */}
      <GlassModal
        isOpen={Boolean(previewReceipt)}
        onClose={() => setPreviewReceipt(null)}
        title={previewReceipt ? `Receipt ${previewReceipt.receiptNumber}` : 'Receipt'}
        maxWidth="max-w-md"
      >
        {previewReceipt && (
          <div className="p-6 bg-slate-900 rounded-2xl border border-white/10 text-xs space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-sm font-bold text-white">{settings?.businessName}</span>
                <span className="text-[10px] text-slate-400 block">Payment Receipt</span>
              </div>
              <div className="font-mono font-bold text-emerald-400">{previewReceipt.receiptNumber}</div>
            </div>

            <div className="space-y-2 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Date:</span>
                <span className="text-white">{previewReceipt.paymentDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Method:</span>
                <span className="text-white">{previewReceipt.paymentMethod}</span>
              </div>
              {previewReceipt.reference && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Reference:</span>
                  <span className="text-white">{previewReceipt.reference}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-emerald-400 border-t border-white/10 pt-2">
                <span>Amount Paid:</span>
                <span>{formatMoney(previewReceipt.amount, previewReceipt.currency)}</span>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-white/10">
              <GlassButton variant="primary" size="sm" onClick={() => window.print()}>
                <Printer className="w-3.5 h-3.5 mr-1" /> Print Receipt
              </GlassButton>
            </div>
          </div>
        )}
      </GlassModal>

      {/* CLIENT FINANCIAL PROFILE MODAL */}
      <GlassModal
        isOpen={Boolean(viewClient)}
        onClose={() => setViewClient(null)}
        title={viewClient ? `${viewClient.name} — Financial Profile` : 'Client Profile'}
        maxWidth="max-w-2xl"
      >
        {viewClient && (
          <div className="space-y-4 text-xs">
            {/* Balance Overview */}
            {(() => {
              const cInvoices = invoices.filter(i => i.clientId === viewClient.id && i.status !== 'Cancelled')
              const cPayments = payments.filter(p => p.clientId === viewClient.id)
              const invoiced = roundMoney(cInvoices.reduce((acc, i) => acc + i.total, 0))
              const paid = roundMoney(cPayments.reduce((acc, p) => acc + p.amount, 0))
              const balance = roundMoney(Math.max(0, invoiced - paid))

              return (
                <div className="grid grid-cols-3 gap-3 font-mono text-center">
                  <div className="p-3 rounded-xl bg-white/[0.04] border border-white/5">
                    <span className="text-[10px] text-slate-400 block">Total Invoiced</span>
                    <span className="text-sm font-bold text-white">{formatMoney(invoiced)}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <span className="text-[10px] text-emerald-300 block">Total Paid</span>
                    <span className="text-sm font-bold text-emerald-400">{formatMoney(paid)}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                    <span className="text-[10px] text-amber-300 block">Outstanding</span>
                    <span className="text-sm font-bold text-amber-300">{formatMoney(balance)}</span>
                  </div>
                </div>
              )
            })()}

            {/* Invoices History */}
            <div className="space-y-2">
              <h4 className="font-bold text-white text-xs">Invoice History</h4>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {invoices
                  .filter(i => i.clientId === viewClient.id)
                  .map(inv => (
                    <div
                      key={inv.id}
                      className="p-2.5 rounded-xl bg-white/[0.04] border border-white/5 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white">{inv.invoiceNumber}</span>
                        <span className="text-slate-400">{inv.invoiceDate}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-white">{formatMoney(inv.total, inv.currency)}</span>
                        <span className="px-2 py-0.5 rounded-full bg-white/5 text-[10px]">{inv.status}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-white/10">
              <button
                onClick={() => handleArchiveClient(viewClient)}
                className="text-slate-400 hover:text-amber-400 flex items-center gap-1 text-xs"
              >
                <Archive className="w-3.5 h-3.5" /> Archive Client
              </button>

              <GlassButton variant="default" size="sm" onClick={() => setViewClient(null)}>
                Close
              </GlassButton>
            </div>
          </div>
        )}
      </GlassModal>
    </div>
  )
}
