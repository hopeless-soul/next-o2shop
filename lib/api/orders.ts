import serverApi from './server'
import type { Order } from '../types'

export type PaginatedResponse<T> = {
  total: number
  page: number
  limit: number
  data: T[]
}

export async function listMyOrders(
  params: { page?: number; limit?: number } = {},
): Promise<PaginatedResponse<Order>> {
  const res = await serverApi.get<PaginatedResponse<Order>>('/me/orders', { params })
  return res.data
}

export async function getOrderByNumber(orderNumber: string): Promise<Order> {
  const res = await serverApi.get<Order>(`/orders/${orderNumber}`)
  return res.data
}
