import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { jsonResponse, errorResponse, parseBody, parsePagination, buildSearchFilter, createAuditLog } from '@/lib/api-helpers'
import { companySchema, validateBody } from '@/lib/validations'

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const { page, limit, skip } = parsePagination(url)
    const q = url.searchParams.get('q')
    const where = buildSearchFilter(q, ['name', 'code', 'email'])

    const [items, total] = await Promise.all([
      prisma.company.findMany({ where, skip, take: limit, orderBy: { name: 'asc' } }),
      prisma.company.count({ where }),
    ])

    return jsonResponse({ items, total, page, limit, pages: Math.ceil(total / limit) })
  } catch (err) {
    return errorResponse('Failed to fetch companies', 500, { details: (err as Error).message })
  }
}

export async function POST(request: NextRequest) {
  const body = await parseBody(request)
  const validation = validateBody(companySchema, body)
  if (!validation.success) return errorResponse(validation.error, 400)

  const { _user, ...data } = validation.data

  try {
    const existing = await prisma.company.findUnique({ where: { code: data.code } })
    if (existing) return errorResponse('Company code already exists', 409)

    const company = await prisma.company.create({
      data: {
        code: data.code, name: data.name, logo: data.logo || data.code.slice(0, 2),
        currency: data.currency || 'AED', regNo: data.regNo || '', taxNo: data.taxNo || '',
        address: data.address || '', phone: data.phone || '', email: data.email || '',
        bank: data.bank || '', active: data.active !== false,
      },
    })

    await createAuditLog({ user: _user || 'System', module: 'Company', action: 'CREATED', target: company.code })
    return jsonResponse(company, 201)
  } catch (err) {
    return errorResponse('Failed to create company', 500, { details: (err as Error).message })
  }
}
