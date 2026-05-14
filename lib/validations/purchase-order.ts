import { z } from 'zod'

export const purchaseOrderSchema = z.object({
  number: z.string().optional(),
  supplier: z.string().min(1, 'Supplier is required'),
  linkedQuote: z.string().optional(),
  date: z.string().optional(),
  amount: z.number().min(0).optional(),
  status: z.enum(['DRAFT', 'PENDING', 'SENT', 'IN_TRANSIT', 'RECEIVED', 'DELIVERED', 'CANCELLED', 'COMPLETED']).optional(),
  items: z.array(z.record(z.unknown())).optional(),
  notes: z.string().max(2000).optional(),
  expectedDelivery: z.string().optional(),
  companyCode: z.string().optional(),
  _user: z.string().optional(),
})
