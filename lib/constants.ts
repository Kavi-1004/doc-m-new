import type { NavItem, Role } from '@/types'
import {
  LayoutDashboard, Building2, ShieldCheck, UserSquare2, Truck, FileText, Inbox,
  ShoppingCart, PackageCheck, Receipt, Wallet, TrendingUp, ScrollText, BarChart3, Settings,
} from 'lucide-react'

export const ROLES: Role[] = ['SUPER_ADMIN', 'ADMIN', 'SALES', 'PROCUREMENT', 'ACCOUNTANT', 'VIEWER']

export const NAV: NavItem[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, group: 'Overview' },
  { key: 'companies', label: 'Companies', icon: Building2, group: 'Master Data' },
  { key: 'users', label: 'Users & Roles', icon: ShieldCheck, group: 'Master Data' },
  { key: 'customers', label: 'Customers', icon: UserSquare2, group: 'Master Data' },
  { key: 'suppliers', label: 'Suppliers', icon: Truck, group: 'Master Data' },
  { key: 'quotations', label: 'Quotations', icon: FileText, group: 'Sales' },
  { key: 'sup-quotes', label: 'Supplier Quotes', icon: Inbox, group: 'Procurement' },
  { key: 'po', label: 'Purchase Orders', icon: ShoppingCart, group: 'Procurement' },
  { key: 'do', label: 'Delivery Orders', icon: PackageCheck, group: 'Operations' },
  { key: 'invoices', label: 'Invoices', icon: Receipt, group: 'Finance' },
  { key: 'expenses', label: 'Expenses', icon: Wallet, group: 'Finance' },
  { key: 'profit', label: 'Profitability', icon: TrendingUp, group: 'Finance' },
  { key: 'audit', label: 'Audit Logs', icon: ScrollText, group: 'System' },
  { key: 'reports', label: 'Reports', icon: BarChart3, group: 'System' },
  { key: 'settings', label: 'Settings', icon: Settings, group: 'System' },
]

export const STATUS_STYLES: Record<string, string> = {
  DRAFT: 'bg-slate-100 text-slate-700 border-slate-200',
  SENT: 'bg-sky-50 text-sky-700 border-sky-200',
  APPROVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  REJECTED: 'bg-rose-50 text-rose-700 border-rose-200',
  SUPERSEDED: 'bg-amber-50 text-amber-700 border-amber-200',
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
  PAID: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  PARTIAL: 'bg-sky-50 text-sky-700 border-sky-200',
  UNPAID: 'bg-slate-100 text-slate-700 border-slate-200',
  OVERDUE: 'bg-rose-50 text-rose-700 border-rose-200',
  VOID: 'bg-slate-200 text-slate-500 border-slate-300 line-through',
  DELIVERED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  IN_TRANSIT: 'bg-sky-50 text-sky-700 border-sky-200',
  DISPATCHED: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  Active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Inactive: 'bg-slate-200 text-slate-600 border-slate-300',
}

export const ROLE_STYLES: Record<string, string> = {
  SUPER_ADMIN: 'bg-violet-100 text-violet-800 border-violet-200',
  ADMIN: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  SALES: 'bg-sky-100 text-sky-800 border-sky-200',
  PROCUREMENT: 'bg-amber-100 text-amber-800 border-amber-200',
  ACCOUNTANT: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  VIEWER: 'bg-slate-100 text-slate-700 border-slate-200',
}

export const ACTION_COLORS: Record<string, string> = {
  CREATED: 'bg-sky-100 text-sky-800',
  UPDATED: 'bg-amber-100 text-amber-800',
  DELETED: 'bg-rose-100 text-rose-800',
  APPROVED: 'bg-emerald-100 text-emerald-800',
  REVISED: 'bg-violet-100 text-violet-800',
  EMAILED: 'bg-indigo-100 text-indigo-800',
  PRINTED: 'bg-slate-200 text-slate-700',
  LOGIN: 'bg-teal-100 text-teal-800',
  LOGOUT: 'bg-slate-100 text-slate-700',
}

export const CAT_COLORS: Record<string, string> = {
  MATERIAL: 'bg-sky-100 text-sky-800 border-sky-200',
  LABOR: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  TRANSPORT: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  SUBCONTRACT: 'bg-amber-100 text-amber-800 border-amber-200',
  SITE_VISIT: 'bg-rose-100 text-rose-800 border-rose-200',
  ADMIN: 'bg-violet-100 text-violet-800 border-violet-200',
  OTHER: 'bg-slate-100 text-slate-700 border-slate-200',
}
