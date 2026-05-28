import serverApi from './server'
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

export async function getAdminOrders(params: GetAdminOrdersParams = {}): Promise<PaginatedAdminOrders> {
  const res = await serverApi.get<PaginatedAdminOrders>('/admin/orders', { params })
  return res.data
}

export async function getAdminOrder(id: string): Promise<AdminOrder> {
  const res = await serverApi.get<AdminOrder>(`/admin/orders/${id}`)
  return res.data
}

export async function updateOrderStatus(id: string, dto: UpdateOrderStatusDto): Promise<AdminOrder> {
  const res = await clientApi.patch<AdminOrder>(`/admin/orders/${id}/status`, dto)
  return res.data
}
