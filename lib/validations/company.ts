import { z } from 'zod'

export const companySchema = z.object({
  code: z.string().min(1, 'Code is required').max(10),
  name: z.string().min(1, 'Name is required').max(200),
  logo: z.string().optional(),
  currency: z.string().min(1).max(10).default('AED'),
  regNo: z.string().max(50).optional(),
  taxNo: z.string().max(50).optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  bank: z.string().optional(),
  active: z.boolean().optional(),
  _user: z.string().optional(),
})
