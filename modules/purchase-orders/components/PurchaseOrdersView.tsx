'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useApi, apiMutate } from '@/hooks/use-api'
import { PageHeader } from '@/components/shared/PageHeader'
import { FilterBar } from '@/components/shared/FilterBar'
import { RowActions } from '@/components/shared/RowActions'
import { StatusPill } from '@/components/shared/StatusPill'
import { Pagination } from '@/components/shared/Pagination'
import { fmtMoney } from '@/lib/utils'
import type { PurchaseOrder } from '@/types'

interface PurchaseOrdersResponse {
  items: PurchaseOrder[]
  total: number; page: number; limit: number; pages: number
}

export function PurchaseOrdersView() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const params = new URLSearchParams({ page: String(page), limit: String(limit) })
  if (search) params.set('q', search)
  const { data, refresh } = useApi<PurchaseOrdersResponse>(`/api/purchase-orders?${params}`)
  const purchaseOrders = data?.items || []

  const handleDelete = useCallback(async (id: string) => {
    try {
      await apiMutate(`/api/purchase-orders/${id}`, 'DELETE')
      toast.success('Purchase order deleted')
      refresh()
    } catch (err) {
      toast.error((err as Error).message)
    }
  }, [refresh])

  return (
    <div>
      <PageHeader title="Procurement" description="Purchase Orders"
        primary={<Button className="gap-2 bg-slate-900 hover:bg-slate-800" onClick={() => router.push('/purchase-orders/new')}><Plus className="h-4 w-4" />New PO</Button>} />
      <FilterBar placeholder="Search purchase orders..." onSearch={setSearch} />
      <Card><CardContent className="p-0">
        <Table>
          <TableHeader><TableRow>
            <TableHead>PO Number</TableHead><TableHead>Supplier</TableHead>
            <TableHead>Linked Quote</TableHead><TableHead>Date</TableHead>
            <TableHead className="text-right">Amount</TableHead><TableHead>Status</TableHead><TableHead className="w-10" />
          </TableRow></TableHeader>
          <TableBody>
            {purchaseOrders.map(p => (
              <TableRow key={p._id || p.id}>
                <TableCell className="font-mono text-xs">{p.number}</TableCell>
                <TableCell className="font-medium">{p.supplier}</TableCell>
                <TableCell className="font-mono text-xs text-slate-600">{p.linkedQuote}</TableCell>
                <TableCell className="text-sm">{p.date}</TableCell>
                <TableCell className="text-right font-medium">{fmtMoney(p.amount)}</TableCell>
                <TableCell><StatusPill s={p.status} /></TableCell>
                <TableCell>
                  <RowActions
                    onEdit={() => router.push(`/purchase-orders/${p.id || p._id}/edit`)}
                    onDelete={() => handleDelete(p.id || p._id || '')}
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
