'use server'

import { revalidatePath } from 'next/cache'
import serverApi from '@/lib/api/server'
import type { SavedAddress } from '@/lib/types'
import type { SaveAddressPayload } from '@/lib/api/addresses'

// Creates a saved address, then busts the /account RSC cache so the new address shows up without a manual refresh.
export async function createAddressAction(payload: SaveAddressPayload): Promise<SavedAddress> {
  const res = await serverApi.post<SavedAddress>('/addresses', payload)
  revalidatePath('/account')
  return res.data
}

// Updates a saved address, then busts the /account RSC cache so the edit shows up without a manual refresh.
export async function updateAddressAction(
  id: string,
  payload: SaveAddressPayload,
): Promise<SavedAddress> {
  const res = await serverApi.patch<SavedAddress>(`/addresses/${id}`, payload)
  revalidatePath('/account')
  return res.data
}

// Deletes a saved address, then busts the /account RSC cache so it disappears without a manual refresh.
export async function deleteAddressAction(id: string): Promise<void> {
  await serverApi.delete(`/addresses/${id}`)
  revalidatePath('/account')
}
