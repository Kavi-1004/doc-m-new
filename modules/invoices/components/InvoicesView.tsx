'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
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
import type { Invoice } from '@/types'

interface InvoicesResponse {
  items: Invoice[]
  total: number; page: number; limit: number; pages: number
}

export function InvoicesView() {
  const router = useRouter()
  const { company } = useAppContext()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const params = new URLSearchParams({ page: String(page), limit: String(limit) })
  if (search) params.set('q', search)
  const { data, refresh } = useApi<InvoicesResponse>(`/api/invoices?${params}`)
  const invoiceList = data?.items || []

  const handleDuplicate = useCallback(async (id: string) => {
    try {
      const original = await (await fetch(`/api/invoices/${id}`)).json()
      if (!original || original.error) { toast.error('Failed to load invoice'); return }
      const payload = {
        customer: original.customer, linkedQuote: original.linkedQuote,
        date: new Date().toISOString().slice(0, 10), due: original.due,
        total: original.total, paid: 0, status: 'UNPAID',
        items: original.items, notes: original.notes, terms: original.terms,
        attnName: original.attnName, attnEmail: original.attnEmail,
        salesPerson: original.salesPerson, poNumber: original.poNumber,
        project: original.project, discount: original.discount, tax: original.tax,
        companyCode: company.code, _user: 'System',
      }
      const created = await apiMutate('/api/invoices', 'POST', payload)
      toast.success(`Invoice duplicated: ${(created as Record<string, string>).number}`)
      refresh()
    } catch (err) {
      toast.error((err as Error).message)
    }
  }, [company.code, refresh])

  const handleDelete = useCallback(async (id: string) => {
    try {
      await apiMutate(`/api/invoices/${id}`, 'DELETE')
      toast.success('Invoice voided')
      refresh()
    } catch (err) {
      toast.error((err as Error).message)
    }
  }, [refresh])

  return (
    <div>
      <PageHeader title="Finance" description="Invoices"
        primary={<Button className="gap-2 bg-slate-900 hover:bg-slate-800" onClick={() => router.push('/invoices/new')}><Plus className="h-4 w-4" />New Invoice</Button>} />
      <FilterBar placeholder="Search invoices..." onSearch={setSearch} />
      <Card><CardContent className="p-0">
        <Table>
          <TableHeader><TableRow>
            <TableHead>Number</TableHead><TableHead>Customer</TableHead>
            <TableHead>Linked Quote</TableHead><TableHead>Date</TableHead>
            <TableHead className="text-right">Total</TableHead><TableHead className="text-right">Paid</TableHead>
            <TableHead>Status</TableHead><TableHead className="w-10" />
          </TableRow></TableHeader>
          <TableBody>
            {invoiceList.map(i => (
              <TableRow key={i._id || i.id}>
                <TableCell className="font-mono text-xs">{i.number}</TableCell>
                <TableCell className="font-medium">{i.customer}</TableCell>
                <TableCell className="font-mono text-xs text-slate-600">{i.linkedQuote}</TableCell>
                <TableCell className="text-sm">{i.date}</TableCell>
                <TableCell className="text-right font-medium">{fmtMoney(i.total)}</TableCell>
                <TableCell className="text-right text-emerald-600">{fmtMoney(i.paid)}</TableCell>
                <TableCell><StatusPill s={i.status} /></TableCell>
                <TableCell>
                  <RowActions
                    onView={() => router.push(`/invoices/${i.id || i._id}`)}
                    onEdit={() => router.push(`/invoices/${i.id || i._id}/edit`)}
                    onDuplicate={() => handleDuplicate(i.id || i._id || '')}
                    onDelete={() => handleDelete(i.id || i._id || '')}
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
