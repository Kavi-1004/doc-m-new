'use client'

import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Pencil, Paperclip } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useApi } from '@/hooks/use-api'
import { CAT_COLORS } from '@/lib/constants'
import { fmtMoney } from '@/lib/utils'
import type { Expense } from '@/types'

export default function ExpenseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: expense } = useApi<Expense>(params.id ? `/api/expenses/${params.id}` : null)

  if (!expense) return <div className="flex items-center justify-center py-20 text-slate-500">Loading...</div>

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.push('/expenses')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="text-xs text-slate-500 uppercase tracking-wider">Finance</div>
          <h1 className="text-2xl font-semibold">Expense {expense.number}</h1>
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={() => router.push(`/expenses/${params.id}/edit`)}>
          <Pencil className="h-4 w-4" /> Edit
        </Button>
      </div>

      <div className="max-w-2xl space-y-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Expense Details</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-slate-500 block text-xs">Number</span><span className="font-mono">{expense.number}</span></div>
              <div><span className="text-slate-500 block text-xs">Category</span><Badge variant="outline" className={`font-medium ${CAT_COLORS[expense.category] || ''}`}>{expense.category}</Badge></div>
              <div><span className="text-slate-500 block text-xs">Amount</span><span className="font-bold text-lg">{fmtMoney(expense.amount)}</span></div>
              <div><span className="text-slate-500 block text-xs">Date</span><span>{expense.date}</span></div>
              <div><span className="text-slate-500 block text-xs">Project</span><span>{expense.project || '—'}</span></div>
              <div><span className="text-slate-500 block text-xs">Supplier</span><span>{expense.supplier || '—'}</span></div>
            </div>
          </CardContent>
        </Card>

        {expense.attachment && (
          <Card>
            <CardHeader><CardTitle className="text-base">Attachment</CardTitle></CardHeader>
            <CardContent>
              <a href={expense.attachment} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-sky-600 hover:underline">
                <Paperclip className="h-4 w-4" /> View Receipt / Document
              </a>
            </CardContent>
          </Card>
        )}

        {expense.notes && (
          <Card>
            <CardHeader><CardTitle className="text-base">Notes</CardTitle></CardHeader>
            <CardContent><p className="text-sm whitespace-pre-wrap">{expense.notes}</p></CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
