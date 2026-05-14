import { NextRequest } from 'next/server'
import { Prisma } from '@prisma/client'
import prisma from '@/lib/prisma'
import { jsonResponse, errorResponse, parseBody, createAuditLog, generateCompanyDocNumber, generateDocNumber } from '@/lib/api-helpers'

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
    const existing = await prisma.purchaseOrder.findUnique({ where: { id: params.id } })
    if (!existing) return errorResponse('Purchase order not found', 404)

    if (body._action === 'generate_do') {
      const companyCode = body.companyCode || ''
      const poItems = (existing.items as Array<Record<string, unknown>>) || []
      const doItems = poItems.map(i => ({
        d: i.d || '', q: Number(i.q) || 0, u: i.u || 'pcs',
      }))
      const totalItems = doItems.reduce((s, i) => s + i.q, 0)
      const number = companyCode
        ? await generateCompanyDocNumber(companyCode, 'DO', 'deliveryOrder')
        : await generateDocNumber('AB-DO', 'deliveryOrder')

      const dor = await prisma.deliveryOrder.create({
        data: {
          number, customer: existing.supplier,
          linkedQuote: existing.linkedQuote,
          date: new Date().toISOString().slice(0, 10),
          items: totalItems, status: 'DISPATCHED',
          lineItems: doItems as unknown as Prisma.InputJsonValue,
          notes: `Generated from PO ${existing.number}`,
          shippingAddress: '', poNumber: existing.number,
        },
      })

      await createAuditLog({
        user: body._user || 'System', module: 'DeliveryOrder',
        action: 'CREATED', target: `${dor.number} from PO ${existing.number}`,
      })
      return jsonResponse(dor, 201)
    }

    const { _user, _action, companyCode, ...data } = body
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
