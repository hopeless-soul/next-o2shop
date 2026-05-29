import AdminPageHeader from '@/components/admin/AdminPageHeader'
import { getAdminReviews } from '@/lib/api/admin-reviews-server'
import type { AdminReview, ReviewStatus } from '@/lib/api/admin-reviews'
import ReviewsContent from './ReviewsContent'

interface ReviewsPageProps {
  searchParams: Promise<Record<string, string>>
}

const STATUS_VALUES: ReviewStatus[] = ['pending', 'approved', 'rejected']

export default async function ReviewsPage({ searchParams }: ReviewsPageProps) {
  const p = await searchParams
  const page = Math.max(1, Number(p.page ?? '1'))
  const limit = Math.min(100, Math.max(1, Number(p.limit ?? '20')))
  const search = p.search ?? ''
  const status = STATUS_VALUES.includes(p.status as ReviewStatus)
    ? (p.status as ReviewStatus)
    : undefined

  let result: { total: number; page: number; limit: number; data: AdminReview[] } = {
    total: 0,
    page,
    limit,
    data: [],
  }
  try {
    result = await getAdminReviews({
      page,
      limit,
      search: search || undefined,
      status,
    })
  } catch {
    // render empty state on error
  }

  return (
    <>
      <AdminPageHeader
        title="Reviews"
        breadcrumb={[{ label: 'Admin', href: '/admin' }, { label: 'Reviews' }]}
      />
      <ReviewsContent
        reviews={result.data}
        total={result.total}
        page={page}
        limit={limit}
        search={search}
        status={status ?? ''}
      />
    </>
  )
}
