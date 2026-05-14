import { NextRequest } from 'next/server'
import { Prisma } from '@prisma/client'
import prisma from '@/lib/prisma'
import { jsonResponse, errorResponse, parseBody, createAuditLog, generateCompanyDocNumber, generateDocNumber } from '@/lib/api-helpers'

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
    const existing = await prisma.deliveryOrder.findUnique({ where: { id: params.id } })
    if (!existing) return errorResponse('Delivery order not found', 404)

    if (body._action === 'generate_invoice') {
      const companyCode = body.companyCode || ''
      const doLineItems = (existing.lineItems as Array<Record<string, unknown>>) || []
      const invItems = doLineItems.map(i => ({
        d: i.d || '', q: Number(i.q) || 0, r: 0, t: 0,
      }))

      const number = companyCode
        ? await generateCompanyDocNumber(companyCode, 'INV', 'invoice')
        : await generateDocNumber('AB-INV', 'invoice')

      const invoice = await prisma.invoice.create({
        data: {
          number, customer: existing.customer,
          linkedQuote: existing.linkedQuote,
          date: new Date().toISOString().slice(0, 10),
          due: '', total: 0, paid: 0, status: 'UNPAID',
          items: invItems as unknown as Prisma.InputJsonValue,
          notes: `Generated from DO ${existing.number}`,
          poNumber: existing.poNumber || existing.number,
          project: existing.project,
          attnName: existing.attnName, attnEmail: existing.attnEmail,
          salesPerson: existing.salesPerson,
        },
      })

      await createAuditLog({
        user: body._user || 'System', module: 'Invoice',
        action: 'CREATED', target: `${invoice.number} from DO ${existing.number}`,
      })
      return jsonResponse(invoice, 201)
    }

    const { _user, _action, companyCode, ...data } = body
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
