'use client'

import { useParams } from 'next/navigation'
import { ExpenseForm } from '@/modules/expenses/components/ExpenseForm'

export default function EditExpensePage() {
  const params = useParams()
  return <ExpenseForm editId={params.id as string} />
}
