import serverApi from './server'
import type { PaginatedResponse, Review } from '../types'

// Server-only counterpart to reviews-client.ts. Use in RSC pages/Server Actions;
// serverApi reads the access_token from HttpOnly cookies via next/headers.
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
