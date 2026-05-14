'use client'

import { useParams } from 'next/navigation'
import { CompanyForm } from '@/modules/companies/components/CompanyForm'

export default function EditCompanyPage() {
  const params = useParams()
  return <CompanyForm editId={params.id as string} />
}
