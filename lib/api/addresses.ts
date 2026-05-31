import clientApi from './client'
import type { SavedAddress, AddressDto } from '../types'

export type SaveAddressPayload = {
  name: string
  shippingAddress: AddressDto
  billingAddress: AddressDto
  billingIsSameAsShipping?: boolean
}

export async function createAddress(payload: SaveAddressPayload): Promise<SavedAddress> {
  const res = await clientApi.post<SavedAddress>('/addresses', payload)
  return res.data
}

export async function updateAddress(
  id: string,
  payload: SaveAddressPayload,
): Promise<SavedAddress> {
  const res = await clientApi.patch<SavedAddress>(`/addresses/${id}`, payload)
  return res.data
}

export async function deleteAddress(id: string): Promise<void> {
  await clientApi.delete(`/addresses/${id}`)
}
