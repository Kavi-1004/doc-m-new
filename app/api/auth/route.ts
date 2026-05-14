import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { jsonResponse, errorResponse, parseBody, createAuditLog } from '@/lib/api-helpers'
import { verifyPassword, createToken, setTokenCookie, clearTokenCookie } from '@/lib/auth'

export async function POST(request: NextRequest) {
  const body = await parseBody(request)
  if (!body?.email) return errorResponse('Email is required', 400)

  const email = String(body.email).trim().toLowerCase()
  const password = String(body.password || '')

  try {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || user.status === 'Inactive') {
      return errorResponse('Invalid credentials', 401)
    }

    if (user.password && !verifyPassword(password, user.password)) {
      return errorResponse('Invalid credentials', 401)
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date().toISOString().replace('T', ' ').slice(0, 16) },
    })

    await createAuditLog({ user: user.name, module: 'Auth', action: 'LOGIN', target: '—' })

    const token = await createToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      company: user.company,
      name: user.name,
    })

    const response = NextResponse.json({
      success: true,
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, company: user.company },
    })

    return setTokenCookie(response, token)
  } catch (err) {
    return errorResponse('Authentication failed', 500, { details: (err as Error).message })
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true, message: 'Logged out' })
  return clearTokenCookie(response)
}
