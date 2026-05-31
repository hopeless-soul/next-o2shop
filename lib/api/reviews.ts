import clientApi from './client'

export type PaginatedResponse<T> = {
  total: number
  page: number
  limit: number
  data: T[]
}

export async function deleteReview(reviewId: string): Promise<void> {
  await clientApi.delete(`/reviews/${reviewId}`)
}
