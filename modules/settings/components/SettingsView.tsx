'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PageHeader } from '@/components/shared/PageHeader'
import { ROLES, ROLE_STYLES } from '@/lib/constants'
import { useAppContext } from '@/lib/app-context'
import { useApi } from '@/hooks/use-api'

interface AppSettings {
  id: string
  defaultCurrency: string
  defaultPaymentTerms: string
  taxRate: number
  quotationValidityDays: number
  autoNumbering: boolean
  emailNotifications: boolean
  invoicePrefix: string
  quotationPrefix: string
  poPrefix: string
  doPrefix: string
  expensePrefix: string
  dateFormat: string
  timezone: string
  smtpHost: string
  smtpPort: number
  smtpUser: string
}

export function SettingsView() {
  const { company, updateCompany: onCompanyUpdate } = useAppContext()
  const [saving, setSaving] = useState(false)
  const [savingApp, setSavingApp] = useState(false)
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

  const { data: appSettings, refresh: refreshSettings } = useApi<AppSettings>('/api/settings')
  const [appForm, setAppForm] = useState({
    defaultCurrency: 'AED',
    defaultPaymentTerms: 'Net 30',
    taxRate: 5,
    quotationValidityDays: 30,
    autoNumbering: true,
    emailNotifications: true,
    invoicePrefix: 'AB-INV',
    quotationPrefix: 'AB-QT',
    poPrefix: 'AB-PO',
    doPrefix: 'AB-DO',
    expensePrefix: 'AB-EXP',
    dateFormat: 'YYYY-MM-DD',
    timezone: 'Asia/Dubai',
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
  })

  useEffect(() => {
    if (appSettings) {
      setAppForm({
        defaultCurrency: appSettings.defaultCurrency,
        defaultPaymentTerms: appSettings.defaultPaymentTerms,
        taxRate: appSettings.taxRate,
        quotationValidityDays: appSettings.quotationValidityDays,
        autoNumbering: appSettings.autoNumbering,
        emailNotifications: appSettings.emailNotifications,
        invoicePrefix: appSettings.invoicePrefix,
        quotationPrefix: appSettings.quotationPrefix,
        poPrefix: appSettings.poPrefix,
        doPrefix: appSettings.doPrefix,
        expensePrefix: appSettings.expensePrefix,
        dateFormat: appSettings.dateFormat,
        timezone: appSettings.timezone,
        smtpHost: appSettings.smtpHost,
        smtpPort: appSettings.smtpPort,
        smtpUser: appSettings.smtpUser,
      })
    }
  }, [appSettings])

  const update = (field: keyof typeof form, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const updateApp = (field: keyof typeof appForm, value: string | number | boolean) => {
    setAppForm(prev => ({ ...prev, [field]: value }))
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

  const handleSaveApp = async () => {
    setSavingApp(true)
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...appForm, _user: 'System' }),
      })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || 'Failed to save')
        return
      }
      toast.success('Application settings saved')
      refreshSettings()
    } catch {
      toast.error('Network error')
    } finally {
      setSavingApp(false)
    }
  }

  const year = new Date().getFullYear()

  return (
    <div>
      <PageHeader title="System" description="Settings" />
      <div className="space-y-6">
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

        <Card>
          <CardHeader><CardTitle>Application Settings</CardTitle><CardDescription>Configure defaults, prefixes, tax rates, and email.</CardDescription></CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label>Default Currency</Label>
                <Input value={appForm.defaultCurrency} onChange={e => updateApp('defaultCurrency', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Default Payment Terms</Label>
                <Input value={appForm.defaultPaymentTerms} onChange={e => updateApp('defaultPaymentTerms', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Tax Rate (%)</Label>
                <Input type="number" value={appForm.taxRate} onChange={e => updateApp('taxRate', Number(e.target.value))} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label>Quotation Validity (days)</Label>
                <Input type="number" value={appForm.quotationValidityDays} onChange={e => updateApp('quotationValidityDays', Number(e.target.value))} />
              </div>
              <div className="space-y-1.5">
                <Label>Date Format</Label>
                <Select value={appForm.dateFormat} onValueChange={v => updateApp('dateFormat', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                    <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                    <SelectItem value="DD-MM-YYYY">DD-MM-YYYY</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Timezone</Label>
                <Input value={appForm.timezone} onChange={e => updateApp('timezone', e.target.value)} />
              </div>
            </div>

            <div>
              <Label className="text-sm font-semibold text-slate-700 mb-2 block">Document Prefixes</Label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="space-y-1.5"><Label className="text-xs">Quotation</Label><Input value={appForm.quotationPrefix} onChange={e => updateApp('quotationPrefix', e.target.value)} /></div>
                <div className="space-y-1.5"><Label className="text-xs">Invoice</Label><Input value={appForm.invoicePrefix} onChange={e => updateApp('invoicePrefix', e.target.value)} /></div>
                <div className="space-y-1.5"><Label className="text-xs">PO</Label><Input value={appForm.poPrefix} onChange={e => updateApp('poPrefix', e.target.value)} /></div>
                <div className="space-y-1.5"><Label className="text-xs">DO</Label><Input value={appForm.doPrefix} onChange={e => updateApp('doPrefix', e.target.value)} /></div>
                <div className="space-y-1.5"><Label className="text-xs">Expense</Label><Input value={appForm.expensePrefix} onChange={e => updateApp('expensePrefix', e.target.value)} /></div>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch checked={appForm.autoNumbering} onCheckedChange={v => updateApp('autoNumbering', v)} id="auto-num" />
                <Label htmlFor="auto-num" className="cursor-pointer">Auto-numbering</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={appForm.emailNotifications} onCheckedChange={v => updateApp('emailNotifications', v)} id="email-notif" />
                <Label htmlFor="email-notif" className="cursor-pointer">Email Notifications</Label>
              </div>
            </div>

            <div>
              <Label className="text-sm font-semibold text-slate-700 mb-2 block">SMTP Configuration</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5"><Label>SMTP Host</Label><Input value={appForm.smtpHost} onChange={e => updateApp('smtpHost', e.target.value)} placeholder="smtp.example.com" /></div>
                <div className="space-y-1.5"><Label>SMTP Port</Label><Input type="number" value={appForm.smtpPort} onChange={e => updateApp('smtpPort', Number(e.target.value))} /></div>
                <div className="space-y-1.5"><Label>SMTP User</Label><Input value={appForm.smtpUser} onChange={e => updateApp('smtpUser', e.target.value)} placeholder="user@example.com" /></div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button className="bg-slate-900 hover:bg-slate-800" onClick={handleSaveApp} disabled={savingApp}>
                {savingApp ? 'Saving...' : 'Save Application Settings'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
