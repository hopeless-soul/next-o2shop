'use server'

import { revalidatePath } from 'next/cache'
import serverApi from '@/lib/api/server'
import type { SavedAddress } from '@/lib/types'
import type { SaveAddressPayload } from '@/lib/api/addresses'

export async function createAddressAction(payload: SaveAddressPayload): Promise<SavedAddress> {
  const res = await serverApi.post<SavedAddress>('/addresses', payload)
  revalidatePath('/account')
  return res.data
}

export async function updateAddressAction(
  id: string,
  payload: SaveAddressPayload,
): Promise<SavedAddress> {
  const res = await serverApi.patch<SavedAddress>(`/addresses/${id}`, payload)
  revalidatePath('/account')
  return res.data
}

export async function deleteAddressAction(id: string): Promise<void> {
  await serverApi.delete(`/addresses/${id}`)
  revalidatePath('/account')
}
