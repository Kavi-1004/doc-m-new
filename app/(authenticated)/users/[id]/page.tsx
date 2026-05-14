'use client'

import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useApi } from '@/hooks/use-api'
import { StatusPill } from '@/components/shared/StatusPill'
import { ROLE_STYLES } from '@/lib/constants'
import type { User } from '@/types'

export default function UserDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: user } = useApi<User>(params.id ? `/api/users/${params.id}` : null)

  if (!user) return <div className="flex items-center justify-center py-20 text-slate-500">Loading...</div>

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.push('/users')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="text-xs text-slate-500 uppercase tracking-wider">Master Data</div>
          <h1 className="text-2xl font-semibold">{user.name}</h1>
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={() => router.push(`/users/${params.id}/edit`)}>
          <Pencil className="h-4 w-4" /> Edit
        </Button>
      </div>

      <div className="max-w-2xl space-y-6">
        <Card>
          <CardHeader><CardTitle className="text-base">User Details</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-slate-500 block text-xs">Name</span><span className="font-medium">{user.name}</span></div>
              <div><span className="text-slate-500 block text-xs">Email</span><span>{user.email}</span></div>
              <div><span className="text-slate-500 block text-xs">Role</span><Badge variant="outline" className={`font-medium ${ROLE_STYLES[user.role] || ''}`}>{user.role}</Badge></div>
              <div><span className="text-slate-500 block text-xs">Status</span><StatusPill s={user.status} /></div>
              <div><span className="text-slate-500 block text-xs">Company</span><span>{user.company || '—'}</span></div>
              <div><span className="text-slate-500 block text-xs">Last Login</span><span>{user.lastLogin || '—'}</span></div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
