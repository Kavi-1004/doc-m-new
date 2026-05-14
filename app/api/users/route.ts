import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { jsonResponse, errorResponse, parseBody, parsePagination, buildSearchFilter, createAuditLog } from '@/lib/api-helpers'
import { userSchema, validateBody } from '@/lib/validations'

const VALID_ROLES = ['SUPER_ADMIN', 'ADMIN', 'SALES', 'PROCUREMENT', 'ACCOUNTANT', 'VIEWER']

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const { page, limit, skip } = parsePagination(url)
    const q = url.searchParams.get('q')
    const role = url.searchParams.get('role')
    const company = url.searchParams.get('company')
    const status = url.searchParams.get('status')

    const where: Record<string, unknown> = { ...buildSearchFilter(q, ['name', 'email']) }
    if (role) where.role = role
    if (company) where.company = company
    if (status) where.status = status

    const [items, total] = await Promise.all([
      prisma.user.findMany({ where, skip, take: limit, orderBy: { name: 'asc' } }),
      prisma.user.count({ where }),
    ])

    return jsonResponse({ items, total, page, limit, pages: Math.ceil(total / limit), roles: VALID_ROLES })
  } catch (err) {
    return errorResponse('Failed to fetch users', 500, { details: (err as Error).message })
  }
}

export async function POST(request: NextRequest) {
  const body = await parseBody(request)
  const validation = validateBody(userSchema, body)
  if (!validation.success) return errorResponse(validation.error, 400)

  const { _user, ...data } = validation.data

  try {
    const user = await prisma.user.create({
      data: {
        name: data.name, email: data.email, role: data.role,
        company: data.company, status: data.status || 'Active', lastLogin: '',
      },
    })

    await createAuditLog({ user: _user || 'System', module: 'User', action: 'CREATED', target: user.email })
    return jsonResponse(user, 201)
  } catch (err) {
    if ((err as { code?: string }).code === 'P2002') return errorResponse('Email already exists', 409)
    return errorResponse('Failed to create user', 500, { details: (err as Error).message })
  }
}
