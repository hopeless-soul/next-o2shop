'use server'

import serverApi from '@/lib/api/server'
import type { AdminOrder, UpdateOrderStatusDto, UpdateRecipientDto } from '@/lib/api/admin-orders'

export async function updateOrderStatusAction(
  id: string,
  dto: UpdateOrderStatusDto,
): Promise<AdminOrder> {
  const res = await serverApi.patch<AdminOrder>(`/admin/orders/${id}/status`, dto)
  return res.data
}

export async function updateRecipientAction(
  id: string,
  dto: UpdateRecipientDto,
): Promise<AdminOrder> {
  const res = await serverApi.patch<AdminOrder>(`/admin/orders/${id}/recipient`, dto)
  return res.data
}

export async function addNoteAction(id: string, note: string): Promise<string[]> {
  const res = await serverApi.post<{ notes: string[] }>(`/admin/orders/${id}/notes`, { note })
  return res.data.notes
}
