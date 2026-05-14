import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { jsonResponse, errorResponse, parseBody, createAuditLog } from '@/lib/api-helpers'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const sq = await prisma.supplierQuote.findUnique({ where: { id: params.id } })
    if (!sq) return errorResponse('Supplier quote not found', 404)
    return jsonResponse(sq)
  } catch (err) {
    return errorResponse('Failed to fetch supplier quote', 500, { details: (err as Error).message })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const body = await parseBody(request)
  if (!body) return errorResponse('Invalid JSON body', 400)

  try {
    const { _user, ...data } = body
    const sq = await prisma.supplierQuote.update({ where: { id: params.id }, data })
    await createAuditLog({ user: _user || 'System', module: 'SupplierQuote', action: 'UPDATED', target: sq.number })
    return jsonResponse(sq)
  } catch (err) {
    if ((err as { code?: string }).code === 'P2025') return errorResponse('Supplier quote not found', 404)
    return errorResponse('Failed to update supplier quote', 500, { details: (err as Error).message })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const sq = await prisma.supplierQuote.delete({ where: { id: params.id } })
    await createAuditLog({ user: 'System', module: 'SupplierQuote', action: 'DELETED', target: sq.number })
    return jsonResponse({ success: true })
  } catch (err) {
    if ((err as { code?: string }).code === 'P2025') return errorResponse('Supplier quote not found', 404)
    return errorResponse('Failed to delete supplier quote', 500, { details: (err as Error).message })
  }
}
