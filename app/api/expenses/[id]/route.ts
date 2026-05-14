import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { jsonResponse, errorResponse, parseBody, createAuditLog } from '@/lib/api-helpers'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const expense = await prisma.expense.findUnique({ where: { id: params.id } })
    if (!expense) return errorResponse('Expense not found', 404)
    return jsonResponse(expense)
  } catch (err) {
    return errorResponse('Failed to fetch expense', 500, { details: (err as Error).message })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const body = await parseBody(request)
  if (!body) return errorResponse('Invalid JSON body', 400)

  try {
    const { _user, ...data } = body
    const expense = await prisma.expense.update({ where: { id: params.id }, data })
    await createAuditLog({ user: _user || 'System', module: 'Expense', action: 'UPDATED', target: expense.number })
    return jsonResponse(expense)
  } catch (err) {
    if ((err as { code?: string }).code === 'P2025') return errorResponse('Expense not found', 404)
    return errorResponse('Failed to update expense', 500, { details: (err as Error).message })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const expense = await prisma.expense.delete({ where: { id: params.id } })
    await createAuditLog({ user: 'System', module: 'Expense', action: 'DELETED', target: expense.number })
    return jsonResponse({ success: true })
  } catch (err) {
    if ((err as { code?: string }).code === 'P2025') return errorResponse('Expense not found', 404)
    return errorResponse('Failed to delete expense', 500, { details: (err as Error).message })
  }
}
