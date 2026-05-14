import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { jsonResponse, errorResponse, parseBody, createAuditLog } from '@/lib/api-helpers'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const po = await prisma.purchaseOrder.findUnique({ where: { id: params.id } })
    if (!po) return errorResponse('Purchase order not found', 404)
    return jsonResponse(po)
  } catch (err) {
    return errorResponse('Failed to fetch purchase order', 500, { details: (err as Error).message })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const body = await parseBody(request)
  if (!body) return errorResponse('Invalid JSON body', 400)

  try {
    const { _user, ...data } = body
    const po = await prisma.purchaseOrder.update({ where: { id: params.id }, data })
    await createAuditLog({ user: _user || 'System', module: 'PurchaseOrder', action: 'UPDATED', target: po.number })
    return jsonResponse(po)
  } catch (err) {
    if ((err as { code?: string }).code === 'P2025') return errorResponse('Purchase order not found', 404)
    return errorResponse('Failed to update purchase order', 500, { details: (err as Error).message })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const po = await prisma.purchaseOrder.delete({ where: { id: params.id } })
    await createAuditLog({ user: 'System', module: 'PurchaseOrder', action: 'DELETED', target: po.number })
    return jsonResponse({ success: true })
  } catch (err) {
    if ((err as { code?: string }).code === 'P2025') return errorResponse('Purchase order not found', 404)
    return errorResponse('Failed to delete purchase order', 500, { details: (err as Error).message })
  }
}
