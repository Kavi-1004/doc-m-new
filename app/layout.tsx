import './globals.css'
import { Toaster } from '@/components/ui/sonner'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'NexusERP — Business Management Suite',
  description: 'A modern ERP-lite for SMEs: Sales, Procurement, Projects, Invoicing & Costing',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased bg-slate-50 text-slate-900">
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  )
}
