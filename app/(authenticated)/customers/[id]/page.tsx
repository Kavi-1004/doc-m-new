'use client'

import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useApi } from '@/hooks/use-api'
import type { Customer } from '@/types'

export default function CustomerDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: customer } = useApi<Customer>(params.id ? `/api/customers/${params.id}` : null)

  if (!customer) return <div className="flex items-center justify-center py-20 text-slate-500">Loading...</div>

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.push('/customers')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="text-xs text-slate-500 uppercase tracking-wider">Master Data</div>
          <h1 className="text-2xl font-semibold">{customer.company}</h1>
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={() => router.push(`/customers/${params.id}/edit`)}>
          <Pencil className="h-4 w-4" /> Edit
        </Button>
      </div>

      <div className="max-w-2xl space-y-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Customer Details</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-slate-500 block text-xs">Code</span><span className="font-mono">{customer.code}</span></div>
              <div><span className="text-slate-500 block text-xs">Company</span><span className="font-medium">{customer.company}</span></div>
              <div><span className="text-slate-500 block text-xs">Contact Person</span><span>{customer.contact}</span></div>
              <div><span className="text-slate-500 block text-xs">Email</span><span>{customer.email || '—'}</span></div>
              <div><span className="text-slate-500 block text-xs">Phone</span><span>{customer.phone || '—'}</span></div>
              <div><span className="text-slate-500 block text-xs">Tax No. (TRN)</span><span>{customer.tax || '—'}</span></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Address</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm">{customer.billing || customer.shipping || '—'}</p>
          </CardContent>
        </Card>

        {customer.notes && (
          <Card>
            <CardHeader><CardTitle className="text-base">Notes</CardTitle></CardHeader>
            <CardContent><p className="text-sm whitespace-pre-wrap">{customer.notes}</p></CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
