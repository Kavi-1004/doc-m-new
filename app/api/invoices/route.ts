import { NextRequest } from 'next/server'
import { Prisma } from '@prisma/client'
import prisma from '@/lib/prisma'
import { jsonResponse, errorResponse, parseBody, parsePagination, buildSearchFilter, createAuditLog, generateDocNumber, generateCompanyDocNumber } from '@/lib/api-helpers'
import { invoiceSchema, validateBody } from '@/lib/validations'

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
      prisma.invoice.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.invoice.count({ where }),
    ])

    return jsonResponse({ items, total, page, limit, pages: Math.ceil(total / limit) })
  } catch (err) {
    return errorResponse('Failed to fetch invoices', 500, { details: (err as Error).message })
  }
}

export async function POST(request: NextRequest) {
  const body = await parseBody(request)
  const validation = validateBody(invoiceSchema, body)
  if (!validation.success) return errorResponse(validation.error, 400)

  const { _user, companyCode, ...data } = validation.data

  try {
    const number = data.number || (companyCode
      ? await generateCompanyDocNumber(companyCode, 'INV', 'invoice')
      : await generateDocNumber('AB-INV', 'invoice'))
    const invoice = await prisma.invoice.create({
      data: {
        number, customer: data.customer, linkedQuote: data.linkedQuote || '',
        date: data.date || new Date().toISOString().slice(0, 10),
        due: data.due || '', total: data.total || 0, paid: data.paid || 0,
        status: data.status || 'UNPAID', progressPct: data.progressPct || 0,
        projectTotal: data.projectTotal || 0, billedToDate: data.billedToDate || 0,
        items: (data.items || []) as unknown as Prisma.InputJsonValue, notes: data.notes || '',
      },
    })

    await createAuditLog({ user: _user || 'System', module: 'Invoice', action: 'CREATED', target: invoice.number })
    return jsonResponse(invoice, 201)
  } catch (err) {
    if ((err as { code?: string }).code === 'P2002') return errorResponse('Invoice number already exists', 409)
    return errorResponse('Failed to create invoice', 500, { details: (err as Error).message })
  }
}
