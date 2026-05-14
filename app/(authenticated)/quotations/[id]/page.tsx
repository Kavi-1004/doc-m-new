'use client'

import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Pencil, RotateCcw, FileText, Truck, Receipt } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useApi, apiMutate } from '@/hooks/use-api'
import { StatusPill } from '@/components/shared/StatusPill'
import { useAppContext } from '@/lib/app-context'
import { fmtMoney } from '@/lib/utils'
import type { Quotation, QuotationItem } from '@/types'

export default function QuotationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { company } = useAppContext()
  const { data: quotation } = useApi<Quotation>(params.id ? `/api/quotations/${params.id}` : null)

  if (!quotation) return <div className="flex items-center justify-center py-20 text-slate-500">Loading...</div>

  const rawItems = typeof quotation.items === 'string' ? JSON.parse(quotation.items) : (quotation.items || [])
  const items: QuotationItem[] = (Array.isArray(rawItems) ? rawItems : []).map((i: Record<string, unknown>) => ({
    d: (i.d || i.description || '') as string,
    q: Number(i.q ?? i.qty ?? 0),
    u: (i.u || i.unit || '') as string,
    r: Number(i.r ?? i.rate ?? 0),
    t: Number(i.t ?? i.amount ?? 0),
    components: (i.components || []) as string[],
  }))
  const subtotal = items.reduce((s, i) => s + (Number(i.q) || 0) * (Number(i.r) || 0), 0)
  const discount = quotation.discount || 0
  const tax = quotation.tax || 0
  const netTotal = subtotal - discount + tax

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.push('/quotations')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="text-xs text-slate-500 uppercase tracking-wider">Sales</div>
          <h1 className="text-2xl font-semibold">Quotation {quotation.number}</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={() => router.push(`/quotations/${params.id}/edit`)}>
            <Pencil className="h-4 w-4" /> Edit
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Document Details</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div><span className="text-slate-500 block text-xs">Number</span><span className="font-mono">{quotation.number}</span></div>
                <div><span className="text-slate-500 block text-xs">Revision</span><span>R{quotation.rev}</span></div>
                <div><span className="text-slate-500 block text-xs">Status</span><StatusPill s={quotation.status} /></div>
                <div><span className="text-slate-500 block text-xs">Customer</span><span className="font-medium">{quotation.customer}</span></div>
                <div><span className="text-slate-500 block text-xs">Project</span><span>{quotation.project || '—'}</span></div>
                <div><span className="text-slate-500 block text-xs">Date</span><span>{quotation.date}</span></div>
                <div><span className="text-slate-500 block text-xs">Validity</span><span>{quotation.validity || '—'}</span></div>
                <div><span className="text-slate-500 block text-xs">Currency</span><Badge variant="secondary">{company.currency || 'AED'}</Badge></div>
                {quotation.attnName && <div><span className="text-slate-500 block text-xs">Attention To</span><span>{quotation.attnName}</span></div>}
                {quotation.attnEmail && <div><span className="text-slate-500 block text-xs">Attn Email</span><span>{quotation.attnEmail}</span></div>}
                {quotation.salesPerson && <div><span className="text-slate-500 block text-xs">Sales Person</span><span>{quotation.salesPerson}</span></div>}
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
                      <TableCell>{item.u}</TableCell>
                      <TableCell className="text-right">{Number(item.r).toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
                      <TableCell className="text-right font-medium">{((Number(item.q) || 0) * (Number(item.r) || 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="text-right p-4 space-y-1 border-t">
                <div className="text-slate-500">Sub Total: {fmtMoney(subtotal)}</div>
                {discount > 0 && <div className="text-red-500">Discount: -{fmtMoney(discount)}</div>}
                {tax > 0 && <div className="text-slate-600">Tax: +{fmtMoney(tax)}</div>}
                <div className="font-bold text-lg">Net Total: {fmtMoney(netTotal)}</div>
              </div>
            </CardContent>
          </Card>

          {quotation.terms && (
            <Card>
              <CardHeader><CardTitle className="text-base">Payment Terms</CardTitle></CardHeader>
              <CardContent><p className="text-sm whitespace-pre-wrap">{quotation.terms}</p></CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Actions</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start gap-2" onClick={() => router.push(`/quotations/${params.id}/edit`)}>
                <Pencil className="h-4 w-4" /> Edit Quotation
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2 border-amber-300 text-amber-700 hover:bg-amber-50"
                onClick={async () => {
                  try {
                    const revised = await apiMutate(`/api/quotations/${params.id}`, 'PUT', { _action: 'revise', _user: 'System' })
                    toast.success(`Revision R${revised.rev} created`)
                    router.push(`/quotations/${revised.id}/edit`)
                  } catch (err) { toast.error((err as Error).message) }
                }}>
                <RotateCcw className="h-4 w-4" /> Create Revision
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2"
                onClick={async () => {
                  try {
                    const po = await apiMutate(`/api/quotations/${params.id}`, 'PUT', { _action: 'generate_po', companyCode: company.code, _user: 'System' })
                    toast.success(`PO ${po.number} created`)
                    router.push(`/purchase-orders/${po.id}/edit`)
                  } catch (err) { toast.error((err as Error).message) }
                }}>
                <FileText className="h-4 w-4" /> Generate PO
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2"
                onClick={async () => {
                  try {
                    const dor = await apiMutate(`/api/quotations/${params.id}`, 'PUT', { _action: 'generate_do', companyCode: company.code, _user: 'System' })
                    toast.success(`DO ${dor.number} created`)
                    router.push(`/delivery-orders/${dor.id}/edit`)
                  } catch (err) { toast.error((err as Error).message) }
                }}>
                <Truck className="h-4 w-4" /> Generate DO
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2"
                onClick={async () => {
                  try {
                    const inv = await apiMutate(`/api/quotations/${params.id}`, 'PUT', { _action: 'generate_invoice', companyCode: company.code, progressPct: 100, _user: 'System' })
                    toast.success(`Invoice ${inv.number} created`)
                    router.push(`/invoices/${inv.id}/edit`)
                  } catch (err) { toast.error((err as Error).message) }
                }}>
                <Receipt className="h-4 w-4" /> Generate Invoice
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Summary</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Items</span><span>{items.length}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Total Qty</span><span>{items.reduce((s, i) => s + (Number(i.q) || 0), 0)}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Total</span><span className="font-bold">{fmtMoney(netTotal)}</span></div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
