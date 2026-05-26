import serverApi from './server'
import type { Product } from '../types'

export type PaginatedResponse<T> = {
  total: number
  page: number
  limit: number
  data: T[]
}

export type ProductListParams = {
  page?: number
  limit?: number
  categorySlug?: string
  subCategorySlug?: string
  collectionSlug?: string
  search?: string
  minPrice?: number
  maxPrice?: number
  sortBy?: 'createdAt' | 'basePrice' | 'name'
  sortOrder?: 'asc' | 'desc'
}

export async function listProducts(
  params: ProductListParams = {},
): Promise<PaginatedResponse<Product>> {
  const res = await serverApi.get<PaginatedResponse<Product>>('/products', { params })
  return res.data
}

export async function getProductBySlug(slug: string): Promise<Product> {
  const res = await serverApi.get<Product>(`/products/${slug}`)
  return res.data
}
