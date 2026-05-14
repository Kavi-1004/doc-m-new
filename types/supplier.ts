export interface Supplier {
  id: string
  _id?: string
  code: string
  company: string
  contact: string
  email: string
  phone: string
  tax: string
  terms: string
  address: string
  bank: string
  notes: string
}

export interface SupplierQuoteItem {
  d: string
  q: number
  u: string
  r: number
  t: number
}

export interface SupplierQuote {
  id: string
  _id?: string
  number: string
  linkedQuote: string
  supplier: string
  date: string
  amount: number
  status: string
  notes: string
  items: SupplierQuoteItem[]
}
