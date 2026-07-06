import serverApi from './server'
import type { Order, PaginatedResponse } from '../types'
import { env } from '../env'

function resolveUrl(url: string): string {
  return url.startsWith('/') ? `${env.NEXT_PUBLIC_API_URL}${url}` : url
}

function normalizeOrder(order: Order): Order {
  return {
    ...order,
    items: order.items.map((item) => ({
      ...item,
      productImageUrl: item.productImageUrl ? resolveUrl(item.productImageUrl) : item.productImageUrl,
    })),
  }
}

export async function listMyOrders(
  params: { page?: number; limit?: number } = {},
): Promise<PaginatedResponse<Order>> {
  const res = await serverApi.get<PaginatedResponse<Order>>('/me/orders', { params })
  return { ...res.data, data: res.data.data.map(normalizeOrder) }
}

export async function getOrderByNumber(orderNumber: string): Promise<Order> {
  const res = await serverApi.get<Order>(`/orders/${orderNumber}`)
  return normalizeOrder(res.data)
}
