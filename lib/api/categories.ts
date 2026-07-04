import serverApi from './server'
import type { Category, PaginatedResponse } from '../types'

export async function listCategories(
  params: { page?: number; limit?: number } = {},
): Promise<PaginatedResponse<Category>> {
  const res = await serverApi.get<PaginatedResponse<Category>>('/categories', { params })
  return res.data
}

export async function getCategoryById(id: string): Promise<Category> {
  const res = await serverApi.get<Category>(`/categories/${id}`)
  return res.data
}
