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
import type { Customer } from '@/types'

interface CustomerSelectorProps {
  value: string
  onChange: (value: string, customer?: Customer) => void
  placeholder?: string
}

export function CustomerSelector({ value, onChange, placeholder = 'Select customer...' }: CustomerSelectorProps) {
  const [open, setOpen] = React.useState(false)
  const { data: customersData } = useApi<{ items: Customer[] }>('/api/customers?limit=100')
  const customers = customersData?.items || []

  const selectedCustomer = customers.find((c) => c.company === value)

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
          <CommandInput placeholder="Search customers..." />
          <CommandList>
            <CommandEmpty>No customer found.</CommandEmpty>
            <CommandGroup>
              {customers.map((customer) => (
                <CommandItem
                  key={customer.id}
                  value={customer.company}
                  onSelect={(currentValue) => {
                    onChange(currentValue === value ? '' : currentValue, customer)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === customer.company ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <div className="flex flex-col">
                    <span>{customer.company}</span>
                    <span className="text-[10px] text-slate-500">{customer.contact} · {customer.email}</span>
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
