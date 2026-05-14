import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { jsonResponse, errorResponse, parseBody, createAuditLog } from '@/lib/api-helpers'
import { settingsSchema, validateBody } from '@/lib/validations'

export async function GET() {
  try {
    let settings = await prisma.setting.findUnique({ where: { type: 'app_settings' } })
    if (!settings) {
      settings = await prisma.setting.create({ data: { type: 'app_settings' } })
    }
    return jsonResponse(settings)
  } catch (err) {
    return errorResponse('Failed to fetch settings', 500, { details: (err as Error).message })
  }
}

export async function PUT(request: NextRequest) {
  const body = await parseBody(request)
  const validation = validateBody(settingsSchema, body)
  if (!validation.success) return errorResponse(validation.error, 400)

  const { _user, ...data } = validation.data

  try {
    const settings = await prisma.setting.upsert({
      where: { type: 'app_settings' },
      update: data,
      create: { type: 'app_settings', ...data },
    })
    await createAuditLog({ user: _user || 'System', module: 'Settings', action: 'UPDATED', target: 'app_settings' })
    return jsonResponse(settings)
  } catch (err) {
    return errorResponse('Failed to update settings', 500, { details: (err as Error).message })
  }
}
