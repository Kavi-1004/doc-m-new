import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { jsonResponse, errorResponse } from '@/lib/api-helpers'

function inRange(dateStr: string, from?: string, to?: string): boolean {
  if (!from && !to) return true
  const d = dateStr.slice(0, 10)
  if (from && d < from) return false
  if (to && d > to) return false
  return true
}

export async function GET(request: NextRequest) {
  try {
    const from = request.nextUrl.searchParams.get('from') || undefined
    const to = request.nextUrl.searchParams.get('to') || undefined

    const [
      quotations, invoices, expenses, purchaseOrders, deliveryOrders,
      customers, suppliers, recentLogs
    ] = await Promise.all([
      prisma.quotation.findMany(),
      prisma.invoice.findMany(),
      prisma.expense.findMany(),
      prisma.purchaseOrder.findMany(),
      prisma.deliveryOrder.findMany(),
      prisma.customer.count(),
      prisma.supplier.count(),
      prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' }, take: 10 }),
    ])

    const filteredInvoices = invoices.filter(i => inRange(i.date, from, to))
    const filteredExpenses = expenses.filter(e => inRange(e.date, from, to))
    const filteredQuotations = quotations.filter(q => inRange(q.date, from, to))
    const filteredPOs = purchaseOrders.filter(p => inRange(p.date, from, to))
    const filteredDOs = deliveryOrders.filter(d => inRange(d.date, from, to))

    const totalRevenue = filteredInvoices.reduce((s, i) => s + i.total, 0)
    const totalExpenses = filteredExpenses.reduce((s, e) => s + e.amount, 0)
    const totalOutstanding = filteredInvoices
      .filter(i => i.status !== 'PAID' && i.status !== 'VOID')
      .reduce((s, i) => s + (i.total - i.paid), 0)
    const activeQuotations = filteredQuotations.filter(q => ['DRAFT', 'SENT'].includes(q.status)).length
    const margin = totalRevenue > 0 ? ((totalRevenue - totalExpenses) / totalRevenue * 100) : 0

    const expenseByCategory: Record<string, number> = {}
    for (const e of filteredExpenses) {
      expenseByCategory[e.category] = (expenseByCategory[e.category] || 0) + e.amount
    }
    const categoryColors: Record<string, string> = {
      MATERIAL: '#0ea5e9', LABOR: '#6366f1', TRANSPORT: '#f59e0b',
      SUBCONTRACT: '#ef4444', SITE_VISIT: '#ec4899', ADMIN: '#8b5cf6',
      OTHER: '#64748b',
    }
    const expenseBreakdown = Object.entries(expenseByCategory)
      .map(([name, value]) => ({ name, value, fill: categoryColors[name] || '#64748b' }))
      .sort((a, b) => b.value - a.value)

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const revenueByMonth = months.map((m, i) => {
      const rev = filteredInvoices.filter(inv => { const d = new Date(inv.date); return d.getMonth() === i }).reduce((s, inv) => s + inv.total, 0)
      const exp = filteredExpenses.filter(e => { const d = new Date(e.date); return d.getMonth() === i }).reduce((s, e) => s + e.amount, 0)
      return { m, revenue: rev, expenses: exp }
    })

    return jsonResponse({
      kpis: { totalRevenue, totalExpenses, totalOutstanding, activeQuotations, customers, suppliers, margin },
      revenueByMonth,
      expenseBreakdown,
      statusBreakdown: {
        quotations: groupByStatus(filteredQuotations),
        invoices: groupByStatus(filteredInvoices),
        purchaseOrders: groupByStatus(filteredPOs),
        deliveryOrders: groupByStatus(filteredDOs),
      },
      recentActivity: recentLogs,
    })
  } catch (err) {
    return errorResponse('Failed to fetch dashboard', 500, { details: (err as Error).message })
  }
}

function groupByStatus(items: { status: string }[]) {
  const map: Record<string, number> = {}
  items.forEach(i => { map[i.status] = (map[i.status] || 0) + 1 })
  return Object.entries(map).map(([status, count]) => ({ status, count }))
}
