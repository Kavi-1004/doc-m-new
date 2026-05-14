import { z } from 'zod'

export const customerSchema = z.object({
  code: z.string().max(20).optional(),
  company: z.string().min(1, 'Company name is required').max(200),
  contact: z.string().min(1, 'Contact name is required').max(100),
  email: z.string().email().or(z.literal('')).optional(),
  phone: z.string().max(30).optional(),
  tax: z.string().max(50).optional(),
  terms: z.string().max(50).optional(),
  credit: z.number().min(0).optional(),
  billing: z.string().max(500).optional(),
  shipping: z.string().max(500).optional(),
  notes: z.string().max(2000).optional(),
  _user: z.string().optional(),
})
