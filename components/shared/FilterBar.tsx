'use client'

import { type ReactNode } from 'react'
import { Search, Filter } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface FilterBarProps {
  placeholder: string
  extras?: ReactNode
  onSearch?: (query: string) => void
}

export function FilterBar({ placeholder, extras, onSearch }: FilterBarProps) {
  return (
    <Card className="mb-4">
      <CardContent className="p-3 flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder={placeholder}
            className="pl-9"
            onChange={e => onSearch?.(e.target.value)}
          />
        </div>
        <Button variant="outline" className="gap-2"><Filter className="h-4 w-4" />Filters</Button>
        {extras}
      </CardContent>
    </Card>
  )
}
