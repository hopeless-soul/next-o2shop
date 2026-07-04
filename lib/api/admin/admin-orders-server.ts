import serverApi from '../server'
import type { AdminOrder, PaginatedAdminOrders, GetAdminOrdersParams } from './admin-orders'

export async function getAdminOrders(params: GetAdminOrdersParams = {}): Promise<PaginatedAdminOrders> {
  const res = await serverApi.get<PaginatedAdminOrders>('/admin/orders', { params })
  return res.data
}

export async function getAdminOrder(id: string): Promise<AdminOrder> {
  const res = await serverApi.get<AdminOrder>(`/admin/orders/${id}`)
  return res.data
}

export async function getOrderNotes(id: string): Promise<string[]> {
  const res = await serverApi.get<{ notes: string[] }>(`/admin/orders/${id}/notes`)
  return res.data.notes
}
