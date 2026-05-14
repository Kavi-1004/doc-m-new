'use client'

import { type LucideIcon } from 'lucide-react'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface KpiCardProps {
  title: string
  value: string
  delta: string
  deltaPositive?: boolean
  icon: LucideIcon
  accent: string
}

export function KpiCard({ title, value, delta, deltaPositive = true, icon: Icon, accent }: KpiCardProps) {
  return (
    <Card className="border-slate-200 hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-sm text-slate-500">{title}</div>
            <div className="text-2xl font-semibold mt-1.5">{value}</div>
            <div className={`text-xs mt-2 inline-flex items-center gap-1 ${deltaPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
              {deltaPositive ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
              {delta}
            </div>
          </div>
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${accent}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
