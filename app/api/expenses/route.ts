import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { jsonResponse, errorResponse, parseBody, parsePagination, buildSearchFilter, createAuditLog, generateDocNumber } from '@/lib/api-helpers'
import { expenseSchema, validateBody } from '@/lib/validations'

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const { page, limit, skip } = parsePagination(url)
    const q = url.searchParams.get('q')
    const category = url.searchParams.get('category')
    const project = url.searchParams.get('project')

    const where: Record<string, unknown> = { ...buildSearchFilter(q, ['number', 'project', 'supplier', 'category']) }
    if (category) where.category = category
    if (project) where.project = { contains: project, mode: 'insensitive' }

    const [items, total] = await Promise.all([
      prisma.expense.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.expense.count({ where }),
    ])

    return jsonResponse({ items, total, page, limit, pages: Math.ceil(total / limit) })
  } catch (err) {
    return errorResponse('Failed to fetch expenses', 500, { details: (err as Error).message })
  }
}

export async function POST(request: NextRequest) {
  const body = await parseBody(request)
  const validation = validateBody(expenseSchema, body)
  if (!validation.success) return errorResponse(validation.error, 400)

  const { _user, ...data } = validation.data

  try {
    const number = data.number || await generateDocNumber('AB-EXP', 'expense')
    const expense = await prisma.expense.create({
      data: {
        number, category: data.category, project: data.project || '',
        supplier: data.supplier || '', amount: data.amount || 0,
        date: data.date || new Date().toISOString().slice(0, 10),
        notes: data.notes || '', attachment: data.attachment || '',
      },
    })

    await createAuditLog({ user: _user || 'System', module: 'Expense', action: 'CREATED', target: expense.number })
    return jsonResponse(expense, 201)
  } catch (err) {
    if ((err as { code?: string }).code === 'P2002') return errorResponse('Expense number already exists', 409)
    return errorResponse('Failed to create expense', 500, { details: (err as Error).message })
  }
}
