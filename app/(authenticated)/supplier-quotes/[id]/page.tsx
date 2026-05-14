'use client'

import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useApi } from '@/hooks/use-api'
import { StatusPill } from '@/components/shared/StatusPill'
import { fmtMoney } from '@/lib/utils'
import type { SupplierQuote, SupplierQuoteItem } from '@/types'

export default function SupplierQuoteDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: sq } = useApi<SupplierQuote>(params.id ? `/api/supplier-quotes/${params.id}` : null)

  if (!sq) return <div className="flex items-center justify-center py-20 text-slate-500">Loading...</div>

  const rawItems = typeof sq.items === 'string' ? JSON.parse(sq.items) : (sq.items || [])
  const items: SupplierQuoteItem[] = (Array.isArray(rawItems) ? rawItems : []).map((i: Record<string, unknown>) => ({
    d: (i.d || i.description || '') as string,
    q: Number(i.q ?? i.qty ?? 0),
    u: (i.u || i.unit || '') as string,
    r: Number(i.r ?? i.rate ?? 0),
    t: Number(i.t ?? i.amount ?? 0),
  }))
  const total = items.reduce((s, i) => s + (Number(i.q) || 0) * (Number(i.r) || 0), 0)

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.push('/supplier-quotes')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="text-xs text-slate-500 uppercase tracking-wider">Procurement</div>
          <h1 className="text-2xl font-semibold">Supplier Quote {sq.number}</h1>
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={() => router.push(`/supplier-quotes/${params.id}/edit`)}>
          <Pencil className="h-4 w-4" /> Edit
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Quote Details</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div><span className="text-slate-500 block text-xs">Number</span><span className="font-mono">{sq.number}</span></div>
                <div><span className="text-slate-500 block text-xs">Status</span><StatusPill s={sq.status} /></div>
                <div><span className="text-slate-500 block text-xs">Supplier</span><span className="font-medium">{sq.supplier}</span></div>
                <div><span className="text-slate-500 block text-xs">Linked Quote</span><span className="font-mono">{sq.linkedQuote || '—'}</span></div>
                <div><span className="text-slate-500 block text-xs">Date</span><span>{sq.date}</span></div>
                <div><span className="text-slate-500 block text-xs">Amount</span><span className="font-bold">{fmtMoney(sq.amount)}</span></div>
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
                    <TableHead>Unit</TableHead>
                    <TableHead className="text-right">Rate</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-center text-slate-400">{i + 1}</TableCell>
                      <TableCell className="font-medium">{item.d}</TableCell>
                      <TableCell className="text-right">{item.q}</TableCell>
                      <TableCell>{item.u}</TableCell>
                      <TableCell className="text-right">{Number(item.r).toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
                      <TableCell className="text-right font-medium">{((Number(item.q) || 0) * (Number(item.r) || 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="text-right p-4 border-t font-bold text-lg">Total: {fmtMoney(total)}</div>
            </CardContent>
          </Card>

          {sq.notes && (
            <Card>
              <CardHeader><CardTitle className="text-base">Notes</CardTitle></CardHeader>
              <CardContent><p className="text-sm whitespace-pre-wrap">{sq.notes}</p></CardContent>
            </Card>
          )}
        </div>

        <div>
          <Card>
            <CardHeader><CardTitle className="text-base">Summary</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Items</span><span>{items.length}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Total</span><span className="font-bold">{fmtMoney(total)}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Status</span><StatusPill s={sq.status} /></div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
