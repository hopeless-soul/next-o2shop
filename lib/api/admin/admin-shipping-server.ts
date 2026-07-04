import serverApi from '../server'
import type { PaginatedShippingMethods } from './admin-shipping'

export async function getShippingMethods(
  params: { page?: number; limit?: number } = {}
): Promise<PaginatedShippingMethods> {
  const res = await serverApi.get<PaginatedShippingMethods>('/admin/shipping-methods', { params })
  return res.data
}
