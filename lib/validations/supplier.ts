import { z } from 'zod'

export const supplierSchema = z.object({
  code: z.string().max(20).optional(),
  company: z.string().min(1, 'Company name is required').max(200),
  contact: z.string().min(1, 'Contact name is required').max(100),
  email: z.string().email().or(z.literal('')).optional(),
  phone: z.string().max(30).optional(),
  tax: z.string().max(50).optional(),
  terms: z.string().max(50).optional(),
  address: z.string().max(500).optional(),
  bank: z.string().max(200).optional(),
  notes: z.string().max(2000).optional(),
  _user: z.string().optional(),
})

export const supplierQuoteSchema = z.object({
  number: z.string().optional(),
  supplier: z.string().min(1, 'Supplier is required'),
  linkedQuote: z.string().optional(),
  date: z.string().optional(),
  amount: z.number().min(0).optional(),
  status: z.enum(['PENDING', 'ACCEPTED', 'REJECTED']).optional(),
  notes: z.string().max(2000).optional(),
  items: z.array(z.record(z.unknown())).optional(),
  companyCode: z.string().optional(),
  _user: z.string().optional(),
})
