'use client'

import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useApi } from '@/hooks/use-api'
import type { Supplier } from '@/types'

export default function SupplierDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: supplier } = useApi<Supplier>(params.id ? `/api/suppliers/${params.id}` : null)

  if (!supplier) return <div className="flex items-center justify-center py-20 text-slate-500">Loading...</div>

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.push('/suppliers')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="text-xs text-slate-500 uppercase tracking-wider">Master Data</div>
          <h1 className="text-2xl font-semibold">{supplier.company}</h1>
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={() => router.push(`/suppliers/${params.id}/edit`)}>
          <Pencil className="h-4 w-4" /> Edit
        </Button>
      </div>

      <div className="max-w-2xl space-y-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Supplier Details</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-slate-500 block text-xs">Code</span><span className="font-mono">{supplier.code}</span></div>
              <div><span className="text-slate-500 block text-xs">Company</span><span className="font-medium">{supplier.company}</span></div>
              <div><span className="text-slate-500 block text-xs">Contact Person</span><span>{supplier.contact}</span></div>
              <div><span className="text-slate-500 block text-xs">Email</span><span>{supplier.email || '—'}</span></div>
              <div><span className="text-slate-500 block text-xs">Phone</span><span>{supplier.phone || '—'}</span></div>
              <div><span className="text-slate-500 block text-xs">Tax No.</span><span>{supplier.tax || '—'}</span></div>
              <div><span className="text-slate-500 block text-xs">Address</span><span>{supplier.address || '—'}</span></div>
              <div><span className="text-slate-500 block text-xs">Bank Details</span><span className="font-mono text-xs">{supplier.bank || '—'}</span></div>
            </div>
          </CardContent>
        </Card>

        {supplier.notes && (
          <Card>
            <CardHeader><CardTitle className="text-base">Notes</CardTitle></CardHeader>
            <CardContent><p className="text-sm whitespace-pre-wrap">{supplier.notes}</p></CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
