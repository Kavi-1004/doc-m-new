/**
 * Catch-all API Route
 *
 * Handles miscellaneous endpoints:
 *   GET  /api               - Health check with DB status
 *   GET  /api/health        - Health check with DB status
 *
 * All other unmatched routes return 404.
 */

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

async function handler(request: NextRequest, { params }: { params: { path?: string[] } }) {
  const segments = params?.path || []
  const route = segments.join('/')

  if (route === '' || route === 'health') {
    let dbStatus = 'disconnected'
    try {
      await prisma.$queryRaw`SELECT 1`
      dbStatus = 'connected'
    } catch {
      dbStatus = 'disconnected'
    }

    return NextResponse.json({
      ok: true,
      app: 'NexusERP',
      version: '1.0.0',
      mode: 'full-stack',
      database: dbStatus,
      engine: 'PostgreSQL + Prisma',
      timestamp: new Date().toISOString(),
      endpoints: [
        'GET  /api/health',
        'POST /api/auth',
        'GET|POST /api/companies',
        'GET|PUT|DELETE /api/companies/:id',
        'GET|POST /api/users',
        'GET|PUT|DELETE /api/users/:id',
        'GET|POST /api/customers',
        'GET|PUT|DELETE /api/customers/:id',
        'GET|POST /api/suppliers',
        'GET|PUT|DELETE /api/suppliers/:id',
        'GET|POST /api/quotations',
        'GET|PUT|DELETE /api/quotations/:id',
        'GET|POST /api/supplier-quotes',
        'GET|PUT|DELETE /api/supplier-quotes/:id',
        'GET|POST /api/purchase-orders',
        'GET|PUT|DELETE /api/purchase-orders/:id',
        'GET|POST /api/delivery-orders',
        'GET|PUT|DELETE /api/delivery-orders/:id',
        'GET|POST /api/invoices',
        'GET|PUT|DELETE /api/invoices/:id',
        'GET|POST /api/expenses',
        'GET|PUT|DELETE /api/expenses/:id',
        'GET /api/audit-logs',
        'GET /api/dashboard',
        'GET|PUT /api/settings',
        'GET /api/reports?type=...',
        'POST /api/seed',
      ],
    })
  }

  return NextResponse.json({ error: 'Not found', route }, { status: 404 })
}

export const GET = handler
export const POST = handler
export const PUT = handler
export const DELETE = handler
export const PATCH = handler
