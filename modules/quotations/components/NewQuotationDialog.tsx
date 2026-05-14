'use client'

import { useState, useCallback } from 'react'
import { Plus, Send, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { apiMutate } from '@/hooks/use-api'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { useApi } from '@/hooks/use-api'
import { StatusPill } from '@/components/shared/StatusPill'
import type { Company, Customer } from '@/types'

interface NewQuotationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  company: Company
}

interface CustomersResponse {
  items: Customer[]
}

interface LineItem {
  d: string
  q: number
  u: string
  r: number
}

export function NewQuotationDialog({ open, onOpenChange, company }: NewQuotationDialogProps) {
  const { data: custData } = useApi<CustomersResponse>('/api/customers')
  const customers = custData?.items || []

  const today = new Date().toISOString().slice(0, 10)
  const plus30 = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10)
  const [customerCode, setCustomerCode] = useState('')
  const [project, setProject] = useState('')
  const [date, setDate] = useState(today)
  const [validity, setValidity] = useState(plus30)
  const [items, setItems] = useState<LineItem[]>([{ d: '', q: 1, u: 'unit', r: 0 }])
  const [discountPct, setDiscountPct] = useState(0)
  const [taxPct, setTaxPct] = useState(5)
  const [terms, setTerms] = useState('50% advance, 30% on delivery, 20% on handover. Validity 30 days.')
  const [notes, setNotes] = useState('')

  const customer = customers.find(c => c.code === customerCode) || customers[0]
  const subtotal = items.reduce((s, i) => s + (Number(i.q) || 0) * (Number(i.r) || 0), 0)
  const discount = subtotal * (Number(discountPct) || 0) / 100
  const taxable = subtotal - discount
  const tax = taxable * (Number(taxPct) || 0) / 100
  const grand = taxable + tax
  const nextNumber = `${company.code}-QT-${new Date().getFullYear()}-NEW`

  const [saving, setSaving] = useState(false)
  const updateItem = (i: number, k: keyof LineItem, v: string | number) => setItems(items.map((it, idx) => idx === i ? { ...it, [k]: v } : it))
  const addRow = () => setItems([...items, { d: '', q: 1, u: 'unit', r: 0 }])
  const removeRow = (i: number) => setItems(items.filter((_, idx) => idx !== i))

  const cur = company.currency

  const handleSubmit = useCallback(async (status: 'DRAFT' | 'SENT') => {
    if (!customerCode) { toast.error('Please select a customer'); return }
    setSaving(true)
    try {
      const payload = {
        customer: customer?.company || customerCode,
        project, date, validity,
        items: items.map(i => ({ d: i.d, q: Number(i.q), u: i.u, r: Number(i.r) })),
        terms, status, total: grand,
      }
      await apiMutate('/api/quotations', 'POST', payload)
      toast.success(status === 'DRAFT' ? 'Saved as draft' : `Quotation created and sent`)
      onOpenChange(false)
    } catch (err) {
      toast.error((err as Error).message)
    } finally {
      setSaving(false)
    }
  }, [customerCode, customer, project, date, validity, items, terms, grand, onOpenChange])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[1400px] w-[96vw] h-[94vh] p-0 gap-0 overflow-hidden flex flex-col">
        <DialogHeader className="px-6 py-3.5 border-b flex-row items-center justify-between space-y-0 shrink-0">
          <div>
            <DialogTitle className="text-lg flex items-center gap-2">
              New Quotation
              <Badge variant="outline" className="font-mono text-xs">{nextNumber}</Badge>
              <StatusPill s="DRAFT" />
            </DialogTitle>
            <DialogDescription className="mt-0.5">Edit on the left — the preview on the right updates live.</DialogDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button variant="outline" onClick={() => handleSubmit('DRAFT')} disabled={saving}>Save Draft</Button>
            <Button className="bg-slate-900 hover:bg-slate-800 gap-2" onClick={() => handleSubmit('SENT')} disabled={saving}>
              <Send className="h-4 w-4" />Create & Send
            </Button>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 flex-1 min-h-0">
          <div className="overflow-y-auto p-6 border-r bg-white">
            <div className="space-y-6">
              <div>
                <div className="text-xs uppercase tracking-wider text-slate-500 mb-3 font-medium">Customer & Project</div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-1.5">
                    <Label>Customer</Label>
                    <Select value={customerCode} onValueChange={setCustomerCode}>
                      <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
                      <SelectContent>
                        {customers.map(c => <SelectItem key={c.code} value={c.code}>{c.code} — {c.company}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    {customer && <div className="text-xs text-slate-500">{customer.contact} · {customer.email} · {customer.phone}</div>}
                  </div>
                  <div className="col-span-2 space-y-1.5">
                    <Label>Project</Label>
                    <Input value={project} onChange={e => setProject(e.target.value)} placeholder="Project name / scope" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Date</Label>
                    <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Valid until</Label>
                    <Input type="date" value={validity} onChange={e => setValidity(e.target.value)} />
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs uppercase tracking-wider text-slate-500 font-medium">Line Items</div>
                  <Button variant="outline" size="sm" onClick={addRow} className="gap-1.5 h-8"><Plus className="h-3.5 w-3.5" />Add row</Button>
                </div>
                <div className="space-y-2">
                  <div className="grid grid-cols-12 gap-2 text-[11px] uppercase tracking-wider text-slate-500 px-1">
                    <div className="col-span-5">Description</div>
                    <div className="col-span-2 text-right">Qty</div>
                    <div className="col-span-1 text-center">Unit</div>
                    <div className="col-span-2 text-right">Rate</div>
                    <div className="col-span-1 text-right">Total</div>
                    <div className="col-span-1" />
                  </div>
                  {items.map((it, i) => (
                    <div key={i} className="grid grid-cols-12 gap-2 items-start">
                      <Input className="col-span-5 h-9" value={it.d} placeholder="Description" onChange={e => updateItem(i, 'd', e.target.value)} />
                      <Input className="col-span-2 h-9 text-right" type="number" value={it.q} onChange={e => updateItem(i, 'q', e.target.value)} />
                      <Input className="col-span-1 h-9 text-center px-1 text-xs" value={it.u} onChange={e => updateItem(i, 'u', e.target.value)} />
                      <Input className="col-span-2 h-9 text-right" type="number" value={it.r} onChange={e => updateItem(i, 'r', e.target.value)} />
                      <div className="col-span-1 h-9 flex items-center justify-end text-xs font-medium tabular-nums">{((Number(it.q) || 0) * (Number(it.r) || 0)).toLocaleString()}</div>
                      <Button variant="ghost" size="icon" className="col-span-1 h-9 w-9 text-slate-400 hover:text-rose-600" onClick={() => removeRow(i)} disabled={items.length === 1}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <div className="text-xs uppercase tracking-wider text-slate-500 mb-3 font-medium">Discount & Tax</div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Discount %</Label>
                    <Input type="number" value={discountPct} onChange={e => setDiscountPct(Number(e.target.value))} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>VAT / Tax %</Label>
                    <Input type="number" value={taxPct} onChange={e => setTaxPct(Number(e.target.value))} />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-1.5">
                <Label>Terms & Conditions</Label>
                <Textarea rows={3} value={terms} onChange={e => setTerms(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Internal Notes</Label>
                <Textarea rows={2} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Internal notes (not shown on PDF)" />
              </div>
            </div>
          </div>

          <div className="overflow-y-auto bg-slate-100 p-6">
            <div className="bg-white shadow-md mx-auto max-w-[760px] p-10 text-sm text-slate-800">
              <div className="flex justify-between items-start pb-6 border-b-2 border-slate-900">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-sky-500 to-indigo-600 text-white font-bold text-xl flex items-center justify-center">{company.logo}</div>
                  <div>
                    <div className="text-lg font-bold text-slate-900">{company.name}</div>
                    <div className="text-xs text-slate-500">{company.address}</div>
                    <div className="text-xs text-slate-500">{company.email} · {company.phone}</div>
                    <div className="text-xs text-slate-500">TRN: {company.taxNo}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold tracking-tight text-slate-900">QUOTATION</div>
                  <div className="font-mono text-xs mt-1">{nextNumber}</div>
                  <div className="text-xs text-slate-500 mt-2">Date: <span className="font-medium text-slate-700">{date}</span></div>
                  <div className="text-xs text-slate-500">Valid until: <span className="font-medium text-slate-700">{validity}</span></div>
                </div>
              </div>

              {customer && (
                <div className="grid grid-cols-2 gap-6 mt-6">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1">Bill To</div>
                    <div className="font-semibold text-slate-900">{customer.company}</div>
                    <div className="text-xs text-slate-600">Attn: {customer.contact}</div>
                    <div className="text-xs text-slate-600">{customer.billing}</div>
                    <div className="text-xs text-slate-600">{customer.email}</div>
                    <div className="text-xs text-slate-600">{customer.phone}</div>
                    <div className="text-xs text-slate-500 mt-1">TRN: {customer.tax}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1">Project</div>
                    <div className="font-medium text-slate-900">{project || '—'}</div>
                    <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1 mt-3">Payment Terms</div>
                    <div className="text-xs text-slate-600">{customer.terms}</div>
                  </div>
                </div>
              )}

              <div className="mt-6">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-slate-900 text-white">
                      <th className="text-left font-medium p-2.5 w-10">#</th>
                      <th className="text-left font-medium p-2.5">Description</th>
                      <th className="text-right font-medium p-2.5 w-16">Qty</th>
                      <th className="text-center font-medium p-2.5 w-14">Unit</th>
                      <th className="text-right font-medium p-2.5 w-24">Rate</th>
                      <th className="text-right font-medium p-2.5 w-28">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((it, i) => {
                      const total = (Number(it.q) || 0) * (Number(it.r) || 0)
                      return (
                        <tr key={i} className="border-b border-slate-200">
                          <td className="p-2.5 text-slate-400">{i + 1}</td>
                          <td className="p-2.5">{it.d || <span className="italic text-slate-400">Item description...</span>}</td>
                          <td className="p-2.5 text-right tabular-nums">{Number(it.q || 0).toLocaleString()}</td>
                          <td className="p-2.5 text-center text-slate-500">{it.u}</td>
                          <td className="p-2.5 text-right tabular-nums">{Number(it.r || 0).toLocaleString()}</td>
                          <td className="p-2.5 text-right tabular-nums font-medium">{total.toLocaleString()}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end mt-4">
                <div className="w-72 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-600">Subtotal</span>
                    <span className="tabular-nums font-medium">{cur} {subtotal.toLocaleString()}</span>
                  </div>
                  {discountPct > 0 && (
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-600">Discount ({discountPct}%)</span>
                      <span className="tabular-nums text-rose-600">- {cur} {discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-600">VAT ({taxPct}%)</span>
                    <span className="tabular-nums font-medium">{cur} {tax.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                  </div>
                  <div className="flex justify-between py-3 mt-1 bg-slate-900 text-white px-3 rounded">
                    <span className="font-semibold">Grand Total</span>
                    <span className="tabular-nums font-bold text-base">{cur} {grand.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200">
                <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1">Terms & Conditions</div>
                <div className="text-xs text-slate-600 whitespace-pre-line leading-relaxed">{terms}</div>
              </div>

              <div className="mt-10 grid grid-cols-2 gap-6 text-xs">
                <div><div className="border-t border-slate-300 pt-2 mt-8">For {company.name}</div></div>
                <div className="text-right"><div className="border-t border-slate-300 pt-2 mt-8">Customer Acceptance</div></div>
              </div>
              <div className="mt-8 text-center text-[10px] text-slate-400">
                {company.name} · {company.address} · {company.email}<br />
                Bank: {company.bank}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
