export interface DashboardKpis {
  totalRevenue: number
  totalExpenses: number
  totalOutstanding: number
  activeQuotations: number
  customers: number
  suppliers: number
  margin: number
}

export interface DashboardData {
  kpis: DashboardKpis
  revenueByMonth: Array<{ m: string; revenue: number; expenses: number }>
  expenseBreakdown: Array<{ name: string; value: number; fill: string }>
  statusBreakdown: {
    quotations: Array<{ status: string; count: number }>
  }
  recentActivity: Array<{ id: string; user: string; action: string; target: string; module: string; time: string }>
}
