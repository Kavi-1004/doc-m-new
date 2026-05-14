import { NextRequest } from 'next/server'
import { Prisma } from '@prisma/client'
import prisma from '@/lib/prisma'
import { jsonResponse, errorResponse, parseBody, parsePagination, buildSearchFilter, createAuditLog, generateDocNumber, generateCompanyDocNumber } from '@/lib/api-helpers'
import { deliveryOrderSchema, validateBody } from '@/lib/validations'

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const { page, limit, skip } = parsePagination(url)
    const q = url.searchParams.get('q')
    const status = url.searchParams.get('status')
    const customer = url.searchParams.get('customer')

    const where: Record<string, unknown> = { ...buildSearchFilter(q, ['number', 'customer', 'linkedQuote']) }
    if (status) where.status = status
    if (customer) where.customer = { contains: customer, mode: 'insensitive' }

    const [items, total] = await Promise.all([
      prisma.deliveryOrder.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.deliveryOrder.count({ where }),
    ])

    return jsonResponse({ items, total, page, limit, pages: Math.ceil(total / limit) })
  } catch (err) {
    return errorResponse('Failed to fetch delivery orders', 500, { details: (err as Error).message })
  }
}

export async function POST(request: NextRequest) {
  const body = await parseBody(request)
  const validation = validateBody(deliveryOrderSchema, body)
  if (!validation.success) return errorResponse(validation.error, 400)

  const { _user, companyCode, ...data } = validation.data

  try {
    const number = data.number || (companyCode
      ? await generateCompanyDocNumber(companyCode, 'DO', 'deliveryOrder')
      : await generateDocNumber('AB-DO', 'deliveryOrder'))
    const dor = await prisma.deliveryOrder.create({
      data: {
        number, customer: data.customer, linkedQuote: data.linkedQuote || '',
        date: data.date || new Date().toISOString().slice(0, 10),
        items: data.items || 0, status: data.status || 'DISPATCHED',
        lineItems: (data.lineItems || []) as unknown as Prisma.InputJsonValue, notes: data.notes || '',
        shippingAddress: data.shippingAddress || '',
      },
    })

    await createAuditLog({ user: _user || 'System', module: 'DeliveryOrder', action: 'CREATED', target: dor.number })
    return jsonResponse(dor, 201)
  } catch (err) {
    if ((err as { code?: string }).code === 'P2002') return errorResponse('DO number already exists', 409)
    return errorResponse('Failed to create delivery order', 500, { details: (err as Error).message })
  }
}
