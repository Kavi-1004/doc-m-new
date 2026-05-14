import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { jsonResponse, errorResponse, parseBody, createAuditLog } from '@/lib/api-helpers'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const dor = await prisma.deliveryOrder.findUnique({ where: { id: params.id } })
    if (!dor) return errorResponse('Delivery order not found', 404)
    return jsonResponse(dor)
  } catch (err) {
    return errorResponse('Failed to fetch delivery order', 500, { details: (err as Error).message })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const body = await parseBody(request)
  if (!body) return errorResponse('Invalid JSON body', 400)

  try {
    const { _user, companyCode, ...data } = body
    const dor = await prisma.deliveryOrder.update({ where: { id: params.id }, data })
    await createAuditLog({ user: _user || 'System', module: 'DeliveryOrder', action: 'UPDATED', target: dor.number })
    return jsonResponse(dor)
  } catch (err) {
    if ((err as { code?: string }).code === 'P2025') return errorResponse('Delivery order not found', 404)
    return errorResponse('Failed to update delivery order', 500, { details: (err as Error).message })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const dor = await prisma.deliveryOrder.delete({ where: { id: params.id } })
    await createAuditLog({ user: 'System', module: 'DeliveryOrder', action: 'DELETED', target: dor.number })
    return jsonResponse({ success: true })
  } catch (err) {
    if ((err as { code?: string }).code === 'P2025') return errorResponse('Delivery order not found', 404)
    return errorResponse('Failed to delete delivery order', 500, { details: (err as Error).message })
  }
}
