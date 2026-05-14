'use client'

import { useParams } from 'next/navigation'
import { UserForm } from '@/modules/users/components/UserForm'

export default function EditUserPage() {
  const params = useParams()
  return <UserForm editId={params.id as string} />
}
