export interface NavItem {
  key: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  group: string
}

export interface AuditEntry {
  id: string
  _id?: string
  user: string
  module: string
  action: string
  target: string
  time: string
  ip: string
}
