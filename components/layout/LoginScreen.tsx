'use client'

import { useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface LoginScreenProps {
  companies: { id?: string; code?: string; name?: string }[]
  onLogin: (email: string, password: string) => void
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    try {
      await onLogin(email, password)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="hidden lg:flex flex-col justify-between p-12 text-white relative overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-indigo-500/30 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-sky-500/20 blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center font-bold text-lg">N</div>
            <div className="text-2xl font-semibold tracking-tight">NexusERP</div>
          </div>
          <h1 className="text-4xl font-semibold leading-tight mb-4">The lightweight ERP<br />built for SMEs.</h1>
          <p className="text-slate-300 max-w-md leading-relaxed">Quotations, procurement, project costing, invoicing & profitability — all in one clean place. Built for construction, trading, engineering and services.</p>
        </div>
        <div className="relative grid grid-cols-3 gap-4 max-w-md">
          {[{ k: '650+', v: 'Quotes / mo' }, { k: '99.9%', v: 'Uptime' }, { k: '14', v: 'Modules' }].map((s, i) => (
            <div key={i} className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-4">
              <div className="text-2xl font-semibold">{s.k}</div>
              <div className="text-xs text-slate-300">{s.v}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-center p-6 lg:p-12 bg-white">
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardHeader>
            <CardTitle className="text-2xl">Sign in to NexusERP</CardTitle>
            <CardDescription>Enter your credentials to sign in.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" type="email" required />
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter password" required />
              </div>
              <Button className="w-full bg-slate-900 hover:bg-slate-800 h-11" type="submit" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign in'} <ArrowUpRight className="ml-2 h-4 w-4" />
              </Button>
              <div className="text-xs text-center text-slate-400 pt-2">
                Demo: ahmed@albashir.ae / password123
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
