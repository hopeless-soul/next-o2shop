import clientApi from './client'

export type ReviewStatus = 'pending' | 'approved' | 'rejected'

export type AdminReview = {
  id: string
  productId: string
  userId?: string
  displayName: string
  rating: number
  content: string
  photoUrls?: string[]
  createdAt: string
  email: string
  status: ReviewStatus
  updatedAt: string
}

export type PaginatedAdminReviews = {
  total: number
  page: number
  limit: number
  data: AdminReview[]
}

export type GetAdminReviewsParams = {
  page?: number
  limit?: number
  productId?: string
  status?: ReviewStatus
  userId?: string
  search?: string
}

export async function updateReviewStatus(id: string, status: ReviewStatus): Promise<AdminReview> {
  const res = await clientApi.patch<AdminReview>(`/admin/reviews/${id}/status`, { status })
  return res.data
}

export async function deleteReview(id: string): Promise<void> {
  await clientApi.delete(`/admin/reviews/${id}`)
}
