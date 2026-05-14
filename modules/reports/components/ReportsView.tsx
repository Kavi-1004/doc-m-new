'use client'

import { FileDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RTooltip, ResponsiveContainer,
} from 'recharts'
import { useApi } from '@/hooks/use-api'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatusPill } from '@/components/shared/StatusPill'
import { fmtMoney } from '@/lib/utils'
import type { Expense, Invoice } from '@/types'

interface DashboardData {
  revenueByMonth: Array<{ month: string; revenue: number; expenses: number }>
}

interface ExpensesResponse { items: Expense[] }
interface InvoicesResponse { items: Invoice[] }

export function ReportsView() {
  const { data: dashData } = useApi<DashboardData>('/api/dashboard')
  const { data: expData } = useApi<ExpensesResponse>('/api/expenses')
  const { data: invData } = useApi<InvoicesResponse>('/api/invoices')

  const revenueByMonth = dashData?.revenueByMonth?.map(r => ({ m: r.month, revenue: r.revenue })) || []
  const expenses = expData?.items || []
  const invoices = invData?.items || []

  const expenseBreakdown = (() => {
    const map: Record<string, number> = {}
    expenses.forEach(e => { map[e.category] = (map[e.category] || 0) + e.amount })
    const colors: Record<string, string> = { MATERIAL: '#0ea5e9', LABOR: '#6366f1', TRANSPORT: '#10b981', SUBCONTRACT: '#f59e0b', SITE_VISIT: '#ef4444', ADMIN: '#a855f7' }
    return Object.entries(map).map(([name, value]) => ({ name, value, fill: colors[name] || '#94a3b8' }))
  })()

  const supplierTotals = (() => {
    const map: Record<string, number> = {}
    expenses.forEach(e => { if (e.supplier && e.supplier !== '—') map[e.supplier] = (map[e.supplier] || 0) + e.amount })
    return Object.entries(map)
  })()

  return (
    <div>
      <PageHeader title="System" description="Reports"
        primary={<Button variant="outline" className="gap-2"><FileDown className="h-4 w-4" />Export CSV</Button>} />
      <Tabs defaultValue="sales">
        <TabsList className="bg-white border">
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="expense">Expense</TabsTrigger>
          <TabsTrigger value="profit">Profit</TabsTrigger>
          <TabsTrigger value="outstanding">Outstanding</TabsTrigger>
          <TabsTrigger value="supplier">Supplier Expense</TabsTrigger>
        </TabsList>
        <TabsContent value="sales" className="mt-4">
          <Card><CardHeader><CardTitle>Sales Report</CardTitle><CardDescription>Revenue trend by month</CardDescription></CardHeader>
            <CardContent><div className="h-72"><ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueByMonth}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="m" axisLine={false} tickLine={false} /><YAxis axisLine={false} tickLine={false} />
                <RTooltip />
                <Bar dataKey="revenue" fill="#0ea5e9" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer></div></CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="expense" className="mt-4">
          <Card><CardHeader><CardTitle>Expense Report</CardTitle></CardHeader>
            <CardContent className="p-0"><Table>
              <TableHeader><TableRow><TableHead>Category</TableHead><TableHead className="text-right">Total</TableHead><TableHead className="text-right">% Share</TableHead></TableRow></TableHeader>
              <TableBody>{expenseBreakdown.map((e, i) => {
                const total = expenseBreakdown.reduce((s, x) => s + x.value, 0)
                return (<TableRow key={i}>
                  <TableCell><div className="flex items-center gap-2"><span className="w-3 h-3 rounded" style={{ background: e.fill }} />{e.name}</div></TableCell>
                  <TableCell className="text-right font-medium">{fmtMoney(e.value)}</TableCell>
                  <TableCell className="text-right">{total > 0 ? ((e.value / total) * 100).toFixed(1) : 0}%</TableCell>
                </TableRow>)
              })}</TableBody>
            </Table></CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="profit" className="mt-4"><Card><CardContent className="p-6 text-sm text-slate-500">See <span className="text-slate-700 font-medium">Profitability</span> module for full project P&L.</CardContent></Card></TabsContent>
        <TabsContent value="outstanding" className="mt-4">
          <Card><CardHeader><CardTitle>Outstanding Invoices</CardTitle></CardHeader><CardContent className="p-0">
            <Table><TableHeader><TableRow><TableHead>Invoice</TableHead><TableHead>Customer</TableHead><TableHead>Due</TableHead><TableHead className="text-right">Outstanding</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
              <TableBody>{invoices.filter(i => i.total - i.paid > 0 && i.status !== 'VOID').map(i => (
                <TableRow key={i._id || i.id}>
                  <TableCell className="font-mono text-xs">{i.number}</TableCell>
                  <TableCell>{i.customer}</TableCell>
                  <TableCell className="text-sm">{i.due}</TableCell>
                  <TableCell className="text-right font-medium text-rose-700">{fmtMoney(i.total - i.paid)}</TableCell>
                  <TableCell><StatusPill s={i.status} /></TableCell>
                </TableRow>
              ))}</TableBody>
            </Table>
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="supplier" className="mt-4">
          <Card><CardHeader><CardTitle>Supplier Expense Report</CardTitle></CardHeader><CardContent className="p-0">
            <Table><TableHeader><TableRow><TableHead>Supplier</TableHead><TableHead className="text-right">Total Spent</TableHead></TableRow></TableHeader>
              <TableBody>{supplierTotals.map(([s, v]) => (
                <TableRow key={s}><TableCell className="font-medium">{s}</TableCell><TableCell className="text-right font-medium">{fmtMoney(v)}</TableCell></TableRow>
              ))}</TableBody>
            </Table>
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
