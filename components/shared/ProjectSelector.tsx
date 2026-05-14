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

interface ProjectSelectorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

interface QuotationSummary {
  project: string
  customer: string
}

export function ProjectSelector({ value, onChange, placeholder = 'Select project...' }: ProjectSelectorProps) {
  const [open, setOpen] = React.useState(false)
  const { data } = useApi<{ items: QuotationSummary[] }>('/api/quotations?limit=200')

  const projects = React.useMemo(() => {
    if (!data?.items) return []
    const seen = new Set<string>()
    return data.items
      .filter(q => {
        if (!q.project || seen.has(q.project)) return false
        seen.add(q.project)
        return true
      })
      .map(q => ({ name: q.project, customer: q.customer }))
  }, [data])

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
          <CommandInput placeholder="Search projects..." />
          <CommandList>
            <CommandEmpty>No projects found.</CommandEmpty>
            <CommandGroup>
              {projects.map((p) => (
                <CommandItem
                  key={p.name}
                  value={p.name}
                  onSelect={(currentValue) => {
                    onChange(currentValue === value ? '' : currentValue)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === p.name ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <div className="flex flex-col">
                    <span>{p.name}</span>
                    <span className="text-[10px] text-slate-500">{p.customer}</span>
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
