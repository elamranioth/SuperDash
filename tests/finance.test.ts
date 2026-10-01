import { describe, it, expect } from 'vitest'
import { formatMoney, roundMoney } from '@/services/finance'
import { Invoice, InvoiceItem, Payment } from '@/types'

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
