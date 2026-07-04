'use client'

import { useAdminUrlParams } from '@/hooks/useAdminUrlParams'
import { formatDate } from '@/lib/admin/formatters'
import Link from 'next/link'
import type { ColumnDef } from '@tanstack/react-table'
import DataTable from '@/components/admin/DataTable'
import FilterBar from '@/components/admin/FilterBar'
import AdminPagination from '@/components/admin/AdminPagination'
import AdminBadge from '@/components/admin/AdminBadge'
import type { AdminProductListItem } from '@/lib/api/admin/admin-products'
import { Search, Eye } from 'lucide-react'
import { env } from '@/lib/env'

const API_BASE = env.NEXT_PUBLIC_API_URL

function resolveUrl(url: string) {
  if (url.startsWith('http')) return url
  return `${API_BASE}${url}`
}

interface ProductsContentProps {
  products: AdminProductListItem[]
  total: number
  page: number
  limit: number
  search: string
  categorySlug: string
  collectionSlug: string
  isPublished?: boolean
  includeDeleted?: boolean
  sortBy: string
  sortOrder: 'asc' | 'desc'
}

export default function ProductsContent({
  products,
  total,
  page,
  limit,
  search,
  categorySlug,
  collectionSlug,
  isPublished,
  includeDeleted,
  sortBy,
  sortOrder,
}: ProductsContentProps) {
  const updateParams = useAdminUrlParams()

  const columns: ColumnDef<AdminProductListItem>[] = [
    {
      id: 'product',
      header: 'Product',
      enableSorting: true,
      accessorKey: 'name',
      cell: ({ row }) => {
        const p = row.original
        return (
          <Link
            href={`/admin/products/${p.id}`}
            className="flex items-center gap-3 group min-w-0"
          >
            <div className="size-10 rounded-[4px] shrink-0 overflow-hidden bg-[var(--admin-border)]">
              {p.primaryPhoto && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={resolveUrl(p.primaryPhoto.url)}
                  alt={p.displayName}
                  className="size-10 object-cover"
                />
              )}
            </div>
            <div className="min-w-0">
              <div className="text-[14px] font-medium group-hover:underline truncate max-w-[200px]">
                {p.displayName}
              </div>
              <div className="text-[12px] font-mono text-[var(--admin-text-muted)] truncate max-w-[200px]">
                {p.name}
              </div>
            </div>
          </Link>
        )
      },
    },
    {
      id: 'basePrice',
      header: 'Base Price',
      enableSorting: true,
      accessorKey: 'basePrice',
      cell: ({ row }) => {
        const p = row.original
        return (
          <span className="text-[14px] tabular-nums">
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: p.currency,
            }).format(p.basePrice)}
          </span>
        )
      },
    },
    {
      id: 'category',
      header: 'Category',
      accessorFn: (row) => row.category.displayName,
      meta: { truncate: true },
      cell: ({ row }) => (
        <span className="text-[14px] text-[var(--admin-text-secondary)]">
          {row.original.category.displayName}
        </span>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const p = row.original
        if (p.deletedAt) return <AdminBadge variant="error" label="Deleted" />
        return (
          <AdminBadge
            variant={p.isPublished ? 'success' : 'neutral'}
            label={p.isPublished ? 'Published' : 'Draft'}
          />
        )
      },
    },
    {
      id: 'createdAt',
      header: 'Created',
      enableSorting: true,
      accessorKey: 'createdAt',
      cell: ({ row }) => (
        <span className="text-[14px] text-[var(--admin-text-secondary)]">
          {formatDate(row.original.createdAt)}
        </span>
      ),
    },
  ]

  return (
    <>
      <FilterBar
        onApply={(fv) => updateParams({ ...fv })}
        filters={[
          {
            key: 'search',
            label: 'Search products…',
            type: 'text',
            leftIcon: Search,
            width: 2,
            value: search,
            onChange: (v) => updateParams({ search: v }),
          },
          {
            key: 'categorySlug',
            label: 'Category slug...',
            type: 'text',
            leftIcon: Search,
            width: 2,
            value: categorySlug,
            onChange: (v) => updateParams({ categorySlug: v }),
          },
          {
            key: 'collectionSlug',
            label: 'Collection slug...',
            type: 'text',
            width: 2,
            leftIcon: Search,
            value: collectionSlug,
            onChange: (v) => updateParams({ collectionSlug: v }),
          },
          {
            key: 'status',
            label: 'All Status',
            leftIcon: Eye,
            width: 1,
            value: includeDeleted ? 'deleted' : isPublished === true ? 'true' : isPublished === false ? 'false' : '',
            onChange: (v) => {
              if (v === 'deleted') {
                updateParams({ includeDeleted: 'true', isPublished: undefined })
              } else {
                updateParams({ includeDeleted: undefined, isPublished: v })
              }
            },
            options: [
              { label: 'Published', value: 'true' },
              { label: 'Draft', value: 'false' },
              { label: 'Deleted', value: 'deleted' },
            ],
          },
        ]}
      />

      <DataTable
        columns={columns}
        data={products}
        total={total}
        page={page}
        limit={limit}
        onPageChange={(p) => updateParams({ page: String(p) })}
        onLimitChange={(l) => updateParams({ limit: String(l), page: '1' })}
        emptyMessage="No products found."
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={(by, ord) => updateParams({ sortBy: by, sortOrder: ord })}
      />

      <AdminPagination
        total={total}
        page={page}
        limit={limit}
        onPageChange={(p) => updateParams({ page: String(p) })}
        onLimitChange={(l) => updateParams({ limit: String(l), page: '1' })}
      />
    </>
  )
}
