import { z } from 'zod'

export const expenseSchema = z.object({
  number: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  project: z.string().max(200).optional(),
  supplier: z.string().max(200).optional(),
  amount: z.number().min(0).optional(),
  date: z.string().optional(),
  notes: z.string().max(2000).optional(),
  attachment: z.string().max(500).optional(),
  _user: z.string().optional(),
})
