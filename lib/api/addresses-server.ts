import serverApi from './server'
import type { SavedAddress } from '../types'

export async function listAddresses(): Promise<SavedAddress[]> {
  const res = await serverApi.get<SavedAddress[]>('/me/addresses')
  return res.data
}
