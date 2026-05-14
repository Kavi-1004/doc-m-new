import { z } from 'zod'

export const settingsSchema = z.object({
  defaultCurrency: z.string().max(10).optional(),
  defaultPaymentTerms: z.string().max(50).optional(),
  taxRate: z.number().min(0).max(100).optional(),
  quotationValidityDays: z.number().int().min(1).max(365).optional(),
  autoNumbering: z.boolean().optional(),
  emailNotifications: z.boolean().optional(),
  invoicePrefix: z.string().max(20).optional(),
  quotationPrefix: z.string().max(20).optional(),
  poPrefix: z.string().max(20).optional(),
  doPrefix: z.string().max(20).optional(),
  expensePrefix: z.string().max(20).optional(),
  dateFormat: z.string().max(20).optional(),
  timezone: z.string().max(50).optional(),
  companyLogo: z.string().optional(),
  smtpHost: z.string().max(100).optional(),
  smtpPort: z.number().int().min(1).max(65535).optional(),
  smtpUser: z.string().max(100).optional(),
  _user: z.string().optional(),
})
