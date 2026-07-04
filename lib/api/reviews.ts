import clientApi from './client'

export async function deleteReview(reviewId: string): Promise<void> {
  await clientApi.delete(`/reviews/${reviewId}`)
}
