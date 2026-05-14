import { z } from 'zod'

export { companySchema } from './company'
export { userSchema, authSchema } from './user'
export { customerSchema } from './customer'
export { supplierSchema, supplierQuoteSchema } from './supplier'
export { quotationSchema } from './quotation'
export { purchaseOrderSchema } from './purchase-order'
export { deliveryOrderSchema } from './delivery-order'
export { invoiceSchema } from './invoice'
export { expenseSchema } from './expense'
export { settingsSchema } from './settings'

type ValidationSuccess<T> = { success: true; data: T; error?: undefined }
type ValidationFailure = { success: false; error: string; data?: undefined }
type ValidationResult<T> = ValidationSuccess<T> | ValidationFailure

export function validateBody<T>(schema: z.ZodSchema<T>, data: unknown): ValidationResult<T> {
  const result = schema.safeParse(data)
  if (!result.success) {
    const messages = result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ')
    return { success: false, error: messages }
  }
  return { success: true, data: result.data }
}
