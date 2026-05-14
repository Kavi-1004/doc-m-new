'use client'

import * as React from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useApi } from '@/hooks/use-api'
import type { Quotation } from '@/types'

interface QuotationSelectorProps {
  value: string
  onChange: (value: string, quotation?: Quotation) => void
  placeholder?: string
}

export function QuotationSelector({ value, onChange, placeholder = 'Select quotation...' }: QuotationSelectorProps) {
  const [open, setOpen] = React.useState(false)
  const { data: quotationsData } = useApi<{ items: Quotation[] }>('/api/quotations?limit=100')
  const quotations = quotationsData?.items || []

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-white"
        >
          {value ? value : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search quotations..." />
          <CommandList>
            <CommandEmpty>No quotation found.</CommandEmpty>
            <CommandGroup>
              {quotations.map((q) => (
                <CommandItem
                  key={q.id || q._id}
                  value={q.number}
                  onSelect={(currentValue) => {
                    onChange(currentValue === value ? '' : currentValue, q)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === q.number ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <div className="flex flex-col">
                    <span className="font-mono text-xs">{q.number}</span>
                    <span className="text-[10px] text-slate-500">{q.customer} · {q.project || 'No project'}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
