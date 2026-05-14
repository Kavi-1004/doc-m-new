'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Paperclip, Download } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useApi, apiMutate } from '@/hooks/use-api'
import { PageHeader } from '@/components/shared/PageHeader'
import { FilterBar } from '@/components/shared/FilterBar'
import { RowActions } from '@/components/shared/RowActions'
import { Pagination } from '@/components/shared/Pagination'
import { CAT_COLORS } from '@/lib/constants'
import { fmtMoney } from '@/lib/utils'
import type { Expense } from '@/types'

interface ExpensesResponse {
  items: Expense[]
  total: number; page: number; limit: number; pages: number
}

export function ExpensesView() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const params = new URLSearchParams({ page: String(page), limit: String(limit) })
  if (search) params.set('q', search)
  if (category !== 'all') params.set('category', category)
  const { data, refresh } = useApi<ExpensesResponse>(`/api/expenses?${params}`)
  const expenseList = data?.items || []

  const handleDuplicate = useCallback(async (id: string) => {
    try {
      const original = await (await fetch(`/api/expenses/${id}`)).json()
      if (!original || original.error) { toast.error('Failed to load expense'); return }
      const payload = {
        project: original.project, supplier: original.supplier,
        category: original.category, amount: original.amount,
        date: new Date().toISOString().slice(0, 10),
        notes: original.notes, _user: 'System',
      }
      const created = await apiMutate('/api/expenses', 'POST', payload)
      toast.success(`Expense duplicated: ${(created as Record<string, string>).number}`)
      refresh()
    } catch (err) {
      toast.error((err as Error).message)
    }
  }, [refresh])

  const handleDelete = useCallback(async (id: string) => {
    try {
      await apiMutate(`/api/expenses/${id}`, 'DELETE')
      toast.success('Expense deleted')
      refresh()
    } catch (err) {
      toast.error((err as Error).message)
    }
  }, [refresh])

  return (
    <div>
      <PageHeader title="Finance" description="Expenses"
        primary={<Button className="gap-2 bg-slate-900 hover:bg-slate-800" onClick={() => router.push('/expenses/new')}><Plus className="h-4 w-4" />New Expense</Button>} />
      <FilterBar placeholder="Search expenses..." onSearch={setSearch} extras={
        <Select value={category} onValueChange={setCategory}><SelectTrigger className="w-44"><SelectValue /></SelectTrigger><SelectContent>
          <SelectItem value="all">All categories</SelectItem>
          {Object.keys(CAT_COLORS).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
        </SelectContent></Select>
      } />
      <Card><CardContent className="p-0">
        <Table>
          <TableHeader><TableRow>
            <TableHead>Number</TableHead><TableHead>Project</TableHead>
            <TableHead>Supplier</TableHead><TableHead>Category</TableHead>
            <TableHead>Date</TableHead><TableHead className="text-right">Amount</TableHead>
            <TableHead>Notes</TableHead><TableHead className="w-10" />
          </TableRow></TableHeader>
          <TableBody>
            {expenseList.map(e => (
              <TableRow key={e._id || e.id}>
                <TableCell className="font-mono text-xs">{e.number}</TableCell>
                <TableCell className="font-mono text-xs text-slate-600">{e.project}</TableCell>
                <TableCell className="text-sm">{e.supplier}</TableCell>
                <TableCell><Badge variant="outline" className={`font-medium ${CAT_COLORS[e.category] || ''}`}>{e.category}</Badge></TableCell>
                <TableCell className="text-sm">{e.date}</TableCell>
                <TableCell className="text-right font-medium">{fmtMoney(e.amount)}</TableCell>
                <TableCell className="text-xs text-slate-500 max-w-[200px] truncate">
                  {e.attachment && <Paperclip className="h-3 w-3 inline mr-1 text-sky-600" />}
                  {e.notes}
                </TableCell>
                <TableCell>
                  <RowActions
                    onView={() => router.push(`/expenses/${e.id || e._id}`)}
                    onEdit={() => router.push(`/expenses/${e.id || e._id}/edit`)}
                    onDuplicate={() => handleDuplicate(e.id || e._id || '')}
                    onDelete={() => handleDelete(e.id || e._id || '')}
                    extraActions={[{
                      label: 'Export PDF',
                      icon: <Download className="h-4 w-4 mr-2" />,
                      onClick: () => window.open(`/api/export/expense/${e.id || e._id}`, '_blank'),
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
