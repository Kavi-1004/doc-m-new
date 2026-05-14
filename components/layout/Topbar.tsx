'use client'

import {
  Search, Bell, Building, Menu, Settings, LogOut,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import type { Company } from '@/types'

interface TopbarProps {
  onMenu: () => void
  activeCompany: Company
  setActiveCompany?: (c: Company) => void
  companies?: Company[]
  onLogout: () => void
  userName: string
  userRole: string
}

export function Topbar({
  onMenu, activeCompany,
  onLogout, userName, userRole,
}: TopbarProps) {
  const userInitials = userName.split(' ').map(x => x[0]).slice(0, 2).join('').toUpperCase()

  return (
    <header className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b">
      <div className="flex items-center gap-3 px-4 md:px-6 py-3">
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenu}>
          <Menu className="h-5 w-5" />
        </Button>
        <div className="hidden md:flex items-center gap-2 flex-1 max-w-xl">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input placeholder="Search quotations, customers, invoices..." className="pl-9 bg-slate-50 border-slate-200" />
          </div>
        </div>
        <div className="flex-1" />
        <div className="hidden sm:flex items-center gap-2 text-sm text-slate-600 border rounded-md px-3 py-1.5">
          <Building className="h-4 w-4" />
          <span className="font-medium">{activeCompany.code}</span>
          <span className="text-slate-400">—</span>
          <span>{activeCompany.name.split(' ').slice(0, 2).join(' ')}</span>
        </div>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 px-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-slate-900 text-white text-xs">{userInitials}</AvatarFallback>
              </Avatar>
              <div className="hidden md:block text-left">
                <div className="text-sm font-medium leading-none">{userName}</div>
                <div className="text-xs text-slate-500 mt-0.5">{userRole}</div>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem><Settings className="h-4 w-4 mr-2" /> Settings</DropdownMenuItem>
            <DropdownMenuItem onClick={onLogout}><LogOut className="h-4 w-4 mr-2" /> Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
