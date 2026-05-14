'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { apiMutate, useApi } from '@/hooks/use-api'
import { ROLES, ROLE_STYLES } from '@/lib/constants'
import { Badge } from '@/components/ui/badge'
import type { User } from '@/types'

interface UserFormProps {
  editId?: string
}

export function UserForm({ editId }: UserFormProps) {
  const router = useRouter()
  const { data: existing } = useApi<User>(editId ? `/api/users/${editId}` : null)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<string>('VIEWER')
  const [company, setCompany] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (existing) {
      setName(existing.name)
      setEmail(existing.email)
      setRole(existing.role)
      setCompany(existing.company)
    }
  }, [existing])

  const handleSave = async () => {
    if (!name.trim()) { toast.error('Name is required'); return }
    if (!email.trim()) { toast.error('Email is required'); return }
    if (!editId && !password.trim()) { toast.error('Password is required for new users'); return }

    setSaving(true)
    try {
      const payload: Record<string, string> = { name, email, role, company }
      if (password) payload.password = password

      if (editId) {
        await apiMutate(`/api/users/${editId}`, 'PUT', payload)
        toast.success('User updated')
      } else {
        await apiMutate('/api/users', 'POST', payload)
        toast.success('User created')
      }
      router.push('/users')
    } catch (err) {
      toast.error((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.push('/users')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <div className="text-xs text-slate-500 uppercase tracking-wider">Master Data</div>
          <h1 className="text-2xl font-semibold">{editId ? 'Edit User' : 'New User'}</h1>
        </div>
      </div>

      <div className="max-w-2xl space-y-6">
        <Card>
          <CardHeader><CardTitle className="text-base">User Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Full Name *</Label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. John Smith" />
              </div>
              <div>
                <Label>Email *</Label>
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="john@company.com" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{editId ? 'New Password (leave blank to keep)' : 'Password *'}</Label>
                <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder={editId ? '••••••••' : 'Min 6 characters'} />
              </div>
              <div>
                <Label>Role *</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ROLES.map(r => (
                      <SelectItem key={r} value={r}>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={`text-[10px] ${ROLE_STYLES[r] || ''}`}>{r}</Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Company</Label>
              <Input value={company} onChange={e => setCompany(e.target.value)} placeholder="Company name" />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button onClick={handleSave} disabled={saving} className="bg-slate-900 hover:bg-slate-800">
            {saving ? 'Saving...' : (editId ? 'Update User' : 'Create User')}
          </Button>
          <Button variant="ghost" onClick={() => router.push('/users')}>Cancel</Button>
        </div>
      </div>
    </div>
  )
}
