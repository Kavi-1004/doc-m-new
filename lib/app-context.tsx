'use client'

import { createContext, useContext } from 'react'
import type { Company } from '@/types'

interface AppContextValue {
  company: Company
  setView: (key: string) => void
  updateCompany: (updated: Company) => void
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({
  company,
  setView,
  updateCompany,
  children,
}: AppContextValue & { children: React.ReactNode }) {
  return (
    <AppContext.Provider value={{ company, setView, updateCompany }}>
      {children}
    </AppContext.Provider>
  )
}

export function useAppContext() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useAppContext must be used within AppProvider')
  return ctx
}
