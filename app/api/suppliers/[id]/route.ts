import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { jsonResponse, errorResponse, parseBody, createAuditLog } from '@/lib/api-helpers'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supplier = await prisma.supplier.findUnique({ where: { id: params.id } })
    if (!supplier) return errorResponse('Supplier not found', 404)
    return jsonResponse(supplier)
  } catch (err) {
    return errorResponse('Failed to fetch supplier', 500, { details: (err as Error).message })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const body = await parseBody(request)
  if (!body) return errorResponse('Invalid JSON body', 400)

  try {
    const { _user, ...data } = body
    const supplier = await prisma.supplier.update({ where: { id: params.id }, data })
    await createAuditLog({ user: _user || 'System', module: 'Supplier', action: 'UPDATED', target: supplier.code })
    return jsonResponse(supplier)
  } catch (err) {
    if ((err as { code?: string }).code === 'P2025') return errorResponse('Supplier not found', 404)
    return errorResponse('Failed to update supplier', 500, { details: (err as Error).message })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supplier = await prisma.supplier.delete({ where: { id: params.id } })
    await createAuditLog({ user: 'System', module: 'Supplier', action: 'DELETED', target: supplier.code })
    return jsonResponse({ success: true })
  } catch (err) {
    if ((err as { code?: string }).code === 'P2025') return errorResponse('Supplier not found', 404)
    return errorResponse('Failed to delete supplier', 500, { details: (err as Error).message })
  }
}
