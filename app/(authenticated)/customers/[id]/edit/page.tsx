'use client'

import { useParams } from 'next/navigation'
import { CustomerForm } from '@/modules/customers/components/CustomerForm'

export default function EditCustomerPage() {
  const params = useParams()
  return <CustomerForm editId={params.id as string} />
}
