'use client'

import { Search, CreditCard, Truck } from 'lucide-react'
import { useAdminUrlParams } from '@/hooks/useAdminUrlParams'
import { formatDate, formatAmount } from '@/lib/admin/formatters'
import Link from 'next/link'
import type { ColumnDef } from '@tanstack/react-table'
import DataTable from '@/components/admin/DataTable'
import FilterBar from '@/components/admin/FilterBar'
import AdminPagination from '@/components/admin/AdminPagination'
import AdminBadge, { fulfillmentVariant, paymentVariant } from '@/components/admin/AdminBadge'
import type { AdminOrder } from '@/lib/api/admin/admin-orders'


interface OrdersContentProps {
  orders: AdminOrder[]
  total: number
  page: number
  limit: number
  email: string
  paymentStatus: string
  fulfillmentStatus: string
}

export default function OrdersContent({
  orders,
  total,
  page,
  limit,
  email,
  paymentStatus,
  fulfillmentStatus,
}: OrdersContentProps) {
  const updateParams = useAdminUrlParams()

  const columns: ColumnDef<AdminOrder>[] = [
    {
      id: 'orderNumber',
      header: 'Order #',
      cell: ({ row }) => {
        const o = row.original
        return (
          <Link
            href={`/admin/orders/${o.id}`}
            className="text-[14px] font-medium hover:underline"
          >
            {o.orderNumber}
          </Link>
        )
      },
    },
    {
      id: 'customer',
      header: 'Customer',
      cell: ({ row }) => {
        const o = row.original
        const name =
          o.firstName || o.lastName ? `${o.firstName ?? ''} ${o.lastName ?? ''}`.trim() : null
        return (
          <div className="flex flex-col min-w-0">
            <span className="text-[14px] truncate max-w-[200px]">{o.email ?? '—'}</span>
            {name && (
              <span className="text-[12px] text-[var(--admin-text-muted)] truncate max-w-[200px]">
                {name}
              </span>
            )}
          </div>
        )
      },
    },
    {
      id: 'createdAt',
      header: 'Date',
      cell: ({ row }) => (
        <span className="text-[14px] text-[var(--admin-text-secondary)]">
          {formatDate(row.original.createdAt)}
        </span>
      ),
    },
    {
      id: 'fulfillmentStatus',
      header: 'Fulfillment',
      cell: ({ row }) => (
        <AdminBadge
          variant={fulfillmentVariant[row.original.fulfillmentStatus] ?? 'neutral'}
          label={row.original.fulfillmentStatus.replace(/_/g, ' ')}
        />
      ),
    },
    {
      id: 'paymentStatus',
      header: 'Payment',
      cell: ({ row }) => (
        <AdminBadge
          variant={paymentVariant[row.original.paymentStatus] ?? 'neutral'}
          label={row.original.paymentStatus}
        />
      ),
    },
    {
      id: 'total',
      header: 'Total',
      cell: ({ row }) => {
        const o = row.original
        return (
          <span className="text-[14px] font-medium">
            {formatAmount(o.totalAmount, o.totalCurrency)}
          </span>
        )
      },
    },
  ]

  return (
    <>
      <FilterBar
        onApply={(fv) => updateParams({ ...fv })}
        filters={[
          {
            key: 'email',
            label: 'Search by email…',
            type: 'text',
            leftIcon: Search,
            width: 2,
            value: email,
            onChange: (v) => updateParams({ email: v }),
          },
          {
            key: 'fulfillmentStatus',
            label: 'All Fulfillments',
            width: 2,
            leftIcon: Truck,
            value: fulfillmentStatus,
            onChange: (v) => updateParams({ fulfillmentStatus: v }),
            options: [
              { label: 'Unfulfilled', value: 'unfulfilled' },
              { label: 'Partially Fulfilled', value: 'partially_fulfilled' },
              { label: 'Fulfilled', value: 'fulfilled' },
              { label: 'Cancelled', value: 'cancelled' },
            ],
          },
          {
            key: 'paymentStatus',
            label: 'All Payments',
            width: 2,
            leftIcon: CreditCard,
            value: paymentStatus,
            onChange: (v) => updateParams({ paymentStatus: v }),
            options: [
              { label: 'Pending', value: 'pending' },
              { label: 'Paid', value: 'paid' },
              { label: 'Failed', value: 'failed' },
              { label: 'Refunded', value: 'refunded' },
            ],
          },
        ]}
      />

      <DataTable
        columns={columns}
        data={orders}
        total={total}
        page={page}
        limit={limit}
        onPageChange={(p) => updateParams({ page: String(p) })}
        onLimitChange={(l) => updateParams({ limit: String(l), page: '1' })}
        emptyMessage="No orders found."
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
