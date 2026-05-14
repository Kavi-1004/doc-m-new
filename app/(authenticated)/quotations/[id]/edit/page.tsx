'use client'

import { useParams } from 'next/navigation'
import { QuotationForm } from '@/modules/quotations/components/QuotationForm'

export default function EditQuotationPage() {
  const params = useParams()
  return <QuotationForm editId={params.id as string} />
}
