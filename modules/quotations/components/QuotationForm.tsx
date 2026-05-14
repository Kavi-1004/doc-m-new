'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, ArrowLeft, RotateCcw, FileText, Truck, Receipt, ListPlus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { DocumentPreview } from '@/components/shared/DocumentPreview'
import { CustomerSelector } from '@/components/shared/CustomerSelector'
import { FileUpload } from '@/components/shared/FileUpload'
import { apiMutate, useApi } from '@/hooks/use-api'
import { useAppContext } from '@/lib/app-context'
import type { Quotation, QuotationItem, Customer } from '@/types'

const CURRENCIES = ['LKR', 'AED', 'USD', 'EUR', 'GBP', 'INR', 'SAR', 'QAR', 'BHD', 'OMR', 'KWD']

const emptyItem = (): QuotationItem => ({ d: '', components: [], q: 1, u: 'pcs', r: 0, t: 0 })

interface QuotationFormProps {
  editId?: string
}

export function QuotationForm({ editId }: QuotationFormProps) {
  const router = useRouter()
  const { company } = useAppContext()

  const { data: existing } = useApi<Quotation>(editId ? `/api/quotations/${editId}` : null)

  const [customer, setCustomer] = useState('')
  const [attnName, setAttnName] = useState('')
  const [attnEmail, setAttnEmail] = useState('')
  const [salesPerson, setSalesPerson] = useState('')
  const [project, setProject] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [validity, setValidity] = useState('30 days')
  const [currency, setCurrency] = useState('AED')
  const [terms, setTerms] = useState('')
  const [items, setItems] = useState<QuotationItem[]>([emptyItem()])
  const [showSignature, setShowSignature] = useState(true)
  const [discount, setDiscount] = useState(0)
  const [tax, setTax] = useState(0)
  const [saving, setSaving] = useState(false)
  const [invoicePct, setInvoicePct] = useState(100)
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false)
  const [poDocument, setPoDocument] = useState('')

  const [customerAddress, setCustomerAddress] = useState('')

  useEffect(() => {
    if (existing) {
      setCustomer(existing.customer)
      setAttnName(existing.attnName || '')
      setAttnEmail(existing.attnEmail || '')
      setSalesPerson(existing.salesPerson || '')
      setProject(existing.project)
      setDate(existing.date)
      setValidity(existing.validity)
      setTerms(existing.terms)
      setCurrency(existing.currency || 'AED')
      setShowSignature(existing.showSignature ?? true)
      setDiscount(existing.discount || 0)
      setTax(existing.tax || 0)
      setPoDocument(existing.poDocument || '')
      if (existing.items && existing.items.length > 0) {
        setItems(existing.items.map(it => ({ ...it, components: it.components || [] })))
      }
    }
  }, [existing])

  const handleCustomerChange = (name: string, cust?: Customer) => {
    setCustomer(name)
    if (cust) {
      setAttnName(cust.contact || '')
      setAttnEmail(cust.email || '')
      setCustomerAddress(cust.billing || cust.shipping || '')
      if (cust.terms) setTerms(cust.terms)
    }
  }

  const updateItem = (index: number, field: keyof QuotationItem, value: any) => {
    setItems(prev => prev.map((item, i) => {
      if (i !== index) return item
      const updated = { ...item, [field]: value }
      if (field === 'q' || field === 'r') {
        updated.t = (Number(updated.q) || 0) * (Number(updated.r) || 0)
      }
      return updated
    }))
  }

  const addComponent = (itemIndex: number) => {
    setItems(prev => prev.map((item, i) => {
      if (i !== itemIndex) return item
      return { ...item, components: [...(item.components || []), ''] }
    }))
  }

  const updateComponent = (itemIndex: number, compIndex: number, value: string) => {
    setItems(prev => prev.map((item, i) => {
      if (i !== itemIndex) return item
      const newComps = [...(item.components || [])]
      newComps[compIndex] = value
      return { ...item, components: newComps }
    }))
  }

  const removeComponent = (itemIndex: number, compIndex: number) => {
    setItems(prev => prev.map((item, i) => {
      if (i !== itemIndex) return item
      return { ...item, components: (item.components || []).filter((_, ci) => ci !== compIndex) }
    }))
  }

  const addItem = () => setItems(prev => [...prev, emptyItem()])

  const removeItem = (index: number) => {
    if (items.length <= 1) return
    setItems(prev => prev.filter((_, i) => i !== index))
  }

  const total = useMemo(() => items.reduce((s, i) => s + (Number(i.q) || 0) * (Number(i.r) || 0), 0), [items])

  const handleSave = async (status: string = 'DRAFT') => {
    if (!customer.trim()) { toast.error('Customer is required'); return }
    if (items.length === 0 || !items[0].d) { toast.error('Add at least one item'); return }

    setSaving(true)
    try {
      const payload = {
        customer, project, date, validity, terms, status, currency,
        attnName, attnEmail, salesPerson, showSignature,
        discount, tax, poDocument,
        companyCode: company.code,
        items: items.map(i => ({ ...i, q: Number(i.q), r: Number(i.r), t: Number(i.q) * Number(i.r) })),
        _user: 'System',
      }
      if (editId) {
        await apiMutate(`/api/quotations/${editId}`, 'PUT', payload)
        toast.success('Quotation updated')
        router.push('/quotations')
      } else {
        const created = await apiMutate('/api/quotations', 'POST', payload)
        toast.success('Quotation created')
        if (created?.id) {
          router.push(`/quotations/${created.id}/edit`)
        } else {
          router.push('/quotations')
        }
      }
    } catch (err) {
      toast.error((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const previewColumns = [
    { label: 'SN', key: '_idx', align: 'center' as const },
    { label: 'ITEM / DESCRIPTION', key: 'd' },
    { label: 'UNIT PRICE', key: 'r', align: 'right' as const },
    { label: 'QTY', key: 'q', align: 'right' as const },
    { label: 'SUB TOTAL', key: 't', align: 'right' as const },
  ]

  const previewItems = items.map((item, i) => ({
    ...item,
    _idx: i + 1,
    t: (Number(item.q) || 0) * (Number(item.r) || 0),
  }))

  const headerFields = [
    { label: 'Customer', value: customer },
    { label: 'Project', value: project },
    { label: 'Date', value: date },
    { label: 'Validity', value: validity },
    { label: 'Currency', value: currency },
  ]

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.push('/quotations')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <div className="text-xs text-slate-500 uppercase tracking-wider">Sales</div>
          <h1 className="text-2xl font-semibold">{editId ? 'Edit Quotation' : 'New Quotation'}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Form */}
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Document Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Customer *</Label>
                  <CustomerSelector value={customer} onChange={handleCustomerChange} />
                </div>
                <div>
                  <Label>Project / Subject</Label>
                  <Input value={project} onChange={e => setProject(e.target.value)} placeholder="Project name or subject" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Attention To</Label>
                  <Input value={attnName} onChange={e => setAttnName(e.target.value)} placeholder="Name" />
                </div>
                <div>
                  <Label>Attn Email</Label>
                  <Input value={attnEmail} onChange={e => setAttnEmail(e.target.value)} placeholder="Email" />
                </div>
                <div>
                  <Label>Sales Person</Label>
                  <Input value={salesPerson} onChange={e => setSalesPerson(e.target.value)} placeholder="Name" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Date</Label>
                  <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
                </div>
                <div>
                  <Label>Validity</Label>
                  <Input value={validity} onChange={e => setValidity(e.target.value)} placeholder="e.g. 30 days" />
                </div>
                <div>
                  <Label>Currency</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map(c => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <Switch checked={showSignature} onCheckedChange={setShowSignature} id="show-sig" />
                <Label htmlFor="show-sig" className="cursor-pointer">Show Signature Block</Label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Customer PO Document</CardTitle></CardHeader>
            <CardContent>
              <p className="text-xs text-slate-500 mb-2">Upload the customer&apos;s purchase order document (PDF, image, etc.)</p>
              <FileUpload value={poDocument} onChange={setPoDocument} accept="image/*,.pdf,.doc,.docx" label="customer PO" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-base">Line Items</CardTitle>
                <Button variant="outline" size="sm" onClick={addItem} className="gap-1">
                  <Plus className="h-3.5 w-3.5" /> Add Main Item
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {items.map((item, i) => (
                <div key={i} className="border rounded-lg p-4 bg-slate-50/50 space-y-4 relative">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 space-y-4">
                      <div className="grid grid-cols-12 gap-2">
                         <div className="col-span-1 text-center pt-2 text-xs text-slate-400 font-bold">{i+1}</div>
                         <div className="col-span-11">
                            <Label className="text-xs uppercase font-bold text-slate-500">Item Name / Heading</Label>
                            <Input 
                              value={item.d} 
                              onChange={e => updateItem(i, 'd', e.target.value)} 
                              placeholder="e.g. CONTROL PANEL (INDOOR-MS)"
                              className="font-bold bg-white"
                            />
                         </div>
                      </div>

                      {/* Components Section */}
                      <div className="pl-8 space-y-2">
                        <div className="flex justify-between items-center">
                          <Label className="text-[10px] uppercase font-bold text-slate-400">Detailed Components / Sub-items</Label>
                          <Button variant="ghost" size="sm" onClick={() => addComponent(i)} className="h-6 text-[10px] gap-1 hover:bg-white border">
                            <ListPlus className="h-3 w-3" /> Add Component
                          </Button>
                        </div>
                        <div className="space-y-2">
                          {item.components?.map((comp, ci) => (
                            <div key={ci} className="flex gap-2 group">
                              <span className="text-[10px] font-bold text-slate-400 pt-2 w-4">
                                {String.fromCharCode(65 + ci)}.
                              </span>
                              <Textarea 
                                value={comp} 
                                onChange={e => updateComponent(i, ci, e.target.value)}
                                placeholder={`Component detail ${ci + 1}...`}
                                className="text-xs min-h-[40px] bg-white"
                                rows={1}
                              />
                              <Button 
                                variant="ghost" size="icon" 
                                className="h-8 w-8 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => removeComponent(i, ci)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                          {(!item.components || item.components.length === 0) && (
                            <p className="text-[10px] text-slate-400 italic">No detailed components added.</p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 pl-8">
                        <div>
                          <Label className="text-xs">Quantity</Label>
                          <Input type="number" min={0} value={item.q} onChange={e => updateItem(i, 'q', Number(e.target.value))} className="bg-white" />
                        </div>
                        <div>
                          <Label className="text-xs">Unit Price ({currency})</Label>
                          <Input type="number" min={0} value={item.r} onChange={e => updateItem(i, 'r', Number(e.target.value))} className="bg-white" />
                        </div>
                        <div className="text-right">
                          <Label className="text-xs">Sub Total</Label>
                          <div className="h-10 flex items-center justify-end font-bold text-sm">
                            {((Number(item.q) || 0) * (Number(item.r) || 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <Button 
                      variant="ghost" size="icon" 
                      className="text-red-500 hover:bg-red-50" 
                      onClick={() => removeItem(i)} 
                      disabled={items.length <= 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <div className="text-right pt-4 border-t space-y-2">
                <div className="text-slate-500 font-semibold">Sub Total: {currency} {total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                <div className="flex items-center justify-end gap-3">
                  <Label className="text-xs text-red-500">Discount ({currency})</Label>
                  <Input type="number" value={discount} onChange={e => setDiscount(Number(e.target.value))} className="w-32 text-right border-red-200" />
                </div>
                <div className="flex items-center justify-end gap-3">
                  <Label className="text-xs">Tax ({currency})</Label>
                  <Input type="number" value={tax} onChange={e => setTax(Number(e.target.value))} className="w-32 text-right" />
                </div>
                <div className="font-bold text-xl pt-2">
                  Net Total: {currency} {(total - discount + tax).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Payment Terms</CardTitle></CardHeader>
            <CardContent>
              <Textarea value={terms} onChange={e => setTerms(e.target.value)} placeholder="Payment terms, conditions..." rows={4} />
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button onClick={() => handleSave('DRAFT')} disabled={saving} className="bg-slate-900 hover:bg-slate-800">
              {saving ? 'Saving...' : (editId ? 'Update Draft' : 'Save as Draft')}
            </Button>
            <Button onClick={() => handleSave('SENT')} disabled={saving} variant="outline">
              {editId ? 'Update & Send' : 'Save & Send'}
            </Button>
            {editId && (
              <Button
                variant="outline"
                className="gap-2 border-amber-300 text-amber-700 hover:bg-amber-50"
                disabled={saving}
                onClick={async () => {
                  setSaving(true)
                  try {
                    const revised = await apiMutate(`/api/quotations/${editId}`, 'PUT', { _action: 'revise', _user: 'System' })
                    toast.success(`Revision R${revised.rev} created`)
                    router.push(`/quotations/${revised.id}/edit`)
                  } catch (err) {
                    toast.error((err as Error).message)
                  } finally {
                    setSaving(false)
                  }
                }}
              >
                <RotateCcw className="h-4 w-4" /> Revise
              </Button>
            )}
            <Button variant="ghost" onClick={() => router.push('/quotations')}>Cancel</Button>
          </div>
        </div>

        {/* Live Preview */}
        <div className="hidden xl:block">
          <div className="sticky top-6 overflow-y-auto max-h-[calc(100vh-100px)] pb-10 pr-2">
            <h3 className="text-sm font-medium text-slate-500 mb-3">Professional Preview</h3>
            <div className="scale-[0.6] origin-top-left shadow-2xl">
              <DocumentPreview
                title="Quotation"
                docNumber={existing?.number || ''}
                company={company}
                currency={currency}
                headerFields={headerFields}
                columns={previewColumns}
                items={previewItems}
                total={total}
                terms={terms}
                attnName={attnName}
                attnEmail={attnEmail}
                salesPerson={salesPerson}
                project={project}
                customerName={customer}
                customerAddress={customerAddress}
                showSignature={showSignature}
                discount={discount}
                tax={tax}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

import { X } from 'lucide-react'
