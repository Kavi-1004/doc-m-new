export interface PurchaseOrderItem {
  d: string
  q: number
  u: string
  r: number
  t: number
}

export interface PurchaseOrder {
  id: string
  _id?: string
  number: string
  supplier: string
  linkedQuote: string
  date: string
  amount: number
  status: string
  items: PurchaseOrderItem[]
  notes: string
  expectedDelivery: string
}

export interface DeliveryOrderLineItem {
  d: string
  components?: string[]
  q: number
  u: string
}

export interface DeliveryOrder {
  id: string
  _id?: string
  number: string
  customer: string
  linkedQuote: string
  date: string
  items: number
  lineItems: Record<string, any>[]
  notes: string
  shippingAddress: string
  attnName?: string
  attnEmail?: string
  salesPerson?: string
  poNumber?: string
  project?: string
  showSignature?: boolean
}

export interface InvoiceItem {
  d: string
  components?: string[]
  q: number
  r: number
  t: number
}

export interface Invoice {
  id: string
  _id?: string
  number: string
  customer: string
  linkedQuote: string
  date: string
  due: string
  total: number
  paid: number
  status: string
  progressPct: number
  projectTotal: number
  billedToDate: number
  items: InvoiceItem[]
  notes: string
  terms: string
  attnName?: string
  attnEmail?: string
  salesPerson?: string
  poNumber?: string
  project?: string
  showSignature?: boolean
  discount?: number
  tax?: number
  payments?: Array<{ date: string; amount: number; method: string; reference: string }>
}

export interface Expense {
  id: string
  _id?: string
  number: string
  project: string
  supplier: string
  category: string
  amount: number
  date: string
  notes: string
  attachment: string
}
