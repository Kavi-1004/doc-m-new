import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { jsonResponse, errorResponse, parseBody, createAuditLog } from '@/lib/api-helpers'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const invoice = await prisma.invoice.findUnique({ where: { id: params.id } })
    if (!invoice) return errorResponse('Invoice not found', 404)
    return jsonResponse(invoice)
  } catch (err) {
    return errorResponse('Failed to fetch invoice', 500, { details: (err as Error).message })
  }
}

function computeInvoiceStatus(total: number, paid: number, due: string, currentStatus: string): string {
  if (currentStatus === 'VOID') return 'VOID'
  if (paid >= total && total > 0) return 'PAID'
  if (paid > 0 && paid < total) return 'PARTIAL'
  if (due && new Date(due) < new Date() && paid < total) return 'OVERDUE'
  return 'UNPAID'
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const body = await parseBody(request)
  if (!body) return errorResponse('Invalid JSON body', 400)

  try {
    const existing = await prisma.invoice.findUnique({ where: { id: params.id } })
    if (!existing) return errorResponse('Invoice not found', 404)

    const { _user, companyCode, ...data } = body

    const total = data.total ?? existing.total
    const paid = data.paid ?? existing.paid
    const due = data.due ?? existing.due
    const currentStatus = data.status ?? existing.status

    if (!data.status || data.status !== 'VOID') {
      data.status = computeInvoiceStatus(total, paid, due, currentStatus)
    }

    const invoice = await prisma.invoice.update({ where: { id: params.id }, data })
    await createAuditLog({ user: _user || 'System', module: 'Invoice', action: 'UPDATED', target: invoice.number })
    return jsonResponse(invoice)
  } catch (err) {
    if ((err as { code?: string }).code === 'P2025') return errorResponse('Invoice not found', 404)
    return errorResponse('Failed to update invoice', 500, { details: (err as Error).message })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const existing = await prisma.invoice.findUnique({ where: { id: params.id } })
    if (!existing) return errorResponse('Invoice not found', 404)

    const invoice = await prisma.invoice.update({
      where: { id: params.id },
      data: { status: 'VOID' },
    })
    await createAuditLog({ user: 'System', module: 'Invoice', action: 'VOIDED', target: invoice.number })
    return jsonResponse({ success: true })
  } catch (err) {
    if ((err as { code?: string }).code === 'P2025') return errorResponse('Invoice not found', 404)
    return errorResponse('Failed to void invoice', 500, { details: (err as Error).message })
  }
}
