'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import { toast } from 'sonner'
import { useRouter, usePathname } from 'next/navigation'
import { apiMutate, useApi } from '@/hooks/use-api'

import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'
import { AppProvider } from '@/lib/app-context'
import { ErrorBoundary } from '@/components/shared/ErrorBoundary'

import type { Company } from '@/types'

interface CompaniesResponse {
  items: Company[]
}

interface UserData {
  name: string
  role: string
}

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [loggedIn, setLoggedIn] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [dbReady, setDbReady] = useState(false)
  const [currentUser, setCurrentUser] = useState<UserData>({ name: '', role: '' })

  const { data: companiesData } = useApi<CompaniesResponse>(loggedIn ? '/api/companies' : null)
  const companies = useMemo(() => companiesData?.items || [], [companiesData])
  const [activeCompany, setActiveCompany] = useState<Company | null>(null)

  useEffect(() => {
    if (companies.length > 0 && !activeCompany) {
      setActiveCompany(companies[0])
    }
  }, [companies, activeCompany])

  useEffect(() => {
    apiMutate('/api/seed', 'POST')
      .then(() => setDbReady(true))
      .catch(() => setDbReady(true))
  }, [])

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => {
        if (!res.ok) throw new Error('Not authenticated')
        return res.json()
      })
      .then(data => {
        if (data.success && data.user) {
          setCurrentUser({ name: data.user.name, role: data.user.role })
          setLoggedIn(true)
        }
      })
      .catch(() => {
        router.push('/login')
      })
      .finally(() => setAuthChecked(true))
  }, [router])

  const handleLogout = useCallback(async () => {
    try {
      await fetch('/api/auth', { method: 'DELETE' })
    } catch { /* ignore */ }
    setLoggedIn(false)
    setCurrentUser({ name: '', role: '' })
    setActiveCompany(null)
    toast('Logged out')
    router.push('/login')
  }, [router])


  const handleNavigate = useCallback((key: string) => {
    const routeMap: Record<string, string> = {
      dashboard: '/dashboard',
      companies: '/companies',
      users: '/users',
      customers: '/customers',
      suppliers: '/suppliers',
      quotations: '/quotations',
      'sup-quotes': '/supplier-quotes',
      po: '/purchase-orders',
      do: '/delivery-orders',
      invoices: '/invoices',
      expenses: '/expenses',
      profit: '/profitability',
      audit: '/audit',
      reports: '/reports',
      settings: '/settings',
    }
    const route = routeMap[key] || '/dashboard'
    router.push(route)
    setSidebarOpen(false)
  }, [router])

  const currentView = (() => {
    const viewMap: [string, string][] = [
      ['/dashboard', 'dashboard'],
      ['/companies', 'companies'],
      ['/users', 'users'],
      ['/customers', 'customers'],
      ['/suppliers', 'suppliers'],
      ['/quotations', 'quotations'],
      ['/supplier-quotes', 'sup-quotes'],
      ['/purchase-orders', 'po'],
      ['/delivery-orders', 'do'],
      ['/invoices', 'invoices'],
      ['/expenses', 'expenses'],
      ['/profitability', 'profit'],
      ['/audit', 'audit'],
      ['/reports', 'reports'],
      ['/settings', 'settings'],
    ]
    for (const [prefix, view] of viewMap) {
      if (pathname === prefix || pathname.startsWith(prefix + '/')) return view
    }
    return 'dashboard'
  })()

  if (!authChecked) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500">Loading...</div>
  }

  if (!loggedIn) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500">Loading...</div>
  }

  if (!activeCompany) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500">Loading...</div>
  }

  return (
    <div className="min-h-screen flex bg-slate-50">
      {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <Sidebar
        view={currentView}
        setView={handleNavigate}
        company={activeCompany}
        sidebarOpen={sidebarOpen}
        userRole={currentUser.role}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar
          onMenu={() => setSidebarOpen(true)}
          activeCompany={activeCompany}
          setActiveCompany={setActiveCompany}
          companies={companies}
          onLogout={handleLogout}
          userName={currentUser.name}
          userRole={currentUser.role}
        />
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-x-hidden">
          <AppProvider company={activeCompany} setView={handleNavigate} updateCompany={setActiveCompany}>
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </AppProvider>
        </main>
        <footer className="px-6 py-4 text-xs text-slate-500 border-t bg-white flex flex-wrap justify-between gap-2">
          <span>NexusERP · {dbReady ? 'Connected' : 'Connecting...'}</span>
          <span>v1.0.0 · {new Date().toLocaleDateString()}</span>
        </footer>
      </div>
    </div>
  )
}
