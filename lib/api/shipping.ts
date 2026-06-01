// lib/api/shipping.ts
import clientApi from "./client"

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

type PaginatedResponse<T> = {
  total: number
  page: number
  limit: number
  data: T[]
}

export async function listShippingMethods(): Promise<ShippingMethod[]> {
  const res = await clientApi.get<PaginatedResponse<ShippingMethod>>(
    "/shipping-methods",
  )
  return res.data.data
}
