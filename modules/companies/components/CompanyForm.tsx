'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Upload, X, Building } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { apiMutate, useApi } from '@/hooks/use-api'
import type { Company } from '@/types'

const CURRENCIES = ['LKR', 'AED', 'USD', 'EUR', 'GBP', 'INR', 'SAR', 'QAR', 'BHD', 'OMR', 'KWD']

interface CompanyFormProps {
  editId?: string
}

export function CompanyForm({ editId }: CompanyFormProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { data: existing } = useApi<Company>(editId ? `/api/companies/${editId}` : null)

  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [currency, setCurrency] = useState('AED')
  const [regNo, setRegNo] = useState('')
  const [taxNo, setTaxNo] = useState('')
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [bank, setBank] = useState('')
  const [logo, setLogo] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (existing) {
      setCode(existing.code)
      setName(existing.name)
      setCurrency(existing.currency)
      setRegNo(existing.regNo)
      setTaxNo(existing.taxNo)
      setAddress(existing.address)
      setPhone(existing.phone)
      setEmail(existing.email)
      setBank(existing.bank)
      setLogo(existing.logo || '')
    }
  }, [existing])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) throw new Error('Upload failed')
      const data = await res.json()
      setLogo(data.url)
      toast.success('Logo uploaded')
    } catch (err) {
      toast.error('Upload failed: ' + (err as Error).message)
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    if (!code.trim()) { toast.error('Company code is required'); return }
    if (!name.trim()) { toast.error('Company name is required'); return }

    setSaving(true)
    try {
      const payload = { code, name, currency, regNo, taxNo, address, phone, email, bank, logo, _user: 'System' }
      if (editId) {
        await apiMutate(`/api/companies/${editId}`, 'PUT', payload)
        toast.success('Company updated')
      } else {
        await apiMutate('/api/companies', 'POST', payload)
        toast.success('Company created')
      }
      router.push('/companies')
    } catch (err) {
      toast.error((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.push('/companies')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <div className="text-xs text-slate-500 uppercase tracking-wider">Master Data</div>
          <h1 className="text-2xl font-semibold">{editId ? 'Edit Company' : 'New Company'}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Company Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Company Code *</Label>
                  <Input value={code} onChange={e => setCode(e.target.value)} placeholder="e.g. AB" disabled={!!editId} />
                </div>
                <div>
                  <Label>Company Name *</Label>
                  <Input value={name} onChange={e => setName(e.target.value)} placeholder="Al Bashir Trading" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Currency</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Registration No.</Label>
                  <Input value={regNo} onChange={e => setRegNo(e.target.value)} />
                </div>
                <div>
                  <Label>Tax No. (TRN)</Label>
                  <Input value={taxNo} onChange={e => setTaxNo(e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Contact & Banking</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Address</Label>
                <Input value={address} onChange={e => setAddress(e.target.value)} placeholder="Full address" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Phone</Label>
                  <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+971 ..." />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="info@company.com" />
                </div>
              </div>
              <div>
                <Label>Bank Details (Professional Format)</Label>
                <Textarea 
                  value={bank} 
                  onChange={e => setBank(e.target.value)} 
                  placeholder="ACCOUNT NAME: ...&#10;ACCOUNT NUMBER: ...&#10;NAME OF BANK: ...&#10;BANK ADDRESS: ...&#10;BANK'S SWIFT CODE: ..." 
                  rows={6}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button onClick={handleSave} disabled={saving || uploading} className="bg-slate-900 hover:bg-slate-800">
              {saving ? 'Saving...' : (editId ? 'Update Company' : 'Create Company')}
            </Button>
            <Button variant="ghost" onClick={() => router.push('/companies')}>Cancel</Button>
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Company Logo</CardTitle></CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <div className="w-48 h-48 border-2 border-dashed rounded-lg flex items-center justify-center bg-slate-50 relative group">
                {logo ? (
                  <>
                    <img src={logo} alt="Company logo" className="w-full h-full object-contain p-2" />
                    <Button 
                      variant="destructive" size="icon" 
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                      onClick={() => setLogo('')}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <div className="flex flex-col items-center text-slate-400">
                    <Building className="h-12 w-12 mb-2" />
                    <span className="text-xs">No logo uploaded</span>
                  </div>
                )}
                {uploading && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center text-xs font-medium">
                    Uploading...
                  </div>
                )}
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleFileUpload} 
              />
              <Button 
                variant="outline" 
                className="w-full gap-2" 
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                <Upload className="h-4 w-4" /> {logo ? 'Change Logo' : 'Upload Logo'}
              </Button>
              <p className="text-[10px] text-slate-500 text-center">
                Recommended: Square PNG with transparent background.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
