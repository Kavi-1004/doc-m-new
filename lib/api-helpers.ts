import { NextResponse } from 'next/server'
import prisma from './prisma'

export function jsonResponse(data: Record<string, unknown>, status = 200) {
  return NextResponse.json(data, { status })
}

export function errorResponse(message: string, status = 400, extra: Record<string, unknown> = {}) {
  return NextResponse.json({ error: message, ...extra }, { status })
}

export async function parseBody(request: Request) {
  try {
    return await request.json()
  } catch {
    return null
  }
}

export function parsePagination(url: URL) {
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10))
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '50', 10)))
  const skip = (page - 1) * limit
  return { page, limit, skip }
}

export function buildSearchFilter(q: string | null, fields: string[]) {
  if (!q || !q.trim()) return {}
  return {
    OR: fields.map(f => ({ [f]: { contains: q.trim(), mode: 'insensitive' as const } })),
  }
}

interface AuditLogParams {
  user: string
  module: string
  action: string
  target: string
  ip?: string
}

export async function createAuditLog({ user, module: mod, action, target, ip = '0.0.0.0' }: AuditLogParams) {
  try {
    await prisma.auditLog.create({
      data: {
        user,
        module: mod,
        action,
        target,
        ip,
        time: new Date().toISOString().replace('T', ' ').slice(0, 16),
      },
    })
  } catch (err) {
    console.error('Audit log error:', (err as Error).message)
  }
}

export async function generateDocNumber(prefix: string, modelName: string, field = 'number') {
  const year = new Date().getFullYear()
  const pattern = `${prefix}-${year}-`

  const last = await (prisma as Record<string, any>)[modelName].findMany({
    where: { [field]: { startsWith: pattern } },
    orderBy: { [field]: 'desc' },
    take: 1,
    select: { [field]: true },
  })

  let seq = 1
  if (last.length > 0) {
    const parts = last[0][field].split('-')
    seq = parseInt(parts[parts.length - 1], 10) + 1
  }

  return `${pattern}${String(seq).padStart(4, '0')}`
}

export async function generateCompanyDocNumber(
  companyCode: string, docType: string, modelName: string, field = 'number'
) {
  const year = new Date().getFullYear()
  const prefix = `${companyCode}-${docType}`
  const pattern = `${prefix}-${year}-`

  const last = await (prisma as Record<string, any>)[modelName].findMany({
    where: { [field]: { startsWith: pattern } },
    orderBy: { [field]: 'desc' },
    take: 1,
    select: { [field]: true },
  })

  let seq = 1
  if (last.length > 0) {
    const parts = last[0][field].split('-')
    seq = parseInt(parts[parts.length - 1], 10) + 1
  }

  return `${pattern}${String(seq).padStart(4, '0')}`
}
