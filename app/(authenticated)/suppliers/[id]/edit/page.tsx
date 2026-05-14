'use client'

import { useParams } from 'next/navigation'
import { SupplierForm } from '@/modules/suppliers/components/SupplierForm'

export default function EditSupplierPage() {
  const params = useParams()
  return <SupplierForm editId={params.id as string} />
}
