import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { jsonResponse, errorResponse } from '@/lib/api-helpers'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const token = getTokenFromRequest(request)
  if (!token) return errorResponse('Not authenticated', 401)

  const payload = await verifyToken(token)
  if (!payload) return errorResponse('Invalid or expired token', 401)

  try {
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, name: true, email: true, role: true, company: true, status: true },
    })

    if (!user || user.status === 'Inactive') {
      return errorResponse('User not found or inactive', 401)
    }

    return jsonResponse({ success: true, user })
  } catch {
    return errorResponse('Failed to verify session', 500)
  }
}
