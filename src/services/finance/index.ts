import {
  Client,
  Invoice,
  InvoiceItem,
  InvoiceStatus,
  Payment,
  PaymentMethod,
  Expense,
  Transaction,
  TransactionType,
  FinanceBusinessSettings
} from '@/types'
import { storageService } from '@/services/storage'
import { toLocalYYYYMMDD } from '@/utils/date'

// Precision rounding for financial totals (prevents 0.1 + 0.2 float anomalies)
export function roundMoney(amount: number): number {
  return Math.round((amount + Number.EPSILON) * 100) / 100
}

export function formatMoney(amount: number, currency = 'AED'): string {
  if (typeof amount !== 'number' || isNaN(amount) || !isFinite(amount)) {
    return `${currency} 0.00`
  }
  const rounded = roundMoney(amount)
  return `${currency} ${rounded.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`
}

export type DateRangeFilter =
  | 'today'
  | 'this_week'
  | 'this_month'
  | 'this_quarter'
  | 'this_year'
  | 'all_time'
  | 'custom'

export function isDateInRange(
  dateStr: string,
  filter: DateRangeFilter,
  customRange?: { start?: string; end?: string }
): boolean {
  if (filter === 'all_time') return true
  const now = new Date()
  const todayStr = toLocalYYYYMMDD(now)

  if (filter === 'today') {
    return dateStr === todayStr
  }

  if (filter === 'this_week') {
    // Current week starting Monday
    const day = now.getDay()
    const diffToMon = (day === 0 ? -6 : 1) - day
    const monday = new Date(now)
    monday.setDate(now.getDate() + diffToMon)
    const monStr = toLocalYYYYMMDD(monday)
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    const sunStr = toLocalYYYYMMDD(sunday)
    return dateStr >= monStr && dateStr <= sunStr
  }

  if (filter === 'this_month') {
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const prefix = `${year}-${month}`
    return dateStr.startsWith(prefix)
  }

  if (filter === 'this_quarter') {
    const year = now.getFullYear()
    const quarter = Math.floor(now.getMonth() / 3)
    const startMonth = String(quarter * 3 + 1).padStart(2, '0')
    const endMonth = String(quarter * 3 + 3).padStart(2, '0')
    return dateStr >= `${year}-${startMonth}-01` && dateStr <= `${year}-${endMonth}-31`
  }

  if (filter === 'this_year') {
    const year = String(now.getFullYear())
    return dateStr.startsWith(year)
  }

  if (filter === 'custom' && customRange) {
    if (customRange.start && dateStr < customRange.start) return false
    if (customRange.end && dateStr > customRange.end) return false
    return true
  }

  return true
}

// ==================== DEFAULT INITIAL SEED DATA ====================

export const DEFAULT_BUSINESS_SETTINGS: FinanceBusinessSettings = {
  businessName: 'Al Wasl Advisory & Legal Consultancy',
  arabicBusinessName: 'مكتب الوصل للاستشارات والخدمات القانونية',
  address: 'Level 14, Al Saada Commercial Tower, Downtown Dubai, UAE',
  phone: '+971 4 330 8822',
  email: 'accounts@alwasladvisory.ae',
  taxNumber: '100294819000003',
  defaultCurrency: 'AED',
  defaultVatRate: 5,
  invoicePrefix: '2026/',
  nextInvoiceSeq: 5
}

export const INITIAL_CLIENTS: Client[] = [
  {
    id: 'client-1',
    name: 'Ahmed Ali',
    companyName: 'Al Noor Trading LLC',
    phone: '+971 50 123 4567',
    email: 'ahmed@alnoor.ae',
    address: 'Bay Square 08, Business Bay, Dubai',
    taxNumber: '100482910000003',
    notes: 'Commercial trade dispute client. Reliable billing terms.',
    isArchived: false,
    createdAt: Date.now() - 86400000 * 30,
    updatedAt: Date.now() - 86400000 * 10
  },
  {
    id: 'client-2',
    name: 'Sara Hassan',
    companyName: 'Apex Global Logistics',
    phone: '+971 55 987 6543',
    email: 'sara@apexglobal.com',
    address: 'Warehouse Complex 12, Jebel Ali Free Zone, Dubai',
    taxNumber: '100918234000003',
    notes: 'Labour & contract dispute matter. Pays by direct bank wire.',
    isArchived: false,
    createdAt: Date.now() - 86400000 * 25,
    updatedAt: Date.now() - 86400000 * 5
  },
  {
    id: 'client-3',
    name: 'John Smith',
    companyName: 'Smith & Partners International',
    phone: '+971 4 332 1100',
    email: 'j.smith@smithintl.com',
    address: 'Index Tower, DIFC, Dubai',
    taxNumber: '100552918000003',
    notes: 'Corporate structuring and commercial litigation.',
    isArchived: false,
    createdAt: Date.now() - 86400000 * 35,
    updatedAt: Date.now() - 86400000 * 12
  },
  {
    id: 'client-4',
    name: 'Fatima Al Mansoori',
    companyName: 'Gulf Real Estate Holdings',
    phone: '+971 52 443 2211',
    email: 'fatima@gulfre.ae',
    address: 'Marina Plaza, Dubai Marina, Dubai',
    taxNumber: '100381920000003',
    notes: 'Lease and commercial property litigation.',
    isArchived: false,
    createdAt: Date.now() - 86400000 * 15,
    updatedAt: Date.now() - 86400000 * 2
  }
]

export const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'inv-1',
    invoiceNumber: '2026/1',
    clientId: 'client-1',
    invoiceDate: '2026-09-10',
    dueDate: '2026-09-25',
    currency: 'AED',
    items: [
      { id: 'item-1', description: 'Legal Consultation & Defense Review', quantity: 1, rate: 2000, amount: 2000 },
      { id: 'item-2', description: 'Commercial Pleadings & Rejoinder Preparation', quantity: 1, rate: 3000, amount: 3000 }
    ],
    subtotal: 5000,
    discount: 0,
    taxRate: 5,
    taxAmount: 250,
    total: 5250,
    status: 'Paid',
    notes: 'Thank you for your business. Payment received in full.',
    createdAt: Date.now() - 86400000 * 19,
    updatedAt: Date.now() - 86400000 * 17
  },
  {
    id: 'inv-2',
    invoiceNumber: '2026/2',
    clientId: 'client-2',
    invoiceDate: '2026-09-15',
    dueDate: '2026-09-30',
    currency: 'AED',
    items: [
      { id: 'item-3', description: 'Labour Court Representation & Hearing Attendance', quantity: 1, rate: 8000, amount: 8000 },
      { id: 'item-4', description: 'Expert Audit File Submission & Translation', quantity: 2, rate: 1000, amount: 2000 }
    ],
    subtotal: 10000,
    discount: 0,
    taxRate: 5,
    taxAmount: 500,
    total: 10500,
    status: 'Partially Paid',
    notes: '50% initial retainer received. Balance due upon audit completion.',
    createdAt: Date.now() - 86400000 * 14,
    updatedAt: Date.now() - 86400000 * 9
  },
  {
    id: 'inv-3',
    invoiceNumber: '2026/3',
    clientId: 'client-3',
    invoiceDate: '2026-09-02',
    dueDate: '2026-09-18', // Past date with balance -> OVERDUE
    currency: 'AED',
    items: [
      { id: 'item-5', description: 'Corporate Restructuring Legal Advisory Brief', quantity: 1, rate: 6000, amount: 6000 }
    ],
    subtotal: 6000,
    discount: 0,
    taxRate: 5,
    taxAmount: 300,
    total: 6300,
    status: 'Overdue',
    notes: 'Reminder notice issued. Awaiting wire confirmation from finance department.',
    createdAt: Date.now() - 86400000 * 27,
    updatedAt: Date.now() - 86400000 * 11
  },
  {
    id: 'inv-4',
    invoiceNumber: '2026/4',
    clientId: 'client-4',
    invoiceDate: '2026-09-26',
    dueDate: '2026-10-10',
    currency: 'AED',
    items: [
      { id: 'item-6', description: 'Rental Tribunal Representation Session', quantity: 1, rate: 4500, amount: 4500 },
      { id: 'item-7', description: 'Power of Attorney Notarization Service', quantity: 1, rate: 1500, amount: 1500 }
    ],
    subtotal: 6000,
    discount: 0,
    taxRate: 5,
    taxAmount: 300,
    total: 6300,
    status: 'Issued',
    notes: 'Payment due within 14 calendar days.',
    createdAt: Date.now() - 86400000 * 3,
    updatedAt: Date.now() - 86400000 * 3
  }
]

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'pay-1',
    type: 'income',
    amount: 5250,
    currency: 'AED',
    date: '2026-09-12',
    description: 'Payment for Invoice 2026/1',
    clientId: 'client-1',
    invoiceId: 'inv-1',
    paymentMethod: 'Bank Transfer',
    receiptNumber: 'REC-2026/1',
    reference: 'TXN-88491-ENBD',
    notes: 'Full settlement via Emirates NBD online wire transfer.',
    createdAt: Date.now() - 86400000 * 17,
    updatedAt: Date.now() - 86400000 * 17
  },
  {
    id: 'pay-2',
    type: 'income',
    amount: 5000,
    currency: 'AED',
    date: '2026-09-20',
    description: 'Payment for Invoice 2026/2',
    clientId: 'client-2',
    invoiceId: 'inv-2',
    paymentMethod: 'Bank Transfer',
    receiptNumber: 'REC-2026/2',
    reference: 'TXN-90214-FAB',
    notes: 'First milestone tranche payment received.',
    createdAt: Date.now() - 86400000 * 9,
    updatedAt: Date.now() - 86400000 * 9
  },
  {
    id: 'exp-1',
    type: 'expense',
    amount: 4500,
    currency: 'AED',
    date: '2026-09-05',
    description: 'Executive Office Lease & Utilities - September',
    paymentMethod: 'Bank Transfer',
    vendor: 'Emaar Commercial Properties',
    reference: 'LEASE-SEP-26',
    notes: 'Monthly office rent.',
    legacyCategory: 'Office',
    createdAt: Date.now() - 86400000 * 24,
    updatedAt: Date.now() - 86400000 * 24
  },
  {
    id: 'exp-2',
    type: 'expense',
    amount: 650,
    currency: 'AED',
    date: '2026-09-12',
    description: 'Practice Management & Cloud Storage Subscription',
    paymentMethod: 'Card',
    vendor: 'Clio & Google Cloud',
    reference: 'SUB-449102',
    notes: 'Annual recurring software license.',
    legacyCategory: 'Software',
    createdAt: Date.now() - 86400000 * 17,
    updatedAt: Date.now() - 86400000 * 17
  },
  {
    id: 'exp-3',
    type: 'expense',
    amount: 1850,
    currency: 'AED',
    date: '2026-09-18',
    description: 'Court e-filing & bailiff summons official registration fee',
    paymentMethod: 'Card',
    vendor: 'Dubai Courts e-Services',
    reference: 'CRT-2026-4491',
    notes: 'Case filing expense disbursed on behalf of client.',
    legacyCategory: 'Government Fees',
    createdAt: Date.now() - 86400000 * 11,
    updatedAt: Date.now() - 86400000 * 11
  },
  {
    id: 'exp-4',
    type: 'expense',
    amount: 450,
    currency: 'AED',
    date: '2026-09-22',
    description: 'LexisNexis UAE Legal Precedents & Federal Law Database',
    paymentMethod: 'Card',
    vendor: 'LexisNexis Middle East',
    reference: 'LN-AE-9921',
    notes: 'Legal research database monthly fee.',
    legacyCategory: 'Subscriptions',
    createdAt: Date.now() - 86400000 * 7,
    updatedAt: Date.now() - 86400000 * 7
  }
]

export const INITIAL_PAYMENTS: Payment[] = INITIAL_TRANSACTIONS.filter(t => t.type === 'income').map(t => ({
  id: t.id,
  receiptNumber: t.receiptNumber || `REC-${t.id}`,
  invoiceId: t.invoiceId || '',
  clientId: t.clientId || '',
  amount: t.amount,
  currency: t.currency,
  paymentDate: t.date,
  paymentMethod: (t.paymentMethod as PaymentMethod) || 'Bank Transfer',
  reference: t.reference,
  notes: t.notes || t.description,
  createdAt: t.createdAt
}))

export const INITIAL_EXPENSES: Expense[] = INITIAL_TRANSACTIONS.filter(t => t.type === 'expense').map(t => ({
  id: t.id,
  date: t.date,
  category: t.legacyCategory || 'General',
  description: t.description,
  amount: t.amount,
  currency: t.currency,
  paymentMethod: t.paymentMethod || 'Card',
  vendor: t.vendor,
  reference: t.reference,
  notes: t.notes,
  attachmentId: t.attachmentId,
  createdAt: t.createdAt,
  updatedAt: t.updatedAt
}))

type FinanceChangeSubscriber = () => void

// ==================== REPOSITORIES & SERVICE ====================

class FinanceServiceImpl {
  private subscribers: Set<FinanceChangeSubscriber> = new Set()

  subscribe(cb: FinanceChangeSubscriber): () => void {
    this.subscribers.add(cb)
    return () => {
      this.subscribers.delete(cb)
    }
  }

  private notify() {
    this.subscribers.forEach(cb => {
      try {
        cb()
      } catch (err) {
        console.error('Finance subscriber error:', err)
      }
    })
  }

  // --- SETTINGS ---
  async getSettings(): Promise<FinanceBusinessSettings> {
    return storageService.get<FinanceBusinessSettings>(
      'finance_settings',
      DEFAULT_BUSINESS_SETTINGS
    )
  }

  async updateSettings(settings: Partial<FinanceBusinessSettings>): Promise<FinanceBusinessSettings> {
    const current = await this.getSettings()
    const updated = { ...current, ...settings }
    await storageService.set('finance_settings', updated)
    this.notify()
    return updated
  }

  // --- CLIENTS ---
  async getClients(includeArchived = false): Promise<Client[]> {
    const list = await storageService.get<Client[]>('finance_clients', INITIAL_CLIENTS)
    return includeArchived ? list : list.filter(c => !c.isArchived)
  }

  async getClientById(id: string): Promise<Client | null> {
    const list = await storageService.get<Client[]>('finance_clients', INITIAL_CLIENTS)
    return list.find(c => c.id === id) || null
  }

  async createClient(data: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<Client> {
    const list = await storageService.get<Client[]>('finance_clients', INITIAL_CLIENTS)
    const newClient: Client = {
      ...data,
      id: `client_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
    const updated = [newClient, ...list]
    await storageService.set('finance_clients', updated)
    this.notify()
    return newClient
  }

  async updateClient(id: string, updates: Partial<Client>): Promise<Client | null> {
    const list = await storageService.get<Client[]>('finance_clients', INITIAL_CLIENTS)
    const idx = list.findIndex(c => c.id === id)
    if (idx === -1) return null

    const updatedClient = { ...list[idx], ...updates, updatedAt: Date.now() }
    const updatedList = [...list]
    updatedList[idx] = updatedClient
    await storageService.set('finance_clients', updatedList)
    this.notify()
    return updatedClient
  }

  async archiveClient(id: string): Promise<boolean> {
    const client = await this.updateClient(id, { isArchived: true })
    return Boolean(client)
  }

  async deleteClient(id: string): Promise<{ success: boolean; reason?: string }> {
    // Referential integrity check: check if client has invoices or transactions
    const invoices = await this.getInvoices()
    const transactions = await this.getTransactions()
    const hasInvoices = invoices.some(i => i.clientId === id)
    const hasTransactions = transactions.some(t => t.clientId === id)

    if (hasInvoices || hasTransactions) {
      return {
        success: false,
        reason: 'Client has existing invoices or transaction history. Archive the client instead to preserve financial audit trail.'
      }
    }

    const list = await storageService.get<Client[]>('finance_clients', INITIAL_CLIENTS)
    const filtered = list.filter(c => c.id !== id)
    await storageService.set('finance_clients', filtered)
    this.notify()
    return { success: true }
  }

  // --- INVOICES ---
  async getInvoices(): Promise<Invoice[]> {
    const list = await storageService.get<Invoice[]>('finance_invoices', INITIAL_INVOICES)
    const incomeTransactions = await this.getTransactions('income')
    const todayStr = toLocalYYYYMMDD()

    // Recalculate intelligent status based on recorded income transactions and due dates
    return list.map(inv => {
      if (inv.status === 'Cancelled') return inv

      const invPayments = incomeTransactions.filter(p => p.invoiceId === inv.id)
      const paidSum = roundMoney(invPayments.reduce((acc, p) => acc + p.amount, 0))
      const total = roundMoney(inv.total)

      let calculatedStatus: InvoiceStatus = inv.status

      if (paidSum >= total && total > 0) {
        calculatedStatus = 'Paid'
      } else if (paidSum > 0 && paidSum < total) {
        calculatedStatus = 'Partially Paid'
      } else if (paidSum === 0) {
        if (inv.dueDate && inv.dueDate < todayStr && inv.status !== 'Draft') {
          calculatedStatus = 'Overdue'
        } else if (inv.status !== 'Draft') {
          calculatedStatus = 'Unpaid'
        }
      }

      return {
        ...inv,
        status: calculatedStatus
      }
    })
  }

  async getInvoiceById(id: string): Promise<Invoice | null> {
    const invoices = await this.getInvoices()
    return invoices.find(i => i.id === id) || null
  }

  async getNextInvoiceNumber(): Promise<string> {
    const settings = await this.getSettings()
    const prefix = settings.invoicePrefix || '2026/'
    const seq = settings.nextInvoiceSeq || 1
    return `${prefix}${seq}`
  }

  async createInvoice(data: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>): Promise<Invoice> {
    const list = await storageService.get<Invoice[]>('finance_invoices', INITIAL_INVOICES)
    const settings = await this.getSettings()

    const newInvoice: Invoice = {
      ...data,
      id: `inv_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }

    const updated = [newInvoice, ...list]
    await storageService.set('finance_invoices', updated)

    // Increment next invoice sequence in settings
    await this.updateSettings({
      nextInvoiceSeq: (settings.nextInvoiceSeq || 1) + 1
    })

    this.notify()
    return newInvoice
  }

  async updateInvoice(id: string, updates: Partial<Invoice>): Promise<Invoice | null> {
    const list = await storageService.get<Invoice[]>('finance_invoices', INITIAL_INVOICES)
    const idx = list.findIndex(i => i.id === id)
    if (idx === -1) return null

    const updatedInv = { ...list[idx], ...updates, updatedAt: Date.now() }
    const updatedList = [...list]
    updatedList[idx] = updatedInv
    await storageService.set('finance_invoices', updatedList)
    this.notify()
    return updatedInv
  }

  async deleteInvoice(id: string): Promise<{ success: boolean; reason?: string }> {
    // Check if invoice has payments/income
    const incomeTransactions = await this.getTransactions('income')
    const hasPayments = incomeTransactions.some(p => p.invoiceId === id)

    if (hasPayments) {
      return {
        success: false,
        reason: 'Invoice has recorded payments. Delete payments first or cancel the invoice instead.'
      }
    }

    const list = await storageService.get<Invoice[]>('finance_invoices', INITIAL_INVOICES)
    const filtered = list.filter(i => i.id !== id)
    await storageService.set('finance_invoices', filtered)
    this.notify()
    return { success: true }
  }

  // --- TRANSACTIONS (Unified Architecture) ---
  private async ensureMigrated(): Promise<Transaction[]> {
    const stored = await storageService.get<Transaction[] | null>('finance_transactions', null)
    if (stored !== null && Array.isArray(stored)) {
      return stored
    }

    // Inspect legacy storage keys
    const legacyPayments = await storageService.get<Payment[] | null>('finance_payments', null)
    const legacyExpenses = await storageService.get<Expense[] | null>('finance_expenses', null)

    if (legacyPayments === null && legacyExpenses === null) {
      await storageService.set('finance_transactions', INITIAL_TRANSACTIONS)
      return INITIAL_TRANSACTIONS
    }

    const transactions: Transaction[] = []
    const invoices = await storageService.get<Invoice[]>('finance_invoices', INITIAL_INVOICES)
    const invMap = new Map(invoices.map(i => [i.id, i.invoiceNumber]))

    if (legacyPayments && Array.isArray(legacyPayments)) {
      for (const p of legacyPayments) {
        const invNum = p.invoiceId ? invMap.get(p.invoiceId) : undefined
        transactions.push({
          id: p.id,
          type: 'income',
          amount: roundMoney(p.amount),
          currency: p.currency || 'AED',
          date: p.paymentDate || toLocalYYYYMMDD(),
          description: p.notes?.trim() || (invNum ? `Payment for Invoice #${invNum}` : 'Payment received'),
          clientId: p.clientId,
          invoiceId: p.invoiceId,
          paymentMethod: p.paymentMethod || 'Bank Transfer',
          reference: p.reference,
          receiptNumber: p.receiptNumber,
          notes: p.notes,
          createdAt: p.createdAt || Date.now(),
          updatedAt: p.createdAt || Date.now()
        })
      }
    }

    if (legacyExpenses && Array.isArray(legacyExpenses)) {
      for (const e of legacyExpenses) {
        transactions.push({
          id: e.id,
          type: 'expense',
          amount: roundMoney(e.amount),
          currency: e.currency || 'AED',
          date: e.date || toLocalYYYYMMDD(),
          description: e.description || 'Expense',
          paymentMethod: e.paymentMethod || 'Card',
          vendor: e.vendor,
          reference: e.reference,
          notes: e.notes,
          legacyCategory: e.category,
          attachmentId: e.attachmentId,
          createdAt: e.createdAt || Date.now(),
          updatedAt: e.updatedAt || Date.now()
        })
      }
    }

    // If both arrays were empty, fall back to initial
    if (transactions.length === 0) {
      await storageService.set('finance_transactions', INITIAL_TRANSACTIONS)
      return INITIAL_TRANSACTIONS
    }

    transactions.sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt)
    await storageService.set('finance_transactions', transactions)
    return transactions
  }

  async getTransactions(type?: TransactionType): Promise<Transaction[]> {
    const list = await this.ensureMigrated()
    return type ? list.filter(t => t.type === type) : list
  }

  async getTransactionById(id: string): Promise<Transaction | null> {
    const list = await this.ensureMigrated()
    return list.find(t => t.id === id) || null
  }

  async getNextReceiptNumber(): Promise<string> {
    const list = await this.getTransactions('income')
    const year = new Date().getFullYear()
    return `REC-${year}/${list.length + 1}`
  }

  async createTransaction(data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<Transaction> {
    const list = await this.ensureMigrated()
    let receiptNumber = data.receiptNumber
    if (data.type === 'income' && !receiptNumber) {
      receiptNumber = await this.getNextReceiptNumber()
    }

    const newTxn: Transaction = {
      ...data,
      amount: roundMoney(data.amount),
      currency: data.currency || 'AED',
      receiptNumber,
      id: `txn_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }

    const updated = [newTxn, ...list].sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt)
    await storageService.set('finance_transactions', updated)
    this.notify()
    return newTxn
  }

  async updateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction | null> {
    const list = await this.ensureMigrated()
    const idx = list.findIndex(t => t.id === id)
    if (idx === -1) return null

    const updatedTxn: Transaction = {
      ...list[idx],
      ...updates,
      amount: updates.amount !== undefined ? roundMoney(updates.amount) : list[idx].amount,
      updatedAt: Date.now()
    }
    const updatedList = [...list]
    updatedList[idx] = updatedTxn
    updatedList.sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt)
    await storageService.set('finance_transactions', updatedList)
    this.notify()
    return updatedTxn
  }

  async deleteTransaction(id: string): Promise<boolean> {
    const list = await this.ensureMigrated()
    const filtered = list.filter(t => t.id !== id)
    await storageService.set('finance_transactions', filtered)
    this.notify()
    return true
  }

  // --- COMPATIBILITY ADAPTERS (Payments & Expenses) ---
  async getPayments(): Promise<Payment[]> {
    const incomes = await this.getTransactions('income')
    return incomes.map(t => ({
      id: t.id,
      receiptNumber: t.receiptNumber || `REC-${t.id}`,
      invoiceId: t.invoiceId || '',
      clientId: t.clientId || '',
      amount: t.amount,
      currency: t.currency,
      paymentDate: t.date,
      paymentMethod: (t.paymentMethod as PaymentMethod) || 'Bank Transfer',
      reference: t.reference,
      notes: t.notes || t.description,
      createdAt: t.createdAt
    }))
  }

  async recordPayment(data: Omit<Payment, 'id' | 'createdAt'>): Promise<Payment> {
    const created = await this.createTransaction({
      type: 'income',
      amount: data.amount,
      currency: data.currency,
      date: data.paymentDate,
      description: data.notes?.trim() || (data.invoiceId ? `Payment for Invoice #${data.invoiceId}` : 'Payment received'),
      clientId: data.clientId,
      invoiceId: data.invoiceId,
      paymentMethod: data.paymentMethod,
      reference: data.reference,
      receiptNumber: data.receiptNumber,
      notes: data.notes
    })

    return {
      id: created.id,
      receiptNumber: created.receiptNumber || '',
      invoiceId: created.invoiceId || '',
      clientId: created.clientId || '',
      amount: created.amount,
      currency: created.currency,
      paymentDate: created.date,
      paymentMethod: (created.paymentMethod as PaymentMethod) || 'Bank Transfer',
      reference: created.reference,
      notes: created.notes,
      createdAt: created.createdAt
    }
  }

  async deletePayment(id: string): Promise<boolean> {
    return this.deleteTransaction(id)
  }

  async getExpenses(): Promise<Expense[]> {
    const expenses = await this.getTransactions('expense')
    return expenses.map(t => ({
      id: t.id,
      date: t.date,
      category: t.legacyCategory || 'General',
      description: t.description,
      amount: t.amount,
      currency: t.currency,
      paymentMethod: t.paymentMethod || 'Card',
      vendor: t.vendor,
      reference: t.reference,
      notes: t.notes,
      attachmentId: t.attachmentId,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt
    }))
  }

  async createExpense(data: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>): Promise<Expense> {
    const created = await this.createTransaction({
      type: 'expense',
      amount: data.amount,
      currency: data.currency,
      date: data.date,
      description: data.description,
      paymentMethod: data.paymentMethod,
      vendor: data.vendor,
      reference: data.reference,
      notes: data.notes,
      legacyCategory: data.category,
      attachmentId: data.attachmentId
    })

    return {
      id: created.id,
      date: created.date,
      category: created.legacyCategory || 'General',
      description: created.description,
      amount: created.amount,
      currency: created.currency,
      paymentMethod: created.paymentMethod || 'Card',
      vendor: created.vendor,
      reference: created.reference,
      notes: created.notes,
      attachmentId: created.attachmentId,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt
    }
  }

  async updateExpense(id: string, updates: Partial<Expense>): Promise<Expense | null> {
    const updated = await this.updateTransaction(id, {
      amount: updates.amount,
      currency: updates.currency,
      date: updates.date,
      description: updates.description,
      paymentMethod: updates.paymentMethod,
      vendor: updates.vendor,
      reference: updates.reference,
      notes: updates.notes,
      legacyCategory: updates.category,
      attachmentId: updates.attachmentId
    })
    if (!updated) return null

    return {
      id: updated.id,
      date: updated.date,
      category: updated.legacyCategory || 'General',
      description: updated.description,
      amount: updated.amount,
      currency: updated.currency,
      paymentMethod: updated.paymentMethod || 'Card',
      vendor: updated.vendor,
      reference: updated.reference,
      notes: updated.notes,
      attachmentId: updated.attachmentId,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt
    }
  }

  async deleteExpense(id: string): Promise<boolean> {
    return this.deleteTransaction(id)
  }

  // --- FINANCIAL CALCULATIONS & SUMMARIES ---
  async getFinancialOverview(
    filter: DateRangeFilter = 'this_month',
    customRange?: { start?: string; end?: string }
  ) {
    const invoices = await this.getInvoices()
    const transactions = await this.getTransactions()

    // 1. Invoices in range (excluding Cancelled)
    const activeInvoices = invoices.filter(
      i => i.status !== 'Cancelled' && isDateInRange(i.invoiceDate, filter, customRange)
    )

    const totalInvoiced = roundMoney(
      activeInvoices.reduce((sum, inv) => sum + inv.total, 0)
    )

    // 2. Income recorded in range = ACTUAL CASH RECEIVED
    const rangeIncome = transactions.filter(t =>
      t.type === 'income' && isDateInRange(t.date, filter, customRange)
    )

    const receivedIncome = roundMoney(
      rangeIncome.reduce((sum, t) => sum + t.amount, 0)
    )

    // 3. Expenses in range
    const rangeExpenses = transactions.filter(t =>
      t.type === 'expense' && isDateInRange(t.date, filter, customRange)
    )

    const totalExpenses = roundMoney(
      rangeExpenses.reduce((sum, t) => sum + t.amount, 0)
    )

    // 4. Net Cash Income = Received Cash - Total Expenses
    const netCashIncome = roundMoney(receivedIncome - totalExpenses)

    // 5. Total Outstanding across all non-cancelled invoices
    let totalOutstanding = 0
    let unpaidCount = 0
    let overdueCount = 0

    const incomeTxns = transactions.filter(t => t.type === 'income')

    invoices
      .filter(i => i.status !== 'Cancelled')
      .forEach(inv => {
        const invPayments = incomeTxns.filter(p => p.invoiceId === inv.id)
        const paid = roundMoney(invPayments.reduce((acc, p) => acc + p.amount, 0))
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

    return {
      totalInvoiced,
      receivedIncome,
      totalExpenses,
      netCashIncome,
      totalOutstanding,
      unpaidCount,
      overdueCount,
      invoiceCount: activeInvoices.length,
      paymentCount: rangeIncome.length,
      expenseCount: rangeExpenses.length,
      transactionCount: rangeIncome.length + rangeExpenses.length
    }
  }

  async getClientFinancialProfile(clientId: string) {
    const client = await this.getClientById(clientId)
    const invoices = (await this.getInvoices()).filter(i => i.clientId === clientId && i.status !== 'Cancelled')
    const transactions = (await this.getTransactions('income')).filter(p => p.clientId === clientId)

    const totalInvoiced = roundMoney(invoices.reduce((acc, i) => acc + i.total, 0))
    const totalPaid = roundMoney(transactions.reduce((acc, p) => acc + p.amount, 0))
    const outstanding = roundMoney(Math.max(0, totalInvoiced - totalPaid))

    return {
      client,
      invoices,
      payments: transactions,
      transactions,
      totalInvoiced,
      totalPaid,
      outstanding
    }
  }

  async getInvoiceBalance(invoiceId: string) {
    const inv = await this.getInvoiceById(invoiceId)
    if (!inv) return { total: 0, paid: 0, balance: 0, isPaid: false }

    const payments = (await this.getTransactions('income')).filter(p => p.invoiceId === invoiceId)
    const paid = roundMoney(payments.reduce((acc, p) => acc + p.amount, 0))
    const balance = roundMoney(Math.max(0, inv.total - paid))

    return {
      total: roundMoney(inv.total),
      paid,
      balance,
      isPaid: balance === 0 && inv.total > 0
    }
  }
}

export const financeService = new FinanceServiceImpl()

// ==================== CSV EXPORT UTILITIES ====================

export function exportTransactionsToCSV(
  transactions: Transaction[],
  clients: Client[],
  invoices: Invoice[]
): void {
  const clientMap = new Map(clients.map(c => [c.id, c.name || c.companyName || 'Unknown']))
  const invoiceMap = new Map(invoices.map(i => [i.id, i.invoiceNumber]))

  const headers = [
    'Date',
    'Type',
    'Amount',
    'Currency',
    'Description',
    'Client / Vendor',
    'Invoice #',
    'Payment Method',
    'Reference',
    'Receipt #',
    'Notes'
  ]
  const escape = (val: string | number | undefined) => `"${String(val ?? '').replace(/"/g, '""')}"`

  const rows = transactions.map(t => {
    const party = t.type === 'income'
      ? (t.clientId ? clientMap.get(t.clientId) || t.clientId : '')
      : (t.vendor || '')
    const inv = t.invoiceId ? (invoiceMap.get(t.invoiceId) || t.invoiceId) : ''

    return [
      escape(t.date),
      escape(t.type === 'income' ? 'Money In' : 'Money Out'),
      escape(t.amount),
      escape(t.currency),
      escape(t.description),
      escape(party),
      escape(inv),
      escape(t.paymentMethod),
      escape(t.reference),
      escape(t.receiptNumber),
      escape(t.notes)
    ]
  })

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n')
  downloadBlob(csv, `Transactions_${toLocalYYYYMMDD()}.csv`)
}

export function exportInvoicesToCSV(invoices: Invoice[], clients: Client[]): void {
  const clientMap = new Map(clients.map(c => [c.id, c.name || c.companyName || 'Unknown']))

  const headers = ['Invoice Number', 'Client', 'Date', 'Due Date', 'Currency', 'Subtotal', 'Tax (VAT)', 'Total', 'Status', 'Notes']
  const escape = (val: string | number | undefined) => `"${String(val ?? '').replace(/"/g, '""')}"`

  const rows = invoices.map(i => [
    escape(i.invoiceNumber),
    escape(clientMap.get(i.clientId) || i.clientId),
    escape(i.invoiceDate),
    escape(i.dueDate),
    escape(i.currency),
    escape(i.subtotal),
    escape(i.taxAmount),
    escape(i.total),
    escape(i.status),
    escape(i.notes)
  ])

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n')
  downloadBlob(csv, `Invoices_${toLocalYYYYMMDD()}.csv`)
}

export function exportPaymentsToCSV(payments: Payment[], clients: Client[], invoices: Invoice[]): void {
  const clientMap = new Map(clients.map(c => [c.id, c.name || c.companyName || 'Unknown']))
  const invoiceMap = new Map(invoices.map(i => [i.id, i.invoiceNumber]))

  const headers = ['Receipt #', 'Invoice #', 'Client', 'Date', 'Amount', 'Currency', 'Method', 'Reference', 'Notes']
  const escape = (val: string | number | undefined) => `"${String(val ?? '').replace(/"/g, '""')}"`

  const rows = payments.map(p => [
    escape(p.receiptNumber),
    escape(invoiceMap.get(p.invoiceId) || p.invoiceId),
    escape(clientMap.get(p.clientId) || p.clientId),
    escape(p.paymentDate),
    escape(p.amount),
    escape(p.currency),
    escape(p.paymentMethod),
    escape(p.reference),
    escape(p.notes)
  ])

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n')
  downloadBlob(csv, `Payments_${toLocalYYYYMMDD()}.csv`)
}

export function exportExpensesToCSV(expenses: Expense[]): void {
  const headers = ['Date', 'Category', 'Description', 'Amount', 'Currency', 'Payment Method', 'Vendor', 'Reference', 'Notes']
  const escape = (val: string | number | undefined) => `"${String(val ?? '').replace(/"/g, '""')}"`

  const rows = expenses.map(e => [
    escape(e.date),
    escape(e.category),
    escape(e.description),
    escape(e.amount),
    escape(e.currency),
    escape(e.paymentMethod),
    escape(e.vendor),
    escape(e.reference),
    escape(e.notes)
  ])

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n')
  downloadBlob(csv, `Expenses_${toLocalYYYYMMDD()}.csv`)
}

function downloadBlob(content: string, filename: string) {
  const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
