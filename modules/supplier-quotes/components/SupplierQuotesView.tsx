'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Paperclip, Download } from 'lucide-react'
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
import type { SupplierQuote } from '@/types'

interface SupplierQuotesResponse {
  items: SupplierQuote[]
  total: number; page: number; limit: number; pages: number
}

export function SupplierQuotesView() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const params = new URLSearchParams({ page: String(page), limit: String(limit) })
  if (search) params.set('q', search)
  const { data, refresh } = useApi<SupplierQuotesResponse>(`/api/supplier-quotes?${params}`)
  const supplierQuotes = data?.items || []

  const handleDuplicate = useCallback(async (id: string) => {
    try {
      const original = await (await fetch(`/api/supplier-quotes/${id}`)).json()
      if (!original || original.error) { toast.error('Failed to load supplier quote'); return }
      const payload = {
        supplier: original.supplier, linkedQuote: original.linkedQuote,
        date: new Date().toISOString().slice(0, 10), amount: original.amount,
        status: 'PENDING', items: original.items, notes: original.notes, _user: 'System',
      }
      const created = await apiMutate('/api/supplier-quotes', 'POST', payload)
      toast.success(`Supplier quote duplicated: ${(created as Record<string, string>).number}`)
      refresh()
    } catch (err) {
      toast.error((err as Error).message)
    }
  }, [refresh])

  const handleDelete = useCallback(async (id: string) => {
    try {
      await apiMutate(`/api/supplier-quotes/${id}`, 'DELETE')
      toast.success('Supplier quote deleted')
      refresh()
    } catch (err) {
      toast.error((err as Error).message)
    }
  }, [refresh])

  return (
    <div>
      <PageHeader title="Procurement" description="Supplier Quotations"
        primary={<Button className="gap-2 bg-slate-900 hover:bg-slate-800" onClick={() => router.push('/supplier-quotes/new')}><Plus className="h-4 w-4" />New Supplier Quote</Button>} />
      <FilterBar placeholder="Search supplier quotes..." onSearch={setSearch} />
      <Card><CardContent className="p-0">
        <Table>
          <TableHeader><TableRow>
            <TableHead>Number</TableHead><TableHead>Supplier</TableHead>
            <TableHead>Linked Quote</TableHead><TableHead>Date</TableHead>
            <TableHead className="text-right">Amount</TableHead><TableHead>Status</TableHead><TableHead>Notes</TableHead><TableHead className="w-10" />
          </TableRow></TableHeader>
          <TableBody>
            {supplierQuotes.map(s => (
              <TableRow key={s._id || s.id}>
                <TableCell className="font-mono text-xs">{s.number}</TableCell>
                <TableCell className="font-medium">{s.supplier}</TableCell>
                <TableCell className="font-mono text-xs text-slate-600">{s.linkedQuote}</TableCell>
                <TableCell className="text-sm">{s.date}</TableCell>
                <TableCell className="text-right font-medium">{fmtMoney(s.amount)}</TableCell>
                <TableCell><StatusPill s={s.status} /></TableCell>
                <TableCell className="text-xs text-slate-500 max-w-[180px] truncate"><Paperclip className="h-3 w-3 inline mr-1" />{s.notes || '—'}</TableCell>
                <TableCell>
                  <RowActions
                    onView={() => router.push(`/supplier-quotes/${s.id || s._id}`)}
                    onEdit={() => router.push(`/supplier-quotes/${s.id || s._id}/edit`)}
                    onDuplicate={() => handleDuplicate(s.id || s._id || '')}
                    onDelete={() => handleDelete(s.id || s._id || '')}
                    extraActions={[{
                      label: 'Export PDF',
                      icon: <Download className="h-4 w-4 mr-2" />,
                      onClick: () => window.open(`/api/export/supplier-quote/${s.id || s._id}`, '_blank'),
                    }]}
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
