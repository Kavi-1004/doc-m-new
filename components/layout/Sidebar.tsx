'use client'

import { useMemo } from 'react'
import { ChevronRight, Sparkles } from 'lucide-react'
import { NAV } from '@/lib/constants'
import type { Company } from '@/types'

interface SidebarProps {
  view: string
  setView: (v: string) => void
  company: Company
  sidebarOpen: boolean
}

export function Sidebar({ view, setView, company, sidebarOpen }: SidebarProps) {
  const groups = useMemo(() => {
    const map: Record<string, typeof NAV> = {}
    NAV.forEach(n => { (map[n.group] = map[n.group] || []).push(n) })
    return map
  }, [])

  return (
    <aside className={`fixed lg:static z-40 inset-y-0 left-0 w-72 bg-slate-900 text-slate-200 flex flex-col transform transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
      <div className="px-5 py-5 flex items-center gap-3 border-b border-slate-800">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center font-bold">N</div>
        <div>
          <div className="text-white font-semibold leading-tight">NexusERP</div>
          <div className="text-xs text-slate-400">Business Management</div>
        </div>
      </div>
      <div className="px-3 py-3 border-b border-slate-800">
        <div className="text-[10px] uppercase tracking-wider text-slate-500 px-2 mb-1">Active Company</div>
        <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-800/60">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center font-bold">{company.logo}</div>
          <div className="min-w-0">
            <div className="text-sm font-medium text-white truncate">{company.name}</div>
            <div className="text-xs text-slate-400">{company.code} · {company.currency}</div>
          </div>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {Object.entries(groups).map(([group, items]) => (
          <div key={group}>
            <div className="text-[10px] uppercase tracking-wider text-slate-500 px-3 mb-1">{group}</div>
            <div className="space-y-0.5">
              {items.map(it => {
                const Icon = it.icon
                const active = view === it.key
                return (
                  <button key={it.key} onClick={() => setView(it.key)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${active ? 'bg-gradient-to-r from-sky-500/20 to-indigo-500/10 text-white border border-sky-500/30' : 'text-slate-300 hover:bg-slate-800 hover:text-white border border-transparent'}`}>
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{it.label}</span>
                    {active && <ChevronRight className="ml-auto h-4 w-4 text-sky-400" />}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </nav>
      <div className="p-3 border-t border-slate-800 text-xs text-slate-400">
        <div className="flex items-center gap-2"><Sparkles className="h-3.5 w-3.5 text-sky-400" /> NexusERP v1.0</div>
      </div>
    </aside>
  )
}
