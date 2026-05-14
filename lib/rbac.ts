export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'SALES' | 'PROCUREMENT' | 'ACCOUNTANT' | 'VIEWER'

export type Permission = 'read' | 'write' | 'delete'

export type Module =
  | 'dashboard' | 'companies' | 'users' | 'customers' | 'suppliers'
  | 'quotations' | 'supplier-quotes' | 'purchase-orders' | 'delivery-orders'
  | 'invoices' | 'expenses' | 'profitability' | 'audit' | 'reports' | 'settings'

const ALL_MODULES: Module[] = [
  'dashboard', 'companies', 'users', 'customers', 'suppliers',
  'quotations', 'supplier-quotes', 'purchase-orders', 'delivery-orders',
  'invoices', 'expenses', 'profitability', 'audit', 'reports', 'settings',
]

type PermissionMap = Record<Module, Permission[]>

function fullAccess(): PermissionMap {
  const map = {} as PermissionMap
  for (const m of ALL_MODULES) map[m] = ['read', 'write', 'delete']
  return map
}

function readOnly(modules: Module[]): PermissionMap {
  const map = {} as PermissionMap
  for (const m of modules) map[m] = ['read']
  return map
}

const ROLE_PERMISSIONS: Record<Role, PermissionMap> = {
  SUPER_ADMIN: fullAccess(),
  ADMIN: fullAccess(),
  SALES: {
    dashboard: ['read'],
    companies: ['read'],
    users: ['read'],
    customers: ['read', 'write'],
    suppliers: ['read'],
    quotations: ['read', 'write', 'delete'],
    'supplier-quotes': ['read'],
    'purchase-orders': ['read'],
    'delivery-orders': ['read', 'write'],
    invoices: ['read', 'write'],
    expenses: ['read'],
    profitability: ['read'],
    audit: ['read'],
    reports: ['read'],
    settings: ['read'],
  },
  PROCUREMENT: {
    dashboard: ['read'],
    companies: ['read'],
    users: ['read'],
    customers: ['read'],
    suppliers: ['read', 'write'],
    quotations: ['read'],
    'supplier-quotes': ['read', 'write', 'delete'],
    'purchase-orders': ['read', 'write', 'delete'],
    'delivery-orders': ['read', 'write'],
    invoices: ['read'],
    expenses: ['read', 'write'],
    profitability: ['read'],
    audit: ['read'],
    reports: ['read'],
    settings: ['read'],
  },
  ACCOUNTANT: {
    dashboard: ['read'],
    companies: ['read'],
    users: ['read'],
    customers: ['read'],
    suppliers: ['read'],
    quotations: ['read'],
    'supplier-quotes': ['read'],
    'purchase-orders': ['read'],
    'delivery-orders': ['read'],
    invoices: ['read', 'write'],
    expenses: ['read', 'write', 'delete'],
    profitability: ['read'],
    audit: ['read'],
    reports: ['read'],
    settings: ['read'],
  },
  VIEWER: readOnly([
    'dashboard', 'companies', 'customers', 'suppliers',
    'quotations', 'supplier-quotes', 'purchase-orders', 'delivery-orders',
    'invoices', 'expenses', 'profitability', 'reports',
  ]),
}

export function hasPermission(role: string, module: string, permission: Permission): boolean {
  const perms = ROLE_PERMISSIONS[role as Role]
  if (!perms) return false
  const modulePerms = perms[module as Module]
  if (!modulePerms) return false
  return modulePerms.includes(permission)
}

export function getAccessibleModules(role: string): Module[] {
  const perms = ROLE_PERMISSIONS[role as Role]
  if (!perms) return []
  return Object.keys(perms) as Module[]
}

export function canWrite(role: string, module: string): boolean {
  return hasPermission(role, module, 'write')
}

export function canDelete(role: string, module: string): boolean {
  return hasPermission(role, module, 'delete')
}

const API_MODULE_MAP: Record<string, Module> = {
  quotations: 'quotations',
  customers: 'customers',
  suppliers: 'suppliers',
  'supplier-quotes': 'supplier-quotes',
  'purchase-orders': 'purchase-orders',
  'delivery-orders': 'delivery-orders',
  invoices: 'invoices',
  expenses: 'expenses',
  companies: 'companies',
  users: 'users',
  audit: 'audit',
  settings: 'settings',
  reports: 'reports',
}

export function getModuleFromPath(pathname: string): Module | null {
  const segments = pathname.replace('/api/', '').split('/')
  const key = segments[0]
  return API_MODULE_MAP[key] || null
}

export function getPermissionFromMethod(method: string): Permission {
  switch (method) {
    case 'GET': return 'read'
    case 'DELETE': return 'delete'
    default: return 'write'
  }
}
