'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DocumentPreview } from '@/components/shared/DocumentPreview'
import { apiMutate, useApi } from '@/hooks/use-api'
import { useAppContext } from '@/lib/app-context'
import type { SupplierQuote, SupplierQuoteItem } from '@/types'

const emptyItem = (): SupplierQuoteItem => ({ d: '', q: 1, u: 'pcs', r: 0, t: 0 })

interface SupplierQuoteFormProps {
  editId?: string
}

export function SupplierQuoteForm({ editId }: SupplierQuoteFormProps) {
  const router = useRouter()
  const { company } = useAppContext()

  const { data: existing } = useApi<SupplierQuote>(editId ? `/api/supplier-quotes/${editId}` : null)

  const [supplier, setSupplier] = useState('')
  const [linkedQuote, setLinkedQuote] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [status, setStatus] = useState('PENDING')
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState<SupplierQuoteItem[]>([emptyItem()])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (existing) {
      setSupplier(existing.supplier)
      setLinkedQuote(existing.linkedQuote)
      setDate(existing.date)
      setStatus(existing.status)
      setNotes(existing.notes)
      if (existing.items && existing.items.length > 0) {
        setItems(existing.items)
      }
    }
  }, [existing])

  const updateItem = (index: number, field: keyof SupplierQuoteItem, value: string | number) => {
    setItems(prev => prev.map((item, i) => {
      if (i !== index) return item
      const updated = { ...item, [field]: value }
      updated.t = (Number(updated.q) || 0) * (Number(updated.r) || 0)
      return updated
    }))
  }

  const addItem = () => setItems(prev => [...prev, emptyItem()])
  const removeItem = (index: number) => {
    if (items.length <= 1) return
    setItems(prev => prev.filter((_, i) => i !== index))
  }

  const total = useMemo(() => items.reduce((s, i) => s + (Number(i.q) || 0) * (Number(i.r) || 0), 0), [items])

  const handleSave = async (saveStatus?: string) => {
    if (!supplier.trim()) { toast.error('Supplier is required'); return }
    if (items.length === 0 || !items[0].d) { toast.error('Add at least one item'); return }

    setSaving(true)
    try {
      const payload = {
        supplier, linkedQuote, date, notes,
        status: saveStatus || status,
        amount: total,
        companyCode: company.code,
        items: items.map(i => ({ ...i, q: Number(i.q), r: Number(i.r), t: Number(i.q) * Number(i.r) })),
        _user: 'System',
      }
      if (editId) {
        await apiMutate(`/api/supplier-quotes/${editId}`, 'PUT', payload)
        toast.success('Supplier quote updated')
        router.push('/supplier-quotes')
      } else {
        const created = await apiMutate('/api/supplier-quotes', 'POST', payload)
        toast.success('Supplier quote created')
        if (created?.id) {
          router.push(`/supplier-quotes/${created.id}/edit`)
        } else {
          router.push('/supplier-quotes')
        }
      }
    } catch (err) {
      toast.error((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const cur = company.currency || 'AED'

  const previewColumns = [
    { label: '#', key: '_idx', align: 'center' as const },
    { label: 'Description', key: 'd' },
    { label: 'Qty', key: 'q', align: 'right' as const },
    { label: 'Unit', key: 'u' },
    { label: 'Rate', key: 'r', align: 'right' as const, format: (v: unknown) => Number(v || 0).toLocaleString(undefined, { minimumFractionDigits: 2 }) },
    { label: 'Amount', key: 't', align: 'right' as const, format: (v: unknown) => Number(v || 0).toLocaleString(undefined, { minimumFractionDigits: 2 }) },
  ]

  const previewItems = items.map((item, i) => ({
    ...item, _idx: i + 1, t: (Number(item.q) || 0) * (Number(item.r) || 0),
  }))

  const headerFields = [
    { label: 'Supplier', value: supplier },
    { label: 'Linked Quote', value: linkedQuote },
    { label: 'Date', value: date },
    { label: 'Status', value: editId ? (existing?.status || status) : status },
  ]

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.push('/supplier-quotes')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <div className="text-xs text-slate-500 uppercase tracking-wider">Procurement</div>
          <h1 className="text-2xl font-bold">{editId ? 'Edit Supplier Quote' : 'New Supplier Quote'}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Quote Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Supplier *</Label>
                  <Input value={supplier} onChange={e => setSupplier(e.target.value)} placeholder="Supplier name" />
                </div>
                <div>
                  <Label>Linked Quotation</Label>
                  <Input value={linkedQuote} onChange={e => setLinkedQuote(e.target.value)} placeholder="e.g. AB-Q-2026-0001" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Date</Label>
                  <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="ACCEPTED">Accepted</SelectItem>
                      <SelectItem value="REJECTED">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Line Items</CardTitle>
                <Button variant="outline" size="sm" onClick={addItem} className="gap-1">
                  <Plus className="h-3 w-3" /> Add Item
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {items.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-4">
                      {idx === 0 && <Label className="text-xs">Description</Label>}
                      <Input value={item.d} onChange={e => updateItem(idx, 'd', e.target.value)} placeholder="Item description" />
                    </div>
                    <div className="col-span-2">
                      {idx === 0 && <Label className="text-xs">Qty</Label>}
                      <Input type="number" value={item.q} onChange={e => updateItem(idx, 'q', e.target.value)} />
                    </div>
                    <div className="col-span-1">
                      {idx === 0 && <Label className="text-xs">Unit</Label>}
                      <Input value={item.u} onChange={e => updateItem(idx, 'u', e.target.value)} />
                    </div>
                    <div className="col-span-2">
                      {idx === 0 && <Label className="text-xs">Rate</Label>}
                      <Input type="number" value={item.r} onChange={e => updateItem(idx, 'r', e.target.value)} />
                    </div>
                    <div className="col-span-2">
                      {idx === 0 && <Label className="text-xs">Amount</Label>}
                      <div className="text-sm font-medium py-2 text-right">
                        {((Number(item.q) || 0) * (Number(item.r) || 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                    <div className="col-span-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-500" onClick={() => removeItem(idx)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-right font-bold text-lg">
                Total: {cur} {total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Notes</CardTitle></CardHeader>
            <CardContent>
              <Textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Additional notes..." />
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button onClick={() => handleSave()} disabled={saving} className="bg-slate-900 hover:bg-slate-800">
              {saving ? 'Saving...' : (editId ? 'Update' : 'Save')}
            </Button>
            <Button onClick={() => handleSave('ACCEPTED')} disabled={saving} variant="outline" className="border-emerald-300 text-emerald-700 hover:bg-emerald-50">
              {editId ? 'Update & Accept' : 'Save & Accept'}
            </Button>
            <Button onClick={() => handleSave('REJECTED')} disabled={saving} variant="outline" className="border-rose-300 text-rose-700 hover:bg-rose-50">
              Reject
            </Button>
            <Button variant="ghost" onClick={() => router.push('/supplier-quotes')}>Cancel</Button>
          </div>
        </div>

        <div className="hidden xl:block">
          <div className="sticky top-6">
            <h3 className="text-sm font-medium text-slate-500 mb-3">Live Preview</h3>
            <DocumentPreview
              title="Supplier Quotation"
              docNumber={existing?.number || ''}
              company={company}
              currency={cur}
              headerFields={headerFields}
              columns={previewColumns}
              items={previewItems}
              total={total}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
