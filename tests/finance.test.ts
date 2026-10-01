import { describe, it, expect, beforeEach } from 'vitest'
import {
  financeService,
  formatMoney,
  roundMoney,
  INITIAL_TRANSACTIONS
} from '@/services/finance'
import { storageService } from '@/services/storage'
import { Invoice, InvoiceItem, Payment, Expense, Transaction } from '@/types'

describe('Finance Service - Precision Calculations & Invariants', () => {
  it('prevents floating point errors in currency rounding', () => {
    // Classic JavaScript floating point trap: 0.1 + 0.2 = 0.30000000000000004
    const sum = 0.1 + 0.2
    expect(sum).not.toBe(0.3)
    expect(roundMoney(sum)).toBe(0.3)

    // Fils / Cent rounding
    expect(roundMoney(1234.567)).toBe(1234.57)
    expect(roundMoney(1234.564)).toBe(1234.56)
  })

  it('formats currency correctly without NaN leaks', () => {
    expect(formatMoney(1500, 'AED')).toContain('1,500.00')
    expect(formatMoney(0, 'USD')).toContain('0.00')
    expect(formatMoney(NaN, 'AED')).toContain('0.00')
  })

  it('calculates invoice totals, VAT and balance accurately', () => {
    const items: InvoiceItem[] = [
      { id: 'it-1', description: 'Legal Consultancy', quantity: 2, unitPrice: 1000, amount: 2000 },
      { id: 'it-2', description: 'Document Translation', quantity: 1, unitPrice: 350.50, amount: 350.50 }
    ]

    const subtotal = items.reduce((acc, it) => acc + (it.quantity * it.unitPrice), 0)
    expect(roundMoney(subtotal)).toBe(2350.50)

    const vatRate = 0.05 // 5% UAE standard VAT
    const vatAmount = roundMoney(subtotal * vatRate)
    expect(vatAmount).toBe(117.53) // 2350.50 * 0.05 = 117.525 -> 117.53

    const total = roundMoney(subtotal + vatAmount)
    expect(total).toBe(2468.03)

    // Partial payments
    const payments: Payment[] = [
      { id: 'p-1', invoiceId: 'inv-1', clientId: 'c-1', amount: 1000, paymentDate: '2026-10-01', paymentMethod: 'Bank Transfer' }
    ]

    const totalPaid = payments.reduce((acc, p) => acc + p.amount, 0)
    const balanceDue = roundMoney(total - totalPaid)
    expect(balanceDue).toBe(1468.03)
    expect(balanceDue).toBeGreaterThan(0)
  })
})

describe('Finance Service - Unified Transactions Architecture & Zero-Data-Loss Migration', () => {
  beforeEach(async () => {
    // Reset test storage keys
    await storageService.remove('finance_transactions')
    await storageService.remove('finance_payments')
    await storageService.remove('finance_expenses')
  })

  it('automatically migrates legacy payments and expenses into unified transactions', async () => {
    // Simulate legacy storage state with separate payments and expenses
    const legacyPayments: Payment[] = [
      {
        id: 'legacy-pay-1',
        receiptNumber: 'REC-2026/88',
        invoiceId: 'inv-1',
        clientId: 'client-1',
        amount: 3500,
        currency: 'AED',
        paymentDate: '2026-09-15',
        paymentMethod: 'Bank Transfer',
        reference: 'TXN-LEGACY-01',
        notes: 'Deposit settlement',
        createdAt: 1726358400000
      }
    ]

    const legacyExpenses: Expense[] = [
      {
        id: 'legacy-exp-1',
        date: '2026-09-16',
        category: 'Office Rent',
        description: 'Office Rent Q3',
        amount: 5000,
        currency: 'AED',
        paymentMethod: 'Card',
        vendor: 'Landlord Holdings',
        reference: 'RENT-Q3',
        notes: 'Paid on time',
        createdAt: 1726444800000,
        updatedAt: 1726444800000
      }
    ]

    await storageService.set('finance_payments', legacyPayments)
    await storageService.set('finance_expenses', legacyExpenses)

    // Query unified transactions
    const txns = await financeService.getTransactions()
    expect(txns.length).toBe(2)

    // Verify income transaction migrated correctly
    const incomeTxn = txns.find(t => t.id === 'legacy-pay-1')
    expect(incomeTxn).toBeDefined()
    expect(incomeTxn?.type).toBe('income')
    expect(incomeTxn?.amount).toBe(3500)
    expect(incomeTxn?.receiptNumber).toBe('REC-2026/88')
    expect(incomeTxn?.invoiceId).toBe('inv-1')
    expect(incomeTxn?.clientId).toBe('client-1')

    // Verify expense transaction migrated correctly with legacy category safely preserved
    const expenseTxn = txns.find(t => t.id === 'legacy-exp-1')
    expect(expenseTxn).toBeDefined()
    expect(expenseTxn?.type).toBe('expense')
    expect(expenseTxn?.amount).toBe(5000)
    expect(expenseTxn?.vendor).toBe('Landlord Holdings')
    expect(expenseTxn?.legacyCategory).toBe('Office Rent')
  })

  it('supports unified transaction CRUD operations without category requirement', async () => {
    // Create Money Out transaction (no category required!)
    const expenseTxn = await financeService.createTransaction({
      type: 'expense',
      amount: 150.75,
      currency: 'AED',
      date: '2026-10-01',
      description: 'Document Courier Delivery',
      paymentMethod: 'Cash',
      vendor: 'Aramex'
    })

    expect(expenseTxn.id).toBeDefined()
    expect(expenseTxn.amount).toBe(150.75)
    expect(expenseTxn.legacyCategory).toBeUndefined() // No category required or assigned!

    // Create Money In transaction with automatic receipt numbering
    const incomeTxn = await financeService.createTransaction({
      type: 'income',
      amount: 4200,
      currency: 'AED',
      date: '2026-10-01',
      description: 'Retainer Fee',
      clientId: 'client-1'
    })

    expect(incomeTxn.receiptNumber).toMatch(/^REC-\d{4}\/\d+$/)

    // Verify query by type
    const expenses = await financeService.getTransactions('expense')
    expect(expenses.some(t => t.id === expenseTxn.id)).toBe(true)
    expect(expenses.some(t => t.id === incomeTxn.id)).toBe(false)

    // Update transaction
    const updated = await financeService.updateTransaction(expenseTxn.id, {
      amount: 175.50
    })
    expect(updated?.amount).toBe(175.50)

    // Delete transaction
    const deleted = await financeService.deleteTransaction(expenseTxn.id)
    expect(deleted).toBe(true)

    const remaining = await financeService.getTransactions('expense')
    expect(remaining.some(t => t.id === expenseTxn.id)).toBe(false)
  })

  it('provides backwards-compatible adapters for legacy components', async () => {
    // Test getPayments() and getExpenses() mapping
    const payments = await financeService.getPayments()
    expect(Array.isArray(payments)).toBe(true)

    const expenses = await financeService.getExpenses()
    expect(Array.isArray(expenses)).toBe(true)

    // Test recordPayment adapter
    const newPayment = await financeService.recordPayment({
      receiptNumber: 'REC-TEST/01',
      invoiceId: 'inv-1',
      clientId: 'client-1',
      amount: 800,
      currency: 'AED',
      paymentDate: '2026-10-01',
      paymentMethod: 'Bank Transfer'
    })

    expect(newPayment.id).toBeDefined()
    expect(newPayment.amount).toBe(800)

    // Underlying transaction is recorded as income
    const txn = await financeService.getTransactionById(newPayment.id)
    expect(txn?.type).toBe('income')
    expect(txn?.amount).toBe(800)
  })
})

