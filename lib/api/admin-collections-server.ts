import serverApi from './server'
import type { PaginatedAdminCollections } from './admin-collections'

export async function getAdminCollections(
  params: { page?: number; limit?: number } = {}
): Promise<PaginatedAdminCollections> {
  const res = await serverApi.get<PaginatedAdminCollections>('/admin/collections', { params })
  return res.data
}
