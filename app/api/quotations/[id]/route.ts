import { NextRequest } from 'next/server'
import { Prisma } from '@prisma/client'
import prisma from '@/lib/prisma'
import { jsonResponse, errorResponse, parseBody, createAuditLog, generateDocNumber, generateCompanyDocNumber } from '@/lib/api-helpers'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const quotation = await prisma.quotation.findUnique({ where: { id: params.id } })
    if (!quotation) return errorResponse('Quotation not found', 404)
    return jsonResponse(quotation)
  } catch (err) {
    return errorResponse('Failed to fetch quotation', 500, { details: (err as Error).message })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const body = await parseBody(request)
  if (!body) return errorResponse('Invalid JSON body', 400)

  try {
    const existing = await prisma.quotation.findUnique({ where: { id: params.id } })
    if (!existing) return errorResponse('Quotation not found', 404)

    if (body._action === 'revise') {
      await prisma.quotation.update({
        where: { id: params.id },
        data: { status: 'SUPERSEDED' },
      })

      const newRev = existing.rev + 1
      const baseNumber = existing.number.replace(/-R\d+$/, '')
      const newNumber = `${baseNumber}-R${newRev}`

      const revised = await prisma.quotation.create({
        data: {
          number: newNumber,
          rev: newRev,
          customer: existing.customer,
          project: existing.project,
          date: new Date().toISOString().slice(0, 10),
          validity: existing.validity,
          status: 'DRAFT',
          total: existing.total,
          items: existing.items || [],
          terms: existing.terms,
        },
      })

      await createAuditLog({
        user: body._user || 'System',
        module: 'Quotation',
        action: 'REVISED',
        target: `${existing.number} → ${revised.number}`,
      })

      return jsonResponse(revised, 201)
    }

    if (body._action === 'generate_po') {
      const companyCode = body.companyCode || ''
      const qItems = (existing.items as Array<Record<string, unknown>>) || []
      const poItems = qItems.map(i => ({
        d: i.d || '', q: Number(i.q) || 0, u: i.u || 'pcs',
        r: Number(i.r) || 0, t: (Number(i.q) || 0) * (Number(i.r) || 0),
      }))
      const amount = poItems.reduce((s, i) => s + i.t, 0)
      const number = companyCode
        ? await generateCompanyDocNumber(companyCode, 'PO', 'purchaseOrder')
        : await generateDocNumber('AB-PO', 'purchaseOrder')

      const po = await prisma.purchaseOrder.create({
        data: {
          number, supplier: body.supplier || existing.customer,
          linkedQuote: existing.number,
          date: new Date().toISOString().slice(0, 10),
          amount, status: 'PENDING',
          items: poItems as unknown as Prisma.InputJsonValue,
          notes: `Generated from ${existing.number}`,
          expectedDelivery: '',
        },
      })

      await createAuditLog({
        user: body._user || 'System', module: 'PurchaseOrder',
        action: 'CREATED', target: `${po.number} from ${existing.number}`,
      })
      return jsonResponse(po, 201)
    }

    if (body._action === 'generate_do') {
      const companyCode = body.companyCode || ''
      const qItems = (existing.items as Array<Record<string, unknown>>) || []
      const doItems = qItems.map(i => ({
        d: i.d || '', q: Number(i.q) || 0, u: i.u || 'pcs',
      }))
      const totalItems = doItems.reduce((s, i) => s + i.q, 0)
      const number = companyCode
        ? await generateCompanyDocNumber(companyCode, 'DO', 'deliveryOrder')
        : await generateDocNumber('AB-DO', 'deliveryOrder')

      const dor = await prisma.deliveryOrder.create({
        data: {
          number, customer: existing.customer,
          linkedQuote: existing.number,
          date: new Date().toISOString().slice(0, 10),
          items: totalItems, status: 'DISPATCHED',
          lineItems: doItems as unknown as Prisma.InputJsonValue,
          notes: `Generated from ${existing.number}`,
          shippingAddress: '',
        },
      })

      await createAuditLog({
        user: body._user || 'System', module: 'DeliveryOrder',
        action: 'CREATED', target: `${dor.number} from ${existing.number}`,
      })
      return jsonResponse(dor, 201)
    }

    if (body._action === 'generate_invoice') {
      const companyCode = body.companyCode || ''
      const progressPct = Number(body.progressPct) || 100
      const qItems = (existing.items as Array<Record<string, unknown>>) || []
      const invItems = qItems.map(i => ({
        d: i.d || '', q: Number(i.q) || 0,
        r: Number(i.r) || 0, t: (Number(i.q) || 0) * (Number(i.r) || 0),
      }))
      const projectTotal = existing.total || invItems.reduce((s, i) => s + i.t, 0)

      const existingInvoices = await prisma.invoice.findMany({
        where: { linkedQuote: existing.number },
        select: { billedToDate: true, total: true },
      })
      const previouslyBilled = existingInvoices.reduce((s, inv) => s + (inv.total || 0), 0)
      const invoiceTotal = (projectTotal * progressPct / 100) - previouslyBilled
      if (invoiceTotal <= 0) {
        return errorResponse('Nothing left to invoice — already fully billed', 400)
      }

      const number = companyCode
        ? await generateCompanyDocNumber(companyCode, 'INV', 'invoice')
        : await generateDocNumber('AB-INV', 'invoice')

      const invoice = await prisma.invoice.create({
        data: {
          number, customer: existing.customer,
          linkedQuote: existing.number,
          date: new Date().toISOString().slice(0, 10),
          due: '', total: invoiceTotal, paid: 0, status: 'UNPAID',
          progressPct, projectTotal,
          billedToDate: previouslyBilled + invoiceTotal,
          items: invItems as unknown as Prisma.InputJsonValue,
          notes: `Partial invoice (${progressPct}%) from ${existing.number}`,
        },
      })

      await createAuditLog({
        user: body._user || 'System', module: 'Invoice',
        action: 'CREATED', target: `${invoice.number} from ${existing.number} (${progressPct}%)`,
      })
      return jsonResponse(invoice, 201)
    }

    const { _user, _action, companyCode, ...data } = body
    if (data.items && Array.isArray(data.items)) {
      const subtotal = data.items.reduce((s: number, i: { q?: number; r?: number }) =>
        s + (Number(i.q) || 0) * (Number(i.r) || 0), 0)
      data.total = subtotal - (Number(data.discount) || 0) + (Number(data.tax) || 0)
    }

    const quotation = await prisma.quotation.update({ where: { id: params.id }, data })
    await createAuditLog({ user: _user || 'System', module: 'Quotation', action: 'UPDATED', target: quotation.number })
    return jsonResponse(quotation)
  } catch (err) {
    if ((err as { code?: string }).code === 'P2025') return errorResponse('Quotation not found', 404)
    return errorResponse('Failed to update quotation', 500, { details: (err as Error).message })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const existing = await prisma.quotation.findUnique({ where: { id: params.id } })
    if (!existing) return errorResponse('Quotation not found', 404)
    if (existing.status !== 'DRAFT') return errorResponse('Only DRAFT quotations can be deleted', 400)

    await prisma.quotation.delete({ where: { id: params.id } })
    await createAuditLog({ user: 'System', module: 'Quotation', action: 'DELETED', target: existing.number })
    return jsonResponse({ success: true })
  } catch (err) {
    if ((err as { code?: string }).code === 'P2025') return errorResponse('Quotation not found', 404)
    return errorResponse('Failed to delete quotation', 500, { details: (err as Error).message })
  }
}
