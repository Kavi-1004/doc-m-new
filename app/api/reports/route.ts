import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { jsonResponse, errorResponse } from '@/lib/api-helpers'

function buildDateFilter(from: string | null, to: string | null): Record<string, unknown> | undefined {
  if (!from && !to) return undefined
  const filter: Record<string, unknown> = {}
  if (from) filter.gte = new Date(from)
  if (to) filter.lte = new Date(to + 'T23:59:59.999Z')
  return filter
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const type = url.searchParams.get('type') || 'summary'
    const from = url.searchParams.get('from')
    const to = url.searchParams.get('to')

    const dateFilter = buildDateFilter(from, to)
    const invoiceWhere = dateFilter ? { createdAt: dateFilter } : {}
    const expenseWhere = dateFilter ? { createdAt: dateFilter } : {}
    const quotationWhere = dateFilter ? { createdAt: dateFilter } : {}
    const poWhere = dateFilter ? { createdAt: dateFilter } : {}

    const [invoices, expenses, quotations, purchaseOrders] = await Promise.all([
      prisma.invoice.findMany({ where: invoiceWhere }),
      prisma.expense.findMany({ where: expenseWhere }),
      prisma.quotation.findMany({ where: quotationWhere }),
      prisma.purchaseOrder.findMany({ where: poWhere }),
    ])

    if (type === 'profit-loss') {
      const revenue = invoices.filter(i => i.status === 'PAID').reduce((s, i) => s + i.total, 0)
      const totalExp = expenses.reduce((s, e) => s + e.amount, 0)
      return jsonResponse({ revenue, expenses: totalExp, netProfit: revenue - totalExp, period: { from, to } })
    }

    if (type === 'receivables') {
      const items = invoices.filter(i => i.status !== 'PAID' && i.status !== 'VOID').map(i => ({
        number: i.number, customer: i.customer, total: i.total, paid: i.paid,
        outstanding: i.total - i.paid, status: i.status, due: i.due,
      }))
      const sorted = items.sort((a, b) => b.outstanding - a.outstanding)
      return jsonResponse({ items: sorted, totalOutstanding: items.reduce((s, i) => s + i.outstanding, 0), period: { from, to } })
    }

    if (type === 'payables') {
      const items = purchaseOrders.filter(p => p.status !== 'COMPLETED' && p.status !== 'CANCELLED').map(p => ({
        number: p.number, supplier: p.supplier, amount: p.amount, status: p.status,
      }))
      const sorted = items.sort((a, b) => b.amount - a.amount)
      return jsonResponse({ items: sorted, totalPayable: items.reduce((s, i) => s + i.amount, 0), period: { from, to } })
    }

    if (type === 'expense-breakdown') {
      const byCategory: Record<string, number> = {}
      for (const e of expenses) {
        byCategory[e.category] = (byCategory[e.category] || 0) + e.amount
      }
      const breakdown = Object.entries(byCategory)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
      return jsonResponse({ breakdown, totalExpenses: expenses.reduce((s, e) => s + e.amount, 0), period: { from, to } })
    }

    if (type === 'revenue-by-month') {
      const byMonth: Record<string, { revenue: number; expenses: number }> = {}
      for (const i of invoices) {
        const m = i.date.slice(0, 7)
        if (!byMonth[m]) byMonth[m] = { revenue: 0, expenses: 0 }
        byMonth[m].revenue += i.total
      }
      for (const e of expenses) {
        const m = e.date.slice(0, 7)
        if (!byMonth[m]) byMonth[m] = { revenue: 0, expenses: 0 }
        byMonth[m].expenses += e.amount
      }
      const months = Object.entries(byMonth)
        .map(([m, data]) => ({ m, ...data }))
        .sort((a, b) => a.m.localeCompare(b.m))
      return jsonResponse({ months, period: { from, to } })
    }

    const paidInvoices = invoices.filter(i => i.status === 'PAID')
    const totalRevenue = invoices.reduce((s, i) => s + i.total, 0)
    const totalCollected = paidInvoices.reduce((s, i) => s + i.paid, 0)
    const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0)
    const totalOutstanding = invoices
      .filter(i => i.status !== 'PAID' && i.status !== 'VOID')
      .reduce((s, i) => s + (i.total - i.paid), 0)

    return jsonResponse({
      totalRevenue,
      totalCollected,
      totalExpenses,
      netProfit: totalCollected - totalExpenses,
      totalOutstanding,
      totalQuotations: quotations.length,
      totalPOs: purchaseOrders.length,
      invoiceCount: invoices.length,
      quotationsByStatus: {
        draft: quotations.filter(q => q.status === 'DRAFT').length,
        sent: quotations.filter(q => q.status === 'SENT').length,
        approved: quotations.filter(q => q.status === 'APPROVED').length,
        rejected: quotations.filter(q => q.status === 'REJECTED').length,
      },
      period: { from, to },
    })
  } catch (err) {
    return errorResponse('Failed to generate report', 500, { details: (err as Error).message })
  }
}
