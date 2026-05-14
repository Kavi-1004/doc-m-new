'use client'

import { useParams } from 'next/navigation'
import { InvoiceForm } from '@/modules/invoices/components/InvoiceForm'

export default function EditInvoicePage() {
  const params = useParams()
  return <InvoiceForm editId={params.id as string} />
}
