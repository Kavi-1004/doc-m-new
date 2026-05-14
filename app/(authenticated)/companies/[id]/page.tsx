'use client'

import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useApi } from '@/hooks/use-api'
import { StatusPill } from '@/components/shared/StatusPill'
import type { Company } from '@/types'

export default function CompanyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: company } = useApi<Company>(params.id ? `/api/companies/${params.id}` : null)

  if (!company) return <div className="flex items-center justify-center py-20 text-slate-500">Loading...</div>

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.push('/companies')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="text-xs text-slate-500 uppercase tracking-wider">Master Data</div>
          <h1 className="text-2xl font-semibold">{company.name}</h1>
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={() => router.push(`/companies/${params.id}/edit`)}>
          <Pencil className="h-4 w-4" /> Edit
        </Button>
      </div>

      <div className="max-w-2xl space-y-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Company Details</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-slate-500 block text-xs">Code</span><span className="font-mono">{company.code}</span></div>
              <div><span className="text-slate-500 block text-xs">Name</span><span className="font-medium">{company.name}</span></div>
              <div><span className="text-slate-500 block text-xs">Currency</span><span>{company.currency}</span></div>
              <div><span className="text-slate-500 block text-xs">Status</span><StatusPill s={company.active ? 'Active' : 'Inactive'} /></div>
              <div><span className="text-slate-500 block text-xs">Registration No.</span><span>{company.regNo || '—'}</span></div>
              <div><span className="text-slate-500 block text-xs">Tax No.</span><span>{company.taxNo || '—'}</span></div>
              <div><span className="text-slate-500 block text-xs">Email</span><span>{company.email || '—'}</span></div>
              <div><span className="text-slate-500 block text-xs">Phone</span><span>{company.phone || '—'}</span></div>
              <div className="col-span-2"><span className="text-slate-500 block text-xs">Address</span><span>{company.address || '—'}</span></div>
              <div className="col-span-2"><span className="text-slate-500 block text-xs">Bank Details</span><span>{company.bank || '—'}</span></div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
