import { SignJWT, jwtVerify } from 'jose'
import { hashSync, compareSync } from 'bcryptjs'
import { NextRequest, NextResponse } from 'next/server'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'nexuserp-secret-key-change-in-production')
const TOKEN_NAME = 'nexuserp-token'
const TOKEN_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

export interface AuthPayload {
  userId: string
  email: string
  role: string
  company: string
  name: string
}

export function hashPassword(plain: string): string {
  return hashSync(plain, 10)
}

export function verifyPassword(plain: string, hashed: string): boolean {
  if (!hashed) return false
  return compareSync(plain, hashed)
}

export async function createToken(payload: AuthPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${TOKEN_MAX_AGE}s`)
    .sign(JWT_SECRET)
}

export async function verifyToken(token: string): Promise<AuthPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as unknown as AuthPayload
  } catch {
    return null
  }
}

export function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7)
  }
  return request.cookies.get(TOKEN_NAME)?.value || null
}

export function setTokenCookie(response: NextResponse, token: string): NextResponse {
  response.cookies.set(TOKEN_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: TOKEN_MAX_AGE,
    path: '/',
  })
  return response
}

export function clearTokenCookie(response: NextResponse): NextResponse {
  response.cookies.delete(TOKEN_NAME)
  return response
}
