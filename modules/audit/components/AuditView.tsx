'use client'

import { useState } from 'react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useApi } from '@/hooks/use-api'
import { PageHeader } from '@/components/shared/PageHeader'
import { FilterBar } from '@/components/shared/FilterBar'
import { Pagination } from '@/components/shared/Pagination'
import { ACTION_COLORS } from '@/lib/constants'
import { initials } from '@/lib/utils'
import type { AuditEntry } from '@/types'

interface AuditResponse {
  items: AuditEntry[]
  total: number; page: number; limit: number; pages: number
}

export function AuditView() {
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const { data } = useApi<AuditResponse>(`/api/audit-logs?page=${page}&limit=${limit}`)
  const auditLogs = data?.items || []

  return (
    <div>
      <PageHeader title="System" description="Audit Logs" />
      <FilterBar placeholder="Search audit logs..." />
      <Card><CardContent className="p-0">
        <Table>
          <TableHeader><TableRow>
            <TableHead>Time</TableHead><TableHead>User</TableHead>
            <TableHead>Module</TableHead><TableHead>Action</TableHead>
            <TableHead>Target</TableHead><TableHead>IP</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {auditLogs.map(a => (
              <TableRow key={a._id || a.id}>
                <TableCell className="font-mono text-xs whitespace-nowrap">{a.time}</TableCell>
                <TableCell><div className="flex items-center gap-2"><Avatar className="h-6 w-6"><AvatarFallback className="text-[10px] bg-slate-200">{initials(a.user)}</AvatarFallback></Avatar><span className="text-sm">{a.user}</span></div></TableCell>
                <TableCell><Badge variant="secondary">{a.module}</Badge></TableCell>
                <TableCell><Badge className={`font-medium ${ACTION_COLORS[a.action] || ''}`}>{a.action}</Badge></TableCell>
                <TableCell className="font-mono text-xs">{a.target}</TableCell>
                <TableCell className="font-mono text-xs text-slate-500">{a.ip}</TableCell>
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
