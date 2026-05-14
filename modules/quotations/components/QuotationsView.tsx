'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, FileText, Truck } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useApi, apiMutate } from '@/hooks/use-api'
import { useAppContext } from '@/lib/app-context'
import { PageHeader } from '@/components/shared/PageHeader'
import { FilterBar } from '@/components/shared/FilterBar'
import { RowActions } from '@/components/shared/RowActions'
import { StatusPill } from '@/components/shared/StatusPill'
import { Pagination } from '@/components/shared/Pagination'
import { fmtMoney } from '@/lib/utils'
import type { Quotation } from '@/types'

interface QuotationsResponse {
  items: Quotation[]
  total: number
  page: number
  limit: number
  pages: number
}

export function QuotationsView() {
  const router = useRouter()
  const { company } = useAppContext()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const params = new URLSearchParams({ page: String(page), limit: String(limit) })
  if (search) params.set('q', search)
  const { data, refresh } = useApi<QuotationsResponse>(`/api/quotations?${params}`)
  const quotations = data?.items || []

  const handleGeneratePO = useCallback(async (id: string) => {
    try {
      const po = await apiMutate(`/api/quotations/${id}`, 'PUT', {
        _action: 'generate_po', companyCode: company.code, _user: 'System',
      })
      toast.success(`PO ${po.number} created`)
      router.push(`/purchase-orders/${po.id}/edit`)
    } catch (err) {
      toast.error((err as Error).message)
    }
  }, [company.code, router])

  const handleGenerateDO = useCallback(async (id: string) => {
    try {
      const dor = await apiMutate(`/api/quotations/${id}`, 'PUT', {
        _action: 'generate_do', companyCode: company.code, _user: 'System',
      })
      toast.success(`DO ${dor.number} created`)
      router.push(`/delivery-orders/${dor.id}/edit`)
    } catch (err) {
      toast.error((err as Error).message)
    }
  }, [company.code, router])

  const handleDelete = useCallback(async (id: string) => {
    try {
      await apiMutate(`/api/quotations/${id}`, 'DELETE')
      toast.success('Quotation deleted')
      refresh()
    } catch (err) {
      toast.error((err as Error).message)
    }
  }, [refresh])

  return (
    <div>
      <PageHeader title="Sales" description="Quotations"
        primary={<Button className="gap-2 bg-slate-900 hover:bg-slate-800" onClick={() => router.push('/quotations/new')}><Plus className="h-4 w-4" />New Quotation</Button>} />
      <FilterBar placeholder="Search quotations..." onSearch={setSearch} />
      <Card><CardContent className="p-0">
        <Table>
          <TableHeader><TableRow>
            <TableHead>Number</TableHead><TableHead>Rev</TableHead><TableHead>Customer</TableHead>
            <TableHead>Project</TableHead><TableHead>Date</TableHead>
            <TableHead className="text-right">Total</TableHead><TableHead>Status</TableHead><TableHead className="w-10" />
          </TableRow></TableHeader>
          <TableBody>
            {quotations.map(q => (
              <TableRow key={q._id || q.id}>
                <TableCell className="font-mono text-xs">{q.number}</TableCell>
                <TableCell className="text-xs text-slate-500">R{q.rev}</TableCell>
                <TableCell className="font-medium">{q.customer}</TableCell>
                <TableCell className="text-xs text-slate-600">{q.project}</TableCell>
                <TableCell className="text-sm">{q.date}</TableCell>
                <TableCell className="text-right font-medium">{fmtMoney(q.total)}</TableCell>
                <TableCell><StatusPill s={q.status} /></TableCell>
                <TableCell>
                  <RowActions
                    onView={() => router.push(`/quotations/${q.id || q._id}`)}
                    onEdit={() => router.push(`/quotations/${q.id || q._id}/edit`)}
                    onDelete={() => handleDelete(q.id || q._id || '')}
                    extraActions={[
                      {
                        label: 'Generate PO',
                        icon: <FileText className="h-4 w-4 mr-2" />,
                        onClick: () => handleGeneratePO(q.id || q._id || ''),
                      },
                      {
                        label: 'Generate DO',
                        icon: <Truck className="h-4 w-4 mr-2" />,
                        onClick: () => handleGenerateDO(q.id || q._id || ''),
                      },
                    ]}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
        {data && <Pagination page={data.page} pages={data.pages} total={data.total} limit={data.limit} onPageChange={setPage} onLimitChange={v => { setLimit(v); setPage(1) }} />}
      </Card>
    </div>
  )
}
