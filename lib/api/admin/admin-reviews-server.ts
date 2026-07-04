import serverApi from '../server'
import type {
  AdminReview,
  PaginatedAdminReviews,
  GetAdminReviewsParams,
} from './admin-reviews'

export async function getAdminReviews(
  params: GetAdminReviewsParams = {}
): Promise<PaginatedAdminReviews> {
  const res = await serverApi.get<PaginatedAdminReviews>('/admin/reviews', { params })
  return res.data
}

export async function getAdminReview(id: string): Promise<AdminReview> {
  const res = await serverApi.get<AdminReview>(`/admin/reviews/${id}`)
  return res.data
}
