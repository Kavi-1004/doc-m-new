'use client'

import { MoreHorizontal, Eye, Pencil, Copy, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'

interface CustomAction {
  label: string
  icon?: React.ReactNode
  onClick: () => void
}

interface RowActionsProps {
  onView?: () => void
  onEdit?: () => void
  onDuplicate?: () => void
  onDelete?: () => void
  extraActions?: CustomAction[]
}

export function RowActions({ onView, onEdit, onDuplicate, onDelete, extraActions }: RowActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onView}><Eye className="h-4 w-4 mr-2" />View</DropdownMenuItem>
        <DropdownMenuItem onClick={onEdit}><Pencil className="h-4 w-4 mr-2" />Edit</DropdownMenuItem>
        <DropdownMenuItem onClick={onDuplicate}><Copy className="h-4 w-4 mr-2" />Duplicate</DropdownMenuItem>
        {extraActions && extraActions.length > 0 && (
          <>
            <DropdownMenuSeparator />
            {extraActions.map((action, i) => (
              <DropdownMenuItem key={i} onClick={action.onClick}>
                {action.icon}{action.label}
              </DropdownMenuItem>
            ))}
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-rose-600" onClick={onDelete}><Trash2 className="h-4 w-4 mr-2" />Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
