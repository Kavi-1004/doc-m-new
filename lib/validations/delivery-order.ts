import { z } from 'zod'

export const deliveryOrderSchema = z.object({
  number: z.string().optional(),
  customer: z.string().min(1, 'Customer is required'),
  linkedQuote: z.string().optional(),
  date: z.string().optional(),
  items: z.number().int().min(0).optional(),
  status: z.enum(['PENDING', 'DISPATCHED', 'PARTIAL', 'DELIVERED']).optional(),
  lineItems: z.array(z.record(z.unknown())).optional(),
  notes: z.string().optional(),
  shippingAddress: z.string().optional(),
  attnName: z.string().optional(),
  attnEmail: z.string().optional(),
  salesPerson: z.string().optional(),
  poNumber: z.string().optional(),
  project: z.string().optional(),
  showSignature: z.boolean().optional(),
  companyCode: z.string().optional(),
  _user: z.string().optional(),
})
