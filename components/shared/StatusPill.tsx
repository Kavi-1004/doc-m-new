'use client'

import { Badge } from '@/components/ui/badge'
import { STATUS_STYLES } from '@/lib/constants'

interface StatusPillProps {
  s: string
}

export function StatusPill({ s }: StatusPillProps) {
  return (
    <Badge variant="outline" className={`font-medium ${STATUS_STYLES[s] || 'bg-slate-50 text-slate-700 border-slate-200'}`}>
      {s}
    </Badge>
  )
}
