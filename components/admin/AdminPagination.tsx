'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface AdminPaginationProps {
  total: number
  page: number
  limit: number
  onPageChange: (page: number) => void
  onLimitChange?: (limit: number) => void
  limitOptions?: number[]
}

function getPageNumbers(page: number, totalPages: number): (number | '…')[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }

  const pages: (number | '…')[] = []
  const delta = 1 // pages on each side of current

  const left = Math.max(2, page - delta)
  const right = Math.min(totalPages - 1, page + delta)

  pages.push(1)
  if (left > 2) pages.push('…')
  for (let i = left; i <= right; i++) pages.push(i)
  if (right < totalPages - 1) pages.push('…')
  pages.push(totalPages)

  return pages
}

export default function AdminPagination({
  total,
  page,
  limit,
  onPageChange,
  onLimitChange,
  limitOptions = [20, 50, 100],
}: AdminPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / limit))
  const from = total === 0 ? 0 : (page - 1) * limit + 1
  const to = Math.min(page * limit, total)

  const pageNums = getPageNumbers(page, totalPages)

  const btnBase =
    'flex items-center justify-center size-8 text-[13px] font-medium rounded-[4px] transition-colors duration-100 disabled:opacity-40 disabled:cursor-not-allowed'
  const btnInactive =
    'text-[var(--admin-text-secondary)] hover:bg-[var(--admin-border)] border border-[var(--admin-border)]'
  const btnActive =
    'bg-[var(--admin-primary)] text-white border border-[var(--admin-primary)]'

  return (
    <div className="flex items-center justify-between mt-4 pt-4 border-t border-[var(--admin-border)]">
      {/* Left: count */}
      <p className="text-[14px] text-[var(--admin-text-muted)]">
        {total === 0
          ? 'No results'
          : `Showing ${from}–${to} of ${total} results`}
      </p>

      {/* Right: limit + pages */}
      <div className="flex items-center gap-2">
        {onLimitChange && (
          <Select
            value={String(limit)}
            onValueChange={(v) => onLimitChange(Number(v))}
          >
            <SelectTrigger className="h-8 w-auto text-[13px] border-[var(--admin-border-input)] rounded-[4px]">
              <SelectValue>{limit} / page</SelectValue>
            </SelectTrigger>
            <SelectContent className="rounded-[6px]">
              {limitOptions.map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n} / page
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <button
          type="button"
          className={`${btnBase} ${btnInactive}`}
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous page"
        >
          <ChevronLeft className="size-4" />
        </button>

        {pageNums.map((p, i) =>
          p === '…' ? (
            <span
              key={`ellipsis-${i}`}
              className="size-8 flex items-center justify-center text-[13px] text-[var(--admin-text-muted)] select-none"
            >
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              className={`${btnBase} ${p === page ? btnActive : btnInactive}`}
              onClick={() => onPageChange(p)}
              aria-label={`Page ${p}`}
              aria-current={p === page ? 'page' : undefined}
            >
              {p}
            </button>
          )
        )}

        <button
          type="button"
          className={`${btnBase} ${btnInactive}`}
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next page"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  )
}
