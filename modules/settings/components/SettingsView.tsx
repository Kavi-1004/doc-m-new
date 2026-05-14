'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { PageHeader } from '@/components/shared/PageHeader'
import { ROLES, ROLE_STYLES } from '@/lib/constants'
import { useAppContext } from '@/lib/app-context'

export function SettingsView() {
  const { company, updateCompany: onCompanyUpdate } = useAppContext()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: company.name,
    code: company.code,
    regNo: company.regNo,
    taxNo: company.taxNo,
    address: company.address,
    email: company.email,
    phone: company.phone,
    currency: company.currency,
    bank: company.bank,
  })

  const update = (field: keyof typeof form, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/companies/${company.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || 'Failed to save')
        return
      }
      const updated = await res.json()
      toast.success('Settings saved')
      onCompanyUpdate?.(updated)
    } catch {
      toast.error('Network error')
    } finally {
      setSaving(false)
    }
  }

  const year = new Date().getFullYear()

  return (
    <div>
      <PageHeader title="System" description="Settings" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Company Profile — {form.code}</CardTitle><CardDescription>Used in document headers, PDFs and numbering.</CardDescription></CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><Label>Company name</Label><Input value={form.name} onChange={e => update('name', e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Short code</Label><Input value={form.code} onChange={e => update('code', e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Registration No.</Label><Input value={form.regNo} onChange={e => update('regNo', e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Tax / VAT No.</Label><Input value={form.taxNo} onChange={e => update('taxNo', e.target.value)} /></div>
            <div className="col-span-2 space-y-1.5"><Label>Address</Label><Input value={form.address} onChange={e => update('address', e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Email</Label><Input value={form.email} onChange={e => update('email', e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Phone</Label><Input value={form.phone} onChange={e => update('phone', e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Currency</Label><Input value={form.currency} onChange={e => update('currency', e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Bank Details</Label><Input value={form.bank} onChange={e => update('bank', e.target.value)} /></div>
            <div className="col-span-2 space-y-1.5"><Label>Notes</Label><Textarea placeholder="Internal notes..." /></div>
            <div className="col-span-2 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setForm({ name: company.name, code: company.code, regNo: company.regNo, taxNo: company.taxNo, address: company.address, email: company.email, phone: company.phone, currency: company.currency, bank: company.bank })}>Cancel</Button>
              <Button className="bg-slate-900 hover:bg-slate-800" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save changes'}</Button>
            </div>
          </CardContent>
        </Card>
        <div className="space-y-4">
          <Card><CardHeader><CardTitle>Document Numbering</CardTitle><CardDescription>Format: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">[CODE]-[MODULE]-[YEAR]-[SEQ]</code></CardDescription></CardHeader>
            <CardContent className="space-y-2 text-sm">
              {[
                { m: 'Quotation', e: `${form.code}-QT-${year}-0001` },
                { m: 'Purchase Order', e: `${form.code}-PO-${year}-0001` },
                { m: 'Delivery Order', e: `${form.code}-DO-${year}-0001` },
                { m: 'Invoice', e: `${form.code}-INV-${year}-0001` },
                { m: 'Expense', e: `${form.code}-EXP-${year}-0001` },
                { m: 'Revision', e: `${form.code}-QT-${year}-0001-R1` },
              ].map((r, i) => (
                <div key={i} className="flex justify-between border-b last:border-0 py-1.5">
                  <span className="text-slate-600">{r.m}</span>
                  <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded font-mono">{r.e}</code>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card><CardHeader><CardTitle>Roles</CardTitle></CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {ROLES.map(r => <Badge key={r} variant="outline" className={`font-medium ${ROLE_STYLES[r] || ''}`}>{r}</Badge>)}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
