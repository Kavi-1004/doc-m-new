import { z } from 'zod'

export const userSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Valid email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'SALES', 'PROCUREMENT', 'ACCOUNTANT', 'VIEWER']),
  company: z.string().min(1, 'Company is required'),
  status: z.enum(['Active', 'Inactive']).optional(),
  _user: z.string().optional(),
})

export const authSchema = z.object({
  email: z.string().email('Valid email is required'),
})
