'use client'

import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useApi } from '@/hooks/use-api'
import { StatusPill } from '@/components/shared/StatusPill'
import { fmtMoney } from '@/lib/utils'
import type { Invoice, InvoiceItem } from '@/types'

export default function InvoiceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: invoice } = useApi<Invoice>(params.id ? `/api/invoices/${params.id}` : null)

  if (!invoice) return <div className="flex items-center justify-center py-20 text-slate-500">Loading...</div>

  const items: InvoiceItem[] = invoice.items || []
  const subtotal = items.reduce((s, i) => s + (Number(i.q) || 0) * (Number(i.r) || 0), 0)
  const balance = invoice.total - invoice.paid

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.push('/invoices')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="text-xs text-slate-500 uppercase tracking-wider">Finance</div>
          <h1 className="text-2xl font-semibold">Invoice {invoice.number}</h1>
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={() => router.push(`/invoices/${params.id}/edit`)}>
          <Pencil className="h-4 w-4" /> Edit
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Invoice Details</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div><span className="text-slate-500 block text-xs">Number</span><span className="font-mono">{invoice.number}</span></div>
                <div><span className="text-slate-500 block text-xs">Status</span><StatusPill s={invoice.status} /></div>
                <div><span className="text-slate-500 block text-xs">Customer</span><span className="font-medium">{invoice.customer}</span></div>
                <div><span className="text-slate-500 block text-xs">Linked Quote</span><span className="font-mono">{invoice.linkedQuote || '—'}</span></div>
                <div><span className="text-slate-500 block text-xs">Date</span><span>{invoice.date}</span></div>
                <div><span className="text-slate-500 block text-xs">Due Date</span><span>{invoice.due || '—'}</span></div>
                {invoice.poNumber && <div><span className="text-slate-500 block text-xs">PO Number</span><span>{invoice.poNumber}</span></div>}
                {invoice.project && <div><span className="text-slate-500 block text-xs">Project</span><span>{invoice.project}</span></div>}
                {invoice.salesPerson && <div><span className="text-slate-500 block text-xs">Sales Person</span><span>{invoice.salesPerson}</span></div>}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Line Items</CardTitle></CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12 text-center">#</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead className="text-right">Sub Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-center text-slate-400">{i + 1}</TableCell>
                      <TableCell>
                        <div className="font-medium">{item.d}</div>
                        {item.components && item.components.length > 0 && (
                          <div className="mt-1 space-y-0.5">
                            {item.components.map((comp, ci) => (
                              <div key={ci} className="text-xs text-slate-500 pl-3">
                                {String.fromCharCode(65 + ci)}. {comp}
                              </div>
                            ))}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">{item.q}</TableCell>
                      <TableCell className="text-right">{Number(item.r).toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
                      <TableCell className="text-right font-medium">{((Number(item.q) || 0) * (Number(item.r) || 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="text-right p-4 space-y-1 border-t">
                <div className="text-slate-500">Sub Total: {fmtMoney(subtotal)}</div>
                {(invoice.discount || 0) > 0 && <div className="text-red-500">Discount: -{fmtMoney(invoice.discount || 0)}</div>}
                {(invoice.tax || 0) > 0 && <div className="text-slate-600">Tax: +{fmtMoney(invoice.tax || 0)}</div>}
                <div className="font-bold text-lg">Total: {fmtMoney(invoice.total)}</div>
              </div>
            </CardContent>
          </Card>

          {invoice.notes && (
            <Card>
              <CardHeader><CardTitle className="text-base">Notes</CardTitle></CardHeader>
              <CardContent><p className="text-sm whitespace-pre-wrap">{invoice.notes}</p></CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Payment Summary</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Total</span><span className="font-bold">{fmtMoney(invoice.total)}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Paid</span><span className="text-emerald-600 font-medium">{fmtMoney(invoice.paid)}</span></div>
              <div className="flex justify-between border-t pt-2"><span className="text-slate-500">Balance</span><span className={`font-bold ${balance > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>{fmtMoney(balance)}</span></div>
              {invoice.progressPct > 0 && (
                <div className="flex justify-between"><span className="text-slate-500">Progress</span><span>{invoice.progressPct}%</span></div>
              )}
              <div className="flex justify-between"><span className="text-slate-500">Status</span><StatusPill s={invoice.status} /></div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
