import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { errorResponse } from '@/lib/api-helpers'

type Params = { params: Promise<{ type: string; id: string }> }

const MODEL_MAP: Record<string, string> = {
  quotation: 'quotation',
  invoice: 'invoice',
  'purchase-order': 'purchaseOrder',
  'delivery-order': 'deliveryOrder',
  expense: 'expense',
  'supplier-quote': 'supplierQuote',
}

export async function GET(request: NextRequest, { params }: Params) {
  const { type, id } = await params

  const modelKey = MODEL_MAP[type]
  if (!modelKey) {
    return errorResponse(`Unknown document type: ${type}`, 400)
  }

  try {
    const db = prisma as Record<string, { findUnique: (args: { where: { id: string } }) => Promise<Record<string, unknown> | null> }>
    const record = await db[modelKey].findUnique({ where: { id } })
    if (!record) {
      return errorResponse('Document not found', 404)
    }

    const company = await prisma.company.findFirst()

    const html = buildDocumentHtml(type, record, company)

    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `inline; filename="${String(record.number || type)}-${id}.html"`,
      },
    })
  } catch (err) {
    return errorResponse('Export failed', 500, { details: (err as Error).message })
  }
}

function buildDocumentHtml(
  type: string,
  record: Record<string, unknown>,
  company: Record<string, unknown> | null,
): string {
  const companyName = company?.name || 'Company'
  const companyAddress = company?.address || ''
  const companyEmail = company?.email || ''
  const companyPhone = company?.phone || ''
  const currency = record.currency || company?.currency || 'AED'

  const title = type.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())
  const number = record.number || ''
  const date = record.date || ''
  const customer = record.customer || record.supplier || ''

  const items = Array.isArray(record.items) ? record.items : (Array.isArray(record.lineItems) ? record.lineItems : [])
  const total = record.total || record.amount || items.reduce((s: number, i: Record<string, unknown>) => s + (Number(i.t) || (Number(i.q) || 0) * (Number(i.r) || 0)), 0)

  let itemsHtml = ''
  items.forEach((item: Record<string, unknown>, idx: number) => {
    itemsHtml += `<tr>
      <td style="padding:8px;border-bottom:1px solid #e2e8f0;text-align:center">${idx + 1}</td>
      <td style="padding:8px;border-bottom:1px solid #e2e8f0">${item.d || ''}</td>
      <td style="padding:8px;border-bottom:1px solid #e2e8f0;text-align:right">${Number(item.q) || ''}</td>
      <td style="padding:8px;border-bottom:1px solid #e2e8f0">${item.u || ''}</td>
      <td style="padding:8px;border-bottom:1px solid #e2e8f0;text-align:right">${Number(item.r) ? Number(item.r).toFixed(2) : ''}</td>
      <td style="padding:8px;border-bottom:1px solid #e2e8f0;text-align:right">${(Number(item.t) || (Number(item.q) || 0) * (Number(item.r) || 0)).toFixed(2)}</td>
    </tr>`
  })

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title} - ${number}</title>
  <style>
    @media print { body { margin: 0; } .no-print { display: none; } }
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #1e293b; margin: 20px; }
    .header { display: flex; justify-content: space-between; margin-bottom: 30px; }
    .company { font-size: 22px; font-weight: bold; color: #0f172a; }
    .doc-title { font-size: 18px; font-weight: bold; color: #334155; text-transform: uppercase; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th { background: #f1f5f9; padding: 10px 8px; text-align: left; font-size: 12px; text-transform: uppercase; color: #475569; }
    .total-row { font-weight: bold; font-size: 16px; }
    .btn-print { padding: 8px 20px; background: #0f172a; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; }
  </style>
</head>
<body>
  <div class="no-print" style="text-align:right;margin-bottom:10px;">
    <button class="btn-print" onclick="window.print()">Print / Save as PDF</button>
  </div>
  <div class="header">
    <div>
      <div class="company">${companyName}</div>
      <div style="color:#64748b;font-size:13px">${companyAddress}</div>
      <div style="color:#64748b;font-size:13px">${companyEmail} | ${companyPhone}</div>
    </div>
    <div style="text-align:right">
      <div class="doc-title">${title}</div>
      <div style="font-size:16px;font-weight:bold;margin-top:4px">${number}</div>
      <div style="color:#64748b;font-size:13px">Date: ${date}</div>
    </div>
  </div>
  <div style="margin-bottom:20px;">
    <div style="font-size:13px;color:#64748b">${type.includes('purchase') || type.includes('supplier') ? 'Supplier' : 'Customer'}:</div>
    <div style="font-size:15px;font-weight:600">${customer}</div>
    ${record.project ? `<div style="font-size:13px;color:#64748b">Project: ${record.project}</div>` : ''}
    ${record.attnName ? `<div style="font-size:13px;color:#64748b">Attn: ${record.attnName} (${record.attnEmail || ''})</div>` : ''}
  </div>
  <table>
    <thead><tr>
      <th style="width:40px;text-align:center">#</th>
      <th>Description</th>
      <th style="text-align:right;width:60px">Qty</th>
      <th style="width:50px">Unit</th>
      <th style="text-align:right;width:80px">Rate</th>
      <th style="text-align:right;width:100px">Amount</th>
    </tr></thead>
    <tbody>${itemsHtml}</tbody>
  </table>
  <div style="text-align:right;margin-top:20px">
    ${record.discount ? `<div style="color:#64748b">Discount: ${currency} ${Number(record.discount).toFixed(2)}</div>` : ''}
    ${record.tax ? `<div style="color:#64748b">Tax: ${currency} ${Number(record.tax).toFixed(2)}</div>` : ''}
    <div class="total-row" style="margin-top:8px">Total: ${currency} ${Number(total).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
    ${record.paid !== undefined ? `<div style="color:#059669;margin-top:4px">Paid: ${currency} ${Number(record.paid).toFixed(2)}</div>` : ''}
  </div>
  ${record.terms ? `<div style="margin-top:30px;border-top:1px solid #e2e8f0;padding-top:15px"><div style="font-size:12px;font-weight:bold;color:#475569;text-transform:uppercase;margin-bottom:5px">Terms & Conditions</div><div style="font-size:13px;color:#475569;white-space:pre-line">${record.terms}</div></div>` : ''}
  ${record.notes ? `<div style="margin-top:15px;font-size:13px;color:#475569"><strong>Notes:</strong> ${record.notes}</div>` : ''}
</body>
</html>`
}
