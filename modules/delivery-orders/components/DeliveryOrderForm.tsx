'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, ArrowLeft, ListPlus, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { DocumentPreview } from '@/components/shared/DocumentPreview'
import { CustomerSelector } from '@/components/shared/CustomerSelector'
import { apiMutate, useApi } from '@/hooks/use-api'
import { useAppContext } from '@/lib/app-context'
import type { DeliveryOrder, DeliveryOrderLineItem, Customer } from '@/types'

const emptyItem = (): DeliveryOrderLineItem => ({ d: '', components: [], q: 1, u: 'pcs' })

interface DeliveryOrderFormProps {
  editId?: string
}

export function DeliveryOrderForm({ editId }: DeliveryOrderFormProps) {
  const router = useRouter()
  const { company } = useAppContext()

  const { data: existing } = useApi<DeliveryOrder>(editId ? `/api/delivery-orders/${editId}` : null)

  const [customer, setCustomer] = useState('')
  const [attnName, setAttnName] = useState('')
  const [attnEmail, setAttnEmail] = useState('')
  const [salesPerson, setSalesPerson] = useState('')
  const [poNumber, setPoNumber] = useState('')
  const [project, setProject] = useState('')
  const [linkedQuote, setLinkedQuote] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [shippingAddress, setShippingAddress] = useState('')
  const [notes, setNotes] = useState('')
  const [lineItems, setLineItems] = useState<DeliveryOrderLineItem[]>([emptyItem()])
  const [showSignature, setShowSignature] = useState(true)
  const [saving, setSaving] = useState(false)

  const [customerAddress, setCustomerAddress] = useState('')

  useEffect(() => {
    if (existing) {
      setCustomer(existing.customer)
      setAttnName(existing.attnName || '')
      setAttnEmail(existing.attnEmail || '')
      setSalesPerson(existing.salesPerson || '')
      setPoNumber(existing.poNumber || '')
      setProject(existing.project || '')
      setLinkedQuote(existing.linkedQuote)
      setDate(existing.date)
      setShippingAddress(existing.shippingAddress)
      setNotes(existing.notes)
      setShowSignature(existing.showSignature ?? true)
      if (existing.lineItems && existing.lineItems.length > 0) {
        setLineItems(existing.lineItems.map(it => ({ ...it, components: (it as any).components || [] })))
      }
    }
  }, [existing])

  const handleCustomerChange = (name: string, cust?: Customer) => {
    setCustomer(name)
    if (cust) {
      setAttnName(cust.contact || '')
      setAttnEmail(cust.email || '')
      setCustomerAddress(cust.billing || cust.shipping || '')
      setShippingAddress(cust.shipping || cust.billing || '')
    }
  }

  const updateItem = (index: number, field: keyof DeliveryOrderLineItem, value: any) => {
    setLineItems(prev => prev.map((item, i) => i !== index ? item : { ...item, [field]: value }))
  }

  const addComponent = (itemIndex: number) => {
    setLineItems(prev => prev.map((item, i) => {
      if (i !== itemIndex) return item
      return { ...item, components: [...(item.components || []), ''] }
    }))
  }

  const updateComponent = (itemIndex: number, compIndex: number, value: string) => {
    setLineItems(prev => prev.map((item, i) => {
      if (i !== itemIndex) return item
      const newComps = [...(item.components || [])]
      newComps[compIndex] = value
      return { ...item, components: newComps }
    }))
  }

  const removeComponent = (itemIndex: number, compIndex: number) => {
    setLineItems(prev => prev.map((item, i) => {
      if (i !== itemIndex) return item
      return { ...item, components: (item.components || []).filter((_, ci) => ci !== compIndex) }
    }))
  }

  const addItem = () => setLineItems(prev => [...prev, emptyItem()])
  const removeItem = (index: number) => {
    if (lineItems.length <= 1) return
    setLineItems(prev => prev.filter((_, i) => i !== index))
  }

  const totalItemsCount = lineItems.reduce((s, i) => s + (Number(i.q) || 0), 0)

  const handleSave = async (status: string = 'DISPATCHED') => {
    if (!customer.trim()) { toast.error('Customer is required'); return }
    if (lineItems.length === 0 || !lineItems[0].d) { toast.error('Add at least one item'); return }

    setSaving(true)
    try {
      const payload = {
        customer, attnName, attnEmail, salesPerson, poNumber, project,
        linkedQuote, date, shippingAddress, notes, status, showSignature,
        items: totalItemsCount,
        companyCode: company.code,
        lineItems: lineItems.map(i => ({ ...i, q: Number(i.q) })),
        _user: 'System',
      }
      if (editId) {
        await apiMutate(`/api/delivery-orders/${editId}`, 'PUT', payload)
        toast.success('Delivery order updated')
        router.push('/delivery-orders')
      } else {
        const created = await apiMutate('/api/delivery-orders', 'POST', payload)
        toast.success('Delivery order created')
        if (created?.id) {
          router.push(`/delivery-orders/${created.id}/edit`)
        } else {
          router.push('/delivery-orders')
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
    { label: 'QTY', key: 'q', align: 'right' as const },
  ]

  const previewItems = lineItems.map((item, i) => ({ ...item, _idx: i + 1 }))

  const headerFields = [
    { label: 'Customer', value: customer },
    { label: 'Date', value: date },
  ]

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.push('/delivery-orders')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <div className="text-xs text-slate-500 uppercase tracking-wider">Operations</div>
          <h1 className="text-2xl font-semibold">{editId ? 'Edit Delivery Order' : 'New Delivery Order'}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
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
                  <Input value={project} onChange={e => setProject(e.target.value)} placeholder="Project name" />
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
                  <Label>DO Date</Label>
                  <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
                </div>
                <div>
                  <Label>PO Number</Label>
                  <Input value={poNumber} onChange={e => setPoNumber(e.target.value)} placeholder="e.g. PO-123" />
                </div>
                <div>
                  <Label>Linked Quote</Label>
                  <Input value={linkedQuote} onChange={e => setLinkedQuote(e.target.value)} placeholder="e.g. AB-QT-2024-0001" />
                </div>
              </div>
              <div>
                <Label>Shipping Address</Label>
                <Input value={shippingAddress} onChange={e => setShippingAddress(e.target.value)} placeholder="Delivery address" />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <Switch checked={showSignature} onCheckedChange={setShowSignature} id="show-sig" />
                <Label htmlFor="show-sig" className="cursor-pointer">Show Signature Block</Label>
              </div>
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
              {lineItems.map((item, i) => (
                <div key={i} className="border rounded-lg p-4 bg-slate-50/50 space-y-4 relative">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 space-y-4">
                      <div className="grid grid-cols-12 gap-2">
                         <div className="col-span-1 text-center pt-2 text-xs text-slate-400 font-bold">{i+1}</div>
                         <div className="col-span-11">
                            <Label className="text-xs uppercase font-bold text-slate-500">Item Name</Label>
                            <Input value={item.d} onChange={e => updateItem(i, 'd', e.target.value)} placeholder="e.g. CONTROL PANEL" className="bg-white" />
                         </div>
                      </div>

                      {/* Components Section */}
                      <div className="pl-8 space-y-2">
                        <div className="flex justify-between items-center">
                          <Label className="text-[10px] uppercase font-bold text-slate-400">Detailed Components</Label>
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
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 pl-8">
                        <div className="col-span-2">
                          <Label className="text-xs">Qty</Label>
                          <Input type="number" min={0} value={item.q} onChange={e => updateItem(i, 'q', Number(e.target.value))} className="bg-white" />
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="text-red-500" onClick={() => removeItem(i)} disabled={lineItems.length <= 1}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <div className="text-right pt-2 border-t font-semibold">
                Total Items: {totalItemsCount}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Notes</CardTitle></CardHeader>
            <CardContent>
              <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Delivery instructions, special notes..." rows={3} />
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button onClick={() => handleSave('DISPATCHED')} disabled={saving} className="bg-slate-900 hover:bg-slate-800">
              {saving ? 'Saving...' : (editId ? 'Update' : 'Save as Dispatched')}
            </Button>
            <Button onClick={() => handleSave('DELIVERED')} disabled={saving} variant="outline">
              Mark Delivered
            </Button>
            <Button variant="ghost" onClick={() => router.push('/delivery-orders')}>Cancel</Button>
          </div>
        </div>

        <div className="hidden xl:block">
          <div className="sticky top-6 overflow-y-auto max-h-[calc(100vh-100px)] pb-10 pr-2">
            <h3 className="text-sm font-medium text-slate-500 mb-3">Professional Preview</h3>
            <div className="scale-[0.6] origin-top-left shadow-2xl">
              <DocumentPreview
                title="Delivery Order"
                docNumber={existing?.number || ''}
                company={company}
                currency={company.currency || 'AED'}
                headerFields={headerFields}
                columns={previewColumns}
                items={previewItems}
                notes={notes}
                attnName={attnName}
                attnEmail={attnEmail}
                salesPerson={salesPerson}
                poNumber={poNumber}
                project={project}
                customerName={customer}
                customerAddress={customerAddress}
                showSignature={showSignature}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
