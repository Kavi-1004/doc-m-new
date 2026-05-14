import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { jsonResponse, errorResponse, parsePagination, buildSearchFilter } from '@/lib/api-helpers'

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const { page, limit, skip } = parsePagination(url)
    const q = url.searchParams.get('q')
    const moduleFilter = url.searchParams.get('module')
    const action = url.searchParams.get('action')

    const where: Record<string, unknown> = { ...buildSearchFilter(q, ['user', 'module', 'action', 'target']) }
    if (moduleFilter) where.module = moduleFilter
    if (action) where.action = action

    const [items, total] = await Promise.all([
      prisma.auditLog.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.auditLog.count({ where }),
    ])

    return jsonResponse({ items, total, page, limit, pages: Math.ceil(total / limit) })
  } catch (err) {
    return errorResponse('Failed to fetch audit logs', 500, { details: (err as Error).message })
  }
}
