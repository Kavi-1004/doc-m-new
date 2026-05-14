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
import { apiMutate, useApi } from '@/hooks/use-api'
import type { Supplier } from '@/types'

const PAYMENT_TERMS = ['Net 15', 'Net 30', 'Net 45', 'Net 60', 'Net 90', 'Due on Receipt', 'COD']

interface SupplierFormProps {
  editId?: string
}

export function SupplierForm({ editId }: SupplierFormProps) {
  const router = useRouter()
  const { data: existing } = useApi<Supplier>(editId ? `/api/suppliers/${editId}` : null)

  const [company, setCompany] = useState('')
  const [contact, setContact] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [tax, setTax] = useState('')
  const [terms, setTerms] = useState('Net 30')
  const [address, setAddress] = useState('')
  const [bank, setBank] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (existing) {
      setCompany(existing.company)
      setContact(existing.contact)
      setEmail(existing.email)
      setPhone(existing.phone)
      setTax(existing.tax)
      setTerms(existing.terms)
      setAddress(existing.address)
      setBank(existing.bank)
      setNotes(existing.notes)
    }
  }, [existing])

  const handleSave = async () => {
    if (!company.trim()) { toast.error('Company name is required'); return }
    if (!contact.trim()) { toast.error('Contact person is required'); return }

    setSaving(true)
    try {
      const payload = { company, contact, email, phone, tax, terms, address, bank, notes, _user: 'System' }
      if (editId) {
        await apiMutate(`/api/suppliers/${editId}`, 'PUT', payload)
        toast.success('Supplier updated')
      } else {
        await apiMutate('/api/suppliers', 'POST', payload)
        toast.success('Supplier created')
      }
      router.push('/suppliers')
    } catch (err) {
      toast.error((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.push('/suppliers')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <div className="text-xs text-slate-500 uppercase tracking-wider">Master Data</div>
          <h1 className="text-2xl font-semibold">{editId ? 'Edit Supplier' : 'New Supplier'}</h1>
        </div>
      </div>

      <div className="max-w-2xl space-y-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Supplier Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Company Name *</Label>
                <Input value={company} onChange={e => setCompany(e.target.value)} placeholder="Supplier company" />
              </div>
              <div>
                <Label>Contact Person *</Label>
                <Input value={contact} onChange={e => setContact(e.target.value)} placeholder="Full name" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Email</Label>
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div>
                <Label>Phone</Label>
                <Input value={phone} onChange={e => setPhone(e.target.value)} />
              </div>
            </div>
            <div>
              <Label>Tax No. (TRN)</Label>
              <Input value={tax} onChange={e => setTax(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Terms & Address</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Payment Terms</Label>
              <Select value={terms} onValueChange={setTerms}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PAYMENT_TERMS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Address</Label>
              <Input value={address} onChange={e => setAddress(e.target.value)} placeholder="Supplier address" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Banking & Notes</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Bank Details</Label>
              <Input value={bank} onChange={e => setBank(e.target.value)} placeholder="Bank name, Account no., IBAN" />
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Internal notes..." rows={3} />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button onClick={handleSave} disabled={saving} className="bg-slate-900 hover:bg-slate-800">
            {saving ? 'Saving...' : (editId ? 'Update Supplier' : 'Create Supplier')}
          </Button>
          <Button variant="ghost" onClick={() => router.push('/suppliers')}>Cancel</Button>
        </div>
      </div>
    </div>
  )
}
