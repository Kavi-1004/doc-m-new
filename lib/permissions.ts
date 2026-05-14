import type { Role } from '@/types'

type Permission =
  | 'companies:read' | 'companies:write'
  | 'users:read' | 'users:write'
  | 'customers:read' | 'customers:write'
  | 'suppliers:read' | 'suppliers:write'
  | 'quotations:read' | 'quotations:write'
  | 'supplier-quotes:read' | 'supplier-quotes:write'
  | 'purchase-orders:read' | 'purchase-orders:write'
  | 'delivery-orders:read' | 'delivery-orders:write'
  | 'invoices:read' | 'invoices:write'
  | 'expenses:read' | 'expenses:write'
  | 'reports:read'
  | 'audit:read'
  | 'settings:read' | 'settings:write'

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  SUPER_ADMIN: [
    'companies:read', 'companies:write',
    'users:read', 'users:write',
    'customers:read', 'customers:write',
    'suppliers:read', 'suppliers:write',
    'quotations:read', 'quotations:write',
    'supplier-quotes:read', 'supplier-quotes:write',
    'purchase-orders:read', 'purchase-orders:write',
    'delivery-orders:read', 'delivery-orders:write',
    'invoices:read', 'invoices:write',
    'expenses:read', 'expenses:write',
    'reports:read',
    'audit:read',
    'settings:read', 'settings:write',
  ],
  ADMIN: [
    'companies:read',
    'users:read', 'users:write',
    'customers:read', 'customers:write',
    'suppliers:read', 'suppliers:write',
    'quotations:read', 'quotations:write',
    'supplier-quotes:read', 'supplier-quotes:write',
    'purchase-orders:read', 'purchase-orders:write',
    'delivery-orders:read', 'delivery-orders:write',
    'invoices:read', 'invoices:write',
    'expenses:read', 'expenses:write',
    'reports:read',
    'audit:read',
    'settings:read', 'settings:write',
  ],
  SALES: [
    'customers:read', 'customers:write',
    'quotations:read', 'quotations:write',
    'delivery-orders:read',
    'invoices:read',
    'reports:read',
  ],
  PROCUREMENT: [
    'suppliers:read', 'suppliers:write',
    'supplier-quotes:read', 'supplier-quotes:write',
    'purchase-orders:read', 'purchase-orders:write',
    'expenses:read', 'expenses:write',
    'reports:read',
  ],
  ACCOUNTANT: [
    'invoices:read', 'invoices:write',
    'expenses:read', 'expenses:write',
    'reports:read',
    'customers:read',
    'suppliers:read',
  ],
  VIEWER: [
    'companies:read',
    'customers:read',
    'suppliers:read',
    'quotations:read',
    'invoices:read',
    'reports:read',
  ],
}

export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false
}

export function getPermissions(role: Role): Permission[] {
  return ROLE_PERMISSIONS[role] || []
}

export type { Permission }
