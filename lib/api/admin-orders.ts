import clientApi from './client'

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'
export type FulfillmentStatus = 'unfulfilled' | 'fulfilled' | 'partially_fulfilled' | 'cancelled'

export type AdminOrderAddress = {
  firstName: string
  lastName: string
  company?: string
  address1: string
  address2?: string
  city: string
  country: string
  province: string
  postalCode: string
  phone: string
}

export type AdminOrderItem = {
  id: string
  productId?: string
  productName: string
  productSku: string
  productPrice: number
  productCurrency: string
  quantity: number
  total: number
}

export type AdminOrder = {
  id: string
  orderNumber: string
  paymentStatus: PaymentStatus
  fulfillmentStatus: FulfillmentStatus
  totalAmount: number
  totalCurrency: string
  shippingMethodName: string
  shippingPrice: number
  shippingCurrency: string
  shippingAddress: AdminOrderAddress
  billingAddress: AdminOrderAddress
  items: AdminOrderItem[]
  createdAt: string
  updatedAt: string
  userId?: string
  email?: string
  firstName?: string
  lastName?: string
  paymentProviderId?: string
  paymentProviderRef?: string
}

export type PaginatedAdminOrders = {
  total: number
  page: number
  limit: number
  data: AdminOrder[]
}

export type GetAdminOrdersParams = {
  page?: number
  limit?: number
  email?: string
  paymentStatus?: PaymentStatus
  fulfillmentStatus?: FulfillmentStatus
  createdAfter?: string
  createdBefore?: string
}

export type UpdateOrderStatusDto = {
  paymentStatus?: PaymentStatus
  fulfillmentStatus?: FulfillmentStatus
}

export type UpdateRecipientDto = {
  email?: string
  firstName?: string
  lastName?: string
  shippingAddress?: AdminOrderAddress
  billingAddress?: AdminOrderAddress
}

export async function updateOrderStatus(id: string, dto: UpdateOrderStatusDto): Promise<AdminOrder> {
  const res = await clientApi.patch<AdminOrder>(`/admin/orders/${id}/status`, dto)
  return res.data
}

export async function addOrderNote(id: string, note: string): Promise<string[]> {
  const res = await clientApi.post<{ notes: string[] }>(`/admin/orders/${id}/notes`, { note })
  return res.data.notes
}
