'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FileUpload } from '@/components/shared/FileUpload'
import { ProjectSelector } from '@/components/shared/ProjectSelector'
import { SupplierSelector } from '@/components/shared/SupplierSelector'
import { apiMutate, useApi } from '@/hooks/use-api'
import { CAT_COLORS } from '@/lib/constants'
import type { Expense } from '@/types'

interface ExpenseFormProps {
  editId?: string
}

export function ExpenseForm({ editId }: ExpenseFormProps) {
  const router = useRouter()
  const { data: existing } = useApi<Expense>(editId ? `/api/expenses/${editId}` : null)

  const [category, setCategory] = useState('MATERIAL')
  const [project, setProject] = useState('')
  const [supplier, setSupplier] = useState('')
  const [amount, setAmount] = useState(0)
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [notes, setNotes] = useState('')
  const [attachment, setAttachment] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (existing) {
      setCategory(existing.category)
      setProject(existing.project)
      setSupplier(existing.supplier)
      setAmount(existing.amount)
      setDate(existing.date)
      setNotes(existing.notes)
      setAttachment(existing.attachment || '')
    }
  }, [existing])

  const handleSave = async () => {
    if (!category) { toast.error('Category is required'); return }
    if (amount <= 0) { toast.error('Amount must be greater than 0'); return }

    setSaving(true)
    try {
      const payload = { category, project, supplier, amount, date, notes, attachment, _user: 'System' }
      if (editId) {
        await apiMutate(`/api/expenses/${editId}`, 'PUT', payload)
        toast.success('Expense updated')
      } else {
        await apiMutate('/api/expenses', 'POST', payload)
        toast.success('Expense created')
      }
      router.push('/expenses')
    } catch (err) {
      toast.error((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.push('/expenses')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <div className="text-xs text-slate-500 uppercase tracking-wider">Finance</div>
          <h1 className="text-2xl font-semibold">{editId ? 'Edit Expense' : 'New Expense'}</h1>
        </div>
      </div>

      <div className="max-w-2xl space-y-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Expense Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Category *</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.keys(CAT_COLORS).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Amount *</Label>
                <Input type="number" min={0} step={0.01} value={amount} onChange={e => setAmount(Number(e.target.value))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Project</Label>
                <ProjectSelector value={project} onChange={setProject} placeholder="Select or search project..." />
              </div>
              <div>
                <Label>Supplier</Label>
                <SupplierSelector value={supplier} onChange={(val) => setSupplier(val)} placeholder="Select supplier..." />
              </div>
            </div>
            <div>
              <Label>Date</Label>
              <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Notes & Attachment</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Notes</Label>
              <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Expense details, receipt info..." rows={3} />
            </div>
            <div>
              <Label>Receipt / Document</Label>
              <FileUpload value={attachment} onChange={setAttachment} accept="image/*,.pdf,.doc,.docx,.xls,.xlsx" label="receipt" />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button onClick={handleSave} disabled={saving} className="bg-slate-900 hover:bg-slate-800">
            {saving ? 'Saving...' : (editId ? 'Update Expense' : 'Create Expense')}
          </Button>
          <Button variant="ghost" onClick={() => router.push('/expenses')}>Cancel</Button>
        </div>
      </div>
    </div>
  )
}
