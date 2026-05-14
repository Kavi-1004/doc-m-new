export interface RevenueSeries {
  m: string
  revenue: number
  expenses: number
}

export interface ExpenseBreakdown {
  name: string
  value: number
  fill: string
}

export interface StatusCount {
  name: string
  value: number
  fill: string
}

export interface ProjectProfitability {
  number: string
  customer: string
  project: string
  value: number
  expenses: number
  invoiced: number
}
