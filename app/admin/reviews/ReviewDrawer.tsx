'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Drawer } from '@base-ui/react/drawer'
import { X, Loader2, CheckCircle, XCircle, Trash2 } from 'lucide-react'
import AdminBadge, { reviewVariant } from '@/components/admin/AdminBadge'
import StarRating from '@/components/ui/StarRating'
import { Button } from '@/components/admin/ui/button'
import { updateReviewStatus } from '@/lib/api/admin-reviews'
import type { AdminReview } from '@/lib/api/admin-reviews'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? ''

function resolveUrl(url: string) {
  return url.startsWith('http') ? url : `${API_BASE}${url}`
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

interface ReviewDrawerProps {
  review: AdminReview
  open: boolean
  onOpenChange: (open: boolean) => void
  onActionComplete: () => void
  onDeleteRequest: (review: AdminReview) => void
}

export default function ReviewDrawer({
  review,
  open,
  onOpenChange,
  onActionComplete,
  onDeleteRequest,
}: ReviewDrawerProps) {
  const [actionLoading, setActionLoading] = useState<'approve' | 'reject' | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  async function handleStatusChange(status: 'approved' | 'rejected') {
    setActionLoading(status === 'approved' ? 'approve' : 'reject')
    setActionError(null)
    try {
      await updateReviewStatus(review.id, status)
      onActionComplete()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setActionLoading(null)
    }
  }

  function handleDelete() {
    onOpenChange(false)
    onDeleteRequest(review)
  }

  return (
    <Drawer.Root
        open={open}
        onOpenChange={(next) => onOpenChange(next)}
        swipeDirection="right"
        modal
      >
        <Drawer.Portal>
          <Drawer.Backdrop className="fixed inset-0 z-50 bg-black/20 duration-150 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
          <Drawer.Popup
            className="fixed inset-y-0 right-0 z-50 flex flex-col w-[480px] max-w-full border-l border-[var(--admin-border)] shadow-xl overflow-hidden duration-200 data-open:animate-in data-open:slide-in-from-right data-closed:animate-out data-closed:slide-out-to-right"
            style={{
              background: 'var(--admin-surface)',
              fontFamily: 'var(--font-admin, inherit)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--admin-border)] shrink-0">
              <div className="flex items-center gap-3">
                <h2 className="text-[16px] font-semibold text-[var(--admin-text-primary)]">
                  Review Detail
                </h2>
                <AdminBadge
                  variant={reviewVariant[review.status] ?? 'neutral'}
                  label={review.status}
                />
              </div>
              <Drawer.Close
                render={
                  <button
                    type="button"
                    className="text-[var(--admin-text-muted)] hover:text-[var(--admin-text-secondary)] transition-colors duration-100 rounded-[4px] p-0.5"
                    aria-label="Close"
                  />
                }
              >
                <X className="size-5" />
              </Drawer.Close>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
              {/* Reviewer */}
              <section>
                <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--admin-text-muted)] mb-1.5">
                  Reviewer
                </p>
                <p className="text-[14px] font-medium text-[var(--admin-text-primary)]">
                  {review.displayName}
                </p>
                <p className="text-[13px] text-[var(--admin-text-muted)]">{review.email}</p>
              </section>

              {/* Rating */}
              <section>
                <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--admin-text-muted)] mb-1.5">
                  Rating
                </p>
                <div className="flex items-center gap-2">
                  <StarRating rating={review.rating / 2} max={5} size={16} />
                  <span className="text-[13px] text-[var(--admin-text-secondary)]">
                    {review.rating}/10
                  </span>
                </div>
              </section>

              {/* Product */}
              <section>
                <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--admin-text-muted)] mb-1.5">
                  Product
                </p>
                <Link
                  href={`/admin/products/${review.productId}`}
                  className="text-[13px] font-mono text-[var(--admin-primary)] hover:underline break-all"
                >
                  {review.productId}
                </Link>
              </section>

              {/* Review content */}
              <section>
                <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--admin-text-muted)] mb-1.5">
                  Review
                </p>
                <p className="text-[14px] text-[var(--admin-text-primary)] leading-relaxed whitespace-pre-wrap">
                  {review.content}
                </p>
              </section>

              {/* Photos */}
              {review.photoUrls && review.photoUrls.length > 0 && (
                <section>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--admin-text-muted)] mb-1.5">
                    Photos ({review.photoUrls.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {review.photoUrls.map((url, i) => {
                      const resolved = resolveUrl(url)
                      return (
                        <a
                          key={i}
                          href={resolved}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={resolved}
                            alt={`Photo ${i + 1}`}
                            className="w-20 h-20 rounded-[4px] object-cover border border-[var(--admin-border)] hover:opacity-80 transition-opacity duration-100"
                          />
                        </a>
                      )
                    })}
                  </div>
                </section>
              )}

              {/* Dates */}
              <section className="flex gap-8">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--admin-text-muted)] mb-1">
                    Submitted
                  </p>
                  <p className="text-[13px] text-[var(--admin-text-secondary)]">
                    {formatDate(review.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--admin-text-muted)] mb-1">
                    Last updated
                  </p>
                  <p className="text-[13px] text-[var(--admin-text-secondary)]">
                    {formatDate(review.updatedAt)}
                  </p>
                </div>
              </section>

              {/* Error */}
              {actionError && (
                <p className="text-[13px] text-[var(--admin-destructive)] bg-[var(--admin-status-error-bg,#fef2f2)] px-3 py-2 rounded-[4px]">
                  {actionError}
                </p>
              )}
            </div>

            {/* Footer actions */}
            <div className="shrink-0 border-t border-[var(--admin-border)] px-5 py-4 flex items-center justify-between gap-3">
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={!!actionLoading}
              >
                <Trash2 />
                Delete
              </Button>

              <div className="flex items-center gap-2">
                {review.status !== 'rejected' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusChange('rejected')}
                    disabled={!!actionLoading}
                  >
                    {actionLoading === 'reject' ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <XCircle />
                    )}
                    Reject
                  </Button>
                )}
                {review.status !== 'approved' && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleStatusChange('approved')}
                    disabled={!!actionLoading}
                  >
                    {actionLoading === 'approve' ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <CheckCircle />
                    )}
                    Approve
                  </Button>
                )}
              </div>
            </div>
          </Drawer.Popup>
        </Drawer.Portal>
    </Drawer.Root>
  )
}
