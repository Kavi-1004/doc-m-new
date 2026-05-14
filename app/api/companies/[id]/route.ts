import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { jsonResponse, errorResponse, parseBody, createAuditLog } from '@/lib/api-helpers'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const company = await prisma.company.findUnique({ where: { id: params.id } })
    if (!company) return errorResponse('Company not found', 404)
    return jsonResponse(company)
  } catch (err) {
    return errorResponse('Failed to fetch company', 500, { details: (err as Error).message })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const body = await parseBody(request)
  if (!body) return errorResponse('Invalid JSON body', 400)

  try {
    const { _user, ...data } = body
    const company = await prisma.company.update({ where: { id: params.id }, data })
    await createAuditLog({ user: _user || 'System', module: 'Company', action: 'UPDATED', target: company.code })
    return jsonResponse(company)
  } catch (err) {
    if ((err as { code?: string }).code === 'P2025') return errorResponse('Company not found', 404)
    return errorResponse('Failed to update company', 500, { details: (err as Error).message })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const company = await prisma.company.update({ where: { id: params.id }, data: { active: false } })
    await createAuditLog({ user: 'System', module: 'Company', action: 'DEACTIVATED', target: company.code })
    return jsonResponse({ success: true })
  } catch (err) {
    if ((err as { code?: string }).code === 'P2025') return errorResponse('Company not found', 404)
    return errorResponse('Failed to delete company', 500, { details: (err as Error).message })
  }
}
