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
import { DocumentPreview } from '@/components/shared/DocumentPreview'
import { QuotationSelector } from '@/components/shared/QuotationSelector'
import { apiMutate, useApi } from '@/hooks/use-api'
import { useAppContext } from '@/lib/app-context'
import type { PurchaseOrder, PurchaseOrderItem, Quotation } from '@/types'

const emptyItem = (): PurchaseOrderItem => ({ d: '', q: 1, u: 'pcs', r: 0, t: 0 })

interface PurchaseOrderFormProps {
  editId?: string
}

export function PurchaseOrderForm({ editId }: PurchaseOrderFormProps) {
  const router = useRouter()
  const { company } = useAppContext()

  const { data: existing } = useApi<PurchaseOrder>(editId ? `/api/purchase-orders/${editId}` : null)

  const [supplier, setSupplier] = useState('')
  const [linkedQuote, setLinkedQuote] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [expectedDelivery, setExpectedDelivery] = useState('')
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState<PurchaseOrderItem[]>([emptyItem()])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (existing) {
      setSupplier(existing.supplier)
      setLinkedQuote(existing.linkedQuote)
      setDate(existing.date)
      setExpectedDelivery(existing.expectedDelivery)
      setNotes(existing.notes)
      if (existing.items && existing.items.length > 0) {
        setItems(existing.items)
      }
    }
  }, [existing])

  const updateItem = (index: number, field: keyof PurchaseOrderItem, value: string | number) => {
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

  const handleSave = async (status: string = 'PENDING') => {
    if (!supplier.trim()) { toast.error('Supplier is required'); return }
    if (items.length === 0 || !items[0].d) { toast.error('Add at least one item'); return }

    setSaving(true)
    try {
      const payload = {
        supplier, linkedQuote, date, expectedDelivery, notes, status,
        amount: total,
        companyCode: company.code,
        items: items.map(i => ({ ...i, q: Number(i.q), r: Number(i.r), t: Number(i.q) * Number(i.r) })),
        _user: 'System',
      }
      if (editId) {
        await apiMutate(`/api/purchase-orders/${editId}`, 'PUT', payload)
        toast.success('Purchase order updated')
        router.push('/purchase-orders')
      } else {
        const created = await apiMutate('/api/purchase-orders', 'POST', payload)
        toast.success('Purchase order created')
        if (created?.id) {
          router.push(`/purchase-orders/${created.id}/edit`)
        } else {
          router.push('/purchase-orders')
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
    { label: 'Expected Delivery', value: expectedDelivery },
    { label: 'Status', value: editId ? (existing?.status || 'PENDING') : 'PENDING' },
  ]

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.push('/purchase-orders')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <div className="text-xs text-slate-500 uppercase tracking-wider">Procurement</div>
          <h1 className="text-2xl font-semibold">{editId ? 'Edit Purchase Order' : 'New Purchase Order'}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Supplier *</Label>
                  <Input value={supplier} onChange={e => setSupplier(e.target.value)} placeholder="Supplier name" />
                </div>
                <div>
                  <Label>Linked Quote</Label>
                  <QuotationSelector value={linkedQuote} onChange={(val: string, q?: Quotation) => {
                    setLinkedQuote(val)
                    if (q && q.items && Array.isArray(q.items)) {
                      const qItems = q.items as Array<Record<string, unknown>>
                      setItems(qItems.map(i => ({
                        d: String(i.d || ''), q: Number(i.q) || 1, u: String(i.u || 'pcs'),
                        r: Number(i.r) || 0, t: (Number(i.q) || 0) * (Number(i.r) || 0),
                      })))
                    }
                  }} placeholder="Select or search quotation..." />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Date</Label>
                  <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
                </div>
                <div>
                  <Label>Expected Delivery</Label>
                  <Input type="date" value={expectedDelivery} onChange={e => setExpectedDelivery(e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-base">Line Items</CardTitle>
                <Button variant="outline" size="sm" onClick={addItem} className="gap-1">
                  <Plus className="h-3.5 w-3.5" /> Add Item
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {items.map((item, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-4">
                    {i === 0 && <Label className="text-xs">Description</Label>}
                    <Input value={item.d} onChange={e => updateItem(i, 'd', e.target.value)} placeholder="Item description" />
                  </div>
                  <div className="col-span-2">
                    {i === 0 && <Label className="text-xs">Qty</Label>}
                    <Input type="number" min={0} value={item.q} onChange={e => updateItem(i, 'q', Number(e.target.value))} />
                  </div>
                  <div className="col-span-2">
                    {i === 0 && <Label className="text-xs">Unit</Label>}
                    <Input value={item.u} onChange={e => updateItem(i, 'u', e.target.value)} placeholder="pcs" />
                  </div>
                  <div className="col-span-2">
                    {i === 0 && <Label className="text-xs">Rate</Label>}
                    <Input type="number" min={0} value={item.r} onChange={e => updateItem(i, 'r', Number(e.target.value))} />
                  </div>
                  <div className="col-span-1 text-right text-sm font-medium pt-1">
                    {((Number(item.q) || 0) * (Number(item.r) || 0)).toLocaleString()}
                  </div>
                  <div className="col-span-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => removeItem(i)} disabled={items.length <= 1}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
              <div className="text-right pt-2 border-t font-semibold">
                Total: {cur} {total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Notes</CardTitle></CardHeader>
            <CardContent>
              <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Additional notes..." rows={3} />
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button onClick={() => handleSave('PENDING')} disabled={saving} className="bg-slate-900 hover:bg-slate-800">
              {saving ? 'Saving...' : (editId ? 'Update' : 'Save as Pending')}
            </Button>
            <Button onClick={() => handleSave('SENT')} disabled={saving} variant="outline">
              {editId ? 'Update & Send' : 'Save & Send'}
            </Button>
            <Button variant="ghost" onClick={() => router.push('/purchase-orders')}>Cancel</Button>
          </div>
        </div>

        <div className="hidden xl:block">
          <div className="sticky top-6">
            <h3 className="text-sm font-medium text-slate-500 mb-3">Live Preview</h3>
            <DocumentPreview
              title="Purchase Order"
              docNumber={existing?.number || ''}
              company={company}
              currency={cur}
              headerFields={headerFields}
              columns={previewColumns}
              items={previewItems}
              total={total}
              notes={notes}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
