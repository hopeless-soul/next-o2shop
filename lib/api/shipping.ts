// lib/api/shipping.ts
import clientApi from "./client"
import type { PaginatedResponse } from "../types"

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

export async function listShippingMethods(): Promise<ShippingMethod[]> {
  const res = await clientApi.get<PaginatedResponse<ShippingMethod>>(
    "/shipping-methods",
  )
  return res.data.data
}
