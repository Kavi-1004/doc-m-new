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
import type { Supplier } from '@/types'

interface SupplierSelectorProps {
  value: string
  onChange: (value: string, supplier?: Supplier) => void
  placeholder?: string
}

export function SupplierSelector({ value, onChange, placeholder = 'Select supplier...' }: SupplierSelectorProps) {
  const [open, setOpen] = React.useState(false)
  const { data: suppliersData } = useApi<{ items: Supplier[] }>('/api/suppliers?limit=100')
  const suppliers = suppliersData?.items || []

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
          <CommandInput placeholder="Search suppliers..." />
          <CommandList>
            <CommandEmpty>No supplier found.</CommandEmpty>
            <CommandGroup>
              {suppliers.map((supplier) => (
                <CommandItem
                  key={supplier.id}
                  value={supplier.company}
                  onSelect={(currentValue) => {
                    onChange(currentValue === value ? '' : currentValue, supplier)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === supplier.company ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <div className="flex flex-col">
                    <span>{supplier.company}</span>
                    <span className="text-[10px] text-slate-500">{supplier.contact} · {supplier.email}</span>
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
