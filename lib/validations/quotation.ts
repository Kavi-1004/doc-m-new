import { z } from 'zod'

const lineItemSchema = z.object({
  d: z.string().min(1),
  components: z.array(z.string()).optional(),
  q: z.number().min(0),
  u: z.string().min(1),
  r: z.number().min(0),
  t: z.number().optional(),
})

export const quotationSchema = z.object({
  number: z.string().optional(),
  rev: z.number().int().min(0).optional(),
  customer: z.string().min(1, 'Customer is required'),
  project: z.string().max(200).optional(),
  date: z.string().optional(),
  validity: z.string().optional(),
  status: z.enum(['DRAFT', 'SENT', 'APPROVED', 'REJECTED', 'SUPERSEDED']).optional(),
  total: z.number().min(0).optional(),
  items: z.array(lineItemSchema).optional(),
  terms: z.string().max(5000).optional(),
  currency: z.string().optional(),
  attnName: z.string().optional(),
  attnEmail: z.string().optional(),
  salesPerson: z.string().optional(),
  showSignature: z.boolean().optional(),
  discount: z.number().min(0).optional(),
  tax: z.number().min(0).optional(),
  companyCode: z.string().optional(),
  _user: z.string().optional(),
  _action: z.enum(['revise']).optional(),
})
