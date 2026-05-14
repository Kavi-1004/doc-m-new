import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { jsonResponse, errorResponse, parseBody, parsePagination, buildSearchFilter, createAuditLog, generateDocNumber } from '@/lib/api-helpers'
import { supplierSchema, validateBody } from '@/lib/validations'

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const { page, limit, skip } = parsePagination(url)
    const q = url.searchParams.get('q')
    const terms = url.searchParams.get('terms')

    const where: Record<string, unknown> = { ...buildSearchFilter(q, ['company', 'contact', 'email', 'code']) }
    if (terms) where.terms = terms

    const [items, total] = await Promise.all([
      prisma.supplier.findMany({ where, skip, take: limit, orderBy: { company: 'asc' } }),
      prisma.supplier.count({ where }),
    ])

    return jsonResponse({ items, total, page, limit, pages: Math.ceil(total / limit) })
  } catch (err) {
    return errorResponse('Failed to fetch suppliers', 500, { details: (err as Error).message })
  }
}

export async function POST(request: NextRequest) {
  const body = await parseBody(request)
  const validation = validateBody(supplierSchema, body)
  if (!validation.success) return errorResponse(validation.error, 400)

  const { _user, ...data } = validation.data

  try {
    const code = data.code || await generateDocNumber('SUP', 'supplier', 'code')
    const supplier = await prisma.supplier.create({
      data: {
        code, company: data.company, contact: data.contact,
        email: data.email || '', phone: data.phone || '', tax: data.tax || '',
        terms: data.terms || 'Net 30', address: data.address || '',
        bank: data.bank || '', notes: data.notes || '',
      },
    })

    await createAuditLog({ user: _user || 'System', module: 'Supplier', action: 'CREATED', target: supplier.code })
    return jsonResponse(supplier, 201)
  } catch (err) {
    if ((err as { code?: string }).code === 'P2002') return errorResponse('Supplier code already exists', 409)
    return errorResponse('Failed to create supplier', 500, { details: (err as Error).message })
  }
}
