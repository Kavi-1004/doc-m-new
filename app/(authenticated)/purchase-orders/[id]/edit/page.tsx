'use client'

import { useParams } from 'next/navigation'
import { PurchaseOrderForm } from '@/modules/purchase-orders/components/PurchaseOrderForm'

export default function EditPurchaseOrderPage() {
  const params = useParams()
  return <PurchaseOrderForm editId={params.id as string} />
}
