export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'SALES' | 'PROCUREMENT' | 'ACCOUNTANT' | 'VIEWER'

export interface User {
  id: string
  _id?: string
  name: string
  email: string
  role: Role
  company: string
  status: string
  lastLogin: string
}
