import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { jsonResponse, errorResponse, parseBody, parsePagination, buildSearchFilter, createAuditLog, generateDocNumber, generateCompanyDocNumber } from '@/lib/api-helpers'
import { quotationSchema, validateBody } from '@/lib/validations'

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const { page, limit, skip } = parsePagination(url)
    const q = url.searchParams.get('q')
    const status = url.searchParams.get('status')
    const customer = url.searchParams.get('customer')

    const where: Record<string, unknown> = { ...buildSearchFilter(q, ['number', 'customer', 'project']) }
    if (status) where.status = status
    if (customer) where.customer = { contains: customer, mode: 'insensitive' }

    const [items, total] = await Promise.all([
      prisma.quotation.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.quotation.count({ where }),
    ])

    return jsonResponse({ items, total, page, limit, pages: Math.ceil(total / limit) })
  } catch (err) {
    return errorResponse('Failed to fetch quotations', 500, { details: (err as Error).message })
  }
}

export async function POST(request: NextRequest) {
  const body = await parseBody(request)
  const validation = validateBody(quotationSchema, body)
  if (!validation.success) return errorResponse(validation.error, 400)

  const { _user, _action, companyCode, ...data } = validation.data

  try {
    const number = data.number || (companyCode
      ? await generateCompanyDocNumber(companyCode, 'Q', 'quotation')
      : await generateDocNumber('AB-QT', 'quotation'))
    const total = data.items
      ? data.items.reduce((s, i) => s + (Number(i.q) || 0) * (Number(i.r) || 0), 0)
      : (data.total || 0)

    const quotation = await prisma.quotation.create({
      data: {
        number, rev: data.rev || 0, customer: data.customer,
        project: data.project || '', date: data.date || new Date().toISOString().slice(0, 10),
        validity: data.validity || '', status: data.status || 'DRAFT',
        total, items: data.items || [], terms: data.terms || '',
      },
    })

    await createAuditLog({ user: _user || 'System', module: 'Quotation', action: 'CREATED', target: quotation.number })
    return jsonResponse(quotation, 201)
  } catch (err) {
    if ((err as { code?: string }).code === 'P2002') return errorResponse('Quotation number already exists', 409)
    return errorResponse('Failed to create quotation', 500, { details: (err as Error).message })
  }
}
