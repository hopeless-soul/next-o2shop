'use client'

import { useState } from 'react'
import { Search, Eye } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAdminUrlParams } from '@/hooks/useAdminUrlParams'
import { formatDate } from '@/lib/admin/formatters'
import Link from 'next/link'
import type { ColumnDef } from '@tanstack/react-table'
import DataTable from '@/components/admin/DataTable'
import FilterBar from '@/components/admin/FilterBar'
import AdminPagination from '@/components/admin/AdminPagination'
import AdminBadge, { reviewVariant } from '@/components/admin/AdminBadge'
import ConfirmDialog from '@/components/admin/ConfirmDialog'
import StarRating from '@/components/ui/StarRating'
import { deleteReview } from '@/lib/api/admin/admin-reviews'
import type { AdminReview } from '@/lib/api/admin/admin-reviews'
import ReviewDrawer from './ReviewDrawer'
import { env } from '@/lib/env'

const API_BASE = env.NEXT_PUBLIC_API_URL

function resolveUrl(url: string) {
  return url.startsWith('http') ? url : `${API_BASE}${url}`
}

interface ReviewsContentProps {
  reviews: AdminReview[]
  total: number
  page: number
  limit: number
  search: string
  status: string
}

export default function ReviewsContent({
  reviews,
  total,
  page,
  limit,
  search,
  status,
}: ReviewsContentProps) {
  const router = useRouter()
  const updateParams = useAdminUrlParams()

  const [selectedReview, setSelectedReview] = useState<AdminReview | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<AdminReview | null>(null)

  function openDrawer(review: AdminReview) {
    setSelectedReview(review)
    setDrawerOpen(true)
  }

  function handleActionComplete() {
    setDrawerOpen(false)
    router.refresh()
  }

  function handleDeleteRequest(review: AdminReview) {
    setDrawerOpen(false)
    setDeleteTarget(review)
  }

  // Columns
  const columns: ColumnDef<AdminReview>[] = [
    {
      id: 'reviewer',
      header: 'Reviewer',
      size: 100,
      cell: ({ row }) => {
        const r = row.original
        return (
          <div className="flex flex-col min-w-0">
            <span className="text-[14px] font-medium text-[var(--admin-text-primary)] truncate">
              {r.displayName}
            </span>
            <span className="text-[12px] text-[var(--admin-text-muted)] truncate">{r.email}</span>
          </div>
        )
      },
    },
    {
      id: 'product',
      header: 'Product',
      size: 160,
      cell: ({ row }) => (
        <Link
          href={`/admin/products/${row.original.productId}`}
          onClick={(e) => e.stopPropagation()}
          className="text-[13px] font-mono text-[var(--admin-primary)] hover:underline"
        >
          {row.original.productId}
        </Link>
      ),
    },
    {
      id: 'rating',
      header: 'Rating',
      size: 70,
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5">
          <StarRating rating={row.original.rating / 2} max={5} size={13} />
          <span className="text-[11px] text-[var(--admin-text-muted)]">
            {row.original.rating}/10
          </span>
        </div>
      ),
    },
    {
      id: 'content',
      header: 'Content',
      size: 120,
      accessorKey: 'content',
      meta: { truncate: true },
      cell: ({ row }) => (
        <span className="text-[13px] text-[var(--admin-text-secondary)]">
          {row.original.content}
        </span>
      ),
    },
    {
      id: 'photos',
      header: 'Photos',
      size: 100,
      cell: ({ row }) => {
        const photos = row.original.photoUrls
        if (!photos || photos.length === 0) {
          return <span className="text-[var(--admin-text-muted)]">—</span>
        }
        return (
          <div className="flex items-center gap-1">
            {photos.slice(0, 3).map((url, i) => {
              const resolved = resolveUrl(url)
              return (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={i}
                  src={resolved}
                  alt=""
                  onClick={(e) => e.stopPropagation()}
                  className="w-8 h-8 rounded-[3px] object-cover border border-[var(--admin-border)]"
                />
              )
            })}
            {photos.length > 3 && (
              <span className="text-[11px] text-[var(--admin-text-muted)]">+{photos.length - 3}</span>
            )}
          </div>
        )
      },
    },
    {
      id: 'status',
      header: 'Status',
      size: 90,
      cell: ({ row }) => (
        <AdminBadge
          variant={reviewVariant[row.original.status] ?? 'neutral'}
          label={row.original.status}
        />
      ),
    },
    {
      id: 'updatedAt',
      header: 'Updated',
      size: 100,
      cell: ({ row }) => (
        <span className="text-[13px] text-[var(--admin-text-secondary)]">
          {formatDate(row.original.updatedAt)}
        </span>
      ),
    },
  ]

  // Main Return
  return (
    <>
      <FilterBar
        onApply={(fv) => updateParams({ ...fv })}
        filters={[
          {
            key: 'search',
            label: 'Search by name or email…',
            type: 'text',
            leftIcon: Search,
            width: 2,
            value: search,
            onChange: (v) => updateParams({ search: v }),
          },
          {
            key: 'status',
            label: 'All Status',
            leftIcon: Eye,
            width: 1,
            value: status,
            onChange: (v) => updateParams({ status: v }),
            options: [
              { label: 'Pending', value: 'pending' },
              { label: 'Approved', value: 'approved' },
              { label: 'Rejected', value: 'rejected' },
            ],
          },
        ]}
      />

      <DataTable
        columns={columns}
        data={reviews}
        total={total}
        page={page}
        limit={limit}
        onRowClick={openDrawer}
        emptyMessage="No reviews found."
      />

      <AdminPagination
        total={total}
        page={page}
        limit={limit}
        onPageChange={(p) => updateParams({ page: String(p) })}
        onLimitChange={(l) => updateParams({ limit: String(l), page: '1' })}
      />

      {selectedReview && (
        <ReviewDrawer
          review={selectedReview}
          open={drawerOpen}
          onOpenChange={(open) => { if (!open) setDrawerOpen(false) }}
          onActionComplete={handleActionComplete}
          onDeleteRequest={handleDeleteRequest}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}
        title="Delete review"
        description={`Permanently delete this review by ${deleteTarget?.displayName}? This cannot be undone.`}
        confirmLabel="Delete"
        destructive
        onConfirm={async () => {
          await deleteReview(deleteTarget!.id)
          setDeleteTarget(null)
          router.refresh()
        }}
      />
    </>
  )
}
