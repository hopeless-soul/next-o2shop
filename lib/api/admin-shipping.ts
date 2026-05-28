import serverApi from './server'
import clientApi from './client'

export type ShippingMethod = {
  id: string
  name: string
  price: number
  currency: string
  estimatedDays?: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type PaginatedShippingMethods = {
  total: number
  page: number
  limit: number
  data: ShippingMethod[]
}

export type CreateShippingMethodDto = {
  name: string
  price: number
  currency: string
  estimatedDays?: number
  isActive?: boolean
}

export async function getShippingMethods(params: { page?: number; limit?: number } = {}): Promise<PaginatedShippingMethods> {
  const res = await serverApi.get<PaginatedShippingMethods>('/admin/shipping-methods', { params })
  return res.data
}

export async function createShippingMethod(dto: CreateShippingMethodDto): Promise<ShippingMethod> {
  const res = await clientApi.post<ShippingMethod>('/admin/shipping-methods', dto)
  return res.data
}

export async function updateShippingMethod(id: string, dto: CreateShippingMethodDto): Promise<ShippingMethod> {
  const res = await clientApi.patch<ShippingMethod>(`/admin/shipping-methods/${id}`, dto)
  return res.data
}

export async function deleteShippingMethod(id: string): Promise<void> {
  await clientApi.delete(`/admin/shipping-methods/${id}`)
}
