import serverApi from '../server'
import type { PaginatedAdminCategories } from './admin-categories'

export async function getAdminCategories(
  params: { page?: number; limit?: number } = {}
): Promise<PaginatedAdminCategories> {
  const res = await serverApi.get<PaginatedAdminCategories>('/admin/categories', { params })
  return res.data
}
