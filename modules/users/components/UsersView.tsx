'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useApi } from '@/hooks/use-api'
import { PageHeader } from '@/components/shared/PageHeader'
import { FilterBar } from '@/components/shared/FilterBar'
import { RowActions } from '@/components/shared/RowActions'
import { StatusPill } from '@/components/shared/StatusPill'
import { Pagination } from '@/components/shared/Pagination'
import { ROLE_STYLES } from '@/lib/constants'
import { initials } from '@/lib/utils'
import type { User } from '@/types'

interface UsersResponse {
  items: User[]
  total: number; page: number; limit: number; pages: number
}

export function UsersView() {
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const { data } = useApi<UsersResponse>(`/api/users?page=${page}&limit=${limit}`)
  const users = data?.items || []

  return (
    <div>
      <PageHeader title="Master Data" description="Users & Roles"
        primary={<Button className="gap-2 bg-slate-900 hover:bg-slate-800"><Plus className="h-4 w-4" />Invite User</Button>} />
      <FilterBar placeholder="Search users..." />
      <Card><CardContent className="p-0">
        <Table>
          <TableHeader><TableRow>
            <TableHead>User</TableHead><TableHead>Role</TableHead><TableHead>Company</TableHead>
            <TableHead>Status</TableHead><TableHead>Last Login</TableHead><TableHead className="w-10" />
          </TableRow></TableHeader>
          <TableBody>
            {users.map(u => (
              <TableRow key={u._id || u.id}>
                <TableCell><div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9"><AvatarFallback className="bg-slate-200 text-xs">{initials(u.name)}</AvatarFallback></Avatar>
                  <div><div className="font-medium">{u.name}</div><div className="text-xs text-slate-500">{u.email}</div></div>
                </div></TableCell>
                <TableCell><Badge variant="outline" className={`font-medium ${ROLE_STYLES[u.role] || ''}`}>{u.role}</Badge></TableCell>
                <TableCell className="font-mono text-xs">{u.company}</TableCell>
                <TableCell><StatusPill s={u.status} /></TableCell>
                <TableCell className="text-sm text-slate-600">{u.lastLogin}</TableCell>
                <TableCell><RowActions /></TableCell>
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
