import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { jsonResponse, errorResponse, parseBody, createAuditLog } from '@/lib/api-helpers'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await prisma.user.findUnique({ where: { id: params.id } })
    if (!user) return errorResponse('User not found', 404)
    return jsonResponse(user)
  } catch (err) {
    return errorResponse('Failed to fetch user', 500, { details: (err as Error).message })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const body = await parseBody(request)
  if (!body) return errorResponse('Invalid JSON body', 400)

  try {
    const { _user, ...data } = body
    const user = await prisma.user.update({ where: { id: params.id }, data })
    await createAuditLog({ user: _user || 'System', module: 'User', action: 'UPDATED', target: user.email })
    return jsonResponse(user)
  } catch (err) {
    if ((err as { code?: string }).code === 'P2025') return errorResponse('User not found', 404)
    return errorResponse('Failed to update user', 500, { details: (err as Error).message })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await prisma.user.update({ where: { id: params.id }, data: { status: 'Inactive' } })
    await createAuditLog({ user: 'System', module: 'User', action: 'DEACTIVATED', target: user.email })
    return jsonResponse({ success: true })
  } catch (err) {
    if ((err as { code?: string }).code === 'P2025') return errorResponse('User not found', 404)
    return errorResponse('Failed to delete user', 500, { details: (err as Error).message })
  }
}
