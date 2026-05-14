export interface QuotationItem {
  d: string
  components?: string[]
  q: number
  u: string
  r: number
  t: number
}

export interface Quotation {
  id: string
  _id?: string
  number: string
  rev: number
  customer: string
  project: string
  date: string
  validity: string
  status: string
  total: number
  items: QuotationItem[]
  terms: string
  attnName?: string
  attnEmail?: string
  salesPerson?: string
  showSignature?: boolean
  discount?: number
  tax?: number
}
