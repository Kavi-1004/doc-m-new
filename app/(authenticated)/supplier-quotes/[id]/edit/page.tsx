'use client'

import { useParams } from 'next/navigation'
import { SupplierQuoteForm } from '@/modules/supplier-quotes/components/SupplierQuoteForm'

export default function EditSupplierQuotePage() {
  const params = useParams()
  return <SupplierQuoteForm editId={params.id as string} />
}
