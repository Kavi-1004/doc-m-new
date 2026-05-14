'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useApi, apiMutate } from '@/hooks/use-api'
import { PageHeader } from '@/components/shared/PageHeader'
import { FilterBar } from '@/components/shared/FilterBar'
import { RowActions } from '@/components/shared/RowActions'
import { Pagination } from '@/components/shared/Pagination'
import type { Supplier } from '@/types'

interface SuppliersResponse {
  items: Supplier[]
  total: number; page: number; limit: number; pages: number
}

export function SuppliersView() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const params = new URLSearchParams({ page: String(page), limit: String(limit) })
  if (search) params.set('q', search)
  const { data, refresh } = useApi<SuppliersResponse>(`/api/suppliers?${params}`)
  const suppliers = data?.items || []

  const handleDuplicate = useCallback(async (id: string) => {
    try {
      const original = await (await fetch(`/api/suppliers/${id}`)).json()
      if (!original || original.error) { toast.error('Failed to load supplier'); return }
      const payload = {
        company: original.company + ' (Copy)', contact: original.contact,
        email: original.email, phone: original.phone, tax: original.tax,
        terms: original.terms, address: original.address, bank: original.bank,
        notes: original.notes, _user: 'System',
      }
      const created = await apiMutate('/api/suppliers', 'POST', payload)
      toast.success(`Supplier duplicated: ${(created as Record<string, string>).code}`)
      refresh()
    } catch (err) {
      toast.error((err as Error).message)
    }
  }, [refresh])

  const handleDelete = useCallback(async (id: string) => {
    try {
      await apiMutate(`/api/suppliers/${id}`, 'DELETE')
      toast.success('Supplier deleted')
      refresh()
    } catch (err) {
      toast.error((err as Error).message)
    }
  }, [refresh])

  return (
    <div>
      <PageHeader title="Master Data" description="Suppliers"
        primary={<Button className="gap-2 bg-slate-900 hover:bg-slate-800" onClick={() => router.push('/suppliers/new')}><Plus className="h-4 w-4" />New Supplier</Button>} />
      <FilterBar placeholder="Search suppliers..." onSearch={setSearch} />
      <Card><CardContent className="p-0">
        <Table>
          <TableHeader><TableRow>
            <TableHead>Code</TableHead><TableHead>Supplier</TableHead><TableHead>Contact</TableHead>
            <TableHead>Terms</TableHead><TableHead>Bank</TableHead><TableHead className="w-10" />
          </TableRow></TableHeader>
          <TableBody>
            {suppliers.map(s => (
              <TableRow key={s._id || s.id}>
                <TableCell className="font-mono text-xs">{s.code}</TableCell>
                <TableCell><div className="font-medium">{s.company}</div><div className="text-xs text-slate-500">{s.address}</div></TableCell>
                <TableCell><div>{s.contact}</div><div className="text-xs text-slate-500">{s.email}</div></TableCell>
                <TableCell><Badge variant="secondary">{s.terms}</Badge></TableCell>
                <TableCell className="text-xs text-slate-600 font-mono">{s.bank}</TableCell>
                <TableCell>
                  <RowActions
                    onView={() => router.push(`/suppliers/${s.id || s._id}`)}
                    onEdit={() => router.push(`/suppliers/${s.id || s._id}/edit`)}
                    onDuplicate={() => handleDuplicate(s.id || s._id || '')}
                    onDelete={() => handleDelete(s.id || s._id || '')}
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
