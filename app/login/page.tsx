'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { apiMutate } from '@/hooks/use-api'
import { LoginScreen } from '@/components/layout/LoginScreen'

export default function LoginPage() {
  const router = useRouter()
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => {
        if (!res.ok) throw new Error('Not authenticated')
        return res.json()
      })
      .then(data => {
        if (data.success && data.user) {
          router.replace('/dashboard')
        }
      })
      .catch(() => {})
      .finally(() => setChecked(true))
  }, [router])

  const handleLogin = useCallback(async (email: string, password: string) => {
    try {
      const result = await apiMutate<{ success?: boolean; user?: { name?: string; role?: string }; token?: string }>('/api/auth', 'POST', { email, password })
      if (result.success && result.user) {
        toast.success('Welcome back!')
        router.push('/dashboard')
      } else {
        toast.error('Login failed')
      }
    } catch (err) {
      toast.error((err as Error).message || 'Invalid credentials')
    }
  }, [router])

  if (!checked) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500">Loading...</div>
  }

  return <LoginScreen companies={[]} onLogin={handleLogin} />
}
