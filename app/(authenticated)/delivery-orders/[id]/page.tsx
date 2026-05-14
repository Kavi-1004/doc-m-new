'use client'

import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useApi } from '@/hooks/use-api'
import type { DeliveryOrder } from '@/types'

export default function DeliveryOrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: dor } = useApi<DeliveryOrder>(params.id ? `/api/delivery-orders/${params.id}` : null)

  if (!dor) return <div className="flex items-center justify-center py-20 text-slate-500">Loading...</div>

  const lineItems = (dor.lineItems || []) as Array<{ d: string; components?: string[]; q: number; u: string }>

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.push('/delivery-orders')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="text-xs text-slate-500 uppercase tracking-wider">Operations</div>
          <h1 className="text-2xl font-semibold">Delivery Order {dor.number}</h1>
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={() => router.push(`/delivery-orders/${params.id}/edit`)}>
          <Pencil className="h-4 w-4" /> Edit
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Order Details</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div><span className="text-slate-500 block text-xs">DO Number</span><span className="font-mono">{dor.number}</span></div>
                <div><span className="text-slate-500 block text-xs">Customer</span><span className="font-medium">{dor.customer}</span></div>
                <div><span className="text-slate-500 block text-xs">Linked Quote</span><span className="font-mono">{dor.linkedQuote || '—'}</span></div>
                <div><span className="text-slate-500 block text-xs">Date</span><span>{dor.date}</span></div>
                {dor.poNumber && <div><span className="text-slate-500 block text-xs">PO Number</span><span className="font-mono">{dor.poNumber}</span></div>}
                {dor.project && <div><span className="text-slate-500 block text-xs">Project</span><span>{dor.project}</span></div>}
                {dor.salesPerson && <div><span className="text-slate-500 block text-xs">Sales Person</span><span>{dor.salesPerson}</span></div>}
                {dor.shippingAddress && <div className="col-span-2"><span className="text-slate-500 block text-xs">Shipping Address</span><span>{dor.shippingAddress}</span></div>}
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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lineItems.map((item, i) => (
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
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="text-right p-4 border-t font-medium">Total Items: {dor.items}</div>
            </CardContent>
          </Card>

          {dor.notes && (
            <Card>
              <CardHeader><CardTitle className="text-base">Notes</CardTitle></CardHeader>
              <CardContent><p className="text-sm whitespace-pre-wrap">{dor.notes}</p></CardContent>
            </Card>
          )}
        </div>

        <div>
          <Card>
            <CardHeader><CardTitle className="text-base">Summary</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Line Items</span><span>{lineItems.length}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Total Qty</span><span>{dor.items}</span></div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
