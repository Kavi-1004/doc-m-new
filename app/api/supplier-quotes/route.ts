import { NextRequest } from 'next/server'
import { Prisma } from '@prisma/client'
import prisma from '@/lib/prisma'
import { jsonResponse, errorResponse, parseBody, parsePagination, buildSearchFilter, createAuditLog, generateDocNumber, generateCompanyDocNumber } from '@/lib/api-helpers'
import { supplierQuoteSchema, validateBody } from '@/lib/validations'

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const { page, limit, skip } = parsePagination(url)
    const q = url.searchParams.get('q')
    const status = url.searchParams.get('status')
    const supplier = url.searchParams.get('supplier')
    const linkedQuote = url.searchParams.get('linkedQuote')

    const where: Record<string, unknown> = { ...buildSearchFilter(q, ['number', 'supplier', 'linkedQuote']) }
    if (status) where.status = status
    if (supplier) where.supplier = { contains: supplier, mode: 'insensitive' }
    if (linkedQuote) where.linkedQuote = linkedQuote

    const [items, total] = await Promise.all([
      prisma.supplierQuote.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.supplierQuote.count({ where }),
    ])

    return jsonResponse({ items, total, page, limit, pages: Math.ceil(total / limit) })
  } catch (err) {
    return errorResponse('Failed to fetch supplier quotes', 500, { details: (err as Error).message })
  }
}

export async function POST(request: NextRequest) {
  const body = await parseBody(request)
  const validation = validateBody(supplierQuoteSchema, body)
  if (!validation.success) return errorResponse(validation.error, 400)

  const { _user, companyCode, ...data } = validation.data

  try {
    const number = data.number || (companyCode
      ? await generateCompanyDocNumber(companyCode, 'SQ', 'supplierQuote')
      : await generateDocNumber('AB-SQ', 'supplierQuote'))
    const sq = await prisma.supplierQuote.create({
      data: {
        number, supplier: data.supplier, linkedQuote: data.linkedQuote || '',
        date: data.date || new Date().toISOString().slice(0, 10),
        amount: data.amount || 0, status: data.status || 'PENDING',
        notes: data.notes || '', items: (data.items || []) as unknown as Prisma.InputJsonValue,
      },
    })

    await createAuditLog({ user: _user || 'System', module: 'SupplierQuote', action: 'CREATED', target: sq.number })
    return jsonResponse(sq, 201)
  } catch (err) {
    if ((err as { code?: string }).code === 'P2002') return errorResponse('Supplier quote number already exists', 409)
    return errorResponse('Failed to create supplier quote', 500, { details: (err as Error).message })
  }
}
