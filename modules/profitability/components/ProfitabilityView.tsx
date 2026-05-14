'use client'

import { useMemo } from 'react'
import { CircleDollarSign, Receipt, Wallet, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RTooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell,
} from 'recharts'
import { useApi } from '@/hooks/use-api'
import { PageHeader } from '@/components/shared/PageHeader'
import { KpiCard } from '@/components/shared/KpiCard'
import { fmtMoney } from '@/lib/utils'
import type { Quotation, Expense, Invoice, ProjectProfitability } from '@/types'

interface QuotationsResponse { items: Quotation[] }
interface ExpensesResponse { items: Expense[] }
interface InvoicesResponse { items: Invoice[] }

interface PLData {
  revenue: number
  expenses: number
  netProfit: number
}

const COLORS = ['#0ea5e9', '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#a855f7', '#ec4899', '#14b8a6']

export function ProfitabilityView() {
  const { data: qData } = useApi<QuotationsResponse>('/api/quotations')
  const { data: eData } = useApi<ExpensesResponse>('/api/expenses')
  const { data: iData } = useApi<InvoicesResponse>('/api/invoices')
  const { data: plData } = useApi<PLData>('/api/reports?type=profit-loss')

  const projects = useMemo<ProjectProfitability[]>(() => {
    const quotations = qData?.items || []
    const expenses = eData?.items || []
    const invoices = iData?.items || []

    const map: Record<string, ProjectProfitability> = {}
    quotations.filter(q => q.status === 'APPROVED').forEach(q => {
      map[q.number] = { number: q.number, customer: q.customer, project: q.project, value: q.total, expenses: 0, invoiced: 0 }
    })
    expenses.forEach(e => { if (map[e.project]) map[e.project].expenses += e.amount })
    invoices.forEach(i => { if (map[i.linkedQuote]) map[i.linkedQuote].invoiced += i.total })
    return Object.values(map)
  }, [qData, eData, iData])

  const expenseByCategory = useMemo(() => {
    const expenses = eData?.items || []
    const map: Record<string, number> = {}
    expenses.forEach(e => { map[e.category] = (map[e.category] || 0) + e.amount })
    return Object.entries(map).map(([name, value], i) => ({ name, value, fill: COLORS[i % COLORS.length] }))
  }, [eData])

  const chartData = useMemo(() => {
    return projects.map(p => ({
      name: p.project || p.number,
      value: p.value,
      expenses: p.expenses,
      profit: p.value - p.expenses,
    }))
  }, [projects])

  const totalValue = projects.reduce((s, p) => s + p.value, 0)
  const totalExp = projects.reduce((s, p) => s + p.expenses, 0)
  const totalInv = projects.reduce((s, p) => s + p.invoiced, 0)
  const totalProfit = totalValue - totalExp

  return (
    <div>
      <PageHeader title="Finance" description="Profitability Reports" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard title="Pipeline Value" value={fmtMoney(totalValue)} delta={`${projects.length} active`} icon={CircleDollarSign} accent="bg-sky-50 text-sky-600" />
        <KpiCard title="Total Expenses" value={fmtMoney(totalExp)} delta={totalValue > 0 ? `${((totalExp / totalValue) * 100).toFixed(1)}% of pipeline` : '0%'} deltaPositive={false} icon={Wallet} accent="bg-rose-50 text-rose-600" />
        <KpiCard title="Invoiced" value={fmtMoney(totalInv)} delta={`${projects.length} projects`} icon={Receipt} accent="bg-emerald-50 text-emerald-600" />
        <KpiCard title="Estimated Profit" value={fmtMoney(totalProfit)} delta={totalValue > 0 ? `${((totalProfit / totalValue) * 100).toFixed(1)}% margin` : '0%'} icon={TrendingUp} accent="bg-indigo-50 text-indigo-600" />
      </div>

      {plData && (
        <Card className="mb-6">
          <CardHeader><CardTitle>Profit & Loss Summary</CardTitle><CardDescription>Based on paid invoices vs total expenses</CardDescription></CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-sm text-slate-500">Revenue (Paid)</div>
                <div className="text-2xl font-bold text-emerald-700">{fmtMoney(plData.revenue)}</div>
              </div>
              <div>
                <div className="text-sm text-slate-500">Total Expenses</div>
                <div className="text-2xl font-bold text-rose-700">{fmtMoney(plData.expenses)}</div>
              </div>
              <div>
                <div className="text-sm text-slate-500">Net Profit</div>
                <div className={`text-2xl font-bold ${plData.netProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {fmtMoney(plData.netProfit)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader><CardTitle>Project Revenue vs Expenses</CardTitle></CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} />
                  <RTooltip />
                  <Legend />
                  <Bar dataKey="value" name="Contract Value" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="profit" name="Profit" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Expense Breakdown</CardTitle></CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={expenseByCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {expenseByCategory.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                  <RTooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Project Profitability</CardTitle><CardDescription>Approved quotations — expenses & billed totals</CardDescription></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow>
              <TableHead>Project</TableHead><TableHead>Customer</TableHead>
              <TableHead className="text-right">Value</TableHead><TableHead className="text-right">Expenses</TableHead>
              <TableHead className="text-right">Invoiced</TableHead><TableHead className="text-right">Outstanding</TableHead>
              <TableHead className="text-right">Est. Profit</TableHead><TableHead className="text-right">Margin</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {projects.map(p => {
                const profit = p.value - p.expenses
                const margin = p.value > 0 ? (profit / p.value) * 100 : 0
                const outstanding = p.value - p.invoiced
                return (
                  <TableRow key={p.number}>
                    <TableCell><div className="font-mono text-xs">{p.number}</div><div className="text-xs text-slate-500">{p.project}</div></TableCell>
                    <TableCell className="font-medium">{p.customer}</TableCell>
                    <TableCell className="text-right">{fmtMoney(p.value)}</TableCell>
                    <TableCell className="text-right text-rose-700">{fmtMoney(p.expenses)}</TableCell>
                    <TableCell className="text-right">{fmtMoney(p.invoiced)}</TableCell>
                    <TableCell className="text-right text-amber-700">{fmtMoney(outstanding)}</TableCell>
                    <TableCell className="text-right font-semibold text-emerald-700">{fmtMoney(profit)}</TableCell>
                    <TableCell className="text-right"><Badge variant="outline" className={margin >= 30 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}>{margin.toFixed(1)}%</Badge></TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
