import serverApi from './server'
import type { Review } from '../types'
import type { PaginatedResponse } from './reviews'

export async function listReviewsByProduct(
  productId: string,
  params: { page?: number; limit?: number } = {},
): Promise<PaginatedResponse<Review>> {
  const res = await serverApi.get<PaginatedResponse<Review>>(
    `/products/${productId}/reviews`,
    { params },
  )
  return res.data
}
