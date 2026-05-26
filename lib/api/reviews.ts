import serverApi from './server'
import clientApi from './client'
import type { Review } from '../types'

export type PaginatedResponse<T> = {
  total: number
  page: number
  limit: number
  data: T[]
}

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

export async function deleteReview(reviewId: string): Promise<void> {
  await clientApi.delete(`/reviews/${reviewId}`)
}
