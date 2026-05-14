'use client'

import { useState, useMemo } from 'react'
import { Plus, Calendar as CalendarIcon, CircleDollarSign, Receipt, FileCheck2, TrendingUp, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import {
  AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip as RTooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { useApi } from '@/hooks/use-api'
import { KpiCard } from '@/components/shared/KpiCard'
import { StatusPill } from '@/components/shared/StatusPill'
import { fmtMoney, initials } from '@/lib/utils'
import { useAppContext } from '@/lib/app-context'

interface DashboardData {
  kpis: {
    totalRevenue: number
    totalExpenses: number
    totalOutstanding: number
    activeQuotations: number
    customers: number
    suppliers: number
    margin: number
  }
  revenueByMonth: Array<{ m: string; revenue: number; expenses: number }>
  expenseBreakdown: Array<{ name: string; value: number; fill: string }>
  statusBreakdown: {
    quotations: Array<{ status: string; count: number }>
  }
  recentActivity: Array<{ id: string; user: string; action: string; target: string; module: string; time: string }>
}

interface QuotationsData {
  items: Array<{ id: string; _id?: string; number: string; customer: string; total: number; status: string }>
}

const CHART_COLORS = ['#94a3b8', '#0ea5e9', '#10b981', '#ef4444', '#f59e0b']

type DatePreset = '7d' | '30d' | '90d' | '1y' | 'all' | 'custom'

const PRESET_LABELS: Record<DatePreset, string> = {
  '7d': 'Last 7 days',
  '30d': 'Last 30 days',
  '90d': 'Last 90 days',
  '1y': 'This year',
  all: 'All time',
  custom: 'Custom range',
}

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function presetToRange(preset: DatePreset): { from?: string; to?: string } {
  if (preset === 'all') return {}
  const now = new Date()
  const to = formatDate(now)
  if (preset === '7d') {
    const from = new Date(now); from.setDate(from.getDate() - 7)
    return { from: formatDate(from), to }
  }
  if (preset === '30d') {
    const from = new Date(now); from.setDate(from.getDate() - 30)
    return { from: formatDate(from), to }
  }
  if (preset === '90d') {
    const from = new Date(now); from.setDate(from.getDate() - 90)
    return { from: formatDate(from), to }
  }
  if (preset === '1y') {
    return { from: `${now.getFullYear()}-01-01`, to }
  }
  return {}
}

export function DashboardView() {
  const { company, setView } = useAppContext()
  const onNewQuote = () => setView('quotations')

  const [preset, setPreset] = useState<DatePreset>('all')
  const [customFrom, setCustomFrom] = useState<Date | undefined>(undefined)
  const [customTo, setCustomTo] = useState<Date | undefined>(undefined)
  const [fromOpen, setFromOpen] = useState(false)
  const [toOpen, setToOpen] = useState(false)

  const dateRange = useMemo(() => {
    if (preset === 'custom') {
      return {
        from: customFrom ? formatDate(customFrom) : undefined,
        to: customTo ? formatDate(customTo) : undefined,
      }
    }
    return presetToRange(preset)
  }, [preset, customFrom, customTo])

  const dashUrl = useMemo(() => {
    const params = new URLSearchParams()
    if (dateRange.from) params.set('from', dateRange.from)
    if (dateRange.to) params.set('to', dateRange.to)
    const qs = params.toString()
    return `/api/dashboard${qs ? `?${qs}` : ''}`
  }, [dateRange])

  const { data: dashData } = useApi<DashboardData>(dashUrl)
  const { data: quotData } = useApi<QuotationsData>('/api/quotations?limit=5')

  const kpis = dashData?.kpis
  const revenueByMonth = dashData?.revenueByMonth || []
  const quotations = quotData?.items || []
  const recentActivity = dashData?.recentActivity || []
  const expenseBreakdown = dashData?.expenseBreakdown || []

  const marginStr = kpis?.margin != null ? `${kpis.margin.toFixed(1)}% margin` : '—'
  const outstandingDelta = `${kpis?.activeQuotations || 0} active quotes`

  const statusCounts = dashData?.statusBreakdown?.quotations?.map((s, i) => ({
    name: s.status, value: s.count, fill: CHART_COLORS[i % CHART_COLORS.length],
  })) || []

  const handlePreset = (p: DatePreset) => {
    setPreset(p)
    if (p !== 'custom') {
      setCustomFrom(undefined)
      setCustomTo(undefined)
    }
  }

  const dateLabel = preset === 'custom'
    ? `${customFrom ? customFrom.toLocaleDateString() : '...'} – ${customTo ? customTo.toLocaleDateString() : '...'}`
    : PRESET_LABELS[preset]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-end gap-4">
        <div>
          <div className="text-xs text-slate-500 uppercase tracking-wider">Overview</div>
          <h1 className="text-2xl font-semibold mt-1">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Here&apos;s what&apos;s happening at <span className="font-medium text-slate-700">{company.name}</span> today.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2">
                <CalendarIcon className="h-4 w-4" />
                {dateLabel}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-3" align="end">
              <div className="flex flex-col gap-2">
                <div className="grid grid-cols-3 gap-1">
                  {(['7d', '30d', '90d', '1y', 'all', 'custom'] as DatePreset[]).map(p => (
                    <Button
                      key={p}
                      size="sm"
                      variant={preset === p ? 'default' : 'ghost'}
                      className="text-xs h-7"
                      onClick={() => handlePreset(p)}
                    >
                      {PRESET_LABELS[p]}
                    </Button>
                  ))}
                </div>
                {preset === 'custom' && (
                  <div className="flex gap-2 pt-2 border-t">
                    <div className="flex-1">
                      <div className="text-xs text-slate-500 mb-1">From</div>
                      <Popover open={fromOpen} onOpenChange={setFromOpen}>
                        <PopoverTrigger asChild>
                          <Button variant="outline" size="sm" className="w-full text-xs justify-start">
                            {customFrom ? customFrom.toLocaleDateString() : 'Start date'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={customFrom}
                            onSelect={(d: Date | undefined) => { setCustomFrom(d); setFromOpen(false) }}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-slate-500 mb-1">To</div>
                      <Popover open={toOpen} onOpenChange={setToOpen}>
                        <PopoverTrigger asChild>
                          <Button variant="outline" size="sm" className="w-full text-xs justify-start">
                            {customTo ? customTo.toLocaleDateString() : 'End date'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={customTo}
                            onSelect={(d: Date | undefined) => { setCustomTo(d); setToOpen(false) }}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>
          <Button className="gap-2 bg-slate-900 hover:bg-slate-800" onClick={onNewQuote}><Plus className="h-4 w-4" />New Quotation</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Revenue (YTD)" value={fmtMoney(kpis?.totalRevenue || 0, company.currency)} delta={`${fmtMoney(kpis?.totalExpenses || 0, company.currency)} expenses`} icon={CircleDollarSign} accent="bg-emerald-50 text-emerald-600" />
        <KpiCard title="Outstanding Invoices" value={fmtMoney(kpis?.totalOutstanding || 0, company.currency)} delta={outstandingDelta} deltaPositive={false} icon={Receipt} accent="bg-rose-50 text-rose-600" />
        <KpiCard title="Active Projects" value={String(kpis?.activeQuotations || 0)} delta={`${kpis?.customers || 0} customers`} icon={FileCheck2} accent="bg-sky-50 text-sky-600" />
        <KpiCard title="Estimated Profit" value={fmtMoney((kpis?.totalRevenue || 0) - (kpis?.totalExpenses || 0), company.currency)} delta={marginStr} icon={TrendingUp} accent="bg-indigo-50 text-indigo-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Revenue vs Expenses</CardTitle>
                <CardDescription>Monthly trend — {company.currency}</CardDescription>
              </div>
              <Tabs defaultValue="6m"><TabsList className="h-8">
                <TabsTrigger value="3m" className="text-xs h-7">3M</TabsTrigger>
                <TabsTrigger value="6m" className="text-xs h-7">6M</TabsTrigger>
                <TabsTrigger value="1y" className="text-xs h-7">1Y</TabsTrigger>
              </TabsList></Tabs>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueByMonth} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="exp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="m" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <RTooltip />
                  <Legend />
                  <Area type="monotone" dataKey="revenue" stroke="#0ea5e9" strokeWidth={2.5} fill="url(#rev)" />
                  <Area type="monotone" dataKey="expenses" stroke="#6366f1" strokeWidth={2.5} fill="url(#exp)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Expense Breakdown</CardTitle>
            <CardDescription>By category — {dateLabel}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={expenseBreakdown} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
                    {expenseBreakdown.map((e, i) => <Cell key={i} fill={e.fill} />)}
                  </Pie>
                  <RTooltip formatter={(v: number) => fmtMoney(v, company.currency)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {expenseBreakdown.map(e => (
                <div key={e.name} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: e.fill }} />
                  <span className="text-slate-600">{e.name}</span>
                  <span className="ml-auto font-medium">{(e.value / 1000).toFixed(0)}K</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Quotations</CardTitle>
              <CardDescription>Latest activity from your sales pipeline</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setView('quotations')} className="gap-1">View all <ChevronRight className="h-4 w-4" /></Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader><TableRow>
                <TableHead>Number</TableHead><TableHead>Customer</TableHead>
                <TableHead className="text-right">Total</TableHead><TableHead>Status</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {quotations.slice(0, 5).map(q => (
                  <TableRow key={q._id || q.id} className="cursor-pointer">
                    <TableCell className="font-mono text-xs">{q.number}</TableCell>
                    <TableCell className="font-medium">{q.customer}</TableCell>
                    <TableCell className="text-right font-medium">{fmtMoney(q.total, company.currency)}</TableCell>
                    <TableCell><StatusPill s={q.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Audit trail — last 10 events</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {recentActivity.slice(0, 6).map(a => (
                <div key={a.id} className="flex items-center gap-3 px-4 py-3">
                  <Avatar className="h-8 w-8 text-xs"><AvatarFallback>{initials(a.user)}</AvatarFallback></Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm"><span className="font-medium">{a.user}</span> <span className="text-slate-500">{a.action.toLowerCase()}</span></div>
                    <div className="text-xs text-slate-400 truncate">{a.module} · {a.target}</div>
                  </div>
                  <div className="text-xs text-slate-400 whitespace-nowrap">{a.time}</div>
                </div>
              ))}
            </div>
          </CardContent>
          <Separator />
          <div className="p-3 text-center">
            <Button variant="ghost" size="sm" onClick={() => setView('audit')} className="gap-1 text-xs">View all activity <ChevronRight className="h-3 w-3" /></Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
