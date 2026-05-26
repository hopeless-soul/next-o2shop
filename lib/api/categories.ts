import serverApi from './server'
import type { Category } from '../types'

export type PaginatedResponse<T> = {
  total: number
  page: number
  limit: number
  data: T[]
}

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
