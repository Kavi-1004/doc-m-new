'use client'

import { useParams } from 'next/navigation'
import { DeliveryOrderForm } from '@/modules/delivery-orders/components/DeliveryOrderForm'

export default function EditDeliveryOrderPage() {
  const params = useParams()
  return <DeliveryOrderForm editId={params.id as string} />
}
