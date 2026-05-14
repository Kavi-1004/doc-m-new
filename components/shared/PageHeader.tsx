'use client'

import { type ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  description: string
  primary?: ReactNode
  secondary?: ReactNode
}

export function PageHeader({ title, description, primary, secondary }: PageHeaderProps) {
  return (
    <div className="flex flex-wrap justify-between items-end gap-4 mb-6">
      <div>
        <div className="text-xs text-slate-500 uppercase tracking-wider">{title}</div>
        <h1 className="text-2xl font-semibold mt-1">{description}</h1>
      </div>
      <div className="flex gap-2">{secondary}{primary}</div>
    </div>
  )
}
