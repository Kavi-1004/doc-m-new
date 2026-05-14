import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import { getModuleFromPath, getPermissionFromMethod, hasPermission } from '@/lib/rbac'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'nexuserp-secret-key-change-in-production')
const TOKEN_NAME = 'nexuserp-token'

const PUBLIC_PATHS = ['/api/auth', '/api/seed', '/api/health', '/api/upload']

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
    const role = (payload.role as string) || ''
    const headers = new Headers(request.headers)
    headers.set('x-user-id', (payload.userId as string) || '')
    headers.set('x-user-name', (payload.name as string) || '')
    headers.set('x-user-role', role)
    headers.set('x-user-company', (payload.company as string) || '')

    const module = getModuleFromPath(pathname)
    if (module) {
      const permission = getPermissionFromMethod(request.method)
      if (!hasPermission(role, module, permission)) {
        return NextResponse.json(
          { error: `Access denied: ${role} cannot ${permission} ${module}` },
          { status: 403 }
        )
      }
    }

    return NextResponse.next({ request: { headers } })
  } catch {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 })
  }
}

export const config = {
  matcher: '/api/:path*',
}
