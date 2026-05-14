'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useApi } from '@/hooks/use-api'
import { PageHeader } from '@/components/shared/PageHeader'
import { FilterBar } from '@/components/shared/FilterBar'
import { RowActions } from '@/components/shared/RowActions'
import { StatusPill } from '@/components/shared/StatusPill'
import { Pagination } from '@/components/shared/Pagination'
import type { Company } from '@/types'

interface CompaniesResponse {
  items: Company[]
  total: number; page: number; limit: number; pages: number
}

export function CompaniesView() {
  const router = useRouter()
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const { data } = useApi<CompaniesResponse>(`/api/companies?page=${page}&limit=${limit}`)
  const companies = data?.items || []

  return (
    <div>
      <PageHeader title="Master Data" description="Companies"
        primary={<Button className="gap-2 bg-slate-900 hover:bg-slate-800" onClick={() => router.push('/companies/new')}><Plus className="h-4 w-4" />New Company</Button>} />
      <FilterBar placeholder="Search companies..." />
      <Card><CardContent className="p-0">
        <Table>
          <TableHeader><TableRow>
            <TableHead>Code</TableHead><TableHead>Name</TableHead>
            <TableHead>Currency</TableHead><TableHead>Tax No.</TableHead>
            <TableHead>Contact</TableHead><TableHead>Status</TableHead><TableHead className="w-10" />
          </TableRow></TableHeader>
          <TableBody>
            {companies.map(c => (
              <TableRow key={c._id || c.id}>
                <TableCell><div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-900 text-white text-xs flex items-center justify-center font-semibold">{c.logo}</div>
                  <span className="font-mono">{c.code}</span>
                </div></TableCell>
                <TableCell className="font-medium">{c.name}<div className="text-xs text-slate-500">{c.address}</div></TableCell>
                <TableCell><Badge variant="secondary">{c.currency}</Badge></TableCell>
                <TableCell className="font-mono text-xs">{c.taxNo}</TableCell>
                <TableCell><div className="text-sm">{c.email}</div><div className="text-xs text-slate-500">{c.phone}</div></TableCell>
                <TableCell><StatusPill s={c.active ? 'Active' : 'Inactive'} /></TableCell>
                <TableCell>
                  <RowActions onEdit={() => router.push(`/companies/${c.id || c._id}/edit`)} />
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
