'use server'

import serverApi from '@/lib/api/server'
import type { AdminOrder, UpdateOrderStatusDto } from '@/lib/api/admin-orders'

export async function updateOrderStatusAction(
  id: string,
  dto: UpdateOrderStatusDto,
): Promise<AdminOrder> {
  const res = await serverApi.patch<AdminOrder>(`/admin/orders/${id}/status`, dto)
  return res.data
}
