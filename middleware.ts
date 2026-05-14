import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'nexuserp-secret-key-change-in-production')
const TOKEN_NAME = 'nexuserp-token'

const PUBLIC_PATHS = ['/api/auth', '/api/seed', '/api/health']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (!pathname.startsWith('/api/') || PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'))) {
    return NextResponse.next()
  }

  const token = request.cookies.get(TOKEN_NAME)?.value
    || request.headers.get('authorization')?.replace('Bearer ', '')

  if (!token) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    const headers = new Headers(request.headers)
    headers.set('x-user-id', (payload.userId as string) || '')
    headers.set('x-user-name', (payload.name as string) || '')
    headers.set('x-user-role', (payload.role as string) || '')
    headers.set('x-user-company', (payload.company as string) || '')

    return NextResponse.next({ request: { headers } })
  } catch {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 })
  }
}

export const config = {
  matcher: '/api/:path*',
}
