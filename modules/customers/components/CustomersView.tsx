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
import { Pagination } from '@/components/shared/Pagination'
import type { Customer } from '@/types'

interface CustomersResponse {
  items: Customer[]
  total: number; page: number; limit: number; pages: number
}

export function CustomersView() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const params = new URLSearchParams({ page: String(page), limit: String(limit) })
  if (search) params.set('q', search)
  const { data, refresh } = useApi<CustomersResponse>(`/api/customers?${params}`)
  const customers = data?.items || []

  const handleDuplicate = useCallback(async (id: string) => {
    try {
      const original = await (await fetch(`/api/customers/${id}`)).json()
      if (!original || original.error) { toast.error('Failed to load customer'); return }
      const payload = {
        company: original.company + ' (Copy)', contact: original.contact,
        email: original.email, phone: original.phone, tax: original.tax,
        billing: original.billing, shipping: original.shipping, notes: original.notes,
        _user: 'System',
      }
      const created = await apiMutate('/api/customers', 'POST', payload)
      toast.success(`Customer duplicated: ${(created as Record<string, string>).code}`)
      refresh()
    } catch (err) {
      toast.error((err as Error).message)
    }
  }, [refresh])

  const handleDelete = useCallback(async (id: string) => {
    try {
      await apiMutate(`/api/customers/${id}`, 'DELETE')
      toast.success('Customer deleted')
      refresh()
    } catch (err) {
      toast.error((err as Error).message)
    }
  }, [refresh])

  return (
    <div>
      <PageHeader title="Master Data" description="Customers"
        primary={<Button className="gap-2 bg-slate-900 hover:bg-slate-800" onClick={() => router.push('/customers/new')}><Plus className="h-4 w-4" />New Customer</Button>} />
      <FilterBar placeholder="Search customers..." onSearch={setSearch} />
      <Card><CardContent className="p-0">
        <Table>
          <TableHeader><TableRow>
            <TableHead>Code</TableHead><TableHead>Customer</TableHead><TableHead>Contact</TableHead>
            <TableHead>Phone</TableHead><TableHead className="w-10" />
          </TableRow></TableHeader>
          <TableBody>
            {customers.map(c => (
              <TableRow key={c._id || c.id}>
                <TableCell className="font-mono text-xs">{c.code}</TableCell>
                <TableCell><div className="font-medium">{c.company}</div><div className="text-xs text-slate-500">{c.billing || c.shipping}</div></TableCell>
                <TableCell><div>{c.contact}</div><div className="text-xs text-slate-500">{c.email}</div></TableCell>
                <TableCell className="text-sm">{c.phone}</TableCell>
                <TableCell>
                  <RowActions
                    onView={() => router.push(`/customers/${c.id || c._id}`)}
                    onEdit={() => router.push(`/customers/${c.id || c._id}/edit`)}
                    onDuplicate={() => handleDuplicate(c.id || c._id || '')}
                    onDelete={() => handleDelete(c.id || c._id || '')}
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
