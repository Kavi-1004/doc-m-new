'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Receipt } from 'lucide-react'
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
import type { DeliveryOrder } from '@/types'

interface DeliveryOrdersResponse {
  items: DeliveryOrder[]
  total: number; page: number; limit: number; pages: number
}

export function DeliveryOrdersView() {
  const router = useRouter()
  const { company } = useAppContext()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const params = new URLSearchParams({ page: String(page), limit: String(limit) })
  if (search) params.set('q', search)
  const { data, refresh } = useApi<DeliveryOrdersResponse>(`/api/delivery-orders?${params}`)
  const deliveryOrders = data?.items || []

  const handleDuplicate = useCallback(async (id: string) => {
    try {
      const original = await (await fetch(`/api/delivery-orders/${id}`)).json()
      if (!original || original.error) { toast.error('Failed to load DO'); return }
      const payload = {
        customer: original.customer, linkedQuote: original.linkedQuote,
        date: new Date().toISOString().slice(0, 10), items: original.items,
        lineItems: original.lineItems, notes: original.notes, status: 'DISPATCHED',
        shippingAddress: original.shippingAddress, attnName: original.attnName,
        attnEmail: original.attnEmail, salesPerson: original.salesPerson,
        poNumber: original.poNumber, project: original.project,
        companyCode: company.code, _user: 'System',
      }
      const created = await apiMutate('/api/delivery-orders', 'POST', payload)
      toast.success(`DO duplicated: ${(created as Record<string, string>).number}`)
      refresh()
    } catch (err) {
      toast.error((err as Error).message)
    }
  }, [company.code, refresh])

  const handleGenerateInvoice = useCallback(async (id: string) => {
    try {
      const inv = await apiMutate(`/api/delivery-orders/${id}`, 'PUT', {
        _action: 'generate_invoice', companyCode: company.code, _user: 'System',
      })
      toast.success(`Invoice ${(inv as Record<string, string>).number} created from DO`)
      router.push(`/invoices/${(inv as Record<string, string>).id}/edit`)
    } catch (err) {
      toast.error((err as Error).message)
    }
  }, [company.code, router])

  const handleDelete = useCallback(async (id: string) => {
    try {
      await apiMutate(`/api/delivery-orders/${id}`, 'DELETE')
      toast.success('Delivery order deleted')
      refresh()
    } catch (err) {
      toast.error((err as Error).message)
    }
  }, [refresh])

  return (
    <div>
      <PageHeader title="Operations" description="Delivery Orders"
        primary={<Button className="gap-2 bg-slate-900 hover:bg-slate-800" onClick={() => router.push('/delivery-orders/new')}><Plus className="h-4 w-4" />New DO</Button>} />
      <FilterBar placeholder="Search delivery orders..." onSearch={setSearch} />
      <Card><CardContent className="p-0">
        <Table>
          <TableHeader><TableRow>
            <TableHead>DO Number</TableHead><TableHead>Customer</TableHead>
            <TableHead>Linked Quote</TableHead><TableHead>Date</TableHead>
            <TableHead className="text-right">Items</TableHead><TableHead>Status</TableHead><TableHead className="w-10" />
          </TableRow></TableHeader>
          <TableBody>
            {deliveryOrders.map(d => (
              <TableRow key={d._id || d.id}>
                <TableCell className="font-mono text-xs">{d.number}</TableCell>
                <TableCell className="font-medium">{d.customer}</TableCell>
                <TableCell className="font-mono text-xs text-slate-600">{d.linkedQuote}</TableCell>
                <TableCell className="text-sm">{d.date}</TableCell>
                <TableCell className="text-right">{d.items}</TableCell>
                <TableCell><StatusPill s={d.status} /></TableCell>
                <TableCell>
                  <RowActions
                    onView={() => router.push(`/delivery-orders/${d.id || d._id}`)}
                    onEdit={() => router.push(`/delivery-orders/${d.id || d._id}/edit`)}
                    onDuplicate={() => handleDuplicate(d.id || d._id || '')}
                    onDelete={() => handleDelete(d.id || d._id || '')}
                    extraActions={[
                      {
                        label: 'Generate Invoice',
                        icon: <Receipt className="h-4 w-4 mr-2" />,
                        onClick: () => handleGenerateInvoice(d.id || d._id || ''),
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
