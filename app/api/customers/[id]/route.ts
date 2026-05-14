import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { jsonResponse, errorResponse, parseBody, createAuditLog } from '@/lib/api-helpers'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const customer = await prisma.customer.findUnique({ where: { id: params.id } })
    if (!customer) return errorResponse('Customer not found', 404)
    return jsonResponse(customer)
  } catch (err) {
    return errorResponse('Failed to fetch customer', 500, { details: (err as Error).message })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const body = await parseBody(request)
  if (!body) return errorResponse('Invalid JSON body', 400)

  try {
    const { _user, ...data } = body
    const customer = await prisma.customer.update({ where: { id: params.id }, data })
    await createAuditLog({ user: _user || 'System', module: 'Customer', action: 'UPDATED', target: customer.code })
    return jsonResponse(customer)
  } catch (err) {
    if ((err as { code?: string }).code === 'P2025') return errorResponse('Customer not found', 404)
    return errorResponse('Failed to update customer', 500, { details: (err as Error).message })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const customer = await prisma.customer.delete({ where: { id: params.id } })
    await createAuditLog({ user: 'System', module: 'Customer', action: 'DELETED', target: customer.code })
    return jsonResponse({ success: true })
  } catch (err) {
    if ((err as { code?: string }).code === 'P2025') return errorResponse('Customer not found', 404)
    return errorResponse('Failed to delete customer', 500, { details: (err as Error).message })
  }
}
