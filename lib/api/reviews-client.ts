import clientApi from './client'
import type { PaginatedResponse, Review } from '../types'

// Client-only counterpart to reviews-server.ts. Use in Client Components;
// clientApi sends cookies via withCredentials and retries once on 401.
export async function listReviewsByProductClient(
  productId: string,
  params: { page?: number; limit?: number } = {},
): Promise<PaginatedResponse<Review>> {
  const res = await clientApi.get<PaginatedResponse<Review>>(
    `/products/${productId}/reviews`,
    { params },
  )
  return res.data
}

export async function createReview(
  productId: string,
  body: { email: string; displayName: string; rating: number; content: string },
): Promise<Review> {
  const res = await clientApi.post<Review>(`/products/${productId}/reviews`, body)
  return res.data
}
